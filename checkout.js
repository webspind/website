(function(){
  async function startCheckout(priceId){
    try{
      const res = await fetch('/api/stripe/create-checkout', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ priceId })
      });
      if(!res.ok) throw new Error('Checkout failed');
      const data = await res.json();
      if(data.url){ window.location.href = data.url; }
      else alert('Unexpected response');
    }catch(err){ console.error(err); alert('Could not start checkout.'); }
  }

  async function applySessionFromURL(){
    const sid = new URLSearchParams(location.search).get('session_id');
    if(!sid) return;
    try{
      const res = await fetch(`/api/stripe/confirm?session_id=${encodeURIComponent(sid)}`);
      if(!res.ok) throw new Error('confirm failed');
      const data = await res.json();
      localStorage.setItem('licenseJWT', data.token);
      localStorage.setItem('creditsRemaining', String(data.credits||0));
      const el = document.getElementById('unlockStatus');
      if(el){ el.textContent = `Pro unlocked: ${data.credits} credits added.`; }
      else { alert('Pro unlocked! Credits added.'); }
      const url = new URL(location.href); url.searchParams.delete('session_id'); history.replaceState({}, '', url.toString());
    }catch(err){
      console.error(err);
      const el = document.getElementById('unlockStatus');
      if(el){ el.textContent = 'Unlock failed. If charged, contact support.'; }
    }
  }

  window.startCheckout = startCheckout;
  window.applySessionFromURL = applySessionFromURL;
  if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', applySessionFromURL);
  else applySessionFromURL();
})();


