// Upscales the colour-graded crew photo (scripts/.cache/crew-graded.png, see docs/images.md) via the
// OpenAI edit endpoint. Usage: node --env-file=.env scripts/upscale-crew.mjs – review faces and logos!
import { readFile } from 'node:fs/promises';
import sharp from 'sharp';
const form = new FormData();
form.append('image', new Blob([await readFile('scripts/.cache/crew-graded.png')], { type: 'image/png' }), 'crew.png');
form.append('model', process.env.OPENAI_IMAGE_MODEL || 'gpt-image-1');
form.append('prompt', 'Upscale and restore this exact group photograph at higher resolution. Keep every person exactly as they are: identical faces, facial features, expressions, hair, glasses, beards, body poses, clothing, lanyards and positions. Keep the background wall, carpet, framing and colours identical. Only remove noise and compression artefacts and add natural, crisp photographic detail. Do not beautify, do not change identities, do not add or remove anything. The small red lettering on the shirts is the company logo and must read exactly "iwend" (lowercase, preceded by a small elephant symbol) – reproduce it exactly as in the input, never change its letters. Keep the colour grading of the input exactly (neutral, not pink).');
form.append('size', '2560x1440');
form.append('quality', 'high');
const res = await fetch('https://api.openai.com/v1/images/edits', { method: 'POST', headers: { Authorization: `Bearer ${process.env.OPENAI_API_KEY}` }, body: form });
if (!res.ok) { console.error(res.status, await res.text()); process.exit(1); }
const png = Buffer.from((await res.json()).data[0].b64_json, 'base64');
await sharp(png).toFile('scripts/.cache/crew-upscaled-2.png');
console.log('ok', (await sharp(png).metadata()).width);
