import { CONFIG } from '../config.js';

const TZ = 'Asia/Kolkata';

/** Current hour in Chennai, whatever the visitor's own timezone. */
function chennaiHour(now = new Date()) {
  return Number(new Intl.DateTimeFormat('en-GB', { hour: 'numeric', hourCycle: 'h23', timeZone: TZ }).format(now));
}

/** A greeting in the brand's voice, by Chennai time. */
export function greeting(now = new Date()) {
  const h = chennaiHour(now);
  if (h >= 5 && h < 12) return 'Good morning, Chennai';
  if (h >= 12 && h < 17) return 'Good afternoon, Chennai';
  if (h >= 17 && h < 22) return 'Good evening, Chennai';
  return 'Midnight craving? We get it.';
}

/** The earliest date an order placed today can be ready (today + lead days, in Chennai). */
export function earliestDate(now = new Date()) {
  const parts = Object.fromEntries(new Intl.DateTimeFormat('en-CA', { year: 'numeric', month: '2-digit', day: '2-digit', timeZone: TZ })
    .formatToParts(now).filter((p) => p.type !== 'literal').map((p) => [p.type, p.value]));
  const d = new Date(Number(parts.year), Number(parts.month) - 1, Number(parts.day));
  d.setDate(d.getDate() + CONFIG.minLeadDays);
  return d;
}

const pad = (n) => String(n).padStart(2, '0');
export const isoDate = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
export const prettyDate = (d) => d.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' });

/** Fills the hero eyebrow: greeting · Order today, ready by <date>. */
export function initGreeting() {
  const greet = document.querySelector('.eyebrow__greet');
  const date = document.querySelector('.eyebrow__date');
  if (greet) greet.textContent = `${greeting()} · `;
  // desktop: "Order today, ready by Tue, 25 Nov" · mobile: "Ready by Tue, 25 Nov"
  if (date) date.innerHTML = `<span class="hide-sm">Order today, ready</span><span class="show-sm">Ready</span> by ${prettyDate(earliestDate())}`;
}
