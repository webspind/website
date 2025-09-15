(function(){
  const els = {
    dropzone: document.getElementById('dropzone'),
    fileInput: document.getElementById('fileInput'),
    info: document.getElementById('info'),
    rangeInput: document.getElementById('rangeInput'),
    splitBtn: document.getElementById('splitBtn'),
    thumbs: document.getElementById('thumbs'),
  };

  let srcBytes = null;
  let totalPages = 0;

  function parseRanges(text){
    const parts = (text||'').split(',').map(s=>s.trim()).filter(Boolean);
    const pages = new Set();
    for(const part of parts){
      if(/^-?\d+$/.test(part)){
        pages.add(Math.max(1, parseInt(part,10)));
      } else if(/^(\d+)-(\d+)$/.test(part)){
        const [,a,b] = part.match(/^(\d+)-(\d+)$/);
        const start = Math.max(1, parseInt(a,10));
        const end = Math.min(totalPages, parseInt(b,10));
        for(let i=start;i<=end;i++) pages.add(i);
      }
    }
    return Array.from(pages).filter(p=>p<=totalPages).sort((a,b)=>a-b);
  }

  function update(){
    const has = !!srcBytes;
    const pages = parseRanges(els.rangeInput.value);
    els.splitBtn.disabled = !has || pages.length===0;
  }

  els.rangeInput.addEventListener('input', update);

  els.dropzone.addEventListener('dragover', e => { e.preventDefault(); });
  els.dropzone.addEventListener('drop', async e => { e.preventDefault(); const f = e.dataTransfer.files?.[0]; if(f) await loadFile(f); });
  els.fileInput.addEventListener('change', async e => { const f = e.target.files?.[0]; if(f) await loadFile(f); });

  async function loadFile(file){
    srcBytes = new Uint8Array(await file.arrayBuffer());
    const { PDFDocument } = PDFLib;
    const doc = await PDFDocument.load(srcBytes);
    totalPages = doc.getPageCount();
    els.info.textContent = `Pages: ${totalPages}`;
    // Render thumbnails
    els.thumbs.innerHTML = '';
    for(let i=0;i<Math.min(totalPages, 40);i++){
      const item = document.createElement('div'); item.className='thumb';
      const c = document.createElement('canvas');
      item.appendChild(c);
      const cap = document.createElement('div'); cap.className='cap'; cap.textContent = `Page ${i+1}`; item.appendChild(cap);
      els.thumbs.appendChild(item);
      // render via offscreen PDF.js for first 40 pages
      try{
        const pdf = await pdfjsLib.getDocument({ data: srcBytes }).promise;
        const page = await pdf.getPage(i+1);
        const vp = page.getViewport({ scale: 0.3 });
        c.width = vp.width; c.height = vp.height;
        await page.render({ canvasContext: c.getContext('2d'), viewport: vp }).promise;
        item.addEventListener('click', ()=>{
          item.classList.toggle('selected');
          syncRangeFromThumbs();
        });
      }catch{}
    }
    update();
  }

  function syncRangeFromThumbs(){
    const sel = Array.from(els.thumbs.querySelectorAll('.thumb.selected .cap')).map(el=> parseInt(el.textContent.replace(/\D/g,''),10)).filter(Boolean).sort((a,b)=>a-b);
    if(sel.length){
      els.rangeInput.value = sel.join(',');
    } else {
      // keep existing input
    }
    update();
  }

  async function split(){
    const { PDFDocument } = PDFLib;
    const src = await PDFDocument.load(srcBytes);
    const pages = parseRanges(els.rangeInput.value);
    const out = await PDFDocument.create();
    const copied = await out.copyPages(src, pages.map(p=>p-1));
    copied.forEach(p=> out.addPage(p));
    const bytes = await out.save();
    saveAs(new Blob([bytes], { type:'application/pdf' }), 'split.pdf');
  }

  els.splitBtn.addEventListener('click', split);
})();


