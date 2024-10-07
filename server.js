require('dotenv').config();
const express = require('express');
const path = require('path');
const connectDB = require('./db');
const Post = require('./models/Post');
const AppError = require('./errors');
const { postSchema } = require('./validation');

const app = express();
const PORT = process.env.PORT || 3000;

// Connect to MongoDB
connectDB();

// Middleware
app.use(express.static('public'));
app.use(express.json());

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
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/posts', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'posts.html'));
});

// API routes
app.get('/api/posts', catchAsync(async (req, res) => {
  const posts = await Post.find().sort({ timestamp: -1 });
  res.json(posts);
}));

app.post('/api/posts', validatePost, catchAsync(async (req, res) => {
  const { name, title, content, type } = req.body;
  const newPost = new Post({ name, title, content, type });
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