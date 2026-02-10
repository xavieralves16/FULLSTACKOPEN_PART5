import { useState, useEffect, useRef } from 'react'
import blogService from './services/blogs'
import loginService from './services/login'
import Blog from './components/Blog'
import BlogForm from './components/BlogForm'
import Notification from './components/Notification'
import Togglable from './components/Togglable'



const App = () => {
  const [blogs, setBlogs] = useState([])
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [user, setUser] = useState(null)
  const [notification, setNotification] = useState(null)
  const blogFormRef = useRef()

  useEffect(() => {
    const loggedUserJSON = window.localStorage.getItem('loggedBlogAppUser')
    if (loggedUserJSON) {
      const user = JSON.parse(loggedUserJSON)
      setUser(user)
      blogService.setToken(user.token)
    }
  }, [])

  useEffect(() => {
    const fetchBlogs = async () => {
      const blogs = await blogService.getAll()
      blogs.sort((a, b) => b.likes - a.likes)
      setBlogs(blogs)
    }

    if (user) {
      fetchBlogs()
    }
  }, [user])

  const showNotification = (message, duration = 5000) => {
    setNotification(message)
    setTimeout(() => {
      setNotification(null)
    }, duration)
  }



  const handleLogin = async (event) => {
    event.preventDefault()

    try {
      const user = await loginService.login({ username, password })

      setUser(user)
      localStorage.setItem('loggedBlogAppUser', JSON.stringify(user))
      blogService.setToken(user.token)
      setUsername('')
      setPassword('')
      showNotification(`Welcome ${user.name}!`)
    } catch (exception) {
      console.error('wrong credentials', exception)
      showNotification('Wrong username or password')
    }
  }

  const handleLogout = () => {
    setUser(null)
    localStorage.removeItem('loggedBlogAppUser')
  }


  const addBlog = async (blogObject) => {
    try {
      const returnedBlog = await blogService.create(blogObject)
      setBlogs(prevBlogs => prevBlogs.concat(returnedBlog))
      showNotification(`A new blog "${returnedBlog.title}" by ${returnedBlog.author} added!`)
      blogFormRef.current.toggleVisibility()
    } catch (exception) {
      console.error('error creating blog', exception)
      showNotification('Failed to create blog')
    }
  }

  const updateBlogList = (updatedBlogOrId, deleted = false) => {
    if (deleted) {
      setBlogs(prevBlogs => prevBlogs.filter(blog => blog.id !== updatedBlogOrId))
    } else {
      setBlogs(prevBlogs =>
        prevBlogs.map(blog =>
          blog.id === updatedBlogOrId.id ? updatedBlogOrId : blog
        )
      )
    }
  }

  if (user === null) {
    return (
      <div>
        <h2>Log in to application</h2>
        <Notification message={notification} />
        <form onSubmit={handleLogin}>
          <div>
            username
            <input
              type="text"
              value={username}
              onChange={({ target }) => setUsername(target.value)}
            />
          </div>
          <div>
            password
            <input
              type="password"
              value={password}
              onChange={({ target }) => setPassword(target.value)}
            />
          </div>
          <button type="submit">login</button>
        </form>
      </div>
    )
  }

  return (
    <div>
      <h2>blogs</h2>
      <Notification message={notification} />
      <p>
        {user.name} logged in <button onClick={handleLogout}>logout</button>
      </p>

      <Togglable buttonLabel="create new blog" ref={blogFormRef}>
        <BlogForm createBlog={addBlog} />
      </Togglable>


      {blogs
        .slice()
        .map(blog => (
          <Blog
            key={blog.id}
            blog={blog}
            user={user}
            updateBlogList={updateBlogList}
          />
        ))}
    </div>
  )
}


export default App
