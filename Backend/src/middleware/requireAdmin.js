const { env } = require('../config/env')
const { jsonError } = require('../lib/http')
const { supabaseRest } = require('../lib/supabaseRest')

async function requireAdmin(req, res, next) {
  const auth = req.get('authorization') || ''
  const token = auth.toLowerCase().startsWith('bearer ') ? auth.slice(7).trim() : ''
  console.log('[requireAdmin] Token received:', token ? 'Yes (len=' + token.length + ')' : 'No')

  if (!token) return jsonError(res, 401, 'Token tidak ditemukan. Silakan login terlebih dahulu.')

  if (!env.SUPABASE_URL || !env.SUPABASE_ANON_KEY) {
    console.error('[requireAdmin] SUPABASE_URL atau SUPABASE_ANON_KEY tidak di-set di Railway!')
    return jsonError(res, 500, 'Konfigurasi server tidak lengkap (env var hilang).')
  }

  // 1) Validasi token ke Supabase Auth
  let user
  try {
    const authUrl = `${env.SUPABASE_URL.replace(/\/$/, '')}/auth/v1/user`
    console.log('[requireAdmin] Menghubungi Supabase Auth:', authUrl)
    const authResp = await fetch(authUrl, {
      method: 'GET',
      headers: {
        apikey: env.SUPABASE_ANON_KEY,
        authorization: `Bearer ${token}`,
      },
    })

    if (!authResp.ok) {
      const errBody = await authResp.text()
      console.log('[requireAdmin] Supabase menolak token. Status:', authResp.status, '| Body:', errBody)
      // 401 dari Supabase = token benar-benar tidak valid / kedaluwarsa
      return jsonError(res, 401, `Sesi tidak valid (Supabase: ${authResp.status}). Silakan login ulang.`)
    }

    user = await authResp.json()
  } catch (fetchErr) {
    // Ini adalah network error - Railway tidak bisa menghubungi Supabase
    console.error('[requireAdmin] NETWORK ERROR saat menghubungi Supabase:', fetchErr.message)
    return jsonError(res, 503, 'Server tidak bisa menghubungi layanan autentikasi (Supabase). Coba beberapa saat lagi.')
  }

  const userId = user?.id
  console.log('[requireAdmin] User ID terautentikasi:', userId)
  if (!userId) return jsonError(res, 401, 'ID pengguna tidak ditemukan dalam token.')

  // 2) Cek flag is_admin di tabel profiles
  let rows
  try {
    rows = await supabaseRest('profiles', {
      query: `select=is_admin&id=eq.${encodeURIComponent(userId)}&limit=1`,
      useService: true,
    })
  } catch (dbErr) {
    console.error('[requireAdmin] Gagal query profiles dari Supabase:', dbErr.message)
    return jsonError(res, 503, 'Server tidak bisa mengambil data profil dari database.', dbErr.message)
  }

  console.log('[requireAdmin] Profile result:', JSON.stringify(rows))

  const isAdmin = Array.isArray(rows) && rows[0] && (rows[0].is_admin === true || rows[0].is_admin === 'true')
  console.log('[requireAdmin] isAdmin:', isAdmin)

  if (!isAdmin) {
    return jsonError(res, 403, 'Akses ditolak: akun ini bukan Admin.')
  }

  req.user = { id: userId, email: user?.email || null }
  next()
}

module.exports = { requireAdmin }
