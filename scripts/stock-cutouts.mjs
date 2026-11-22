// Hero cut-outs from free Unsplash photos (Unsplash License) — placeholders until Deepa's own shoot.
// Needs the background-removal tool, which is NOT a project dependency (it breaks cloud installs).
// Install it locally only when you need it: npm i --no-save @imgly/background-removal-node
// Usage: node scripts/stock-cutouts.mjs <dir-with-downloaded-jpgs>
// Sources (photo pages):
//   brownie  https://unsplash.com/photos/a-stack-of-brownies-sitting-on-top-of-a-table-s4tMJAcixLY
//   cookie   https://unsplash.com/photos/a-stack-of-cookies-next-to-a-bottle-of-milk-xZEthm6YX7g
//   cupcake  https://unsplash.com/photos/chocolate-cupcakes-JHMG8eWbTfs
//   cake     https://unsplash.com/photos/chocolate-cake-with-chocolate-syrup-E8DznhhRm3k
//   tub      https://unsplash.com/photos/two-glasses-filled-with-chocolate-pudding-on-top-of-a-wooden-table-tQJrHa43aFs
import { removeBackground } from '@imgly/background-removal-node';
import sharp from 'sharp';
import { mkdir } from 'node:fs/promises';
import path from 'node:path';

const src = process.argv[2];
// crop boxes as fractions of the image: [left, top, width, height]
const jobs = [
  ['brownie', 's4tMJAcixLY.jpg', [0.18, 0.24, 0.72, 0.56]],
  ['cookie', 'xZEthm6YX7g.jpg', [0.45, 0.3, 0.44, 0.58]],
  ['cupcake', 'JHMG8eWbTfs.jpg', [0.33, 0.2, 0.34, 0.75]],
  ['cake', 'E8DznhhRm3k.jpg', [0.17, 0.0, 0.74, 0.95]],
  ['tub', 'tQJrHa43aFs.jpg', [0.46, 0.36, 0.5, 0.64]],
];
const out = path.resolve('public/cutouts');
await mkdir(out, { recursive: true });

for (const [name, file, [l, t, w, h]] of jobs) {
  const img = sharp(path.join(src, file));
  const { width, height } = await img.metadata();
  const region = { left: Math.round(l * width), top: Math.round(t * height), width: Math.round(w * width), height: Math.round(h * height) };
  const png = await sharp(path.join(src, file)).extract(region).png().toBuffer();
  const blob = await removeBackground(new Blob([png], { type: 'image/png' }), { output: { format: 'image/png' } });
  const buf = Buffer.from(await blob.arrayBuffer());
  await sharp(buf).trim().resize({ width: 1100, height: 1100, fit: 'inside', withoutEnlargement: true }).webp({ quality: 90, alphaQuality: 95 }).toFile(path.join(out, `${name}.webp`));
  console.log('✓', name, region);
}
