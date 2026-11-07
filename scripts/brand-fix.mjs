// Replaces the AI-invented clothing print with the authentic iwend logo, using the logo as second
// reference image. Usage: node --env-file=.env scripts/brand-fix.mjs showcase-interview [more ids]
import { readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import sharp from 'sharp';

const root = join(import.meta.dirname, '..');
const prompt =
  'Edit the first image only where the red company print appears on the crew clothing: replace every elephant symbol and wordmark with the exact logo from the second image – the red calligraphic line-drawn elephant (made of flowing brush-like curves, not a cartoon) followed by the lowercase wordmark "iwend". Match its exact shapes and proportions, printed in red on the black fabric with the correct perspective, folds and lighting. Keep everything else in the first image pixel-identical: people, poses, equipment, background, colours, composition.';

for (const id of process.argv.slice(2)) {
  const form = new FormData();
  const src = await sharp(join(root, 'scripts/.cache', `${id}.png`)).png().toBuffer();
  form.append('image[]', new Blob([src], { type: 'image/png' }), `${id}.png`);
  form.append('image[]', new Blob([await readFile(join(root, 'scripts/.cache/logo-ref.png'))], { type: 'image/png' }), 'logo.png');
  form.append('model', process.env.OPENAI_IMAGE_MODEL || 'gpt-image-1');
  form.append('prompt', prompt);
  form.append('size', '1536x1024');
  form.append('quality', 'high');
  const res = await fetch('https://api.openai.com/v1/images/edits', { method: 'POST', headers: { Authorization: `Bearer ${process.env.OPENAI_API_KEY}` }, body: form });
  if (!res.ok) { console.error(id, res.status, await res.text()); continue; }
  const png = Buffer.from((await res.json()).data[0].b64_json, 'base64');
  await writeFile(join(root, 'scripts/.cache', `${id}-brand.png`), png);
  console.log('✓', id);
}
