import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';

const SOURCE_DIR = '/tmp/kinvia/clientes';
const TARGET_DIR = path.resolve(process.cwd(), 'public/images/cases');

const MAPPINGS = [
  { src: 'sercore1.jpeg', dest: 'sercore-1.webp' },
  { src: 'sercore2.jpeg', dest: 'sercore-2.webp' },
  { src: 'sercore3.jpeg', dest: 'sercore-3.webp' },
  { src: 'rc1.jpeg', dest: 'rc-1.webp' },
  { src: 'rc2.jpeg', dest: 'rc-2.webp' },
  { src: 'rc3.jpeg', dest: 'rc-3.webp' },
  { src: 'capsa1.jpeg', dest: 'capsa-1.webp' },
  { src: 'capsa2.jpeg', dest: 'capsa-2.webp' },
  { src: 'capsa3.jpeg', dest: 'capsa-3.webp' },
  { src: 'iot-gran alacant 1.jpeg', dest: 'iot-gran-alacant-1.webp' },
  { src: 'iot-gran alacant 2.jpeg', dest: 'iot-gran-alacant-2.webp' },
  { src: 'iot-gran alacant 3.jpeg', dest: 'iot-gran-alacant-3.webp' },
  { src: 'iot-punta prima 1.jpeg', dest: 'iot-punta-prima-1.webp' },
  { src: 'iot-punta prima 2.jpeg', dest: 'iot-punta-prima-2.webp' },
  { src: 'iot-punta prima 3.jpeg', dest: 'iot-punta-prima-3.webp' },
];

async function main() {
  if (!fs.existsSync(TARGET_DIR)) {
    fs.mkdirSync(TARGET_DIR, { recursive: true });
  }

  for (const item of MAPPINGS) {
    const inputPath = path.join(SOURCE_DIR, item.src);
    const outputPath = path.join(TARGET_DIR, item.dest);

    if (!fs.existsSync(inputPath)) {
      throw new Error(`Source image not found: ${inputPath}`);
    }

    await sharp(inputPath)
      .resize({ width: 1280, withoutEnlargement: true })
      .webp({ quality: 82, effort: 6 })
      .toFile(outputPath);

    const stat = fs.statSync(outputPath);
    console.log(`✓ ${item.dest} (${Math.round(stat.size / 1024)} KB)`);
  }

  console.log(`Successfully converted all ${MAPPINGS.length} images to WebP in ${TARGET_DIR}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
