/**
 * Compress head.mp4 — same resolution, smaller file (30fps + CRF 24).
 * Requires: npm install ffmpeg-static --no-save
 *
 * Usage: node scripts/compress-head-video.mjs
 */
import { copyFileSync, existsSync, renameSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { spawnSync } from 'node:child_process';

let ffmpegPath;
try {
  ffmpegPath = (await import('ffmpeg-static')).default;
} catch {
  console.error('Install ffmpeg-static first: npm install ffmpeg-static --no-save');
  process.exit(1);
}

const publicDir = join(process.cwd(), 'public');
const input = join(publicDir, 'head.mp4');
const output = join(publicDir, 'head.compressed.mp4');

function run(args) {
  const result = spawnSync(ffmpegPath, args, { stdio: 'inherit', shell: true });
  if (result.status !== 0) throw new Error('ffmpeg failed');
}

if (!existsSync(input)) {
  console.error('Missing public/head.mp4');
  process.exit(1);
}

const beforeKb = (statSync(input).size / 1024).toFixed(1);
console.log(`Compressing head.mp4 (${beforeKb} KB) — keeping 816x336 resolution...`);

run([
  '-y',
  '-i',
  input,
  '-an',
  '-vf',
  'fps=30',
  '-c:v',
  'libx264',
  '-profile:v',
  'high',
  '-pix_fmt',
  'yuv420p',
  '-crf',
  '24',
  '-preset',
  'slow',
  '-movflags',
  '+faststart',
  output,
]);

const afterKb = (statSync(output).size / 1024).toFixed(1);
renameSync(output, input);
console.log(`Done. ${beforeKb} KB → ${afterKb} KB (resolution unchanged)`);
