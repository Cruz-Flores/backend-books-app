const config = require('./utils/config');
const express = require('express');
require('express-async-errors');
const app = express();
const morgan = require('morgan');
const cors = require('cors');
const booksRouter = require('./controllers/book.js');
const usersRouter = require('./controllers/user.js');
const loginRouter = require('./controllers/login');
const middleware = require('./utils/middleware.js');
const logger = require('./utils/logger.js');
const mongoose = require('mongoose');

logger.info('connecting to ', config.MONGODB_URI);

mongoose
  .connect(config.MONGODB_URI)
  .then((result) => {
    logger.info('connect to MongoDB');
  })
  .catch((error) => {
    logger.error('error connecting to MongoDB:', error.message);
  });

app.use(cors());
app.use(express.static('build'));
app.use(express.json());
app.use(morgan('tiny'));
app.use(middleware.tokenExtractor);
app.use('/api/books', booksRouter);
app.use('/api/users', usersRouter);
app.use('/api/login', loginRouter);
app.use(middleware.unknownEndpoint);
app.use(middleware.errorHandler);

module.exports = app;
