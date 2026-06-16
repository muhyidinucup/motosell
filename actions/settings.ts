'use server'

import { createClientServer } from '@/lib/supabase'
import { revalidatePath } from 'next/cache'

// 1. Mengambil semua data settings lama dan mengubahnya jadi objek rapi
export async function getStoreSettings() {
  const supabase = await createClientServer()
  const { data, error } = await supabase
    .from('settings')
    .select('*')

  if (error) {
    console.error('Gagal memuat settings:', error.message)
    return null
  }

  // JIKA DATABASE MASIH KOSONG, KASIH TEMPLATE DEFAULT AGAR FORM TIDAK BLANK / LOADING STUCK
  if (!data || data.length === 0) {
    return {
      whatsapp_number: '',
      showroom_address: '',
      operational_hours: '',
      support_email: '',
      instagram_url: ''
    }
  }

  // Ubah baris row database menjadi objek { whatsapp_number: '...', showroom_address: '...' }
  const configObject = data.reduce((acc: any, item: any) => {
    acc[item.key] = item.value
    return acc
  }, {})

  return configObject
}

// 2. Menyimpan perombakan massal berbasis skema Key-Value Pair dengan UPSERT SAKTI
export async function updateStoreSettings(formData: FormData) {
  const keys = ['whatsapp_number', 'showroom_address', 'operational_hours', 'support_email', 'instagram_url']
  const supabase = await createClientServer()

  try {
    // Loop dan simpan satu per satu key-nya menggunakan UPSERT (Insert if new, Update if exists)
    for (const key of keys) {
      const value = formData.get(key) as string
      if (value !== null) {
        const { error } = await supabase
          .from('settings')
          .upsert(
            { key: key, value: value },
            { onConflict: 'key' } // Kunci utama pendeteksi bentrokan baris data
          )

        if (error) throw new Error(`Eror saat mengamankan key ${key}: ${error.message}`)
      }
    }

    // Segarkan cache beranda & layout biar data barunya langsung muncul live di web publik!
    revalidatePath('/')
    return { success: true }
  } catch (err: any) {
    console.error('Gagal total eksekusi simpan profil toko:', err.message)
    return { error: `Gagal memperbarui pengaturan toko: ${err.message}` }
  }
}