'use client'

import { useState, useEffect } from 'react'
import { getBrands, createBrand, updateBrand, deleteBrand } from '@/actions/brand'
import { Pencil, Trash2, Plus, X, Layers } from 'lucide-react'

interface Brand {
  id: number
  name: string
  code: string
  is_active: boolean
}

export default function AdminBrandsPage() {
  const [brands, setBrands] = useState<Brand[]>([])
  const [name, setName] = useState('')
  const [code, setCode] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [editingId, setEditingId] = useState<number | null>(null)

  useEffect(() => {
    fetchBrands()
  }, [])

  async function fetchBrands() {
    try {
      const data = await getBrands()
      setBrands(data as Brand[])
    } catch (error: any) {
      setErrorMessage(error.message)
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setIsLoading(true)
    setErrorMessage('')

    try {
      if (editingId) {
        await updateBrand(editingId, name, code)
        setEditingId(null)
      } else {
        await createBrand(name, code)
      }
      
      setName('')
      setCode('')
      await fetchBrands()
    } catch (error: any) {
      setErrorMessage(error.message)
    } finally {
      setIsLoading(false)
    }
  }

  function handleEditClick(brand: Brand) {
    setEditingId(brand.id)
    setName(brand.name)
    setCode(brand.code)
  }

  function handleCancelEdit() {
    setEditingId(null)
    setName('')
    setCode('')
    setErrorMessage('')
  }

  async function handleDelete(id: number, brandName: string) {
    if (!confirm(`Apakah Anda yakin ingin menghapus brand "${brandName}"?`)) return

    setIsLoading(true)
    setErrorMessage('')

    try {
      await deleteBrand(id)
      await fetchBrands()
    } catch (error: any) {
      setErrorMessage(error.message)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="p-4 sm:p-8 max-w-6xl mx-auto font-sans bg-slate-50 min-h-screen text-slate-900 rounded-3xl">
      {/* 🏁 Top Header Section Responsif dengan Racing Indigo Bar */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4 border-b-2 border-indigo-100 pb-6">
        <div className="flex items-start gap-2.5">
          {/* Aksen Garis Neon Premium */}
          <span className="w-3 h-7 bg-indigo-600 rounded-full shrink-0 mt-1 sm:mt-1.5" />
          <div>
            <h1 className="text-xl sm:text-2xl md:text-3xl font-black text-slate-900 tracking-tight flex items-center gap-2">
              <Layers className="w-5 h-5 sm:w-7 sm:h-7 text-indigo-600 shrink-0" />
              Manajemen <span className="text-indigo-600">Brand</span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1 font-medium leading-relaxed">
              Kelola master data pabrikan motor dan kode registrasi MotoSell.
            </p>
          </div>
        </div>
      </div>

      {/* Error Alert */}
      {errorMessage && (
        <div className="p-4 mb-6 text-sm text-red-800 bg-red-50 border-l-4 border-red-500 rounded-r-xl flex items-center gap-2 shadow-sm font-medium animate-pulse" role="alert">
          <span className="font-bold">Eror Sistem:</span> {errorMessage}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Form Box - Dynamic Color Theme */}
        <div className={`p-5 sm:p-6 rounded-2xl shadow-lg border transition-all duration-300 h-fit ${
          editingId 
            ? 'bg-amber-900 text-white border-amber-700 shadow-amber-950/20' 
            : 'bg-slate-900 text-white border-slate-800 shadow-slate-950/40'
        }`}>
          <h2 className="text-xs sm:text-sm font-extrabold mb-5 flex items-center gap-2 tracking-widest uppercase">
            <span className={`w-2.5 h-5 rounded-full ${editingId ? 'bg-amber-400' : 'bg-indigo-500'}`} />
            {editingId ? 'MODIFIKASI DATA BRAND' : 'TAMBAH PABRIKAN BARU'}
          </h2>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className={`block text-xs font-bold uppercase tracking-widest mb-1.5 ${editingId ? 'text-amber-200' : 'text-slate-400'}`}>
                Nama Brand
              </label>
              <input
                type="text"
                placeholder="Contoh: Honda, Yamaha"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full px-4 py-2.5 bg-white/10 border border-white/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-white text-sm placeholder-white/30"
              />
            </div>
            
            <div>
              <label className={`block text-xs font-bold uppercase tracking-widest mb-1.5 ${editingId ? 'text-amber-200' : 'text-slate-400'}`}>
                Kode Singkat (Maks 10 Karakter)
              </label>
              <input
                type="text"
                placeholder="Contoh: HON, YAM"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                maxLength={10}
                required
                className="w-full px-4 py-2.5 bg-white/10 border border-white/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-white font-mono text-sm uppercase tracking-widest placeholder-white/30"
              />
            </div>

            <div className="flex flex-col gap-2 pt-2">
              <button
                type="submit"
                disabled={isLoading}
                className={`w-full py-3 rounded-xl font-bold text-sm transition flex items-center justify-center gap-2 shadow-md uppercase tracking-wider ${
                  editingId 
                    ? 'bg-amber-400 hover:bg-amber-300 text-amber-950' 
                    : 'bg-indigo-600 hover:bg-indigo-500 text-white'
                } disabled:opacity-40`}
              >
                {isLoading ? (
                  'Memproses...'
                ) : editingId ? (
                  <>
                    <Pencil className="w-4 h-4" /> Simpan Perubahan
                  </>
                ) : (
                  <>
                    <Plus className="w-4 h-4" /> Daftarkan Brand
                  </>
                )}
              </button>
              
              {editingId && (
                <button
                  type="button"
                  onClick={handleCancelEdit}
                  className="w-full bg-white/10 text-white hover:bg-white/20 py-3 rounded-xl font-bold text-sm transition flex items-center justify-center gap-2 border border-white/10"
                >
                  <X className="w-4 h-4" /> Batalkan Perubahan
                </button>
              )}
            </div>
          </form>
        </div>

        {/* Table Box - Kompak & Tidak Pecah di HP */}
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-xl border border-slate-200/80 overflow-hidden">
          <div className="p-5 bg-gradient-to-r from-slate-900 to-indigo-950 text-white flex justify-between items-center">
            <div>
              <h2 className="text-base sm:text-lg font-bold tracking-wide">Daftar Brand Aktif</h2>
              <p className="text-xs text-indigo-200/70 font-medium mt-0.5">Total terdata: {brands.length} manufaktur</p>
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-100/80">
                  <th className="py-4 px-4 sm:px-6 text-xs font-bold text-slate-500 uppercase tracking-widest">Manufaktur</th>
                  <th className="py-4 px-4 sm:px-6 text-xs font-bold text-slate-500 uppercase tracking-widest">Token Code</th>
                  <th className="py-4 px-4 sm:px-6 text-xs font-bold text-slate-500 uppercase tracking-widest text-center">Aksi Operasi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                {brands.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="py-12 text-center text-slate-400 text-sm font-medium">
                      Belum ada data brand terdaftar di sistem.
                    </td>
                  </tr>
                ) : (
                  brands.map((brand) => (
                    <tr key={brand.id} className="hover:bg-indigo-50/30 transition-colors">
                      <td className="py-3 sm:py-4 px-4 sm:px-6 text-xs sm:text-sm font-bold text-slate-800 tracking-tight">{brand.name}</td>
                      <td className="py-3 sm:py-4 px-4 sm:px-6 text-xs sm:text-sm">
                        <span className="bg-indigo-50 text-indigo-700 border border-indigo-100 font-mono px-2.5 py-1 rounded-lg text-[10px] sm:text-xs font-black tracking-widest shadow-sm">
                          {brand.code}
                        </span>
                      </td>
                      <td className="py-3 sm:py-4 px-4 sm:px-6 text-xs sm:text-sm text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => handleEditClick(brand)}
                            title="Edit Brand"
                            className="p-2 sm:p-2.5 bg-slate-100 hover:bg-amber-500 text-slate-600 hover:text-white rounded-xl transition border border-slate-200/60"
                          >
                            <Pencil className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(brand.id, brand.name)}
                            title="Hapus Brand"
                            className="p-2 sm:p-2.5 bg-slate-100 hover:bg-red-600 text-slate-600 hover:text-white rounded-xl transition border border-slate-200/60"
                          >
                            <Trash2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}