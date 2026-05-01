import { useRef, useState } from 'react'
import PentolImg from '../assets/Pentol.png'
import QrisImg from '../assets/qris.jpeg'
import AppSidebar from '../components/AppSidebar'
import { apiFetch } from '../lib/api'

const fmt = (n) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(n)

const PRODUK = { id: 1, nama: 'Pentol Mercon', harga: 7000, image: PentolImg }
const getCurrentRole = () => localStorage.getItem('currentRole') || 'pelanggan'
const QRIS_DURATION_SECONDS = 5 * 60
const toWaHref = (value) => {
  const digits = String(value || '').replace(/\D/g, '')
  if (!digits) return '#'
  const normalized = digits.startsWith('0') ? `62${digits.slice(1)}` : digits
  return `https://wa.me/${normalized}`
}

const generateAdminWaLink = (identitas, qtyBeli, tipe) => {
  const adminWa = '6281339529934'
  const text = `Halo Admin, saya ingin konfirmasi pesanan:\n\nNama: ${identitas.nama}\nNomor: ${identitas.telepon}\nKelas: ${identitas.kelas}\nJurusan: ${identitas.jurusan}\nJumlah Beli: ${qtyBeli} porsi\nTipe: ${tipe}`
  return `https://wa.me/${adminWa}?text=${encodeURIComponent(text)}`
}

const renderInputIdentitas = (identitas, setIdentitas) => (
  <div className="space-y-3 mb-6 pb-6 border-b border-gray-800">
    <p className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-500 mb-3">Identitas Pembeli</p>
    {[
      { key: 'nama', label: 'Nama Lengkap', placeholder: 'Masukkan nama...' },
      { key: 'telepon', label: 'Nomor Telepon', placeholder: 'Contoh: 08xxxxxxxxxx' },
      { key: 'kelas', label: 'Kelas', placeholder: 'Contoh: XII TKJ 1' },
      { key: 'jurusan', label: 'Jurusan', placeholder: 'Contoh: TKJ / RPL / MM' },
    ].map(f => (
      <div key={f.key}>
        <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest block mb-1">{f.label}</label>
        <input
          type="text"
          placeholder={f.placeholder}
          value={identitas[f.key]}
          onChange={e => setIdentitas(prev => ({ ...prev, [f.key]: e.target.value }))}
          className="w-full bg-gray-800 border border-gray-700 focus:border-red-500 rounded-xl px-4 py-2.5 text-white text-sm outline-none transition-colors placeholder:text-gray-600 font-medium"
        />
      </div>
    ))}
  </div>
)

const TransaksiPage = () => {
  const [sidebarOpen, setSidebarOpen] = useState(() => (typeof window !== 'undefined' ? window.innerWidth >= 1024 : true))
  const [tab, setTab] = useState('order') // 'order' | 'preorder'
  const currentRole = getCurrentRole()
  const isAdmin = currentRole === 'admin'

  // Form identitas
  const [identitas, setIdentitas] = useState({ nama: '', telepon: '', kelas: '', jurusan: '' })

  // Order state
  const [qty, setQty] = useState(0)
  const [uangDiterima, setUangDiterima] = useState('')
  const [sukses, setSukses] = useState(false)
  const [noStruk, setNoStruk] = useState('')

  // Pre-order state
  const [qtyPO, setQtyPO] = useState(0)
  const [suksesPO, setSuksesPO] = useState(false)
  const [poPayMethod, setPoPayMethod] = useState('pickup') // 'pickup' | 'qris'
  const [buktiBayarName, setBuktiBayarName] = useState('')
  const [buktiBayarData, setBuktiBayarData] = useState('')
  const [showQrisModal, setShowQrisModal] = useState(false)
  const [qrisCanUpload, setQrisCanUpload] = useState(false)
  const [qrisTimer, setQrisTimer] = useState(QRIS_DURATION_SECONDS)
  const qrisIntervalRef = useRef(null)

  const total = qty * PRODUK.harga
  const uang = parseInt(uangDiterima.replace(/\D/g, '')) || 0
  const kembalian = uang - total
  const totalPO = qtyPO * PRODUK.harga

  const prosesOrder = () => {
    if (!identitas.nama || !identitas.telepon || !identitas.kelas || !identitas.jurusan) return alert('Isi nama, nomor telepon, kelas, dan jurusan terlebih dahulu!')
    if (!/^[0-9]{9,13}$/.test(String(identitas.telepon).replace(/\D/g, ''))) return alert('Nomor telepon tidak valid (9-13 digit)!')
    if (qty === 0) return alert('Pilih jumlah produk!')
    if (uang < total) return alert('Uang kurang!')

    // Kirim ke backend (Supabase)
    const productId = import.meta.env.VITE_DEFAULT_PRODUCT_ID || 'PENTOL-001'
    console.log('[DEBUG] Sending order to backend with product_id:', productId)

    apiFetch('/api/orders', {
      method: 'POST',
      body: {
        customer_name: identitas.nama,
        customer_phone: identitas.telepon,
        customer_class: identitas.kelas,
        customer_major: identitas.jurusan,
        product_id: productId,
        qty,
        total_idr: total,
      },
    }).then(() => {
      const no = '#ORD' + Math.floor(Math.random() * 90000 + 10000)
      setNoStruk(no)
      setSukses(true)

      // Simpan ke localStorage juga untuk fallback riwayat lokal
      const orders = JSON.parse(localStorage.getItem('orders') || '[]')
      orders.push({ id: no, type: 'Order', ...identitas, produk: PRODUK.nama, qty, total, waktu: new Date().toLocaleTimeString('id-ID'), status: 'Selesai' })
      localStorage.setItem('orders', JSON.stringify(orders))

      // Auto-fill riwayat
      localStorage.setItem('lastCheckedPhone', identitas.telepon)
      localStorage.setItem('lastCheckedName', identitas.nama)

      window.dispatchEvent(new Event('orders-updated'))

      // Langsung beralih ke WhatsApp
      window.open(generateAdminWaLink(identitas, qty, 'Order Langsung'), '_blank')
    }).catch((err) => {
      console.error('[DEBUG] Order failed:', err)
      alert('Gagal mengirim pesanan ke database: ' + err.message)
    })
  }

  const prosesPO = () => {
    if (!identitas.nama || !identitas.telepon || !identitas.kelas || !identitas.jurusan) return alert('Isi nama, nomor telepon, kelas, dan jurusan terlebih dahulu!')
    if (!/^[0-9]{9,13}$/.test(String(identitas.telepon).replace(/\D/g, ''))) return alert('Nomor telepon tidak valid (9-13 digit)!')
    if (qtyPO === 0) return alert('Pilih jumlah produk!')

    // Kirim ke backend (Supabase)
    const productId = import.meta.env.VITE_DEFAULT_PRODUCT_ID || 'PENTOL-001'
    console.log('[DEBUG] Sending preorder to backend with product_id:', productId)

    if (poPayMethod === 'qris' && !buktiBayarData) return alert('Silakan upload bukti pembayaran QRIS terlebih dahulu!')

    apiFetch('/api/preorders', {
      method: 'POST',
      body: {
        customer_name: identitas.nama,
        customer_phone: identitas.telepon,
        customer_class: identitas.kelas,
        customer_major: identitas.jurusan,
        product_id: productId,
        qty: qtyPO,
        total_idr: totalPO,
        pay_method: poPayMethod === 'qris' ? 'qris' : 'pickup',
        proof_image_url: poPayMethod === 'qris' ? buktiBayarData : null,
      },
    }).then(() => {
      setSuksesPO(true)
      // Simpan ke localStorage untuk riwayat lokal
      const pos = JSON.parse(localStorage.getItem('preorders') || '[]')
      pos.push({
        id: '#PO' + Math.floor(Math.random() * 90000 + 10000),
        type: 'Pre-Order',
        ...identitas,
        produk: PRODUK.nama,
        qty: qtyPO,
        total: totalPO,
        waktu: new Date().toLocaleTimeString('id-ID'),
        payMethod: poPayMethod === 'qris' ? 'QRIS' : 'Bayar di Tempat',
        status: 'Menunggu Pembayaran',
      })
      localStorage.setItem('preorders', JSON.stringify(pos))

      // Auto-fill riwayat
      localStorage.setItem('lastCheckedPhone', identitas.telepon)
      localStorage.setItem('lastCheckedName', identitas.nama)

      window.dispatchEvent(new Event('preorders-updated'))

      // Langsung beralih ke WhatsApp
      window.open(generateAdminWaLink(identitas, qtyPO, 'Pre-Order'), '_blank')
    }).catch((err) => {
      console.error('[DEBUG] Preorder failed:', err)
      alert('Gagal mengirim pre-order ke database: ' + err.message)
    })
  }

  const handleUploadBukti = (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      alert('Bukti bayar harus berupa gambar!')
      return
    }

    const reader = new FileReader()
    reader.onload = () => {
      setBuktiBayarData(String(reader.result || ''))
      setBuktiBayarName(file.name)
    }
    reader.readAsDataURL(file)
  }

  const openQrisModal = () => {
    setQrisTimer(QRIS_DURATION_SECONDS)
    setShowQrisModal(true)

    let remaining = QRIS_DURATION_SECONDS
    const interval = setInterval(() => {
      remaining -= 1
      setQrisTimer(remaining)
      if (remaining <= 0) {
        clearInterval(interval)
        setShowQrisModal(false)
        setQrisCanUpload(true)
      }
    }, 1000)

    qrisIntervalRef.current = interval
  }

  const closeQrisModal = () => {
    if (qrisIntervalRef.current) {
      clearInterval(qrisIntervalRef.current)
      qrisIntervalRef.current = null
    }
    setShowQrisModal(false)
    setQrisCanUpload(true)
  }

  const reset = () => {
    setQty(0); setQtyPO(0)
    setUangDiterima('')
    setIdentitas({ nama: '', telepon: '', kelas: '', jurusan: '' })
    setSukses(false); setSuksesPO(false)
    setNoStruk('')
    setPoPayMethod('pickup')
    setBuktiBayarName('')
    setBuktiBayarData('')
    if (qrisIntervalRef.current) {
      clearInterval(qrisIntervalRef.current)
      qrisIntervalRef.current = null
    }
    setShowQrisModal(false)
    setQrisCanUpload(false)
    setQrisTimer(QRIS_DURATION_SECONDS)
  }

  const roleBadge = isAdmin ? 'A' : 'P'
  const headerLabel = isAdmin ? 'Transaksi / Admin POS' : 'Transaksi / POS'

  if (sukses) return (
    <div className={`min-h-screen bg-gray-950 text-white ${isAdmin ? 'flex' : ''}`}>
      {isAdmin && (
        <AppSidebar sidebarOpen={sidebarOpen} activePath="/transaksi" role="admin" onRequestClose={() => setSidebarOpen(false)} />
      )}
      <div className={`${isAdmin ? 'flex-1' : ''} flex flex-col h-screen overflow-hidden`}>
        <header className="bg-gray-900/50 backdrop-blur-md border-b border-gray-800 p-4 flex justify-between items-center">
          {isAdmin ? (
            <button onClick={() => setSidebarOpen(!sidebarOpen)} className="text-gray-500 hover:text-white">☰</button>
          ) : (
            <div className="text-[10px] font-black tracking-widest text-gray-500 uppercase italic">PENTOL MERCON</div>
          )}
          <div className="text-xs font-black tracking-widest text-gray-500 uppercase italic">Transaksi / Success</div>
          <div className="w-8 h-8 bg-red-600 rounded-lg flex items-center justify-center font-bold">{roleBadge}</div>
        </header>
        <div className="flex-1 flex items-center justify-center px-4 overflow-y-auto">
          <div className="bg-gray-900 border border-gray-800 rounded-3xl p-8 max-w-sm w-full text-center shadow-2xl my-8">
            <div className="text-6xl mb-4">✅</div>
            <h2 className="text-2xl font-black text-white mb-1 uppercase tracking-widest">Order Berhasil!</h2>
            <p className="text-gray-500 text-sm mb-2">No. Struk: <span className="text-red-400 font-bold">{noStruk}</span></p>
            <p className="text-gray-400 text-sm mb-1">a/n <span className="text-white font-bold">{identitas.nama}</span> — {identitas.kelas} {identitas.jurusan}</p>
            <p className="text-gray-500 text-xs mb-6">
              Telp:{' '}
              <a href={toWaHref(identitas.telepon)} target="_blank" rel="noreferrer" className="text-blue-300 hover:text-blue-200 font-black">
                {identitas.telepon}
              </a>
            </p>
            <div className="space-y-3 mb-8 text-left border-y border-gray-800 py-5">
              <div className="flex justify-between text-xs text-gray-400 uppercase tracking-widest"><span>Produk</span><span>{PRODUK.nama} x{qty}</span></div>
              <div className="flex justify-between font-black text-white"><span>Total</span><span>{fmt(total)}</span></div>
              <div className="flex justify-between text-green-400"><span>Bayar</span><span>{fmt(uang)}</span></div>
              <div className="flex justify-between text-orange-400 text-xl font-black"><span>Kembalian</span><span>{fmt(kembalian)}</span></div>
            </div>
            <a href={generateAdminWaLink(identitas, qty, 'Order Langsung')} target="_blank" rel="noreferrer" className="block w-full bg-green-600 hover:bg-green-500 text-white font-black py-4 rounded-2xl uppercase tracking-widest text-sm mb-3">
              Konfirmasi WhatsApp
            </a>
            <button onClick={reset} className="w-full bg-red-600 hover:bg-red-500 text-white font-black py-4 rounded-2xl uppercase tracking-widest text-sm transition-colors">Selesai</button>
          </div>
        </div>
      </div>
    </div>
  )

  if (suksesPO) return (
    <div className={`min-h-screen bg-gray-950 text-white ${isAdmin ? 'flex' : ''}`}>
      {isAdmin && (
        <AppSidebar sidebarOpen={sidebarOpen} activePath="/transaksi" role="admin" onRequestClose={() => setSidebarOpen(false)} />
      )}
      <div className={`${isAdmin ? 'flex-1' : ''} flex flex-col h-screen overflow-hidden`}>
        <header className="bg-gray-900/50 backdrop-blur-md border-b border-gray-800 p-4 flex justify-between items-center">
          {isAdmin ? (
            <button onClick={() => setSidebarOpen(!sidebarOpen)} className="text-gray-500 hover:text-white">☰</button>
          ) : (
            <div className="text-[10px] font-black tracking-widest text-gray-500 uppercase italic">PENTOL MERCON</div>
          )}
          <div className="text-xs font-black tracking-widest text-gray-500 uppercase italic">Transaksi / PO Success</div>
          <div className="w-8 h-8 bg-red-600 rounded-lg flex items-center justify-center font-bold">{roleBadge}</div>
        </header>
        <div className="flex-1 flex items-center justify-center px-4 overflow-y-auto">
          <div className="bg-gray-900 border border-gray-800 rounded-3xl p-8 max-w-sm w-full text-center shadow-2xl my-8">
            <div className="text-6xl mb-4">📋</div>
            <h2 className="text-2xl font-black text-white mb-1 uppercase tracking-widest">Pre-Order Diterima!</h2>
            <p className="text-gray-400 text-sm mb-1">a/n <span className="text-white font-bold">{identitas.nama}</span> — {identitas.kelas} {identitas.jurusan}</p>
            <p className="text-gray-500 text-xs mb-6">
              Telp:{' '}
              <a href={toWaHref(identitas.telepon)} target="_blank" rel="noreferrer" className="text-blue-300 hover:text-blue-200 font-black">
                {identitas.telepon}
              </a>
            </p>
            <div className="space-y-3 mb-8 text-left border-y border-gray-800 py-5">
              <div className="flex justify-between text-xs text-gray-400 uppercase tracking-widest"><span>Produk</span><span>{PRODUK.nama} x{qtyPO}</span></div>
              <div className="flex justify-between font-black text-white text-xl"><span>Total PO</span><span>{fmt(totalPO)}</span></div>
            </div>
            <p className="text-yellow-400 text-xs mb-6 font-bold">Pembayaran dilakukan saat pengambilan produk</p>
            <a href={generateAdminWaLink(identitas, qtyPO, 'Pre-Order')} target="_blank" rel="noreferrer" className="block w-full bg-green-600 hover:bg-green-500 text-white font-black py-4 rounded-2xl uppercase tracking-widest text-sm mb-3">
              Konfirmasi WhatsApp
            </a>
            <button onClick={reset} className="w-full bg-red-600 hover:bg-red-500 text-white font-black py-4 rounded-2xl uppercase tracking-widest text-sm transition-colors">Selesai</button>
          </div>
        </div>
      </div>
    </div>
  )

  return (
    <div className={`min-h-screen bg-gray-950 text-white ${isAdmin ? 'flex' : ''}`}>
      {isAdmin && (
        <AppSidebar sidebarOpen={sidebarOpen} activePath="/transaksi" role="admin" onRequestClose={() => setSidebarOpen(false)} />
      )}
      <main className={`${isAdmin ? 'flex-1' : ''} flex flex-col h-screen overflow-hidden`}>
        <header className="bg-gray-900/50 backdrop-blur-md border-b border-gray-800 p-4 flex justify-between items-center">
          {isAdmin ? (
            <button onClick={() => setSidebarOpen(!sidebarOpen)} className="text-gray-500 hover:text-white">☰</button>
          ) : (
            <div className="flex items-center gap-3">
              <a href="/" className="text-gray-500 hover:text-white text-sm font-bold">← Beranda</a>
              <a href="/riwayat" className="text-gray-500 hover:text-white text-sm font-bold">Riwayat</a>
            </div>
          )}
          <div className="text-xs font-black tracking-widest text-gray-500 uppercase italic">{headerLabel}</div>
          <div className="w-8 h-8 bg-red-600 rounded-lg flex items-center justify-center font-bold">{roleBadge}</div>
        </header>

        <div className="flex-1 flex overflow-hidden">
          {/* PANEL KIRI: GAMBAR PRODUK */}
          <div className="hidden lg:flex flex-1 p-8 items-start justify-center overflow-y-auto">
            <div className="bg-gray-900 border border-gray-800 rounded-3xl p-8 max-w-xs w-full shadow-2xl">
              <img src={PRODUK.image} alt={PRODUK.nama} className="w-full h-56 object-contain mb-5" />
              <h3 className="font-black text-white text-xl text-center uppercase tracking-wider">{PRODUK.nama}</h3>
              <p className="text-red-500 font-black text-3xl text-center mt-1">{fmt(PRODUK.harga)}</p>
              <p className="text-gray-600 text-[10px] font-bold text-center mt-2 uppercase tracking-widest">per porsi</p>
            </div>
          </div>

          {/* PANEL KANAN: ORDER / PRE-ORDER */}
          <div className="w-full lg:w-96 xl:w-[28rem] bg-gray-900 border-l border-gray-800 flex flex-col h-full overflow-hidden">
            {/* Tab Switch */}
            <div className="flex border-b border-gray-800">
              {['order', 'preorder'].map(t => (
                <button key={t} onClick={() => setTab(t)}
                  className={`flex-1 py-4 text-xs font-black uppercase tracking-[0.2em] transition-all ${tab === t ? 'bg-red-600 text-white' : 'text-gray-500 hover:text-gray-300'}`}>
                  {t === 'order' ? 'Order' : 'Pre-Order'}
                </button>
              ))}
            </div>

            <div className="flex-1 overflow-y-auto p-6 scrollbar-hide">
              {/* Gambar Mobile */}
              <div className="lg:hidden bg-gray-800/50 rounded-2xl p-4 mb-6 flex items-center gap-4 border border-gray-700">
                <img src={PRODUK.image} alt={PRODUK.nama} className="w-16 h-16 object-contain" />
                <div>
                  <p className="font-black text-sm">{PRODUK.nama}</p>
                  <p className="text-red-500 font-black">{fmt(PRODUK.harga)}</p>
                </div>
              </div>

              {renderInputIdentitas(identitas, setIdentitas)}

              {/* ORDER TAB */}
              {tab === 'order' && (
                <div className="space-y-5 pb-8">
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-500 mb-3">Jumlah Pesanan</p>
                    <div className="flex items-center justify-between bg-gray-800 rounded-2xl p-4 border border-gray-700">
                      <button onClick={() => setQty(q => Math.max(0, q - 1))} className="w-10 h-10 bg-gray-700 hover:bg-red-600 rounded-xl font-black text-xl transition-all">−</button>
                      <div className="text-center">
                        <span className="font-black text-3xl">{qty}</span>
                        <p className="text-[10px] text-gray-500 uppercase tracking-widest mt-1">porsi</p>
                      </div>
                      <button onClick={() => setQty(q => q + 1)} className="w-10 h-10 bg-gray-700 hover:bg-green-600 rounded-xl font-black text-xl transition-all">+</button>
                    </div>
                  </div>

                  <div className="flex justify-between font-black text-xl text-red-500 bg-red-500/5 p-4 rounded-2xl border border-red-500/10">
                    <span className="text-[10px] text-gray-500 uppercase tracking-widest self-center">Total</span>
                    <span>{fmt(total)}</span>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <label className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em]">Uang Diterima</label>
                      <button className="text-[9px] uppercase tracking-widest text-red-400 hover:underline font-bold" onClick={() => setUangDiterima(total.toString())}>Uang Pas</button>
                    </div>
                    <input type="number" placeholder="Rp 0" value={uangDiterima} onChange={e => setUangDiterima(e.target.value)}
                      className="w-full bg-gray-800 border-2 border-gray-700 rounded-2xl px-5 py-4 outline-none text-white font-black text-2xl focus:border-red-600 transition-all placeholder:text-gray-700" />
                  </div>

                  {uangDiterima && (
                    <div className={`p-4 rounded-2xl border flex justify-between items-center ${kembalian >= 0 ? 'bg-green-500/5 border-green-500/20' : 'bg-red-500/10 border-red-500/20'}`}>
                      <span className="text-[10px] uppercase font-black tracking-widest text-gray-500">Kembalian</span>
                      <span className={`text-xl font-black ${kembalian >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                        {kembalian >= 0 ? fmt(kembalian) : '- ' + fmt(Math.abs(kembalian))}
                      </span>
                    </div>
                  )}

                  <button onClick={prosesOrder} disabled={qty === 0 || kembalian < 0 || !uangDiterima}
                    className="w-full bg-red-600 hover:bg-red-500 disabled:bg-gray-800 disabled:text-gray-600 py-5 rounded-2xl font-black transition-all uppercase tracking-[0.3em] text-sm shadow-xl shadow-red-900/20">
                    Pesan Sekarang
                  </button>
                </div>
              )}

              {/* PRE-ORDER TAB */}
              {tab === 'preorder' && (
                <div className="space-y-5 pb-8">
                  <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-2xl p-4">
                    <p className="text-yellow-400 text-xs font-bold uppercase tracking-wider">Pre-Order</p>
                    <p className="text-yellow-300/70 text-[11px] mt-1 leading-relaxed">
                      Pilih metode pembayaran: bayar saat ambil (butuh validasi admin) atau bayar QRIS (otomatis siap diambil).
                    </p>
                  </div>

                  <div className="bg-gray-800/40 border border-gray-700 rounded-2xl p-4">
                    <p className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-500 mb-3">Metode Pembayaran</p>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setPoPayMethod('pickup')
                          setQrisCanUpload(false)
                          setShowQrisModal(false)
                        }}
                        className={`px-4 py-3 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] border transition-all ${poPayMethod === 'pickup' ? 'bg-gray-900 border-yellow-500/30 text-yellow-300' : 'border-gray-700 text-gray-400 hover:bg-gray-800'}`}
                      >
                        Bayar Saat Ambil
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setPoPayMethod('qris')
                          setQrisCanUpload(false)
                        }}
                        className={`px-4 py-3 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] border transition-all ${poPayMethod === 'qris' ? 'bg-gray-900 border-blue-500/30 text-blue-300' : 'border-gray-700 text-gray-400 hover:bg-gray-800'}`}
                      >
                        QRIS
                      </button>
                    </div>
                    <p className="mt-3 text-[11px] text-gray-400">
                      {poPayMethod === 'pickup'
                        ? 'Status akan “Menunggu Pembayaran” sampai admin memvalidasi.'
                        : 'Buka QRIS dulu (maks 5 menit), lalu kirim bukti bayar untuk divalidasi admin.'}
                    </p>
                  </div>

                  {poPayMethod === 'qris' && (
                    <div className="bg-blue-500/10 border border-blue-500/20 rounded-2xl p-4 space-y-3">
                      <p className="text-[10px] font-black uppercase tracking-[0.3em] text-blue-300">Bukti Bayar QRIS</p>
                      {!qrisCanUpload && (
                        <button
                          type="button"
                          onClick={openQrisModal}
                          className="w-full px-4 py-3 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-black uppercase tracking-[0.2em] transition-all"
                        >
                          Tampilkan QRIS
                        </button>
                      )}
                      <div className="bg-gray-900 border border-gray-700 rounded-2xl p-4">
                        <label className="block text-[10px] text-gray-400 font-black uppercase tracking-widest mb-2">Upload Bukti (Gambar)</label>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleUploadBukti}
                          disabled={!qrisCanUpload}
                          className="w-full text-xs text-gray-300 file:mr-3 file:px-3 file:py-2 file:rounded-xl file:border-0 file:bg-blue-600 file:text-white file:font-black file:text-[10px]"
                        />
                        {buktiBayarName && (
                          <p className="mt-2 text-[11px] text-blue-200">File: {buktiBayarName}</p>
                        )}
                        {!qrisCanUpload && (
                          <p className="mt-2 text-[11px] text-yellow-300">Tutup popup QRIS dulu untuk mengaktifkan kirim bukti.</p>
                        )}
                      </div>
                    </div>
                  )}

                  <div>
                    <p className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-500 mb-3">Jumlah Pre-Order</p>
                    <div className="flex items-center justify-between bg-gray-800 rounded-2xl p-4 border border-gray-700">
                      <button onClick={() => setQtyPO(q => Math.max(0, q - 1))} className="w-10 h-10 bg-gray-700 hover:bg-red-600 rounded-xl font-black text-xl transition-all">−</button>
                      <div className="text-center">
                        <span className="font-black text-3xl">{qtyPO}</span>
                        <p className="text-[10px] text-gray-500 uppercase tracking-widest mt-1">porsi</p>
                      </div>
                      <button onClick={() => setQtyPO(q => q + 1)} className="w-10 h-10 bg-gray-700 hover:bg-green-600 rounded-xl font-black text-xl transition-all">+</button>
                    </div>
                  </div>

                  <div className="flex justify-between font-black text-xl text-yellow-400 bg-yellow-500/5 p-4 rounded-2xl border border-yellow-500/10">
                    <span className="text-[10px] text-gray-500 uppercase tracking-widest self-center">Total PO</span>
                    <span>{fmt(totalPO)}</span>
                  </div>

                  <button onClick={prosesPO} disabled={qtyPO === 0}
                    className="w-full bg-yellow-500 hover:bg-yellow-400 disabled:bg-gray-800 disabled:text-gray-600 text-gray-950 py-5 rounded-2xl font-black transition-all uppercase tracking-[0.3em] text-sm shadow-xl shadow-yellow-900/20">
                    {poPayMethod === 'qris' ? 'Kirim Bukti Pembayaran' : 'Konfirmasi Pre-Order'}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
      {showQrisModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-gray-900 border border-gray-700 rounded-3xl p-6">
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm font-black uppercase tracking-[0.2em] text-blue-300">QRIS Pembayaran</p>
              <button onClick={closeQrisModal} className="text-gray-400 hover:text-white text-xl font-black">×</button>
            </div>
            <div className="bg-white rounded-2xl p-4 flex flex-col items-center justify-center">
              <img src={QrisImg} alt="QRIS" className="w-56 h-56 object-contain" />
              <a href={QrisImg} download="qris.jpeg" className="mt-6 w-full text-center px-4 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-black uppercase tracking-widest transition-all shadow-lg shadow-blue-500/30">
                Download QRIS
              </a>
            </div>
            <p className="mt-4 text-xs text-gray-400">
              Silakan scan QRIS. Popup ini otomatis tertutup dalam <span className="text-blue-300 font-black">{Math.floor(qrisTimer / 60)}:{String(qrisTimer % 60).padStart(2, '0')}</span> atau klik X.
            </p>
          </div>
        </div>
      )}
    </div>
  )
}

export default TransaksiPage
// pembuat muhammad afriza dwi isnandarsyah
//github afrizadwi21
