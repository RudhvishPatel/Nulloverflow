import { Link } from 'react-router-dom'

function Footer() {
  const links = [
    { name: 'Home', path: '/' },
    { name: 'Services', path: '/services' },
    { name: 'Projects', path: '/projects' },
    { name: 'Personal', path: '/personal' },
  ];

  return (
    <footer className="relative w-full px-6 py-16 bg-transparent">
      <style>{`
        .footer-link {
          color: rgba(255, 255, 255, 0.7);
          font-size: 0.875rem;
          transition: color 0.3s ease;
        }
        .footer-link:hover {
          color: #ffa801 !important;
        }
        .social-icon {
          width: 2rem;
          height: 2rem;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 9999px;
          background: rgba(255, 255, 255, 0.1);
          color: rgba(255, 255, 255, 0.7);
          transition: all 0.3s ease;
        }
        .social-icon:hover {
          background: #ffa801 !important;
          color: #000000 !important;
        }
      `}</style>
      <div className="max-w-7xl mx-auto backdrop-blur-xl bg-white/5 border border-white/10 rounded-3xl shadow-2xl p-10 md:p-14">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Company Info */}
          <div>
            <h3 className="text-2xl font-semibold text-white mb-4">∅verflow</h3>
            <p className="text-white/70 text-sm leading-relaxed max-w-xs">
              AI-driven innovation, seamless digital experiences & cloud transformation.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-xl font-semibold text-white mb-3">Quick Links</h4>
            <ul className="space-y-2">
              {links.map((link) => (
                <li key={link.name}>
                  <Link to={link.path} className="footer-link">
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-xl font-semibold text-white mb-3">Get in Touch</h4>
            <ul className="space-y-2 text-sm text-white/70">
              <li>Email: <a href="mailto:hello@nulloverflow.ai" className="footer-link">hello@nulloverflow.ai</a></li>
              <li>Phone: <a href="tel:+11234567890" className="footer-link">+1 (123) 456-7890</a></li>
              <li>Address: 123 Innovation Way, Silicon Valley, CA</li>
            </ul>
            {/* Social icons */}
            <div className="flex items-center mt-4 space-x-4">
              <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="social-icon">
                <i className="fab fa-linkedin-in"></i>
              </a>
              <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="social-icon">
                <i className="fab fa-github"></i>
              </a>
              <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="social-icon">
                <i className="fab fa-twitter"></i>
              </a>
            </div>
          </div>
        </div>
        {/* Bottom bar */}
        <div className="mt-10 pt-6 border-t border-white/10 text-center text-xs text-white/50">
          © {new Date().getFullYear()} ∅verflow. All rights reserved.
        </div>
      </div>
    </footer>
  )
}

export default Footer
