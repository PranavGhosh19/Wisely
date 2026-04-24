
import type { MetadataRoute } from 'next';

/**
 * robots.txt generator.
 * Configured to be fully permissive to ensure maximum search visibility.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
    },
    sitemap: 'https://thewiselyapp.com/sitemap.xml',
  };
}
