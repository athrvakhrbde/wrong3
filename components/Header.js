import React from 'react';
import Link from 'next/link';

const Header = () => {
  return (
    <header className="header">
      <div className="container">
        <Link href="/">
          <a className="logo">Wrong3</a>
        </Link>
        <nav className="nav">
          <ul className="nav-list">
            <li className="nav-item">
              <Link href="/">
                <a className="nav-link">Home</a>
              </Link>
            </li>
            <li className="nav-item">
              <Link href="/about">
                <a className="nav-link">About</a>
              </Link>
            </li>
            <li className="nav-item">
              <Link href="/blog">
                <a className="nav-link">Blog</a>
              </Link>
            </li>
          </ul>
        </nav>
      </div>
      
      <style jsx>{`
        .header {
          padding: 1rem 0;
          background-color: #fff;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        }
        .container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 1rem;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .logo {
          font-size: 1.5rem;
          font-weight: bold;
          color: #0070f3;
          text-decoration: none;
        }
        .nav-list {
          display: flex;
          list-style: none;
          margin: 0;
          padding: 0;
        }
        .nav-item {
          margin-left: 2rem;
        }
        .nav-link {
          color: #333;
          text-decoration: none;
          font-size: 1rem;
          transition: color 0.3s ease;
        }
        .nav-link:hover {
          color: #0070f3;
        }
      `}</style>
    </header>
  );
};

export default Header;
