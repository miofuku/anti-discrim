require('dotenv').config();
const express = require('express');
const rateLimit = require('express-rate-limit');
const path = require('path');
const Post = require('../models/Post');
const AppError = require('../errors');
const { postSchema } = require('../validation');
const cookieParser = require('cookie-parser');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const mongoose = require('mongoose');
const hpp = require('hpp');
const cors = require('cors');
const content = require('../config/content.json');
const geoip = require('geoip-lite');
const requestIp = require('request-ip');
const useragent = require('express-useragent');

// Use environment variable for database connection
const dbUri = process.env.MONGODB_URI;

mongoose.connect(dbUri, {
    serverSelectionTimeoutMS: 30000,
    socketTimeoutMS: 45000,
    retryWrites: true,
    retryReads: true,
    w: 'majority',
    maxPoolSize: 5  // Add connection pool limit
}).then(() => {
    console.log('Connected to MongoDB');
})
.catch(err => {
    console.error('Error connecting to MongoDB:', err);
});

const app = express();
const PORT = process.env.PORT || 3000;

// Trust proxy settings for rate limiting behind reverse proxy
app.set('trust proxy', 1);

// Helper functions for user agent parsing
function getPlatform(userAgent) {
    const ua = useragent.parse(userAgent);
    return ua.platform || 'unknown';
}

function getBrowser(userAgent) {
    const ua = useragent.parse(userAgent);
    return ua.browser || 'unknown';
}

// Simple content analysis functions
function analyzeTopicCategory(content, tags) {
    // For now, just use the first tag as category
    return tags[0] || 'general';
}

function analyzeSentiment(content) {
    // Simple sentiment analysis based on content length
    // This is a placeholder - you might want to use a proper sentiment analysis library
    return content.length > 500 ? 'detailed' : 'brief';
}

// Use express-useragent middleware
app.use(useragent.express());

// Rate limiting configurations
const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per 15 minutes
    message: { message: '请求过于频繁，请稍后再试' },
    standardHeaders: true,
    legacyHeaders: false
});

const createPostLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 5, // Limit each IP to 5 posts per hour
    message: { message: '发布太频繁，请稍后再试' }
});

// Apply rate limiters
app.use('/api/posts', apiLimiter);  // General API limit
app.post('/api/posts', createPostLimiter);  // Post creation limit

// Use cookie-parser middleware
app.use(cookieParser());

// Add this middleware to log request details
app.use((req, res, next) => {
    // console.log(`Request URL: ${req.url}`);
    // console.log(`Cookie Language: ${req.cookies.lang}`);
    // console.log(`Query Language: ${req.query.lang}`);
    // console.log(`Current Language: ${i18n.getLocale(req)}`);
    next();
});

// Parse JSON and URL-encoded bodies
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

// Set up EJS
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, '../views'));

// Serve static files
app.use(express.static(path.join(__dirname, '../public')));

// Security middleware
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'", "https://js.hcaptcha.com", "https://*.hcaptcha.com", "https://scripts.simpleanalyticscdn.com"],
            styleSrc: ["'self'", "'unsafe-inline'"],
            imgSrc: ["'self'", "data:", "https:", "https://*.hcaptcha.com"],
            frameSrc: ["'self'", "https://*.hcaptcha.com"],
            connectSrc: ["'self'", "https://api.counterwind.de", "https://simpleanalytics.com"],
            workerSrc: ["'self'", "blob:"],
            childSrc: ["'self'", "blob:"],
            scriptSrcAttr: ["'unsafe-inline'"],
            upgradeInsecureRequests: process.env.NODE_ENV === 'production' ? [] : null
        },
    },
    crossOriginEmbedderPolicy: false,
    crossOriginResourcePolicy: { policy: "cross-origin" }
}));

// Prevent parameter pollution
app.use(hpp());

// CORS configuration
const corsOptions = {
    origin: process.env.NODE_ENV === 'production' 
        ? ['https://counterwind.de', 'https://www.counterwind.de']
        : true,
    methods: ['GET', 'POST'],
    credentials: true,
    maxAge: 86400
};
app.use(cors(corsOptions));

// Data cleaning
app.use(mongoSanitize());  // Avoid MongoDB injection
app.use(xss());  // Avoid XSS attacks

// Add security-related HTTP headers
app.use((req, res, next) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    next();
});

// IP address middleware
app.use(requestIp.mw());

// Add these headers for better crawling
app.use((req, res, next) => {
    res.header('X-Robots-Tag', 'index, follow');
    res.header('Cache-Control', 'public, max-age=3600');
    next();
});

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
        return res.status(400).json({
            message: error.details[0].message
        });
    }
    next();
};

// Routes
app.get('/', (req, res) => {
    res.render('index', {
        path: req.path,
        content: content
    });
});

app.get('/posts', async (req, res) => {
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    
    try {
        let postsData = {};
        const baseUrl = process.env.NODE_ENV === 'production' ? 'https://www.counterwind.de' : 'http://localhost:3000';
        
        if (req.query.id) {
            const post = await Post.findById(req.query.id);
            if (!post) {
                return res.status(404).render('404');
            }
            postsData = { 
                posts: [post.toObject()], 
                total: 1, 
                pages: 1, 
                currentPage: 1,
                canonicalUrl: `${baseUrl}/posts?id=${post._id}`
            };
        } else {
            // Fetch all posts, similar to /api/posts
            const page = parseInt(req.query.page) || 1;
            const limit = 5;
            const skip = (page - 1) * limit;
            let query = {};
            if (req.query.tags) {
                const tagArray = req.query.tags.split(',');
                query.tags = { $all: tagArray };
            }
            const total = await Post.countDocuments(query);
            const posts = await Post.find(query)
                .sort({ timestamp: -1 })
                .skip(skip)
                .limit(limit);

            postsData = { posts: posts.map(p => p.toObject()), total: total, pages: Math.ceil(total/limit), currentPage: page};
            postsData.canonicalUrl = `${baseUrl}/posts`;
        }

        res.render('posts', {
            path: req.path,
            content: content,
            posts: postsData.posts,
            total: postsData.total,
            pages: postsData.pages,
            currentPage: postsData.currentPage,
            canonicalUrl: postsData.canonicalUrl
        });

    } catch (error) {
        console.error("Error rendering /posts:", error);
        res.status(500).render('error', { message: 'Error loading page' });
    }
});

app.get('/about', (req, res) => {
    res.render('about', {
        path: req.path,
        content: content
    });
});

app.get('/help-support', (req, res) => {
    res.render('help-support', {
        path: req.path,
        content: content
    });
});

// API routes
app.get('/api/posts', catchAsync(async (req, res) => {
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = 5;
        const skip = (page - 1) * limit;

        let query = {};
        
        // Add more detailed logging
        console.log('Request query:', req.query);
        console.log('Pagination:', { page, limit, skip });

        if (req.query.tags) {
            const tagArray = req.query.tags.split(',');
            query.tags = { $all: tagArray };
        }

        // Log the query being sent to MongoDB
        console.log('MongoDB query:', JSON.stringify(query));

        const total = await Post.countDocuments(query);
        console.log('Total documents found:', total);

        const posts = await Post.find(query)
            .sort({ timestamp: -1 })
            .skip(skip)
            .limit(limit)
            .lean(); // Add lean() for better performance

        console.log('Posts retrieved:', posts.length);

        // Transform tags before sending response
        const translatedPosts = posts.map(post => {
            if (!post.tags) return post; // Guard against undefined tags
            
            const doc = { ...post };
            if (content && content.form && content.form.tags) {
                doc.tags = doc.tags.map(tag => {
                    const tagConfig = content.form.tags.find(t => t.value === tag);
                    return {
                        value: tag,
                        label: tagConfig ? tagConfig.label : tag
                    };
                });
            }
            return doc;
        });

        res.json({
            posts: translatedPosts,
            total,
            pages: Math.ceil(total / limit),
            currentPage: page
        });
    } catch (error) {
        console.error('Detailed error in /api/posts:', {
            message: error.message,
            stack: error.stack,
            name: error.name
        });
        
        res.status(500).json({
            message: '获取故事时出错',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
}));

app.post('/api/posts', validatePost, catchAsync(async (req, res) => {
    // Verify hCaptcha
    const hcaptchaResponse = req.body['h-captcha-response'];
    if (!hcaptchaResponse) {
        return res.status(400).json({ message: '请完成人机验证' });
    }

    const verifyUrl = 'https://hcaptcha.com/siteverify';
    const verifyResult = await fetch(verifyUrl, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
            secret: process.env.HCAPTCHA_SECRET_KEY,
            response: hcaptchaResponse
        })
    }).then(res => res.json());

    if (!verifyResult.success) {
        return res.status(400).json({ message: '人机验证失败，请重试' });
    }

    const { name, title, content, tags, userType, background } = req.body;
    
    // Device information collection
    const userAgent = req.get('user-agent');
    const device = {
        userAgent,
        platform: getPlatform(userAgent),
        browser: getBrowser(userAgent)
    };
    
    // Content analysis
    const contentAnalysis = {
        wordCount: content.length,
        topicCategory: analyzeTopicCategory(content, tags),
        sentiment: analyzeSentiment(content)
    };
    
    // Get client IP address
    const clientIp = req.clientIp;
    
    // Use geoip-lite to find location information
    const geo = geoip.lookup(clientIp);
    
    // Build location string
    let location = '未知';
    if (geo) {
        const city = geo.city || '';
        const region = geo.region || '';
        const country = geo.country || '';
        location = [city, region, country].filter(Boolean).join(', ');
    }
    
    const newPost = new Post({
        name,
        title,
        content,
        tags,
        userType,
        background,
        location,
        ipAddress: clientIp,
        device,
        referrer: req.get('referrer'),
        compositionTime: req.body.compositionTime,
        contentAnalysis
    });
    
    await newPost.save();
    
    // Return only the fields we want to expose
    res.status(201).json({
        _id: newPost._id,
        name: newPost.name,
        title: newPost.title,
        content: newPost.content,
        tags: newPost.tags,
        userType: newPost.userType,
        background: newPost.background,
        timestamp: newPost.timestamp
    });
}));

// Add view count
app.get('/api/posts/:id', catchAsync(async (req, res) => {
    await Post.findByIdAndUpdate(req.params.id, {
        $inc: { 'interactions.views': 1 }
    });
}));

app.get('/sitemap.xml', async (req, res) => {
    try {
        const posts = await Post.find({}).sort({ timestamp: -1 }).select('_id timestamp'); // Only fetch necessary fields

        let sitemap = '<?xml version="1.0" encoding="UTF-8"?>\n';
        sitemap += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';

        const baseUrl = process.env.NODE_ENV === 'production' ? 'https://www.counterwind.de' : 'http://localhost:3000';
        const staticPages = ['', '/posts', '/help-support', '/about'];

        staticPages.forEach(page => {
            sitemap += `  <url>\n`;
            sitemap += `    <loc>${baseUrl}${page}</loc>\n`;
            sitemap += `    <lastmod>${new Date().toISOString()}</lastmod>\n`;
            sitemap += `  </url>\n`;
        });

        // Use for...of loop for better async handling
        for (const post of posts) {
            sitemap += `  <url>\n`;
            sitemap += `    <loc>${baseUrl}/posts?id=${post._id}</loc>\n`;
            // Handle potential missing timestamp more gracefully
            sitemap += `    <lastmod>${post.timestamp ? post.timestamp.toISOString() : new Date().toISOString()}</lastmod>\n`;
            sitemap += `  </url>\n`;
        }

        sitemap += '</urlset>\n';

        res.header('Content-Type', 'application/xml');
        res.send(sitemap);

    } catch (error) {
        console.error('Sitemap generation error:', error);
        // Provide more detailed error information in development
        if (process.env.NODE_ENV === 'development') {
            res.status(500).send(`Error generating sitemap: ${error.message}<br><pre>${error.stack}</pre>`);
        } else {
            res.status(500).send('Error generating sitemap');
        }
    }
});

// Error handling middleware
app.use((req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

// Global error handling middleware
app.use((err, req, res, next) => {
    console.error('Error details:', {
        message: err.message,
        stack: err.stack,
        path: req.path,
        method: req.method,
        query: req.query,
        body: req.body
    });

    // Handle different types of errors
    if (err.name === 'ValidationError') {
        return res.status(400).json({
            message: '输入数据无效',
            details: process.env.NODE_ENV === 'development' ? err.message : undefined
        });
    }

    if (err.code === 11000) {
        return res.status(400).json({
            message: '数据已存在'
        });
    }

    // Default error response
    res.status(err.status || 500).json({
        message: process.env.NODE_ENV === 'production' 
            ? '服务器出错了，请稍后再试'
            : err.message
    });
});

// Add production error handling
if (process.env.NODE_ENV === 'production') {
    app.use((err, req, res, next) => {
        console.error('Error:', {
            message: err.message,
            stack: err.stack,
            timestamp: new Date().toISOString(),
            path: req.path,
            method: req.method,
            ip: req.ip
        });

        // Different types of errors
        if (err.name === 'ValidationError') {
            return res.status(400).json({
                message: '输入数据无效'
            });
        }

        if (err.code === 11000) {  // MongoDB duplicate key error
            return res.status(400).json({
                message: '数据已存在'
            });
        }

        // General error response
        res.status(500).json({
            message: '服务器出错了，请稍后再试'
        });
    });
}

// Record all requests
app.use((req, res, next) => {
    if (process.env.NODE_ENV === 'production') {
        console.log({
            timestamp: new Date().toISOString(),
            method: req.method,
            path: req.path,
            ip: req.ip,
            userAgent: req.get('user-agent')
        });
    }
    next();
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

module.exports = app; 