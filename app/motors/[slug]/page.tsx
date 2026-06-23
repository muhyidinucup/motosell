import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { getMotorDetailBySlug } from '@/actions/public'
import { getStoreSettings } from '@/actions/settings'
import { ChevronLeft, ArrowLeft } from 'lucide-react'
import MotorDetailClient from './MotorDetailClient'

interface PageProps {
  params: { slug: string }
}

// ✅ SEO METADATA DINAMIS - Berbeda untuk setiap motor!
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  try {
    const motor = await getMotorDetailBySlug(params.slug)

    if (!motor) {
      return {
        title: 'Motor Tidak Ditemukan | MotoSell',
        description: 'Unit motor yang Anda cari tidak ditemukan atau sudah terjual.',
      }
    }

    const primaryImage = motor.motor_images?.find((img: any) => img.is_primary)?.image_url || 
                        motor.motor_images?.[0]?.image_url || 
                        '/placeholder.png'

    const title = `Jual ${motor.brands?.name} ${motor.model} ${motor.year} - Rp ${Number(motor.price).toLocaleString('id-ID')} | MotoSell`
    const description = `Jual ${motor.brands?.name} ${motor.model} tahun ${motor.year}. Kondisi ${motor.condition}, jarak tempuh ${Number(motor.mileage).toLocaleString('id-ID')} km, transmisi ${motor.transmission}. Harga Rp ${Number(motor.price).toLocaleString('id-ID')}. Garansi resmi showroom MotoSell.`

    return {
      title,
      description,
      keywords: `${motor.brands?.name} bekas, ${motor.model} bekas, jual ${motor.brands?.name} ${motor.year}, motor second ${motor.brands?.name}, ${motor.model} ${motor.year} harga`,
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
        url: `https://motosell.vercel.app/motors/${params.slug}`,
        siteName: 'MotoSell Premium Showroom',
        title,
        description,
        images: [
          {
            url: primaryImage,
            width: 1200,
            height: 630,
            alt: `${motor.brands?.name} ${motor.model} ${motor.year}`,
          },
        ],
      },
      twitter: {
        card: 'summary_large_image',
        title,
        description,
        images: [primaryImage],
      },
      alternates: {
        canonical: `https://motosell.vercel.app/motors/${params.slug}`,
      },
    }
  } catch (error) {
    return {
      title: 'Motor Tidak Ditemukan | MotoSell',
      description: 'Unit motor yang Anda cari tidak ditemukan atau sudah terjual.',
    }
  }
}

// ✅ SERVER COMPONENT - Data di-fetch di server untuk SEO
export default async function MotorDetailPage({ params }: PageProps) {
  // Fetch data di server-side
  const [motor, storeConfig] = await Promise.all([
    getMotorDetailBySlug(params.slug),
    getStoreSettings()
  ])

  // Jika motor tidak ditemukan atau sudah sold, tampilkan 404
  if (!motor || motor.status !== 'ready') {
    notFound()
  }

  const primaryImage = motor.motor_images?.find((img: any) => img.is_primary)?.image_url || 
                      motor.motor_images?.[0]?.image_url || 
                      '/placeholder.png'

  // ✅ Structured Data untuk Google Rich Snippets (Product + Vehicle)
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: `${motor.brands?.name} ${motor.model}`,
    description: motor.description || `Jual ${motor.brands?.name} ${motor.model} tahun ${motor.year}, kondisi ${motor.condition}`,
    sku: motor.motor_code,
    image: motor.motor_images?.map((img: any) => img.image_url) || [primaryImage],
    brand: {
      '@type': 'Brand',
      name: motor.brands?.name,
    },
    offers: {
      '@type': 'Offer',
      url: `https://motosell.vercel.app/motors/${params.slug}`,
      priceCurrency: 'IDR',
      price: motor.price,
      availability: 'https://schema.org/InStock',
      itemCondition: 'https://schema.org/UsedCondition',
      seller: {
        '@type': 'AutoDealer',
        name: 'MotoSell Premium Showroom',
      },
    },
    additionalProperty: [
      {
        '@type': 'PropertyValue',
        name: 'Tahun',
        value: motor.year,
      },
      {
        '@type': 'PropertyValue',
        name: 'Jarak Tempuh',
        value: `${motor.mileage} km`,
      },
      {
        '@type': 'PropertyValue',
        name: 'Transmisi',
        value: motor.transmission,
      },
      {
        '@type': 'PropertyValue',
        name: 'Warna',
        value: motor.color,
      },
      {
        '@type': 'PropertyValue',
        name: 'Kondisi',
        value: motor.condition,
      },
    ],
  }

  return (
    <>
      {/* ✅ Structured Data JSON-LD untuk Google */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />

      <div className="bg-slate-950 text-slate-100 min-h-screen font-sans antialiased flex flex-col justify-between">
        
        {/* KONTEN UTAMA */}
        <div>
          <div className="max-w-6xl mx-auto px-4 pt-6">
            <Link
              href="/motors"
              className="flex items-center gap-2 text-xs font-bold text-slate-400 hover:text-white transition bg-slate-900 px-4 py-2.5 rounded-xl border border-slate-800 w-fit"
            >
              <ChevronLeft className="w-4 h-4" /> Kembali ke Katalog
            </Link>
          </div>

          {/* ✅ Breadcrumb untuk SEO */}
          <nav className="max-w-6xl mx-auto px-4 mt-4" aria-label="Breadcrumb">
            <ol className="flex items-center gap-2 text-xs text-slate-500 flex-wrap">
              <li>
                <Link href="/" className="hover:text-indigo-400 transition">Beranda</Link>
              </li>
              <li className="text-slate-600">/</li>
              <li>
                <Link href="/motors" className="hover:text-indigo-400 transition">Katalog Motor</Link>
              </li>
              <li className="text-slate-600">/</li>
              <li>
                <Link href={`/motors?brand=${motor.brands?.code.toLowerCase()}`} className="hover:text-indigo-400 transition">
                  {motor.brands?.name}
                </Link>
              </li>
              <li className="text-slate-600">/</li>
              <li className="text-slate-300 font-semibold truncate max-w-[200px]">
                {motor.model} {motor.year}
              </li>
            </ol>
          </nav>

          {/* ✅ Client Component untuk interaktivitas (gallery, share, WA, theme) */}
          <MotorDetailClient 
            motor={motor} 
            storeConfig={storeConfig} 
            primaryImage={primaryImage}
          />
        </div>

        {/* 🏁 FOOTER GLOBAL COMPONENT */}
        <footer className="w-full bg-slate-950 border-t border-slate-900 pt-12 mt-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-8 grid grid-cols-1 md:grid-cols-3 gap-8 pb-8">
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-indigo-600 rounded-xl text-white font-black">MS</div>
                <h4 className="text-lg font-black tracking-wider text-white">
                  MOTO<span className="text-indigo-500">SELL</span>
                </h4>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed max-w-sm">
                Showroom motor bekas modern dan berkualitas premium terpercaya. Transparansi kondisi fisik dan mesin terjamin lewat sertifikasi lulus inspeksi ketat.
              </p>
            </div>
            <div className="space-y-3">
              <h5 className="text-xs font-black uppercase tracking-widest text-slate-300 border-b border-slate-900 pb-2 max-w-[100px]">
                Link Cepat
              </h5>
              <div className="flex flex-col gap-2 text-xs text-slate-400 font-bold">
                <Link href="/motors" className="hover:text-indigo-400 transition">Katalog Semua Motor</Link>
                <Link href="/" className="hover:text-indigo-400 transition">Kembali ke Beranda</Link>
                <a href="/admin/dashboard" className="hover:text-indigo-400 transition">Sistem Panel Admin</a>
              </div>
            </div>
            <div className="space-y-3">
              <h5 className="text-xs font-black uppercase tracking-widest text-slate-300 border-b border-slate-900 pb-2 max-w-[150px]">
                Ikuti Media Sosial
              </h5>
              <div className="flex items-center gap-3 text-slate-400">
                <a 
                  href={storeConfig?.instagram_url || 'https://instagram.com'} 
                  target="_blank" 
                  rel="noreferrer" 
                  className="p-2 bg-slate-900 hover:bg-indigo-600 rounded-xl hover:text-white transition shadow-md"
                >
                  <Camera className="w-4 h-4" />
                </a>
                <a 
                  href={`https://wa.me/${storeConfig?.whatsapp_number || '6281234567890'}`}
                  target="_blank" 
                  rel="noreferrer" 
                  className="p-2 bg-slate-900 hover:bg-indigo-600 rounded-xl hover:text-white transition shadow-md"
                >
                  <Phone className="w-4 h-4" />
                </a>
              </div>
              <div className="pt-2 text-[10px] text-slate-500 flex items-center gap-1.5 font-medium">
                <ShieldAlert className="w-3.5 h-3.5 text-indigo-600" />
                <span>Sistem Enkripsi Data Supabase Server Protected</span>
              </div>
            </div>
          </div>
          <div className="w-full border-t border-slate-900/60 py-4 text-center text-[10px] sm:text-xs font-bold text-slate-500 tracking-wider bg-slate-950">
            © {new Date().getFullYear()} MOTOSELL PREMIUM SHOWROOM • HAK CIPTA DILINDUNGI UNDANG-UNDANG.
          </div>
        </footer>
      </div>
    </>
  )
}