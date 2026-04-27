const { jsonError } = require('../lib/http')

function rateLimit({ windowMs, max }) {
  const hits = new Map()

  const cleanup = () => {
    const now = Date.now()
    for (const [k, v] of hits.entries()) {
      if (now - v.resetAt >= windowMs) hits.delete(k)
    }
  }

  return (req, res, next) => {
    cleanup()
    const ip = req.ip || req.connection?.remoteAddress || 'unknown'
    const key = `${ip}:${req.path}`
    const now = Date.now()
    const existing = hits.get(key)

    if (!existing || now - existing.resetAt >= windowMs) {
      hits.set(key, { count: 1, resetAt: now })
      return next()
    }

    existing.count += 1
    if (existing.count > max) return jsonError(res, 429, 'Too many requests')
    next()
  }
}

module.exports = { rateLimit }

