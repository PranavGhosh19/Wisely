
import type { MetadataRoute } from 'next';

/**
 * Native Next.js robots.txt generator.
 * Configured to be fully permissive as per user request to ensure maximum search visibility.
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
