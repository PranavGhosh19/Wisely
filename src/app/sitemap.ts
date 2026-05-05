
import type { MetadataRoute } from 'next';

export const dynamic = 'force-static';

/**
 * Native Next.js sitemap generator.
 * Optimized for Dominant SEO with static export force enabled.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://thewiselyapp.com';
  const lastMod = new Date('2026-04-01');
  
  return [
    {
      url: baseUrl,
      lastModified: lastMod,
      changeFrequency: 'weekly',
      priority: 1,
    },
    {
      url: `${baseUrl}/calculators`,
      lastModified: lastMod,
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/trackers`,
      lastModified: lastMod,
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/alternatives`,
      lastModified: lastMod,
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/features`,
      lastModified: lastMod,
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/compare`,
      lastModified: lastMod,
      changeFrequency: 'weekly',
      priority: 0.7,
    },
  ];
}
