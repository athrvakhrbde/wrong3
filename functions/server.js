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
        
        // In production, files are in the same directory as the function
        const postsDir = path.join(__dirname, 'content', 'posts');
        console.log('Posts directory:', postsDir);

        // List all files in the posts directory
        let files;
        try {
            files = await fs.readdir(postsDir);
            console.log('Found files:', files);
        } catch (err) {
            console.error('Error reading directory:', err);
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
            statusCode: 200, // Return 200 even on error, with empty array
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