const express = require('express');
const fs = require('fs').promises;
const path = require('path');
const matter = require('gray-matter');
const cors = require('cors');
const serverless = require('serverless-http');

const app = express();

// Enable CORS for all routes
app.use(cors());

// Function to get posts directory based on environment
const getPostsDirectory = () => {
  if (process.env.NETLIFY) {
    // In Netlify Functions, __dirname points to the function's directory
    return path.join(__dirname, 'content', 'posts');
  }
  // In development
  return path.join(process.cwd(), 'content', 'posts');
};

// Posts endpoint
app.get('/content/posts', async (req, res) => {
  try {
    console.log('Fetching posts...');
    console.log('Current directory:', process.cwd());
    console.log('Function directory:', __dirname);
    
    const postsDir = getPostsDirectory();
    console.log('Looking for posts in:', postsDir);
    
    let files;
    try {
      files = await fs.readdir(postsDir);
      console.log('Found files:', files);
    } catch (err) {
      console.error('Error reading posts directory:', err);
      files = [];
    }
    
    const posts = await Promise.all(
      files
        .filter(file => file.endsWith('.md'))
        .map(async file => {
          try {
            const content = await fs.readFile(path.join(postsDir, file), 'utf-8');
            const { data, content: markdown } = matter(content);
            console.log('Parsed post:', file, data);
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

// Handle root path
app.get('/', (req, res) => {
  res.json({ status: 'API is running' });
});

// Serve static files in development
if (process.env.NODE_ENV !== 'production') {
  app.use(express.static('public'));
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

// Export handler for serverless
exports.handler = serverless(app); 