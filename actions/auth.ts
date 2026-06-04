'use server'

import { createClientServer } from '@/lib/supabase'
import { redirect } from 'next/navigation'

// 1. Fungsi Gerbang Masuk Login Admin
export async function loginAdmin(formData: FormData) {
  const email = formData.get('email') as string
  const password = formData.get('password') as string

  const supabase = await createClientServer()

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    return { error: 'Email atau Password Admin salah, akses ditolak!' }
  }

  redirect('/admin/dashboard')
}

// 2. Fungsi Pembasmi Sesi Sempurna (LOGOUT ASLI SUPABASE)
export async function logoutAdmin() {
  const supabase = await createClientServer()
  
  // Hancurkan token token cookie auth yang tersangkut di browser
  await supabase.auth.signOut()
  
  // Usir paksa kembali ke pintu depan login, tidak bisa back balik ke dashboard!
  redirect('/login')
}