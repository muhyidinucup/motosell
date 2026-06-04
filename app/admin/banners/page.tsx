'use client'

import { useState, useEffect } from 'react'
import { getBanners, createBanner, deleteBanner } from '@/actions/banner'
import { Trash2, Plus, Image as ImageIcon, Upload, Link as LinkIcon } from 'lucide-react'

interface Banner {
  id: number
  title: string
  image_url: string
  link_url: string | null
  is_active: boolean
}

export default function AdminBannersPage() {
  const [banners, setBanners] = useState<Banner[]>([])
  const [title, setTitle] = useState('')
  const [linkUrl, setLinkUrl] = useState('')
  
  // State File Gambar
  const [selectedFile, setSelectedFile] = useState<{ name: string; type: string; base64: string } | null>(null)
  const [preview, setPreview] = useState<string | null>(null)

  const [isLoading, setIsLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  useEffect(() => {
    fetchBanners()
  }, [])

  async function fetchBanners() {
    try {
      const data = await getBanners()
      setBanners(data as Banner[])
    } catch (error: any) {
      setErrorMessage(error.message)
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return
    const file = e.target.files[0]

    if (!file.type.startsWith('image/')) return

    const reader = new FileReader()
    reader.onloadend = () => {
      const base64String = (reader.result as string).split(',')[1]
      setPreview(reader.result as string)
      setSelectedFile({
        name: file.name,
        type: file.type,
        base64: base64String
      })
    }
    reader.readAsDataURL(file)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!selectedFile) {
      setErrorMessage('Wajib memilih 1 file gambar spanduk promo!')
      return
    }

    setIsLoading(true)
    setErrorMessage('')

    try {
      await createBanner(title, linkUrl, selectedFile)
      
      // Reset Form
      setTitle('')
      setLinkUrl('')
      setSelectedFile(null)
      setPreview(null)

      await fetchBanners()
    } catch (error: any) {
      setErrorMessage(error.message)
    } finally {
      setIsLoading(false)
    }
  }

  async function handleDelete(id: number, imageUrl: string) {
    if (!confirm('Apakah Anda yakin ingin menghapus spanduk promo ini?')) return

    setIsLoading(true)
    try {
      await deleteBanner(id, imageUrl)
      await fetchBanners()
    } catch (error: any) {
      setErrorMessage(error.message)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="p-8 max-w-7xl mx-auto font-sans bg-slate-50 min-h-screen text-slate-900">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4 border-b-2 border-indigo-100 pb-6">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <ImageIcon className="w-8 h-8 text-indigo-600" />
            Manajemen <span className="text-indigo-600">Banner Promo</span>
          </h1>
          <p className="text-sm text-slate-500 mt-1 font-medium">Kelola gambar slide promosi diskon di halaman depan MotoSell.</p>
        </div>
      </div>

      {errorMessage && (
        <div className="p-4 mb-6 text-sm text-red-800 bg-red-50 border-l-4 border-red-500 rounded-r-xl font-medium animate-pulse">
          <span className="font-bold">Eror:</span> {errorMessage}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Form Pendaftaran Spanduk */}
        <div className="bg-slate-900 text-white p-6 rounded-2xl shadow-xl border border-slate-800 h-fit">
          <h2 className="text-sm font-extrabold mb-5 flex items-center gap-2 tracking-widest uppercase">
            <span className="w-2.5 h-5 rounded-full bg-indigo-500" />
            UNGGAH BANNER BARU
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-widest text-slate-400 mb-1.5">Judul / Campaign Promo</label>
              <input
                type="text"
                placeholder="Contoh: Diskon Gila Awal Tahun"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                className="w-full px-4 py-2.5 bg-white/10 border border-white/20 rounded-xl text-white text-sm placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-widest text-slate-400 mb-1.5">Link URL Redirect (Opsional)</label>
              <input
                type="url"
                placeholder="Contoh: https://motosell.com/promo"
                value={linkUrl}
                onChange={(e) => setLinkUrl(e.target.value)}
                className="w-full px-4 py-2.5 bg-white/10 border border-white/20 rounded-xl text-white text-sm placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            {/* Upload File Zone */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-widest text-slate-400 mb-1.5">File Gambar Spanduk</label>
              <div className="relative w-full min-h-[100px] border-2 border-dashed border-white/20 hover:border-indigo-400 rounded-xl transition flex flex-col items-center justify-center p-3 cursor-pointer bg-white/5">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                />
                <Upload className="w-5 h-5 text-slate-400 mb-1" />
                <span className="text-xs font-medium text-slate-300">Pilih Gambar Spanduk</span>
                <span className="text-[10px] text-slate-500 mt-0.5">Rekomendasi rasio landscape (16:9)</span>
              </div>

              {/* Preview Spanduk Mini */}
              {preview && (
                <div className="mt-3 p-2 bg-black/20 rounded-xl border border-white/5">
                  <div className="relative aspect-[21/9] rounded-lg overflow-hidden border border-white/10">
                    <img src={preview} alt="Spanduk Preview" className="w-full h-full object-cover" />
                  </div>
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl text-sm transition-all shadow-md flex items-center justify-center gap-2 uppercase tracking-wider disabled:opacity-50"
            >
              <Plus className="w-4 h-4" /> {isLoading ? 'Mengunggah...' : 'Publish Banner'}
            </button>
          </form>
        </div>

        {/* Tabel List Banner Promosi */}
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
          <div className="p-6 bg-gradient-to-r from-slate-900 to-indigo-950 text-white flex justify-between items-center">
            <div>
              <h2 className="text-lg font-bold tracking-wide">Daftar Banner Berjalan</h2>
              <p className="text-xs text-indigo-200/70 font-medium mt-0.5">Total terpasang: {banners.length} spanduk aktif</p>
            </div>
          </div>

          <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-50/50">
            {banners.length === 0 ? (
              <div className="col-span-full py-12 text-center text-slate-400 text-sm font-medium">
                Belum ada spanduk kampanye promosi iklan yang dipasang.
              </div>
            ) : (
              banners.map((banner) => (
                <div key={banner.id} className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition flex flex-col justify-between">
                  {/* Visual Gambar Banner */}
                  <div className="relative aspect-[21/9] bg-slate-900 border-b border-slate-100">
                    <img src={banner.image_url} alt={banner.title} className="w-full h-full object-cover" />
                  </div>
                  
                  {/* Info Teks & Button Aksi */}
                  <div className="p-4 flex justify-between items-center gap-4 bg-white">
                    <div className="min-w-0 flex-1">
                      <h3 className="font-bold text-slate-900 text-sm truncate">{banner.title}</h3>
                      {banner.link_url ? (
                        <a href={banner.link_url} target="_blank" rel="noreferrer" className="text-xs text-indigo-600 font-semibold flex items-center gap-1 mt-0.5 hover:underline truncate">
                          <LinkIcon className="w-3 h-3 flex-shrink-0" /> Link Campaign
                        </a>
                      ) : (
                        <span className="text-[10px] text-slate-400 font-medium block mt-0.5">Tanpa tautan link eksternal</span>
                      )}
                    </div>

                    <button
                      onClick={() => handleDelete(banner.id, banner.image_url)}
                      title="Hapus Spanduk"
                      className="p-2.5 bg-slate-100 hover:bg-red-600 text-slate-600 hover:text-white rounded-xl transition border border-slate-200/60 flex-shrink-0"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  )
}