import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

export default function AgencyLandingPage() {
  const [scrolled, setScrolled] = useState(false);
  const [hoveredCard, setHoveredCard] = useState(null);
  const [ctaHovered, setCtaHovered] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Dynamic header behavior - white text on transparent background
  useEffect(() => {
    const logo = document.querySelector('.mil-logo');
    const menuBtn = document.querySelector('.mil-menu-btn');
    const navLinks = document.querySelectorAll('.mil-top-panel a');

    const updateHeaderStyle = () => {
      // Always keep transparent background with white text
      if (logo) {
        logo.style.transition = 'color 0.3s';
        logo.style.color = 'rgb(255, 255, 255)';
      }
      if (menuBtn) {
        menuBtn.style.zIndex = '9999';
        menuBtn.style.transition = 'color 0.3s';
        menuBtn.style.color = 'rgb(255, 255, 255)';
        const spans = menuBtn.querySelectorAll('span');
        spans.forEach(span => {
          span.style.transition = 'background-color 0.3s';
          span.style.backgroundColor = 'rgb(255, 255, 255)';
        });
      }
      navLinks.forEach(link => {
        link.style.transition = 'color 0.3s';
        link.style.color = 'rgb(255, 255, 255)';
      });
    };

    // Set initial state
    updateHeaderStyle();

    // Cleanup on unmount
    return () => {
      if (logo) {
        logo.style.transition = '';
        logo.style.color = '';
      }
      if (menuBtn) {
        menuBtn.style.zIndex = '';
        menuBtn.style.transition = '';
        menuBtn.style.color = '';
        const spans = menuBtn.querySelectorAll('span');
        spans.forEach(span => {
          span.style.transition = '';
          span.style.backgroundColor = '';
        });
      }
      navLinks.forEach(link => {
        link.style.transition = '';
        link.style.color = '';
      });
    };
  }, []);

  const services = [
    {
      title: 'Web & App\nDevelopment',
      description: 'Dynamic websites (Next.js, React) and cross-platform mobile apps (iOS, Android, Flutter) with robust backends.'
    },
    {
      title: 'AI & Machine\nLearning',
      description: 'Advanced AI solutions including Computer Vision, NLP, Chatbots, and Predictive Analytics for automation.'
    },
    {
      title: 'Cloud & DevOps\nSolutions',
      description: 'Scalable cloud architecture (AWS, Azure, GCP), migration services, and automated CI/CD DevOps pipelines.'
    },
    {
      title: 'Digital Marketing\n& SEO',
      description: 'Strategic digital marketing, industry-targeted SEO optimization, and AI-driven lead generation campaigns.'
    }
  ];

  // Hover handler functions
  const handleCardEnter = (index) => {
    setHoveredCard(index);
  };

  const handleCardLeave = () => {
    setHoveredCard(null);
  };

  const handleCtaEnter = () => {
    setCtaHovered(true);
  };

  const handleCtaLeave = () => {
    setCtaHovered(false);
  };

  // Get card styles based on hover state
  const getCardStyles = (isHovered) => ({
    progressBar: {
      width: isHovered ? '100%' : '0%'
    },
    overlay: {
      opacity: isHovered ? 1 : 0
    },
    description: {
      opacity: isHovered ? 1 : 0
    },
    arrow: {
      backgroundColor: isHovered ? '#ff9500' : 'transparent',
      borderColor: isHovered ? 'transparent' : 'rgba(255, 149, 0, 0.3)',
      color: isHovered ? '#000' : '#ff9500',
      transform: isHovered ? 'scale(1)' : 'scale(0.8)',
      opacity: isHovered ? 1 : 0.6
    }
  });

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@200;300;400;600;700&display=swap');

        html, body {
          margin: 0 !important;
          padding: 0 !important;
          background-color: #000 !important;
          overflow-x: hidden;
          -webkit-font-smoothing: antialiased;
          -moz-osx-font-smoothing: grayscale;
        }

        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
          -webkit-tap-highlight-color: transparent;
        }

        @keyframes fadeInDown {
          from { opacity: 0; transform: translateY(-20px); }
          to { opacity: 1; transform: translateY(0); }
        }

        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .agency-landing-container {
          background-color: #000 !important;
          min-height: 100vh;
          width: 100%;
          color: #fff;
          font-family: 'Inter', 'Helvetica Neue', Arial, sans-serif;
          overflow: hidden;
          position: relative;
          isolation: isolate;
        }

        /* Touch-friendly buttons for mobile */
        button, .service-card {
          -webkit-tap-highlight-color: transparent;
          -webkit-touch-callout: none;
          -webkit-user-select: none;
          user-select: none;
        }

        /* Smooth font rendering on Safari */
        .hero-heading, .tagline, .service-card h3, .service-card p {
          -webkit-font-smoothing: antialiased;
          -moz-osx-font-smoothing: grayscale;
        }

        .decorative-svg-left {
          position: absolute;
          top: 50%;
          left: 50px;
          transform: translateY(-50%);
          width: 300px;
          height: 300px;
          opacity: 0.1;
          pointer-events: none;
          z-index: 1;
        }

        .decorative-svg-right {
          position: absolute;
          top: 50%;
          right: 50px;
          transform: translateY(-50%);
          width: 300px;
          height: 300px;
          opacity: 0.1;
          pointer-events: none;
          z-index: 1;
        }

        .decorative-svg-bottom-left {
          position: absolute;
          bottom: 100px;
          left: 50%;
          transform: translateX(-50%);
          width: 350px;
          height: 350px;
          opacity: 0.08;
          pointer-events: none;
          z-index: 1;
        }

        /* Safari-specific fixes */
        @supports (-webkit-touch-callout: none) {
          .agency-landing-container {
            -webkit-overflow-scrolling: touch;
            -webkit-transform: translate3d(0, 0, 0);
          }

          .hero-section {
            -webkit-transform: translate3d(0, 0, 0);
          }
        }

        /* Tablet View (768px - 1024px) */
        @media (max-width: 1024px) {
          .hero-section {
            padding-top: 140px !important;
            padding-bottom: 60px !important;
            padding-left: 1.5rem !important;
            padding-right: 1.5rem !important;
          }

          .tagline {
            font-size: 0.8rem !important;
            margin-bottom: 2.5rem !important;
            padding: 0 1rem;
          }

          .hero-heading {
            font-size: 3rem !important;
            gap: 1rem !important;
            flex-wrap: wrap !important;
            line-height: 1.2 !important;
          }

          .image-circle {
            width: 160px !important;
            height: 55px !important;
          }

          .services-grid {
            width: 95% !important;
            grid-template-columns: repeat(2, 1fr) !important;
            margin-top: 3rem !important;
            gap: 0 !important;
          }

          .service-card {
            min-height: 280px !important;
            padding: 25px 15px !important;
          }

          .service-card-content {
            width: 100% !important;
            height: auto !important;
          }

          .service-card h3 {
            font-size: 18px !important;
            line-height: 26px !important;
          }

          .service-card p {
            font-size: 14px !important;
            line-height: 20px !important;
            width: 100% !important;
          }

          .cta-button {
            padding: 3px 16px !important;
            font-size: 0.7rem !important;
            gap: 0.75rem !important;
          }

          .decorative-svg-left,
          .decorative-svg-right {
            width: 200px !important;
            height: 200px !important;
            opacity: 0.05 !important;
          }
        }

        /* Mobile View (up to 767px) */
        @media (max-width: 767px) {
          .hero-section {
            padding-top: 100px !important;
            padding-bottom: 40px !important;
            padding-left: 1rem !important;
            padding-right: 1rem !important;
          }

          .tagline {
            font-size: 0.7rem !important;
            margin-bottom: 2rem !important;
            line-height: 1.6 !important;
            padding: 0 0.5rem;
          }

          .hero-heading {
            font-size: 2rem !important;
            gap: 0.75rem !important;
            flex-direction: column !important;
            line-height: 1.2 !important;
          }

          .image-circle {
            width: 120px !important;
            height: 42px !important;
          }

          .services-grid {
            width: 100% !important;
            grid-template-columns: 1fr !important;
            margin-top: 2rem !important;
            padding: 0 0.5rem !important;
          }

          .service-card {
            border-right: none !important;
            border-bottom: 1px solid rgba(255, 255, 255, 0.08) !important;
            min-height: 250px !important;
            padding: 20px 15px !important;
          }

          .service-card:last-child {
            border-bottom: none !important;
          }

          .service-card-content {
            width: 100% !important;
            height: auto !important;
          }

          .service-card h3 {
            font-size: 18px !important;
            line-height: 26px !important;
            margin-bottom: 0.75rem !important;
          }

          .service-card p {
            font-size: 14px !important;
            line-height: 20px !important;
            height: auto !important;
            width: 100% !important;
            margin-bottom: 20px !important;
          }

          .cta-button {
            padding: 3px 14px !important;
            font-size: 0.65rem !important;
            gap: 0.5rem !important;
            border-radius: 40px !important;
          }

          .decorative-svg-left,
          .decorative-svg-right,
          .decorative-svg-bottom-left {
            display: none !important;
          }

          /* Show all 3 dodecahedrons on mobile, scaled up */
          .mil-animation-frame {
            display: block !important;
          }

          .mil-animation-frame .mil-animation.mil-position-1 {
            transform: scale(1.2) !important;
            opacity: 0.35 !important;
          }

          // .mil-animation-frame .mil-animation.mil-position-2 {
          //   display: inline-block !important;
          //   transform: scale(0.7) !important;
          //   opacity: 0.2 !important;
          // }

          // .mil-animation-frame .mil-animation.mil-position-3 {
          //   display: inline-block !important;
          //   transform: scale(0.6) !important;
          //   opacity: 0.18 !important;
          // }

          .mil-animation-frame .mil-pentagon div {
            border-top-width: 1px !important;
          }

          /* Mobile menu adjustments */
          .mil-menu-frame {
            width: 100% !important;
          }

          .mil-menu-content {
            padding: 2rem 1rem !important;
          }

          .mil-main-menu ul li {
            font-size: 1.5rem !important;
          }
        }

        /* Small Mobile View (up to 480px) */
        @media (max-width: 480px) {
          .hero-section {
            padding-top: 90px !important;
            padding-left: 0.75rem !important;
            padding-right: 0.75rem !important;
          }

          .tagline {
            font-size: 0.65rem !important;
            margin-bottom: 1.5rem !important;
            padding: 0 0.25rem;
          }

          .hero-heading {
            font-size: 1.75rem !important;
            gap: 0.6rem !important;
          }

          .image-circle {
            width: 100px !important;
            height: 36px !important;
          }

          .service-card {
            padding: 18px 12px !important;
            min-height: 230px !important;
          }

          .service-card h3 {
            font-size: 16px !important;
            line-height: 24px !important;
          }

          .service-card p {
            font-size: 13px !important;
            line-height: 19px !important;
          }

          .cta-button {
            padding: 2px 12px !important;
            font-size: 0.6rem !important;
          }
        }

        /* Extra small screens */
        @media (max-width: 375px) {
          .hero-heading {
            font-size: 1.5rem !important;
          }

          .tagline br {
            display: none;
          }
        }

        /* Landscape mode on mobile devices */
        @media (max-width: 767px) and (orientation: landscape) {
          .hero-section {
            padding-top: 80px !important;
            padding-bottom: 30px !important;
          }

          .tagline {
            margin-bottom: 1.5rem !important;
          }

          .hero-heading {
            font-size: 1.8rem !important;
          }

          .image-circle {
            width: 100px !important;
            height: 38px !important;
          }

          .services-grid {
            margin-top: 1.5rem !important;
            grid-template-columns: repeat(2, 1fr) !important;
          }

          .service-card {
            min-height: 220px !important;
          }
        }

        /* iPad specific fixes */
        @media only screen
        and (min-device-width: 768px)
        and (max-device-width: 1024px)
        and (-webkit-min-device-pixel-ratio: 2) {
          .services-grid {
            width: 92% !important;
          }

          .service-card {
            padding: 30px 20px !important;
          }
        }
      `}</style>

      <div className="agency-landing-container">
        {/* Background Animation Frame */}
        <div className="mil-animation-frame">
          <div className="mil-animation mil-position-1 mil-scale" data-value-1="3.1" data-value-2="1.8" style={{ top: '30%', right: '0%' }}>
            <div className="mil-dodecahedron">
              {[...Array(12)].map((_, i) => (
                <div className="mil-pentagon" key={i}>
                  <div></div>
                  <div></div>
                  <div></div>
                  <div></div>
                  <div></div>
                </div>
              ))}
            </div>
          </div>
          <div className="mil-animation mil-position-3 mil-scale" data-value-1="1.2" data-value-2=".1"></div>

          <div className="mil-animation mil-position-2 mil-scale" data-value-1="2" data-value-2="1" style={{ left: '150px' }}>
            <div className="mil-dodecahedron">
              {[...Array(12)].map((_, i) => (
                <div className="mil-pentagon" key={i}>
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

        {/* Hero Section */}
        <section
          className="hero-section"
          style={{
            paddingTop: '180px',
            paddingBottom: '100px',
            paddingLeft: '2rem',
            paddingRight: '2rem',
            textAlign: 'center',
            position: 'relative'
          }}
        >
          {/* Tagline */}
          <div
            className="tagline"
            style={{
              fontSize: '0.85rem',
              color: '#999',
              marginBottom: '3rem',
              fontWeight: '300',
              letterSpacing: '0.1em',
              animation: 'fadeInDown 0.8s ease-out'
            }}
          >
            Professionals focused on helping your brand<br />grow and move forward.
          </div>

          {/* Main Heading */}
          <div style={{
            marginBottom: '4rem',
            animation: 'fadeInUp 1s ease-out 0.2s both'
          }}>
            {/* Unique Ideas Row */}
            <div
              className="hero-heading"
              style={{
                fontSize: '4.5rem',
                fontWeight: '300',
                marginBottom: '0.5rem',
                letterSpacing: '-0.02em',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '1.5rem'
              }}
            >
              <div
                className="image-circle"
                style={{
                  width: '250px',
                  height: '80px',
                  borderRadius: '80px',
                  overflow: 'hidden'
                }}
              >
                <img src="/images/2_1.jpg" alt="team" style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'top' }} />
              </div>
              <span style={{ fontWeight: '700' }}>Unique</span>
              <span style={{ fontWeight: '200', color: '#ccc' }}>Ideas</span>
            </div>

            {/* For Your Business Row */}
            <div
              className="hero-heading"
              style={{
                fontSize: '4.5rem',
                fontWeight: '300',
                letterSpacing: '-0.02em',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '2rem'
              }}
            >
              <span style={{ fontWeight: '700' }}>For Your</span>
              <span style={{ fontWeight: '200', color: '#ccc' }}>Business.</span>
              <Link
                to="/services"
                className="cta-button"
                style={{
                  backgroundColor: '#ff9500',
                  color: '#000',
                  border: 'none',
                  borderRadius: '50px',
                  padding: '4px 20px',
                  fontSize: '0.75rem',
                  fontWeight: '600',
                  letterSpacing: '0.15em',
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '1rem',
                  transition: 'all 0.3s ease',
                  textTransform: 'uppercase',
                  textDecoration: 'none',
                  boxShadow: ctaHovered ? '0 15px 40px rgba(255, 149, 0, 0.4)' : '0 10px 30px rgba(255, 149, 0, 0.3)',
                  transform: ctaHovered ? 'translateY(-2px)' : 'translateY(0)'
                }}
                onMouseEnter={handleCtaEnter}
                onMouseLeave={handleCtaLeave}
              >
                WHAT WE DO
                <div className='mil-button mil-arrow-place mil-icon-button mil-arrow-right'></div>
              </Link>
            </div>
          </div>

          {/* Services Grid */}
          <div
            className="services-grid"
            style={{
              width: '70%',
              display: 'grid',
              gridTemplateColumns: 'repeat(4, 1fr)',
              borderTop: '1px solid rgba(255,255,255,0.08)',
              gap: '0',
              margin: '5rem auto 0',
              padding: '0'
            }}
          >
            {services.map((service, index) => {
              const isHovered = hoveredCard === index;
              const cardStyles = getCardStyles(isHovered);

              return (
                <div
                  key={index}
                  className="service-card"
                  style={{
                    backgroundColor: 'transparent',
                    borderRight: index === services.length - 1 ? 'none' : '1px solid rgba(255, 255, 255, 0.08)',
                    borderRadius: '0px',
                    padding: '20px 10px',
                    minHeight: '300px',
                    transition: 'all 0.4s ease',
                    cursor: 'pointer',
                    position: 'relative',
                    overflow: 'hidden',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between'
                  }}
                  onMouseEnter={() => handleCardEnter(index)}
                  onMouseLeave={handleCardLeave}
                >
                  {/* Progress Bar */}
                  <div
                    style={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      height: '3px',
                      backgroundColor: '#ff9500',
                      width: cardStyles.progressBar.width,
                      transition: 'width 0.4s ease',
                      zIndex: 3
                    }}
                  ></div>

                  {/* Card Overlay */}
                  <div
                    style={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      bottom: 0,
                      background: 'linear-gradient(135deg, rgba(255, 149, 0, 0.05) 0%, transparent 100%)',
                      opacity: cardStyles.overlay.opacity,
                      transition: 'opacity 0.4s ease',
                      pointerEvents: 'none'
                    }}
                  ></div>

                  <div className="service-card-content" style={{ height: '238px', width: '223px' }}>
                    <h3 style={{
                      fontSize: '20px',
                      fontWeight: '500',
                      lineHeight: '30px',
                      marginBottom: '1rem',
                      color: '#fff',
                      letterSpacing: '-0.01em'
                    }}>
                      {service.title.split('\n').map((line, i) => (
                        <React.Fragment key={i}>
                          {line}
                          {i < service.title.split('\n').length - 1 && <br />}
                        </React.Fragment>
                      ))}
                    </h3>
                    <p
                      style={{
                        fontSize: '16px',
                        lineHeight: '24px',
                        fontWeight: '300',
                        color: '#666',
                        marginBottom: '40px',
                        height: '100px',
                        width: '95%',
                        opacity: cardStyles.description.opacity,
                        transition: 'opacity 0.3s ease',
                        overflow: 'hidden'
                      }}
                    >
                      {service.description}
                    </p>
                  </div>

                  {/* Arrow Button */}
                  {/* <div
                    style={{
                      width: '40px',
                      height: '40px',
                      borderRadius: '50%',
                      backgroundColor: cardStyles.arrow.backgroundColor,
                      border: `1px solid ${cardStyles.arrow.borderColor}`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '1.2rem',
                      color: cardStyles.arrow.color,
                      transition: 'all 0.4s ease',
                      alignSelf: 'flex-start',
                      transform: cardStyles.arrow.transform,
                      opacity: cardStyles.arrow.opacity
                    }}
                  >
                    →
                  </div> */}
                </div>
              );
            })}
          </div>
        </section>
      </div>
    </>
  );
}
