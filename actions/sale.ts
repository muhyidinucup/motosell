'use server'

import { createClientServer } from '@/lib/supabase'

// 1. Fungsi untuk Mengambil Riwayat Semua Transaksi Penjualan (Read)
export async function getSales() {
  const supabase = await createClientServer()

  const { data, error } = await supabase
    .from('sales')
    .select(`
      *,
      motors (
        motor_code,
        model,
        price,
        purchase_price
      )
    `)
    .order('created_at', { ascending: false })

  if (error) {
    throw new Error(`Gagal mengambil riwayat penjualan: ${error.message}`)
  }

  return data
}

// 2. Fungsi untuk Mencatat Penjualan Baru (Create + Auto-Update Status Motor)
export async function createSale(formData: {
  motor_id: number
  buyer_name: string
  buyer_phone: string
  original_price: number    // SEKARANG SUDAH KITA ANGKUT BAWA
  selling_price: number
  notes: string
}) {
  const supabase = await createClientServer()

  // LANGKAH A: Masukkan data rekaman transaksi ke dalam tabel sales lengkap
  const { data: newSale, error: saleError } = await supabase
    .from('sales')
    .insert({
      motor_id: formData.motor_id,
      buyer_name: formData.buyer_name,
      buyer_phone: formData.buyer_phone || null,
      original_price: formData.original_price, // Amankan data harga pasang awal website
      selling_price: formData.selling_price,   // Amankan data harga nego deal akhir
      notes: formData.notes || null
    })
    .select()
    .single()

  if (saleError) {
    throw new Error(`Gagal mencatat transaksi penjualan: ${saleError.message}`)
  }

  // LANGKAH B: Otomatisasi mengubah status motor terkait menjadi 'sold' di tabel motors
  const { error: motorUpdateError } = await supabase
    .from('motors')
    .update({ status: 'sold' })
    .eq('id', formData.motor_id)

  if (motorUpdateError) {
    throw new Error(`Transaksi tercatat, tetapi gagal mengubah status unit motor: ${motorUpdateError.message}`)
  }

  return newSale
}

// 3. Fungsi untuk Menghapus Transaksi Penjualan (Delete + Kembalikan Status Motor ke Ready)
export async function deleteSale(id: number) {
  const supabase = await createClientServer()

  // Ambil data sales dulu untuk mengetahui motor_id terkait
  const { data: saleData, error: getError } = await supabase
    .from('sales')
    .select('motor_id')
    .eq('id', id)
    .single()

  if (getError || !saleData) {
    throw new Error('Data transaksi penjualan tidak ditemukan.')
  }

  // Hapus transaksi penjualan dari tabel sales
  const { error: deleteError } = await supabase
    .from('sales')
    .delete()
    .eq('id', id)

  if (deleteError) {
    throw new Error(`Gagal menghapus data transaksi: ${deleteError.message}`)
  }

  // Kembalikan status motor terkait menjadi 'ready' di tabel motors
  const { error: motorUpdateError } = await supabase
    .from('motors')
    .update({ status: 'ready' })
    .eq('id', saleData.motor_id)

  if (motorUpdateError) {
    throw new Error(`Transaksi terhapus, tetapi gagal mengembalikan status unit motor menjadi ready: ${motorUpdateError.message}`)
  }

  return true
}