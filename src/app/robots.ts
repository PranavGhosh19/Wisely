
import type { MetadataRoute } from 'next';

/**
 * Native Next.js robots.txt generator.
 * Configured to block auth indexing while allowing all SEO landing pages.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: [
        '/auth',
        '/dashboard', 
        '/transactions', 
        '/groups', 
        '/profile', 
        '/expenses'
      ],
    },
    sitemap: 'https://thewiselyapp.com/sitemap.xml',
  };
}
