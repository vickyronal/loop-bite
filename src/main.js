import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SplitText } from 'gsap/SplitText';
import { Draggable } from 'gsap/Draggable';
import Lenis from 'lenis';

import { runPreloader } from './animations/preloader.js';
import { initHero, heroIntro, heroScroll } from './animations/hero.js';
import { bakesScroll } from './animations/bakes.js';
import { quoteScroll } from './animations/quote.js';
import { occasions } from './animations/occasions.js';
import { hamperScroll } from './animations/hamper.js';
import { notes } from './animations/notes.js';
import { howScroll } from './animations/how.js';
import { footerScroll } from './animations/footer.js';
import { headings, themes } from './animations/shared.js';
import { cursor, magnetic } from './ui/pointer.js';
import { orderForm } from './ui/order.js';
import { initGreeting } from './ui/greeting.js';

gsap.registerPlugin(ScrollTrigger, SplitText, Draggable);
if (import.meta.env.DEV) window.ScrollTrigger = ScrollTrigger;

const root = document.documentElement;
root.classList.add('has-js');
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
if (reduce) root.classList.add('no-motion');

/* Smooth scroll, driven by the GSAP ticker so ScrollTrigger and Lenis stay in sync */
const lenis = reduce ? null : new Lenis({ lerp: 0.085, wheelMultiplier: 0.95 });
if (lenis) {
  lenis.stop();
  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add((t) => lenis.raf(t * 1000));
  gsap.ticker.lagSmoothing(0);
}
export function scrollToEl(target) {
  if (lenis) lenis.scrollTo(target, { duration: 1.6, easing: (x) => 1 - Math.pow(1 - x, 4) });
  else if (target === 0) scrollTo(0, 0);
  else (typeof target === 'string' ? document.querySelector(target) : target)?.scrollIntoView();
}
document.querySelectorAll('a[href^="#"]').forEach((a) => {
  a.addEventListener('click', (e) => {
    const id = a.getAttribute('href');
    const el = id === '#top' ? 0 : document.querySelector(id);
    if (el === null) return;
    e.preventDefault();
    if (a.dataset.occasionLink) document.dispatchEvent(new CustomEvent('occasion', { detail: a.dataset.occasionLink }));
    scrollToEl(el);
  });
});

const fontsReady = Promise.race([document.fonts.ready, new Promise((r) => setTimeout(r, 2500))]);

cursor();
magnetic();
orderForm({ scrollToEl });
initGreeting();

/* Nav: a gold dot marks the section you're in; tightens up a little on scroll */
function navInit() {
  const nav = document.querySelector('.nav');
  const links = [...nav.querySelectorAll('.nav__links a')];
  let active = null;
  links.forEach((a) => {
    const sec = document.querySelector(a.getAttribute('href'));
    if (!sec) return;
    const spacer = sec.parentElement.classList.contains('pin-spacer') ? sec.parentElement : sec;
    ScrollTrigger.create({
      trigger: spacer, start: 'top 50%', end: 'bottom 50%',
      onToggle: (self) => {
        if (self.isActive) active = a; else if (active === a) active = null;
        links.forEach((l) => l.classList.toggle('is-active', l === active));
      },
    });
  });
  ScrollTrigger.create({ start: 80, end: 'max', toggleClass: { targets: nav, className: 'is-compact' } });
}

(async () => {
  if (reduce) {
    document.querySelector('.preloader')?.remove();
    document.body.classList.remove('is-loading');
    await fontsReady;
    initHero({ scrollToEl, reduced: true });
    themes(true);
    navInit();
    howScroll(true);
    return;
  }

  fontsReady.then(() => initHero({ scrollToEl }));
  await runPreloader(fontsReady);
  document.body.classList.remove('is-loading');
  lenis?.start();

  heroIntro();
  heroScroll();
  // nav tucks away while scrolling down, comes back on the way up
  ScrollTrigger.create({
    start: 0, end: 'max',
    onUpdate: (self) => {
      const hide = self.direction === 1 && self.scroll() > innerHeight * 0.5;
      gsap.to('.nav', { yPercent: hide ? -170 : 0, duration: 0.5, ease: 'power3.out', overwrite: 'auto' });
    },
  });
  quoteScroll();
  bakesScroll();
  occasions({ scrollToEl });
  hamperScroll();
  notes();
  howScroll();
  footerScroll({ scrollToEl });
  // created last so their start/end account for every pin-spacer above them
  headings();
  themes();
  navInit();

  // images inside pinned sections can change sizes — recalc once everything has loaded
  addEventListener('load', () => ScrollTrigger.refresh());
  ScrollTrigger.refresh();
})();
