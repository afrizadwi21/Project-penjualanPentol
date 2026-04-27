const { env } = require('../config/env')

async function supabaseRest(path, { method = 'GET', query = '', body, useService = false } = {}) {
  if (!env.SUPABASE_URL) throw new Error('SUPABASE_URL is not set')
  const key = useService ? env.SUPABASE_SERVICE_ROLE_KEY : env.SUPABASE_ANON_KEY
  if (!key) throw new Error(useService ? 'SUPABASE_SERVICE_ROLE_KEY is not set' : 'SUPABASE_ANON_KEY is not set')

  const url = `${env.SUPABASE_URL.replace(/\/$/, '')}/rest/v1/${path}${query ? `?${query}` : ''}`
  const resp = await fetch(url, {
    method,
    headers: {
      apikey: key,
      authorization: `Bearer ${key}`,
      'content-type': 'application/json',
      prefer: 'return=representation',
    },
    body: body ? JSON.stringify(body) : undefined,
  })

  const text = await resp.text()
  let data = null
  if (text) {
    try {
      data = JSON.parse(text)
    } catch {
      data = text
    }
  }

  if (!resp.ok) {
    const err = typeof data === 'object' && data ? data : { message: String(data || resp.statusText) }
    const e = new Error(err.message || 'Supabase request failed')
    e.status = resp.status
    e.details = err
    throw e
  }

  return data
}

module.exports = { supabaseRest }

