'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { MessageCircle, Fuel, Gauge, Calendar, Award, ShieldCheck, Share2, Check, Camera, Phone, ShieldAlert, ChevronLeft, ChevronRight, Sun, Moon, MapPin, Clock, Mail } from 'lucide-react'

interface MotorDetail {
  id: number
  motor_code: string
  model: string
  slug: string
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
  brand_id: number
}

interface MotorDetailClientProps {
  motor: MotorDetail
  storeConfig: any
  primaryImage: string
  relatedMotors: MotorDetail[]
}

export default function MotorDetailClient({ motor, storeConfig, primaryImage, relatedMotors }: MotorDetailClientProps) {
  const [activeImage, setActiveImage] = useState(primaryImage)
  const [copied, setCopied] = useState(false)
  const [theme, setTheme] = useState<'dark' | 'light'>('dark')

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedTheme = localStorage.getItem('motosell-theme') as 'dark' | 'light'
      if (savedTheme) setTheme(savedTheme)
    }
  }, [])

  const toggleTheme = () => {
    const nextTheme = theme === 'dark' ? 'light' : 'dark'
    setTheme(nextTheme)
    localStorage.setItem('motosell-theme', nextTheme)
  }

  const handleWhatsAppClick = () => {
    const nomorWA = storeConfig?.whatsapp_number || '6281234567890'
    const teksPesan = `Halo Admin MotoSell, saya melihat unit ini di website dan ingin bertanya lebih lanjut:\n\n*Unit:* ${motor.brands?.name} ${motor.model}\n*Kode:* ${motor.motor_code}\n*Harga:* Rp ${motor.price.toLocaleString('id-ID')}\n\nApakah bisa jadwalkan waktu untuk cek unit langsung ke lokasi? Terima kasih.`
    window.open(`https://wa.me/${nomorWA}?text=${encodeURIComponent(teksPesan)}`, '_blank')
  }

  const handleShareClick = () => {
    if (typeof window === 'undefined') return
    navigator.clipboard.writeText(window.location.href)
      .then(() => {
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
      })
  }

  const handleSellToShowroomWA = () => {
    const nomorWA = storeConfig?.whatsapp_number || '6281234567890'
    const teksFormat = `Halo Admin MotoSell, saya berencana mau menawarkan unit motor bekas saya untuk dijual ke showroom.`
    window.open(`https://wa.me/${nomorWA}?text=${encodeURIComponent(teksFormat)}`, '_blank')
  }

  const nextImage = () => {
    if (!motor.motor_images?.length) return
    const currentIndex = motor.motor_images.findIndex(img => img.image_url === activeImage)
    const nextIndex = (currentIndex + 1) % motor.motor_images.length
    setActiveImage(motor.motor_images[nextIndex].image_url)
  }

  const prevImage = () => {
    if (!motor.motor_images?.length) return
    const currentIndex = motor.motor_images.findIndex(img => img.image_url === activeImage)
    const prevIndex = (currentIndex - 1 + motor.motor_images.length) % motor.motor_images.length
    setActiveImage(motor.motor_images[prevIndex].image_url)
  }

  return (
    <div className={`min-h-screen font-sans antialiased flex flex-col justify-between transition-colors duration-300 ${
      theme === 'dark' ? 'bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-900'
    }`}>
      
      <div>
        {/* NAVBAR */}
        <nav className={`backdrop-blur-md border-b sticky top-0 z-50 px-4 sm:px-8 py-4 flex justify-between items-center max-w-7xl mx-auto rounded-b-2xl transition-colors duration-300 ${
          theme === 'dark' ? 'bg-slate-900/80 border-slate-800' : 'bg-white/90 border-slate-200 shadow-xs'
        }`}>
          <Link href="/motors" className={`flex items-center gap-2 text-xs font-bold transition px-4 py-2.5 rounded-xl border ${
            theme === 'dark' ? 'text-slate-400 hover:text-white bg-slate-900 border-slate-800' : 'text-slate-600 hover:text-slate-900 bg-white border-slate-200 shadow-2xs'
          }`}>
            <ChevronLeft className="w-4 h-4" /> Kembali ke Katalog
          </Link>
          <button onClick={toggleTheme} className={`p-2 rounded-xl border transition cursor-pointer ${
            theme === 'dark' ? 'bg-slate-800 border-slate-700 text-amber-400' : 'bg-slate-100 border-slate-200 text-indigo-600'
          }`}>
            {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>
        </nav>

        {/* Breadcrumb */}
        <nav className="max-w-6xl mx-auto px-4 mt-4" aria-label="Breadcrumb">
          <ol className={`flex items-center gap-2 text-xs flex-wrap ${theme === 'dark' ? 'text-slate-500' : 'text-slate-400'}`}>
            <li><Link href="/" className="hover:text-indigo-400 transition">Beranda</Link></li>
            <li>/</li>
            <li><Link href="/motors" className="hover:text-indigo-400 transition">Katalog Motor</Link></li>
            <li>/</li>
            <li className={`font-semibold truncate max-w-[200px] ${theme === 'dark' ? 'text-slate-300' : 'text-slate-900'}`}>
              {motor.brands?.name} {motor.model} {motor.year}
            </li>
          </ol>
        </nav>

        {/* HERO: GALLERY + SPEK */}
        <main className="max-w-6xl mx-auto px-4 mt-6 grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* GALLERY DENGAN NAVIGASI */}
          <div className="space-y-4">
            <div className={`w-full h-80 sm:h-[28rem] rounded-3xl overflow-hidden border shadow-2xl relative group ${
              theme === 'dark' ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
            }`}>
              <img src={activeImage} alt={`${motor.brands?.name} ${motor.model}`} className="w-full h-full object-cover select-none" />
              
              {/* Navigasi Panah */}
              {motor.motor_images && motor.motor_images.length > 1 && (
                <>
                  <button onClick={prevImage} className="absolute left-4 top-1/2 -translate-y-1/2 p-2 bg-slate-900/70 hover:bg-slate-900 border border-white/10 rounded-full text-white opacity-0 group-hover:opacity-100 transition cursor-pointer">
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <button onClick={nextImage} className="absolute right-4 top-1/2 -translate-y-1/2 p-2 bg-slate-900/70 hover:bg-slate-900 border border-white/10 rounded-full text-white opacity-0 group-hover:opacity-100 transition cursor-pointer">
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </>
              )}

              <span className="absolute top-4 right-4 bg-indigo-600/90 backdrop-blur-sm text-[10px] font-black tracking-widest px-3 py-1 rounded-md text-white uppercase">
                {motor.brands?.name}
              </span>
            </div>
            
            {/* Thumbnail */}
            {motor.motor_images && motor.motor_images.length > 0 && (
              <div className="grid grid-cols-5 gap-2">
                {motor.motor_images.map((img, idx) => (
                  <button key={idx} onClick={() => setActiveImage(img.image_url)} className={`h-20 rounded-xl overflow-hidden border transition-all cursor-pointer ${
                    activeImage === img.image_url 
                      ? 'border-indigo-500 ring-2 ring-indigo-500/30 scale-95' 
                      : theme === 'dark' ? 'bg-slate-900 border-slate-800 hover:border-slate-600' : 'bg-white border-slate-200 hover:border-slate-400'
                  }`}>
                    <img src={img.image_url} alt={`preview-${idx}`} className="w-full h-full object-cover select-none" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* SPEK */}
          <div className={`flex flex-col justify-between p-6 sm:p-8 rounded-3xl border shadow-xl ${
            theme === 'dark' ? 'bg-slate-900/40 border-slate-900' : 'bg-white border-slate-200'
          }`}>
            <div>
              <div className="flex justify-between items-start gap-4">
                <div className="flex items-center gap-2 text-xs font-mono font-bold text-indigo-500 uppercase tracking-widest">
                  <span>READY STOCK</span><span>•</span><span>KODE: {motor.motor_code}</span>
                </div>
                <button onClick={handleShareClick} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-[11px] font-bold uppercase transition-all cursor-pointer ${
                  copied ? 'bg-emerald-950/80 border-emerald-500 text-emerald-400' : theme === 'dark' ? 'bg-slate-900 border-slate-800 text-slate-400' : 'bg-slate-50 border-slate-200 text-slate-500'
                }`}>
                  {copied ? <><Check className="w-3.5 h-3.5" /><span>Tersalin!</span></> : <><Share2 className="w-3.5 h-3.5" /><span>Bagikan</span></>}
                </button>
              </div>

              <h1 className={`text-3xl sm:text-4xl font-black tracking-tight mt-2 ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>
                {motor.brands?.name} {motor.model}
              </h1>
              <div className="text-3xl sm:text-4xl font-black text-emerald-500 mt-3">
                Rp {motor.price.toLocaleString('id-ID')}
              </div>

              <div className={`grid grid-cols-2 gap-3 mt-6 border-t border-b py-5 text-sm ${
                theme === 'dark' ? 'border-slate-800/80' : 'border-slate-100'
              }`}>
                {[
                  { icon: <Fuel className="w-5 h-5 text-indigo-500" />, label: 'Transmisi', val: motor.transmission },
                  { icon: <Gauge className="w-5 h-5 text-indigo-500" />, label: 'Jarak Tempuh', val: `${motor.mileage.toLocaleString('id-ID')} Km` },
                  { icon: <Calendar className="w-5 h-5 text-indigo-500" />, label: 'Tahun Rakit', val: `${motor.year}` },
                  { icon: <Award className="w-5 h-5 text-emerald-500" />, label: 'Kondisi', val: motor.condition, isCond: true }
                ].map((spec, i) => (
                  <div key={i} className={`flex items-center gap-3 p-3 rounded-xl border ${
                    theme === 'dark' ? 'bg-slate-900/60 border-slate-800/40' : 'bg-slate-50 border-slate-100'
                  }`}>
                    {spec.icon}
                    <div>
                      <p className={`text-[10px] font-bold uppercase tracking-wider ${theme === 'dark' ? 'text-slate-500' : 'text-slate-400'}`}>{spec.label}</p>
                      <p className={`font-bold mt-0.5 ${spec.isCond ? 'text-emerald-500' : theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>{spec.val}</p>
                    </div>
                  </div>
                ))}
              </div>

              {motor.description && (
                <div className="mt-6">
                  <h4 className={`text-xs font-bold tracking-widest uppercase mb-2 ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>
                    Catatan Inspeksi:
                  </h4>
                  <p className={`text-sm leading-relaxed p-4 rounded-xl border whitespace-pre-line ${
                    theme === 'dark' ? 'text-slate-300 bg-slate-950/40 border-slate-800/30' : 'text-slate-700 bg-slate-50 border-slate-100'
                  }`}>
                    {motor.description}
                  </p>
                </div>
              )}
            </div>

            <div className="mt-6 space-y-3">
              <div className={`flex items-center gap-2 text-xs font-semibold p-3 rounded-xl border ${
                theme === 'dark' ? 'text-slate-400 bg-indigo-950/20 border-indigo-900/30' : 'text-indigo-700 bg-indigo-50 border-indigo-100'
              }`}>
                <ShieldCheck className="w-5 h-5 text-indigo-500 shrink-0" />
                <span>Unit bergaransi mesin 3 bulan & surat-surat dijamin tembus akurat.</span>
              </div>
              <button onClick={handleWhatsAppClick} className="w-full py-4 bg-emerald-600 hover:bg-emerald-500 text-white font-black rounded-xl text-sm tracking-wider uppercase flex items-center justify-center gap-2.5 transition shadow-lg cursor-pointer">
                <MessageCircle className="w-5 h-5 fill-white" /> Nego & Cek Unit via WhatsApp
              </button>
            </div>
          </div>
        </main>

        {/* SECTION: KEUNGGULAN SHOWROOM (Mirip Beranda) */}
        <section className="max-w-6xl mx-auto mt-20 px-4 sm:px-6 grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { icon: <ShieldCheck className="w-6 h-6" />, title: 'Garansi Mesin 3 Bulan', desc: 'Unit ini dilindungi garansi mesin resmi untuk menjamin kenyamanan berkendara Anda.' },
            { icon: <Award className="w-6 h-6" />, title: 'Lulus 12 Titik Inspeksi', desc: 'Telah melalui pengetesan kelistrikan, cek rangka, serta uji kompresi mesin secara detail.' },
            { icon: <MessageCircle className="w-6 h-6" />, title: 'Nego Sampai Deal', desc: 'Atur jadwal ketemuan/COD langsung di lokasi showroom, nego harga terbaik dengan admin.' }
          ].map((item, index) => (
            <div key={index} className={`p-6 rounded-2xl border flex items-start gap-4 ${
              theme === 'dark' ? 'bg-gradient-to-br from-slate-900 to-indigo-950/20 border-slate-800' : 'bg-white border-slate-200 shadow-2xs'
            }`}>
              <div className="p-3 bg-indigo-600/10 rounded-xl border border-indigo-500/20 text-indigo-500 shrink-0">{item.icon}</div>
              <div>
                <h4 className={`font-bold text-sm uppercase tracking-wider ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>{item.title}</h4>
                <p className={`text-xs mt-1 leading-relaxed ${theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}`}>{item.desc}</p>
              </div>
            </div>
          ))}
        </section>

        {/* SECTION: MOTOR SERUPA / REKOMENDASI */}
        {relatedMotors.length > 0 && (
          <section className="max-w-6xl mx-auto mt-20 px-4 sm:px-6">
            <div className="flex items-center gap-3 mb-6">
              <span className="w-3 h-6 bg-indigo-500 rounded-full" />
              <h2 className={`text-xl sm:text-2xl font-black tracking-tight ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>
                Motor <span className="text-indigo-500">{motor.brands?.name}</span> Lainnya
              </h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {relatedMotors.map((relMotor) => {
                const relPhoto = relMotor.motor_images?.find(img => img.is_primary)?.image_url || relMotor.motor_images?.[0]?.image_url || '/placeholder.png'
                return (
                  <Link 
                    href={`/motors/${relMotor.slug}`} 
                    key={relMotor.id}
                    className={`border rounded-2xl overflow-hidden group shadow-lg transition-all duration-300 flex flex-col justify-between cursor-pointer ${
                      theme === 'dark' ? 'bg-slate-900 border-slate-800 hover:border-indigo-500/50' : 'bg-white border-slate-200 hover:border-indigo-500/40'
                    }`}
                  >
                    <div>
                      <div className="w-full h-48 bg-slate-950 relative overflow-hidden">
                        <img src={relPhoto} alt={relMotor.model} className="w-full h-full object-cover group-hover:scale-105 transition duration-300" />
                        <span className="absolute top-3 left-3 bg-indigo-600/90 backdrop-blur-sm text-[10px] font-black tracking-widest px-2.5 py-1 rounded-md text-white uppercase">
                          {relMotor.brands?.code}
                        </span>
                      </div>
                      <div className="p-5">
                        <h3 className={`font-black text-base tracking-tight group-hover:text-indigo-500 transition truncate ${
                          theme === 'dark' ? 'text-white' : 'text-slate-900'
                        }`}>
                          {relMotor.model} {relMotor.year}
                        </h3>
                        <div className="text-xl font-black text-indigo-500 mt-2">
                          Rp {relMotor.price.toLocaleString('id-ID')}
                        </div>
                        <div className={`flex gap-3 mt-3 text-xs ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>
                          <span>{relMotor.mileage.toLocaleString('id-ID')} Km</span>
                          <span>•</span>
                          <span>{relMotor.transmission}</span>
                        </div>
                      </div>
                    </div>
                  </Link>
                )
              })}
            </div>
          </section>
        )}

        {/* CTA: JUAL MOTOR ANDA */}
        <section className="max-w-6xl mx-auto mt-20 px-4 sm:px-6">
          <div className={`border rounded-3xl p-6 sm:p-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 shadow-xl ${
            theme === 'dark' ? 'bg-gradient-to-r from-indigo-950 to-slate-900 border-indigo-500/20' : 'bg-gradient-to-r from-slate-100 to-indigo-50/40 border-slate-200'
          }`}>
            <div className="space-y-2">
              <span className="inline-block text-[10px] bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 font-black px-2.5 py-1 rounded-md uppercase tracking-widest">
                Mitra Kulakan Showroom
              </span>
              <h3 className={`text-xl sm:text-2xl font-black tracking-tight ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>
                Mau Jual Motor Bekas Anda <span className="text-indigo-500">Dengan Harga Tinggi?</span>
              </h3>
              <p className={`text-xs max-w-2xl leading-relaxed ${theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}`}>
                Kami siap menampung motor bekas Anda! Proses cepat, taksiran harga transparan adil, dan tim inspektor kami siap datang ke lokasi.
              </p>
            </div>
            <button onClick={handleSellToShowroomWA} className="w-full md:w-auto shrink-0 px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white text-xs sm:text-sm font-black rounded-xl transition shadow-lg uppercase tracking-wider cursor-pointer">
              🤝 Ajukan Jual Motor
            </button>
          </div>
        </section>

        {/* INFO KONTAK SHOWROOM */}
        <section className="max-w-6xl mx-auto mt-20 mb-12 px-4 sm:px-6">
          <div className={`border rounded-3xl p-6 sm:p-8 shadow-xl ${
            theme === 'dark' ? 'bg-gradient-to-br from-slate-900 to-slate-950 border-slate-800' : 'bg-white border-slate-200'
          }`}>
            <span className="text-[10px] bg-indigo-950 text-indigo-400 border border-indigo-800 font-bold uppercase tracking-widest px-3 py-1 rounded-md">
              KUNJUNGI SHOWROOM
            </span>
            <h3 className={`text-2xl sm:text-3xl font-black tracking-tight mt-3 ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>
              Lihat Unit Langsung di <span className="text-indigo-500">Lokasi Kami</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6">
              <div className={`p-4 rounded-xl border flex gap-3 items-start ${theme === 'dark' ? 'bg-slate-950/60 border-slate-800/60' : 'bg-slate-50 border-slate-100'}`}>
                <MapPin className="w-5 h-5 text-indigo-500 shrink-0 mt-0.5" />
                <div>
                  <h5 className={`text-xs font-bold uppercase tracking-wider ${theme === 'dark' ? 'text-white' : 'text-slate-800'}`}>Lokasi Showroom</h5>
                  <p className={`text-xs mt-1 leading-relaxed ${theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}`}>{storeConfig?.showroom_address || 'Jl. Showroom Utama MotoSell Premium No.01'}</p>
                </div>
              </div>
              <div className={`p-4 rounded-xl border flex gap-3 items-start ${theme === 'dark' ? 'bg-slate-950/60 border-slate-800/60' : 'bg-slate-50 border-slate-100'}`}>
                <Clock className="w-5 h-5 text-indigo-500 shrink-0 mt-0.5" />
                <div>
                  <h5 className={`text-xs font-bold uppercase tracking-wider ${theme === 'dark' ? 'text-white' : 'text-slate-800'}`}>Jam Operasional</h5>
                  <p className={`text-xs mt-1 leading-relaxed ${theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}`}>{storeConfig?.operational_hours || 'Setiap Hari: 09:00 - 18:00 WIB'}</p>
                </div>
              </div>
              <div className={`p-4 rounded-xl border flex gap-3 items-start ${theme === 'dark' ? 'bg-slate-950/60 border-slate-800/60' : 'bg-slate-50 border-slate-100'}`}>
                <Phone className="w-5 h-5 text-indigo-500 shrink-0 mt-0.5" />
                <div>
                  <h5 className={`text-xs font-bold uppercase tracking-wider ${theme === 'dark' ? 'text-white' : 'text-slate-800'}`}>Kontak WhatsApp</h5>
                  <p className={`text-xs mt-1 leading-relaxed ${theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}`}>+{storeConfig?.whatsapp_number || '6281234567890'}</p>
                </div>
              </div>
              <div className={`p-4 rounded-xl border flex gap-3 items-start ${theme === 'dark' ? 'bg-slate-950/60 border-slate-800/60' : 'bg-slate-50 border-slate-100'}`}>
                <Mail className="w-5 h-5 text-indigo-500 shrink-0 mt-0.5" />
                <div>
                  <h5 className={`text-xs font-bold uppercase tracking-wider ${theme === 'dark' ? 'text-white' : 'text-slate-800'}`}>Email Support</h5>
                  <p className={`text-xs mt-1 leading-relaxed ${theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}`}>{storeConfig?.support_email || 'support@motosell.com'}</p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* FOOTER */}
      <footer className={`w-full border-t pt-12 transition-colors duration-300 ${
        theme === 'dark' ? 'bg-slate-950 border-slate-900' : 'bg-white border-slate-200'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-8 grid grid-cols-1 md:grid-cols-3 gap-8 pb-8">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-indigo-600 rounded-xl text-white font-black">MS</div>
              <h4 className={`text-lg font-black tracking-wider ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>
                MOTO<span className="text-indigo-500">SELL</span>
              </h4>
            </div>
            <p className={`text-xs leading-relaxed max-w-sm ${theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}`}>
              Showroom motor bekas modern dan berkualitas premium terpercaya.
            </p>
          </div>
          <div className="space-y-3">
            <h5 className={`text-xs font-black uppercase tracking-widest border-b pb-2 max-w-[100px] ${
              theme === 'dark' ? 'text-slate-300 border-slate-900' : 'text-slate-800 border-slate-100'
            }`}>Link Cepat</h5>
            <div className={`flex flex-col gap-2 text-xs font-bold ${theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}`}>
              <Link href="/motors" className="hover:text-indigo-500 transition">Katalog Semua Motor</Link>
              <Link href="/" className="hover:text-indigo-500 transition">Kembali ke Beranda</Link>
            </div>
          </div>
          <div className="space-y-3">
            <h5 className={`text-xs font-black uppercase tracking-widest border-b pb-2 max-w-[150px] ${
              theme === 'dark' ? 'text-slate-300 border-slate-900' : 'text-slate-800 border-slate-100'
            }`}>Ikuti Kami</h5>
            <div className="flex items-center gap-3 text-slate-400">
              <a href={storeConfig?.instagram_url || '#'} target="_blank" rel="noreferrer" className={`p-2 rounded-xl hover:bg-indigo-600 hover:text-white transition shadow-md ${theme === 'dark' ? 'bg-slate-900' : 'bg-slate-100 text-slate-600'}`}><Camera className="w-4 h-4" /></a>
              <a href={`https://wa.me/${storeConfig?.whatsapp_number || ''}`} target="_blank" rel="noreferrer" className={`p-2 rounded-xl hover:bg-indigo-600 hover:text-white transition shadow-md ${theme === 'dark' ? 'bg-slate-900' : 'bg-slate-100 text-slate-600'}`}><Phone className="w-4 h-4" /></a>
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
          © {new Date().getFullYear()} MOTOSELL PREMIUM SHOWROOM
        </div>
      </footer>
    </div>
  )
}