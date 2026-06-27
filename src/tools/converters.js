import { PDFDocument } from 'pdf-lib';
import * as pdfjsLib from 'pdfjs-dist';
import JSZip from 'jszip';
import * as XLSX from 'xlsx';
import mammoth from 'mammoth';
import html2pdf from 'html2pdf.js';

// Setup pdf.js worker locally from the public folder
pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.mjs';

/**
 * Converts a list of images to a single PDF
 * @param {Array<File>} files 
 * @param {Object} options { pageSize: 'a4'|'letter'|'fit', orientation: 'portrait'|'landscape', margin: 'none'|'small'|'large' }
 * @returns {Promise<Uint8Array>}
 */
export async function convertImagesToPdf(files, options = {}) {
  const pdfDoc = await PDFDocument.create();
  const marginSize = options.margin === 'small' ? 10 : (options.margin === 'large' ? 20 : 0);
  
  for (const file of files) {
    const jpgBytes = await getJpgBytes(file);
    const embeddedImage = await pdfDoc.embedJpg(jpgBytes);
    const imgWidth = embeddedImage.width;
    const imgHeight = embeddedImage.height;
    
    let pageWidth = imgWidth;
    let pageHeight = imgHeight;
    
    if (options.pageSize === 'a4') {
      pageWidth = 595.28; // points (A4 size)
      pageHeight = 841.89;
    } else if (options.pageSize === 'letter') {
      pageWidth = 612; // points (Letter size)
      pageHeight = 792;
    }
    
    if (options.orientation === 'landscape' && options.pageSize !== 'fit') {
      const temp = pageWidth;
      pageWidth = pageHeight;
      pageHeight = temp;
    }
    
    const page = pdfDoc.addPage([pageWidth, pageHeight]);
    
    const maxDrawWidth = pageWidth - (marginSize * 2);
    const maxDrawHeight = pageHeight - (marginSize * 2);
    
    let scale = 1;
    if (options.pageSize !== 'fit') {
      scale = Math.min(maxDrawWidth / imgWidth, maxDrawHeight / imgHeight);
    }
    
    const drawWidth = imgWidth * scale;
    const drawHeight = imgHeight * scale;
    
    // Center the image
    const x = (pageWidth - drawWidth) / 2;
    const y = (pageHeight - drawHeight) / 2;
    
    page.drawImage(embeddedImage, {
      x,
      y,
      width: drawWidth,
      height: drawHeight,
    });
  }
  
  return await pdfDoc.save();
}

/**
 * Converts any image format into JPEG bytes via canvas
 * @param {File} file 
 * @returns {Promise<Uint8Array>}
 */
function getJpgBytes(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0);
        canvas.toBlob((blob) => {
          const blobReader = new FileReader();
          blobReader.onload = () => resolve(new Uint8Array(blobReader.result));
          blobReader.readAsArrayBuffer(blob);
        }, 'image/jpeg', 0.9);
      };
      img.onerror = reject;
      img.src = e.target.result;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

/**
 * Converts a PDF into separate images and zips them
 * @param {File} file 
 * @param {string} format 'jpeg' | 'png'
 * @param {number} scale rendering quality (e.g. 1, 1.5, 2)
 * @returns {Promise<Blob>} ZIP File Blob
 */
export async function convertPdfToImages(file, format = 'jpeg', scale = 2) {
  const arrayBuffer = await file.arrayBuffer();
  const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
  const pdf = await loadingTask.promise;
  const zip = new JSZip();
  
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const viewport = page.getViewport({ scale });
    const canvas = document.createElement('canvas');
    canvas.width = viewport.width;
    canvas.height = viewport.height;
    const context = canvas.getContext('2d');
    
    await page.render({ canvasContext: context, viewport }).promise;
    
    const imgType = format === 'jpeg' ? 'image/jpeg' : 'image/png';
    const ext = format === 'jpeg' ? 'jpg' : 'png';
    const imgDataUrl = canvas.toDataURL(imgType, 0.9);
    const base64Data = imgDataUrl.split(',')[1];
    
    zip.file(`page_${i}.${ext}`, base64Data, { base64: true });
  }
  
  return await zip.generateAsync({ type: 'blob' });
}

/**
 * Converts Word (.docx) to PDF bytes
 * @param {File} file 
 * @returns {Promise<ArrayBuffer>}
 */
export async function convertWordToPdf(file) {
  const arrayBuffer = await file.arrayBuffer();
  const result = await mammoth.convertToHtml({ arrayBuffer });
  const htmlContent = result.value;
  
  const element = document.createElement('div');
  element.className = 'word-pdf-wrapper';
  element.style.padding = '40px';
  element.style.color = '#000000';
  element.style.backgroundColor = '#ffffff';
  element.style.fontFamily = '"Times New Roman", Times, serif';
  element.style.fontSize = '12pt';
  element.style.lineHeight = '1.5';
  element.innerHTML = htmlContent;
  
  // Style tables inside the docx nicely
  const tables = element.querySelectorAll('table');
  tables.forEach(table => {
    table.style.width = '100%';
    table.style.borderCollapse = 'collapse';
    table.style.margin = '15px 0';
    const cells = table.querySelectorAll('td, th');
    cells.forEach(cell => {
      cell.style.border = '1px solid #dddddd';
      cell.style.padding = '8px';
    });
  });
  
  const opt = {
    margin:       [15, 15, 15, 15],
    filename:     file.name.replace(/\.docx$/i, '.pdf'),
    image:        { type: 'jpeg', quality: 0.98 },
    html2canvas:  { scale: 2, useCORS: true },
    jsPDF:        { unit: 'mm', format: 'a4', orientation: 'portrait' }
  };
  
  return html2pdf().from(element).set(opt).outputPdf('arraybuffer');
}

/**
 * Converts Excel (.xlsx, .xls) to PDF bytes
 * @param {File} file 
 * @returns {Promise<ArrayBuffer>}
 */
export async function convertExcelToPdf(file) {
  const arrayBuffer = await file.arrayBuffer();
  const workbook = XLSX.read(arrayBuffer, { type: 'array' });
  
  const element = document.createElement('div');
  element.className = 'excel-pdf-wrapper';
  element.style.padding = '30px';
  element.style.color = '#000000';
  element.style.backgroundColor = '#ffffff';
  element.style.fontFamily = 'Arial, sans-serif';
  
  workbook.SheetNames.forEach((sheetName, index) => {
    const sheet = workbook.Sheets[sheetName];
    const htmlTable = XLSX.utils.sheet_to_html(sheet);
    
    const sheetTitle = document.createElement('h2');
    sheetTitle.textContent = sheetName;
    sheetTitle.style.marginTop = index === 0 ? '0' : '30px';
    sheetTitle.style.marginBottom = '10px';
    sheetTitle.style.fontSize = '16pt';
    sheetTitle.style.borderBottom = '2px solid #217346';
    sheetTitle.style.color = '#217346';
    sheetTitle.style.paddingBottom = '5px';
    element.appendChild(sheetTitle);
    
    const tableContainer = document.createElement('div');
    tableContainer.style.overflowX = 'auto';
    tableContainer.innerHTML = htmlTable;
    
    const table = tableContainer.querySelector('table');
    if (table) {
      table.style.width = '100%';
      table.style.borderCollapse = 'collapse';
      table.style.fontSize = '10pt';
      const cells = table.querySelectorAll('td, th');
      cells.forEach(cell => {
        cell.style.border = '1px solid #cccccc';
        cell.style.padding = '6px';
        cell.style.textAlign = 'left';
      });
    }
    element.appendChild(tableContainer);
  });
  
  const opt = {
    margin:       [15, 15, 15, 15],
    filename:     file.name.replace(/\.(xlsx|xls)$/i, '.pdf'),
    image:        { type: 'jpeg', quality: 0.98 },
    html2canvas:  { scale: 2, useCORS: true },
    jsPDF:        { unit: 'mm', format: 'a4', orientation: 'landscape' } // landscape is best for sheets
  };
  
  return html2pdf().from(element).set(opt).outputPdf('arraybuffer');
}
