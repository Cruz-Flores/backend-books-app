const Book = require('../models/book.js');
const User = require('../models/user.js');
const bcrypt = require('bcrypt');

const initialBooks = [
  {
    title: 'React patterns',
    author: 'Michael Chan',
    likes: 7,
  },
  {
    title: 'Go To Statement Considered Harmful',
    author: 'Edsger W. Dijkstra',
    likes: 5,
  },
  {
    title: 'Canonical string reduction',
    author: 'Edsger W. Dijkstra',
    likes: 12,
  },
  {
    title: 'First class tests',
    author: 'Robert C. Martin',
    likes: 10,
  },
  {
    title: 'TDD harms architecture',
    author: 'Robert C. Martin',
    likes: 0,
  },
  {
    title: 'Type wars',
    author: 'Robert C. Martin',
    likes: 2,
  },
];

const saveTestUser = async () => {
  await User.deleteMany({});
  const passwordHash = await bcrypt.hash('coil', 10);

  const testUser = new User({
    username: 'Tesla',
    name: 'Nicola',
    password: passwordHash,
  });

  const newUser = await testUser.save();

  return newUser.id;
};

const findBooks = async () => {
  const books = await Book.find({});
  return books.map((book) => book.toJSON());
};

const usersInDb = async () => {
  const users = await User.find({});
  return users.map((u) => u.toJSON());
};

module.exports = {
  initialBooks,
  findBooks,
  usersInDb,
  saveTestUser,
};
