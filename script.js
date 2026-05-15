/**
 * Webspind
 */
(function () {
  'use strict';

  const REASONING_BLOCK =
    '<reasoning>Before providing the final output, please think step by step and outline your logic.</reasoning>';

  const FORMAT_CONSTRAINTS = {
    tekst: 'Svar i klar, velstruktureret prosa (standard tekst).',
    punkt: 'Svar som punktopstilling — ét punkt per linje, kort og præcist.',
    tabel: 'Svar som en tabel med tydelige kolonneoverskrifter.',
    kode: 'Svar i en kodeblok med korrekt syntaks.',
  };

  const SUCCESS_MSG = 'Kopieret! Sæt ind i ChatGPT';
  const SUCCESS_MS = 3000;

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

  function appendTag(parts, tag, value) {
    if (!value.trim()) return;
    parts.push(`<${tag}>`, value.trim(), `</${tag}>`, '');
  }

  function buildPrompt(role, context, action, formatKey, tone, constraints, examples) {
    if (!action.trim()) return null;

    const parts = [];

    appendTag(parts, 'role', role);
    appendTag(parts, 'context', context);
    appendTag(parts, 'action', action);

    const formatText = FORMAT_CONSTRAINTS[formatKey] || FORMAT_CONSTRAINTS.tekst;
    parts.push('<format>', formatText, '</format>', '');

    appendTag(parts, 'tone', tone);
    appendTag(parts, 'constraints', constraints);
    appendTag(parts, 'examples', examples);

    parts.push(REASONING_BLOCK);

    return parts.join('\n');
  }

  async function copyToClipboard(text) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch {
      const ta = document.createElement('textarea');
      ta.value = text;
      ta.setAttribute('readonly', '');
      ta.style.position = 'fixed';
      ta.style.left = '-9999px';
      document.body.appendChild(ta);
      ta.select();
      const ok = document.execCommand('copy');
      document.body.removeChild(ta);
      return ok;
    }
  }

  function initPrompt() {
    const form = $('prompt-form');
    const role = $('prompt-persona');
    const context = $('prompt-context');
    const action = $('prompt-task');
    const format = $('prompt-format');
    const tone = $('prompt-tone');
    const constraints = $('prompt-constraints');
    const examples = $('prompt-examples');
    const msg = $('prompt-msg');

    if (!form || !action) return;

    let successTimer = null;

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      if (successTimer) {
        clearTimeout(successTimer);
        successTimer = null;
      }
      msg.textContent = '';
      msg.classList.remove('is-error', 'is-success');

      const result = buildPrompt(
        role.value,
        context.value,
        action.value,
        format ? format.value : 'tekst',
        tone ? tone.value : '',
        constraints ? constraints.value : '',
        examples ? examples.value : ''
      );

      if (!result) {
        msg.textContent = 'Udfyld mindst feltet «Hvad har du brug for hjælp til?».';
        msg.classList.add('is-error');
        action.focus();
        return;
      }

      const copied = await copyToClipboard(result);
      if (!copied) {
        msg.textContent = 'Kunne ikke kopiere — prøv igen i en nyere browser.';
        msg.classList.add('is-error');
        return;
      }

      msg.textContent = SUCCESS_MSG;
      msg.classList.add('is-success');
      successTimer = setTimeout(() => {
        msg.textContent = '';
        msg.classList.remove('is-success');
        successTimer = null;
      }, SUCCESS_MS);
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
