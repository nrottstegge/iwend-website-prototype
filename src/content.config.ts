import { defineCollection } from 'astro:content';
import { file, glob } from 'astro/loaders';
import { z } from 'astro/zod';

// Content is edited via Sveltia CMS (public/admin/config.yml). Keep both files in sync.
// Translated JSON files hold one object per language: { "de": {...}, "en": {...} }.

const image = z.string().optional().default('');
const bilingual = <T extends z.ZodType>(schema: T) => z.object({ de: schema, en: schema });
const idFromFile = ({ entry }: { entry: string }) => entry.replace(/\.(md|json)$/, '');

const site = defineCollection({
  loader: file('src/content/settings/site.json'),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    noindex: z.boolean().default(true),
    company: z.string(),
    street: z.string(),
    zip: z.string(),
    city: z.string(),
    country: z.string(),
    contactName: z.string(),
    contactRole: z.string(),
    email: z.string(),
    phone: z.string(),
  }),
});

const home = defineCollection({
  loader: file('src/content/pages/home.json'),
  schema: z.object({
    seoTitle: z.string(),
    seoDescription: z.string(),
    hero: z.object({
      kicker: z.string(),
      headline: z.string(),
      text: z.string(),
      ctaPrimary: z.string(),
      ctaSecondary: z.string(),
      image,
    }),
    showcases: z.object({
      kicker: z.string(),
      title: z.string(),
      items: z.array(
        z.object({
          label: z.string(),
          title: z.string(),
          text: z.string(),
          tags: z.array(z.string()).default([]),
          image,
          imageAlt: z.string().default(''),
        }),
      ),
    }),
    services: z.object({ title: z.string(), items: z.array(z.string()) }),
    clients: z.object({ kicker: z.string(), title: z.string(), text: z.string() }),
    team: z.object({
      kicker: z.string(),
      title: z.string(),
      text: z.string(),
      leadsTitle: z.string(),
      leadsText: z.string(),
    }),
    contact: z.object({
      kicker: z.string(),
      title: z.string(),
      subtitle: z.string(),
      text: z.string(),
      cta: z.string(),
      productionTypes: z.array(z.string()),
      services: z.array(z.string()),
    }),
    careers: z.object({ kicker: z.string(), title: z.string(), text: z.string(), cta: z.string(), image }),
  }),
});

const careers = defineCollection({
  loader: file('src/content/pages/careers.json'),
  schema: z.object({
    seoTitle: z.string(),
    seoDescription: z.string(),
    intro: z.object({ kicker: z.string(), title: z.string(), text: z.string(), image }),
    about: z.object({ title: z.string(), text: z.string() }),
    requirements: z.object({ title: z.string(), text: z.string() }),
    activities: z.object({
      title: z.string(),
      note: z.string(),
      items: z.array(z.object({ title: z.string(), text: z.string() })),
    }),
    openings: z.object({ text: z.string() }),
    glossary: z.object({
      title: z.string(),
      text: z.string(),
      items: z.array(z.object({ term: z.string(), text: z.string() })),
    }),
    cables: z.object({ title: z.string(), items: z.array(z.object({ name: z.string(), text: z.string(), image })) }),
    safety: z.object({ title: z.string(), items: z.array(z.string()) }),
    process: z.object({ title: z.string(), steps: z.array(z.object({ title: z.string(), text: z.string() })) }),
    cta: z.object({ title: z.string(), text: z.string(), button: z.string(), email: z.string() }),
  }),
});

const clients = defineCollection({
  loader: glob({ pattern: '*.json', base: 'src/content/clients', generateId: idFromFile }),
  schema: z.object({
    name: z.string().default(''),
    logo: z.string(),
    city: z.string().default(''),
    lat: z.number().optional(),
    lon: z.number().optional(),
    background: z.enum(['light', 'dark']).default('light'),
    visible: z.boolean().default(true),
    order: z.number().default(100),
  }),
});

const team = defineCollection({
  loader: glob({ pattern: '*.json', base: 'src/content/team', generateId: idFromFile }),
  schema: bilingual(
    z.object({
      name: z.string(),
      role: z.string(),
      text: z.string().default(''),
      group: z.enum(['management', 'leads']),
      portrait: image,
      visible: z.boolean().default(true),
      order: z.number().default(100),
    }),
  ),
});

// Markdown collections use one file per language: <slug>.de.md / <slug>.en.md
const jobs = defineCollection({
  loader: glob({ pattern: '*.md', base: 'src/content/jobs', generateId: idFromFile }),
  schema: z.object({
    title: z.string(),
    location: z.string(),
    employment: z.string(),
    active: z.boolean().default(false),
    contactEmail: z.string().default(''),
    order: z.number().default(100),
    expires: z.coerce.date().optional(),
  }),
});

const legal = defineCollection({
  loader: glob({ pattern: '*.md', base: 'src/content/legal', generateId: idFromFile }),
  schema: z.object({ title: z.string(), description: z.string().default('') }),
});

export const collections = { site, home, careers, clients, team, jobs, legal };
