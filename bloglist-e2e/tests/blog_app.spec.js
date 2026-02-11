const { test, expect } = require('@playwright/test')

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
      await page.locator('input').nth(0).fill('test')
      await page.locator('input').nth(1).fill('password')
      await page.getByRole('button', { name: /login/i }).click()
      await expect(page.getByText('Test User logged in')).toBeVisible()
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
      await page.locator('input').nth(0).fill('test')
      await page.locator('input').nth(1).fill('password')
      await page.getByRole('button', { name: /login/i }).click()
      await expect(page.getByText('Test User logged in')).toBeVisible()
    })

    test('a new blog can be created', async ({ page }) => {

      await page.getByRole('button', { name: /create new blog/i }).click()

      const inputs = page.locator('input')
      const count = await inputs.count()
      await inputs.nth(count - 3).fill('My New Blog')
      await inputs.nth(count - 2).fill('John Doe')
      await inputs.nth(count - 1).fill('http://example.com')

      await page.getByRole('button', { name: /create/i }).click()

      const blog = page.locator('div.blog').filter({ hasText: 'My New Blog' }).first()
      await expect(blog).toBeVisible({ timeout: 10000 })

      const author = blog.locator('span.blog-author').filter({ hasText: 'John Doe' }).first()
      await expect(author).toBeVisible()
    })

    test('a blog can be liked', async ({ page }) => {

        await page.getByRole('button', { name: /create new blog/i }).click()
        const inputs = page.locator('input')
        const count = await inputs.count()
        await inputs.nth(count - 3).fill('Likeable Blog')
        await inputs.nth(count - 2).fill('Jane Doe')
        await inputs.nth(count - 1).fill('http://example.com')
        await page.getByRole('button', { name: /create/i }).click()

        const blog = page.locator('div.blog').filter({ hasText: 'Likeable Blog' }).first()
        await expect(blog).toBeVisible({ timeout: 10000 })

        const viewButton = blog.locator('button').filter({ hasText: 'view' }).first()
        await viewButton.click()

        const likesDiv = blog.locator('div.blog-likes').first()

        const initialLikes = parseInt((await likesDiv.innerText()).match(/\d+/)[0], 10)

        const likeButton = likesDiv.locator('button').filter({ hasText: 'like' }).first()
        await likeButton.click()

        await expect(likesDiv).toHaveText(new RegExp(`likes ${initialLikes + 1}`))

        const newLikes = parseInt((await likesDiv.innerText()).match(/\d+/)[0], 10)
        expect(newLikes).toBe(initialLikes + 1)
        })

    test('user who created a blog can delete it', async ({ page }) => {

        await page.getByRole('button', { name: /create new blog/i }).click()
        const inputs = page.locator('input')
        const count = await inputs.count()
        await inputs.nth(count - 3).fill('Deletable Blog')
        await inputs.nth(count - 2).fill('John Doe')
        await inputs.nth(count - 1).fill('http://example.com')
        await page.getByRole('button', { name: /create/i }).click()

        const blog = page.locator('div.blog').filter({ hasText: 'Deletable Blog' }).first()
        await expect(blog).toBeVisible({ timeout: 10000 })

        const viewButton = blog.locator('button').filter({ hasText: 'view' }).first()
        await viewButton.click()

        page.once('dialog', dialog => dialog.accept())

        const removeButton = blog.locator('button').filter({ hasText: 'remove' }).first()
        await removeButton.click()

        await expect(blog).toHaveCount(0)
    })


  })
})
