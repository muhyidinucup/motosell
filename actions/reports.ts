'use server'

import { createClientServer } from '@/lib/supabase'

export async function getSalesReportData(year: number, month: number) {
  const supabase = await createClientServer()

  // Format tanggal awal dan akhir bulan untuk filter query database
  const startDate = new Date(year, month - 1, 1).toISOString()
  const endDate = new Date(year, month, 0, 23, 59, 59).toISOString()

  // Tarik data penjualan beserta info detail motornya
  const { data: salesData, error } = await supabase
    .from('sales')
    .select('*, motors(model, motor_code)')
    .gte('sold_at', startDate)
    .lte('sold_at', endDate)
    .order('sold_at', { ascending: false })

  if (error) {
    console.error('Gagal menarik laporan keuangan:', error.message)
    return { sales: [], totalOmset: 0, totalModal: 0, totalLaba: 0 }
  }

  // Hitung akumulasi kalkulasi akuntansi showroom
  let totalOmset = 0
  let totalModal = 0

  salesData?.forEach((item: any) => {
    totalOmset += Number(item.selling_price || item.final_price || 0)
    totalModal += Number(item.original_price || 0)
  })

  const totalLaba = totalOmset - totalModal

  return {
    sales: salesData || [],
    totalOmset,
    totalModal,
    totalLaba
  }
}