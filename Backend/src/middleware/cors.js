const { getAllowedOrigins } = require('../config/env')

function cors(req, res, next) {
  const origin = req.headers.origin || '*'
  
  res.setHeader('Access-Control-Allow-Origin', origin)
  res.setHeader('Vary', 'Origin')
  res.setHeader('Access-Control-Allow-Credentials', 'true')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PATCH,OPTIONS')

  if (req.method === 'OPTIONS') return res.status(204).end()
  next()
}

module.exports = { cors }
