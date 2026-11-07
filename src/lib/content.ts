import { getCollection, getEntry } from 'astro:content';
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import type { Lang } from '../i18n/ui';
import { activeJobs } from './jobs';

const must = <T>(value: T | undefined, what: string): T => {
  if (!value) throw new Error(`Missing content: ${what}`);
  return value;
};

export const getSite = async (lang: Lang) => must(await getEntry('site', lang), `site/${lang}`).data;
export const getHome = async (lang: Lang) => must(await getEntry('home', lang), `home/${lang}`).data;
export const getCareers = async (lang: Lang) => must(await getEntry('careers', lang), `careers/${lang}`).data;

export async function getClients() {
  return (await getCollection('clients', (c) => c.data.visible))
    .map((c) => ({ id: c.id, ...c.data }))
    .sort((a, b) => a.order - b.order);
}

export async function getTeam(lang: Lang) {
  return (await getCollection('team'))
    .map((m) => ({ id: m.id, ...m.data.de, ...m.data[lang] }))
    .filter((m) => m.visible)
    .sort((a, b) => a.order - b.order);
}

export const langOf = (id: string) => id.split('.').pop() as Lang;

export async function getJobs(lang: Lang) {
  return activeJobs(await getCollection('jobs', (j) => langOf(j.id) === lang));
}

export async function getLegal(slug: 'imprint' | 'privacy', lang: Lang) {
  return must(await getEntry('legal', `${slug}.${lang}`), `legal/${slug}.${lang}`);
}

/** True if a CMS image path points to an existing file in public/. Missing images render as placeholders. */
export const hasImage = (path?: string) => !!path && existsSync(join(process.cwd(), 'public', path));
