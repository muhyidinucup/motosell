'use server'

import { createClientServer } from '@/lib/supabase'

// 1. Ambil Semua Data Motor beserta Data Brand-nya (Read)
export async function getMotors() {
  const supabase = await createClientServer()

  const { data, error } = await supabase
    .from('motors')
    .select(`
      *,
      brands (
        name,
        code
      )
    `)
    .order('created_at', { ascending: false })

  if (error) {
    throw new Error(`Gagal mengambil data motor: ${error.message}`)
  }

  return data
}

// 2. Generator Kode Motor Otomatis (Auto-generate Motor Code)
export async function generateMotorCode(brandId: number) {
  const supabase = await createClientServer()

  const { data: brand, error: brandError } = await supabase
    .from('brands')
    .select('code')
    .eq('id', brandId)
    .single()

  if (brandError || !brand) {
    throw new Error('Brand tidak ditemukan untuk membuat kode motor.')
  }

  const { count, error: countError } = await supabase
    .from('motors')
    .select('*', { count: 'exact', head: true })
    .eq('brand_id', brandId)

  if (countError) {
    throw new Error(`Gagal menghitung urutan kode: ${countError.message}`)
  }

  const nextSequence = (count || 0) + 1
  const formattedSequence = String(nextSequence).padStart(3, '0')

  return `${brand.code}-${formattedSequence}`
}

// 3. Tambah Data Motor Baru (Create)
export async function createMotor(formData: {
  brand_id: number
  model: string
  year: number
  price: number
  mileage: number
  transmission: string
  color: string
  condition: string
  description: string
  featured: boolean
}) {
  const supabase = await createClientServer()
  const motorCode = await generateMotorCode(formData.brand_id)

  const baseSlug = `${formData.model}-${formData.year}-${motorCode}`
  const slug = baseSlug.toLowerCase().replace(/[^a-z0-9]+/g, '-')

  const { data, error } = await supabase
    .from('motors')
    .insert([
      {
        ...formData,
        motor_code: motorCode,
        slug: slug,
        status: 'ready',
      },
    ])
    .select()
    .single()

  if (error) {
    if (error.code === '23505') {
      throw new Error(`Kode motor atau slug "${motorCode}" sudah terduplikasi di sistem!`)
    }
    throw new Error(`Gagal menyimpan data motor baru: ${error.message}`)
  }

  return data
}

// 4. Ubah Data & Status Unit Motor (Update)
export async function updateMotor(id: number, formData: {
  brand_id: number
  model: string
  year: number
  price: number
  mileage: number
  transmission: string
  color: string
  condition: string
  description: string
  status: 'ready' | 'booking' | 'sold'
  featured: boolean
}) {
  const supabase = await createClientServer()

  const { data: currentMotor } = await supabase
    .from('motors')
    .select('motor_code')
    .eq('id', id)
    .single()

  const motorCode = currentMotor?.motor_code || 'UNIT'
  const baseSlug = `${formData.model}-${formData.year}-${motorCode}`
  const slug = baseSlug.toLowerCase().replace(/[^a-z0-9]+/g, '-')

  const { data, error } = await supabase
    .from('motors')
    .update({
      ...formData,
      slug: slug
    })
    .eq('id', id)
    .select()

  if (error) {
    throw new Error(`Gagal mengubah data unit motor: ${error.message}`)
  }

  return data
}

// 5. Hapus Data Motor Beserta Seluruh Teks Fotonya (Delete)
export async function deleteMotor(id: number) {
  const supabase = await createClientServer()

  // Ambil data gambar terlebih dahulu untuk menghapus file fisik di storage
  const { data: images } = await supabase
    .from('motor_images')
    .select('image_url')
    .eq('motor_id', id)

  if (images && images.length > 0) {
    for (const img of images) {
      const urlParts = img.image_url.split('/storage/v1/object/public/motor-images/')
      if (urlParts.length > 1) {
        await supabase.storage.from('motor-images').remove([urlParts[1]])
      }
    }
  }

  // Hapus data teks di tabel database gambar
  await supabase.from('motor_images').delete().eq('motor_id', id)

  // Hapus data tabel motor utama
  const { error: motorError } = await supabase
    .from('motors')
    .delete()
    .eq('id', id)

  if (motorError) {
    throw new Error(`Gagal menghapus data unit motor: ${motorError.message}`)
  }

  return true
}

// 6. Multi-Upload Foto Motor ke Supabase Storage & Catat ke Database
export async function uploadMotorImages(motorId: number, files: { name: string; type: string; base64: string }[]) {
  const supabase = await createClientServer()

  const { data: existingImages } = await supabase
    .from('motor_images')
    .select('id')
    .eq('motor_id', motorId)

  const startOrder = existingImages?.length || 0

  for (let i = 0; i < files.length; i++) {
    const file = files[i]
    const buffer = Buffer.from(file.base64, 'base64')
    const fileExt = file.name.split('.').pop()
    const fileName = `${motorId}_${Date.now()}_${i}.${fileExt}`
    const filePath = `units/${fileName}`

    const { error: uploadError } = await supabase.storage
      .from('motor-images')
      .upload(filePath, buffer, {
        contentType: file.type,
        upsert: true
      })

    if (uploadError) {
      throw new Error(`Gagal mengunggah foto ke storage: ${uploadError.message}`)
    }

    const { data: publicUrlData } = supabase.storage
      .from('motor-images')
      .getPublicUrl(filePath)

    const isPrimary = startOrder === 0 && i === 0

    const { error: dbError } = await supabase
      .from('motor_images')
      .insert([
        {
          motor_id: motorId,
          image_url: publicUrlData.publicUrl,
          is_primary: isPrimary,
          sort_order: startOrder + i
        }
      ])

    if (dbError) {
      throw new Error(`Gagal mencatat data foto ke database: ${dbError.message}`)
    }
  }

  return true
}

// 7. Ambil Galeri Foto Berdasarkan ID Motor
export async function getMotorImages(motorId: number) {
  const supabase = await createClientServer()

  const { data, error } = await supabase
    .from('motor_images')
    .select('*')
    .order('sort_order', { ascending: true })
    .eq('motor_id', motorId)

  if (error) {
    throw new Error(`Gagal mengambil galeri foto: ${error.message}`)
  }

  return data
}

// 8. HAPUS FOTO SATUAN (BARU) - Menghapus File Fisik di Storage & Record Baris di DB
export async function deleteMotorImage(imageId: number, imageUrl: string) {
  const supabase = await createClientServer()

  // Ekstrak path file dari URL publik Supabase
  const urlParts = imageUrl.split('/storage/v1/object/public/motor-images/')
  if (urlParts.length > 1) {
    const filePath = urlParts[1]
    // Hapus file fisik di Storage bucket
    await supabase.storage.from('motor-images').remove([filePath])
  }

  // Hapus data baris di tabel database
  const { error } = await supabase
    .from('motor_images')
    .delete()
    .eq('id', imageId)

  if (error) {
    throw new Error(`Gagal menghapus gambar di database: ${error.message}`)
  }

  return true
}