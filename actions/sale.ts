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
        price
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
    .insert([
      {
        motor_id: formData.motor_id,
        buyer_name: formData.buyer_name,
        buyer_phone: formData.buyer_phone || null,
        original_price: formData.original_price, // Amankan data harga pasang awal website
        selling_price: formData.selling_price,   // Amankan data harga nego deal akhir
        notes: formData.notes || null
      }
    ])
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