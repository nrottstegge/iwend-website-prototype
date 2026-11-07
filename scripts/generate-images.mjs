// Generates the website imagery from scripts/image-briefs.json via the OpenAI Images API.
// The raw photos in content/raw-pictures are only analysed by humans to write the briefs;
// they are never uploaded. Output: optimised WebP in public/images/generated/.
//
//   npm run images                 # all missing images
//   npm run images -- showcase-live --force
//
// Requires OPENAI_API_KEY in .env (see .env.example). Review every result (docs/images.md)
// before committing it.

import { mkdir, readFile, writeFile, access } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import sharp from 'sharp';

const root = join(import.meta.dirname, '..');
const briefs = JSON.parse(await readFile(join(import.meta.dirname, 'image-briefs.json'), 'utf8'));
const args = process.argv.slice(2);
const force = args.includes('--force');
const only = args.filter((a) => !a.startsWith('--'));

const key = process.env.OPENAI_API_KEY;
const model = process.env.OPENAI_IMAGE_MODEL || 'gpt-image-1';
if (!key) {
  console.error('OPENAI_API_KEY fehlt. Bitte in .env eintragen (siehe .env.example).');
  process.exit(1);
}

const exists = (p) => access(p).then(() => true, () => false);

for (const img of briefs.images) {
  if (only.length && !only.includes(img.id)) continue;
  const out = join(root, img.output);
  if (!force && (await exists(out))) {
    console.log(`= ${img.id} (vorhanden, --force zum Überschreiben)`);
    continue;
  }
  console.log(`→ ${img.id} (${model}, ${img.size}) …`);
  const res = await fetch('https://api.openai.com/v1/images/generations', {
    method: 'POST',
    headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ model, prompt: `${img.prompt}\n\n${briefs.style}`, size: img.size, quality: 'high', n: 1 }),
  });
  if (!res.ok) {
    console.error(`✗ ${img.id}: ${res.status} ${await res.text()}`);
    process.exitCode = 1;
    // Authentication or billing problems affect every request – stop early.
    if (res.status === 401 || res.status === 429) break;
    continue;
  }
  const { data } = await res.json();
  const png = Buffer.from(data[0].b64_json, 'base64');

  // Keep the unprocessed master locally (git-ignored) for later re-encoding.
  const master = join(root, 'scripts/.cache', `${img.id}.png`);
  await mkdir(dirname(master), { recursive: true });
  await writeFile(master, png);

  await mkdir(dirname(out), { recursive: true });
  const info = await sharp(png).webp({ quality: 80 }).toFile(out);
  console.log(`✓ ${img.output} (${info.width}×${info.height}, ${Math.round(info.size / 1024)} KB)`);
}
