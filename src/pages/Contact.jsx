import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../component/Navbar/Navbar';

const Contact = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });

  const toggleMenu = () => {
    const newState = !isMenuOpen;
    setIsMenuOpen(newState);
    if (newState) {
      document.body.classList.add('mil-menu-open');
    } else {
      document.body.classList.remove('mil-menu-open');
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const { name, email, subject, message } = formData;
    const mailtoLink = `mailto:contact@nulloverflow.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(
      `Name: ${name}\nEmail: ${email}\n\nMessage:\n${message}`
    )}`;
    window.location.href = mailtoLink;
  };

  return (
    <div className="mil-wrapper" id="top">
      <Navbar
        activePage="contact"
        logoColor="black"
        isMenuOpen={isMenuOpen}
        toggleMenu={toggleMenu}
      />

      {/* Cursor */}
      <div className="mil-ball">
        <span className="mil-icon-1">
          <svg viewBox="0 0 128 128">
            <path d="M106.1,41.9c-1.2-1.2-3.1-1.2-4.2,0c-1.2,1.2-1.2,3.1,0,4.2L116.8,61H11.2l14.9-14.9c1.2-1.2,1.2-3.1,0-4.2	c-1.2-1.2-3.1-1.2-4.2,0l-20,20c-1.2,1.2-1.2,3.1,0,4.2l20,20c0.6,0.6,1.4,0.9,2.1,0.9s1.5-0.3,2.1-0.9c1.2-1.2,1.2-3.1,0-4.2	L11.2,67h105.5l-14.9,14.9c-1.2,1.2-1.2,3.1,0,4.2c0.6,0.6,1.4,0.9,2.1,0.9s1.5-0.3,2.1-0.9l20-20c1.2-1.2,1.2-3.1,0-4.2L106.1,41.9	z"></path>
          </svg>
        </span>
        <div className="mil-more-text">More</div>
        <div className="mil-choose-text">Сhoose</div>
      </div>

      <div className="mil-contact-page">
        {/* Background Animation */}
        <div className="mil-animation-frame" style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: 0, overflow: 'hidden', filter: 'invert(1)' }}>
          <div className="mil-animation mil-position-4 mil-scale" data-value-1="6" data-value-2="1.4" style={{ top: '10%', left: '20%' }}>
            <div className="mil-dodecahedron">
              {[...Array(12)].map((_, i) => (
                <div className="mil-pentagon" key={`banner-${i}`}>
                  <div></div>
                  <div></div>
                  <div></div>
                  <div></div>
                  <div></div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="mil-split-container" style={{ position: 'relative', zIndex: 1 }}>
          {/* Left Side - Info & Title */}
          <div className="mil-info-section">
            <div className="mil-info-content">
              <ul className="mil-breadcrumbs mil-mb-40">
                <li><Link to="/">Homepage</Link></li>
                <li><Link to="/contact">Contact</Link></li>
              </ul>

              <h1 className="mil-hero-title">
                Let's Start a <br />
                <span className="mil-accent-text">Conversation</span>
              </h1>

              <p className="mil-description">
                Ready to transform your ideas into reality? We're here to help you build innovative solutions.
              </p>

              <div className="mil-contact-details">
                <div className="mil-detail-item">
                  <h5>Email</h5>
                  <a href="mailto:contact@nulloverflow.com" className="mil-link">contact@nulloverflow.com</a>
                </div>
                <div className="mil-detail-item">
                  <h5>Location</h5>
                  <p>United States</p>
                </div>
                <div className="mil-detail-item">
                  <h5>Follow Us</h5>
                  <div className="mil-social-links">
                    <a href="#" className="mil-social-link">LinkedIn</a>
                    <a href="#" className="mil-social-link">Twitter</a>
                    <a href="#" className="mil-social-link">GitHub</a>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Side - Form */}
          <div className="mil-form-section">
            <form onSubmit={handleSubmit} className="mil-modern-form">
              <h3 className="mil-form-title">Send a Message</h3>

              <div className="mil-input-group">
                <input
                  type="text"
                  name="name"
                  placeholder="Your Name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="mil-input"
                />
              </div>

              <div className="mil-input-group">
                <input
                  type="email"
                  name="email"
                  placeholder="Email Address"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="mil-input"
                />
              </div>

              <div className="mil-input-group">
                <input
                  type="text"
                  name="subject"
                  placeholder="Subject"
                  value={formData.subject}
                  onChange={handleChange}
                  required
                  className="mil-input"
                />
              </div>

              <div className="mil-input-group h-[100px]">
                <textarea
                  name="message"
                  placeholder="Tell us about your project..."
                  value={formData.message}
                  onChange={handleChange}
                  required
                  className="mil-input mil-textarea"
                  rows="2"
                ></textarea>
              </div>

              <button type="submit" className="mil-submit-btn">
                <span>Send Message</span>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="mil-arrow-icon">
                  <path d="M 14 5.3417969 C 13.744125 5.3417969 13.487969 5.4412187 13.292969 5.6367188 L 13.207031 5.7226562 C 12.816031 6.1136563 12.816031 6.7467188 13.207031 7.1367188 L 17.070312 11 L 4 11 C 3.448 11 3 11.448 3 12 C 3 12.552 3.448 13 4 13 L 17.070312 13 L 13.207031 16.863281 C 12.816031 17.254281 12.816031 17.887344 13.207031 18.277344 L 13.292969 18.363281 C 13.683969 18.754281 14.317031 18.754281 14.707031 18.363281 L 20.363281 12.707031 C 20.754281 12.316031 20.754281 11.682969 20.363281 11.292969 L 14.707031 5.6367188 C 14.511531 5.4412187 14.255875 5.3417969 14 5.3417969 z"></path>
                </svg>
              </button>
            </form>
          </div>
        </div>
      </div>

      <style>{`
        /* Page Layout */
        .mil-wrapper {
          background: #fff; /* White background */
          color: #000; /* Dark text */
          min-height: 100vh;
          overflow: hidden; 
        }

        .mil-contact-page {
          height: 100vh;
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          padding-top: 80px; 
          box-sizing: border-box;
        }

        /* Split Container */
        .mil-split-container {
          display: flex;
          width: 100%;
          height: 100%;
          max-width: 1400px;
          margin: 0 auto;
        }

        /* Left Side: Info */
        .mil-info-section {
          flex: 1;
          display: flex;
          flex-direction: column;
          justify-content: center;
          padding: 0 60px;
          position: relative;
        }

        .mil-breadcrumbs {
          list-style: none;
          padding: 0;
          display: flex;
          gap: 15px;
          font-size: 14px;
          opacity: 0.6;
          margin-bottom: 2rem;
        }
        
        .mil-breadcrumbs a {
          color: #000; /* Dark Breadcrumbs */
          text-decoration: none;
          transition: 0.3s;
        }

        .mil-breadcrumbs a:hover {
          color: #FFA801;
        }

        .mil-hero-title {
          font-size: 4rem;
          line-height: 1.1;
          font-weight: 700;
          margin-bottom: 30px;
          color: #000; /* Dark Title */
        }

        .mil-accent-text {
          color: #FFA801;
          font-weight: 300;
          font-style: italic;
        }

        .mil-description {
          font-size: 1.1rem;
          color: rgba(0, 0, 0, 0.7); /* Dark Description */
          max-width: 450px;
          margin-bottom: 50px;
          line-height: 1.6;
        }

        .mil-contact-details {
          display: flex;
          gap: 40px;
          flex-wrap: wrap;
        }

        .mil-detail-item h5 {
          font-size: 14px;
          text-transform: uppercase;
          color: rgba(0, 0, 0, 0.5); /* Dark Label */
          margin-bottom: 10px;
          letter-spacing: 1px;
        }

        .mil-detail-item p, 
        .mil-link,
        .mil-social-link {
          color: #000; /* Dark Links */
          text-decoration: none;
          font-size: 16px;
          transition: 0.3s;
        }

        .mil-link:hover,
        .mil-social-link:hover {
          color: #FFA801;
        }

        .mil-social-links {
          display: flex;
          gap: 20px;
        }

        /* Right Side: Form */
        .mil-form-section {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 40px;
        }

        .mil-modern-form {
          width: 100%;
          max-width: 550px;
          display: flex;
          flex-direction: column;
          gap: 25px;
          
          /* Card Styling for Light Theme */
          background: #fff;
          padding: 50px;
          border-radius: 30px;
          border: 1px solid rgba(0, 0, 0, 0.05);
          box-shadow: 0 20px 40px rgba(0,0,0,0.08); /* Lighter shadow */
        }

        .mil-form-title {
          font-size: 24px;
          margin-bottom: 10px;
          font-weight: 600;
          color: #000;
        }

        .mil-input-group {
          position: relative;
        }

        .mil-input,
        .mil-textarea {
          width: 100%;
          padding: 15px 0;
          background: transparent;
          border: none;
          border-bottom: 1px solid rgba(0, 0, 0, 0.1); /* Darker border */
          color: #000; /* Dark Text in Input */
          font-size: 16px;
          font-family: inherit;
          transition: 0.3s;
          border-radius: 0;
        }

        .mil-textarea {
          resize: none;
          min-height: 100px;
        }

        .mil-input:focus,
        .mil-textarea:focus {
          outline: none;
          border-bottom-color: #FFA801;
          padding-left: 10px;
        }

        .mil-input::placeholder,
        .mil-textarea::placeholder {
          color: rgba(0, 0, 0, 0.4);
        }

        .mil-submit-btn {
          margin-top: 20px;
          background: #FFA801;
          color: #000;
          border: none;
          padding: 15px 30px;
          font-size: 14px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 1px;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          transition: 0.3s;
          border-radius: 4px;
        }

        .mil-submit-btn:hover {
          background: #000;
          color: #fff;
          transform: translateY(-2px);
        }

        .mil-arrow-icon {
          width: 18px;
          height: 18px;
          fill: currentColor;
          transition: 0.3s;
        }

        .mil-submit-btn:hover .mil-arrow-icon {
          transform: translateX(5px);
        }

        /* Responsive Design */
        @media (max-width: 992px) {
          .mil-wrapper {
            overflow-y: auto; 
          }
          
          .mil-contact-page {
            height: auto;
            padding-top: 100px;
            padding-bottom: 60px;
          }

          .mil-split-container {
            flex-direction: column;
          }

          .mil-info-section, .mil-form-section {
            padding: 30px;
            border: none;
          }

          .mil-info-section {
            margin-bottom: 40px;
          }
          
          .mil-hero-title {
            font-size: 3rem;
          }
        }
      `}</style>
    </div>
  );
};

export default Contact;
