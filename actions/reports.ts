'use server'

import { createClientServer } from '@/lib/supabase'

export async function getSalesReportData(
  filterPeriod: 'today' | '7days' | '30days' | 'custom',
  customStartDate?: string,
  customEndDate?: string
) {
  const supabase = await createClientServer()

  // 1. Inisialisasi Tanggal Pemilah Mengikuti Waktu Saat Ini
  let startDate = new Date()
  let endDate = new Date()

  // Set default akhir hari ke detik terakhir 23:59:59
  endDate.setHours(23, 59, 59, 999)

  if (filterPeriod === 'today') {
    // Hari ini dimulai dari jam 00:00:00 pagi
    startDate.setHours(0, 0, 0, 0)
  } else if (filterPeriod === '7days') {
    // Tarik mundur 7 hari ke belakang
    startDate.setDate(startDate.getDate() - 7)
    startDate.setHours(0, 0, 0, 0)
  } else if (filterPeriod === '30days') {
    // Tarik mundur 30 hari ke belakang
    startDate.setDate(startDate.getDate() - 30)
    startDate.setHours(0, 0, 0, 0)
  } else if (filterPeriod === 'custom' && customStartDate && customEndDate) {
    // Gunakan pilihan kustom penanggalan admin kasir
    startDate = new Date(customStartDate)
    startDate.setHours(0, 0, 0, 0)
    
    endDate = new Date(customEndDate)
    endDate.setHours(23, 59, 59, 999)
  }

  // 2. Tarik Data Penjualan Berdasarkan Kolom Waktu 'sold_at' atau 'created_at'
  // Disertai penarikan kolom modal pokok rahasia (purchase_price) gudang
  const { data: salesData, error } = await supabase
    .from('sales')
    .select('*, motors(model, motor_code, purchase_price)')
    .gte('sold_at', startDate.toISOString())
    .lte('sold_at', endDate.toISOString())
    .order('sold_at', { ascending: false })

  if (error) {
    console.error('Gagal menarik laporan keuangan filter dinamis:', error.message)
    return { sales: [], totalOmset: 0, totalModal: 0, totalLaba: 0 }
  }

  // 3. Hitung Akumulasi Kalkulasi Jurnal Akuntansi Riil Showroom
  let totalOmset = 0
  let totalModal = 0

  salesData?.forEach((item: any) => {
    totalOmset += Number(item.selling_price || item.final_price || 0)
    totalModal += Number(item.motors?.purchase_price || 0)
  })

  const totalLaba = totalOmset - totalModal

  return {
    sales: salesData || [],
    totalOmset,
    totalModal,
    totalLaba
  }
}