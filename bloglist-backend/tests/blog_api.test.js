const supertest = require('supertest')
const mongoose = require('mongoose')
const bcrypt = require('bcrypt')
const app = require('../app')
const Blog = require('../models/blog')
const User = require('../models/user')
const { test, beforeEach, after } = require('node:test')
const assert = require('node:assert')

const api = supertest(app)

let token
let userId

const initialBlogs = [
  {
    title: 'First blog',
    author: 'Alice',
    url: 'http://example.com/1',
    likes: 5
  },
  {
    title: 'Second blog',
    author: 'Bob',
    url: 'http://example.com/2',
    likes: 3
  }
]

beforeEach(async () => {
  await Blog.deleteMany({})
  await User.deleteMany({})

  const passwordHash = await bcrypt.hash('secret123', 10)
  const user = new User({ username: 'testuser', name: 'Test User', passwordHash })
  const savedUser = await user.save()
  userId = savedUser._id.toString()


  const response = await api
    .post('/api/login')
    .send({ username: 'testuser', password: 'secret123' })

  token = response.body.token


  const blogsWithUser = initialBlogs.map(blog => ({ ...blog, user: userId }))
  await Blog.insertMany(blogsWithUser)
})

test('blogs are returned as JSON and the correct amount', async () => {
  const response = await api
    .get('/api/blogs')
    .expect(200)
    .expect('Content-Type', /application\/json/)

  assert.strictEqual(response.body.length, initialBlogs.length)
})

test('blog posts have id property instead of _id', async () => {
  const response = await api.get('/api/blogs')
  const blog = response.body[0]
  assert(blog.id)
  assert.strictEqual(blog._id, undefined)
})

test('a valid blog can be added with token', async () => {
  const newBlog = {
    title: 'Async/Await in Node.js',
    author: 'Xavier Alves',
    url: 'https://example.com/async-await',
    likes: 7
  }

  await api
    .post('/api/blogs')
    .set('Authorization', `Bearer ${token}`)
    .send(newBlog)
    .expect(201)
    .expect('Content-Type', /application\/json/)

  const response = await api.get('/api/blogs')
  assert.strictEqual(response.body.length, initialBlogs.length + 1)

  const titles = response.body.map(b => b.title)
  assert(titles.includes('Async/Await in Node.js'))
})

test('adding a blog fails with 401 if no token is provided', async () => {
  const newBlog = {
    title: 'Blog sem token',
    author: 'Xavier',
    url: 'http://example.com/sem-token',
    likes: 3
  }

  await api
    .post('/api/blogs')
    .send(newBlog)
    .expect(401)
})

test('if likes is missing, it defaults to 0', async () => {
  const newBlog = {
    title: 'Blog without likes',
    author: 'Anonymous',
    url: 'https://example.com/no-likes'
  }

  const response = await api
    .post('/api/blogs')
    .set('Authorization', `Bearer ${token}`)
    .send(newBlog)
    .expect(201)

  assert.strictEqual(response.body.likes, 0)
})

test('blog without title is not added', async () => {
  const newBlog = {
    author: 'No Title',
    url: 'https://example.com/no-title',
    likes: 5
  }

  await api
    .post('/api/blogs')
    .set('Authorization', `Bearer ${token}`)
    .send(newBlog)
    .expect(400)

  const response = await api.get('/api/blogs')
  assert.strictEqual(response.body.length, initialBlogs.length)
})

test('blog without url is not added', async () => {
  const newBlog = {
    title: 'No URL',
    author: 'Anonymous',
    likes: 5
  }

  await api
    .post('/api/blogs')
    .set('Authorization', `Bearer ${token}`)
    .send(newBlog)
    .expect(400)

  const response = await api.get('/api/blogs')
  assert.strictEqual(response.body.length, initialBlogs.length)
})

test('a blog can be deleted by its creator', async () => {
  const blogsAtStart = await api.get('/api/blogs')
  const blogToDelete = blogsAtStart.body[0]

  await api
    .delete(`/api/blogs/${blogToDelete.id}`)
    .set('Authorization', `Bearer ${token}`)
    .expect(204)

  const blogsAtEnd = await api.get('/api/blogs')
  assert.strictEqual(blogsAtEnd.body.length, blogsAtStart.body.length - 1)

  const titles = blogsAtEnd.body.map(b => b.title)
  assert(!titles.includes(blogToDelete.title))
})

test('a blog likes count can be updated', async () => {
  const blogsAtStart = await api.get('/api/blogs')
  const blogToUpdate = blogsAtStart.body[0]

  const updatedBlog = {
    ...blogToUpdate,
    likes: blogToUpdate.likes + 10
  }

  const response = await api
    .put(`/api/blogs/${blogToUpdate.id}`)
    .send(updatedBlog)
    .expect(200)
    .expect('Content-Type', /application\/json/)

  assert.strictEqual(response.body.likes, blogToUpdate.likes + 10)

  const blogsAtEnd = await api.get('/api/blogs')
  const updated = blogsAtEnd.body.find(b => b.id === blogToUpdate.id)

  assert.strictEqual(updated.likes, blogToUpdate.likes + 10)
})

after(async () => {
  await mongoose.connection.close()
})
