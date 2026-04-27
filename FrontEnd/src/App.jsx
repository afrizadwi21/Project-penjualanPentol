import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import LandingPage from './pages/LandingPage'
import LoginPage from './pages/LoginPage'
import DashboardPage from './pages/DashboardPage'
import TransaksiPage from './pages/TransaksiPage'
import RiwayatPage from './pages/RiwayatPage'
import OrdersPage from './pages/OrdersPage'

const isAdmin = () => (localStorage.getItem('currentRole') || '') === 'admin'

const RequireAdmin = ({ children }) => {
  if (!isAdmin()) return <Navigate to="/admin/login" replace />
  return children
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        {/* Back-compat: old login route */}
        <Route path="/login" element={<Navigate to="/admin/login" replace />} />
        <Route path="/admin/login" element={<LoginPage />} />
        <Route
          path="/dashboard"
          element={
            <RequireAdmin>
              <DashboardPage />
            </RequireAdmin>
          }
        />
        <Route
          path="/admin/orders"
          element={
            <RequireAdmin>
              <OrdersPage />
            </RequireAdmin>
          }
        />
        <Route path="/transaksi" element={<TransaksiPage />} />
        <Route path="/riwayat" element={<RiwayatPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
