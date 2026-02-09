const blogsRouter = require('express').Router()
const Blog = require('../models/blog')
const User = require('../models/user')
const jwt = require('jsonwebtoken')
const { userExtractor } = require('../utils/middleware')


/// GET blogs (com user)
blogsRouter.get('/', async (request, response) => {
  const blogs = await Blog
    .find({})
    .populate('user', { username: 1, name: 1 })

  response.json(blogs)
})

// POST blog
blogsRouter.post('/', userExtractor, async (request, response) => {
  const user = request.user
  const body = request.body

  if (!body.title || !body.url) {
    return response.status(400).json({ error: 'title and url are required' })
  }


  const blog = new Blog({
    title: body.title,
    author: body.author,
    url: body.url,
    likes: body.likes || 0,
    user: user._id,
  })

  const savedBlog = await blog.save()

  user.blogs = user.blogs.concat(savedBlog._id)
  await user.save()

  const populatedBlog = await savedBlog.populate('user', { username: 1, name: 1 })
  response.status(201).json(populatedBlog)
})

// DELETE blog by ID
blogsRouter.delete('/:id', userExtractor, async (request, response) => {
  const user = request.user
  let blog
  try {
    blog = await Blog.findById(request.params.id)
  } catch (error) {
    return response.status(400).json({ error: 'malformed id or invalid request' })
  }

  if (!blog) {
    return response.status(404).end()
  }

  if (blog.user.toString() !== user._id.toString()) {
    return response.status(401).json({ error: 'only the creator can delete the blog' })
  }

  await Blog.findByIdAndDelete(request.params.id)
  response.status(204).end()
})



// PUT update a blog by ID
blogsRouter.put('/:id', async (request, response) => {
  const { title, author, url, likes } = request.body

  const updatedBlog = await Blog.findByIdAndUpdate(
    request.params.id,
    { title, author, url, likes },
    { new: true, runValidators: true }
  )

  response.json(updatedBlog)
})

module.exports = blogsRouter