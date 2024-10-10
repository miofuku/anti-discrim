require('dotenv').config();
const express = require('express');
const path = require('path');
const connectDB = require('./db');
const Post = require('./models/Post');
const AppError = require('./errors');
const { postSchema } = require('./validation');
const i18n = require('i18n');

const app = express();
const PORT = process.env.PORT || 3000;

// Connect to MongoDB
connectDB();

// Configure i18n
i18n.configure({
  locales: ['en', 'zh'],
  directory: path.join(__dirname, 'locales'),
  defaultLocale: 'en',
  cookie: 'lang',
  objectNotation: true
});

// Set up EJS
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Use i18n middleware
app.use(i18n.init);

// Middleware
app.use(express.static(path.join(__dirname, 'public')));

// Helper function to catch async errors
const catchAsync = fn => {
  return (req, res, next) => {
    fn(req, res, next).catch(next);
  };
};

// Validation middleware
const validatePost = (req, res, next) => {
  const { error } = postSchema.validate(req.body);
  if (error) {
    const errorMessage = error.details.map(detail => detail.message).join(', ');
    throw new AppError(errorMessage, 400);
  }
  next();
};

// Routes
app.get('/', (req, res) => {
  res.render('index', {
    path: req.path
  });
});

app.get('/posts', (req, res) => {
  res.render('posts', {
    path: req.path,
  });
});

app.get('/about', (req, res) => {
  res.render('about', {
    path: req.path,
  });
});

app.get('/help-support', (req, res) => {
  res.render('help-support', {
    path: req.path,
  });
});

// API routes
app.get('/api/posts', catchAsync(async (req, res) => {
  try {
    let query = {};
    if (req.query.tags) {
      const tagArray = req.query.tags.split(',');
      query.tags = { $all: tagArray };
    }
    const posts = await Post.find(query).sort({ timestamp: -1 });
    res.json(posts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}));

app.post('/api/posts', validatePost, catchAsync(async (req, res) => {
  const { name, title, content, tags, userType, background } = req.body;
  const newPost = new Post({ name, title, content, tags, userType, background });
  await newPost.save();
  res.status(201).json(newPost);
}));

// Error handling middleware
app.use((req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

app.use((err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  res.status(err.statusCode).json({
    status: err.status,
    message: err.message
  });
});

// Server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

// Unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.log('UNHANDLED REJECTION! 💥 Shutting down...');
  console.log(err.name, err.message);
  process.exit(1);
});

// Uncaught exceptions
process.on('uncaughtException', (err) => {
  console.log('UNCAUGHT EXCEPTION! 💥 Shutting down...');
  console.log(err.name, err.message);
  process.exit(1);
});