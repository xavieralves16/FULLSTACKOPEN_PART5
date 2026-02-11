import { render, screen } from '@testing-library/react'
import Blog from './Blog'
import userEvent from '@testing-library/user-event'

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
