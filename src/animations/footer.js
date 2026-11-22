import gsap from 'gsap';

/**
 * Footer — the ∞ draws once more and the gold dot keeps looping it (the ending becomes the beginning),
 * the closing question rises, and the logo lockup builds itself letter by letter.
 * Letters lift gently towards the pointer.
 */
export function footerScroll({ scrollToEl } = {}) {
  const path = document.querySelector('.footer__loop path');
  const dot = document.querySelector('.footer__dot');
  const len = path.getTotalLength();
  gsap.set(path, { strokeDasharray: len, strokeDashoffset: len });

  document.querySelector('.footer__year').textContent = new Date().getFullYear();
  document.querySelector('.footer__totop').addEventListener('click', () => scrollToEl?.(0));

  // split the wordmark into letters
  document.querySelectorAll('.footer__word').forEach((w) => {
    w.innerHTML = [...w.textContent].map((c) => `<span class="fch">${c}</span>`).join('');
  });
  const chars = gsap.utils.toArray('.footer__mark .fch');
  const icon = document.querySelector('.footer__icon');
  const inf = icon.querySelector('.fi-inf');
  const infLen = document.getElementById('inf-path').getTotalLength();
  gsap.set(inf, { strokeDasharray: infLen, strokeDashoffset: infLen });
  gsap.set(icon.querySelector('.fi-cup'), { scaleY: 0, transformOrigin: '50% 100%' });
  gsap.set(icon.querySelector('.fi-dot'), { y: -120, opacity: 0 });

  const ride = { t: 0 };
  const orbit = gsap.to(ride, {
    t: 1, duration: 4.5, ease: 'none', repeat: -1, paused: true,
    onUpdate: () => {
      const p = path.getPointAtLength(ride.t * len);
      dot.setAttribute('cx', p.x);
      dot.setAttribute('cy', p.y);
    },
  });

  gsap.timeline({ scrollTrigger: { trigger: '.footer', start: 'top 70%' } })
    .to(path, { strokeDashoffset: 0, duration: 1.8, ease: 'power2.inOut', onComplete: () => { gsap.to(dot, { opacity: 1, duration: 0.4 }); orbit.play(); } })
    .from('.footer__line, .footer__ask, .footer__actions > *', { y: 30, autoAlpha: 0, duration: 1, stagger: 0.1, ease: 'expo.out' }, 0.3);

  // logo lockup builds when it scrolls into view
  gsap.timeline({ scrollTrigger: { trigger: '.footer__mark', start: 'top 85%' } })
    .from(chars, { yPercent: 70, autoAlpha: 0, rotation: (i) => (i % 2 ? 6 : -6), duration: 1.1, stagger: 0.05, ease: 'expo.out' }, 0)
    .to(icon.querySelector('.fi-cup'), { scaleY: 1, duration: 0.7, ease: 'back.out(2)' }, 0.45)
    .to(inf, { strokeDashoffset: 0, duration: 0.9, ease: 'power2.inOut' }, 0.6)
    .to(icon.querySelector('.fi-dot'), { y: 0, opacity: 1, duration: 0.8, ease: 'bounce.out' }, 1.1)
    .from('.footer__grid > *, .footer__base', { y: 20, autoAlpha: 0, duration: 0.8, stagger: 0.07, ease: 'power3.out' }, 0.5);

  // letters lift a little towards the pointer
  if (matchMedia('(hover: hover)').matches) {
    const mark = document.querySelector('.footer__mark');
    const lifts = chars.map((c) => gsap.quickTo(c, 'y', { duration: 0.6, ease: 'power3' }));
    mark.addEventListener('pointermove', (e) => {
      chars.forEach((c, i) => {
        const r = c.getBoundingClientRect();
        const d = Math.abs(e.clientX - (r.left + r.width / 2));
        lifts[i](-Math.max(0, 1 - d / 260) * r.height * 0.12);
      });
    });
    mark.addEventListener('pointerleave', () => lifts.forEach((l) => l(0)));
  }
}
