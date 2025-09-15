(function(global){
  const KEY_FREE = 'freeExports';
  function today(){ return new Date().toISOString().slice(0,10); }
  function getFreeMap(){ try{ return JSON.parse(localStorage.getItem(KEY_FREE)||'{}'); }catch{ return {}; } }
  function setFreeMap(map){ localStorage.setItem(KEY_FREE, JSON.stringify(map)); }
  function freeUsed(){ const map = getFreeMap(); return map[today()]||0; }
  function canFree(){ return freeUsed() < 3; }
  function decPro(){ const left = Math.max(0, parseInt(localStorage.getItem('creditsRemaining')||'0',10)-1); localStorage.setItem('creditsRemaining', String(left)); }
  function markFree(){ const map = getFreeMap(); map[today()] = (map[today()]||0)+1; setFreeMap(map); }

  const Credits = {
    request(){
      const token = localStorage.getItem('licenseJWT');
      const credits = parseInt(localStorage.getItem('creditsRemaining')||'0',10);
      if(token && credits>0){ return { ok:true, source:'pro' } }
      if(canFree()){ return { ok:true, source:'free' } }
      alert('Free limit reached for today (3). Buy credits to continue.');
      return { ok:false };
    },
    commit(ticket){ if(!ticket||!ticket.ok) return; if(ticket.source==='pro') decPro(); else if(ticket.source==='free') markFree(); }
  };
  global.Credits = Credits;
})(window);


