const booksRouter = require('express').Router();
const Book = require('../models/book.js');
const User = require('../models/user.js');
const jwt = require('jsonwebtoken');

booksRouter.get('/', async (request, response) => {
  const books = await Book.find({}).populate('user', { username: 1, name: 1 });

  response.json(books);
});

booksRouter.post('/', async (request, response) => {
  const body = request.body;

  const token = jwt.verify(request.token, process.env.SECRET);

  if (!request.token || !token.id) {
    return response.status(401).json({ error: 'token missing or invalid' });
  }

  const user = await User.findById(token.id);

  const book = new Book({
    title: body.title,
    author: body.author,
    likes: body.likes || 0,
    user: user._id,
  });

  const savedBook = await book.save();

  user.books = user.books.concat(savedBook._id);

  await User.findByIdAndUpdate(user._id.toString(), user);

  await savedBook.populate('user', { username: 1, name: 1 });

  response.json(savedBook);
});

booksRouter.put('/:id', async (request, response) => {
  const body = request.body;
  const user = await User.findById(body.user.id);

  const book = {
    ...body,
    user: user._id,
  };

  const actualizedBook = await Book.findByIdAndUpdate(request.params.id, book, {
    new: true,
  }).populate('user', { username: 1, name: 1 });

  response.json(actualizedBook);
});

booksRouter.delete('/:id', async (request, response) => {
  const token = jwt.verify(request.token, process.env.SECRET);

  if (!request.token || !token.id) {
    return response.status(401).json({ error: 'token missing or invalid' });
  }

  const book = await Book.findById(request.params.id);
  const user = await User.findById(book.user);

  if (user._id.toString() !== book.user.toString()) {
    return response
      .status(401)
      .json({ error: 'Only the creator can delete books' });
  }

  user.books = user.books.filter((b) => b.toString() !== book._id.toString());
  await user.save();

  await book.remove();

  response.status(204).end();
});

module.exports = booksRouter;
