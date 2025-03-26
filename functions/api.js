const express = require('express');
const serverless = require('serverless-http');
const fs = require('fs').promises;
const path = require('path');
const matter = require('gray-matter');
const cors = require('cors');

const app = express();
app.use(cors());

// Posts endpoint
app.get('/api/posts', async (req, res) => {
  try {
    console.log('Fetching posts...');
    
    // In Netlify Functions environment
    const postsDir = path.join(__dirname, '../content/posts');
    
    let files = [];
    try {
      files = await fs.readdir(postsDir);
    } catch (err) {
      console.error('Error reading posts directory:', err);
    }
    
    const posts = await Promise.all(
      files
        .filter(file => file.endsWith('.md'))
        .map(async file => {
          const content = await fs.readFile(path.join(postsDir, file), 'utf-8');
          const { data, content: markdown } = matter(content);
          return {
            ...data,
            slug: file.replace('.md', ''),
            content: markdown
          };
        })
    );
    
    res.json(posts);
  } catch (error) {
    console.error('Error fetching posts:', error);
    res.status(500).json({ error: 'Failed to fetch posts' });
  }
});

// Health check endpoint
app.get('/api', (req, res) => {
  res.json({ message: 'API is working!' });
});

module.exports.handler = serverless(app);
