import { Metadata } from 'next'
import Link from 'next/link'
import { getReadyMotors } from '@/actions/public'
import { getBrands } from '@/actions/brand'
import { Search, Fuel, Gauge, Award, Calendar, ArrowLeft, Camera, Phone, ShieldAlert } from 'lucide-react'
import MotorsClient from './MotorsClient'

// ✅ SEO METADATA - Ini yang membuat halaman bisa di-index Google
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
        url: '/og-image.jpg', // Buat file og-image.jpg di folder public
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

// ✅ SERVER COMPONENT - Data di-fetch di server untuk SEO
export default async function PublicKatalogPage() {
  // Fetch data di server-side (bukan di useEffect)
  const [motors, brands] = await Promise.all([
    getReadyMotors(),
    getBrands()
  ])

  // ✅ Structured Data untuk Google Rich Snippets
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
        vehicleConfiguration: {
          '@type': 'Vehicle',
          modelDate: motor.year,
          mileage: {
            '@type': 'QuantitativeValue',
            value: motor.mileage,
            unitCode: 'KMT',
          },
          transmission: motor.transmission,
        },
      },
    })),
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
          <div className="max-w-7xl mx-auto px-4 sm:px-8 pt-6 flex justify-between items-center">
            <Link 
              href="/"
              className="flex items-center gap-2 text-xs font-bold text-slate-400 hover:text-white transition bg-slate-900 px-4 py-2.5 rounded-xl border border-slate-800"
            >
              <ArrowLeft className="w-4 h-4" /> Kembali ke Beranda
            </Link>
            <span className="text-xs font-bold text-slate-500 tracking-widest uppercase">
              Total: {motors.length} Unit Ready
            </span>
          </div>

          {/* ✅ Breadcrumb untuk SEO */}
          <nav className="max-w-7xl mx-auto px-4 sm:px-8 mt-4" aria-label="Breadcrumb">
            <ol className="flex items-center gap-2 text-xs text-slate-500">
              <li>
                <Link href="/" className="hover:text-indigo-400 transition">Beranda</Link>
              </li>
              <li className="text-slate-600">/</li>
              <li className="text-slate-300 font-semibold">Katalog Motor</li>
            </ol>
          </nav>

          <section className="max-w-7xl mx-auto mt-8 px-4 sm:px-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 border-b border-slate-800 pb-6">
              <div>
                <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                  Katalog Lengkap <span className="text-indigo-500">Armada Showroom</span>
                </h1>
                <p className="text-xs text-slate-400 mt-1">
                  Cari, saring, dan temukan motor bekas berkualitas dengan harga terbaik.
                </p>
              </div>
              {/* ✅ Search input dipindah ke Client Component */}
            </div>

            {/* ✅ Client Component untuk interaktivitas search/filter */}
            <MotorsClient motors={motors} brands={brands} />
          </section>
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
                <Link href="/" className="hover:text-indigo-400 transition">Kembali ke Beranda</Link>
                <Link href="/motors" className="hover:text-indigo-400 transition">Katalog Motor</Link>
                <a href="/admin/dashboard" className="hover:text-indigo-400 transition">Sistem Console Admin</a>
              </div>
            </div>
            <div className="space-y-3">
              <h5 className="text-xs font-black uppercase tracking-widest text-slate-300 border-b border-slate-900 pb-2 max-w-[150px]">
                Ikuti Media Sosial
              </h5>
              <div className="flex items-center gap-3 text-slate-400">
                <a href="https://instagram.com" target="_blank" rel="noreferrer" className="p-2 bg-slate-900 hover:bg-indigo-600 rounded-xl hover:text-white transition shadow-md">
                  <Camera className="w-4 h-4" />
                </a>
                <a href="https://whatsapp.com" target="_blank" rel="noreferrer" className="p-2 bg-slate-900 hover:bg-indigo-600 rounded-xl hover:text-white transition shadow-md">
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