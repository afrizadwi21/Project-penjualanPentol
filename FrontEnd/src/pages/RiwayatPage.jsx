import { useEffect, useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { apiFetch } from '../lib/api'

const fmt = (n) =>
  new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(n)

// Mapping status dari database ke teks Indonesia
const preorderStatusMap = {
  'waiting_payment': 'Menunggu Pembayaran',
  'ready_pickup': 'Siap Diambil',
  'paid': 'Selesai',
}

// Mapping status ke warna CSS
const preorderStatusClass = {
  'waiting_payment': 'bg-yellow-500/15 text-yellow-400 border-yellow-500/20',
  'ready_pickup': 'bg-blue-500/15 text-blue-400 border-blue-500/20',
  'paid': 'bg-green-500/15 text-green-400 border-green-500/20',
}

const isPaidPO = (po) => po.payment_status === 'paid' || po.status === 'paid' || po.status === 'ready_pickup'

const toWaHref = (value) => {
  const digits = String(value || '').replace(/\D/g, '')
  if (!digits) return '#'
  const normalized = digits.startsWith('0') ? `62${digits.slice(1)}` : digits
  return `https://wa.me/${normalized}`
}

const RiwayatPage = () => {
  const [orders, setOrders] = useState([])
  const [preorders, setPreorders] = useState([])
  const [loading, setLoading] = useState(false)
  const [phone, setPhone] = useState(() => localStorage.getItem('lastCheckedPhone') || '')
  const [name, setName] = useState(() => localStorage.getItem('lastCheckedName') || '')
  const [searchParams, setSearchParams] = useSearchParams()

  const tab = ['order', 'preorder'].includes(searchParams.get('tab')) ? searchParams.get('tab') : 'order'
  const poFilter = ['belum', 'sudah'].includes(searchParams.get('po')) ? searchParams.get('po') : 'belum'

  const loadHistory = async (targetPhone, targetName) => {
    if (!targetPhone && !targetName) return
    setLoading(true)
    try {
      const q = targetPhone ? `phone=${targetPhone}` : `name=${targetName}`
      const res = await apiFetch(`/api/check-history?${q}`)
      if (res.ok) {
        const hasOrders = res.data.orders?.length > 0
        const hasPreorders = res.data.preorders?.length > 0
        
        if (!hasOrders && !hasPreorders) {
          alert('Maaf, Nama atau Nomor Telepon tidak terdaftar dalam riwayat pesanan kami.')
          setOrders([])
          setPreorders([])
        } else {
          setOrders(res.data.orders || [])
          setPreorders(res.data.preorders || [])
          if (targetPhone) localStorage.setItem('lastCheckedPhone', targetPhone)
          if (targetName) localStorage.setItem('lastCheckedName', targetName)
        }
      }
    } catch (e) {
      console.error('Gagal memuat riwayat:', e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (phone) loadHistory(phone, null)
    else if (name) loadHistory(null, name)
  }, [])

  const summary = useMemo(() => {
    const poSudah = preorders.filter(isPaidPO).length
    const poBelum = preorders.length - poSudah
    const totalOrder = orders.reduce((s, o) => s + (o.total_idr || 0), 0)
    const totalPO = preorders.reduce((s, p) => s + (p.total_idr || 0), 0)
    return { poSudah, poBelum, totalOrder, totalPO }
  }, [orders, preorders])

  const dataOrder = useMemo(() => orders, [orders])
  const dataPO = useMemo(() => {
    return poFilter === 'sudah' ? preorders.filter(isPaidPO) : preorders.filter(p => !isPaidPO(p))
  }, [preorders, poFilter])

  const card = (item, variant) => (
    <div key={item.id} className="bg-gray-900 border border-gray-800 rounded-3xl p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.25em] text-gray-500">{variant === 'preorder' ? 'Pre-Order' : 'Order'}</p>
          <h3 className="text-lg font-black text-white mt-2">{item.customer_name}</h3>
          <p className="text-xs uppercase tracking-widest text-gray-500 mt-1">{item.customer_class} / {item.customer_major}</p>
          <p className="text-[10px] text-red-400 font-bold mt-1 uppercase tracking-widest">{item.order_code || item.po_code}</p>
        </div>
        <span
          className={[
            'px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-[0.2em] border transition-colors',
            variant === 'preorder'
              ? (preorderStatusClass[item.status] || preorderStatusClass['waiting_payment'])
              : 'bg-red-500/15 text-red-400 border-red-500/20',
          ].join(' ')}
        >
          {variant === 'preorder' ? (preorderStatusMap[item.status] || 'Menunggu Pembayaran') : 'Selesai'}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-4 mt-5 text-sm">
        <div className="bg-gray-800/60 rounded-2xl p-4">
          <p className="text-[10px] font-black uppercase tracking-widest text-gray-500">Produk ID</p>
          <p className="text-white font-bold mt-2">{item.product_id}</p>
        </div>
        <div className="bg-gray-800/60 rounded-2xl p-4">
          <p className="text-[10px] font-black uppercase tracking-widest text-gray-500">Jumlah</p>
          <p className="text-white font-bold mt-2">{item.qty} porsi</p>
        </div>
      </div>

      <div className="mt-5 flex items-center justify-between border-t border-gray-800 pt-4">
        <div>
          <p className="text-[10px] font-black uppercase tracking-widest text-gray-500">Waktu</p>
          <p className="text-gray-300 text-sm mt-1">{new Date(item.ordered_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}</p>
        </div>
        <div className="text-right">
          <p className="text-[10px] font-black uppercase tracking-widest text-gray-500">Total</p>
          <p className={`font-black text-lg mt-1 ${variant === 'preorder' ? 'text-yellow-400' : 'text-red-400'}`}>{fmt(item.total_idr || 0)}</p>
        </div>
      </div>

      {item.admin_note && (
        <div className="mt-4 rounded-2xl border border-blue-500/20 bg-blue-500/10 p-4">
          <p className="text-[10px] font-black uppercase tracking-widest text-blue-300">Pesan Admin</p>
          <p className="mt-2 text-sm text-blue-100 font-medium italic">"{item.admin_note}"</p>
        </div>
      )}
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-500">Pelanggan</p>
            <h1 className="text-2xl md:text-3xl font-black text-white mt-2">Cek Riwayat Pesanan</h1>
            <p className="text-gray-500 text-sm mt-1">Status pesanan Anda tersinkron otomatis dengan Admin.</p>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/" className="text-gray-500 hover:text-gray-300 text-sm">Beranda</Link>
            <Link to="/transaksi" className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white text-sm font-black">Order</Link>
          </div>
        </div>

        {/* Form Pencarian */}
        <div className="mt-8 bg-gray-900 border border-gray-800 rounded-3xl p-6 flex flex-col md:flex-row gap-4 items-end">
          <div className="flex-1 w-full">
            <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest block mb-2">Nomor Telepon</label>
            <input 
              type="text" 
              placeholder="Contoh: 08123..."
              value={phone}
              onChange={(e) => {
                setPhone(e.target.value)
                setName('') // Reset name if typing phone
              }}
              className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white outline-none focus:border-red-600 transition-all"
            />
          </div>
          <div className="flex-1 w-full">
            <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest block mb-2">Atau Nama Pelanggan</label>
            <input 
              type="text" 
              placeholder="Cari berdasarkan nama..."
              value={name}
              onChange={(e) => {
                setName(e.target.value)
                setPhone('') // Reset phone if typing name
              }}
              className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white outline-none focus:border-red-600 transition-all"
            />
          </div>
          <button 
            onClick={() => loadHistory(phone, name)}
            disabled={loading}
            className="bg-white text-black font-black px-8 py-3 rounded-xl uppercase tracking-widest text-xs hover:bg-gray-200 transition-all disabled:opacity-50"
          >
            {loading ? 'Mencari...' : 'Refresh Riwayat'}
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-8">
          <div className="bg-gray-900 border border-gray-800 rounded-3xl p-5">
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500">Total Order</p>
            <h2 className="text-3xl font-black text-white mt-2">{orders.length}</h2>
            <p className="text-sm text-gray-400 mt-2">{fmt(summary.totalOrder)}</p>
          </div>
          <div className="bg-gray-900 border border-gray-800 rounded-3xl p-5">
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500">Total Pre-Order</p>
            <h2 className="text-3xl font-black text-yellow-400 mt-2">{preorders.length}</h2>
            <p className="text-sm text-gray-400 mt-2">{fmt(summary.totalPO)}</p>
          </div>
          <div className="bg-gray-900 border border-gray-800 rounded-3xl p-5">
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500">PO Belum Diterima</p>
            <h2 className="text-3xl font-black text-yellow-400 mt-2">{summary.poBelum}</h2>
            <p className="text-sm text-gray-400 mt-2">Menunggu pembayaran / validasi</p>
          </div>
          <div className="bg-gray-900 border border-gray-800 rounded-3xl p-5">
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500">PO Sudah Diterima</p>
            <h2 className="text-3xl font-black text-blue-400 mt-2">{summary.poSudah}</h2>
            <p className="text-sm text-gray-400 mt-2">Sudah dibayar / siap diambil</p>
          </div>
        </div>

        <div className="mt-8 flex flex-col gap-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="bg-gray-900 border border-gray-800 rounded-3xl p-2 inline-flex">
              <button
                onClick={() => setSearchParams({ tab: 'order' })}
                className={`px-5 py-3 rounded-2xl text-xs font-black uppercase tracking-[0.2em] transition-all ${tab === 'order' ? 'bg-red-600 text-white' : 'text-gray-500 hover:text-gray-300'}`}
              >
                Order
              </button>
              <button
                onClick={() => setSearchParams({ tab: 'preorder', po: poFilter })}
                className={`px-5 py-3 rounded-2xl text-xs font-black uppercase tracking-[0.2em] transition-all ${tab === 'preorder' ? 'bg-yellow-500 text-gray-950' : 'text-gray-500 hover:text-gray-300'}`}
              >
                Pre-Order
              </button>
            </div>

            {tab === 'preorder' && (
              <div className="bg-gray-900 border border-gray-800 rounded-3xl p-2 inline-flex">
                <button
                  onClick={() => setSearchParams({ tab: 'preorder', po: 'belum' })}
                  className={`px-5 py-3 rounded-2xl text-xs font-black uppercase tracking-[0.2em] transition-all ${poFilter === 'belum' ? 'bg-yellow-500 text-gray-950' : 'text-gray-500 hover:text-gray-300'}`}
                >
                  Belum diterima
                </button>
                <button
                  onClick={() => setSearchParams({ tab: 'preorder', po: 'sudah' })}
                  className={`px-5 py-3 rounded-2xl text-xs font-black uppercase tracking-[0.2em] transition-all ${poFilter === 'sudah' ? 'bg-blue-500 text-gray-950' : 'text-gray-500 hover:text-gray-300'}`}
                >
                  Sudah diterima
                </button>
              </div>
            )}
          </div>

          {tab === 'order' ? (
            dataOrder.length === 0 ? (
              <div className="bg-gray-900 border border-dashed border-gray-800 rounded-3xl p-10 text-center">
                <p className="text-sm font-black uppercase tracking-[0.3em] text-gray-500">Masukkan nomor telepon untuk melihat order</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
                {dataOrder.map((o) => card(o, 'order'))}
              </div>
            )
          ) : dataPO.length === 0 ? (
            <div className="bg-gray-900 border border-dashed border-gray-800 rounded-3xl p-10 text-center">
              <p className="text-sm font-black uppercase tracking-[0.3em] text-gray-500">
                {preorders.length === 0 ? 'Masukkan nomor telepon untuk melihat preorder' : 'Tidak ada data di kategori ini'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
              {dataPO.map((p) => card(p, 'preorder'))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default RiwayatPage
