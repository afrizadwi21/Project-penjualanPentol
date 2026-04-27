const getApiBase = () => {
  let base = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'
  if (!base.startsWith('http')) base = 'https://' + base
  return base.replace(/\/$/, '')
}
const API_BASE = getApiBase()

export const getAdminToken = () => localStorage.getItem('adminAccessToken') || ''

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
      const msg = data?.message || `Error ${res.status}: ${res.statusText}`
      const err = new Error(msg)
      err.status = res.status
      err.data = data
      throw err
    }
    
    return data
  } catch (err) {
    console.error(`[API ERROR] Failed to fetch ${url}:`, err.message)
    // Berikan pesan yang lebih membantu user
    if (err.message.includes('Failed to fetch')) {
      throw new Error(`Koneksi Gagal: Tidak bisa menghubungi ${url}. Pastikan URL Backend benar dan server Railway sudah 'Active'.`)
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
