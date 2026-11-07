import { describe, expect, it } from 'vitest';
import { ROUTES, UI, LANGS } from '../src/i18n/ui';
import { activeJobs } from '../src/lib/jobs';


describe('i18n', () => {
  it('defines every route for every language', () => {
    for (const route of Object.values(ROUTES))
      for (const lang of LANGS) expect(route[lang]).toMatch(lang === 'de' ? /^\/(?!en\/)/ : /^\/en\//);
  });

  it('has the same UI keys in both languages', () => {
    const keys = (o: object): string[] =>
      Object.entries(o).flatMap(([k, v]) => (typeof v === 'object' ? keys(v).map((s) => `${k}.${s}`) : [k]));
    expect(keys(UI.en).sort()).toEqual(keys(UI.de).sort());
  });
});

describe('job visibility', () => {
  const now = new Date('2026-06-01');
  const job = (active: boolean, order: number, expires?: string) => ({
    data: { active, order, expires: expires ? new Date(expires) : undefined },
  });

  it('shows only active, unexpired jobs in CMS order', () => {
    const jobs = [job(true, 2), job(false, 1), job(true, 1, '2026-05-01'), job(true, 0, '2026-07-01')];
    expect(activeJobs(jobs, now).map((j) => j.data.order)).toEqual([0, 2]);
  });
});
