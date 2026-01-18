import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../component/Navbar/Navbar';
import Preloader from '../component/Preloader/Preloader';

const Personal = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [logoColor, setLogoColor] = useState('black');

  const toggleMenu = () => {
    const newState = !isMenuOpen;
    setIsMenuOpen(newState);
    if (newState) {
      document.body.classList.add('mil-menu-open');
    } else {
      document.body.classList.remove('mil-menu-open');
    }
  };

  useEffect(() => {
    // Trigger animations on load
    const timer = setTimeout(() => {
      document.querySelectorAll('.mil-up').forEach((el, index) => {
        setTimeout(() => {
          el.classList.add('mil-animated');
        }, index * 100);
      });
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="mil-wrapper" id="top">
      {/* Preloader */}
      <Preloader />

      {/* Navbar */}
      <Navbar
        activePage="home"
        logoColor={logoColor}
        isMenuOpen={isMenuOpen}
        toggleMenu={toggleMenu}
      />

      {/* Content */}
      <div className="mil-content">
        <div id="swupMain" className="mil-main-transition">

          {/* Banner */}
          <section className="mil-banner-personal">
            {/* Animated Dodecahedron Background */}
            <div className="mil-animation-frame">
              <div className="mil-animation mil-position-4 mil-dark mil-scale" data-value-1="7" data-value-2="1.4" style={{ right: '25%' }}>
                <div className="mil-dodecahedron">
                  {[...Array(12)].map((_, i) => (
                    <div className="mil-pentagon" key={`banner-penta-${i}`}>
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

            <div className="container">
              <div className="mil-banner-content mil-up">
                <div className="row align-items-center">
                  {/* Left Column - Text Content */}
                  <div className="col-lg-6">
                    <div className="mil-personal-text">
                      <p className="mil-mb-60">Hello! My name is</p>
                      <h1 className="mil-mb-60">Rudvish <br />Patel</h1>
                      <div className="row justify-content-center">
                        <div className="col-lg-8">
                          <span className="mil-suptitle mil-suptitle-dark mil-mb-60">
                            Passionately Creating Design Wonders: <br />Unleashing Boundless Creativity
                          </span>
                          <Link to="/services" className="mil-link mil-dark mil-arrow-place">
                            <span>More about me</span>
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Right Column - Portrait */}
                  <div className="col-lg-6">
                    <div className="mil-portrait-frame">
                      <img
                        src="/images/rudvishPatel-removebg-preview.png"
                        alt="Rudvish Patel"
                      />
                    </div>
                  </div>
                </div>

                {/* Banner Panel */}
                <div className="mil-banner-panel mil-up" style={{ zIndex: 2 }}>
                  <h5>Designing a Better World Today</h5>

                  <div className="mil-right">
                    <div className="mil-social-frame">
                      <ul className="mil-social-icons mil-dark">
                        <li>
                          <a href="#" target="_blank" rel="noopener noreferrer" className="social-icon">
                            <i className="fab fa-behance"></i>
                          </a>
                        </li>
                        <li>
                          <a href="#" target="_blank" rel="noopener noreferrer" className="social-icon">
                            <i className="fab fa-dribbble"></i>
                          </a>
                        </li>
                        <li>
                          <a href="#" target="_blank" rel="noopener noreferrer" className="social-icon">
                            <i className="fab fa-twitter"></i>
                          </a>
                        </li>
                        <li>
                          <a href="#" target="_blank" rel="noopener noreferrer" className="social-icon">
                            <i className="fab fa-github"></i>
                          </a>
                        </li>
                      </ul>
                    </div>
                    <Link to="/projects" className="mil-button mil-arrow-place">
                      <span>View Portfolio</span>
                    </Link>
                  </div>
                </div>

              </div>
            </div>
          </section>
          {/* Banner End */}

          {/* Hidden Elements for jQuery cloning */}
          <div className="mil-hidden-elements">
            <div className="mil-dodecahedron">
              {[...Array(12)].map((_, i) => (
                <div className="mil-pentagon" key={`hidden-${i}`}>
                  <div></div>
                  <div></div>
                  <div></div>
                  <div></div>
                  <div></div>
                </div>
              ))}
            </div>

            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="mil-arrow">
              <path d="M 14 5.3417969 C 13.744125 5.3417969 13.487969 5.4412187 13.292969 5.6367188 L 13.207031 5.7226562 C 12.816031 6.1136563 12.816031 6.7467188 13.207031 7.1367188 L 17.070312 11 L 4 11 C 3.448 11 3 11.448 3 12 C 3 12.552 3.448 13 4 13 L 17.070312 13 L 13.207031 16.863281 C 12.816031 17.254281 12.816031 17.887344 13.207031 18.277344 L 13.292969 18.363281 C 13.683969 18.754281 14.317031 18.754281 14.707031 18.363281 L 20.363281 12.707031 C 20.754281 12.316031 20.754281 11.682969 20.363281 11.292969 L 14.707031 5.6367188 C 14.511531 5.4412187 14.255875 5.3417969 14 5.3417969 z"></path>
            </svg>

            <svg width="250" viewBox="0 0 300 1404" fill="none" xmlns="http://www.w3.org/2000/svg" className="mil-lines">
              <path fillRule="evenodd" clipRule="evenodd" d="M1 892L1 941H299V892C299 809.71 232.29 743 150 743C67.7096 743 1 809.71 1 892ZM0 942H300V892C300 809.157 232.843 742 150 742C67.1573 742 0 809.157 0 892L0 942Z" className="mil-move"></path>
              <path fillRule="evenodd" clipRule="evenodd" d="M299 146V97L1 97V146C1 228.29 67.7096 295 150 295C232.29 295 299 228.29 299 146ZM300 96L0 96V146C0 228.843 67.1573 296 150 296C232.843 296 300 228.843 300 146V96Z" className="mil-move"></path>
              <path fillRule="evenodd" clipRule="evenodd" d="M299 1H1V1403H299V1ZM0 0V1404H300V0H0Z"></path>
              <path fillRule="evenodd" clipRule="evenodd" d="M150 -4.37115e-08L150 1404L149 1404L149 0L150 -4.37115e-08Z"></path>
              <path fillRule="evenodd" clipRule="evenodd" d="M150 1324C232.29 1324 299 1257.29 299 1175C299 1092.71 232.29 1026 150 1026C67.7096 1026 1 1092.71 1 1175C1 1257.29 67.7096 1324 150 1324ZM150 1325C232.843 1325 300 1257.84 300 1175C300 1092.16 232.843 1025 150 1025C67.1573 1025 0 1092.16 0 1175C0 1257.84 67.1573 1325 150 1325Z" className="mil-move"></path>
              <path fillRule="evenodd" clipRule="evenodd" d="M300 1175H0V1174H300V1175Z" className="mil-move"></path>
              <path fillRule="evenodd" clipRule="evenodd" d="M150 678C232.29 678 299 611.29 299 529C299 446.71 232.29 380 150 380C67.7096 380 1 446.71 1 529C1 611.29 67.7096 678 150 678ZM150 679C232.843 679 300 611.843 300 529C300 446.157 232.843 379 150 379C67.1573 379 0 446.157 0 529C0 611.843 67.1573 679 150 679Z" className="mil-move"></path>
              <path fillRule="evenodd" clipRule="evenodd" d="M299 380H1V678H299V380ZM0 379V679H300V379H0Z" className="mil-move"></path>
            </svg>
          </div>
          {/* Hidden Elements End */}

        </div>
      </div>

      {/* CSS Styles */}
      <style>{`
        /* Banner Personal Section */
        .mil-banner-personal {
          position: relative;
          min-height: 100vh;
          display: flex;
          align-items: center;
          background-color: #E5E5E5;
          overflow: hidden;
          padding: 120px 0;
        }

        .mil-banner-personal .mil-animation-frame {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          pointer-events: none;
          z-index: 0;
        }

        .mil-banner-personal .mil-animation {
          position: absolute;
          top: 50%;
          transform: translateY(-50%);
        }

        .mil-banner-personal .container {
          position: relative;
          z-index: 1;
        }

        /* Personal Text */
        .mil-personal-text {
          text-align: left;
          padding-right: 30px;
        }

        .mil-personal-text p {
          font-size: 18px;
          color: #1a1a1a;
          font-weight: 400;
        }

        .mil-personal-text h1 {
          font-size: 80px;
          font-weight: 400;
          line-height: 1.1;
          color: #1a1a1a;
          letter-spacing: -0.02em;
        }

        @media (max-width: 1200px) {
          .mil-personal-text h1 {
            font-size: 60px;
          }
        }

        @media (max-width: 992px) {
          .mil-personal-text {
            padding-right: 0;
            margin-bottom: 60px;
          }
          .mil-personal-text h1 {
            font-size: 50px;
          }
        }

        @media (max-width: 768px) {
          .mil-banner-personal {
            background-color: #000000 !important;
          }

          .mil-personal-text h1 {
            font-size: 40px;
            color: #ffffff;
          }

          .mil-personal-text p {
            color: #ffffff;
          }

          .mil-suptitle-dark {
            color: #ffffff;
          }

          .mil-link.mil-dark {
            color: #ffffff;
          }

          .mil-link.mil-dark:hover {
            color: #FFA801;
          }

          .mil-banner-panel {
            border-top-color: rgba(255, 255, 255, 0.1);
          }

          .mil-banner-panel h5 {
            color: #ffffff;
          }

          .mil-social-icons.mil-dark a {
            color: #ffffff;
          }

          .mil-social-icons.mil-dark a:hover {
            color: #FFA801;
          }
        }

        /* Portrait Frame */
        .mil-portrait-frame {
          position: relative;
          text-align: center;
          display: flex;
          justify-content: center;
          align-items: flex-end;
          min-height: 500px;
        }

        .mil-portrait-frame img {
          max-width: 100%;
          width: 100%;
          max-width: 650px;
          height: auto;
          position: relative;
          z-index: 2;
          object-fit: contain;
          object-position: bottom;
          /* Remove white background */
          mix-blend-mode: multiply;
          filter: contrast(1.1) brightness(1.05);
        }

        @media (max-width: 992px) {
          .mil-portrait-frame {
            min-height: 400px;
            margin-top: 40px;
          }
          .mil-portrait-frame img {
            width: 380px;
          }
        }

        @media (max-width: 768px) {
          .mil-portrait-frame {
            min-height: 350px;
          }
          .mil-portrait-frame img {
            width: 300px;
          }
        }

        /* Banner Panel */
        .mil-banner-panel {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-top: 60px;
          padding-top: 40px;
          border-top: 1px solid rgba(0, 0, 0, 0.1);
        }

        .mil-banner-panel h5 {
          font-size: 18px;
          font-weight: 400;
          color: #1a1a1a;
          margin: 0;
        }

        .mil-banner-panel .mil-right {
          display: flex;
          align-items: center;
          gap: 40px;
        }

        /* Button Styling - Matching HTML Template */
        .mil-button {
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          border: none;
          letter-spacing: 2px;
          font-size: 12px;
          background-color: rgb(255, 152, 0);
          color: rgb(0, 0, 0);
          border-radius: 70px;
          padding: 0 15px 0 50px;
          height: 70px;
          text-transform: uppercase;
          font-weight: 500;
          text-decoration: none;
          transition: 0.4s cubic-bezier(0, 0, 0.3642, 1);
        }

        .mil-button span {
          white-space: nowrap;
        }

        .mil-button:hover {
          transform: scale(1.015);
          filter: brightness(110%);
        }

        @media (max-width: 992px) {
          .mil-banner-panel {
            flex-direction: column;
            gap: 30px;
            text-align: center;
          }
          .mil-banner-panel .mil-right {
            flex-direction: column;
            gap: 20px;
          }
          .mil-button {
            height: 60px;
            padding: 0 10px 0 40px;
          }
        }

        /* Social Icons - Matching HTML Template */
        .mil-social-frame {
          display: flex;
          align-items: center;
        }

        .mil-social-icons {
          display: flex;
          gap: 15px;
          list-style: none;
          padding: 0;
          margin: 0;
        }

        .mil-social-icons li {
          display: inline-block;
        }

        .mil-social-icons.mil-dark a {
          color: rgb(0, 0, 0);
          font-size: 18px;
          transition: 0.4s cubic-bezier(0, 0, 0.3642, 1);
        }

        .mil-social-icons.mil-dark a:hover {
          color: rgb(255, 152, 0);
        }

        /* Suptitle Dark */
        .mil-suptitle-dark {
          display: block;
          font-size: 14px;
          text-transform: uppercase;
          letter-spacing: 2px;
          color: #1a1a1a;
          line-height: 1.8;
        }

        /* Dark Link */
        .mil-link.mil-dark {
          color: #1a1a1a;
          text-decoration: none;
          display: inline-flex;
          align-items: center;
          gap: 10px;
          font-size: 12px;
          font-weight: 700;
          letter-spacing: 2px;
          text-transform: uppercase;
          transition: color 0.3s ease;
        }

        .mil-link.mil-dark:hover {
          color: #FFA801;
        }

        /* Dark Dodecahedron */
        .mil-animation.mil-dark .mil-dodecahedron .mil-pentagon div {
          border-color: rgba(0, 0, 0, 0.1);
        }

        /* Animation helpers */
        .mil-up {
          opacity: 0;
          transform: translateY(30px);
          transition: opacity 0.6s ease, transform 0.6s ease;
        }

        .mil-up.mil-animated {
          opacity: 1;
          transform: translateY(0);
        }

        /* Margin bottom utilities */
        .mil-mb-60 {
          margin-bottom: 60px;
        }

        /* Row alignment */
        .align-items-center {
          align-items: center;
        }

        .justify-content-center {
          justify-content: center;
        }
      `}</style>
    </div>
  );
};

export default Personal;
