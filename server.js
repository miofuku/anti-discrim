const express = require('express');
const path = require('path');
const fs = require('fs').promises;
const AppError = require('./errors');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.static('public'));
app.use(express.json());

// Helper function to catch async errors
const catchAsync = fn => {
  return (req, res, next) => {
    fn(req, res, next).catch(next);
  };
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
  const data = await fs.readFile(path.join(__dirname, 'data', 'posts.json'), 'utf8');
  res.json(JSON.parse(data));
}));

app.post('/api/posts', catchAsync(async (req, res) => {
  const { title, content, type } = req.body;

  if (!title || !content || !type) {
    throw new AppError('Please provide title, content, and type', 400);
  }

  const posts = JSON.parse(await fs.readFile(path.join(__dirname, 'data', 'posts.json'), 'utf8'));
  const newPost = {
    id: Date.now(),
    title,
    content,
    type,
    timestamp: new Date().toISOString()
  };
  posts.push(newPost);
  await fs.writeFile(path.join(__dirname, 'data', 'posts.json'), JSON.stringify(posts, null, 2));
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