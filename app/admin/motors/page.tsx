'use client'
import { useState, useEffect } from 'react'
import { getBrands } from '@/actions/brand'
import { getMotors, createMotor, updateMotor, deleteMotor, uploadMotorImages, getMotorImages, deleteMotorImage } from '@/actions/motor'
import { Pencil, Trash2, Plus, Bike, Calendar, Gauge, Sliders, X, Upload, Download, Search, Landmark, ShieldCheck, Filter } from 'lucide-react'
// @ts-ignore
import imageCompression from 'browser-image-compression'
import * as XLSX from 'xlsx'
import { createClient } from '@/lib/supabase/client' // ✅ PENTING: Import dari /client

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
  purchase_price: number
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
  } | null
}

interface SavedImage {
  id: number
  image_url: string
  is_primary: boolean
}

export default function AdminMotorsPage() {
  const [motors, setMotors] = useState<Motor[]>([])
  const [brands, setBrands] = useState<Brand[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | 'ready' | 'booking' | 'sold'>('all')
  const [filteredMotors, setFilteredMotors] = useState<Motor[]>([])
  const [brandId, setBrandId] = useState('')
  const [model, setModel] = useState('')
  const [year, setYear] = useState(new Date().getFullYear())
  const [purchasePrice, setPurchasePrice] = useState('')
  const [price, setPrice] = useState('')
  const [mileage, setMileage] = useState('')
  const [transmission, setTransmission] = useState('Automatic')
  const [color, setColor] = useState('')
  const [condition, setCondition] = useState('Sangat Baik')
  const [description, setDescription] = useState('')
  const [status, setStatus] = useState<'ready' | 'booking' | 'sold'>('ready')
  const [featured, setFeatured] = useState(false)
  const [selectedFiles, setSelectedFiles] = useState<File[]>([])
  const [previews, setPreviews] = useState<string[]>([])
  const [savedImages, setSavedImages] = useState<SavedImage[]>([])
  const [editingId, setEditingId] = useState<number | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [successMessage, setSuccessMessage] = useState('')

  useEffect(() => {
    loadInitialData()
  }, [])

  useEffect(() => {
    let temp = [...motors]
    if (searchQuery.trim() !== '') {
      const query = searchQuery.toLowerCase()
      temp = temp.filter(m => 
        m.model.toLowerCase().includes(query) || 
        m.motor_code.toLowerCase().includes(query) ||
        (m.brands?.name && m.brands.name.toLowerCase().includes(query))
      )
    }

    if (statusFilter !== 'all') {
      temp = temp.filter(m => m.status === statusFilter)
    }

    setFilteredMotors(temp)
  }, [searchQuery, statusFilter, motors])

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

  const totalUnitAktif = motors.filter(m => m.status !== 'sold').length
  const totalValuasiAset = motors
    .filter(m => m.status === 'ready' || m.status === 'booking')
    .reduce((sum, m) => sum + Number(m.purchase_price || 0), 0)

  const compressImageViaCanvas = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.readAsDataURL(file)
      reader.onload = (event) => {
        const img = new Image()
        img.src = event.target?.result as string
        img.onload = () => {
          const canvas = document.createElement('canvas')
          let width = img.width
          let height = img.height

          const MAX_WIDTH_OR_HEIGHT = 1200
          if (width > MAX_WIDTH_OR_HEIGHT || height > MAX_WIDTH_OR_HEIGHT) {
            if (width > height) {
              height = Math.round((height * MAX_WIDTH_OR_HEIGHT) / width)
              width = MAX_WIDTH_OR_HEIGHT
            } else {
              width = Math.round((width * MAX_WIDTH_OR_HEIGHT) / height)
              height = MAX_WIDTH_OR_HEIGHT
            }
          }

          canvas.width = width
          canvas.height = height
          const ctx = canvas.getContext('2d')
          if (!ctx) return reject(new Error('Gagal memuat Canvas Context 2D'))
          
          ctx.drawImage(img, 0, 0, width, height)
          const base64Result = canvas.toDataURL('image/jpeg', 0.75)
          resolve(base64Result.split(',')[1])
        }
        img.onerror = (err) => reject(err)
      }
      reader.onerror = (err) => reject(err)
    })
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return
    const filesArray = Array.from(e.target.files)
    setErrorMessage('')
    setSuccessMessage('')
    setIsLoading(true)

    const options = {
      maxSizeMB: 0.3,          
      maxWidthOrHeight: 1200,    
      useWebWorker: true,
      fileType: 'image/webp'    
    }

    const newPreviews: string[] = []
    const newSelectedFiles: File[] = []

    try {
      for (const file of filesArray) {
        if (!file.type.startsWith('image/')) continue

        let finalCompressedFile: File | null = null
        let previewUrl = ''

        try {
          const compressedFile = await imageCompression(file, options)
          previewUrl = URL.createObjectURL(compressedFile)
          
          const safeName = file.name.replace(/\.[^/.]+$/, '') + '.webp'
          finalCompressedFile = new File([compressedFile], safeName, { type: 'image/webp' })

          if (finalCompressedFile.size > 2 * 1024 * 1024) {
            throw new Error('Trigger Fallback Canvas')
          }
        } catch (compressionErr) {
          const base64String = await compressImageViaCanvas(file)
          
          const byteCharacters = atob(base64String)
          const byteNumbers = new Array(byteCharacters.length)
          for (let i = 0; i < byteCharacters.length; i++) {
            byteNumbers[i] = byteCharacters.charCodeAt(i)
          }
          const byteArray = new Uint8Array(byteNumbers)
          const blobFallback = new Blob([byteArray], { type: 'image/jpeg' })
          previewUrl = URL.createObjectURL(blobFallback)

          const safeName = file.name.replace(/\.[^/.]+$/, '') + '.jpg'
          finalCompressedFile = new File([blobFallback], safeName, { type: 'image/jpeg' })
        }

        if (finalCompressedFile) {
          newPreviews.push(previewUrl)
          newSelectedFiles.push(finalCompressedFile)
        }
      }

      setPreviews((prev) => [...prev, ...newPreviews])
      setSelectedFiles((prev) => [...prev, ...newSelectedFiles])

    } catch (err) {
      console.error(err)
      setErrorMessage('Gagal memproses multiple foto motor, coba kurangi jumlah file.')
    } finally {
      setIsLoading(false)
    }
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
    setSuccessMessage('')

    try {
      const supabase = createClient()
      const uploadedImageUrls: string[] = []

      // 🚀 UPLOAD LANGSUNG DARI BROWSER KE SUPABASE STORAGE
      for (const file of selectedFiles) {
        const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}_${file.name}`
        const filePath = `units/${fileName}`

        const { data, error } = await supabase.storage
          .from('motosell')
          .upload(filePath, file, {
            cacheControl: '3600',
            upsert: false
          })

        if (error) {
          throw new Error(`Gagal upload gambar "${file.name}": ${error.message}`)
        }

        const { data: urlData } = supabase.storage
          .from('motosell')
          .getPublicUrl(filePath)

        uploadedImageUrls.push(urlData.publicUrl)
      }

      const payload = {
        brand_id: Number(brandId),
        model,
        year: Number(year),
        price: Number(price),
        purchase_price: Number(purchasePrice),
        mileage: Number(mileage),
        transmission,
        color,
        condition,
        description,
        featured
      }

      if (editingId) {
        await updateMotor(editingId, { ...payload, status })
        if (uploadedImageUrls.length > 0) {
          await uploadMotorImages(editingId, uploadedImageUrls)
        }
        setSuccessMessage('Berhasil! Perubahan data unit motor telah disimpan.')
        setEditingId(null)
      } else {
        const newMotor = await createMotor(payload)
        if (newMotor && newMotor.id) {
          await uploadMotorImages(newMotor.id, uploadedImageUrls)
        }
        setSuccessMessage('Berhasil! Unit motor baru telah ditambahkan ke inventori.')
      }

      setBrandId('')
      setModel('')
      setPrice('')
      setPurchasePrice('')
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
      setEditingId(null)
      setIsLoading(false)
    }
  }

  async function handleEditClick(motor: Motor) {
    setEditingId(motor.id)
    setBrandId(String(motor.brand_id))
    setModel(motor.model)
    setYear(motor.year)
    setPurchasePrice(String(motor.purchase_price || ''))
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
    setSuccessMessage('') 

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
    setPurchasePrice('')
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
    setSuccessMessage('')
  }

  async function handleDelete(id: number, code: string) {
    if (!confirm(`Apakah Anda yakin ingin menghapus motor dengan kode "${code}"?`)) return
    setIsLoading(true)
    setErrorMessage('')
    setSuccessMessage('')
    try {
      await deleteMotor(id)
      const updatedMotors = await getMotors()
      setMotors(updatedMotors as unknown as Motor[])
      setSuccessMessage(`Berhasil menghapus unit motor ${code} dari inventori.`) 
    } catch (error: any) {
      setErrorMessage(error.message)
    } finally {
      setIsLoading(false)
    }
  }

  const exportInventoryToExcel = () => {
    if (filteredMotors.length === 0) return alert('Tidak ada data unit motor terfilter untuk diekspor, Chief!')
    const excelRows = filteredMotors.map((motor, index) => ({
      'No': index + 1,
      'Kode Motor (ID)': motor.motor_code,
      'Pabrikan / Brand': motor.brands?.name || '-',
      'Model Tipe': motor.model,
      'Tahun Rakit': motor.year,
      'Harga Modal (Rp)': motor.purchase_price || 0,
      'Harga Jual (Rp)': motor.price,
      'Jarak Tempuh (Km)': motor.mileage,
      'Transmisi': motor.transmission,
      'Warna': motor.color,
      'Kondisi Fisik': motor.condition,
      'Rekomendasi Utama': motor.featured ? 'YA (Homepage)' : 'TIDAK',
      'Status Ketersediaan': motor.status.toUpperCase(),
      'Deskripsi / Minus': motor.description || '-'
    }))

    const worksheet = XLSX.utils.json_to_sheet(excelRows)
    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Data Inventori Motor')

    const todayStr = new Date().toLocaleDateString('id-ID', { day: '2-digit', month: '2-digit', year: 'numeric' }).replace(/\//g, '-')
    XLSX.writeFile(workbook, `Data_Stok_Inventori_MotoSell_${todayStr}.xlsx`)
  }

  return (
    <div className="p-4 sm:p-8 max-w-7xl mx-auto font-sans bg-slate-50 min-h-screen text-slate-900 rounded-3xl">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4 border-b-2 border-indigo-100 pb-6">
        <div className="flex items-start gap-2.5 max-w-full">
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

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
        <div className="bg-gradient-to-br from-slate-900 to-indigo-950 text-white p-5 rounded-2xl shadow-xl border border-slate-800 flex items-center justify-between">
          <div>
            <p className="text-[10px] sm:text-xs font-bold uppercase tracking-widest text-indigo-300">Total Stok Unit Aktif</p>
            <h3 className="text-xl sm:text-2xl font-black mt-1">{totalUnitAktif} Unit Armada</h3>
            <p className="text-[9px] text-indigo-200/50 font-semibold mt-1 uppercase tracking-wider">| Diluar status sold</p>
          </div>
          <div className="p-3 bg-indigo-600/20 rounded-xl border border-indigo-500/30 text-indigo-400 shrink-0">
            <ShieldCheck className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-slate-900 to-indigo-950 text-white p-5 rounded-2xl shadow-xl border border-slate-800 flex items-center justify-between">
          <div>
            <p className="text-[10px] sm:text-xs font-bold uppercase tracking-widest text-indigo-300">Valuasi Modal Aset Toko</p>
            <h3 className="text-xl sm:text-2xl font-black mt-1">Rp {totalValuasiAset.toLocaleString('id-ID')}</h3>
            <p className="text-[9px] text-indigo-200/50 font-semibold mt-1 uppercase tracking-wider">| Perputaran dana unit ready & booking</p>
          </div>
          <div className="p-3 bg-indigo-600/20 rounded-xl border border-indigo-500/30 text-indigo-400 shrink-0">
            <Landmark className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
        </div>
      </div>

      {errorMessage && (
        <div className="p-4 mb-6 text-sm text-red-800 bg-red-50 border-l-4 border-red-500 rounded-r-xl font-medium">
          <span className="font-bold">Eror:</span> {errorMessage}
        </div>
      )}

      {successMessage && (
        <div className="p-4 mb-6 text-sm text-emerald-800 bg-emerald-50 border-l-4 border-emerald-500 rounded-r-xl font-medium flex justify-between items-center shadow-sm">
          <div><span className="font-bold">Sukses:</span> {successMessage}</div>
          <button onClick={() => setSuccessMessage('')} className="p-1 hover:bg-emerald-200 rounded-lg transition-colors text-emerald-700">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
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
                placeholder="Contoh: Vario 150 CBS"
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
                <label className={`block text-xs font-bold uppercase tracking-widest mb-1.5 ${editingId ? 'text-amber-200' : 'text-emerald-400'}`}>Harga Modal (Rp)</label>
                <input
                  type="number"
                  placeholder="Contoh: 15000000"
                  value={purchasePrice}
                  onChange={(e) => setPurchasePrice(e.target.value)}
                  required
                  className="w-full px-4 py-2.5 bg-emerald-900/20 border border-emerald-500/30 rounded-xl text-emerald-100 text-sm placeholder-emerald-100/30 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
              <div>
                <label className={`block text-xs font-bold uppercase tracking-widest mb-1.5 ${editingId ? 'text-amber-200' : 'text-indigo-300'}`}>Harga Jual (Rp)</label>
                <input
                  type="number"
                  placeholder="Contoh: 17500000"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  required
                  className="w-full px-4 py-2.5 bg-white/10 border border-white/20 rounded-xl text-white text-sm placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
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
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2">
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
              <div className="relative w-full min-h-24 border-2 border-dashed border-white/20 hover:border-indigo-400 rounded-xl transition flex flex-col items-center justify-center p-3 cursor-pointer bg-white/5">
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
                } disabled:opacity-50 cursor-pointer`}
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
                  className="w-full bg-white/10 text-white hover:bg-white/20 py-3 rounded-xl font-bold text-sm transition flex items-center justify-center gap-2 border border-white/10 cursor-pointer"
                >
                  <X className="w-4 h-4" /> Batalkan Perubahan
                </button>
              )}
            </div>
          </form>
        </div>

        <div className="lg:col-span-2 bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
          <div className="p-5 bg-gradient-to-r from-slate-900 to-indigo-950 text-white flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h2 className="text-base sm:text-lg font-bold tracking-wide">Inventori Motor Toko</h2>
              <p className="text-xs text-indigo-200/70 font-medium mt-0.5">Menampilkan: {filteredMotors.length} dari {motors.length} total unit</p>
            </div>
          
            <button
              onClick={exportInventoryToExcel}
              type="button"
              className="w-full sm:w-auto px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs sm:text-sm transition-all shadow-md shadow-emerald-950/20 flex items-center justify-center gap-2 uppercase tracking-wider cursor-pointer"
            >
              <Download className="w-4 h-4 shrink-0" /> Unduh Stok Excel
            </button>
          </div>

          <div className="p-4 bg-slate-100/50 border-b border-slate-200 flex flex-col md:flex-row gap-3 items-center w-full">
            <div className="relative w-full md:flex-1">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                <Search className="w-4 h-4" />
              </span>
              <input
                type="text"
                placeholder="Cari model, tipe, atau kode motor..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium text-slate-700 placeholder-slate-400 shadow-sm"
              />
            </div>

            <div className="relative w-full md:w-64 shrink-0 flex items-center gap-1.5 bg-white px-3 py-2 border border-slate-200 rounded-xl shadow-sm">
              <Filter className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as any)}
                className="w-full bg-transparent text-xs sm:text-sm font-bold text-slate-700 focus:outline-none cursor-pointer"
              >
                <option value="all">Filter: Semua Status</option>
                <option value="ready">Filter: Ready (Tersedia)</option>
                <option value="booking">Filter: Booking (Dipesan)</option>
                <option value="sold">Filter: Sold (Terjual)</option>
              </select>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-100/80">
                  <th className="py-4 px-2 sm:px-4 text-[10px] sm:text-xs font-bold text-slate-500 uppercase tracking-wider">Kode Unit</th>
                  <th className="py-4 px-2 sm:px-4 text-[10px] sm:text-xs font-bold text-slate-500 uppercase tracking-wider">Motor / Model</th>
                  <th className="py-4 px-2 sm:px-4 text-[10px] sm:text-xs font-bold text-slate-500 uppercase tracking-wider">Spesifikasi</th>
                  <th className="py-4 px-2 sm:px-4 text-[10px] sm:text-xs font-bold text-slate-500 uppercase tracking-wider">Harga Modal</th>
                  <th className="py-4 px-2 sm:px-4 text-[10px] sm:text-xs font-bold text-slate-500 uppercase tracking-wider">Harga Pasang</th>
                  <th className="py-4 px-2 sm:px-4 text-[10px] sm:text-xs font-bold text-slate-500 uppercase tracking-wider text-center">Status</th>
                  <th className="py-4 px-2 sm:px-4 text-[10px] sm:text-xs font-bold text-slate-500 uppercase tracking-wider text-center">Operasi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                {filteredMotors.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-slate-400 text-sm font-medium">
                      Tidak ada unit motor yang cocok dengan pencarian atau filter status Anda.
                    </td>
                  </tr>
                ) : (
                  filteredMotors.map((motor) => (
                    <tr key={motor.id} className="hover:bg-indigo-50/30 transition-colors">
                      <td className="py-3 px-2 sm:px-4 text-xs sm:text-sm font-bold font-mono text-indigo-600">{motor.motor_code}</td>
                      <td className="py-3 px-2 sm:px-4 text-xs sm:text-sm">
                        <div className="font-bold text-slate-900 tracking-tight">{motor.model}</div>
                        <div className="text-[10px] sm:text-xs text-slate-400 font-medium">{motor.brands?.name || ''}</div>
                      </td>
                      <td className="py-3 px-2 sm:px-4 text-[10px] sm:text-xs space-y-0.5 text-slate-500 font-semibold">
                        <div className="flex items-center gap-1"><Calendar className="w-3 h-3 text-slate-400 shrink-0" /> Th {motor.year}</div>
                        <div className="flex items-center gap-1"><Gauge className="w-3 h-3 text-slate-400 shrink-0" /> {motor.mileage.toLocaleString('id-ID')} Km</div>
                        <div className="flex items-center gap-1"><Sliders className="w-3 h-3 text-slate-400 shrink-0" /> {motor.transmission}</div>
                      </td>
                      <td className="py-3 px-2 sm:px-4 text-xs sm:text-sm font-bold text-slate-500 whitespace-nowrap">
                        Rp {(motor.purchase_price || 0).toLocaleString('id-ID')}
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
                            className="p-1.5 sm:p-2 bg-slate-100 hover:bg-amber-500 text-slate-600 hover:text-white rounded-xl transition border border-slate-200/60 cursor-pointer"
                          >
                            <Pencil className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(motor.id, motor.motor_code)}
                            title="Hapus Unit"
                            className="p-1.5 sm:p-2 bg-slate-100 hover:bg-red-600 text-slate-600 hover:text-white rounded-xl transition border border-slate-200/60 cursor-pointer"
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