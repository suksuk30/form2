import sharp from 'sharp';
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';

const publicDir = join(process.cwd(), 'public');

async function sizeKb(path) {
  const buf = await readFile(path);
  return (buf.length / 1024).toFixed(1);
}

async function pngToWebp(inputName, outputName, width) {
  const input = join(publicDir, inputName);
  const output = join(publicDir, outputName);
  const before = await sizeKb(input);

  await sharp(input)
    .resize({ width, withoutEnlargement: true })
    .webp({ quality: 82, effort: 6 })
    .toFile(output);

  const after = await sizeKb(output);
  console.log(`${inputName} -> ${outputName}: ${before} KB -> ${after} KB`);
}

async function gifToWebp(inputName, outputName, width) {
  const input = join(publicDir, inputName);
  const output = join(publicDir, outputName);
  const before = await sizeKb(input);

  await sharp(input, { animated: true })
    .resize({ width, withoutEnlargement: true })
    .webp({ quality: 80, effort: 6, loop: 0 })
    .toFile(output);

  const after = await sizeKb(output);
  console.log(`${inputName} -> ${outputName}: ${before} KB -> ${after} KB`);
}

async function main() {
  await pngToWebp('ban1.png', 'ban1.webp', 400);
  await pngToWebp('ban2.png', 'ban2.webp', 400);
  await pngToWebp('ban3.png', 'ban3.webp', 400);
  await pngToWebp('paylater.png', 'paylater.webp', 400);
  await gifToWebp('notif.gif', 'notif.webp', 200);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
