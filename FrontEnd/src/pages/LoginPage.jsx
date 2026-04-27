import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import PentolImg from '../assets/Pentol.png'

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY

const LoginPage = () => {
  const navigate = useNavigate()
  const [form, setForm] = useState({ email: '', password: '' })
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    if (!form.email || !form.password) { setError('Email dan password wajib diisi!'); return }
    setLoading(true)
    try {
      if (!SUPABASE_URL || !SUPABASE_ANON_KEY) throw new Error('Supabase env belum di-set (VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY)')

      const resp = await fetch(`${SUPABASE_URL.replace(/\/$/, '')}/auth/v1/token?grant_type=password`, {
        method: 'POST',
        headers: {
          apikey: SUPABASE_ANON_KEY,
          'content-type': 'application/json',
        },
        body: JSON.stringify({ email: form.email, password: form.password }),
      })
      const data = await resp.json().catch(() => ({}))
      if (!resp.ok) throw new Error(data?.error_description || data?.msg || 'Login gagal')

      localStorage.setItem('adminAccessToken', data.access_token)
      localStorage.setItem('adminRefreshToken', data.refresh_token || '')
      localStorage.setItem('currentRole', 'admin')
      navigate('/dashboard')
    } catch (err) {
      setError(String(err?.message || err))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center px-4 py-12">
      <div className="fixed top-0 right-0 w-96 h-96 bg-red-600/10 rounded-full blur-3xl pointer-events-none"></div>
      <div className="fixed bottom-0 left-0 w-72 h-72 bg-orange-600/10 rounded-full blur-3xl pointer-events-none"></div>
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 group">
            <div className="w-14 h-14 bg-red-600 rounded-2xl flex items-center justify-center shadow-lg shadow-red-900/50 group-hover:scale-110 transition-transform overflow-hidden p-1">
              <img src={PentolImg} alt="Pentol Mercon" className="w-full h-full object-contain" />
            </div>
            <div className="text-left">
              <div className="font-black text-xl text-white leading-none">PENTOL</div>
              <div className="font-black text-sm text-red-500 tracking-widest leading-none">MERCON</div>
            </div>
          </Link>
          <h1 className="text-3xl font-black text-white mt-6 mb-2">Login Admin</h1>
          <p className="text-gray-500 text-sm">Halaman ini khusus admin untuk melihat order / pre-order</p>
        </div>
        <div className="bg-gray-900 border border-gray-800 rounded-3xl p-6 md:p-8 shadow-2xl">
          <div className="mb-6 bg-gray-800/60 border border-gray-700 rounded-2xl px-4 py-3">
            <p className="text-[11px] text-gray-300 font-bold">
              Pelanggan tidak perlu login. Order &amp; pre-order langsung dari beranda.
            </p>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-400 mb-1.5">Email</label>
              <input type="email" placeholder="contoh@email.com" value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="w-full bg-gray-800 border border-gray-700 focus:border-red-500 text-white placeholder-gray-600 rounded-xl px-4 py-3 outline-none transition-colors text-sm" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-400 mb-1.5">Password</label>
              <div className="relative">
                <input type={showPass ? 'text' : 'password'} placeholder="Masukkan password" value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  className="w-full bg-gray-800 border border-gray-700 focus:border-red-500 text-white placeholder-gray-600 rounded-xl px-4 py-3 pr-12 outline-none transition-colors text-sm" />
                <button type="button" onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 text-lg">{showPass ? '🙈' : '👁️'}</button>
              </div>
            </div>
            {error && <div className="bg-red-900/30 border border-red-700/50 text-red-400 text-sm rounded-xl px-4 py-3">⚠️ {error}</div>}
            <div className="text-right"><a href="#" className="text-sm text-red-400 hover:text-red-300">Lupa password?</a></div>
            <button type="submit" disabled={loading}
              className="w-full bg-gradient-to-r from-red-600 to-orange-500 hover:from-red-500 hover:to-orange-400 text-white font-black py-3.5 rounded-xl transition-all shadow-lg shadow-red-900/40 disabled:opacity-60 flex items-center justify-center gap-2 text-sm">
              {loading ? 'Memproses...' : 'Masuk sebagai Admin'}
            </button>
          </form>
          <div className="mt-6 bg-gray-800/50 border border-gray-700 rounded-2xl p-4 text-center">
            <p className="text-xs text-gray-500"> Akun admin tidak dapat didaftarkan secara mandiri.</p>
            <p className="text-xs text-gray-600">Hubungi pengelola sistem untuk akses admin.</p>
          </div>
        </div>
        <div className="mt-6 text-center flex items-center justify-center gap-4">
          <Link to="/" className="text-gray-600 hover:text-gray-400 text-sm transition-colors">← Kembali ke Beranda</Link>
          <Link to="/transaksi" className="text-gray-600 hover:text-gray-400 text-sm transition-colors">Order tanpa login →</Link>
        </div>
      </div>
    </div>
  )
}

export default LoginPage
