/**
 * Webspind — klient-side værktøjer (dansk)
 */
(function () {
  'use strict';

  const MAX_PDF = 25 * 1024 * 1024;
  const MSG = {
    pdfInvalid: 'Vælg en gyldig PDF-fil.',
    pdfLarge: 'Filen er større end 25 MB.',
    pdfReadErr: 'Kunne ikke læse filen.',
    pdfLibErr: 'pdf-lib kunne ikke indlæses. Tjek din forbindelse og genindlæs siden.',
    pdfWorking: 'Renser metadata…',
    pdfDone: 'Download startet — metadata er fjernet lokalt.',
    pdfFail: 'Kunne ikke behandle PDF-filen.',
    pdfLoaded: (name, kb) => `Klar: ${name} (${kb} KB)`,
    promptEmpty: 'Skriv en prompt først.',
    copied: 'Kopieret!',
    copy: 'Kopiér',
  };

  let pdfBuffer = null;
  let pdfName = '';

  function $(id) {
    return document.getElementById(id);
  }

  function status(el, text, kind) {
    if (!el) return;
    el.textContent = text;
    el.classList.remove('is-ok', 'is-err');
    if (kind === 'ok') el.classList.add('is-ok');
    if (kind === 'err') el.classList.add('is-err');
  }

  function download(blob, filename) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }

  function scrubbedName(name) {
    return name.replace(/\.pdf$/i, '') + '-renset.pdf';
  }

  // Navigation
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

  // PDF tool
  async function scrubPdf(buffer) {
    if (typeof PDFLib === 'undefined') {
      throw new Error(MSG.pdfLibErr);
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
    const dropzone = $('pdf-dropzone');
    const input = $('pdf-input');
    const label = $('pdf-label');
    const scrubBtn = $('pdf-scrub-btn');
    const clearBtn = $('pdf-clear-btn');
    const stat = $('pdf-status');

    if (!dropzone || !input || !scrubBtn) return;

    function reset() {
      pdfBuffer = null;
      pdfName = '';
      input.value = '';
      dropzone.classList.remove('is-ready', 'is-dragover');
      if (label) label.textContent = 'Træk en PDF hertil, eller klik for at vælge fil';
      scrubBtn.disabled = true;
      clearBtn.disabled = true;
      status(stat, '');
    }

    function accept(file) {
      const isPdf =
        file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');
      if (!isPdf) {
        status(stat, MSG.pdfInvalid, 'err');
        return;
      }
      if (file.size > MAX_PDF) {
        status(stat, MSG.pdfLarge, 'err');
        return;
      }

      const reader = new FileReader();
      reader.onload = () => {
        pdfBuffer = reader.result;
        pdfName = file.name;
        dropzone.classList.add('is-ready');
        if (label) label.textContent = file.name;
        scrubBtn.disabled = false;
        clearBtn.disabled = false;
        status(stat, MSG.pdfLoaded(file.name, (file.size / 1024).toFixed(1)), 'ok');
      };
      reader.onerror = () => status(stat, MSG.pdfReadErr, 'err');
      reader.readAsArrayBuffer(file);
    }

    input.addEventListener('change', () => {
      if (input.files && input.files[0]) accept(input.files[0]);
    });

    dropzone.addEventListener('dragover', (e) => {
      e.preventDefault();
      dropzone.classList.add('is-dragover');
    });

    dropzone.addEventListener('dragleave', () => {
      dropzone.classList.remove('is-dragover');
    });

    dropzone.addEventListener('drop', (e) => {
      e.preventDefault();
      dropzone.classList.remove('is-dragover');
      const file = e.dataTransfer && e.dataTransfer.files[0];
      if (file) accept(file);
    });

    scrubBtn.addEventListener('click', async () => {
      if (!pdfBuffer || !pdfName) return;
      scrubBtn.disabled = true;
      status(stat, MSG.pdfWorking);

      try {
        const blob = await scrubPdf(pdfBuffer);
        download(blob, scrubbedName(pdfName));
        status(stat, MSG.pdfDone, 'ok');
      } catch (e) {
        status(stat, e.message || MSG.pdfFail, 'err');
      } finally {
        scrubBtn.disabled = !pdfBuffer;
      }
    });

    clearBtn.addEventListener('click', reset);
  }

  // Prompt tool
  function buildPrompt(raw) {
    const text = raw.trim();
    if (!text) return '';

    const parts = text.split(/\n{2,}/).map((p) => p.trim()).filter(Boolean);
    let kontekst;
    let opgave;
    let format;

    if (parts.length >= 3) {
      kontekst = parts[0];
      format = parts[parts.length - 1];
      opgave = parts.slice(1, -1).join('\n\n');
    } else if (parts.length === 2) {
      kontekst = parts[0];
      opgave = parts[1];
      format =
        'Svar på dansk med klar struktur. Brug punktopstillinger og korte afsnit, hvor det giver mening.';
    } else {
      kontekst =
        'Du er en præcis og professionel AI-assistent med relevant domæneviden.';
      opgave = text;
      format =
        'Svar på dansk med klar struktur. Brug punktopstillinger og korte afsnit, hvor det giver mening.';
    }

    return [
      '<system_prompt>',
      '',
      '<kontekst>',
      kontekst,
      '</kontekst>',
      '',
      '<opgave>',
      opgave,
      '</opgave>',
      '',
      '<format>',
      format,
      '</format>',
      '',
      '</system_prompt>',
      '',
      '---',
      '',
      'Kontekst:',
      kontekst,
      '',
      'Opgave:',
      opgave,
      '',
      'Format:',
      format,
    ].join('\n');
  }

  function initPrompt() {
    const raw = $('prompt-raw');
    const out = $('prompt-output');
    const buildBtn = $('prompt-build-btn');
    const copyBtn = $('prompt-copy-btn');

    if (!raw || !out || !buildBtn) return;

    buildBtn.addEventListener('click', () => {
      const result = buildPrompt(raw.value);
      if (!result) {
        out.value = '';
        copyBtn.disabled = true;
        raw.focus();
        return;
      }
      out.value = result;
      copyBtn.disabled = false;
    });

    copyBtn.addEventListener('click', async () => {
      if (!out.value) return;
      try {
        await navigator.clipboard.writeText(out.value);
      } catch {
        out.select();
        document.execCommand('copy');
      }
      const prev = copyBtn.textContent;
      copyBtn.textContent = MSG.copied;
      setTimeout(() => {
        copyBtn.textContent = prev;
      }, 1800);
    });
  }

  function initFooter() {
    const y = $('year');
    if (y) y.textContent = String(new Date().getFullYear());
  }

  document.addEventListener('DOMContentLoaded', () => {
    initNav();
    initPdf();
    initPrompt();
    initFooter();
  });
})();
