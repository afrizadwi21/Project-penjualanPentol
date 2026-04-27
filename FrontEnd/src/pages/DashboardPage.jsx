import { useState, useEffect } from 'react'
import { Bar } from 'react-chartjs-2'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  PointElement,
} from 'chart.js'
import AppSidebar from '../components/AppSidebar'
import { adminFetch } from '../lib/api'

const preorderStatusClass = {
  'waiting_payment': 'bg-yellow-500/15 text-yellow-400 border-yellow-500/20',
  'ready_pickup': 'bg-blue-500/15 text-blue-400 border-blue-500/20',
  'paid': 'bg-green-500/15 text-green-400 border-green-500/20',
}

const poStatusLabel = (po) => {
  if (po?.status === 'ready_pickup') return 'Siap Diambil'
  if (po?.status === 'paid') return 'Selesai'
  return 'Menunggu Pembayaran'
}

const poNote = (po) => po?.admin_note || 'Menunggu validasi pembayaran admin.'

const toWaHref = (value) => {
  const digits = String(value || '').replace(/\D/g, '')
  if (!digits) return '#'
  const normalized = digits.startsWith('0') ? `62${digits.slice(1)}` : digits
  return `https://wa.me/${normalized}`
}

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  PointElement,
)

const DashboardPage = () => {
    const [sidebarOpen, setSidebarOpen] = useState(() => (typeof window !== 'undefined' ? window.innerWidth >= 1024 : true))
    const [preorders, setPreorders] = useState([])
    const [orders, setOrders] = useState([])
    const [salesDaily, setSalesDaily] = useState([])
    const [loadError, setLoadError] = useState('')
    const [searchTerm, setSearchTerm] = useState('')
    const [filterStatus, setFilterStatus] = useState('all') // all, waiting_payment, ready_pickup, paid

    const loadData = async () => {
        try {
            const [o, p, s] = await Promise.all([
                adminFetch('/api/admin/orders'),
                adminFetch('/api/admin/preorders'),
                adminFetch('/api/admin/sales/daily'),
            ])
            setOrders(o?.data || [])
            setPreorders(p?.data || [])
            setSalesDaily(s?.data || [])
            setLoadError('')
        } catch (e) {
            console.error('Fetch error:', e)
            setLoadError(e.message)
        }
    }

    useEffect(() => {
        loadData()
        const interval = setInterval(loadData, 5000)
        return () => clearInterval(interval)
    }, [])

    const updatePreorderStatus = async (po, newStatus) => {
        if (!po.id) {
            alert('Error: ID pesanan tidak ditemukan di browser. Coba tekan Ctrl+F5.')
            return
        }

        try {
            console.log('[DEBUG] Updating PO ID:', po.id, 'to', newStatus)
            await adminFetch(`/api/admin/preorders/${po.id}`, {
                method: 'PATCH',
                body: { status: newStatus },
            })
            loadData() // Refresh data setelah update
            alert('Status pesanan berhasil diupdate!')
        } catch (e) {
            console.error('[DEBUG] Update error:', e)
            alert(`Gagal update status: ${e.message}. Pastikan login admin masih aktif.`)
        }
    }

    const totalOrderIncome = orders.reduce((s, o) => s + (o.total_idr || 0), 0)
    const totalPreorderIncome = preorders.filter(p => p.status === 'ready_pickup' || p.status === 'paid').reduce((s, p) => s + (p.total_idr || 0), 0)
    const totalCombinedIncome = totalOrderIncome + totalPreorderIncome
    const totalPOValue = preorders.reduce((s, p) => s + (p.total_idr || 0), 0)

    const chartData = {
        labels: salesDaily.length ? salesDaily.map((x) => String(x.day)) : ['-'],
        datasets: [
            {
                label: 'Penjualan',
                data: salesDaily.length ? salesDaily.map((x) => Number(x.revenue_idr || 0)) : [0],
                backgroundColor: 'rgba(220, 38, 38, 0.8)',
                borderColor: '#dc2626',
                borderWidth: 1,
            }
        ]
    }

    const filteredPreorders = preorders.filter(po => {
        const matchesSearch = 
            po.customer_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            po.customer_phone?.includes(searchTerm) ||
            po.po_code?.toLowerCase().includes(searchTerm.toLowerCase())
        
        const matchesStatus = filterStatus === 'all' || po.status === filterStatus
        return matchesSearch && matchesStatus
    })

    const countByStatus = (status) => preorders.filter(p => p.status === status).length

    return (
        <div className="min-h-screen bg-gray-950 text-white flex">
            <AppSidebar sidebarOpen={sidebarOpen} activePath="/dashboard" role="admin" onRequestClose={() => setSidebarOpen(false)} />

            <main className="flex-1 flex flex-col h-screen overflow-hidden">
                <header className="bg-gray-900/50 backdrop-blur-md border-b border-gray-800 p-4 flex justify-between items-center">
                    <button onClick={() => setSidebarOpen(!sidebarOpen)} className="text-gray-500 hover:text-white">☰</button>
                    <div className="text-xs font-black tracking-widest text-gray-500 uppercase italic">Admin Dashboard / Overview</div>
                    <div className="w-8 h-8 bg-red-600 rounded-lg flex items-center justify-center font-bold">A</div>
                </header>

                <div className="flex-1 overflow-y-auto p-6 space-y-6">
                    {loadError && (
                        <div className="bg-red-900/30 border border-red-700/50 text-red-200 rounded-2xl p-4 text-sm font-bold">{loadError}</div>
                    )}
                    
                    {/* STATS */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="bg-gray-900 border border-gray-800 p-6 rounded-3xl">
                            <p className="text-[10px] font-black text-gray-500 tracking-[0.2em] uppercase mb-1">Total Pendapatan (Gabungan)</p>
                            <h3 className="text-3xl font-black text-white italic">Rp {totalCombinedIncome.toLocaleString('id-ID')}</h3>
                        </div>
                        <div className="bg-gray-900 border border-gray-800 p-6 rounded-3xl">
                            <p className="text-[10px] font-black text-gray-500 tracking-[0.2em] uppercase mb-1">Total PO Masuk</p>
                            <h3 className="text-3xl font-black text-yellow-500 italic">Rp {totalPOValue.toLocaleString('id-ID')}</h3>
                        </div>
                        <div className="bg-gray-900 border border-gray-800 p-6 rounded-3xl">
                            <p className="text-[10px] font-black text-gray-500 tracking-[0.2em] uppercase mb-1">Jumlah Transaksi</p>
                            <h3 className="text-3xl font-black text-white italic">{orders.length + preorders.length}</h3>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                        <div className="bg-gray-900 border border-gray-800 p-6 rounded-3xl">
                            <h4 className="text-xs font-black tracking-widest mb-6 uppercase">Statistik Mingguan</h4>
                            <div className="h-64"><Bar data={chartData} options={{ maintainAspectRatio: false }} /></div>
                        </div>

                        <div id="preorder" className="bg-gray-900 border border-gray-800 p-6 rounded-3xl">
                            <h4 className="text-xs font-black tracking-widest mb-6 uppercase">Daftar Pre-Order Terbaru</h4>
                            <div className="space-y-4 max-h-64 overflow-y-auto pr-2 custom-scrollbar">
                                {preorders.length === 0 ? (
                                    <div className="text-center py-10 opacity-20 text-[10px] font-black uppercase tracking-widest">Belum ada PO masuk</div>
                                ) : (
                                    [...preorders].reverse().map((po) => (
                                        <div key={po.id || Math.random()} className="flex justify-between items-center bg-gray-800/50 p-4 rounded-2xl border border-white/5">
                                            <div>
                                                <p className="text-xs font-black uppercase tracking-wider text-red-400">{po.po_code}</p>
                                                <p className="text-sm font-black uppercase mt-1">{po.customer_name}</p>
                                                <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">{po.customer_phone} | {po.customer_class} - {po.customer_major}</p>
                                                <p className="text-[10px] text-blue-300 mt-2 italic">"{poNote(po)}"</p>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-sm font-black text-yellow-500">Rp {(po.total_idr || 0).toLocaleString('id-ID')}</p>
                                                <span className={`inline-flex mt-2 px-3 py-1 rounded-full border text-[10px] font-black uppercase tracking-[0.2em] ${preorderStatusClass[po.status] || preorderStatusClass['waiting_payment']}`}>
                                                    {poStatusLabel(po)}
                                                </span>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    </div>

                    {/* MANAGE PREORDERS TABLE */}
                    <div className="bg-gray-900 border border-gray-800 p-6 rounded-3xl">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                            <div>
                                <h4 className="text-xs font-black tracking-widest uppercase">Kelola Pre-Order Admin</h4>
                                <p className="text-[10px] text-gray-500 font-bold mt-1 uppercase tracking-widest">{filteredPreorders.length} Data ditemukan</p>
                            </div>
                            
                            <div className="flex flex-wrap gap-3">
                                <input 
                                    type="text" 
                                    placeholder="Cari Nama / No HP / Kode..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="bg-gray-800 border border-gray-700 rounded-xl px-4 py-2 text-xs text-white outline-none focus:border-red-600 transition-all w-full md:w-64"
                                />
                                <select 
                                    value={filterStatus}
                                    onChange={(e) => setFilterStatus(e.target.value)}
                                    className="bg-gray-800 border border-gray-700 rounded-xl px-4 py-2 text-xs text-white outline-none focus:border-red-600 transition-all"
                                >
                                    <option value="all">Semua Status ({preorders.length})</option>
                                    <option value="waiting_payment">Menunggu ({countByStatus('waiting_payment')})</option>
                                    <option value="ready_pickup">Siap Diambil ({countByStatus('ready_pickup')})</option>
                                    <option value="paid">Selesai ({countByStatus('paid')})</option>
                                </select>
                            </div>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="border-b border-gray-800">
                                    <tr className="text-[10px] font-black text-gray-500 tracking-[0.2em] uppercase">
                                        <th className="py-4 px-2">KODE PO</th>
                                        <th className="py-4 px-2">PELANGGAN</th>
                                        <th className="py-4 px-2">NOMOR HP</th>
                                        <th className="py-4 px-2">PRODUK</th>
                                        <th className="py-4 px-2">BUKTI</th>
                                        <th className="py-4 px-2">STATUS</th>
                                        <th className="py-4 px-2">AKSI</th>
                                        <th className="py-4 px-2 text-right">TOTAL</th>
                                    </tr>
                                </thead>
                                <tbody className="text-xs text-gray-300">
                                    {filteredPreorders.length === 0 ? (
                                        <tr>
                                            <td colSpan="8" className="py-10 text-center opacity-30 italic font-bold">Tidak ada data yang cocok</td>
                                        </tr>
                                    ) : filteredPreorders.map((po) => (
                                        <tr key={po.id} className="border-b border-gray-800/50 hover:bg-gray-800/30">
                                            <td className="py-4 px-2 font-black text-red-400 text-[10px] whitespace-nowrap">{po.po_code || 'N/A'}</td>
                                            <td className="py-4 px-2 font-bold uppercase">{po.customer_name}</td>
                                            <td className="py-4 px-2">
                                                <a href={toWaHref(po.customer_phone)} target="_blank" rel="noreferrer" className="text-green-400 font-bold hover:underline">
                                                    {po.customer_phone}
                                                </a>
                                            </td>
                                            <td className="py-4 px-2 text-gray-500 whitespace-nowrap">{po.product_id} ({po.qty})</td>
                                            <td className="py-4 px-2">
                                                {po.proof_image_url ? (
                                                    <a href={po.proof_image_url} target="_blank" rel="noreferrer" className="text-blue-400 hover:underline">Lihat</a>
                                                ) : <span className="text-gray-600 italic">Belum ada</span>}
                                            </td>
                                            <td className="py-4 px-2">
                                                <span className={`px-3 py-1 rounded-full border text-[10px] font-black uppercase tracking-[0.2em] ${preorderStatusClass[po.status] || preorderStatusClass['waiting_payment']}`}>
                                                    {poStatusLabel(po)}
                                                </span>
                                            </td>
                                            <td className="py-4 px-2">
                                                <div className="flex gap-2">
                                                    <button
                                                        onClick={() => updatePreorderStatus(po, 'ready_pickup')}
                                                        className="px-3 py-2 rounded-xl bg-blue-500/15 text-blue-300 border border-blue-500/20 text-[10px] font-black uppercase hover:bg-blue-500/25 transition-all"
                                                    >
                                                        Validasi Bayar
                                                    </button>
                                                    <button
                                                        onClick={() => updatePreorderStatus(po, 'paid')}
                                                        className="px-3 py-2 rounded-xl bg-green-500/15 text-green-300 border border-green-500/20 text-[10px] font-black uppercase hover:bg-green-500/25 transition-all"
                                                    >
                                                        Selesai
                                                    </button>
                                                </div>
                                            </td>
                                            <td className="py-4 px-2 font-black text-right text-yellow-400">Rp {(po.total_idr || 0).toLocaleString('id-ID')}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    )
}

export default DashboardPage
