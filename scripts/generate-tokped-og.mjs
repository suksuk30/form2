import sharp from 'sharp';

const width = 1200;
const height = 630;
const logoSize = 220;
const logoLeft = Math.floor((width - logoSize) / 2);

const logo = await sharp('public/tokped/tokped2.jpg')
  .resize(logoSize, logoSize, { fit: 'contain', background: { r: 255, g: 255, b: 255, alpha: 1 } })
  .toBuffer();

const svgText = [
  `<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">`,
  '  <style>',
  '    .paylater { fill: #00aa5b; font-size: 52px; font-weight: 700; font-family: Arial, Helvetica, sans-serif; }',
  '    .care { fill: #111111; font-size: 40px; font-weight: 600; font-family: Arial, Helvetica, sans-serif; }',
  '  </style>',
  '  <text x="600" y="420" text-anchor="middle" class="paylater">Tokopedia Paylater</text>',
  '  <text x="600" y="480" text-anchor="middle" class="care">Tokopedia Care</text>',
  '</svg>',
].join('\n');

await sharp({
  create: {
    width,
    height,
    channels: 4,
    background: { r: 255, g: 255, b: 255, alpha: 1 },
  },
})
  .composite([
    { input: logo, top: 90, left: logoLeft },
    { input: Buffer.from(svgText), top: 0, left: 0 },
  ])
  .jpeg({ quality: 92 })
  .toFile('public/tokped/tokped-og.jpg');

console.log('Created public/tokped/tokped-og.jpg');
