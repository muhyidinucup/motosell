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
  const filePath = `promos/${fileName}`

  // A. Upload file gambar spanduk ke bucket "banners"
  const { error: uploadError } = await supabase.storage
    .from('banners')
    .upload(filePath, buffer, {
      contentType: file.type,
      upsert: true
    })

  if (uploadError) {
    throw new Error(`Gagal upload gambar banner ke storage: ${uploadError.message}`)
  }

  // B. Ambil URL Publik gambar spanduknya
  const { data: publicUrlData } = supabase.storage
    .from('banners')
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

  // A. Ekstrak path file gambar dari URL Publik Supabase
  const urlParts = imageUrl.split('/storage/v1/object/public/banners/')
  if (urlParts.length > 1) {
    const filePath = urlParts[1]
    // Hapus file fisiknya di storage bucket
    await supabase.storage.from('banners').remove([filePath])
  }

  // B. Hapus baris datanya di tabel database
  const { error } = await supabase
    .from('banners')
    .delete()
    .eq('id', id)

  if (error) {
    throw new Error(`Gagal menghapus data banner di database: ${error.message}`)
  }

  return true
}