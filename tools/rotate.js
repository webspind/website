(function(){
  const els = {
    dropzone: document.getElementById('dropzone'),
    fileInput: document.getElementById('fileInput'),
    info: document.getElementById('info'),
    deg: document.getElementById('deg'),
    rangeInput: document.getElementById('rangeInput'),
    rotateBtn: document.getElementById('rotateBtn'),
  };

  let srcBytes = null;
  let totalPages = 0;

  function parseRanges(text){
    if(!text) return null; // null = all pages
    const parts = text.split(',').map(s=>s.trim()).filter(Boolean);
    const pages = new Set();
    for(const part of parts){
      if(/^-?\d+$/.test(part)) pages.add(Math.max(1, parseInt(part,10)));
      else if(/^(\d+)-(\d+)$/.test(part)){
        const [,a,b] = part.match(/^(\d+)-(\d+)$/);
        const start = Math.max(1, parseInt(a,10));
        const end = Math.min(totalPages, parseInt(b,10));
        for(let i=start;i<=end;i++) pages.add(i);
      }
    }
    return Array.from(pages).filter(p=>p<=totalPages).sort((a,b)=>a-b);
  }

  function update(){ els.rotateBtn.disabled = !srcBytes; }

  els.dropzone.addEventListener('dragover', e => { e.preventDefault(); });
  els.dropzone.addEventListener('drop', async e => { e.preventDefault(); const f = e.dataTransfer.files?.[0]; if(f) await loadFile(f); });
  els.fileInput.addEventListener('change', async e => { const f = e.target.files?.[0]; if(f) await loadFile(f); });

  async function loadFile(file){
    srcBytes = new Uint8Array(await file.arrayBuffer());
    const { PDFDocument } = PDFLib;
    const doc = await PDFDocument.load(srcBytes);
    totalPages = doc.getPageCount();
    els.info.textContent = `Pages: ${totalPages}`;
    update();
  }

  async function rotate(){
    const { PDFDocument, degrees } = PDFLib;
    const src = await PDFDocument.load(srcBytes);
    const deg = parseInt(els.deg.value, 10) || 0;
    const pages = parseRanges(els.rangeInput.value);
    const out = await PDFDocument.create();
    const copied = await out.copyPages(src, src.getPageIndices());
    copied.forEach((p, idx) => {
      const should = !pages || pages.includes(idx+1);
      if(should){ p.setRotation(degrees((p.getRotation().angle + deg) % 360)); }
      out.addPage(p);
    });
    const bytes = await out.save();
    saveAs(new Blob([bytes], { type: 'application/pdf' }), 'rotated.pdf');
  }

  els.rotateBtn.addEventListener('click', rotate);
})();


