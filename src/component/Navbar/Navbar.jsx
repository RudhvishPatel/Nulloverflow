import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import MenuButton from './MenuButton';

const Navbar = ({
  activePage = 'home',
  logoColor = 'white',
  isMenuOpen,
  toggleMenu
}) => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // On mobile: always black bg with white text
  // On desktop: use the passed logoColor
  const effectiveLogoColor = isMobile ? 'white' : logoColor;

  return (
    <>
      {/* Mobile Navbar Styles - Black bg with white content for all pages */}
      <style>{`
        @media (max-width: 768px) {
          .mil-frame {
            background-color: #000000 !important;
            position: fixed !important;
            top: 0;
            left: 0;
            right: 0;
            padding: 0 !important;
            z-index: 10000 !important;
            height: auto !important;
          }

          .mil-frame .mil-frame-top {
            display: flex !important;
            justify-content: space-between;
            align-items: center;
            pointer-events: auto !important;
            background-color: #000000 !important;
            height: 70px !important;
            padding: 15px 20px !important;
          }

          .mil-frame .mil-logo,
          .mil-frame #logoText {
            color: #ffffff !important;
            font-size: 24px !important;
          }

          /* Force hamburger lines to be white */
          .mil-frame .mil-frame-top > div span {
            background-color: #ffffff !important;
          }

          .mil-frame .mil-frame-bottom {
            display: none !important;
          }

          /* Hide side panel on mobile */
          .mil-menu-frame .mil-menu-right-frame,
          .mil-menu-frame .col-xl-7 {
            display: none !important;
          }

          /* Make main menu full width on mobile */
          .mil-menu-frame .col-xl-5 {
            width: 100% !important;
            max-width: 100% !important;
            flex: 0 0 100% !important;
          }

          /* Full screen menu on mobile - exact screen height, no scroll */
          .mil-menu-frame {
            overflow: hidden !important;
            position: fixed !important;
            top: 0 !important;
            left: 0 !important;
            right: 0 !important;
            bottom: 0 !important;
          }

          .mil-menu-frame .mil-frame-top {
            display: flex !important;
            position: absolute !important;
            top: 0;
            left: 0;
            right: 0;
            height: 60px !important;
            padding: 15px 20px !important;
            z-index: 10001 !important;
            background-color: transparent !important;
          }

          .mil-menu-frame .container {
            height: 100% !important;
            max-height: 100vh !important;
            max-height: 100dvh !important;
            display: flex !important;
            align-items: center !important;
            justify-content: center !important;
            overflow: hidden !important;
          }

          .mil-menu-frame .mil-menu-content {
            overflow: hidden !important;
            max-height: calc(100vh - 120px) !important;
            max-height: calc(100dvh - 120px) !important;
          }

          .mil-menu-frame .mil-main-menu {
            padding-top: 0 !important;
          }

          /* Make close button (X) white on mobile */
          .mil-menu-frame .mil-frame-top > div span {
            background-color: #ffffff !important;
          }
        }
      `}</style>

      {/* Menu */}
      <div className={`mil-menu-frame ${isMenuOpen ? 'mil-active' : ''}`}>
        <div className="mil-frame-top">
          <a href="/" className="mil-logo" onClick={(e) => {
            if (isMenuOpen) toggleMenu();
            window.location.href = '/';
          }}>∅verflow</a>
          <MenuButton isOpen={isMenuOpen} onClick={toggleMenu} color="white" style={{ zIndex: 9999 }} />
        </div>
        <div className="container">
          <div className="mil-menu-content">
            <div className="row">
              <div className="col-xl-5">
                <nav className="mil-main-menu" id="swupMenu">
                  <ul>
                    <li className={`mil-has-children ${activePage === 'home' ? 'mil-active' : ''}`}>
                      <a href="/" onClick={(e) => {
                        if (isMenuOpen) toggleMenu();
                        window.location.href = '/';
                      }}>Home</a>
                    </li>
                    <li className={`mil-has-children ${activePage === 'projects' ? 'mil-active' : ''}`}>
                      <Link to="/projects" onClick={() => isMenuOpen && toggleMenu()}>Projects</Link>
                    </li>
                    <li className={`mil-has-children ${activePage === 'services' ? 'mil-active' : ''}`}>
                      <Link to="/services" onClick={() => isMenuOpen && toggleMenu()}>Services</Link>
                    </li>
                    <li className="mil-has-children">
                      <a href="#.">Newsletter</a>
                    </li>
                    <li className="mil-has-children">
                      <a href="#.">Other pages</a>
                    </li>
                  </ul>
                </nav>
              </div>
              <div className="col-xl-7">
                <div className="mil-menu-right-frame">
                  <div className="mil-animation-in">
                    <div className="mil-animation-frame">
                      <div className="mil-animation mil-position-1 mil-scale" data-value-1="2" data-value-2="2">
                        <div className="mil-dodecahedron">
                          {[...Array(12)].map((_, i) => (
                            <div className="mil-pentagon" key={`menu-${i}`}>
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
                  </div>
                  <div className="mil-menu-right">
                    <div className="row">
                      <div className="col-lg-8 mil-mb-60">
                        <h6 className="mil-muted mil-mb-30">Projects</h6>
                        <ul className="mil-menu-list">
                          <li><a href="/projects" className="mil-light-soft">Interior design studio</a></li>
                          <li><a href="/projects" className="mil-light-soft">Home Security Camera</a></li>
                          <li><a href="/projects" className="mil-light-soft">Kemia Honest Skincare</a></li>
                          <li><a href="/projects" className="mil-light-soft">Cascade of Lava</a></li>
                          <li><a href="/projects" className="mil-light-soft">Air Pro by Molekule</a></li>
                          <li><a href="/projects" className="mil-light-soft">Tony&apos;s Chocolonely</a></li>
                        </ul>
                      </div>
                      <div className="col-lg-4 mil-mb-60">
                        <h6 className="mil-muted mil-mb-30">Useful links</h6>
                        <ul className="mil-menu-list">
                          <li><a href="#." className="mil-light-soft">Privacy Policy</a></li>
                          <li><a href="#." className="mil-light-soft">Terms and conditions</a></li>
                          <li><a href="#." className="mil-light-soft">Cookie Policy</a></li>
                          <li><a href="#." className="mil-light-soft">Careers</a></li>
                        </ul>
                      </div>
                    </div>
                    <div className="mil-divider mil-mb-60"></div>
                    <div className="row justify-content-between">
                      <div className="col-lg-4 mil-mb-60">
                        <h6 className="mil-muted mil-mb-30">Ahmedabad</h6>
                        <p className="mil-light-soft mil-up">501, Solitaire Building, opp. meghdoot Petrol pump, Shahibag, Gujarat 380004, India</p>
                      </div>
                      <div className="col-lg-4 mil-mb-60">
                        <h6 className="mil-muted mil-mb-30">Chicago</h6>
                        <p className="mil-light-soft">220 N Green St, Chicago, IL 60607</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Curtain */}
      <div className="mil-curtain"></div>

      {/* Frame */}
      <div className="mil-frame" style={{ zIndex: 10000, opacity: isMenuOpen ? 0 : 1, pointerEvents: 'none', transition: 'opacity 0.3s ease' }}>
        <div className="mil-frame-top" style={{ zIndex: 10000 }}>
          <a
            href="/"
            className="mil-logo"
            id="logoText"
            style={{
              fontSize: "40px",
              fontWeight: 600,
              position: "relative",
              zIndex: 10000,
              color: effectiveLogoColor,
              transition: "color 0.3s ease",
              pointerEvents: "auto",
            }}
          >
            ∅verflow
          </a>
          <MenuButton isOpen={isMenuOpen} onClick={toggleMenu} color={effectiveLogoColor} style={{ zIndex: 10000 }} />
        </div>
        <div className="mil-frame-bottom">
          <div className="mil-current-page"></div>
        </div>
      </div>
    </>
  );
};

export default Navbar;
