const normalizePhone = (value) => {
  let digits = String(value || '').replace(/\D/g, '')
  
  // Jika diawali 62, ubah ke 0
  if (digits.startsWith('62')) {
    digits = '0' + digits.slice(2)
  }
  // Jika diawali 8 (tanpa 0), tambahkan 0
  else if (digits.startsWith('8')) {
    digits = '0' + digits
  }
  
  return digits
}

module.exports = { normalizePhone }
