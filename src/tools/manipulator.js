import { PDFDocument, degrees, rgb, StandardFonts } from 'pdf-lib';

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

/**
 * Applies a text or image watermark to all pages of a PDF document
 * @param {ArrayBuffer} pdfBuffer Original PDF file buffer
 * @param {Object} options Watermark settings
 * @returns {Promise<Uint8Array>}
 */
export async function addWatermarkToPdf(pdfBuffer, options) {
  const pdfDoc = await PDFDocument.load(pdfBuffer);
  const pages = pdfDoc.getPages();
  
  const {
    type,
    text = 'CONFIDENTIAL',
    fontSize = 60,
    color = '#ff0000',
    rotation = -45,
    opacity = 0.3,
    position = 'center',
    imageBuffer = null,
    imageMime = 'image/png',
    imageScale = 0.5
  } = options;
  
  let embeddedImage = null;
  if (type === 'image' && imageBuffer) {
    if (imageMime === 'image/png') {
      embeddedImage = await pdfDoc.embedPng(imageBuffer);
    } else {
      embeddedImage = await pdfDoc.embedJpg(imageBuffer);
    }
  }
  
  // Embed Font for text watermark
  const font = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  
  for (const page of pages) {
    const { width, height } = page.getSize();
    let x = 0;
    let y = 0;
    
    if (type === 'text') {
      const textWidth = font.widthOfTextAtSize(text, fontSize);
      const textHeight = font.heightAtSize(fontSize);
      
      if (position === 'center') {
        x = (width - textWidth) / 2;
        y = (height - textHeight) / 2;
      } else if (position === 'top-left') {
        x = 40;
        y = height - textHeight - 40;
      } else if (position === 'top-right') {
        x = width - textWidth - 40;
        y = height - textHeight - 40;
      } else if (position === 'bottom-left') {
        x = 40;
        y = 40;
      } else if (position === 'bottom-right') {
        x = width - textWidth - 40;
        y = 40;
      }
      
      // Parse Color Hex (#ff0000 -> rgb)
      const hex = color.replace('#', '');
      const r = parseInt(hex.substring(0, 2), 16) / 255;
      const g = parseInt(hex.substring(2, 4), 16) / 255;
      const b = parseInt(hex.substring(4, 6), 16) / 255;
      
      page.drawText(text, {
        x,
        y,
        size: fontSize,
        font,
        color: rgb(r, g, b),
        opacity,
        rotate: degrees(rotation)
      });
    } else if (type === 'image' && embeddedImage) {
      const dims = embeddedImage.scale(imageScale);
      
      if (position === 'center') {
        x = (width - dims.width) / 2;
        y = (height - dims.height) / 2;
      } else if (position === 'top-left') {
        x = 40;
        y = height - dims.height - 40;
      } else if (position === 'top-right') {
        x = width - dims.width - 40;
        y = height - dims.height - 40;
      } else if (position === 'bottom-left') {
        x = 40;
        y = 40;
      } else if (position === 'bottom-right') {
        x = width - dims.width - 40;
        y = 40;
      }
      
      page.drawImage(embeddedImage, {
        x,
        y,
        width: dims.width,
        height: dims.height,
        opacity
      });
    }
  }
  
  return await pdfDoc.save();
}

/**
 * Compresses a PDF by rendering pages as JPEG images with configured quality/scale and embedding them back
 * @param {ArrayBuffer} pdfBuffer Original PDF file buffer
 * @param {Object} pdfJsDoc Loaded pdfjs document (passed in to avoid circular dependency)
 * @param {Object} options Compression options { scale: number, quality: number }
 * @returns {Promise<Uint8Array>}
 */
export async function compressPdf(pdfBuffer, pdfJsDoc, options) {
  const { scale, quality } = options;
  const compressedPdf = await PDFDocument.create();
  
  for (let i = 1; i <= pdfJsDoc.numPages; i++) {
    const page = await pdfJsDoc.getPage(i);
    const viewport = page.getViewport({ scale });
    
    const canvas = document.createElement('canvas');
    canvas.width = viewport.width;
    canvas.height = viewport.height;
    const ctx = canvas.getContext('2d');
    
    await page.render({ canvasContext: ctx, viewport }).promise;
    
    // Convert canvas to compressed JPEG
    const imgDataUrl = canvas.toDataURL('image/jpeg', quality);
    const imgBytes = await fetch(imgDataUrl).then(r => r.arrayBuffer());
    
    // Embed compressed image back into a new page
    const embeddedImg = await compressedPdf.embedJpg(imgBytes);
    const newPage = compressedPdf.addPage([viewport.width, viewport.height]);
    newPage.drawImage(embeddedImg, {
      x: 0,
      y: 0,
      width: viewport.width,
      height: viewport.height
    });
  }
  
  return await compressedPdf.save();
}
