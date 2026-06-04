'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { getReadyMotors } from '@/actions/public'
import { getBrands } from '@/actions/brand'
import { Search, Fuel, Gauge, Award, Calendar, ArrowLeft, Camera, Phone, ShieldAlert } from 'lucide-react'

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

export default function PublicKatalogPage() {
  const [motors, setMotors] = useState<Motor[]>([])
  const [brands, setBrands] = useState<Brand[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedBrand, setSelectedBrand] = useState('ALL')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadKatalogData() {
      try {
        const [motorsData, brandsData] = await Promise.all([
          getReadyMotors(),
          getBrands()
        ])
        setMotors(motorsData as unknown as Motor[])
        setBrands(brandsData as unknown as Brand[])
      } catch (err) {
        console.error('Gagal memuat data katalog:', err)
      } finally {
        setLoading(false)
      }
    }
    loadKatalogData()
  }, [])

  const filteredMotors = motors.filter(motor => {
    const matchesSearch = motor.model.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          motor.motor_code.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesBrand = selectedBrand === 'ALL' || motor.brands?.code === selectedBrand
    return matchesSearch && matchesBrand
  })

  if (loading) {
    return <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center font-bold animate-pulse">MEMBUKA GUDANG KATALOG MOTOSELL...</div>
  }

  return (
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
          <span className="text-xs font-bold text-slate-500 tracking-widest uppercase">Total: {filteredMotors.length} Unit Ready</span>
        </div>

        <section className="max-w-7xl mx-auto mt-8 px-4 sm:px-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 border-b border-slate-800 pb-6">
            <div>
              <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                Katalog Lengkap <span className="text-indigo-500">Armada Showroom</span>
              </h1>
              <p className="text-xs text-slate-400 mt-1">Cari, saring, dan temukan motor bekas berkualitas dengan harga terbaik.</p>
            </div>
            <div className="relative w-full md:w-80">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-500"><Search className="w-4 h-4" /></span>
              <input 
                type="text"
                placeholder="Ketik model atau kode motor..."
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
                selectedBrand === 'ALL' ? 'bg-indigo-600 text-white border-indigo-500 shadow-md' : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white'
              }`}
            >
              Semua Merek
            </button>
            {brands.map((brand) => (
              <button
                key={brand.id}
                onClick={() => setSelectedBrand(brand.code)}
                className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition shrink-0 border ${
                  selectedBrand === brand.code ? 'bg-indigo-600 text-white border-indigo-500 shadow-md' : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white'
                }`}
              >
                {brand.name}
              </button>
            ))}
          </div>
        </section>

        <section className="max-w-7xl mx-auto mt-6 px-4 sm:px-8 mb-16">
          {filteredMotors.length === 0 ? (
            <div className="py-16 text-center bg-slate-900/50 border border-dashed border-slate-800 rounded-3xl text-slate-500 font-medium">
              Tidak menemukan unit motor yang cocok dengan kriteria pencarian Anda.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredMotors.map((motor) => {
                const primaryPhoto = motor.motor_code === "HON-001" ? "/vercel.svg" : (motor.motor_images?.find(img => img.is_primary)?.image_url || motor.motor_images[0]?.image_url || '/placeholder.png');

                return (
                  <Link 
                    href={`/motors/${motor.slug}`} 
                    key={motor.id} 
                    className="bg-slate-900 border border-slate-800 hover:border-indigo-500/50 rounded-2xl overflow-hidden group shadow-lg hover:shadow-indigo-500/5 transition-all duration-300 flex flex-col justify-between cursor-pointer"
                  >
                    <div>
                      <div className="w-full h-48 bg-slate-950 relative overflow-hidden">
                        <img src={primaryPhoto} alt={motor.model} className="w-full h-full object-cover group-hover:scale-105 transition duration-300 select-none" />
                        <span className="absolute top-3 left-3 bg-indigo-600/90 backdrop-blur-sm text-[10px] font-black tracking-widest px-2.5 py-1 rounded-md text-white border border-indigo-400/20 uppercase">
                          {motor.brands?.code}
                        </span>
                      </div>
                      <div className="p-5">
                        <div className="flex justify-between items-start gap-2">
                          <h3 className="font-black text-base text-white tracking-tight group-hover:text-indigo-400 transition truncate">{motor.model}</h3>
                          <span className="text-xs font-mono font-bold text-slate-500 bg-slate-950 px-2 py-0.5 rounded border border-slate-800 shrink-0">{motor.motor_code}</span>
                        </div>
                        <div className="text-xl font-black text-indigo-400 mt-2">Rp {motor.price.toLocaleString('id-ID')}</div>
                        <div className="grid grid-cols-2 gap-3 mt-4 border-t border-slate-800/60 pt-4 text-xs font-medium text-slate-400">
                          <div className="flex items-center gap-2 truncate"><Fuel className="w-4 h-4 text-slate-500 shrink-0" /><span className="truncate capitalize">{motor.transmission}</span></div>
                          <div className="flex items-center gap-2 truncate"><Gauge className="w-4 h-4 text-slate-500 shrink-0" /><span className="truncate">{motor.mileage.toLocaleString('id-ID')} Km</span></div>
                          <div className="flex items-center gap-2 truncate"><Calendar className="w-4 h-4 text-slate-500 shrink-0" /><span>Tahun {motor.year}</span></div>
                          <div className="flex items-center gap-2 truncate"><Award className="w-4 h-4 text-slate-500 shrink-0" /><span className="text-emerald-500 truncate font-semibold">{motor.condition}</span></div>
                        </div>
                      </div>
                    </div>
                    <div className="p-5 pt-0">
                      <div className="w-full py-3 bg-slate-800 group-hover:bg-indigo-600 text-white font-bold rounded-xl text-xs tracking-wider uppercase text-center transition">Lihat Detail Spesifikasi</div>
                    </div>
                  </Link>
                )
              })}
            </div>
          )}
        </section>
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