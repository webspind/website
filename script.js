/**
 * Webspind
 */
(function () {
  'use strict';

  const MAX_PDF = 25 * 1024 * 1024;

  const TONES = {
    professionel: 'Professionel og klar. Ingen fyldord.',
    teknisk: 'Teknisk og præcis. Brug korrekt fagterminologi.',
    direkte: 'Kort og direkte. Kom til sagen med det samme.',
  };

  const FORMATS = {
    markdown: 'Svar i Markdown med overskrifter og lister.',
    json: 'Svar som valid JSON uden kommentarer.',
    prosa: 'Svar i almindelig, velstruktureret prosa.',
  };

  let pdfBuffer = null;
  let pdfName = '';

  function $(id) {
    return document.getElementById(id);
  }

  function setStatus(el, text, ok) {
    if (!el) return;
    el.textContent = text;
    el.classList.toggle('is-ok', ok === true);
    el.classList.toggle('is-err', ok === false);
  }

  function download(blob, name) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = name;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }

  function initMasthead() {
    const dateEl = $('masthead-date');
    if (!dateEl) return;
    const now = new Date();
    const formatted = now.toLocaleDateString('da-DK', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
    dateEl.textContent = formatted;
  }

  function initPortrait() {
    const portrait = $('portrait');
    if (!portrait) return;

    const show = () => portrait.classList.add('is-visible');

    if ('IntersectionObserver' in window) {
      const obs = new IntersectionObserver(
        (entries) => {
          if (entries[0].isIntersecting) {
            show();
            obs.disconnect();
          }
        },
        { threshold: 0.2 }
      );
      obs.observe(portrait);
    } else {
      show();
    }
  }

  function initNav() {
    const toggle = document.querySelector('.nav__toggle');
    const menu = $('nav-menu');
    if (!toggle || !menu) return;

    toggle.addEventListener('click', () => {
      const open = toggle.getAttribute('aria-expanded') === 'true';
      toggle.setAttribute('aria-expanded', String(!open));
      menu.classList.toggle('is-open', !open);
    });

    menu.querySelectorAll('a').forEach((link) => {
      link.addEventListener('click', () => {
        toggle.setAttribute('aria-expanded', 'false');
        menu.classList.remove('is-open');
      });
    });
  }

  async function scrubPdf(buffer) {
    if (typeof PDFLib === 'undefined') {
      throw new Error('pdf-lib kunne ikke indlæses.');
    }
    const { PDFDocument } = PDFLib;
    const doc = await PDFDocument.load(buffer, { ignoreEncryption: true });
    doc.setTitle('');
    doc.setAuthor('');
    doc.setSubject('');
    doc.setKeywords([]);
    doc.setCreator('');
    doc.setProducer('');
    const bytes = await doc.save();
    return new Blob([bytes], { type: 'application/pdf' });
  }

  function initPdf() {
    const zone = $('pdf-dropzone');
    const input = $('pdf-input');
    const label = $('pdf-label');
    const btn = $('pdf-scrub-btn');
    const clear = $('pdf-clear-btn');
    const stat = $('pdf-status');
    if (!zone || !input || !btn) return;

    function reset() {
      pdfBuffer = null;
      pdfName = '';
      input.value = '';
      zone.classList.remove('is-ready', 'is-dragover');
      if (label) label.textContent = 'Vælg eller træk PDF';
      btn.disabled = true;
      clear.disabled = true;
      setStatus(stat, '');
    }

    function load(file) {
      if (file.type !== 'application/pdf' && !/\.pdf$/i.test(file.name)) {
        setStatus(stat, 'Kun PDF-filer.', false);
        return;
      }
      if (file.size > MAX_PDF) {
        setStatus(stat, 'Maks. 25 MB.', false);
        return;
      }
      const reader = new FileReader();
      reader.onload = () => {
        pdfBuffer = reader.result;
        pdfName = file.name;
        zone.classList.add('is-ready');
        if (label) label.textContent = file.name;
        btn.disabled = false;
        clear.disabled = false;
        setStatus(stat, 'Klar.', true);
      };
      reader.onerror = () => setStatus(stat, 'Kunne ikke læse filen.', false);
      reader.readAsArrayBuffer(file);
    }

    input.addEventListener('change', () => {
      if (input.files[0]) load(input.files[0]);
    });

    zone.addEventListener('dragover', (e) => {
      e.preventDefault();
      zone.classList.add('is-dragover');
    });
    zone.addEventListener('dragleave', () => zone.classList.remove('is-dragover'));
    zone.addEventListener('drop', (e) => {
      e.preventDefault();
      zone.classList.remove('is-dragover');
      if (e.dataTransfer.files[0]) load(e.dataTransfer.files[0]);
    });

    btn.addEventListener('click', async () => {
      if (!pdfBuffer) return;
      btn.disabled = true;
      setStatus(stat, 'Arbejder…');
      try {
        const blob = await scrubPdf(pdfBuffer);
        download(blob, pdfName.replace(/\.pdf$/i, '') + '-renset.pdf');
        setStatus(stat, 'Downloadet.', true);
      } catch (e) {
        setStatus(stat, e.message || 'Fejl.', false);
      } finally {
        btn.disabled = !pdfBuffer;
      }
    });

    clear.addEventListener('click', reset);
  }

  function buildPrompt(task, toneKey, formatKey, examples) {
    if (!task.trim()) return '';

    const tone = TONES[toneKey] || TONES.professionel;
    const format = FORMATS[formatKey] || FORMATS.markdown;

    const lines = [
      '<system_prompt>',
      '',
      '<kontekst>',
      'Du er en hjælpsom assistent. Følg instruktionerne nøje.',
      '</kontekst>',
      '',
      '<opgave>',
      task.trim(),
      '</opgave>',
      '',
      '<tone>',
      tone,
      '</tone>',
      '',
      '<format>',
      format,
      '</format>',
    ];

    if (examples.trim()) {
      lines.push(
        '',
        '<eksempler>',
        examples.trim(),
        '</eksempler>'
      );
    }

    lines.push('', '</system_prompt>');
    return lines.join('\n');
  }

  function initPrompt() {
    const raw = $('prompt-raw');
    const tone = $('prompt-tone');
    const format = $('prompt-format');
    const examples = $('prompt-examples');
    const out = $('prompt-output');
    const buildBtn = $('prompt-build-btn');
    const copyBtn = $('prompt-copy-btn');
    if (!raw || !out || !buildBtn) return;

    buildBtn.addEventListener('click', () => {
      const result = buildPrompt(
        raw.value,
        tone ? tone.value : 'professionel',
        format ? format.value : 'markdown',
        examples ? examples.value : ''
      );
      out.value = result;
      copyBtn.disabled = !result;
    });

    copyBtn.addEventListener('click', async () => {
      if (!out.value) return;
      try {
        await navigator.clipboard.writeText(out.value);
      } catch {
        out.select();
        document.execCommand('copy');
      }
      const t = copyBtn.textContent;
      copyBtn.textContent = 'Kopieret';
      setTimeout(() => {
        copyBtn.textContent = t;
      }, 1500);
    });
  }

  function initFilter() {
    const buttons = document.querySelectorAll('.filter');
    const entries = document.querySelectorAll('.entry[data-categories]');
    const tags = document.querySelectorAll('.tag[data-categories]');

    buttons.forEach((btn) => {
      btn.addEventListener('click', () => {
        const f = btn.dataset.filter || 'all';

        buttons.forEach((b) => b.classList.toggle('is-on', b === btn));

        entries.forEach((el) => {
          const match = f === 'all' || el.dataset.categories === f;
          el.classList.toggle('is-hidden', !match);
        });

        tags.forEach((el) => {
          const match = f === 'all' || el.dataset.categories === f;
          el.classList.toggle('is-hidden', !match);
        });
      });
    });
  }

  function initFooter() {
    const y = $('year');
    if (y) y.textContent = String(new Date().getFullYear());
  }

  document.addEventListener('DOMContentLoaded', () => {
    initMasthead();
    initPortrait();
    initNav();
    initPdf();
    initPrompt();
    initFilter();
    initFooter();
  });
})();
