/**
 * Webspind
 */
(function () {
  'use strict';

  const CONSTRAINTS_BLOCK =
    "<constraints>1. Undgå 'AI-slop': Brug ingen overflødige fyldord, maskinelle klicheer eller opsummeringer. 2. Tilpas dig 100% den valgte rolle og tone. Hvis tonen er empatisk eller pædagogisk, skal du være nærværende, anerkendende og lyttende. Hvis tonen er faglig/professionel, skal du være skarp og direkte. 3. Skriv altid naturligt og menneskeligt. 4. EMOJIS: Hvis den valgte tone er 'Pædagogisk og letforståelig' (eller empatisk), må du meget gerne inddrage varme og støttende emojis. Hvis tonen er 'Kort, direkte og professionel', er emojis STRENGT FORBUDT. 5. STAY IN CHARACTER: Du må under INGEN omstændigheder bryde ud af din rolle. Hvis jeg spørger 'Hvem er du?', eller stiller spørgsmål til din identitet, skal du ALTID svare udelukkende som den valgte rolle og aldrig afsløre, at du er en AI.</constraints>";
    const PROCESS_BLOCK =
    "<process>Du er en interaktiv samtalepartner. Dit workflow er: 1. DU SKAL ALTID starte med at stille mig op til 3 korte, afklarende spørgsmål for at forstå min situation helt, før du gør andet. 2. Vent på, at jeg har besvaret dine spørgsmål. 3. Tag derefter kun ét skridt ad gangen. Hvis jeg beder om handling, giv mig én opgave. Hvis jeg har brug for at lufte ud, så lyt, anerkend mine følelser og giv et kort, støttende svar. 4. Vent altid på mit svar, før du driver samtalen videre.</process>";
    
  const REASONING_BLOCK =
    '<reasoning>Before providing the final output, please think step by step and outline your logic.</reasoning>';

  const SUCCESS_MSG = 'Kopieret! Sæt ind i ChatGPT';
  const SUCCESS_MS = 3000;

  function $(id) {
    return document.getElementById(id);
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

  function setToggleState(toggle, isOpen) {
    toggle.setAttribute('aria-expanded', String(isOpen));
    toggle.setAttribute('aria-label', isOpen ? 'Luk menu' : 'Åbn menu');
  }

  function initNav() {
    const toggle = document.querySelector('.nav__toggle');
    const menu = $('nav-menu');
    if (!toggle || !menu) return;

    setToggleState(toggle, false);

    toggle.addEventListener('click', () => {
      const open = toggle.getAttribute('aria-expanded') === 'true';
      setToggleState(toggle, !open);
      menu.classList.toggle('is-open', !open);
    });

    menu.querySelectorAll('a').forEach((link) => {
      link.addEventListener('click', () => {
        setToggleState(toggle, false);
        menu.classList.remove('is-open');
      });
    });
  }

  function initStickyCompact() {
    const masthead = document.querySelector('.masthead');
    if (!masthead) return;
    let ticking = false;
    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        masthead.classList.toggle('is-compact', window.scrollY > 80);
        ticking = false;
      });
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
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

  function getRadioValue(name) {
    const checked = document.querySelector(`input[name="${name}"]:checked`);
    return checked ? checked.value : '';
  }

  function initPrompt() {
    const form = $('prompt-form');
    const role = $('prompt-role');
    const action = $('prompt-action');
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
        action.value,
        getRadioValue('prompt-tone'),
        getRadioValue('prompt-format')
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
    const cvSection = $('cv');

    buttons.forEach((btn) => {
      btn.addEventListener('click', () => {
        const f = btn.dataset.filter || 'all';
        buttons.forEach((b) => {
          const on = b === btn;
          b.classList.toggle('is-on', on);
          b.setAttribute('aria-pressed', String(on));
        });
        entries.forEach((el) => {
          const match = f === 'all' || el.dataset.categories === f;
          el.classList.toggle('is-hidden', !match);
        });
        tags.forEach((el) => {
          const match = f === 'all' || el.dataset.categories === f;
          el.classList.toggle('is-hidden', !match);
        });
        if (cvSection && f !== 'all') {
          cvSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      });
    });
  }

  document.addEventListener('DOMContentLoaded', () => {
    document.documentElement.classList.add('page-loaded');
    initPortrait();
    initNav();
    initStickyCompact();
    initPrompt();
    initFilter();
  });
})();