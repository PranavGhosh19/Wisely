import type { MetadataRoute } from 'next';

export const dynamic = 'force-static';

/**
 * robots.txt generator.
 * Configured to be fully permissive with static export force enabled.
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
