import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Draggable } from 'gsap/Draggable';

/** Chapter 07 — Happy Notes pinned at angles; they drift at different depths and can be dragged around. */
export function notes() {
  const items = gsap.utils.toArray('.note');

  ScrollTrigger.batch(items, {
    start: 'top 90%', once: true,
    onEnter: (els) => gsap.from(els, { y: 120, autoAlpha: 0, rotate: '+=10', duration: 1.2, stagger: 0.1, ease: 'expo.out' }),
  });

  const mm = gsap.matchMedia();
  mm.add('(min-width: 861px) and (pointer: fine)', () => {
    // depth parallax on the CSS `translate` property so it never fights Draggable's transform
    items.forEach((n) => {
      const d = parseFloat(n.dataset.depth || 1);
      gsap.fromTo(n, { '--py': `${d * 90}px` }, {
        '--py': `${d * -90}px`, ease: 'none',
        scrollTrigger: { trigger: '.notes', start: 'top bottom', end: 'bottom top', scrub: true },
      });
      n.style.translate = '0 var(--py, 0)';
    });
    let z = 10;
    const drags = Draggable.create(items, {
      bounds: '.notes__board',
      onPress() { this.target.style.zIndex = ++z; gsap.to(this.target, { scale: 1.06, boxShadow: '0 30px 60px rgba(43,23,18,.28)', duration: 0.25 }); },
      onRelease() { gsap.to(this.target, { scale: 1, boxShadow: '0 18px 40px rgba(43,23,18,.16)', duration: 0.4 }); },
    });
    return () => drags.forEach((d) => d.kill());
  });
}
