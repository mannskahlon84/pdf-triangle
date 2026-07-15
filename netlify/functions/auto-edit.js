const Busboy = require('busboy');
const mammoth = require('mammoth');
const { GoogleGenAI } = require('@google/genai');
const { patchDocx } = require('./docxPatcher');

exports.handler = async (event, context) => {
    if (event.httpMethod !== 'POST') {
        return { statusCode: 405, body: 'Method Not Allowed' };
    }

    return new Promise((resolve, reject) => {
        const contentType = event.headers['content-type'] || event.headers['Content-Type'];
        if (!contentType) {
             return resolve({ statusCode: 400, body: 'Missing Content-Type header' });
        }

        const busboy = Busboy({ headers: { 'content-type': contentType } });
        let fileBuffer = null;
        let promptText = '';

        busboy.on('file', (name, file, info) => {
            if (name === 'document') {
                const chunks = [];
                file.on('data', (data) => chunks.push(data));
                file.on('end', () => { fileBuffer = Buffer.concat(chunks); });
            } else {
                file.resume();
            }
        });

        busboy.on('field', (name, value) => {
            if (name === 'prompt') promptText = value;
        });

        busboy.on('finish', async () => {
            if (!fileBuffer || !promptText) {
                return resolve({ statusCode: 400, body: 'Missing document or prompt' });
            }

            try {
                // 1. Extract text using mammoth
                const result = await mammoth.extractRawText({ buffer: fileBuffer });
                const rawText = result.value;

                if (!process.env.GEMINI_API_KEY) {
                     return resolve({ statusCode: 500, body: 'GEMINI_API_KEY environment variable is not set.' });
                }

                // 2. Call Gemini
                const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
                const systemPrompt = `You are a professional document editor.
The user wants you to make the following edits to the document:
USER PROMPT: "${promptText}"

Here is the raw text of the document:
---
${rawText}
---

Your task is to identify the sentences or paragraphs that need to be changed to fulfill the user's prompt.
You must output a JSON array of objects. Each object must have:
"originalText": The EXACT string of text from the document that needs replacing. It must perfectly match a substring of the raw text provided above. Be generous with the amount of text you include to ensure a unique match (e.g. include the whole sentence or paragraph).
"newText": The rewritten, updated string.

IMPORTANT: Do not change parts of the document the user didn't ask you to change. Return ONLY valid JSON, no markdown formatting.`;

                const response = await ai.models.generateContent({
                    model: 'gemini-2.5-flash',
                    contents: systemPrompt,
                    config: {
                        responseMimeType: "application/json",
                    }
                });

                const replacements = JSON.parse(response.text);

                // 3. Patch the docx
                const patchedBuffer = await patchDocx(fileBuffer, replacements);

                // 4. Return the patched docx
                resolve({
                    statusCode: 200,
                    headers: {
                        'Content-Type': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
                        'Content-Disposition': 'attachment; filename="edited.docx"'
                    },
                    body: patchedBuffer.toString('base64'),
                    isBase64Encoded: true
                });

            } catch (err) {
                console.error('Error during processing:', err);
                resolve({ statusCode: 500, body: JSON.stringify({ error: err.message, stack: err.stack }) });
            }
        });

        busboy.on('error', err => {
            resolve({ statusCode: 500, body: err.message });
        });

        if (event.isBase64Encoded) {
            busboy.write(Buffer.from(event.body, 'base64'));
        } else {
            busboy.write(event.body);
        }
        busboy.end();
    });
};
