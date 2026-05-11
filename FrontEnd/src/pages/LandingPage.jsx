import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import AOS from 'aos'
import 'aos/dist/aos.css'
import pentolImg from '../assets/Pentol.png'

const LandingPage = () => {
    // Mode Malam/Siang State
    const [isDark, setIsDark] = useState(() => {
        const saved = localStorage.getItem('theme')
        return saved !== 'light' // default dark
    })

    useEffect(() => {
        AOS.init({ duration: 800, once: true })
        if (isDark) {
            document.documentElement.classList.add('dark')
            localStorage.setItem('theme', 'dark')
        } else {
            document.documentElement.classList.remove('dark')
            localStorage.setItem('theme', 'light')
        }
    }, [isDark])

    const toggleTheme = () => setIsDark(!isDark)

    // Dynamic Classes for Light/Dark Mode
    const themeBg = isDark ? 'bg-gray-950 text-white' : 'bg-slate-50 text-slate-900'
    const navBg = isDark ? 'bg-gray-950/90 border-red-900/30' : 'bg-white/90 border-red-200/50'
    const textBrand = isDark ? 'text-white' : 'text-slate-900'
    const navLink = isDark ? 'text-gray-400 hover:text-red-400' : 'text-slate-600 hover:text-red-600'
    const navLinkHover = isDark ? 'text-gray-400 hover:text-white' : 'text-slate-600 hover:text-slate-900'
    const borderBtn = isDark ? 'border-gray-700 text-gray-300 hover:text-white hover:border-red-500' : 'border-slate-300 text-slate-700 hover:text-slate-900 hover:border-red-500'
    const adminBtn = isDark ? 'border-gray-800 text-gray-400 hover:text-white hover:border-gray-600' : 'border-slate-300 text-slate-600 hover:text-slate-900 hover:border-slate-500'
    const heroOverlay = isDark ? 'from-red-950 via-gray-950 to-orange-950/50' : 'from-red-100 via-slate-50 to-orange-100/50'
    const heroTextDesc = isDark ? 'text-gray-400' : 'text-slate-600'
    const cardBg = isDark ? 'bg-gray-900 border-gray-800' : 'bg-white border-slate-200'
    const footerBg = isDark ? 'bg-gray-950 border-gray-900' : 'bg-slate-50 border-slate-200'
    const socialIconBg = isDark ? 'bg-gray-900 border-gray-800 group-hover:bg-green-500/10' : 'bg-white border-slate-200 group-hover:bg-green-50'

    return (
        <div style={{ fontFamily: "'Segoe UI', sans-serif" }} className={`min-h-screen overflow-x-hidden transition-colors duration-500 ${themeBg}`}>

            {/* NAVBAR */}
            <nav className={`fixed top-0 left-0 right-0 z-50 backdrop-blur-md border-b transition-colors duration-500 ${navBg}`}>
                <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div>
                            <div className={`font-black text-lg leading-none ${textBrand}`}>PENTOL</div>
                            <div className="font-black text-sm text-red-500 tracking-widest">MERCON</div>
                        </div>
                    </div>
                    <div className="flex items-center gap-2 md:gap-4">
                        <div className="hidden md:flex items-center gap-6 text-sm font-semibold uppercase tracking-wider">
                            <a href="#branding" className={`transition-colors ${navLink}`}>Branding</a>
                            <a href="#menu" className={`transition-colors ${navLink}`}>Menu</a>
                            <a href="#cara-pesan" className={`transition-colors ${navLink}`}>Panduan</a>
                            <Link to="/riwayat" className={`transition-colors ${navLinkHover}`}>Riwayat</Link>
                            <Link to="/transaksi" className={`px-4 py-2 rounded-lg border transition-colors ${borderBtn}`}>Order</Link>
                            <Link to="/admin/login" className={`px-4 py-2 rounded-lg border transition-colors ${adminBtn}`}>Admin</Link>
                        </div>

                        {/* MOBILE LINKS */}
                        <div className="flex md:hidden items-center gap-3 text-sm font-semibold uppercase tracking-wider">
                            <Link to="/riwayat" className={`transition-colors ${navLinkHover}`}>Riwayat</Link>
                            <Link to="/transaksi" className={`px-3 py-1.5 rounded-lg border transition-colors text-xs ${borderBtn}`}>Order</Link>
                        </div>

                        {/* THEME TOGGLE (Always visible) */}
                        <button onClick={toggleTheme} className={`p-2 rounded-full border transition-all ${isDark ? 'bg-gray-800 border-gray-700 text-yellow-400 hover:bg-gray-700' : 'bg-white border-slate-300 text-slate-700 hover:bg-slate-100'}`} title="Mode Siang / Malam">
                            {isDark ? '🌙' : '☀️'}
                        </button>
                    </div>
                </div>
            </nav>

            {/* HERO */}
            <section className="min-h-screen relative flex items-center justify-center overflow-hidden">
                <div className={`absolute inset-0 bg-gradient-to-br transition-colors duration-500 ${heroOverlay}`}></div>
                <div className="relative z-10 max-w-6xl mx-auto px-4 pt-20 text-center">
                    <h1 className="text-5xl md:text-8xl font-black mb-6 leading-none" data-aos="fade-down">
                        <span className={textBrand}>PENTOL</span><br />
                        <span className="bg-gradient-to-r from-red-500 to-orange-400 bg-clip-text text-transparent">MERCON</span>
                    </h1>
                    <p className={`text-lg md:text-xl max-w-2xl mx-auto mb-10 transition-colors ${heroTextDesc}`}>Sensasi pedas yang meledak seperti lava di setiap gigitan.</p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center" data-aos="fade-up" data-aos-delay="200">
                        <Link to="/transaksi" className="bg-gradient-to-r from-red-600 to-orange-500 text-white px-8 py-4 rounded-2xl font-black text-lg shadow-xl hover:scale-105 transition-transform">Order Sekarang</Link>
                        <Link to="/admin/login" className={`border px-8 py-4 rounded-2xl font-bold text-lg text-center transition-colors ${isDark ? 'border-gray-700 text-gray-300 hover:text-white hover:bg-gray-800' : 'border-slate-300 text-slate-700 hover:text-slate-900 hover:bg-slate-100'}`}>Admin</Link>
                    </div>
                </div>
            </section>

            {/* BRANDING SECTION */}
            <section id="branding" className="py-24 px-4 bg-red-600 text-white">
                <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center gap-12">
                    <div className="flex-1 text-center md:text-left" data-aos="fade-right">
                        <h2 className="text-5xl md:text-7xl font-black mb-4 leading-tight uppercase text-white">PRODUK BRAND</h2>
                        <div className="space-y-6 text-lg md:text-xl font-medium opacity-90">
                            <p><span className="font-black">Nama Produk:</span> Pentol Mercon</p>
                            <p><span className="font-black">Nama Brand:</span> Mercon Lava</p>
                            <p className="leading-relaxed text-justify">Brand <span className="font-black underline">"Mercon Lava"</span> dipilih karena menggambarkan sensasi pedas yang panas dan meledak seperti lava. Nama ini memberikan kesan kuat, unik, dan mudah diingat, sehingga dapat menarik perhatian konsumen terutama kalangan anak muda.</p>
                        </div>
                    </div>
                    <div className="flex-1 flex justify-center" data-aos="fade-left">
                        <div className="relative group">
                            <div className="absolute inset-0 bg-white/20 rounded-full blur-3xl group-hover:bg-white/30 transition-all"></div>
                            <img src={pentolImg} alt="Branding Pentol" className="relative w-80 h-80 md:w-full md:h-full object-contain drop-shadow-2xl hover:scale-110 transition-transform duration-500" />
                        </div>
                    </div>
                </div>
            </section>

            {/* PANDUAN CARA PESAN SECTION */}
            <section id="cara-pesan" className="py-24 px-4">
                <div className="max-w-6xl mx-auto">
                    <div className="text-center mb-16" data-aos="fade-up">
                        <h2 className="text-3xl md:text-5xl font-black mb-4 uppercase italic">Cara <span className="text-orange-400">Pesan</span></h2>
                        <p className={`text-lg font-medium max-w-2xl mx-auto ${heroTextDesc}`}>Ikuti langkah mudah berikut untuk menikmati sensasi pedas Pentol Mercon Lava.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {/* Step 1 */}
                        <div className={`p-8 rounded-3xl border shadow-xl transition-all hover:-translate-y-2 ${cardBg}`} data-aos="fade-up" data-aos-delay="100">
                            <div className="w-16 h-16 bg-red-600 text-white rounded-2xl flex items-center justify-center font-black text-3xl mb-6 shadow-lg shadow-red-600/30">1</div>
                            <h3 className={`text-2xl font-black mb-3 ${textBrand}`}>Order / Pre-Order</h3>
                            <p className={`leading-relaxed font-medium ${heroTextDesc}`}>Kunjungi halaman Transaksi. Pilih pesananmu, isi identitas lengkap (Nama, Nomor Telepon, Kelas, Jurusan), lalu pilih tipe order (Order Langsung atau Pre-Order).</p>
                        </div>
                        {/* Step 2 */}
                        <div className={`p-8 rounded-3xl border shadow-xl transition-all hover:-translate-y-2 ${cardBg}`} data-aos="fade-up" data-aos-delay="200">
                            <div className="w-16 h-16 bg-green-500 text-white rounded-2xl flex items-center justify-center font-black text-3xl mb-6 shadow-lg shadow-green-500/30">2</div>
                            <h3 className={`text-2xl font-black mb-3 ${textBrand}`}>Konfirmasi WhatsApp</h3>
                            <p className={`leading-relaxed font-medium ${heroTextDesc}`}>Setelah pesanan dibuat, kamu akan otomatis diarahkan ke aplikasi WhatsApp Admin. Kirim pesan konfirmasi yang sudah terformat agar pesananmu segera diproses!</p>
                        </div>
                        {/* Step 3 */}
                        <div className={`p-8 rounded-3xl border shadow-xl transition-all hover:-translate-y-2 ${cardBg}`} data-aos="fade-up" data-aos-delay="300">
                            <div className="w-16 h-16 bg-blue-500 text-white rounded-2xl flex items-center justify-center font-black text-3xl mb-6 shadow-lg shadow-blue-500/30">3</div>
                            <h3 className={`text-2xl font-black mb-3 ${textBrand}`}>Cek Riwayat</h3>
                            <p className={`leading-relaxed font-medium ${heroTextDesc}`}>Untuk melihat status pesanan, kunjungi halaman Riwayat. Masukkan Nomor Telepon atau Nama kamu untuk melacak apakah pesanan sudah siap diambil atau belum.</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* MENU SECTION */}
            <section id="menu" className={`py-24 px-4 transition-colors duration-500 ${isDark ? 'bg-gray-950' : 'bg-slate-100'}`}>
                <div className="max-w-4xl mx-auto text-center" data-aos="fade-up">
                    <h2 className="text-3xl md:text-5xl font-black mb-16 uppercase italic">Menu <span className="text-orange-400">Andalan</span></h2>
                    <div className="flex justify-center">
                        <div className={`rounded-3xl p-8 max-w-sm w-full shadow-2xl border transition-colors ${cardBg}`}>
                            <img src={pentolImg} alt="Pentol Mercon" className="w-full h-64 object-contain mb-6" />
                            <h3 className={`font-black text-2xl mb-2 ${textBrand}`}>Pentol Mercon</h3>
                            <p className="text-red-500 font-black text-3xl mb-2">Rp 8.000</p>
                            <p className={`text-sm font-medium mb-6 uppercase tracking-wider ${heroTextDesc}`}>Isi 8 (5 Baso + 3 Cilok Keju) dengan Bumbu Kuah</p>
                            <Link to="/transaksi" className="block w-full bg-red-600 text-white font-black py-4 rounded-2xl hover:bg-red-500 transition-colors shadow-lg shadow-red-600/20">BELI SEKARANG</Link>
                        </div>
                    </div>
                </div>
            </section>

            {/* FOOTER */}
            <footer className={`py-16 px-4 border-t transition-colors ${footerBg}`}>
                <div className="max-w-6xl mx-auto flex flex-col items-center">
                    <div className="text-center mb-8">
                        <span className={`font-black text-2xl ${textBrand}`}>PENTOL MERCON</span>
                    </div>

                    {/* SOCIAL ICONS (WhatsApp) */}
                    <div className="flex gap-10 mb-10">
                        <a href="https://wa.me/6281339529934" className="group flex flex-col items-center gap-2" title="WhatsApp">
                            <div className={`w-14 h-14 border rounded-2xl flex items-center justify-center transition-all shadow-lg ${socialIconBg}`}>
                                <span className="text-2xl opacity-50 group-hover:opacity-100 transition-opacity">💬</span>
                            </div>
                            <span className="text-[10px] uppercase font-bold text-gray-500 group-hover:text-green-500 tracking-widest transition-colors">WhatsApp</span>
                        </a>
                    </div>

                    <p className="text-gray-500 text-xs tracking-widest font-semibold uppercase">© 2026 Pentol Mercon. All rights reserved.</p>
                    <p className="text-gray-500 text-xs tracking-widest font-semibold uppercase">afriza.</p>
                </div>
            </footer>
        </div>
    )
}

export default LandingPage
