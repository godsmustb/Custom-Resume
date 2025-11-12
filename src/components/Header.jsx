import './Header.css'

function Header() {
  return (
    <header className="header">
      <h1 className="name">Your Name</h1>
      <p className="title">Professional Title / Role</p>
      <div className="contact-info">
        <span>email@example.com</span>
        <span>•</span>
        <span>(123) 456-7890</span>
        <span>•</span>
        <span>City, State</span>
      </div>
      <div className="social-links">
        <a href="https://linkedin.com/in/yourprofile" target="_blank" rel="noopener noreferrer">LinkedIn</a>
        <a href="https://github.com/yourusername" target="_blank" rel="noopener noreferrer">GitHub</a>
        <a href="https://yourportfolio.com" target="_blank" rel="noopener noreferrer">Portfolio</a>
      </div>
    </header>
  )
}

export default Header
