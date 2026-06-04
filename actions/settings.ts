'use server'

import { createClientServer } from '@/lib/supabase'
import { revalidatePath } from 'next/cache'

// 1. Mengambil semua data settings lama dan mengubahnya jadi objek rapi
export async function getStoreSettings() {
  const supabase = await createClientServer()
  const { data, error } = await supabase
    .from('settings')
    .select('*')

  if (error || !data) {
    console.error('Gagal memuat settings:', error?.message)
    return null
  }

  // Ubah baris row database menjadi objek { whatsapp_number: '...', showroom_address: '...' }
  const configObject = data.reduce((acc: any, item: any) => {
    acc[item.key] = item.value
    return acc
  }, {})

  return configObject
}

// 2. Menyimpan perombakan massal berbasis skema Key-Value Pair
export async function updateStoreSettings(formData: FormData) {
  const keys = ['whatsapp_number', 'showroom_address', 'operational_hours', 'support_email', 'instagram_url']
  const supabase = await createClientServer()

  try {
    // Loop dan update satu per satu key-nya di database
    for (const key of keys) {
      const value = formData.get(key) as string
      if (value !== null) {
        await supabase
          .from('settings')
          .update({ value: value })
          .eq('key', key)
      }
    }

    // Segarkan cache beranda biar data barunya langsung muncul live!
    revalidatePath('/')
    return { success: true }
  } catch (err) {
    console.error(err)
    return { error: 'Gagal memperbarui pengaturan toko!' }
  }
}