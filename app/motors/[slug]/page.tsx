import { Metadata } from 'next'
import { getMotorDetailBySlug, getReadyMotors } from '@/actions/public'
import { getStoreSettings } from '@/actions/settings'
import MotorDetailClient from './MotorDetailClient'

interface PageProps {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  try {
    const motor = await getMotorDetailBySlug(slug)
    if (!motor) {
      return { title: 'Motor Tidak Ditemukan | MotoSell' }
    }
    const primaryImage = motor.motor_images?.find((img: any) => img.is_primary)?.image_url || motor.motor_images?.[0]?.image_url || '/placeholder.png'
    const title = `Jual ${motor.brands?.name} ${motor.model} ${motor.year} - Rp ${Number(motor.price).toLocaleString('id-ID')} | MotoSell`
    const description = `Jual ${motor.brands?.name} ${motor.model} tahun ${motor.year}. Kondisi ${motor.condition}, jarak tempuh ${Number(motor.mileage).toLocaleString('id-ID')} km. Harga Rp ${Number(motor.price).toLocaleString('id-ID')}. Garansi resmi showroom MotoSell.`

    return {
      title,
      description,
      keywords: `${motor.brands?.name} bekas, ${motor.model} bekas, jual ${motor.brands?.name} ${motor.year}`,
      openGraph: {
        type: 'website', locale: 'id_ID',
        url: `https://motosell.vercel.app/motors/${slug}`,
        title, description,
        images: [{ url: primaryImage, width: 1200, height: 630 }],
      },
      alternates: { canonical: `https://motosell.vercel.app/motors/${slug}` },
    }
  } catch (error) {
    return { title: 'Motor Tidak Ditemukan | MotoSell' }
  }
}

export default async function MotorDetailPage({ params }: PageProps) {
  const { slug } = await params
  
  // ✅ Fetch data motor utama + semua motor ready (untuk rekomendasi serupa) + settings
  const [motor, allMotors, storeConfig] = await Promise.all([
    getMotorDetailBySlug(slug),
    getReadyMotors(),
    getStoreSettings()
  ])

  if (!motor || motor.status !== 'ready') {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center">
        <p>Motor tidak ditemukan atau sudah terjual.</p>
      </div>
    )
  }

  const primaryImage = motor.motor_images?.find((img: any) => img.is_primary)?.image_url || motor.motor_images?.[0]?.image_url || '/placeholder.png'

  // ✅ Filter motor serupa: brand sama, tapi bukan motor yang sedang dilihat, maksimal 3
  const relatedMotors = allMotors
    .filter((m: any) => m.brand_id === motor.brand_id && m.id !== motor.id)
    .slice(0, 3)

  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: `${motor.brands?.name} ${motor.model}`,
    description: motor.description || `Jual ${motor.brands?.name} ${motor.model} tahun ${motor.year}`,
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
    },
  }

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} />
      {/* ✅ HANYA render Client Component, TIDAK ADA UI LAIN */}
      <MotorDetailClient 
        motor={motor} 
        storeConfig={storeConfig} 
        primaryImage={primaryImage}
        relatedMotors={relatedMotors}
      />
    </>
  )
}