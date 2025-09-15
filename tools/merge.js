(function(){
  const els = {
    dropzone: document.getElementById('dropzone'),
    fileInput: document.getElementById('fileInput'),
    fileList: document.getElementById('fileList'),
    mergeBtn: document.getElementById('mergeBtn'),
  };

  const files = [];

  function renderList(){
    els.fileList.innerHTML = '';
    files.forEach((f, idx) => {
      const li = document.createElement('li');
      li.style.display = 'flex'; li.style.alignItems = 'center'; li.style.justifyContent = 'space-between';
      li.style.border = '1px solid var(--border)'; li.style.borderRadius = '10px'; li.style.padding = '10px';
      const name = document.createElement('span'); name.textContent = f.name;
      const controls = document.createElement('div'); controls.style.display = 'flex'; controls.style.gap = '8px';
      const up = document.createElement('button'); up.className = 'btn small'; up.textContent = 'Up'; up.disabled = idx===0;
      const down = document.createElement('button'); down.className = 'btn small'; down.textContent = 'Down'; down.disabled = idx===files.length-1;
      const del = document.createElement('button'); del.className = 'btn small'; del.textContent = 'Remove';
      up.onclick = ()=>{ const t = files[idx-1]; files[idx-1] = files[idx]; files[idx]=t; renderList(); };
      down.onclick = ()=>{ const t = files[idx+1]; files[idx+1] = files[idx]; files[idx]=t; renderList(); };
      del.onclick = ()=>{ files.splice(idx,1); renderList(); };
      controls.append(up, down, del);
      li.append(name, controls);
      els.fileList.appendChild(li);
    });
    els.mergeBtn.disabled = files.length < 2;
  }

  function addFiles(list){
    for(const f of list){ if(f.type === 'application/pdf') files.push(f); }
    renderList();
  }

  els.dropzone.addEventListener('dragover', e => { e.preventDefault(); });
  els.dropzone.addEventListener('drop', e => { e.preventDefault(); addFiles(e.dataTransfer.files||[]); });
  els.fileInput.addEventListener('change', e => { addFiles(e.target.files||[]); });

  async function merge(){
    const { PDFDocument } = PDFLib;
    const out = await PDFDocument.create();
    for(const f of files){
      const bytes = new Uint8Array(await f.arrayBuffer());
      const src = await PDFDocument.load(bytes);
      const copied = await out.copyPages(src, src.getPageIndices());
      copied.forEach(p=> out.addPage(p));
    }
    const result = await out.save();
    saveAs(new Blob([result], { type: 'application/pdf' }), 'merged.pdf');
  }

  els.mergeBtn.addEventListener('click', merge);
})();


