import gsap from 'gsap';

/**
 * Logo intro — builds the Loop Bite mark piece by piece:
 * the gold dot drops and bounces, the ∞ frosting draws out of it, the cupcake base rises,
 * then "Loop" and "Bite" rise in. On exit the whole logo flies into the nav logo
 * while the scalloped curtain lifts away.
 */
export function runPreloader(fontsReady) {
  const el = document.querySelector('.preloader');
  if (!el) return Promise.resolve();
  const q = (s) => el.querySelector(s);
  const logo = q('.preloader__logo');
  const inf = q('.pl-inf');
  const len = inf.getTotalLength();
  const num = q('.pl-num');
  const counter = { v: 0 };

  gsap.set(inf, { strokeDasharray: len, strokeDashoffset: len });
  gsap.set(q('.pl-cup'), { scaleY: 0, transformOrigin: '50% 100%' });
  gsap.set(q('.pl-dot'), { y: -220, opacity: 0 });
  // each word sits fully below its own mask, then rises into place
  gsap.set(q('.pl-clip--loop .pl-in'), { yPercent: 37 });
  gsap.set(q('.pl-clip--bite .pl-in'), { yPercent: 30 });

  return new Promise((resolve) => {
    const intro = gsap.timeline({ defaults: { ease: 'expo.out' } });
    // the icon is born big in the centre of the screen, then glides to its place beside "Bite"
    gsap.set(q('.pl-mark'), { x: -207, y: -105.5, scale: 1.7, svgOrigin: '634.5 442' });
    intro
      .to(q('.pl-dot'), { y: 0, opacity: 1, duration: 0.9, ease: 'bounce.out' }, 0.15)
      .to(inf, { strokeDashoffset: 0, duration: 1.0, ease: 'power2.inOut' }, 0.8)
      .to(q('.pl-cup'), { scaleY: 1, duration: 0.8, ease: 'back.out(2)' }, 1.2)
      .to(q('.pl-dot'), { scale: 1.35, transformOrigin: '50% 50%', duration: 0.25, yoyo: true, repeat: 1, ease: 'power2.out' }, 1.55)
      // home: the mark settles into the logo while the words rise in around it
      .to(q('.pl-mark'), { x: 0, y: 0, scale: 1, duration: 1.15, ease: 'expo.inOut' }, 1.95)
      .to(q('.pl-clip--loop .pl-in'), { yPercent: 0, duration: 1.1 }, 2.3)
      .to(q('.pl-clip--bite .pl-in'), { yPercent: 0, duration: 1.1 }, 2.42)
      .to(counter, { v: 100, duration: 3.4, ease: 'power1.inOut', onUpdate: () => (num.textContent = Math.round(counter.v)) }, 0);

    Promise.all([fontsReady, new Promise((r) => intro.eventCallback('onComplete', r))]).then(() => {
      // fly the logo into the nav logo's spot (FLIP)
      const from = logo.getBoundingClientRect();
      const target = document.querySelector('.nav__logo img')?.getBoundingClientRect();
      const out = gsap.timeline({ onComplete: () => { el.remove(); resolve(); } });
      out.to(q('.preloader__foot'), { autoAlpha: 0, y: 10, duration: 0.4, ease: 'power2.in' }, 0);
      if (target) {
        const s = target.height / from.height;
        out.to(logo, {
          x: target.left - from.left + (target.width - from.width * s) / 2,
          y: target.top - from.top,
          scale: s, duration: 1.1, ease: 'expo.inOut',
        }, 0.1).to(logo, { autoAlpha: 0, duration: 0.25 }, 1.05);
      } else {
        out.to(logo, { autoAlpha: 0, scale: 0.9, duration: 0.6 }, 0.1);
      }
      out.to(q('.preloader__curtain'), { yPercent: -102, duration: 1.2, ease: 'expo.inOut' }, 0.35);
      // let the hero start revealing while the curtain is still moving
      gsap.delayedCall(0.75, resolve);
    });
  });
}
