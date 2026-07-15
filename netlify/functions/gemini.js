const PizZip = require('pizzip');
const XLSX = require('xlsx');
const { PDFDocument, degrees } = require('pdf-lib');

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
    const { prompt, docText, fileBase64, filename } = JSON.parse(event.body);
    
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ error: 'GEMINI_API_KEY is not configured in Netlify environment variables.' })
      };
    }

    const ext = filename ? filename.split('.').pop().toLowerCase() : '';

    let systemInstruction = `You are an AI Document Assistant for the AI Gemini platform. You analyze files (PDF, Word, Excel, Images) and provide detailed, professional summaries, table extracts, or answers based ONLY on the user's explicit formatting instructions. Do NOT use generic or hardcoded summary rules. Dynamically mold your response to exactly what the user asks (e.g., bullet points, email format, markdown tables).\n\n`;

    if (ext === 'docx') {
      systemInstruction += `If the user asks to edit or modify the text in the Word document, you must generate a JSON object with a "replacements" array containing "search" and "replace" keys. For example: {"replacements": [{"search": "old name", "replace": "new name"}]}. Output ONLY the JSON block wrapped in \`\`\`json ... \`\`\` and a brief summary of what you did outside the block.`;
    } else if (ext === 'xlsx' || ext === 'xls') {
      systemInstruction += `If the user asks to modify the spreadsheet (e.g., add columns, filter rows, change data), you must generate the complete updated spreadsheet data as a 2D JSON array (array of rows, where each row is an array of cells). Output ONLY the JSON block wrapped in \`\`\`json ... \`\`\` and a brief summary of what you did outside the block.`;
    } else if (ext === 'pdf') {
      systemInstruction += `If the user asks to edit text inside a PDF, you must respond EXACTLY with: "Direct text editing isn't supported inside static PDF formats. However, I can execute this edit by converting it to an editable Word document for you, or I can generate a brand-new, modified PDF version for you to download."\nIf they ask for PDF operations like page rotation or extraction, output a JSON command wrapped in \`\`\`json like {"action": "rotate", "degrees": 90} or {"action": "extract", "pages": [1, 2]}.`;
    }

    const payload = {
      system_instruction: {
        parts: [{ text: systemInstruction }]
      },
      contents: [
        {
          parts: [
            { text: `DOCUMENT TEXT CONTENT:\n${docText || 'Empty'}` },
            { text: `USER REQUEST:\n${prompt}` }
          ]
        }
      ]
    };

    const url = `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Gemini API returned error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    let aiResponse = '';
    if (data.candidates && data.candidates[0].content && data.candidates[0].content.parts) {
      aiResponse = data.candidates[0].content.parts[0].text;
    } else {
      throw new Error('Invalid response structure from Gemini API.');
    }

    // Backend Programmatic File Modifications
    let updatedBase64 = null;
    
    // Check for JSON commands
    const jsonMatch = aiResponse.match(/```json\n([\s\S]*?)\n```/);
    if (jsonMatch && fileBase64) {
      const cmd = JSON.parse(jsonMatch[1]);
      const buffer = Buffer.from(fileBase64, 'base64');
      
      if (ext === 'docx' && cmd.replacements) {
        // Word Modification
        const zip = new PizZip(buffer);
        let xml = zip.file("word/document.xml").asText();
        for (const rep of cmd.replacements) {
          // Simple text replacement
          xml = xml.split(rep.search).join(rep.replace);
        }
        zip.file("word/document.xml", xml);
        const newBuffer = zip.generate({ type: "nodebuffer" });
        updatedBase64 = newBuffer.toString('base64');
      } else if ((ext === 'xlsx' || ext === 'xls') && Array.isArray(cmd)) {
        // Excel Modification
        const ws = XLSX.utils.aoa_to_sheet(cmd);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Sheet1");
        const newBuffer = XLSX.write(wb, { type: "buffer", bookType: "xlsx" });
        updatedBase64 = newBuffer.toString('base64');
      } else if (ext === 'pdf' && cmd.action) {
        // PDF Modification
        const pdfDoc = await PDFDocument.load(buffer);
        if (cmd.action === 'rotate' && cmd.degrees) {
          const pages = pdfDoc.getPages();
          pages.forEach(page => page.setRotation(degrees(page.getRotation().angle + cmd.degrees)));
        } else if (cmd.action === 'extract' && cmd.pages) {
          // Extract involves creating a new PDF and copying pages
          const newPdf = await PDFDocument.create();
          const copiedPages = await newPdf.copyPages(pdfDoc, cmd.pages.map(p => p - 1));
          copiedPages.forEach(page => newPdf.addPage(page));
          const newBuffer = await newPdf.save();
          updatedBase64 = Buffer.from(newBuffer).toString('base64');
        }
        
        if (updatedBase64 === null) {
          const newBuffer = await pdfDoc.save();
          updatedBase64 = Buffer.from(newBuffer).toString('base64');
        }
      }
      
      // Remove the JSON block from the user-facing response message
      aiResponse = aiResponse.replace(/```json\n([\s\S]*?)\n```/, '').trim();
    }

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ 
        response: aiResponse,
        updatedBase64: updatedBase64
      })
    };
  } catch (error) {
    console.error('Error in secure gemini API backend:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: error.message })
    };
  }
};
