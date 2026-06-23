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

  const normalizedData = data?.map((motor: any) => ({
    ...motor,
    price: motor.price ? Number(motor.price) : 0,
    purchase_price: motor.purchase_price ? Number(motor.purchase_price) : 0,
    mileage: motor.mileage ? Number(motor.mileage) : 0,
    year: motor.year ? Number(motor.year) : new Date().getFullYear()
  }))
  return normalizedData || []
}

// 2. Generator Kode Motor Otomatis
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
  purchase_price: number
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
    .insert([{
      ...formData,
      motor_code: motorCode,
      slug: slug,
      status: 'ready',
    }])
    .select()
    .single()

  if (error) {
    if (error.code === '23505') {
      throw new Error(`Kode motor atau slug "${motorCode}" sudah terduplikasi di sistem!`)
    }
    throw new Error(`Gagal menyimpan data motor baru: ${error.message}`)
  }

  if (data) {
    data.price = data.price ? Number(data.price) : 0
    data.purchase_price = data.purchase_price ? Number(data.purchase_price) : 0
    data.mileage = data.mileage ? Number(data.mileage) : 0
    data.year = data.year ? Number(data.year) : formData.year
  }
  return data
}

// 4. Ubah Data & Status Unit Motor (Update)
export async function updateMotor(id: number, formData: {
  brand_id: number
  model: string
  year: number
  price: number
  purchase_price: number
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

  if (data && Array.isArray(data) && data.length > 0) {
    data[0].price = data[0].price ? Number(data[0].price) : 0
    data[0].purchase_price = data[0].purchase_price ? Number(data[0].purchase_price) : 0
    data[0].mileage = data[0].mileage ? Number(data[0].mileage) : 0
    data[0].year = data[0].year ? Number(data[0].year) : formData.year
  }
  return data
}

// 5. Hapus Data Motor Beserta Seluruh Foto (Delete)
export async function deleteMotor(id: number) {
  const supabase = await createClientServer()

  const { data: checkSale } = await supabase
    .from('sales')
    .select('id')
    .eq('motor_id', id)
    .limit(1)

  if (checkSale && checkSale.length > 0) {
    throw new Error('SISTEM MEMBLOKIR: Unit motor ini sudah laku dan tercatat di Laporan Keuangan. Hapus riwayat penjualannya di menu Kasir terlebih dahulu.')
  }

  const { data: images } = await supabase
    .from('motor_images')
    .select('image_url')
    .eq('motor_id', id)

  if (images && images.length > 0) {
    for (const img of images) {
      // Hapus file fisik di Supabase Storage bucket 'motosell'
      const urlParts = img.image_url.split('/storage/v1/object/public/motosell/')
      if (urlParts.length > 1) {
        await supabase.storage.from('motosell').remove([urlParts[1]])
      }
    }
  }

  await supabase.from('motor_images').delete().eq('motor_id', id)

  const { error: motorError } = await supabase
    .from('motors')
    .delete()
    .eq('id', id)

  if (motorError) {
    throw new Error(`Gagal menghapus data unit motor: ${motorError.message}`)
  }
  return true
}

// 6. Simpan URL Gambar ke Database (File sudah di-upload dari client langsung ke Supabase)
export async function uploadMotorImages(motorId: number, imageUrls: string[]) {
  const supabase = await createClientServer()
  const { data: existingImages } = await supabase
    .from('motor_images')
    .select('id')
    .eq('motor_id', motorId)

  const startOrder = existingImages?.length || 0

  for (let i = 0; i < imageUrls.length; i++) {
    const imageUrl = imageUrls[i]
    const isPrimary = startOrder === 0 && i === 0

    const { error: dbError } = await supabase
      .from('motor_images')
      .insert([{
        motor_id: motorId,
        image_url: imageUrl,
        is_primary: isPrimary,
        sort_order: startOrder + i
      }])

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

// 8. Hapus Foto Satuan
export async function deleteMotorImage(imageId: number, imageUrl: string) {
  const supabase = await createClientServer()

  const urlParts = imageUrl.split('/storage/v1/object/public/motosell/')
  if (urlParts.length > 1) {
    await supabase.storage.from('motosell').remove([urlParts[1]])
  }

  const { error } = await supabase
    .from('motor_images')
    .delete()
    .eq('id', imageId)

  if (error) {
    throw new Error(`Gagal menghapus gambar di database: ${error.message}`)
  }
  return true
}