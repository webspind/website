/**
 * Webspind
 */
(function () {
  'use strict';

  const CONSTRAINTS_BLOCK =
    "<constraints>1. Undgå 'AI-slop': Brug ingen fyldord, klicheer eller metaforer. 2. Vær direkte og menneskelig i sproget. Skriv som en erfaren fagperson, ikke en maskine. 3. Gå direkte til sagen. Drop overflødige indledninger og konklusioner. 4. Ingen overflødig høflighed. Bare løs opgaven.</constraints>";

  const PROCESS_BLOCK =
    "<process>Før du løser opgaven, skal du følge dette workflow strengt: 1. Stil mig højst 3 korte, præcise spørgsmål for at afklare min situation. 2. Vent på, at jeg har besvaret dine spørgsmål. 3. Når jeg har svaret, skal du tænke over, hvad den absolut vigtigste første handling er. 4. Skriv KUN denne ene ting, jeg skal gøre LIGE NU. Giv mig under ingen omstændigheder en lang liste eller den fulde plan. 5. Vent på min reaktion (f.eks. 'gjort', 'hvad så nu?', eller 'det kan jeg ikke finde ud af'). 6. Fortsæt i din rolle. Baseret på mit svar, giver du mig den NÆSTE vigtigste handling. Fortsæt altid kun med én ting ad gangen.</process>";

  const REASONING_BLOCK =
    '<reasoning>Before providing the final output, please think step by step and outline your logic.</reasoning>';

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

  function buildPrompt(role, action, tone, format) {
    if (!action.trim()) return null;

    const parts = ['<system_prompt>', ''];

    appendTag(parts, 'role', role);
    appendTag(parts, 'action', action);
    appendTag(parts, 'tone', tone);
    parts.push(CONSTRAINTS_BLOCK, '');
    appendTag(parts, 'format', format);
    parts.push(PROCESS_BLOCK, '', REASONING_BLOCK, '', '</system_prompt>');

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
    const role = $('prompt-role');
    const action = $('prompt-action');
    const tone = $('prompt-tone');
    const format = $('prompt-format');
    const msg = $('prompt-msg');

    if (!form || !action || !tone || !format) return;

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
        action.value,
        tone.value,
        format.value
      );

      if (!result) {
        msg.textContent = 'Udfyld mindst feltet «Hvad skal du have hjælp til?».';
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