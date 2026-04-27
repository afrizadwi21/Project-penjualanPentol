const getApiBase = () => {
  let base = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'
  if (!base.startsWith('http')) base = 'https://' + base
  return base.replace(/\/$/, '')
}
const API_BASE = getApiBase()

export const getAdminToken = () => localStorage.getItem('adminAccessToken') || ''

export async function apiFetch(path, { method = 'GET', body, headers } = {}) {
  const url = `${API_BASE}${path}`
  console.log(`[DEBUG] Fetching: ${method} ${url}`)
  
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
      console.error(`[DEBUG] Fetch Error ${res.status}:`, data)
      const msg = typeof data === 'object' && data && data.message ? data.message : `HTTP ${res.status}`
      const err = new Error(msg)
      err.status = res.status
      err.data = data
      throw err
    }
    
    console.log(`[DEBUG] Fetch Success:`, data)
    return data
  } catch (err) {
    console.error(`[DEBUG] Network/Fetch Error:`, err.message)
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
