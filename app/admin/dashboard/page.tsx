'use client'

import { useState, useEffect } from 'react'
import { getSales } from '@/actions/sale'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, CartesianGrid, PieChart, Pie, Cell } from 'recharts'
import * as XLSX from 'xlsx'
import { LayoutDashboard, DollarSign, ShoppingBag, TrendingUp, Download } from 'lucide-react'

interface SaleData {
  id: number
  original_price: number
  selling_price: number
  buyer_name: string
  created_at: string
  motors: {
    model: string
    motor_code: string
  }
}

export default function AdminDashboardPage() {
  const [sales, setSales] = useState<SaleData[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchDashboardData() {
      try {
        const data = await getSales()
        setSales(data as unknown as SaleData[])
      } catch (error) {
        console.error('Gagal memuat data grafik:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchDashboardData()
  }, [])

  // 📅 LOGIKA SAKTI: AMBIL TRANSAKSI KHUSUS BULAN INI & TAHUN INI
  const now = new Date()
  const currentYear = now.getFullYear()
  const currentMonth = now.getMonth()

  const salesBulanIni = sales.filter(item => {
    const saleDate = new Date(item.created_at)
    return saleDate.getMonth() === currentMonth && saleDate.getFullYear() === currentYear
  })

  // 📊 HITUNG STATISTIK UTAMA SINKRON MURNI DATA 1 BULAN BERJALAN
  const totalOmset = salesBulanIni.reduce((sum, item) => sum + Number(item.selling_price), 0)
  const totalTerjual = salesBulanIni.length
  const totalDiskonNego = salesBulanIni.reduce((sum, item) => sum + (Number(item.original_price) - Number(item.selling_price)), 0)

  // 📈 FORMAT GRAFIK 1: LINE CHART (TREN OMSET HARIAN/TANGGAL DALAM 1 BULAN INI)
  const formatLineChartData = () => {
    // Cari tahu total hari di bulan ini (28, 29, 30, atau 31 hari)
    const totalDaysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate()
    
    // Buat template array harian kosong dari tanggal 1 sampai akhir bulan
    const dailyData = Array.from({ length: totalDaysInMonth }, (_, i) => ({
      dateNum: i + 1,
      name: `${i + 1}`,
      Omset: 0
    }))

    // Masukkan data omset penjualan yang cocok dengan tanggalnya
    salesBulanIni.forEach(item => {
      const saleDate = new Date(item.created_at)
      const dateNum = saleDate.getDate()
      const match = dailyData.find(d => d.dateNum === dateNum)
      if (match) {
        match.Omset += Number(item.selling_price)
      }
    })
    return dailyData
  }

  // 📊 FORMAT GRAFIK 2: BAR CHART (VOLUME MINGGUAN - 7 HARI TERAKHIR)
  const formatBarChartData = () => {
    const days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu']
    const weeklyData = days.map(day => ({ name: day, Unit: 0 }))

    sales.forEach(item => {
      const saleDate = new Date(item.created_at)
      const diffTime = Math.abs(now.getTime() - saleDate.getTime())
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
      if (diffDays <= 7) {
        weeklyData[saleDate.getDay()].Unit += 1
      }
    })
    return weeklyData
  }

  // 🍕 FORMAT GRAFIK 3: PIE CHART (DOMINASI MARKET BRAND KHUSUS BULAN INI)
  const formatPieChartData = () => {
    const brandMap: { [key: string]: number } = {}
    salesBulanIni.forEach(item => {
      const code = item.motors?.motor_code?.split('-')[0] || 'LAIN'
      brandMap[code] = (brandMap[code] || 0) + 1
    })
    return Object.keys(brandMap).map(key => ({ name: key, value: brandMap[key] }))
  }

  const COLORS = ['#4f46e5', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6']

  // LOGIKA EXPORT EXCEL
  const exportToExcel = () => {
    if (salesBulanIni.length === 0) return alert('Belum ada data transaksi bulan ini untuk diekspor!')

    const reportRows = salesBulanIni.map((item) => ({
      'No. Kwitansi': `INV-00${item.id}`,
      'Tanggal Transaksi': new Date(item.created_at).toLocaleDateString('id-ID'),
      'Kode Motor': item.motors?.motor_code || '-',
      'Model Armada': item.motors?.model || 'Unit Terhapus',
      'Harga Awal Website (Rp)': Number(item.original_price),
      'Harga Deal Akhir (Rp)': Number(item.selling_price),
      'Selisih Nego/Diskon (Rp)': Number(item.original_price) - Number(item.selling_price),
      'Nama Pembeli': item.buyer_name
    }))

    const worksheet = XLSX.utils.json_to_sheet(reportRows)
    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Laporan Penjualan')
    XLSX.writeFile(workbook, `Laporan_Finansial_MotoSell_Bulan_${currentMonth + 1}_${currentYear}.xlsx`)
  }

  if (loading) {
    return <div className="p-8 text-center text-slate-500 font-bold animate-pulse text-xs sm:text-sm uppercase tracking-wider">Menghitung data finansial showroom...</div>
  }

  return (
    <div className="p-4 sm:p-8 max-w-7xl mx-auto font-sans bg-slate-50 min-h-screen text-slate-900 rounded-3xl">
      
      {/* 🏁 HEADER ATAS RESPONSIVE - REVISI JUDUL TEGAK LURUS & RATA KIRI DI HP */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 sm:mb-8 gap-4 border-b-2 border-indigo-100 pb-6">
        <div className="flex items-start gap-2.5 max-w-full">
          <span className="w-3 h-7 bg-indigo-600 rounded-full shrink-0 mt-1 sm:mt-1.5" />
          <div className="space-y-1 min-w-0 flex-1">
            <div className="flex items-center gap-2 text-slate-900">
              <LayoutDashboard className="w-5 h-5 sm:w-7 sm:h-7 text-indigo-600 shrink-0" />
              <h1 className="text-xl sm:text-2xl md:text-3xl font-black tracking-tight leading-none">
                Executive <span className="text-indigo-600">Financial Dashboard</span>
              </h1>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 mt-1 font-medium leading-relaxed">
              Analisis grafik performa omset penjualan bulanan berjalan dan unduh laporan pembukuan.
            </p>
          </div>
        </div>
        <button
          onClick={exportToExcel}
          className="w-full md:w-auto text-center justify-center px-5 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs sm:text-sm transition shadow-md flex items-center gap-2 uppercase tracking-wider"
        >
          <Download className="w-4 h-4 shrink-0" /> Export Excel Bulan Ini
        </button>
      </div>

      {/* 📊 KARTU STATISTIK 1 BULAN BERJALAN DENGAN AKSEN INDIKATOR TEXT */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
        <div className="bg-gradient-to-br from-slate-900 to-indigo-950 text-white p-5 sm:p-6 rounded-2xl shadow-xl border border-slate-800 flex items-center justify-between">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-indigo-300">Total Omset Pendapatan</p>
            <h3 className="text-xl sm:text-2xl lg:text-3xl font-black mt-1">Rp {totalOmset.toLocaleString('id-ID')}</h3>
            <p className="text-[9px] text-indigo-200/50 font-semibold mt-1 uppercase tracking-wider">| Periode Bulan Ini</p>
          </div>
          <div className="p-3 bg-indigo-600/20 rounded-xl border border-indigo-500/30 text-indigo-400 shrink-0">
            <DollarSign className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-slate-900 to-indigo-950 text-white p-5 sm:p-6 rounded-2xl shadow-xl border border-slate-800 flex items-center justify-between">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-indigo-300">Total Unit Terjual</p>
            <h3 className="text-xl sm:text-2xl lg:text-3xl font-black mt-1">{totalTerjual} Armada</h3>
            <p className="text-[9px] text-indigo-200/50 font-semibold mt-1 uppercase tracking-wider">| Periode Bulan Ini</p>
          </div>
          <div className="p-3 bg-indigo-600/20 rounded-xl border border-indigo-500/30 text-indigo-400 shrink-0">
            <ShoppingBag className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-slate-900 to-indigo-950 text-white p-5 sm:p-6 rounded-2xl shadow-xl border border-slate-800 flex items-center justify-between sm:col-span-2 lg:col-span-1">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-indigo-300">Akumulasi Selisih Nego</p>
            <h3 className="text-xl sm:text-2xl lg:text-3xl font-black mt-1">Rp {totalDiskonNego.toLocaleString('id-ID')}</h3>
            <p className="text-[9px] text-indigo-200/50 font-semibold mt-1 uppercase tracking-wider">| Periode Bulan Ini</p>
          </div>
          <div className="p-3 bg-indigo-600/20 rounded-xl border border-indigo-500/30 text-indigo-400 shrink-0">
            <TrendingUp className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* BLOCK GRAFIK UTAMA */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
        
        {/* LINE CHART: TREN PENDAPATAN HARIAN DALAM BULAN BERJALAN */}
        <div className="lg:col-span-2 bg-white p-4 sm:p-6 rounded-2xl shadow-md border border-slate-200 min-w-0">
          <h2 className="text-xs sm:text-sm font-black mb-6 text-slate-700 tracking-wider uppercase flex items-center gap-2">
            <span className="w-2.5 h-4 sm:h-5 rounded-full bg-indigo-600" />
            Tren Omset Harian (Bulan Ini)
          </h2>
          <div className="w-full h-64 sm:h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={formatLineChartData()} margin={{ top: 10, right: 10, left: 15, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="name" stroke="#64748b" fontSize={9} fontWeight="bold" />
                <YAxis stroke="#64748b" fontSize={10} fontWeight="bold" width={55} />
                <Tooltip formatter={(value) => [`Rp ${Number(value).toLocaleString('id-ID')}`, 'Omset Tanggal Ini']} />
                <Line type="monotone" dataKey="Omset" stroke="#4f46e5" strokeWidth={2.5} dot={false} activeDot={{ r: 5 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* PIE CHART: DOMINASI MARKET BRAND KHUSUS BULAN INI */}
        <div className="bg-white p-4 sm:p-6 rounded-2xl shadow-md border border-slate-200 flex flex-col justify-between min-w-0">
          <div>
            <h2 className="text-xs sm:text-sm font-black mb-4 text-slate-700 tracking-wider uppercase flex items-center gap-2">
              <span className="w-2.5 h-4 sm:h-5 rounded-full bg-indigo-600" />
              Dominasi Brand Laku (Bulan Ini)
            </h2>
            <div className="w-full h-56 sm:h-64 flex justify-center items-center">
              {formatPieChartData().length === 0 ? (
                <div className="text-xs text-slate-400 font-medium">Belum ada unit terjual bulan ini.</div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={formatPieChartData()}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={70}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {formatPieChartData().map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => [`${value} Unit`, 'Terjual']} />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2 text-[10px] sm:text-xs font-bold text-slate-600 border-t border-slate-100 pt-4">
            {formatPieChartData().map((entry, index) => (
              <div key={entry.name} className="flex items-center gap-1.5 truncate">
                <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                <span className="truncate">{entry.name}: {entry.value} Unit</span>
              </div>
            ))}
          </div>
        </div>

        {/* BAR CHART: PENJUALAN MINGGUAN (7 HARI TERAKHIR) */}
        <div className="lg:col-span-3 bg-white p-4 sm:p-6 rounded-2xl shadow-md border border-slate-200 min-w-0">
          <h2 className="text-xs sm:text-sm font-black mb-6 text-slate-700 tracking-wider uppercase flex items-center gap-2">
            <span className="w-2.5 h-4 sm:h-5 rounded-full bg-indigo-600" />
            Volume Penjualan Unit (7 Hari Terakhir)
          </h2>
          <div className="w-full h-64 sm:h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={formatBarChartData()} margin={{ top: 10, right: 10, left: 5, bottom: 5 }}>
                <XAxis dataKey="name" stroke="#64748b" fontSize={10} fontWeight="bold" />
                <YAxis stroke="#64748b" fontSize={10} fontWeight="bold" allowDecimals={false} width={30} />
                <Tooltip formatter={(value) => [`${value} Unit`, 'Terjual']} />
                <Bar dataKey="Unit" fill="#10b981" radius={[6, 6, 0, 0]} barSize={30} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>
    </div>
  )
}