const { test, describe, beforeEach, after } = require('node:test')
const assert = require('node:assert')
const mongoose = require('mongoose')
const supertest = require('supertest')
const app = require('../app')
const User = require('../models/user')

const api = supertest(app)

beforeEach(async () => {
  await User.deleteMany({})

  const user = new User({
    username: 'root',
    passwordHash: 'hashedpassword',
  })

  await user.save()
})

describe('user creation', () => {
  test('succeeds with a fresh username', async () => {
    const newUser = {
      username: 'xavier',
      name: 'Xavier Alves',
      password: 'secret123',
    }

    const response = await api
      .post('/api/users')
      .send(newUser)
      .expect(201)
      .expect('Content-Type', /application\/json/)

    assert.strictEqual(response.body.username, newUser.username)

    const users = await User.find({})
    assert.strictEqual(users.length, 2)
  })

  test('fails if username is taken', async () => {
    const newUser = {
      username: 'root',
      password: 'secret123',
    }

    const response = await api
      .post('/api/users')
      .send(newUser)
      .expect(400)

    assert(response.body.error.includes('unique'))
  })

  test('fails if password is too short', async () => {
    const newUser = {
      username: 'ab',
      password: '12',
    }

    const response = await api
      .post('/api/users')
      .send(newUser)
      .expect(400)

    assert(response.body.error)
  })

  test('fails if username or password missing', async () => {
    const newUser = {
      username: 'validname',
    }

    const response = await api
      .post('/api/users')
      .send(newUser)
      .expect(400)

    assert(response.body.error)
  })
})

after(async () => {
  await mongoose.connection.close()
})
