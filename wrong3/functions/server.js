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
  // Log environment for debugging
  console.log('Environment:', process.env.NODE_ENV);
  console.log('Current directory:', process.cwd());
  console.log('Function directory:', __dirname);

  const possiblePaths = [
    path.join(__dirname, 'content', 'posts'),
    path.join(__dirname, '..', 'content', 'posts'),
    path.join(process.cwd(), 'content', 'posts'),
    '/var/task/content/posts', // Netlify Functions path
    path.join(__dirname, 'posts')
  ];

  // Log all possible paths
  console.log('Checking these paths:', possiblePaths);

  // Find first valid path
  for (const dir of possiblePaths) {
    try {
      fs.accessSync(dir);
      console.log('Found valid posts directory:', dir);
      return dir;
    } catch (err) {
      console.log('Path not accessible:', dir);
    }
  }

  // Default to first path if none found
  console.log('No valid path found, defaulting to:', possiblePaths[0]);
  return possiblePaths[0];
};

// Posts endpoint
app.get('/content/posts', async (req, res) => {
  try {
    console.log('Fetching posts...');
    
    const postsDir = getPostsDirectory();
    console.log('Using posts directory:', postsDir);
    
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
            const filePath = path.join(postsDir, file);
            console.log('Reading file:', filePath);
            const content = await fs.readFile(filePath, 'utf-8');
            console.log('File content preview:', content.substring(0, 100));
            const { data, content: markdown } = matter(content);
            console.log('Parsed frontmatter:', data);
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
    console.log(`Found ${validPosts.length} valid posts:`, validPosts.map(p => p.title));
    
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

// Export handler for serverless
exports.handler = serverless(app); 