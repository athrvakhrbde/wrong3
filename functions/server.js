const express = require('express');
const fs = require('fs').promises;
const path = require('path');
const matter = require('gray-matter');

const app = express();

// API endpoint to fetch posts
app.get('/content/posts', async (req, res) => {
    try {
        console.log('Fetching posts...');
        const postsDir = path.join(process.cwd(), 'content', 'posts');
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
        res.json(posts.sort((a, b) => new Date(b.date) - new Date(a.date)));
    } catch (error) {
        console.error('Error reading posts:', error);
        res.json([]);
    }
});

// Handle all other routes
app.get('*', (req, res) => {
    res.status(404).json({ error: 'Not found' });
});

// Export the Express app as a Netlify function
exports.handler = app; 