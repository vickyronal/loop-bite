import gsap from 'gsap';
import { CONFIG } from '../config.js';
import { earliestDate, isoDate, prettyDate } from './greeting.js';

/** Order form → a ready-written WhatsApp message. Enforces the lead time and previews the note live. */
export function orderForm() {
  const form = document.querySelector('.order__form');
  if (!form) return;
  const err = form.querySelector('.order__error');
  const date = form.elements.date;

  // earliest possible date is both the minimum and the default
  date.min = isoDate(earliestDate());
  date.value = date.min;

  document.addEventListener('occasion', (e) => {
    const sel = form.elements.occasion;
    const opt = [...sel.options].find((o) => o.text === e.detail);
    if (opt) sel.value = opt.value || opt.text;
    if (e.detail === 'Corporate / bulk') form.elements.product.value = 'Gift hamper';
    renderNote();
  });

  document.addEventListener('product', (e) => {
    const sel = form.elements.product;
    const opt = [...sel.options].find((o) => o.text === e.detail);
    if (opt) sel.value = opt.value || opt.text;
  });

  /* ---------- live note preview ---------- */
  const note = document.querySelector('.note-preview');
  const msgEl = note?.querySelector('.note-preview__msg');
  const forEl = note?.querySelector('.note-preview__for');
  const dateEl = note?.querySelector('.note-preview__date');
  let lastMsg = '';
  function renderNote() {
    if (!note) return;
    const msg = form.elements.message.value.trim();
    msgEl.textContent = msg || 'Your words go here ♡';
    msgEl.classList.toggle('is-empty', !msg);
    const occ = form.elements.occasion.value;
    const FOR = { Birthday: '— for a birthday', Anniversary: '— for an anniversary', 'Mom-to-be': '— for a mom-to-be', 'New job': '— for a new job', 'Just because': '— just because', 'Corporate / bulk': '— for the team' };
    forEl.textContent = FOR[occ] || '';
    dateEl.textContent = date.value ? `Ready ${prettyDate(new Date(date.value + 'T00:00'))}` : '';
    if (msg !== lastMsg) gsap.fromTo(note, { scale: 1.03 }, { scale: 1, duration: 0.4, ease: 'back.out(2)', overwrite: true });
    lastMsg = msg;
  }
  form.addEventListener('input', renderNote);
  form.addEventListener('change', renderNote);
  renderNote();

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const f = Object.fromEntries(new FormData(form));
    const problems = [];
    if (!f.name.trim()) problems.push('your name');
    if (!f.product) problems.push('what we’re baking');
    if (!f.date) problems.push('the date');
    else if (f.date < date.min) {
      err.textContent = `We need at least ${CONFIG.minLeadDays} days — the earliest date is ${prettyDate(new Date(date.min + 'T00:00'))}.`;
      err.hidden = false;
      return;
    }
    if (problems.length) {
      err.textContent = `Almost there — please add ${problems.join(', ')}.`;
      err.hidden = false;
      return;
    }
    err.hidden = true;

    const lines = [
      'Hi Loop Bite! I’d like to place an order:',
      `• Name: ${f.name.trim()}`,
      `• Bake: ${f.product}`,
      `• Occasion: ${f.occasion || 'Just because'}`,
      `• Needed on: ${new Date(f.date + 'T00:00').toDateString()}`,
      f.message.trim() && `• Message on the bake: ${f.message.trim()}`,
      f.notes.trim() && `• Notes: ${f.notes.trim()}`,
    ].filter(Boolean);
    const url = `https://wa.me/${CONFIG.whatsapp}?text=${encodeURIComponent(lines.join('\n'))}`;
    window.open(url, '_blank', 'noopener');
  });
}
