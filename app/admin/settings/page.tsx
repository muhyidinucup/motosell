'use client'

import { useState, useEffect } from 'react'
import { getStoreSettings, updateStoreSettings } from '@/actions/settings'
import { Settings, Save, AlertCircle, CheckCircle2, Phone, MapPin, Clock, Mail, Globe } from 'lucide-react'

interface StoreConfig {
  whatsapp_number: string
  showroom_address: string
  operational_hours: string
  support_email: string
  instagram_url: string
}

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<StoreConfig | null>(null)
  const [loading, setLoading] = useState(true)
  const [btnLoading, setBtnLoading] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  useEffect(() => {
    async function loadConfig() {
      const data = await getStoreSettings()
      if (data) setSettings(data as StoreConfig)
      setLoading(false)
    }
    loadConfig()
  }, [])

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setBtnLoading(true)
    setMessage(null)

    const formData = new FormData(e.currentTarget)
    const res = await updateStoreSettings(formData)

    if (res?.error) {
      setMessage({ type: 'error', text: res.error })
    } else {
      setMessage({ type: 'success', text: 'Pengaturan identitas showroom MotoSell berhasil diperbarui!' })
    }
    setBtnLoading(false)
  }

  if (loading) return <div className="p-8 text-center text-slate-500 font-bold animate-pulse">Memuat konfigurasi global showroom...</div>

  return (
    <div className="p-4 sm:p-8 max-w-4xl mx-auto font-sans bg-slate-50 min-h-screen text-slate-900">
      
      {/* HEADER */}
      <div className="mb-8 border-b-2 border-indigo-100 pb-6">
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight flex items-center gap-2">
          <Settings className="w-7 sm:w-8 h-7 sm:h-8 text-indigo-600" />
          Pengaturan <span className="text-indigo-600">Profil Toko</span>
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1 font-medium">Kelola nomor WhatsApp tujuan penawaran serta informasi operasional showroom secara terpusat.</p>
      </div>

      {/* FEEDBACK NOTIFIKASI */}
      {message && (
        <div className={`p-4 rounded-xl text-xs sm:text-sm font-bold mb-6 flex items-center gap-2.5 border ${
          message.type === 'success' ? 'bg-emerald-50 border-emerald-200 text-emerald-700' : 'bg-rose-50 border-rose-200 text-rose-700'
        }`}>
          {message.type === 'success' ? <CheckCircle2 className="w-5 h-5 text-emerald-600" /> : <AlertCircle className="w-5 h-5 text-rose-600" />}
          <span>{message.text}</span>
        </div>
      )}

      {/* BOX FORM UTAMA */}
      <div className="bg-white p-5 sm:p-8 rounded-2xl shadow-md border border-slate-200">
        <form onSubmit={handleSubmit} className="space-y-6">
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {/* Nomor WhatsApp */}
            <div className="space-y-1.5">
              <label className="text-xs font-black uppercase tracking-wider text-slate-600 flex items-center gap-1.5">
                <Phone className="w-4 h-4 text-indigo-600" /> Nomor WhatsApp Showroom
              </label>
              <input 
                type="text" 
                name="whatsapp_number"
                required
                defaultValue={settings?.whatsapp_number}
                placeholder="Contoh: 6281234567890"
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-600 transition"
              />
              <span className="text-[10px] font-medium text-slate-400 block pl-1">Wajib awali kode negara tanpa tanda plus (+), contoh: 62812...</span>
            </div>

            {/* Email Support */}
            <div className="space-y-1.5">
              <label className="text-xs font-black uppercase tracking-wider text-slate-600 flex items-center gap-1.5">
                <Mail className="w-4 h-4 text-indigo-600" /> Email Customer Support
              </label>
              <input 
                type="email" 
                name="support_email"
                required
                defaultValue={settings?.support_email}
                placeholder="support@motosell.com"
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-600 transition"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {/* Jam Operasional */}
            <div className="space-y-1.5">
              <label className="text-xs font-black uppercase tracking-wider text-slate-600 flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-indigo-600" /> Jam Kerja Operasional
              </label>
              <input 
                type="text" 
                name="operational_hours"
                required
                defaultValue={settings?.operational_hours}
                placeholder="Senin - Sabtu: 09:00 - 18:00 WIB"
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-600 transition"
              />
            </div>

            {/* Link Instagram */}
            <div className="space-y-1.5">
              <label className="text-xs font-black uppercase tracking-wider text-slate-600 flex items-center gap-1.5">
                <Globe className="w-4 h-4 text-indigo-600" /> URL Instagram Showroom
              </label>
              <input 
                type="url" 
                name="instagram_url"
                defaultValue={settings?.instagram_url}
                placeholder="https://instagram.com/motosell"
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-600 transition"
              />
            </div>
          </div>

          {/* Alamat Showroom Fisik */}
          <div className="space-y-1.5">
            <label className="text-xs font-black uppercase tracking-wider text-slate-600 flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-indigo-600" /> Alamat Fisik Lengkap Showroom
            </label>
            <textarea 
              name="showroom_address"
              required
              rows={3}
              defaultValue={settings?.showroom_address}
              placeholder="Ketik alamat lengkap showroom untuk mempermudah calon pembeli datang inspeksi/COD..."
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-600 transition resize-none"
            />
          </div>

          {/* BUTTON SIMPAN */}
          <div className="border-t border-slate-100 pt-6 flex justify-end">
            <button
              type="submit"
              disabled={btnLoading}
              className="w-full sm:w-auto px-6 py-3 bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-800 text-white font-bold rounded-xl text-xs sm:text-sm uppercase tracking-wider transition shadow-md flex items-center justify-center gap-2"
            >
              <Save className="w-4 h-4" />
              {btnLoading ? 'Menyimpan Perubahan...' : 'Simpan Pengaturan'}
            </button>
          </div>

        </form>
      </div>

    </div>
  )
}