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
        // Use path relative to the function
        const postsDir = path.join(__dirname, '..', 'content', 'posts');
        
        // List all files in the posts directory
        const files = await fs.readdir(postsDir);
        console.log('Found files:', files);

        // Process each markdown file
        const posts = await Promise.all(
            files
                .filter(file => file.endsWith('.md'))
                .map(async (file) => {
                    const content = await fs.readFile(path.join(postsDir, file), 'utf-8');
                    const { data, content: markdown } = matter(content);
                    return {
                        ...data,
                        slug: file.replace('.md', ''),
                        body: markdown.trim()
                    };
                })
        );

        console.log(`Found ${posts.length} posts`);
        
        return {
            statusCode: 200,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type',
                'Cache-Control': 'no-cache'
            },
            body: JSON.stringify(posts.sort((a, b) => new Date(b.date) - new Date(a.date)))
        };
    } catch (error) {
        console.error('Error reading posts:', error);
        return {
            statusCode: 500,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            body: JSON.stringify({ error: error.message })
        };
    }
}; 