const { test, describe } = require('node:test')
const assert = require('node:assert')

const listHelper = require('../utils/list_helper')

test('dummy returns one', () => {
  const blogs = []

  const result = listHelper.dummy(blogs)
  assert.strictEqual(result, 1)
})

describe('total likes', () => {
  const listWithOneBlog = [
    {
      _id: '5a422aa71b54a676234d17f8',
      title: 'Go To Statement Considered Harmful',
      author: 'Edsger W. Dijkstra',
      url: 'https://homepages.cwi.nl/~storm/teaching/reader/Dijkstra68.pdf',
      likes: 5,
      __v: 0
    }
  ]

  test('when list has only one blog, equals the likes of that', () => {
    const result = listHelper.totalLikes(listWithOneBlog)
    assert.strictEqual(result, 5)
  })
})

describe('favorite blog', () => {
  const blogs = [
    {
      _id: '1',
      title: 'First blog',
      author: 'Alice',
      url: 'http://example.com/1',
      likes: 5,
    },
    {
      _id: '2',
      title: 'Second blog',
      author: 'Bob',
      url: 'http://example.com/2',
      likes: 12,
    },
    {
      _id: '3',
      title: 'Third blog',
      author: 'Carol',
      url: 'http://example.com/3',
      likes: 8,
    }
  ]

  test('returns the blog with the most likes', () => {
    const result = listHelper.favoriteBlog(blogs)

    assert.deepStrictEqual(result, blogs[1])
  })
})


describe('most blogs', () => {
  const blogs = [
    {
      _id: '1',
      title: 'Clean Code',
      author: 'Robert C. Martin',
      url: 'http://example.com/1',
      likes: 10,
    },
    {
      _id: '2',
      title: 'Agile Software Development',
      author: 'Robert C. Martin',
      url: 'http://example.com/2',
      likes: 7,
    },
    {
      _id: '3',
      title: 'Refactoring',
      author: 'Martin Fowler',
      url: 'http://example.com/3',
      likes: 5,
    },
    {
      _id: '4',
      title: 'The Clean Coder',
      author: 'Robert C. Martin',
      url: 'http://example.com/4',
      likes: 3,
    },
    {
      _id: '5',
      title: 'Domain-Driven Design',
      author: 'Eric Evans',
      url: 'http://example.com/5',
      likes: 8,
    }
  ]

  test('returns the author with the most blogs', () => {
    const result = listHelper.mostBlogs(blogs)

    assert.deepStrictEqual(result, {
      author: 'Robert C. Martin',
      blogs: 3
    })
  })
})

describe('most likes', () => {
  const blogs = [
    {
      _id: '1',
      title: 'Go To Statement Considered Harmful',
      author: 'Edsger W. Dijkstra',
      url: 'http://example.com/1',
      likes: 5,
    },
    {
      _id: '2',
      title: 'Another Dijkstra blog',
      author: 'Edsger W. Dijkstra',
      url: 'http://example.com/2',
      likes: 12,
    },
    {
      _id: '3',
      title: 'Clean Code',
      author: 'Robert C. Martin',
      url: 'http://example.com/3',
      likes: 10,
    },
    {
      _id: '4',
      title: 'Agile Software Development',
      author: 'Robert C. Martin',
      url: 'http://example.com/4',
      likes: 7,
    }
  ]

  test('returns the author with the most total likes', () => {
    const result = listHelper.mostLikes(blogs)

    assert.deepStrictEqual(result, {
      author: 'Edsger W. Dijkstra',
      likes: 17
    })
  })
})