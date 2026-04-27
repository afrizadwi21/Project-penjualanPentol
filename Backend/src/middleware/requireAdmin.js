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
        console.log('[DEBUG] Auth validation failed. Status:', authResp.status)
        return jsonError(res, 401, 'Unauthorized')
    }
    
    const user = await authResp.json()
    const userId = user?.id
    console.log('[DEBUG] Authenticated User ID:', userId)
    
    if (!userId) return jsonError(res, 401, 'Unauthorized')

    // 2) Check admin flag in profiles (service role, server-side only)
    console.log('[DEBUG] Querying profiles for isAdmin...')
    const rows = await supabaseRest('profiles', {
      query: `select=is_admin&id=eq.${encodeURIComponent(userId)}&limit=1`,
      useService: true,
    })
    
    console.log('[DEBUG] Query result:', JSON.stringify(rows))
    
    const isAdmin = Array.isArray(rows) && rows[0] && (rows[0].is_admin === true || rows[0].is_admin === 'true')
    console.log('[DEBUG] isAdmin check:', isAdmin)
    
    if (!isAdmin) return jsonError(res, 403, 'Forbidden')

    req.user = { id: userId, email: user?.email || null }

    next()
  } catch (e) {
    console.error('[DEBUG] Error in requireAdmin:', e.message)
    jsonError(res, 401, 'Unauthorized', e.details || e.message)
  }
}

module.exports = { requireAdmin }
