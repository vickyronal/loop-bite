// Crops product tiles out of the Instagram profile screenshots for the pitch mockup.
// Usage: node scripts/crop-images.mjs <screenshots-dir>
// Coordinates are in the 2380px "display" space of the screenshots; scaled to the 2940px originals.
import sharp from 'sharp';
import { mkdir, copyFile } from 'node:fs/promises';
import path from 'node:path';

const src = process.argv[2];
if (!src) throw new Error('Pass the screenshots directory');
const out = path.resolve('public/images');
await mkdir(out, { recursive: true });

const S = 2940 / 2380;
// [file, name, tileX, tileY, opts]  full tiles: crop below the multi-post icon
const tiles = [
  ['2.png', 'brownie-tub', 750, 268],
  ['2.png', 'cake-nuts', 1190, 268],
  ['2.png', 'cake-bars', 1630, 268],
  ['2.png', 'brownie-cups', 750, 855],
  ['2.png', 'cookie-flowers', 1630, 855, { h: 470 }],
  ['3.png', 'crackle', 750, 196, { top: 252, h: 426 }],
  ['3.png', 'cupcakes-rose', 1190, 196, { top: 252, h: 426 }],
  ['3.png', 'kinder-tub', 1630, 196, { top: 252, h: 426 }],
  ['3.png', 'name-brownie', 750, 682],
  ['3.png', 'note-tub', 1190, 682],
  ['3.png', 'swirl-brownie', 1630, 682],
  ['4.png', 'cookie-tub', 750, 270],
  ['4.png', 'gift-tub', 1190, 270],
  ['4.png', 'bday-brownie', 1630, 270],
  ['4.png', 'muffins-hand', 750, 857],
  ['4.png', 'brownie-box', 1190, 857],
  ['4.png', 'brownie-bowl', 1630, 857, { h: 470 }],
  ['5.png', 'momtobe', 750, 312],
  ['5.png', 'cookies-box', 1190, 312],
  ['5.png', 'lotus-brownie', 1630, 312],
  ['5.png', 'gluten-free', 750, 899],
  ['5.png', 'biscuits', 1190, 899],
  ['5.png', 'anniversary', 1630, 899, { h: 430 }],
  ['6.png', 'muffin-big', 750, 230, { top: 290, h: 515 }],
  ['6.png', 'bday-chips', 1190, 230, { top: 290, h: 515 }],
  ['6.png', 'redvelvet', 1630, 230, { top: 290, h: 515 }],
  ['6.png', 'strawberry-box', 750, 813],
  ['6.png', 'cookie-cake', 1190, 813],
  ['6.png', 'strawberry-cake', 1630, 813],
  ['7.png', 'hamper-box', 310, 959],
  ['7.png', 'anniv-quad', 750, 959],
  ['7.png', 'muffin-box', 1630, 372],
];

for (const [file, name, x, y, o = {}] of tiles) {
  const top = o.top ?? y + 56;
  const h = o.h ?? 525;
  const region = {
    left: Math.round((x + 4) * S),
    top: Math.round(top * S),
    width: Math.round(428 * S),
    height: Math.round(h * S),
  };
  await sharp(path.join(src, file)).extract(region).webp({ quality: 82 }).toFile(path.join(out, `${name}.webp`));
  console.log('✓', name, region);
}

await copyFile(path.join(src, '8.png'), path.resolve('public/logo.png'));
const { data } = await sharp(path.join(src, '8.png')).raw().toBuffer({ resolveWithObject: true });
console.log('logo bg rgb', data[0], data[1], data[2]);
