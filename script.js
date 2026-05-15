/**
 * Webspind
 */
(function () {
  'use strict';

  const COT_BLOCK =
    '<reasoning> Before providing the final output, please think step by step and outline your logic. </reasoning>';

  const FORMAT_CONSTRAINTS = {
    tekst: 'Svar i klar, velstruktureret prosa (standard tekst).',
    punkt: 'Svar som punktopstilling — ét punkt per linje, kort og præcist.',
    tabel: 'Svar som en tabel med tydelige kolonneoverskrifter.',
    kode: 'Svar i en kodeblok med korrekt syntaks.',
  };

  function $(id) {
    return document.getElementById(id);
  }

  function initMasthead() {
    const el = $('masthead-date');
    if (!el) return;
    el.textContent = new Date().toLocaleDateString('da-DK', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
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

  function buildPrompt(persona, context, task, formatKey, useCot) {
    if (!task.trim()) return null;

    const parts = ['<system_prompt>', ''];

    if (persona.trim()) {
      parts.push('<persona>', persona.trim(), '</persona>', '');
    }

    if (context.trim()) {
      parts.push('<context>', context.trim(), '</context>', '');
    }

    parts.push('<task>', task.trim(), '</task>', '');

    const formatText = FORMAT_CONSTRAINTS[formatKey] || FORMAT_CONSTRAINTS.tekst;
    parts.push(
      '<format_constraint>',
      formatText,
      '</format_constraint>',
      ''
    );

    if (useCot) {
      parts.push(COT_BLOCK, '');
    }

    parts.push('</system_prompt>');
    return parts.join('\n');
  }

  function initPrompt() {
    const form = $('prompt-form');
    const persona = $('prompt-persona');
    const context = $('prompt-context');
    const task = $('prompt-task');
    const format = $('prompt-format');
    const cot = $('prompt-cot');
    const msg = $('prompt-msg');
    const wrap = $('prompt-output-wrap');
    const output = $('prompt-output');
    const copyBtn = $('prompt-copy-btn');

    if (!form || !task || !output) return;

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      msg.textContent = '';
      msg.classList.remove('is-error');

      const result = buildPrompt(
        persona.value,
        context.value,
        task.value,
        format ? format.value : 'tekst',
        cot.checked
      );

      if (!result) {
        msg.textContent = 'Udfyld mindst feltet Opgave.';
        msg.classList.add('is-error');
        task.focus();
        return;
      }

      output.textContent = result;
      wrap.hidden = false;
      wrap.classList.add('is-visible');
      msg.textContent = 'Prompt klar.';
      copyBtn.focus();
    });

    copyBtn.addEventListener('click', async () => {
      const text = output.textContent;
      if (!text) return;

      try {
        await navigator.clipboard.writeText(text);
      } catch {
        const range = document.createRange();
        range.selectNodeContents(output);
        const sel = window.getSelection();
        sel.removeAllRanges();
        sel.addRange(range);
        document.execCommand('copy');
        sel.removeAllRanges();
      }

      const label = copyBtn.textContent;
      copyBtn.textContent = 'Kopieret ✓';
      copyBtn.classList.add('is-copied');
      setTimeout(() => {
        copyBtn.textContent = label;
        copyBtn.classList.remove('is-copied');
      }, 2000);
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
    initPrompt();
    initFilter();
    initFooter();
  });
})();
