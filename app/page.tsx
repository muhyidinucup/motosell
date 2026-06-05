'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { getActiveBanners, getReadyMotors } from '@/actions/public'
import { getBrands } from '@/actions/brand'
import { getStoreSettings } from '@/actions/settings' // 👈 Impor Karyawan Backend Settings
import { Search, ShieldCheck, Fuel, Gauge, Award, MessageCircle, ChevronLeft, ChevronRight, Calendar, MapPin, Clock, Phone, Mail, Camera, ShieldAlert, Menu, X } from 'lucide-react'

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

  useEffect(() => {
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

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center font-bold animate-pulse">
        MEMUAT KATALOG MOTOR MOTOSELL...
      </div>
    )
  }

  return (
    <div className="bg-slate-950 text-slate-100 min-h-screen font-sans antialiased flex flex-col justify-between">
      
      <div>
        {/* 🧭 NAVBAR DENGAN MENU HAMBURGER PREMIUM */}
        <nav className="bg-slate-900/80 backdrop-blur-md border-b border-slate-800 sticky top-0 z-50 px-4 sm:px-8 py-4 flex justify-between items-center max-w-7xl mx-auto rounded-b-2xl">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-indigo-600 rounded-xl text-white font-black shadow-lg shadow-indigo-600/30">MS</div>
            <h1 className="text-xl font-black tracking-wider text-white">MOTO<span className="text-indigo-500">SELL</span></h1>
          </div>

          {/* 💻 MENU LAPTOP / DESKTOP */}
          <div className="hidden md:flex items-center gap-4 text-sm font-bold text-slate-400">
            <Link href="/motors" className="hover:text-white transition">Katalog</Link>
            <a href="#tentang-kami" className="hover:text-white transition">Tentang Kami</a>
            
            <button 
              onClick={handleSellToShowroomWA}
              className="px-3 py-1.5 bg-indigo-600/20 hover:bg-indigo-600 text-indigo-400 hover:text-white rounded-xl border border-indigo-500/30 text-xs font-bold transition uppercase tracking-wider"
            >
              🤝 Jual Motor
            </button>

            {/* 🌟 REVISI: Mengubah teks Console Admin menjadi Panel Admin */}
            <a href="/admin/dashboard" className="px-3 py-1.5 bg-white/5 hover:bg-white/10 rounded-xl border border-white/10 text-slate-200 text-xs font-semibold transition">Panel Admin</a>
          </div>

          {/* 📱 TOMBOL HAMBURGER DI HP */}
          <div className="md:hidden flex items-center">
            <button 
              onClick={() => setIsMenuOpen(!isMenuOpen)} 
              className="p-2 text-slate-400 hover:text-white bg-slate-800/50 rounded-xl border border-slate-700/50 transition focus:outline-none"
            >
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </nav>

        {/* 📱 LACI DROP-DOWN MENU HAMBURGER MOBILE */}
        {isMenuOpen && (
          <div className="md:hidden max-w-7xl mx-auto px-4 mt-2 sticky top-[73px] z-40 animate-in fade-in slide-in-from-top-4 duration-200">
            <div className="bg-slate-900/95 backdrop-blur-lg border border-slate-800 rounded-2xl p-5 flex flex-col gap-4 shadow-2xl">
              <Link 
                href="/motors" 
                onClick={() => setIsMenuOpen(false)}
                className="text-sm font-bold text-slate-300 hover:text-white bg-slate-950/40 p-3 rounded-xl border border-slate-800/40 transition"
              >
                🏍️ Katalog Motor
              </Link>
              <a 
                href="#tentang-kami" 
                onClick={() => setIsMenuOpen(false)}
                className="text-sm font-bold text-slate-300 hover:text-white bg-slate-950/40 p-3 rounded-xl border border-slate-800/40 transition"
              >
                🏢 Tentang Kami
              </a>
              
              <button 
                onClick={handleSellToShowroomWA}
                className="w-full text-left text-sm font-black text-indigo-400 hover:text-white bg-indigo-600/10 hover:bg-indigo-600 p-3 rounded-xl border border-indigo-500/20 transition uppercase tracking-wider"
              >
                🤝 Jual Motor Anda
              </button>

              {/* 🌟 REVISI: Mengubah teks Console Admin Panel menjadi Panel Admin */}
              <Link 
                href="/admin/dashboard" 
                onClick={() => setIsMenuOpen(false)}
                className="text-sm font-bold text-slate-200 hover:text-white bg-white/5 hover:bg-white/10 p-3 rounded-xl border border-white/10 text-center transition"
              >
                ⚙️ Panel Admin
              </Link>
            </div>
          </div>
        )}

        {/* 🎬 DYNAMIC BANNER SLIDER SECTION */}
        <div className="max-w-7xl mx-auto mt-6 px-4 sm:px-6 relative group">
          {banners.length === 0 ? (
            <div className="w-full h-48 md:h-80 bg-slate-900 rounded-3xl border border-slate-800 flex items-center justify-center text-slate-500 font-medium">
              Belum ada spanduk promo aktif yang di-publish.
            </div>
          ) : (
            <div className="w-full h-48 sm:h-64 md:h-96 relative overflow-hidden rounded-3xl border border-slate-800 shadow-2xl bg-slate-900">
              <img 
                src={banners[currentBanner]?.image_url} 
                alt={banners[currentBanner]?.title}
                className="w-full h-full object-cover select-none transition-all duration-700 ease-in-out" 
              />
              
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/10 to-transparent p-6 md:p-10" />

              {banners.length > 1 && (
                <>
                  <button 
                    onClick={() => setCurrentBanner((prev) => (prev === 0 ? banners.length - 1 : prev - 1))}
                    className="absolute left-4 top-1/2 -translate-y-1/2 p-2 bg-slate-900/70 border border-white/10 rounded-full text-white opacity-0 group-hover:opacity-100 transition duration-200"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <button 
                    onClick={() => setCurrentBanner((prev) => (prev + 1) % banners.length)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 p-2 bg-slate-900/70 border border-white/10 rounded-full text-white opacity-0 group-hover:opacity-100 transition duration-200"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </>
              )}
            </div>
          )}
        </div>

        {/* 🔍 SEARCH AND BRAND FILTER CONTROLS */}
        <section id="katalog" className="max-w-7xl mx-auto mt-12 px-4 sm:px-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 border-b border-slate-800 pb-6">
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2">
                <span className="w-3 h-6 bg-indigo-500 rounded-full" />
                Motor <span className="text-indigo-500">Ready Stock</span>
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">Semua unit lulus inspeksi ketat dan surat-surat dijamin aman tembus.</p>
            </div>

            <div className="relative w-full md:w-80">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-500"><Search className="w-4 h-4" /></span>
              <input 
                type="text"
                placeholder="Cari model motor (e.g. Vario, Aerox)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
              />
            </div>
          </div>

          <div className="flex gap-2 overflow-x-auto pb-2 pt-4 scrollbar-none">
            <button
              onClick={() => setSelectedBrand('ALL')}
              className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition shrink-0 border ${
                selectedBrand === 'ALL'
                  ? 'bg-indigo-600 text-white border-indigo-500 shadow-md'
                  : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white'
              }`}
            >
              Semua Merek
            </button>
            {brands.map((brand) => (
              <button
                key={brand.id}
                onClick={() => setSelectedBrand(brand.code)}
                className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition shrink-0 border ${
                  selectedBrand === brand.code
                    ? 'bg-indigo-600 text-white border-indigo-500 shadow-md'
                    : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white'
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
            <div className="py-16 text-center bg-slate-900/50 border border-dashed border-slate-800 rounded-3xl text-slate-500 font-medium">
              Tidak ada unit motor "{searchQuery}" yang ready stock saat ini.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredMotors.map((motor) => {
                const primaryPhoto = motor.motor_code === "HON-001" ? "/vercel.svg" : (motor.motor_images?.find(img => img.is_primary)?.image_url || motor.motor_images[0]?.image_url || '/placeholder.png');

                return (
                  <div key={motor.id} className="bg-slate-900 border border-slate-800 hover:border-indigo-500/50 rounded-2xl overflow-hidden group shadow-lg hover:shadow-indigo-500/5 transition-all duration-300 flex flex-col justify-between">
                    <div>
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
                            <h3 className="font-black text-base text-white tracking-tight group-hover:text-indigo-400 transition truncate cursor-pointer">
                              {motor.model}
                            </h3>
                          </Link>
                          <span className="text-xs font-mono font-bold text-slate-500 bg-slate-950 px-2 py-0.5 rounded border border-slate-800 shrink-0">{motor.motor_code}</span>
                        </div>
                        
                        <div className="text-xl font-black text-indigo-400 mt-2">
                          Rp {motor.price.toLocaleString('id-ID')}
                        </div>

                        <div className="grid grid-cols-2 gap-3 mt-4 border-t border-slate-800/60 pt-4 text-xs font-medium text-slate-400">
                          <div className="flex items-center gap-2 truncate">
                            <Fuel className="w-4 h-4 text-slate-500 shrink-0" />
                            <span className="truncate capitalize">{motor.transmission}</span>
                          </div>
                          <div className="flex items-center gap-2 truncate">
                            <Gauge className="w-4 h-4 text-slate-500 shrink-0" />
                            <span className="truncate">{motor.mileage.toLocaleString('id-ID')} Km</span>
                          </div>
                          <div className="flex items-center gap-2 truncate">
                            <Calendar className="w-4 h-4 text-slate-500 shrink-0" />
                            <span>Tahun {motor.year}</span>
                          </div>
                          <div className="flex items-center gap-2 truncate">
                            <Award className="w-4 h-4 text-slate-500 shrink-0" />
                            <span className="text-emerald-500 truncate font-semibold">{motor.condition}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="p-5 pt-0">
                      <button
                        onClick={() => handleWhatsAppClick(motor)}
                        className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs tracking-wider uppercase flex items-center justify-center gap-2 transition shadow-md"
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
          <div className="bg-gradient-to-r from-indigo-950 to-slate-900 border border-indigo-500/20 rounded-3xl p-6 sm:p-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 shadow-xl">
            <div className="space-y-2">
              <span className="inline-block text-[10px] bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 font-black px-2.5 py-1 rounded-md uppercase tracking-widest">
                Mitra Kulakan Showroom
              </span>
              <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                Mau Jual Motor Bekas Anda <span className="text-indigo-400">Dengan Harga Tinggi?</span>
              </h3>
              <p className="text-xs text-slate-400 max-w-2xl leading-relaxed">
                Kami siap menampung motor bekas Anda! Proses cepat, taksiran harga transparan adil, dan tim inspektor kami siap datang ke lokasi. Klik ajukan penawaran via WhatsApp sekarang.
              </p>
            </div>
            <button
              onClick={handleSellToShowroomWA}
              className="w-full md:w-auto shrink-0 px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white text-xs sm:text-sm font-black rounded-xl transition shadow-lg uppercase tracking-wider text-center"
            >
              🤝 Ajukan Jual Motor
            </button>
          </div>
        </section>

        {/* 🏆 BANNER / SECTION KEUNGGULAN SHOWROOM */}
        <section id="keunggulan" className="max-w-7xl mx-auto mt-20 px-4 sm:px-6 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-gradient-to-br from-slate-900 to-indigo-950/20 p-6 rounded-2xl border border-slate-800 flex items-start gap-4">
            <div className="p-3 bg-indigo-600/10 rounded-xl border border-indigo-500/20 text-indigo-400 shrink-0"><ShieldCheck className="w-6 h-6" /></div>
            <div>
              <h4 className="font-bold text-sm uppercase tracking-wider text-white">Garansi Mesin</h4>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">Semua unit di MotoSell dilindungi garansi mesin 3 bulan untuk menjamin kenyamanan berkendara Anda.</p>
            </div>
          </div>
          <div className="bg-gradient-to-br from-slate-900 to-indigo-950/20 p-6 rounded-2xl border border-slate-800 flex items-start gap-4">
            <div className="p-3 bg-indigo-600/10 rounded-xl border border-indigo-500/20 text-indigo-400 shrink-0"><Award className="w-6 h-6" /></div>
            <div>
              <h4 className="font-bold text-sm uppercase tracking-wider text-white">Lulus Inspeksi 100%</h4>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">Setiap motor telah melalui pengetesan kelistrikan, cek rangka, serta uji kompresi mesin secara detail.</p>
            </div>
          </div>
          <div className="bg-gradient-to-br from-slate-900 to-indigo-950/20 p-6 rounded-2xl border border-slate-800 flex items-start gap-4">
            <div className="p-3 bg-indigo-600/10 rounded-xl border border-indigo-500/20 text-indigo-400 shrink-0"><MessageCircle className="w-6 h-6" /></div>
            <div>
              <h4 className="font-bold text-sm uppercase tracking-wider text-white">Nego Sampai Deal</h4>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">Hubungi admin kami lewat WhatsApp, atur jadwal ketemuan/COD, dan lakukan nego harga terbaik langsung di lokasi.</p>
            </div>
          </div>
        </section>

        {/* 🏢 SECTION INFORMASI PROFILE DETAIL MOTOSELL (DINAMIS DATABASE) */}
        <section id="tentang-kami" className="max-w-7xl mx-auto mt-20 mb-12 px-4 sm:px-6">
          <div className="bg-gradient-to-br from-slate-900 to-slate-950 border border-slate-800 rounded-3xl p-6 sm:p-10 grid grid-cols-1 lg:grid-cols-2 gap-8 items-center shadow-xl">
            <div>
              <span className="text-[10px] bg-indigo-950 text-indigo-400 border border-indigo-800 font-bold uppercase tracking-widest px-3 py-1 rounded-md">PROFIL SHOWROOM</span>
              <h3 className="text-2xl sm:text-3xl font-black text-white tracking-tight mt-3">
                MotoSell: Solusi Jual Beli Motor Bekas <span className="text-indigo-500">Bergaransi & Tepercaya</span>
              </h3>
              <p className="text-xs sm:text-sm text-slate-400 mt-4 leading-relaxed font-medium">
                MotoSell hadir sebagai showroom motor bekas modern yang mengutamakan kualitas motor dan kepuasan pelanggan. Kami memahami bahwa membeli kendaraan bekas seringkali memicu kekhawatiran, oleh karena itu setiap motor di MotoSell wajib melewati tahapan **12 Titik Inspeksi Fisik & Mesin** sebelum dipajang di etalase kami.
              </p>
              <p className="text-xs sm:text-sm text-slate-400 mt-3 leading-relaxed font-medium">
                With transparansi condition unit, jaminan surat-surat kendaraan asli tembus hukum, serta layanan purnajual berupa garansi mesin, kami berkomitmen memberikan pengalaman bertransaksi yang aman, nyaman, dan bebas rasa cemas bagi seluruh pelanggan kami.
              </p>
            </div>
            
            {/* Grid Informasi Kontak Dinamis */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800/60 flex gap-3 items-start">
                <MapPin className="w-5 h-5 text-indigo-500 shrink-0 mt-0.5" />
                <div>
                  <h5 className="text-xs font-bold text-white uppercase tracking-wider">Lokasi Showroom</h5>
                  <p className="text-xs text-slate-400 mt-1 leading-relaxed">{storeConfig?.showroom_address || 'Loading alamat...'}</p>
                </div>
              </div>
              <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800/60 flex gap-3 items-start">
                <Clock className="w-5 h-5 text-indigo-500 shrink-0 mt-0.5" />
                <div>
                  <h5 className="text-xs font-bold text-white uppercase tracking-wider">Jam Operasional</h5>
                  <p className="text-xs text-slate-400 mt-1 leading-relaxed">{storeConfig?.operational_hours || 'Loading jam kerja...'}</p>
                </div>
              </div>
              <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800/60 flex gap-3 items-start">
                <Phone className="w-5 h-5 text-indigo-500 shrink-0 mt-0.5" />
                <div>
                  <h5 className="text-xs font-bold text-white uppercase tracking-wider">Kontak WhatsApp</h5>
                  <p className="text-xs text-slate-400 mt-1 leading-relaxed">+{storeConfig?.whatsapp_number || 'Loading kontak...'}</p>
                </div>
              </div>
              <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800/60 flex gap-3 items-start">
                <Mail className="w-5 h-5 text-indigo-500 shrink-0 mt-0.5" />
                <div>
                  <h5 className="text-xs font-bold text-white uppercase tracking-wider">Email Support</h5>
                  <p className="text-xs text-slate-400 mt-1 leading-relaxed">{storeConfig?.support_email || 'Loading email...'}</p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* 🏁 PREMIUM GLOBAL BLACK FOOTER (DINAMIS DATABASE) */}
      <footer className="w-full bg-slate-950 border-t border-slate-900 pt-12 mt-12">
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
              <a href="#tentang-kami" className="hover:text-indigo-400 transition">Tentang Showroom</a>
              <a href="#keunggulan" className="hover:text-indigo-400 transition">Pilar Keunggulan</a>
              {/* 🌟 REVISI: Mengubah tautan footer menjadi Panel Admin */}
              <Link href="/admin/dashboard" className="hover:text-indigo-400 transition">Sistem Panel Admin</Link>
            </div>
          </div>
          <div className="space-y-3">
            <h5 className="text-xs font-black uppercase tracking-widest text-slate-300 border-b border-slate-900 pb-2 max-w-[150px]">Ikuti Media Sosial</h5>
            <div className="flex items-center gap-3 text-slate-400">
              <a href={storeConfig?.instagram_url || 'https://instagram.com'} target="_blank" rel="noreferrer" className="p-2 bg-slate-900 hover:bg-indigo-600 rounded-xl hover:text-white transition shadow-md"><Camera className="w-4 h-4" /></a>
              <button onClick={handleSellToShowroomWA} className="p-2 bg-slate-900 hover:bg-indigo-600 rounded-xl hover:text-white transition shadow-md"><Phone className="w-4 h-4" /></button>
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