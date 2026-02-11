// tests/blog_app.spec.js
const { test, expect } = require('@playwright/test')

test.describe('Blog app', () => {

  // Executa antes de cada teste
  test.beforeEach(async ({ page, request }) => {
    // Reset da base de dados
    await request.post('http://localhost:3003/api/testing/reset')

    // Cria um utilizador para login
    const user = {
      name: 'Test User',
      username: 'test',
      password: 'password'
    }
    await request.post('http://localhost:3003/api/users', { data: user })

    // Vai para a página principal
    await page.goto('http://localhost:5173')
  })

  // Teste 1: Login form is shown
  test('Login form is shown', async ({ page }) => {
    await expect(page.getByRole('heading', { name: /log in to application/i })).toBeVisible()
    await expect(page.getByRole('button', { name: /login/i })).toBeVisible()
  })

  // Testes de login
  test.describe('Login', () => {
    test('succeeds with correct credentials', async ({ page }) => {
      const inputs = await page.locator('input')
      await inputs.nth(0).fill('test')       // username
      await inputs.nth(1).fill('password')   // password
      await page.getByRole('button', { name: /login/i }).click()

      await expect(page.getByText('Test User logged in')).toBeVisible()
    })

    test('fails with wrong credentials', async ({ page }) => {
      const inputs = await page.locator('input')
      await inputs.nth(0).fill('test')       // username
      await inputs.nth(1).fill('wrong')      // password
      await page.getByRole('button', { name: /login/i }).click()

      await expect(page.getByText(/wrong username or password/i)).toBeVisible()
    })
  })

  // Teste de criar novo blog
  test.describe('When logged in', () => {
    test.beforeEach(async ({ page }) => {
      // Login
      const inputs = await page.locator('input')
      await inputs.nth(0).fill('test')
      await inputs.nth(1).fill('password')
      await page.getByRole('button', { name: /login/i }).click()
      await expect(page.getByText('Test User logged in')).toBeVisible()
    })

    test('a new blog can be created', async ({ page }) => {
      // Abre o formulário "create new blog"
      await page.getByRole('button', { name: /create new blog/i }).click()

      const blogInputs = await page.locator('input')
      // Os inputs de create blog são os últimos três na página
      const count = await blogInputs.count()
      await blogInputs.nth(count - 3).fill('My New Blog')     // title
      await blogInputs.nth(count - 2).fill('John Doe')        // author
      await blogInputs.nth(count - 1).fill('http://example.com') // url

      await page.getByRole('button', { name: /create/i }).click()

      // Verifica se o novo blog aparece na lista
      await expect(page.locator('span.blog-title', { hasText: 'My New Blog' })).toBeVisible()
      await expect(page.getByText('John Doe')).toBeVisible()
    })
  })
})
