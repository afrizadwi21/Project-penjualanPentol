const env = {
  PORT: Number(process.env.PORT || 3000),
  SUPABASE_URL: process.env.SUPABASE_URL,
  SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY,
  SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
  ALLOWED_ORIGINS: process.env.ALLOWED_ORIGINS || '',
}

const getMissingEnv = () => {
  const missing = []
  if (!env.SUPABASE_URL) missing.push('SUPABASE_URL')
  if (!env.SUPABASE_ANON_KEY) missing.push('SUPABASE_ANON_KEY')
  if (!env.SUPABASE_SERVICE_ROLE_KEY) missing.push('SUPABASE_SERVICE_ROLE_KEY')
  return missing
}

const getAllowedOrigins = () =>
  env.ALLOWED_ORIGINS
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean)

module.exports = { env, getMissingEnv, getAllowedOrigins }

