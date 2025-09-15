(function(){
  const els = {
    year: document.getElementById('year'),
    dropzone: document.getElementById('dropzone'),
    fileInput: document.getElementById('fileInput'),
    fileName: document.getElementById('fileName'),
    pageCount: document.getElementById('pageCount'),
    dpiSelect: document.getElementById('dpiSelect'),
    langSelect: document.getElementById('langSelect'),
    startBtn: document.getElementById('startBtn'),
    cancelBtn: document.getElementById('cancelBtn'),
    exportBtn: document.getElementById('exportBtn'),
    statusText: document.getElementById('statusText'),
    canvas: document.getElementById('pdfCanvas'),
    progress: document.getElementById('progress'),
    progressBar: document.getElementById('progressBar'),
    progressText: document.getElementById('progressText'),
  };
  if(els.year) els.year.textContent = new Date().getFullYear();

  let pdfDoc = null;
  let pdfData = null;
  let cancelFlag = false;
  let ocrPages = null; // collected OCR text per page { items: [{text, bbox:[x,y,w,h]}], width, height }

  const ctx = els.canvas.getContext('2d');

  function showProgress(text, pct){
    els.progress.hidden = false;
    els.progressText.textContent = text;
    els.progressBar.style.width = Math.max(0,Math.min(100,pct)) + '%';
  }
  function updateProgress(pct){ els.progressBar.style.width = Math.max(0,Math.min(100,pct)) + '%'; }
  function hideProgress(){ els.progress.hidden = true; }

  function setStatus(text){ els.statusText.textContent = text; }

  function reset(){
    pdfDoc = null; pdfData = null; cancelFlag = false; ocrPages = null;
    els.fileName.textContent = '—'; els.pageCount.textContent = '0';
    els.startBtn.disabled = true; els.cancelBtn.disabled = true; els.exportBtn.disabled = true;
    ctx.clearRect(0,0,els.canvas.width, els.canvas.height);
  }

  async function loadPdf(file){
    reset();
    if(file.type !== 'application/pdf'){ alert('Please choose a PDF.'); return; }
    els.fileName.textContent = file.name;
    pdfData = new Uint8Array(await file.arrayBuffer());
    const loadingTask = pdfjsLib.getDocument({ data: pdfData });
    pdfDoc = await loadingTask.promise;
    els.pageCount.textContent = String(pdfDoc.numPages);
    const page = await pdfDoc.getPage(1);
    const viewport = page.getViewport({ scale: 1 });
    const baseScale = Math.min(900 / viewport.width, 1);
    const scaled = page.getViewport({ scale: baseScale });
    els.canvas.width = Math.floor(scaled.width);
    els.canvas.height = Math.floor(scaled.height);
    await page.render({ canvasContext: ctx, viewport: scaled }).promise;
    els.startBtn.disabled = false;
    setStatus('Ready');
  }

  async function doOCR(){
    if(!pdfDoc) return;
    cancelFlag = false; els.cancelBtn.disabled = false; els.exportBtn.disabled = true;
    const dpi = Number(els.dpiSelect.value);
    const lang = els.langSelect.value || 'eng';
    const worker = await Tesseract.createWorker({ logger: m => {
      if(m.status && m.progress != null){ setStatus(`${m.status} ${(m.progress*100).toFixed(0)}%`); }
    }});
    await worker.loadLanguage(lang);
    await worker.initialize(lang);

    const out = [];
    showProgress('Rendering pages…', 5);
    for(let p=1;p<=pdfDoc.numPages;p++){
      if(cancelFlag){ break; }
      updateProgress(5 + (p-1)/pdfDoc.numPages*40);
      const page = await pdfDoc.getPage(p);
      const viewport = page.getViewport({ scale: dpi/72 });
      const oc = document.createElement('canvas');
      oc.width = Math.floor(viewport.width);
      oc.height = Math.floor(viewport.height);
      const octx = oc.getContext('2d');
      await page.render({ canvasContext:octx, viewport }).promise;
      // Preview first page
      if(p===1){
        const pvScale = Math.min(900/oc.width, 1);
        els.canvas.width = Math.floor(oc.width*pvScale);
        els.canvas.height = Math.floor(oc.height*pvScale);
        ctx.drawImage(oc, 0,0, oc.width, oc.height, 0,0, els.canvas.width, els.canvas.height);
      }
      setStatus(`OCR page ${p}/${pdfDoc.numPages}`);
      const res = await worker.recognize(oc);
      // Map Tesseract blocks->lines->words; capture word bounding boxes
      const words = res.data.words || [];
      const items = words.map(w => ({ text: w.text, bbox: [w.bbox.x0, oc.height - w.bbox.y1, w.bbox.x1 - w.bbox.x0, w.bbox.y1 - w.bbox.y0] }));
      out.push({ items, width: oc.width, height: oc.height });
    }
    await worker.terminate();
    ocrPages = out;
    hideProgress();
    els.cancelBtn.disabled = true;
    els.exportBtn.disabled = false;
    setStatus('OCR complete. Ready to export.');
  }

  async function buildOcrPdf(){
    if(!pdfDoc || !ocrPages){ return; }
    showProgress('Building PDF…', 80);
    const { PDFDocument, rgb } = PDFLib;
    const outPdf = await PDFDocument.create();
    for(let p=1;p<=pdfDoc.numPages;p++){
      const page = await pdfDoc.getPage(p);
      const viewport = page.getViewport({ scale: 1 });
      // Render base image at original 72dpi (we already OCR’d at chosen DPI; here we embed the image matching OCR dimensions)
      const dpi = Number(els.dpiSelect.value);
      const scale = dpi/72;
      const oc = document.createElement('canvas');
      const scaled = page.getViewport({ scale });
      oc.width = Math.floor(scaled.width); oc.height = Math.floor(scaled.height);
      const octx = oc.getContext('2d');
      await page.render({ canvasContext:octx, viewport: scaled }).promise;
      const imgBytes = dataURLToUint8Array(oc.toDataURL('image/jpeg', 0.9));
      const img = await outPdf.embedJpg(imgBytes);
      const pg = outPdf.addPage([oc.width, oc.height]);
      pg.drawImage(img, { x:0, y:0, width: oc.width, height: oc.height });
      // Draw invisible text layer
      const layer = ocrPages[p-1];
      const font = await outPdf.embedFont(PDFLib.StandardFonts.Helvetica);
      for(const it of layer.items){
        if(!it.text || !it.text.trim()) continue;
        const fontSize = Math.max(8, Math.min(24, it.bbox[3]));
        pg.drawText(it.text, {
          x: it.bbox[0], y: it.bbox[1], size: fontSize, font,
          color: rgb(0,0,0), opacity: 0, // invisible selectable text
        });
      }
    }
    const bytes = await outPdf.save({ addDefaultPage:false, useObjectStreams:false });
    hideProgress();
    const blob = new Blob([bytes], { type: 'application/pdf' });
    saveAs(blob, 'ocr.pdf');
    setStatus('Exported.');
  }

  function dataURLToUint8Array(dataURL){
    const base64 = dataURL.split(',')[1];
    const bin = atob(base64);
    const len = bin.length;
    const bytes = new Uint8Array(len);
    for(let i=0;i<len;i++) bytes[i] = bin.charCodeAt(i);
    return bytes;
  }

  // Events
  els.dropzone.addEventListener('dragover', e => { e.preventDefault(); });
  els.dropzone.addEventListener('drop', e => {
    e.preventDefault();
    const f = e.dataTransfer.files?.[0];
    if(f) loadPdf(f);
  });
  els.fileInput.addEventListener('change', e => {
    const f = e.target.files?.[0];
    if(f) loadPdf(f);
  });
  els.startBtn.addEventListener('click', ()=>{ doOCR(); });
  els.cancelBtn.addEventListener('click', ()=>{ cancelFlag = true; setStatus('Cancelling…'); });
  els.exportBtn.addEventListener('click', ()=>{ buildOcrPdf(); });
})();


