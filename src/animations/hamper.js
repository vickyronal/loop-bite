import gsap from 'gsap';

/** Chapter 06 — scroll unties the twine, lifts the lid and the treats rise out one by one. */
export function hamperScroll() {
  const items = gsap.utils.toArray('.box__item');
  const spots = [
    { x: -0.42, y: -0.82, r: -12 },
    { x: 0.02, y: -1.0, r: 3 },
    { x: 0.44, y: -0.78, r: 12 },
    { x: -0.2, y: -0.46, r: -5 },
    { x: 0.3, y: -0.52, r: -6 }, // the note: its own clear spot, in front
  ];
  const size = () => document.querySelector('.box').offsetWidth;

  const mm = gsap.matchMedia();
  mm.add({ desktop: '(min-width: 861px)', mobile: '(max-width: 860px)' }, (ctx) => {
    const { desktop } = ctx.conditions;
    const tl = gsap.timeline({
      defaults: { ease: 'power2.inOut' },
      scrollTrigger: desktop
        ? { trigger: '.hamper', start: 'top top', end: '+=190%', pin: true, scrub: 1, invalidateOnRefresh: true, anticipatePin: 1 }
        : { trigger: '.box-stage', start: 'top 75%', end: 'bottom 45%', scrub: 1, invalidateOnRefresh: true },
    });

    tl.from('.hamper__copy > *', { y: 40, autoAlpha: 0, stagger: 0.08, duration: 0.5, ease: 'power3.out' }, 0)
      .from('.box', { y: 80, rotateX: 18, autoAlpha: 0, duration: 0.6, ease: 'power3.out' }, 0)
      .to('.box__twine--h', { scaleX: 0, duration: 0.4 }, 0.6)
      .to('.box__twine--v', { scaleY: 0, duration: 0.4 }, 0.7)
      .to('.box__lid', { y: () => -size() * 0.5, rotate: -5, duration: 0.6, ease: 'power3.out' }, 1.0)
      // the lid goes down beside the box, behind the treats, so nothing (like the note) is hidden
      .set('.box__lid', { zIndex: 1 }, 1.55)
      .to('.box__lid', { y: () => size() * 0.2, x: () => size() * 0.62, rotate: 14, duration: 0.7, ease: 'power2.inOut' }, 1.55);

    items.forEach((it, i) => {
      const p = spots[i % spots.length];
      tl.fromTo(it,
        { y: 0, x: 0, rotate: 0, scale: 0.8 },
        { y: () => p.y * size(), x: () => p.x * size(), rotate: p.r, scale: 1, duration: 0.8, ease: 'back.out(1.4)' },
        1.3 + i * 0.16);
    });
  });
}
