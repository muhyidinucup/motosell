'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Search, Fuel, Gauge, Award, Calendar } from 'lucide-react'

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

  const filteredMotors = motors.filter(motor => {
    const matchesSearch = motor.model.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          motor.motor_code.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesBrand = selectedBrand === 'ALL' || motor.brands?.code === selectedBrand
    return matchesSearch && matchesBrand
  })

  return (
    <>
      {/* Search Input */}
      <div className="relative w-full md:w-80 mt-6">
        <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-500">
          <Search className="w-4 h-4" />
        </span>
        <input 
          type="text"
          placeholder="Ketik model atau kode motor..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
        />
      </div>

      {/* Brand Filter */}
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

      {/* Results Count */}
      <div className="mt-6 mb-4 text-xs text-slate-500 font-semibold">
        Menampilkan {filteredMotors.length} dari {motors.length} unit
      </div>

      {/* Motor Grid */}
      {filteredMotors.length === 0 ? (
        <div className="py-16 text-center bg-slate-900/50 border border-dashed border-slate-800 rounded-3xl text-slate-500 font-medium">
          Tidak menemukan unit motor yang cocok dengan kriteria pencarian Anda.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredMotors.map((motor) => {
            // ✅ Hapus hardcoded HON-001, gunakan logic yang sama untuk semua motor
            const primaryPhoto = motor.motor_images?.find(img => img.is_primary)?.image_url || 
                                motor.motor_images[0]?.image_url || 
                                '/placeholder.png'

            return (
              <Link 
                href={`/motors/${motor.slug}`} 
                key={motor.id} 
                className="bg-slate-900 border border-slate-800 hover:border-indigo-500/50 rounded-2xl overflow-hidden group shadow-lg hover:shadow-indigo-500/5 transition-all duration-300 flex flex-col justify-between cursor-pointer"
              >
                <div>
                  <div className="w-full h-48 bg-slate-950 relative overflow-hidden">
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
                      <h3 className="font-black text-base text-white tracking-tight group-hover:text-indigo-400 transition truncate">
                        {motor.model}
                      </h3>
                      <span className="text-xs font-mono font-bold text-slate-500 bg-slate-950 px-2 py-0.5 rounded border border-slate-800 shrink-0">
                        {motor.motor_code}
                      </span>
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
                  <div className="w-full py-3 bg-slate-800 group-hover:bg-indigo-600 text-white font-bold rounded-xl text-xs tracking-wider uppercase text-center transition">
                    Lihat Detail Spesifikasi
                  </div>
                </div>
              </Link>
            )
          })}
        </div>
      )}
    </>
  )
}