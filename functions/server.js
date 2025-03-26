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
        
        // In Netlify, the posts are in the same directory as the function
        const postsDir = path.join(__dirname, 'content', 'posts');
        console.log('Looking for posts in:', postsDir);

        // List all files in the posts directory
        let files;
        try {
            const dirContents = await fs.readdir(postsDir);
            files = dirContents.filter(file => file.endsWith('.md'));
            console.log('Found markdown files:', files);
        } catch (err) {
            console.error('Error reading posts directory:', err);
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
            files.map(async (file) => {
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