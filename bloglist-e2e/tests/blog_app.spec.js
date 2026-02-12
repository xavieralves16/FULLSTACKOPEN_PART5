const { test, expect } = require('@playwright/test')

// ---------------- Helpers ---------------- //

async function login(page, username, password, displayName) {
  await page.locator('input').nth(0).fill(username)
  await page.locator('input').nth(1).fill(password)
  await page.getByRole('button', { name: /login/i }).click()
  await expect(page.getByText(`${displayName} logged in`)).toBeVisible()
}

async function createBlog(page, title, author, url) {
  await page.getByRole('button', { name: /create new blog/i }).click()
  const inputs = page.locator('input')
  const count = await inputs.count()
  await inputs.nth(count - 3).fill(title)
  await inputs.nth(count - 2).fill(author)
  await inputs.nth(count - 1).fill(url)
  await page.getByRole('button', { name: /create/i }).click()
  const blog = page.locator('div.blog').filter({ hasText: title }).first()
  await expect(blog).toBeVisible({ timeout: 10000 })
  return blog
}

async function likeBlog(blog) {
  const viewButton = blog.locator('button').filter({ hasText: 'view' }).first()
  await viewButton.click()

  const likesDiv = blog.locator('div.blog-likes').first()
  const initialLikes = parseInt((await likesDiv.innerText()).match(/\d+/)[0], 10)

  const likeButton = likesDiv.locator('button').filter({ hasText: 'like' }).first()
  await likeButton.click()

  await expect(likesDiv).toHaveText(new RegExp(`likes ${initialLikes + 1}`))

  const newLikes = parseInt((await likesDiv.innerText()).match(/\d+/)[0], 10)
  expect(newLikes).toBe(initialLikes + 1)
}

async function deleteBlog(blog, page) {
  const viewButton = blog.locator('button').filter({ hasText: 'view' }).first()
  await viewButton.click()
  page.once('dialog', dialog => dialog.accept())
  const removeButton = blog.locator('button').filter({ hasText: 'remove' }).first()
  await removeButton.click()
  await expect(blog).toHaveCount(0)
}

// ---------------- Tests ---------------- //

test.describe('Blog app', () => {

  test.beforeEach(async ({ page, request }) => {
    await request.post('http://localhost:3003/api/testing/reset')
    const user = { name: 'Test User', username: 'test', password: 'password' }
    await request.post('http://localhost:3003/api/users', { data: user })

    await page.goto('http://localhost:5173')

  })

  test('Login form is shown', async ({ page }) => {
    await expect(page.getByRole('heading', { name: /log in to application/i })).toBeVisible()
    await expect(page.getByRole('button', { name: /login/i })).toBeVisible()
  })

  test.describe('Login', () => {
    test('succeeds with correct credentials', async ({ page }) => {
      await login(page, 'test', 'password', 'Test User')
    })

    test('fails with wrong credentials', async ({ page }) => {
      await page.locator('input').nth(0).fill('test')
      await page.locator('input').nth(1).fill('wrong')
      await page.getByRole('button', { name: /login/i }).click()
      await expect(page.getByText(/wrong username or password/i)).toBeVisible()
    })
  })

  test.describe('When logged in', () => {

    test.beforeEach(async ({ page }) => {
      await login(page, 'test', 'password', 'Test User')
    })

    test('a new blog can be created', async ({ page }) => {
      const blog = await createBlog(page, 'My New Blog', 'John Doe', 'http://example.com')
      const author = blog.locator('span.blog-author').filter({ hasText: 'John Doe' }).first()
      await expect(author).toBeVisible()
    })

    test('a blog can be liked', async ({ page }) => {
      const blog = await createBlog(page, 'Likeable Blog', 'Jane Doe', 'http://example.com')
      await likeBlog(blog)
    })

    test('user who created a blog can delete it', async ({ page }) => {
      const blog = await createBlog(page, 'Deletable Blog', 'John Doe', 'http://example.com')
      await deleteBlog(blog, page)
    })

    test('only the user who added a blog can see the delete button', async ({ page, request }) => {

        await page.getByRole('button', { name: /logout/i }).click()


        const otherUser = { name: 'Other User', username: 'other', password: 'secret' }
        await request.post('http://localhost:3003/api/users', { data: otherUser })
        await login(page, 'other', 'secret', 'Other User')

        const blogToCheck = page.locator('div.blog').first()
        const viewButton = blogToCheck.locator('button').filter({ hasText: 'view' }).first()
        await viewButton.click()

        const removeButton = blogToCheck.locator('button').filter({ hasText: 'remove' })
        await expect(removeButton).toHaveCount(0)
        })
    
    test('blogs are ordered by likes descending', async ({ page }) => {
        const blog1 = await createBlog(page, 'First Blog', 'Author A', 'http://a.com')
        const blog2 = await createBlog(page, 'Second Blog', 'Author B', 'http://b.com')

        await likeBlog(blog1)
        await likeBlog(blog2)
        const secondLikesDiv = blog2.locator('div.blog-likes').first()
        const secondLikeButton = secondLikesDiv.locator('button').filter({ hasText: 'like' }).first()
        await secondLikeButton.click() 

        await page.waitForTimeout(500) 

        const blogs = page.locator('div.blog')
        const count = await blogs.count()

        for (let i = 0; i < count; i++) {
        const viewButton = blogs.nth(i).locator('button', { hasText: 'view' })
        if (await viewButton.count() > 0) {
            await viewButton.click()
        }
        }


        let previousLikes = Infinity
        for (let i = 0; i < count; i++) {
            const likesText = await blogs.nth(i).locator('.blog-likes').innerText()
            const likes = parseInt(likesText.match(/\d+/)[0], 10)
            expect(likes).toBeLessThanOrEqual(previousLikes)
            previousLikes = likes
        }
        })


  })

})
