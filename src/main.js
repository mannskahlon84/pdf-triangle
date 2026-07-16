import './style.css';
import { PdfManager } from './pdfManager';
import { SignaturePad } from './signatureManager';
import { runOcrOnCanvas } from './ocrManager';
import { mergePdfs, splitPdf, parseRanges, organizePdfPages, addWatermarkToPdf, compressPdf, encryptPdf, decryptPdf, addPageNumbersToPdf, removePagesFromPdf, extractPagesFromPdf, repairPdf, cropPdf, redactPdf, translatePdf } from './tools/manipulator';
import { convertImagesToPdf, convertPdfToImages, convertWordToPdf, convertExcelToPdf, convertHtmlToPdf, convertPptxToPdf, convertPdfToWord, convertPdfToPowerpoint, convertPdfToExcel, convertPdfToPdfA, convertPdfToMarkdown } from './tools/converters';
import * as pdfjsLib from 'pdfjs-dist';
import { PDFDocument, degrees } from 'pdf-lib';
import * as XLSX from 'xlsx';
import mammoth from 'mammoth';
import html2pdf from 'html2pdf.js';
import PizZip from 'pizzip';

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
    activeSignatureDataUrl: null,
    hasExtractedText: false
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
  },
  scanner: {
    file: null,
    originalImg: null,
    corners: [],
    activeHandleIndex: -1
  },
  copilot: {
    file: null,
    documentText: '',
    extractedData: null,
    lastResponse: '',
    mode: 'demo',
    base64Data: null,
    hasRunAzureAnalysis: false,
    isModified: false
  },
  remove: {
    file: null,
    pageCount: 0
  },
  extract: {
    file: null,
    pageCount: 0
  },
  repair: {
    file: null
  },
  pptxToPdf: {
    file: null
  },
  htmlToPdf: {
    file: null
  },
  pdfToWord: {
    file: null,
    pageCount: 0
  },
  pdfToPowerpoint: {
    file: null,
    pageCount: 0
  },
  pdfToExcel: {
    file: null,
    pageCount: 0
  },
  pdfToPdfA: {
    file: null,
    pageCount: 0
  },
  crop: {
    file: null,
    pageCount: 0
  },
  redact: {
    file: null,
    pageCount: 0
  },
  translate: {
    file: null,
    pageCount: 0
  },
  pdfToMarkdown: {
    file: null,
    pageCount: 0
  },
  formbuilder: {
    file: null,
    pdfBytes: null,
    pdfDoc: null,
    numPages: 0,
    currentPageIndex: 0,
    zoom: 1.0,
    mode: 'edit',
    activeTool: 'text',
    fontColor: '#000000',
    fields: [],
    selectedFieldId: null
  }
};

// Initialize Signature Pad
let signaturePadInstance = null;

// Bootstrap Application
document.addEventListener('DOMContentLoaded', () => {
  // Check if running inside the custom PDFTriangle Android WebView App wrapper
  if (navigator.userAgent.includes('PDFTriangleApp')) {
    const apkBtn = document.getElementById('apk-download-btn');
    if (apkBtn) {
      apkBtn.innerHTML = '<i data-lucide="external-link" style="width: 16px; height: 16px; margin-right: 2px;"></i> Open in Browser';
      apkBtn.removeAttribute('download');
      apkBtn.href = 'https://pdftriangle.netlify.app/';
      apkBtn.target = '_blank';
    }
  }

  // Initialize Lucide Icons
  lucide.createIcons();
  
  // Inject Cancel/Discard buttons into all workspace setup panels
  injectWorkspaceCancelButtons();
  
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
  initHomepageCarousel();

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
  setupScannerWorkspace();
  setupFormbuilderWorkspace();
  setupCopilotWorkspace();
  setupSignatureModal();
  setupOcrModal();

  setupRemoveWorkspace();
  setupExtractWorkspace();
  setupRepairWorkspace();
  setupPptxToPdfWorkspace();
  setupHtmlToPdfWorkspace();
  setupPdfToWordWorkspace();
  setupPdfToPowerpointWorkspace();
  setupPdfToExcelWorkspace();
  setupPdfToPdfAWorkspace();
  setupCropWorkspace();
  setupRedactWorkspace();
  setupTranslateWorkspace();
  setupPdfToMarkdownWorkspace();
});

// View Routing System
function handleRouting() {
  const hash = window.location.hash;
  let viewName = 'dashboard';
  
  if (hash && hash.startsWith('#/')) {
    viewName = hash.substring(2);
  }
  
  const validRoutes = [
    'dashboard', 'editor', 'merge', 'split', 'organize', 'jpg-to-pdf', 'pdf-to-jpg', 
    'word-to-pdf', 'excel-to-pdf', 'watermark', 'compress', 'security', 'numbering', 
    'batch', 'compare', 'scanner', 'formbuilder', 'copilot', 'auto-edit',
    'remove', 'extract', 'repair', 'pptx-to-pdf', 'html-to-pdf', 'pdf-to-word', 
    'pdf-to-powerpoint', 'pdf-to-excel', 'pdf-to-pdf-a', 'crop', 'redact', 
    'translate', 'pdf-to-markdown'
  ];
  if (!validRoutes.includes(viewName)) {
    viewName = 'dashboard';
    window.location.hash = '#/dashboard';
  }
  
  switchView(viewName);
}

function switchView(viewName) {
  state.activeTool = viewName;
  
  // Toggle fixed body viewport to lock screen scrollbars and keep tools sticky
  if (viewName === 'editor' || viewName === 'copilot') {
    document.body.classList.add('fixed-viewport');
  } else {
    document.body.classList.remove('fixed-viewport');
  }

  // Clear all other inactive tool workspaces to avoid file leakage/lingering state
  resetInactiveTools(viewName);
  
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
  
  // Scroll window and containers to top so document is fully visible in active screen area
  window.scrollTo({ top: 0, behavior: 'instant' });
  const viewports = document.querySelectorAll('.canvas-viewport, .workspace-main');
  viewports.forEach(vp => {
    vp.scrollTop = 0;
    vp.scrollLeft = 0;
  });
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
  const closeBtn = document.getElementById('editor-close-btn');
  const viewport = document.getElementById('canvas-viewport');
  
  uploadBtn.addEventListener('click', () => fileInput.click());
  fileInput.addEventListener('change', async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    state.editor.hasInitializedZoom = false;
    state.editor.hasExtractedText = false; // Reset text extraction flag for new document
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
      document.getElementById('zoom-wrapper').classList.remove('hidden');
      document.getElementById('active-page-container').classList.remove('hidden');
      
      const floatingBar = document.getElementById('floating-navigator-bar');
      if (floatingBar) floatingBar.classList.remove('hidden');
      
      saveBtn.disabled = false;
      printBtn.disabled = false;
      rotateBtn.disabled = false;
      closeBtn.disabled = false;
      document.getElementById('ocr-page-btn').disabled = false;
      document.getElementById('editor-edit-pdf-text-btn').disabled = false;
      
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

  // Edit Existing PDF Text click handler (Triggers Ad Sponsored Unlock Modal)
  const editPdfTextBtn = document.getElementById('editor-edit-pdf-text-btn');
  const premiumConvertBtn = document.getElementById('editor-premium-convert-btn');
  const appDownloadModal = document.getElementById('app-download-modal');
  const appDownloadCloseBtn = document.getElementById('app-download-close-btn');
  const appDownloadDemoBtn = document.getElementById('app-download-demo-btn');
  
  let adCountdownInterval = null;

  if (premiumConvertBtn) {
    premiumConvertBtn.addEventListener('click', async () => {
      if (!state.editor || !state.editor.file) {
        showToast('Please open a PDF file first.', 'danger');
        return;
      }
      showLoader('Converting to Word (PRO) via Adobe API... This takes about 10-20 seconds.');
      try {
        const wordBlob = await convertPdfToWord(state.editor.file);
        downloadBlob(wordBlob, state.editor.file.name.replace(/\.pdf$/i, '.docx'));
        showToast('Successfully converted to Word format using Adobe API!', 'success');
      } catch (err) {
        console.error(err);
        showToast(`Premium Conversion Failed: ${err.message}`, 'danger');
      } finally {
        hideLoader();
      }
    });
  }

  editPdfTextBtn.addEventListener('click', () => {
    appDownloadModal.classList.remove('hidden');
    
    // Reset ad countdown state
    let timeLeft = 30;
    const adTimerBadge = document.getElementById('ad-timer-badge');
    const adProgressBar = document.getElementById('ad-progress-bar');
    
    if (adTimerBadge) {
      adTimerBadge.textContent = `Skip in ${timeLeft}s`;
      adTimerBadge.style.background = 'var(--accent-purple-light)';
      adTimerBadge.style.color = 'var(--accent-purple)';
    }
    
    if (adProgressBar) {
      adProgressBar.style.width = '0%';
    }
    
    appDownloadDemoBtn.disabled = true;
    appDownloadDemoBtn.style.background = 'var(--border-color)';
    appDownloadDemoBtn.style.color = 'var(--text-muted)';
    appDownloadDemoBtn.style.cursor = 'not-allowed';
    appDownloadDemoBtn.innerHTML = `<i data-lucide="lock" style="width: 14px; height: 14px; vertical-align: middle;"></i> <span>Skip Ad (${timeLeft}s)</span>`;
    
    if (window.lucide) window.lucide.createIcons();
    
    if (adCountdownInterval) clearInterval(adCountdownInterval);
    
    adCountdownInterval = setInterval(() => {
      timeLeft--;
      
      if (adTimerBadge) {
        adTimerBadge.textContent = `Skip in ${timeLeft}s`;
      }
      if (adProgressBar) {
        adProgressBar.style.width = `${((30 - timeLeft) / 30) * 100}%`;
      }
      
      appDownloadDemoBtn.innerHTML = `<i data-lucide="lock" style="width: 14px; height: 14px; vertical-align: middle;"></i> <span>Skip Ad (${timeLeft}s)</span>`;
      if (window.lucide) window.lucide.createIcons();
      
      if (timeLeft <= 0) {
        clearInterval(adCountdownInterval);
        adCountdownInterval = null;
        
        if (adTimerBadge) {
          adTimerBadge.textContent = 'Ad Complete';
          adTimerBadge.style.background = 'var(--accent-green-light)';
          adTimerBadge.style.color = 'var(--accent-green)';
        }
        
        appDownloadDemoBtn.disabled = false;
        appDownloadDemoBtn.style.background = 'var(--accent-purple)';
        appDownloadDemoBtn.style.color = 'white';
        appDownloadDemoBtn.style.cursor = 'pointer';
        appDownloadDemoBtn.innerHTML = `<i data-lucide="unlock" style="width: 14px; height: 14px; vertical-align: middle;"></i> <span>Skip Ad & Edit Text</span>`;
        if (window.lucide) window.lucide.createIcons();
      }
    }, 1000);
  });

  appDownloadCloseBtn.addEventListener('click', () => {
    appDownloadModal.classList.add('hidden');
    if (adCountdownInterval) {
      clearInterval(adCountdownInterval);
      adCountdownInterval = null;
    }
  });

  appDownloadDemoBtn.addEventListener('click', async () => {
    if (appDownloadDemoBtn.disabled) return;
    appDownloadModal.classList.add('hidden');
    if (adCountdownInterval) {
      clearInterval(adCountdownInterval);
      adCountdownInterval = null;
    }
    await runEditPdfTextExtraction();
  });

  // Sidebar Save Button Click (Redirects to main saveBtn)
  const sidebarSaveBtn = document.getElementById('editor-sidebar-save-btn');
  if (sidebarSaveBtn) {
    sidebarSaveBtn.addEventListener('click', () => {
      saveBtn.click();
    });
  }

  // Annotate vs Edit Mode Switcher Controls (iLovePDF Style)
  const modeAnnotateBtn = document.getElementById('mode-annotate-btn');
  const modeEditBtn = document.getElementById('mode-edit-btn');

  if (modeAnnotateBtn && modeEditBtn) {
    modeAnnotateBtn.addEventListener('click', async () => {
      if (modeAnnotateBtn.classList.contains('active')) return;
      
      modeAnnotateBtn.classList.add('active');
      modeEditBtn.classList.remove('active');
      
      // Set to Select/Pan tool
      setEditorTool('pan');
      
      // Reload current page to wipe out temporary editable text block divs
      const pageIdx = state.editor.activePage?.pageIndex;
      if (pageIdx !== undefined) {
        showLoader('Exiting Edit mode...');
        await loadEditorPage(pageIdx);
        hideLoader();
      }
    });

    modeEditBtn.addEventListener('click', () => {
      if (modeEditBtn.classList.contains('active')) return;
      // Trigger the ad unlock modal countdown!
      editPdfTextBtn.click();
    });
  }

  // Floating Navigator Page Up/Down Buttons
  const floatPrevPage = document.getElementById('float-prev-page');
  const floatNextPage = document.getElementById('float-next-page');

  if (floatPrevPage && floatNextPage) {
    floatPrevPage.addEventListener('click', () => {
      const pageIdx = state.editor.activePage?.pageIndex;
      if (pageIdx !== undefined && pageIdx > 0) {
        loadEditorPage(pageIdx - 1);
      }
    });
    floatNextPage.addEventListener('click', () => {
      const pageIdx = state.editor.activePage?.pageIndex;
      if (pageIdx !== undefined && state.editor.pdfManager && pageIdx < state.editor.pdfManager.numPages - 1) {
        loadEditorPage(pageIdx + 1);
      }
    });
  }

  async function runEditPdfTextExtraction() {
    const activePageIdx = state.editor.activePage?.pageIndex;
    if (activePageIdx === undefined) return;
    
    // Avoid double text extraction if text has already been loaded across the document
    if (state.editor.hasExtractedText) {
      if (modeEditBtn && modeAnnotateBtn) {
        modeEditBtn.classList.add('active');
        modeAnnotateBtn.classList.remove('active');
      }
      document.getElementById('options-text-tool').classList.remove('hidden');
      document.getElementById('options-metadata-panel').classList.add('hidden');
      return;
    }
    
    showLoader('Extracting document text layers for all pages...');
    try {
      const numPages = state.editor.pdfManager.numPages;
      let totalBlocks = 0;
      
      for (let pIdx = 0; pIdx < numPages; pIdx++) {
        // Skip page if it already has text overlays to avoid doubling
        if (state.editor.pdfManager.additions[pIdx].text.length > 0) continue;
        
        document.getElementById('spinner-text').textContent = `Extracting text layers: page ${pIdx + 1} of ${numPages}...`;
        
        const blocks = await state.editor.pdfManager.extractNativeTextBlocks(pIdx);
        if (blocks.length === 0) continue;
        
        // Render PDF page to an offscreen canvas to detect text backgrounds correctly
        const page = await state.editor.pdfManager.pdfJsDoc.getPage(pIdx + 1);
        const viewport = page.getViewport({ scale: 1.5 }); // Match renderPageToContainer scale
        
        const tempCanvas = document.createElement('canvas');
        tempCanvas.width = viewport.width;
        tempCanvas.height = viewport.height;
        const tempCtx = tempCanvas.getContext('2d');
        await page.render({ canvasContext: tempCtx, viewport }).promise;
        
        const coveredRects = [];
        
        blocks.forEach(block => {
          const bboxX = block.percentX * tempCanvas.width;
          const bboxY = block.percentY * tempCanvas.height;
          const bboxW = block.percentW * tempCanvas.width;
          const bboxH = block.percentH * tempCanvas.height;
          
          const pixel = tempCtx.getImageData(
            Math.max(0, Math.min(tempCanvas.width - 1, bboxX - 2)),
            Math.max(0, Math.min(tempCanvas.height - 1, bboxY - 2)),
            1, 1
          ).data;
          const r = pixel[0];
          const g = pixel[1];
          const b = pixel[2];
          const a = pixel[3];
          
          // Default to white background color if the extracted pixel is near white/light grey, dark, or transparent
          let finalBgColor = "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
          if ((r > 200 && g > 200 && b > 200) || a === 0) {
            finalBgColor = '#ffffff';
          }
          
          const fontSize = Math.max(8, Math.round(block.fontSize));
          
          const txtObj = {
            percentX: block.percentX,
            percentY: block.percentY,
            percentW: block.percentW,
            percentH: block.percentH,
            text: block.text,
            originalText: block.text, // Store original text to check if edited later
            size: fontSize,
            color: '#000000',
            fontFamily: block.fontFamily || "'Inter', sans-serif",
            isBold: false,
            isItalic: false,
            bgEnable: false,
            bgColor: finalBgColor,
            coverRect: {
              percentX: block.percentX,
              percentY: block.percentY,
              percentW: block.percentW,
              percentH: block.percentH,
              bgColor: finalBgColor
            }
          };
          
          state.editor.pdfManager.additions[pIdx].text.push(txtObj);
          totalBlocks++;
        });
        
        window.saveHistoryState(pIdx);
      }
      
      state.editor.hasExtractedText = true;
      
      // Reload current editor page to apply local DOM text elements and draw coveredRects canvas
      await loadEditorPage(activePageIdx);
      
      if (modeEditBtn && modeAnnotateBtn) {
        modeEditBtn.classList.add('active');
        modeAnnotateBtn.classList.remove('active');
      }
      setEditorTool('text');
      showToast(`Document-wide editing prepared! Converted ${totalBlocks} text blocks into editable overlays.`, 'success');
    } catch (err) {
      console.error(err);
      showToast('Failed to extract document text layers.', 'danger');
    } finally {
      hideLoader();
    }
  }

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

  // Undo/Redo click event handlers
  const undoBtn = document.getElementById('editor-undo-btn');
  const redoBtn = document.getElementById('editor-redo-btn');
  if (undoBtn && redoBtn) {
    undoBtn.addEventListener('click', () => {
      const pageIdx = state.editor.activePage?.pageIndex;
      if (pageIdx !== undefined) window.restoreHistoryState(pageIdx, 'undo');
    });
    redoBtn.addEventListener('click', () => {
      const pageIdx = state.editor.activePage?.pageIndex;
      if (pageIdx !== undefined) window.restoreHistoryState(pageIdx, 'redo');
    });
  }

  // Keyboard Shortcuts for Undo/Redo (supports standard key inputs and raw layout KeyCodes)
  document.addEventListener('keydown', (e) => {
    const editorWorkspace = document.getElementById('editor-workspace');
    if (!editorWorkspace || editorWorkspace.classList.contains('hidden')) return;
    
    // Ignore keypresses inside editable text elements
    if (document.activeElement && document.activeElement.contentEditable === 'true') return;
    
    const pageIdx = state.editor.activePage?.pageIndex;
    if (pageIdx === undefined) return;
    
    const isZ = e.key.toLowerCase() === 'z' || e.code === 'KeyZ';
    const isY = e.key.toLowerCase() === 'y' || e.code === 'KeyY' || (e.shiftKey && (e.key.toLowerCase() === 'z' || e.code === 'KeyZ'));
    
    if ((e.ctrlKey || e.metaKey) && isZ && !e.shiftKey) {
      e.preventDefault();
      window.restoreHistoryState(pageIdx, 'undo');
    }
    if ((e.ctrlKey || e.metaKey) && isY) {
      e.preventDefault();
      window.restoreHistoryState(pageIdx, 'redo');
    }
  });

  // Zoom In / Zoom Out event handlers
  state.editor.zoom = 1.0;
  const zoomInBtn = document.getElementById('editor-zoom-in');
  const zoomOutBtn = document.getElementById('editor-zoom-out');
  const zoomValSpan = document.getElementById('editor-zoom-val');

  if (zoomInBtn && zoomOutBtn && zoomValSpan) {
    const updateZoom = (level) => {
      state.editor.zoom = Math.max(0.25, Math.min(2.5, level));
      zoomValSpan.textContent = `${Math.round(state.editor.zoom * 100)}%`;
      
      const floatZoomVal = document.getElementById('float-zoom-val');
      if (floatZoomVal) {
        floatZoomVal.textContent = `${Math.round(state.editor.zoom * 100)}%`;
      }
      
      const pageContainer = document.getElementById('active-page-container');
      const zoomWrapper = document.getElementById('zoom-wrapper');
      
      if (pageContainer && zoomWrapper) {
        pageContainer.style.transform = `scale(${state.editor.zoom})`;
        pageContainer.style.transformOrigin = 'left top';
        
        const baseWidth = parseFloat(pageContainer.style.width) || pageContainer.offsetWidth || 800;
        const baseHeight = parseFloat(pageContainer.style.height) || pageContainer.offsetHeight || 1100;
        
        zoomWrapper.style.width = `${baseWidth * state.editor.zoom}px`;
        zoomWrapper.style.height = `${baseHeight * state.editor.zoom}px`;
      }
    };

    window.updateEditorZoom = updateZoom;

    zoomInBtn.addEventListener('click', () => updateZoom(state.editor.zoom + 0.1));
    zoomOutBtn.addEventListener('click', () => updateZoom(state.editor.zoom - 0.1));
    
    // Wire up floating navigator zoom buttons
    const floatZoomIn = document.getElementById('float-zoom-in');
    const floatZoomOut = document.getElementById('float-zoom-out');
    const floatFitWidth = document.getElementById('float-fit-width');
    
    if (floatZoomIn) floatZoomIn.addEventListener('click', () => updateZoom(state.editor.zoom + 0.1));
    if (floatZoomOut) floatZoomOut.addEventListener('click', () => updateZoom(state.editor.zoom - 0.1));
    if (floatFitWidth) {
      floatFitWidth.addEventListener('click', () => {
        const pageContainer = document.getElementById('active-page-container');
        if (pageContainer && viewport) {
          const viewportWidth = viewport.clientWidth - 64; // pad
          const baseWidth = parseFloat(pageContainer.style.width) || pageContainer.offsetWidth || 800;
          const fitZoom = Math.max(0.25, Math.min(2.5, viewportWidth / baseWidth));
          updateZoom(fitZoom);
        }
      });
    }
  }

  // Responsive Mobile Sidebars Toggle handlers
  const toggleThumbnailsBtn = document.getElementById('mobile-toggle-thumbnails');
  const toggleOptionsBtn = document.getElementById('mobile-toggle-options');
  const sidebar = document.querySelector('.workspace-sidebar');
  const optionsSidebar = document.querySelector('.workspace-options');

  if (toggleThumbnailsBtn && sidebar) {
    toggleThumbnailsBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      sidebar.classList.toggle('open');
      if (optionsSidebar) optionsSidebar.classList.remove('open'); // close other
    });
  }

  if (toggleOptionsBtn && optionsSidebar) {
    toggleOptionsBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      optionsSidebar.classList.toggle('open');
      if (sidebar) sidebar.classList.remove('open'); // close other
    });
  }

  // Clicking on canvas viewport closes drawers on mobile
  if (viewport) {
    viewport.addEventListener('click', () => {
      if (sidebar) sidebar.classList.remove('open');
      if (optionsSidebar) optionsSidebar.classList.remove('open');
    });
  }

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
      const currentZoom = window.state?.editor?.zoomLevel || 1.2;
      el.style.fontSize = `${val * currentZoom}px`;
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

  // Text Fill Color Toggle Binds
  const textFillEnable = document.getElementById('text-fill-enable');
  const textFillColor = document.getElementById('text-fill-color');
  if (textFillEnable && textFillColor) {
    textFillEnable.addEventListener('change', (e) => {
      const isEnabled = e.target.checked;
      if (window.activeTextElement) {
        const { el, txtObj } = window.activeTextElement;
        txtObj.bgEnable = isEnabled;
        el.style.backgroundColor = isEnabled ? textFillColor.value : 'transparent';
      }
    });

    textFillColor.addEventListener('input', (e) => {
      if (window.activeTextElement && textFillEnable.checked) {
        const { el, txtObj } = window.activeTextElement;
        txtObj.bgColor = e.target.value;
        el.style.backgroundColor = e.target.value;
      }
    });
  }

  // Eraser Mode Toggle Bind
  const eraseModeSelect = document.getElementById('erase-mode');
  if (eraseModeSelect) {
    eraseModeSelect.addEventListener('change', (e) => {
      const customColorGroup = document.getElementById('options-erase-custom-color-group');
      if (customColorGroup) {
        if (e.target.value === 'custom') {
          customColorGroup.classList.remove('hidden');
        } else {
          customColorGroup.classList.add('hidden');
        }
      }
    });
  }

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
    // Force blur active element to sync final text edits
    if (document.activeElement && typeof document.activeElement.blur === 'function') {
      document.activeElement.blur();
    }
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

  // Form Fields Creation Buttons
  const addTextFieldBtn = document.getElementById('form-add-text-btn');
  const addCheckboxFieldBtn = document.getElementById('form-add-checkbox-btn');
  const addSigFieldBtn = document.getElementById('form-add-sig-btn');
  
  const createField = (type) => {
    if (!state.editor.pdfManager || !state.editor.pdfManager.pdfDoc) {
      showToast('No PDF document loaded.', 'danger');
      return;
    }
    
    const pageIndex = state.editor.pdfManager.currentPageIndex;
    const overlay = document.querySelector('.annotation-overlay');
    if (!overlay) return;
    
    const fieldObj = {
      id: 'field_' + Date.now() + '_' + Math.round(Math.random() * 1000),
      type,
      percentX: 0.35,
      percentY: 0.35,
      percentW: type === 'checkbox' ? 0.06 : 0.28,
      percentH: type === 'checkbox' ? 0.04 : 0.05,
      name: type + '_' + Math.round(Math.random() * 1000),
      placeholder: type === 'text' ? 'Type text here...' : ''
    };
    
    state.editor.pdfManager.additions[pageIndex].formFields.push(fieldObj);
    state.editor.pdfManager.renderFormFieldElement(fieldObj, overlay, pageIndex);
    
    const newlyCreatedEl = overlay.querySelector('.form-field-element:last-child');
    if (newlyCreatedEl) {
      window.selectFormField(fieldObj, newlyCreatedEl);
    }
    showToast(`Added fillable ${type} field! Drag and resize it to fit.`, 'success');
  };
  
  addTextFieldBtn.addEventListener('click', () => createField('text'));
  addCheckboxFieldBtn.addEventListener('click', () => createField('checkbox'));
  addSigFieldBtn.addEventListener('click', () => createField('signature'));

  // Form Field Inputs Change Listeners
  const fieldNameInput = document.getElementById('form-field-name-input');
  const fieldPlaceholderInput = document.getElementById('form-field-placeholder-input');
  
  fieldNameInput.addEventListener('input', (e) => {
    if (state.editor.selectedField) {
      const { fieldObj } = state.editor.selectedField;
      const sanitized = e.target.value.replace(/[^a-zA-Z0-9_-]/g, '');
      fieldObj.name = sanitized;
      e.target.value = sanitized;
      if (fieldObj.updateUI) fieldObj.updateUI();
    }
  });
  
  fieldPlaceholderInput.addEventListener('input', (e) => {
    if (state.editor.selectedField) {
      const { fieldObj } = state.editor.selectedField;
      fieldObj.placeholder = e.target.value;
    }
  });
  
  document.getElementById('form-field-delete-btn').addEventListener('click', () => {
    if (state.editor.selectedField) {
      const { fieldObj, el } = state.editor.selectedField;
      el.remove();
      
      const pageIndex = state.editor.pdfManager.currentPageIndex;
      state.editor.pdfManager.additions[pageIndex].formFields = 
        state.editor.pdfManager.additions[pageIndex].formFields.filter(f => f !== fieldObj);
        
      state.editor.selectedField = null;
      document.getElementById('form-field-editor-properties').classList.add('hidden');
      showToast('Form field removed.', 'info');
    }
  });

  closeBtn.addEventListener('click', resetEditor);
}

function resetEditor() {
  if (state.editor.pdfManager) {
    state.editor.pdfManager.pdfDoc = null;
    state.editor.pdfManager.pdfBuffer = null;
    state.editor.pdfManager.file = null;
    state.editor.pdfManager.additions = {};
  }
  state.editor.hasInitializedZoom = false;
  state.editor.zoom = 1.0;
  
  const fileInput = document.getElementById('editor-file-input');
  if (fileInput) fileInput.value = '';
  
  document.getElementById('editor-empty-state').classList.remove('hidden');
  document.getElementById('zoom-wrapper').classList.add('hidden');
  document.getElementById('active-page-container').classList.add('hidden');
  
  const floatingBar = document.getElementById('floating-navigator-bar');
  if (floatingBar) floatingBar.classList.add('hidden');
  document.getElementById('active-page-container').innerHTML = '';
  
  document.getElementById('editor-thumbnails').innerHTML = '<div class="empty-state-text">No document loaded</div>';
  
  document.getElementById('meta-info-name').textContent = '--';
  document.getElementById('meta-info-pages').textContent = '--';
  document.getElementById('meta-info-size').textContent = '--';
  
  document.getElementById('meta-title-input').value = '';
  document.getElementById('meta-author-input').value = '';
  document.getElementById('meta-subject-input').value = '';
  document.getElementById('meta-creator-input').value = '';
  document.getElementById('meta-producer-input').value = '';
  
  document.getElementById('editor-save-btn').disabled = true;
  document.getElementById('editor-print-btn').disabled = true;
  document.getElementById('editor-rotate-btn').disabled = true;
  document.getElementById('editor-close-btn').disabled = true;
  document.getElementById('ocr-page-btn').disabled = true;
  document.getElementById('editor-edit-pdf-text-btn').disabled = true;
  
  document.getElementById('form-field-editor-properties').classList.add('hidden');
  document.getElementById('options-form-field-tool').classList.add('hidden');
  document.getElementById('options-text-tool').classList.add('hidden');
  document.getElementById('options-draw-tool').classList.add('hidden');
  document.getElementById('options-erase-tool').classList.add('hidden');
  document.getElementById('options-shape-tool').classList.add('hidden');
  document.getElementById('options-stamp-tool').classList.add('hidden');
  document.getElementById('options-image-tool').classList.add('hidden');
  
  document.getElementById('options-metadata-panel').classList.remove('hidden');
  
  document.querySelectorAll('.workspace-toolbar .tool-btn').forEach(btn => btn.classList.remove('active'));
  const panBtn = document.querySelector('.workspace-toolbar .tool-btn[data-action="pan"]');
  if (panBtn) panBtn.classList.add('active');
  state.editor.activeTool = 'pan';
  
  showToast('Document cleared.', 'info');
}

function resetInactiveTools(activeViewName) {
  // Clear all file inputs' values so re-uploading the same file works
  const fileInputs = document.querySelectorAll('input[type="file"]');
  fileInputs.forEach(input => {
    input.value = '';
  });

  const safeDOM = {
    hide: (id) => {
      const el = document.getElementById(id);
      if (el) el.classList.add('hidden');
    },
    show: (id) => {
      const el = document.getElementById(id);
      if (el) el.classList.remove('hidden');
    },
    html: (id, htmlContent) => {
      const el = document.getElementById(id);
      if (el) el.innerHTML = htmlContent;
    },
    text: (id, textContent) => {
      const el = document.getElementById(id);
      if (el) el.textContent = textContent;
    },
    val: (id, valContent) => {
      const el = document.getElementById(id);
      if (el) el.value = valContent;
    },
    disable: (id, isDisabled) => {
      const el = document.getElementById(id);
      if (el) el.disabled = isDisabled;
    }
  };

  // 1. Reset Editor
  if (activeViewName !== 'editor') {
    if (state.editor.pdfManager) {
      state.editor.pdfManager.pdfDoc = null;
      state.editor.pdfManager.pdfBuffer = null;
      state.editor.pdfManager.file = null;
      state.editor.pdfManager.additions = {};
    }
    
    safeDOM.val('editor-file-input', '');
    safeDOM.show('editor-empty-state');
    safeDOM.hide('zoom-wrapper');
    safeDOM.hide('active-page-container');
    safeDOM.html('active-page-container', '');
    safeDOM.html('editor-thumbnails', '<div class="empty-state-text">No document loaded</div>');
    
    safeDOM.text('meta-info-name', '--');
    safeDOM.text('meta-info-pages', '--');
    safeDOM.text('meta-info-size', '--');
    
    safeDOM.disable('editor-save-btn', true);
    safeDOM.disable('editor-print-btn', true);
    safeDOM.disable('editor-rotate-btn', true);
    safeDOM.disable('editor-close-btn', true);
    safeDOM.disable('ocr-page-btn', true);
    safeDOM.disable('editor-edit-pdf-text-btn', true);
    
    safeDOM.hide('form-field-editor-properties');
    safeDOM.hide('options-form-field-tool');
    safeDOM.hide('options-text-tool');
    safeDOM.hide('options-draw-tool');
    safeDOM.hide('options-erase-tool');
    safeDOM.hide('options-shape-tool');
    safeDOM.hide('options-stamp-tool');
    safeDOM.hide('options-image-tool');
    safeDOM.show('options-metadata-panel');
    
    document.querySelectorAll('.workspace-toolbar .tool-btn').forEach(btn => btn.classList.remove('active'));
    const panBtn = document.querySelector('.workspace-toolbar .tool-btn[data-action="pan"]');
    if (panBtn) panBtn.classList.add('active');
    state.editor.activeTool = 'pan';
  }

  // 2. Reset Merge
  if (activeViewName !== 'merge') {
    state.merge.files = [];
    state.merge.pages = [];
    safeDOM.show('merge-upload-zone');
    safeDOM.hide('merge-files-container');
    safeDOM.html('merge-grid', '');
  }

  // 3. Reset Split
  if (activeViewName !== 'split') {
    state.split.file = null;
    state.split.pageCount = 0;
    safeDOM.show('split-upload-zone');
    safeDOM.hide('split-setup-container');
    safeDOM.val('split-single-pages', '');
    safeDOM.val('split-range-pages', '');
    safeDOM.html('split-preview-sidebar', '');
  }

  // 4. Reset Organize
  if (activeViewName !== 'organize') {
    state.organize.file = null;
    state.organize.pages = [];
    safeDOM.show('organize-upload-zone');
    safeDOM.hide('organize-workspace');
    safeDOM.html('organize-grid', '');
  }

  // 5. Reset JPG to PDF
  if (activeViewName !== 'jpg-to-pdf') {
    state.jpgToPdf.files = [];
    safeDOM.show('jpg-to-pdf-upload-zone');
    safeDOM.hide('jpg-to-pdf-container');
    safeDOM.html('jpg-to-pdf-list', '');
  }

  // 6. Reset PDF to JPG
  if (activeViewName !== 'pdf-to-jpg') {
    state.pdfToJpg.file = null;
    state.pdfToJpg.pageCount = 0;
    safeDOM.show('pdf-to-jpg-upload-zone');
    safeDOM.hide('pdf-to-jpg-setup');
  }

  // 7. Reset Word to PDF
  if (activeViewName !== 'word-to-pdf') {
    state.wordToPdf.file = null;
    safeDOM.show('word-upload-zone');
    safeDOM.hide('word-setup-container');
  }

  // 8. Reset Excel to PDF
  if (activeViewName !== 'excel-to-pdf') {
    state.excelToPdf.file = null;
    safeDOM.show('excel-upload-zone');
    safeDOM.hide('excel-setup-container');
  }

  // 9. Reset Watermark
  if (activeViewName !== 'watermark') {
    state.watermark.file = null;
    state.watermark.imageFile = null;
    state.watermark.imageBuffer = null;
    state.watermark.imageMime = null;
    state.watermark.pageCount = 0;
    safeDOM.show('watermark-upload-zone');
    safeDOM.hide('watermark-layout');
    const watermarkCanvas = document.getElementById('watermark-canvas');
    if (watermarkCanvas) {
      const ctx = watermarkCanvas.getContext('2d');
      ctx.clearRect(0, 0, watermarkCanvas.width, watermarkCanvas.height);
    }
    safeDOM.val('watermark-text', 'CONFIDENTIAL');
    safeDOM.hide('watermark-image-file');
  }

  // 10. Reset Compress
  if (activeViewName !== 'compress') {
    state.compress.file = null;
    state.compress.pageCount = 0;
    safeDOM.show('compress-upload-zone');
    safeDOM.hide('compress-setup-container');
  }

  // 11. Reset Security
  if (activeViewName !== 'security') {
    state.security.file = null;
    state.security.isLocked = false;
    state.security.password = '';
    safeDOM.show('security-upload-zone');
    safeDOM.hide('security-setup-container');
    safeDOM.hide('security-decrypt-group');
    safeDOM.show('security-encrypt-group');
    safeDOM.val('security-decrypt-password', '');
    safeDOM.val('security-encrypt-password', '');
  }

  // 12. Reset Page Numbering
  if (activeViewName !== 'numbering') {
    state.numbering.file = null;
    state.numbering.pageCount = 0;
    safeDOM.show('numbering-upload-zone');
    safeDOM.hide('numbering-setup-container');
  }

  // 13. Reset Batch Actions
  if (activeViewName !== 'batch') {
    state.batch.files = [];
    safeDOM.show('batch-upload-zone');
    safeDOM.hide('batch-setup-container');
    safeDOM.html('batch-files-grid', '');
  }

  // 14. Reset Compare PDFs
  if (activeViewName !== 'compare') {
    state.compare.fileA = null;
    state.compare.fileB = null;
    safeDOM.show('compare-upload-zone');
    safeDOM.hide('compare-results-container');
    safeDOM.html('compare-diff-output', '');
    safeDOM.html('compare-metadata-table-body', '');
    safeDOM.hide('compare-submit-btn');
    safeDOM.html('compare-a-status', 'Drag file here or <span class="highlight">browse</span>');
    safeDOM.html('compare-b-status', 'Drag file here or <span class="highlight">browse</span>');
  }

  // 15. Reset Scanner
  if (activeViewName !== 'scanner') {
    state.scanner.file = null;
    state.scanner.originalImg = null;
    state.scanner.corners = [];
    safeDOM.show('scan-upload-zone');
    safeDOM.hide('scan-editor-container');
    const scanCanvas = document.getElementById('scan-canvas');
    if (scanCanvas) {
      const ctx = scanCanvas.getContext('2d');
      ctx.clearRect(0, 0, scanCanvas.width, scanCanvas.height);
    }
  }

  // 16. Reset Formbuilder
  if (activeViewName !== 'formbuilder') {
    if (state.formbuilder) {
      state.formbuilder.file = null;
      state.formbuilder.pdfBytes = null;
      state.formbuilder.pdfDoc = null;
      state.formbuilder.fields = [];
      state.formbuilder.selectedFieldId = null;
    }
    safeDOM.show('formbuilder-upload-container');
    safeDOM.hide('formbuilder-workspace-container');
  }

  // 17. Reset Remove Pages
  if (activeViewName !== 'remove') {
    state.remove.file = null;
    state.remove.pageCount = 0;
    safeDOM.show('remove-upload-zone');
    safeDOM.hide('remove-setup');
    safeDOM.val('remove-pages-input', '');
  }

  // 18. Reset Extract Pages
  if (activeViewName !== 'extract') {
    state.extract.file = null;
    state.extract.pageCount = 0;
    safeDOM.show('extract-upload-zone');
    safeDOM.hide('extract-setup');
    safeDOM.val('extract-pages-input', '');
  }

  // 19. Reset Repair PDF
  if (activeViewName !== 'repair') {
    state.repair.file = null;
    safeDOM.show('repair-upload-zone');
    safeDOM.hide('repair-setup');
  }

  // 20. Reset PPTX to PDF
  if (activeViewName !== 'pptx-to-pdf') {
    state.pptxToPdf.file = null;
    safeDOM.show('pptx-to-pdf-upload-zone');
    safeDOM.hide('pptx-to-pdf-setup');
  }

  // 21. Reset HTML to PDF
  if (activeViewName !== 'html-to-pdf') {
    state.htmlToPdf.file = null;
    safeDOM.show('html-to-pdf-upload-zone');
    safeDOM.hide('html-to-pdf-setup');
  }

  // 22. Reset PDF to Word
  if (activeViewName !== 'pdf-to-word') {
    state.pdfToWord.file = null;
    state.pdfToWord.pageCount = 0;
    safeDOM.show('pdf-to-word-upload-zone');
    safeDOM.hide('pdf-to-word-setup');
  }

  // 23. Reset PDF to PowerPoint
  if (activeViewName !== 'pdf-to-powerpoint') {
    state.pdfToPowerpoint.file = null;
    state.pdfToPowerpoint.pageCount = 0;
    safeDOM.show('pdf-to-powerpoint-upload-zone');
    safeDOM.hide('pdf-to-powerpoint-setup');
  }

  // 24. Reset PDF to Excel
  if (activeViewName !== 'pdf-to-excel') {
    state.pdfToExcel.file = null;
    state.pdfToExcel.pageCount = 0;
    safeDOM.show('pdf-to-excel-upload-zone');
    safeDOM.hide('pdf-to-excel-setup');
  }

  // 25. Reset PDF to PDF/A
  if (activeViewName !== 'pdf-to-pdf-a') {
    state.pdfToPdfA.file = null;
    state.pdfToPdfA.pageCount = 0;
    safeDOM.show('pdf-to-pdf-a-upload-zone');
    safeDOM.hide('pdf-to-pdf-a-setup');
  }

  // 26. Reset Crop
  if (activeViewName !== 'crop') {
    state.crop.file = null;
    state.crop.pageCount = 0;
    safeDOM.show('crop-upload-zone');
    safeDOM.hide('crop-setup');
    safeDOM.val('crop-margin-input', '10');
  }

  // 27. Reset Redact
  if (activeViewName !== 'redact') {
    state.redact.file = null;
    state.redact.pageCount = 0;
    safeDOM.show('redact-upload-zone');
    safeDOM.hide('redact-setup');
    safeDOM.val('redact-text-input', '');
  }

  // 28. Reset Translate
  if (activeViewName !== 'translate') {
    state.translate.file = null;
    state.translate.pageCount = 0;
    safeDOM.show('translate-upload-zone');
    safeDOM.hide('translate-setup');
    safeDOM.val('translate-lang-input', 'es');
  }

  // 29. Reset PDF to Markdown
  if (activeViewName !== 'pdf-to-markdown') {
    state.pdfToMarkdown.file = null;
    state.pdfToMarkdown.pageCount = 0;
    safeDOM.show('pdf-to-markdown-upload-zone');
    safeDOM.hide('pdf-to-markdown-setup');
  }

  // 30. Reset AI Copilot
  if (activeViewName !== 'copilot') {
    state.copilot.file = null;
    state.copilot.documentText = '';
    state.copilot.extractedData = null;
    state.copilot.lastResponse = '';
    state.copilot.originalBuffer = null;
    
    safeDOM.show('copilot-upload-zone');
    safeDOM.hide('copilot-preview-container');
    safeDOM.hide('copilot-toolbar-tabs');
    safeDOM.disable('copilot-download-btn', true);
    safeDOM.html('copilot-chat-history', `
      <div style="background: var(--bg-tertiary); padding: 0.75rem; border-radius: var(--border-radius-sm); font-size: 0.8125rem; color: var(--text-secondary); border-left: 3px solid var(--accent-purple);">
        <p><strong>Copilot:</strong> Hello! Upload your document, then write a query or request a summary in the input below. I can reformat tables, extract data, translate, or summarize into Word, Excel, or PDF formats!</p>
      </div>
    `);
    safeDOM.val('copilot-prompt-input', '');
  }
}

function injectWorkspaceCancelButtons() {
  const setupContainers = [
    { id: 'merge-files-container', tool: 'merge' },
    { id: 'split-setup-container', tool: 'split' },
    { id: 'organize-workspace', tool: 'organize' },
    { id: 'jpg-to-pdf-container', tool: 'jpg-to-pdf' },
    { id: 'pdf-to-jpg-setup', tool: 'pdf-to-jpg' },
    { id: 'word-setup-container', tool: 'word-to-pdf' },
    { id: 'excel-setup-container', tool: 'excel-to-pdf' },
    { id: 'watermark-sidebar-options', tool: 'watermark' },
    { id: 'compress-setup-container', tool: 'compress' },
    { id: 'security-setup-container', tool: 'security' },
    { id: 'numbering-setup-container', tool: 'numbering' },
    { id: 'batch-setup-container', tool: 'batch' },
    { id: 'compare-results-container', tool: 'compare' },
    { id: 'scan-editor-container', tool: 'scanner' },
    { id: 'remove-setup', tool: 'remove' },
    { id: 'extract-setup', tool: 'extract' },
    { id: 'repair-setup', tool: 'repair' },
    { id: 'pptx-to-pdf-setup', tool: 'pptx-to-pdf' },
    { id: 'html-to-pdf-setup', tool: 'html-to-pdf' },
    { id: 'pdf-to-word-setup', tool: 'pdf-to-word' },
    { id: 'pdf-to-powerpoint-setup', tool: 'pdf-to-powerpoint' },
    { id: 'pdf-to-excel-setup', tool: 'pdf-to-excel' },
    { id: 'pdf-to-pdf-a-setup', tool: 'pdf-to-pdf-a' },
    { id: 'crop-setup', tool: 'crop' },
    { id: 'redact-setup', tool: 'redact' },
    { id: 'translate-setup', tool: 'translate' },
    { id: 'pdf-to-markdown-setup', tool: 'pdf-to-markdown' }
  ];

  setupContainers.forEach(cfg => {
    const el = document.getElementById(cfg.id);
    if (!el) return;
    
    // Create Discard button
    const cancelBtn = document.createElement('button');
    cancelBtn.className = 'btn btn-secondary btn-cancel-workspace';
    cancelBtn.style.width = '100%';
    cancelBtn.style.marginTop = '1rem';
    cancelBtn.style.display = 'flex';
    cancelBtn.style.alignItems = 'center';
    cancelBtn.style.justifyContent = 'center';
    cancelBtn.style.gap = '0.5rem';
    cancelBtn.innerHTML = '<i data-lucide="x-circle" style="width:16px; height:16px;"></i> Discard & Change File';
    
    // Position it
    if (cfg.id === 'organize-workspace' || cfg.id === 'merge-files-container' || cfg.id === 'jpg-to-pdf-container') {
      el.insertBefore(cancelBtn, el.firstChild);
    } else {
      el.appendChild(cancelBtn);
    }
    
    // Bind reset action
    cancelBtn.addEventListener('click', (e) => {
      e.preventDefault();
      resetInactiveTools(''); // reset all
      showToast('File discarded.', 'info');
    });
  });
  
  if (window.lucide) window.lucide.createIcons();
}

// History State snapshots (Undo/Redo)
state.editor.history = {};

function copyAdditions(arr) {
  if (!arr) return [];
  return arr.map(item => JSON.parse(JSON.stringify(item)));
}

function getHistoryState(pageIndex) {
  if (!state.editor.history[pageIndex]) {
    state.editor.history[pageIndex] = { snapshots: [], index: -1 };
  }
  return state.editor.history[pageIndex];
}

window.saveHistoryState = (pageIndex) => {
  const page = state.editor.activePage;
  if (!page || !page.drawingCanvas) return;
  
  const history = getHistoryState(pageIndex);
  
  // Truncate redo snapshots if we are ahead of history.index
  if (history.index < history.snapshots.length - 1) {
    history.snapshots = history.snapshots.slice(0, history.index + 1);
  }
  
  const snapshot = {
    canvasDataUrl: page.drawingCanvas.toDataURL(),
    text: copyAdditions(state.editor.pdfManager.additions[pageIndex].text),
    signatures: copyAdditions(state.editor.pdfManager.additions[pageIndex].signatures),
    formFields: copyAdditions(state.editor.pdfManager.additions[pageIndex].formFields),
    erasedRects: copyAdditions(state.editor.pdfManager.additions[pageIndex].erasedRects)
  };
  
  history.snapshots.push(snapshot);
  history.index++;
  
  window.updateUndoRedoButtons();
};
  
window.restoreHistoryState = (pageIndex, direction) => {
  const history = getHistoryState(pageIndex);
  if (direction === 'undo' && history.index > 0) {
    history.index--;
  } else if (direction === 'redo' && history.index < history.snapshots.length - 1) {
    history.index++;
  } else {
    return;
  }
  
  const snapshot = history.snapshots[history.index];
  if (!snapshot) return;
  
  const page = state.editor.activePage;
  if (!page) return;
  
  // Restore Additions
  state.editor.pdfManager.additions[pageIndex].text = copyAdditions(snapshot.text);
  state.editor.pdfManager.additions[pageIndex].signatures = copyAdditions(snapshot.signatures);
  state.editor.pdfManager.additions[pageIndex].formFields = copyAdditions(snapshot.formFields);
  state.editor.pdfManager.additions[pageIndex].erasedRects = copyAdditions(snapshot.erasedRects || []);
  
  // Restore Drawing Canvas
  const ctx = page.drawingCanvas.getContext('2d');
  ctx.clearRect(0, 0, page.drawingCanvas.width, page.drawingCanvas.height);
  
  const img = new Image();
  img.onload = () => {
    ctx.drawImage(img, 0, 0);
  };
  img.src = snapshot.canvasDataUrl;
  
  // Clear and rebuild annotations overlay
  page.annotationOverlay.innerHTML = '';
  
  state.editor.pdfManager.additions[pageIndex].text.forEach(txtObj => {
    state.editor.pdfManager.renderTextElement(txtObj, page.annotationOverlay, pageIndex);
  });
  
  state.editor.pdfManager.additions[pageIndex].signatures.forEach(sigObj => {
    state.editor.pdfManager.renderSignatureElement(sigObj, page.annotationOverlay, pageIndex);
  });
  
  state.editor.pdfManager.additions[pageIndex].formFields.forEach(fieldObj => {
    state.editor.pdfManager.renderFormFieldElement(fieldObj, page.annotationOverlay, pageIndex);
  });
  
  window.updateUndoRedoButtons();
};

window.updateUndoRedoButtons = () => {
  const pageIdx = state.editor.activePage?.pageIndex;
  if (pageIdx === undefined) return;
  
  const history = getHistoryState(pageIdx);
  const undoBtn = document.getElementById('editor-undo-btn');
  const redoBtn = document.getElementById('editor-redo-btn');
  
  if (undoBtn) undoBtn.disabled = history.index <= 0;
  if (redoBtn) redoBtn.disabled = history.index >= history.snapshots.length - 1;
};

window.updateTextInspector = (txtObj) => {
  document.getElementById('text-font').value = txtObj.fontFamily || "'Inter', sans-serif";
  document.getElementById('text-size').value = txtObj.size || 18;
  document.getElementById('text-color').value = txtObj.color || '#000000';
  
  const fillEnable = document.getElementById('text-fill-enable');
  const fillColor = document.getElementById('text-fill-color');
  if (fillEnable && fillColor) {
    fillEnable.checked = !!txtObj.bgEnable;
    fillColor.value = txtObj.bgColor || '#ffffff';
  }
  
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

window.selectFormField = (fieldObj, el) => {
  state.editor.selectedField = { fieldObj, el };
  
  // Highlight selected element, reset others
  document.querySelectorAll('.form-field-element').forEach(item => {
    item.style.borderColor = '#2563eb';
    item.style.background = 'rgba(59, 130, 246, 0.22)';
  });
  el.style.borderColor = '#10b981';
  el.style.background = 'rgba(16, 185, 129, 0.2)';
  
  // Populate properties input
  document.getElementById('form-field-name-input').value = fieldObj.name;
  
  const placeholderGroup = document.getElementById('form-field-placeholder-group');
  if (fieldObj.type === 'text') {
    placeholderGroup.classList.remove('hidden');
    document.getElementById('form-field-placeholder-input').value = fieldObj.placeholder || '';
  } else {
    placeholderGroup.classList.add('hidden');
  }
  
  document.getElementById('form-field-editor-properties').classList.remove('hidden');
};

window.onFormFieldDeleted = (fieldObj) => {
  if (state.editor.selectedField && state.editor.selectedField.fieldObj === fieldObj) {
    state.editor.selectedField = null;
    document.getElementById('form-field-editor-properties').classList.add('hidden');
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
  document.getElementById('options-form-field-tool').classList.add('hidden');
  
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
  } else if (tool === 'formfield') {
    document.getElementById('options-form-field-tool').classList.remove('hidden');
  } else if (tool === 'signature') {
    if (!state.editor.activeSignatureDataUrl) {
      openSignatureModal();
    } else {
      showToast('Signature/Image loaded. Click on the document to place it.', 'info');
    }
  } else {
    document.getElementById('options-metadata-panel').classList.remove('hidden');
  }

  // Adjust pointer events dynamically so the drawing canvas doesn't block clicks on forms and text boxes
  if (tool === 'fontdetect') {
    showToast('Font ID mode active! Click on document text to detect its font.', 'info');
  }

  const overlay = document.querySelector('.annotation-overlay');
  const drawingCanvas = document.querySelector('.drawing-canvas');
  const pageContainer = document.getElementById('active-page-container');
  if (overlay && drawingCanvas) {
    const isDrawingTool = tool === 'draw' || tool === 'erase' || tool === 'shape' || tool === 'stamp';
    
    if (pageContainer) {
      pageContainer.style.touchAction = isDrawingTool ? 'none' : 'pan-x pan-y';
    }
    drawingCanvas.style.touchAction = isDrawingTool ? 'none' : 'pan-x pan-y';
    overlay.style.touchAction = isDrawingTool ? 'none' : 'pan-x pan-y';

    if (tool === 'fontdetect') {
      overlay.style.pointerEvents = 'auto';
      drawingCanvas.style.pointerEvents = 'none';
      overlay.style.cursor = 'crosshair';
    } else {
      overlay.style.cursor = 'default';
      if (tool === 'draw' || tool === 'erase') {
        overlay.style.pointerEvents = 'none';
        drawingCanvas.style.pointerEvents = 'auto';
      } else {
        overlay.style.pointerEvents = 'auto';
        drawingCanvas.style.pointerEvents = 'none';
      }
    }
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

  // Set up activePage global state
  state.editor.activePage = {
    pageIndex,
    annotationOverlay: renderData.annotationOverlay,
    drawingCanvas: renderData.drawingCanvas,
    pdfRenderCanvas: renderData.canvas
  };

  // Initialize history stack with current state if empty
  if (!state.editor.history[pageIndex] || state.editor.history[pageIndex].snapshots.length === 0) {
    window.saveHistoryState(pageIndex);
  } else {
    window.updateUndoRedoButtons();
  }
  
  // Set pointer events based on currently selected tool for the newly loaded page
  const activeTool = state.editor.activeTool;
  if (activeTool === 'draw' || activeTool === 'erase') {
    renderData.annotationOverlay.style.pointerEvents = 'none';
    renderData.drawingCanvas.style.pointerEvents = 'auto';
  } else {
    renderData.annotationOverlay.style.pointerEvents = 'auto';
    renderData.drawingCanvas.style.pointerEvents = 'none';
    if (activeTool === 'fontdetect') {
      renderData.annotationOverlay.style.cursor = 'crosshair';
    }
  }
  
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
      
      const fillEnable = document.getElementById('text-fill-enable');
      const fillColor = document.getElementById('text-fill-color');

      const txtObj = {
        percentX,
        percentY,
        text: 'Click to edit text',
        size: parseInt(sizeInput.value, 10),
        color: colorInput.value,
        fontFamily: fontSelect.value,
        isBold: boldBtn.classList.contains('active'),
        isItalic: italicBtn.classList.contains('active'),
        bgEnable: fillEnable ? fillEnable.checked : false,
        bgColor: fillColor ? fillColor.value : '#ffffff',
        overlayWidth: rect.width,
        overlayHeight: rect.height
      };
      
      state.editor.pdfManager.additions[pageIndex].text.push(txtObj);
      state.editor.pdfManager.renderTextElement(txtObj, renderData.annotationOverlay, pageIndex);
      window.saveHistoryState(pageIndex);
      
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
      window.saveHistoryState(pageIndex);
      
      // Reset back to pan tool
      document.querySelector('[data-action="pan"]').click();
    } else if (state.editor.activeTool === 'fontdetect') {
      state.editor.pdfManager.detectFontAtPercent(pageIndex, percentX, percentY).then(fontResult => {
        if (fontResult && fontResult.fontFamily) {
          showToast(`Detected Font: ${fontResult.fontFamily} (Matches text: "${fontResult.text}")`, 'success');
          
          // Update font selector dropdown
          const fontSelect = document.getElementById('text-font');
          if (fontSelect) {
            let matchedVal = null;
            const detectedLower = fontResult.fontFamily.toLowerCase();
            
            for (let option of fontSelect.options) {
              if (option.value.toLowerCase().includes(detectedLower) || detectedLower.includes(option.text.toLowerCase())) {
                matchedVal = option.value;
                break;
              }
            }
            
            if (matchedVal) {
              fontSelect.value = matchedVal;
              showToast(`Automatically updated editor font to: ${fontSelect.options[fontSelect.selectedIndex].text}!`, 'info');
            }
          }
          
          // Switch back to Text tool immediately so they can write
          const textBtn = document.querySelector('[data-action="text"]');
          if (textBtn) textBtn.click();
        } else {
          showToast('No text or font detected at this location. Try clicking directly on a word.', 'warning');
        }
      });
    }
  });

  // Highlighting active page thumbnail
  document.querySelectorAll('.thumbnail-wrapper').forEach((thumb, idx) => {
    if (idx === pageIndex) thumb.classList.add('active');
    else thumb.classList.remove('active');
  });

  // Update floating page navigator count
  const floatPageNum = document.getElementById('float-page-num');
  if (floatPageNum && state.editor.pdfManager) {
    floatPageNum.textContent = `${pageIndex + 1} / ${state.editor.pdfManager.numPages}`;
  }

  // Calculate default fit-to-width zoom level on first load
  if (!state.editor.hasInitializedZoom) {
    const viewport = document.getElementById('canvas-viewport');
    const baseWidth = renderData.drawingCanvas.width || 800;
    
    if (viewport && baseWidth > 0) {
      const clientW = viewport.clientWidth - 48; // allowing padding
      if (clientW < baseWidth) {
        state.editor.zoom = Math.max(0.3, Math.min(1.0, clientW / baseWidth));
      } else {
        state.editor.zoom = 1.0;
      }
    }
    state.editor.hasInitializedZoom = true;
  }

  // Apply current zoom factor and zoom-wrapper sizes
  if (window.updateEditorZoom) {
    window.updateEditorZoom(state.editor.zoom);
  }
  
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

  let activeEraseColor = '#ffffff';

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
      const pageIdx = state.editor.activePage?.pageIndex;
      if (pageIdx !== undefined) {
        window.saveHistoryState(pageIdx);
      }
    } else if (tool === 'erase') {
      const mode = document.getElementById('erase-mode').value;
      if (mode === 'camouflage') {
        const pdfCanvas = canvas.parentElement.querySelector('.pdf-render-canvas');
        if (pdfCanvas) {
          const pdfCtx = pdfCanvas.getContext('2d');
          const rect = canvas.getBoundingClientRect();
          const clientX = e.touches ? e.touches[0].clientX : e.clientX;
          const clientY = e.touches ? e.touches[0].clientY : e.clientY;
          
          const x = Math.max(0, Math.min(pdfCanvas.width - 1, (clientX - rect.left) * (pdfCanvas.width / rect.width)));
          const y = Math.max(0, Math.min(pdfCanvas.height - 1, (clientY - rect.top) * (pdfCanvas.height / rect.height)));
          
          const pixel = pdfCtx.getImageData(x, y, 1, 1).data;
          const r = pixel[0];
          const g = pixel[1];
          const b = pixel[2];
          activeEraseColor = "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
        } else {
          activeEraseColor = '#ffffff';
        }
      } else if (mode === 'whiteout') {
        activeEraseColor = '#ffffff';
      } else if (mode === 'custom') {
        activeEraseColor = document.getElementById('erase-color').value;
      }
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
      const mode = document.getElementById('erase-mode').value;
      const width = document.getElementById('erase-width').value;
      
      if (mode === 'drawings') {
        ctx.globalCompositeOperation = 'destination-out';
        ctx.strokeStyle = 'rgba(0,0,0,1)';
      } else {
        ctx.globalCompositeOperation = 'source-over';
        ctx.strokeStyle = activeEraseColor;
      }
      
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
    if (isDragging) {
      isDragging = false;
      savedImageData = null;
      
      const pageIdx = state.editor.activePage?.pageIndex;
      if (pageIdx !== undefined) {
        window.saveHistoryState(pageIdx);
      }
    }
  };

  // Clean up previous event listeners if setupDrawingLayer is recalled
  if (state.editor.cleanupDrawingListeners) {
    state.editor.cleanupDrawingListeners();
  }

  canvas.addEventListener('mousedown', start);
  canvas.addEventListener('mousemove', draw);
  document.addEventListener('mouseup', stop);

  canvas.addEventListener('touchstart', start, { passive: false });
  canvas.addEventListener('touchmove', draw, { passive: false });
  document.addEventListener('touchend', stop);

  state.editor.cleanupDrawingListeners = () => {
    canvas.removeEventListener('mousedown', start);
    canvas.removeEventListener('mousemove', draw);
    document.removeEventListener('mouseup', stop);

    canvas.removeEventListener('touchstart', start);
    canvas.removeEventListener('touchmove', draw);
    document.removeEventListener('touchend', stop);
  };
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
  const makeEditableBtn = document.getElementById('ocr-make-editable-btn');
  
  ocrPageBtn.addEventListener('click', async () => {
    const pageCanvas = document.querySelector('.pdf-render-canvas');
    if (!pageCanvas) return;
    
    showLoader('Initializing Tesseract OCR worker...');
    try {
      const data = await runOcrOnCanvas(pageCanvas, (percent) => {
        document.getElementById('spinner-text').textContent = `Analyzing page text... ${percent}%`;
      });
      
      state.editor.lastOcrData = data;
      document.getElementById('ocr-text-output').value = data.text || 'No text found on this page.';
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

  makeEditableBtn.addEventListener('click', () => {
    const ocrData = state.editor.lastOcrData;
    if (!ocrData || !ocrData.lines) {
      showToast('No OCR text lines available to convert.', 'warning');
      return;
    }
    
    const pageIdx = state.editor.activePage?.pageIndex;
    if (pageIdx === undefined) return;
    
    const overlay = state.editor.activePage.annotationOverlay;
    const overlayRect = overlay.getBoundingClientRect();
    const pdfCanvas = state.editor.activePage.drawingCanvas;
    const pdfCtx = pdfCanvas.getContext('2d');
    
    showLoader('Converting scanned text to editable layers...');
    
    setTimeout(() => {
      try {
        let count = 0;
        ocrData.lines.forEach(line => {
          if (!line.text || line.text.trim().length === 0) return;
          
          const bbox = line.bbox;
          if (!bbox) return;
          
          const percentX = bbox.x0 / pdfCanvas.width;
          const percentY = bbox.y0 / pdfCanvas.height;
          const percentW = (bbox.x1 - bbox.x0) / pdfCanvas.width;
          const percentH = (bbox.y1 - bbox.y0) / pdfCanvas.height;
          
          // Sample paper color at top-left corner
          const pixel = pdfCtx.getImageData(
            Math.max(0, Math.min(pdfCanvas.width - 1, bbox.x0 - 2)),
            Math.max(0, Math.min(pdfCanvas.height - 1, bbox.y0 - 2)),
            1, 1
          ).data;
          const r = pixel[0];
          const g = pixel[1];
          const b = pixel[2];
          const bgColor = "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
          
          const cssHeight = percentH * overlayRect.height;
          const fontSize = Math.max(10, Math.round(cssHeight * 0.72));
          
          const txtObj = {
            percentX,
            percentY,
            percentW,
            percentH,
            text: line.text.trim(),
            size: fontSize,
            color: '#000000',
            fontFamily: "'Inter', sans-serif",
            isBold: false,
            isItalic: false,
            bgEnable: true, // auto cover original scanned text!
            bgColor: bgColor,
            overlayWidth: overlayRect.width,
            overlayHeight: overlayRect.height
          };
          
          state.editor.pdfManager.additions[pageIdx].text.push(txtObj);
          state.editor.pdfManager.renderTextElement(txtObj, overlay, pageIdx);
          count++;
        });
        
        if (count > 0) {
          window.saveHistoryState(pageIdx);
          showToast(`Converted ${count} text blocks! Scanned text is now editable.`, 'success');
        } else {
          showToast('No text blocks found to convert.', 'info');
        }
        modal.classList.add('hidden');
      } catch (e) {
        console.error(e);
        showToast('Failed to convert scanned text.', 'danger');
      } finally {
        hideLoader();
      }
    }, 50);
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

// Triggers native browser download after a 5-second unskippable ad countdown
function downloadBlob(blob, filename) {
  const downloadAdModal = document.getElementById('download-ad-modal');
  const downloadAdTimer = document.getElementById('download-ad-timer');
  const downloadAdProgress = document.getElementById('download-ad-progress');
  
  if (!downloadAdModal || !downloadAdTimer || !downloadAdProgress) {
    // Fallback: trigger immediate download if elements are missing
    triggerImmediateDownload(blob, filename);
    return;
  }
  
  // Show the unskippable ad modal
  downloadAdModal.classList.remove('hidden');
  
  let timeLeft = 5;
  downloadAdTimer.textContent = `Please wait ${timeLeft}s`;
  downloadAdProgress.style.width = '0%';
  
  const interval = setInterval(() => {
    timeLeft--;
    downloadAdTimer.textContent = `Please wait ${timeLeft}s`;
    downloadAdProgress.style.width = `${((5 - timeLeft) / 5) * 100}%`;
    
    if (timeLeft <= 0) {
      clearInterval(interval);
      downloadAdModal.classList.add('hidden');
      triggerImmediateDownload(blob, filename);
    }
  }, 1000);
}

function triggerImmediateDownload(blob, filename) {
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
    state.watermark.imageMime = 'image/png'; // We normalize to PNG
    
    const imgUrl = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      const maxDim = 1500; // Limit max resolution to prevent huge PDF files and weird scaling
      let w = img.width;
      let h = img.height;
      if (w > maxDim || h > maxDim) {
        if (w > h) { h = Math.round(h * maxDim / w); w = maxDim; }
        else { w = Math.round(w * maxDim / h); h = maxDim; }
      }
      const tempCanvas = document.createElement('canvas');
      tempCanvas.width = w;
      tempCanvas.height = h;
      const ctx = tempCanvas.getContext('2d');
      ctx.drawImage(img, 0, 0, w, h);
      
      tempCanvas.toBlob(blob => {
        blob.arrayBuffer().then(buffer => {
          state.watermark.imageBuffer = buffer;
          updateWatermarkPreview();
        });
      }, 'image/png');
      URL.revokeObjectURL(imgUrl);
    };
    img.src = imgUrl;
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

let isWatermarkPreviewRendering = false;
let watermarkPreviewPending = false;

// Visual Preview Rendering (HTML5 Canvas)
async function updateWatermarkPreview() {
  if (!state.watermark.file) return;
  
  if (isWatermarkPreviewRendering) {
    watermarkPreviewPending = true;
    return;
  }
  isWatermarkPreviewRendering = true;
  
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
    // The preview PDF page is scaled to 0.8, so we must scale the watermark dimensions by 0.8 to match exactly.
    const previewScale = 0.8;
    
    if (type === 'text') {
      const text = document.getElementById('watermark-text').value || 'CONFIDENTIAL';
      const fontSize = (parseInt(document.getElementById('watermark-font-size').value, 10) || 60) * previewScale;
      const color = document.getElementById('watermark-color').value || '#ff0000';
      const rotation = parseInt(document.getElementById('watermark-rotation').value, 10) || -45;
      
      ctx.font = `bold ${fontSize}px sans-serif`;
      ctx.fillStyle = color;
      
      const metrics = ctx.measureText(text);
      const textWidth = metrics.width;
      const textHeight = fontSize; // estimate height
      
      let cx = 0;
      let cy = 0;
      
      if (position === 'center') {
        cx = canvas.width / 2;
        cy = canvas.height / 2;
      } else if (position === 'top-left') {
        cx = textWidth / 2 + 40 * previewScale;
        cy = textHeight + 40 * previewScale;
      } else if (position === 'top-right') {
        cx = canvas.width - textWidth / 2 - 40 * previewScale;
        cy = textHeight + 40 * previewScale;
      } else if (position === 'bottom-left') {
        cx = textWidth / 2 + 40 * previewScale;
        cy = canvas.height - 40 * previewScale;
      } else if (position === 'bottom-right') {
        cx = canvas.width - textWidth / 2 - 40 * previewScale;
        cy = canvas.height - 40 * previewScale;
      }
      
      ctx.translate(cx, cy);
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
          const w = img.width * scale * previewScale;
          const h = img.height * scale * previewScale;
          
          let cx = 0;
          let cy = 0;
          const pad = 40 * previewScale;
          
          if (position === 'center') {
            cx = canvas.width / 2;
            cy = canvas.height / 2;
          } else if (position === 'top-left') {
            cx = w / 2 + pad;
            cy = h / 2 + pad;
          } else if (position === 'top-right') {
            cx = canvas.width - w / 2 - pad;
            cy = h / 2 + pad;
          } else if (position === 'bottom-left') {
            cx = w / 2 + pad;
            cy = canvas.height - h / 2 - pad;
          } else if (position === 'bottom-right') {
            cx = canvas.width - w / 2 - pad;
            cy = canvas.height - h / 2 - pad;
          }
          
          const rotation = parseInt(document.getElementById('watermark-rotation').value, 10) || 0;
          
          ctx.translate(cx, cy);
          ctx.rotate((rotation * Math.PI) / 180);
          ctx.drawImage(img, -w / 2, -h / 2, w, h);
          URL.revokeObjectURL(imgUrl);
          resolve();
        };
        img.src = imgUrl;
      });
    }
    
    ctx.restore();
  } catch (err) {
    console.error('Preview error:', err);
  } finally {
    isWatermarkPreviewRendering = false;
    if (watermarkPreviewPending) {
      watermarkPreviewPending = false;
      updateWatermarkPreview();
    }
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

// -------------------------------------------------------------
// 16. DOCUMENT SCANNER WORKSPACE
// -------------------------------------------------------------
function setupScannerWorkspace() {
  const uploadZone = document.getElementById('scan-upload-zone');
  const fileInput = document.getElementById('scan-file-input');
  const editorContainer = document.getElementById('scan-editor-container');
  const backBtn = document.getElementById('scanner-back-btn');
  const submitBtn = document.getElementById('scan-submit-btn');
  const canvas = document.getElementById('scan-canvas');
  
  const modeSelect = document.getElementById('scan-mode');
  const thresholdGroup = document.getElementById('scan-threshold-group');
  const thresholdInput = document.getElementById('scan-threshold');
  const brightnessInput = document.getElementById('scan-brightness');
  const contrastInput = document.getElementById('scan-contrast');
  
  uploadZone.addEventListener('click', () => fileInput.click());
  fileInput.addEventListener('change', async (e) => {
    const file = e.target.files[0];
    if (file) handleScannerFile(file);
  });
  
  setupDragAndDrop(uploadZone, handleScannerFile);
  
  backBtn.addEventListener('click', () => {
    state.scanner.originalImg = null;
    state.scanner.file = null;
    editorContainer.classList.add('hidden');
    uploadZone.classList.remove('hidden');
    fileInput.value = '';
    window.location.hash = '#/dashboard';
  });
  
  modeSelect.addEventListener('change', (e) => {
    if (e.target.value === 'bw') {
      thresholdGroup.classList.remove('hidden');
    } else {
      thresholdGroup.classList.add('hidden');
    }
    renderScannerCanvas();
  });
  
  // Update labels dynamically
  thresholdInput.addEventListener('input', (e) => {
    document.getElementById('scan-threshold-val').textContent = e.target.value;
    renderScannerCanvas();
  });
  brightnessInput.addEventListener('input', (e) => {
    document.getElementById('scan-brightness-val').textContent = e.target.value;
    renderScannerCanvas();
  });
  contrastInput.addEventListener('input', (e) => {
    document.getElementById('scan-contrast-val').textContent = e.target.value;
    renderScannerCanvas();
  });
  
  async function handleScannerFile(file) {
    showLoader('Loading file...');
    try {
      state.scanner.file = file;
      if (file.name.toLowerCase().endsWith('.pdf') || file.type === 'application/pdf') {
        const buffer = await file.arrayBuffer();
        const pdfJs = await pdfjsLib.getDocument({ data: new Uint8Array(buffer) }).promise;
        const page = await pdfJs.getPage(1);
        
        const viewport = page.getViewport({ scale: 2.0 }); // Render at 2x for sharp scanner warping!
        const tempCanvas = document.createElement('canvas');
        tempCanvas.width = viewport.width;
        tempCanvas.height = viewport.height;
        const tempCtx = tempCanvas.getContext('2d');
        await page.render({ canvasContext: tempCtx, viewport }).promise;
        
        const img = new Image();
        img.onload = () => {
          hideLoader();
          initScanner(img);
        };
        img.src = tempCanvas.toDataURL('image/jpeg', 0.9);
      } else {
        const reader = new FileReader();
        reader.onload = (e) => {
          const img = new Image();
          img.onload = () => {
            hideLoader();
            initScanner(img);
          };
          img.src = e.target.result;
        };
        reader.readAsDataURL(file);
      }
    } catch (e) {
      console.error(e);
      hideLoader();
      showToast('Failed to load document.', 'danger');
    }
  }
  
  function initScanner(img) {
    state.scanner.originalImg = img;
    
    // Fit canvas bounds to container width and height (max 550x500 viewport to avoid clipping)
    const maxW = 550;
    const maxH = 500;
    
    let scale = 1;
    if (img.width / img.height > maxW / maxH) {
      scale = maxW / img.width;
    } else {
      scale = maxH / img.height;
    }
    
    canvas.width = img.width * scale;
    canvas.height = img.height * scale;
    
    // Place handles close to the image border boundaries (with 35px padding)
    const padding = 35;
    state.scanner.corners = [
      { x: padding, y: padding },
      { x: img.width - padding, y: padding },
      { x: img.width - padding, y: img.height - padding },
      { x: padding, y: img.height - padding }
    ];
    
    uploadZone.classList.add('hidden');
    editorContainer.classList.remove('hidden');
    renderScannerCanvas();
  }
  
  let activeIndex = -1;
  
  function getMousePos(e) {
    const rect = canvas.getBoundingClientRect();
    const clientX = e.clientX || (e.touches && e.touches[0].clientX);
    const clientY = e.clientY || (e.touches && e.touches[0].clientY);
    
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    
    return {
      x: (clientX - rect.left) * scaleX,
      y: (clientY - rect.top) * scaleY
    };
  }
  
  function handleDown(e) {
    if (!state.scanner.originalImg) return;
    const pos = getMousePos(e);
    const scale = canvas.width / state.scanner.originalImg.width;
    
    let nearest = -1;
    let minDist = 30; // pixels active hit radius
    
    state.scanner.corners.forEach((pt, idx) => {
      const dist = Math.hypot(pt.x * scale - pos.x, pt.y * scale - pos.y);
      if (dist < minDist) {
        minDist = dist;
        nearest = idx;
      }
    });
    
    activeIndex = nearest;
    if (activeIndex !== -1) {
      e.preventDefault();
    }
  }
  
  function handleMove(e) {
    if (activeIndex === -1 || !state.scanner.originalImg) return;
    const pos = getMousePos(e);
    const scale = state.scanner.originalImg.width / canvas.width;
    
    let imgX = Math.max(0, Math.min(state.scanner.originalImg.width, pos.x * scale));
    let imgY = Math.max(0, Math.min(state.scanner.originalImg.height, pos.y * scale));
    
    state.scanner.corners[activeIndex] = { x: imgX, y: imgY };
    renderScannerCanvas();
    e.preventDefault();
  }
  
  function handleUp() {
    activeIndex = -1;
  }
  
  canvas.addEventListener('mousedown', handleDown);
  canvas.addEventListener('mousemove', handleMove);
  window.addEventListener('mouseup', handleUp);
  
  canvas.addEventListener('touchstart', handleDown, { passive: false });
  canvas.addEventListener('touchmove', handleMove, { passive: false });
  window.addEventListener('touchend', handleUp);
  
  function renderScannerCanvas() {
    const img = state.scanner.originalImg;
    const ctx = canvas.getContext('2d');
    const scale = canvas.width / img.width;
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    
    // Apply B&W, Grayscale, Contrast, and Brightness adjustments live on preview!
    const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const mode = modeSelect.value;
    const threshold = parseInt(thresholdInput.value, 10);
    const brightness = parseInt(brightnessInput.value, 10) / 100;
    const contrast = parseInt(contrastInput.value, 10) / 100;
    
    for (let i = 0; i < imgData.data.length; i += 4) {
      let r = imgData.data[i];
      let g = imgData.data[i+1];
      let b = imgData.data[i+2];
      
      // Apply Brightness & Contrast
      r = (r - 128) * contrast + 128 + (brightness - 1) * 128;
      g = (g - 128) * contrast + 128 + (brightness - 1) * 128;
      b = (b - 128) * contrast + 128 + (brightness - 1) * 128;
      
      if (mode === 'bw') {
        const gray = 0.299 * r + 0.587 * g + 0.114 * b;
        const val = gray > threshold ? 255 : 0;
        r = g = b = val;
      } else if (mode === 'grayscale') {
        const gray = 0.299 * r + 0.587 * g + 0.114 * b;
        r = g = b = Math.min(255, Math.max(0, gray));
      } else if (mode === 'color') {
        r = Math.min(255, Math.max(0, r * 1.15));
        g = Math.min(255, Math.max(0, g * 1.15));
        b = Math.min(255, Math.max(0, b * 1.15));
      }
      
      imgData.data[i] = Math.min(255, Math.max(0, r));
      imgData.data[i+1] = Math.min(255, Math.max(0, g));
      imgData.data[i+2] = Math.min(255, Math.max(0, b));
    }
    ctx.putImageData(imgData, 0, 0);
    
    const corners = state.scanner.corners;
    
    // Draw quad bounds
    ctx.beginPath();
    ctx.strokeStyle = '#ef4444';
    ctx.lineWidth = 3;
    ctx.lineJoin = 'round';
    ctx.moveTo(corners[0].x * scale, corners[0].y * scale);
    for (let i = 1; i < 4; i++) {
      ctx.lineTo(corners[i].x * scale, corners[i].y * scale);
    }
    ctx.closePath();
    ctx.stroke();
    
    // Translucent crop preview highlight
    ctx.fillStyle = 'rgba(239, 68, 68, 0.12)';
    ctx.fill();
    
    // Draw handle circles
    corners.forEach((pt, idx) => {
      ctx.beginPath();
      ctx.arc(pt.x * scale, pt.y * scale, 9, 0, 2 * Math.PI);
      ctx.fillStyle = '#ef4444';
      ctx.fill();
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2.5;
      ctx.stroke();
    });
  }
  
  submitBtn.addEventListener('click', async () => {
    if (!state.scanner.originalImg) return;
    
    showLoader('Processing document scan...');
    try {
      const img = state.scanner.originalImg;
      const corners = state.scanner.corners;
      
      const w1 = Math.hypot(corners[1].x - corners[0].x, corners[1].y - corners[0].y);
      const w2 = Math.hypot(corners[2].x - corners[3].x, corners[2].y - corners[3].y);
      const h1 = Math.hypot(corners[3].x - corners[0].x, corners[3].y - corners[0].y);
      const h2 = Math.hypot(corners[2].x - corners[1].x, corners[2].y - corners[1].y);
      
      const outWidth = Math.min(1600, Math.round((w1 + w2) / 2));
      const outHeight = Math.min(1600, Math.round((h1 + h2) / 2));
      
      const outCanvas = document.createElement('canvas');
      outCanvas.width = outWidth;
      outCanvas.height = outHeight;
      const outCtx = outCanvas.getContext('2d');
      
      const dst = [
        { x: 0, y: 0 },
        { x: outWidth, y: 0 },
        { x: outWidth, y: outHeight },
        { x: 0, y: outHeight }
      ];
      
      const M = solveHomography(dst, corners);
      
      const tempCanvas = document.createElement('canvas');
      tempCanvas.width = img.width;
      tempCanvas.height = img.height;
      const tempCtx = tempCanvas.getContext('2d');
      tempCtx.drawImage(img, 0, 0);
      const srcData = tempCtx.getImageData(0, 0, img.width, img.height);
      
      const destData = outCtx.createImageData(outWidth, outHeight);
      
      const srcW = img.width;
      const srcH = img.height;
      
      for (let y = 0; y < outHeight; y++) {
        for (let x = 0; x < outWidth; x++) {
          const denom = M[6] * x + M[7] * y + 1;
          const sx = Math.round((M[0] * x + M[1] * y + M[2]) / denom);
          const sy = Math.round((M[3] * x + M[4] * y + M[5]) / denom);
          
          if (sx >= 0 && sx < srcW && sy >= 0 && sy < srcH) {
            const srcIdx = (sy * srcW + sx) * 4;
            const destIdx = (y * outWidth + x) * 4;
            
            destData.data[destIdx] = srcData.data[srcIdx];
            destData.data[destIdx+1] = srcData.data[srcIdx+1];
            destData.data[destIdx+2] = srcData.data[srcIdx+2];
            destData.data[destIdx+3] = srcData.data[srcIdx+3];
          }
        }
      }
      
      // Apply scanner filters
      const mode = modeSelect.value;
      const threshold = parseInt(thresholdInput.value, 10);
      const brightness = parseInt(brightnessInput.value, 10) / 100;
      const contrast = parseInt(contrastInput.value, 10) / 100;
      
      for (let i = 0; i < destData.data.length; i += 4) {
        let r = destData.data[i];
        let g = destData.data[i+1];
        let b = destData.data[i+2];
        
        r = (r - 128) * contrast + 128 + (brightness - 1) * 128;
        g = (g - 128) * contrast + 128 + (brightness - 1) * 128;
        b = (b - 128) * contrast + 128 + (brightness - 1) * 128;
        
        if (mode === 'bw') {
          const gray = 0.299 * r + 0.587 * g + 0.114 * b;
          const val = gray > threshold ? 255 : 0;
          r = g = b = val;
        } else if (mode === 'grayscale') {
          const gray = 0.299 * r + 0.587 * g + 0.114 * b;
          r = g = b = Math.min(255, Math.max(0, gray));
        } else if (mode === 'color') {
          r = Math.min(255, Math.max(0, r * 1.15));
          g = Math.min(255, Math.max(0, g * 1.15));
          b = Math.min(255, Math.max(0, b * 1.15));
        }
        
        destData.data[i] = Math.min(255, Math.max(0, r));
        destData.data[i+1] = Math.min(255, Math.max(0, g));
        destData.data[i+2] = Math.min(255, Math.max(0, b));
      }
      
      outCtx.putImageData(destData, 0, 0);
      
      // Save canvas as PDF page
      const pdfDoc = await PDFDocument.create();
      const page = pdfDoc.addPage([outWidth, outHeight]);
      const imgUrl = outCanvas.toDataURL('image/jpeg', 0.85);
      const imgBytes = await fetch(imgUrl).then(res => res.arrayBuffer());
      const embeddedImg = await pdfDoc.embedJpg(imgBytes);
      
      page.drawImage(embeddedImg, {
        x: 0,
        y: 0,
        width: outWidth,
        height: outHeight
      });
      
      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([pdfBytes], { type: 'application/pdf' });
      downloadBlob(blob, state.scanner.file.name.replace(/\.[a-z0-9]+$/i, '_scanned.pdf'));
      showToast('Document scanned successfully!');
    } catch (e) {
      console.error(e);
      showToast('Processing scan failed.', 'danger');
    } finally {
      hideLoader();
    }
  });
}

function solveHomography(src, dst) {
  const A = [];
  for (let i = 0; i < 4; i++) {
    const sx = src[i].x, sy = src[i].y;
    const dx = dst[i].x, dy = dst[i].y;
    A.push([sx, sy, 1, 0, 0, 0, -dx * sx, -dx * sy, dx]);
    A.push([0, 0, 0, sx, sy, 1, -dy * sx, -dy * sy, dy]);
  }
  const h = gaussElimination(A);
  return [h[0], h[1], h[2], h[3], h[4], h[5], h[6], h[7], 1];
}

function gaussElimination(A) {
  const n = 8;
  for (let i = 0; i < n; i++) {
    let maxEl = Math.abs(A[i][i]);
    let maxRow = i;
    for (let k = i + 1; k < n; k++) {
      if (Math.abs(A[k][i]) > maxEl) {
        maxEl = Math.abs(A[k][i]);
        maxRow = k;
      }
    }
    for (let k = i; k < n + 1; k++) {
      const tmp = A[maxRow][k];
      A[maxRow][k] = A[i][k];
      A[i][k] = tmp;
    }
    for (let k = i + 1; k < n; k++) {
      const c = -A[k][i] / A[i][i];
      for (let j = i; j < n + 1; j++) {
        if (i === j) A[k][j] = 0;
        else A[k][j] += c * A[i][j];
      }
    }
  }
  const x = new Array(n).fill(0);
  for (let i = n - 1; i >= 0; i--) {
    x[i] = A[i][n] / A[i][i];
    for (let k = i - 1; k >= 0; k--) {
      A[k][n] -= A[k][i] * x[i];
    }
  }
  return x;
}

function setupFormbuilderWorkspace() {
  const uploadZone = document.getElementById('formbuilder-upload-zone');
  const fileInput = document.getElementById('formbuilder-file-input');
  const uploadContainer = document.getElementById('formbuilder-upload-container');
  const workspaceContainer = document.getElementById('formbuilder-workspace-container');
  const canvas = document.getElementById('formbuilder-canvas');
  const overlayContainer = document.getElementById('formbuilder-overlay-container');
  
  // Navigation elements
  const prevBtn = document.getElementById('formbuilder-prev-page');
  const nextBtn = document.getElementById('formbuilder-next-page');
  const currentPageLabel = document.getElementById('formbuilder-current-page');
  const totalPagesLabel = document.getElementById('formbuilder-total-pages');
  const zoomInBtn = document.getElementById('formbuilder-zoom-in');
  const zoomOutBtn = document.getElementById('formbuilder-zoom-out');
  const zoomLabel = document.getElementById('formbuilder-zoom-label');
  const uploadTriggerBtn = document.getElementById('formbuilder-upload-trigger-btn');
  
  // Toggles and tools
  const modeFillBtn = document.getElementById('formbuilder-mode-fill');
  const modeEditBtn = document.getElementById('formbuilder-mode-edit');
  const clearFieldsBtn = document.getElementById('fb-clear-fields-btn');
  
  const toolBtns = {
    draw: document.getElementById('fb-tool-draw'),
    text: document.getElementById('fb-tool-text'),
    checkbox: document.getElementById('fb-tool-checkbox'),
    radio: document.getElementById('fb-tool-radio'),
    dropdown: document.getElementById('fb-tool-dropdown'),
    file: document.getElementById('fb-tool-file')
  };
  
  const fontColorPicker = document.getElementById('fb-font-color-picker');
  
  // Properties panel elements
  const noFieldSelectedMsg = document.getElementById('fb-no-field-selected');
  const propertiesForm = document.getElementById('fb-properties-form');
  const propNameInput = document.getElementById('fb-prop-name');
  const propDefaultInput = document.getElementById('fb-prop-default');
  const propDefaultContainer = document.getElementById('fb-prop-default-container');
  const propDefaultLabel = document.getElementById('fb-prop-default-label');
  const propReadonly = document.getElementById('fb-prop-readonly');
  const propRequired = document.getElementById('fb-prop-required');
  const propMultiline = document.getElementById('fb-prop-multiline');
  const propMultilineContainer = document.getElementById('fb-prop-multiline-container');
  const propIndicator = document.getElementById('fb-prop-indicator');
  const deleteFieldBtn = document.getElementById('fb-delete-field-btn');
  const downloadPdfBtn = document.getElementById('fb-download-pdf-btn');
  
  uploadZone.addEventListener('click', () => fileInput.click());
  fileInput.addEventListener('change', async (e) => {
    const file = e.target.files[0];
    if (file) handleFormbuilderFile(file);
  });
  
  setupDragAndDrop(uploadZone, handleFormbuilderFile);
  
  if (uploadTriggerBtn) {
    uploadTriggerBtn.addEventListener('click', () => fileInput.click());
  }
  
  async function handleFormbuilderFile(file) {
    const ext = file.name.split('.').pop().toLowerCase();
    
    showLoader('Converting and loading document...');
    try {
      let pdfBytes;
      
      if (ext === 'pdf') {
        pdfBytes = await file.arrayBuffer();
      } else if (ext === 'docx') {
        pdfBytes = await convertWordToPdf(file);
      } else if (ext === 'xlsx' || ext === 'xls') {
        pdfBytes = await convertExcelToPdf(file);
      } else if (['png', 'jpg', 'jpeg', 'webp'].includes(ext)) {
        pdfBytes = await convertImagesToPdf([file], { pageSize: 'fit' });
      } else {
        throw new Error('Unsupported file format. Please upload PDF, Word, Excel, or Image files.');
      }
      
      state.formbuilder.file = file;
      state.formbuilder.pdfBytes = pdfBytes;
      
      const loadingTask = pdfjsLib.getDocument({ data: new Uint8Array(pdfBytes) });
      const pdf = await loadingTask.promise;
      state.formbuilder.pdfDoc = pdf;
      state.formbuilder.numPages = pdf.numPages;
      state.formbuilder.currentPageIndex = 0;
      state.formbuilder.fields = [];
      state.formbuilder.selectedFieldId = null;
      
      uploadContainer.classList.add('hidden');
      workspaceContainer.classList.remove('hidden');
      
      totalPagesLabel.textContent = pdf.numPages;
      
      await loadFormbuilderPage(0);
      showToast('Document loaded successfully! Click Edit Form to add fields.', 'success');
      
      if (window.lucide) window.lucide.createIcons();
    } catch (err) {
      console.error(err);
      showToast(err.message || 'Failed to load document.', 'danger');
    } finally {
      hideLoader();
      fileInput.value = '';
    }
  }
  
  async function loadFormbuilderPage(pageIndex) {
    if (!state.formbuilder.pdfDoc) return;
    state.formbuilder.currentPageIndex = pageIndex;
    currentPageLabel.textContent = pageIndex + 1;
    
    const page = await state.formbuilder.pdfDoc.getPage(pageIndex + 1);
    const viewport = page.getViewport({ scale: state.formbuilder.zoom * 1.5 });
    
    canvas.width = viewport.width;
    canvas.height = viewport.height;
    
    // Scale canvas wrapper visually
    const wrapper = document.getElementById('formbuilder-canvas-wrapper');
    wrapper.style.width = `${viewport.width / 1.5}px`;
    wrapper.style.height = `${viewport.height / 1.5}px`;
    
    const ctx = canvas.getContext('2d');
    await page.render({ canvasContext: ctx, viewport }).promise;
    
    renderFormbuilderOverlay();
  }
  
  function renderFormbuilderOverlay() {
    overlayContainer.innerHTML = '';
    
    const pageFields = state.formbuilder.fields.filter(f => f.pageIndex === state.formbuilder.currentPageIndex);
    
    pageFields.forEach(field => {
      const fieldDiv = document.createElement('div');
      fieldDiv.className = `fb-field-element ${field.type}`;
      if (field.id === state.formbuilder.selectedFieldId && state.formbuilder.mode === 'edit') {
        fieldDiv.classList.add('active');
      }
      
      // Calculate coordinates from percentages
      const containerWidth = overlayContainer.clientWidth;
      const containerHeight = overlayContainer.clientHeight;
      
      fieldDiv.style.left = `${field.x * containerWidth}px`;
      fieldDiv.style.top = `${field.y * containerHeight}px`;
      fieldDiv.style.width = `${field.width * containerWidth}px`;
      fieldDiv.style.height = `${field.height * containerHeight}px`;
      
      if (state.formbuilder.mode === 'edit') {
        // Dragging and Resizing elements
        fieldDiv.addEventListener('mousedown', (e) => {
          if (e.target.classList.contains('resize-handle')) return;
          e.stopPropagation();
          selectField(field.id);
          
          const startX = e.clientX;
          const startY = e.clientY;
          const startLeft = field.x * containerWidth;
          const startTop = field.y * containerHeight;
          
          function onMouseMove(moveEvent) {
            const dx = moveEvent.clientX - startX;
            const dy = moveEvent.clientY - startY;
            
            let newLeft = Math.max(0, Math.min(containerWidth - (field.width * containerWidth), startLeft + dx));
            let newTop = Math.max(0, Math.min(containerHeight - (field.height * containerHeight), startTop + dy));
            
            field.x = newLeft / containerWidth;
            field.y = newTop / containerHeight;
            
            fieldDiv.style.left = `${newLeft}px`;
            fieldDiv.style.top = `${newTop}px`;
          }
          
          function onMouseUp() {
            document.removeEventListener('mousemove', onMouseMove);
            document.removeEventListener('mouseup', onMouseUp);
          }
          
          document.addEventListener('mousemove', onMouseMove);
          document.addEventListener('mouseup', onMouseUp);
        });
        
        // Corner resize handles
        ['tl', 'tr', 'bl', 'br'].forEach(pos => {
          const handle = document.createElement('div');
          handle.className = `resize-handle ${pos}`;
          fieldDiv.appendChild(handle);
          
          handle.addEventListener('mousedown', (e) => {
            e.stopPropagation();
            e.preventDefault();
            
            const startX = e.clientX;
            const startY = e.clientY;
            const startXRatio = field.x;
            const startYRatio = field.y;
            const startW = field.width * containerWidth;
            const startH = field.height * containerHeight;
            const startL = field.x * containerWidth;
            const startT = field.y * containerHeight;
            
            function onMouseMove(moveEvent) {
              const dx = moveEvent.clientX - startX;
              const dy = moveEvent.clientY - startY;
              
              let newL = startL;
              let newT = startT;
              let newW = startW;
              let newH = startH;
              
              if (pos.includes('l')) {
                newL = Math.max(0, Math.min(startL + startW - 16, startL + dx));
                newW = startW + (startL - newL);
              } else {
                newW = Math.max(16, Math.min(containerWidth - startL, startW + dx));
              }
              
              if (pos.includes('t')) {
                newT = Math.max(0, Math.min(startT + startH - 16, startT + dy));
                newH = startH + (startT - newT);
              } else {
                newH = Math.max(16, Math.min(containerHeight - startT, startH + dy));
              }
              
              field.x = newL / containerWidth;
              field.y = newT / containerHeight;
              field.width = newW / containerWidth;
              field.height = newH / containerHeight;
              
              fieldDiv.style.left = `${newL}px`;
              fieldDiv.style.top = `${newT}px`;
              fieldDiv.style.width = `${newW}px`;
              fieldDiv.style.height = `${newH}px`;
            }
            
            function onMouseUp() {
              document.removeEventListener('mousemove', onMouseMove);
              document.removeEventListener('mouseup', onMouseUp);
            }
            
            document.addEventListener('mousemove', onMouseMove);
            document.addEventListener('mouseup', onMouseUp);
          });
        });
      } else {
        // Fill Mode rendering standard HTML interactive elements
        if (field.type === 'text') {
          if (field.multiline) {
            const textarea = document.createElement('textarea');
            textarea.className = 'fb-input';
            textarea.value = field.value || '';
            textarea.style.color = field.color || '#000000';
            textarea.style.resize = 'none';
            textarea.readOnly = field.readonly;
            textarea.required = field.required;
            textarea.addEventListener('input', (e) => { field.value = e.target.value; });
            fieldDiv.appendChild(textarea);
          } else {
            const input = document.createElement('input');
            input.type = 'text';
            input.className = 'fb-input';
            input.value = field.value || '';
            input.style.color = field.color || '#000000';
            input.readOnly = field.readonly;
            input.required = field.required;
            input.addEventListener('input', (e) => { field.value = e.target.value; });
            fieldDiv.appendChild(input);
          }
        } else if (field.type === 'checkbox') {
          const input = document.createElement('input');
          input.type = 'checkbox';
          input.className = 'fb-checkbox';
          input.checked = field.value === 'true';
          input.disabled = field.readonly;
          input.required = field.required;
          input.addEventListener('change', (e) => { field.value = e.target.checked ? 'true' : 'false'; });
          fieldDiv.appendChild(input);
        } else if (field.type === 'radio') {
          const input = document.createElement('input');
          input.type = 'radio';
          input.className = 'fb-radio';
          input.name = field.name;
          input.checked = field.value === 'true';
          input.disabled = field.readonly;
          input.required = field.required;
          input.addEventListener('change', (e) => { 
            // Reset other radios in same group
            state.formbuilder.fields.forEach(f => {
              if (f.type === 'radio' && f.name === field.name) f.value = 'false';
            });
            field.value = 'true';
          });
          fieldDiv.appendChild(input);
        } else if (field.type === 'dropdown') {
          const select = document.createElement('select');
          select.className = 'fb-select';
          select.disabled = field.readonly;
          select.required = field.required;
          
          const options = field.options || ['Select Option', 'Option 1', 'Option 2', 'Option 3'];
          options.forEach(opt => {
            const option = document.createElement('option');
            option.value = opt;
            option.textContent = opt;
            if (field.value === opt) option.selected = true;
            select.appendChild(option);
          });
          
          select.addEventListener('change', (e) => { field.value = e.target.value; });
          fieldDiv.appendChild(select);
        } else if (field.type === 'file') {
          const input = document.createElement('input');
          input.type = 'file';
          input.className = 'fb-input';
          input.style.fontSize = '0.7rem';
          input.disabled = field.readonly;
          input.required = field.required;
          fieldDiv.appendChild(input);
        } else if (field.type === 'draw') {
          const drawDiv = document.createElement('div');
          drawDiv.style.width = '100%';
          drawDiv.style.height = '100%';
          drawDiv.style.display = 'flex';
          drawDiv.style.alignItems = 'center';
          drawDiv.style.justifyContent = 'center';
          drawDiv.style.fontSize = '0.75rem';
          drawDiv.style.color = '#333333';
          drawDiv.innerHTML = '<span style="font-family:\'Great Vibes\', cursive; font-size:1.2rem;">Signature</span>';
          fieldDiv.appendChild(drawDiv);
        }
      }
      
      overlayContainer.appendChild(fieldDiv);
    });
  }
  
  // Click on overlay container to create a field in Edit Mode
  overlayContainer.addEventListener('mousedown', (e) => {
    if (state.formbuilder.mode !== 'edit') return;
    if (e.target !== overlayContainer) return;
    
    const rect = overlayContainer.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;
    
    const xRatio = clickX / rect.width;
    const yRatio = clickY / rect.height;
    
    // Set default sizing
    let wRatio = 0.18;
    let hRatio = 0.04;
    
    if (state.formbuilder.activeTool === 'checkbox' || state.formbuilder.activeTool === 'radio') {
      wRatio = 0.04;
      hRatio = 0.04;
    }
    
    const newField = {
      id: 'fb-field-' + Math.random().toString(36).substring(2, 9),
      type: state.formbuilder.activeTool,
      pageIndex: state.formbuilder.currentPageIndex,
      x: Math.max(0, Math.min(1.0 - wRatio, xRatio - wRatio/2)),
      y: Math.max(0, Math.min(1.0 - hRatio, yRatio - hRatio/2)),
      width: wRatio,
      height: hRatio,
      name: `${state.formbuilder.activeTool.charAt(0).toUpperCase() + state.formbuilder.activeTool.slice(1)}FormField ${state.formbuilder.fields.length + 1}`,
      value: state.formbuilder.activeTool === 'checkbox' || state.formbuilder.activeTool === 'radio' ? 'false' : '',
      readonly: false,
      required: false,
      multiline: false,
      indicator: false,
      color: state.formbuilder.fontColor,
      options: ['Select Option', 'Yes', 'No', 'N/A']
    };
    
    state.formbuilder.fields.push(newField);
    selectField(newField.id);
  });
  
  function selectField(id) {
    state.formbuilder.selectedFieldId = id;
    renderFormbuilderOverlay();
    
    const field = state.formbuilder.fields.find(f => f.id === id);
    if (!field) {
      noFieldSelectedMsg.classList.remove('hidden');
      propertiesForm.classList.add('hidden');
      return;
    }
    
    noFieldSelectedMsg.classList.add('hidden');
    propertiesForm.classList.remove('hidden');
    
    propNameInput.value = field.name || '';
    propDefaultInput.value = field.value || '';
    propReadonly.checked = field.readonly || false;
    propRequired.checked = field.required || false;
    propMultiline.checked = field.multiline || false;
    propIndicator.checked = field.indicator || false;
    
    // Toggle multiline based on text field type
    if (field.type === 'text') {
      propMultilineContainer.classList.remove('hidden');
      propDefaultContainer.classList.remove('hidden');
      propDefaultLabel.textContent = 'Default Value';
    } else if (field.type === 'dropdown') {
      propMultilineContainer.classList.add('hidden');
      propDefaultContainer.classList.remove('hidden');
      propDefaultLabel.textContent = 'Comma-separated Options';
      propDefaultInput.value = (field.options || []).join(', ');
    } else {
      propMultilineContainer.classList.add('hidden');
      propDefaultContainer.classList.add('hidden');
    }
  }
  
  // Properties panel inputs bind
  propNameInput.addEventListener('input', (e) => {
    const field = state.formbuilder.fields.find(f => f.id === state.formbuilder.selectedFieldId);
    if (field) field.name = e.target.value;
  });
  
  propDefaultInput.addEventListener('input', (e) => {
    const field = state.formbuilder.fields.find(f => f.id === state.formbuilder.selectedFieldId);
    if (field) {
      if (field.type === 'dropdown') {
        field.options = e.target.value.split(',').map(s => s.trim()).filter(Boolean);
      } else {
        field.value = e.target.value;
      }
      renderFormbuilderOverlay();
    }
  });
  
  propReadonly.addEventListener('change', (e) => {
    const field = state.formbuilder.fields.find(f => f.id === state.formbuilder.selectedFieldId);
    if (field) field.readonly = e.target.checked;
  });
  
  propRequired.addEventListener('change', (e) => {
    const field = state.formbuilder.fields.find(f => f.id === state.formbuilder.selectedFieldId);
    if (field) field.required = e.target.checked;
  });
  
  propMultiline.addEventListener('change', (e) => {
    const field = state.formbuilder.fields.find(f => f.id === state.formbuilder.selectedFieldId);
    if (field) {
      field.multiline = e.target.checked;
      renderFormbuilderOverlay();
    }
  });
  
  propIndicator.addEventListener('change', (e) => {
    const field = state.formbuilder.fields.find(f => f.id === state.formbuilder.selectedFieldId);
    if (field) field.indicator = e.target.checked;
  });
  
  deleteFieldBtn.addEventListener('click', () => {
    const id = state.formbuilder.selectedFieldId;
    state.formbuilder.fields = state.formbuilder.fields.filter(f => f.id !== id);
    selectField(null);
  });
  
  // Toggle modes Fill vs Edit
  modeFillBtn.addEventListener('click', () => {
    state.formbuilder.mode = 'fill';
    modeFillBtn.classList.add('active');
    modeEditBtn.classList.remove('active');
    workspaceContainer.setAttribute('data-mode', 'fill');
    selectField(null);
  });
  
  modeEditBtn.addEventListener('click', () => {
    state.formbuilder.mode = 'edit';
    modeEditBtn.classList.add('active');
    modeFillBtn.classList.remove('active');
    workspaceContainer.setAttribute('data-mode', 'edit');
    renderFormbuilderOverlay();
  });
  
  // Toolbar Buttons
  Object.keys(toolBtns).forEach(tool => {
    toolBtns[tool].addEventListener('click', () => {
      Object.keys(toolBtns).forEach(t => toolBtns[t].classList.remove('active'));
      toolBtns[tool].classList.add('active');
      state.formbuilder.activeTool = tool;
    });
  });
  
  // Color Picker change
  fontColorPicker.addEventListener('input', (e) => {
    const color = e.target.value;
    state.formbuilder.fontColor = color;
    document.getElementById('fb-tool-color').style.color = color;
    
    // Write color to currently selected field if it is text
    const field = state.formbuilder.fields.find(f => f.id === state.formbuilder.selectedFieldId);
    if (field && field.type === 'text') {
      field.color = color;
      renderFormbuilderOverlay();
    }
  });
  
  // Clear all fields
  clearFieldsBtn.addEventListener('click', () => {
    state.formbuilder.fields = [];
    selectField(null);
  });
  
  // Navigation Event listeners
  prevBtn.addEventListener('click', () => {
    if (state.formbuilder.currentPageIndex > 0) {
      loadFormbuilderPage(state.formbuilder.currentPageIndex - 1);
    }
  });
  
  nextBtn.addEventListener('click', () => {
    if (state.formbuilder.currentPageIndex < state.formbuilder.numPages - 1) {
      loadFormbuilderPage(state.formbuilder.currentPageIndex + 1);
    }
  });
  
  zoomInBtn.addEventListener('click', () => {
    if (state.formbuilder.zoom < 2.0) {
      state.formbuilder.zoom = parseFloat((state.formbuilder.zoom + 0.15).toFixed(2));
      zoomLabel.textContent = `${Math.round(state.formbuilder.zoom * 100)}%`;
      loadFormbuilderPage(state.formbuilder.currentPageIndex);
    }
  });
  
  zoomOutBtn.addEventListener('click', () => {
    if (state.formbuilder.zoom > 0.6) {
      state.formbuilder.zoom = parseFloat((state.formbuilder.zoom - 0.15).toFixed(2));
      zoomLabel.textContent = `${Math.round(state.formbuilder.zoom * 100)}%`;
      loadFormbuilderPage(state.formbuilder.currentPageIndex);
    }
  });
  
  // Download Form PDF
  downloadPdfBtn.addEventListener('click', async () => {
    showLoader('Compiling form fields and generating PDF...');
    try {
      const { PDFDocument: LibPDF } = await import('pdf-lib');
      const doc = await LibPDF.load(state.formbuilder.pdfBytes);
      const form = doc.getForm();
      
      for (const field of state.formbuilder.fields) {
        const page = doc.getPage(field.pageIndex);
        const { width: pWidth, height: pHeight } = page.getSize();
        
        // Map top-left HTML percentage bounds to bottom-left PDF coordinate bounds
        const x = field.x * pWidth;
        const y = (1.0 - field.y - field.height) * pHeight;
        const w = field.width * pWidth;
        const h = field.height * pHeight;
        
        if (field.type === 'text') {
          const tf = form.createTextField(field.name);
          tf.setText(field.value || '');
          if (field.multiline) tf.enableMultiline();
          if (field.readonly) tf.enableReadOnly();
          if (field.required) tf.enableRequired();
          tf.addToPage(page, { x, y, width: w, height: h });
        } else if (field.type === 'checkbox') {
          const cb = form.createCheckBox(field.name);
          if (field.value === 'true') cb.check();
          if (field.readonly) cb.enableReadOnly();
          if (field.required) cb.enableRequired();
          cb.addToPage(page, { x, y, width: w, height: h });
        } else if (field.type === 'radio') {
          let rg;
          try {
            rg = form.getRadioGroup(field.name);
          } catch {
            rg = form.createRadioGroup(field.name);
          }
          rg.addOptionToPage('Option', page, { x, y, width: w, height: h });
          if (field.value === 'true') rg.select('Option');
        } else if (field.type === 'dropdown') {
          const dd = form.createDropdown(field.name);
          dd.setOptions(field.options || ['Option 1', 'Option 2', 'Option 3']);
          if (field.value) dd.select(field.value);
          if (field.readonly) dd.enableReadOnly();
          if (field.required) dd.enableRequired();
          dd.addToPage(page, { x, y, width: w, height: h });
        } else if (field.type === 'file') {
          const tf = form.createTextField(field.name);
          tf.setText('File Upload attachment placeholder');
          tf.enableReadOnly();
          tf.addToPage(page, { x, y, width: w, height: h });
        } else if (field.type === 'draw') {
          const tf = form.createTextField(field.name);
          tf.setText('Signature line');
          tf.enableReadOnly();
          tf.addToPage(page, { x, y, width: w, height: h });
        }
      }
      
      const outBytes = await doc.save();
      downloadBlob(new Blob([outBytes], { type: 'application/pdf' }), state.formbuilder.file.name.replace(/\.pdf$/i, '_form.pdf'));
      showToast('Interactive form PDF downloaded successfully!', 'success');
    } catch (err) {
      console.error(err);
      showToast('Failed to compile interactive form elements.', 'danger');
    } finally {
      hideLoader();
    }
  });
}

function initHomepageCarousel() {
  const carousel = document.getElementById('homepage-carousel');
  if (!carousel) return;
  
  const slides = carousel.querySelectorAll('.carousel-slide');
  const indicators = carousel.querySelectorAll('.indicator');
  let currentIndex = 0;
  let timer = null;
  
  const showSlide = (index) => {
    slides.forEach((slide, idx) => {
      if (idx === index) {
        slide.classList.add('active');
      } else {
        slide.classList.remove('active');
      }
    });
    
    indicators.forEach((indicator, idx) => {
      if (idx === index) {
        indicator.classList.add('active');
      } else {
        indicator.classList.remove('active');
      }
    });
    
    currentIndex = index;
  };
  
  const nextSlide = () => {
    const nextIdx = (currentIndex + 1) % slides.length;
    showSlide(nextIdx);
  };
  
  const startTimer = () => {
    stopTimer();
    timer = setInterval(nextSlide, 5000); // auto-transition every 5 seconds
  };
  
  const stopTimer = () => {
    if (timer) clearInterval(timer);
  };
  
  // Bind click on indicators
  indicators.forEach(indicator => {
    indicator.addEventListener('click', (e) => {
      const targetIndex = parseInt(e.target.dataset.index, 10);
      showSlide(targetIndex);
      startTimer(); // reset auto-slide timer upon click
    });
  });
  
  // Pause on hover
  carousel.addEventListener('mouseenter', stopTimer);
  carousel.addEventListener('mouseleave', startTimer);
  
  startTimer();
}

// -------------------------------------------------------------
// 18. AI COPILOT / SUMMARIZER WORKSPACE
// -------------------------------------------------------------
function setupCopilotWorkspace() {
  const uploadZone = document.getElementById('copilot-upload-zone');
  const fileInput = document.getElementById('copilot-file-input');
  const uploadTriggerBtn = document.getElementById('copilot-upload-trigger-btn');
  const downloadBtn = document.getElementById('copilot-download-btn');
  const outputFormatSelect = document.getElementById('copilot-output-format');
  

  const chatHistory = document.getElementById('copilot-chat-history');
  const promptInput = document.getElementById('copilot-prompt-input');
  const sendBtn = document.getElementById('copilot-send-btn');
  
  const previewContainer = document.getElementById('copilot-preview-container');
  
  const tabDocBtn = document.getElementById('copilot-tab-doc');
  const tabAiBtn = document.getElementById('copilot-tab-ai');
  const docTabContent = document.getElementById('copilot-doc-tab-content');
  const aiTabContent = document.getElementById('copilot-ai-tab-content');

  function detectDocumentTheme(docText) {
    const text = docText.toLowerCase();
    if (text.includes('infinity') || text.includes('hospitality') || text.includes('navy') || text.includes('blue') || text.includes('sharqi')) {
      return { primary: '#1e3b8a', secondary: '#3b82f6', bg: '#eff6ff' }; // Navy Blue / Infinity Hospitality
    }
    if (text.includes('sheet') || text.includes('excel') || text.includes('finance') || text.includes('green') || text.includes('salary') || text.includes('horses group')) {
      // In the user's screenshot, "Horses Group" has a gold/green accent layout. Let's use clean dark forest green/gold.
      return { primary: '#15803d', secondary: '#c29d38', bg: '#fefcf3' }; // Dark Green / Horses Group Gold
    }
    if (text.includes('agreement') || text.includes('contract') || text.includes('legal') || text.includes('law')) {
      return { primary: '#334155', secondary: '#64748b', bg: '#f8fafc' }; // Slate
    }
    if (text.includes('red') || text.includes('danger') || text.includes('warning') || text.includes('construction')) {
      return { primary: '#b91c1c', secondary: '#ef4444', bg: '#fef2f2' }; // Red
    }
    return { primary: '#6d28d9', secondary: '#8b5cf6', bg: '#f5f3ff' }; // Default Violet
  }

  async function renderVisualOriginalDoc() {
    if (!docTabContent) return;
    docTabContent.innerHTML = '';
    
    const docHeader = document.createElement('div');
    docHeader.style.display = 'flex';
    docHeader.style.justifyContent = 'space-between';
    docHeader.style.alignItems = 'center';
    docHeader.style.marginBottom = '1.25rem';
    docHeader.style.borderBottom = '1px solid var(--border-color)';
    docHeader.style.paddingBottom = '0.5rem';
    
    const docBadge = document.createElement('div');
    docBadge.style.display = 'inline-flex';
    docBadge.style.alignItems = 'center';
    docBadge.style.gap = '0.35rem';
    docBadge.style.padding = '0.25rem 0.5rem';
    docBadge.style.fontSize = '0.75rem';
    docBadge.style.fontWeight = '600';
    docBadge.style.background = 'var(--accent-pink-light)';
    docBadge.style.color = 'var(--accent-pink)';
    docBadge.style.borderRadius = '4px';
    docBadge.innerHTML = `<i data-lucide="file-text" style="width:13px; height:13px;"></i> Original Document Preview`;
    docHeader.appendChild(docBadge);
    
    if (state.copilot.file) {
      const docName = document.createElement('span');
      docName.style.fontSize = '0.75rem';
      docName.style.color = 'var(--text-muted)';
      docName.style.fontWeight = '500';
      docName.textContent = state.copilot.file.name;
      docHeader.appendChild(docName);
    }
    docTabContent.appendChild(docHeader);
    
    if (!state.copilot.file || !state.copilot.originalBuffer) {
      const emptyMsg = document.createElement('p');
      emptyMsg.style.color = 'var(--text-muted)';
      emptyMsg.style.fontStyle = 'italic';
      emptyMsg.textContent = 'No document uploaded yet.';
      docTabContent.appendChild(emptyMsg);
      return;
    }
    
    const ext = state.copilot.file.name.split('.').pop().toLowerCase();
    
    try {
      if (ext === 'pdf') {
        const loadingTask = pdfjsLib.getDocument({ data: new Uint8Array(state.copilot.originalBuffer) });
        const pdf = await loadingTask.promise;
        
        const scrollContainer = document.createElement('div');
        scrollContainer.style.maxHeight = '650px';
        scrollContainer.style.overflowY = 'auto';
        scrollContainer.style.padding = '0.5rem';
        
        for (let i = 1; i <= pdf.numPages; i++) {
          const page = await pdf.getPage(i);
          const viewport = page.getViewport({ scale: 1.2 });
          const canvas = document.createElement('canvas');
          canvas.width = viewport.width;
          canvas.height = viewport.height;
          canvas.style.display = 'block';
          canvas.style.margin = '0 auto 1.5rem auto';
          canvas.style.boxShadow = '0 4px 14px rgba(0,0,0,0.12)';
          canvas.style.borderRadius = '6px';
          canvas.style.background = 'white';
          
          const ctx = canvas.getContext('2d');
          await page.render({ canvasContext: ctx, viewport }).promise;
          scrollContainer.appendChild(canvas);
        }
        docTabContent.appendChild(scrollContainer);
      } else if (ext === 'docx') {
        const container = document.createElement('div');
        container.className = 'word-preview-container-wrapper';
        
        const a4page = document.createElement('div');
        a4page.className = 'word-a4-page';
        
        if (state.copilot.isModified) {
          a4page.innerHTML = state.copilot.documentText
            .split('\n')
            .map(line => {
              const trimmed = line.trim();
              if (trimmed.startsWith('*') || trimmed.startsWith('-')) {
                return `<li style="margin-left: 1.5rem; margin-bottom: 0.5rem; list-style-type: disc; color: #1e293b;">${trimmed.replace(/^[\s*-]+/, '').trim()}</li>`;
              }
              if (trimmed.length === 0) return '';
              
              if (trimmed.toUpperCase() === trimmed && trimmed.length > 3) {
                return `<h3 style="margin-top: 1.5rem; margin-bottom: 0.75rem; font-weight: bold; color: #111827; font-size: 14pt;">${trimmed}</h3>`;
              }
              return `<p style="margin-bottom: 0.85rem; color: #1e293b;">${trimmed}</p>`;
            })
            .join('');
        } else {
          const result = await mammoth.convertToHtml({ arrayBuffer: state.copilot.originalBuffer });
          a4page.innerHTML = result.value;
        }
        
        const tables = a4page.querySelectorAll('table');
        tables.forEach(table => {
          table.style.width = '100%';
          table.style.borderCollapse = 'collapse';
          table.style.margin = '15px 0';
          table.querySelectorAll('td, th').forEach(cell => {
            cell.style.border = '1px solid #cbd5e1';
            cell.style.padding = '10px';
          });
        });
        
        container.appendChild(a4page);
        docTabContent.appendChild(container);
      } else if (ext === 'xlsx' || ext === 'xls') {
        const container = document.createElement('div');
        container.className = 'excel-sheet-grid-wrapper';
        
        if (state.copilot.isModified && state.copilot.extractedData) {
          const tabHeader = document.createElement('div');
          tabHeader.className = 'excel-sheet-grid-tab-header';
          tabHeader.textContent = 'Sheet1 (Filtered)';
          container.appendChild(tabHeader);
          
          let tableHtml = `<table class="excel-sheet-grid">`;
          
          const headers = state.copilot.extractedData[0] || [];
          tableHtml += `<tr><th></th>`;
          headers.forEach((_, colIdx) => {
            let colName = '';
            let tempIdx = colIdx;
            while (tempIdx >= 0) {
              colName = String.fromCharCode((tempIdx % 26) + 65) + colName;
              tempIdx = Math.floor(tempIdx / 26) - 1;
            }
            tableHtml += `<th>${colName}</th>`;
          });
          tableHtml += `</tr>`;
          
          state.copilot.extractedData.forEach((row, rowIdx) => {
            tableHtml += `<tr>`;
            tableHtml += `<td>${rowIdx + 1}</td>`;
            headers.forEach((_, colIdx) => {
              const val = row[colIdx];
              tableHtml += `<td>${val !== undefined ? val : ''}</td>`;
            });
            tableHtml += `</tr>`;
          });
          
          tableHtml += `</table>`;
          
          const gridWrapper = document.createElement('div');
          gridWrapper.style.overflowX = 'auto';
          gridWrapper.innerHTML = tableHtml;
          container.appendChild(gridWrapper);
        } else {
          const workbook = XLSX.read(state.copilot.originalBuffer, { type: 'array' });
          workbook.SheetNames.forEach((sheetName, index) => {
            const sheet = workbook.Sheets[sheetName];
            const rawRows = XLSX.utils.sheet_to_json(sheet, { header: 1 });
            
            const tabHeader = document.createElement('div');
            tabHeader.className = 'excel-sheet-grid-tab-header';
            tabHeader.textContent = sheetName;
            if (index > 0) tabHeader.style.marginTop = '20px';
            container.appendChild(tabHeader);
            
            let tableHtml = `<table class="excel-sheet-grid">`;
            
            let maxCols = 0;
            rawRows.forEach(row => {
              if (row.length > maxCols) maxCols = row.length;
            });
            if (maxCols === 0) maxCols = 5;
            
            tableHtml += `<tr><th></th>`;
            for (let c = 0; c < maxCols; c++) {
              let colName = '';
              let tempIdx = c;
              while (tempIdx >= 0) {
                colName = String.fromCharCode((tempIdx % 26) + 65) + colName;
                tempIdx = Math.floor(tempIdx / 26) - 1;
              }
              tableHtml += `<th>${colName}</th>`;
            }
            tableHtml += `</tr>`;
            
            rawRows.forEach((row, rowIdx) => {
              tableHtml += `<tr>`;
              tableHtml += `<td>${rowIdx + 1}</td>`;
              for (let c = 0; c < maxCols; c++) {
                const val = row[c];
                tableHtml += `<td>${val !== undefined ? val : ''}</td>`;
              }
              tableHtml += `</tr>`;
            });
            
            tableHtml += `</table>`;
            
            const gridWrapper = document.createElement('div');
            gridWrapper.style.overflowX = 'auto';
            gridWrapper.innerHTML = tableHtml;
            container.appendChild(gridWrapper);
          });
        }
        docTabContent.appendChild(container);
      } else if (['png', 'jpg', 'jpeg', 'webp'].includes(ext)) {
        const imgBlob = new Blob([state.copilot.originalBuffer]);
        const imgUrl = URL.createObjectURL(imgBlob);
        
        const img = document.createElement('img');
        img.src = imgUrl;
        img.style.maxWidth = '100%';
        img.style.maxHeight = '600px';
        img.style.display = 'block';
        img.style.margin = '0 auto';
        img.style.boxShadow = '0 4px 14px rgba(0,0,0,0.12)';
        img.style.borderRadius = '6px';
        docTabContent.appendChild(img);
      }
    } catch (err) {
      console.error('Error rendering original doc preview:', err);
      const docTextBody = document.createElement('pre');
      docTextBody.style.whiteSpace = 'pre-wrap';
      docTextBody.style.fontFamily = "'Inter', sans-serif";
      docTextBody.style.fontSize = '0.8125rem';
      docTextBody.style.color = 'var(--text-secondary)';
      docTextBody.style.margin = '0';
      docTextBody.textContent = state.copilot.documentText;
      docTabContent.appendChild(docTextBody);
    }
    
    if (window.lucide) window.lucide.createIcons();
  }

  function runSmartOfflineHeuristics(prompt, docText, file) {
    const pLower = prompt.toLowerCase();
    const docName = file ? file.name : 'Document';
    const textLower = docText.toLowerCase();

    // 1. Language insertion offline simulation for CVs
    if (pLower.includes('language') && (pLower.includes('add') || pLower.includes('write') || pLower.includes('know') || pLower.includes('learn') || pLower.includes('suggest'))) {
      const langs = [];
      if (pLower.includes('hindi')) langs.push('Hindi');
      if (pLower.includes('punjabi')) langs.push('Punjabi');
      if (pLower.includes('english')) langs.push('English');
      if (pLower.includes('german')) langs.push('German (Learning)');
      if (pLower.includes('french')) langs.push('French');
      if (pLower.includes('spanish')) langs.push('Spanish');
      
      if (langs.length === 0) langs.push('Hindi', 'Punjabi', 'English', 'German (Learning)');
      
      let updatedText = docText;
      const languagesSection = `\n\nLANGUAGES KNOWN:\n` + langs.map(l => `* ${l}`).join('\n');
      
      if (textLower.includes('languages known') || textLower.includes('languages:')) {
        updatedText += `\n* Added: ${langs.join(', ')}.`;
      } else {
        updatedText += languagesSection;
      }
      
      let response = `### Live Document Update: Languages Section Appended\n\nI have automatically edited the document and added the requested languages (**${langs.join(', ')}**) to the end of the file.\n\nYou can see the modifications reflected immediately in the live preview on the left!`;
      
      return `${response}\n\n[UPDATED_DOCUMENT_TEXT]\n${updatedText}\n[/UPDATED_DOCUMENT_TEXT]`;
    }

    // 2. Spreadsheet filtration offline simulation
    const isSpreadsheet = file && ['xlsx', 'xls', 'csv'].includes(file.name.split('.').pop().toLowerCase());
    if (isSpreadsheet && state.copilot.extractedData && Array.isArray(state.copilot.extractedData) && state.copilot.extractedData.length > 0) {
      const headers = state.copilot.extractedData[0] || [];
      
      // Check for blank/missing/empty/without column queries (e.g. without middle name)
      if (pLower.includes('without') || pLower.includes('no ') || pLower.includes('empty') || pLower.includes('blank') || pLower.includes('missing') || pLower.includes('except')) {
        let targetColIdx = -1;
        let targetColName = '';
        
        // Find matching header name in prompt
        for (let c = 0; c < headers.length; c++) {
          const hName = String(headers[c]).toLowerCase();
          if (hName.length > 2 && pLower.includes(hName)) {
            targetColIdx = c;
            targetColName = headers[c];
            break;
          }
        }
        
        // Fallback for concatenated or simplified column names (e.g. "middlename" vs "Middle Name")
        if (targetColIdx === -1) {
          for (let c = 0; c < headers.length; c++) {
            const hNameClean = String(headers[c]).toLowerCase().replace(/[^a-z0-9]/g, '');
            const promptClean = pLower.replace(/[^a-z0-9]/g, '');
            if (hNameClean.length > 2 && promptClean.includes(hNameClean)) {
              targetColIdx = c;
              targetColName = headers[c];
              break;
            }
          }
        }

        if (targetColIdx !== -1) {
          const filteredRows = [headers];
          let count = 0;
          for (let r = 1; r < state.copilot.extractedData.length; r++) {
            const cellVal = String(state.copilot.extractedData[r][targetColIdx] || '').trim();
            if (cellVal === '' || cellVal.toLowerCase() === 'n/a' || cellVal.toLowerCase() === 'null') {
              filteredRows.push(state.copilot.extractedData[r]);
              count++;
            }
          }
          state.copilot.extractedData = filteredRows;
          state.copilot.isModified = true;
          
          let response = `### Spreadsheet Filter: Employees Without "${targetColName}"\n\nI have scanned the column **"${targetColName}"** and found **${count}** employee records with blank, missing, or empty entries.\n\nThe Excel grid preview on the left has been refreshed to display only these **${count}** employee(s). You can download this filtered sheet by clicking "Download Result"!`;
          return response;
        }
      }
      
      // Standard filter heuristics (age, country)
      if (pLower.includes('below 30') || pLower.includes('under 30') || pLower.includes('age < 30') || pLower.includes('less than 30')) {
        const ageColIdx = headers.findIndex(h => String(h).toLowerCase().includes('age'));
        if (ageColIdx !== -1) {
          const filteredRows = [headers];
          for (let r = 1; r < state.copilot.extractedData.length; r++) {
            const ageVal = parseInt(state.copilot.extractedData[r][ageColIdx]);
            if (!isNaN(ageVal) && ageVal < 30) {
              filteredRows.push(state.copilot.extractedData[r]);
            }
          }
          state.copilot.extractedData = filteredRows;
          state.copilot.isModified = true;
          
          let response = `### Live Spreadsheet Update: Age Filter Applied\n\nI have filtered the spreadsheet database registry to display only employees whose age is below 30.\n\nFound **${filteredRows.length - 1}** matching records. The preview table on the left is updated, and you can download the filtered sheet directly!`;
          return response;
        }
      }
      
      if (pLower.includes('kenya') || pLower.includes('country')) {
        const countryColIdx = headers.findIndex(h => String(h).toLowerCase().includes('country') || String(h).toLowerCase().includes('nation'));
        if (countryColIdx !== -1) {
          const filteredRows = [headers];
          for (let r = 1; r < state.copilot.extractedData.length; r++) {
            const countryVal = String(state.copilot.extractedData[r][countryColIdx]).toLowerCase();
            if (countryVal.includes('kenya')) {
              filteredRows.push(state.copilot.extractedData[r]);
            }
          }
          state.copilot.extractedData = filteredRows;
          state.copilot.isModified = true;
          
          let response = `### Live Spreadsheet Update: Country Filter Applied\n\nI filtered the registry to display only employees from **Kenya**.\n\nFound **${filteredRows.length - 1}** candidate(s). The grid view on the left has been refreshed.`;
          return response;
        }
      }
    }

    // Spreadsheet intelligent row filtering
    if (state.copilot.extractedData && Array.isArray(state.copilot.extractedData) && state.copilot.extractedData.length > 0) {
      const rows = state.copilot.extractedData;
      const headers = rows[0] || [];
      
      const stopWords = [
        'show', 'me', 'only', 'from', 'the', 'column', 'list', 'select', 'display', 'rows', 'filter', 'matching', 'with', 
        'nationality', 'position', 'company', 'status', 'how', 'many', 'who', 'what', 'where', 'why', 'we', 'have', 'has', 
        'had', 'do', 'does', 'did', 'is', 'are', 'was', 'were', 'be', 'been', 'being', 'a', 'an', 'and', 'or', 'but', 'if', 
        'then', 'else', 'to', 'in', 'on', 'at', 'by', 'for', 'about', 'against', 'between', 'into', 'through', 'during', 
        'before', 'after', 'above', 'below', 'up', 'down', 'out', 'off', 'over', 'under', 'again', 'further', 'once', 
        'here', 'there', 'when', 'all', 'any', 'both', 'each', 'few', 'more', 'most', 'other', 'some', 'such', 'no', 'nor', 
        'not', 'own', 'same', 'so', 'than', 'too', 'very', 'can', 'will', 'just', 'should', 'now', 'employee', 'employees', 
        'people', 'person', 'record', 'records', 'row', 'rows', 'data', 'sheet', 'table', 'tell', 'count', 'number', 'of', 'us',
        'get', 'find', 'search', 'give'
      ];
      const keywords = pLower.split(/[\s,]+/g).filter(w => w.length > 2 && !stopWords.includes(w));
      
      if (keywords.length > 0) {
        let matchedRows = [];
        
        // 1. Try strict matching: row must contain ALL keywords
        rows.slice(1).forEach(row => {
          const rowStr = row.map(cell => String(cell || '').toLowerCase()).join(' ');
          const matchesAll = keywords.every(kw => rowStr.includes(kw));
          if (matchesAll) {
            matchedRows.push(row);
          }
        });
        
        // 2. Fallback matching: if strict yields nothing, try matching the primary criteria (e.g. nationality 'nepal')
        if (matchedRows.length === 0) {
          const primaryKw = keywords[0]; // e.g. "nepal"
          rows.slice(1).forEach(row => {
            const rowStr = row.map(cell => String(cell || '').toLowerCase()).join(' ');
            if (rowStr.includes(primaryKw)) {
              matchedRows.push(row);
            }
          });
        }
        
        if (matchedRows.length > 0) {
          const isCountRequest = pLower.includes('how many') || pLower.includes('count') || pLower.includes('number of');
          let tableMd = `# Filtered Spreadsheet Results\n\n`;
          
          if (isCountRequest) {
            tableMd += `### 📊 Summary Answer\n`;
            tableMd += `There are **${matchedRows.length}** employee(s) matching your request (**${keywords.join(' & ')}**).\n\n`;
          }
          
          tableMd += `Found **${matchedRows.length}** row(s) matching your criteria:\n\n`;
          
          // Header row
          tableMd += `| ${headers.join(' | ')} |\n`;
          // Separator row
          tableMd += `| ${headers.map(() => '---').join(' | ')} |\n`;
          // Body rows
          matchedRows.forEach(row => {
            tableMd += `| ${row.map(cell => cell !== undefined && cell !== null ? String(cell).trim() : '').join(' | ')} |\n`;
          });
          
          return tableMd;
        } else {
          return `### No Matching Records Found\n\nI scanned the spreadsheet for **${keywords.join(', ')}** but could not locate any matching records. Please check the spelling or try searching for another column value!`;
        }
      }
    }

    const words = docText.match(/[A-Z][a-z]{4,}/g) || [];
    const freq = {};
    words.forEach(w => { freq[w] = (freq[w] || 0) + 1; });
    const sortedWords = Object.keys(freq).sort((a, b) => freq[b] - freq[a]).slice(0, 12);
    
    const sentences = docText.split(/[.!?]\s+/);
    const keySentences = sentences.filter(s => {
      const sLower = s.toLowerCase();
      return sLower.includes('shall') || sLower.includes('must') || sLower.includes('date') || sLower.includes('law') || sLower.includes('policy') || sLower.includes('$') || sLower.includes('percent') || sLower.includes('hors');
    }).slice(0, 6);

    let docClass = 'General Briefing';
    
    // Check CV/Resume first to avoid currency symbols or salary keywords misclassifying as Financial Ledger
    if (textLower.includes('resume') || textLower.includes('cv ') || textLower.includes('curriculum vitae') || textLower.includes('education') || textLower.includes('skills') || textLower.includes('experience') || textLower.includes('qualification')) {
      docClass = 'Curriculum Vitae / Candidate Profile';
    } else if (textLower.includes('policy') || textLower.includes('compliance')) {
      docClass = 'Regulatory Policy & Compliance Guidelines';
    } else if (textLower.includes('agreement') || textLower.includes('contract')) {
      docClass = 'Legal Agreement & Covenant';
    } else if (textLower.includes('invoice') || textLower.includes('payment') || textLower.includes('$') || textLower.includes('ledger') || textLower.includes('balance')) {
      docClass = 'Financial Statement / Invoice Ledger';
    }

    // Trigger question answering if prompt asks details or contains action words like summary/skills/extract/list
    const isQuestion = pLower.includes('what') || pLower.includes('why') || pLower.includes('how') || pLower.includes('where') || pLower.includes('who') || pLower.includes('find') || pLower.includes('search') || pLower.includes('tell') || pLower.includes('show') || pLower.includes('skills') || pLower.includes('experience') || pLower.includes('education') || pLower.includes('extract') || pLower.includes('list') || pLower.includes('make');
    
    if (isQuestion) {
      // 1. Core Skills Extraction Special Handler
      if (pLower.includes('skills')) {
        let skillsList = [];
        const commonSkills = ['javascript', 'python', 'html', 'css', 'react', 'node', 'java', 'c#', 'sql', 'project management', 'excel', 'finance', 'git', 'docker', 'aws', 'communication', 'leadership', 'design', 'german', 'english', 'sap', 'scrum', 'agile', 'sales', 'marketing'];
        commonSkills.forEach(s => {
          if (textLower.includes(s)) {
            skillsList.push(s.toUpperCase());
          }
        });
        
        let ans = `### 🛠️ Extracted Skills from: "${docName}"\n\n`;
        if (skillsList.length > 0) {
          ans += `Based on an offline scan of the document, the following core skills/technologies were identified:\n\n`;
          skillsList.forEach(s => {
            ans += `* **${s}**\n`;
          });
          ans += `\n*This list was generated offline based on matching keywords in the document text.*`;
        } else {
          const matchingSentences = sentences.filter(s => s.toLowerCase().includes('skill') || s.toLowerCase().includes('expert') || s.toLowerCase().includes('proficient')).slice(0, 4);
          if (matchingSentences.length > 0) {
            ans += `Here are the excerpts detailing skills/competencies:\n\n`;
            matchingSentences.forEach((s, idx) => {
              ans += `> **[Excerpt ${idx + 1}]**: "... ${s.trim()} ..."\n\n`;
            });
          } else {
            ans += `I scanned the document but could not find explicit skills keywords. Here is a baseline excerpt of the document content:\n\n> *"${docText.substring(0, 250)}..."*`;
          }
        }
        return ans;
      }

      // 2. Education Extraction Special Handler
      if (pLower.includes('education') || pLower.includes('university') || pLower.includes('degree')) {
        let ans = `### 🎓 Extracted Education from: "${docName}"\n\n`;
        const matchingSentences = sentences.filter(s => {
          const sl = s.toLowerCase();
          return sl.includes('university') || sl.includes('college') || sl.includes('degree') || sl.includes('bachelor') || sl.includes('master') || sl.includes('study') || sl.includes('school');
        }).slice(0, 4);
        
        if (matchingSentences.length > 0) {
          ans += `Based on a scan of the document, the following education details were identified:\n\n`;
          matchingSentences.forEach(s => {
            ans += `* **Details**: ${s.trim()}.\n`;
          });
        } else {
          ans += `I scanned the document but did not detect standard education credentials (degree, university, college).`;
        }
        return ans;
      }

      // 3. Experience Extraction Special Handler
      if (pLower.includes('experience') || pLower.includes('work') || pLower.includes('job') || pLower.includes('history')) {
        let ans = `### 💼 Extracted Experience from: "${docName}"\n\n`;
        const matchingSentences = sentences.filter(s => {
          const sl = s.toLowerCase();
          return sl.includes('manager') || sl.includes('developer') || sl.includes('engineer') || sl.includes('work') || sl.includes('experience') || sl.includes('role') || sl.includes('position');
        }).slice(0, 4);
        
        if (matchingSentences.length > 0) {
          ans += `Here is the career and experience timeline identified:\n\n`;
          matchingSentences.forEach(s => {
            ans += `* **Details**: ${s.trim()}.\n`;
          });
        } else {
          ans += `I scanned the document but did not find explicit job/experience references.`;
        }
        return ans;
      }

      // General Question Excerpt Matcher
      const queryWords = pLower.split(/\s+/).filter(w => w.length > 3 && !['what','where','when','that','this','your','about'].includes(w));
      let bestSentences = [];
      
      if (queryWords.length > 0) {
        const scoredSentences = sentences.map(s => {
          const sLower = s.toLowerCase();
          let score = 0;
          queryWords.forEach(qw => {
            if (sLower.includes(qw)) score += 2;
          });
          if (sLower.includes('shall') || sLower.includes('must')) score += 0.5;
          return { text: s, score };
        });
        
        bestSentences = scoredSentences
          .filter(x => x.score > 0)
          .sort((a, b) => b.score - a.score)
          .slice(0, 3)
          .map(x => x.text.trim());
      }
      
      if (bestSentences.length > 0) {
        let answerText = `### Local Intelligent Analysis for: "${prompt}"\n\n`;
        answerText += `Based on a contextual scan of **${docName}**, here are the key matching items found:\n\n`;
        bestSentences.forEach((s, idx) => {
          answerText += `> **[Excerpt ${idx + 1}]**: "... ${s} ..."\n\n`;
        });
        answerText += `*These excerpts represent the key clauses matching your query terms (${queryWords.join(', ')}).*`;
        return answerText;
      } else {
        return `### Local Analysis: "${prompt}"\n\nI scanned the document for keywords related to your query, but could not locate a direct text match. However, the document contains references to **${sortedWords.slice(0, 3).join(', ')}**. Let me know if you would like to run a full summary or locate financial/regulatory details!`;
      }
    }

    let summaryMd = `# ${docName.split('.').shift().toUpperCase()}\n\n`;
    summaryMd += `### 🏷️ Classification: **${docClass}**\n\n`;
    
    if (docClass.includes('Policy')) {
      summaryMd += `### 🛡️ Compliance Directives & Mandates\n`;
      if (keySentences.length > 0) {
        keySentences.forEach(s => {
          summaryMd += `* **Directive**: ${s.trim()}.\n`;
        });
      } else {
        summaryMd += `* **Commitment**: The document outlines compliance directives regarding corporate conduct, training mandates, and operational safety.\n`;
      }
      summaryMd += `\n### 👥 Scope of Authority\n`;
      summaryMd += `This compliance protocol governs all direct operations, partners, contractors, and affiliates. The zero-tolerance framework ensures absolute adherence to safety and ethics.\n\n`;
    } else if (docClass.includes('Legal')) {
      summaryMd += `### 📜 Key Covenants & Obligations\n`;
      if (keySentences.length > 0) {
        keySentences.forEach(s => {
          summaryMd += `* **Covenant**: ${s.trim()}.\n`;
        });
      } else {
        summaryMd += `* **Obligation**: Both parties agree to execute terms in accordance with local regulations and governing law.\n`;
      }
      summaryMd += `\n### ⚖️ Governing Framework\n`;
      summaryMd += `The covenant establishes liability thresholds, dispute resolutions, and conditions for termination or amendment.\n\n`;
    } else if (docClass.includes('Financial')) {
      summaryMd += `### 📊 Ledger Balance & Line Items\n`;
      const figures = docText.match(/[\d,]+\.?\d*/g) || [];
      const uniqueFigures = [...new Set(figures)].filter(f => f.length > 3).slice(0, 5);
      if (uniqueFigures.length > 0) {
        summaryMd += `The ledger identifies the following key figures:\n`;
        uniqueFigures.forEach(f => {
          summaryMd += `* **Statement Entry**: Value of **${f}** registered.\n`;
        });
      } else {
        summaryMd += `* **Overview**: Details accounts payable, invoicing schedules, and outstanding balances.\n`;
      }
      summaryMd += `\n### 💳 Payment Disbursements\n`;
      summaryMd += `All balances are subject to terms of carriage, bank clearances, and transaction deadlines.\n\n`;
    } else if (docClass.includes('Curriculum') || docClass.includes('Candidate')) {
      summaryMd += `### 👤 Candidate Overview\n`;
      let name = "Candidate";
      const nameMatch = docText.match(/([A-Z][a-z]+(?:\s+[A-Z][a-z]+)+)/);
      if (nameMatch) {
        name = nameMatch[1];
      }
      summaryMd += `The profile describes **${name}**'s career history, academic training, and core competencies.\n\n`;
      
      summaryMd += `### 🛠️ Core Skills & Expertise\n`;
      const skillsList = [];
      const commonSkills = ['javascript', 'python', 'html', 'css', 'react', 'node', 'java', 'c#', 'sql', 'project management', 'excel', 'finance', 'git', 'docker', 'aws', 'communication', 'leadership', 'design', 'german', 'english', 'sap', 'scrum', 'agile', 'sales', 'marketing'];
      commonSkills.forEach(s => {
        if (textLower.includes(s)) {
          skillsList.push(s.toUpperCase());
        }
      });
      
      if (skillsList.length > 0) {
        summaryMd += `The candidate possesses validated expertise in: **${skillsList.join('**, **')}**.\n`;
      } else {
        summaryMd += `* **Expertise**: General professional skills, technical expertise, and role-specific competencies.\n`;
      }
      
      summaryMd += `\n### 🎓 Education & Career Milestones\n`;
      const eduMilestones = sentences.filter(s => {
        const sL = s.toLowerCase();
        return sL.includes('university') || sL.includes('college') || sL.includes('degree') || sL.includes('bachelor') || sL.includes('master') || sL.includes('school') || sL.includes('manager') || sL.includes('developer') || sL.includes('engineer');
      }).slice(0, 4);
      
      if (eduMilestones.length > 0) {
        eduMilestones.forEach(m => {
          summaryMd += `* ${m.trim()}.\n`;
        });
      } else {
        summaryMd += `* Outlines past academic milestones and professional experience entries.\n`;
      }
      summaryMd += `\n`;
    } else {
      summaryMd += `### 📝 Executive Overview\n`;
      const paragraphs = docText.split(/\n\n+/).filter(p => p.trim().length > 30).slice(0, 3);
      if (paragraphs.length > 0) {
        paragraphs.forEach(p => {
          summaryMd += `* ${p.replace(/\n/g, ' ').substring(0, 180)}...\n\n`;
        });
      } else {
        summaryMd += `The document details primary project milestones, communication channels, and milestone outlines.\n\n`;
      }
    }

    if (sortedWords.length > 0) {
      summaryMd += `### 🔑 Primary Keywords\n`;
      summaryMd += `**${sortedWords.join('** • **')}**\n\n`;
    }
    
    const estTime = Math.max(1, Math.ceil(docText.split(/\s+/).length / 200));
    summaryMd += `### 📈 Document Statistics\n`;
    summaryMd += `* **Estimated Reading Time**: ${estTime} Minute(s)\n`;
    summaryMd += `* **Character Density**: ${docText.length} Characters\n`;
    summaryMd += `* **Linguistic Complexity**: Balanced Professional (Offline Engine)\n`;
    
    return summaryMd;
  }

  // Tab Switcher Logic
  function switchTab(activeTab) {
    if (activeTab === 'doc') {
      tabDocBtn.classList.add('active');
      tabAiBtn.classList.remove('active');
      docTabContent.classList.remove('hidden');
      aiTabContent.classList.add('hidden');
    } else {
      tabDocBtn.classList.remove('active');
      tabAiBtn.classList.add('active');
      docTabContent.classList.add('hidden');
      aiTabContent.classList.remove('hidden');
    }
  }

  tabDocBtn.addEventListener('click', () => switchTab('doc'));
  tabAiBtn.addEventListener('click', () => switchTab('ai'));



  // Upload actions
  uploadZone.addEventListener('click', () => fileInput.click());
  uploadTriggerBtn.addEventListener('click', () => fileInput.click());
  
  fileInput.addEventListener('change', async (e) => {
    const file = e.target.files[0];
    if (file) handleCopilotFile(file);
  });
  
  setupDragAndDrop(uploadZone, handleCopilotFile);
  
  async function handleCopilotFile(file) {
    state.copilot.file = file;
    state.copilot.documentText = '';
    state.copilot.extractedData = null;
    state.copilot.lastResponse = '';
    state.copilot.base64Data = null;
    state.copilot.hasRunAzureAnalysis = false;
    state.copilot.isModified = false;
    
    // Convert file to base64 for Azure Document Intelligence analysis
    const reader = new FileReader();
    reader.onload = function(e) {
      state.copilot.base64Data = e.target.result.split(',')[1];
    };
    reader.readAsDataURL(file);
    
    state.copilot.isInitialAnalyzing = true;
    showLoader('Visualizing the document...');
    
    try {
      const ext = file.name.split('.').pop().toLowerCase();
      const arrayBuffer = await file.arrayBuffer();
      state.copilot.originalBuffer = arrayBuffer;
      
      if (ext === 'pdf') {
        state.copilot.documentText = await extractTextFromPdf(arrayBuffer);
      } else if (ext === 'xlsx' || ext === 'xls') {
        const workbook = XLSX.read(arrayBuffer, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        
        // Save raw rows as extractedData for grid view
        state.copilot.extractedData = XLSX.utils.sheet_to_json(sheet, { header: 1 });
        
        // Save text representation
        let textRep = '';
        workbook.SheetNames.forEach(name => {
          textRep += `--- Sheet: ${name} ---\n` + XLSX.utils.sheet_to_csv(workbook.Sheets[name]) + '\n';
        });
        state.copilot.documentText = textRep;
      } else if (ext === 'docx') {
        const result = await mammoth.extractRawText({ arrayBuffer });
        state.copilot.documentText = result.value;
      } else if (['png', 'jpg', 'jpeg', 'webp'].includes(ext)) {
        // Render image to a canvas for OCR
        const imgBlob = new Blob([arrayBuffer]);
        const imgUrl = URL.createObjectURL(imgBlob);
        const img = new Image();
        
        await new Promise((resolve, reject) => {
          img.onload = resolve;
          img.onerror = reject;
          img.src = imgUrl;
        });
        
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0);
        
        const ocrData = await runOcrOnCanvas(canvas, (percent) => {
          document.getElementById('spinner-text').textContent = `Running OCR on image... ${percent}%`;
        });
        state.copilot.documentText = ocrData.text || '';
      } else {
        throw new Error('Unsupported format for AI analysis.');
      }
      
      // Update UI state
      uploadZone.classList.add('hidden');
      previewContainer.classList.remove('hidden');
      const toolbarTabs = document.getElementById('copilot-toolbar-tabs');
      if (toolbarTabs) toolbarTabs.classList.remove('hidden');
      downloadBtn.disabled = false;
      
      // Add system message
      appendMessage('system', `Successfully loaded document: "${file.name}" (${state.copilot.documentText.length} characters of text extracted). I am ready to answer your questions or edit the document!`);
      
      // Force Original Document tab active first when uploaded
      switchTab('doc');
      
      // Render baseline preview
      renderPreview();
      
      showToast('Document loaded successfully!', 'success');
      
      // Document is fully loaded and visualised
      state.copilot.isInitialAnalyzing = false;
      hideLoader();
    } catch (err) {
      console.error(err);
      showToast(err.message || 'Failed to load document.', 'danger');
      state.copilot.isInitialAnalyzing = false;
      hideLoader();
    } finally {
      fileInput.value = '';
    }
  }

  // Text extractors
  async function extractTextFromPdf(buffer) {
    const loadingTask = pdfjsLib.getDocument({ data: new Uint8Array(buffer) });
    const pdf = await loadingTask.promise;
    let fullText = '';
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const content = await page.getTextContent();
      const pageText = content.items.map(item => item.str).join(' ');
      fullText += `--- Page ${i} ---\n${pageText}\n\n`;
    }
    return fullText;
  }

  function appendMessage(sender, text) {
    const msg = document.createElement('div');
    const isBot = sender !== 'user';
    msg.style.background = isBot ? 'var(--bg-tertiary)' : 'var(--accent-purple-light)';
    msg.style.color = isBot ? 'var(--text-secondary)' : 'var(--accent-purple)';
    msg.style.padding = '0.75rem';
    msg.style.borderRadius = 'var(--border-radius-sm)';
    msg.style.fontSize = '0.8125rem';
    msg.style.borderLeft = isBot ? '3px solid var(--accent-purple)' : '3px solid transparent';
    msg.style.alignSelf = isBot ? 'flex-start' : 'flex-end';
    msg.style.maxWidth = '90%';
    
    function escapeHtml(str) {
      if (!str) return '';
      return str
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
    }
    
    let displayText = text;
    if (text.startsWith("Summarize this document. Analyze the type")) {
      displayText = "Summarize this document";
    }
    
    const contentHtml = isBot ? parseMarkdownToHtml(displayText) : escapeHtml(displayText);
    
    msg.innerHTML = `<strong>${sender === 'user' ? 'You' : (sender === 'system' ? 'System' : 'Gemini')}:</strong> ${contentHtml}`;
    chatHistory.appendChild(msg);
    chatHistory.scrollTop = chatHistory.scrollHeight;
  }

  // Markdown Parser to Beautiful Modern HTML with colors
  function parseMarkdownToHtml(markdownText, theme) {
    if (!markdownText) return '';
    if (!theme) theme = { primary: '#7c3aed', secondary: '#a855f7', bg: '#f5f3ff' };
    
    let html = markdownText;
    
    // GFM Table parsing using placeholder isolation to prevent breaking standard escaping
    const tablePlaceholders = [];
    const tableRegex = /\|((?:[^\n|]+\|)+)\n\|((?:\s*:-*:\s*|:-*|-*:|-[ -]*)\|)\n((?:\|(?:[^\n|]+\|)+\n*)+)/g;
    html = html.replace(tableRegex, (match, headerLine, alignLine, bodyRows) => {
      const headers = headerLine.split('|').map(h => h.trim()).filter(h => h !== '');
      const alignments = alignLine.split('|').map(a => {
        a = a.trim();
        if (a.startsWith(':') && a.endsWith(':')) return 'center';
        if (a.endsWith(':')) return 'right';
        return 'left';
      }).filter(a => a !== '');
      
      let tableHtml = `<div style="overflow-x: auto; margin: 1.5rem 0; border: 1px solid ${theme.secondary}40; border-radius: var(--border-radius-sm);"><table style="width: 100%; border-collapse: collapse; font-family: 'Inter', sans-serif; font-size: 0.8125rem; text-align: left;">`;
      
      // Header
      tableHtml += `<thead style="background: ${theme.primary}15; border-bottom: 2px solid ${theme.primary}40;"><tr>`;
      headers.forEach((h, idx) => {
        const align = alignments[idx] || 'left';
        tableHtml += `<th style="padding: 0.75rem 1rem; font-weight: 700; color: ${theme.primary}; text-align: ${align};">${h}</th>`;
      });
      tableHtml += '</tr></thead><tbody>';
      
      // Body
      const rows = bodyRows.trim().split('\n');
      rows.forEach((row, rowIdx) => {
        const cells = row.split('|').map(c => c.trim()).filter((c, idx) => idx > 0 && idx <= headers.length);
        const bg = rowIdx % 2 === 0 ? 'white' : `${theme.primary}05`;
        tableHtml += `<tr style="background: ${bg}; border-bottom: 1px solid var(--border-color);">`;
        cells.forEach((c, idx) => {
          const align = alignments[idx] || 'left';
          tableHtml += `<td style="padding: 0.75rem 1rem; color: var(--text-secondary); text-align: ${align};">${c}</td>`;
        });
        tableHtml += '</tr>';
      });
      
      tableHtml += '</tbody></table></div>';
      
      const placeholder = `__TABLE_PLACEHOLDER_${tablePlaceholders.length}__`;
      tablePlaceholders.push({ placeholder, content: tableHtml });
      return placeholder;
    });

    // Escaping html
    html = html
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
      
    // Parse Headers
    html = html.replace(/^### (.*?)$/gm, `<h4 style="font-family: 'Outfit', sans-serif; font-size: 1.1rem; font-weight: 700; color: ${theme.primary}; margin-top: 1.5rem; margin-bottom: 0.5rem; border-bottom: 1px solid ${theme.secondary}60; padding-bottom: 0.25rem;">$1</h4>`);
    html = html.replace(/^## (.*?)$/gm, `<h3 style="font-family: 'Outfit', sans-serif; font-size: 1.25rem; font-weight: 700; color: ${theme.secondary}; margin-top: 1.75rem; margin-bottom: 0.75rem;">$1</h3>`);
    html = html.replace(/^# (.*?)$/gm, `<h2 style="font-family: 'Outfit', sans-serif; font-size: 1.5rem; font-weight: 800; color: ${theme.primary}; text-align: center; margin-bottom: 1.5rem; border-bottom: 2px solid ${theme.primary}; display: table; margin: 0 auto 1.5rem auto; padding-bottom: 0.25rem;">$1</h2>`);
    
    // Parse Bold text (Premium color code badges)
    html = html.replace(/\*\*(.*?)\*\*/g, `<strong style="font-weight: 700; color: ${theme.primary}; background: ${theme.bg}; padding: 0.125rem 0.35rem; border-radius: 4px; border: 1px solid ${theme.secondary}40; font-size: 0.8125rem; display: inline-block; margin-bottom: 0.15rem;">$1</strong>`);
    
    // Parse Bullet Lists
    html = html.replace(/^\s*[-*]\s+(.*?)$/gm, '<li style="margin-left: 1.25rem; margin-bottom: 0.5rem; list-style-type: disc; color: var(--text-secondary); line-height: 1.6; font-size: 0.8125rem;">$1</li>');
    
    // Parse Numbered Lists (Gradient circular indicator badges)
    html = html.replace(/^\s*(\d+)\.\s+(.*?)$/gm, `<div style="display: flex; gap: 0.65rem; margin-bottom: 0.85rem; align-items: flex-start;"><span style="background: linear-gradient(135deg, ${theme.primary}, ${theme.secondary}); color: white; font-weight: 700; font-size: 0.725rem; width: 20px; height: 20px; border-radius: 50%; display: flex; align-items: center; justify-content: center; flex-shrink: 0; margin-top: 0.125rem; box-shadow: 0 2px 4px rgba(0, 0, 0, 0.08);">$1</span><div style="flex: 1; color: var(--text-secondary); line-height: 1.6; font-size: 0.8125rem;">$2</div></div>`);
    
    // Parse Paragraphs (Double newlines)
    html = html.replace(/\n\n/g, '</p><p style="margin-bottom: 1rem; line-height: 1.6; color: var(--text-secondary); font-size: 0.8125rem;">');
    
    // Single newlines to line breaks (inside lists/paragraphs)
    html = html.replace(/\n/g, '<br>');
    
    // Wrap in paragraph
    html = '<p style="margin-bottom: 1rem; line-height: 1.6; color: var(--text-secondary); font-size: 0.8125rem;">' + html + '</p>';
    
    // Clean up empty tags
    html = html.replace(/<p><\/p>/g, '');
    
    // Re-swap table placeholders back
    tablePlaceholders.forEach(item => {
      html = html.replace(item.placeholder, item.content);
    });
    
    return html;
  }

  function renderPreview() {
    // 1. Render Original Document visually in its tab
    renderVisualOriginalDoc();
    
    // 2. Render AI Output Tab
    if (aiTabContent) {
      aiTabContent.innerHTML = '';
      
      const theme = detectDocumentTheme(state.copilot.documentText || '');
      
      if (state.copilot.extractedData && Array.isArray(state.copilot.extractedData)) {
        // Excel/Spreadsheet Mode (Grid View)
        const tableWrapper = document.createElement('div');
        tableWrapper.style.width = '100%';
        tableWrapper.style.maxHeight = '550px';
        tableWrapper.style.overflow = 'auto';
        tableWrapper.style.border = '1px solid var(--border-color)';
        tableWrapper.style.borderRadius = 'var(--border-radius-sm)';
        
        const table = document.createElement('table');
        table.style.width = 'max-content';
        table.style.minWidth = '100%';
        table.style.borderCollapse = 'collapse';
        table.style.fontFamily = 'monospace';
        table.style.fontSize = '0.8125rem';
        table.style.color = 'var(--text-primary)';
        
        const maxCols = state.copilot.extractedData.reduce((max, row) => Math.max(max, row.length), 0);
        
        // Header labels A, B, C...
        const thead = document.createElement('thead');
        const headRow = document.createElement('tr');
        headRow.style.background = 'var(--bg-tertiary)';
        
        const cornerTh = document.createElement('th');
        cornerTh.style.border = '1px solid var(--border-color)';
        cornerTh.style.padding = '0.35rem';
        cornerTh.style.width = '40px';
        headRow.appendChild(cornerTh);
        
        for (let i = 0; i < maxCols; i++) {
          const th = document.createElement('th');
          th.style.border = '1px solid var(--border-color)';
          th.style.padding = '0.35rem';
          th.style.textAlign = 'center';
          th.style.minWidth = '120px';
          th.textContent = String.fromCharCode(65 + i); // A, B, C...
          headRow.appendChild(th);
        }
        thead.appendChild(headRow);
        table.appendChild(thead);
        
        // Body rows 1, 2, 3...
        const tbody = document.createElement('tbody');
        state.copilot.extractedData.forEach((row, rowIdx) => {
          const tr = document.createElement('tr');
          
          const indexTd = document.createElement('td');
          indexTd.style.border = '1px solid var(--border-color)';
          indexTd.style.padding = '0.35rem';
          indexTd.style.textAlign = 'center';
          indexTd.style.background = 'var(--bg-tertiary)';
          indexTd.style.fontWeight = '600';
          indexTd.textContent = rowIdx + 1;
          tr.appendChild(indexTd);
          
          for (let i = 0; i < maxCols; i++) {
            const td = document.createElement('td');
            td.style.border = '1px solid var(--border-color)';
            td.style.padding = '0.35rem';
            td.style.backgroundColor = 'var(--bg-secondary)';
            td.style.minWidth = '120px';
            td.style.whiteSpace = 'nowrap';
            td.textContent = row[i] !== undefined ? row[i] : '';
            tr.appendChild(td);
          }
          tbody.appendChild(tr);
        });
        table.appendChild(tbody);
        tableWrapper.appendChild(table);
        
        // Add sheet title badge styled with theme
        const badge = document.createElement('div');
        badge.style.display = 'inline-block';
        badge.style.padding = '0.25rem 0.5rem';
        badge.style.fontSize = '0.75rem';
        badge.style.fontWeight = '600';
        badge.style.background = theme.primary;
        badge.style.color = 'white';
        badge.style.borderRadius = '4px';
        badge.style.marginBottom = '0.75rem';
        badge.innerHTML = `<i data-lucide="sheet" style="width:12px; height:12px; vertical-align:middle; margin-right:4px;"></i> Excel Preview Grid`;
        
        aiTabContent.appendChild(badge);
        aiTabContent.appendChild(tableWrapper);
      } else {
        // Word/Document Mode (Formatted summary page layout styled with theme color)
        const docPage = document.createElement('div');
        docPage.style.background = 'white';
        docPage.style.color = '#1e293b';
        docPage.style.padding = '2.5rem';
        docPage.style.fontFamily = "'Inter', sans-serif";
        docPage.style.lineHeight = '1.6';
        docPage.style.border = '1px solid var(--border-color)';
        docPage.style.borderTop = `4px solid ${theme.primary}`;
        docPage.style.borderRadius = 'var(--border-radius-sm)';
        docPage.style.boxShadow = 'var(--shadow-md)';
        docPage.style.minHeight = '480px';
        docPage.style.textAlign = 'left';
        
        const title = document.createElement('h3');
        title.style.textAlign = 'center';
        title.style.marginBottom = '1.5rem';
        title.style.fontSize = '1.35rem';
        title.style.fontFamily = "'Outfit', sans-serif";
        title.style.fontWeight = '800';
        title.style.color = theme.primary;
        title.style.borderBottom = `2px solid ${theme.secondary}`;
        title.style.display = 'table';
        title.style.margin = '0 auto 1.75rem auto';
        title.style.paddingBottom = '0.25rem';
        title.textContent = state.copilot.file ? `${state.copilot.file.name.split('.').shift()} AI Summary` : 'AI Output Document';
        docPage.appendChild(title);
        
        const contentDiv = document.createElement('div');
        contentDiv.innerHTML = state.copilot.lastResponse
          ? parseMarkdownToHtml(state.copilot.lastResponse, theme)
          : `<div style="color: var(--text-muted); font-style: italic; text-align: center; padding-top: 5rem;">No summary generated yet. Ask a question or click "Summarize Document" on the left!</div>`;
        docPage.appendChild(contentDiv);
        aiTabContent.appendChild(docPage);
      }
    }
    
    if (window.lucide) window.lucide.createIcons();
  }

  // Suggestion click
  document.querySelectorAll('.copilot-suggest-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      promptInput.value = btn.dataset.prompt;
      sendBtn.click();
    });
  });

  // Enter key trigger for chat (Shift+Enter for new line)
  promptInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendBtn.click();
    }
  });

  // Auto-expand input height as user types (Extendable input)
  promptInput.addEventListener('input', () => {
    promptInput.style.height = 'auto';
    promptInput.style.height = Math.min(200, promptInput.scrollHeight) + 'px';
  });

  // Auto-focus prompt input when copilot becomes active
  setTimeout(() => promptInput.focus(), 300);

  // Export tab switch callback so other functions can switch tabs dynamically
  window.switchCopilotTab = switchTab;

  function processCopilotResponse(responseText) {
    const tagStart = responseText.indexOf('[UPDATED_DOCUMENT_TEXT]');
    const tagEnd = responseText.indexOf('[/UPDATED_DOCUMENT_TEXT]');
    if (tagStart !== -1 && tagEnd !== -1) {
      const updatedText = responseText.substring(tagStart + '[UPDATED_DOCUMENT_TEXT]'.length, tagEnd).trim();
      state.copilot.documentText = updatedText;
      state.copilot.isModified = true;
      responseText = responseText.substring(0, tagStart).trim() + '\n\n' + responseText.substring(tagEnd + '[/UPDATED_DOCUMENT_TEXT]'.length).trim();
    }
    return responseText;
  }

  // Chat send trigger
  sendBtn.addEventListener('click', async () => {
    const prompt = promptInput.value.trim();
    if (!prompt) return;
    
    appendMessage('user', prompt);
    promptInput.value = '';
    promptInput.style.height = '60px';
    
    // Add typing message
    const loaderMsg = document.createElement('div');
    loaderMsg.id = 'copilot-typing-loader';
    loaderMsg.style.background = 'var(--bg-tertiary)';
    loaderMsg.style.padding = '0.75rem';
    loaderMsg.style.color = 'var(--text-secondary)';
    loaderMsg.style.borderRadius = 'var(--border-radius-sm)';
    loaderMsg.style.fontSize = '0.8125rem';
    loaderMsg.style.borderLeft = '3px solid var(--accent-purple)';
    loaderMsg.innerHTML = '<strong>Gemini:</strong> <em>Thinking...</em>';
    chatHistory.appendChild(loaderMsg);
    chatHistory.scrollTop = chatHistory.scrollHeight;
    
    setTimeout(async () => {
      try {
        // Use site owner's secure backend middleware API
        const responseData = await callGeminiSecureBackend(prompt, state.copilot.documentText);
        let responseText = responseData.response;
        
        if (responseData.updatedBase64) {
          // Convert base64 back to ArrayBuffer
          const binaryString = window.atob(responseData.updatedBase64);
          const len = binaryString.length;
          const bytes = new Uint8Array(len);
          for (let i = 0; i < len; i++) {
            bytes[i] = binaryString.charCodeAt(i);
          }
          state.copilot.originalBuffer = bytes.buffer;
          state.copilot.base64Data = responseData.updatedBase64;
          state.copilot.isModified = true;
          
          // Re-extract document text for further chat context
          try {
            const ext = state.copilot.file.name.split('.').pop().toLowerCase();
            if (ext === 'xlsx' || ext === 'xls') {
               const workbook = XLSX.read(bytes.buffer, { type: 'array' });
               const sheetName = workbook.SheetNames[0];
               const sheet = workbook.Sheets[sheetName];
               state.copilot.extractedData = XLSX.utils.sheet_to_json(sheet, { header: 1 });
               
               let textRep = '';
               workbook.SheetNames.forEach(name => {
                 textRep += `--- Sheet: ${name} ---\n` + XLSX.utils.sheet_to_csv(workbook.Sheets[name]) + '\n';
               });
               state.copilot.documentText = textRep;
            } else if (ext === 'docx') {
               const result = await mammoth.extractRawText({ arrayBuffer: bytes.buffer });
               state.copilot.documentText = result.value;
            }
          } catch(e) {
            console.error("Failed to re-extract text from modified buffer", e);
          }
          
          // Force UI to re-render the exact document preview
          renderVisualOriginalDoc();
        }
        
        // No longer relying on [UPDATED_DOCUMENT_TEXT] extraction for Word/Excel as the backend modifies files natively
        // We still keep the processing for backward compatibility or simple text updates if the AI generates it
        responseText = processCopilotResponse(responseText);
        
        // Hide the initial visualization loading modal if active
        if (state.copilot.isInitialAnalyzing) {
          state.copilot.isInitialAnalyzing = false;
          hideLoader();
        }
        
        // Remove typing loader
        const loader = document.getElementById('copilot-typing-loader');
        if (loader) loader.remove();
        
        appendMessage('copilot', responseText);
        state.copilot.lastResponse = responseText;
        applyAiResponseToPreview(prompt, responseText);
        promptInput.focus();
      } catch (err) {
        console.error(err);
        const loader = document.getElementById('copilot-typing-loader');
        if (loader) loader.remove();
        
        // Hide the initial visualization loading modal if active
        if (state.copilot.isInitialAnalyzing) {
          state.copilot.isInitialAnalyzing = false;
          hideLoader();
        }
        
        let errorMsg = `⚠️ **AI Summary/Gemini Disconnected**\n\nI couldn't process your request because the proxy backend encountered an error: ${err.message}`;
        
        appendMessage('copilot', errorMsg);
        state.copilot.lastResponse = errorMsg;
        promptInput.focus();
      }
    }, 1000);
  });

  function _arrayBufferToBase64(buffer) {
    let binary = '';
    const bytes = new Uint8Array(buffer);
    const len = bytes.byteLength;
    for (let i = 0; i < len; i++) {
        binary += String.fromCharCode(bytes[i]);
    }
    return window.btoa(binary);
  }

  async function callGeminiSecureBackend(prompt, docText) {
    const filename = state.copilot.file ? state.copilot.file.name : '';
    const fileBase64 = state.copilot.base64Data || '';
    const ext = filename ? filename.split('.').pop().toLowerCase() : '';

    let systemInstruction = `You are an AI Document Assistant for the AI Gemini platform. You analyze files (PDF, Word, Excel, Images) and provide detailed, professional summaries, table extracts, or answers based ONLY on the user's explicit formatting instructions. Do NOT use generic or hardcoded summary rules. Dynamically mold your response to exactly what the user asks (e.g., bullet points, email format, markdown tables).\n\n`;

    if (ext === 'docx') {
      systemInstruction += `If the user asks to edit or modify the text in the Word document, you must generate a JSON object with a "replacements" array containing "search" and "replace" keys. For example: {"replacements": [{"search": "old name", "replace": "new name"}]}. Output ONLY the JSON block wrapped in \`\`\`json ... \`\`\` and a brief summary of what you did outside the block.`;
    } else if (ext === 'xlsx' || ext === 'xls') {
      systemInstruction += `If the user asks to modify the spreadsheet (e.g., add columns, filter rows, change data), you must generate the complete updated spreadsheet data as a 2D JSON array (array of rows, where each row is an array of cells). Output ONLY the JSON block wrapped in \`\`\`json ... \`\`\` and a brief summary of what you did outside the block.`;
    } else if (ext === 'pdf') {
      systemInstruction += `If the user asks to edit text inside a PDF, you must respond EXACTLY with: "Direct text editing isn't supported inside static PDF formats. However, I can execute this edit by converting it to an editable Word document for you, or I can generate a brand-new, modified PDF version for you to download."\nIf they ask for PDF operations like page rotation or extraction, output a JSON command wrapped in \`\`\`json like {"action": "rotate", "degrees": 90} or {"action": "extract", "pages": [1, 2]}.`;
    }

    const payload = {
      contents: [
        {
          parts: [
            { text: systemInstruction },
            { text: `DOCUMENT TEXT CONTENT:\n${docText || 'Empty'}` },
            { text: `USER REQUEST:\n${prompt}` }
          ]
        }
      ]
    };
    
    const response = await fetch('/.netlify/functions/chat-proxy', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ payload })
    });

    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      throw new Error(errData.error || `Secure backend error: ${response.status}`);
    }

    const data = await response.json();
    let aiResponse = data.response;
    
    if (!aiResponse) {
      throw new Error('Invalid response structure from backend proxy.');
    }

    let updatedBase64 = null;
    const jsonMatch = aiResponse.match(/```json\n([\s\S]*?)\n```/);
    if (jsonMatch && fileBase64) {
      try {
        const cmd = JSON.parse(jsonMatch[1]);
        if (ext === 'docx' && cmd.replacements) {
           const zip = new PizZip(state.copilot.originalBuffer);
           let xml = zip.file("word/document.xml").asText();
           for (const rep of cmd.replacements) {
             xml = xml.split(rep.search).join(rep.replace);
           }
           zip.file("word/document.xml", xml);
           const newBlob = zip.generate({ type: "nodebuffer" });
           updatedBase64 = _arrayBufferToBase64(newBlob);
           state.copilot.originalBuffer = newBlob;
        } else if ((ext === 'xlsx' || ext === 'xls') && Array.isArray(cmd)) {
           const ws = XLSX.utils.aoa_to_sheet(cmd);
           const wb = XLSX.utils.book_new();
           XLSX.utils.book_append_sheet(wb, ws, "Sheet1");
           const newBuffer = XLSX.write(wb, { type: "array", bookType: "xlsx" });
           updatedBase64 = _arrayBufferToBase64(newBuffer);
           state.copilot.originalBuffer = newBuffer;
        } else if (ext === 'pdf' && cmd.action) {
           const pdfDoc = await PDFDocument.load(state.copilot.originalBuffer);
           if (cmd.action === 'rotate' && cmd.degrees) {
             const pages = pdfDoc.getPages();
             pages.forEach(page => page.setRotation(degrees(page.getRotation().angle + cmd.degrees)));
           } else if (cmd.action === 'extract' && cmd.pages) {
             const newPdf = await PDFDocument.create();
             const copiedPages = await newPdf.copyPages(pdfDoc, cmd.pages.map(p => p - 1));
             copiedPages.forEach(page => newPdf.addPage(page));
             const newBytes = await newPdf.save();
             updatedBase64 = _arrayBufferToBase64(newBytes);
             state.copilot.originalBuffer = newBytes;
             aiResponse = aiResponse.replace(/```json\n([\s\S]*?)\n```/, '').trim();
             return { response: aiResponse, updatedBase64 };
           }
           const newBytes = await pdfDoc.save();
           updatedBase64 = _arrayBufferToBase64(newBytes);
           state.copilot.originalBuffer = newBytes;
        }
        
        aiResponse = aiResponse.replace(/```json\n([\s\S]*?)\n```/, '').trim();
      } catch (e) {
        console.error("Failed to parse or apply JSON command locally", e);
      }
    }

    return { response: aiResponse, updatedBase64 };
  }

  function runDemoSimulation(prompt) {
    const pLower = prompt.toLowerCase();
    
    if (pLower.includes('split') || pLower.includes('employee') || pLower.includes('first')) {
      // Spreadsheet simulation
      state.copilot.extractedData = [
        ['Employee Name', 'First Name', 'Middle Name', 'Last Name'],
        ['John M. Doe', 'John', 'M.', 'Doe'],
        ['Jane Smith', 'Jane', '', 'Smith'],
        ['Robert Lee Wang', 'Robert', 'Lee', 'Wang'],
        ['Emily Watson', 'Emily', '', 'Watson'],
        ['David K. Miller', 'David', 'K.', 'Miller'],
        ['Sarah Jane Parker', 'Sarah', 'Jane', 'Parker']
      ];
      
      outputFormatSelect.value = 'xlsx'; // Auto switch to spreadsheet output
      
      return `I have successfully parsed the employee names from Column A and split them into three distinct columns: B ("First Name"), C ("Middle Name"), and D ("Last Name") using spaces and middle initial matches. 

You can view the updated spreadsheet grid in the live preview on the right, and download the actual formatted spreadsheet file by clicking "Download Result".`;
    }
    
    if (pLower.includes('summar') || pLower.includes('paragraph') || pLower.includes('key')) {
      // Document summary simulation
      const docName = state.copilot.file ? state.copilot.file.name : 'Document';
      state.copilot.extractedData = null; // switch to word preview
      
      return `### Executive Summary: ${docName}

1. **Overview & Context**: The uploaded document details the project outlines, operational goals, and milestone trackers. The primary focus is to streamline cross-functional workflows and increase development velocity.

2. **Key Deliverables**:
   - Establish secure localized document workspace (Completed).
   - Implement client-side PDF manipulation engine including split/merge utilities (Completed).
   - Integrate smart AI Copilot system to summarize and reformat documents (In progress).

3. **Conclusion & Recommendations**: The system is fully privately secured; all code operations execute strictly inside browser memory. It is recommended to deploy the build to production and begin user testing.`;
    }
    
    // Default fallback
    state.copilot.extractedData = null;
    return `I received your request: "${prompt}". 

Here is my AI assessment: The document contains text sections detailing project parameters, formatting instructions, and system summaries. Please save a Gemini API Key to enable real-time dynamic document transformations on custom files!`;
  }

  function applyAiResponseToPreview(prompt, response) {
    // If the response contains a markdown table and the user is expecting a table, extract it!
    const tableRegex = /\|(.+)\|/g;
    const matches = response.match(tableRegex);
    
    const pLower = prompt.toLowerCase();
    const isSpreadsheet = state.copilot.file && ['xlsx', 'xls', 'csv'].includes(state.copilot.file.name.split('.').pop().toLowerCase());
    const isSpreadsheetPrompt = isSpreadsheet || pLower.includes('split') || pLower.includes('employee') || pLower.includes('table') || pLower.includes('column') || pLower.includes('show') || pLower.includes('filter') || pLower.includes('only') || pLower.includes('select');
    
    if (isSpreadsheetPrompt && matches && matches.length > 2) {
      try {
        const rows = matches.map(line => {
          return line.split('|')
            .map(cell => cell.trim())
            .filter((_, idx, arr) => idx > 0 && idx < arr.length - 1);
        });
        
        // Remove line dividers e.g. |---|---|
        const cleanRows = rows.filter(row => !row.every(cell => cell.startsWith('-')));
        
        if (cleanRows.length > 0) {
          state.copilot.extractedData = cleanRows;
        }
      } catch (err) {
        console.error('Failed to parse AI markdown table:', err);
      }
    }
    
    renderPreview();
    
    // Switch to AI Output tab automatically when response completes
    if (window.switchCopilotTab) {
      window.switchCopilotTab('ai');
    }
  }

  // Download Action
  downloadBtn.addEventListener('click', () => {
    const format = outputFormatSelect.value;
    const docName = state.copilot.file ? state.copilot.file.name.split('.').shift() : 'copilot_result';
    
    showLoader('Generating output file...');
    
    setTimeout(() => {
      try {
        if (format === 'xlsx') {
          // Generate Excel Workbook
          const data = state.copilot.extractedData || [
            ['AI Output Summary'],
            [state.copilot.lastResponse || 'No content generated']
          ];
          
          const ws = XLSX.utils.aoa_to_sheet(data);
          const wb = XLSX.utils.book_new();
          XLSX.utils.book_append_sheet(wb, ws, "Copilot Result");
          XLSX.writeFile(wb, `${docName}_gemini.xlsx`);
          showToast('Excel workbook downloaded successfully!', 'success');
        } else if (format === 'pdf') {
          if (state.copilot.isModified && state.copilot.file.name.toLowerCase().endsWith('.pdf')) {
            const blob = new Blob([state.copilot.originalBuffer], { type: 'application/pdf' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `${docName}_gemini.pdf`;
            a.click();
            URL.revokeObjectURL(url);
            showToast('Modified PDF downloaded successfully!', 'success');
          } else {
            // Generate PDF using html2pdf (target the styled AI content tab)
            const element = document.getElementById('copilot-ai-tab-content');
            const opt = {
              margin:       10,
              filename:     `${docName}_gemini.pdf`,
              image:        { type: 'jpeg', quality: 0.98 },
              html2canvas:  { scale: 2 },
              jsPDF:        { unit: 'mm', format: 'a4', orientation: 'portrait' }
            };
            html2pdf().from(element).set(opt).save();
            showToast('PDF summary downloaded successfully!', 'success');
          }
        } else if (format === 'docx') {
          if (state.copilot.isModified && state.copilot.file.name.toLowerCase().endsWith('.docx')) {
            const blob = new Blob([state.copilot.originalBuffer], { type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `${docName}_gemini.docx`;
            a.click();
            URL.revokeObjectURL(url);
            showToast('Modified Word document downloaded successfully!', 'success');
          } else {
            const element = document.getElementById('copilot-ai-tab-content');
            const htmlContent = element.innerHTML;
            
            const header = "<html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'><head><title>Document</title><!--[if gte mso 9]><xml><w:WordDocument><w:View>Print</w:View><w:Zoom>90</w:Zoom></w:WordDocument></xml><![endif]--></head><body>";
            const footer = "</body></html>";
            const source = header + htmlContent + footer;
            
            const blob = new Blob(['\ufeff' + source], {
              type: 'application/msword'
            });
            
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `${docName}_gemini.doc`;
            a.click();
            URL.revokeObjectURL(url);
            showToast('Word document downloaded successfully!', 'success');
          }
        } else if (format === 'jpg') {
          // Export preview box as image
          const element = document.getElementById('copilot-ai-tab-content');
          html2pdf().from(element).toImg().get('img').then(img => {
            const a = document.createElement('a');
            a.href = img.src;
            a.download = `${docName}_gemini.jpg`;
            a.click();
            showToast('Image downloaded successfully!', 'success');
          });
        }
      } catch (err) {
        console.error(err);
        showToast('Failed to generate output download.', 'danger');
      } finally {
        hideLoader();
      }
    }, 500);
  });
}

// -------------------------------------------------------------
// 19. REMOVE PAGES COMPONENT
// -------------------------------------------------------------
function setupRemoveWorkspace() {
  const uploadZone = document.getElementById('remove-upload-zone');
  const fileInput = document.getElementById('remove-file-input');
  const submitBtn = document.getElementById('remove-submit-btn');
  
  uploadZone.addEventListener('click', () => fileInput.click());
  fileInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) handleRemoveFile(file);
  });
  
  setupDragAndDrop(uploadZone, handleRemoveFile);
  
  submitBtn.addEventListener('click', async () => {
    const pagesStr = document.getElementById('remove-pages-input').value.trim();
    if (!pagesStr) {
      showToast('Please specify the page numbers to remove.', 'danger');
      return;
    }
    
    showLoader('Removing specified pages...');
    try {
      const pdfBytes = await removePagesFromPdf(state.remove.file, pagesStr);
      const blob = new Blob([pdfBytes], { type: 'application/pdf' });
      downloadBlob(blob, state.remove.file.name.replace(/\.pdf$/i, '_edited.pdf'));
      showToast('Pages removed successfully!');
    } catch (err) {
      console.error(err);
      showToast(err.message || 'Failed to remove pages.', 'danger');
    } finally {
      hideLoader();
    }
  });
}

async function handleRemoveFile(file) {
  if (file.type !== 'application/pdf' && !file.name.endsWith('.pdf')) {
    showToast('Please upload a PDF file.', 'danger');
    return;
  }
  state.remove.file = file;
  showLoader('Analyzing PDF...');
  try {
    const buffer = await file.arrayBuffer();
    const pdfJs = await pdfjsLib.getDocument({ data: new Uint8Array(buffer) }).promise;
    state.remove.pageCount = pdfJs.numPages;
    document.getElementById('remove-filename').textContent = file.name;
    document.getElementById('remove-pagecount').textContent = `Total Pages: ${pdfJs.numPages}`;
    document.getElementById('remove-upload-zone').classList.add('hidden');
    document.getElementById('remove-setup').classList.remove('hidden');
  } catch (err) {
    console.error(err);
    showToast('Failed to load PDF info.', 'danger');
  } finally {
    hideLoader();
  }
}

// -------------------------------------------------------------
// 20. EXTRACT PAGES COMPONENT
// -------------------------------------------------------------
function setupExtractWorkspace() {
  const uploadZone = document.getElementById('extract-upload-zone');
  const fileInput = document.getElementById('extract-file-input');
  const submitBtn = document.getElementById('extract-submit-btn');
  
  uploadZone.addEventListener('click', () => fileInput.click());
  fileInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) handleExtractFile(file);
  });
  
  setupDragAndDrop(uploadZone, handleExtractFile);
  
  submitBtn.addEventListener('click', async () => {
    const pagesStr = document.getElementById('extract-pages-input').value.trim();
    if (!pagesStr) {
      showToast('Please specify the page numbers to extract.', 'danger');
      return;
    }
    
    showLoader('Extracting specified pages...');
    try {
      const pdfBytes = await extractPagesFromPdf(state.extract.file, pagesStr);
      const blob = new Blob([pdfBytes], { type: 'application/pdf' });
      downloadBlob(blob, state.extract.file.name.replace(/\.pdf$/i, '_extracted.pdf'));
      showToast('Pages extracted successfully!');
    } catch (err) {
      console.error(err);
      showToast(err.message || 'Failed to extract pages.', 'danger');
    } finally {
      hideLoader();
    }
  });
}

async function handleExtractFile(file) {
  if (file.type !== 'application/pdf' && !file.name.endsWith('.pdf')) {
    showToast('Please upload a PDF file.', 'danger');
    return;
  }
  state.extract.file = file;
  showLoader('Analyzing PDF...');
  try {
    const buffer = await file.arrayBuffer();
    const pdfJs = await pdfjsLib.getDocument({ data: new Uint8Array(buffer) }).promise;
    state.extract.pageCount = pdfJs.numPages;
    document.getElementById('extract-filename').textContent = file.name;
    document.getElementById('extract-pagecount').textContent = `Total Pages: ${pdfJs.numPages}`;
    document.getElementById('extract-upload-zone').classList.add('hidden');
    document.getElementById('extract-setup').classList.remove('hidden');
  } catch (err) {
    console.error(err);
    showToast('Failed to load PDF info.', 'danger');
  } finally {
    hideLoader();
  }
}

// -------------------------------------------------------------
// 21. REPAIR PDF COMPONENT
// -------------------------------------------------------------
function setupRepairWorkspace() {
  const uploadZone = document.getElementById('repair-upload-zone');
  const fileInput = document.getElementById('repair-file-input');
  const submitBtn = document.getElementById('repair-submit-btn');
  
  uploadZone.addEventListener('click', () => fileInput.click());
  fileInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) handleRepairFile(file);
  });
  
  setupDragAndDrop(uploadZone, handleRepairFile);
  
  submitBtn.addEventListener('click', async () => {
    showLoader('Repairing cross-references and structure...');
    try {
      const pdfBytes = await repairPdf(state.repair.file);
      const blob = new Blob([pdfBytes], { type: 'application/pdf' });
      downloadBlob(blob, state.repair.file.name.replace(/\.pdf$/i, '_rebuilt.pdf'));
      showToast('PDF file repaired successfully!');
    } catch (err) {
      console.error(err);
      showToast('Failed to repair PDF document.', 'danger');
    } finally {
      hideLoader();
    }
  });
}

function handleRepairFile(file) {
  if (file.type !== 'application/pdf' && !file.name.endsWith('.pdf')) {
    showToast('Please upload a PDF file.', 'danger');
    return;
  }
  state.repair.file = file;
  document.getElementById('repair-filename').textContent = file.name;
  document.getElementById('repair-filesize').textContent = `Size: ${(file.size / 1024).toFixed(1)} KB`;
  document.getElementById('repair-upload-zone').classList.add('hidden');
  document.getElementById('repair-setup').classList.remove('hidden');
}

// -------------------------------------------------------------
// 22. PPTX TO PDF COMPONENT
// -------------------------------------------------------------
function setupPptxToPdfWorkspace() {
  const uploadZone = document.getElementById('pptx-to-pdf-upload-zone');
  const fileInput = document.getElementById('pptx-to-pdf-file-input');
  const submitBtn = document.getElementById('pptx-to-pdf-submit-btn');
  
  uploadZone.addEventListener('click', () => fileInput.click());
  fileInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) handlePptxToPdfFile(file);
  });
  
  setupDragAndDrop(uploadZone, handlePptxToPdfFile);
  
  submitBtn.addEventListener('click', async () => {
    showLoader('Parsing presentation structures and rendering PDF...');
    try {
      const pdfBytes = await convertPptxToPdf(state.pptxToPdf.file);
      const blob = new Blob([pdfBytes], { type: 'application/pdf' });
      downloadBlob(blob, state.pptxToPdf.file.name.replace(/\.pptx$/i, '.pdf'));
      showToast('PowerPoint presentation converted successfully!');
    } catch (err) {
      console.error(err);
      showToast('Conversion failed. Ensure the PPTX is not corrupt.', 'danger');
    } finally {
      hideLoader();
    }
  });
}

function handlePptxToPdfFile(file) {
  if (!file.name.endsWith('.pptx')) {
    showToast('Please upload a Microsoft PowerPoint (.pptx) file.', 'danger');
    return;
  }
  state.pptxToPdf.file = file;
  document.getElementById('pptx-to-pdf-filename').textContent = file.name;
  document.getElementById('pptx-to-pdf-filesize').textContent = `Size: ${(file.size / 1024).toFixed(1)} KB`;
  document.getElementById('pptx-to-pdf-upload-zone').classList.add('hidden');
  document.getElementById('pptx-to-pdf-setup').classList.remove('hidden');
}

// -------------------------------------------------------------
// 23. HTML TO PDF COMPONENT
// -------------------------------------------------------------
function setupHtmlToPdfWorkspace() {
  const uploadZone = document.getElementById('html-to-pdf-upload-zone');
  const fileInput = document.getElementById('html-to-pdf-file-input');
  const submitBtn = document.getElementById('html-to-pdf-submit-btn');
  
  uploadZone.addEventListener('click', () => fileInput.click());
  fileInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) handleHtmlToPdfFile(file);
  });
  
  setupDragAndDrop(uploadZone, handleHtmlToPdfFile);
  
  submitBtn.addEventListener('click', async () => {
    showLoader('Compiling HTML structures and rendering PDF...');
    try {
      const pdfBytes = await convertHtmlToPdf(state.htmlToPdf.file);
      const blob = new Blob([pdfBytes], { type: 'application/pdf' });
      downloadBlob(blob, state.htmlToPdf.file.name.replace(/\.html$/i, '.pdf'));
      showToast('HTML page converted successfully!');
    } catch (err) {
      console.error(err);
      showToast('Failed to convert HTML to PDF.', 'danger');
    } finally {
      hideLoader();
    }
  });
}

function handleHtmlToPdfFile(file) {
  if (!file.name.endsWith('.html') && !file.name.endsWith('.htm')) {
    showToast('Please upload an HTML file (.html).', 'danger');
    return;
  }
  state.htmlToPdf.file = file;
  document.getElementById('html-to-pdf-filename').textContent = file.name;
  document.getElementById('html-to-pdf-filesize').textContent = `Size: ${(file.size / 1024).toFixed(1)} KB`;
  document.getElementById('html-to-pdf-upload-zone').classList.add('hidden');
  document.getElementById('html-to-pdf-setup').classList.remove('hidden');
}

// -------------------------------------------------------------
// 24. PDF TO WORD COMPONENT
// -------------------------------------------------------------
function setupPdfToWordWorkspace() {
  const uploadZone = document.getElementById('pdf-to-word-upload-zone');
  const fileInput = document.getElementById('pdf-to-word-file-input');
  const submitBtn = document.getElementById('pdf-to-word-submit-btn');
  
  uploadZone.addEventListener('click', () => fileInput.click());
  fileInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) handlePdfToWordFile(file);
  });
  
  setupDragAndDrop(uploadZone, handlePdfToWordFile);
  
  submitBtn.addEventListener('click', async () => {
    showLoader('Extracting text and structural layers...');
    try {
      const wordBlob = await convertPdfToWord(state.pdfToWord.file);
      downloadBlob(wordBlob, state.pdfToWord.file.name.replace(/\.pdf$/i, '.docx'));
      showToast('PDF converted to Word document successfully!');
    } catch (err) {
      console.error(err);
      showToast('Failed to convert PDF to Word.', 'danger');
    } finally {
      hideLoader();
    }
  });
}

async function handlePdfToWordFile(file) {
  if (file.type !== 'application/pdf' && !file.name.endsWith('.pdf')) {
    showToast('Please upload a PDF file.', 'danger');
    return;
  }
  state.pdfToWord.file = file;
  showLoader('Analyzing PDF...');
  try {
    const buffer = await file.arrayBuffer();
    const pdfJs = await pdfjsLib.getDocument({ data: new Uint8Array(buffer) }).promise;
    state.pdfToWord.pageCount = pdfJs.numPages;
    document.getElementById('pdf-to-word-filename').textContent = file.name;
    document.getElementById('pdf-to-word-pagecount').textContent = `Total Pages: ${pdfJs.numPages}`;
    document.getElementById('pdf-to-word-upload-zone').classList.add('hidden');
    document.getElementById('pdf-to-word-setup').classList.remove('hidden');
  } catch (err) {
    console.error(err);
    showToast('Failed to load PDF info.', 'danger');
  } finally {
    hideLoader();
  }
}

// -------------------------------------------------------------
// 25. PDF TO POWERPOINT COMPONENT
// -------------------------------------------------------------
function setupPdfToPowerpointWorkspace() {
  const uploadZone = document.getElementById('pdf-to-powerpoint-upload-zone');
  const fileInput = document.getElementById('pdf-to-powerpoint-file-input');
  const submitBtn = document.getElementById('pdf-to-powerpoint-submit-btn');
  
  uploadZone.addEventListener('click', () => fileInput.click());
  fileInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) handlePdfToPowerpointFile(file);
  });
  
  setupDragAndDrop(uploadZone, handlePdfToPowerpointFile);
  
  submitBtn.addEventListener('click', async () => {
    showLoader('Rendering slides and bundling presentation...');
    try {
      const pptxBlob = await convertPdfToPowerpoint(state.pdfToPowerpoint.file);
      downloadBlob(pptxBlob, state.pdfToPowerpoint.file.name.replace(/\.pdf$/i, '.pptx'));
      showToast('PDF converted to PowerPoint presentation!');
    } catch (err) {
      console.error(err);
      showToast('Failed to convert PDF to PPTX.', 'danger');
    } finally {
      hideLoader();
    }
  });
}

async function handlePdfToPowerpointFile(file) {
  if (file.type !== 'application/pdf' && !file.name.endsWith('.pdf')) {
    showToast('Please upload a PDF file.', 'danger');
    return;
  }
  state.pdfToPowerpoint.file = file;
  showLoader('Analyzing PDF...');
  try {
    const buffer = await file.arrayBuffer();
    const pdfJs = await pdfjsLib.getDocument({ data: new Uint8Array(buffer) }).promise;
    state.pdfToPowerpoint.pageCount = pdfJs.numPages;
    document.getElementById('pdf-to-powerpoint-filename').textContent = file.name;
    document.getElementById('pdf-to-powerpoint-pagecount').textContent = `Total Pages: ${pdfJs.numPages}`;
    document.getElementById('pdf-to-powerpoint-upload-zone').classList.add('hidden');
    document.getElementById('pdf-to-powerpoint-setup').classList.remove('hidden');
  } catch (err) {
    console.error(err);
    showToast('Failed to load PDF info.', 'danger');
  } finally {
    hideLoader();
  }
}

// -------------------------------------------------------------
// 26. PDF TO EXCEL COMPONENT
// -------------------------------------------------------------
function setupPdfToExcelWorkspace() {
  const uploadZone = document.getElementById('pdf-to-excel-upload-zone');
  const fileInput = document.getElementById('pdf-to-excel-file-input');
  const submitBtn = document.getElementById('pdf-to-excel-submit-btn');
  
  uploadZone.addEventListener('click', () => fileInput.click());
  fileInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) handlePdfToExcelFile(file);
  });
  
  setupDragAndDrop(uploadZone, handlePdfToExcelFile);
  
  submitBtn.addEventListener('click', async () => {
    showLoader('Parsing matrix grids and compiling spreadsheets...');
    try {
      const excelBytes = await convertPdfToExcel(state.pdfToExcel.file);
      const blob = new Blob([excelBytes], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      downloadBlob(blob, state.pdfToExcel.file.name.replace(/\.pdf$/i, '.xlsx'));
      showToast('PDF converted to Excel spreadsheet!');
    } catch (err) {
      console.error(err);
      showToast('Failed to convert PDF to Excel.', 'danger');
    } finally {
      hideLoader();
    }
  });
}

async function handlePdfToExcelFile(file) {
  if (file.type !== 'application/pdf' && !file.name.endsWith('.pdf')) {
    showToast('Please upload a PDF file.', 'danger');
    return;
  }
  state.pdfToExcel.file = file;
  showLoader('Analyzing PDF...');
  try {
    const buffer = await file.arrayBuffer();
    const pdfJs = await pdfjsLib.getDocument({ data: new Uint8Array(buffer) }).promise;
    state.pdfToExcel.pageCount = pdfJs.numPages;
    document.getElementById('pdf-to-excel-filename').textContent = file.name;
    document.getElementById('pdf-to-excel-pagecount').textContent = `Total Pages: ${pdfJs.numPages}`;
    document.getElementById('pdf-to-excel-upload-zone').classList.add('hidden');
    document.getElementById('pdf-to-excel-setup').classList.remove('hidden');
  } catch (err) {
    console.error(err);
    showToast('Failed to load PDF info.', 'danger');
  } finally {
    hideLoader();
  }
}

// -------------------------------------------------------------
// 27. PDF TO PDF/A COMPONENT
// -------------------------------------------------------------
function setupPdfToPdfAWorkspace() {
  const uploadZone = document.getElementById('pdf-to-pdf-a-upload-zone');
  const fileInput = document.getElementById('pdf-to-pdf-a-file-input');
  const submitBtn = document.getElementById('pdf-to-pdf-a-submit-btn');
  
  uploadZone.addEventListener('click', () => fileInput.click());
  fileInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) handlePdfToPdfAFile(file);
  });
  
  setupDragAndDrop(uploadZone, handlePdfToPdfAFile);
  
  submitBtn.addEventListener('click', async () => {
    showLoader('Embedding PDF/A-3b conformance schemas...');
    try {
      const pdfBytes = await convertPdfToPdfA(state.pdfToPdfA.file);
      const blob = new Blob([pdfBytes], { type: 'application/pdf' });
      downloadBlob(blob, state.pdfToPdfA.file.name.replace(/\.pdf$/i, '_pdfa.pdf'));
      showToast('PDF converted to PDF/A archive successfully!');
    } catch (err) {
      console.error(err);
      showToast('Failed to convert PDF to PDF/A.', 'danger');
    } finally {
      hideLoader();
    }
  });
}

async function handlePdfToPdfAFile(file) {
  if (file.type !== 'application/pdf' && !file.name.endsWith('.pdf')) {
    showToast('Please upload a PDF file.', 'danger');
    return;
  }
  state.pdfToPdfA.file = file;
  showLoader('Analyzing PDF...');
  try {
    const buffer = await file.arrayBuffer();
    const pdfJs = await pdfjsLib.getDocument({ data: new Uint8Array(buffer) }).promise;
    state.pdfToPdfA.pageCount = pdfJs.numPages;
    document.getElementById('pdf-to-pdf-a-filename').textContent = file.name;
    document.getElementById('pdf-to-pdf-a-pagecount').textContent = `Total Pages: ${pdfJs.numPages}`;
    document.getElementById('pdf-to-pdf-a-upload-zone').classList.add('hidden');
    document.getElementById('pdf-to-pdf-a-setup').classList.remove('hidden');
  } catch (err) {
    console.error(err);
    showToast('Failed to load PDF info.', 'danger');
  } finally {
    hideLoader();
  }
}

// -------------------------------------------------------------
// 28. CROP PDF COMPONENT
// -------------------------------------------------------------
function setupCropWorkspace() {
  const uploadZone = document.getElementById('crop-upload-zone');
  const fileInput = document.getElementById('crop-file-input');
  const submitBtn = document.getElementById('crop-submit-btn');
  
  uploadZone.addEventListener('click', () => fileInput.click());
  fileInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) handleCropFile(file);
  });
  
  setupDragAndDrop(uploadZone, handleCropFile);
  
  submitBtn.addEventListener('click', async () => {
    const margin = parseInt(document.getElementById('crop-margin-input').value, 10);
    showLoader('Cropping page margins...');
    try {
      const pdfBytes = await cropPdf(state.crop.file, margin);
      const blob = new Blob([pdfBytes], { type: 'application/pdf' });
      downloadBlob(blob, state.crop.file.name.replace(/\.pdf$/i, '_cropped.pdf'));
      showToast('Margins cropped successfully!');
    } catch (err) {
      console.error(err);
      showToast('Failed to crop PDF margins.', 'danger');
    } finally {
      hideLoader();
    }
  });
}

async function handleCropFile(file) {
  if (file.type !== 'application/pdf' && !file.name.endsWith('.pdf')) {
    showToast('Please upload a PDF file.', 'danger');
    return;
  }
  state.crop.file = file;
  showLoader('Analyzing PDF...');
  try {
    const buffer = await file.arrayBuffer();
    const pdfJs = await pdfjsLib.getDocument({ data: new Uint8Array(buffer) }).promise;
    state.crop.pageCount = pdfJs.numPages;
    document.getElementById('crop-filename').textContent = file.name;
    document.getElementById('crop-pagecount').textContent = `Total Pages: ${pdfJs.numPages}`;
    document.getElementById('crop-upload-zone').classList.add('hidden');
    document.getElementById('crop-setup').classList.remove('hidden');
  } catch (err) {
    console.error(err);
    showToast('Failed to load PDF info.', 'danger');
  } finally {
    hideLoader();
  }
}

// -------------------------------------------------------------
// 29. REDACT PDF COMPONENT
// -------------------------------------------------------------
function setupRedactWorkspace() {
  const uploadZone = document.getElementById('redact-upload-zone');
  const fileInput = document.getElementById('redact-file-input');
  const submitBtn = document.getElementById('redact-submit-btn');
  
  uploadZone.addEventListener('click', () => fileInput.click());
  fileInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) handleRedactFile(file);
  });
  
  setupDragAndDrop(uploadZone, handleRedactFile);
  
  submitBtn.addEventListener('click', async () => {
    const redactText = document.getElementById('redact-text-input').value.trim();
    if (!redactText) {
      showToast('Please input a phrase to redact.', 'danger');
      return;
    }
    
    showLoader('Redacting matching text layers...');
    try {
      const pdfBytes = await redactPdf(state.redact.file, redactText);
      const blob = new Blob([pdfBytes], { type: 'application/pdf' });
      downloadBlob(blob, state.redact.file.name.replace(/\.pdf$/i, '_redacted.pdf'));
      showToast('Text elements redacted successfully!');
    } catch (err) {
      console.error(err);
      showToast('Failed to redact PDF elements.', 'danger');
    } finally {
      hideLoader();
    }
  });
}

async function handleRedactFile(file) {
  if (file.type !== 'application/pdf' && !file.name.endsWith('.pdf')) {
    showToast('Please upload a PDF file.', 'danger');
    return;
  }
  state.redact.file = file;
  showLoader('Analyzing PDF...');
  try {
    const buffer = await file.arrayBuffer();
    const pdfJs = await pdfjsLib.getDocument({ data: new Uint8Array(buffer) }).promise;
    state.redact.pageCount = pdfJs.numPages;
    document.getElementById('redact-filename').textContent = file.name;
    document.getElementById('redact-pagecount').textContent = `Total Pages: ${pdfJs.numPages}`;
    document.getElementById('redact-upload-zone').classList.add('hidden');
    document.getElementById('redact-setup').classList.remove('hidden');
  } catch (err) {
    console.error(err);
    showToast('Failed to load PDF info.', 'danger');
  } finally {
    hideLoader();
  }
}

// -------------------------------------------------------------
// 30. TRANSLATE PDF COMPONENT
// -------------------------------------------------------------
function setupTranslateWorkspace() {
  const uploadZone = document.getElementById('translate-upload-zone');
  const fileInput = document.getElementById('translate-file-input');
  const submitBtn = document.getElementById('translate-submit-btn');
  
  uploadZone.addEventListener('click', () => fileInput.click());
  fileInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) handleTranslateFile(file);
  });
  
  setupDragAndDrop(uploadZone, handleTranslateFile);
  
  submitBtn.addEventListener('click', async () => {
    const lang = document.getElementById('translate-lang-input').value;
    showLoader('Translating text structures (MyMemory)...');
    try {
      const pdfBytes = await translatePdf(state.translate.file, lang);
      const blob = new Blob([pdfBytes], { type: 'application/pdf' });
      downloadBlob(blob, state.translate.file.name.replace(/\.pdf$/i, `_translated_${lang}.pdf`));
      showToast('Document translated successfully!');
    } catch (err) {
      console.error(err);
      showToast('Failed to translate PDF text.', 'danger');
    } finally {
      hideLoader();
    }
  });
}

async function handleTranslateFile(file) {
  if (file.type !== 'application/pdf' && !file.name.endsWith('.pdf')) {
    showToast('Please upload a PDF file.', 'danger');
    return;
  }
  state.translate.file = file;
  showLoader('Analyzing PDF...');
  try {
    const buffer = await file.arrayBuffer();
    const pdfJs = await pdfjsLib.getDocument({ data: new Uint8Array(buffer) }).promise;
    state.translate.pageCount = pdfJs.numPages;
    document.getElementById('translate-filename').textContent = file.name;
    document.getElementById('translate-pagecount').textContent = `Total Pages: ${pdfJs.numPages}`;
    document.getElementById('translate-upload-zone').classList.add('hidden');
    document.getElementById('translate-setup').classList.remove('hidden');
  } catch (err) {
    console.error(err);
    showToast('Failed to load PDF info.', 'danger');
  } finally {
    hideLoader();
  }
}

// -------------------------------------------------------------
// 31. PDF TO MARKDOWN COMPONENT
// -------------------------------------------------------------
function setupPdfToMarkdownWorkspace() {
  const uploadZone = document.getElementById('pdf-to-markdown-upload-zone');
  const fileInput = document.getElementById('pdf-to-markdown-file-input');
  const submitBtn = document.getElementById('pdf-to-markdown-submit-btn');
  
  uploadZone.addEventListener('click', () => fileInput.click());
  fileInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) handlePdfToMarkdownFile(file);
  });
  
  setupDragAndDrop(uploadZone, handlePdfToMarkdownFile);
  
  submitBtn.addEventListener('click', async () => {
    showLoader('Parsing document layouts and formatting Markdown...');
    try {
      const mdText = await convertPdfToMarkdown(state.pdfToMarkdown.file);
      const blob = new Blob([mdText], { type: 'text/markdown;charset=utf-8' });
      downloadBlob(blob, state.pdfToMarkdown.file.name.replace(/\.pdf$/i, '.md'));
      showToast('PDF converted to Markdown successfully!');
    } catch (err) {
      console.error(err);
      showToast('Failed to convert PDF to Markdown.', 'danger');
    } finally {
      hideLoader();
    }
  });
}

async function handlePdfToMarkdownFile(file) {
  if (file.type !== 'application/pdf' && !file.name.endsWith('.pdf')) {
    showToast('Please upload a PDF file.', 'danger');
    return;
  }
  state.pdfToMarkdown.file = file;
  showLoader('Analyzing PDF...');
  try {
    const buffer = await file.arrayBuffer();
    const pdfJs = await pdfjsLib.getDocument({ data: new Uint8Array(buffer) }).promise;
    state.pdfToMarkdown.pageCount = pdfJs.numPages;
    document.getElementById('pdf-to-markdown-filename').textContent = file.name;
    document.getElementById('pdf-to-markdown-pagecount').textContent = `Total Pages: ${pdfJs.numPages}`;
    document.getElementById('pdf-to-markdown-upload-zone').classList.add('hidden');
    document.getElementById('pdf-to-markdown-setup').classList.remove('hidden');
  } catch (err) {
    console.error(err);
    showToast('Failed to load PDF info.', 'danger');
  } finally {
    hideLoader();
  }
}

// ==========================================
// AI Auto-Editor (DOCX) Logic
// ==========================================
const autoEditUploadZone = document.getElementById('autoedit-upload-zone');
const autoEditFileInput = document.getElementById('autoedit-file-input');
const autoEditSubmitBtn = document.getElementById('autoedit-submit-btn');

autoEditUploadZone.addEventListener('click', () => autoEditFileInput.click());
autoEditFileInput.addEventListener('change', (e) => {
  const file = e.target.files[0];
  if (file) handleAutoEditFile(file);
});

setupDragAndDrop(autoEditUploadZone, handleAutoEditFile);

async function handleAutoEditFile(file) {
  if (!file.name.endsWith('.docx')) {
    showToast('Please upload a Microsoft Word (.docx) file.', 'danger');
    return;
  }
  state.autoEdit = { file };
  document.getElementById('autoedit-filename').textContent = file.name;
  autoEditUploadZone.classList.add('hidden');
  document.getElementById('autoedit-setup-container').classList.remove('hidden');
}

autoEditSubmitBtn.addEventListener('click', async () => {
  if (!state.autoEdit || !state.autoEdit.file) return;
  const promptText = document.getElementById('autoedit-prompt').value.trim();
  if (!promptText) {
    showToast('Please enter what you want the AI to change.', 'danger');
    return;
  }

  showLoader('AI is rewriting your document... This may take up to 30 seconds.');
  
  const formData = new FormData();
  formData.append('document', state.autoEdit.file);
  formData.append('prompt', promptText);

  try {
    const response = await fetch('/.netlify/functions/auto-edit', {
      method: 'POST',
      body: formData
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(errorText || 'Server responded with an error');
    }

    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `AI_Edited_${state.autoEdit.file.name}`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    a.remove();
    
    showToast('Document magically rewritten and downloaded!', 'success');
  } catch (err) {
    console.error(err);
    showToast(`AI Edit failed: ${err.message}`, 'danger');
  } finally {
    hideLoader();
  }
});
