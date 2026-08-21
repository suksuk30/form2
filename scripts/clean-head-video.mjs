/**
 * Cover top menu row (Isi Saldo / Minta / Kirim / Pesan) in head.mp4.
 * Keeps original dimensions — no crop.
 *
 * Usage: node scripts/clean-head-video.mjs
 */
import { spawnSync } from 'node:child_process';
import { copyFileSync, existsSync, renameSync } from 'node:fs';
import { join } from 'node:path';

let ffmpegPath;
try {
  ffmpegPath = (await import('ffmpeg-static')).default;
} catch {
  console.error('Install ffmpeg-static first: npm install ffmpeg-static --no-save');
  process.exit(1);
}

const publicDir = join(process.cwd(), 'public');
const input = join(publicDir, 'head.mp4');
const output = join(publicDir, 'head.cleaned.mp4');
const backup = join(publicDir, 'head.source.mp4');

/** ~102px of 336px — bar menu atas */
const MASK_HEIGHT = 102;
const MASK_COLOR = '0x1C88E3';

function run(args) {
  const result = spawnSync(ffmpegPath, args, { stdio: 'inherit', shell: true });
  if (result.status !== 0) throw new Error('ffmpeg failed');
}

if (!existsSync(input)) {
  console.error('Missing public/head.mp4');
  process.exit(1);
}

if (!existsSync(backup)) {
  copyFileSync(input, backup);
  console.log('Backup saved: public/head.source.mp4');
}

const source = existsSync(backup) ? backup : input;

console.log('Covering top menu bar in head.mp4...');

run([
  '-y',
  '-i',
  source,
  '-an',
  '-vf',
  `drawbox=x=0:y=0:w=iw:h=${MASK_HEIGHT}:color=${MASK_COLOR}@1:t=fill`,
  '-c:v',
  'libx264',
  '-crf',
  '20',
  '-preset',
  'slow',
  '-movflags',
  '+faststart',
  output,
]);

renameSync(output, input);
console.log('Done. public/head.mp4 updated (original: head.source.mp4)');
