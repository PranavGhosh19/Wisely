import type { MetadataRoute } from 'next'
 
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Wisely Expense Tracker',
    short_name: 'Wisely',
    description: 'Master your money, personal or shared.',
    start_url: '/',
    display: 'standalone',
    background_color: '#07161B',
    theme_color: '#3D737F',
    icons: [
      {
        src: 'https://picsum.photos/seed/wisely-app-icon/192/192',
        sizes: '192x192',
        type: 'image/png',
      },
      {
        src: 'https://picsum.photos/seed/wisely-app-icon/512/512',
        sizes: '512x512',
        type: 'image/png',
      },
      {
        src: 'https://picsum.photos/seed/wisely-app-icon/512/512',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'maskable',
      },
    ],
  }
}
