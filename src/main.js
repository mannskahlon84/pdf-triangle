import './style.css';
import { PdfManager } from './pdfManager';
import { SignaturePad } from './signatureManager';
import { runOcrOnCanvas } from './ocrManager';
import { mergePdfs, splitPdf, parseRanges, organizePdfPages, addWatermarkToPdf } from './tools/manipulator';
import { convertImagesToPdf, convertPdfToImages, convertWordToPdf, convertExcelToPdf } from './tools/converters';
import * as pdfjsLib from 'pdfjs-dist';

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
  
  const validRoutes = ['dashboard', 'editor', 'merge', 'split', 'organize', 'jpg-to-pdf', 'pdf-to-jpg', 'word-to-pdf', 'excel-to-pdf', 'watermark'];
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
  const viewport = document.getElementById('canvas-viewport');
  
  uploadBtn.addEventListener('click', () => fileInput.click());
  fileInput.addEventListener('change', async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    showLoader('Loading PDF document...');
    try {
      const buffer = await file.arrayBuffer();
      await state.editor.pdfManager.loadPdf(buffer);
      
      document.getElementById('editor-empty-state').classList.add('hidden');
      document.getElementById('active-page-container').classList.remove('hidden');
      saveBtn.disabled = false;
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

  // Save changes
  saveBtn.addEventListener('click', async () => {
    // Commit drawing if active
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
}

function setEditorTool(tool) {
  state.editor.activeTool = tool;
  
  // Toggle Sidebars options panels
  document.getElementById('options-text-tool').classList.add('hidden');
  document.getElementById('options-draw-tool').classList.add('hidden');
  document.getElementById('options-empty-state').classList.add('hidden');
  
  if (tool === 'text') {
    document.getElementById('options-text-tool').classList.remove('hidden');
  } else if (tool === 'draw') {
    document.getElementById('options-draw-tool').classList.remove('hidden');
  } else if (tool === 'signature') {
    if (!state.editor.activeSignatureDataUrl) {
      openSignatureModal();
    } else {
      showToast('Signature loaded. Click on the document to place it.', 'info');
    }
  } else {
    document.getElementById('options-empty-state').classList.remove('hidden');
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
      
      const txtObj = {
        percentX,
        percentY,
        text: 'Click to edit text',
        size: parseInt(sizeInput.value, 10),
        color: colorInput.value
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
    if (state.editor.activeTool !== 'draw') return;
    state.editor.isDrawing = true;
    const pos = getPos(e);
    state.editor.lastDrawX = pos.x;
    state.editor.lastDrawY = pos.y;
  };

  const draw = (e) => {
    if (!state.editor.isDrawing || state.editor.activeTool !== 'draw') return;
    const pos = getPos(e);
    
    ctx.beginPath();
    ctx.moveTo(state.editor.lastDrawX, state.editor.lastDrawY);
    ctx.lineTo(pos.x, pos.y);
    
    const color = document.getElementById('draw-color').value;
    const width = document.getElementById('draw-width').value;
    
    ctx.strokeStyle = color;
    ctx.lineWidth = width;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.stroke();
    
    state.editor.lastDrawX = pos.x;
    state.editor.lastDrawY = pos.y;
    e.preventDefault();
  };

  const stop = () => {
    state.editor.isDrawing = false;
  };

  canvas.addEventListener('mousedown', start);
  canvas.addEventListener('mousemove', draw);
  document.addEventListener('mouseup', stop);

  canvas.addEventListener('touchstart', start, { passive: false });
  canvas.addEventListener('touchmove', draw, { passive: false });
  document.addEventListener('touchend', stop);
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
  
  signaturePadInstance = new SignaturePad(canvas);
  
  closeBtn.addEventListener('click', closeSignatureModal);
  clearBtn.addEventListener('click', () => signaturePadInstance.clear());
  
  saveBtn.addEventListener('click', () => {
    if (signaturePadInstance.isEmpty()) {
      showToast('Signature is empty. Please draw a signature first.', 'danger');
      return;
    }
    
    state.editor.activeSignatureDataUrl = signaturePadInstance.getDataUrl();
    closeSignatureModal();
    showToast('Signature saved. Click on the PDF page to place it.', 'success');
  });
}

function openSignatureModal() {
  document.getElementById('signature-modal').classList.remove('hidden');
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
