import fs from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';
import sharp from 'sharp';

const root = path.resolve(import.meta.dirname, '..');
const [mobileCapture, desktopCapture] = process.argv.slice(2);

if (!mobileCapture || !desktopCapture) {
  throw new Error(
    'Usage: node scripts/encode-j23101-posters.mjs mobile-canvas.png desktop-canvas.png',
  );
}

const outputs = [
  {
    input: mobileCapture,
    output: path.join(root, 'public/molecules/j23101-b-dna-home-v2-320.webp'),
    width: 320,
  },
  {
    input: desktopCapture,
    output: path.join(root, 'public/molecules/j23101-b-dna-home-v2-520.webp'),
    width: 520,
  },
];

for (const { input, output, width } of outputs) {
  await sharp(input)
    .resize({ width })
    .webp({ quality: 84, alphaQuality: 90, effort: 6 })
    .toFile(output);
  const metadata = await sharp(output).metadata();
  const stats = await fs.stat(output);
  process.stdout.write(
    `${path.relative(root, output)}: ${metadata.width}×${metadata.height}, ${stats.size} bytes\n`,
  );
}
