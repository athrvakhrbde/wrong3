import { useState, useEffect } from 'react'
import Head from 'next/head'

export default function Home() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        console.log('Fetching posts from API...');
        const response = await fetch('/api/posts');
        const data = await response.json();
        console.log('Received posts:', data);
        setPosts(data);
      } catch (error) {
        console.error('Error fetching posts:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
    // Set up polling - fetch every 5 seconds
    const interval = setInterval(fetchPosts, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="container">
      <Head>
        <title>Wrong3</title>
        <meta name="description" content="A simple Next.js app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className="main">
        <h1 className="title">
          Welcome to <a href="https://nextjs.org">Wrong3</a>
        </h1>

        <p className="description">
          Get started by editing{' '}
          <code className="code">pages/index.js</code>
        </p>

        <div className="posts-section">
          <h2>Posts</h2>
          {loading ? (
            <p>Loading posts...</p>
          ) : posts.length > 0 ? (
            <ul className="posts-list">
              {posts.map((post, index) => (
                <li key={index} className="post-item">
                  <h3>{post.title}</h3>
                  <p>{post.content}</p>
                </li>
              ))}
            </ul>
          ) : (
            <p>No posts found. Please check your content directory.</p>
          )}
        </div>
      </main>

      <style jsx>{`
        .container {
          min-height: 100vh;
          padding: 0 0.5rem;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
        }

        .main {
          padding: 5rem 0;
          flex: 1;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
        }

        .title {
          margin: 0;
          line-height: 1.15;
          font-size: 4rem;
          text-align: center;
        }

        .title a {
          color: #0070f3;
          text-decoration: none;
        }

        .title a:hover,
        .title a:focus,
        .title a:active {
          text-decoration: underline;
        }

        .description {
          line-height: 1.5;
          font-size: 1.5rem;
          text-align: center;
        }

        .code {
          background: #fafafa;
          border-radius: 5px;
          padding: 0.75rem;
          font-size: 1.1rem;
          font-family: Menlo, Monaco, Lucida Console, Liberation Mono,
            DejaVu Sans Mono, Bitstream Vera Sans Mono, Courier New, monospace;
        }

        .posts-section {
          margin-top: 2rem;
          width: 100%;
          max-width: 800px;
        }

        .posts-list {
          list-style-type: none;
          padding: 0;
        }

        .post-item {
          margin-bottom: 1.5rem;
          padding: 1rem;
          border: 1px solid #eaeaea;
          border-radius: 10px;
        }

        .post-item h3 {
          margin: 0 0 0.5rem 0;
        }
      `}</style>

      <style jsx global>{`
        html,
        body {
          padding: 0;
          margin: 0;
          font-family: -apple-system, BlinkMacSystemFont, Segoe UI, Roboto,
            Oxygen, Ubuntu, Cantarell, Fira Sans, Droid Sans, Helvetica Neue,
            sans-serif;
        }

        * {
          box-sizing: border-box;
        }
      `}</style>
    </div>
  )
}
