const fs = require('fs').promises;
const path = require('path');
const matter = require('gray-matter');

exports.handler = async function(event, context) {
    // Only allow GET requests
    if (event.httpMethod !== 'GET') {
        return { statusCode: 405, body: 'Method Not Allowed' };
    }

    try {
        console.log('Fetching posts...');
        console.log('Current directory:', process.cwd());
        console.log('Function directory:', __dirname);
        
        // Try multiple possible paths for the posts directory
        const possiblePaths = [
            path.join(__dirname, 'content', 'posts'),
            path.join(__dirname, '..', 'content', 'posts'),
            path.join(process.cwd(), 'content', 'posts'),
            '/opt/build/repo/content/posts'  // Netlify build directory
        ];
        
        let postsDir;
        let files = [];
        
        // Try each path until we find one that works
        for (const dir of possiblePaths) {
            try {
                console.log('Trying directory:', dir);
                const stats = await fs.stat(dir);
                if (stats.isDirectory()) {
                    postsDir = dir;
                    files = await fs.readdir(dir);
                    console.log('Successfully found posts in:', dir);
                    console.log('Files found:', files);
                    break;
                }
            } catch (err) {
                console.log('Directory not accessible:', dir, err.message);
            }
        }
        
        if (!postsDir || files.length === 0) {
            console.log('No valid posts directory found or directory is empty');
            // Try to list the root directory to understand the structure
            try {
                const rootFiles = await fs.readdir(process.cwd());
                console.log('Root directory contents:', rootFiles);
            } catch (err) {
                console.log('Could not read root directory:', err.message);
            }
            return {
                statusCode: 200,
                headers: {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*',
                    'Access-Control-Allow-Methods': 'GET, OPTIONS',
                    'Access-Control-Allow-Headers': 'Content-Type',
                    'Cache-Control': 'no-cache'
                },
                body: JSON.stringify([])
            };
        }

        // Process each markdown file
        const posts = await Promise.all(
            files
                .filter(file => file.endsWith('.md'))
                .map(async (file) => {
                    try {
                        const filePath = path.join(postsDir, file);
                        console.log('Reading file:', filePath);
                        const content = await fs.readFile(filePath, 'utf-8');
                        console.log('File content:', content.substring(0, 100) + '...');
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
        console.log(`Found ${validPosts.length} valid posts:`, validPosts.map(p => p.title));
        
        return {
            statusCode: 200,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type',
                'Cache-Control': 'no-cache'
            },
            body: JSON.stringify(validPosts.sort((a, b) => new Date(b.date) - new Date(a.date)))
        };
    } catch (error) {
        console.error('Error in handler:', error);
        return {
            statusCode: 200,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type',
                'Cache-Control': 'no-cache'
            },
            body: JSON.stringify([])
        };
    }
}; 