'use client'

import { useState, useEffect } from 'react'
import { getMotors } from '@/actions/motor'
import { getSales, createSale, deleteSale } from '@/actions/sale'
import { ShoppingCart, DollarSign, Package, BadgeAlert, Calendar, User, Phone, FileText, CheckCircle, Filter, TrendingUp, Trash2 } from 'lucide-react'

interface Motor {
  id: number
  motor_code: string
  model: string
  price: number
  purchase_price: number
  status: 'ready' | 'booking' | 'sold'
}

interface Sale {
  id: number
  motor_id: number
  buyer_name: string
  buyer_phone: string | null
  original_price: number
  selling_price: number
  notes: string | null
  created_at: string
  motors: {
    motor_code: string
    model: string
    price: number
    purchase_price: number
  }
}

export default function AdminSalesPage() {
  const [readyMotors, setReadyMotors] = useState<Motor[]>([])
  const [allSalesHistory, setAllSalesHistory] = useState<Sale[]>([]) // Store master data asli dari DB
  const [filteredSales, setFilteredSales] = useState<Sale[]>([])   // Store data hasil filter untuk UI

  // 📅 State Filter Waktu Premium
  const [filterPeriod, setFilterPeriod] = useState<'all' | 'today' | '7days' | '30days' | 'custom'>('all')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')

  const [motorId, setMotorId] = useState('')
  const [buyerName, setBuyerName] = useState('') 
  const [buyerPhone, setBuyerPhone] = useState('')
  const [origPrice, setOrigPrice] = useState(0) 
  const [sellingPrice, setSellingPrice] = useState('')
  const [notes, setNotes] = useState('')

  const [isLoading, setIsLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [successMessage, setSuccessMessage] = useState('')

  useEffect(() => {
    loadInitialData()
  }, [])

  // Pemicu otomatis jalurnya filter ketika state filter berubah
  useEffect(() => {
    applyFilter()
  }, [filterPeriod, startDate, endDate, allSalesHistory])

  async function loadInitialData() {
    try {
      const [motorsData, salesData] = await Promise.all([
        getMotors(),
        getSales()
      ])
      setReadyMotors((motorsData as unknown as Motor[]).filter(m => m.status !== 'sold'))
      setAllSalesHistory(salesData as unknown as Sale[])
    } catch (error: any) {
      setErrorMessage(error.message)
    }
  }

  // 🛠️ ROBOT FILTER WAKTU SAKTI SISI CLIENT (ENTENG & KILAT)
  const applyFilter = () => {
    let tempSales = [...allSalesHistory]
    const startOfToday = new Date()
    startOfToday.setHours(0, 0, 0, 0)

    if (filterPeriod === 'today') {
      tempSales = tempSales.filter(item => new Date(item.created_at) >= startOfToday)
    } else if (filterPeriod === '7days') {
      const sevenDaysAgo = new Date()
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
      tempSales = tempSales.filter(item => new Date(item.created_at) >= sevenDaysAgo)
    } else if (filterPeriod === '30days') {
      const thirtyDaysAgo = new Date()
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
      tempSales = tempSales.filter(item => new Date(item.created_at) >= thirtyDaysAgo)
    } else if (filterPeriod === 'custom' && startDate && endDate) {
      const start = new Date(startDate)
      start.setHours(0, 0, 0, 0)
      const end = new Date(endDate)
      end.setHours(23, 59, 59, 999) // Amankan sampai detik terakhir tanggal tersebut
      tempSales = tempSales.filter(item => {
        const itemDate = new Date(item.created_at)
        return itemDate >= start && itemDate <= end
      })
    }

    setFilteredSales(tempSales)
  }

  // 📊 HITUNG STATISTIK UTAMA SINKRON MURNI DENGAN HASIL FILTER YANG DIPILIH
  const totalOmset = filteredSales.reduce((sum, item) => sum + Number(item.selling_price), 0)
  const totalUnitTerjual = filteredSales.length
  
  // Hitung Laba Bersih Keseluruhan Terfilter
  const totalLabaBersih = filteredSales.reduce((sum, item) => {
    const modal = item.motors?.purchase_price || 0
    return sum + (Number(item.selling_price) - Number(modal))
  }, 0)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!motorId) {
      setErrorMessage('Silakan pilih unit motor yang terjual!')
      return
    }

    setIsLoading(true)
    setErrorMessage('')
    setSuccessMessage('')

    try {
      await createSale({
        motor_id: Number(motorId),
        buyer_name: buyerName,
        buyer_phone: buyerPhone,
        original_price: origPrice, 
        selling_price: Number(sellingPrice),
        notes: notes
      })

      setMotorId('')
      setBuyerName('') 
      setBuyerPhone('')
      setSellingPrice('')
      setNotes('')
      setOrigPrice(0)

      setSuccessMessage('Transaksi Penjualan Berhasil Dicatat! Status unit otomatis berubah menjadi SOLD.')
      await loadInitialData()
    } catch (error: any) {
      setErrorMessage(error.message)
    } finally {
      setIsLoading(false)
    }
  }

  const handleMotorChange = (idString: string) => {
    setMotorId(idString)
    const selected = readyMotors.find(m => m.id === Number(idString))
    if (selected) {
      setSellingPrice(String(selected.price))
      setOrigPrice(selected.price) 
    } else {
      setSellingPrice('')
      setOrigPrice(0)
    }
  }

  // Fungsi Handler Hapus Riwayat Penjualan (Fitur Baru Pembatalan Transaksi)
  async function handleDeleteSale(id: number, motorCode: string) {
    if (!confirm(`Apakah Anda yakin ingin menghapus kwitansi penjualan untuk unit "${motorCode}"?\nTindakan ini akan mengembalikan status motor menjadi READY di showroom.`)) return

    setIsLoading(true)
    setErrorMessage('')
    setSuccessMessage('')

    try {
      await deleteSale(id)
      setSuccessMessage(`Berhasil menghapus kwitansi unit ${motorCode}. Status motor dikembalikan menjadi READY stock.`)
      await loadInitialData()
    } catch (error: any) {
      setErrorMessage(error.message)
    } finally {
      setIsLoading(false)
    }
  }

  // Variabel untuk Proyeksi Live Form Kasir
  const selectedMotorObj = readyMotors.find(m => m.id === Number(motorId))
  const liveModalPrice = selectedMotorObj ? selectedMotorObj.purchase_price : 0
  const liveProfit = motorId && sellingPrice ? Number(sellingPrice) - liveModalPrice : 0

  return (
    <div className="p-4 sm:p-8 max-w-7xl mx-auto font-sans bg-slate-50 min-h-screen text-slate-900 rounded-3xl">
      
      {/* 🏁 HEADER UTAMA */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4 border-b-2 border-indigo-100 pb-6">
        <div className="flex items-start gap-2.5 max-w-full">
          <span className="w-3 h-7 bg-indigo-600 rounded-full shrink-0 mt-1 sm:mt-1.5" />
          <div className="space-y-1 min-w-0 flex-1">
            <div className="flex items-center gap-2 text-slate-900">
              <ShoppingCart className="w-5 h-5 sm:w-7 sm:h-7 text-indigo-600 shrink-0" />
              <h1 className="text-xl sm:text-2xl md:text-3xl font-black tracking-tight leading-none">
                Manajemen <span className="text-indigo-600">Penjualan Toko</span>
              </h1>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 font-medium leading-relaxed">
              Catat transaksi masuk dan pantau performa finansial MotoSell secara berkala.
            </p>
          </div>
        </div>
      </div>

      {/* 📅 BAR KONTROL FILTER WAKTU BARU PREMIUM */}
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200 mb-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-2 text-xs sm:text-sm font-bold text-slate-700">
          <Filter className="w-4 h-4 text-indigo-600" />
          <span>Filter Periode Pendapatan & Jurnal:</span>
        </div>
        
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          {[
            { key: 'all', label: 'Semua (All)' },
            { key: 'today', label: 'Hari Ini' },
            { key: '7days', label: '7 Hari Terakhir' },
            { key: '30days', label: '30 Hari Terakhir' },
            { key: 'custom', label: 'Custom Tanggal' },
          ].map((p) => (
            <button
              key={p.key}
              onClick={() => setFilterPeriod(p.key as any)}
              className={`px-3 py-2 rounded-xl text-xs font-bold transition-all border ${
                filterPeriod === p.key
                  ? 'bg-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-200'
                  : 'bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200'
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>

        {/* Input Tanggal Tambahan khusus jika memilih periode 'custom' */}
        {filterPeriod === 'custom' && (
          <div className="flex items-center gap-2 w-full md:w-auto bg-slate-50 p-2 rounded-xl border border-slate-200 animate-fadeIn">
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="px-2 py-1 bg-white border border-slate-200 rounded-lg text-xs font-bold focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
            <span className="text-xs font-bold text-slate-400">s/d</span>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="px-2 py-1 bg-white border border-slate-200 rounded-lg text-xs font-bold focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>
        )}
      </div>

      {/* 📊 KARTU REKAP DINAMIS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-gradient-to-br from-slate-900 to-indigo-950 text-white p-5 sm:p-6 rounded-2xl shadow-xl border border-slate-800 flex items-center justify-between">
          <div>
            <p className="text-[10px] sm:text-xs font-bold uppercase tracking-widest text-indigo-300">Omset Penjualan</p>
            <h3 className="text-xl sm:text-2xl font-black mt-2">Rp {totalOmset.toLocaleString('id-ID')}</h3>
          </div>
          <div className="p-3 bg-indigo-600/20 rounded-xl border border-indigo-500/30 text-indigo-400 shrink-0">
            <DollarSign className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-slate-900 to-emerald-950 text-white p-5 sm:p-6 rounded-2xl shadow-xl border border-emerald-900 flex items-center justify-between">
          <div>
            <p className="text-[10px] sm:text-xs font-bold uppercase tracking-widest text-emerald-400">Total Laba Bersih</p>
            <h3 className="text-xl sm:text-2xl font-black mt-2 text-emerald-300">Rp {totalLabaBersih.toLocaleString('id-ID')}</h3>
          </div>
          <div className="p-3 bg-emerald-600/20 rounded-xl border border-emerald-500/30 text-emerald-400 shrink-0">
            <TrendingUp className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-slate-900 to-indigo-950 text-white p-5 sm:p-6 rounded-2xl shadow-xl border border-slate-800 flex items-center justify-between">
          <div>
            <p className="text-[10px] sm:text-xs font-bold uppercase tracking-widest text-indigo-300">Unit Terjual</p>
            <h3 className="text-xl sm:text-2xl font-black mt-2">{totalUnitTerjual} Unit</h3>
          </div>
          <div className="p-3 bg-indigo-600/20 rounded-xl border border-indigo-500/30 text-indigo-400 shrink-0">
            <Package className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-slate-900 to-indigo-950 text-white p-5 sm:p-6 rounded-2xl shadow-xl border border-slate-800 flex items-center justify-between">
          <div>
            <p className="text-[10px] sm:text-xs font-bold uppercase tracking-widest text-indigo-300">Ready Stock</p>
            <h3 className="text-xl sm:text-2xl font-black mt-2">{readyMotors.filter(m => m.status === 'ready').length} Unit</h3>
          </div>
          <div className="p-3 bg-indigo-600/20 rounded-xl border border-indigo-500/30 text-indigo-400 shrink-0">
            <CheckCircle className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
        </div>
      </div>

      {errorMessage && (
        <div className="p-4 mb-6 text-sm text-red-800 bg-red-50 border-l-4 border-red-500 rounded-r-xl font-medium flex items-center gap-2">
          <BadgeAlert className="w-4 h-4 text-red-500 shrink-0" /> <span><span className="font-bold">Eror:</span> {errorMessage}</span>
        </div>
      )}
      {successMessage && (
        <div className="p-4 mb-6 text-sm text-green-800 bg-green-50 border-l-4 border-green-500 rounded-r-xl font-medium flex items-center gap-2">
          <CheckCircle className="w-4 h-4 text-green-500 shrink-0" /> <span>{successMessage}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Form Input Kasir Penjualan */}
        <div className="p-5 sm:p-6 bg-slate-900 border border-slate-800 rounded-2xl shadow-xl text-white h-fit">
          <h2 className="text-xs sm:text-sm font-extrabold mb-5 flex items-center gap-2 tracking-widest uppercase">
            <span className="w-2.5 h-5 rounded-full bg-indigo-500" />
            CATAT PENJUALAN BARU
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-widest text-slate-400 mb-1.5">Pilih Unit Motor Terjual</label>
              <select
                value={motorId}
                onChange={(e) => handleMotorChange(e.target.value)}
                required
                className="w-full px-3 py-2.5 bg-white/10 border border-white/20 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="" className="text-slate-900">-- Pilih Unit Ready --</option>
                {readyMotors.map((m) => (
                  <option key={m.id} value={m.id} className="text-slate-900">
                    [{m.motor_code}] {m.model} - Rp {m.price.toLocaleString('id-ID')}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-widest text-slate-400 mb-1.5">Nama Lengkap Pembeli</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400"><User className="w-4 h-4" /></span>
                <input
                  type="text"
                  placeholder="Contoh: Budi Santoso"
                  value={buyerName}
                  onChange={(e) => setBuyerName(e.target.value)}
                  required
                  className="w-full pl-10 pr-4 py-2.5 bg-white/10 border border-white/20 rounded-xl text-white text-sm placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-widest text-slate-400 mb-1.5">No. WhatsApp Pembeli</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400"><Phone className="w-4 h-4" /></span>
                <input
                  type="tel"
                  placeholder="Contoh: 081234567890"
                  value={buyerPhone}
                  onChange={(e) => setBuyerPhone(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-white/10 border border-white/20 rounded-xl text-white text-sm placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-widest text-slate-400 mb-1.5">Harga Deal Akhir / Nego (Rp)</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400"><DollarSign className="w-4 h-4" /></span>
                <input
                  type="number"
                  placeholder="Contoh: 17000000"
                  value={sellingPrice}
                  onChange={(e) => setSellingPrice(e.target.value)}
                  required
                  className="w-full pl-10 pr-4 py-2.5 bg-white/10 border border-white/20 rounded-xl text-white text-sm placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              
              {motorId && sellingPrice && (
                <div className={`mt-2 p-2 rounded-lg text-[11px] font-bold border ${liveProfit >= 0 ? 'bg-emerald-900/40 border-emerald-500/30 text-emerald-400' : 'bg-red-900/40 border-red-500/30 text-red-400'}`}>
                  {liveProfit >= 0 
                    ? `✅ Proyeksi Margin Laba: + Rp ${liveProfit.toLocaleString('id-ID')}` 
                    : `⚠️ PERINGATAN: Jual Rugi Modal (- Rp ${Math.abs(liveProfit).toLocaleString('id-ID')})`
                  }
                </div>
              )}
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-widest text-slate-400 mb-1.5">Catatan Tambahan / Bonus</label>
              <div className="relative">
                <span className="absolute top-3 left-3.5 text-slate-400"><FileText className="w-4 h-4" /></span>
                <textarea
                  placeholder="Contoh: Free helm ink, pajak terima jalan panjang..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={3}
                  className="w-full pl-10 pr-4 py-2 bg-white/10 border border-white/20 rounded-xl text-white text-sm placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl text-sm transition shadow-md flex items-center justify-center gap-2 uppercase tracking-wider disabled:opacity-50"
            >
              <CheckCircle className="w-4 h-4" /> {isLoading ? 'Menyimpan...' : 'Sah & Bukukan Transaksi'}
            </button>
          </form>
        </div>

        {/* Tabel Histori Kwitansi Berdasarkan Hasil Filter Aktif */}
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
          <div className="p-5 bg-gradient-to-r from-slate-900 to-indigo-950 text-white">
            <h2 className="text-base sm:text-lg font-bold tracking-wide">Jurnal Riwayat Penjualan & Laba</h2>
            <p className="text-xs text-indigo-200/70 font-medium mt-0.5">Daftar kwitansi transaksi masuk terfilter ({filteredSales.length} data)</p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-100/80">
                  <th className="py-4 px-3 sm:px-4 text-xs font-bold text-slate-500 uppercase tracking-widest">Tanggal</th>
                  <th className="py-4 px-3 sm:px-4 text-xs font-bold text-slate-500 uppercase tracking-widest">Kode Unit</th>
                  <th className="py-4 px-3 sm:px-4 text-xs font-bold text-slate-500 uppercase tracking-widest">Armada Motor</th>
                  <th className="py-4 px-3 sm:px-4 text-xs font-bold text-slate-500 uppercase tracking-widest">Data Pembeli</th>
                  <th className="py-4 px-3 sm:px-4 text-xs font-bold text-slate-500 uppercase tracking-widest">Harga Deal</th>
                  <th className="py-4 px-3 sm:px-4 text-xs font-bold text-slate-500 uppercase tracking-widest">Laba Bersih</th>
                  <th className="py-4 px-3 sm:px-4 text-xs font-bold text-slate-500 uppercase tracking-widest text-center">Operasi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                {filteredSales.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-slate-400 text-sm font-medium">
                      Tidak ada transaksi penjualan yang cocok dengan periode filter waktu pilihan Anda.
                    </td>
                  </tr>
                ) : (
                  filteredSales.map((sale) => {
                    const profitTabel = Number(sale.selling_price) - Number(sale.motors?.purchase_price || 0)
                    
                    return (
                      <tr key={sale.id} className="hover:bg-indigo-50/30 transition-colors">
                        <td className="py-3 sm:py-4 px-3 sm:px-4 text-xs text-slate-500 whitespace-nowrap">
                          <div className="flex items-center gap-1">
                            <Calendar className="w-3 h-3 text-slate-400 shrink-0" />
                            {new Date(sale.created_at).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })}
                          </div>
                        </td>
                        <td className="py-3 sm:py-4 px-3 sm:px-4 text-xs sm:text-sm font-bold font-mono text-indigo-600">{sale.motors?.motor_code || 'UNIT'}</td>
                        <td className="py-3 sm:py-4 px-3 sm:px-4 text-xs sm:text-sm">
                          <div className="font-bold text-slate-900 tracking-tight">{sale.motors?.model || 'Unit Terhapus'}</div>
                          <div className="text-[10px] text-slate-400 font-medium">Harga Awal: Rp {(sale.original_price || 0).toLocaleString('id-ID')}</div>
                        </td>
                        <td className="py-3 sm:py-4 px-3 sm:px-4 text-xs">
                          <div className="font-bold text-slate-800">{sale.buyer_name}</div>
                          <div className="text-slate-400 font-semibold">{sale.buyer_phone || '-'}</div>
                        </td>
                        <td className="py-3 sm:py-4 px-3 sm:px-4 text-xs sm:text-sm font-black text-slate-800 whitespace-nowrap">
                          Rp {Number(sale.selling_price).toLocaleString('id-ID')}
                        </td>
                        <td className={`py-3 sm:py-4 px-3 sm:px-4 text-xs sm:text-sm font-black whitespace-nowrap ${profitTabel >= 0 ? 'text-emerald-600' : 'text-red-500'}`}>
                          {profitTabel >= 0 ? '+' : '-'} Rp {Math.abs(profitTabel).toLocaleString('id-ID')}
                        </td>
                        <td className="py-3 sm:py-4 px-3 sm:px-4 text-center whitespace-nowrap">
                          <button
                            onClick={() => handleDeleteSale(sale.id, sale.motors?.motor_code || 'UNIT')}
                            disabled={isLoading}
                            title="Hapus Kwitansi Transaksi"
                            className="p-1.5 sm:p-2 bg-slate-100 hover:bg-red-600 text-slate-600 hover:text-white rounded-xl transition border border-slate-200/60 disabled:opacity-50"
                          >
                            <Trash2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                          </button>
                        </td>
                      </tr>
                    )
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}