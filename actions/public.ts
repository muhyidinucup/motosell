'use server'

import { createClientServer } from '@/lib/supabase'

// 1. Ambil semua banner promosi yang statusnya aktif untuk Slider
export async function getActiveBanners() {
  const supabase = await createClientServer()
  const { data, error } = await supabase
    .from('banners')
    .select('*')
    .eq('is_active', true)
    .order('sort_order', { ascending: true })

  if (error) {
    console.error('Gagal mengambil banner publik:', error.message)
    return []
  }
  return data
}

// 2. Ambil semua katalog armada motor yang statusnya masih 'ready'
export async function getReadyMotors() {
  const supabase = await createClientServer()
  const { data, error } = await supabase
    .from('motors')
    .select(`
      *,
      motor_images (
        image_url,
        is_primary
      ),
      brands (
        name,
        code
      )
    `)
    .eq('status', 'ready')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Gagal mengambil katalog motor publik:', error.message)
    return []
  }
  return data
}

// 3. Ambil data detail 1 unit motor beserta seluruh fotonya berdasarkan slug URL
export async function getMotorDetailBySlug(slug: string) {
  const supabase = await createClientServer()
  const { data, error } = await supabase
    .from('motors')
    .select(`
      *,
      motor_images (
        image_url,
        is_primary
      ),
      brands (
        name,
        code
      )
    `)
    .eq('slug', slug)
    .single()

  if (error) {
    console.error('Gagal mengambil detail motor publik:', error.message)
    return null
  }
  return data
}