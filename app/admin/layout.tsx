'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { logoutAdmin } from '@/actions/auth'
import { 
  LayoutDashboard, 
  Layers, 
  Bike, 
  Image as ImageIcon, 
  ShoppingCart, 
  BarChart3, 
  Settings, 
  Menu, 
  X, 
  LogOut, 
  Globe 
} from 'lucide-react'

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const [isMobileOpen, setIsMobileOpen] = useState(false)

  const menuItems = [
    { name: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard },
    { name: 'Manajemen Brand', href: '/admin/brands', icon: Layers },
    { name: 'Inventori Motor', href: '/admin/motors', icon: Bike },
    { name: 'Banner Promo', href: '/admin/banners', icon: ImageIcon },
    { name: 'Catat Penjualan', href: '/admin/sales', icon: ShoppingCart },
    { name: 'Laporan Keuangan', href: '/admin/reports', icon: BarChart3 },
    { name: 'Pengaturan Toko', href: '/admin/settings', icon: Settings },
  ]

  const handleLogout = async () => {
    if (confirm('Apakah Anda yakin ingin keluar dari Konsol Manajemen MotoSell? Sesi Anda akan dihancurkan demi keamanan.')) {
      await logoutAdmin()
    }
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans antialiased flex flex-col md:flex-row">
      
      {/* 📱 TOP BAR MOBILE (Hanya Muncul di Layar HP) */}
      <div className="md:hidden w-full bg-slate-900 border-b border-slate-800 p-4 flex justify-between items-center sticky top-0 z-50">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-indigo-600 rounded-lg text-white font-black text-xs">MS</div>
          <h1 className="text-sm font-black tracking-wider text-white">MOTO<span className="text-indigo-500">SELL</span></h1>
        </div>
        <button 
          onClick={() => setIsMobileOpen(!isMobileOpen)}
          className="p-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-400 hover:text-white"
        >
          {isMobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* 🧭 SIDEBAR NAVIGASI PC & MOBILE OVERLAY (ANTI TENGGELAM) */}
      <aside className={`
        fixed inset-y-0 left-0 z-40 w-64 bg-slate-900 border-r border-slate-800 p-5 flex flex-col justify-between transform transition-transform duration-300 ease-in-out
        md:relative md:transform-none md:flex overflow-y-auto max-h-screen scrollbar-none
        ${isMobileOpen ? 'translate-x-0 pt-20 md:pt-5' : '-translate-x-full md:translate-x-0'}
      `}>
        
        {/* Bagian Menu Atas */}
        <div className="space-y-6">
          {/* Logo Brand Showroom (Hidden di HP karena sudah ada di Top Bar) */}
          <div className="hidden md:flex items-center gap-2.5 pb-4 border-b border-slate-800/60">
            <div className="p-2 bg-indigo-600 rounded-xl text-white font-black shadow-lg shadow-indigo-600/30">MS</div>
            <h1 className="text-lg font-black tracking-wider text-white">MOTO<span className="text-indigo-500">SELL</span></h1>
          </div>

          {/* Deretan List Link Sidebar Navigasi */}
          <nav className="space-y-1">
            {menuItems.map((item) => {
              const Icon = item.icon
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsMobileOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold uppercase tracking-wider transition duration-150 border ${
                    isActive 
                      ? 'bg-indigo-600 text-white border-indigo-500 shadow-lg shadow-indigo-600/20' 
                      : 'bg-transparent text-slate-400 border-transparent hover:text-slate-200 hover:bg-slate-950/40'
                  }`}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span>{item.name}</span>
                </Link>
              )
            })}
          </nav>
        </div>

        {/* 🔒 AREA TOMBOL AKSI BAWAH (LOGOUT & LIHAT WEBSITE) */}
        <div className="pt-4 border-t border-slate-800/60 space-y-2 mt-6">
          {/* Keluar halaman biasa ke beranda publik */}
          <Link
            href="/"
            onClick={() => setIsMobileOpen(false)}
            className="w-full flex items-center gap-3 px-4 py-3 text-xs font-bold text-slate-400 hover:text-white bg-slate-950/40 border border-slate-800/40 rounded-xl transition duration-150 uppercase tracking-wider"
          >
            <Globe className="w-4 h-4 text-slate-500" />
            <span>Lihat Website</span>
          </Link>

          {/* Hancurkan Sesi Token Supabase (LOGOUT AMAN) */}
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 text-xs font-bold text-rose-400 hover:text-white hover:bg-rose-600/20 border border-transparent hover:border-rose-500/30 rounded-xl transition duration-150 uppercase tracking-wider"
          >
            <LogOut className="w-4 h-4" />
            <span>Logout Admin</span>
          </button>
        </div>

      </aside>

      {/* 🎬 KONTEN HALAMAN ADMIN UTAMA DYNAMIC */}
      <main className="flex-1 p-4 sm:p-6 md:p-8 overflow-x-hidden min-w-0 bg-slate-950">
        {children}
      </main>

    </div>
  )
}