
import type { MetadataRoute } from 'next';

/**
 * Native Next.js sitemap generator.
 * Optimized for Dominant SEO: Clustered paths, fixed timestamps, and competitor alternatives.
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
    // CALCULATOR CLUSTER
    {
      url: `${baseUrl}/calculators/split-expense`,
      lastModified: lastMod,
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/calculators/group-expense`,
      lastModified: lastMod,
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/calculators/rent-split`,
      lastModified: lastMod,
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/calculators/dinner-bill-split`,
      lastModified: lastMod,
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    // TRACKER CLUSTER
    {
      url: `${baseUrl}/trackers/trip-expense`,
      lastModified: lastMod,
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/trackers/roommate-expense`,
      lastModified: lastMod,
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/trackers/household-expense`,
      lastModified: lastMod,
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/trackers/shared-manager`,
      lastModified: lastMod,
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    // ALTERNATIVES CLUSTER (Competitor Conquesting)
    {
      url: `${baseUrl}/alternatives/splitwise`,
      lastModified: lastMod,
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/alternatives/splitwise-vs-wisely`,
      lastModified: lastMod,
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    // CORE PRODUCT
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
    {
      url: `${baseUrl}/how-it-works/split-logic`,
      lastModified: lastMod,
      changeFrequency: 'monthly',
      priority: 0.6,
    },
    {
      url: `${baseUrl}/how-it-works/analytics`,
      lastModified: lastMod,
      changeFrequency: 'monthly',
      priority: 0.6,
    },
    {
      url: `${baseUrl}/help-center`,
      lastModified: lastMod,
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    {
      url: `${baseUrl}/terms-of-service`,
      lastModified: lastMod,
      changeFrequency: 'monthly',
      priority: 0.4,
    },
    {
      url: `${baseUrl}/privacy-policy`,
      lastModified: lastMod,
      changeFrequency: 'monthly',
      priority: 0.4,
    },
  ];
}
