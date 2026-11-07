// Generates the website imagery via the OpenAI Images API, driven by scripts/image-briefs.json.
//
// Scenes ("images"): new, fictional photos from text briefs. The raw photos in content/raw-pictures
//   were only analysed by humans to write the briefs; they are never uploaded.
// Team portraits ("portraits"): the person's own photo from content/ansprechpartner (git-ignored) is
//   sent as reference to the edit endpoint to create uniform studio headshots of the same person.
//
//   npm run images                          # everything that is missing
//   npm run images -- portrait-pia-rottstegge --force
//
// Requires OPENAI_API_KEY in .env (see .env.example). Review every result (docs/images.md)
// before committing it.

import { mkdir, readFile, writeFile, access } from 'node:fs/promises';
import { basename, dirname, extname, join } from 'node:path';
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
const auth = { Authorization: `Bearer ${key}` };

function generate(prompt, size) {
  return fetch('https://api.openai.com/v1/images/generations', {
    method: 'POST',
    headers: { ...auth, 'Content-Type': 'application/json' },
    body: JSON.stringify({ model, prompt, size, quality: 'high', n: 1 }),
  });
}

async function edit(prompt, size, inputPath, fidelity = true) {
  const form = new FormData();
  const type = extname(inputPath).toLowerCase() === '.png' ? 'image/png' : 'image/jpeg';
  form.append('image', new Blob([await readFile(inputPath)], { type }), basename(inputPath));
  form.append('model', model);
  form.append('prompt', prompt);
  form.append('size', size);
  form.append('quality', 'high');
  if (fidelity) form.append('input_fidelity', 'high');
  const res = await fetch('https://api.openai.com/v1/images/edits', { method: 'POST', headers: auth, body: form });
  // Not every model supports input_fidelity – retry once without it.
  if (res.status === 400 && fidelity && (await res.clone().text()).includes('input_fidelity')) {
    return edit(prompt, size, inputPath, false);
  }
  return res;
}

const jobs = [
  ...briefs.images.map((b) => ({ ...b, run: () => generate(`${b.prompt}\n\n${briefs.style}`, b.size) })),
  ...briefs.connectors.map((b) => ({ ...b, run: () => generate(`${b.prompt}\n\n${briefs.connectorStyle}`, b.size) })),
  ...briefs.portraits.map((b) => ({
    ...b,
    run: () => edit([briefs.portraitStyle, b.note].filter(Boolean).join(' '), b.size, join(root, b.input)),
  })),
];

for (const job of jobs) {
  if (only.length && !only.includes(job.id)) continue;
  const out = join(root, job.output);
  if (!force && (await exists(out))) {
    console.log(`= ${job.id} (vorhanden, --force zum Überschreiben)`);
    continue;
  }
  if (job.input && !(await exists(join(root, job.input)))) {
    console.error(`✗ ${job.id}: Referenzbild fehlt (${job.input})`);
    process.exitCode = 1;
    continue;
  }
  console.log(`→ ${job.id} (${model}, ${job.size}) …`);
  const res = await job.run();
  if (!res.ok) {
    console.error(`✗ ${job.id}: ${res.status} ${await res.text()}`);
    process.exitCode = 1;
    // Authentication or billing problems affect every request – stop early.
    if (res.status === 401 || res.status === 429) break;
    continue;
  }
  const { data } = await res.json();
  const png = Buffer.from(data[0].b64_json, 'base64');

  // Keep the unprocessed master locally (git-ignored) for later re-encoding.
  const master = join(root, 'scripts/.cache', `${job.id}.png`);
  await mkdir(dirname(master), { recursive: true });
  await writeFile(master, png);

  await mkdir(dirname(out), { recursive: true });
  let img = sharp(png);
  if (job.resize) img = img.resize(job.resize[0], job.resize[1], { fit: 'cover', position: 'north' });
  const info = await img.webp({ quality: 82 }).toFile(out);
  console.log(`✓ ${job.output} (${info.width}×${info.height}, ${Math.round(info.size / 1024)} KB)`);
}
