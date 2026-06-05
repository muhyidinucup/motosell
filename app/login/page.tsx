'use client'

import { useState } from 'react'
import { loginAdmin } from '@/actions/auth'
import { LogIn, Lock, Mail, AlertCircle } from 'lucide-react'

export default function AdminLoginPage() {
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setErrorMsg(null)

    const formData = new FormData(e.currentTarget)
    const result = await loginAdmin(formData)

    if (result?.error) {
      setErrorMsg(result.error)
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center font-sans p-4 antialiased">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
        
        {/* LOGO & JUDUL */}
        <div className="text-center space-y-2">
          <div className="inline-flex p-3.5 bg-indigo-600 rounded-2xl text-white font-black shadow-lg shadow-indigo-600/30 mb-2">
            MS
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
            PANEL ADMIN <span className="text-indigo-500">MOTOSELL</span>
          </h1>
          <p className="text-xs text-slate-400 font-medium">
            Silakan masukkan kredensial khusus untuk mengelola operasional showroom.
          </p>
        </div>

        {/* NOTIFIKASI ERROR JIKA GAGAL */}
        {errorMsg && (
          <div className="p-4 bg-rose-950/40 border border-rose-900 text-rose-400 rounded-xl text-xs flex items-center gap-2.5 font-semibold animate-shake">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* FORMULIR LOGIN */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Kolom Email */}
          <div className="space-y-1.5">
            <label className="text-xs font-black uppercase tracking-wider text-slate-400">Email Admin</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-500"><Mail className="w-4 h-4" /></span>
              <input 
                type="email" 
                name="email"
                required
                placeholder="admin@motosell.com"
                className="w-full pl-10 pr-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
              />
            </div>
          </div>

          {/* Kolom Password */}
          <div className="space-y-1.5">
            <label className="text-xs font-black uppercase tracking-wider text-slate-400">Password</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-500"><Lock className="w-4 h-4" /></span>
              <input 
                type="password" 
                name="password"
                required
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
              />
            </div>
          </div>

          {/* Tombol Eksekusi Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-800 text-white font-black rounded-xl text-xs sm:text-sm tracking-wider uppercase flex items-center justify-center gap-2 transition shadow-lg shadow-indigo-700/20 mt-6"
          >
            <LogIn className="w-4 h-4" />
            {loading ? 'Memvalidasi Otoritas...' : 'Masuk ke Dashboard'}
          </button>
        </form>

        {/* FOOTER BAR */}
        <div className="text-center text-[10px] text-slate-600 font-bold tracking-widest uppercase border-t border-slate-800/60 pt-4">
          Secured by Supabase Auth System
        </div>

      </div>
    </div>
  )
}