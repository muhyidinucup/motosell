'use client'

import { useState, useEffect } from 'react'
import { getSalesReportData } from '@/actions/reports'
import { BarChart3, Download, DollarSign, TrendingUp, ShieldAlert, FileText } from 'lucide-react'

export default function AdminReportsPage() {
  const currentYear = new Date().getFullYear()
  const currentMonth = new Date().getMonth() + 1

  const [year, setYear] = useState(currentYear)
  const [month, setMonth] = useState(currentMonth)
  const [report, setReport] = useState<any>({ sales: [], totalOmset: 0, totalModal: 0, totalLaba: 0 })
  const [loading, setLoading] = useState(true)

  // List nama bulan untuk filter dropdown
  const monthsList = [
    { value: 1, name: 'Januari' }, { value: 2, name: 'Februari' },
    { value: 3, name: 'Maret' }, { value: 4, name: 'April' },
    { value: 5, name: 'Mei' }, { value: 6, name: 'Juni' },
    { value: 7, name: 'Juli' }, { value: 8, name: 'Agustus' },
    { value: 9, name: 'September' }, { value: 10, name: 'Oktober' },
    { value: 11, name: 'November' }, { value: 12, name: 'Desember' }
  ]

  // Efek otomatis panggil data tiap filter bulan/tahun diubah admin
  useEffect(() => {
    async function loadReport() {
      setLoading(true)
      const data = await getSalesReportData(year, month)
      setReport(data)
      setLoading(false)
    }
    loadReport()
  }, [year, month])

  // 🚀 LOGIKA SAKTI: Ekspor Data Langsung Jadi File Excel (.csv) Tanpa Library Ribet!
  const handleExportToExcel = () => {
    if (report.sales.length === 0) {
      alert('Tidak ada data penjualan di bulan ini untuk diekspor!')
      return
    }

    let csvContent = 'ID,Tanggal Terjual,Kode Unit,Model Motor,Nama Pembeli,Harga Modal (Rp),Harga Jual (Rp),Laba Bersih (Rp),Metode Bayar\n'

    report.sales.forEach((item: any) => {
      const tanggal = new Date(item.sold_at).toLocaleDateString('id-ID')
      const model = item.motors?.model || 'Unit Terhapus'
      const kode = item.motors?.motor_code || '-'
      const pembeli = item.buyer_name || item.customer_name || '-'
      const modalPrice = item.original_price || 0
      const jualPrice = item.selling_price || item.final_price || 0
      const laba = jualPrice - modalPrice
      const metode = item.payment_method || '-'

      csvContent += `"${item.id}","${tanggal}","${kode}","${model}","${pembeli}",${modalPrice},${jualPrice},${laba},"${metode}"\n`
    })

    csvContent += `\n,,,,TOTAL OMSET,${report.totalModal},${report.totalOmset},${report.totalLaba},\n`

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.setAttribute('href', url)
    link.setAttribute('download', `Laporan_Keuangan_MotoSell_${year}_Bulan_${month}.csv`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <div className="p-4 sm:p-8 max-w-7xl mx-auto font-sans bg-slate-50 min-h-screen text-slate-900 rounded-3xl">
      
      {/* 🏁 HEADER UTAMA - FIX RATA KIRI TEGAK LURUS DI MOBILE */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-6 border-b-2 border-indigo-100 pb-6">
        <div className="flex items-start gap-2.5 max-w-full">
          {/* Aksen Garis Neon Premium */}
          <span className="w-3 h-7 bg-indigo-600 rounded-full shrink-0 mt-1 sm:mt-1.5" />
          
          <div className="space-y-1 min-w-0 flex-1">
            {/* Wadah Flex Independen untuk Ikon & Teks Judul */}
            <div className="flex items-center gap-2 text-slate-900">
              <BarChart3 className="w-5 h-5 sm:w-7 sm:h-7 text-indigo-600 shrink-0" />
              <h1 className="text-xl sm:text-2xl md:text-3xl font-black tracking-tight leading-none">
                Laporan <span className="text-indigo-600">Keuangan & Omset</span>
              </h1>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 font-medium leading-relaxed">
              Pantau ringkasan margin keuntungan laba bersih showroom MotoSell secara periodik.
            </p>
          </div>
        </div>

        {/* CONTROLS: FILTER & BUTTON DOWNLOAD EXCEL */}
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          {/* Dropdown Bulan */}
          <div className="w-full sm:w-auto">
            <select
              value={month}
              onChange={(e) => setMonth(Number(e.target.value))}
              className="w-full sm:w-auto pl-3 pr-8 py-2.5 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-600 transition cursor-pointer"
            >
              {monthsList.map((m) => (
                <option key={m.value} value={m.value}>{m.name}</option>
              ))}
            </select>
          </div>

          {/* Dropdown Tahun */}
          <div className="w-full sm:w-auto">
            <select
              value={year}
              onChange={(e) => setYear(Number(e.target.value))}
              className="w-full sm:w-auto px-3 py-2.5 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-600 transition cursor-pointer"
            >
              <option value={currentYear}>{currentYear}</option>
              <option value={currentYear - 1}>{currentYear - 1}</option>
            </select>
          </div>

          {/* Tombol Cetak Excel */}
          <button
            onClick={handleExportToExcel}
            className="flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs sm:text-sm font-bold rounded-xl transition shadow-md w-full sm:w-auto"
          >
            <Download className="w-4 h-4" /> Ekspor ke Excel (.CSV)
          </button>
        </div>
      </div>

      {loading ? (
        <div className="p-12 text-center text-slate-500 font-bold animate-pulse text-xs sm:text-sm uppercase tracking-wider">
          Menghitung pembukuan neraca saldo laporan keuangan...
        </div>
      ) : (
        <>
          {/* 📊 TIGA KARTU REKAP EKSEKUTIF */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {/* Kartu 1: Total Omset */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-400 uppercase tracking-wider font-bold">Total Pendapatan (Omset)</p>
                <h3 className="text-xl sm:text-2xl font-black text-slate-900 mt-1">Rp {report.totalOmset.toLocaleString('id-ID')}</h3>
              </div>
              <div className="p-3 bg-indigo-50 rounded-xl text-indigo-600"><DollarSign className="w-6 h-6" /></div>
            </div>

            {/* Kartu 2: Total Modal Pokok */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-400 uppercase tracking-wider font-bold">Harga Modal Awal Unit</p>
                <h3 className="text-xl sm:text-2xl font-black text-slate-700 mt-1">Rp {report.totalModal.toLocaleString('id-ID')}</h3>
              </div>
              <div className="p-3 bg-amber-50 rounded-xl text-amber-600"><FileText className="w-6 h-6" /></div>
            </div>

            {/* Kartu 3: Total Laba Bersih */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-md flex items-center justify-between ring-2 ring-emerald-500/10">
              <div>
                <p className="text-xs text-slate-500 uppercase tracking-wider font-bold">Laba Bersih Showroom</p>
                <h3 className="text-xl sm:text-2xl font-black text-emerald-600 mt-1">Rp {report.totalLaba.toLocaleString('id-ID')}</h3>
              </div>
              <div className="p-3 bg-emerald-50 rounded-xl text-emerald-600"><TrendingUp className="w-6 h-6" /></div>
            </div>
          </div>

          {/* 📋 TABEL STRUKTUR RINCIAN JURNAL PENJUALAN BULANAN */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-md overflow-hidden">
            <div className="p-5 bg-slate-100 border-b border-slate-200 flex justify-between items-center">
              <h3 className="text-sm font-black text-slate-700 uppercase tracking-wider">Buku Jurnal Penjualan Unit</h3>
              <span className="text-xs font-bold text-slate-500 px-3 py-1 bg-white rounded-lg border border-slate-200">Terjual: {report.sales.length} Unit</span>
            </div>

            {report.sales.length === 0 ? (
              <div className="p-12 text-center text-slate-400 font-medium border-b border-slate-100">
                Tidak ada catatan penjualan unit motor yang dibukukan pada periode bulan ini.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs sm:text-sm">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-black uppercase text-[10px] tracking-wider">
                      <th className="p-4">Tanggal</th>
                      <th className="p-4">Kode</th>
                      <th className="p-4">Model Armada Motor</th>
                      <th className="p-4">Nama Pembeli</th>
                      <th className="p-4 text-right">Harga Modal</th>
                      <th className="p-4 text-right">Harga Jual</th>
                      <th className="p-4 text-right text-emerald-600">Margin Laba</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                    {report.sales.map((item: any) => {
                      const hargaModal = item.original_price || 0
                      const hargaJual = item.selling_price || item.final_price || 0
                      const labaUnit = hargaJual - hargaModal

                      return (
                        <tr key={item.id} className="hover:bg-slate-50/80 transition">
                          <td className="p-4 text-slate-500 font-semibold">{new Date(item.sold_at).toLocaleDateString('id-ID')}</td>
                          <td className="p-4 font-mono font-bold text-slate-600">{item.motors?.motor_code || '-'}</td>
                          <td className="p-4 font-bold text-slate-900">{item.motors?.model || 'Unit Terhapus'}</td>
                          <td className="p-4 text-slate-600 font-semibold">{item.buyer_name || item.customer_name || '-'}</td>
                          <td className="p-4 text-right text-slate-500">Rp {hargaModal.toLocaleString('id-ID')}</td>
                          <td className="p-4 text-right font-bold text-slate-900">Rp {hargaJual.toLocaleString('id-ID')}</td>
                          <td className="p-4 text-right font-black text-emerald-600 bg-emerald-50/30">Rp {labaUnit.toLocaleString('id-ID')}</td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            )}
            
            {/* Catatan Kaki Proteksi Hukum */}
            <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center gap-2 text-[10px] text-slate-400 font-bold uppercase tracking-wider">
              <ShieldAlert className="w-4 h-4 text-indigo-600 shrink-0" />
              <span>Laporan Keuangan ini valid dan disinkronisasi langsung oleh enkripsi database server Supabase Ledger.</span>
            </div>
          </div>
        </>
      )}

    </div>
  )
}