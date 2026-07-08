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
        formFields: [],
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

    // Restore previous form fields
    if (this.additions[pageIndex].formFields) {
      this.additions[pageIndex].formFields.forEach(fieldObj => {
        this.renderFormFieldElement(fieldObj, annotationOverlay, pageIndex);
      });
    }

    return { canvas, annotationOverlay, drawingCanvas, viewport };
  }

  /**
   * Helper to draw text element in the DOM
   */
  renderTextElement(txtObj, overlay, pageIndex) {
    // 1. Create Wrapper Container
    const wrapper = document.createElement('div');
    wrapper.className = 'text-element-wrapper';
    wrapper.style.position = 'absolute';
    wrapper.style.left = `${txtObj.percentX * 100}%`;
    wrapper.style.top = `${txtObj.percentY * 100}%`;
    wrapper.style.width = txtObj.percentW ? `${txtObj.percentW * 100}%` : 'auto';
    wrapper.style.height = txtObj.percentH ? `${txtObj.percentH * 100}%` : 'auto';
    wrapper.style.boxSizing = 'border-box';
    
    // 2. Create Inner Editable Text Element
    const el = document.createElement('div');
    el.className = 'text-element';
    el.contentEditable = 'false'; // double click or creation focuses it
    el.style.width = '100%';
    el.style.height = '100%';
    el.style.boxSizing = 'border-box';
    el.style.fontSize = `${txtObj.size}px`;
    el.style.color = txtObj.color;
    el.style.fontFamily = txtObj.fontFamily || "'Inter', sans-serif";
    el.style.fontWeight = txtObj.isBold ? 'bold' : 'normal';
    el.style.fontStyle = txtObj.isItalic ? 'italic' : 'normal';
    el.innerText = txtObj.text;
    el.style.backgroundColor = txtObj.bgEnable ? txtObj.bgColor : 'transparent';
    wrapper.appendChild(el);
    
    // Save overlay dimensions
    if (!txtObj.overlayWidth) {
      const overlayRect = overlay.getBoundingClientRect();
      txtObj.overlayWidth = overlayRect.width;
      txtObj.overlayHeight = overlayRect.height;
    }
    
    // 3. Explicit Delete Button (placed on wrapper, avoiding overflow hidden clipping)
    const delBtn = document.createElement('button');
    delBtn.className = 'element-delete-btn';
    delBtn.innerHTML = '&times;';
    delBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      wrapper.remove();
      this.additions[pageIndex].text = this.additions[pageIndex].text.filter(t => t !== txtObj);
      window.saveHistoryState(pageIndex);
    });
    wrapper.appendChild(delBtn);
    
    // Focus / Blur updates
    el.addEventListener('focus', () => {
      window.activeTextElement = { el, txtObj, pageIndex };
      if (window.updateTextInspector) {
        window.updateTextInspector(txtObj);
      }
    });
    
    el.addEventListener('blur', () => {
      el.contentEditable = 'false';
      const oldVal = txtObj.text;
      txtObj.text = el.innerText.trim();
      if (!txtObj.text || txtObj.text === 'Click to edit text') {
        wrapper.remove();
        this.additions[pageIndex].text = this.additions[pageIndex].text.filter(t => t !== txtObj);
        window.saveHistoryState(pageIndex);
      } else if (oldVal !== txtObj.text) {
        window.saveHistoryState(pageIndex);
      }
    });

    // Single click to trigger edit mode
    el.addEventListener('click', (e) => {
      e.stopPropagation();
      if (el.contentEditable !== 'true') {
        el.contentEditable = 'true';
        el.focus();
        
        // Select all text
        const range = document.createRange();
        range.selectNodeContents(el);
        const sel = window.getSelection();
        sel.removeAllRanges();
        sel.addRange(range);
      }
    });

    // Dragging wrapper logic (bound to wrapper, using dynamic doc listeners)
    wrapper.addEventListener('mousedown', (e) => {
      if (e.target === delBtn || e.target.classList.contains('resize-handle')) return;
      if (el.contentEditable === 'true') return; // type instead of drag if actively editing
      
      const startX = e.clientX - wrapper.offsetLeft;
      const startY = e.clientY - wrapper.offsetTop;
      e.preventDefault(); // prevents highlighting while dragging
      
      const onMouseMove = (moveEvent) => {
        const overlayRect = overlay.getBoundingClientRect();
        let x = moveEvent.clientX - startX;
        let y = moveEvent.clientY - startY;
        
        // Keep boundaries
        x = Math.max(0, Math.min(x, overlayRect.width - wrapper.offsetWidth));
        y = Math.max(0, Math.min(y, overlayRect.height - wrapper.offsetHeight));
        
        wrapper.style.left = `${x}px`;
        wrapper.style.top = `${y}px`;
        
        txtObj.percentX = x / overlayRect.width;
        txtObj.percentY = y / overlayRect.height;
      };
      
      const onMouseUp = () => {
        document.removeEventListener('mousemove', onMouseMove);
        document.removeEventListener('mouseup', onMouseUp);
        window.saveHistoryState(pageIndex);
      };
      
      document.addEventListener('mousemove', onMouseMove);
      document.addEventListener('mouseup', onMouseUp);
    });
    
    // 4. Setup Corner Resizing (TL, TR, BL, BR handles)
    const handles = ['tl', 'tr', 'bl', 'br'];
    handles.forEach(dir => {
      const handle = document.createElement('div');
      handle.className = `resize-handle ${dir}`;
      wrapper.appendChild(handle);
      
      handle.addEventListener('mousedown', (e) => {
        e.stopPropagation();
        e.preventDefault();
        
        const startWidth = wrapper.offsetWidth;
        const startHeight = wrapper.offsetHeight;
        const startLeft = wrapper.offsetLeft;
        const startTop = wrapper.offsetTop;
        const startMouseX = e.clientX;
        const startMouseY = e.clientY;
        
        const onMouseMove = (moveEvent) => {
          const dx = moveEvent.clientX - startMouseX;
          const dy = moveEvent.clientY - startMouseY;
          const overlayRect = overlay.getBoundingClientRect();
          
          let newWidth = startWidth;
          let newHeight = startHeight;
          let newLeft = startLeft;
          let newTop = startTop;
          
          if (dir.includes('r')) {
            newWidth = Math.max(50, startWidth + dx);
          }
          if (dir.includes('l')) {
            const potentialWidth = startWidth - dx;
            if (potentialWidth >= 50) {
              newWidth = potentialWidth;
              newLeft = startLeft + dx;
            }
          }
          if (dir.includes('b')) {
            newHeight = Math.max(24, startHeight + dy);
          }
          if (dir.includes('t')) {
            const potentialHeight = startHeight - dy;
            if (potentialHeight >= 24) {
              newHeight = potentialHeight;
              newTop = startTop + dy;
            }
          }
          
          // Boundaries checking relative to overlay width/height
          newLeft = Math.max(0, Math.min(newLeft, overlayRect.width - newWidth));
          newTop = Math.max(0, Math.min(newTop, overlayRect.height - newHeight));
          
          wrapper.style.width = `${newWidth}px`;
          wrapper.style.height = `${newHeight}px`;
          wrapper.style.left = `${newLeft}px`;
          wrapper.style.top = `${newTop}px`;
          
          // Save percentage coordinates
          txtObj.percentX = newLeft / overlayRect.width;
          txtObj.percentY = newTop / overlayRect.height;
          txtObj.percentW = newWidth / overlayRect.width;
          txtObj.percentH = newHeight / overlayRect.height;
        };
        
        const onMouseUp = () => {
          document.removeEventListener('mousemove', onMouseMove);
          document.removeEventListener('mouseup', onMouseUp);
          window.saveHistoryState(pageIndex);
        };
        
        document.addEventListener('mousemove', onMouseMove);
        document.addEventListener('mouseup', onMouseUp);
      });
    });

    overlay.appendChild(wrapper);

    // Auto-focus new text blocks immediately on creation
    if (txtObj.text === 'Click to edit text') {
      el.contentEditable = 'true';
      setTimeout(() => {
        el.focus();
        const range = document.createRange();
        range.selectNodeContents(el);
        const sel = window.getSelection();
        sel.removeAllRanges();
        sel.addRange(range);
      }, 50);
    }
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
   * Helper to draw form field element in the DOM
   */
  renderFormFieldElement(fieldObj, overlay, pageIndex) {
    const el = document.createElement('div');
    el.className = 'form-field-element';
    
    // Style coordinates
    el.style.left = `${fieldObj.percentX * 100}%`;
    el.style.top = `${fieldObj.percentY * 100}%`;
    el.style.width = `${fieldObj.percentW * 100}%`;
    el.style.height = `${fieldObj.percentH * 100}%`;
    
    // Standard style attributes
    el.style.position = 'absolute';
    el.style.background = 'rgba(59, 130, 246, 0.22)';
    el.style.border = '1.5px dashed #2563eb';
    el.style.color = '#1e3a8a';
    el.style.fontSize = '0.75rem';
    el.style.fontWeight = '600';
    el.style.display = 'flex';
    el.style.alignItems = 'center';
    el.style.justifyContent = 'center';
    el.style.boxSizing = 'border-box';
    el.style.cursor = 'move';
    el.style.resize = 'both';
    el.style.overflow = 'hidden';
    el.style.userSelect = 'none';
    el.style.padding = '2px';
    el.style.zIndex = '10';
    
    // Icon & text preview
    const labelSpan = document.createElement('span');
    labelSpan.style.pointerEvents = 'none';
    labelSpan.style.textOverflow = 'ellipsis';
    labelSpan.style.whiteSpace = 'nowrap';
    labelSpan.style.overflow = 'hidden';
    labelSpan.style.maxWidth = '85%';
    
    const updateLabel = () => {
      const typeText = fieldObj.type === 'text' ? 'Text' : fieldObj.type === 'checkbox' ? 'Check' : 'Sign';
      labelSpan.textContent = `[${typeText}] ${fieldObj.name}`;
    };
    updateLabel();
    el.appendChild(labelSpan);
    
    // Delete button
    const delBtn = document.createElement('button');
    delBtn.className = 'element-delete-btn';
    delBtn.innerHTML = '&times;';
    delBtn.style.position = 'absolute';
    delBtn.style.top = '2px';
    delBtn.style.right = '2px';
    delBtn.style.background = '#ef4444';
    delBtn.style.color = '#ffffff';
    delBtn.style.border = 'none';
    delBtn.style.borderRadius = '50%';
    delBtn.style.width = '14px';
    delBtn.style.height = '14px';
    delBtn.style.fontSize = '10px';
    delBtn.style.display = 'flex';
    delBtn.style.alignItems = 'center';
    delBtn.style.justifyContent = 'center';
    delBtn.style.cursor = 'pointer';
    
    delBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      el.remove();
      this.additions[pageIndex].formFields = this.additions[pageIndex].formFields.filter(f => f !== fieldObj);
      if (window.onFormFieldDeleted) {
        window.onFormFieldDeleted(fieldObj);
      }
    });
    el.appendChild(delBtn);
    
    // Dragging logic
    let isDragging = false;
    let startX, startY;
    
    el.addEventListener('mousedown', (e) => {
      if (e.target === delBtn) return;
      
      const rect = el.getBoundingClientRect();
      const clickX = e.clientX - rect.left;
      const clickY = e.clientY - rect.top;
      if (clickX > rect.width - 16 && clickY > rect.height - 16) {
        return; // Native resize handle
      }
      
      isDragging = true;
      startX = e.clientX - el.offsetLeft;
      startY = e.clientY - el.offsetTop;
      e.preventDefault();
      
      if (window.selectFormField) {
        window.selectFormField(fieldObj, el);
      }
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
      
      fieldObj.percentX = x / overlayRect.width;
      fieldObj.percentY = y / overlayRect.height;
    });
    
    document.addEventListener('mouseup', () => {
      isDragging = false;
    });
    
    // Resize Observer to update width/height
    const ro = new ResizeObserver(entries => {
      for (let entry of entries) {
        const overlayRect = overlay.getBoundingClientRect();
        fieldObj.percentW = el.offsetWidth / overlayRect.width;
        fieldObj.percentH = el.offsetHeight / overlayRect.height;
      }
    });
    ro.observe(el);
    
    fieldObj.updateUI = updateLabel;
    
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
        
        // Word wrapping calculations based on resized overlay width
        const maxCanvasWidth = txtObj.percentW ? (txtObj.percentW * (txtObj.overlayWidth || pageWidth) * scale) : null;
        const lines = [];
        const rawLines = txtObj.text.split('\n');
        
        if (maxCanvasWidth) {
          rawLines.forEach(rawLine => {
            const words = rawLine.split(' ');
            let currentLine = '';
            
            words.forEach(word => {
              const testLine = currentLine ? currentLine + ' ' + word : word;
              const testWidth = tempCtx.measureText(testLine).width;
              if (testWidth > maxCanvasWidth - 40) { // accounting for padding
                lines.push(currentLine);
                currentLine = word;
              } else {
                currentLine = testLine;
              }
            });
            if (currentLine) lines.push(currentLine);
          });
        } else {
          rawLines.forEach(rl => lines.push(rl));
        }
        
        let maxWidth = 0;
        for (const line of lines) {
          maxWidth = Math.max(maxWidth, tempCtx.measureText(line).width);
        }
        
        const finalWidth = maxCanvasWidth ? Math.max(maxWidth, maxCanvasWidth - 40) : maxWidth;
        const lineHeight = fontSize * 1.35;
        const totalHeight = lineHeight * lines.length;
        
        tempCanvas.width = finalWidth + 40;
        tempCanvas.height = totalHeight + 40;
        
        // Redraw states
        tempCtx.font = fontStyle;
        tempCtx.textBaseline = 'top';
        
        // Draw background fill color if enabled
        if (txtObj.bgEnable && txtObj.bgColor) {
          tempCtx.fillStyle = txtObj.bgColor;
          tempCtx.fillRect(0, 0, tempCanvas.width, tempCanvas.height);
        }
        
        // Draw text characters
        tempCtx.fillStyle = txtObj.color || '#000000';
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
      
      // 4. Add interactive Form Fields
      if (pageAdditions.formFields && pageAdditions.formFields.length > 0) {
        const form = outPdf.getForm();
        for (const fieldObj of pageAdditions.formFields) {
          const x = fieldObj.percentX * pageWidth;
          const width = fieldObj.percentW * pageWidth;
          const height = fieldObj.percentH * pageHeight;
          const y = pageHeight - (fieldObj.percentY * pageHeight) - height;
          
          let uniqueName = fieldObj.name || 'field_' + Math.random().toString(36).substr(2, 5);
          let counter = 1;
          while (true) {
            try {
              form.getField(uniqueName);
              uniqueName = (fieldObj.name || 'field') + '_' + counter;
              counter++;
            } catch (e) {
              break;
            }
          }
          
          if (fieldObj.type === 'text') {
            const field = form.createTextField(uniqueName);
            field.setPlaceholder(fieldObj.placeholder || '');
            field.addToPage(page, { x, y, width, height });
          } else if (fieldObj.type === 'checkbox') {
            const field = form.createCheckBox(uniqueName);
            field.addToPage(page, { x, y, width, height });
          } else if (fieldObj.type === 'signature') {
            const field = form.createSignature(uniqueName);
            field.addToPage(page, { x, y, width, height });
          }
        }
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

  /**
   * Scans page text content to find closest font descriptors
   */
  async detectFontAtPercent(pageIndex, percentX, percentY) {
    try {
      if (!this.pdfJsDoc) return null;
      const page = await this.pdfJsDoc.getPage(pageIndex + 1);
      const { width: pageWidth, height: pageHeight } = page.getViewport({ scale: 1 });
      
      const clickPdfX = percentX * pageWidth;
      const clickPdfY = (1 - percentY) * pageHeight;
      
      const textContent = await page.getTextContent();
      let closestItem = null;
      let minDistance = 50; // threshold in points
      
      textContent.items.forEach(item => {
        const x = item.transform[4];
        const y = item.transform[5];
        const dx = x - clickPdfX;
        const dy = y - clickPdfY;
        const dist = Math.sqrt(dx * dx + dy * dy);
        
        if (dist < minDistance) {
          minDistance = dist;
          closestItem = item;
        }
      });
      
      if (closestItem) {
        const style = textContent.styles[closestItem.fontName];
        return {
          fontFamily: style ? style.fontFamily : null,
          fontName: closestItem.fontName,
          text: closestItem.str
        };
      }
      return null;
    } catch (err) {
      console.error('Font detection error:', err);
      return null;
    }
  }

  /**
   * Extracts text items and computes precise absolute overlay percentage coordinates
   */
  async extractNativeTextBlocks(pageIndex) {
    try {
      if (!this.pdfJsDoc) return [];
      const page = await this.pdfJsDoc.getPage(pageIndex + 1);
      const viewport = page.getViewport({ scale: 1.0 });
      const pageWidth = viewport.width;
      const pageHeight = viewport.height;
      
      const textContent = await page.getTextContent();
      const blocks = [];
      
      textContent.items.forEach(item => {
        if (!item.str || item.str.trim().length === 0) return;
        
        const x = item.transform[4];
        const y = item.transform[5];
        const fontHeight = Math.abs(item.transform[3]);
        
        const percentX = x / pageWidth;
        const percentY = (pageHeight - y - fontHeight) / pageHeight;
        const percentW = item.width / pageWidth;
        const percentH = fontHeight / pageHeight;
        
        const style = textContent.styles[item.fontName];
        
        blocks.push({
          percentX,
          percentY,
          percentW,
          percentH,
          text: item.str,
          fontSize: Math.max(10, Math.round(fontHeight)),
          fontFamily: style ? style.fontFamily : "'Inter', sans-serif"
        });
      });
      
      return blocks;
    } catch (err) {
      console.error('Text block extraction error:', err);
      return [];
    }
  }
}
