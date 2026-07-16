import sharp from 'sharp';
import { readFile, writeFile, rename, unlink } from 'node:fs/promises';
import { join } from 'node:path';

const publicDir = join(process.cwd(), 'public');

const iconTargets = [
  'cicil-ico.png',
  'paylater-ico.png',
  'refund-ico.png',
  'kaget-ico.png',
];

async function sizeKb(path) {
  const { size } = await sharp(path).metadata().then(async () => {
    const buf = await readFile(path);
    return { size: buf.length };
  });
  return (size / 1024).toFixed(1);
}

async function compressIcon(filename) {
  const input = join(publicDir, filename);
  const temp = join(publicDir, `.tmp-${filename}`);
  const before = await sizeKb(input);

  await sharp(input)
    .resize(96, 96, { fit: 'inside', withoutEnlargement: true })
    .png({ quality: 80, compressionLevel: 9, palette: true, effort: 10 })
    .toFile(temp);

  await rename(temp, input);
  const after = await sizeKb(input);
  console.log(`${filename}: ${before} KB -> ${after} KB`);
}

async function compressHeadGif() {
  const input = join(publicDir, 'head.gif');
  const webpOut = join(publicDir, 'head.webp');
  const before = await sizeKb(input);

  const meta = await sharp(input, { animated: true }).metadata();
  const pageHeight = meta.pageHeight ?? meta.height ?? 1;
  const frames = meta.pages ?? 1;
  const targetWidth = Math.min(meta.width ?? 480, 400);
  const quality = 82;

  await sharp(input, { animated: true })
    .resize({ width: targetWidth })
    .webp({
      quality,
      effort: 6,
      loop: 0,
    })
    .toFile(webpOut);

  const after = await sizeKb(webpOut);
  console.log(`head.gif -> head.webp: ${before} KB -> ${after} KB (${frames} frames, ${targetWidth}px wide)`);
}

async function main() {
  for (const icon of iconTargets) {
    await compressIcon(icon);
  }
  await compressHeadGif();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
