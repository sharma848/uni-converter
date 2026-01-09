/**
 * Sitemap generator utility
 * Generates sitemap.xml dynamically based on available routes
 */

export interface SitemapUrl {
  loc: string;
  lastmod?: string;
  changefreq?: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never';
  priority?: number;
}

export const sitemapUrls: SitemapUrl[] = [
  {
    loc: '/',
    lastmod: new Date().toISOString().split('T')[0],
    changefreq: 'weekly',
    priority: 1.0,
  },
  {
    loc: '/image-to-pdf',
    lastmod: new Date().toISOString().split('T')[0],
    changefreq: 'weekly',
    priority: 0.9,
  },
  {
    loc: '/jpg-to-pdf',
    lastmod: new Date().toISOString().split('T')[0],
    changefreq: 'weekly',
    priority: 0.9,
  },
  {
    loc: '/png-to-pdf',
    lastmod: new Date().toISOString().split('T')[0],
    changefreq: 'weekly',
    priority: 0.9,
  },
];

/**
 * Generate sitemap.xml content
 */
export function generateSitemap(baseUrl: string = 'https://uniconvert.app'): string {
  const urls = sitemapUrls.map(url => {
    const loc = `${baseUrl}${url.loc}`;
    const lastmod = url.lastmod || new Date().toISOString().split('T')[0];
    const changefreq = url.changefreq || 'weekly';
    const priority = url.priority !== undefined ? url.priority : 0.8;

    return `  <url>
    <loc>${loc}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>
  </url>`;
  }).join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
        xsi:schemaLocation="http://www.sitemaps.org/schemas/sitemap/0.9
        http://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd">
${urls}
</urlset>`;
}

