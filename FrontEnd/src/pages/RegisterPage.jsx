import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import PentolImg from '../assets/Pentol.png'

const RegisterPage = () => {
  const navigate = useNavigate()
  const [form, setForm] = useState({ nama: '', email: '', telepon: '', password: '', konfirmasi: '' })
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState({})
  const [step, setStep] = useState(1)

  const validate = () => {
    const e = {}
    if (!form.nama.trim()) e.nama = 'Nama wajib diisi'
    if (!form.email.includes('@')) e.email = 'Email tidak valid'
    if (!form.telepon.match(/^[0-9]{9,13}$/)) e.telepon = 'Nomor telepon tidak valid'
    if (form.password.length < 6) e.password = 'Password minimal 6 karakter'
    if (form.password !== form.konfirmasi) e.konfirmasi = 'Password tidak cocok'
    return e
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    const e2 = validate()
    if (Object.keys(e2).length) { setErrors(e2); return }
    setLoading(true)
    setTimeout(() => { setLoading(false); setStep(2) }, 1500)
  }

  if (step === 2) return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <div className="text-8xl mb-6">🎉</div>
        <h1 className="text-3xl font-black text-white mb-3">Registrasi Berhasil!</h1>
        <p className="text-gray-400 mb-8">Akun pelanggan <span className="text-red-400 font-bold">{form.nama}</span> berhasil dibuat. Silakan login untuk mulai memesan!</p>
        <div className="flex flex-col gap-3">
          <button onClick={() => navigate('/login')} className="bg-red-600 hover:bg-red-500 text-white font-black py-3.5 rounded-xl transition-all">Masuk Sekarang</button>
          <Link to="/" className="text-gray-500 hover:text-gray-300 text-sm">← Kembali ke Beranda</Link>
        </div>
      </div>
    </div>
  )

  const field = (key, label, type = 'text', placeholder = '') => (
    <div key={key}>
      <label className="block text-sm font-semibold text-gray-400 mb-1.5">{label}</label>
      <input type={type} placeholder={placeholder} value={form[key]}
        onChange={(e) => setForm({ ...form, [key]: e.target.value })}
        className={`w-full bg-gray-800 border ${errors[key] ? 'border-red-500' : 'border-gray-700'} focus:border-red-500 text-white placeholder-gray-600 rounded-xl px-4 py-3 outline-none transition-colors text-sm`} />
      {errors[key] && <p className="text-red-400 text-xs mt-1">⚠️ {errors[key]}</p>}
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center px-4 py-12">
      <div className="fixed top-0 left-0 w-96 h-96 bg-orange-600/10 rounded-full blur-3xl pointer-events-none"></div>
      <div className="fixed bottom-0 right-0 w-72 h-72 bg-red-600/10 rounded-full blur-3xl pointer-events-none"></div>
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
          <h1 className="text-3xl font-black text-white mt-6 mb-2">Daftar Pelanggan</h1>
          <p className="text-gray-500 text-sm">Buat akun baru dan nikmati kemudahan berbelanja</p>
        </div>

        <div className="bg-yellow-900/20 border border-yellow-700/30 rounded-2xl px-4 py-3 mb-5 flex items-start gap-3">

          <p className="text-yellow-300 text-xs leading-relaxed">Registrasi ini <strong>hanya untuk pelanggan</strong>. Admin tidak dapat mendaftar melalui formulir ini.</p>
        </div>

        <div className="bg-gray-900 border border-gray-800 rounded-3xl p-6 md:p-8 shadow-2xl">
          <form onSubmit={handleSubmit} className="space-y-4">
            {field('nama', 'Nama Lengkap', 'text', 'Masukkan nama lengkap')}
            {field('email', 'Email', 'email', 'contoh@email.com')}
            {field('telepon', 'Nomor Telepon', 'tel', '08xxxxxxxxxx')}
            <div>
              <label className="block text-sm font-semibold text-gray-400 mb-1.5">Password</label>
              <div className="relative">
                <input type={showPass ? 'text' : 'password'} placeholder="Minimal 6 karakter" value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  className={`w-full bg-gray-800 border ${errors.password ? 'border-red-500' : 'border-gray-700'} focus:border-red-500 text-white placeholder-gray-600 rounded-xl px-4 py-3 pr-12 outline-none transition-colors text-sm`} />
                <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 text-lg">{showPass ? '🙈' : '👁️'}</button>
              </div>
              {errors.password && <p className="text-red-400 text-xs mt-1">⚠️ {errors.password}</p>}
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-400 mb-1.5">Konfirmasi Password</label>
              <input type="password" placeholder="Ulangi password" value={form.konfirmasi}
                onChange={(e) => setForm({ ...form, konfirmasi: e.target.value })}
                className={`w-full bg-gray-800 border ${errors.konfirmasi ? 'border-red-500' : 'border-gray-700'} focus:border-red-500 text-white placeholder-gray-600 rounded-xl px-4 py-3 outline-none transition-colors text-sm`} />
              {errors.konfirmasi && <p className="text-red-400 text-xs mt-1">⚠️ {errors.konfirmasi}</p>}
            </div>
            <div className="flex items-start gap-2 pt-1">
              <input type="checkbox" id="syarat" className="mt-1 accent-red-500" required />
              <label htmlFor="syarat" className="text-xs text-gray-500">Saya menyetujui <a href="#" className="text-red-400 hover:underline">Syarat & Ketentuan</a> serta <a href="#" className="text-red-400 hover:underline">Kebijakan Privasi</a></label>
            </div>
            <button type="submit" disabled={loading}
              className="w-full bg-gradient-to-r from-red-600 to-orange-500 hover:from-red-500 hover:to-orange-400 text-white font-black py-3.5 rounded-xl transition-all shadow-lg shadow-red-900/40 disabled:opacity-60 text-sm">
              {loading ? 'Membuat Akun...' : '🚀 Daftar Sekarang'}
            </button>
          </form>
          <div className="mt-6 text-center text-sm text-gray-600">Sudah punya akun?{' '}<Link to="/login" className="text-red-400 hover:text-red-300 font-bold">Masuk di sini</Link></div>
        </div>
        <div className="mt-6 text-center"><Link to="/" className="text-gray-600 hover:text-gray-400 text-sm transition-colors">← Kembali ke Beranda</Link></div>
      </div>
    </div>
  )
}

export default RegisterPage
