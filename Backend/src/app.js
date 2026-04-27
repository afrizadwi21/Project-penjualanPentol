const express = require('express')
const { getMissingEnv } = require('./config/env')
const { publicRouter } = require('./routes/public')
const { adminRouter } = require('./routes/admin')
const { cors } = require('./middleware/cors')
const { securityHeaders } = require('./middleware/securityHeaders')
const { rateLimit } = require('./middleware/rateLimit')

function createApp() {
  const app = express()
  app.use(express.json({ limit: '2mb' }))
  app.use(securityHeaders)
  app.use(cors)
  app.use(rateLimit({ windowMs: 60_000, max: 120 }))

  app.get('/health', (req, res) => {
    const missing = getMissingEnv()
    res.json({ ok: missing.length === 0, missing })
  })

  app.use('/api', publicRouter)
  app.use('/api/admin', adminRouter)

  app.get('/', (req, res) => res.send('Backend API is running'))
  return app
}

module.exports = { createApp }

