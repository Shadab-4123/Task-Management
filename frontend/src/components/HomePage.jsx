import { Link } from 'react-router-dom';
import ThemeToggle from './ThemeToggle';
import taskManagementImage from '../assests/task-management-process.png';
import './HomePage.css';

const HomePage = () => {
  return (
    <div className="home-page" id="top">
      <header className="landing-header">
        <div className="landing-header-inner">
          <div className="landing-brand">Task Management</div>
          <nav className="landing-nav">
            <a href="#top">Home</a>
            <Link to="/login">Login</Link>
            <Link to="/signup" className="nav-signup-btn">
              Sign Up
            </Link>
            <a href="#contact">Contact</a>
            <ThemeToggle />
          </nav>
        </div>
      </header>

      <main className="landing-main">
        <section className="hero">
          <div className="hero-content">
            <h1>Manage Your Tasks Efficiently</h1>
            <p>
              Organize projects, track progress, and keep your team aligned with one
              simple task management workflow.
            </p>
            <div className="hero-actions">
              <Link to="/signup" className="hero-btn hero-btn-primary">
                Get Started
              </Link>
              <Link to="/login" className="hero-btn hero-btn-secondary">
                Login
              </Link>
            </div>
          </div>
          <div className="hero-image-wrap">
            <img
              src={taskManagementImage}
              alt="Task management process illustration"
              className="hero-image"
            />
          </div>
        </section>

        <section className="features">
          <article className="feature-card">
            <h3>Stay Organized</h3>
            <p>Manage project tasks with clean status tracking and simple workflows.</p>
          </article>
          <article className="feature-card">
            <h3>Boost Productivity</h3>
            <p>Track completions, reopen counts, and status history in one place.</p>
          </article>
          <article className="feature-card">
            <h3>Collaborate Securely</h3>
            <p>Use session-based authentication and role-friendly task ownership.</p>
          </article>
        </section>
      </main>

      <footer className="landing-footer" id="contact">
        <h2>Contact</h2>
        <p>Need support or want to collaborate?</p>
        <a href="mailto:shadabraza281@gmail.com">shadabraza281@gmail.com</a>
      </footer>
    </div>
  );
};

export default HomePage;
