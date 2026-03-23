
import type { MetadataRoute } from 'next'
 
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Wisely Expense Tracker',
    short_name: 'Wisely',
    description: 'Master your money, personal or shared.',
    start_url: '/',
    display: 'standalone',
    background_color: '#F8F9FC',
    theme_color: '#432E8C',
    icons: [
      {
        src: 'https://picsum.photos/seed/wisely192/192/192',
        sizes: '192x192',
        type: 'image/png',
      },
      {
        src: 'https://picsum.photos/seed/wisely512/512/512',
        sizes: '512x512',
        type: 'image/png',
      },
    ],
  }
}
