const toOrderCode = (prefix) => {
  const d = new Date()
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  const rand = String(Math.floor(Math.random() * 9000 + 1000))
  return `${prefix}-${y}${m}${day}-${rand}`
}

module.exports = { toOrderCode }

