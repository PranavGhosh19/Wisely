
import type { MetadataRoute } from 'next';

/**
 * Native Next.js robots.txt generator.
 * Configured to allow clustered SEO paths and competitor alternatives.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: [
        '/',
        '/calculators/',
        '/trackers/',
        '/alternatives/'
      ],
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
