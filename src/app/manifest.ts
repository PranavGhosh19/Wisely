
import type { MetadataRoute } from 'next'
import data from './lib/placeholder-images.json'

export default function manifest(): MetadataRoute.Manifest {
  // Use the wallet icon from the source of truth
  const appIconUrl = data.placeholderImages.find(img => img.id === "app-icon")?.imageUrl || '/wallet.png';

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
        src: appIconUrl,
        sizes: '192x192',
        type: 'image/png',
      },
      {
        src: appIconUrl,
        sizes: '512x512',
        type: 'image/png',
      },
      {
        src: appIconUrl,
        sizes: '512x512',
        type: 'image/png',
        purpose: 'maskable',
      },
    ],
  }
}
