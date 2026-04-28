const getApiBase = () => {
  let base = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'
  if (!base.startsWith('http')) base = 'https://' + base
  return base.replace(/\/$/, '')
}
const API_BASE = getApiBase()

export const getAdminToken = () => localStorage.getItem('adminAccessToken') || ''
export const getAdminRefreshToken = () => localStorage.getItem('adminRefreshToken') || ''

// isRetry: flag untuk mencegah infinite loop saat retry setelah refresh token
export async function apiFetch(path, { method = 'GET', body, headers, isRetry = false } = {}) {
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
      const msg = data?.message || `Error ${res.status}: ${res.statusText}`
      const err = new Error(msg)
      err.status = res.status
      err.data = data

      // 503 = server tidak bisa menghubungi Supabase (masalah Railway, BUKAN sesi kita)
      // Jangan redirect ke login!
      if (res.status === 503) {
        console.error('[API] Server error (503):', msg)
        throw err
      }

      // 401 di endpoint admin = token kedaluwarsa, coba refresh dulu
      if (res.status === 401 && path.includes('/admin/') && !isRetry) {
        const refreshToken = getAdminRefreshToken()
        if (refreshToken) {
          console.log('[API] Token 401, mencoba refresh...')
          try {
            const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL
            const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY
            
            if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
              throw new Error('VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY belum di-set di Vercel!')
            }

            const refreshResp = await fetch(`${SUPABASE_URL.replace(/\/$/, '')}/auth/v1/token?grant_type=refresh_token`, {
              method: 'POST',
              headers: { apikey: SUPABASE_ANON_KEY, 'Content-Type': 'application/json' },
              body: JSON.stringify({ refresh_token: refreshToken })
            })
            
            const refreshData = await refreshResp.json()
            if (refreshResp.ok && refreshData.access_token) {
              console.log('[API] Refresh token berhasil! Mengulang request...')
              localStorage.setItem('adminAccessToken', refreshData.access_token)
              localStorage.setItem('adminRefreshToken', refreshData.refresh_token || refreshToken)
              
              // Ulangi request asli dengan token baru (isRetry=true agar tidak loop)
              return apiFetch(path, { 
                method, 
                body, 
                headers: { ...headers, Authorization: `Bearer ${refreshData.access_token}` },
                isRetry: true,
              })
            } else {
              console.warn('[API] Refresh token gagal:', refreshData?.error_description || 'unknown')
            }
          } catch (re) {
            console.error('[API] Error saat refresh token:', re.message)
          }
        }

        // Refresh gagal atau tidak ada refresh token → paksa logout
        console.warn('[API] Sesi tidak bisa diperbarui. Logout...')
        localStorage.removeItem('adminAccessToken')
        localStorage.removeItem('adminRefreshToken')
        localStorage.removeItem('currentRole')
        if (typeof window !== 'undefined' && !window.location.pathname.includes('/login')) {
          window.location.href = '/admin/login?error=session_expired'
        }
      }

      throw err
    }
    
    return data
  } catch (err) {
    // Hanya log jika bukan error 401/403/503 yang sudah kita handle
    if (!err.status || err.status >= 500) {
      console.error(`[API ERROR] Gagal menghubungi ${url}:`, err.message)
    }
    if (err.message.includes('Failed to fetch') || err.message.includes('NetworkError') || err.message.includes('Network request failed')) {
      throw new Error(`Koneksi Terputus: Server Railway tidak bisa dihubungi. Pastikan status Railway 'Active'.`)
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
