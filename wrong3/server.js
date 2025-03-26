const express = require('express');
const fs = require('fs').promises;
const path = require('path');
const matter = require('gray-matter');
const cors = require('cors');

const app = express();

// Enable CORS
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type']
}));

// Function to get posts directory
const getPostsDirectory = () => {
  const isDev = process.env.NODE_ENV !== 'production';
  console.log('Environment:', process.env.NODE_ENV);
  console.log('Current directory:', process.cwd());

  if (isDev) {
    return path.join(process.cwd(), 'content', 'posts');
  }
  return path.join(__dirname, 'content', 'posts');
};

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

// Health check endpoint
app.get('/', (req, res) => {
  res.json({ status: 'ok' });
});

// Posts endpoint
app.get('/content/posts', async (req, res) => {
  try {
    console.log('Fetching posts...');
    const postsDir = getPostsDirectory();
    console.log('Posts directory:', postsDir);

    let files;
    try {
      files = await fs.readdir(postsDir);
      console.log('Found files:', files);
    } catch (err) {
      console.error('Error reading posts directory:', err);
      return res.json([]);
    }

    const posts = await Promise.all(
      files
        .filter(file => file.endsWith('.md'))
        .map(async file => {
          try {
            const content = await fs.readFile(path.join(postsDir, file), 'utf-8');
            const { data, content: markdown } = matter(content);
            return {
              ...data,
              slug: file.replace('.md', ''),
              body: markdown.trim()
            };
          } catch (err) {
            console.error('Error reading file:', file, err);
            return null;
          }
        })
    );

    const validPosts = posts.filter(post => post !== null);
    console.log(`Found ${validPosts.length} valid posts`);
    res.json(validPosts.sort((a, b) => new Date(b.date) - new Date(a.date)));
  } catch (error) {
    console.error('Error in posts endpoint:', error);
    res.json([]);
  }
});

// Start server
const PORT = process.env.PORT || 4000;
const server = app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}).on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`Port ${PORT} is already in use. Please try a different port.`);
    process.exit(1);
  } else {
    console.error('Server error:', err);
    process.exit(1);
  }
}); 