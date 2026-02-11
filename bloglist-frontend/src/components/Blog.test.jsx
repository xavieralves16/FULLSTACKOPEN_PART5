import { render, screen } from '@testing-library/react'
import Blog from './Blog'
import userEvent from '@testing-library/user-event'

// Mock the blogService module
vi.mock('../services/blogs', () => {
  return {
    default: {
      update: vi.fn(async (id, updatedBlog) => {
        // Simulate server returning updated likes
        return { ...updatedBlog }
      }),
      remove: vi.fn()
    }
  }
})

describe('<Blog />', () => {
  const blog = {
    title: 'Testing React components',
    author: 'John Doe',
    url: 'http://example.com',
    likes: 5,
    user: {
      username: 'johndoe',
      name: 'John Doe',
      id: '12345'
    },
    id: 'abc123'
  }

  const user = {
    username: 'janedoe',
    name: 'Jane Doe'
  }

  test('if like button is clicked twice, the event handler is called twice', async () => {
    // Mock function
    const mockHandler = vi.fn()

    render(<Blog blog={blog} user={user} updateBlogList={mockHandler} />)

    const userInteraction = userEvent.setup()

    // Click 'view' to show the like button
    const viewButton = screen.getByText('view')
    await userInteraction.click(viewButton)

    // Click 'like' button twice
    const likeButton = screen.getByText('like')
    await userInteraction.click(likeButton)
    await userInteraction.click(likeButton)

    // The handler should have been called twice
    expect(mockHandler).toHaveBeenCalledTimes(2)
  })

  test('renders title and author but not url or likes by default', () => {
    render(<Blog blog={blog} user={user} />)

    // Title visible
    expect(screen.getByText('Testing React components'))
        .toBeInTheDocument()

    // Author visible
    expect(screen.getByText('John Doe'))
        .toBeInTheDocument()


    // URL NOT visible
    expect(screen.queryByText('http://example.com'))
        .toBeNull()

    // Likes NOT visible
    expect(screen.queryByText(/likes/i))
        .toBeNull()
  })

  test('URL and likes are shown when view button is clicked', async () => {
    render(<Blog blog={blog} user={user} />)

    const viewButton = screen.getByText('view')

    const userInteraction = userEvent.setup()
    await userInteraction.click(viewButton)

    // Now URL should be visible
    expect(screen.getByText('http://example.com'))
      .toBeInTheDocument()

    // Likes should now be visible
    expect(screen.getByText(/likes 5/i))
      .toBeInTheDocument()
  })
})
