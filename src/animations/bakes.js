import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

/** Chapter 03 — vertical scroll drives a horizontal, asymmetric gallery (desktop); staggered reveals (mobile). */
export function bakesScroll() {
  const mm = gsap.matchMedia();

  mm.add('(min-width: 861px)', () => {
    const track = document.querySelector('.bakes__track');
    const dist = () => track.scrollWidth - innerWidth;

    const move = gsap.to(track, {
      x: () => -dist(),
      ease: 'none',
      scrollTrigger: {
        trigger: '.bakes', start: 'top top', end: () => '+=' + dist(),
        pin: true, scrub: 1, invalidateOnRefresh: true, anticipatePin: 1,
      },
    });

    gsap.to('.bakes__intro', {
      autoAlpha: 0, x: -80, ease: 'none',
      scrollTrigger: { trigger: '.bakes', start: 'top top', end: () => '+=' + innerWidth * 0.45, scrub: true },
    });

    gsap.utils.toArray('.bake').forEach((card) => {
      const fig = card.querySelector('.bake__img');
      const img = fig.querySelector('img');
      const speed = parseFloat(card.dataset.speed || 1);

      gsap.fromTo(fig, { clipPath: 'inset(100% 0% 0% 0%)' }, {
        clipPath: 'inset(0% 0% 0% 0%)', ease: 'power2.out',
        scrollTrigger: { trigger: card, containerAnimation: move, start: 'left 95%', end: 'left 55%', scrub: true },
      });
      gsap.fromTo(img, { scale: 1.35, xPercent: 8 }, {
        scale: 1.05, xPercent: -8, ease: 'none',
        scrollTrigger: { trigger: card, containerAnimation: move, start: 'left right', end: 'right left', scrub: true },
      });
      // each card floats at its own speed — asymmetric depth
      gsap.fromTo(card, { y: (1 - speed) * 220 }, {
        y: (speed - 1) * 220, ease: 'none',
        scrollTrigger: { trigger: card, containerAnimation: move, start: 'left right', end: 'right left', scrub: true },
      });
      gsap.from(card.querySelector('.bake__meta').children, {
        y: 24, autoAlpha: 0, stagger: 0.07, duration: 0.8, ease: 'power3.out',
        scrollTrigger: { trigger: card, containerAnimation: move, start: 'left 70%' },
      });
    });
  });

  mm.add('(max-width: 860px)', () => {
    ScrollTrigger.batch('.bake', {
      start: 'top 88%',
      onEnter: (els) => gsap.from(els, { y: 60, autoAlpha: 0, duration: 1, stagger: 0.12, ease: 'expo.out' }),
      once: true,
    });
  });
}
