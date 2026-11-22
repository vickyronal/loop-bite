import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

/**
 * The bakes the hero cycles through on its own. `option` matches the order form's <select>.
 * Photos: transparent PNGs from Images/, prepared by scripts/hero-images.mjs.
 */
export const PRODUCTS = [
  { word: 'Brownie!', name: 'Brownies', img: '/cutouts/brownie.webp', tag: 'Fudgy', option: 'Brownies', alt: 'A fudgy chocolate brownie square' },
  { word: 'Cookie!', name: 'Cookies', img: '/cutouts/cookie.webp', tag: 'Gooey', option: 'Cookies', alt: 'A chocolate chip cookie' },
  { word: 'Muffin!', name: 'Cupcakes & muffins', img: '/cutouts/cupcake.webp', tag: 'Choc-chip', option: 'Cupcakes / Muffins', alt: 'A chocolate chip muffin' },
  { word: 'Cake!', name: 'Celebration cakes', img: '/cutouts/cake.webp', tag: 'Made for you', option: 'Celebration cake', alt: 'A slice of caramel and chocolate layer cake' },
  { word: 'Tub!', name: 'Dessert tubs', img: '/cutouts/tub.webp', tag: 'New', option: 'Kinder Nutella Tub', alt: 'A layered chocolate dessert cup' },
];
const BITES = 2; // two bites finish a bake, then the next one comes in
const HOLD = 5; // mobile only: seconds each bake stays before moving on by itself
// touch screens (phones, tablets) have no hover, so the bakes move along on a timer there
const isTouch = () => matchMedia('(hover: none), (pointer: coarse)').matches;

const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const isDesktop = () => matchMedia('(min-width: 861px)').matches;

let els;
let crumbs = [];
let idx = 0;
let reduced = false;

/* ---------- headline: one word, fitted to the card ---------- */
function setWord(text) {
  els.wordIn.innerHTML = [...text].map((c) => `<span class="ch">${c}</span>`).join('');
  fitWord();
  return $$('.ch', els.wordIn);
}
function fitWord() {
  els.word.style.fontSize = '100px';
  const w = els.wordIn.getBoundingClientRect().width || 1;
  const byWidth = (100 * els.card.clientWidth * (isDesktop() ? 0.8 : 0.92)) / w;
  const byHeight = (els.card.clientHeight * (isDesktop() ? 0.38 : 0.26)) / 0.8;
  els.word.style.fontSize = `${Math.min(byWidth, byHeight)}px`;
}

/* ---------- a few quiet crumbs around the product ---------- */
function crumbPath(r) {
  const pts = Array.from({ length: 7 }, (_, i) => {
    const a = (i / 7) * Math.PI * 2, rr = r * (0.65 + Math.random() * 0.45);
    return `${(Math.cos(a) * rr).toFixed(1)},${(Math.sin(a) * rr).toFixed(1)}`;
  });
  return `M${pts.join(' L')} Z`;
}
function makeCrumbs() {
  const colors = ['#3a1d13', '#6b3a24', '#8a4f2f', '#2b1712'];
  const spots = [[-0.62, -0.18], [0.6, -0.34], [0.66, 0.3], [-0.55, 0.42], [0.18, 0.62], [-0.2, -0.6]];
  els.crumbs.innerHTML = '';
  crumbs = spots.map(([sx, sy], i) => {
    const r = 5 + Math.random() * 6;
    const el = document.createElement('span');
    el.className = 'crumb';
    el.innerHTML = `<svg width="${r * 2.4}" height="${r * 2.4}" viewBox="${-r * 1.2} ${-r * 1.2} ${r * 2.4} ${r * 2.4}"><path d="${crumbPath(r)}" fill="${colors[i % colors.length]}"/></svg>`;
    els.crumbs.appendChild(el);
    return { el, sx, sy, depth: 0.4 + Math.random(), rot: Math.random() * 360 };
  });
}
const crumbBase = (c) => { const w = els.stage.offsetWidth; return { x: c.sx * w, y: c.sy * w }; };
function placeCrumbs() {
  crumbs.forEach((c) => { const b = crumbBase(c); gsap.set(c.el, { x: b.x, y: b.y, xPercent: -50, yPercent: -50, rotation: c.rot }); });
}

/* ---------- change bake ---------- */
function show(i) {
  const p = PRODUCTS[i];
  const oldChars = $$('.ch', els.wordIn);
  const tl = gsap.timeline();
  tl.to(oldChars, { yPercent: -110, opacity: 0, duration: 0.4, stagger: 0.025, ease: 'power3.in' }, 0)
    .to(els.product, { y: -40, rotation: -14, scale: 0.85, autoAlpha: 0, duration: 0.45, ease: 'power3.in' }, 0)
    .to(els.tag, { yPercent: -100, autoAlpha: 0, duration: 0.3, ease: 'power2.in' }, 0)
    .add(() => {
      const chars = setWord(p.word);
      els.product.src = p.img;
      els.product.alt = p.alt;
      els.tag.textContent = p.tag;
      gsap.fromTo(chars, { yPercent: 110, opacity: 0 }, { yPercent: 0, opacity: 1, duration: 0.8, stagger: 0.035, ease: 'expo.out' });
    }, 0.45)
    .fromTo(els.product, { y: 60, rotation: 12, scale: 0.85, autoAlpha: 0 }, { y: 0, rotation: 0, scale: 1, autoAlpha: 1, duration: 1, ease: 'expo.out' }, 0.5)
    .fromTo(els.tag, { yPercent: 100, autoAlpha: 0 }, { yPercent: 0, autoAlpha: 1, duration: 0.6, ease: 'expo.out' }, 0.6);
  crumbs.forEach((c, k) => {
    const b = crumbBase(c);
    tl.to(c.el, { x: b.x * 1.25, y: b.y * 1.25, rotation: '+=90', duration: 0.4, ease: 'power2.out' }, 0.45 + k * 0.02)
      .to(c.el, { x: b.x, y: b.y, duration: 1.1, ease: 'expo.out' }, 0.85 + k * 0.02);
  });
}
function next() {
  idx = (idx + 1) % PRODUCTS.length;
  clearBites();
  if (reduced) {
    const p = PRODUCTS[idx];
    setWord(p.word);
    Object.assign(els.product, { src: p.img, alt: p.alt });
    els.tag.textContent = p.tag;
    return;
  }
  show(idx);
  runProgress();
}

/* ---------- the slim progress line ----------
 * touch screens: it fills over HOLD seconds, then the next bake comes in by itself.
 * mouse screens: no timer — it simply shows which bake you're on; two hover bites move it along. */
let timer = null;
const bars = () => [...document.querySelectorAll('.hero__progress i')];
function runProgress() {
  timer?.kill();
  bars().forEach((b, j) => gsap.set(b, { '--p': j < idx ? 1 : 0 }));
  const cur = bars()[idx];
  if (!cur) return;
  if (reduced || !isTouch()) { gsap.to(cur, { '--p': 1, duration: 0.6, ease: 'power2.out' }); return; }
  timer = gsap.fromTo(cur, { '--p': 0 }, { '--p': 1, duration: HOLD, ease: 'none', onComplete: next });
}

/* ---------- bites: only when you hover over the bake ---------- */
let bites = [];
let biteCount = 0;
let lastHoverBite = 0;
function clearBites() {
  bites = [];
  biteCount = 0;
  const f = els.product;
  // let the leaving animation finish before the mask disappears
  gsap.delayedCall(reduced ? 0 : 0.45, () => { f.style.maskImage = f.style.webkitMaskImage = ''; });
}
/** Alpha + colour lookup for the current cut-out (sampled once per image into a small canvas). */
const alphaCache = new Map();
function cutoutData() {
  const img = els.product;
  let a = alphaCache.get(img.currentSrc || img.src);
  if (!a && img.naturalWidth) {
    const w = 160, h = Math.round((160 * img.naturalHeight) / img.naturalWidth);
    const cv = Object.assign(document.createElement('canvas'), { width: w, height: h });
    const ctx = cv.getContext('2d', { willReadFrequently: true });
    ctx.drawImage(img, 0, 0, w, h);
    a = { w, h, data: ctx.getImageData(0, 0, w, h).data };
    alphaCache.set(img.currentSrc || img.src, a);
  }
  return a;
}
function alphaAt() {
  const a = cutoutData();
  return (px, py, box) => {
    if (!a) return false;
    const u = Math.floor(((px - box.x) / box.w) * a.w), v = Math.floor(((py - box.y) / box.h) * a.h);
    if (u < 0 || v < 0 || u >= a.w || v >= a.h) return false;
    return a.data[(v * a.w + u) * 4 + 3] > 60;
  };
}
/** Colours from the bitten area of the bake itself, so the crumbs match (cookie crumbs look like cookie). */
function biteColors(cx, cy, nx, ny, box, r) {
  const a = cutoutData();
  const out = [];
  if (a) {
    for (let k = 0; k < 40 && out.length < 14; k++) {
      // sample just inside the bite
      const px = cx - nx * r * (0.3 + Math.random() * 0.9) + (Math.random() - 0.5) * r * 1.4;
      const py = cy - ny * r * (0.3 + Math.random() * 0.9) + (Math.random() - 0.5) * r * 1.4;
      const u = Math.floor(((px - box.x) / box.w) * a.w), v = Math.floor(((py - box.y) / box.h) * a.h);
      if (u < 0 || v < 0 || u >= a.w || v >= a.h) continue;
      const i = (v * a.w + u) * 4;
      if (a.data[i + 3] > 200) out.push(`rgb(${a.data[i]},${a.data[i + 1]},${a.data[i + 2]})`);
    }
  }
  return out.length ? out : ['#3a1d13', '#6b3a24', '#c98a4b', '#8a4f2f'];
}
const rnd = (a, b) => a + Math.random() * (b - a);
/**
 * The crunch: chunky crumbs fly out of the bite in a wide fan and tumble down, fine crumbs spray further,
 * and a soft puff of dust hangs for a moment. All coloured from the bake.
 */
function burstCrumbs(cx, cy, nx, ny, box, r) {
  const colors = biteColors(cx, cy, nx, ny, box, r);
  const base = Math.atan2(ny, nx);
  const W = box.W;
  const spawn = (html, cls = 'bite-crumb') => {
    const c = document.createElement('span');
    c.className = cls;
    c.innerHTML = html;
    c.style.left = `${(cx / W) * 100}%`;
    c.style.top = `${(cy / W) * 100}%`;
    els.stage.appendChild(c);
    return c;
  };
  const piece = (size, spread, dist, fall, dur) => {
    const rr = size;
    const col = colors[Math.floor(Math.random() * colors.length)];
    const c = spawn(`<svg width="${rr * 2.4}" height="${rr * 2.4}" viewBox="${-rr * 1.2} ${-rr * 1.2} ${rr * 2.4} ${rr * 2.4}"><path d="${crumbPath(rr)}" fill="${col}"/></svg>`);
    const ang = base + rnd(-spread, spread);
    const d = rnd(dist[0], dist[1]);
    gsap.timeline({ onComplete: () => c.remove() })
      .fromTo(c, { x: 0, y: 0, rotation: 0, opacity: 1, scale: rnd(0.6, 1) },
        { x: Math.cos(ang) * d, y: Math.sin(ang) * d - rnd(10, 50), rotation: rnd(-260, 260), scale: 1, duration: rnd(0.22, 0.38), ease: 'power2.out' })
      .to(c, { y: `+=${W * rnd(fall[0], fall[1])}`, x: `+=${rnd(-40, 40)}`, rotation: `+=${rnd(-400, 400)}`, duration: rnd(dur[0], dur[1]), ease: 'power2.in' })
      .to(c, { opacity: 0, duration: 0.3 }, '-=0.3');
  };
  // chunky pieces
  for (let k = 0; k < 16; k++) piece(rnd(4.5, 11), 1.25, [W * 0.12, W * 0.4], [0.6, 1.1], [0.9, 1.4]);
  // fine crumbs, wider and further
  for (let k = 0; k < 26; k++) piece(rnd(1.6, 3.8), 1.8, [W * 0.2, W * 0.65], [0.5, 1.2], [0.8, 1.5]);
  // a soft puff of dust
  for (let k = 0; k < 6; k++) {
    const size = rnd(10, 24);
    const c = spawn(`<span style="display:block;width:${size}px;height:${size}px;border-radius:50%;background:${colors[k % colors.length]}"></span>`, 'bite-crumb bite-dust');
    const ang = base + rnd(-0.9, 0.9), d = rnd(W * 0.06, W * 0.2);
    gsap.fromTo(c, { x: 0, y: 0, opacity: 0.55, scale: 0.4 }, {
      x: Math.cos(ang) * d, y: Math.sin(ang) * d - rnd(0, 20), opacity: 0, scale: rnd(1.4, 2.2), duration: rnd(0.7, 1.1), ease: 'power2.out', onComplete: () => c.remove(),
    });
  }
}
/** The drawn image's box inside the square float (object-fit: contain). */
function contentBox() {
  const W = els.float.clientWidth, H = els.float.clientHeight;
  const nw = els.product.naturalWidth || W, nh = els.product.naturalHeight || H;
  const s = Math.min(W / nw, H / nh), w = nw * s, h = nh * s;
  return { x: (W - w) / 2, y: (H - h) / 2, w, h, W };
}
/** Hover bite: towards wherever the pointer is on the bake. */
function hoverBite(e) {
  const now = performance.now();
  if (biteCount >= BITES || now - lastHoverBite < 650) return;
  lastHoverBite = now;
  const r0 = els.float.getBoundingClientRect();
  const box = contentBox();
  const sx = box.W / r0.width; // undo any scale on the float
  const lx = (e.clientX - r0.left) * sx, ly = (e.clientY - r0.top) * sx;
  const ccx = box.x + box.w / 2, ccy = box.y + box.h / 2;
  const d = Math.hypot(lx - ccx, ly - ccy);
  if (d < 2) biteAt(lx, ly, 0, -1, box);
  else biteAt(lx, ly, (lx - ccx) / d, (ly - ccy) / d, box);
}
function biteAt(lx, ly, nx, ny, box) {
  const r = box.W * 0.16; // big, generous bites
  // walk outward until the pixels turn transparent: that's the real edge of the bake
  let cx = lx, cy = ly;
  const solid = alphaAt();
  for (let step = 0; step < box.W; step += 2) {
    const px = lx + nx * step, py = ly + ny * step;
    cx = px; cy = py;
    if (!solid(px, py, box)) break;
  }
  // three overlapping circles along the edge = a scalloped bite
  const tx = -ny, ty = nx;
  [[-0.9, 0.12], [0, -0.32], [0.9, 0.12]].forEach(([k, inn]) => {
    bites.push([cx + tx * r * k + nx * r * inn, cy + ty * r * k + ny * r * inn, r * (k ? 0.8 : 1)]);
  });
  const layers = bites.map(([x, y, rr]) => `radial-gradient(circle at ${x.toFixed(1)}px ${y.toFixed(1)}px, transparent ${rr.toFixed(1)}px, #000 ${(rr + 0.8).toFixed(1)}px)`).join(', ');
  els.product.style.webkitMaskImage = els.product.style.maskImage = layers;
  biteCount += 1;

  if (!reduced) {
    // a little "crunch": the bake jolts away from the bite, then settles
    gsap.timeline()
      .to(els.product, { x: -nx * 6, y: -ny * 6, rotation: nx * -3, scale: 0.96, duration: 0.08, ease: 'power2.out' })
      .to(els.product, { x: 0, y: 0, rotation: 0, scale: 1, duration: 0.6, ease: 'elastic.out(1, 0.4)' });
    burstCrumbs(cx, cy, nx, ny, box, r);
  }
  // finished it? move on a little early
  if (biteCount >= BITES) {
    timer?.kill();
    gsap.delayedCall(reduced ? 0.3 : 0.9, next); // let the crumbs fall, then bring in the next bake
  }
}

/* ---------- setup ---------- */
export function initHero({ scrollToEl, reduced: r = false }) {
  reduced = r;
  els = {
    card: $('.hero__card'), word: $('.hero__word'), wordIn: $('.hero__word-in'), stage: $('.hero__stage'),
    product: $('.hero__product'), crumbs: $('.hero__crumbs'), tag: $('.hero__tag'),
    float: $('.hero__float'),
  };
  els.product.addEventListener('pointerenter', (e) => { if (e.pointerType === 'mouse') hoverBite(e); });
  // phones have no hover: a tap takes the bite
  els.product.addEventListener('pointerdown', (e) => { if (e.pointerType !== 'mouse') hoverBite(e); });
  els.product.addEventListener('pointermove', (e) => { if (e.pointerType === 'mouse') hoverBite(e); });
  PRODUCTS.forEach((p) => { const im = new Image(); im.src = p.img; }); // preload
  setWord(PRODUCTS[0].word);
  makeCrumbs();
  placeCrumbs();

  addEventListener('resize', () => { fitWord(); placeCrumbs(); });
  if (reduced) return;

  // mouse parallax: stage leans, crumbs drift by depth (CSS `translate`, so GSAP's x/y stay free)
  const mx = gsap.quickTo(els.stage, 'x', { duration: 1, ease: 'power3' });
  const my = gsap.quickTo(els.stage, 'y', { duration: 1, ease: 'power3' });
  const m = { x: 0, y: 0, sx: 0, sy: 0 };
  els.card.addEventListener('pointermove', (e) => {
    const r2 = els.card.getBoundingClientRect();
    m.x = (e.clientX - r2.left) / r2.width - 0.5;
    m.y = (e.clientY - r2.top) / r2.height - 0.5;
    mx(m.x * 24); my(m.y * 16);
  });
  gsap.ticker.add(() => {
    m.sx += (m.x - m.sx) * 0.06; m.sy += (m.y - m.sy) * 0.06;
    crumbs.forEach((c) => { c.el.style.translate = `${m.sx * c.depth * 50}px ${m.sy * c.depth * 36}px`; });
  });
  gsap.to('.hero__float', { y: -14, rotation: 2, duration: 2.8, ease: 'sine.inOut', yoyo: true, repeat: -1 });
}

export function heroIntro() {
  const tl = gsap.timeline({ defaults: { ease: 'expo.out' } });
  tl.from(els.card, { scale: 0.95, y: 30, duration: 1.4 }, 0)
    .from($$('.ch', els.wordIn), { yPercent: 115, opacity: 0, duration: 1.1, stagger: 0.05 }, 0.25)
    .from(els.product, { y: 120, scale: 0.8, rotation: 10, autoAlpha: 0, duration: 1.4 }, 0.5)
    .from('.hero__tag', { scale: 0, rotation: -30, duration: 0.9, ease: 'back.out(2)' }, 1.1)
    .from('.hero__line', { y: 20, autoAlpha: 0, duration: 1 }, 1.1)
    .from('.nav__logo, .nav__links, .nav__cta', { y: -18, autoAlpha: 0, duration: 0.9, stagger: 0.08 }, 0.7)

  crumbs.forEach((c, i) => {
    const b = crumbBase(c);
    tl.fromTo(c.el, { x: 0, y: 0, scale: 0 }, { x: b.x, y: b.y, scale: 1, duration: 1.3 }, 1 + i * 0.04);
  });
  tl.from('.hero__progress', { y: 16, autoAlpha: 0, duration: 1 }, 1.2).add(runProgress, 1.4);
}

/** Scrolling out: product sinks and grows, the word lifts. */
export function heroScroll() {
  // mobile timer pauses while the hero is off screen
  ScrollTrigger.create({ trigger: '.hero', start: 'top top', end: 'bottom top', onLeave: () => timer?.pause(), onEnterBack: () => timer?.resume() });
  gsap.timeline({
    defaults: { ease: 'none' },
    scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: 1 },
  })
    .to('.hero__stage', { yPercent: 16, scale: 1.1 }, 0)
    .to(els.word, { yPercent: -30, autoAlpha: 0.25 }, 0)
    .to('.hero__line', { autoAlpha: 0, y: 24 }, 0);
}
