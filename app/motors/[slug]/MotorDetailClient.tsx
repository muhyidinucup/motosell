'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { MessageCircle, Fuel, Gauge, Calendar, Award, ShieldCheck, Share2, Check, Camera, Phone, ShieldAlert } from 'lucide-react'

interface MotorDetail {
  id: number
  motor_code: string
  model: string
  year: number
  price: number
  mileage: number
  transmission: string
  color: string
  condition: string
  description: string | null
  status: string
  motor_images: { image_url: string; is_primary: boolean }[]
  brands: { name: string; code: string }
}

interface MotorDetailClientProps {
  motor: MotorDetail
  storeConfig: any
  primaryImage: string
}

export default function MotorDetailClient({ motor, storeConfig, primaryImage }: MotorDetailClientProps) {
  const router = useRouter()
  const [activeImage, setActiveImage] = useState(primaryImage)
  const [copied, setCopied] = useState(false)
  const [theme, setTheme] = useState<'dark' | 'light'>('dark')

  // 🌓 Sinkron tema dari localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedTheme = localStorage.getItem('motosell-theme') as 'dark' | 'light'
      if (savedTheme) {
        setTheme(savedTheme)
      }
    }
  }, [])

  const handleWhatsAppClick = () => {
    const nomorWA = storeConfig?.whatsapp_number || '6281234567890'
    const teksPesan = `Halo Admin MotoSell, saya melihat unit ini di website dan ingin bertanya lebih lanjut:\n\n*Unit:* ${motor.brands?.name} ${motor.model}\n*Kode:* ${motor.motor_code}\n*Harga:* Rp ${motor.price.toLocaleString('id-ID')}\n\nApakah bisa jadwalkan waktu untuk cek unit langsung ke lokasi? Terima kasih.`
    window.open(`https://wa.me/${nomorWA}?text=${encodeURIComponent(teksPesan)}`, '_blank')
  }

  const handleShareClick = () => {
    if (typeof window === 'undefined') return
    
    const currentUrl = window.location.href
    navigator.clipboard.writeText(currentUrl)
      .then(() => {
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
      })
      .catch((err) => console.error('Gagal menyalin tautan:', err))
  }

  return (
    <main className="max-w-6xl mx-auto px-4 mt-6 grid grid-cols-1 lg:grid-cols-2 gap-8 mb-16">
      {/* KOLOM KIRI: GALLERY */}
      <div className="space-y-4">
        <div className={`w-full h-72 sm:h-96 rounded-3xl overflow-hidden border shadow-2xl relative ${
          theme === 'dark' ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
        }`}>
          <img 
            src={activeImage} 
            alt={`${motor.brands?.name} ${motor.model} ${motor.year}`} 
            className="w-full h-full object-cover select-none" 
          />
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
              <img 
                src={img.image_url} 
                alt={`${motor.brands?.name} ${motor.model} foto ${idx + 1}`} 
                className="w-full h-full object-cover select-none" 
              />
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

          <h1 className={`text-2xl sm:text-4xl font-black tracking-tight mt-2 ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>
            {motor.brands?.name} {motor.model}
          </h1>
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
            <h4 className={`text-xs font-bold tracking-widest uppercase mb-2 ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>
              Deskripsi & Catatan Inspeksi:
            </h4>
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
  )
}