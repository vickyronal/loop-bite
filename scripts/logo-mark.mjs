// Makes public/logo-mark.png: the logo artwork (wordmark + icon) on a transparent background,
// by un-mixing each pixel from the logo's brown background. Used by the intro animation.
import sharp from 'sharp';
const { data, info } = await sharp('public/logo.png').removeAlpha().raw().toBuffer({ resolveWithObject: true });
const bg = [data[0], data[1], data[2]];
const cream = [243, 227, 195];
const full = Math.hypot(cream[0] - bg[0], cream[1] - bg[1], cream[2] - bg[2]);
const out = Buffer.alloc(info.width * info.height * 4);
for (let p = 0, q = 0; p < data.length; p += 3, q += 4) {
  const d = Math.hypot(data[p] - bg[0], data[p + 1] - bg[1], data[p + 2] - bg[2]);
  const a = Math.min(1, d / (full * 0.92));
  for (let k = 0; k < 3; k++) out[q + k] = a > 0.02 ? Math.max(0, Math.min(255, Math.round((data[p + k] - bg[k] * (1 - a)) / a))) : 0;
  out[q + 3] = Math.round(a * 255);
}
await sharp(out, { raw: { width: info.width, height: info.height, channels: 4 } }).png().toFile('public/logo-mark.png');
console.log('bg', bg, '→ public/logo-mark.png', info.width, info.height);

// tight crop of the artwork (same box the intro uses) for the nav
await sharp('public/logo-mark.png').extract({ left: 140, top: 128, width: 575, height: 417 }).png().toFile('public/logo-nav.png');
console.log('→ public/logo-nav.png 575x417');
