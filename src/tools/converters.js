import { PDFDocument, rgb } from 'pdf-lib';
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

/**
 * Converts HTML file to PDF bytes
 * @param {File} file 
 * @returns {Promise<ArrayBuffer>}
 */
export async function convertHtmlToPdf(file) {
  const text = await file.text();
  const element = document.createElement('div');
  element.className = 'html-pdf-wrapper';
  element.style.padding = '40px';
  element.style.color = '#000000';
  element.style.backgroundColor = '#ffffff';
  element.style.fontFamily = 'Arial, sans-serif';
  element.innerHTML = text;
  
  const opt = {
    margin:       [15, 15, 15, 15],
    filename:     file.name.replace(/\.html$/i, '.pdf'),
    image:        { type: 'jpeg', quality: 0.98 },
    html2canvas:  { scale: 2, useCORS: true },
    jsPDF:        { unit: 'mm', format: 'a4', orientation: 'portrait' }
  };
  
  return html2pdf().from(element).set(opt).outputPdf('arraybuffer');
}

/**
 * Converts PPTX file to PDF bytes by parsing slide XML paths with JSZip
 * @param {File} file 
 * @returns {Promise<ArrayBuffer>}
 */
export async function convertPptxToPdf(file) {
  const arrayBuffer = await file.arrayBuffer();
  const zip = await JSZip.loadAsync(arrayBuffer);
  const pdfDoc = await PDFDocument.create();
  
  const slideFileNames = Object.keys(zip.files).filter(name => name.startsWith('ppt/slides/slide') && name.endsWith('.xml'));
  
  if (slideFileNames.length === 0) {
    throw new Error('No slides found in PPTX file.');
  }
  
  // Sort slide files numerically
  slideFileNames.sort((a, b) => {
    const numA = parseInt(a.match(/slide(\d+)\.xml/)[1], 10);
    const numB = parseInt(b.match(/slide(\d+)\.xml/)[1], 10);
    return numA - numB;
  });
  
  const parser = new DOMParser();
  
  for (const slideName of slideFileNames) {
    const xmlText = await zip.files[slideName].async('text');
    const xmlDoc = parser.parseFromString(xmlText, 'application/xml');
    
    // Add page in landscape letter format (792 x 612 points)
    const page = pdfDoc.addPage([792, 612]);
    
    // Find shape elements
    const shapes = xmlDoc.getElementsByTagName('p:sp');
    
    // Draw visual slide background/border for outline
    page.drawRectangle({
      x: 20,
      y: 20,
      width: 752,
      height: 572,
      borderColor: rgb(0.8, 0.8, 0.8),
      borderWidth: 1,
    });
    
    for (const shape of shapes) {
      // Extract text content from the shape
      const paragraphs = shape.getElementsByTagName('a:p');
      let shapeText = '';
      for (const p of paragraphs) {
        const runs = p.getElementsByTagName('a:r');
        let pText = '';
        for (const r of runs) {
          const tTags = r.getElementsByTagName('a:t');
          for (const t of tTags) {
            pText += t.textContent;
          }
        }
        if (pText) {
          shapeText += pText + '\n';
        }
      }
      
      if (!shapeText.trim()) continue;
      
      // Calculate coordinates (EMUs to PDF points conversion)
      let x = 50, y = 50, w = 692, h = 100;
      const xfrm = shape.getElementsByTagName('p:xfrm')[0] || shape.getElementsByTagName('a:xfrm')[0];
      if (xfrm) {
        const off = xfrm.getElementsByTagName('a:off')[0];
        const ext = xfrm.getElementsByTagName('a:ext')[0];
        if (off && ext) {
          const xEmu = parseInt(off.getAttribute('x') || '0', 10);
          const yEmu = parseInt(off.getAttribute('y') || '0', 10);
          const wEmu = parseInt(ext.getAttribute('cx') || '0', 10);
          const hEmu = parseInt(ext.getAttribute('cy') || '0', 10);
          
          x = xEmu / 12700;
          y = yEmu / 12700;
          w = wEmu / 12700;
          h = hEmu / 12700;
        }
      }
      
      // Handle boundaries and invert Y for PDF layout (top-left to bottom-left orientation)
      if (x < 0 || x > 792) x = 50;
      if (y < 0 || y > 612) y = 50;
      if (w <= 0) w = 600;
      
      const pdfX = x;
      const pdfY = 612 - y - 30; // offset to fit font baseline
      
      page.drawText(shapeText.trim(), {
        x: pdfX,
        y: pdfY < 20 ? 20 : pdfY,
        size: 14,
        maxWidth: w,
        lineHeight: 16
      });
    }
  }
  
  return await pdfDoc.save();
}

/**
 * Converts PDF to editable Word doc (.doc)
 * @param {File} file 
 * @returns {Promise<Blob>} Word file Blob
 */
export async function convertPdfToWord(file) {
  const arrayBuffer = await file.arrayBuffer();
  const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
  const pdf = await loadingTask.promise;
  
  let htmlContent = '';
  
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const textContent = await page.getTextContent();
    const items = textContent.items;
    
    // Sort text items in reading order (top-to-bottom, left-to-right)
    items.sort((a, b) => {
      if (Math.abs(a.transform[5] - b.transform[5]) < 5) {
        return a.transform[4] - b.transform[4];
      }
      return b.transform[5] - a.transform[5];
    });
    
    let pageText = '';
    let lastY = null;
    for (const item of items) {
      const currentY = item.transform[5];
      if (lastY !== null && Math.abs(currentY - lastY) > 8) {
        pageText += '<br/>';
      }
      pageText += item.str + ' ';
      lastY = currentY;
    }
    
    htmlContent += `<div class="page" style="page-break-after:always; margin-bottom:20px;">`;
    htmlContent += `<h2>Page ${i}</h2>`;
    htmlContent += `<p style="font-family:Arial, sans-serif; font-size:11pt; line-height:1.6;">${pageText}</p>`;
    htmlContent += `</div>`;
  }
  
  const header = "<html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'><head><title>Document</title><!--[if gte mso 9]><xml><w:WordDocument><w:View>Print</w:View><w:Zoom>90</w:Zoom></w:WordDocument></xml><![endif]--></head><body>";
  const footer = "</body></html>";
  const source = header + htmlContent + footer;
  
  return new Blob(['\ufeff' + source], {
    type: 'application/msword'
  });
}

/**
 * Converts PDF to PowerPoint by rendering pages as JPGs inside a valid PPTX zip structure
 * @param {File} file 
 * @returns {Promise<Blob>} PowerPoint file Blob
 */
export async function convertPdfToPowerpoint(file) {
  const arrayBuffer = await file.arrayBuffer();
  const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
  const pdf = await loadingTask.promise;
  const zip = new JSZip();
  
  let slideIdsXml = '';
  let slideRelsXml = '';
  let slideOverridesXml = '';
  
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const viewport = page.getViewport({ scale: 2 });
    const canvas = document.createElement('canvas');
    canvas.width = viewport.width;
    canvas.height = viewport.height;
    const context = canvas.getContext('2d');
    await page.render({ canvasContext: context, viewport }).promise;
    
    const imgDataUrl = canvas.toDataURL('image/jpeg', 0.85);
    const base64Data = imgDataUrl.split(',')[1];
    
    zip.file(`ppt/media/image${i}.jpg`, base64Data, { base64: true });
    
    const slideXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<p:sld xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships" xmlns:p="http://schemas.openxmlformats.org/presentationml/2006/main">
  <p:cSld>
    <p:spTree>
      <p:nvGrpSpPr>
        <p:cNvPr id="1" name=""/>
        <p:cNvGrpSpPr/>
        <p:nvPr/>
      </p:nvGrpSpPr>
      <p:grpSpPr>
        <a:xfrm>
          <a:off x="0" y="0"/>
          <a:ext cx="0" cy="0"/>
          <a:chOff x="0" y="0"/>
          <a:chExt cx="0" cy="0"/>
        </a:xfrm>
      </p:grpSpPr>
      <p:pic>
        <p:nvPicPr>
          <p:cNvPr id="2" name="Slide Image"/>
          <p:cNvPicPr>
            <a:picLocks noChangeAspect="1"/>
          </p:cNvPicPr>
          <p:nvPr/>
        </p:nvPicPr>
        <p:blipFill>
          <a:blip r:embed="rId1"/>
          <a:stretch>
            <a:fillRect/>
          </a:stretch>
        </p:blipFill>
        <p:spPr>
          <a:xfrm>
            <a:off x="0" y="0"/>
            <a:ext cx="9144000" cy="6858000"/>
          </a:xfrm>
          <a:prstGeom prst="rect">
            <a:avLst/>
          </a:prstGeom>
        </p:spPr>
      </p:pic>
    </p:spTree>
  </p:cSld>
</p:sld>`;
    zip.file(`ppt/slides/slide${i}.xml`, slideXml);
    
    const slideRelXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/image" Target="../media/image${i}.jpg"/>
</Relationships>`;
    zip.file(`ppt/slides/_rels/slide${i}.xml.rels`, slideRelXml);
    
    slideIdsXml += `<p:sldId id="${255 + i}" r:id="rId${i}"/>`;
    slideRelsXml += `<Relationship Id="rId${i}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/slide" Target="slides/slide${i}.xml"/>`;
    slideOverridesXml += `<Override PartName="/ppt/slides/slide${i}.xml" ContentType="application/vnd.openxmlformats-officedocument.presentationml.slide+xml"/>`;
  }
  
  zip.file('_rels/.rels', `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="ppt/presentation.xml"/>
</Relationships>`);
  
  zip.file('ppt/presentation.xml', `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<p:presentation xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships" xmlns:p="http://schemas.openxmlformats.org/presentationml/2006/main">
  <p:sldIdLst>
    ${slideIdsXml}
  </p:sldIdLst>
  <p:sldSz cx="9144000" cy="6858000" type="screen4x3"/>
  <p:notesSz cx="6858000" cy="9144000"/>
</p:presentation>`);
  
  zip.file('ppt/_rels/presentation.xml.rels', `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  ${slideRelsXml}
</Relationships>`);
  
  zip.file('[Content_Types].xml', `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
  <Default Extension="xml" ContentType="application/xml"/>
  <Default Extension="jpg" ContentType="image/jpeg"/>
  <Override PartName="/ppt/presentation.xml" ContentType="application/vnd.openxmlformats-officedocument.presentationml.presentation.main+xml"/>
  ${slideOverridesXml}
</Types>`);
  
  return await zip.generateAsync({ type: 'blob' });
}

/**
 * Converts PDF to Excel using SheetJS
 * @param {File} file 
 * @returns {Promise<ArrayBuffer>} Excel file ArrayBuffer
 */
export async function convertPdfToExcel(file) {
  const arrayBuffer = await file.arrayBuffer();
  const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
  const pdf = await loadingTask.promise;
  const wb = XLSX.utils.book_new();
  
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const textContent = await page.getTextContent();
    const items = textContent.items;
    
    // Group text items by y coordinates (rows)
    const rowMap = new Map();
    for (const item of items) {
      const y = Math.round(item.transform[5]);
      let foundKey = null;
      for (const key of rowMap.keys()) {
        if (Math.abs(key - y) < 6) {
          foundKey = key;
          break;
        }
      }
      if (foundKey !== null) {
        rowMap.get(foundKey).push(item);
      } else {
        rowMap.set(y, [item]);
      }
    }
    
    const sortedRowKeys = Array.from(rowMap.keys()).sort((a, b) => b - a);
    const sheetData = [];
    
    for (const yKey of sortedRowKeys) {
      const rowItems = rowMap.get(yKey);
      rowItems.sort((a, b) => a.transform[4] - b.transform[4]);
      
      const cells = [];
      let lastX = null;
      let lastWidth = 0;
      let currentCellText = '';
      
      for (const item of rowItems) {
        const x = item.transform[4];
        if (lastX !== null && x - (lastX + lastWidth) > 15) {
          if (currentCellText) {
            cells.push(currentCellText.trim());
          }
          currentCellText = item.str + ' ';
        } else {
          currentCellText += item.str;
        }
        lastX = x;
        lastWidth = item.width || (item.str.length * 6);
      }
      if (currentCellText) {
        cells.push(currentCellText.trim());
      }
      
      if (cells.length > 0) {
        sheetData.push(cells);
      }
    }
    
    const ws = XLSX.utils.aoa_to_sheet(sheetData);
    XLSX.utils.book_append_sheet(wb, ws, `Page ${i}`);
  }
  
  return XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
}

/**
 * Converts PDF to PDF/A by embedding conformance metadata in the Catalog dictionary
 * @param {File} file 
 * @returns {Promise<Uint8Array>} PDF/A PDF bytes
 */
export async function convertPdfToPdfA(file) {
  const arrayBuffer = await file.arrayBuffer();
  const pdfDoc = await PDFDocument.load(arrayBuffer);
  
  const xmpMetadata = `<?xpacket begin="" id="W5M0MpCehiHzreSzNTczkc9d"?>
<x:xmpmeta xmlns:x="adobe:ns:meta/">
 <rdf:RDF xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#">
  <rdf:Description rdf:about="" xmlns:pdfaExtension="http://www.aiim.org/pdfa/ns/extension/" xmlns:pdfaSchema="http://www.aiim.org/pdfa/ns/schema#" xmlns:pdfaProperty="http://www.aiim.org/pdfa/ns/property#">
  </rdf:Description>
  <rdf:Description rdf:about="" xmlns:pdfaid="http://www.aiim.org/pdfa/ns/id/">
   <pdfaid:part>3</pdfaid:part>
   <pdfaid:conformance>B</pdfaid:conformance>
  </rdf:Description>
 </rdf:RDF>
</x:xmpmeta>
<?xpacket end="w"?>`;

  const metadataStream = pdfDoc.context.stream(xmpMetadata, {
    Type: 'Metadata',
    Subtype: 'XML',
  });
  
  const metadataStreamRef = pdfDoc.context.register(metadataStream);
  pdfDoc.catalog.set(pdfDoc.context.obj('Metadata'), metadataStreamRef);
  
  return await pdfDoc.save();
}

/**
 * Converts PDF to Markdown by parsing text layer coordinates
 * @param {File} file 
 * @returns {Promise<string>} Markdown text
 */
export async function convertPdfToMarkdown(file) {
  const arrayBuffer = await file.arrayBuffer();
  const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
  const pdf = await loadingTask.promise;
  
  let markdownText = '';
  
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const textContent = await page.getTextContent();
    const items = textContent.items;
    
    const rowMap = new Map();
    for (const item of items) {
      const y = Math.round(item.transform[5]);
      let foundKey = null;
      for (const key of rowMap.keys()) {
        if (Math.abs(key - y) < 6) {
          foundKey = key;
          break;
        }
      }
      if (foundKey !== null) {
        rowMap.get(foundKey).push(item);
      } else {
        rowMap.set(y, [item]);
      }
    }
    
    const sortedRowKeys = Array.from(rowMap.keys()).sort((a, b) => b - a);
    
    markdownText += `\n<!-- Page ${i} -->\n\n`;
    
    let isTableMode = false;
    let tableBuffer = [];
    
    for (const yKey of sortedRowKeys) {
      const rowItems = rowMap.get(yKey);
      rowItems.sort((a, b) => a.transform[4] - b.transform[4]);
      
      const cells = [];
      let lastX = null;
      let lastWidth = 0;
      let currentCellText = '';
      let maxFontSize = 0;
      
      for (const item of rowItems) {
        const x = item.transform[4];
        const fontSize = item.transform[0];
        if (fontSize > maxFontSize) maxFontSize = fontSize;
        
        if (lastX !== null && x - (lastX + lastWidth) > 15) {
          if (currentCellText) {
            cells.push(currentCellText.trim());
          }
          currentCellText = item.str + ' ';
        } else {
          currentCellText += item.str;
        }
        lastX = x;
        lastWidth = item.width || (item.str.length * 6);
      }
      if (currentCellText) {
        cells.push(currentCellText.trim());
      }
      
      if (cells.length === 0) continue;
      
      if (cells.length >= 2) {
        isTableMode = true;
        tableBuffer.push(cells);
      } else {
        if (isTableMode && tableBuffer.length > 0) {
          markdownText += flushTableBuffer(tableBuffer);
          tableBuffer = [];
          isTableMode = false;
        }
        
        const cellText = cells[0];
        if (maxFontSize > 14) {
          markdownText += `\n# ${cellText}\n\n`;
        } else if (cellText.startsWith('•') || cellText.startsWith('-') || cellText.startsWith('*')) {
          markdownText += `* ${cellText.replace(/^[•\-\*]\s*/, '')}\n`;
        } else if (/^\d+\.\s/.test(cellText)) {
          markdownText += `${cellText}\n`;
        } else {
          markdownText += `${cellText}\n\n`;
        }
      }
    }
    
    if (isTableMode && tableBuffer.length > 0) {
      markdownText += flushTableBuffer(tableBuffer);
      tableBuffer = [];
    }
  }
  
  return markdownText;
}

function flushTableBuffer(tableBuffer) {
  if (tableBuffer.length === 0) return '';
  let tableMd = '\n';
  const header = tableBuffer[0];
  tableMd += `| ${header.join(' | ')} |\n`;
  const align = header.map(() => '---');
  tableMd += `| ${align.join(' | ')} |\n`;
  for (let r = 1; r < tableBuffer.length; r++) {
    const row = tableBuffer[r];
    while (row.length < header.length) row.push('');
    tableMd += `| ${row.slice(0, header.length).join(' | ')} |\n`;
  }
  tableMd += '\n';
  return tableMd;
}
