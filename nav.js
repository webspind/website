(function(){
  async function injectNav(){
    const ph = document.querySelector('[data-nav]');
    if(!ph) return;
    const root = ph.getAttribute('data-root') || '.';
    try{
      const res = await fetch(`${root}/partials/nav.html`, { cache: 'no-store' });
      if(!res.ok) throw new Error('nav fetch');
      let html = await res.text();
      // Make absolute links work from nested routes
      html = html.replaceAll('href="/','href="'+root+'/');
      ph.outerHTML = html;
      highlightActive(root);
    }catch(e){
      // Fallback inline nav
      ph.outerHTML = `
        <header class="site-header">
          <div class="container header-inner">
            <a class="logo" href="${root}/">PDF Tools</a>
            <nav class="nav">
              <a href="${root}/">Home</a>
              <a href="${root}/tools/pdf-ocr.html">PDF OCR</a>
              <a class="btn small" href="${root}/pricing.html">Pricing</a>
            </nav>
          </div>
        </header>`;
      highlightActive(root);
    }
  }

  function highlightActive(root){
    const path = location.pathname.replace(/index\.html$/, '') || '/';
    document.querySelectorAll('.nav a').forEach(a => {
      const href = a.getAttribute('href') || '';
      const abs = new URL(href, location.origin + (href.startsWith('.')? path : '/')).pathname.replace(/index\.html$/, '');
      if(path === '/' && (abs === '/' || abs.endsWith('/index.html'))) a.classList.add('active');
      else if(abs && path.endsWith(abs)) a.classList.add('active');
    });
  }

  if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', injectNav);
  else injectNav();
})();


