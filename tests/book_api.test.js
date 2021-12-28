const supertest = require('supertest');
const mongoose = require('mongoose');
const helper = require('./test_helper.js');
const app = require('../app.js');
const api = supertest(app);
const Book = require('../models/book.js');
const User = require('../models/user.js');
const bcrypt = require('bcrypt');

beforeEach(async () => {
  await Book.deleteMany({});
  const booksObjects = helper.initialBooks.map((book) => new Book(book));
  const promiseArray = booksObjects.map((book) => book.save());
  await Promise.all(promiseArray);
});

test('books are returned as jason', async () => {
  await api
    .get('/api/books')
    .expect(200)
    .expect('Content-Type', /application\/json/);

  const response = await api.get('/api/books');
  expect(response.body).toHaveLength(helper.initialBooks.length);
});

test('id checker', async () => {
  const bookToEvaluate = await api
    .get(`/api/books/`)
    .expect(200)
    .expect('Content-Type', /application\/json/);

  expect(bookToEvaluate.body[0].id).toBeDefined();
});

test('a book can be added', async () => {
  const id = await helper.saveTestUser();

  const newBook = {
    title: 'Canonical string reduction',
    author: 'Edsger W. Dijkstra',
    likes: 12,
    user: id,
  };

  await api
    .post('/api/books')
    .send(newBook)
    .expect(200)
    .expect('Content-Type', /application\/json/);

  const booksAtEnd = await helper.findBooks();
  expect(booksAtEnd).toHaveLength(helper.initialBooks.length + 1);
});

test('a book without likes property set default 0', async () => {
  const id = await helper.saveTestUser();

  const newBook = {
    title: 'Canonical string reduction',
    author: 'Edsger W. Dijkstra',
    user: id,
  };

  await api
    .post('/api/books')
    .send(newBook)
    .expect(200)
    .expect('Content-Type', /application\/json/);

  const booksAtEnd = await helper.findBooks();
  expect(booksAtEnd[6].likes).toBe(0);
});

test('a book without title cant be added', async () => {
  const id = await helper.saveTestUser();

  const newBook = {
    author: 'Edsger W. Dijkstra',
    likes: 12,
    user: id,
  };

  await api.post('/api/books').send(newBook).expect(400);
});

describe('creation of invalid users return error', () => {
  beforeEach(async () => {
    await User.deleteMany({});

    const passwordHash = await bcrypt.hash('sekret', 10);
    const user = new User({ username: 'test', password: passwordHash });

    await user.save();
  });

  test('request with repeated user return error', async () => {
    const passwordHash = await bcrypt.hash('coil', 10);

    const newUser = new User({
      username: 'Tesla',
      name: 'Nicola',
      password: passwordHash,
    });

    await newUser.save();
    const usersAtTheStart = await helper.usersInDb();

    const repeatedUser = {
      username: 'Tesla',
      name: 'Nicola',
      password: 'coil',
    };

    await api.post('/api/users').send(repeatedUser).expect(400);
    const usersAtTheEnd = await helper.usersInDb();

    expect(usersAtTheEnd).toHaveLength(usersAtTheStart.length);
  });
});

afterAll(() => {
  mongoose.connection.close();
});
