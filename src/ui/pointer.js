import gsap from 'gsap';

const fine = () => matchMedia('(hover: hover) and (pointer: fine)').matches;

/** Gold-dot cursor (the dot from the logo) that grows with a label over interactive things. */
export function cursor() {
  const el = document.querySelector('.cursor');
  if (!el || !fine()) return;
  const label = el.querySelector('.cursor__label');
  const x = gsap.quickTo(el, 'x', { duration: 0.35, ease: 'power3' });
  const y = gsap.quickTo(el, 'y', { duration: 0.35, ease: 'power3' });
  let shown = false;

  addEventListener('pointermove', (e) => {
    x(e.clientX); y(e.clientY);
    if (!shown) { shown = true; gsap.to(el, { opacity: 1, duration: 0.3 }); }
  }, { passive: true });

  document.addEventListener('pointerover', (e) => {
    const t = e.target.closest('[data-cursor], .bake, .note');
    if (!t) return;
    label.textContent = t.dataset.cursor || (t.classList.contains('note') ? 'Drag' : 'Yum');
    el.classList.add('is-active');
  });
  document.addEventListener('pointerout', (e) => {
    const t = e.target.closest('[data-cursor], .bake, .note');
    if (t && !t.contains(e.relatedTarget)) el.classList.remove('is-active');
  });
}

/** Buttons lean towards the pointer. */
export function magnetic() {
  if (!fine()) return;
  document.querySelectorAll('.magnetic').forEach((btn) => {
    const x = gsap.quickTo(btn, 'x', { duration: 0.5, ease: 'elastic.out(1, 0.4)' });
    const y = gsap.quickTo(btn, 'y', { duration: 0.5, ease: 'elastic.out(1, 0.4)' });
    btn.addEventListener('pointermove', (e) => {
      const r = btn.getBoundingClientRect();
      x((e.clientX - r.left - r.width / 2) * 0.3);
      y((e.clientY - r.top - r.height / 2) * 0.35);
    });
    btn.addEventListener('pointerleave', () => { x(0); y(0); });
  });
}
