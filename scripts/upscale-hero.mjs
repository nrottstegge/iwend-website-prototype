// Re-renders the approved hero (scripts/.cache/hero-stadium-v2-source.png) at 2560×1600 via the
// OpenAI edit endpoint, keeping its content. Usage: node --env-file=.env scripts/upscale-hero.mjs
import { readFile } from 'node:fs/promises';
import sharp from 'sharp';
import { join } from 'node:path';
const root = join(import.meta.dirname, '..');
const form = new FormData();
form.append('image', new Blob([await readFile(`${root}/scripts/.cache/hero-stadium-v2-source.png`)], { type: 'image/png' }), 'hero.png');
form.append('model', process.env.OPENAI_IMAGE_MODEL || 'gpt-image-1');
form.append('prompt', 'Recreate this exact photograph at higher resolution: identical composition, stadium, roof structure, camera operator, lighting and colours. Add crisp, realistic fine detail (seats, roof truss, grass texture, camera). Do not add or remove anything, no text, no logos.');
form.append('size', '2560x1600');
form.append('quality', 'high');
const res = await fetch('https://api.openai.com/v1/images/edits', { method: 'POST', headers: { Authorization: `Bearer ${process.env.OPENAI_API_KEY}` }, body: form });
if (!res.ok) { console.error(res.status, await res.text()); process.exit(1); }
const png = Buffer.from((await res.json()).data[0].b64_json, 'base64');
await sharp(png).toFile(`${root}/scripts/.cache/hero-stadium.png`);
const info = await sharp(png).webp({ quality: 84 }).toFile(`${root}/public/images/generated/hero-stadium.webp`);
console.log('hero', info.width, info.height, Math.round(info.size / 1024) + 'KB');
