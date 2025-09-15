(function(){
  async function injectNav(){
    try{
      const ph = document.querySelector('[data-nav]');
      if(!ph) return;
      const root = ph.getAttribute('data-root') || '.';
      const r = await fetch(`${root}/partials/nav.html`, { cache: 'no-cache' });
      let html = await r.text();
      // Fix links to be relative to root
      html = html.replaceAll('href="/','href="'+root+'/');
      ph.outerHTML = html;
    }catch(e){ /* no-op */ }
  }
  injectNav();
})();


