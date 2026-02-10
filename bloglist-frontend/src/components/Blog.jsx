import { useState } from 'react'
import blogService from '../services/blogs'

const Blog = ({ blog, user, updateBlogList }) => {
  const [visible, setVisible] = useState(false)
  const [likes, setLikes] = useState(blog.likes)

  const toggleVisibility = () => {
    setVisible(!visible)
  }

  const handleLike = async () => {
    const updatedBlog = {
      user: blog.user.id, 
      likes: likes + 1,
      author: blog.author,
      title: blog.title,
      url: blog.url
    }

    try {
      const returnedBlog = await blogService.update(blog.id, updatedBlog)
      setLikes(returnedBlog.likes)
      if (updateBlog) updateBlog(returnedBlog) 
    } catch (exception) {
      console.error('Error updating likes', exception)
    }
  }

  const handleDelete = async () => {
    const ok = window.confirm(`Remove blog "${blog.title}" by ${blog.author}?`)
    if (!ok) return

    try {
      await blogService.remove(blog.id)
      if (updateBlogList) updateBlogList(blog.id, true) 
    } catch (exception) {
      console.error('Error deleting blog', exception)
    }
  }

  const blogStyle = {
    paddingTop: 10,
    paddingLeft: 2,
    border: 'solid',
    borderWidth: 1,
    marginBottom: 5
  }

  const showDelete = user?.username === blog.user.username

  return (
    <div style={blogStyle}>
      <div>
        {blog.title} {blog.author}
        <button onClick={toggleVisibility}>
          {visible ? 'hide' : 'view'}
        </button>
      </div>

      {visible && (
        <div>
          <div>{blog.url}</div>
          <div>
            likes {likes} <button onClick={handleLike}>like</button>
          </div>
          <div>{blog.user?.name}</div>
          {showDelete && <button onClick={handleDelete}>remove</button>}
        </div>
      )}
    </div>
  )
}

export default Blog
