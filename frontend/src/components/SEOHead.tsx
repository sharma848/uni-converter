import { useEffect } from 'react';

interface SEOHeadProps {
  title: string;
  description: string;
  canonicalUrl?: string;
  faqSchema?: any;
}

export function SEOHead({ title, description, canonicalUrl, faqSchema }: SEOHeadProps) {
  useEffect(() => {
    // Update document title
    document.title = title;

    // Update or create meta description
    let metaDescription = document.querySelector('meta[name="description"]');
    if (!metaDescription) {
      metaDescription = document.createElement('meta');
      metaDescription.setAttribute('name', 'description');
      document.head.appendChild(metaDescription);
    }
    metaDescription.setAttribute('content', description);

    // Update or create Open Graph tags
    let ogTitle = document.querySelector('meta[property="og:title"]');
    if (!ogTitle) {
      ogTitle = document.createElement('meta');
      ogTitle.setAttribute('property', 'og:title');
      document.head.appendChild(ogTitle);
    }
    ogTitle.setAttribute('content', title);

    let ogDescription = document.querySelector('meta[property="og:description"]');
    if (!ogDescription) {
      ogDescription = document.createElement('meta');
      ogDescription.setAttribute('property', 'og:description');
      document.head.appendChild(ogDescription);
    }
    ogDescription.setAttribute('content', description);

    // Update or create canonical link
    let canonicalLink = document.querySelector('link[rel="canonical"]');
    if (canonicalUrl) {
      if (!canonicalLink) {
        canonicalLink = document.createElement('link');
        canonicalLink.setAttribute('rel', 'canonical');
        document.head.appendChild(canonicalLink);
      }
      canonicalLink.setAttribute('href', canonicalUrl);
    }

    // Add FAQ schema
    if (faqSchema) {
      // Remove existing FAQ schema if any
      const existingSchema = document.querySelector('script[type="application/ld+json"][data-faq-schema]');
      if (existingSchema) {
        existingSchema.remove();
      }
      
      const schemaScript = document.createElement('script');
      schemaScript.setAttribute('type', 'application/ld+json');
      schemaScript.setAttribute('data-faq-schema', 'true');
      schemaScript.textContent = JSON.stringify(faqSchema, null, 2);
      document.head.appendChild(schemaScript);
    }
  }, [title, description, canonicalUrl, faqSchema]);

  return null;
}
