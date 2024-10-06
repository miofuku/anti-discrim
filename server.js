const express = require('express');
const path = require('path');
const fs = require('fs').promises;

const app = express();
const PORT = process.env.PORT || 3000;

// Serve static files
app.use(express.static('public'));

// Parse JSON bodies
app.use(express.json());

// Route for the home page
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Route for the posts page
app.get('/posts', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'posts.html'));
});

// API route to get posts
app.get('/api/posts', async (req, res) => {
    try {
        const data = await fs.readFile(path.join(__dirname, 'data', 'posts.json'), 'utf8');
        res.json(JSON.parse(data));
    } catch (error) {
        res.status(500).json({ error: 'Error reading posts' });
    }
});

// API route to create a post
app.post('/api/posts', async (req, res) => {
    try {
        const posts = JSON.parse(await fs.readFile(path.join(__dirname, 'data', 'posts.json'), 'utf8'));
        const newPost = {
            id: Date.now(),
            ...req.body,
            timestamp: new Date().toISOString()
        };
        posts.push(newPost);
        await fs.writeFile(path.join(__dirname, 'data', 'posts.json'), JSON.stringify(posts, null, 2));
        res.status(201).json(newPost);
    } catch (error) {
        res.status(500).json({ error: 'Error creating post' });
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});