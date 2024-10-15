require('dotenv').config();
const express = require('express');
const path = require('path');
const connectDB = require('./db');
const Post = require('./models/Post');
const AppError = require('./errors');
const { postSchema } = require('./validation');
const i18n = require('i18n');
const cookieParser = require('cookie-parser');

const app = express();
const PORT = process.env.PORT || 3000;

// Connect to MongoDB
connectDB();

// Use cookie-parser middleware
app.use(cookieParser());

// Configure i18n
i18n.configure({
    locales: ['en', 'zh'],
    defaultLocale: 'zh', // Set default locale to Chinese
    directory: path.join(__dirname, 'locales'),
    objectNotation: true,
    cookie: 'lang',
    queryParameter: 'lang',
    register: global,
    updateFiles: false,
    syncFiles: false
});

// Custom middleware to handle language setting
app.use((req, res, next) => {
    let lang = req.query.lang || req.cookies.lang || 'zh'; // Default to 'zh' if not specified
    if (!['en', 'zh'].includes(lang)) {
        lang = 'zh';
    }
    res.cookie('lang', lang, { maxAge: 31536000000, httpOnly: true }); // Set for 1 year to match client-side
    i18n.setLocale(lang);
    res.locals.language = lang;
    next();
});

// Use i18n middleware
app.use(i18n.init);

// Set up EJS
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Serve static files
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
    const currentLang = i18n.getLocale();
    res.render('index', {
        path: req.path,
        language: currentLang,
        debugInfo: {
            language: currentLang,
            locale: currentLang,
            introTitle: res.__('intro.title'),
            availableLocales: i18n.getLocales(),
            translations: {
                'intro.title': res.__('intro.title'),
                'intro.subtitle': res.__('intro.subtitle'),
                'intro.welcome': res.__('intro.welcome')
            }
        }
    });
});
app.get('/posts', (req, res) => {
  res.render('posts', {
    path: req.path,
    language: i18n.getLocale(req)
  });
});

app.get('/about', (req, res) => {
  res.render('about', {
    path: req.path,
    language: i18n.getLocale(req)
  });
});

app.get('/help-support', (req, res) => {
    res.render('help-support', {
        path: req.path,
        language: i18n.getLocale(req)
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
  const newPost = new Post({
      name,
      title,
      content,
      tags,
      userType,
      background
  });
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