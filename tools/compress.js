(function(){
  const els = {
    dropzone: document.getElementById('dropzone'),
    fileInput: document.getElementById('fileInput'),
    info: document.getElementById('info'),
    mode: document.getElementById('mode'),
    dpi: document.getElementById('dpi'),
    quality: document.getElementById('quality'),
    customRow: document.getElementById('customRow'),
    compressBtn: document.getElementById('compressBtn'),
  };

  let pdfBytes = null;
  let pageCount = 0;

  els.mode.addEventListener('change', ()=>{
    els.customRow.classList.toggle('hidden', els.mode.value !== 'custom');
  });

  els.dropzone.addEventListener('dragover', e => { e.preventDefault(); });
  els.dropzone.addEventListener('drop', async e => { e.preventDefault(); const f=e.dataTransfer.files?.[0]; if(f) await loadFile(f); });
  els.fileInput.addEventListener('change', async e => { const f=e.target.files?.[0]; if(f) await loadFile(f); });

  async function loadFile(file){
    pdfBytes = new Uint8Array(await file.arrayBuffer());
    const doc = await pdfjsLib.getDocument({ data: pdfBytes }).promise;
    pageCount = doc.numPages;
    els.info.textContent = `${file.name} — ${pageCount} pages`;
    els.compressBtn.disabled = false;
  }

  function getParams(){
    const mode = els.mode.value;
    if(mode === 'auto') return { dpi: 150, quality: 0.82 };
    if(mode === 'max') return { dpi: 120, quality: 0.7 };
    return { dpi: parseInt(els.dpi.value,10)||150, quality: parseFloat(els.quality.value)||0.8 };
  }

  async function compress(){
    const { PDFDocument } = PDFLib;
    const ticket = window.Credits ? window.Credits.request() : { ok:true, source:'free' };
    if(!ticket.ok) return;
    const { dpi, quality } = getParams();
    const src = await pdfjsLib.getDocument({ data: pdfBytes }).promise;
    const out = await PDFDocument.create();
    for(let i=1;i<=src.numPages;i++){
      const page = await src.getPage(i);
      const viewport = page.getViewport({ scale: dpi/72 });
      const oc = document.createElement('canvas'); oc.width = viewport.width; oc.height = viewport.height;
      const ctx = oc.getContext('2d');
      await page.render({ canvasContext: ctx, viewport }).promise;
      const dataUrl = oc.toDataURL('image/jpeg', quality);
      const bytes = dataURLToUint8Array(dataUrl);
      const img = await out.embedJpg(bytes);
      const p = out.addPage([oc.width, oc.height]);
      p.drawImage(img, { x:0, y:0, width: oc.width, height: oc.height });
    }
    const outBytes = await out.save();
    const before = pdfBytes.byteLength; const after = outBytes.byteLength;
    const ratio = Math.max(1, Math.round((before/after)*10)/10);
    const name = `compressed_${Math.round(after/1024)}KB.pdf`;
    saveAs(new Blob([outBytes], { type:'application/pdf' }), name);
    if(window.Credits) window.Credits.commit(ticket);
  }

  function dataURLToUint8Array(dataURL){
    const base64 = dataURL.split(',')[1];
    const bin = atob(base64);
    const len = bin.length;
    const bytes = new Uint8Array(len);
    for(let i=0;i<len;i++) bytes[i] = bin.charCodeAt(i);
    return bytes;
  }

  els.compressBtn.addEventListener('click', compress);
})();


