import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

/** Chapter 05 — a stacked deck fans out from the centre; hover lifts a card; click pre-fills the order form. */
export function occasions({ scrollToEl }) {
  const cards = gsap.utils.toArray('.occ');

  cards.forEach((card) => card.addEventListener('click', () => {
    document.dispatchEvent(new CustomEvent('occasion', { detail: card.dataset.occasion }));
    scrollToEl('#order');
  }));

  const mm = gsap.matchMedia();
  mm.add('(min-width: 861px)', () => {
    const mid = (cards.length - 1) / 2;
    const w = () => cards[0].offsetWidth;
    const fan = (i) => ({
      x: (i - mid) * w() * 1.08,
      y: Math.abs(i - mid) * 26,
      rotate: (i - mid) * 5,
    });

    gsap.set(cards, { xPercent: -50, yPercent: -50 });
    gsap.timeline({
      scrollTrigger: { trigger: '.deck', start: 'top 85%', end: 'center 52%', scrub: 1, invalidateOnRefresh: true },
    })
      .fromTo(cards,
        { x: 0, y: 140, rotate: (i) => [-7, 4, -2, 6, -4][i % 5], autoAlpha: 0 },
        { x: (i) => fan(i).x, y: (i) => fan(i).y, rotate: (i) => fan(i).rotate, autoAlpha: 1, ease: 'power3.out', stagger: { each: 0.08, from: 'center' } });

    const enter = (e) => {
      const i = cards.indexOf(e.currentTarget);
      gsap.to(e.currentTarget, { y: fan(i).y - 34, rotate: 0, scale: 1.06, zIndex: 10, duration: 0.5, ease: 'power3.out' });
    };
    const leave = (e) => {
      const i = cards.indexOf(e.currentTarget);
      gsap.to(e.currentTarget, { y: fan(i).y, rotate: fan(i).rotate, scale: 1, zIndex: 1, duration: 0.6, ease: 'power3.out' });
    };
    cards.forEach((c) => { c.addEventListener('pointerenter', enter); c.addEventListener('pointerleave', leave); });
    return () => cards.forEach((c) => { c.removeEventListener('pointerenter', enter); c.removeEventListener('pointerleave', leave); });
  });

  mm.add('(max-width: 860px)', () => {
    ScrollTrigger.batch(cards, {
      start: 'top 90%', once: true,
      onEnter: (els) => gsap.from(els, { y: 60, rotate: 4, autoAlpha: 0, stagger: 0.1, duration: 1, ease: 'expo.out' }),
    });
  });
}
