import fs from 'fs';
import path from 'path';

export default function handler(req, res) {
  try {
    const postsDirectory = path.join(process.cwd(), 'content/posts');
    
    // Check if directory exists
    if (!fs.existsSync(postsDirectory)) {
      console.log('Posts directory not found');
      return res.status(200).json([]);
    }
    
    const fileNames = fs.readdirSync(postsDirectory);
    
    const posts = fileNames.map(fileName => {
      try {
        const fullPath = path.join(postsDirectory, fileName);
        const fileContents = fs.readFileSync(fullPath, 'utf8');
        
        // Parse JSON content or return raw content for non-JSON files
        try {
          return JSON.parse(fileContents);
        } catch (e) {
          return { title: fileName, content: fileContents };
        }
      } catch (err) {
        console.error(`Error reading file ${fileName}:`, err);
        return null;
      }
    }).filter(Boolean);
    
    console.log(`Found ${posts.length} posts`);
    return res.status(200).json(posts);
  } catch (error) {
    console.error('Error in API route:', error);
    return res.status(500).json({ error: 'Failed to load posts' });
  }
} 