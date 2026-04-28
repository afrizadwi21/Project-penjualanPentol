const { env } = require('../config/env')
const { jsonError } = require('../lib/http')
const { supabaseRest } = require('../lib/supabaseRest')

async function requireAdmin(req, res, next) {
  try {
    const auth = req.get('authorization') || ''
    const token = auth.toLowerCase().startsWith('bearer ') ? auth.slice(7).trim() : ''
    console.log('[DEBUG] Token received:', token ? 'Yes' : 'No')
    
    if (!token) return jsonError(res, 401, 'Missing Authorization Bearer token')

    if (!env.SUPABASE_URL || !env.SUPABASE_ANON_KEY) {
        console.log('[DEBUG] Server misconfigured')
        return jsonError(res, 500, 'Server misconfigured')
    }

    // 1) Validate token with Supabase Auth
    const authUrl = `${env.SUPABASE_URL.replace(/\/$/, '')}/auth/v1/user`
    const authResp = await fetch(authUrl, {
      method: 'GET',
      headers: {
        apikey: env.SUPABASE_ANON_KEY,
        authorization: `Bearer ${token}`,
      },
    })
    
    if (!authResp.ok) {
        const errBody = await authResp.text()
        console.log('[DEBUG] Auth validation failed. Status:', authResp.status, 'Body:', errBody)
        return jsonError(res, 401, `Sesi login tidak valid (Supabase: ${authResp.status}). Silakan login ulang.`)
    }
    
    const user = await authResp.json()
    const userId = user?.id
    console.log('[DEBUG] Authenticated User ID:', userId)
    
    if (!userId) return jsonError(res, 401, 'ID Pengguna tidak ditemukan dalam token.')

    // 2) Check admin flag in profiles (service role, server-side only)
    console.log('[DEBUG] Querying profiles for isAdmin for ID:', userId)
    let rows
    try {
        rows = await supabaseRest('profiles', {
            query: `select=is_admin&id=eq.${encodeURIComponent(userId)}&limit=1`,
            useService: true,
        })
    } catch (dbErr) {
        console.error('[DEBUG] Database profile check failed:', dbErr.message)
        return jsonError(res, 500, 'Gagal memverifikasi status Admin di database.', dbErr.message)
    }
    
    console.log('[DEBUG] Query result:', JSON.stringify(rows))
    
    const isAdmin = Array.isArray(rows) && rows[0] && (rows[0].is_admin === true || rows[0].is_admin === 'true')
    console.log('[DEBUG] isAdmin check:', isAdmin)
    
    if (!isAdmin) {
        return jsonError(res, 403, 'Anda bukan Admin. Akses ditolak.')
    }

    req.user = { id: userId, email: user?.email || null }

    next()
  } catch (e) {
    console.error('[DEBUG] Error in requireAdmin Middleware:', e.message)
    jsonError(res, 401, 'Unauthorized: ' + e.message)
  }
}

module.exports = { requireAdmin }
