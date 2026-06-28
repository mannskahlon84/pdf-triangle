import './style.css';
import { PdfManager } from './pdfManager';
import { SignaturePad } from './signatureManager';
import { runOcrOnCanvas } from './ocrManager';
import { mergePdfs, splitPdf, parseRanges, organizePdfPages, addWatermarkToPdf, compressPdf, encryptPdf, decryptPdf, addPageNumbersToPdf } from './tools/manipulator';
import { convertImagesToPdf, convertPdfToImages, convertWordToPdf, convertExcelToPdf } from './tools/converters';
import * as pdfjsLib from 'pdfjs-dist';
import { PDFDocument, degrees } from 'pdf-lib';

// Configure pdf.js worker globally from the local public folder (prevents CORS and CDN loading issues)
pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.mjs';

// Application State
const state = {
  activeTool: 'dashboard', // dashboard, editor, merge, split, organize, jpg-to-pdf, pdf-to-jpg, word-to-pdf, excel-to-pdf, watermark
  theme: 'light',
  editor: {
    pdfManager: new PdfManager(),
    activeTool: 'pan', // pan, text, signature, draw
    drawingCanvasCtx: null,
    isDrawing: false,
    lastDrawX: 0,
    lastDrawY: 0,
    activeSignatureDataUrl: null
  },
  merge: {
    files: [], // list of File objects
    pages: []  // list of page entries to merge
  },
  split: {
    file: null,
    pageCount: 0
  },
  organize: {
    file: null,
    pages: [] // list of { index: number, rotation: number, originalIndex: number }
  },
  jpgToPdf: {
    files: []
  },
  pdfToJpg: {
    file: null,
    pageCount: 0
  },
  wordToPdf: {
    file: null
  },
  excelToPdf: {
    file: null
  },
  watermark: {
    file: null,
    imageFile: null,
    imageBuffer: null,
    imageMime: null,
    pageCount: 0
  },
  compress: {
    file: null,
    pageCount: 0,
    lowKb: 0,
    medKb: 0,
    highKb: 0
  },
  security: {
    file: null,
    isLocked: false
  },
  numbering: {
    file: null,
    pageCount: 0
  },
  batch: {
    files: []
  },
  compare: {
    fileA: null,
    fileB: null
  }
};

// Initialize Signature Pad
let signaturePadInstance = null;

// Bootstrap Application
document.addEventListener('DOMContentLoaded', () => {
  // Initialize Lucide Icons
  lucide.createIcons();
  
  // Theme Toggle
  const themeToggle = document.getElementById('theme-toggle');
  themeToggle.addEventListener('click', toggleTheme);
  
  // Setup Sidebar back button
  document.getElementById('back-to-dashboard').addEventListener('click', () => {
    window.location.hash = '#/dashboard';
  });
  document.getElementById('logo-btn').addEventListener('click', () => {
    window.location.hash = '#/dashboard';
  });

  // Bind Dashboard tool cards
  document.querySelectorAll('.tool-card').forEach(card => {
    const toolName = card.dataset.tool;
    card.querySelector('button').addEventListener('click', () => {
      window.location.hash = `#/${toolName}`;
    });
  });

  // Listen for Hash Routing Changes (Browser Back/Forward support)
  window.addEventListener('hashchange', handleRouting);
  
  // Handle initial route on page load
  handleRouting();

  setupEditorWorkspace();
  setupMergeWorkspace();
  setupSplitWorkspace();
  setupOrganizeWorkspace();
  setupJpgToPdfWorkspace();
  setupPdfToJpgWorkspace();
  setupWordToPdfWorkspace();
  setupExcelToPdfWorkspace();
  setupWatermarkWorkspace();
  setupCompressWorkspace();
  setupSecurityWorkspace();
  setupNumberingWorkspace();
  setupBatchWorkspace();
  setupCompareWorkspace();
  setupSignatureModal();
  setupOcrModal();
});

// View Routing System
function handleRouting() {
  const hash = window.location.hash;
  let viewName = 'dashboard';
  
  if (hash && hash.startsWith('#/')) {
    viewName = hash.substring(2);
  }
  
  const validRoutes = ['dashboard', 'editor', 'merge', 'split', 'organize', 'jpg-to-pdf', 'pdf-to-jpg', 'word-to-pdf', 'excel-to-pdf', 'watermark', 'compress', 'security', 'numbering', 'batch', 'compare'];
  if (!validRoutes.includes(viewName)) {
    viewName = 'dashboard';
    window.location.hash = '#/dashboard';
  }
  
  switchView(viewName);
}

function switchView(viewName) {
  state.activeTool = viewName;
  
  // Hide all views
  document.querySelectorAll('.view-panel').forEach(panel => {
    panel.classList.add('hidden');
    panel.classList.remove('active');
  });
  
  // Show active view
  const activePanel = document.getElementById(`${viewName}-view`);
  if (activePanel) {
    activePanel.classList.remove('hidden');
    activePanel.classList.add('active');
  }
  
  // Show/Hide Dashboard Navigation Button
  const backBtn = document.getElementById('back-to-dashboard');
  if (viewName === 'dashboard') {
    backBtn.classList.add('hidden');
  } else {
    backBtn.classList.remove('hidden');
  }
}

// Global UI Loaders & Feedback
function showLoader(text = 'Processing file...') {
  const spinner = document.getElementById('global-spinner');
  document.getElementById('spinner-text').textContent = text;
  spinner.classList.remove('hidden');
}

function hideLoader() {
  document.getElementById('global-spinner').classList.add('hidden');
}

function showToast(message, type = 'success') {
  const container = document.getElementById('toast-container');
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  
  let iconName = 'info';
  if (type === 'success') iconName = 'check-circle';
  if (type === 'danger') iconName = 'alert-triangle';
  
  toast.innerHTML = `<i data-lucide="${iconName}"></i> <span>${message}</span>`;
  container.appendChild(toast);
  lucide.createIcons();
  
  setTimeout(() => {
    toast.style.animation = 'slide-in 0.3s reverse forwards';
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}

function toggleTheme() {
  const body = document.body;
  if (body.classList.contains('dark-theme')) {
    body.classList.remove('dark-theme');
    body.classList.add('light-theme');
    state.theme = 'light';
  } else {
    body.classList.remove('light-theme');
    body.classList.add('dark-theme');
    state.theme = 'dark';
  }
}

// -------------------------------------------------------------
// 1. PDF EDITOR COMPONENT
// -------------------------------------------------------------
function setupEditorWorkspace() {
  const fileInput = document.getElementById('editor-file-input');
  const uploadBtn = document.getElementById('editor-upload-btn');
  const saveBtn = document.getElementById('editor-save-btn');
  const printBtn = document.getElementById('editor-print-btn');
  const rotateBtn = document.getElementById('editor-rotate-btn');
  const viewport = document.getElementById('canvas-viewport');
  
  uploadBtn.addEventListener('click', () => fileInput.click());
  fileInput.addEventListener('change', async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    showLoader('Loading PDF document...');
    try {
      const buffer = await file.arrayBuffer();
      await state.editor.pdfManager.loadPdf(buffer);
      state.editor.pdfManager.file = file;
      
      document.getElementById('meta-info-name').textContent = file.name;
      document.getElementById('meta-info-pages').textContent = state.editor.pdfManager.numPages;
      document.getElementById('meta-info-size').textContent = `${(file.size / 1024).toFixed(1)} KB`;
      
      const meta = state.editor.pdfManager.metadata;
      document.getElementById('meta-title-input').value = meta.title || '';
      document.getElementById('meta-author-input').value = meta.author || '';
      document.getElementById('meta-subject-input').value = meta.subject || '';
      document.getElementById('meta-creator-input').value = meta.creator || '';
      document.getElementById('meta-producer-input').value = meta.producer || '';
      
      document.getElementById('editor-empty-state').classList.add('hidden');
      document.getElementById('active-page-container').classList.remove('hidden');
      saveBtn.disabled = false;
      printBtn.disabled = false;
      rotateBtn.disabled = false;
      document.getElementById('ocr-page-btn').disabled = false;
      
      await loadEditorPage(0);
      await generateEditorThumbnails();
      showToast('PDF loaded successfully!');
    } catch (err) {
      console.error(err);
      showToast('Failed to load PDF.', 'danger');
    } finally {
      hideLoader();
    }
  });

  // Toolbar Actions
  document.querySelectorAll('.workspace-toolbar .tool-btn').forEach(btn => {
    const action = btn.dataset.action;
    if (action) {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.workspace-toolbar .tool-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        setEditorTool(action);
      });
    }
  });

  // Text Tool Inspector Syncing
  const textFontSelect = document.getElementById('text-font');
  const textSizeInput = document.getElementById('text-size');
  const textColorInput = document.getElementById('text-color');
  const boldBtn = document.getElementById('text-bold-btn');
  const italicBtn = document.getElementById('text-italic-btn');
  
  textFontSelect.addEventListener('change', (e) => {
    if (window.activeTextElement) {
      const { el, txtObj } = window.activeTextElement;
      txtObj.fontFamily = e.target.value;
      el.style.fontFamily = e.target.value;
    }
  });
  
  textSizeInput.addEventListener('input', (e) => {
    const val = parseInt(e.target.value, 10) || 18;
    if (window.activeTextElement) {
      const { el, txtObj } = window.activeTextElement;
      txtObj.size = val;
      el.style.fontSize = `${val}px`;
    }
  });
  
  textColorInput.addEventListener('input', (e) => {
    if (window.activeTextElement) {
      const { el, txtObj } = window.activeTextElement;
      txtObj.color = e.target.value;
      el.style.color = e.target.value;
    }
  });
  
  boldBtn.addEventListener('click', () => {
    boldBtn.classList.toggle('active');
    const isBold = boldBtn.classList.contains('active');
    boldBtn.style.background = isBold ? 'var(--bg-tertiary)' : 'transparent';
    boldBtn.style.borderColor = isBold ? 'var(--accent-purple)' : 'var(--border-color)';
    if (window.activeTextElement) {
      const { el, txtObj } = window.activeTextElement;
      txtObj.isBold = isBold;
      el.style.fontWeight = isBold ? 'bold' : 'normal';
    }
  });
  
  italicBtn.addEventListener('click', () => {
    italicBtn.classList.toggle('active');
    const isItalic = italicBtn.classList.contains('active');
    italicBtn.style.background = isItalic ? 'var(--bg-tertiary)' : 'transparent';
    italicBtn.style.borderColor = isItalic ? 'var(--accent-purple)' : 'var(--border-color)';
    if (window.activeTextElement) {
      const { el, txtObj } = window.activeTextElement;
      txtObj.isItalic = isItalic;
      el.style.fontStyle = isItalic ? 'italic' : 'normal';
    }
  });

  // Shape Fill Color Toggle Binds
  document.getElementById('shape-fill-enable').addEventListener('change', (e) => {
    const fillGroup = document.getElementById('shape-fill-color-group');
    if (e.target.checked) {
      fillGroup.classList.remove('hidden');
    } else {
      fillGroup.classList.add('hidden');
    }
  });

  // Image Upload Integration Binds
  const imgFileInput = document.getElementById('editor-image-file-input');
  const imgUploadBtn = document.getElementById('image-upload-btn');
  if (imgUploadBtn && imgFileInput) {
    imgUploadBtn.addEventListener('click', () => imgFileInput.click());
    imgFileInput.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (!file) return;
      
      const reader = new FileReader();
      reader.onload = (evt) => {
        state.editor.activeSignatureDataUrl = evt.target.result;
        state.editor.activeTool = 'signature';
        
        document.querySelectorAll('.workspace-toolbar .tool-btn').forEach(b => b.classList.remove('active'));
        const sigBtn = document.querySelector('[data-action="signature"]');
        if (sigBtn) sigBtn.classList.add('active');
        
        showToast('Image loaded! Click on the PDF page to place and resize it.', 'success');
      };
      reader.readAsDataURL(file);
    });
  }

  // Print PDF Click
  printBtn.addEventListener('click', async () => {
    commitDrawingCanvas();
    showLoader('Preparing PDF for printing...');
    try {
      const pdfBytes = await state.editor.pdfManager.saveDocument();
      const blob = new Blob([pdfBytes], { type: 'application/pdf' });
      const blobUrl = URL.createObjectURL(blob);
      
      const iframe = document.createElement('iframe');
      iframe.style.display = 'none';
      iframe.src = blobUrl;
      document.body.appendChild(iframe);
      
      iframe.onload = () => {
        iframe.contentWindow.focus();
        iframe.contentWindow.print();
        setTimeout(() => {
          document.body.removeChild(iframe);
          URL.revokeObjectURL(blobUrl);
        }, 1000);
      };
    } catch (err) {
      console.error(err);
      showToast('Failed to open printing dialog.', 'danger');
    } finally {
      hideLoader();
    }
  });

  // Rotate Page Click
  rotateBtn.addEventListener('click', async () => {
    const pageIdx = state.editor.pdfManager.currentPageIndex;
    commitDrawingCanvas();
    showLoader('Rotating page 90°...');
    
    try {
      const pdfBytes = await state.editor.pdfManager.saveDocument();
      const outPdf = await PDFDocument.load(pdfBytes);
      const page = outPdf.getPage(pageIdx);
      const currentRotation = page.getRotation().angle;
      page.setRotation(degrees((currentRotation + 90) % 360));
      
      const rotatedBytes = await outPdf.save();
      
      // Reload updated PDF directly into state manager
      await state.editor.pdfManager.loadPdf(rotatedBytes);
      await loadEditorPage(pageIdx);
      await generateEditorThumbnails();
      showToast('Page rotated 90° clockwise.', 'success');
    } catch (err) {
      console.error(err);
      showToast('Failed to rotate page.', 'danger');
    } finally {
      hideLoader();
    }
  });

  // Save changes
  saveBtn.addEventListener('click', async () => {
    commitDrawingCanvas();
    showLoader('Compiling and saving your PDF...');
    try {
      const pdfBytes = await state.editor.pdfManager.saveDocument();
      const blob = new Blob([pdfBytes], { type: 'application/pdf' });
      downloadBlob(blob, 'edited_document.pdf');
      showToast('PDF downloaded successfully!');
    } catch (err) {
      console.error(err);
      showToast('Failed to save document.', 'danger');
    } finally {
      hideLoader();
    }
  });

  // Metadata Save Button Click
  document.getElementById('meta-save-btn').addEventListener('click', () => {
    if (!state.editor.pdfManager || !state.editor.pdfManager.metadata) {
      showToast('No PDF document loaded.', 'danger');
      return;
    }
    
    state.editor.pdfManager.metadata.title = document.getElementById('meta-title-input').value.trim();
    state.editor.pdfManager.metadata.author = document.getElementById('meta-author-input').value.trim();
    state.editor.pdfManager.metadata.subject = document.getElementById('meta-subject-input').value.trim();
    state.editor.pdfManager.metadata.creator = document.getElementById('meta-creator-input').value.trim();
    state.editor.pdfManager.metadata.producer = document.getElementById('meta-producer-input').value.trim();
    
    showToast('Metadata updated locally! Download the PDF to save changes permanently.', 'success');
  });
}

window.updateTextInspector = (txtObj) => {
  document.getElementById('text-font').value = txtObj.fontFamily || "'Inter', sans-serif";
  document.getElementById('text-size').value = txtObj.size || 18;
  document.getElementById('text-color').value = txtObj.color || '#000000';
  
  const boldBtn = document.getElementById('text-bold-btn');
  const italicBtn = document.getElementById('text-italic-btn');
  
  if (txtObj.isBold) {
    boldBtn.classList.add('active');
    boldBtn.style.background = 'var(--bg-tertiary)';
    boldBtn.style.borderColor = 'var(--accent-purple)';
  } else {
    boldBtn.classList.remove('active');
    boldBtn.style.background = 'transparent';
    boldBtn.style.borderColor = 'var(--border-color)';
  }
  
  if (txtObj.isItalic) {
    italicBtn.classList.add('active');
    italicBtn.style.background = 'var(--bg-tertiary)';
    italicBtn.style.borderColor = 'var(--accent-purple)';
  } else {
    italicBtn.classList.remove('active');
    italicBtn.style.background = 'transparent';
    italicBtn.style.borderColor = 'var(--border-color)';
  }
};

function setEditorTool(tool) {
  state.editor.activeTool = tool;
  
  // Toggle Sidebars options panels
  document.getElementById('options-text-tool').classList.add('hidden');
  document.getElementById('options-draw-tool').classList.add('hidden');
  document.getElementById('options-erase-tool').classList.add('hidden');
  document.getElementById('options-shape-tool').classList.add('hidden');
  document.getElementById('options-stamp-tool').classList.add('hidden');
  document.getElementById('options-image-tool').classList.add('hidden');
  document.getElementById('options-metadata-panel').classList.add('hidden');
  
  if (tool === 'text') {
    document.getElementById('options-text-tool').classList.remove('hidden');
  } else if (tool === 'draw') {
    document.getElementById('options-draw-tool').classList.remove('hidden');
  } else if (tool === 'erase') {
    document.getElementById('options-erase-tool').classList.remove('hidden');
  } else if (tool === 'shape') {
    document.getElementById('options-shape-tool').classList.remove('hidden');
  } else if (tool === 'stamp') {
    document.getElementById('options-stamp-tool').classList.remove('hidden');
  } else if (tool === 'image') {
    document.getElementById('options-image-tool').classList.remove('hidden');
  } else if (tool === 'signature') {
    if (!state.editor.activeSignatureDataUrl) {
      openSignatureModal();
    } else {
      showToast('Signature/Image loaded. Click on the document to place it.', 'info');
    }
  } else {
    document.getElementById('options-metadata-panel').classList.remove('hidden');
  }
}

async function loadEditorPage(pageIndex) {
  const container = document.getElementById('active-page-container');
  showLoader('Rendering page...');
  
  // Commit current drawings before changing pages
  commitDrawingCanvas();
  
  const renderData = await state.editor.pdfManager.renderPageToContainer(pageIndex, container);
  if (!renderData) {
    hideLoader();
    return;
  }
  
  // Setup Freehand Drawing Layer
  setupDrawingLayer(renderData.drawingCanvas);
  
  // Click to insert elements (text/signature)
  renderData.annotationOverlay.addEventListener('click', (e) => {
    if (e.target !== renderData.annotationOverlay) return; // ignore clicks on elements inside
    
    const rect = renderData.annotationOverlay.getBoundingClientRect();
    const percentX = (e.clientX - rect.left) / rect.width;
    const percentY = (e.clientY - rect.top) / rect.height;
    
    if (state.editor.activeTool === 'text') {
      const sizeInput = document.getElementById('text-size');
      const colorInput = document.getElementById('text-color');
      const fontSelect = document.getElementById('text-font');
      const boldBtn = document.getElementById('text-bold-btn');
      const italicBtn = document.getElementById('text-italic-btn');
      
      const txtObj = {
        percentX,
        percentY,
        text: 'Click to edit text',
        size: parseInt(sizeInput.value, 10),
        color: colorInput.value,
        fontFamily: fontSelect.value,
        isBold: boldBtn.classList.contains('active'),
        isItalic: italicBtn.classList.contains('active'),
        overlayWidth: rect.width,
        overlayHeight: rect.height
      };
      
      state.editor.pdfManager.additions[pageIndex].text.push(txtObj);
      state.editor.pdfManager.renderTextElement(txtObj, renderData.annotationOverlay, pageIndex);
      
    } else if (state.editor.activeTool === 'signature') {
      if (!state.editor.activeSignatureDataUrl) {
        openSignatureModal();
        return;
      }
      
      const sigObj = {
        percentX,
        percentY,
        percentW: 0.25, // default width 25% of page
        percentH: 0.1,  // default height 10% of page
        dataUrl: state.editor.activeSignatureDataUrl
      };
      
      state.editor.pdfManager.additions[pageIndex].signatures.push(sigObj);
      state.editor.pdfManager.renderSignatureElement(sigObj, renderData.annotationOverlay, pageIndex);
      
      // Reset back to pan tool
      document.querySelector('[data-action="pan"]').click();
    }
  });

  // Highlighting active page thumbnail
  document.querySelectorAll('.thumbnail-wrapper').forEach((thumb, idx) => {
    if (idx === pageIndex) thumb.classList.add('active');
    else thumb.classList.remove('active');
  });
  
  hideLoader();
}

function setupDrawingLayer(canvas) {
  const ctx = canvas.getContext('2d');
  state.editor.drawingCanvasCtx = ctx;
  
  let isDragging = false;
  let startX = 0;
  let startY = 0;
  let savedImageData = null;

  const getPos = (e) => {
    const rect = canvas.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    return {
      x: (clientX - rect.left) * (canvas.width / rect.width),
      y: (clientY - rect.top) * (canvas.height / rect.height)
    };
  };

  const start = (e) => {
    const tool = state.editor.activeTool;
    if (tool !== 'draw' && tool !== 'erase' && tool !== 'shape' && tool !== 'stamp') return;
    
    isDragging = true;
    const pos = getPos(e);
    startX = pos.x;
    startY = pos.y;
    state.editor.lastDrawX = pos.x;
    state.editor.lastDrawY = pos.y;
    
    if (tool === 'shape') {
      savedImageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    } else if (tool === 'stamp') {
      drawStampOnCanvas(ctx, pos.x, pos.y);
      isDragging = false;
    }
  };

  const draw = (e) => {
    if (!isDragging) return;
    const tool = state.editor.activeTool;
    const pos = getPos(e);
    
    ctx.save();
    
    if (tool === 'draw') {
      ctx.globalCompositeOperation = 'source-over';
      const color = document.getElementById('draw-color').value;
      const width = document.getElementById('draw-width').value;
      const opacity = parseFloat(document.getElementById('draw-opacity').value) / 100;
      
      ctx.strokeStyle = color;
      ctx.lineWidth = width;
      ctx.globalAlpha = opacity;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      
      ctx.beginPath();
      ctx.moveTo(state.editor.lastDrawX, state.editor.lastDrawY);
      ctx.lineTo(pos.x, pos.y);
      ctx.stroke();
      
      state.editor.lastDrawX = pos.x;
      state.editor.lastDrawY = pos.y;
      
    } else if (tool === 'erase') {
      ctx.globalCompositeOperation = 'destination-out';
      const width = document.getElementById('erase-width').value;
      
      ctx.strokeStyle = 'rgba(0,0,0,1)';
      ctx.lineWidth = width;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      
      ctx.beginPath();
      ctx.moveTo(state.editor.lastDrawX, state.editor.lastDrawY);
      ctx.lineTo(pos.x, pos.y);
      ctx.stroke();
      
      state.editor.lastDrawX = pos.x;
      state.editor.lastDrawY = pos.y;
      
    } else if (tool === 'shape') {
      if (savedImageData) {
        ctx.putImageData(savedImageData, 0, 0);
      }
      
      const shapeType = document.getElementById('shape-type').value;
      const strokeWidth = document.getElementById('shape-stroke-width').value;
      const opacity = parseFloat(document.getElementById('shape-opacity').value) / 100;
      const strokeColor = document.getElementById('shape-stroke-color').value;
      const fillEnable = document.getElementById('shape-fill-enable').checked;
      const fillColor = document.getElementById('shape-fill-color').value;
      
      ctx.strokeStyle = strokeColor;
      ctx.lineWidth = strokeWidth;
      ctx.globalAlpha = opacity;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      
      if (shapeType === 'rect') {
        const w = pos.x - startX;
        const h = pos.y - startY;
        if (fillEnable) {
          ctx.fillStyle = fillColor;
          ctx.fillRect(startX, startY, w, h);
        }
        ctx.strokeRect(startX, startY, w, h);
        
      } else if (shapeType === 'circle') {
        const dx = pos.x - startX;
        const dy = pos.y - startY;
        const radius = Math.sqrt(dx * dx + dy * dy);
        
        ctx.beginPath();
        ctx.arc(startX, startY, radius, 0, Math.PI * 2);
        if (fillEnable) {
          ctx.fillStyle = fillColor;
          ctx.fill();
        }
        ctx.stroke();
        
      } else if (shapeType === 'line') {
        ctx.beginPath();
        ctx.moveTo(startX, startY);
        ctx.lineTo(pos.x, pos.y);
        ctx.stroke();
        
      } else if (shapeType === 'arrow') {
        ctx.beginPath();
        ctx.moveTo(startX, startY);
        ctx.lineTo(pos.x, pos.y);
        ctx.stroke();
        
        const angle = Math.atan2(pos.y - startY, pos.x - startX);
        const headLength = 15 + parseFloat(strokeWidth) * 2;
        
        ctx.beginPath();
        ctx.moveTo(pos.x, pos.y);
        ctx.lineTo(
          pos.x - headLength * Math.cos(angle - Math.PI / 6),
          pos.y - headLength * Math.sin(angle - Math.PI / 6)
        );
        ctx.moveTo(pos.x, pos.y);
        ctx.lineTo(
          pos.x - headLength * Math.cos(angle + Math.PI / 6),
          pos.y - headLength * Math.sin(angle + Math.PI / 6)
        );
        ctx.stroke();
      }
    }
    
    ctx.restore();
    e.preventDefault();
  };

  const stop = () => {
    isDragging = false;
    savedImageData = null;
  };

  canvas.addEventListener('mousedown', start);
  canvas.addEventListener('mousemove', draw);
  document.addEventListener('mouseup', stop);

  canvas.addEventListener('touchstart', start, { passive: false });
  canvas.addEventListener('touchmove', draw, { passive: false });
  document.addEventListener('touchend', stop);
}

function drawStampOnCanvas(ctx, x, y) {
  const stampType = document.getElementById('stamp-type').value;
  const size = parseFloat(document.getElementById('stamp-size').value);
  const opacity = parseFloat(document.getElementById('stamp-opacity').value) / 100;
  const color = document.getElementById('stamp-color').value;
  
  ctx.save();
  ctx.strokeStyle = color;
  ctx.fillStyle = color;
  ctx.lineWidth = Math.max(3, size / 8);
  ctx.globalAlpha = opacity;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  
  if (stampType === 'check') {
    ctx.beginPath();
    ctx.moveTo(x - size / 2, y + size / 10);
    ctx.lineTo(x - size / 10, y + size / 2);
    ctx.lineTo(x + size / 2, y - size / 2);
    ctx.stroke();
    
  } else if (stampType === 'cross') {
    ctx.beginPath();
    ctx.moveTo(x - size / 2, y - size / 2);
    ctx.lineTo(x + size / 2, y + size / 2);
    ctx.moveTo(x + size / 2, y - size / 2);
    ctx.lineTo(x - size / 2, y + size / 2);
    ctx.stroke();
    
  } else if (stampType === 'star') {
    ctx.beginPath();
    ctx.translate(x, y);
    ctx.rotate((180 * Math.PI) / 180);
    
    for (let i = 0; i < 5; i++) {
      ctx.lineTo(Math.sin((i * 72 * Math.PI) / 180) * (size / 2), Math.cos((i * 72 * Math.PI) / 180) * (size / 2));
      ctx.lineTo(Math.sin(((i * 72 + 36) * Math.PI) / 180) * (size / 4), Math.cos(((i * 72 + 36) * Math.PI) / 180) * (size / 4));
    }
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    
  } else if (stampType === 'arrow') {
    ctx.beginPath();
    ctx.moveTo(x - size / 2, y);
    ctx.lineTo(x + size / 2, y);
    ctx.stroke();
    
    ctx.beginPath();
    ctx.moveTo(x + size / 2, y);
    ctx.lineTo(x + size / 2 - size / 3, y - size / 4);
    ctx.moveTo(x + size / 2, y);
    ctx.lineTo(x + size / 2 - size / 3, y + size / 4);
    ctx.stroke();
  }
  
  ctx.restore();
}

// Commits the canvas drawing layers to base64 Data URLs so they persist when swapping pages
function commitDrawingCanvas() {
  const canvas = document.querySelector('.drawing-canvas');
  if (!canvas) return;
  
  // Check if anything is drawn
  const ctx = canvas.getContext('2d');
  const buffer = new Uint32Array(ctx.getImageData(0, 0, canvas.width, canvas.height).data.buffer);
  const isEmpty = !buffer.some(color => color !== 0);
  
  const pageIndex = state.editor.pdfManager.currentPageIndex;
  if (!isEmpty) {
    state.editor.pdfManager.additions[pageIndex].drawingBlob = canvas.toDataURL('image/png');
  } else {
    state.editor.pdfManager.additions[pageIndex].drawingBlob = null;
  }
}

async function generateEditorThumbnails() {
  const container = document.getElementById('editor-thumbnails');
  container.innerHTML = '';
  
  const pdfJs = state.editor.pdfManager.pdfJsDoc;
  
  for (let i = 0; i < pdfJs.numPages; i++) {
    const page = await pdfJs.getPage(i + 1);
    const viewport = page.getViewport({ scale: 0.25 });
    
    const wrapper = document.createElement('div');
    wrapper.className = 'thumbnail-wrapper';
    wrapper.dataset.index = i;
    
    const canvas = document.createElement('canvas');
    canvas.width = viewport.width;
    canvas.height = viewport.height;
    const ctx = canvas.getContext('2d');
    
    wrapper.appendChild(canvas);
    
    const numLabel = document.createElement('span');
    numLabel.className = 'page-number';
    numLabel.textContent = i + 1;
    wrapper.appendChild(numLabel);
    
    container.appendChild(wrapper);
    
    // Draw page thumbnail
    await page.render({ canvasContext: ctx, viewport }).promise;
    
    // Page click listener
    wrapper.addEventListener('click', () => {
      loadEditorPage(i);
    });
  }
}

// -------------------------------------------------------------
// 2. MERGE PDF COMPONENT
// -------------------------------------------------------------
function setupMergeWorkspace() {
  const uploadZone = document.getElementById('merge-upload-zone');
  const fileInput = document.getElementById('merge-file-input');
  const submitBtn = document.getElementById('merge-submit-btn');
  const addMoreBtn = document.getElementById('merge-add-more-btn');
  
  uploadZone.addEventListener('click', () => fileInput.click());
  fileInput.addEventListener('change', handleMergeFilesSelect);
  addMoreBtn.addEventListener('click', () => fileInput.click());
  
  setupDragAndDrop(uploadZone, (files) => {
    handleMergeFiles(Array.from(files));
  });

  submitBtn.addEventListener('click', async () => {
    if (state.merge.pages.length === 0) {
      showToast('No pages loaded to merge.', 'danger');
      return;
    }
    
    showLoader('Merging selected pages...');
    try {
      // 1. Preload all unique PDF documents into memory (caches buffers to prevent reloading the same file)
      const loadedDocs = {};
      const uniqueFileIndices = [...new Set(state.merge.pages.map(p => p.fileIndex))];
      
      for (const idx of uniqueFileIndices) {
        const file = state.merge.files[idx];
        const buffer = await file.arrayBuffer();
        const { PDFDocument: LibPDF } = await import('pdf-lib'); // lazy load pdf-lib helper if needed or reuse import
        loadedDocs[idx] = await LibPDF.load(buffer);
      }
      
      // 2. Create new merged PDF document
      const { PDFDocument: LibPDF } = await import('pdf-lib');
      const mergedPdf = await LibPDF.create();
      
      // 3. Copy and add pages one-by-one in user-specified order
      for (const pageEntry of state.merge.pages) {
        const srcDoc = loadedDocs[pageEntry.fileIndex];
        const [copiedPage] = await mergedPdf.copyPages(srcDoc, [pageEntry.pageIndex]);
        mergedPdf.addPage(copiedPage);
      }
      
      const mergedBytes = await mergedPdf.save();
      const blob = new Blob([mergedBytes], { type: 'application/pdf' });
      downloadBlob(blob, 'merged_document.pdf');
      showToast('PDF pages merged successfully!');
    } catch (err) {
      console.error(err);
      showToast('Failed to merge pages.', 'danger');
    } finally {
      hideLoader();
    }
  });
}

function handleMergeFilesSelect(e) {
  handleMergeFiles(Array.from(e.target.files));
}

async function handleMergeFiles(files) {
  const filtered = files.filter(f => f.type === 'application/pdf' || f.name.endsWith('.pdf'));
  if (filtered.length === 0) {
    showToast('Invalid files. Please upload PDF files.', 'danger');
    return;
  }
  
  showLoader('Reading pages from files...');
  try {
    for (const file of filtered) {
      state.merge.files.push(file);
      const fileIdx = state.merge.files.length - 1;
      
      const buffer = await file.arrayBuffer();
      const pdfJs = await pdfjsLib.getDocument({ data: new Uint8Array(buffer) }).promise;
      
      // Extract every page in the PDF as a separate merge entry
      for (let i = 0; i < pdfJs.numPages; i++) {
        const pageEntry = {
          id: `file_${fileIdx}_page_${i}_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
          file: file,
          fileIndex: fileIdx,
          pageIndex: i,
          originalFileName: file.name
        };
        state.merge.pages.push(pageEntry);
      }
    }
    
    document.getElementById('merge-upload-zone').classList.add('hidden');
    document.getElementById('merge-files-container').classList.remove('hidden');
    
    await renderMergePagesGrid();
    showToast('PDF pages loaded for merging!');
  } catch (err) {
    console.error(err);
    showToast('Failed to load PDF pages.', 'danger');
  } finally {
    hideLoader();
  }
}

async function renderMergePagesGrid() {
  const grid = document.getElementById('merge-grid');
  grid.innerHTML = '';
  
  const summaryText = document.getElementById('merge-summary-text');
  summaryText.textContent = `${state.merge.files.length} files loaded - ${state.merge.pages.length} pages total`;
  
  if (state.merge.pages.length === 0) {
    document.getElementById('merge-upload-zone').classList.remove('hidden');
    document.getElementById('merge-files-container').classList.add('hidden');
    return;
  }
  
  // Render thumbnails
  for (let idx = 0; idx < state.merge.pages.length; idx++) {
    const pageEntry = state.merge.pages[idx];
    
    // Load page from file using pdf.js
    const buffer = await pageEntry.file.arrayBuffer();
    const pdfJs = await pdfjsLib.getDocument({ data: new Uint8Array(buffer.slice(0)) }).promise;
    const page = await pdfJs.getPage(pageEntry.pageIndex + 1);
    const viewport = page.getViewport({ scale: 0.25 });
    
    const div = document.createElement('div');
    div.className = 'organize-item';
    div.dataset.id = pageEntry.id;
    div.draggable = true;
    
    const canvas = document.createElement('canvas');
    canvas.width = viewport.width;
    canvas.height = viewport.height;
    const ctx = canvas.getContext('2d');
    await page.render({ canvasContext: ctx, viewport }).promise;
    div.appendChild(canvas);
    
    const label = document.createElement('span');
    label.className = 'organize-label';
    label.style.fontSize = '0.75rem';
    label.style.textAlign = 'center';
    label.style.maxWidth = '100%';
    label.style.overflow = 'hidden';
    label.style.textOverflow = 'ellipsis';
    label.style.whiteSpace = 'nowrap';
    label.textContent = `${pageEntry.originalFileName.substring(0, 15)}... (P. ${pageEntry.pageIndex + 1})`;
    div.appendChild(label);
    
    const actions = document.createElement('div');
    actions.className = 'organize-item-actions';
    actions.innerHTML = `
      <button class="organize-btn delete" title="Exclude from merge"><i data-lucide="trash-2"></i></button>
    `;
    div.appendChild(actions);
    
    // Exclude page action
    actions.querySelector('.delete').addEventListener('click', (e) => {
      e.stopPropagation();
      div.remove();
      state.merge.pages = state.merge.pages.filter(p => p.id !== pageEntry.id);
      renderMergePagesGrid();
    });
    
    grid.appendChild(div);
  }
  
  lucide.createIcons();
  setupMergeGridSorting();
}

function setupMergeGridSorting() {
  const grid = document.getElementById('merge-grid');
  let dragItem = null;
  
  grid.addEventListener('dragstart', (e) => {
    const item = e.target.closest('.organize-item');
    if (item) {
      dragItem = item;
      item.classList.add('dragging');
    }
  });
  
  grid.addEventListener('dragend', () => {
    if (dragItem) {
      dragItem.classList.remove('dragging');
      dragItem = null;
      reorderMergePages();
    }
  });
  
  grid.addEventListener('dragover', (e) => {
    e.preventDefault();
    const afterElement = getDragAfterElement(grid, e.clientX, e.clientY);
    if (afterElement == null) {
      grid.appendChild(dragItem);
    } else {
      grid.insertBefore(dragItem, afterElement);
    }
  });

  // Touch Support (Mobile)
  grid.addEventListener('touchstart', (e) => {
    const item = e.target.closest('.organize-item');
    if (item) {
      if (e.target.closest('.organize-item-actions')) return;
      dragItem = item;
      item.classList.add('dragging');
    }
  }, { passive: true });

  grid.addEventListener('touchmove', (e) => {
    if (!dragItem) return;
    const touch = e.touches[0];
    const elementUnderFinger = document.elementFromPoint(touch.clientX, touch.clientY);
    if (!elementUnderFinger) return;
    
    const targetItem = elementUnderFinger.closest('.organize-item');
    if (targetItem && targetItem !== dragItem && targetItem.parentNode === grid) {
      const box = targetItem.getBoundingClientRect();
      const next = (touch.clientY - box.top) > (box.height / 2) || (touch.clientX - box.left) > (box.width / 2);
      grid.insertBefore(dragItem, next ? targetItem.nextSibling : targetItem);
    }
    
    if (e.cancelable) e.preventDefault();
  }, { passive: false });

  grid.addEventListener('touchend', () => {
    if (dragItem) {
      dragItem.classList.remove('dragging');
      dragItem = null;
      reorderMergePages();
    }
  });
}

function reorderMergePages() {
  const newPages = [];
  document.querySelectorAll('#merge-grid .organize-item').forEach(item => {
    const id = item.dataset.id;
    const pageState = state.merge.pages.find(p => p.id === id);
    if (pageState) newPages.push(pageState);
  });
  state.merge.pages = newPages;
  
  const summaryText = document.getElementById('merge-summary-text');
  summaryText.textContent = `${state.merge.files.length} files loaded - ${state.merge.pages.length} pages total`;
}

// -------------------------------------------------------------
// 3. SPLIT PDF COMPONENT
// -------------------------------------------------------------
function setupSplitWorkspace() {
  const uploadZone = document.getElementById('split-upload-zone');
  const fileInput = document.getElementById('split-file-input');
  const singleBtn = document.getElementById('split-single-btn');
  const rangeBtn = document.getElementById('split-range-btn');
  
  uploadZone.addEventListener('click', () => fileInput.click());
  fileInput.addEventListener('change', async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    handleSplitFile(file);
  });
  
  setupDragAndDrop(uploadZone, handleSplitFile);

  // 1. Separate Pages Button (comma-separated list of individual pages)
  singleBtn.addEventListener('click', async () => {
    const input = document.getElementById('split-single-pages').value.trim();
    if (!input) {
      showToast('Please enter page numbers to extract.', 'danger');
      return;
    }
    
    showLoader('Extracting separate pages...');
    try {
      const buffer = await state.split.file.arrayBuffer();
      const parsedPages = [];
      const parts = input.split(',');
      
      for (const part of parts) {
        const pageNum = parseInt(part.trim(), 10);
        if (!isNaN(pageNum) && pageNum >= 1 && pageNum <= state.split.pageCount) {
          parsedPages.push([pageNum - 1]); // 0-based page list for each document
        }
      }
      
      if (parsedPages.length === 0) {
        showToast('No valid page numbers found.', 'danger');
        hideLoader();
        return;
      }
      
      const results = await splitPdf(buffer, parsedPages);
      
      // Download files individually
      results.forEach((pdfBytes, idx) => {
        const pageLabel = parsedPages[idx][0] + 1;
        const blob = new Blob([pdfBytes], { type: 'application/pdf' });
        downloadBlob(blob, `page_${pageLabel}.pdf`);
      });
      
      showToast('Pages extracted individually!');
    } catch (err) {
      console.error(err);
      showToast('Failed to extract pages.', 'danger');
    } finally {
      hideLoader();
    }
  });

  // 2. Range Merged Button (hyphenated range like 2-4)
  rangeBtn.addEventListener('click', async () => {
    const input = document.getElementById('split-range-pages').value.trim();
    if (!input) {
      showToast('Please specify a page range (e.g. 2-4).', 'danger');
      return;
    }
    
    showLoader('Extracting range and merging...');
    try {
      const buffer = await state.split.file.arrayBuffer();
      const parts = input.split('-');
      if (parts.length !== 2) {
        showToast('Invalid range format. Use e.g. 2-4', 'danger');
        hideLoader();
        return;
      }
      
      const start = parseInt(parts[0].trim(), 10);
      const end = parseInt(parts[1].trim(), 10);
      
      if (isNaN(start) || isNaN(end)) {
        showToast('Invalid range numbers.', 'danger');
        hideLoader();
        return;
      }
      
      const min = Math.min(start, end);
      const max = Math.max(start, end);
      
      const pageIndices = [];
      for (let i = min; i <= max; i++) {
        if (i >= 1 && i <= state.split.pageCount) {
          pageIndices.push(i - 1);
        }
      }
      
      if (pageIndices.length === 0) {
        showToast('Range is out of document bounds.', 'danger');
        hideLoader();
        return;
      }
      
      const results = await splitPdf(buffer, [pageIndices]);
      const blob = new Blob([results[0]], { type: 'application/pdf' });
      downloadBlob(blob, `extracted_range_${min}-${max}.pdf`);
      
      showToast('Page range extracted and merged successfully!');
    } catch (err) {
      console.error(err);
      showToast('Failed to split range.', 'danger');
    } finally {
      hideLoader();
    }
  });
}

async function handleSplitFile(file) {
  if (file.type !== 'application/pdf' && !file.name.endsWith('.pdf')) {
    showToast('Please upload a PDF file.', 'danger');
    return;
  }
  
  state.split.file = file;
  
  showLoader('Reading pages...');
  try {
    const buffer = await file.arrayBuffer();
    const pdfJs = await pdfjsLib.getDocument({ data: new Uint8Array(buffer) }).promise;
    state.split.pageCount = pdfJs.numPages;
    
    document.getElementById('split-filename').textContent = file.name;
    document.getElementById('split-pagecount').textContent = `Total Pages: ${pdfJs.numPages}`;
    
    document.getElementById('split-upload-zone').classList.add('hidden');
    document.getElementById('split-setup-container').classList.remove('hidden');
    
    // Generate split preview thumbnails
    const sidebar = document.getElementById('split-preview-sidebar');
    sidebar.innerHTML = '';
    
    for (let i = 1; i <= pdfJs.numPages; i++) {
      const page = await pdfJs.getPage(i);
      const viewport = page.getViewport({ scale: 0.2 });
      
      const div = document.createElement('div');
      div.className = 'split-page-thumb';
      
      const canvas = document.createElement('canvas');
      canvas.width = viewport.width;
      canvas.height = viewport.height;
      const ctx = canvas.getContext('2d');
      await page.render({ canvasContext: ctx, viewport }).promise;
      
      div.appendChild(canvas);
      
      const span = document.createElement('span');
      span.className = 'page-label';
      span.textContent = `Page ${i}`;
      div.appendChild(span);
      
      sidebar.appendChild(div);
    }
  } catch (err) {
    console.error(err);
    showToast('Failed to read PDF pages.', 'danger');
  } finally {
    hideLoader();
  }
}

// -------------------------------------------------------------
// 4. ORGANIZE PDF COMPONENT
// -------------------------------------------------------------
function setupOrganizeWorkspace() {
  const uploadZone = document.getElementById('organize-upload-zone');
  const fileInput = document.getElementById('organize-file-input');
  const submitBtn = document.getElementById('organize-submit-btn');
  
  uploadZone.addEventListener('click', () => fileInput.click());
  fileInput.addEventListener('change', async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    handleOrganizeFile(file);
  });
  
  setupDragAndDrop(uploadZone, handleOrganizeFile);

  submitBtn.addEventListener('click', async () => {
    if (state.organize.pages.length === 0) {
      showToast('No pages left to download.', 'danger');
      return;
    }
    
    showLoader('Saving organized PDF...');
    try {
      const buffer = await state.organize.file.arrayBuffer();
      const pageActions = state.organize.pages.map(p => ({
        index: p.originalIndex,
        rotation: p.rotation
      }));
      
      const outputBytes = await organizePdfPages(buffer, pageActions);
      const blob = new Blob([outputBytes], { type: 'application/pdf' });
      downloadBlob(blob, 'organized_document.pdf');
      showToast('Document saved successfully!');
    } catch (err) {
      console.error(err);
      showToast('Failed to organize pages.', 'danger');
    } finally {
      hideLoader();
    }
  });
}

async function handleOrganizeFile(file) {
  if (file.type !== 'application/pdf' && !file.name.endsWith('.pdf')) {
    showToast('Please upload a PDF file.', 'danger');
    return;
  }
  
  state.organize.file = file;
  state.organize.pages = [];
  
  showLoader('Loading grid pages...');
  try {
    const buffer = await file.arrayBuffer();
    const pdfJs = await pdfjsLib.getDocument({ data: new Uint8Array(buffer) }).promise;
    
    document.getElementById('organize-upload-zone').classList.add('hidden');
    document.getElementById('organize-workspace').classList.remove('hidden');
    document.getElementById('organize-file-info').textContent = `${file.name} - ${pdfJs.numPages} pages`;
    
    const grid = document.getElementById('organize-grid');
    grid.innerHTML = '';
    
    for (let i = 0; i < pdfJs.numPages; i++) {
      const pageState = {
        index: i,
        originalIndex: i,
        rotation: 0
      };
      state.organize.pages.push(pageState);
      
      const page = await pdfJs.getPage(i + 1);
      const viewport = page.getViewport({ scale: 0.25 });
      
      const div = document.createElement('div');
      div.className = 'organize-item';
      div.dataset.index = i;
      div.draggable = true;
      
      const canvas = document.createElement('canvas');
      canvas.width = viewport.width;
      canvas.height = viewport.height;
      const ctx = canvas.getContext('2d');
      await page.render({ canvasContext: ctx, viewport }).promise;
      div.appendChild(canvas);
      
      const label = document.createElement('span');
      label.className = 'organize-label';
      label.textContent = `Page ${i + 1}`;
      div.appendChild(label);
      
      const actions = document.createElement('div');
      actions.className = 'organize-item-actions';
      actions.innerHTML = `
        <button class="organize-btn rotate" title="Rotate"><i data-lucide="rotate-cw"></i></button>
        <button class="organize-btn delete" title="Delete"><i data-lucide="trash-2"></i></button>
      `;
      div.appendChild(actions);
      
      // Rotation actions
      actions.querySelector('.rotate').addEventListener('click', (e) => {
        e.stopPropagation();
        pageState.rotation = (pageState.rotation + 90) % 360;
        canvas.style.transform = `rotate(${pageState.rotation}deg)`;
      });

      // Delete action
      actions.querySelector('.delete').addEventListener('click', (e) => {
        e.stopPropagation();
        div.remove();
        state.organize.pages = state.organize.pages.filter(p => p !== pageState);
        updateOrganizeLabels();
      });
      
      grid.appendChild(div);
    }
    
    lucide.createIcons();
    setupOrganizeSorting();
  } catch (err) {
    console.error(err);
    showToast('Failed to display page grid.', 'danger');
  } finally {
    hideLoader();
  }
}

function updateOrganizeLabels() {
  const gridItems = document.querySelectorAll('.organize-item');
  gridItems.forEach((item, newIdx) => {
    item.querySelector('.organize-label').textContent = `Page ${newIdx + 1}`;
  });
  
  document.getElementById('organize-file-info').textContent = `${state.organize.file.name} - ${state.organize.pages.length} pages`;
}

function setupOrganizeSorting() {
  const grid = document.getElementById('organize-grid');
  let dragItem = null;
  
  grid.addEventListener('dragstart', (e) => {
    const item = e.target.closest('.organize-item');
    if (item) {
      dragItem = item;
      item.classList.add('dragging');
    }
  });
  
  grid.addEventListener('dragend', () => {
    if (dragItem) {
      dragItem.classList.remove('dragging');
      dragItem = null;
      reorderStatePages();
      updateOrganizeLabels();
    }
  });
  
  grid.addEventListener('dragover', (e) => {
    e.preventDefault();
    const afterElement = getDragAfterElement(grid, e.clientX, e.clientY);
    if (afterElement == null) {
      grid.appendChild(dragItem);
    } else {
      grid.insertBefore(dragItem, afterElement);
    }
  });

  // Touch Support (Mobile)
  grid.addEventListener('touchstart', (e) => {
    const item = e.target.closest('.organize-item');
    if (item) {
      if (e.target.closest('.organize-item-actions')) return;
      dragItem = item;
      item.classList.add('dragging');
    }
  }, { passive: true });

  grid.addEventListener('touchmove', (e) => {
    if (!dragItem) return;
    const touch = e.touches[0];
    const elementUnderFinger = document.elementFromPoint(touch.clientX, touch.clientY);
    if (!elementUnderFinger) return;
    
    const targetItem = elementUnderFinger.closest('.organize-item');
    if (targetItem && targetItem !== dragItem && targetItem.parentNode === grid) {
      const box = targetItem.getBoundingClientRect();
      const next = (touch.clientY - box.top) > (box.height / 2) || (touch.clientX - box.left) > (box.width / 2);
      grid.insertBefore(dragItem, next ? targetItem.nextSibling : targetItem);
    }
    
    if (e.cancelable) e.preventDefault();
  }, { passive: false });

  grid.addEventListener('touchend', () => {
    if (dragItem) {
      dragItem.classList.remove('dragging');
      dragItem = null;
      reorderStatePages();
      updateOrganizeLabels();
    }
  });
}

function reorderStatePages() {
  const newPages = [];
  document.querySelectorAll('.organize-item').forEach(item => {
    const index = parseInt(item.dataset.index, 10);
    const pageState = state.organize.pages.find(p => p.index === index);
    if (pageState) newPages.push(pageState);
  });
  state.organize.pages = newPages;
}

function getDragAfterElement(container, x, y) {
  const draggableElements = [...container.querySelectorAll('.organize-item:not(.dragging)')];
  
  return draggableElements.reduce((closest, child) => {
    const box = child.getBoundingClientRect();
    const offsetX = x - box.left - box.width / 2;
    const offsetY = y - box.top - box.height / 2;
    const offset = Math.sqrt(offsetX * offsetX + offsetY * offsetY);
    
    if (offset < closest.offset) {
      return { offset: offset, element: child };
    } else {
      return closest;
    }
  }, { offset: Number.POSITIVE_INFINITY }).element;
}

// -------------------------------------------------------------
// 5. IMAGES TO PDF COMPONENT
// -------------------------------------------------------------
function setupJpgToPdfWorkspace() {
  const uploadZone = document.getElementById('jpg-to-pdf-upload-zone');
  const fileInput = document.getElementById('jpg-to-pdf-file-input');
  const addMoreBtn = document.getElementById('jpg-add-more-btn');
  const submitBtn = document.getElementById('jpg-submit-btn');
  
  uploadZone.addEventListener('click', () => fileInput.click());
  fileInput.addEventListener('change', handleJpgFilesSelect);
  addMoreBtn.addEventListener('click', () => fileInput.click());
  
  setupDragAndDrop(uploadZone, (files) => {
    handleJpgFiles(Array.from(files));
  });

  submitBtn.addEventListener('click', async () => {
    if (state.jpgToPdf.files.length === 0) {
      showToast('Please upload at least 1 image.', 'danger');
      return;
    }
    
    const pageSize = document.getElementById('jpg-page-size').value;
    const orientation = document.getElementById('jpg-orientation').value;
    const margin = document.getElementById('jpg-margin').value;
    
    showLoader('Converting images to PDF...');
    try {
      const pdfBytes = await convertImagesToPdf(state.jpgToPdf.files, { pageSize, orientation, margin });
      const blob = new Blob([pdfBytes], { type: 'application/pdf' });
      downloadBlob(blob, 'converted_images.pdf');
      showToast('Conversion completed!');
    } catch (err) {
      console.error(err);
      showToast('Failed to convert images.', 'danger');
    } finally {
      hideLoader();
    }
  });
}

function handleJpgFilesSelect(e) {
  handleJpgFiles(Array.from(e.target.files));
}

function handleJpgFiles(files) {
  const filtered = files.filter(f => f.type.startsWith('image/'));
  if (filtered.length === 0) {
    showToast('Invalid files. Please upload images.', 'danger');
    return;
  }
  
  state.jpgToPdf.files = [...state.jpgToPdf.files, ...filtered];
  
  document.getElementById('jpg-to-pdf-upload-zone').classList.add('hidden');
  document.getElementById('jpg-to-pdf-container').classList.remove('hidden');
  
  renderJpgFilesList();
}

function renderJpgFilesList() {
  const list = document.getElementById('jpg-to-pdf-list');
  list.innerHTML = '';
  
  state.jpgToPdf.files.forEach((file, index) => {
    const li = document.createElement('li');
    li.className = 'file-item';
    li.innerHTML = `
      <div class="file-info-block">
        <i data-lucide="image" class="file-icon"></i>
        <span class="file-name" title="${file.name}">${file.name}</span>
        <span class="file-size">(${(file.size / 1024).toFixed(1)} KB)</span>
      </div>
      <div class="file-actions-block">
        <button class="btn btn-secondary btn-icon mini" onclick="moveJpgItem(${index}, -1)"><i data-lucide="arrow-up"></i></button>
        <button class="btn btn-secondary btn-icon mini" onclick="moveJpgItem(${index}, 1)"><i data-lucide="arrow-down"></i></button>
        <button class="btn btn-danger btn-icon mini" onclick="removeJpgItem(${index})"><i data-lucide="trash-2"></i></button>
      </div>
    `;
    list.appendChild(li);
  });
  
  lucide.createIcons();
}

window.moveJpgItem = (index, direction) => {
  const newIdx = index + direction;
  if (newIdx < 0 || newIdx >= state.jpgToPdf.files.length) return;
  const temp = state.jpgToPdf.files[index];
  state.jpgToPdf.files[index] = state.jpgToPdf.files[newIdx];
  state.jpgToPdf.files[newIdx] = temp;
  renderJpgFilesList();
};

window.removeJpgItem = (index) => {
  state.jpgToPdf.files.splice(index, 1);
  if (state.jpgToPdf.files.length === 0) {
    document.getElementById('jpg-to-pdf-upload-zone').classList.remove('hidden');
    document.getElementById('jpg-to-pdf-container').classList.add('hidden');
  } else {
    renderJpgFilesList();
  }
};

// -------------------------------------------------------------
// 6. PDF TO JPG COMPONENT
// -------------------------------------------------------------
function setupPdfToJpgWorkspace() {
  const uploadZone = document.getElementById('pdf-to-jpg-upload-zone');
  const fileInput = document.getElementById('pdf-to-jpg-file-input');
  const submitBtn = document.getElementById('pdf-to-jpg-submit-btn');
  
  uploadZone.addEventListener('click', () => fileInput.click());
  fileInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) handlePdfToJpgFile(file);
  });
  
  setupDragAndDrop(uploadZone, handlePdfToJpgFile);

  submitBtn.addEventListener('click', async () => {
    const format = document.getElementById('pdf-to-jpg-format').value;
    const scale = parseFloat(document.getElementById('pdf-to-jpg-scale').value);
    
    showLoader('Rendering images and building ZIP archive...');
    try {
      const zipBlob = await convertPdfToImages(state.pdfToJpg.file, format, scale);
      downloadBlob(zipBlob, 'extracted_pdf_images.zip');
      showToast('Images converted and downloaded!');
    } catch (err) {
      console.error(err);
      showToast('Failed to convert pages to images.', 'danger');
    } finally {
      hideLoader();
    }
  });
}

async function handlePdfToJpgFile(file) {
  if (file.type !== 'application/pdf' && !file.name.endsWith('.pdf')) {
    showToast('Please upload a PDF file.', 'danger');
    return;
  }
  
  state.pdfToJpg.file = file;
  
  showLoader('Analyzing PDF page count...');
  try {
    const buffer = await file.arrayBuffer();
    const pdfJs = await pdfjsLib.getDocument({ data: new Uint8Array(buffer) }).promise;
    state.pdfToJpg.pageCount = pdfJs.numPages;
    
    document.getElementById('pdf-to-jpg-filename').textContent = file.name;
    document.getElementById('pdf-to-jpg-pagecount').textContent = `Total Pages: ${pdfJs.numPages}`;
    
    document.getElementById('pdf-to-jpg-upload-zone').classList.add('hidden');
    document.getElementById('pdf-to-jpg-setup').classList.remove('hidden');
  } catch (err) {
    console.error(err);
    showToast('Failed to load PDF info.', 'danger');
  } finally {
    hideLoader();
  }
}

// -------------------------------------------------------------
// 7. WORD TO PDF COMPONENT
// -------------------------------------------------------------
function setupWordToPdfWorkspace() {
  const uploadZone = document.getElementById('word-upload-zone');
  const fileInput = document.getElementById('word-file-input');
  const submitBtn = document.getElementById('word-submit-btn');
  
  uploadZone.addEventListener('click', () => fileInput.click());
  fileInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) handleWordFile(file);
  });
  
  setupDragAndDrop(uploadZone, handleWordFile);

  submitBtn.addEventListener('click', async () => {
    showLoader('Parsing Word layout and compiling PDF...');
    try {
      const pdfBytes = await convertWordToPdf(state.wordToPdf.file);
      const blob = new Blob([pdfBytes], { type: 'application/pdf' });
      downloadBlob(blob, state.wordToPdf.file.name.replace(/\.docx$/i, '.pdf'));
      showToast('Word file converted successfully!');
    } catch (err) {
      console.error(err);
      showToast('Conversion failed. Note: Complex nested layouts might fail.', 'danger');
    } finally {
      hideLoader();
    }
  });
}

function handleWordFile(file) {
  if (!file.name.endsWith('.docx')) {
    showToast('Please upload a Microsoft Word document (.docx).', 'danger');
    return;
  }
  state.wordToPdf.file = file;
  document.getElementById('word-filename').textContent = file.name;
  document.getElementById('word-filesize').textContent = `Size: ${(file.size / 1024).toFixed(1)} KB`;
  
  document.getElementById('word-upload-zone').classList.add('hidden');
  document.getElementById('word-setup-container').classList.remove('hidden');
}

// -------------------------------------------------------------
// 8. EXCEL TO PDF COMPONENT
// -------------------------------------------------------------
function setupExcelToPdfWorkspace() {
  const uploadZone = document.getElementById('excel-upload-zone');
  const fileInput = document.getElementById('excel-file-input');
  const submitBtn = document.getElementById('excel-submit-btn');
  
  uploadZone.addEventListener('click', () => fileInput.click());
  fileInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) handleExcelFile(file);
  });
  
  setupDragAndDrop(uploadZone, handleExcelFile);

  submitBtn.addEventListener('click', async () => {
    showLoader('Parsing spreadsheet worksheets and rendering tables...');
    try {
      const pdfBytes = await convertExcelToPdf(state.excelToPdf.file);
      const blob = new Blob([pdfBytes], { type: 'application/pdf' });
      downloadBlob(blob, state.excelToPdf.file.name.replace(/\.(xlsx|xls)$/i, '.pdf'));
      showToast('Excel spreadsheet converted successfully!');
    } catch (err) {
      console.error(err);
      showToast('Excel conversion failed.', 'danger');
    } finally {
      hideLoader();
    }
  });
}

function handleExcelFile(file) {
  if (!file.name.endsWith('.xlsx') && !file.name.endsWith('.xls')) {
    showToast('Please upload an Excel spreadsheet (.xlsx, .xls).', 'danger');
    return;
  }
  state.excelToPdf.file = file;
  document.getElementById('excel-filename').textContent = file.name;
  document.getElementById('excel-filesize').textContent = `Size: ${(file.size / 1024).toFixed(1)} KB`;
  
  document.getElementById('excel-upload-zone').classList.add('hidden');
  document.getElementById('excel-setup-container').classList.remove('hidden');
}

// -------------------------------------------------------------
// SIGNATURE PAD CAPTURE MODAL
// -------------------------------------------------------------
function setupSignatureModal() {
  const modal = document.getElementById('signature-modal');
  const canvas = document.getElementById('signature-canvas');
  const closeBtn = document.getElementById('signature-close-btn');
  const clearBtn = document.getElementById('signature-clear-btn');
  const saveBtn = document.getElementById('signature-save-btn');
  
  // Tab Elements
  const tabs = document.querySelectorAll('.sig-tab');
  const contents = document.querySelectorAll('.sig-tab-content');
  
  // Type Elements
  const typeInput = document.getElementById('sig-type-input');
  const typeFont = document.getElementById('sig-type-font');
  const typePreview = document.getElementById('sig-type-preview');
  
  // Upload Elements
  const uploadZone = document.getElementById('sig-upload-zone');
  const fileInput = document.getElementById('sig-file-input');
  const imgPreviewContainer = document.getElementById('sig-image-preview-container');
  const imgPreview = document.getElementById('sig-image-preview');
  
  signaturePadInstance = new SignaturePad(canvas);
  state.uploadedSignatureDataUrl = null;
  
  // Tab Switching
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => {
        t.classList.remove('active');
        t.style.background = 'transparent';
      });
      tab.classList.add('active');
      tab.style.background = 'var(--bg-tertiary)';
      
      const activeTab = tab.dataset.tab;
      contents.forEach(content => {
        if (content.id === `sig-content-${activeTab}`) {
          content.classList.remove('hidden');
        } else {
          content.classList.add('hidden');
        }
      });
    });
  });
  
  // Type Tab Syncing
  const syncTypePreview = () => {
    const text = typeInput.value.trim() || 'Your Name';
    const font = typeFont.value;
    typePreview.textContent = text;
    typePreview.style.fontFamily = font;
  };
  typeInput.addEventListener('input', syncTypePreview);
  typeFont.addEventListener('change', syncTypePreview);
  
  // Upload Tab Binding
  uploadZone.addEventListener('click', () => fileInput.click());
  fileInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) handleSignatureImageFile(file);
  });
  
  // Clipboard Paste Support (Ctrl+V)
  document.addEventListener('paste', (e) => {
    if (modal.classList.contains('hidden')) return;
    const activeTabEl = document.querySelector('.sig-tab.active');
    if (!activeTabEl || activeTabEl.dataset.tab !== 'upload') return;
    
    const items = (e.clipboardData || window.clipboardData).items;
    for (const item of items) {
      if (item.type.indexOf('image') === 0) {
        const file = item.getAsFile();
        handleSignatureImageFile(file);
        showToast('Image pasted from clipboard!', 'success');
        break;
      }
    }
  });
  
  // Handle image conversion to DataURL
  function handleSignatureImageFile(file) {
    const reader = new FileReader();
    reader.onload = (evt) => {
      imgPreview.src = evt.target.result;
      imgPreviewContainer.classList.remove('hidden');
      state.uploadedSignatureDataUrl = evt.target.result;
    };
    reader.readAsDataURL(file);
  }
  
  closeBtn.addEventListener('click', closeSignatureModal);
  
  clearBtn.addEventListener('click', () => {
    const activeTab = document.querySelector('.sig-tab.active').dataset.tab;
    if (activeTab === 'draw') {
      signaturePadInstance.clear();
    } else if (activeTab === 'type') {
      typeInput.value = '';
      syncTypePreview();
    } else if (activeTab === 'upload') {
      imgPreview.src = '';
      imgPreviewContainer.classList.add('hidden');
      state.uploadedSignatureDataUrl = null;
    }
  });
  
  saveBtn.addEventListener('click', () => {
    const activeTab = document.querySelector('.sig-tab.active').dataset.tab;
    let signatureDataUrl = null;
    
    if (activeTab === 'draw') {
      if (signaturePadInstance.isEmpty()) {
        showToast('Please draw a signature first.', 'danger');
        return;
      }
      signatureDataUrl = signaturePadInstance.getDataUrl();
    } else if (activeTab === 'type') {
      signatureDataUrl = getTypedSignatureDataUrl();
    } else if (activeTab === 'upload') {
      if (!state.uploadedSignatureDataUrl) {
        showToast('Please upload or paste a signature image first.', 'danger');
        return;
      }
      signatureDataUrl = state.uploadedSignatureDataUrl;
    }
    
    state.editor.activeSignatureDataUrl = signatureDataUrl;
    closeSignatureModal();
    showToast('Signature saved. Click on the PDF page to place it.', 'success');
  });
}

function getTypedSignatureDataUrl() {
  const name = document.getElementById('sig-type-input').value.trim() || 'Your Name';
  const font = document.getElementById('sig-type-font').value;
  
  const tempCanvas = document.createElement('canvas');
  tempCanvas.width = 500;
  tempCanvas.height = 150;
  const tempCtx = tempCanvas.getContext('2d');
  
  tempCtx.clearRect(0, 0, tempCanvas.width, tempCanvas.height);
  
  // Render styled name text at center
  tempCtx.font = `italic bold 48px ${font}`;
  tempCtx.fillStyle = '#1e3a8a';
  tempCtx.textAlign = 'center';
  tempCtx.textBaseline = 'middle';
  tempCtx.fillText(name, tempCanvas.width / 2, tempCanvas.height / 2);
  
  return tempCanvas.toDataURL('image/png');
}

function openSignatureModal() {
  document.getElementById('signature-modal').classList.remove('hidden');
  
  // Reset tabs to draw by default
  const drawTab = document.querySelector('.sig-tab[data-tab="draw"]');
  if (drawTab) drawTab.click();
  
  signaturePadInstance.clear();
}

function closeSignatureModal() {
  document.getElementById('signature-modal').classList.add('hidden');
}

// -------------------------------------------------------------
// OCR EXTRACTION COMPONENT
// -------------------------------------------------------------
function setupOcrModal() {
  const ocrPageBtn = document.getElementById('ocr-page-btn');
  const modal = document.getElementById('ocr-modal');
  const closeBtn = document.getElementById('ocr-close-btn');
  const okBtn = document.getElementById('ocr-ok-btn');
  const copyBtn = document.getElementById('ocr-copy-btn');
  
  ocrPageBtn.addEventListener('click', async () => {
    const pageCanvas = document.querySelector('.pdf-render-canvas');
    if (!pageCanvas) return;
    
    showLoader('Initializing Tesseract OCR worker...');
    try {
      const text = await runOcrOnCanvas(pageCanvas, (percent) => {
        document.getElementById('spinner-text').textContent = `Analyzing page text... ${percent}%`;
      });
      
      document.getElementById('ocr-text-output').value = text || 'No text found on this page.';
      modal.classList.remove('hidden');
    } catch (err) {
      console.error(err);
      showToast('OCR failed. Check your network or browser resources.', 'danger');
    } finally {
      hideLoader();
    }
  });
  
  closeBtn.addEventListener('click', () => modal.classList.add('hidden'));
  okBtn.addEventListener('click', () => modal.classList.add('hidden'));
  
  copyBtn.addEventListener('click', () => {
    const textOutput = document.getElementById('ocr-text-output');
    textOutput.select();
    navigator.clipboard.writeText(textOutput.value);
    showToast('Text copied to clipboard!');
  });
}

// -------------------------------------------------------------
// SHARED UTILITIES
// -------------------------------------------------------------

// Drag and drop helper
function setupDragAndDrop(element, callback) {
  element.addEventListener('dragover', (e) => {
    e.preventDefault();
    element.classList.add('file-dragover');
  });
  
  element.addEventListener('dragleave', () => {
    element.classList.remove('file-dragover');
  });
  
  element.addEventListener('drop', (e) => {
    e.preventDefault();
    element.classList.remove('file-dragover');
    if (e.dataTransfer.files.length > 0) {
      if (element.querySelector('input').multiple) {
        callback(e.dataTransfer.files);
      } else {
        callback(e.dataTransfer.files[0]);
      }
    }
  });
}

// Triggers native browser download
function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// -------------------------------------------------------------
// 10. WATERMARK PDF COMPONENT
// -------------------------------------------------------------
function setupWatermarkWorkspace() {
  const uploadZone = document.getElementById('watermark-upload-zone');
  const fileInput = document.getElementById('watermark-file-input');
  
  const typeSelect = document.getElementById('watermark-type');
  const textGroup = document.getElementById('watermark-text-group');
  const imageGroup = document.getElementById('watermark-image-group');
  
  const watermarkTextInput = document.getElementById('watermark-text');
  const fontSizeInput = document.getElementById('watermark-font-size');
  const colorInput = document.getElementById('watermark-color');
  const rotationInput = document.getElementById('watermark-rotation');
  const rotationVal = document.getElementById('rotation-val');
  
  const imageInput = document.getElementById('watermark-image-input');
  const imageScaleInput = document.getElementById('watermark-image-scale');
  const scaleVal = document.getElementById('scale-val');
  
  const opacityInput = document.getElementById('watermark-opacity');
  const opacityVal = document.getElementById('opacity-val');
  
  const positionSelect = document.getElementById('watermark-position');
  const submitBtn = document.getElementById('watermark-submit-btn');
  
  // File upload binding
  uploadZone.addEventListener('click', () => fileInput.click());
  fileInput.addEventListener('change', async (e) => {
    const file = e.target.files[0];
    if (file) handleWatermarkFile(file);
  });
  setupDragAndDrop(uploadZone, handleWatermarkFile);
  
  // Watermark type toggling
  typeSelect.addEventListener('change', (e) => {
    if (e.target.value === 'text') {
      textGroup.classList.remove('hidden');
      imageGroup.classList.add('hidden');
    } else {
      textGroup.classList.add('hidden');
      imageGroup.classList.remove('hidden');
    }
    updateWatermarkPreview();
  });
  
  // Update rotation angle hint dynamically and refresh preview
  rotationInput.addEventListener('input', (e) => {
    rotationVal.textContent = `${e.target.value}°`;
    updateWatermarkPreview();
  });
  
  // Update image scale hint dynamically and refresh preview
  imageScaleInput.addEventListener('input', (e) => {
    scaleVal.textContent = `${e.target.value}%`;
    updateWatermarkPreview();
  });
  
  // Update opacity hint dynamically and refresh preview
  opacityInput.addEventListener('input', (e) => {
    opacityVal.textContent = `${e.target.value}%`;
    updateWatermarkPreview();
  });
  
  // Refresh preview on any setting modification
  watermarkTextInput.addEventListener('input', updateWatermarkPreview);
  fontSizeInput.addEventListener('input', updateWatermarkPreview);
  colorInput.addEventListener('input', updateWatermarkPreview);
  positionSelect.addEventListener('change', updateWatermarkPreview);
  
  // Handle image upload and parse buffer
  imageInput.addEventListener('change', async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    state.watermark.imageFile = file;
    state.watermark.imageMime = file.type;
    
    const reader = new FileReader();
    reader.onload = (evt) => {
      state.watermark.imageBuffer = evt.target.result;
      updateWatermarkPreview();
    };
    reader.readAsArrayBuffer(file);
  });
  
  // Apply & Download PDF
  submitBtn.addEventListener('click', async () => {
    if (!state.watermark.file) {
      showToast('Please upload a PDF file first.', 'danger');
      return;
    }
    
    if (typeSelect.value === 'image' && !state.watermark.imageBuffer) {
      showToast('Please select a watermark image.', 'danger');
      return;
    }
    
    showLoader('Applying watermark to document...');
    try {
      const pdfBytes = await state.watermark.file.arrayBuffer();
      const options = {
        type: typeSelect.value,
        text: watermarkTextInput.value,
        fontSize: parseInt(fontSizeInput.value, 10),
        color: colorInput.value,
        rotation: parseInt(rotationInput.value, 10),
        opacity: parseFloat(opacityInput.value) / 100,
        position: positionSelect.value,
        imageBuffer: state.watermark.imageBuffer,
        imageMime: state.watermark.imageMime,
        imageScale: parseFloat(imageScaleInput.value) / 100
      };
      
      const outputBytes = await addWatermarkToPdf(pdfBytes, options);
      const blob = new Blob([outputBytes], { type: 'application/pdf' });
      downloadBlob(blob, `watermarked_${state.watermark.file.name}`);
      showToast('Watermarked PDF downloaded successfully!');
    } catch (err) {
      console.error(err);
      showToast('Failed to apply watermark.', 'danger');
    } finally {
      hideLoader();
    }
  });
}

// File loading and parsing
async function handleWatermarkFile(file) {
  if (file.type !== 'application/pdf' && !file.name.endsWith('.pdf')) {
    showToast('Please upload a PDF file.', 'danger');
    return;
  }
  
  state.watermark.file = file;
  state.watermark.imageFile = null;
  state.watermark.imageBuffer = null;
  state.watermark.imageMime = null;
  
  showLoader('Loading PDF structure...');
  try {
    const buffer = await file.arrayBuffer();
    const pdfJs = await pdfjsLib.getDocument({ data: new Uint8Array(buffer) }).promise;
    state.watermark.pageCount = pdfJs.numPages;
    
    document.getElementById('watermark-upload-zone').classList.add('hidden');
    document.getElementById('watermark-layout').classList.remove('hidden');
    
    // Draw initial preview
    await updateWatermarkPreview();
  } catch (err) {
    console.error(err);
    showToast('Failed to read PDF file.', 'danger');
  } finally {
    hideLoader();
  }
}

// Visual Preview Rendering (HTML5 Canvas)
async function updateWatermarkPreview() {
  if (!state.watermark.file) return;
  
  const canvas = document.getElementById('watermark-canvas');
  const ctx = canvas.getContext('2d');
  
  try {
    const buffer = await state.watermark.file.arrayBuffer();
    const pdfJs = await pdfjsLib.getDocument({ data: new Uint8Array(buffer) }).promise;
    const page = await pdfJs.getPage(1); // Preview page 1
    
    const viewport = page.getViewport({ scale: 0.8 }); // standard preview scale
    canvas.width = viewport.width;
    canvas.height = viewport.height;
    
    // Render PDF page on canvas
    await page.render({ canvasContext: ctx, viewport }).promise;
    
    // Draw Watermark Overlay on Canvas
    const type = document.getElementById('watermark-type').value;
    const opacity = parseFloat(document.getElementById('watermark-opacity').value) / 100;
    const position = document.getElementById('watermark-position').value;
    
    ctx.save();
    ctx.globalAlpha = opacity;
    
    if (type === 'text') {
      const text = document.getElementById('watermark-text').value || 'CONFIDENTIAL';
      const fontSize = parseInt(document.getElementById('watermark-font-size').value, 10) || 60;
      const color = document.getElementById('watermark-color').value || '#ff0000';
      const rotation = parseInt(document.getElementById('watermark-rotation').value, 10) || -45;
      
      ctx.font = `bold ${fontSize}px sans-serif`;
      ctx.fillStyle = color;
      
      const metrics = ctx.measureText(text);
      const textWidth = metrics.width;
      const textHeight = fontSize; // estimate height
      
      let x = 0;
      let y = 0;
      
      if (position === 'center') {
        x = canvas.width / 2;
        y = canvas.height / 2;
      } else if (position === 'top-left') {
        x = textWidth / 2 + 40;
        y = textHeight + 40;
      } else if (position === 'top-right') {
        x = canvas.width - textWidth / 2 - 40;
        y = textHeight + 40;
      } else if (position === 'bottom-left') {
        x = textWidth / 2 + 40;
        y = canvas.height - 40;
      } else if (position === 'bottom-right') {
        x = canvas.width - textWidth / 2 - 40;
        y = canvas.height - 40;
      }
      
      ctx.translate(x, y);
      ctx.rotate((rotation * Math.PI) / 180);
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(text, 0, 0);
      
    } else if (type === 'image' && state.watermark.imageBuffer) {
      // Create a temporary Image object from the buffer
      const imgBlob = new Blob([state.watermark.imageBuffer], { type: state.watermark.imageMime });
      const imgUrl = URL.createObjectURL(imgBlob);
      
      await new Promise((resolve) => {
        const img = new Image();
        img.onload = () => {
          const scale = parseFloat(document.getElementById('watermark-image-scale').value) / 100;
          const w = img.width * scale;
          const h = img.height * scale;
          
          let x = 0;
          let y = 0;
          
          if (position === 'center') {
            x = (canvas.width - w) / 2;
            y = (canvas.height - h) / 2;
          } else if (position === 'top-left') {
            x = 40;
            y = 40;
          } else if (position === 'top-right') {
            x = canvas.width - w - 40;
            y = 40;
          } else if (position === 'bottom-left') {
            x = 40;
            y = canvas.height - h - 40;
          } else if (position === 'bottom-right') {
            x = canvas.width - w - 40;
            y = canvas.height - h - 40;
          }
          
          ctx.drawImage(img, x, y, w, h);
          URL.revokeObjectURL(imgUrl);
          resolve();
        };
        img.src = imgUrl;
      });
    }
    
    ctx.restore();
  } catch (err) {
    console.error('Preview error:', err);
  }
}

// -------------------------------------------------------------
// 11. COMPRESS PDF COMPONENT
// -------------------------------------------------------------
function setupCompressWorkspace() {
  const uploadZone = document.getElementById('compress-upload-zone');
  const fileInput = document.getElementById('compress-file-input');
  
  const modeSelect = document.getElementById('compress-mode');
  const targetGroup = document.getElementById('compress-target-group');
  const presetGroup = document.getElementById('compress-preset-group');
  
  const targetValueInput = document.getElementById('compress-target-value');
  const targetUnitSelect = document.getElementById('compress-target-unit');
  const presetValueSelect = document.getElementById('compress-preset-value');
  
  const submitBtn = document.getElementById('compress-submit-btn');
  
  uploadZone.addEventListener('click', () => fileInput.click());
  fileInput.addEventListener('change', async (e) => {
    const file = e.target.files[0];
    if (file) handleCompressFile(file);
  });
  setupDragAndDrop(uploadZone, handleCompressFile);
  
  modeSelect.addEventListener('change', (e) => {
    if (e.target.value === 'target') {
      targetGroup.classList.remove('hidden');
      presetGroup.classList.add('hidden');
    } else {
      targetGroup.classList.add('hidden');
      presetGroup.classList.remove('hidden');
    }
  });
  
  submitBtn.addEventListener('click', async () => {
    if (!state.compress.file) {
      showToast('Please upload a PDF file first.', 'danger');
      return;
    }
    
    showLoader('Compressing PDF document...');
    try {
      const buffer = await state.compress.file.arrayBuffer();
      const pdfJsDoc = await pdfjsLib.getDocument({ data: new Uint8Array(buffer) }).promise;
      
      let scale = 1.0;
      let quality = 0.5;
      
      const mode = modeSelect.value;
      const originalSizeKb = state.compress.file.size / 1024;
      
      if (mode === 'target') {
        let targetLimitKb = parseFloat(targetValueInput.value);
        if (targetUnitSelect.value === 'mb') {
          targetLimitKb = targetLimitKb * 1024;
        }
        
        // Auto-resolve scale & quality based on target and heuristic bounds
        const settings = getCompressionSettings(targetLimitKb, originalSizeKb, state.compress.pageCount, state.compress.lowKb, state.compress.medKb, state.compress.highKb);
        scale = settings.scale;
        quality = settings.quality;
        showToast(`Target configured. Compressing at: ${settings.label}`, 'info');
      } else {
        const preset = presetValueSelect.value;
        if (preset === 'low') {
          scale = 0.8;
          quality = 0.3;
        } else if (preset === 'med') {
          scale = 1.2;
          quality = 0.6;
        } else if (preset === 'high') {
          scale = 1.5;
          quality = 0.85;
        }
      }
      
      const compressedBytes = await compressPdf(buffer, pdfJsDoc, { scale, quality });
      const blob = new Blob([compressedBytes], { type: 'application/pdf' });
      downloadBlob(blob, `compressed_${state.compress.file.name}`);
      
      // Calculate output size
      const finalSizeKb = blob.size / 1024;
      showToast(`Compression finished! Reduced from ${(originalSizeKb).toFixed(1)} KB to ${(finalSizeKb).toFixed(1)} KB.`);
    } catch (err) {
      console.error(err);
      showToast('Failed to compress PDF.', 'danger');
    } finally {
      hideLoader();
    }
  });
}

// Map target to optimal quality and scale
function getCompressionSettings(targetKb, originalSizeKb, numPages, lowKb, medKb, highKb) {
  if (targetKb <= lowKb) {
    return { scale: 0.8, quality: 0.25, label: 'Low Quality (Max Compression)' };
  } else if (targetKb >= originalSizeKb) {
    return { scale: 1.5, quality: 0.85, label: 'High Quality (Min Compression)' };
  }
  
  if (targetKb < medKb) {
    const ratio = (targetKb - lowKb) / (medKb - lowKb || 1);
    const scale = 0.8 + ratio * 0.4; // 0.8 to 1.2
    const quality = 0.25 + ratio * 0.35; // 0.25 to 0.6
    return { scale, quality, label: `Custom (Estimated ~${(targetKb).toFixed(0)} KB)` };
  } else {
    const ratio = (targetKb - medKb) / (highKb - medKb || 1);
    const scale = 1.2 + ratio * 0.3; // 1.2 to 1.5
    const quality = 0.6 + ratio * 0.25; // 0.6 to 0.85
    return { scale, quality, label: `Custom (Estimated ~${(targetKb).toFixed(0)} KB)` };
  }
}

async function handleCompressFile(file) {
  if (file.type !== 'application/pdf' && !file.name.endsWith('.pdf')) {
    showToast('Please upload a PDF file.', 'danger');
    return;
  }
  
  state.compress.file = file;
  
  showLoader('Analyzing PDF contents...');
  try {
    const originalSizeKb = file.size / 1024;
    document.getElementById('compress-filename').textContent = file.name;
    document.getElementById('compress-filesize').textContent = `Original Size: ${(originalSizeKb).toFixed(1)} KB`;
    document.getElementById('compress-info-current').textContent = `${(originalSizeKb).toFixed(1)} KB`;
    
    const buffer = await file.arrayBuffer();
    const pdfJs = await pdfjsLib.getDocument({ data: new Uint8Array(buffer) }).promise;
    state.compress.pageCount = pdfJs.numPages;
    
    // Estimate limits using page 1 heuristic rendering
    const page = await pdfJs.getPage(1);
    
    // Low Quality rendering estimate (scale=0.8, quality=0.3)
    const viewLow = page.getViewport({ scale: 0.8 });
    const canvasLow = document.createElement('canvas');
    canvasLow.width = viewLow.width;
    canvasLow.height = viewLow.height;
    const ctxLow = canvasLow.getContext('2d');
    await page.render({ canvasContext: ctxLow, viewport: viewLow }).promise;
    const dataLow = canvasLow.toDataURL('image/jpeg', 0.25);
    const lowPageSize = (dataLow.length * 0.75) / 1024; // approximate size in KB
    
    // Med Quality rendering estimate (scale=1.2, quality=0.6)
    const viewMed = page.getViewport({ scale: 1.2 });
    const canvasMed = document.createElement('canvas');
    canvasMed.width = viewMed.width;
    canvasMed.height = viewMed.height;
    const ctxMed = canvasMed.getContext('2d');
    await page.render({ canvasContext: ctxMed, viewport: viewMed }).promise;
    const dataMed = canvasMed.toDataURL('image/jpeg', 0.55);
    const medPageSize = (dataMed.length * 0.75) / 1024;
    
    // High Quality rendering estimate (scale=1.5, quality=0.85)
    const viewHigh = page.getViewport({ scale: 1.5 });
    const canvasHigh = document.createElement('canvas');
    canvasHigh.width = viewHigh.width;
    canvasHigh.height = viewHigh.height;
    const ctxHigh = canvasHigh.getContext('2d');
    await page.render({ canvasContext: ctxHigh, viewport: viewHigh }).promise;
    const dataHigh = canvasHigh.toDataURL('image/jpeg', 0.85);
    const highPageSize = (dataHigh.length * 0.75) / 1024;
    
    // Scale estimates to all pages
    state.compress.lowKb = Math.min(originalSizeKb * 0.8, lowPageSize * pdfJs.numPages);
    state.compress.medKb = Math.min(originalSizeKb * 0.9, medPageSize * pdfJs.numPages);
    state.compress.highKb = Math.min(originalSizeKb * 0.95, highPageSize * pdfJs.numPages);
    
    // Make sure bounds are logical
    if (state.compress.lowKb > originalSizeKb) state.compress.lowKb = originalSizeKb * 0.4;
    if (state.compress.medKb > originalSizeKb) state.compress.medKb = originalSizeKb * 0.7;
    if (state.compress.highKb > originalSizeKb) state.compress.highKb = originalSizeKb * 0.9;
    
    document.getElementById('compress-info-min').textContent = `${(state.compress.lowKb).toFixed(0)} KB`;
    document.getElementById('compress-info-max').textContent = `${(state.compress.highKb).toFixed(0)} KB`;
    
    document.getElementById('compress-upload-zone').classList.add('hidden');
    document.getElementById('compress-setup-container').classList.remove('hidden');
  } catch (err) {
    console.error(err);
    showToast('Failed to analyze PDF file.', 'danger');
  } finally {
    hideLoader();
  }
}

// -------------------------------------------------------------
// 12. LOCK/UNLOCK (SECURITY) WORKSPACE
// -------------------------------------------------------------
function setupSecurityWorkspace() {
  const uploadZone = document.getElementById('security-upload-zone');
  const fileInput = document.getElementById('security-file-input');
  const setupContainer = document.getElementById('security-setup-container');
  const decryptGroup = document.getElementById('security-decrypt-group');
  const encryptGroup = document.getElementById('security-encrypt-group');
  const decryptPassInput = document.getElementById('security-decrypt-password');
  const decryptBtn = document.getElementById('security-decrypt-btn');
  const encryptPassInput = document.getElementById('security-encrypt-password');
  const removePassCheck = document.getElementById('security-remove-pass-enable');
  const submitBtn = document.getElementById('security-submit-btn');
  
  uploadZone.addEventListener('click', () => fileInput.click());
  fileInput.addEventListener('change', async (e) => {
    const file = e.target.files[0];
    if (file) handleSecurityFile(file);
  });
  
  setupDragAndDrop(uploadZone, handleSecurityFile);
  
  async function handleSecurityFile(file) {
    showLoader('Parsing PDF security details...');
    try {
      const buffer = await file.arrayBuffer();
      state.security.file = file;
      state.security.buffer = buffer;
      state.security.password = '';
      state.security.isLocked = false;
      
      document.getElementById('security-filename').textContent = file.name;
      
      try {
        // Try loading bare
        await PDFDocument.load(buffer);
        
        // Not locked
        document.getElementById('security-status-text').textContent = 'Status: Unprotected (Ready to encrypt)';
        decryptGroup.classList.add('hidden');
        encryptGroup.classList.remove('hidden');
        removePassCheck.checked = false;
        removePassCheck.disabled = true;
      } catch (err) {
        // Encrypted
        state.security.isLocked = true;
        document.getElementById('security-status-text').textContent = 'Status: Password-Protected (Locked)';
        decryptGroup.classList.remove('hidden');
        encryptGroup.classList.add('hidden');
        removePassCheck.disabled = false;
      }
      
      uploadZone.classList.add('hidden');
      setupContainer.classList.remove('hidden');
    } catch (e) {
      console.error(e);
      showToast('Failed to read PDF file.', 'danger');
    } finally {
      hideLoader();
    }
  }
  
  decryptBtn.addEventListener('click', async () => {
    const password = decryptPassInput.value;
    if (!password) {
      showToast('Please enter the password.', 'danger');
      return;
    }
    
    showLoader('Unlocking PDF document...');
    try {
      await PDFDocument.load(state.security.buffer, { password });
      state.security.password = password;
      state.security.isLocked = false;
      
      document.getElementById('security-status-text').textContent = 'Status: Unlocked & Decrypted';
      decryptGroup.classList.add('hidden');
      encryptGroup.classList.remove('hidden');
      removePassCheck.checked = true;
      removePassCheck.disabled = false;
      showToast('PDF successfully unlocked!', 'success');
    } catch (e) {
      console.error(e);
      showToast('Incorrect password. Please try again.', 'danger');
    } finally {
      hideLoader();
    }
  });
  
  submitBtn.addEventListener('click', async () => {
    showLoader('Processing PDF security options...');
    try {
      let currentBuffer = state.security.buffer;
      
      // Decrypt if it was encrypted
      if (state.security.password) {
        currentBuffer = await decryptPdf(state.security.buffer, state.security.password);
      }
      
      const newPassword = encryptPassInput.value;
      const removePass = removePassCheck.checked;
      
      if (newPassword && !removePass) {
        currentBuffer = await encryptPdf(currentBuffer, newPassword);
        showToast('PDF encrypted successfully!');
      } else if (removePass) {
        showToast('PDF decrypted successfully!');
      }
      
      const blob = new Blob([currentBuffer], { type: 'application/pdf' });
      downloadBlob(blob, state.security.file.name.replace(/\.pdf$/i, '_secured.pdf'));
    } catch (err) {
      console.error(err);
      showToast('Processing security failed.', 'danger');
    } finally {
      hideLoader();
    }
  });
}

// -------------------------------------------------------------
// 13. PAGE NUMBERING WORKSPACE
// -------------------------------------------------------------
function setupNumberingWorkspace() {
  const uploadZone = document.getElementById('numbering-upload-zone');
  const fileInput = document.getElementById('numbering-file-input');
  const setupContainer = document.getElementById('numbering-setup-container');
  const submitBtn = document.getElementById('numbering-submit-btn');
  
  uploadZone.addEventListener('click', () => fileInput.click());
  fileInput.addEventListener('change', async (e) => {
    const file = e.target.files[0];
    if (file) handleNumberingFile(file);
  });
  
  setupDragAndDrop(uploadZone, handleNumberingFile);
  
  async function handleNumberingFile(file) {
    showLoader('Loading PDF...');
    try {
      const buffer = await file.arrayBuffer();
      const pdfJs = await pdfjsLib.getDocument({ data: new Uint8Array(buffer) }).promise;
      
      state.numbering.file = file;
      state.numbering.buffer = buffer;
      state.numbering.pageCount = pdfJs.numPages;
      
      document.getElementById('numbering-filename').textContent = file.name;
      document.getElementById('numbering-pagecount').textContent = `Pages: ${pdfJs.numPages}`;
      
      uploadZone.classList.add('hidden');
      setupContainer.classList.remove('hidden');
    } catch (e) {
      console.error(e);
      showToast('Failed to load PDF file.', 'danger');
    } finally {
      hideLoader();
    }
  }
  
  submitBtn.addEventListener('click', async () => {
    showLoader('Adding page numbers...');
    try {
      const format = document.getElementById('num-format').value;
      const position = document.getElementById('num-position').value;
      const startNumber = parseInt(document.getElementById('num-start').value, 10) || 1;
      const fontSize = parseInt(document.getElementById('num-size').value, 10) || 10;
      const color = document.getElementById('num-color').value;
      const margin = parseInt(document.getElementById('num-margin').value, 10) || 25;
      
      const numberedBytes = await addPageNumbersToPdf(state.numbering.buffer, {
        format,
        position,
        startNumber,
        fontSize,
        color,
        margin
      });
      
      const blob = new Blob([numberedBytes], { type: 'application/pdf' });
      downloadBlob(blob, state.numbering.file.name.replace(/\.pdf$/i, '_numbered.pdf'));
      showToast('Page numbers added successfully!');
    } catch (err) {
      console.error(err);
      showToast('Failed to add page numbers.', 'danger');
    } finally {
      hideLoader();
    }
  });
}

// -------------------------------------------------------------
// 14. BATCH ACTIONS WORKSPACE
// -------------------------------------------------------------
function setupBatchWorkspace() {
  const uploadZone = document.getElementById('batch-upload-zone');
  const fileInput = document.getElementById('batch-file-input');
  const setupContainer = document.getElementById('batch-setup-container');
  const actionSelect = document.getElementById('batch-action-select');
  const passwordGroup = document.getElementById('batch-password-group');
  const clearBtn = document.getElementById('batch-clear-btn');
  const submitBtn = document.getElementById('batch-submit-btn');
  const filesGrid = document.getElementById('batch-files-grid');
  
  uploadZone.addEventListener('click', () => fileInput.click());
  fileInput.addEventListener('change', (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 0) handleBatchFiles(files);
  });
  
  actionSelect.addEventListener('change', () => {
    const val = actionSelect.value;
    if (val === 'encrypt' || val === 'decrypt') {
      passwordGroup.classList.remove('hidden');
    } else {
      passwordGroup.classList.add('hidden');
    }
  });
  
  clearBtn.addEventListener('click', () => {
    state.batch.files = [];
    filesGrid.innerHTML = '';
    setupContainer.classList.add('hidden');
    uploadZone.classList.remove('hidden');
    fileInput.value = '';
  });
  
  function handleBatchFiles(files) {
    const validPdfs = files.filter(f => f.name.endsWith('.pdf')).slice(0, 50);
    if (validPdfs.length === 0) {
      showToast('Please upload valid PDF files.', 'danger');
      return;
    }
    
    state.batch.files = validPdfs;
    document.getElementById('batch-files-count').textContent = `Uploaded Files (${validPdfs.length} / 50)`;
    
    filesGrid.innerHTML = '';
    validPdfs.forEach((file) => {
      const row = document.createElement('div');
      row.className = 'batch-file-row';
      row.style.cssText = 'display: flex; justify-content: space-between; align-items: center; padding: 0.5rem 0.75rem; border-bottom: 1px solid var(--border-color); font-size: 0.875rem;';
      row.innerHTML = `
        <span style="font-weight: 500;">${file.name} (${(file.size / 1024).toFixed(0)} KB)</span>
        <span class="batch-row-status" style="color: var(--text-secondary); font-weight: 600;">Ready</span>
      `;
      filesGrid.appendChild(row);
    });
    
    uploadZone.classList.add('hidden');
    setupContainer.classList.remove('hidden');
  }
  
  submitBtn.addEventListener('click', async () => {
    if (state.batch.files.length === 0) return;
    
    showLoader('Running batch processing...');
    const action = actionSelect.value;
    const password = document.getElementById('batch-password-input').value;
    const zip = new JSZip();
    const rows = document.querySelectorAll('.batch-file-row');
    
    try {
      for (let i = 0; i < state.batch.files.length; i++) {
        const file = state.batch.files[i];
        const rowStatus = rows[i].querySelector('.batch-row-status');
        rowStatus.textContent = 'Processing...';
        rowStatus.style.color = 'var(--accent-purple)';
        
        try {
          const buffer = await file.arrayBuffer();
          let outBytes;
          
          if (action === 'rotate-cw') {
            const doc = await PDFDocument.load(buffer);
            doc.getPages().forEach(page => {
              const rot = page.getRotation().angle;
              page.setRotation(degrees((rot + 90) % 360));
            });
            outBytes = await doc.save();
          } else if (action === 'rotate-ccw') {
            const doc = await PDFDocument.load(buffer);
            doc.getPages().forEach(page => {
              const rot = page.getRotation().angle;
              page.setRotation(degrees((rot + 270) % 360));
            });
            outBytes = await doc.save();
          } else if (action === 'compress-med' || action === 'compress-low') {
            const pdfJs = await pdfjsLib.getDocument({ data: new Uint8Array(buffer) }).promise;
            const quality = action === 'compress-low' ? 0.35 : 0.65;
            outBytes = await compressPdf(buffer, pdfJs, { scale: 0.85, quality });
          } else if (action === 'encrypt') {
            if (!password) throw new Error('Password required');
            outBytes = await encryptPdf(buffer, password);
          } else if (action === 'decrypt') {
            if (!password) throw new Error('Password required');
            outBytes = await decryptPdf(buffer, password);
          }
          
          zip.file(file.name.replace(/\.pdf$/i, '_processed.pdf'), outBytes);
          rowStatus.textContent = 'Completed';
          rowStatus.style.color = 'var(--text-success)';
        } catch (e) {
          console.error(e);
          rowStatus.textContent = 'Failed';
          rowStatus.style.color = 'var(--text-danger)';
        }
      }
      
      const zipBlob = await zip.generateAsync({ type: 'blob' });
      downloadBlob(zipBlob, 'batch_processed_documents.zip');
      showToast('Batch processing complete! ZIP downloaded.', 'success');
    } catch (err) {
      console.error(err);
      showToast('Batch processing failed.', 'danger');
    } finally {
      hideLoader();
    }
  });
}

// -------------------------------------------------------------
// 15. COMPARE WORKSPACE
// -------------------------------------------------------------
function setupCompareWorkspace() {
  const uploadZoneA = document.getElementById('compare-a-upload-zone');
  const fileInputA = document.getElementById('compare-a-file-input');
  const uploadZoneB = document.getElementById('compare-b-upload-zone');
  const fileInputB = document.getElementById('compare-b-file-input');
  const submitBtn = document.getElementById('compare-submit-btn');
  const resultsContainer = document.getElementById('compare-results-container');
  const diffOutput = document.getElementById('compare-diff-output');
  
  uploadZoneA.addEventListener('click', () => fileInputA.click());
  fileInputA.addEventListener('change', async (e) => {
    const file = e.target.files[0];
    if (file) {
      state.compare.fileA = file;
      document.getElementById('compare-a-status').textContent = `Loaded: ${file.name}`;
      checkCompareTrigger();
    }
  });
  
  uploadZoneB.addEventListener('click', () => fileInputB.click());
  fileInputB.addEventListener('change', async (e) => {
    const file = e.target.files[0];
    if (file) {
      state.compare.fileB = file;
      document.getElementById('compare-b-status').textContent = `Loaded: ${file.name}`;
      checkCompareTrigger();
    }
  });
  
  function checkCompareTrigger() {
    if (state.compare.fileA && state.compare.fileB) {
      submitBtn.classList.remove('hidden');
    }
  }
  
  submitBtn.addEventListener('click', async () => {
    showLoader('Extracting text and running comparison...');
    try {
      const textA = await extractTextFromPdf(state.compare.fileA);
      const textB = await extractTextFromPdf(state.compare.fileB);
      
      // Perform Diff using jsdiff
      const diff = Diff.diffWords(textA, textB);
      
      let htmlOutput = '';
      diff.forEach((part) => {
        const value = escapeHtml(part.value);
        if (part.added) {
          htmlOutput += `<span style="background-color: #dcfce7; border: 1px solid #86efac; color: #14532d; padding: 1px 3px; border-radius: 2px; font-weight: bold;">${value}</span>`;
        } else if (part.removed) {
          htmlOutput += `<span style="background-color: #fee2e2; border: 1px solid #fca5a5; color: #7f1d1d; text-decoration: line-through; padding: 1px 3px; border-radius: 2px;">${value}</span>`;
        } else {
          htmlOutput += value;
        }
      });
      
      diffOutput.innerHTML = htmlOutput;
      
      // Extract and compare PDF Metadata
      const docA = await PDFDocument.load(await state.compare.fileA.arrayBuffer());
      const docB = await PDFDocument.load(await state.compare.fileB.arrayBuffer());
      
      const rows = [
        { label: 'File Name', valA: state.compare.fileA.name, valB: state.compare.fileB.name },
        { label: 'File Size', valA: `${(state.compare.fileA.size / 1024).toFixed(1)} KB`, valB: `${(state.compare.fileB.size / 1024).toFixed(1)} KB` },
        { label: 'Page Count', valA: docA.getPageCount(), valB: docB.getPageCount() },
        { label: 'Title', valA: docA.getTitle() || '---', valB: docB.getTitle() || '---' },
        { label: 'Author', valA: docA.getAuthor() || '---', valB: docB.getAuthor() || '---' },
        { label: 'Subject', valA: docA.getSubject() || '---', valB: docB.getSubject() || '---' },
        { label: 'Creator', valA: docA.getCreator() || '---', valB: docB.getCreator() || '---' },
        { label: 'Producer', valA: docA.getProducer() || '---', valB: docB.getProducer() || '---' },
        { label: 'Creation Date', valA: docA.getCreationDate() ? docA.getCreationDate().toLocaleString() : '---', valB: docB.getCreationDate() ? docB.getCreationDate().toLocaleString() : '---' },
        { label: 'Modification Date', valA: docA.getModificationDate() ? docA.getModificationDate().toLocaleString() : '---', valB: docB.getModificationDate() ? docB.getModificationDate().toLocaleString() : '---' }
      ];
      
      let tableHtml = '';
      rows.forEach(row => {
        const hasChanged = String(row.valA) !== String(row.valB);
        const rowStyle = hasChanged ? 'background: #fef08a; border-bottom: 1px solid var(--border-color); color: #1e293b;' : 'border-bottom: 1px solid var(--border-color);';
        
        tableHtml += `
          <tr style="${rowStyle}">
            <td style="padding: 0.75rem 1rem; font-weight: 600; width: 25%;">${row.label}</td>
            <td style="padding: 0.75rem 1rem; max-width: 250px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; width: 37.5%;">${escapeHtml(String(row.valA))}</td>
            <td style="padding: 0.75rem 1rem; max-width: 250px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; width: 37.5%;">${escapeHtml(String(row.valB))}</td>
          </tr>
        `;
      });
      document.getElementById('compare-metadata-table-body').innerHTML = tableHtml;
      
      resultsContainer.classList.remove('hidden');
      showToast('Comparison completed! View differences below.', 'success');
    } catch (err) {
      console.error(err);
      showToast('Comparison failed. Ensure PDFs have extractable text.', 'danger');
    } finally {
      hideLoader();
    }
  });
}

async function extractTextFromPdf(file) {
  const buffer = await file.arrayBuffer();
  const pdfJs = await pdfjsLib.getDocument({ data: new Uint8Array(buffer) }).promise;
  let fullText = '';
  
  for (let i = 1; i <= pdfJs.numPages; i++) {
    const page = await pdfJs.getPage(i);
    const textContent = await page.getTextContent();
    const pageText = textContent.items.map(item => item.str).join(' ');
    fullText += `[Page ${i}]\n` + pageText + '\n\n';
  }
  return fullText;
}

function escapeHtml(text) {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
