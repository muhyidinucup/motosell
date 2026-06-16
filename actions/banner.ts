'use server'

import { createClientServer } from '@/lib/supabase'

// 1. Ambil Semua Data Banner (Read)
export async function getBanners() {
  const supabase = await createClientServer()

  const { data, error } = await supabase
    .from('banners')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    throw new Error(`Gagal mengambil data banner: ${error.message}`)
  }

  return data
}

// 2. Tambah Banner Baru + Upload Gambar (Create)
export async function createBanner(title: string, linkUrl: string, file: { name: string; type: string; base64: string }) {
  const supabase = await createClientServer()

  // Converted string base64 kembali jadi buffer biner
  const buffer = Buffer.from(file.base64, 'base64')
  const fileExt = file.name.split('.').pop()
  const fileName = `banner_${Date.now()}.${fileExt}`
  const filePath = `banner/${fileName}` // <-- Diubah masuk ke kamar folder 'banner' (sesuai setup dashboard)

  // A. Upload file gambar spanduk ke bucket master 'motosell'
  const { error: uploadError } = await supabase.storage
    .from('motosell') // <-- Menembak ke bucket master 'motosell'
    .upload(filePath, buffer, {
      contentType: file.type,
      upsert: true
    })

  if (uploadError) {
    throw new Error(`Gagal upload gambar banner ke storage: ${uploadError.message}`)
  }

  // B. Ambil URL Publik gambar spanduknya dari bucket master 'motosell'
  const { data: publicUrlData } = supabase.storage
    .from('motosell')
    .getPublicUrl(filePath)

  // C. Masukkan data teks ke tabel database "banners"
  const { data, error: dbError } = await supabase
    .from('banners')
    .insert([
      {
        title,
        image_url: publicUrlData.publicUrl,
        link_url: linkUrl || null,
        is_active: true
      }
    ])
    .select()

  if (dbError) {
    throw new Error(`Gagal mencatat data banner ke database: ${dbError.message}`)
  }

  return data
}

// 3. Hapus Banner Total dari Storage & Database (Delete)
export async function deleteBanner(id: number, imageUrl: string) {
  const supabase = await createClientServer()

  // A. Ekstrak path file gambar dari URL Publik Supabase berdasarkan bucket master 'motosell'
  const urlParts = imageUrl.split('/storage/v1/object/public/motosell/')
  if (urlParts.length > 1) {
    const filePath = urlParts[1] // berisi 'banner/nama_file.ext'
    
    // Hapus file fisiknya di storage bucket master menggunakan API resmi .remove() sesuai aturan dokumen
    await supabase.storage.from('motosell').remove([filePath])
  }

  // B. Hapus baris datanya di tabel database "banners"
  const { error } = await supabase
    .from('banners')
    .delete()
    .eq('id', id)

  if (error) {
    throw new Error(`Gagal menghapus data banner di database: ${error.message}`)
  }

  return true
}