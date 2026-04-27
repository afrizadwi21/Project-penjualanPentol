const { env } = require('./config/env')
const { createApp } = require('./app')

function startServer() {
  const app = createApp()
  app.listen(env.PORT, () => {
    console.log(`Backend berjalan di http://localhost:${env.PORT}`)
  })
}

module.exports = { startServer }

