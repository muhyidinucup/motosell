'use server'

import { createClientServer } from '@/lib/supabase'

// 1. Fungsi untuk Mengambil Semua Data Brand (Read)
export async function getBrands() {
  const supabase = await createClientServer()
  
  const { data, error } = await supabase
    .from('brands')
    .select('*')
    .order('name', { ascending: true })

  if (error) {
    throw new Error(`Gagal mengambil data brand: ${error.message}`)
  }

  return data
}

// 2. Fungsi untuk Menambah Brand Baru (Create)
export async function createBrand(name: string, code: string) {
  const supabase = await createClientServer()
  const formattedCode = code.toUpperCase()

  const { data, error } = await supabase
    .from('brands')
    .insert([{ name, code: formattedCode }])
    .select()
    .single()

  if (error) {
    if (error.code === '23505') {
      throw new Error(`Kode brand "${formattedCode}" sudah digunakan!`)
    }
    throw new Error(`Gagal menambah brand: ${error.message}`)
  }

  return data
}

// 3. Fungsi untuk Mengubah Data Brand (Update)
export async function updateBrand(id: number, name: string, code: string) {
  const supabase = await createClientServer()
  const formattedCode = code.toUpperCase()

  const { data, error } = await supabase
    .from('brands')
    .update({ name, code: formattedCode })
    .eq('id', id)
    .select()

  if (error) {
    if (error.code === '23505') {
      throw new Error(`Kode brand "${formattedCode}" sudah digunakan!`)
    }
    throw new Error(`Gagal mengubah brand: ${error.message}`)
  }

  return data
}

// 4. Fungsi untuk Menghapus Brand (Delete)
export async function deleteBrand(id: number) {
  const supabase = await createClientServer()

  const { error } = await supabase
    .from('brands')
    .delete()
    .eq('id', id)

  if (error) {
    throw new Error(`Gagal menghapus brand: ${error.message}`)
  }

  return true
}