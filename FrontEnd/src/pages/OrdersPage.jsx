import { useState, useEffect } from 'react'
import AppSidebar from '../components/AppSidebar'
import { adminFetch } from '../lib/api'

const fmt = (n) =>
  new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(n)

const toWaHref = (value) => {
  const digits = String(value || '').replace(/\D/g, '')
  if (!digits) return '#'
  const normalized = digits.startsWith('0') ? `62${digits.slice(1)}` : digits
  return `https://wa.me/${normalized}`
}

const OrdersPage = () => {
    const [sidebarOpen, setSidebarOpen] = useState(() => (typeof window !== 'undefined' ? window.innerWidth >= 1024 : true))
    const [orders, setOrders] = useState([])
    const [loading, setLoading] = useState(false)
    const [searchTerm, setSearchTerm] = useState('')

    const loadOrders = async () => {
        setLoading(true)
        try {
            const res = await adminFetch('/api/admin/orders')
            setOrders(res?.data || [])
        } catch (e) {
            console.error('Fetch error:', e)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        loadOrders()
    }, [])

    const filteredOrders = orders.filter(o => 
        o.customer_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        o.customer_phone?.includes(searchTerm) ||
        o.order_code?.toLowerCase().includes(searchTerm.toLowerCase())
    )

    return (
        <div className="min-h-screen bg-gray-950 text-white flex">
            <AppSidebar sidebarOpen={sidebarOpen} activePath="/admin/orders" role="admin" onRequestClose={() => setSidebarOpen(false)} />

            <main className="flex-1 flex flex-col h-screen overflow-hidden">
                <header className="bg-gray-900/50 backdrop-blur-md border-b border-gray-800 p-4 flex justify-between items-center">
                    <button onClick={() => setSidebarOpen(!sidebarOpen)} className="text-gray-500 hover:text-white">☰</button>
                    <div className="text-xs font-black tracking-widest text-gray-500 uppercase italic">Admin Dashboard / Data Order</div>
                    <div className="w-8 h-8 bg-red-600 rounded-lg flex items-center justify-center font-bold">A</div>
                </header>

                <div className="flex-1 overflow-y-auto p-6 space-y-6">
                    <div className="bg-gray-900 border border-gray-800 p-6 rounded-3xl">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                            <div>
                                <h1 className="text-2xl font-black text-white italic uppercase tracking-tighter">Data Order</h1>
                                <p className="text-[10px] text-gray-500 font-bold mt-1 uppercase tracking-widest">{filteredOrders.length} Transaksi Langsung</p>
                            </div>

                            <div className="w-full md:w-80">
                                <input 
                                    type="text" 
                                    placeholder="Cari Nama / No HP / Kode..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full bg-gray-800 border border-gray-700 rounded-2xl px-5 py-3 text-sm text-white outline-none focus:border-red-600 transition-all placeholder:text-gray-600"
                                />
                            </div>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="border-b border-gray-800">
                                    <tr className="text-[10px] font-black text-gray-500 tracking-[0.2em] uppercase">
                                        <th className="py-4 px-2">KODE ORDER</th>
                                        <th className="py-4 px-2">PELANGGAN</th>
                                        <th className="py-4 px-2">NOMOR HP</th>
                                        <th className="py-4 px-2">PRODUK</th>
                                        <th className="py-4 px-2">WAKTU</th>
                                        <th className="py-4 px-2 text-right">TOTAL</th>
                                    </tr>
                                </thead>
                                <tbody className="text-xs text-gray-300">
                                    {loading ? (
                                        <tr>
                                            <td colSpan="6" className="py-20 text-center opacity-30 italic font-bold">Memuat data...</td>
                                        </tr>
                                    ) : filteredOrders.length === 0 ? (
                                        <tr>
                                            <td colSpan="6" className="py-20 text-center opacity-30 italic font-bold">Tidak ada data order</td>
                                        </tr>
                                    ) : (
                                        [...filteredOrders].reverse().map((o) => (
                                            <tr key={o.id} className="border-b border-gray-800/50 hover:bg-gray-800/30 transition-colors group">
                                                <td className="py-4 px-2 font-black text-red-500 text-[10px] whitespace-nowrap">{o.order_code}</td>
                                                <td className="py-4 px-2">
                                                    <p className="font-bold uppercase text-white">{o.customer_name}</p>
                                                    <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mt-0.5">{o.customer_class} / {o.customer_major}</p>
                                                </td>
                                                <td className="py-4 px-2">
                                                    <a href={toWaHref(o.customer_phone)} target="_blank" rel="noreferrer" className="text-green-500 font-bold hover:underline">
                                                        {o.customer_phone}
                                                    </a>
                                                </td>
                                                <td className="py-4 px-2 text-gray-500 whitespace-nowrap">
                                                    <span className="text-white font-bold">{o.product_id}</span> ({o.qty} porsi)
                                                </td>
                                                <td className="py-4 px-2 text-gray-500 uppercase tracking-tighter text-[10px]">
                                                    {new Date(o.ordered_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                                                </td>
                                                <td className="py-4 px-2 font-black text-right text-white text-sm">{fmt(o.total_idr || 0)}</td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    )
}

export default OrdersPage
