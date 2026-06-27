import { createWorker } from 'tesseract.js';

/**
 * Runs OCR on an HTML5 canvas and extracts text
 * @param {HTMLCanvasElement} canvas 
 * @param {Function} onProgress callback receiving percentage (0-100)
 * @returns {Promise<string>}
 */
export async function runOcrOnCanvas(canvas, onProgress) {
  const worker = await createWorker({
    logger: m => {
      if (m.status === 'recognizing' && onProgress) {
        onProgress(Math.round(m.progress * 100));
      }
    }
  });
  
  await worker.loadLanguage('eng');
  await worker.initialize('eng');
  
  const { data: { text } } = await worker.recognize(canvas);
  await worker.terminate();
  
  return text;
}
