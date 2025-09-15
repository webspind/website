(function(){
  const els = {
    dropzone: document.getElementById('dropzone'),
    fileInput: document.getElementById('fileInput'),
    info: document.getElementById('info'),
    pageList: document.getElementById('pageList'),
    exportBtn: document.getElementById('exportBtn'),
  };

  let srcBytes = null;
  let order = [];

  async function render(){
    els.pageList.innerHTML = '';
    // try to reuse a pdfjs instance for performance
    let pdf=null; try{ pdf = await pdfjsLib.getDocument({ data: srcBytes }).promise; }catch{}
    for(let i=0;i<order.length;i++){
      const p = order[i]; const idx = i;
      const li = document.createElement('li');
      li.style.display = 'flex'; li.style.alignItems = 'center'; li.style.justifyContent = 'space-between';
      li.style.border = '1px solid var(--border)'; li.style.borderRadius = '10px'; li.style.padding = '8px';
      const left = document.createElement('div'); left.style.display='flex'; left.style.alignItems='center'; left.style.gap='8px';
      const thumb = document.createElement('canvas'); thumb.width=80; thumb.height=110; thumb.style.borderRadius='6px';
      const label = document.createElement('span'); label.textContent = `Page ${p+1}`;
      left.append(thumb,label);
      const c = document.createElement('div'); c.style.display='flex'; c.style.gap='8px';
      const up = document.createElement('button'); up.className='btn small'; up.textContent='Up'; up.disabled = idx===0;
      const down = document.createElement('button'); down.className='btn small'; down.textContent='Down'; down.disabled = idx===order.length-1;
      up.onclick = ()=>{ const t = order[idx-1]; order[idx-1]=order[idx]; order[idx]=t; render(); };
      down.onclick = ()=>{ const t = order[idx+1]; order[idx+1]=order[idx]; order[idx]=t; render(); };
      c.append(up,down); li.append(left,c); els.pageList.appendChild(li);
      // render preview
      try{
        if(pdf){ const page = await pdf.getPage(p+1); const vp = page.getViewport({ scale: 0.3 }); thumb.width=vp.width; thumb.height=vp.height; await page.render({ canvasContext: thumb.getContext('2d'), viewport: vp }).promise; }
      }catch{}
    }
    els.exportBtn.disabled = !srcBytes;
  }

  els.dropzone.addEventListener('dragover', e => { e.preventDefault(); });
  els.dropzone.addEventListener('drop', async e => { e.preventDefault(); const f = e.dataTransfer.files?.[0]; if(f) await loadFile(f); });
  els.fileInput.addEventListener('change', async e => { const f = e.target.files?.[0]; if(f) await loadFile(f); });

  async function loadFile(file){
    srcBytes = new Uint8Array(await file.arrayBuffer());
    const { PDFDocument } = PDFLib;
    const doc = await PDFDocument.load(srcBytes);
    const count = doc.getPageCount();
    els.info.textContent = `Pages: ${count}`;
    order = Array.from({length: count}, (_,i)=>i);
    render();
  }

  async function exportPdf(){
    const { PDFDocument } = PDFLib;
    const ticket = window.Credits ? window.Credits.request() : { ok:true, source:'free' };
    if(!ticket.ok) return;
    const src = await PDFDocument.load(srcBytes);
    const out = await PDFDocument.create();
    const copied = await out.copyPages(src, order);
    copied.forEach(p=> out.addPage(p));
    const bytes = await out.save();
    saveAs(new Blob([bytes], { type: 'application/pdf' }), 'reordered.pdf');
    if(window.Credits) window.Credits.commit(ticket);
  }

  els.exportBtn.addEventListener('click', exportPdf);
})();


