'use client'

import { useState, useEffect } from 'react'
import { getSalesReportData } from '@/actions/reports'
import { BarChart3, Download, DollarSign, TrendingUp, ShieldAlert, FileText, Filter, Calendar } from 'lucide-react'
import * as XLSX from 'xlsx' // 🔥 AMUNISI SAKTI: Generator biner Spreadsheet Excel Premium

export default function AdminReportsPage() {
  // 📅 State Filter Waktu Dinamis Baru Premium
  const [filterPeriod, setFilterPeriod] = useState<'today' | '7days' | '30days' | 'custom'>('today')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')

  const [report, setReport] = useState<any>({ sales: [], totalOmset: 0, totalModal: 0, totalLaba: 0 })
  const [loading, setLoading] = useState(true)

  // Efek otomatis panggil data tiap filter waktu diubah admin
  useEffect(() => {
    async function loadReport() {
      // Validasi: jika pilih custom, pastikan tanggal awal & akhir sudah diisi sebelum menembak server
      if (filterPeriod === 'custom' && (!startDate || !endDate)) return

      setLoading(true)
      try {
        // Mengirimkan filterPeriod beserta range tanggal custom ke Server Action
        const data = await getSalesReportData(filterPeriod, startDate, endDate)
        setReport(data)
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    loadReport()
  }, [filterPeriod, startDate, endDate])

  // Membuat string deskripsi teks keterangan periode yang aktif untuk UI Web & Excel
  let activePeriodLabel = 'Hari Ini'
  if (filterPeriod === '7days') activePeriodLabel = '7 Hari Terakhir'
  else if (filterPeriod === '30days') activePeriodLabel = '30 Hari Terakhir'
  else if (filterPeriod === 'custom') {
    const sStr = startDate ? new Date(startDate).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' }) : '...'
    const eStr = endDate ? new Date(endDate).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' }) : '...'
    activePeriodLabel = `${sStr} s/d ${eStr}`
  }

  // 🚀 TEMPLATE SAKTI GENERATOR EXCEL PREMIUM (.XLSX) - STRUKTUR ENTERPRISE RAPI TOTAL!
  const handleExportToExcel = () => {
    if (report.sales.length === 0) {
      alert('Tidak ada data penjualan di periode ini untuk diekspor, Chief!')
      return
    }

    const todayStr = new Date().toLocaleDateString('id-ID', { day: '2-digit', month: '2-digit', year: 'numeric' })

    // 🏢 ARSITEKTUR BLOK 1: HEADER UTAMA LAPORAN FINANSIAL MOTOSELL
    const sheetData = [
      ['LAPORAN KEUANGAN KINERJA PENJUALAN EKSEKUTIF'],
      ['SHOWROOM MOTOR BEKAS PREMIUM - MOTOSELL'],
      [`Periode Pembukuan : ${activePeriodLabel}`],
      [`Tanggal Cetak Laporan : ${todayStr}`],
      [], // Baris Kosong Pembatas
      
      // 📊 ARSITEKTUR BLOK 2: KARTU RINGKASAN FINANSIAL (SUMMARY CARDS VERSI SPREADSHEET)
      ['RINGKASAN EKSEKUTIF FINANSIAL BULANAN'],
      ['Parameter Finansial', 'Nilai Nominal Akuntansi (Rupiah)'],
      ['Total Pendapatan Kotor (Omset)', Number(report.totalOmset)],
      ['Total Harga Modal Pokok Unit', Number(report.totalModal)],
      ['Total Margin Laba Bersih Toko', Number(report.totalLaba)],
      [], // Baris Kosong Pembatas
      
      // 📋 ARSITEKTUR BLOK 3: HEADER TABEL DATA DETIL JURNAL TRANSAKSI
      ['RINCIAN BUKU JURNAL PENJUALAN UNIT HARIAN'],
      [
        'No.', 
        'ID Transaksi', 
        'Tanggal Terjual', 
        'Kode Unit Motor', 
        'Nama Model Armada', 
        'Nama Pembeli', 
        'Harga Modal Pokok (Rp)', 
        'Harga Deal Jual (Rp)', 
        'Margin Laba Bersih (Rp)', 
        'Metode Bayar'
      ]
    ]

    // 📝 ARSITEKTUR BLOK 4: MENYUNTIKKAN DATA TRANSAKSI HARIAN DARI DATABASE
    report.sales.forEach((item: any, index: number) => {
      const modalPrice = Number(item.motors?.purchase_price || 0) // KOREKSI: Mengambil modal pokok asli unit
      const jualPrice = Number(item.selling_price || item.final_price || 0)
      
      sheetData.push([
        (index + 1).toString(),
        `INV-00${item.id}`,
        new Date(item.sold_at || item.created_at).toLocaleDateString('id-ID'),
        item.motors?.motor_code || '-',
        item.motors?.model || 'Unit Terhapus',
        item.buyer_name || item.customer_name || '-',
        modalPrice as any, // Angka murni biner tanpa kutip string biar aman di-sum
        jualPrice as any,
        (jualPrice - modalPrice) as any,
        item.payment_method || '-'
      ])
    })

    // 🔢 ARSITEKTUR BLOK 5: BARIS TOTAL REKAPITULASI PALING BAWAH TABEL
    sheetData.push([]) // Spasi tipis
    sheetData.push([
      '', 
      '', 
      '', 
      '', 
      '', 
      'TOTAL KESELURUHAN:', 
      Number(report.totalModal) as any, 
      Number(report.totalOmset) as any, 
      Number(report.totalLaba) as any, 
      ''
    ])

    // 🎛️ PROSES COMPILING SHEET
    const worksheet = XLSX.utils.aoa_to_sheet(sheetData)

    // 📏 STRATEGI AUTO-FIT WIDTH KOLOM (ANTI TAMPILAN GEPENG / EROR ###)
    const maxCols = sheetData[12] ? sheetData[12].length : 10
    const colWidths = Array(maxCols).fill({ wch: 15 }) // Set default lebar 15 karakter
    
    // Scan otomatis panjang teks tiap kolom biar presisi lurus lebar
    sheetData.forEach((row) => {
      row.forEach((cell, colIndex) => {
        if (cell) {
          const cellLen = cell.toString().length
          if (cellLen > colWidths[colIndex].wch) {
            colWidths[colIndex] = { wch: cellLen + 3 } // Kasih bonus padding 3 space biar ga mepet
          }
        }
      })
    })
    worksheet['!cols'] = colWidths

    // 🚀 BENTUK WORKBOOK DAN TEMBAK LANGSUNG KE DEVICE WINDOWS LU
    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Laporan Finansial')
    XLSX.writeFile(workbook, `Laporan_Keuangan_MotoSell_${filterPeriod}_${todayStr.replace(/\//g, '-')}.xlsx`)
  }

  return (
    <div className="p-4 sm:p-8 max-w-7xl mx-auto font-sans bg-slate-50 min-h-screen text-slate-900 rounded-3xl">
      
      {/* 🏁 HEADER UTAMA */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-6 border-b-2 border-indigo-100 pb-6">
        <div className="flex items-start gap-2.5 max-w-full">
          <span className="w-3 h-7 bg-indigo-600 rounded-full shrink-0 mt-1 sm:mt-1.5" />
          <div className="space-y-1 min-w-0 flex-1">
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

        {/* CONTROLS: BUTTON DOWNLOAD EXCEL */}
        <div className="w-full md:w-auto">
          <button
            onClick={handleExportToExcel}
            className="flex items-center justify-center gap-2 px-5 py-3 bg-emerald-600 hover:bg-emerald-500 text-white text-xs sm:text-sm font-bold rounded-xl transition-all shadow-md shadow-emerald-950/10 w-full cursor-pointer uppercase tracking-wider"
          >
            <Download className="w-4 h-4 shrink-0" /> Unduh Laporan (.xlsx)
          </button>
        </div>
      </div>

      {/* 📅 BAR KONTROL FILTER WAKTU SAKTI (KEMBALI RAPI DAN PROPOSIONAL) */}
      <div className="bg-white p-4 rounded-2xl shadow-xs border border-slate-200 mb-6 flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2 text-xs sm:text-sm font-bold text-slate-700">
            <Filter className="w-4 h-4 text-indigo-600" />
            <span>Pilih Periode Jurnal Penjualan:</span>
          </div>
          
          {/* Kelompok Tombol Utama */}
          <div className="flex flex-wrap items-center gap-1.5 bg-slate-50 p-1 rounded-xl border border-slate-150 w-full sm:w-auto">
            {[
              { key: 'today', label: 'Hari Ini' },
              { key: '7days', label: '7 Hari' },
              { key: '30days', label: '30 Hari' },
              { key: 'custom', label: 'Custom Tanggal' },
            ].map((p) => (
              <button
                key={p.key}
                type="button"
                onClick={() => setFilterPeriod(p.key as any)}
                className={`flex-1 sm:flex-none px-4 py-2 rounded-lg text-xs font-bold transition-all border cursor-pointer ${
                  filterPeriod === p.key
                    ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                    : 'bg-transparent text-slate-600 border-transparent hover:bg-slate-200/60'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        {/* Baris Keterangan Informasi Aktif + Input Range Tanggal (Jika Klik Custom) */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-slate-50/60 p-3 rounded-xl border border-dashed border-slate-200">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-500">
            <Calendar className="w-3.5 h-3.5 text-indigo-500" />
            <span>Keterangan Data Ditampilkan: <span className="text-indigo-600 font-extrabold uppercase bg-indigo-50 px-2 py-0.5 rounded-md border border-indigo-100">{activePeriodLabel}</span></span>
          </div>

          {filterPeriod === 'custom' && (
            <div className="flex items-center gap-2 w-full sm:w-auto bg-white px-3 py-2 border border-slate-200 rounded-xl shadow-xs animate-fadeIn">
              <div className="flex items-center gap-1">
                <span className="text-[10px] font-black uppercase text-slate-400 mr-1">Dari:</span>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="px-2 py-1 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <span className="text-xs font-bold text-slate-400">s/d</span>
              <div className="flex items-center gap-1">
                <span className="text-[10px] font-black uppercase text-slate-400 mr-1">Sampai:</span>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="px-2 py-1 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* TAMPILAN UTAMA */}
      {loading ? (
        <div className="p-12 text-center text-slate-500 font-bold animate-pulse text-xs sm:text-sm uppercase tracking-wider">
          Menghitung pembukuan neraca saldo laporan keuangan...
        </div>
      ) : (
        <>
          {/* 📊 TIGA KARTU REKAP EKSEKUTIF WEB */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-400 uppercase tracking-wider font-bold">Total Pendapatan (Omset)</p>
                <h3 className="text-xl sm:text-2xl font-black text-slate-900 mt-1">Rp {report.totalOmset?.toLocaleString('id-ID') || 0}</h3>
              </div>
              <div className="p-3 bg-indigo-50 rounded-xl text-indigo-600"><DollarSign className="w-6 h-6" /></div>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-400 uppercase tracking-wider font-bold">Harga Modal Awal Unit</p>
                <h3 className="text-xl sm:text-2xl font-black text-slate-700 mt-1">Rp {report.totalModal?.toLocaleString('id-ID') || 0}</h3>
              </div>
              <div className="p-3 bg-amber-50 rounded-xl text-amber-600"><FileText className="w-6 h-6" /></div>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-md flex items-center justify-between ring-2 ring-emerald-500/10">
              <div>
                <p className="text-xs text-slate-500 uppercase tracking-wider font-bold">Laba Bersih Showroom</p>
                <h3 className="text-xl sm:text-2xl font-black text-emerald-600 mt-1">Rp {report.totalLaba?.toLocaleString('id-ID') || 0}</h3>
              </div>
              <div className="p-3 bg-emerald-50 rounded-xl text-emerald-600"><TrendingUp className="w-6 h-6" /></div>
            </div>
          </div>

          {/* 📋 TABEL STRUKTUR RINCIAN JURNAL PENJUALAN BULANAN */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-md overflow-hidden">
            <div className="p-5 bg-slate-100 border-b border-slate-200 flex justify-between items-center">
              <h3 className="text-sm font-black text-slate-700 uppercase tracking-wider">Buku Jurnal Penjualan Unit</h3>
              <span className="text-xs font-bold text-slate-500 px-3 py-1 bg-white rounded-lg border border-slate-200">Terjual: {report.sales?.length || 0} Unit</span>
            </div>

            {!report.sales || report.sales.length === 0 ? (
              <div className="p-12 text-center text-slate-400 font-medium border-b border-slate-100">
                Tidak ada catatan penjualan unit motor yang dibukukan pada periode filter waktu pilihan Anda.
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
                      const hargaModal = item.motors?.purchase_price || 0
                      const hargaJual = item.selling_price || item.final_price || 0
                      const labaUnit = hargaJual - hargaModal

                      return (
                        <tr key={item.id} className="hover:bg-slate-50/80 transition">
                          <td className="p-4 text-slate-500 font-semibold">{new Date(item.sold_at || item.created_at).toLocaleDateString('id-ID')}</td>
                          <td className="p-4 font-mono font-bold text-slate-600">{item.motors?.motor_code || '-'}</td>
                          <td className="p-4 font-bold text-slate-900">
                            <div>{item.motors?.model || 'Unit Terhapus'}</div>
                            <div className="text-[10px] text-slate-400 font-medium">Harga Web: Rp {(item.original_price || 0).toLocaleString('id-ID')}</div>
                          </td>
                          <td className="p-4 text-slate-600 font-semibold">{item.buyer_name || item.customer_name || '-'}</td>
                          <td className="p-4 text-right text-slate-500">Rp {hargaModal.toLocaleString('id-ID')}</td>
                          <td className="p-4 text-right font-bold text-slate-900">Rp {hargaJual.toLocaleString('id-ID')}</td>
                          <td className={`p-4 text-right font-black bg-emerald-50/30 ${labaUnit >= 0 ? 'text-emerald-600' : 'text-red-500'}`}>
                            Rp {labaUnit.toLocaleString('id-ID')}
                          </td>
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