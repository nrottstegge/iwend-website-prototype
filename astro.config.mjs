import { defineConfig } from 'astro/config';

// GitHub Pages project URL by default; override SITE_URL / BASE_PATH for a custom domain.
const site = process.env.SITE_URL ?? 'https://nrottstegge.github.io';
const base = process.env.BASE_PATH ?? '/iwend-website-prototype';

export default defineConfig({
  site,
  base,
  trailingSlash: 'always',
  i18n: {
    locales: ['de', 'en'],
    defaultLocale: 'de',
    routing: { prefixDefaultLocale: false },
  },
  build: { inlineStylesheets: 'auto' },
  devToolbar: { enabled: false },
});
