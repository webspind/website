/**
 * Webspind — Zero-Cost Edge Computing Portfolio
 * 100% client-side · No backend
 */

(function () {
  'use strict';

  const MAX_PDF_BYTES = 25 * 1024 * 1024;

  // ---------------------------------------------------------------------------
  // Utilities
  // ---------------------------------------------------------------------------

  function $(id) {
    return document.getElementById(id);
  }

  function setStatus(el, message, type) {
    if (!el) return;
    el.textContent = message;
    el.classList.remove('is-success', 'is-error');
    if (type) el.classList.add(`is-${type}`);
  }

  function downloadBlob(blob, filename) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  }

  function sanitizeFilename(name) {
    return name.replace(/\.pdf$/i, '') + '-scrubbed.pdf';
  }

  // ---------------------------------------------------------------------------
  // Navigation
  // ---------------------------------------------------------------------------

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

  // ---------------------------------------------------------------------------
  // Scroll reveal
  // ---------------------------------------------------------------------------

  function initReveal() {
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const items = document.querySelectorAll('.reveal');

    if (prefersReduced) {
      items.forEach((el) => el.classList.add('is-visible'));
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
    );

    items.forEach((el) => observer.observe(el));
  }

  // ---------------------------------------------------------------------------
  // PDF Metadata Scrubber (pdf-lib via CDN)
  // ---------------------------------------------------------------------------

  let pdfFile = null;
  let pdfArrayBuffer = null;

  async function scrubPdfMetadata(arrayBuffer, originalName) {
    if (typeof PDFLib === 'undefined') {
      throw new Error('pdf-lib failed to load. Check your connection and refresh.');
    }

    const { PDFDocument } = PDFLib;
    const pdfDoc = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true });

    pdfDoc.setTitle('');
    pdfDoc.setAuthor('');
    pdfDoc.setSubject('');
    pdfDoc.setKeywords([]);
    pdfDoc.setCreator('');
    pdfDoc.setProducer('');

    const bytes = await pdfDoc.save({ useObjectStreams: false });
    return new Blob([bytes], { type: 'application/pdf' });
  }

  function initPdfTool() {
    const dropzone = $('pdf-dropzone');
    const input = $('pdf-input');
    const scrubBtn = $('pdf-scrub-btn');
    const clearBtn = $('pdf-clear-btn');
    const status = $('pdf-status');

    if (!dropzone || !input) return;

    function resetPdf() {
      pdfFile = null;
      pdfArrayBuffer = null;
      input.value = '';
      dropzone.classList.remove('is-loaded', 'is-dragover');
      scrubBtn.disabled = true;
      clearBtn.disabled = true;
      setStatus(status, '');
    }

    function loadPdf(file) {
      if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
        setStatus(status, 'Please select a valid PDF file.', 'error');
        return;
      }
      if (file.size > MAX_PDF_BYTES) {
        setStatus(status, 'File exceeds 25 MB limit.', 'error');
        return;
      }

      const reader = new FileReader();
      reader.onload = () => {
        pdfFile = file;
        pdfArrayBuffer = reader.result;
        dropzone.classList.add('is-loaded');
        scrubBtn.disabled = false;
        clearBtn.disabled = false;
        setStatus(status, `Loaded: ${file.name} (${(file.size / 1024).toFixed(1)} KB)`, 'success');
      };
      reader.onerror = () => setStatus(status, 'Failed to read file.', 'error');
      reader.readAsArrayBuffer(file);
    }

    dropzone.addEventListener('click', () => input.click());
    dropzone.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        input.click();
      }
    });

    input.addEventListener('change', () => {
      if (input.files?.[0]) loadPdf(input.files[0]);
    });

    ['dragenter', 'dragover'].forEach((evt) => {
      dropzone.addEventListener(evt, (e) => {
        e.preventDefault();
        dropzone.classList.add('is-dragover');
      });
    });

    ['dragleave', 'drop'].forEach((evt) => {
      dropzone.addEventListener(evt, (e) => {
        e.preventDefault();
        dropzone.classList.remove('is-dragover');
      });
    });

    dropzone.addEventListener('drop', (e) => {
      const file = e.dataTransfer?.files?.[0];
      if (file) loadPdf(file);
    });

    scrubBtn.addEventListener('click', async () => {
      if (!pdfArrayBuffer || !pdfFile) return;

      scrubBtn.disabled = true;
      setStatus(status, 'Scrubbing metadata…');

      try {
        const blob = await scrubPdfMetadata(pdfArrayBuffer, pdfFile.name);
        downloadBlob(blob, sanitizeFilename(pdfFile.name));
        setStatus(status, 'Download started — metadata stripped locally.', 'success');
      } catch (err) {
        setStatus(status, err.message || 'Failed to process PDF.', 'error');
      } finally {
        scrubBtn.disabled = !pdfArrayBuffer;
      }
    });

    clearBtn.addEventListener('click', resetPdf);
  }

  // ---------------------------------------------------------------------------
  // Prompt Architect
  // ---------------------------------------------------------------------------

  function escapeXml(text) {
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&apos;');
  }

  function inferSections(raw) {
    const blocks = raw
      .split(/\n{2,}/)
      .map((b) => b.trim())
      .filter(Boolean);

    if (blocks.length >= 3) {
      return {
        context: blocks[0],
        task: blocks.slice(1, -1).join('\n\n') || blocks[1],
        format: blocks[blocks.length - 1],
      };
    }

    if (blocks.length === 2) {
      return { context: blocks[0], task: blocks[1], format: defaultFormat() };
    }

    return { context: defaultContext(), task: raw.trim(), format: defaultFormat() };
  }

  function defaultContext() {
    return [
      'You are a precise, professional AI assistant.',
      'Apply domain expertise relevant to the user request.',
      'Prioritize accuracy, clarity, and actionable output.',
    ].join(' ');
  }

  function defaultFormat() {
    return [
      'Respond in clear, structured prose.',
      'Use markdown headings and bullet lists where helpful.',
      'State assumptions explicitly when information is missing.',
    ].join(' ');
  }

  function architectPrompt(raw) {
    const trimmed = raw.trim();
    if (!trimmed) return '';

    const { context, task, format } = inferSections(trimmed);

    return [
      'You are an expert AI system. Follow the structured instructions below.',
      '',
      '<system_prompt>',
      '',
      '<context>',
      escapeXml(context),
      '</context>',
      '',
      '<task>',
      escapeXml(task),
      '</task>',
      '',
      '<format>',
      escapeXml(format),
      '</format>',
      '',
      '</system_prompt>',
      '',
      '---',
      '',
      'Context:',
      context,
      '',
      'Task:',
      task,
      '',
      'Format:',
      format,
    ].join('\n');
  }

  function initPromptTool() {
    const rawInput = $('prompt-raw');
    const output = $('prompt-output');
    const architectBtn = $('prompt-architect-btn');
    const copyBtn = $('prompt-copy-btn');

    if (!rawInput || !output || !architectBtn) return;

    architectBtn.addEventListener('click', () => {
      const structured = architectPrompt(rawInput.value);
      if (!structured) {
        setStatus(null, '');
        output.value = '';
        copyBtn.disabled = true;
        return;
      }
      output.value = structured;
      copyBtn.disabled = false;
      output.focus();
    });

    copyBtn.addEventListener('click', async () => {
      if (!output.value) return;
      try {
        await navigator.clipboard.writeText(output.value);
        const label = copyBtn.textContent;
        copyBtn.textContent = 'Copied!';
        setTimeout(() => {
          copyBtn.textContent = label;
        }, 2000);
      } catch {
        output.select();
        document.execCommand('copy');
      }
    });
  }

  // ---------------------------------------------------------------------------
  // Footer year
  // ---------------------------------------------------------------------------

  function initFooter() {
    const yearEl = $('year');
    if (yearEl) yearEl.textContent = String(new Date().getFullYear());
  }

  // ---------------------------------------------------------------------------
  // Boot
  // ---------------------------------------------------------------------------

  document.addEventListener('DOMContentLoaded', () => {
    initNav();
    initReveal();
    initPdfTool();
    initPromptTool();
    initFooter();
  });
})();
