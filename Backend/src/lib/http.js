const jsonError = (res, status, message, details) =>
  res.status(status).json({ ok: false, message, ...(details ? { details } : {}) })

module.exports = { jsonError }

