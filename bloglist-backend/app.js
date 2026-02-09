const express = require('express')
const mongoose = require('mongoose')
const middleware = require('./utils/middleware')
const blogsRouter = require('./controllers/blogs')
const usersRouter = require('./controllers/users')
const loginRouter = require('./controllers/login')

const app = express()

// MongoDB connection
const mongoUrl = `mongodb+srv://xavier:${encodeURIComponent(process.env.MONGODB_PASSWORD)}@cluster0.lbwwkqb.mongodb.net/bloglist?appName=Cluster0`
mongoose.set('strictQuery', false)

mongoose.connect(mongoUrl)
  .then(() => console.log('connected to MongoDB'))
  .catch((error) => console.log('error connecting to MongoDB:', error.message))

// Middlewares
app.use(express.json())
app.use(middleware.tokenExtractor)

// Routes
app.use('/api/blogs', blogsRouter)
app.use('/api/users', usersRouter)
app.use('/api/login', loginRouter)

module.exports = app