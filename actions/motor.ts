'use server'



import { createClientServer } from '@/lib/supabase'
import { del } from '@vercel/blob' // 🛠️ SUNTIKAN UTAMA: Menggunakan fungsi del untuk menghapus file fisik di Vercel Blob jika unit dihapus



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



  // 🛠️ SUNTIKAN KHUSUS: Paksa string numeric Supabase menjadi format Angka murni JavaScript

  const normalizedData = data?.map((motor: any) => ({

    ...motor,

    price: motor.price ? Number(motor.price) : 0,

    purchase_price: motor.purchase_price ? Number(motor.purchase_price) : 0,

    mileage: motor.mileage ? Number(motor.mileage) : 0,

    year: motor.year ? Number(motor.year) : new Date().getFullYear()

  }))



  return normalizedData || []

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



  // 🛠️ PENYELAMAT MUTASI TAMBAH: Normalisasi tipe data hasil insert sebelum dikembalikan ke UI Client

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



  // 🛠️ PENYELAMAT MUTASI UPDATE: Normalisasi tipe data hasil update sebelum dikembalikan ke UI Client

  if (data && Array.isArray(data) && data.length > 0) {

    data[0].price = data[0].price ? Number(data[0].price) : 0

    data[0].purchase_price = data[0].purchase_price ? Number(data[0].purchase_price) : 0

    data[0].mileage = data[0].mileage ? Number(data[0].mileage) : 0

    data[0].year = data[0].year ? Number(data[0].year) : formData.year

  }



  return data

}



// 5. Hapus Data Motor Beserta Seluruh Teks Fotonya (Delete)

export async function deleteMotor(id: number) {

  const supabase = await createClientServer()



  // --- PROTEKSI KEUANGAN (OPSI 1) ---

  const { data: checkSale } = await supabase

    .from('sales')

    .select('id')

    .eq('motor_id', id)

    .limit(1)



  if (checkSale && checkSale.length > 0) {

    throw new Error('SISTEM MEMBLOKIR: Unit motor ini sudah laku dan tercatat di Laporan Keuangan. Hapus riwayat penjualannya di menu Kasir terlebih dahulu jika Anda benar-benar ingin menghapusnya secara total.')

  }

  // ----------------------------------



  // Ambil data gambar terlebih dahulu untuk menghapus file fisik di storage

  const { data: images } = await supabase

    .from('motor_images')

    .select('image_url')

    .eq('motor_id', id)



  if (images && images.length > 0) {

    for (const img of images) {

      // 🛠️ PENANGANAN INTEGRASI HAPUS JIKA MENGGUNAKAN VERCEL BLOB

      if (img.image_url.includes('public.blob.vercel-storage.com')) {

        await del(img.image_url)

      } else {

        // Diubah untuk menembak bucket baru 'motosell'

        const urlParts = img.image_url.split('/storage/v1/object/public/motosell/')

        if (urlParts.length > 1) {

          // urlParts[1] akan murni berisi 'units/nama_file.ext'

          await supabase.storage.from('motosell').remove([urlParts[1]])

        }

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

    let finalPublicUrl = ''



    // 🛠️ JEMBATAN KONEKTOR VERCEL BLOB: Deteksi kiriman Direct Client Upload dari browser form admin page.tsx

    if (file.base64.startsWith('VERCEL_BLOB_URL:')) {

      finalPublicUrl = file.base64.replace('VERCEL_BLOB_URL:', '')

    } else {

      // JALUR LAMA SUPABASE STORAGE (Tetap aman sebagai fallback jika biner Base64 terpicu)

      const buffer = Buffer.from(file.base64, 'base64')

      const fileExt = file.name.split('.').pop()

      const fileName = `${motorId}_${Date.now()}_${i}.${fileExt}`

      const filePath = `units/${fileName}` // <-- Tetap rapi masuk ke sub-folder units/



      // Diubah menembak ke bucket master 'motosell'

      const { error: uploadError } = await supabase.storage

        .from('motosell')

        .upload(filePath, buffer, {

          contentType: file.type,

          upsert: true

        })



      if (uploadError) {

        throw new Error(`Gagal mengunggah foto ke storage: ${uploadError.message}`)

      }



      // Diubah mengambil Public URL dari bucket master 'motosell'

      const { data: publicUrlData } = supabase.storage

        .from('motosell')

        .getPublicUrl(filePath)



      finalPublicUrl = publicUrlData.publicUrl

    }



    const isPrimary = startOrder === 0 && i === 0



    const { error: dbError } = await supabase

      .from('motor_images')

      .insert([

        {

          motor_id: motorId,

          image_url: finalPublicUrl,

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



  // 🛠️ PENANGANAN INTEGRASI HAPUS SATUAN JIKA MENGGUNAKAN VERCEL BLOB

  if (imageUrl.includes('public.blob.vercel-storage.com')) {

    await del(imageUrl)

  } else {

    // Diubah untuk memotong URL publik berdasarkan nama bucket master 'motosell'

    const urlParts = imageUrl.split('/storage/v1/object/public/motosell/')

    if (urlParts.length > 1) {

      const filePath = urlParts[1] // berisi 'units/nama_file.ext'

      // Hapus file fisik di Storage bucket 'motosell'

      await supabase.storage.from('motosell').remove([filePath])

    }

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