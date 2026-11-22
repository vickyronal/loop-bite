// Removes photo backgrounds locally (no upload) to make hero cut-outs for the pitch.
// Usage: node scripts/cutout.mjs name1 name2 ...   (names from public/images, without .webp)
import { removeBackground } from '@imgly/background-removal-node';
import sharp from 'sharp';
import { mkdir } from 'node:fs/promises';
import path from 'node:path';

const names = process.argv.slice(2);
const out = path.resolve('public/cutouts');
await mkdir(out, { recursive: true });

for (const name of names) {
  // the model wants PNG/JPEG; upscale 2x first so edges come out smoother
  const png = await sharp(path.resolve('public/images', `${name}.webp`))
    .resize({ width: 1060, kernel: 'lanczos3' })
    .png()
    .toBuffer();
  const blob = await removeBackground(new Blob([png], { type: 'image/png' }), { output: { format: 'image/png' } });
  const buf = Buffer.from(await blob.arrayBuffer());
  await sharp(buf).trim().webp({ quality: 88, alphaQuality: 90 }).toFile(path.join(out, `${name}.webp`));
  console.log('✓', name);
}
