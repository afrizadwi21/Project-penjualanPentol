const getApiBase = () => {
  let base = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'
  if (!base.startsWith('http')) base = 'https://' + base
  return base.replace(/\/$/, '')
}
const API_BASE = getApiBase()

export const getAdminToken = () => localStorage.getItem('adminAccessToken') || ''
export const getAdminRefreshToken = () => localStorage.getItem('adminRefreshToken') || ''

export async function apiFetch(path, { method = 'GET', body, headers } = {}) {
  const url = `${API_BASE}${path}`
  
  try {
    const res = await fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...(headers || {}),
      },
      body: body ? JSON.stringify(body) : undefined,
    })

    const text = await res.text()
    const data = text ? (() => { try { return JSON.parse(text) } catch { return text } })() : null

    if (!res.ok) {
      // Jika 401 (Unauthorized) di endpoint admin, coba refresh token dulu
      if (res.status === 401 && path.includes('/admin/') && !path.includes('/refresh')) {
        const refreshToken = getAdminRefreshToken()
        if (refreshToken) {
          console.log('[API] Mencoba refresh token...')
          try {
            const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL
            const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY
            
            if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
              console.error('[API] Gagal refresh: VITE_SUPABASE_URL atau VITE_SUPABASE_ANON_KEY belum di-set di environment variables Vercel.')
              throw new Error('Missing Supabase Config')
            }

            const refreshResp = await fetch(`${SUPABASE_URL.replace(/\/$/, '')}/auth/v1/token?grant_type=refresh_token`, {
              method: 'POST',
              headers: { apikey: SUPABASE_ANON_KEY, 'Content-Type': 'application/json' },
              body: JSON.stringify({ refresh_token: refreshToken })
            })
            
            const refreshData = await refreshResp.json()
            if (refreshResp.ok && refreshData.access_token) {
              console.log('[API] Refresh token berhasil!')
              localStorage.setItem('adminAccessToken', refreshData.access_token)
              localStorage.setItem('adminRefreshToken', refreshData.refresh_token)
              
              // Ulangi request asli dengan token baru
              return apiFetch(path, { 
                method, 
                body, 
                headers: { ...headers, Authorization: `Bearer ${refreshData.access_token}` } 
              })
            }
          } catch (re) {
            console.error('[API] Gagal refresh token:', re.message)
          }
        }

        // Jika gagal refresh atau tidak ada refresh token, paksa logout
        console.warn('[API] Sesi tidak bisa diperbarui. Mengarahkan ke login...')
        localStorage.removeItem('adminAccessToken')
        localStorage.removeItem('currentRole')
        if (typeof window !== 'undefined' && !window.location.pathname.includes('/login')) {
          window.location.href = '/admin/login?error=session_expired'
        }
      }

      const msg = data?.message || `Error ${res.status}: ${res.statusText}`
      const err = new Error(msg)
      err.status = res.status
      err.data = data
      throw err
    }
    
    return data
  } catch (err) {
    console.error(`[API ERROR] Gagal menghubungi ${url}:`, err.message)
    if (err.message.includes('Failed to fetch') || err.message.includes('NetworkError') || err.message.includes('Network Error')) {
      throw new Error(`Koneksi Terputus: Tidak bisa menghubungi server (${url}). Pastikan server Railway Anda sedang 'Active' dan tidak dalam proses 'Deploying'.`)
    }
    throw err
  }
}

export async function adminFetch(path, { method = 'GET', body } = {}) {
  const token = getAdminToken()
  return apiFetch(path, {
    method,
    body,
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  })
}
