/**
 * Generate sitemap.xml for production
 * Run this script before building: npm run generate:sitemap
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const BASE_URL = process.env.VITE_BASE_URL || 'https://uniconvert.app';
const TODAY = new Date().toISOString().split('T')[0];

const sitemapUrls = [
  {
    loc: '/',
    lastmod: TODAY,
    changefreq: 'weekly',
    priority: 1.0,
  },
  {
    loc: '/image-to-pdf',
    lastmod: TODAY,
    changefreq: 'weekly',
    priority: 0.9,
  },
  {
    loc: '/jpg-to-pdf',
    lastmod: TODAY,
    changefreq: 'weekly',
    priority: 0.9,
  },
  {
    loc: '/png-to-pdf',
    lastmod: TODAY,
    changefreq: 'weekly',
    priority: 0.9,
  },
];

function generateSitemap() {
  const urls = sitemapUrls.map(url => {
    const loc = `${BASE_URL}${url.loc}`;
    return `  <url>
    <loc>${loc}</loc>
    <lastmod>${url.lastmod}</lastmod>
    <changefreq>${url.changefreq}</changefreq>
    <priority>${url.priority}</priority>
  </url>`;
  }).join('\n');

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
        xsi:schemaLocation="http://www.sitemaps.org/schemas/sitemap/0.9
        http://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd">
${urls}
</urlset>`;

  const publicDir = path.join(__dirname, '../public');
  const sitemapPath = path.join(publicDir, 'sitemap.xml');
  
  fs.writeFileSync(sitemapPath, sitemap, 'utf8');
  console.log(`✅ Sitemap generated at ${sitemapPath}`);
  console.log(`   Base URL: ${BASE_URL}`);
  console.log(`   URLs: ${sitemapUrls.length}`);
}

function generateRobots() {
  const robots = `User-agent: *
Allow: /

# Sitemap
Sitemap: ${BASE_URL}/sitemap.xml
`;

  const publicDir = path.join(__dirname, '../public');
  const robotsPath = path.join(publicDir, 'robots.txt');
  
  fs.writeFileSync(robotsPath, robots, 'utf8');
  console.log(`✅ Robots.txt generated at ${robotsPath}`);
  console.log(`   Sitemap URL: ${BASE_URL}/sitemap.xml`);
}

// Generate both files
generateSitemap();
generateRobots();

