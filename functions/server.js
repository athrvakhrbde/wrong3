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
  const possiblePaths = [
    path.join(__dirname, 'content', 'posts'),
    path.join(process.cwd(), 'content', 'posts'),
    '/opt/build/repo/content/posts'
  ];
  
  return possiblePaths[0]; // In production, this will be the correct path
};

// Posts endpoint
app.get('/content/posts', async (req, res) => {
  try {
    console.log('Fetching posts...');
    console.log('Current directory:', process.cwd());
    console.log('Function directory:', __dirname);
    
    const postsDir = getPostsDirectory();
    console.log('Looking for posts in:', postsDir);
    
    const files = await fs.readdir(postsDir);
    console.log('Found files:', files);
    
    const posts = await Promise.all(
      files
        .filter(file => file.endsWith('.md'))
        .map(async file => {
          const content = await fs.readFile(path.join(postsDir, file), 'utf-8');
          const { data, content: markdown } = matter(content);
          console.log('Parsed post:', file, data);
          return {
            ...data,
            slug: file.replace('.md', ''),
            body: markdown.trim()
          };
        })
    );
    
    console.log(`Found ${posts.length} posts`);
    res.json(posts.sort((a, b) => new Date(b.date) - new Date(a.date)));
  } catch (error) {
    console.error('Error fetching posts:', error);
    res.json([]);
  }
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
module.exports = app;
module.exports.handler = serverless(app); 