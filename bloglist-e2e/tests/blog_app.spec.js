const { test, expect, beforeEach, describe } = require('@playwright/test')

describe('Blog app', () => {
  beforeEach(async ({ page, request }) => {
    // Reset the test database
    await request.post('http://localhost:3003/api/testing/reset')

    // Create a user for login tests
    const user = {
      name: 'Test User',
      username: 'test',
      password: 'password'
    }
    await request.post('http://localhost:3003/api/users', { data: user })

    await page.goto('http://localhost:5173')
  })

  test('Login form is shown', async ({ page }) => {
    await expect(page.getByRole('heading', { name: /log in to application/i })).toBeVisible()
    await expect(page.getByRole('button', { name: /login/i })).toBeVisible()
  })

  describe('Login', () => {
    test('succeeds with correct credentials', async ({ page }) => {
      // Fill username and password using input types
      await page.locator('input[type="text"]').fill('test')
      await page.locator('input[type="password"]').fill('password')

      await page.getByRole('button', { name: /login/i }).click()

      // Check if the user is logged in
      await expect(page.getByText('Test User logged in')).toBeVisible()
    })

    test('fails with wrong credentials', async ({ page }) => {
      // Fill wrong credentials
      await page.locator('input[type="text"]').fill('test')
      await page.locator('input[type="password"]').fill('wrong')

      await page.getByRole('button', { name: /login/i }).click()

      // Check for error notification
      await expect(page.getByText(/wrong username or password/i)).toBeVisible()
    })
  })
})
