'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { getMotorDetailBySlug } from '@/actions/public'
import { getStoreSettings } from '@/actions/settings' // 👈 Impor Karyawan Backend Settings
import { ChevronLeft, MessageCircle, Fuel, Gauge, Calendar, Award, ShieldCheck, Camera, Phone, ShieldAlert, Share2, Check } from 'lucide-react'

interface MotorDetail {
  id: number
  motor_code: string
  model: string
  year: number
  price: number
  mileage: number
  transmission: string
  condition: string
  description: string | null
  motor_images: { image_url: string; is_primary: boolean }[]
  brands: { name: string; code: string }
}

export default function PublicMotorDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [motor, setMotor] = useState<MotorDetail | null>(null)
  const [activeImage, setActiveImage] = useState('')
  const [loading, setLoading] = useState(true)
  const [copied, setCopied] = useState(false) // State penanda tautan berhasil disalin
  const [storeConfig, setStoreConfig] = useState<any>(null) // 👈 State Penampung Pengaturan Toko Dinamis

  // 🌟 STATE: Mengontrol Tema Sinkron dari Beranda Publik
  const [theme, setTheme] = useState<'dark' | 'light'>('dark')

  useEffect(() => {
    // 🌓 Membaca tema aktif yang sedang dipilih konsumen di halaman beranda
    if (typeof window !== 'undefined') {
      const savedTheme = localStorage.getItem('motosell-theme') as 'dark' | 'light'
      if (savedTheme) {
        setTheme(savedTheme)
      }
    }

    async function loadDetail() {
      if (!params.slug) return
      try {
        const [data, settingsData] = await Promise.all([
          getMotorDetailBySlug(params.slug as string),
          getStoreSettings() // 👈 Tarik data live nomor WA dari tabel settings
        ])

        if (data) {
          setMotor(data as unknown as MotorDetail)
          const primary = data.motor_images?.find((img: any) => img.is_primary)?.image_url || data.motor_images?.[0]?.image_url || '/placeholder.png'
          setActiveImage(primary)
        }
        setStoreConfig(settingsData)
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    loadDetail()
  }, [params.slug])

  const handleWhatsAppClick = () => {
    if (!motor) return
    const nomorWA = storeConfig?.whatsapp_number || '6281234567890' // 👈 Otomatis Ambil dari Database Dinamis
    const teksPesan = `Halo Admin MotoSell, saya melihat unit ini di website dan ingin bertanya lebih lanjut:\n\n*Unit:* ${motor.brands?.name} ${motor.model}\n*Kode:* ${motor.motor_code}\n*Harga:* Rp ${motor.price.toLocaleString('id-ID')}\n\nApakah bisa jadwalkan waktu untuk cek unit langsung ke lokasi? Terima kasih.`
    window.open(`https://wa.me/${nomorWA}?text=${encodeURIComponent(teksPesan)}`, '_blank')
  }

  // 🔥 FITUR BARU: Handler Salin URL Clipboard ala E-Commerce Premium
  const handleShareClick = () => {
    if (typeof window === 'undefined') return
    
    const currentUrl = window.location.href
    navigator.clipboard.writeText(currentUrl)
      .then(() => {
        setCopied(true)
        // Reset ikon kembali ke semula setelah 2 detik
        setTimeout(() => setCopied(false), 2000)
      })
      .catch((err) => console.error('Gagal menyalin tautan:', err))
  }

  if (loading) {
    return (
      <div className={`min-h-screen flex items-center justify-center font-bold animate-pulse ${
        theme === 'dark' ? 'bg-slate-950 text-white' : 'bg-slate-50 text-slate-900'
      }`}>
        MEMBUKA GALERI SPESIFIKASI UNIT...
      </div>
    )
  }

  if (!motor) {
    return (
      <div className={`min-h-screen flex flex-col items-center justify-center gap-4 ${
        theme === 'dark' ? 'bg-slate-950 text-white' : 'bg-slate-50 text-slate-900'
      }`}>
        <p className={`${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'} font-medium`}>Maaf, rincian unit motor tidak ditemukan atau sudah laku terjual.</p>
        <button onClick={() => router.push('/')} className="px-5 py-2 bg-indigo-600 font-bold rounded-xl text-xs uppercase tracking-wider text-white cursor-pointer">Kembali ke Beranda</button>
      </div>
    )
  }

  return (
    <div className={`min-h-screen font-sans antialiased flex flex-col justify-between transition-colors duration-300 ${
      theme === 'dark' ? 'bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-900'
    }`}>
      
      {/* KONTEN UTAMA */}
      <div>
        <div className="max-w-6xl mx-auto px-4 pt-6">
          <button 
            onClick={() => router.push('/')}
            className={`flex items-center gap-2 text-xs font-bold transition px-4 py-2.5 rounded-xl border cursor-pointer ${
              theme === 'dark' ? 'text-slate-400 hover:text-white bg-slate-900 border-slate-800' : 'text-slate-600 hover:text-slate-900 bg-white border-slate-200 shadow-2xs'
            }`}
          >
            <ChevronLeft className="w-4 h-4" /> Kembali ke Katalog
          </button>
        </div>

        <main className="max-w-6xl mx-auto px-4 mt-6 grid grid-cols-1 lg:grid-cols-2 gap-8 mb-16">
          {/* KOLOM KIRI: GALLERY */}
          <div className="space-y-4">
            <div className={`w-full h-72 sm:h-96 rounded-3xl overflow-hidden border shadow-2xl relative ${
              theme === 'dark' ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
            }`}>
              <img src={activeImage} alt={motor.model} className="w-full h-full object-cover select-none" />
              <span className="absolute top-4 right-4 bg-indigo-600/90 backdrop-blur-sm text-[10px] font-black tracking-widest px-3 py-1 rounded-md text-white border border-indigo-400/20 uppercase">
                {motor.brands?.name}
              </span>
            </div>
            <div className="grid grid-cols-4 gap-3">
              {motor.motor_images?.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveImage(img.image_url)}
                  className={`h-16 sm:h-20 rounded-xl overflow-hidden border transition-all cursor-pointer ${
                    activeImage === img.image_url 
                      ? 'border-indigo-500 ring-2 ring-indigo-500/30 scale-95' 
                      : theme === 'dark' ? 'bg-slate-900 border-slate-800 hover:border-slate-600' : 'bg-white border-slate-200 hover:border-slate-400 shadow-2xs'
                  }`}
                >
                  <img src={img.image_url} alt={`preview-${idx}`} className="w-full h-full object-cover select-none" />
                </button>
              ))}
            </div>
          </div>

          {/* KOLOM KANAN: SPEK */}
          <div className={`flex flex-col justify-between p-6 sm:p-8 rounded-3xl border shadow-xl ${
            theme === 'dark' ? 'bg-slate-900/40 border-slate-900' : 'bg-white border-slate-200'
          }`}>
            <div>
              <div className="flex justify-between items-start gap-4">
                <div className="flex items-center gap-2 text-xs font-mono font-bold text-indigo-500 uppercase tracking-widest">
                  <span>READY STOCK</span>
                  <span>•</span>
                  <span>KODE UNIT: {motor.motor_code}</span>
                </div>

                {/* 🔥 ACTION BUTTON SHARE SPREADSHEET TAUTAN */}
                <button
                  type="button"
                  onClick={handleShareClick}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-[11px] font-bold tracking-wide uppercase transition-all duration-200 cursor-pointer ${
                    copied 
                      ? 'bg-emerald-950/80 border-emerald-500 text-emerald-400 shadow-xs' 
                      : theme === 'dark' ? 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white hover:border-slate-700' : 'bg-slate-50 border-slate-200 text-slate-500 hover:text-slate-900'
                  }`}
                >
                  {copied ? (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span>Tautan Tersalin!</span>
                    </>
                  ) : (
                    <>
                      <Share2 className="w-3.5 h-3.5" />
                      <span>Bagikan Unit</span>
                    </>
                  )}
                </button>
              </div>

              <h1 className={`text-2xl sm:text-4xl font-black tracking-tight mt-2 ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>{motor.model}</h1>
              <div className="text-2xl sm:text-3xl font-black text-emerald-500 mt-3">
                Rp {motor.price.toLocaleString('id-ID')}
              </div>

              <div className={`grid grid-cols-2 gap-4 mt-8 border-t border-b py-6 text-xs sm:text-sm ${
                theme === 'dark' ? 'border-slate-800/80' : 'border-slate-100'
              }`}>
                {[
                  { icon: <Fuel className="w-5 h-5 text-indigo-500 shrink-0" />, label: 'Transmisi', val: motor.transmission },
                  { icon: <Gauge className="w-5 h-5 text-indigo-500 shrink-0" />, label: 'Jarak Tempuh', val: `${motor.mileage.toLocaleString('id-ID')} Km` },
                  { icon: <Calendar className="w-5 h-5 text-indigo-500 shrink-0" />, label: 'Tahun Perakitan', val: `Tahun ${motor.year}` },
                  { icon: <Award className="w-5 h-5 text-emerald-500 shrink-0" />, label: 'Kondisi Fisik', val: motor.condition, isCond: true }
                ].map((spec, i) => (
                  <div key={i} className={`flex items-center gap-3 p-3 rounded-xl border ${
                    theme === 'dark' ? 'bg-slate-900/60 border-slate-800/40' : 'bg-slate-50 border-slate-100 shadow-2xs'
                  }`}>
                    {spec.icon}
                    <div>
                      <p className={`text-[10px] font-bold uppercase tracking-wider ${theme === 'dark' ? 'text-slate-500' : 'text-slate-400'}`}>{spec.label}</p>
                      <p className={`font-bold mt-0.5 ${spec.isCond ? 'text-emerald-500' : theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>{spec.val}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-6">
                <h4 className={`text-xs font-bold tracking-widest uppercase mb-2 ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>Deskripsi & Catatan Inspeksi:</h4>
                <p className={`text-xs sm:text-sm leading-relaxed p-4 rounded-xl border whitespace-pre-line ${
                  theme === 'dark' ? 'text-slate-300 bg-slate-950/40 border-slate-800/30' : 'text-slate-700 bg-slate-50 border-slate-100'
                }`}>
                  {motor.description || 'Admin tidak menyertakan deskripsi tambahan.'}
                </p>
              </div>
            </div>

            <div className="mt-8 space-y-4">
              <div className={`flex items-center gap-2 text-xs font-semibold p-3 rounded-xl border ${
                theme === 'dark' ? 'text-slate-400 bg-indigo-950/20 border-indigo-900/30' : 'text-indigo-700 bg-indigo-50 border-indigo-100'
              }`}>
                <ShieldCheck className="w-5 h-5 text-indigo-500 shrink-0" />
                <span>Unit ini bergaransi resmi showroom dan surat-surat dijamin tembus akurat.</span>
              </div>
              <button
                onClick={handleWhatsAppClick}
                className="w-full py-4 bg-emerald-600 hover:bg-emerald-500 text-white font-black rounded-xl text-sm tracking-wider uppercase flex items-center justify-center gap-2.5 transition shadow-lg cursor-pointer"
              >
                <MessageCircle className="w-5 h-5 fill-white" /> Ajukan Penawaran via WhatsApp
              </button>
            </div>
          </div>
        </main>
      </div>

      {/* 🏁 FOOTER GLOBAL COMPONENT */}
      <footer className={`w-full border-t pt-12 transition-colors duration-300 ${
        theme === 'dark' ? 'bg-slate-950 border-slate-900' : 'bg-white border-slate-200'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-8 grid grid-cols-1 md:grid-cols-3 gap-8 pb-8">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-indigo-600 rounded-xl text-white font-black">MS</div>
              <h4 className={`text-lg font-black tracking-wider ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>MOTO<span className="text-indigo-500">SELL</span></h4>
            </div>
            <p className={`text-xs leading-relaxed max-w-sm ${theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}`}>
              Showroom motor bekas modern dan berkualitas premium terpercaya. Transparansi kondisi fisik dan mesin terjamin lewat sertifikasi lulus inspeksi ketat.
            </p>
          </div>
          <div className="space-y-3">
            <h5 className={`text-xs font-black uppercase tracking-widest border-b pb-2 max-w-[100px] ${theme === 'dark' ? 'text-slate-300 border-slate-900' : 'text-slate-800 border-slate-100'}`}>Link Cepat</h5>
            <div className={`flex flex-col gap-2 text-xs font-bold ${theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}`}>
              <Link href="/motors" className="hover:text-indigo-500 transition">Katalog Semua Motor</Link>
              <Link href="/" className="hover:text-indigo-500 transition">Kembali ke Beranda</Link>
              <a href="/admin/dashboard" className="hover:text-indigo-500 transition">Sistem Panel Admin</a>
            </div>
          </div>
          <div className="space-y-3">
            <h5 className={`text-xs font-black uppercase tracking-widest border-b pb-2 max-w-[150px] ${theme === 'dark' ? 'text-slate-300 border-slate-900' : 'text-slate-800 border-slate-100'}`}>Ikuti Media Sosial</h5>
            <div className="flex items-center gap-3 text-slate-400">
              <a href={storeConfig?.instagram_url || 'https://instagram.com'} target="_blank" rel="noreferrer" className={`p-2 rounded-xl hover:bg-indigo-600 hover:text-white transition shadow-md ${theme === 'dark' ? 'bg-slate-900' : 'bg-slate-100 text-slate-600'}`}><Camera className="w-4 h-4" /></a>
              <button onClick={handleWhatsAppClick} className={`p-2 rounded-xl hover:bg-indigo-600 hover:text-white transition shadow-md cursor-pointer ${theme === 'dark' ? 'bg-slate-900 text-slate-400' : 'bg-slate-100 text-slate-600'}`}><Phone className="w-4 h-4" /></button>
            </div>
            <div className="pt-2 text-[10px] text-slate-500 flex items-center gap-1.5 font-medium">
              <ShieldAlert className="w-3.5 h-3.5 text-indigo-600" />
              <span>Sistem Enkripsi Data Supabase Server Protected</span>
            </div>
          </div>
        </div>
        <div className={`w-full border-t py-4 text-center text-[10px] sm:text-xs font-bold tracking-wider ${
          theme === 'dark' ? 'border-slate-900/60 bg-slate-950 text-slate-500' : 'border-slate-100 bg-slate-50 text-slate-400'
        }`}>
          © {new Date().getFullYear()} MOTOSELL PREMIUM SHOWROOM • HAK CIPTA DILINDUNGI UNDANG-UNDANG.
        </div>
      </footer>

    </div>
  )
}