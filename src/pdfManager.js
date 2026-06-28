import { PDFDocument, StandardFonts, rgb, degrees } from 'pdf-lib';
import * as pdfjsLib from 'pdfjs-dist';

export class PdfManager {
  constructor() {
    this.pdfDoc = null;         // pdf-lib instance
    this.pdfJsDoc = null;       // pdf.js instance
    this.pdfBuffer = null;      // original arrayBuffer
    this.numPages = 0;
    this.currentPageIndex = 0;
    this.pageWidths = [];       // in points
    this.pageHeights = [];      // in points
    
    // Additions storage: keyed by pageIndex
    // { text: [], signatures: [], drawings: null }
    this.additions = {}; 
  }

  /**
   * Load PDF buffer
   * @param {ArrayBuffer} buffer 
   */
  async loadPdf(buffer) {
    this.pdfBuffer = buffer;
    this.pdfDoc = await PDFDocument.load(buffer);
    this.numPages = this.pdfDoc.getPageCount();
    
    const loadingTask = pdfjsLib.getDocument({ data: new Uint8Array(buffer.slice(0)) });
    this.pdfJsDoc = await loadingTask.promise;
    
    this.pageWidths = [];
    this.pageHeights = [];
    this.additions = {};
    
    this.metadata = {
      title: this.pdfDoc.getTitle() || '',
      author: this.pdfDoc.getAuthor() || '',
      subject: this.pdfDoc.getSubject() || '',
      creator: this.pdfDoc.getCreator() || '',
      producer: this.pdfDoc.getProducer() || '',
      creationDate: this.pdfDoc.getCreationDate() || null,
      modificationDate: this.pdfDoc.getModificationDate() || null
    };
    
    for (let i = 0; i < this.numPages; i++) {
      const page = this.pdfDoc.getPage(i);
      const { width, height } = page.getSize();
      this.pageWidths.push(width);
      this.pageHeights.push(height);
      
      this.additions[i] = {
        text: [],
        signatures: [],
        drawingBlob: null // Drawing canvas stored as PNG blob URL
      };
    }
    
    this.currentPageIndex = 0;
  }

  /**
   * Renders the current page to the viewport
   * @param {number} pageIndex 
   * @param {HTMLElement} containerPageDiv 
   */
  async renderPageToContainer(pageIndex, containerPageDiv) {
    if (!this.pdfJsDoc) return;
    this.currentPageIndex = pageIndex;
    
    containerPageDiv.innerHTML = '';
    
    const page = await this.pdfJsDoc.getPage(pageIndex + 1);
    const viewport = page.getViewport({ scale: 1.5 });
    
    // 1. Create Render Canvas
    const canvas = document.createElement('canvas');
    canvas.className = 'pdf-render-canvas';
    canvas.width = viewport.width;
    canvas.height = viewport.height;
    
    const context = canvas.getContext('2d');
    containerPageDiv.appendChild(canvas);
    
    // Render PDF page to canvas
    await page.render({ canvasContext: context, viewport }).promise;
    
    // Set container dimensions
    containerPageDiv.style.width = `${viewport.width}px`;
    containerPageDiv.style.height = `${viewport.height}px`;
    
    // 2. Create Annotation Layer Overlay
    const annotationOverlay = document.createElement('div');
    annotationOverlay.className = 'annotation-overlay';
    containerPageDiv.appendChild(annotationOverlay);
    
    // 3. Create Freehand Drawing Canvas Layer
    const drawingCanvas = document.createElement('canvas');
    drawingCanvas.className = 'drawing-canvas';
    drawingCanvas.width = viewport.width;
    drawingCanvas.height = viewport.height;
    containerPageDiv.appendChild(drawingCanvas);
    
    // Restore previous drawing if it exists
    const savedDrawing = this.additions[pageIndex].drawingBlob;
    if (savedDrawing) {
      const img = new Image();
      img.onload = () => {
        const ctx = drawingCanvas.getContext('2d');
        ctx.drawImage(img, 0, 0);
      };
      img.src = savedDrawing;
    }
    
    // Restore previous text elements
    this.additions[pageIndex].text.forEach(txtObj => {
      this.renderTextElement(txtObj, annotationOverlay, pageIndex);
    });

    // Restore previous signatures
    this.additions[pageIndex].signatures.forEach(sigObj => {
      this.renderSignatureElement(sigObj, annotationOverlay, pageIndex);
    });

    return { canvas, annotationOverlay, drawingCanvas, viewport };
  }

  /**
   * Helper to draw text element in the DOM
   */
  renderTextElement(txtObj, overlay, pageIndex) {
    const el = document.createElement('div');
    el.className = 'text-element';
    el.contentEditable = 'true';
    el.style.left = `${txtObj.percentX * 100}%`;
    el.style.top = `${txtObj.percentY * 100}%`;
    el.style.fontSize = `${txtObj.size}px`;
    el.style.color = txtObj.color;
    el.style.fontFamily = txtObj.fontFamily || "'Inter', sans-serif";
    el.style.fontWeight = txtObj.isBold ? 'bold' : 'normal';
    el.style.fontStyle = txtObj.isItalic ? 'italic' : 'normal';
    el.innerText = txtObj.text;
    
    // Save overlay dimensions
    if (!txtObj.overlayWidth) {
      const overlayRect = overlay.getBoundingClientRect();
      txtObj.overlayWidth = overlayRect.width;
      txtObj.overlayHeight = overlayRect.height;
    }
    
    // Handle positioning and deletion
    el.addEventListener('focus', () => {
      window.activeTextElement = { el, txtObj, pageIndex };
      if (window.updateTextInspector) {
        window.updateTextInspector(txtObj);
      }
    });
    
    el.addEventListener('blur', () => {
      txtObj.text = el.innerText.trim();
      if (!txtObj.text) {
        el.remove();
        this.additions[pageIndex].text = this.additions[pageIndex].text.filter(t => t !== txtObj);
      }
    });

    // Dragging text elements
    let isDragging = false;
    let startX, startY;
    
    el.addEventListener('mousedown', (e) => {
      if (document.activeElement === el) return; // type instead of drag if focused
      isDragging = true;
      startX = e.clientX - el.offsetLeft;
      startY = e.clientY - el.offsetTop;
      e.preventDefault();
    });
    
    document.addEventListener('mousemove', (e) => {
      if (!isDragging) return;
      const overlayRect = overlay.getBoundingClientRect();
      let x = e.clientX - startX;
      let y = e.clientY - startY;
      
      // Keep boundaries
      x = Math.max(0, Math.min(x, overlayRect.width - el.offsetWidth));
      y = Math.max(0, Math.min(y, overlayRect.height - el.offsetHeight));
      
      el.style.left = `${x}px`;
      el.style.top = `${y}px`;
      
      txtObj.percentX = x / overlayRect.width;
      txtObj.percentY = y / overlayRect.height;
    });
    
    document.addEventListener('mouseup', () => {
      isDragging = false;
    });
    
    overlay.appendChild(el);
  }

  /**
   * Helper to draw signature element in the DOM
   */
  renderSignatureElement(sigObj, overlay, pageIndex) {
    const el = document.createElement('div');
    el.className = 'signature-element';
    el.style.left = `${sigObj.percentX * 100}%`;
    el.style.top = `${sigObj.percentY * 100}%`;
    el.style.width = `${sigObj.percentW * 100}%`;
    el.style.height = `${sigObj.percentH * 100}%`;
    
    const img = document.createElement('img');
    img.src = sigObj.dataUrl;
    el.appendChild(img);
    
    const delBtn = document.createElement('button');
    delBtn.className = 'element-delete-btn';
    delBtn.innerHTML = '&times;';
    delBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      el.remove();
      this.additions[pageIndex].signatures = this.additions[pageIndex].signatures.filter(s => s !== sigObj);
    });
    el.appendChild(delBtn);
    
    // Dragging signatures
    let isDragging = false;
    let startX, startY;
    
    el.addEventListener('mousedown', (e) => {
      if (e.target === delBtn) return;
      isDragging = true;
      startX = e.clientX - el.offsetLeft;
      startY = e.clientY - el.offsetTop;
      e.preventDefault();
    });
    
    document.addEventListener('mousemove', (e) => {
      if (!isDragging) return;
      const overlayRect = overlay.getBoundingClientRect();
      let x = e.clientX - startX;
      let y = e.clientY - startY;
      
      x = Math.max(0, Math.min(x, overlayRect.width - el.offsetWidth));
      y = Math.max(0, Math.min(y, overlayRect.height - el.offsetHeight));
      
      el.style.left = `${x}px`;
      el.style.top = `${y}px`;
      
      sigObj.percentX = x / overlayRect.width;
      sigObj.percentY = y / overlayRect.height;
    });
    
    document.addEventListener('mouseup', () => {
      isDragging = false;
    });
    
    overlay.appendChild(el);
  }

  /**
   * Save drawings, text and signatures back into the original PDF
   * @returns {Promise<Uint8Array>} modified PDF bytes
   */
  async saveDocument() {
    // We reload the PDF to start clean or apply edits sequentially
    const outPdf = await PDFDocument.load(this.pdfBuffer);
    const helveticaFont = await outPdf.embedFont(StandardFonts.Helvetica);
    
    for (let i = 0; i < this.numPages; i++) {
      const page = outPdf.getPage(i);
      const { width: pageWidth, height: pageHeight } = page.getSize();
      const pageAdditions = this.additions[i];
      
      // 1. Embed drawings (if any)
      if (pageAdditions.drawingBlob) {
        const drawingBytes = await fetch(pageAdditions.drawingBlob)
          .then(res => res.arrayBuffer());
        const embeddedDraw = await outPdf.embedPng(drawingBytes);
        page.drawImage(embeddedDraw, {
          x: 0,
          y: 0,
          width: pageWidth,
          height: pageHeight,
        });
      }
      
      // 2. Add text annotations as transparent high-res PNG images (supports custom fonts, bold, and italic perfectly)
      for (const txtObj of pageAdditions.text) {
        if (!txtObj.text) continue;
        
        const tempCanvas = document.createElement('canvas');
        const tempCtx = tempCanvas.getContext('2d');
        
        // Render at 3x scale for crisp print quality
        const scale = 3;
        const fontSize = txtObj.size * scale;
        const fontStyle = `${txtObj.isItalic ? 'italic' : ''} ${txtObj.isBold ? 'bold' : ''} ${fontSize}px ${txtObj.fontFamily || 'sans-serif'}`;
        
        tempCtx.font = fontStyle;
        const lines = txtObj.text.split('\n');
        let maxWidth = 0;
        for (const line of lines) {
          maxWidth = Math.max(maxWidth, tempCtx.measureText(line).width);
        }
        
        const lineHeight = fontSize * 1.35;
        const totalHeight = lineHeight * lines.length;
        
        tempCanvas.width = maxWidth + 40;
        tempCanvas.height = totalHeight + 40;
        
        // Draw text on resized canvas
        tempCtx.font = fontStyle;
        tempCtx.fillStyle = txtObj.color || '#000000';
        tempCtx.textBaseline = 'top';
        
        lines.forEach((line, idx) => {
          tempCtx.fillText(line, 20, 20 + idx * lineHeight);
        });
        
        const textDataUrl = tempCanvas.toDataURL('image/png');
        const textBytes = await fetch(textDataUrl).then(res => res.arrayBuffer());
        const embeddedTextImg = await outPdf.embedPng(textBytes);
        
        const pdfWidth = (tempCanvas.width / scale) * (pageWidth / (txtObj.overlayWidth || pageWidth));
        const pdfHeight = (tempCanvas.height / scale) * (pageHeight / (txtObj.overlayHeight || pageHeight));
        
        const x = txtObj.percentX * pageWidth;
        const y = pageHeight - (txtObj.percentY * pageHeight) - pdfHeight;
        
        page.drawImage(embeddedTextImg, {
          x,
          y,
          width: pdfWidth,
          height: pdfHeight
        });
      }
      
      // 3. Add signature images
      for (const sigObj of pageAdditions.signatures) {
        const sigBytes = await fetch(sigObj.dataUrl)
          .then(res => res.arrayBuffer());
        const embeddedSig = await outPdf.embedPng(sigBytes);
        
        const x = sigObj.percentX * pageWidth;
        const width = sigObj.percentW * pageWidth;
        const height = sigObj.percentH * pageHeight;
        const y = pageHeight - (sigObj.percentY * pageHeight) - height;
        
        page.drawImage(embeddedSig, {
          x,
          y,
          width,
          height,
        });
      }
    }
    
    if (this.metadata) {
      outPdf.setTitle(this.metadata.title || '');
      outPdf.setAuthor(this.metadata.author || '');
      outPdf.setSubject(this.metadata.subject || '');
      outPdf.setCreator(this.metadata.creator || '');
      outPdf.setProducer(this.metadata.producer || '');
      outPdf.setModificationDate(new Date());
    }
    
    return await outPdf.save();
  }

  /**
   * Helper to convert Hex to RGB
   */
  hexToRgb(hex) {
    const r = parseInt(hex.slice(1, 3), 16) / 255;
    const g = parseInt(hex.slice(3, 5), 16) / 255;
    const b = parseInt(hex.slice(5, 7), 16) / 255;
    return rgb(r, g, b);
  }
}
