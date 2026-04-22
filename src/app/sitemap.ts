
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
    // CLUSTER INDEX PAGES
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
    // CALCULATOR CLUSTER
    {
      url: `${baseUrl}/calculators/split-expense-calculator`,
      lastModified: lastMod,
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/calculators/group-expense-calculator`,
      lastModified: lastMod,
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/calculators/rent-split-calculator`,
      lastModified: lastMod,
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/calculators/dinner-bill-split-calculator`,
      lastModified: lastMod,
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    // TRACKER CLUSTER
    {
      url: `${baseUrl}/trackers/trip-expense-tracker`,
      lastModified: lastMod,
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/trackers/roommate-expense-tracker`,
      lastModified: lastMod,
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/trackers/household-expense-tracker`,
      lastModified: lastMod,
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/trackers/shared-expense-manager`,
      lastModified: lastMod,
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    // ALTERNATIVES CLUSTER
    {
      url: `${baseUrl}/alternatives/splitwise-alternative`,
      lastModified: lastMod,
      changeFrequency: 'weekly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/alternatives/splitwise-vs-wisely`,
      lastModified: lastMod,
      changeFrequency: 'weekly',
      priority: 0.7,
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
