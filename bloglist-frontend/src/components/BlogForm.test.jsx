import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import BlogForm from './BlogForm'

test('form calls event handler with right details when a new blog is created', async () => {
  const mockCreateBlog = vi.fn()
  render(<BlogForm createBlog={mockCreateBlog} />)

  const user = userEvent.setup()

  // Select inputs by the visible label text
  const inputs = screen.getAllByRole('textbox')
  const titleInput = inputs[0]
  const authorInput = inputs[1]
  const urlInput = inputs[2]

  // Submit button
  const createButton = screen.getByRole('button', { name: /create/i })

  // Fill the form
  await user.type(titleInput, 'My Test Blog')
  await user.type(authorInput, 'Jane Doe')
  await user.type(urlInput, 'http://example.com')

  // Submit form
  await user.click(createButton)

  // Check if handler was called exactly once
  expect(mockCreateBlog).toHaveBeenCalledTimes(1)

  // Check if handler received correct data
  expect(mockCreateBlog).toHaveBeenCalledWith({
    title: 'My Test Blog',
    author: 'Jane Doe',
    url: 'http://example.com'
  })
})
