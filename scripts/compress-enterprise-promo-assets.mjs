import sharp from 'sharp';
import { readFile, unlink, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

const publicDir = join(process.cwd(), 'public', 'enterprise');
const MAX_WIDTH = 560;
const MAX_HEIGHT = 400;

const targets = [
  { input: 'grab-sehat.jpeg', output: 'grab-sehat.webp' },
  { input: 'grab-mart.jpg', output: 'grab-mart.webp' },
  { input: 'grab-food.jpg', output: 'grab-food.webp' },
];

async function sizeKb(path) {
  const buf = await readFile(path);
  return (buf.length / 1024).toFixed(1);
}

async function compressPromoAsset({ input, output }) {
  const inputPath = join(publicDir, input);
  const outputPath = join(publicDir, output);
  const before = await sizeKb(inputPath);

  const buffer = await sharp(inputPath)
    .resize(MAX_WIDTH, MAX_HEIGHT, { fit: 'inside', withoutEnlargement: true })
    .webp({ quality: 80, effort: 6 })
    .toBuffer();

  await writeFile(outputPath, buffer);
  const after = (buffer.length / 1024).toFixed(1);

  try {
    await unlink(inputPath);
  } catch {
    console.warn(`Could not remove ${input} (file may be in use).`);
  }

  console.log(`${input} -> ${output}: ${before} KB -> ${after} KB`);
}

async function main() {
  for (const target of targets) {
    await compressPromoAsset(target);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
