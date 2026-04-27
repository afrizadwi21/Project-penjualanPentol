import { Link, useNavigate } from 'react-router-dom'

const menuByRole = {
  admin: [
    { label: 'DASHBOARD', path: '/dashboard' },
    { label: 'DATA ORDER', path: '/admin/orders' },
    { label: 'TRANSAKSI', path: '/transaksi' },
  ],
}

const AppSidebar = ({ sidebarOpen, activePath, role = 'admin', onRequestClose }) => {
  const navigate = useNavigate()
  const menuItems = menuByRole[role] || menuByRole.admin

  const handleLogout = () => {
    localStorage.removeItem('currentRole')
    localStorage.removeItem('adminAccessToken')
    localStorage.removeItem('adminRefreshToken')
    navigate('/admin/login')
  }

  return (
    <>
      <div
        onClick={onRequestClose}
        className={`lg:hidden fixed inset-0 bg-black/60 z-40 transition-opacity duration-300 ${sidebarOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
      />

      <aside
        className={`fixed lg:sticky top-0 left-0 z-50 h-screen bg-gray-900 border-r border-gray-800 transition-transform duration-300 flex flex-col shrink-0 w-64 ${sidebarOpen ? 'lg:w-64' : 'lg:w-20'} ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}
      >
        <div className="p-6">
          <div className="font-black text-white text-xl leading-none">PENTOL</div>
          <div className="font-black text-red-500 text-xs leading-none tracking-[0.3em] mt-1">MERCON</div>
        </div>

        <nav className="flex-1 mt-10 space-y-2 px-4">
          {menuItems.map((item) => {
            const isActive = activePath === item.path
            return (
              <Link
                key={item.label}
                to={item.path}
                onClick={onRequestClose}
                className={`block px-4 py-3 rounded-xl text-[10px] font-black tracking-[0.2em] transition-all ${isActive ? 'bg-red-600 text-white shadow-lg shadow-red-900/20' : 'text-gray-500 hover:bg-gray-800 hover:text-gray-300'}`}
              >
                {sidebarOpen ? item.label : item.label[0]}
              </Link>
            )
          })}
        </nav>

        <div className="p-4">
          <button
            onClick={handleLogout}
            className="w-full bg-gray-800 py-3 rounded-xl text-[10px] font-black tracking-[0.2em] text-gray-500 hover:bg-red-600 hover:text-white transition-all"
          >
            {sidebarOpen ? 'KELUAR' : 'OUT'}
          </button>
        </div>
      </aside>
    </>
  )
}

export default AppSidebar
