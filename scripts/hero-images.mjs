// Prepares the hero cut-outs from the transparent PNGs in Images/.
// Clears faint stray pixels (alpha < 70), trims, and saves 1100px WebP files to public/cutouts/.
// Usage: node scripts/hero-images.mjs
import sharp from 'sharp';
import path from 'node:path';

const jobs = {
  brownie: 'png-chocolate-dessert-brownie-food.png',
  cookie: 'chocolate-chip-cookie-isolated.png',
  cupcake: 'chocolate-chip-muffin-closeup-image-bakery-advertisement.png',
  cake: 'delicious-caramel-cake-slice-layers-chocolate-caramel.png',
  tub: 'delicious-layered-chocolate-dessert-cup.png',
};

for (const [name, file] of Object.entries(jobs)) {
  const { data, info } = await sharp(path.join('Images', file)).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  for (let i = 3; i < data.length; i += 4) if (data[i] < 70) data[i] = 0;
  // crop to the main shape: ignore rows/columns with only a few stray pixels (e.g. a thin line)
  const { width: W, height: H } = info, cols = new Array(W).fill(0), rows = new Array(H).fill(0);
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) if (data[(y * W + x) * 4 + 3]) { cols[x]++; rows[y]++; }
  const min = 24, span = (a) => [a.findIndex((v) => v > min), a.length - 1 - [...a].reverse().findIndex((v) => v > min)];
  const [x0, x1] = span(cols), [y0, y1] = span(rows);
  // clear anything outside that box, then cut to it
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) if (x < x0 || x > x1 || y < y0 || y > y1) data[(y * W + x) * 4 + 3] = 0;
  const cleaned = await sharp(data, { raw: info }).extract({ left: x0, top: y0, width: x1 - x0 + 1, height: y1 - y0 + 1 }).png().toBuffer();
  await sharp(cleaned).resize({ width: 1100, height: 1100, fit: 'inside', withoutEnlargement: true })
    .webp({ quality: 90, alphaQuality: 95 }).toFile(path.join('public/cutouts', `${name}.webp`));
  const m = await sharp(path.join('public/cutouts', `${name}.webp`)).metadata();
  console.log('✓', name, `${m.width}x${m.height}`);
}
