/**
 * slugify — converts a heading string into a URL-safe ID.
 *
 * Designed to match the output of `rehype-slug`, which uses `github-slugger`
 * internally. Compatible with the IDs added to MDX headings at build time.
 *
 * Examples:
 *   slugify('Why lab-proven autonomy fails')  → 'why-lab-proven-autonomy-fails'
 *   slugify('[SLAM] on real surfaces')         → 'slam-on-real-surfaces'
 */
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[\[\]]/g, '') // strip [BRACKETED] markers
    .replace(/[^\w\s-]/g, '') // remove non-word chars (keeps letters, digits, spaces, hyphens)
    .trim()
    .replace(/\s+/g, '-') // spaces → hyphens
    .replace(/-+/g, '-'); // collapse consecutive hyphens
}
