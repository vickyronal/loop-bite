import gsap from 'gsap';
import { SplitText } from 'gsap/SplitText';

/** Chapter 04 — the owner's own line, lit word by word as you scroll. */
export function quoteScroll() {
  const split = SplitText.create('.quote__text', { type: 'words', wordsClass: 'word' });
  gsap.fromTo(split.words, { opacity: 0.12, y: 12 }, {
    opacity: 1, y: 0, stagger: 0.1, ease: 'none',
    scrollTrigger: { trigger: '.quote', start: 'top 65%', end: 'bottom 75%', scrub: true },
  });
  gsap.from('.quote__sign', {
    autoAlpha: 0, x: -40, duration: 1.2, ease: 'expo.out',
    scrollTrigger: { trigger: '.quote__sign', start: 'top 90%' },
  });
}
