import { Link } from 'react-router-dom'
import pentolImg from '../assets/Pentol.png'

const LandingPage = () => {
    return (
        <div style={{ fontFamily: "'Segoe UI', sans-serif" }} className="min-h-screen bg-gray-950 text-white overflow-x-hidden">

            {/* NAVBAR */}
            <nav className="fixed top-0 left-0 right-0 z-50 bg-gray-950/90 backdrop-blur-md border-b border-red-900/30">
                <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div>
                            <div className="font-black text-lg leading-none text-white">PENTOL</div>
                            <div className="font-black text-sm text-red-500 tracking-widest">MERCON</div>
                        </div>
                    </div>
                    <div className="hidden md:flex items-center gap-6 text-sm font-semibold uppercase tracking-wider">
                        <a href="#branding" className="text-gray-400 hover:text-red-400 transition-colors">Branding</a>
                        <a href="#menu" className="text-gray-400 hover:text-red-400 transition-colors">Menu</a>
                        <Link to="/riwayat" className="text-gray-400 hover:text-white transition-colors">Riwayat</Link>
                        <Link to="/transaksi" className="text-gray-300 hover:text-white px-4 py-2 rounded-lg border border-gray-700 hover:border-red-500">Order</Link>
                        <Link to="/admin/login" className="text-gray-400 hover:text-white px-4 py-2 rounded-lg border border-gray-800 hover:border-gray-600">Admin</Link>
                    </div>
                </div>
            </nav>

            {/* HERO */}
            <section className="min-h-screen relative flex items-center justify-center overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-red-950 via-gray-950 to-orange-950/50"></div>
                <div className="relative z-10 max-w-6xl mx-auto px-4 pt-20 text-center">
                    <h1 className="text-5xl md:text-8xl font-black mb-6 leading-none">
                        <span className="text-white">PENTOL</span><br />
                        <span className="bg-gradient-to-r from-red-500 to-orange-400 bg-clip-text text-transparent">MERCON</span>
                    </h1>
                    <p className="text-gray-400 text-lg md:text-xl max-w-2xl mx-auto mb-10">Sensasi pedas yang meledak seperti lava di setiap gigitan.</p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Link to="/transaksi" className="bg-gradient-to-r from-red-600 to-orange-500 text-white px-8 py-4 rounded-2xl font-black text-lg shadow-xl hover:scale-105 transition-transform">Order Sekarang</Link>
                        <Link to="/admin/login" className="border border-gray-700 text-gray-300 hover:text-white px-8 py-4 rounded-2xl font-bold text-lg text-center">Admin</Link>
                    </div>
                </div>
            </section>

            {/* BRANDING SECTION */}
            <section id="branding" className="py-24 px-4 bg-red-600 text-white">
                <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center gap-12">
                    <div className="flex-1 text-center md:text-left">
                        <h2 className="text-5xl md:text-7xl font-black mb-4 leading-tight uppercase text-white">PRODUK BRAND</h2>
                        <div className="space-y-6 text-lg md:text-xl font-medium opacity-90">
                            <p><span className="font-black">Nama Produk:</span> Pentol Mercon</p>
                            <p><span className="font-black">Nama Brand:</span> Mercon Lava</p>
                            <p className="leading-relaxed text-justify">Brand <span className="font-black underline">"Mercon Lava"</span> dipilih karena menggambarkan sensasi pedas yang panas dan meledak seperti lava. Nama ini memberikan kesan kuat, unik, dan mudah diingat, sehingga dapat menarik perhatian konsumen terutama kalangan anak muda.</p>
                        </div>
                    </div>
                    <div className="flex-1 flex justify-center">
                        <div className="relative group">
                            <div className="absolute inset-0 bg-white/20 rounded-full blur-3xl group-hover:bg-white/30 transition-all"></div>
                            <img src={pentolImg} alt="Branding Pentol" className="relative w-80 h-80 md:w-full md:h-full object-contain drop-shadow-2xl hover:scale-110 transition-transform duration-500" />
                        </div>
                    </div>
                </div>
            </section>

            {/* MENU SECTION */}
            <section id="menu" className="py-24 px-4 bg-gray-950">
                <div className="max-w-4xl mx-auto text-center">
                    <h2 className="text-3xl md:text-5xl font-black mb-16 uppercase italic">Menu <span className="text-orange-400">Andalan</span></h2>
                    <div className="flex justify-center">
                        <div className="bg-gray-900 border border-gray-800 rounded-3xl p-8 max-w-sm w-full shadow-2xl">
                            <img src={pentolImg} alt="Pentol Mercon" className="w-full h-64 object-contain mb-6" />
                            <h3 className="font-black text-white text-2xl mb-2">Pentol Mercon</h3>
                            <p className="text-red-400 font-black text-3xl mb-6">Rp 5.000</p>
                            <Link to="/transaksi" className="block w-full bg-red-600 text-white font-black py-4 rounded-2xl hover:bg-red-500">BELI SEKARANG</Link>
                        </div>
                    </div>
                </div>
            </section>

            {/* FOOTER */}
            <footer className="bg-gray-950 border-t border-gray-900 py-16 px-4">
                <div className="max-w-6xl mx-auto flex flex-col items-center">
                    <div className="text-center mb-8">
                        <span className="font-black text-2xl text-white">PENTOL MERCON</span>
                    </div>

                    {/* SOCIAL ICONS (Instagram, Gmail, WA) */}
                    <div className="flex gap-10 mb-10">
                       
                        <a href="https://wa.me/+6281339529934" className="group flex flex-col items-center gap-2" title="WhatsApp">
                            <div className="w-14 h-14 bg-gray-900 border border-gray-800 rounded-2xl flex items-center justify-center group-hover:border-green-500 group-hover:bg-green-500/10 transition-all shadow-lg">
                                <span className="text-2xl opacity-50 group-hover:opacity-100 transition-opacity">💬</span>
                            </div>
                            <span className="text-[10px] uppercase font-bold text-gray-600 group-hover:text-green-500 tracking-widest">WhatsApp</span>
                        </a>
                    </div>

                    <p className="text-gray-600 text-xs tracking-widest font-semibold uppercase">© 2026 Pentol Mercon. All rights reserved.</p>
                </div>
            </footer>
        </div>
    )
}

export default LandingPage
