import type { MetadataRoute } from 'next'

export const dynamic = 'force-static';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Wisely',
    short_name: 'Wisely',
    description: 'Master your money, personal or shared.',
    start_url: '/',
    display: 'standalone',
    background_color: '#07161B',
    theme_color: '#3D737F',
    icons: [
      {
        src: 'https://placehold.co/192x192/3D737F/FFFFFF?text=W',
        sizes: '192x192',
        type: 'image/png',
      },
      {
        src: 'https://placehold.co/512x512/3D737F/FFFFFF?text=W',
        sizes: '512x512',
        type: 'image/png',
      },
      {
        src: 'https://placehold.co/512x512/3D737F/FFFFFF?text=W',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'maskable',
      },
    ],
  }
}
