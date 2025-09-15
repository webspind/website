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

  function render(){
    els.pageList.innerHTML = '';
    order.forEach((p, idx) => {
      const li = document.createElement('li');
      li.style.display = 'flex'; li.style.alignItems = 'center'; li.style.justifyContent = 'space-between';
      li.style.border = '1px solid var(--border)'; li.style.borderRadius = '10px'; li.style.padding = '8px';
      li.textContent = `Page ${p+1}`;
      const c = document.createElement('div'); c.style.display='flex'; c.style.gap='8px';
      const up = document.createElement('button'); up.className='btn small'; up.textContent='Up'; up.disabled = idx===0;
      const down = document.createElement('button'); down.className='btn small'; down.textContent='Down'; down.disabled = idx===order.length-1;
      up.onclick = ()=>{ const t = order[idx-1]; order[idx-1]=order[idx]; order[idx]=t; render(); };
      down.onclick = ()=>{ const t = order[idx+1]; order[idx+1]=order[idx]; order[idx]=t; render(); };
      c.append(up,down); li.appendChild(c); els.pageList.appendChild(li);
    });
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
    const src = await PDFDocument.load(srcBytes);
    const out = await PDFDocument.create();
    const copied = await out.copyPages(src, order);
    copied.forEach(p=> out.addPage(p));
    const bytes = await out.save();
    saveAs(new Blob([bytes], { type: 'application/pdf' }), 'reordered.pdf');
  }

  els.exportBtn.addEventListener('click', exportPdf);
})();


