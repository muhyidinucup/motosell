'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { getActiveBanners, getReadyMotors } from '@/actions/public'
import { getBrands } from '@/actions/brand'
import { getStoreSettings } from '@/actions/settings' // 👈 Impor Karyawan Backend Settings
import { Search, ShieldCheck, Fuel, Gauge, Award, MessageCircle, ChevronLeft, ChevronRight, Calendar, MapPin, Clock, Phone, Mail, Camera, ShieldAlert, Menu, X, Sun, Moon } from 'lucide-react'

interface Banner {
  id: number
  title: string
  image_url: string
  link_url: string | null
}

interface Motor {
  id: number
  motor_code: string
  model: string
  slug: string
  year: number
  price: number
  mileage: number
  transmission: string
  condition: string
  description: string | null
  motor_images: { image_url: string; is_primary: boolean }[]
  brands: { name: string; code: string }
}

interface Brand {
  id: number
  name: string
  code: string
}

export default function PublicHomepage() {
  const [banners, setBanners] = useState<Banner[]>([])
  const [motors, setMotors] = useState<Motor[]>([])
  const [brands, setBrands] = useState<Brand[]>([])
  const [storeConfig, setStoreConfig] = useState<any>(null) // 👈 State Penampung Pengaturan Toko Dinamis
  
  const [currentBanner, setCurrentBanner] = useState(0)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedBrand, setSelectedBrand] = useState('ALL')
  const [loading, setLoading] = useState(true)

  // 🌟 STATE: Mengontrol Laci Menu Hamburger Buka-Tutup di HP
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  // 🌓 STATE: Mengontrol Tema Sistem (Dark Mode / Light Mode)
  const [theme, setTheme] = useState<'dark' | 'light'>('dark')

  useEffect(() => {
    // Membaca sesi pilihan tema konsumen yang tersimpan di browser lokal
    if (typeof window !== 'undefined') {
      const savedTheme = localStorage.getItem('motosell-theme') as 'dark' | 'light'
      if (savedTheme) {
        setTheme(savedTheme)
      }
    }

    async function loadPublicData() {
      try {
        const [bannersData, motorsData, brandsData, settingsData] = await Promise.all([
          getActiveBanners(),
          getReadyMotors(),
          getBrands(),
          getStoreSettings() // 👈 Tarik data live dari tabel settings
        ])
        setBanners(bannersData as Banner[])
        setMotors(motorsData as unknown as Motor[])
        setBrands(brandsData as unknown as Brand[])
        setStoreConfig(settingsData)
      } catch (err) {
        console.error('Gagal memuat data halaman beranda:', err)
      } finally {
        setLoading(false)
      }
    }
    loadPublicData()
  }, [])

  useEffect(() => {
    if (banners.length <= 1) return
    const interval = setInterval(() => {
      setCurrentBanner((prev) => (prev + 1) % banners.length)
    }, 5000)
    return () => clearInterval(interval)
  }, [banners])

  const filteredMotors = motors.filter(motor => {
    const matchesSearch = motor.model.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          motor.motor_code.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesBrand = selectedBrand === 'ALL' || motor.brands?.code === selectedBrand
    return matchesSearch && matchesBrand
  })

  const handleWhatsAppClick = (motor: Motor) => {
    const nomorWA = storeConfig?.whatsapp_number || '6281234567890' // 👈 Otomatis Ambil dari Database
    const teksPesan = `Halo Admin MotoSell, saya tertarik dan ingin menanyakan unit yang ada di website:\n\n*Unit:* ${motor.brands?.name} ${motor.model}\n*Kode:* ${motor.motor_code}\n*Harga:* Rp ${motor.price.toLocaleString('id-ID')}\n\nApakah unit ini masih ready untuk di-cek ke lokasi? Terima kasih.`
    window.open(`https://wa.me/${nomorWA}?text=${encodeURIComponent(teksPesan)}`, '_blank')
  }

  // 🤝 SKENARIO 1: TOMBOL WA OTOMATIS JALAN UNTUK KONSUMEN YANG MAU JUAL MOTOR KE MOTOSELL
  const handleSellToShowroomWA = () => {
    const nomorWA = storeConfig?.whatsapp_number || '6281234567890'
    const teksFormat = `Halo Admin MotoSell, saya berencana mau menawarkan unit motor bekas saya untuk dijual ke showroom dengan detail berikut:\n\n• *Nama Pemilik:* \n• *Merek & Tipe Motor:* \n• *Tahun Perakitan:* \n• *Kondisi / Minus Fisik:* \n• *Harga Penawaran:* Rp \n\nMohon informasi perkiraan taksiran harga showroom dan jadwal inspeksi unitnya ya Admin. Terima kasih!`
    window.open(`https://wa.me/${nomorWA}?text=${encodeURIComponent(teksFormat)}`, '_blank')
    setIsMenuOpen(false) // Tutup laci menu otomatis
  }

  // 🌓 HANDLER: Mengubah tema malam/siang secara real-time
  const toggleTheme = () => {
    const nextTheme = theme === 'dark' ? 'light' : 'dark'
    setTheme(nextTheme)
    localStorage.setItem('motosell-theme', nextTheme)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center font-bold animate-pulse">
        MEMUAT KATALOG MOTOR MOTOSELL...
      </div>
    )
  }

  return (
    <div className={`min-h-screen font-sans antialiased flex flex-col justify-between transition-colors duration-300 ${
      theme === 'dark' ? 'bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-900'
    }`}>
      
      <div>
        {/* 🧭 NAVBAR DENGAN SWITCHER TEMA & MENU HAMBURGER PREMIUM */}
        <nav className={`backdrop-blur-md border-b sticky top-0 z-50 px-4 sm:px-8 py-4 flex justify-between items-center max-w-7xl mx-auto rounded-b-2xl transition-colors duration-300 ${
          theme === 'dark' ? 'bg-slate-900/80 border-slate-800' : 'bg-white/90 border-slate-200 shadow-xs'
        }`}>
          <div className="flex items-center gap-2">
            <div className="p-2 bg-indigo-600 rounded-xl text-white font-black shadow-lg shadow-indigo-600/30">MS</div>
            <h1 className={`text-xl font-black tracking-wider ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>
              MOTO<span className="text-indigo-500">SELL</span>
            </h1>
          </div>

          {/* 💻 MENU LAPTOP / DESKTOP */}
          <div className="hidden md:flex items-center gap-5 text-sm font-bold">
            <Link href="/motors" className={`transition ${theme === 'dark' ? 'text-slate-400 hover:text-white' : 'text-slate-600 hover:text-slate-900'}`}>Katalog</Link>
            <a href="#tentang-kami" className={`transition ${theme === 'dark' ? 'text-slate-400 hover:text-white' : 'text-slate-600 hover:text-slate-900'}`}>Tentang Kami</a>
            
            <button 
              onClick={handleSellToShowroomWA}
              className="px-3 py-1.5 bg-indigo-600/20 hover:bg-indigo-600 text-indigo-400 hover:text-white rounded-xl border border-indigo-500/30 text-xs font-bold transition uppercase tracking-wider cursor-pointer"
            >
              🤝 Jual Motor
            </button>

            {/* 🌟 REVISI: Mengubah teks Console Admin menjadi Panel Admin */}
            <a href="/admin/dashboard" className={`px-3 py-1.5 rounded-xl border text-xs font-semibold transition ${
              theme === 'dark' ? 'bg-white/5 border-white/10 text-slate-200' : 'bg-slate-100 border-slate-200 text-slate-700 hover:bg-slate-200'
            }`}>Panel Admin</a>

            {/* 🌓 ICON TOGGLE MODE FAJAR/MALAM */}
            <button 
              onClick={toggleTheme}
              title={theme === 'dark' ? 'Ganti ke Light Mode' : 'Ganti ke Dark Mode'}
              className={`p-2 rounded-xl border transition cursor-pointer ${
                theme === 'dark' ? 'bg-slate-800 border-slate-700 text-amber-400 hover:text-amber-300' : 'bg-slate-100 border-slate-200 text-indigo-600 hover:bg-slate-200'
              }`}
            >
              {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
          </div>

          {/* 📱 KELOMPOK TOMBOL DI HP */}
          <div className="md:hidden flex items-center gap-2">
            {/* Toggle Tema Mobile */}
            <button 
              onClick={toggleTheme}
              className={`p-2 rounded-xl border transition cursor-pointer ${
                theme === 'dark' ? 'bg-slate-800 border-slate-700 text-amber-400' : 'bg-slate-100 border-slate-200 text-indigo-600'
              }`}
            >
              {theme === 'dark' ? <Sun className="w-4.5 h-4.5" /> : <Moon className="w-4.5 h-4.5" />}
            </button>
            {/* Hamburger Button */}
            <button 
              onClick={() => setIsMenuOpen(!isMenuOpen)} 
              className={`p-2 rounded-xl border transition focus:outline-none cursor-pointer ${
                theme === 'dark' ? 'text-slate-400 hover:text-white bg-slate-800/50 border-slate-700/50' : 'text-slate-600 hover:text-slate-900 bg-slate-100 border-slate-200'
              }`}
            >
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </nav>

        {/* 📱 LACI DROP-DOWN MENU HAMBURGER MOBILE */}
        {isMenuOpen && (
          <div className="md:hidden max-w-7xl mx-auto px-4 mt-2 sticky top-[73px] z-40 animate-in fade-in slide-in-from-top-4 duration-200">
            <div className={`border rounded-2xl p-5 flex flex-col gap-4 shadow-2xl backdrop-blur-lg ${
              theme === 'dark' ? 'bg-slate-900/95 border-slate-800' : 'bg-white/95 border-slate-200'
            }`}>
              <Link 
                href="/motors" 
                onClick={() => setIsMenuOpen(false)}
                className={`text-sm font-bold p-3 rounded-xl border transition ${
                  theme === 'dark' ? 'text-slate-300 hover:text-white bg-slate-950/40 border-slate-800/40' : 'text-slate-700 hover:text-slate-900 bg-slate-50 border-slate-100'
                }`}
              >
                🏍️ Katalog Motor
              </Link>
              <a 
                href="#tentang-kami" 
                onClick={() => setIsMenuOpen(false)}
                className={`text-sm font-bold p-3 rounded-xl border transition ${
                  theme === 'dark' ? 'text-slate-300 hover:text-white bg-slate-950/40 border-slate-800/40' : 'text-slate-700 hover:text-slate-900 bg-slate-50 border-slate-100'
                }`}
              >
                🏢 Tentang Kami
              </a>
              
              <button 
                onClick={handleSellToShowroomWA}
                className="w-full text-left text-sm font-black text-indigo-400 hover:text-white bg-indigo-600/10 hover:bg-indigo-600 p-3 rounded-xl border border-indigo-500/20 transition uppercase tracking-wider cursor-pointer"
              >
                🤝 Jual Motor Anda
              </button>

              <Link 
                href="/admin/dashboard" 
                onClick={() => setIsMenuOpen(false)}
                className={`text-sm font-bold p-3 rounded-xl border text-center transition ${
                  theme === 'dark' ? 'text-slate-200 hover:text-white bg-white/5 border-white/10' : 'text-slate-700 bg-slate-100 border-slate-200'
                }`}
              >
                ⚙️ Panel Admin
              </Link>
            </div>
          </div>
        )}

        {/* 🎬 DYNAMIC BANNER SLIDER SECTION - ASPECT RATIO 16:9 */}
        <div className="max-w-7xl mx-auto mt-6 px-4 sm:px-6 relative group">
          {banners.length === 0 ? (
            <div className={`w-full aspect-video rounded-3xl border flex items-center justify-center font-medium ${
              theme === 'dark' ? 'bg-slate-900 border-slate-800 text-slate-500' : 'bg-white border-slate-200 text-slate-400 shadow-2xs'
            }`}>
              Belum ada spanduk promo aktif yang di-publish.
            </div>
          ) : (
            <div className={`w-full aspect-video relative overflow-hidden rounded-3xl border shadow-2xl ${
              theme === 'dark' ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
            }`}>
              <img 
                src={banners[currentBanner]?.image_url} 
                alt={banners[currentBanner]?.title || 'Banner Promo MotoSell'}
                className="w-full h-full object-cover select-none transition-all duration-700 ease-in-out" 
              />
              
              {/* Gradient Overlay */}
              <div className={`absolute inset-0 p-6 md:p-10 pointer-events-none ${
                theme === 'dark' ? 'bg-gradient-to-t from-slate-950/80 via-transparent to-transparent' : 'bg-gradient-to-t from-black/30 via-transparent to-transparent'
              }`} />

              {/* Navigasi Panah (hanya muncul jika > 1 banner) */}
              {banners.length > 1 && (
                <>
                  <button 
                    onClick={() => setCurrentBanner((prev) => (prev === 0 ? banners.length - 1 : prev - 1))}
                    className="absolute left-4 top-1/2 -translate-y-1/2 p-2 bg-black/50 hover:bg-black/70 backdrop-blur-sm border border-white/20 rounded-full text-white opacity-0 group-hover:opacity-100 transition duration-200 cursor-pointer z-10"
                    aria-label="Banner sebelumnya"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <button 
                    onClick={() => setCurrentBanner((prev) => (prev + 1) % banners.length)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 p-2 bg-black/50 hover:bg-black/70 backdrop-blur-sm border border-white/20 rounded-full text-white opacity-0 group-hover:opacity-100 transition duration-200 cursor-pointer z-10"
                    aria-label="Banner selanjutnya"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </>
              )}

              {/* Indikator Titik (Dots) */}
              {banners.length > 1 && (
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-10">
                  {banners.map((_, idx) => (
                    <button
                      key={idx}
                      onClick={() => setCurrentBanner(idx)}
                      className={`w-2.5 h-2.5 rounded-full transition-all duration-300 cursor-pointer ${
                        idx === currentBanner 
                          ? 'bg-white w-6' 
                          : 'bg-white/50 hover:bg-white/80'
                      }`}
                      aria-label={`Go to banner ${idx + 1}`}
                    />
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* 🔍 SEARCH AND BRAND FILTER CONTROLS */}
        <section id="katalog" className="max-w-7xl mx-auto mt-12 px-4 sm:px-6">
          <div className={`flex flex-col md:flex-row justify-between items-start md:items-center gap-6 border-b pb-6 ${
            theme === 'dark' ? 'border-slate-800' : 'border-slate-200'
          }`}>
            <div>
              <h2 className="text-xl sm:text-2xl font-black tracking-tight flex items-center gap-2">
                <span className="w-3 h-6 bg-indigo-500 rounded-full" />
                Motor <span className="text-indigo-500">Ready Stock</span>
              </h2>
              <p className={`text-xs mt-0.5 ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>Semua unit lulus inspeksi ketat dan surat-surat dijamin aman tembus.</p>
            </div>

            <div className="relative w-full md:w-80">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-500"><Search className="w-4 h-4" /></span>
              <input 
                type="text"
                placeholder="Cari model motor (e.g. Vario, Aerox)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={`w-full pl-10 pr-4 py-2.5 border rounded-xl text-sm placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition ${
                  theme === 'dark' ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-900 shadow-2xs'
                }`}
              />
            </div>
          </div>

          <div className="flex gap-2 overflow-x-auto pb-2 pt-4 scrollbar-none">
            <button
              onClick={() => setSelectedBrand('ALL')}
              className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition shrink-0 border cursor-pointer ${
                selectedBrand === 'ALL'
                  ? 'bg-indigo-600 text-white border-indigo-500 shadow-md'
                  : theme === 'dark' ? 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white' : 'bg-white text-slate-600 border-slate-200 hover:text-slate-900 shadow-2xs'
              }`}
            >
              Semua Merek
            </button>
            {brands.map((brand) => (
              <button
                key={brand.id}
                onClick={() => setSelectedBrand(brand.code)}
                className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition shrink-0 border cursor-pointer ${
                  selectedBrand === brand.code
                    ? 'bg-indigo-600 text-white border-indigo-500 shadow-md'
                    : theme === 'dark' ? 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white' : 'bg-white text-slate-600 border-slate-200 hover:text-slate-900 shadow-2xs'
                }`}
              >
                {brand.name}
              </button>
            ))}
          </div>
        </section>

        {/* 🏍️ ETALASE GRID KATALOG PRODUK */}
        <section className="max-w-7xl mx-auto mt-6 px-4 sm:px-6">
          {filteredMotors.length === 0 ? (
            <div className={`py-16 text-center border border-dashed rounded-3xl font-medium ${
              theme === 'dark' ? 'bg-slate-900/50 border-slate-800 text-slate-500' : 'bg-white border-slate-200 text-slate-400 shadow-2xs'
            }`}>
              Tidak ada unit motor "{searchQuery}" yang ready stock saat ini.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredMotors.map((motor) => {
                const primaryPhoto = motor.motor_images?.find(img => img.is_primary)?.image_url || motor.motor_images[0]?.image_url || '/placeholder.png';

                return (
                  <div key={motor.id} className={`border rounded-2xl overflow-hidden group shadow-lg transition-all duration-300 flex flex-col justify-between ${
                    theme === 'dark' ? 'bg-slate-900 border-slate-800 hover:border-indigo-500/50 hover:shadow-indigo-500/5' : 'bg-white border-slate-200 hover:border-indigo-500/40 hover:shadow-slate-200'
                  }`}>
                    <div>
                      {/* 🛡️ JALUR DETAIL MOTOR DIKUNCI 100% KE ASLINYA: app/motors/[slug]/page.tsx */}
                      <Link href={`/motors/${motor.slug}`} className="block w-full h-48 bg-slate-950 relative overflow-hidden cursor-pointer">
                        <img 
                          src={primaryPhoto} 
                          alt={motor.model}
                          className="w-full h-full object-cover group-hover:scale-105 transition duration-300 select-none" 
                        />
                        <span className="absolute top-3 left-3 bg-indigo-600/90 backdrop-blur-sm text-[10px] font-black tracking-widest px-2.5 py-1 rounded-md text-white border border-indigo-400/20 uppercase">
                          {motor.brands?.code}
                        </span>
                      </Link>

                      <div className="p-5">
                        <div className="flex justify-between items-start gap-2">
                          <Link href={`/motors/${motor.slug}`} className="block truncate max-w-[75%]">
                            <h3 className={`font-black text-base tracking-tight group-hover:text-indigo-500 transition truncate cursor-pointer ${
                              theme === 'dark' ? 'text-white' : 'text-slate-900'
                            }`}>
                              {motor.model}
                            </h3>
                          </Link>
                          <span className={`text-xs font-mono font-bold px-2 py-0.5 rounded border shrink-0 ${
                            theme === 'dark' ? 'text-slate-500 bg-slate-950 border-slate-800' : 'text-slate-400 bg-slate-50 border-slate-200'
                          }`}>{motor.motor_code}</span>
                        </div>
                        
                        <div className="text-xl font-black text-indigo-500 mt-2">
                          Rp {motor.price.toLocaleString('id-ID')}
                        </div>

                        <div className={`grid grid-cols-2 gap-3 mt-4 border-t pt-4 text-xs font-medium ${
                          theme === 'dark' ? 'border-slate-800/60 text-slate-400' : 'border-slate-100 text-slate-500'
                        }`}>
                          <div className="flex items-center gap-2 truncate">
                            <Fuel className="w-4 h-4 text-slate-400 shrink-0" />
                            <span className="truncate capitalize">{motor.transmission}</span>
                          </div>
                          <div className="flex items-center gap-2 truncate">
                            <Gauge className="w-4 h-4 text-slate-400 shrink-0" />
                            <span className="truncate">{motor.mileage.toLocaleString('id-ID')} Km</span>
                          </div>
                          <div className="flex items-center gap-2 truncate">
                            <Calendar className="w-4 h-4 text-slate-400 shrink-0" />
                            <span>Tahun {motor.year}</span>
                          </div>
                          <div className="flex items-center gap-2 truncate">
                            <Award className="w-4 h-4 text-slate-400 shrink-0" />
                            <span className="text-emerald-500 truncate font-semibold">{motor.condition}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="p-5 pt-0">
                      <button
                        onClick={() => handleWhatsAppClick(motor)}
                        className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs tracking-wider uppercase flex items-center justify-center gap-2 transition shadow-md cursor-pointer"
                      >
                        <MessageCircle className="w-4 h-4 fill-white" /> Hubungi via WhatsApp
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </section>

        {/* 🤝 BANNER: CALL-TO-ACTION UNTUK MASYARAKAT YANG MAU JUAL MOTOR KE SHOWROOM */}
        <section className="max-w-7xl mx-auto mt-20 px-4 sm:px-6">
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
                Kami siap menampung motor bekas Anda! Proses cepat, taksiran harga transparan adil, dan tim inspektor kami siap datang ke lokasi. Klik ajukan penawaran via WhatsApp sekarang.
              </p>
            </div>
            <button
              onClick={handleSellToShowroomWA}
              className="w-full md:w-auto shrink-0 px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white text-xs sm:text-sm font-black rounded-xl transition shadow-lg uppercase tracking-wider text-center cursor-pointer"
            >
              🤝 Ajukan Jual Motor
            </button>
          </div>
        </section>

        {/* 🏆 BANNER / SECTION KEUNGGULAN SHOWROOM */}
        <section id="keunggulan" className="max-w-7xl mx-auto mt-20 px-4 sm:px-6 grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { icon: <ShieldCheck className="w-6 h-6" />, title: 'Garansi Mesin', desc: 'Semua unit di MotoSell dilindungi garansi mesin 3 bulan untuk menjamin kenyamanan berkendara Anda.' },
            { icon: <Award className="w-6 h-6" />, title: 'Lulus Inspeksi 100%', desc: 'Setiap motor telah melalui pengetesan kelistrikan, cek rangka, serta uji kompresi mesin secara detail.' },
            { icon: <MessageCircle className="w-6 h-6" />, title: 'Nego Sampai Deal', desc: 'Hubungi admin kami lewat WhatsApp, atur jadwal ketemuan/COD, dan lakukan nego harga terbaik langsung di lokasi.' }
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

        {/* 🏢 SECTION INFORMASI PROFILE DETAIL MOTOSELL (DINAMIS DATABASE) */}
        <section id="tentang-kami" className="max-w-7xl mx-auto mt-20 mb-12 px-4 sm:px-6">
          <div className={`border rounded-3xl p-6 sm:p-10 grid grid-cols-1 lg:grid-cols-2 gap-8 items-center shadow-xl ${
            theme === 'dark' ? 'bg-gradient-to-br from-slate-900 to-slate-950 border-slate-800' : 'bg-white border-slate-200'
          }`}>
            <div>
              <span className="text-[10px] bg-indigo-950 text-indigo-400 border border-indigo-800 font-bold uppercase tracking-widest px-3 py-1 rounded-md">PROFIL SHOWROOM</span>
              <h3 className={`text-2xl sm:text-3xl font-black tracking-tight mt-3 ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>
                MotoSell: Solusi Jual Beli Motor Bekas <span className="text-indigo-500">Bergaransi & Tepercaya</span>
              </h3>
              <p className={`text-xs sm:text-sm mt-4 leading-relaxed font-medium ${theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}`}>
                MotoSell hadir sebagai showroom motor bekas modern yang mengutamakan kualitas motor dan kepuasan pelanggan. Kami memahami bahwa membeli kendaraan bekas seringkali memicu kekhawatiran, oleh karena itu setiap motor di MotoSell wajib melewati tahapan **12 Titik Inspeksi Fisik & Mesin** sebelum dipajang di etalase kami.
              </p>
              <p className={`text-xs sm:text-sm mt-3 leading-relaxed font-medium ${theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}`}>
                With transparansi condition unit, jaminan surat-surat kendaraan asli tembus hukum, serta layanan purnajual berupa garansi mesin, kami berkomitmen memberikan pengalaman bertransaksi yang aman, nyaman, dan bebas rasa cemas bagi seluruh pelanggan kami.
              </p>
            </div>
            
            {/* Grid Informasi Kontak Dinamis (KOREKSI FALLBACK SAFETY ANTI LOADING PERMANEN) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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

      {/* 🏁 PREMIUM GLOBAL FOOTER (DINAMIS DATABASE) */}
      <footer className={`w-full border-t pt-12 mt-12 transition-colors duration-300 ${
        theme === 'dark' ? 'bg-slate-950 border-slate-900' : 'bg-white border-slate-200'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-8 grid grid-cols-1 md:grid-cols-3 gap-8 pb-8">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-indigo-600 rounded-xl text-white font-black">MS</div>
              <h4 className={`text-lg font-black tracking-wider ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>MOTO<span className="text-indigo-500">SELL</span></h4>
            </div>
            <p className={`text-xs leading-relaxed max-w-sm ${theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}`}>
              Showroom motor bekas modern dan berkualitas premium terpercaya. Transparansi kondisi fisik and mesin terjamin lewat sertifikasi lulus inspeksi ketat.
            </p>
          </div>
          <div className="space-y-3">
            <h5 className={`text-xs font-black uppercase tracking-widest border-b pb-2 max-w-[100px] ${theme === 'dark' ? 'text-slate-300 border-slate-900' : 'text-slate-800 border-slate-100'}`}>Link Cepat</h5>
            <div className={`flex flex-col gap-2 text-xs font-bold ${theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}`}>
              <Link href="/motors" className="hover:text-indigo-500 transition">Katalog Semua Motor</Link>
              <a href="#tentang-kami" className="hover:text-indigo-500 transition">Tentang Showroom</a>
              <a href="#keunggulan" className="hover:text-indigo-500 transition">Pilar Keunggulan</a>
              <Link href="/admin/dashboard" className="hover:text-indigo-500 transition">Sistem Panel Admin</Link>
            </div>
          </div>
          <div className="space-y-3">
            <h5 className={`text-xs font-black uppercase tracking-widest border-b pb-2 max-w-[150px] ${theme === 'dark' ? 'text-slate-300 border-slate-900' : 'text-slate-800 border-slate-100'}`}>Ikuti Media Sosial</h5>
            <div className="flex items-center gap-3 text-slate-400">
              <a href={storeConfig?.instagram_url || 'https://instagram.com'} target="_blank" rel="noreferrer" className={`p-2 rounded-xl hover:bg-indigo-600 hover:text-white transition shadow-md ${theme === 'dark' ? 'bg-slate-900' : 'bg-slate-100 text-slate-600'}`}><Camera className="w-4 h-4" /></a>
              <button onClick={handleSellToShowroomWA} className={`p-2 rounded-xl hover:bg-indigo-600 hover:text-white transition shadow-md cursor-pointer ${theme === 'dark' ? 'bg-slate-900 text-slate-400' : 'bg-slate-100 text-slate-600'}`}><Phone className="w-4 h-4" /></button>
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