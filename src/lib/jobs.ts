type JobLike = { data: { active: boolean; order: number; expires?: Date } };

/** Jobs that are active and not expired, in CMS order. */
export const activeJobs = <T extends JobLike>(jobs: T[], now = new Date()) =>
  jobs
    .filter((j) => j.data.active && (!j.data.expires || j.data.expires >= now))
    .sort((a, b) => a.data.order - b.data.order);
