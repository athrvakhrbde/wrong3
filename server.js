const express = require('express');
const fs = require('fs').promises;
const path = require('path');
const matter = require('gray-matter');

const app = express();
const PORT = process.env.PORT || 3000;

// Enable CORS
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    if (req.method === 'OPTIONS') {
        return res.sendStatus(200);
    }
    next();
});

// Create necessary directories
const createDirectories = async () => {
    const dirs = [
        path.join(__dirname, 'content', 'posts'),
        path.join(__dirname, 'public', 'images')
    ];
    
    for (const dir of dirs) {
        try {
            await fs.access(dir);
        } catch {
            await fs.mkdir(dir, { recursive: true });
        }
    }
};

createDirectories().catch(console.error);

// API endpoint to get all posts - MUST come before static file serving
app.get('/content/posts', async (req, res) => {
    console.log('Fetching posts...');
    try {
        const postsDirectory = path.join(__dirname, 'content', 'posts');
        let files;
        
        try {
            files = await fs.readdir(postsDirectory);
        } catch (error) {
            console.log('No posts directory or empty:', error);
            res.json([]);
            return;
        }

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

        console.log(`Found ${posts.length} posts`);
        res.json(posts.sort((a, b) => new Date(b.date) - new Date(a.date)));
    } catch (error) {
        console.error('Error reading posts:', error);
        res.status(500).json({ error: 'Error reading posts' });
    }
});

// Serve static files from public directory
app.use(express.static('public'));

// Handle all other routes
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
}); 