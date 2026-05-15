/**
 * Webspind — client-side værktøjer & CV-filter
 */
(function () {
  'use strict';

  const MAX_PDF = 25 * 1024 * 1024;

  const TONE_MAP = {
    professionel:
      'Professionel, præcis og neutral. Undgå fyldord. Prioritér klarhed over kreativitet.',
    teknisk:
      'Teknisk og datadrevet. Brug fagterminologi korrekt. Underbyg påstande med struktur, ikke spekulation.',
    konsulent:
      'Konsulenttone: struktureret, handlingsorienteret, executive-ready. Lead med konklusion, derefter rationale.',
    akademisk:
      'Akademisk: nuanceret, evidensbaseret, eksplicit om usikkerhed og antagelser. Citer logik, ikke autoritet.',
    direkte:
      'Direkte og koncist. Korte sætninger. Ingen indledning eller opsummering med mindre det er eksplicit bedt om.',
  };

  const FORMAT_MAP = {
    markdown:
      'Output SKAL være valid Markdown: brug ## til sektioner, punktopstillinger til lister, og code fences til kode.',
    json:
      'Output SKAL være valid JSON uden kommentarer. Ingen trailing commas. Brug konsistente nøglenavne (snake_case).',
    xml:
      'Output SKAL være velformet XML med én rodnode. Escape specialtegn. Ingen tekst uden for tags.',
    tabel:
      'Output SKAL være tabulært: Markdown-tabeller eller semikolon-separeret CSV med header-række.',
    prosa:
      'Output i ren prosa: afsnit adskilt af tom linje. Ingen lister med mindre det forbedrer læsbarhed markant.',
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
      throw new Error('pdf-lib kunne ikke indlæses. Tjek forbindelsen og genindlæs.');
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
      if (label) label.textContent = 'Træk PDF hertil · klik for filsystem';
      scrubBtn.disabled = true;
      clearBtn.disabled = true;
      status(stat, '');
    }

    function accept(file) {
      const isPdf =
        file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');
      if (!isPdf) {
        status(stat, 'Ugyldig filtype — kun PDF.', 'err');
        return;
      }
      if (file.size > MAX_PDF) {
        status(stat, 'Filen overstiger 25 MB.', 'err');
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
        status(stat, `Klar: ${file.name} (${(file.size / 1024).toFixed(1)} KB)`, 'ok');
      };
      reader.onerror = () => status(stat, 'Fil-læsning fejlede.', 'err');
      reader.readAsArrayBuffer(file);
    }

    input.addEventListener('change', () => {
      if (input.files && input.files[0]) accept(input.files[0]);
    });

    dropzone.addEventListener('dragover', (e) => {
      e.preventDefault();
      dropzone.classList.add('is-dragover');
    });

    dropzone.addEventListener('dragleave', () => dropzone.classList.remove('is-dragover'));

    dropzone.addEventListener('drop', (e) => {
      e.preventDefault();
      dropzone.classList.remove('is-dragover');
      const file = e.dataTransfer && e.dataTransfer.files[0];
      if (file) accept(file);
    });

    scrubBtn.addEventListener('click', async () => {
      if (!pdfBuffer || !pdfName) return;
      scrubBtn.disabled = true;
      status(stat, 'Stripper Info-dictionary…');

      try {
        const blob = await scrubPdf(pdfBuffer);
        download(blob, scrubbedName(pdfName));
        status(stat, 'Download startet — metadata fjernet client-side.', 'ok');
      } catch (e) {
        status(stat, e.message || 'PDF-behandling fejlede.', 'err');
      } finally {
        scrubBtn.disabled = !pdfBuffer;
      }
    });

    clearBtn.addEventListener('click', reset);
  }

  function detectFormatFromText(text) {
    const lower = text.toLowerCase();
    if (/\bjson\b|schema|api.?response/.test(lower)) return 'json';
    if (/\bmarkdown\b|\.md\b|overskrift/.test(lower)) return 'markdown';
    if (/\bxml\b|<\w+>/.test(lower)) return 'xml';
    if (/\btabel\b|csv|kolonne/.test(lower)) return 'tabel';
    return null;
  }

  function buildPrompt(raw, toneKey, formatKey, examples) {
    const task = raw.trim();
    if (!task) return '';

    const tone = TONE_MAP[toneKey] || TONE_MAP.professionel;
    const detected = detectFormatFromText(task);
    const format = FORMAT_MAP[detected || formatKey] || FORMAT_MAP.markdown;

    const kontekst = [
      'Du er en specialiseret AI-assistent konfigureret via en struktureret systemprompt.',
      'Overhold alle constraints nedenfor. Ved konflikt: Format > Opgave > Tone.',
    ].join(' ');

    let fewShotBlock = '';
    if (examples.trim()) {
      fewShotBlock = [
        '',
        '<few_shot_examples>',
        'Følg mønsteret i eksemplerne. Generalisér strukturen, ikke overfitting til eksempeldata.',
        '',
        examples.trim(),
        '</few_shot_examples>',
      ].join('\n');
    }

    return [
      '<system_prompt version="1.0">',
      '',
      '<role>',
      'Expert AI agent — output optimeret til downstream parsing og menneskelig review.',
      '</role>',
      '',
      '<context>',
      kontekst,
      '</context>',
      '',
      '<task>',
      task,
      '</task>',
      '',
      '<tone_of_voice>',
      tone,
      '</tone_of_voice>',
      '',
      '<format_constraints>',
      format,
      'Valider output mod constraint før aflevering. Afvis formater der bryder specifikationen.',
      '</format_constraints>',
      fewShotBlock,
      '',
      '<execution_rules>',
      '- Tænk trin-for-trin internt; eksponer kun endeligt output med mindre chain-of-thought er bedt om.',
      '- Ved tvetydighed: angiv antagelser eksplicit i output (eller i et kort "Antagelser"-afsnit).',
      '- Ingen hallucinerede fakta, URLs eller citations.',
      '</execution_rules>',
      '',
      '</system_prompt>',
    ]
      .filter((line, i, arr) => !(line === '' && arr[i - 1] === ''))
      .join('\n');
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
      copyBtn.textContent = 'Kopieret';
      setTimeout(() => {
        copyBtn.textContent = prev;
      }, 1800);
    });
  }

  function initCvFilter() {
    const buttons = document.querySelectorAll('.filter-btn');
    const items = document.querySelectorAll('.timeline__item[data-categories]');
    const tags = document.querySelectorAll('.tag[data-categories]');

    if (!buttons.length) return;

    function applyFilter(filter) {
      buttons.forEach((btn) => {
        btn.classList.toggle('is-active', btn.dataset.filter === filter);
      });

      items.forEach((item) => {
        const cats = (item.dataset.categories || '').split(',');
        const show = filter === 'all' || cats.includes(filter);
        item.classList.toggle('is-filtered-out', !show);
        item.setAttribute('aria-hidden', show ? 'false' : 'true');
      });

      tags.forEach((tag) => {
        const cats = (tag.dataset.categories || '').split(',');
        const show = filter === 'all' || cats.includes(filter);
        tag.classList.toggle('is-filtered-out', !show);
      });
    }

    buttons.forEach((btn) => {
      btn.addEventListener('click', () => applyFilter(btn.dataset.filter || 'all'));
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
    initCvFilter();
    initFooter();
  });
})();
