import { Metadata } from 'next'
import { getReadyMotors } from '@/actions/public'
import { getBrands } from '@/actions/brand'
import MotorsClient from './MotorsClient'

// ✅ SEO METADATA
export const metadata: Metadata = {
  title: 'Katalog Motor Bekas Berkualitas | MotoSell Premium Showroom',
  description: 'Temukan motor bekas berkualitas dengan harga terbaik. Honda, Yamaha, Suzuki, Kawasaki. Kondisi terjamin, surat-surat lengkap, garansi resmi showroom.',
  keywords: 'motor bekas, jual motor, motor second, honda bekas, yamaha bekas, showroom motor, motor murah, motor berkualitas',
  authors: [{ name: 'MotoSell' }],
  creator: 'MotoSell Premium Showroom',
  publisher: 'MotoSell',
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    type: 'website',
    locale: 'id_ID',
    url: 'https://motosell.vercel.app/motors',
    siteName: 'MotoSell Premium Showroom',
    title: 'Katalog Motor Bekas Berkualitas | MotoSell',
    description: 'Temukan motor bekas berkualitas dengan harga terbaik. Kondisi terjamin, surat-surat lengkap.',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'MotoSell Premium Showroom',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Katalog Motor Bekas Berkualitas | MotoSell',
    description: 'Temukan motor bekas berkualitas dengan harga terbaik.',
    images: ['/og-image.jpg'],
  },
  alternates: {
    canonical: 'https://motosell.vercel.app/motors',
  },
}

// ✅ SERVER COMPONENT - Fetch data untuk SEO
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
    description: 'Daftar motor bekas berkualitas dengan harga terbaik',
    numberOfItems: motors.length,
    itemListElement: motors.map((motor: any, index: number) => ({
      '@type': 'ListItem',
      position: index + 1,
      item: {
        '@type': 'Product',
        name: `${motor.brands?.name} ${motor.model}`,
        description: `Jual ${motor.brands?.name} ${motor.model} tahun ${motor.year}, kondisi ${motor.condition}, jarak tempuh ${motor.mileage.toLocaleString('id-ID')} km`,
        brand: {
          '@type': 'Brand',
          name: motor.brands?.name,
        },
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
      {/* ✅ Pass data ke Client Component yang handle tema */}
      <MotorsClient motors={motors} brands={brands} />
    </>
  )
}