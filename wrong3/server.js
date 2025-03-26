const express = require('express');
const fs = require('fs').promises;
const path = require('path');
const matter = require('gray-matter');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

// Enable CORS for all routes with specific options
app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true
}));

// Create necessary directories if they don't exist
const postsDir = path.join(__dirname, 'content', 'posts');
const imagesDir = path.join(__dirname, 'public', 'images');

// Ensure directories exist
fs.mkdir(postsDir, { recursive: true }).catch(console.error);
fs.mkdir(imagesDir, { recursive: true }).catch(console.error);

// API endpoint to fetch posts
app.get('/content/posts', async (req, res) => {
    try {
        console.log('Fetching posts...');
        const files = await fs.readdir(postsDir);
        const posts = await Promise.all(
            files
                .filter(file => file.endsWith('.md'))
                .map(async (file) => {
                    const content = await fs.readFile(path.join(postsDir, file), 'utf-8');
                    const { data, content: markdown } = matter(content);
                    return {
                        ...data,
                        slug: file.replace('.md', ''),
                        body: markdown
                    };
                })
        );
        console.log(`Found ${posts.length} posts`);
        
        res.setHeader('Content-Type', 'application/json');
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
        res.setHeader('Permissions-Policy', 'interest-cohort=()');
        
        res.json(posts.sort((a, b) => new Date(b.date) - new Date(a.date)));
    } catch (error) {
        console.error('Error reading posts:', error);
        res.setHeader('Content-Type', 'application/json');
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
        res.setHeader('Permissions-Policy', 'interest-cohort=()');
        res.json([]);
    }
});

// Serve static files from the public directory
app.use(express.static(path.join(__dirname, 'public')));

// Handle all other routes by sending index.html
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
}); 