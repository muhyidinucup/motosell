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

  // HITUNG STATISTIK UTAMA SECARA OTOMATIS
  const totalOmset = sales.reduce((sum, item) => sum + Number(item.selling_price), 0)
  const totalTerjual = sales.length
  const totalDiskonNego = sales.reduce((sum, item) => sum + (Number(item.original_price) - Number(item.selling_price)), 0)

  // FORMAT GRAFIK 1: LINE CHART (OMSET 6 BULAN TERAKHIR)
  const formatLineChartData = () => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des']
    const last6Months = Array.from({ length: 6 }, (_, i) => {
      const d = new Date()
      d.setMonth(d.getMonth() - i)
      return { monthNum: d.getMonth(), year: d.getFullYear(), name: months[d.getMonth()], Omset: 0 }
    }).reverse()

    sales.forEach(item => {
      const saleDate = new Date(item.created_at)
      const match = last6Months.find(m => m.monthNum === saleDate.getMonth() && m.year === saleDate.getFullYear())
      if (match) {
        match.Omset += Number(item.selling_price)
      }
    })
    return last6Months
  }

  // FORMAT GRAFIK 2: BAR CHART (VOLUME MINGGUAN)
  const formatBarChartData = () => {
    const days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu']
    const weeklyData = days.map(day => ({ name: day, Unit: 0 }))

    sales.forEach(item => {
      const saleDate = new Date(item.created_at)
      const diffTime = Math.abs(new Date().getTime() - saleDate.getTime())
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
      if (diffDays <= 7) {
        weeklyData[saleDate.getDay()].Unit += 1
      }
    })
    return weeklyData
  }

  // FORMAT GRAFIK 3: PIE CHART (PROPORSI BRAND MOTOR)
  const formatPieChartData = () => {
    const brandMap: { [key: string]: number } = {}
    sales.forEach(item => {
      const code = item.motors?.motor_code?.split('-')[0] || 'LAIN'
      brandMap[code] = (brandMap[code] || 0) + 1
    })
    return Object.keys(brandMap).map(key => ({ name: key, value: brandMap[key] }))
  }

  const COLORS = ['#4f46e5', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6']

  // LOGIKA EXPORT EXCEL
  const exportToExcel = () => {
    if (sales.length === 0) return alert('Belum ada data transaksi untuk diekspor!')

    const reportRows = sales.map((item) => ({
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
    XLSX.writeFile(workbook, `Laporan_Finansial_MotoSell_${new Date().toISOString().split('T')[0]}.xlsx`)
  }

  if (loading) {
    return <div className="p-8 text-center text-slate-500 font-bold animate-pulse">Menghitung data finansial showroom...</div>
  }

  return (
    <div className="p-4 sm:p-8 max-w-7xl mx-auto font-sans bg-slate-50 min-h-screen text-slate-900">
      
      {/* HEADER ATAS RESPONSIVE (Tumpuk Vertikal di HP, Sejajar di Desktop) */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 sm:mb-8 gap-4 border-b-2 border-indigo-100 pb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <LayoutDashboard className="w-7 sm:w-8 h-7 sm:h-8 text-indigo-600" />
            Executive <span className="text-indigo-600">Financial Dashboard</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 font-medium">Analisis grafik performa omset penjualan dan unduh laporan pembukuan.</p>
        </div>
        <button
          onClick={exportToExcel}
          className="w-full md:w-auto text-center justify-center px-5 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs sm:text-sm transition shadow-md flex items-center gap-2 uppercase tracking-wider"
        >
          <Download className="w-4 h-4" /> Export Jurnal Excel
        </button>
      </div>

      {/* 📊 KARTU STATISTIK (grid-cols-1 di HP, otomatis membelah jadi 3 di Desktop) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
        <div className="bg-gradient-to-br from-slate-900 to-indigo-950 text-white p-5 sm:p-6 rounded-2xl shadow-xl border border-slate-800 flex items-center justify-between">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-indigo-300">Total Omset Pendapatan</p>
            <h3 className="text-xl sm:text-2xl lg:text-3xl font-black mt-2">Rp {totalOmset.toLocaleString('id-ID')}</h3>
          </div>
          <div className="p-3 bg-indigo-600/20 rounded-xl text-indigo-400">
            <DollarSign className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-slate-900 to-indigo-950 text-white p-5 sm:p-6 rounded-2xl shadow-xl border border-slate-800 flex items-center justify-between">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-indigo-300">Total Unit Terjual</p>
            <h3 className="text-xl sm:text-2xl lg:text-3xl font-black mt-2">{totalTerjual} Armada</h3>
          </div>
          <div className="p-3 bg-indigo-600/20 rounded-xl text-indigo-400">
            <ShoppingBag className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-slate-900 to-indigo-950 text-white p-5 sm:p-6 rounded-2xl shadow-xl border border-slate-800 flex items-center justify-between">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-indigo-300">Akumulasi Selisih Nego</p>
            <h3 className="text-xl sm:text-2xl lg:text-3xl font-black mt-2">Rp {totalDiskonNego.toLocaleString('id-ID')}</h3>
          </div>
          <div className="p-3 bg-indigo-600/20 rounded-xl text-indigo-400">
            <TrendingUp className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* BLOCK GRAFIK UTAMA */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
        
        {/* LINE CHART: TREN PENDAPATAN */}
        <div className="lg:col-span-2 bg-white p-4 sm:p-6 rounded-2xl shadow-md border border-slate-200 min-w-0">
          <h2 className="text-xs sm:text-sm font-black mb-6 text-slate-700 tracking-wider uppercase flex items-center gap-2">
            <span className="w-2.5 h-4 sm:h-5 rounded-full bg-indigo-600" />
            Tren Pendapatan 6 Bulan Terakhir
          </h2>
          <div className="w-full h-64 sm:h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={formatLineChartData()}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="name" stroke="#64748b" fontSize={10} fontWeight="bold" />
                <YAxis stroke="#64748b" fontSize={10} fontWeight="bold" width={40} />
                <Tooltip formatter={(value) => [`Rp ${Number(value).toLocaleString('id-ID')}`, 'Omset']} />
                <Line type="monotone" dataKey="Omset" stroke="#4f46e5" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* PIE CHART: DOMINASI MARKET BRAND */}
        <div className="bg-white p-4 sm:p-6 rounded-2xl shadow-md border border-slate-200 flex flex-col justify-between min-w-0">
          <div>
            <h2 className="text-xs sm:text-sm font-black mb-4 text-slate-700 tracking-wider uppercase flex items-center gap-2">
              <span className="w-2.5 h-4 sm:h-5 rounded-full bg-indigo-600" />
              Dominasi Market Brand Motor
            </h2>
            <div className="w-full h-56 sm:h-64 flex justify-center items-center">
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

        {/* BAR CHART: PENJUALAN MINGGUAN */}
        <div className="lg:col-span-3 bg-white p-4 sm:p-6 rounded-2xl shadow-md border border-slate-200 min-w-0">
          <h2 className="text-xs sm:text-sm font-black mb-6 text-slate-700 tracking-wider uppercase flex items-center gap-2">
            <span className="w-2.5 h-4 sm:h-5 rounded-full bg-indigo-600" />
            Volume Penjualan Unit (7 Hari Terakhir)
          </h2>
          <div className="w-full h-64 sm:h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={formatBarChartData()}>
                <XAxis dataKey="name" stroke="#64748b" fontSize={10} fontWeight="bold" />
                <YAxis stroke="#64748b" fontSize={10} fontWeight="bold" allowDecimals={false} width={25} />
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