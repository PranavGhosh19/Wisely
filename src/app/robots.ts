
import type { MetadataRoute } from 'next';

/**
 * Native Next.js robots.txt generator.
 * This file automatically serves a robots.txt at /robots.txt.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: [
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
