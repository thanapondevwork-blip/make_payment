import type { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'ระบบชำระหนี้',
    short_name: 'ชำระหนี้',
    description: 'ระบบตรวจสอบสลิปและชำระหนี้ 56,000 บาท',
    start_url: '/payment',
    display: 'standalone',
    background_color: '#0f172a',
    theme_color: '#7c3aed',
    orientation: 'portrait',
    icons: [
      {
        src: '/icons/iconAndroid.png',
        sizes: '192x192',
        type: 'image/png',
      },
      {
        src: '/icons/iconAndroid (splash screen).png',
        sizes: '512x512',
        type: 'image/png',
      },
    ],
  }
}
