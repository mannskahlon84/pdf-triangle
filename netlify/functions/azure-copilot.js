const fetch = require('node-fetch');

exports.handler = async function(event, context) {
  // CORS Headers
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS'
  };

  // Handle preflight OPTIONS request
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: ''
    };
  }

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method Not Allowed' })
    };
  }

  try {
    const body = JSON.parse(event.body);
    const { fileName, fileData, prompt, docText: clientExtractedText } = body;

    // Check if Azure settings are configured
    const docIntelligenceKey = process.env.AZURE_DOCUMENT_INTELLIGENCE_KEY;
    let docIntelligenceEndpoint = process.env.AZURE_DOCUMENT_INTELLIGENCE_ENDPOINT;
    const azureOpenaiKey = process.env.AZURE_OPENAI_KEY;
    let azureOpenaiEndpoint = process.env.AZURE_OPENAI_ENDPOINT;
    const azureOpenaiDeployment = process.env.AZURE_OPENAI_DEPLOYMENT || 'gpt-4o';

    if (!docIntelligenceKey || !docIntelligenceEndpoint || !azureOpenaiKey || !azureOpenaiEndpoint) {
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ 
          error: 'Azure AI services are not fully configured on the server. Please set AZURE_DOCUMENT_INTELLIGENCE_KEY, AZURE_DOCUMENT_INTELLIGENCE_ENDPOINT, AZURE_OPENAI_KEY, AZURE_OPENAI_ENDPOINT, and AZURE_OPENAI_DEPLOYMENT in your Netlify site environment variables.' 
        })
      };
    }

    // Clean up endpoints trailing slashes
    if (docIntelligenceEndpoint.endsWith('/')) docIntelligenceEndpoint = docIntelligenceEndpoint.slice(0, -1);
    if (azureOpenaiEndpoint.endsWith('/')) azureOpenaiEndpoint = azureOpenaiEndpoint.slice(0, -1);

    let extractedText = clientExtractedText || '';

    // If file data is provided, run Azure AI Document Intelligence Layout analysis
    if (fileData) {
      const fileBuffer = Buffer.from(fileData, 'base64');
      
      // Submit document to Document Intelligence (Layout Model)
      const docIntelUrl = `${docIntelligenceEndpoint}/documentintelligence/documentModels/prebuilt-layout:analyze?api-version=2023-07-31`;
      
      const submitResponse = await fetch(docIntelUrl, {
        method: 'POST',
        headers: {
          'Ocp-Apim-Subscription-Key': docIntelligenceKey,
          'Content-Type': 'application/octet-stream'
        },
        body: fileBuffer
      });

      if (!submitResponse.ok) {
        const errorMsg = await submitResponse.text();
        throw new Error(`Azure Document Intelligence submit failed: ${submitResponse.status} - ${errorMsg}`);
      }

      // Read status operation check URL
      const operationUrl = submitResponse.headers.get('operation-location');
      if (!operationUrl) {
        throw new Error('Azure Document Intelligence did not return operation-location header.');
      }

      // Poll the operation location until analysis succeeds
      let analysisResult = null;
      const maxRetries = 25;
      for (let attempt = 0; attempt < maxRetries; attempt++) {
        // Wait 1.5s between polls
        await new Promise(resolve => setTimeout(resolve, 1500));

        const checkResponse = await fetch(operationUrl, {
          headers: {
            'Ocp-Apim-Subscription-Key': docIntelligenceKey
          }
        });

        if (!checkResponse.ok) {
          const checkError = await checkResponse.text();
          throw new Error(`Azure Document Intelligence status check failed: ${checkResponse.status} - ${checkError}`);
        }

        const operationStatus = await checkResponse.json();
        if (operationStatus.status === 'succeeded') {
          analysisResult = operationStatus.analyzeResult;
          break;
        } else if (operationStatus.status === 'failed') {
          throw new Error(`Azure Document Intelligence analysis failed: ${JSON.stringify(operationStatus.error)}`);
        }
      }

      if (!analysisResult) {
        throw new Error('Azure Document Intelligence analysis timed out.');
      }

      // Reconstruct structured paragraphs and tables from layout analysis
      let structuredLines = [];

      // 1. Append Paragraphs
      if (analysisResult.paragraphs && Array.isArray(analysisResult.paragraphs)) {
        analysisResult.paragraphs.forEach(p => {
          structuredLines.push(p.content);
        });
      }

      // 2. Append reconstructed Markdown Tables
      if (analysisResult.tables && Array.isArray(analysisResult.tables)) {
        analysisResult.tables.forEach((table, tableIdx) => {
          structuredLines.push(`\n### Table ${tableIdx + 1}`);
          
          // Re-grid table cells
          const grid = [];
          table.cells.forEach(cell => {
            if (!grid[cell.rowIndex]) grid[cell.rowIndex] = [];
            grid[cell.rowIndex][cell.columnIndex] = cell.content;
          });

          // Build markdown table lines
          grid.forEach((row, rowIdx) => {
            const cleanRow = [];
            for (let c = 0; c < table.columnCount; c++) {
              cleanRow.push(row[c] || '');
            }
            structuredLines.push(`| ${cleanRow.join(' | ')} |`);
            
            // Append line divider after header row
            if (rowIdx === 0) {
              const divider = Array(table.columnCount).fill('---');
              structuredLines.push(`| ${divider.join(' | ')} |`);
            }
          });
          structuredLines.push('\n');
        });
      }

      extractedText = structuredLines.join('\n');
    }

    // Submit structured text to Azure OpenAI Service
    const azureOpenAiUrl = `${azureOpenaiEndpoint}/openai/deployments/${azureOpenaiDeployment}/chat/completions?api-version=2024-02-15-preview`;
    
    const openAiPayload = {
      messages: [
        {
          role: "system",
          content: "You are an AI Document Assistant. You analyze files (PDF, Word, Excel, Images) and provide detailed, professional, structured summaries, table extracts, conversions, or answers. If the user asks to modify, edit, format, append, or insert text in the document, you MUST output the updated, full document text inside a block starting with [UPDATED_DOCUMENT_TEXT] and ending with [/UPDATED_DOCUMENT_TEXT] at the end of your response."
        },
        {
          role: "user",
          content: `DOCUMENT NAME: ${fileName || 'Document'}\n\nDOCUMENT TEXT CONTENT:\n${extractedText || 'Empty'}\n\nUSER REQUEST:\n${prompt}`
        }
      ]
    };

    const openaiResponse = await fetch(azureOpenAiUrl, {
      method: 'POST',
      headers: {
        'api-key': azureOpenaiKey,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(openAiPayload)
    });

    if (!openaiResponse.ok) {
      const openAiError = await openaiResponse.text();
      throw new Error(`Azure OpenAI completions request failed: ${openaiResponse.status} - ${openAiError}`);
    }

    const openaiResult = await openaiResponse.json();
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        choices: openaiResult.choices,
        extractedText: extractedText
      })
    };

  } catch (error) {
    console.error('Error in Netlify Azure Copilot function:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: error.message })
    };
  }
};
