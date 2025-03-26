const express = require('express');
const fs = require('fs').promises;
const path = require('path');
const matter = require('gray-matter');

const app = express();
const PORT = process.env.PORT || 3000;

// Serve static files from public directory
app.use(express.static('public'));

// Enable CORS for development
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    next();
});

// Endpoint to get all posts
app.get('/content/posts', async (req, res) => {
    try {
        const postsDirectory = path.join(__dirname, 'content', 'posts');
        
        // Create posts directory if it doesn't exist
        try {
            await fs.access(postsDirectory);
        } catch {
            await fs.mkdir(postsDirectory, { recursive: true });
            res.json([]);
            return;
        }

        const files = await fs.readdir(postsDirectory);
        
        const posts = await Promise.all(
            files
                .filter(file => file.endsWith('.md'))
                .map(async file => {
                    const content = await fs.readFile(
                        path.join(postsDirectory, file),
                        'utf8'
                    );
                    const { data, content: body } = matter(content);
                    return {
                        ...data,
                        body,
                        slug: file.replace('.md', '')
                    };
                })
        );

        res.json(posts.sort((a, b) => new Date(b.date) - new Date(a.date)));
    } catch (error) {
        console.error('Error reading posts:', error);
        if (error.code === 'ENOENT') {
            res.json([]); // Return empty array if directory doesn't exist
        } else {
            res.status(500).json({ error: 'Error reading posts' });
        }
    }
});

// Create images directory if it doesn't exist
const imagesDir = path.join(__dirname, 'public', 'images');
fs.mkdir(imagesDir, { recursive: true }).catch(console.error);

// Handle all other routes
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
}); 