
import type { MetadataRoute } from 'next';

/**
 * Native Next.js sitemap generator.
 * This file automatically serves an XML sitemap at /sitemap.xml.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://thewiselyapp.com';
  
  return [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 1,
    },
    {
      url: `${baseUrl}/auth`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
  ];
}
