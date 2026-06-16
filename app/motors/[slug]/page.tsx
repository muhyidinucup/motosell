'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { getMotorDetailBySlug } from '@/actions/public'
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

  useEffect(() => {
    async function loadDetail() {
      if (!params.slug) return
      try {
        const data = await getMotorDetailBySlug(params.slug as string)
        if (data) {
          setMotor(data as unknown as MotorDetail)
          const primary = data.motor_images?.find((img: any) => img.is_primary)?.image_url || data.motor_images?.[0]?.image_url || '/placeholder.png'
          setActiveImage(primary)
        }
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
    const nomorWA = '6281234567890'
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
    return <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center font-bold animate-pulse">MEMBUKA GALERI SPESIFIKASI UNIT...</div>
  }

  if (!motor) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-center gap-4">
        <p className="text-slate-400 font-medium">Maaf, rincian unit motor tidak ditemukan atau sudah laku terjual.</p>
        <button onClick={() => router.push('/')} className="px-5 py-2 bg-indigo-600 font-bold rounded-xl text-xs uppercase tracking-wider">Kembali ke Beranda</button>
      </div>
    )
  }

  return (
    <div className="bg-slate-950 text-slate-100 min-h-screen font-sans antialiased flex flex-col justify-between">
      
      {/* KONTEN UTAMA */}
      <div>
        <div className="max-w-6xl mx-auto px-4 pt-6">
          <button 
            onClick={() => router.push('/')}
            className="flex items-center gap-2 text-xs font-bold text-slate-400 hover:text-white transition bg-slate-900 px-4 py-2.5 rounded-xl border border-slate-800 cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4" /> Kembali ke Katalog
          </button>
        </div>

        <main className="max-w-6xl mx-auto px-4 mt-6 grid grid-cols-1 lg:grid-cols-2 gap-8 mb-16">
          {/* KOLOM KIRI: GALLERY */}
          <div className="space-y-4">
            <div className="w-full h-72 sm:h-96 bg-slate-900 rounded-3xl overflow-hidden border border-slate-800 shadow-2xl relative">
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
                  className={`h-16 sm:h-20 bg-slate-900 rounded-xl overflow-hidden border transition-all cursor-pointer ${
                    activeImage === img.image_url ? 'border-indigo-500 ring-2 ring-indigo-500/30 scale-95' : 'border-slate-800 hover:border-slate-600'
                  }`}
                >
                  <img src={img.image_url} alt={`preview-${idx}`} className="w-full h-full object-cover select-none" />
                </button>
              ))}
            </div>
          </div>

          {/* KOLOM KANAN: SPEK */}
          <div className="flex flex-col justify-between bg-slate-900/40 p-6 sm:p-8 rounded-3xl border border-slate-900 shadow-xl">
            <div>
              <div className="flex justify-between items-start gap-4">
                <div className="flex items-center gap-2 text-xs font-mono font-bold text-indigo-400 uppercase tracking-widest">
                  <span>READY STOCK</span>
                  <span>•</span>
                  <span>KODE UNIT: {motor.motor_code}</span>
                </div>

                {/* 🔥 ACTION BUTTON SHARE SPREADSHEET TAUTAN (ALUR BARU) */}
                <button
                  type="button"
                  onClick={handleShareClick}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-[11px] font-bold tracking-wide uppercase transition-all duration-200 cursor-pointer ${
                    copied 
                      ? 'bg-emerald-950/80 border-emerald-500 text-emerald-400 shadow-xs' 
                      : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white hover:border-slate-700'
                  }`}
                >
                  {copied ? (
                    <>
                      <Check className="w-3.5 h-3.5 animate-scaleIn" />
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

              <h1 className="text-2xl sm:text-4xl font-black text-white tracking-tight mt-2">{motor.model}</h1>
              <div className="text-2xl sm:text-3xl font-black text-emerald-500 mt-3">
                Rp {motor.price.toLocaleString('id-ID')}
              </div>

              <div className="grid grid-cols-2 gap-4 mt-8 border-t border-b border-slate-800/80 py-6 text-xs sm:text-sm">
                <div className="flex items-center gap-3 bg-slate-900/60 p-3 rounded-xl border border-slate-800/40">
                  <Fuel className="w-5 h-5 text-indigo-400 shrink-0" />
                  <div>
                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Transmisi</p>
                    <p className="font-bold text-white capitalize mt-0.5">{motor.transmission}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 bg-slate-900/60 p-3 rounded-xl border border-slate-800/40">
                  <Gauge className="w-5 h-5 text-indigo-400 shrink-0" />
                  <div>
                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Jarak Tempuh</p>
                    <p className="font-bold text-white mt-0.5">{motor.mileage.toLocaleString('id-ID')} Km</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 bg-slate-900/60 p-3 rounded-xl border border-slate-800/40">
                  <Calendar className="w-5 h-5 text-indigo-400 shrink-0" />
                  <div>
                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Tahun Perakitan</p>
                    <p className="font-bold text-white mt-0.5">Tahun {motor.year}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 bg-slate-900/60 p-3 rounded-xl border border-slate-800/40">
                  <Award className="w-5 h-5 text-emerald-400 shrink-0" />
                  <div>
                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Kondisi Fisik</p>
                    <p className="font-bold text-emerald-400 mt-0.5">{motor.condition}</p>
                  </div>
                </div>
              </div>

              <div className="mt-6">
                <h4 className="text-xs font-bold text-slate-400 tracking-widest uppercase mb-2">Deskripsi & Catatan Inspeksi:</h4>
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed bg-slate-950/40 p-4 rounded-xl border border-slate-800/30 whitespace-pre-line">
                  {motor.description || 'Admin tidak menyertakan deskripsi tambahan.'}
                </p>
              </div>
            </div>

            <div className="mt-8 space-y-4">
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-400 bg-indigo-950/20 border border-indigo-900/30 p-3 rounded-xl">
                <ShieldCheck className="w-5 h-5 text-indigo-400 shrink-0" />
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
      <footer className="w-full bg-slate-950 border-t border-slate-900 pt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 grid grid-cols-1 md:grid-cols-3 gap-8 pb-8">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-indigo-600 rounded-xl text-white font-black">MS</div>
              <h4 className="text-lg font-black tracking-wider text-white">MOTO<span className="text-indigo-500">SELL</span></h4>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed max-w-sm">
              Showroom motor bekas modern dan berkualitas premium terpercaya. Transparansi kondisi fisik dan mesin terjamin lewat sertifikasi lulus inspeksi ketat.
            </p>
          </div>
          <div className="space-y-3">
            <h5 className="text-xs font-black uppercase tracking-widest text-slate-300 border-b border-slate-900 pb-2 max-w-[100px]">Link Cepat</h5>
            <div className="flex flex-col gap-2 text-xs text-slate-400 font-bold">
              <Link href="/motors" className="hover:text-indigo-400 transition">Katalog Semua Motor</Link>
              <Link href="/" className="hover:text-indigo-400 transition">Kembali ke Beranda</Link>
              <a href="/admin/dashboard" className="hover:text-indigo-400 transition">Sistem Console Admin</a>
            </div>
          </div>
          <div className="space-y-3">
            <h5 className="text-xs font-black uppercase tracking-widest text-slate-300 border-b border-slate-900 pb-2 max-w-[150px]">Ikuti Media Sosial</h5>
            <div className="flex items-center gap-3 text-slate-400">
              <a href="https://instagram.com" target="_blank" rel="noreferrer" className="p-2 bg-slate-900 hover:bg-indigo-600 rounded-xl hover:text-white transition shadow-md"><Camera className="w-4 h-4" /></a>
              <a href="https://whatsapp.com" target="_blank" rel="noreferrer" className="p-2 bg-slate-900 hover:bg-indigo-600 rounded-xl hover:text-white transition shadow-md"><Phone className="w-4 h-4" /></a>
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
  )
}