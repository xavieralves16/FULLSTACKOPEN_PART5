const app = require('./app')

if (process.env.NODE_ENV !== 'test') {
  const PORT = 3003
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
  })
}