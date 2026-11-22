import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

/**
 * Chapter 08 — four steps on one screen. When the section arrives, the loop line draws once
 * from step to step, the logo's gold dot rides it, and each step pops in as the dot reaches it.
 */
export function howScroll(reduced = false) {
  const track = document.querySelector('.how__track');
  const svg = track.querySelector('.how__line');
  const ghost = svg.querySelector('.how__ghost');
  const draw = svg.querySelector('.how__draw');
  const dot = track.querySelector('.how__dot');
  const nodes = [...track.querySelectorAll('.how__node')];
  const steps = [...track.querySelectorAll('.how__step')];
  const state = { p: reduced ? 1 : 0 };
  let len = 0;

  const layout = () => {
    const t = track.getBoundingClientRect();
    const pts = nodes.map((n) => { const r = n.getBoundingClientRect(); return [r.left + r.width / 2 - t.left, r.top + r.height / 2 - t.top]; });
    if (!pts.length || !pts[0][0]) return;
    let d = `M${pts[0][0]},${pts[0][1]}`;
    for (let i = 1; i < pts.length; i++) {
      const [x1, y1] = pts[i - 1], [x2, y2] = pts[i], dx = x2 - x1, b = i % 2 ? -46 : 46;
      d += ` C${x1 + dx * 0.35},${y1 + b} ${x2 - dx * 0.35},${y2 + b} ${x2},${y2}`;
    }
    ghost.setAttribute('d', d);
    draw.setAttribute('d', d);
    len = draw.getTotalLength();
    render();
  };
  const render = () => {
    if (!len) return;
    draw.style.strokeDasharray = len;
    draw.style.strokeDashoffset = len * (1 - state.p);
    const pt = draw.getPointAtLength(len * state.p);
    gsap.set(dot, { x: pt.x, y: pt.y });
  };

  layout();
  ScrollTrigger.addEventListener('refreshInit', layout);
  addEventListener('resize', layout);
  if (reduced) return;

  gsap.set(nodes, { scale: 0 });
  gsap.set(steps.map((s) => [...s.children].slice(1)).flat(), { y: 24, autoAlpha: 0 });

  const tl = gsap.timeline({ paused: true });
  tl.to(state, { p: 1, duration: 2.6, ease: 'power2.inOut', onUpdate: render }, 0);
  steps.forEach((s, i) => {
    const at = (i / (steps.length - 1)) * 2.4;
    tl.to(nodes[i], { scale: 1, duration: 0.6, ease: 'back.out(2.4)' }, at)
      .to([...s.children].slice(1), { y: 0, autoAlpha: 1, duration: 0.7, stagger: 0.08, ease: 'expo.out' }, at + 0.1);
  });
  ScrollTrigger.create({ trigger: track, start: 'top 75%', once: true, onEnter: () => tl.play() });

  // mobile has no line: just reveal the steps as they come in
  if (matchMedia('(max-width: 860px)').matches) {
    tl.kill();
    gsap.set(nodes, { scale: 1 });
    ScrollTrigger.batch(steps, {
      start: 'top 85%', once: true,
      onEnter: (els) => els.forEach((s, k) => gsap.to([...s.children].slice(1), { y: 0, autoAlpha: 1, duration: 0.8, stagger: 0.08, delay: k * 0.12, ease: 'expo.out' })),
    });
  }
}
