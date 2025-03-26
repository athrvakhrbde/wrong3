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
        const postsDir = path.join(process.cwd(), 'content', 'posts');
        const files = await fs.readdir(postsDir);
        const posts = await Promise.all(
            files
                .filter(file => file.endsWith('.md'))
                .map(async (file) => {
                    const content = await fs.readFile(path.join(postsDir, file), 'utf-8');
                    const { data, content: markdown } = matter(content);
                    return {
                        ...data,
                        slug: file.replace('.md', ''),
                        body: markdown
                    };
                })
        );
        console.log(`Found ${posts.length} posts`);
        
        return {
            statusCode: 200,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            body: JSON.stringify(posts.sort((a, b) => new Date(b.date) - new Date(a.date)))
        };
    } catch (error) {
        console.error('Error reading posts:', error);
        return {
            statusCode: 200,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            body: JSON.stringify([])
        };
    }
}; 