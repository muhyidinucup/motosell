'use client'

import { useState, useEffect } from 'react'
import { getBrands } from '@/actions/brand'
import { getMotors, createMotor, updateMotor, deleteMotor, uploadMotorImages, getMotorImages, deleteMotorImage } from '@/actions/motor'
import { Pencil, Trash2, Plus, Bike, Calendar, Gauge, Sliders, X, Upload } from 'lucide-react'

interface Brand {
  id: number
  name: string
  code: string
}

interface Motor {
  id: number
  motor_code: string
  brand_id: number
  model: string
  year: number
  price: number
  mileage: number
  transmission: string
  color: string
  condition: string
  description: string
  status: 'ready' | 'booking' | 'sold'
  featured: boolean
  brands: {
    name: string
    code: string
  }
}

interface SavedImage {
  id: number
  image_url: string
  is_primary: boolean
}

export default function AdminMotorsPage() {
  const [motors, setMotors] = useState<Motor[]>([])
  const [brands, setBrands] = useState<Brand[]>([])
  
  const [brandId, setBrandId] = useState('')
  const [model, setModel] = useState('')
  const [year, setYear] = useState(new Date().getFullYear())
  const [price, setPrice] = useState('')
  const [mileage, setMileage] = useState('')
  const [transmission, setTransmission] = useState('Automatic')
  const [color, setColor] = useState('')
  const [condition, setCondition] = useState('Sangat Baik')
  const [description, setDescription] = useState('')
  const [status, setStatus] = useState<'ready' | 'booking' | 'sold'>('ready')
  const [featured, setFeatured] = useState(false)

  const [selectedFiles, setSelectedFiles] = useState<{ name: string; type: string; base64: string }[]>([])
  const [previews, setPreviews] = useState<string[]>([])
  const [savedImages, setSavedImages] = useState<SavedImage[]>([])

  const [editingId, setEditingId] = useState<number | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  useEffect(() => {
    loadInitialData()
  }, [])

  async function loadInitialData() {
    try {
      const [brandsData, motorsData] = await Promise.all([
        getBrands(),
        getMotors()
      ])
      setBrands(brandsData as Brand[])
      setMotors(motorsData as unknown as Motor[])
    } catch (error: any) {
      setErrorMessage(error.message)
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return
    
    const filesArray = Array.from(e.target.files)
    setPreviews([])
    setSelectedFiles([])

    filesArray.forEach((file) => {
      if (!file.type.startsWith('image/')) return

      const reader = new FileReader()
      reader.onloadend = () => {
        const base64String = (reader.result as string).split(',')[1]
        
        setPreviews((prev) => [...prev, reader.result as string])
        setSelectedFiles((prev) => [...prev, {
          name: file.name,
          type: file.type,
          base64: base64String
        }])
      }
      reader.readAsDataURL(file)
    })
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!brandId) {
      setErrorMessage('Silakan pilih brand motor terlebih dahulu!')
      return
    }

    if (!editingId && selectedFiles.length === 0) {
      setErrorMessage('Wajib mengunggah minimal 1 foto untuk unit motor baru!')
      return
    }

    setIsLoading(true)
    setErrorMessage('')

    try {
      const payload = {
        brand_id: Number(brandId),
        model,
        year: Number(year),
        price: Number(price),
        mileage: Number(mileage),
        transmission,
        color,
        condition,
        description,
        featured
      }

      if (editingId) {
        await updateMotor(editingId, { ...payload, status })
        if (selectedFiles.length > 0) {
          await uploadMotorImages(editingId, selectedFiles)
        }
        setEditingId(null)
      } else {
        const newMotor = await createMotor(payload)
        if (newMotor && newMotor.id) {
          await uploadMotorImages(newMotor.id, selectedFiles)
        }
      }

      setBrandId('')
      setModel('')
      setPrice('')
      setMileage('')
      setColor('')
      setDescription('')
      setStatus('ready')
      setFeatured(false)
      setSelectedFiles([])
      setPreviews([])
      setSavedImages([])
      
      const updatedMotors = await getMotors()
      setMotors(updatedMotors as unknown as Motor[])
    } catch (error: any) {
      setErrorMessage(error.message)
    } finally {
      setIsLoading(false)
    }
  }

  async function handleEditClick(motor: Motor) {
    setEditingId(motor.id)
    setBrandId(String(motor.brand_id))
    setModel(motor.model)
    setYear(motor.year)
    setPrice(String(motor.price))
    setMileage(String(motor.mileage))
    setTransmission(motor.transmission)
    setColor(motor.color)
    setCondition(motor.condition)
    setDescription(motor.description || '')
    setStatus(motor.status)
    setFeatured(motor.featured)
    
    setSelectedFiles([])
    setPreviews([])

    await fetchSavedImages(motor.id)
  }

  async function fetchSavedImages(motorId: number) {
    try {
      const images = await getMotorImages(motorId)
      setSavedImages(images as SavedImage[])
    } catch (err) {
      setSavedImages([])
    }
  }

  async function handleImageDelete(imageId: number, imageUrl: string) {
    if (!confirm('Apakah Anda yakin ingin menghapus foto ini dari galeri database?')) return
    
    try {
      await deleteMotorImage(imageId, imageUrl)
      if (editingId) {
        await fetchSavedImages(editingId)
      }
    } catch (error: any) {
      setErrorMessage(error.message)
    }
  }

  function handleCancelEdit() {
    setEditingId(null)
    setBrandId('')
    setModel('')
    setPrice('')
    setMileage('')
    setColor('')
    setDescription('')
    setStatus('ready')
    setFeatured(false)
    setSelectedFiles([])
    setPreviews([])
    setSavedImages([])
    setErrorMessage('')
  }

  async function handleDelete(id: number, code: string) {
    if (!confirm(`Apakah Anda yakin ingin menghapus motor dengan kode "${code}"?`)) return

    setIsLoading(true)
    try {
      await deleteMotor(id)
      const updatedMotors = await getMotors()
      setMotors(updatedMotors as unknown as Motor[])
    } catch (error: any) {
      setErrorMessage(error.message)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="p-4 sm:p-8 max-w-7xl mx-auto font-sans bg-slate-50 min-h-screen text-slate-900 rounded-3xl">
      {/* 🏍️ Header Utama Responsif dengan Racing Indigo Bar */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4 border-b-2 border-indigo-100 pb-6">
        <div className="flex items-start gap-2.5 max-w-full">
          {/* Aksen Garis Menyala Khas Racing */}
          <span className="w-3 h-7 bg-indigo-600 rounded-full shrink-0 mt-1 sm:mt-1.5" />
          <div className="space-y-1 min-w-0 flex-1">
            <div className="flex items-center gap-2 text-slate-900">
              <Bike className="w-5 h-5 sm:w-7 sm:h-7 text-indigo-600 shrink-0" />
              <h1 className="text-xl sm:text-2xl md:text-3xl font-black tracking-tight leading-none">
                Manajemen <span className="text-indigo-600">Motor & Inventori</span>
              </h1>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 font-medium leading-relaxed">
              Kelola armada motor bekas, spesifikasi, dan status penjualan MotoSell.
            </p>
          </div>
        </div>
      </div>

      {/* Notifikasi Eror */}
      {errorMessage && (
        <div className="p-4 mb-6 text-sm text-red-800 bg-red-50 border-l-4 border-red-500 rounded-r-xl font-medium animate-pulse">
          <span className="font-bold">Eror:</span> {errorMessage}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Form Box - Lebih Compact & Ramah Jempol Mobile */}
        <div className={`p-5 sm:p-6 rounded-2xl shadow-xl border transition-all duration-300 text-white h-fit ${
          editingId 
            ? 'bg-amber-900 border-amber-700 shadow-amber-950/20' 
            : 'bg-slate-900 border-slate-800 shadow-slate-950/40'
        }`}>
          <h2 className="text-xs sm:text-sm font-extrabold mb-5 flex items-center gap-2 tracking-widest uppercase">
            <span className={`w-2.5 h-5 rounded-full ${editingId ? 'bg-amber-400' : 'bg-indigo-500'}`} />
            {editingId ? 'MODIFIKASI UNIT MOTOR' : 'DAFTARKAN UNIT MOTOR'}
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className={`block text-xs font-bold uppercase tracking-widest mb-1.5 ${editingId ? 'text-amber-200' : 'text-slate-400'}`}>Pilih Brand (Pabrikan)</label>
              <select
                value={brandId}
                onChange={(e) => setBrandId(e.target.value)}
                required
                className="w-full px-3 py-2.5 bg-white/10 border border-white/20 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="" className="text-slate-900">-- Pilih Brand --</option>
                {brands.map((b) => (
                  <option key={b.id} value={b.id} className="text-slate-900">{b.name} ({b.code})</option>
                ))}
              </select>
            </div>

            <div>
              <label className={`block text-xs font-bold uppercase tracking-widest mb-1.5 ${editingId ? 'text-amber-200' : 'text-slate-400'}`}>Model / Tipe Motor</label>
              <input
                type="text"
                placeholder="Contioh: Vario 150 CBS"
                value={model}
                onChange={(e) => setModel(e.target.value)}
                required
                className="w-full px-4 py-2.5 bg-white/10 border border-white/20 rounded-xl text-white text-sm placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={`block text-xs font-bold uppercase tracking-widest mb-1.5 ${editingId ? 'text-amber-200' : 'text-slate-400'}`}>Tahun Rakit</label>
                <input
                  type="number"
                  value={year}
                  onChange={(e) => setYear(Number(e.target.value))}
                  required
                  className="w-full px-4 py-2.5 bg-white/10 border border-white/20 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className={`block text-xs font-bold uppercase tracking-widest mb-1.5 ${editingId ? 'text-amber-200' : 'text-slate-400'}`}>Warna</label>
                <input
                  type="text"
                  placeholder="Contoh: Hitam Matte"
                  value={color}
                  onChange={(e) => setColor(e.target.value)}
                  required
                  className="w-full px-4 py-2.5 bg-white/10 border border-white/20 rounded-xl text-white text-sm placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={`block text-xs font-bold uppercase tracking-widest mb-1.5 ${editingId ? 'text-amber-200' : 'text-slate-400'}`}>Harga (Rp)</label>
                <input
                  type="number"
                  placeholder="Contoh: 17500000"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  required
                  className="w-full px-4 py-2.5 bg-white/10 border border-white/20 rounded-xl text-white text-sm placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className={`block text-xs font-bold uppercase tracking-widest mb-1.5 ${editingId ? 'text-amber-200' : 'text-slate-400'}`}>Jarak (Km)</label>
                <input
                  type="number"
                  placeholder="Contoh: 24000"
                  value={mileage}
                  onChange={(e) => setMileage(e.target.value)}
                  required
                  className="w-full px-4 py-2.5 bg-white/10 border border-white/20 rounded-xl text-white text-sm placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={`block text-xs font-bold uppercase tracking-widest mb-1.5 ${editingId ? 'text-amber-200' : 'text-slate-400'}`}>Transmisi</label>
                <select
                  value={transmission}
                  onChange={(e) => setTransmission(e.target.value)}
                  className="w-full px-3 py-2.5 bg-white/10 border border-white/20 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="Automatic" className="text-slate-900">Automatic</option>
                  <option value="Manual" className="text-slate-900">Manual</option>
                  <option value="Kopling" className="text-slate-900">Kopling</option>
                </select>
              </div>
              <div>
                <label className={`block text-xs font-bold uppercase tracking-widest mb-1.5 ${editingId ? 'text-amber-200' : 'text-slate-400'}`}>Kondisi</label>
                <select
                  value={condition}
                  onChange={(e) => setCondition(e.target.value)}
                  className="w-full px-3 py-2.5 bg-white/10 border border-white/20 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="Sangat Baik" className="text-slate-900">Sangat Baik</option>
                  <option value="Baik" className="text-slate-900">Baik</option>
                  <option value="Butuh Perbaikan" className="text-slate-900">Butuh Perbaikan</option>
                </select>
              </div>
            </div>

            {/* FOTO DATABASE - PRATINJAU LEBIH RAPI DI HP */}
            {editingId && savedImages.length > 0 && (
              <div>
                <label className="block text-xs font-bold uppercase tracking-widest text-amber-200 mb-1.5">Foto Terunggah di Database</label>
                <div className="grid grid-cols-4 gap-2 p-2 bg-black/20 rounded-xl border border-white/5">
                  {savedImages.map((img) => (
                    <div key={img.id} className="relative aspect-square rounded-lg overflow-hidden bg-slate-800 border border-white/10 group">
                      <img src={img.image_url} alt="Database Unit" className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => handleImageDelete(img.id, img.image_url)}
                        title="Hapus foto ini"
                        className="absolute top-1 right-1 p-1 bg-red-600 hover:bg-red-700 rounded-full text-white transition shadow shadow-black/50 z-20"
                      >
                        <X className="w-2.5 h-2.5" />
                      </button>
                      {img.is_primary && (
                        <span className="absolute bottom-0 inset-x-0 bg-indigo-600 text-[7px] font-black uppercase text-center py-0.5 text-white tracking-wide">
                          SAMPUL
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div>
              <label className={`block text-xs font-bold uppercase tracking-widest mb-1.5 ${editingId ? 'text-amber-200' : 'text-slate-400'}`}>
                {editingId ? 'Tambah File Foto Baru' : 'Upload Foto Unit (Min. 1 Foto)'}
              </label>
              <div className="relative w-full min-h-[90px] border-2 border-dashed border-white/20 hover:border-indigo-400 rounded-xl transition flex flex-col items-center justify-center p-3 cursor-pointer bg-white/5">
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleFileChange}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                />
                <Upload className="w-5 h-5 text-slate-400 mb-1" />
                <span className="text-xs font-medium text-slate-300">Pilih File Baru</span>
              </div>

              {previews.length > 0 && (
                <div>
                  <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mt-2 mb-1">Antrean Foto Baru Tambahan:</div>
                  <div className="grid grid-cols-4 gap-2 p-2 bg-black/20 rounded-xl border border-white/5">
                    {previews.map((src, index) => (
                      <div key={index} className="relative aspect-square rounded-lg overflow-hidden bg-slate-800 border border-white/10">
                        <img src={src} alt="New Preview" className="w-full h-full object-cover" />
                        {index === 0 && !editingId && (
                          <span className="absolute bottom-0 inset-x-0 bg-indigo-600 text-[7px] font-black uppercase text-center py-0.5 text-white tracking-wide">
                            UTAMA
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {editingId && (
              <div>
                <label className="block text-xs font-bold uppercase tracking-widest text-amber-200 mb-1.5">Status Unit Penjualan</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as any)}
                  className="w-full px-3 py-2.5 bg-white/10 border border-white/20 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
                >
                  <option value="ready" className="text-slate-900">READY (Tersedia)</option>
                  <option value="booking" className="text-slate-900">BOOKING (Dipesan)</option>
                  <option value="sold" className="text-slate-900">SOLD (Terjual)</option>
                </select>
              </div>
            )}

            <div>
              <label className={`block text-xs font-bold uppercase tracking-widest mb-1.5 ${editingId ? 'text-amber-200' : 'text-slate-400'}`}>Deskripsi Singkat / Minus Unit</label>
              <textarea
                placeholder="Detail spesifikasi tambahan atau minus fisik unit..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                className="w-full px-4 py-2.5 bg-white/10 border border-white/20 rounded-xl text-white text-sm placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
              />
            </div>

            <div className="flex items-center gap-2 py-1">
              <input
                type="checkbox"
                id="featured"
                checked={featured}
                onChange={(e) => setFeatured(e.target.checked)}
                className="w-4 h-4 rounded text-indigo-600 bg-white/10 border-white/20 focus:ring-indigo-500"
              />
              <label htmlFor="featured" className="text-xs font-bold text-slate-300 cursor-pointer select-none">
                REKOMENDASIKAN DI HOMEPAGE
              </label>
            </div>

            <div className="flex flex-col gap-2 pt-2">
              <button
                type="submit"
                disabled={isLoading}
                className={`w-full py-3 rounded-xl font-bold text-sm transition flex items-center justify-center gap-2 shadow-md uppercase tracking-wider ${
                  editingId 
                    ? 'bg-amber-400 hover:bg-amber-300 text-amber-950' 
                    : 'bg-indigo-600 hover:bg-indigo-500 text-white'
                } disabled:opacity-50`}
              >
                {isLoading ? 'Memproses...' : editingId ? (
                  <>
                    <Pencil className="w-4 h-4" /> Simpan Perubahan
                  </>
                ) : (
                  <>
                    <Plus className="w-4 h-4" /> Tambah ke Inventori
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

        {/* Tabel Inventori - High Performance Padding Adaptif Mobile */}
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
          <div className="p-5 bg-gradient-to-r from-slate-900 to-indigo-950 text-white flex justify-between items-center">
            <div>
              <h2 className="text-base sm:text-lg font-bold tracking-wide">Inventori Motor Toko</h2>
              <p className="text-xs text-indigo-200/70 font-medium mt-0.5">Total unit terdata: {motors.length} unit</p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-100/80">
                  <th className="py-4 px-2 sm:px-4 text-[10px] sm:text-xs font-bold text-slate-500 uppercase tracking-wider">Kode Unit</th>
                  <th className="py-4 px-2 sm:px-4 text-[10px] sm:text-xs font-bold text-slate-500 uppercase tracking-wider">Motor / Model</th>
                  <th className="py-4 px-2 sm:px-4 text-[10px] sm:text-xs font-bold text-slate-500 uppercase tracking-wider">Spesifikasi</th>
                  <th className="py-4 px-2 sm:px-4 text-[10px] sm:text-xs font-bold text-slate-500 uppercase tracking-wider">Harga Pasang</th>
                  <th className="py-4 px-2 sm:px-4 text-[10px] sm:text-xs font-bold text-slate-500 uppercase tracking-wider text-center">Status</th>
                  <th className="py-4 px-2 sm:px-4 text-[10px] sm:text-xs font-bold text-slate-500 uppercase tracking-wider text-center">Operasi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                {motors.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-slate-400 text-sm font-medium">
                      Belum ada armada motor terdata di inventori MotoSell.
                    </td>
                  </tr>
                ) : (
                  motors.map((motor) => (
                    <tr key={motor.id} className="hover:bg-indigo-50/30 transition-colors">
                      <td className="py-3 px-2 sm:px-4 text-xs sm:text-sm font-bold font-mono text-indigo-600">{motor.motor_code}</td>
                      <td className="py-3 px-2 sm:px-4 text-xs sm:text-sm">
                        <div className="font-bold text-slate-900 tracking-tight">{motor.model}</div>
                        <div className="text-[10px] sm:text-xs text-slate-400 font-medium">{motor.brands?.name}</div>
                      </td>
                      <td className="py-3 px-2 sm:px-4 text-[10px] sm:text-xs space-y-0.5 text-slate-500 font-semibold">
                        <div className="flex items-center gap-1"><Calendar className="w-3 h-3 text-slate-400 shrink-0" /> Th {motor.year}</div>
                        <div className="flex items-center gap-1"><Gauge className="w-3 h-3 text-slate-400 shrink-0" /> {motor.mileage.toLocaleString('id-ID')} Km</div>
                        <div className="flex items-center gap-1"><Sliders className="w-3 h-3 text-slate-400 shrink-0" /> {motor.transmission}</div>
                      </td>
                      <td className="py-3 px-2 sm:px-4 text-xs sm:text-sm font-extrabold text-slate-900 whitespace-nowrap">
                        Rp {motor.price.toLocaleString('id-ID')}
                      </td>
                      <td className="py-3 px-2 sm:px-4 text-center">
                        <span className={`px-2 py-0.5 rounded-full text-[9px] sm:text-xs font-black shadow-sm tracking-wide ${
                          motor.status === 'ready' ? 'bg-green-100 text-green-800' :
                          motor.status === 'booking' ? 'bg-amber-100 text-amber-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {motor.status.toUpperCase()}
                        </span>
                      </td>
                      <td className="py-3 px-2 sm:px-4 text-center">
                        <div className="flex items-center justify-center gap-1 sm:gap-1.5">
                          <button
                            onClick={() => handleEditClick(motor)}
                            title="Edit Spesifikasi/Status"
                            className="p-1.5 sm:p-2 bg-slate-100 hover:bg-amber-500 text-slate-600 hover:text-white rounded-xl transition border border-slate-200/60"
                          >
                            <Pencil className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(motor.id, motor.motor_code)}
                            title="Hapus Unit"
                            className="p-1.5 sm:p-2 bg-slate-100 hover:bg-red-600 text-slate-600 hover:text-white rounded-xl transition border border-slate-200/60"
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