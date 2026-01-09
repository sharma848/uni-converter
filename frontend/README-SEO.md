# SEO Configuration Guide

## Sitemap and Robots.txt

This project includes automated sitemap and robots.txt generation for production deployments.

### Automatic Generation

The sitemap and robots.txt are automatically generated before each build via the `prebuild` script.

### Manual Generation

To manually generate the sitemap and robots.txt:

```bash
npm run generate:sitemap
```

### Environment Configuration

Set the `VITE_BASE_URL` environment variable to your production domain:

```bash
# .env.production
VITE_BASE_URL=https://yourdomain.com
```

Or set it when running the script:

```bash
VITE_BASE_URL=https://yourdomain.com npm run generate:sitemap
```

### Production Deployment

1. **Set your production domain** in `.env.production`:

    ```
    VITE_BASE_URL=https://yourdomain.com
    ```

2. **Build the project**:

    ```bash
    npm run build
    ```

    This will automatically generate sitemap.xml and robots.txt with the correct URLs.

3. **Verify the files** in `dist/`:

    - `dist/sitemap.xml` - Should contain your production domain
    - `dist/robots.txt` - Should reference your production sitemap URL

4. **Submit to search engines**:
    - Google Search Console: Submit `https://yourdomain.com/sitemap.xml`
    - Bing Webmaster Tools: Submit `https://yourdomain.com/sitemap.xml`

### File Locations

-   **Source files**: `frontend/public/sitemap.xml` and `frontend/public/robots.txt`
-   **Generated files**: Automatically copied to `frontend/dist/` during build
-   **Script**: `frontend/scripts/generate-sitemap.js`

### Validation

Validate your sitemap at:

-   https://www.xml-sitemaps.com/validate-xml-sitemap.html
-   Google Search Console

### Notes

-   The sitemap is automatically updated with the current date on each generation
-   All conversion pages are included with appropriate priorities
-   The robots.txt allows all crawlers and references the sitemap location
