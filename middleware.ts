import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { createServerClient, type CookieOptions } from '@supabase/ssr'

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // 1. BYPASS OTOMATIS: Jika rute yang diakses adalah aset statis atau internal Server Actions, biarkan lolos tanpa dicegat!
  if (
    pathname.startsWith('/_next') || 
    pathname.startsWith('/api') ||
    pathname.includes('.')
  ) {
    return NextResponse.next()
  }

  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  // 2. Inisialisasi Supabase Client khusus untuk Middleware Jaringan
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          request.cookies.set({ name, value, ...options })
          response = NextResponse.next({
            request: { headers: request.headers },
          })
          response.cookies.set({ name, value, ...options })
        },
        remove(name: string, options: CookieOptions) {
          request.cookies.set({ name, value: '', ...options })
          response = NextResponse.next({
            request: { headers: request.headers },
          })
          response.cookies.set({ name, value: '', ...options })
        },
      },
    }
  )

  // 3. Ambil data session user secara aman menggunakan getSession (lebih ringan untuk middleware)
  const { data: { session } } = await supabase.auth.getSession()

  // 4. LOGIKA PROTEKSI: Jika mau masuk area /admin tapi BELUM login, usir ke halaman /login
  if (pathname.startsWith('/admin') && !session) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // 5. Jika SUDAH login tapi malah iseng buka halaman /login, lempar balik ke dashboard admin
  if (pathname.startsWith('/login') && session) {
    return NextResponse.redirect(new URL('/admin/dashboard', request.url))
  }

  return response
}

// Aturan filter rute mana saja yang wajib dijaga ketat oleh satpam middleware
export const config = {
  matcher: [
    /*
     * Cocokkan semua jalur permintaan kecuali yang diawali dengan:
     * - api (rute API)
     * - _next/static (file statis)
     * - _next/image (fitur optimasi gambar Next.js)
     * - favicon.ico (file ikon browser)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}