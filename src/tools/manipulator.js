import { PDFDocument, degrees } from 'pdf-lib';

/**
 * Merges multiple PDF files (as ArrayBuffers) into a single PDF
 * @param {Array<ArrayBuffer>} pdfBuffers 
 * @returns {Promise<Uint8Array>}
 */
export async function mergePdfs(pdfBuffers) {
  const mergedPdf = await PDFDocument.create();
  
  for (const buffer of pdfBuffers) {
    const pdf = await PDFDocument.load(buffer);
    const pageIndices = pdf.getPageIndices();
    const copiedPages = await mergedPdf.copyPages(pdf, pageIndices);
    copiedPages.forEach((page) => mergedPdf.addPage(page));
  }
  
  return await mergedPdf.save();
}

/**
 * Parses page range string (e.g. "1-2, 3, 5-6") into list of page ranges
 * @param {string} rangeStr 
 * @param {number} maxPages 
 * @returns {Array<Array<number>>} 0-based page index arrays
 */
export function parseRanges(rangeStr, maxPages) {
  const ranges = [];
  const groups = rangeStr.split(',');
  
  for (let group of groups) {
    group = group.trim();
    if (!group) continue;
    
    if (group.includes('-')) {
      const parts = group.split('-');
      const start = parseInt(parts[0].trim(), 10);
      const end = parseInt(parts[1].trim(), 10);
      
      if (isNaN(start) || isNaN(end)) continue;
      
      const pageIndices = [];
      const min = Math.min(start, end);
      const max = Math.max(start, end);
      
      for (let i = min; i <= max; i++) {
        if (i >= 1 && i <= maxPages) {
          pageIndices.push(i - 1);
        }
      }
      if (pageIndices.length > 0) {
        ranges.push(pageIndices);
      }
    } else {
      const pageNum = parseInt(group, 10);
      if (!isNaN(pageNum) && pageNum >= 1 && pageNum <= maxPages) {
        ranges.push([pageNum - 1]);
      }
    }
  }
  return ranges;
}

/**
 * Splits a single PDF buffer into multiple PDF documents based on range configurations
 * @param {ArrayBuffer} pdfBuffer 
 * @param {Array<Array<number>>} ranges Array of 0-based page index lists
 * @returns {Promise<Array<Uint8Array>>} Array of new PDF documents
 */
export async function splitPdf(pdfBuffer, ranges) {
  const sourcePdf = await PDFDocument.load(pdfBuffer);
  const results = [];
  
  for (const pageIndices of ranges) {
    const newPdf = await PDFDocument.create();
    const copiedPages = await newPdf.copyPages(sourcePdf, pageIndices);
    copiedPages.forEach(page => newPdf.addPage(page));
    const pdfBytes = await newPdf.save();
    results.push(pdfBytes);
  }
  
  return results;
}

/**
 * Organizes PDF pages (reordering, rotating, deleting)
 * @param {ArrayBuffer} pdfBuffer 
 * @param {Array<{index: number, rotation: number}>} pageActions Order of original 0-based index and rotation offset (e.g. 0, 90, 180, 270)
 * @returns {Promise<Uint8Array>}
 */
export async function organizePdfPages(pdfBuffer, pageActions) {
  const sourcePdf = await PDFDocument.load(pdfBuffer);
  const organizedPdf = await PDFDocument.create();
  
  const originalIndices = pageActions.map(action => action.index);
  const copiedPages = await organizedPdf.copyPages(sourcePdf, originalIndices);
  
  for (let i = 0; i < copiedPages.length; i++) {
    const page = copiedPages[i];
    const rotation = pageActions[i].rotation || 0;
    
    // Set rotation (combine original page rotation + new action rotation)
    if (rotation !== 0) {
      const currentRotation = page.getRotation().angle;
      const newAngle = (currentRotation + rotation) % 360;
      page.setRotation(degrees(newAngle));
    }
    
    organizedPdf.addPage(page);
  }
  
  return await organizedPdf.save();
}
