import { Metadata } from 'next'
import { getReadyMotors } from '@/actions/public'
import { getBrands } from '@/actions/brand'
import MotorsClient from './MotorsClient'

// ✅ SEO METADATA
export const metadata: Metadata = {
  title: 'Katalog Motor Bekas Berkualitas | MotoSell Premium Showroom',
  description: 'Temukan motor bekas berkualitas dengan harga terbaik. Honda, Yamaha, Suzuki, Kawasaki. Kondisi terjamin, surat-surat lengkap, garansi resmi showroom.',
  keywords: 'motor bekas, jual motor, motor second, honda bekas, yamaha bekas, showroom motor',
  openGraph: {
    type: 'website',
    locale: 'id_ID',
    url: 'https://motosell.vercel.app/motors',
    siteName: 'MotoSell Premium Showroom',
    title: 'Katalog Motor Bekas Berkualitas | MotoSell',
    description: 'Temukan motor bekas berkualitas dengan harga terbaik.',
    images: [{ url: '/og-image.jpg', width: 1200, height: 630, alt: 'MotoSell' }],
  },
  alternates: { canonical: 'https://motosell.vercel.app/motors' },
}

// ✅ SERVER COMPONENT - Hanya fetch data dan pass ke Client Component
export default async function PublicKatalogPage() {
  const [motors, brands] = await Promise.all([
    getReadyMotors(),
    getBrands()
  ])

  // ✅ Structured Data untuk Google
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: 'Katalog Motor Bekas MotoSell',
    numberOfItems: motors.length,
    itemListElement: motors.map((motor: any, index: number) => ({
      '@type': 'ListItem',
      position: index + 1,
      item: {
        '@type': 'Product',
        name: `${motor.brands?.name} ${motor.model}`,
        brand: { '@type': 'Brand', name: motor.brands?.name },
        offers: {
          '@type': 'Offer',
          price: motor.price,
          priceCurrency: 'IDR',
          availability: 'https://schema.org/InStock',
          url: `https://motosell.vercel.app/motors/${motor.slug}`,
        },
      },
    })),
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      {/* ✅ HANYA render Client Component, TIDAK ADA UI LAIN di sini */}
      <MotorsClient motors={motors} brands={brands} />
    </>
  )
}