import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SplitText } from 'gsap/SplitText';
import { COLORS } from '../config.js';

export const isDesktop = () => matchMedia('(min-width: 861px)').matches;

/**
 * One dark family for the whole page. The body colour blends between the two close tones
 * (espresso, cocoa) *with* the scroll as each section arrives, so there is never a sudden switch.
 */
export function themes(instant = false) {
  const map = { cocoa: '#3d2117', espresso: COLORS.espresso };
  const secs = [...document.querySelectorAll('main section[data-theme], footer[data-theme]')];
  const colors = secs.map((s) => map[s.dataset.theme] || COLORS.espresso);
  gsap.set(document.body, { backgroundColor: colors[0] });
  secs.forEach((sec, i) => {
    if (i === 0 || colors[i] === colors[i - 1]) return;
    // pinned sections are wrapped in a pin-spacer whose height covers the whole pinned scroll
    const spacer = sec.parentElement.classList.contains('pin-spacer') ? sec.parentElement : sec;
    gsap.fromTo(document.body, { backgroundColor: colors[i - 1] }, {
      backgroundColor: colors[i], ease: 'none', immediateRender: false,
      scrollTrigger: { trigger: spacer, start: 'top 90%', end: 'top 20%', scrub: instant ? true : 0.6 },
    });
  });
}

/** Section headings: masked line-by-line rise. */
export function headings() {
  document.querySelectorAll('main section:not(.hero) .split-lines').forEach((el) => {
    const split = SplitText.create(el, { type: 'lines', mask: 'lines', linesClass: 'line' });
    gsap.from(split.lines, {
      yPercent: 110,
      duration: 1.2,
      ease: 'expo.out',
      stagger: 0.1,
      scrollTrigger: { trigger: el, start: 'top 82%' },
    });
  });
}
