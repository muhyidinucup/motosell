import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getMotorDetailBySlug } from '@/actions/public'
import { getStoreSettings } from '@/actions/settings'
import MotorDetailClient from './MotorDetailClient' // ✅ PERBAIKAN: Import MotorDetailClient, BUKAN MotorsClient

interface PageProps {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  try {
    const motor = await getMotorDetailBySlug(slug)
    if (!motor) {
      return { title: 'Motor Tidak Ditemukan | MotoSell', description: 'Unit motor yang Anda cari tidak ditemukan atau sudah terjual.' }
    }
    const primaryImage = motor.motor_images?.find((img: any) => img.is_primary)?.image_url || motor.motor_images?.[0]?.image_url || '/placeholder.png'
    const title = `Jual ${motor.brands?.name} ${motor.model} ${motor.year} - Rp ${Number(motor.price).toLocaleString('id-ID')} | MotoSell`
    const description = `Jual ${motor.brands?.name} ${motor.model} tahun ${motor.year}. Kondisi ${motor.condition}, jarak tempuh ${Number(motor.mileage).toLocaleString('id-ID')} km, transmisi ${motor.transmission}. Harga Rp ${Number(motor.price).toLocaleString('id-ID')}. Garansi resmi showroom MotoSell.`

    return {
      title,
      description,
      keywords: `${motor.brands?.name} bekas, ${motor.model} bekas, jual ${motor.brands?.name} ${motor.year}, motor second ${motor.brands?.name}, ${motor.model} ${motor.year} harga`,
      authors: [{ name: 'MotoSell' }],
      creator: 'MotoSell Premium Showroom',
      publisher: 'MotoSell',
      robots: { index: true, follow: true, googleBot: { index: true, follow: true, 'max-video-preview': -1, 'max-image-preview': 'large', 'max-snippet': -1 } },
      openGraph: {
        type: 'website', locale: 'id_ID', url: `https://motosell.vercel.app/motors/${slug}`, siteName: 'MotoSell Premium Showroom',
        title, description,
        images: [{ url: primaryImage, width: 1200, height: 630, alt: `${motor.brands?.name} ${motor.model} ${motor.year}` }],
      },
      twitter: { card: 'summary_large_image', title, description, images: [primaryImage] },
      alternates: { canonical: `https://motosell.vercel.app/motors/${slug}` },
    }
  } catch (error) {
    return { title: 'Motor Tidak Ditemukan | MotoSell', description: 'Unit motor yang Anda cari tidak ditemukan atau sudah terjual.' }
  }
}

export default async function MotorDetailPage({ params }: PageProps) {
  const { slug } = await params
  const [motor, storeConfig] = await Promise.all([
    getMotorDetailBySlug(slug),
    getStoreSettings()
  ])

  if (!motor || motor.status !== 'ready') {
    notFound()
  }

  const primaryImage = motor.motor_images?.find((img: any) => img.is_primary)?.image_url || motor.motor_images?.[0]?.image_url || '/placeholder.png'

  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: `${motor.brands?.name} ${motor.model}`,
    description: motor.description || `Jual ${motor.brands?.name} ${motor.model} tahun ${motor.year}, kondisi ${motor.condition}`,
    sku: motor.motor_code,
    image: motor.motor_images?.map((img: any) => img.image_url) || [primaryImage],
    brand: { '@type': 'Brand', name: motor.brands?.name },
    offers: {
      '@type': 'Offer',
      url: `https://motosell.vercel.app/motors/${slug}`,
      priceCurrency: 'IDR',
      price: motor.price,
      availability: 'https://schema.org/InStock',
      itemCondition: 'https://schema.org/UsedCondition',
      seller: { '@type': 'AutoDealer', name: 'MotoSell Premium Showroom' },
    },
    additionalProperty: [
      { '@type': 'PropertyValue', name: 'Tahun', value: motor.year },
      { '@type': 'PropertyValue', name: 'Jarak Tempuh', value: `${motor.mileage} km` },
      { '@type': 'PropertyValue', name: 'Transmisi', value: motor.transmission },
      { '@type': 'PropertyValue', name: 'Warna', value: motor.color },
      { '@type': 'PropertyValue', name: 'Kondisi', value: motor.condition },
    ],
  }

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} />
      {/* ✅ SEMUA UI (Wrapper, Konten, Footer) dipindah ke Client Component agar tema sinkron */}
      <MotorDetailClient motor={motor} storeConfig={storeConfig} primaryImage={primaryImage} />
    </>
  )
}