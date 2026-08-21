/**
 * Re-encode head.mp4 for sharp mobile display (448px logical, 896px for retina).
 * Requires ffmpeg in PATH.
 *
 * Usage: node scripts/optimize-head-video.mjs
 */
import { spawnSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import { join } from 'node:path';

const publicDir = join(process.cwd(), 'public');
const input = join(publicDir, 'head.mp4');
const output = join(publicDir, 'head.optimized.mp4');
const backup = join(publicDir, 'head.source.mp4');

function runFfmpeg(args) {
  const result = spawnSync('ffmpeg', args, { stdio: 'inherit', shell: true });
  if (result.status !== 0) {
    throw new Error('ffmpeg failed — install ffmpeg and retry.');
  }
}

if (!existsSync(input)) {
  console.error('Missing public/head.mp4');
  process.exit(1);
}

console.log('Optimizing head.mp4 for landing hero (896px wide, no upscale blur)...');

runFfmpeg([
  '-y',
  '-i',
  input,
  '-an',
  '-vf',
  'scale=896:-2:flags=lanczos',
  '-c:v',
  'libx264',
  '-profile:v',
  'high',
  '-pix_fmt',
  'yuv420p',
  '-crf',
  '20',
  '-preset',
  'slow',
  '-movflags',
  '+faststart',
  output,
]);

if (!existsSync(backup)) {
  runFfmpeg(['-y', '-i', input, '-c', 'copy', backup]);
}

runFfmpeg(['-y', '-i', output, '-c', 'copy', input]);

console.log('Done. head.mp4 replaced with optimized version (backup: head.source.mp4)');
