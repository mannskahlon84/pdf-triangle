const Busboy = require('busboy');
const PDFServices = require('@adobe/pdfservices-node-sdk');
const { Readable } = require('stream');

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

        busboy.on('file', (name, file, info) => {
            if (name === 'document') {
                const chunks = [];
                file.on('data', (data) => chunks.push(data));
                file.on('end', () => { fileBuffer = Buffer.concat(chunks); });
            } else {
                file.resume();
            }
        });

        busboy.on('finish', async () => {
            if (!fileBuffer) {
                return resolve({ statusCode: 400, body: 'Missing document' });
            }

            try {
                const clientId = process.env.ADOBE_CLIENT_ID;
                const clientSecret = process.env.ADOBE_CLIENT_SECRET;

                if (!clientId || !clientSecret) {
                     return resolve({ 
                         statusCode: 500, 
                         body: 'Adobe API credentials (ADOBE_CLIENT_ID, ADOBE_CLIENT_SECRET) are not set in the environment variables.' 
                     });
                }

                // 1. Initialize credentials and client
                const credentials = new PDFServices.ServicePrincipalCredentials({
                    clientId: clientId,
                    clientSecret: clientSecret
                });
                const pdfServices = new PDFServices.PDFServices({ credentials });

                // 2. Upload source PDF as a stream
                const inputStream = Readable.from(fileBuffer);
                const asset = await pdfServices.upload({
                    readStream: inputStream,
                    mimeType: PDFServices.MimeType.PDF
                });

                // 3. Create Export PDF job
                const params = new PDFServices.ExportPDFParams({
                    targetFormat: PDFServices.ExportPDFTargetFormat.DOCX
                });
                const job = new PDFServices.ExportPDFJob({ inputAsset: asset, params });

                // 4. Submit job and poll for result
                const pollingURL = await pdfServices.submit({ job });
                const pdfServicesResponse = await pdfServices.getJobResult({
                    pollingURL,
                    resultType: PDFServices.ExportPDFResult
                });

                // 5. Get the content stream
                const streamAsset = await pdfServices.getContent({ asset: pdfServicesResponse.result.asset });

                // Read stream to buffer
                const outChunks = [];
                for await (const chunk of streamAsset.readStream) {
                    outChunks.push(chunk);
                }
                const outBuffer = Buffer.concat(outChunks);

                // 6. Return the DOCX
                resolve({
                    statusCode: 200,
                    headers: {
                        'Content-Type': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
                        'Content-Disposition': 'attachment; filename="converted.docx"'
                    },
                    body: outBuffer.toString('base64'),
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
