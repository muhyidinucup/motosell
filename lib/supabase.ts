import { createBrowserClient, createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

// 1. Client khusus untuk UI / Browser Component
export const createClient = () =>
  createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

// 2. Client khusus untuk Server Actions / Server Component
export async function createClientServer() {
  const cookieStore = await cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => {
              // 🛡️ AMANKAN SESI: Jika ini kuki login (access-token), batasi umurnya maksimal 2 jam saja (7200 detik)
              const secureOptions = { ...options }
              if (name.includes('auth-token') || name.includes('session')) {
                secureOptions.maxAge = 7200 // 2 Jam otomatis log out
              }
              cookieStore.set(name, value, secureOptions)
            })
          } catch {
            // Abaikan error jika dipanggil dari Server Component biasa
          }
        },
      },
    }
  )
}