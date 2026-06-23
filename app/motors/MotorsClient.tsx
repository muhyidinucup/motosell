'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Search, Fuel, Gauge, Award, Calendar, ArrowLeft, Camera, Phone, ShieldAlert, Sun, Moon } from 'lucide-react'

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
  motor_images: { image_url: string; is_primary: boolean }[]
  brands: { name: string; code: string }
}

interface Brand {
  id: number
  name: string
  code: string
}

interface MotorsClientProps {
  motors: Motor[]
  brands: Brand[]
}

export default function MotorsClient({ motors, brands }: MotorsClientProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedBrand, setSelectedBrand] = useState('ALL')
  
  // 🌓 STATE: Sinkron tema dengan Beranda
  const [theme, setTheme] = useState<'dark' | 'light'>('dark')

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedTheme = localStorage.getItem('motosell-theme') as 'dark' | 'light'
      if (savedTheme) {
        setTheme(savedTheme)
      }
    }
  }, [])

  const toggleTheme = () => {
    const nextTheme = theme === 'dark' ? 'light' : 'dark'
    setTheme(nextTheme)
    localStorage.setItem('motosell-theme', nextTheme)
  }

  const filteredMotors = motors.filter(motor => {
    const matchesSearch = motor.model.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          motor.motor_code.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesBrand = selectedBrand === 'ALL' || motor.brands?.code === selectedBrand
    return matchesSearch && matchesBrand
  })

  return (
    <div className={`min-h-screen font-sans antialiased flex flex-col justify-between transition-colors duration-300 ${
      theme === 'dark' ? 'bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-900'
    }`}>
      
      {/* KONTEN UTAMA */}
      <div>
        {/* NAVBAR DENGAN TOGGLE TEMA */}
        <nav className={`backdrop-blur-md border-b sticky top-0 z-50 px-4 sm:px-8 py-4 flex justify-between items-center max-w-7xl mx-auto rounded-b-2xl transition-colors duration-300 ${
          theme === 'dark' ? 'bg-slate-900/80 border-slate-800' : 'bg-white/90 border-slate-200 shadow-xs'
        }`}>
          <Link 
            href="/"
            className={`flex items-center gap-2 text-xs font-bold transition px-4 py-2.5 rounded-xl border ${
              theme === 'dark' ? 'text-slate-400 hover:text-white bg-slate-900 border-slate-800' : 'text-slate-600 hover:text-slate-900 bg-white border-slate-200 shadow-2xs'
            }`}
          >
            <ArrowLeft className="w-4 h-4" /> Kembali ke Beranda
          </Link>
          
          <div className="flex items-center gap-3">
            <span className={`text-xs font-bold tracking-widest uppercase ${theme === 'dark' ? 'text-slate-500' : 'text-slate-400'}`}>
              Total: {filteredMotors.length} Unit Ready
            </span>
            
            {/* 🌓 ICON TOGGLE TEMA */}
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
        </nav>

        {/* Breadcrumb */}
        <nav className="max-w-7xl mx-auto px-4 sm:px-8 mt-4" aria-label="Breadcrumb">
          <ol className={`flex items-center gap-2 text-xs ${theme === 'dark' ? 'text-slate-500' : 'text-slate-400'}`}>
            <li>
              <Link href="/" className={`hover:text-indigo-400 transition ${theme === 'dark' ? '' : 'text-slate-600'}`}>Beranda</Link>
            </li>
            <li className={theme === 'dark' ? 'text-slate-600' : 'text-slate-300'}>/</li>
            <li className={`font-semibold ${theme === 'dark' ? 'text-slate-300' : 'text-slate-900'}`}>Katalog Motor</li>
          </ol>
        </nav>

        <section className="max-w-7xl mx-auto mt-8 px-4 sm:px-8">
          <div className={`flex flex-col md:flex-row justify-between items-start md:items-center gap-6 border-b pb-6 ${
            theme === 'dark' ? 'border-slate-800' : 'border-slate-200'
          }`}>
            <div>
              <h1 className={`text-2xl sm:text-3xl font-black tracking-tight ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>
                Katalog Lengkap <span className="text-indigo-500">Armada Showroom</span>
              </h1>
              <p className={`text-xs mt-1 ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>
                Cari, saring, dan temukan motor bekas berkualitas dengan harga terbaik.
              </p>
            </div>
            
            <div className="relative w-full md:w-80">
              <span className={`absolute inset-y-0 left-0 flex items-center pl-3.5 ${theme === 'dark' ? 'text-slate-500' : 'text-slate-400'}`}>
                <Search className="w-4 h-4" />
              </span>
              <input 
                type="text"
                placeholder="Ketik model atau kode motor..."
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

        <section className="max-w-7xl mx-auto mt-6 px-4 sm:px-8 mb-16">
          {filteredMotors.length === 0 ? (
            <div className={`py-16 text-center border border-dashed rounded-3xl font-medium ${
              theme === 'dark' ? 'bg-slate-900/50 border-slate-800 text-slate-500' : 'bg-white border-slate-200 text-slate-400 shadow-2xs'
            }`}>
              Tidak menemukan unit motor yang cocok dengan kriteria pencarian Anda.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredMotors.map((motor) => {
                const primaryPhoto = motor.motor_images?.find(img => img.is_primary)?.image_url || 
                                    motor.motor_images[0]?.image_url || 
                                    '/placeholder.png'

                return (
                  <Link 
                    href={`/motors/${motor.slug}`} 
                    key={motor.id} 
                    className={`border rounded-2xl overflow-hidden group shadow-lg transition-all duration-300 flex flex-col justify-between cursor-pointer ${
                      theme === 'dark' 
                        ? 'bg-slate-900 border-slate-800 hover:border-indigo-500/50 hover:shadow-indigo-500/5' 
                        : 'bg-white border-slate-200 hover:border-indigo-500/40 hover:shadow-slate-200'
                    }`}
                  >
                    <div>
                      <div className={`w-full h-48 relative overflow-hidden ${theme === 'dark' ? 'bg-slate-950' : 'bg-slate-100'}`}>
                        <img 
                          src={primaryPhoto} 
                          alt={`${motor.brands?.name} ${motor.model} tahun ${motor.year}`} 
                          className="w-full h-full object-cover group-hover:scale-105 transition duration-300 select-none" 
                        />
                        <span className="absolute top-3 left-3 bg-indigo-600/90 backdrop-blur-sm text-[10px] font-black tracking-widest px-2.5 py-1 rounded-md text-white border border-indigo-400/20 uppercase">
                          {motor.brands?.code}
                        </span>
                      </div>
                      <div className="p-5">
                        <div className="flex justify-between items-start gap-2">
                          <h3 className={`font-black text-base tracking-tight group-hover:text-indigo-500 transition truncate ${
                            theme === 'dark' ? 'text-white' : 'text-slate-900'
                          }`}>
                            {motor.model}
                          </h3>
                          <span className={`text-xs font-mono font-bold px-2 py-0.5 rounded border shrink-0 ${
                            theme === 'dark' ? 'text-slate-500 bg-slate-950 border-slate-800' : 'text-slate-400 bg-slate-50 border-slate-200'
                          }`}>
                            {motor.motor_code}
                          </span>
                        </div>
                        <div className="text-xl font-black text-indigo-500 mt-2">
                          Rp {motor.price.toLocaleString('id-ID')}
                        </div>
                        <div className={`grid grid-cols-2 gap-3 mt-4 border-t pt-4 text-xs font-medium ${
                          theme === 'dark' ? 'border-slate-800/60 text-slate-400' : 'border-slate-100 text-slate-500'
                        }`}>
                          <div className="flex items-center gap-2 truncate">
                            <Fuel className={`w-4 h-4 shrink-0 ${theme === 'dark' ? 'text-slate-500' : 'text-slate-400'}`} />
                            <span className="truncate capitalize">{motor.transmission}</span>
                          </div>
                          <div className="flex items-center gap-2 truncate">
                            <Gauge className={`w-4 h-4 shrink-0 ${theme === 'dark' ? 'text-slate-500' : 'text-slate-400'}`} />
                            <span className="truncate">{motor.mileage.toLocaleString('id-ID')} Km</span>
                          </div>
                          <div className="flex items-center gap-2 truncate">
                            <Calendar className={`w-4 h-4 shrink-0 ${theme === 'dark' ? 'text-slate-500' : 'text-slate-400'}`} />
                            <span>Tahun {motor.year}</span>
                          </div>
                          <div className="flex items-center gap-2 truncate">
                            <Award className={`w-4 h-4 shrink-0 ${theme === 'dark' ? 'text-slate-500' : 'text-slate-400'}`} />
                            <span className="text-emerald-500 truncate font-semibold">{motor.condition}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="p-5 pt-0">
                      <div className={`w-full py-3 font-bold rounded-xl text-xs tracking-wider uppercase text-center transition ${
                        theme === 'dark' ? 'bg-slate-800 group-hover:bg-indigo-600 text-white' : 'bg-slate-100 group-hover:bg-indigo-600 text-slate-700 group-hover:text-white'
                      }`}>
                        Lihat Detail Spesifikasi
                      </div>
                    </div>
                  </Link>
                )
              })}
            </div>
          )}
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
              Showroom motor bekas modern dan berkualitas premium terpercaya. Transparansi kondisi fisik dan mesin terjamin lewat sertifikasi lulus inspeksi ketat.
            </p>
          </div>
          <div className="space-y-3">
            <h5 className={`text-xs font-black uppercase tracking-widest border-b pb-2 max-w-[100px] ${
              theme === 'dark' ? 'text-slate-300 border-slate-900' : 'text-slate-800 border-slate-100'
            }`}>
              Link Cepat
            </h5>
            <div className={`flex flex-col gap-2 text-xs font-bold ${theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}`}>
              <Link href="/" className="hover:text-indigo-500 transition">Kembali ke Beranda</Link>
              <Link href="/motors" className="hover:text-indigo-500 transition">Katalog Motor</Link>
              <a href="/admin/dashboard" className="hover:text-indigo-500 transition">Sistem Console Admin</a>
            </div>
          </div>
          <div className="space-y-3">
            <h5 className={`text-xs font-black uppercase tracking-widest border-b pb-2 max-w-[150px] ${
              theme === 'dark' ? 'text-slate-300 border-slate-900' : 'text-slate-800 border-slate-100'
            }`}>
              Ikuti Media Sosial
            </h5>
            <div className="flex items-center gap-3 text-slate-400">
              <a href="https://instagram.com" target="_blank" rel="noreferrer" className={`p-2 rounded-xl hover:bg-indigo-600 hover:text-white transition shadow-md ${
                theme === 'dark' ? 'bg-slate-900' : 'bg-slate-100 text-slate-600'
              }`}>
                <Camera className="w-4 h-4" />
              </a>
              <a href="https://whatsapp.com" target="_blank" rel="noreferrer" className={`p-2 rounded-xl hover:bg-indigo-600 hover:text-white transition shadow-md ${
                theme === 'dark' ? 'bg-slate-900' : 'bg-slate-100 text-slate-600'
              }`}>
                <Phone className="w-4 h-4" />
              </a>
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