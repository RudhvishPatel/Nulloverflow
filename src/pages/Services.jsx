import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Footer from './HomeSection/footers';
import Navbar from '../component/Navbar/Navbar';


// Service Card Component
// Service Card Component
const ServiceCard = ({ service, hasOffset, onClick }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setMousePos({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    });
  };

  const handleMouseEnter = () => {
    setIsHovered(true);
    document.body.classList.add('mil-hide-ball');
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    document.body.classList.remove('mil-hide-ball');
  };

  return (
    <div className="col-md-6 col-lg-6">
      <a
        href="#service-details"
        onClick={(e) => { e.preventDefault(); onClick(service); }}
        className={`mil-service-card-lg mil-more mil-accent-cursor ${hasOffset ? 'mil-offset' : ''}`}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onMouseMove={handleMouseMove}
        style={{
          display: 'block',
          textDecoration: 'none',
          transition: 'transform 0.3s ease',
          cursor: 'none',
          position: 'relative'
        }}
      >
        <h4 className="mil-muted mil-up mil-mb-30" dangerouslySetInnerHTML={{ __html: service.title }}></h4>
        <p className="mil-descr mil-light-soft mil-up mil-mb-30">{service.description}</p>
        <ul className="mil-service-list mil-light mil-mb-30">
          {service.features.map((feature, index) => (
            <li key={index} className="mil-up">{feature}</li>
          ))}
        </ul>
        <div className="mil-link mil-accent mil-arrow-place mil-up">
          <span>Read more</span>
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="mil-arrow">
            <path d="M 14 5.3417969 C 13.744125 5.3417969 13.487969 5.4412187 13.292969 5.6367188 L 13.207031 5.7226562 C 12.816031 6.1136563 12.816031 6.7467188 13.207031 7.1367188 L 17.070312 11 L 4 11 C 3.448 11 3 11.448 3 12 C 3 12.552 3.448 13 4 13 L 17.070312 13 L 13.207031 16.863281 C 12.816031 17.254281 12.816031 17.887344 13.207031 18.277344 L 13.292969 18.363281 C 13.683969 18.754281 14.317031 18.754281 14.707031 18.363281 L 20.363281 12.707031 C 20.754281 12.316031 20.754281 11.682969 20.363281 11.292969 L 14.707031 5.6367188 C 14.511531 5.4412187 14.255875 5.3417969 14 5.3417969 z"></path>
          </svg>
        </div>
        {/* Cursor-following MORE circle */}
        <div
          style={{
            position: 'absolute',
            left: mousePos.x,
            top: mousePos.y,
            transform: `translate(-50%, -50%) scale(${isHovered ? 1 : 0})`,
            width: '110px',
            height: '110px',
            backgroundColor: '#FFA801',
            borderRadius: '50%',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            opacity: isHovered ? 1 : 0,
            transition: 'transform 0.2s ease-out, opacity 0.2s ease-out',
            pointerEvents: 'none',
            zIndex: 999
          }}
        >
          <span
            style={{
              color: '#000',
              fontSize: '13px',
              fontWeight: 500,
              letterSpacing: '3px',
              textTransform: 'uppercase'
            }}
          >
            More
          </span>
        </div>
      </a>
    </div>
  );
};

// Service Modal Component
const ServiceModal = ({ service, onClose }) => {
  useEffect(() => {
    // Prevent scrolling when modal is open
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = originalOverflow || '';
    };
  }, []);

  if (!service) return null;

  return (
    <div className="mil-service-modal-backdrop" onClick={onClose}>
      <div className="mil-service-modal" onClick={e => e.stopPropagation()}>
        <button className="mil-modal-close" onClick={onClose}>
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
        <div className="mil-modal-content">
          <h3 className="mil-modal-title mil-up" dangerouslySetInnerHTML={{ __html: service.title }}></h3>
          <div className="mil-divider mil-up"></div>
          <p className="mil-descr mil-light-soft mil-up mil-mb-40 text-lg" style={{ fontSize: '18px', lineHeight: '1.6' }}>{service.description}</p>

          <h5 className="mil-light mil-up mil-mb-30">Key Features & Offerings</h5>
          <div className="row">
            {service.features.map((feature, index) => (
              <div key={index} className="col-md-6" style={{ color: '#fff' }}>
                <div className="mil-service-feature-item mil-up">
                  <span className="mil-accent-dot"></span>
                  <span>{feature}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

// Services data
const servicesData = [
  {
    id: 1,
    title: 'Web & App <br>Development',
    description: 'Full-cycle development of dynamic websites and cross-platform mobile applications with robust backend systems.',
    features: [
      'Dynamic websites (Next.js, React, Node.js)',
      'Mobile apps (iOS, Android, Flutter)',
      'Secure backend systems & APIs'
    ],
    hasOffset: true
  },
  {
    id: 2,
    title: 'AI & Machine <br>Learning',
    description: 'Advanced AI solutions ranging from computer vision and natural language processing to predictive analytics.',
    features: [
      'Computer Vision & Object Detection',
      'NLP, Chatbots & Sentiment Analysis',
      'Predictive Analytics & Automation'
    ],
    hasOffset: false
  },
  {
    id: 3,
    title: 'Cloud & DevOps <br>Solutions',
    description: 'Scalable cloud architecture and automated DevOps pipelines to optimize infrastructure and performance.',
    features: [
      'Cloud deployments (AWS, Azure, GCP)',
      'Migration & Cost Optimization',
      'CI/CD, Docker & Kubernetes'
    ],
    hasOffset: true
  },
  {
    id: 4,
    title: 'Digital Marketing <br>& SEO',
    description: 'Strategic digital marketing and SEO specifically tailored for targeted industries to drive growth.',
    features: [
      'Industry-targeted SEO optimization',
      'Multi-platform campaigns',
      'AI-powered lead generation'
    ],
    hasOffset: false
  },
  {
    id: 5,
    title: 'Consulting <br>& Research',
    description: 'Expert advisory services, collaborative research, and specialized training to drive business transformation.',
    features: [
      'AI-driven business transformation',
      'Collaborative research',
      'Training: AI, ML, Cloud Strategy'
    ],
    hasOffset: true
  }
];

const Services = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [logoColor, setLogoColor] = useState('white');
  const [selectedService, setSelectedService] = useState(null);

  const handleServiceClick = (service) => {
    setSelectedService(service);
  };

  const closeServiceModal = () => {
    setSelectedService(null);
  };

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
    // Initialize animations and effects
    const handleScroll = () => {
      const banner = document.querySelector('.mil-inner-banner');
      if (banner) {
        const bannerBottom = banner.getBoundingClientRect().bottom;
        if (bannerBottom < 100) {
          setLogoColor('black');
        } else {
          setLogoColor('white');
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="mil-wrapper" id="top">
      {/* Preloader */}


      {/* Navbar */}
      <Navbar
        activePage="services"
        logoColor={logoColor}
        isMenuOpen={isMenuOpen}
        toggleMenu={toggleMenu}
      />

      {/* Content */}
      <div className="mil-content">
        <div id="swupMain" className="mil-main-transition">

          {/* Banner */}
          <div className="mil-dark-bg">
            <div className="mil-inner-banner">
              <div className="mi-invert-fix">
                <div className="mil-banner-content mil-up">
                  <div className="mil-animation-frame">
                    <div className="mil-animation mil-position-4 mil-scale" data-value-1="6" data-value-2="1.4">
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
                  <div className="container">
                    <ul className="mil-breadcrumbs mil-light mil-mb-60">
                      <li><Link to="/">Homepage</Link></li>
                      <li><Link to="/services">Services</Link></li>
                    </ul>
                    <h1 className="mil-muted mil-mb-60">This is <span className="mil-thin">what</span><br /> we do <span className="mil-thin">best</span></h1>
                    <a href="#services" className="mil-link mil-accent mil-arrow-place mil-down-arrow">
                      <span>Our services</span>
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="mil-arrow">
                        <path d="M 14 5.3417969 C 13.744125 5.3417969 13.487969 5.4412187 13.292969 5.6367188 L 13.207031 5.7226562 C 12.816031 6.1136563 12.816031 6.7467188 13.207031 7.1367188 L 17.070312 11 L 4 11 C 3.448 11 3 11.448 3 12 C 3 12.552 3.448 13 4 13 L 17.070312 13 L 13.207031 16.863281 C 12.816031 17.254281 12.816031 17.887344 13.207031 18.277344 L 13.292969 18.363281 C 13.683969 18.754281 14.317031 18.754281 14.707031 18.363281 L 20.363281 12.707031 C 20.754281 12.316031 20.754281 11.682969 20.363281 11.292969 L 14.707031 5.6367188 C 14.511531 5.4412187 14.255875 5.3417969 14 5.3417969 z"></path>
                      </svg>
                    </a>
                  </div>
                </div>
              </div>
            </div>
            {/* Banner End */}

            {/* Services Section */}
            <section id="services">
              <div className="mi-invert-fix">
                <div className="container mil-p-120-60">
                  <div className="row">
                    <div className="col-lg-5">
                      <div className="mil-lines-place mil-light">
                        <svg width="250" viewBox="0 0 300 1404" fill="none" xmlns="http://www.w3.org/2000/svg" class="mil-lines">
                          <path fill-rule="evenodd" clip-rule="evenodd" d="M1 892L1 941H299V892C299 809.71 232.29 743 150 743C67.7096 743 1 809.71 1 892ZM0 942H300V892C300 809.157 232.843 742 150 742C67.1573 742 0 809.157 0 892L0 942Z" class="mil-move"></path>
                          <path fill-rule="evenodd" clip-rule="evenodd" d="M299 146V97L1 97V146C1 228.29 67.7096 295 150 295C232.29 295 299 228.29 299 146ZM300 96L0 96V146C0 228.843 67.1573 296 150 296C232.843 296 300 228.843 300 146V96Z" class="mil-move"></path>
                          <path fill-rule="evenodd" clip-rule="evenodd" d="M299 1H1V1403H299V1ZM0 0V1404H300V0H0Z"></path>
                          <path fill-rule="evenodd" clip-rule="evenodd" d="M150 -4.37115e-08L150 1404L149 1404L149 0L150 -4.37115e-08Z"></path>
                          <path fill-rule="evenodd" clip-rule="evenodd" d="M150 1324C232.29 1324 299 1257.29 299 1175C299 1092.71 232.29 1026 150 1026C67.7096 1026 1 1092.71 1 1175C1 1257.29 67.7096 1324 150 1324ZM150 1325C232.843 1325 300 1257.84 300 1175C300 1092.16 232.843 1025 150 1025C67.1573 1025 0 1092.16 0 1175C0 1257.84 67.1573 1325 150 1325Z" class="mil-move"></path>
                          <path fill-rule="evenodd" clip-rule="evenodd" d="M300 1175H0V1174H300V1175Z" class="mil-move"></path>
                          <path fill-rule="evenodd" clip-rule="evenodd" d="M150 678C232.29 678 299 611.29 299 529C299 446.71 232.29 380 150 380C67.7096 380 1 446.71 1 529C1 611.29 67.7096 678 150 678ZM150 679C232.843 679 300 611.843 300 529C300 446.157 232.843 379 150 379C67.1573 379 0 446.157 0 529C0 611.843 67.1573 679 150 679Z" class="mil-move"></path>
                          <path fill-rule="evenodd" clip-rule="evenodd" d="M299 380H1V678H299V380ZM0 379V679H300V379H0Z" class="mil-move"></path>
                        </svg>
                      </div>
                    </div>
                    <div className="col-lg-7">
                      <div className="row">
                        {servicesData.map((service) => (
                          <ServiceCard
                            key={service.id}
                            service={service}
                            hasOffset={service.hasOffset}
                            onClick={handleServiceClick}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Service Modal */}
            {selectedService && <ServiceModal service={selectedService} onClose={closeServiceModal} />}
          </div>
          {/* Services End */}

          {/* Call to Action */}
          <section className="mil-soft-bg">
            <div className="container mil-p-120-120">
              <div className="row">
                <div className="col-lg-10">
                  <span className="mil-suptitle mil-suptitle-right mil-suptitle-dark mil-up">
                    Looking to make your mark? We'll help you turn <br /> your project into a success story.
                  </span>
                </div>
              </div>
              <div className="mil-center">
                <h2 className="mil-up mil-mb-60">
                  Let's make an <span className="mil-thin">impact</span><br />
                  together. Ready <span className="mil-thin">when you are</span>
                </h2>
                <div className="mil-up">
                  <a href="#contact" className="mil-button mil-arrow-place">
                    <span>Contact us</span>
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="mil-arrow">
                      <path d="M 14 5.3417969 C 13.744125 5.3417969 13.487969 5.4412187 13.292969 5.6367188 L 13.207031 5.7226562 C 12.816031 6.1136563 12.816031 6.7467188 13.207031 7.1367188 L 17.070312 11 L 4 11 C 3.448 11 3 11.448 3 12 C 3 12.552 3.448 13 4 13 L 17.070312 13 L 13.207031 16.863281 C 12.816031 17.254281 12.816031 17.887344 13.207031 18.277344 L 13.292969 18.363281 C 13.683969 18.754281 14.317031 18.754281 14.707031 18.363281 L 20.363281 12.707031 C 20.754281 12.316031 20.754281 11.682969 20.363281 11.292969 L 14.707031 5.6367188 C 14.511531 5.4412187 14.255875 5.3417969 14 5.3417969 z"></path>
                    </svg>
                  </a>
                </div>
              </div>
            </div>
          </section>
          {/* Footer */}
          <Footer />

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
          </div>
        </div>
      </div>

      {/* CSS Styles */}
      <style>{`
        /* Hide ball cursor on service cards */
        body.mil-hide-ball .mil-ball {
          opacity: 0 !important;
          transform: scale(0) !important;
          transition: opacity 0.2s ease, transform 0.2s ease !important;
        }

        /* Service card styles */
        .mil-service-card-lg {
          display: block;
          padding: 40px;
          margin-bottom: 30px;
          transition: all 0.3s ease;
          position: relative;
          overflow: visible;
        }

        .mil-service-card-lg:hover {
          border-color: rgba(255, 255, 255, 0.3);
          background: rgba(255, 255, 255, 0.02);
        }

        .mil-service-card-lg.mil-offset {
          margin-top: 60px;
        }

        @media (max-width: 768px) {
          .mil-service-card-lg.mil-offset {
            margin-top: 0;
          }
        }

        .mil-service-list {
          list-style: none;
          padding: 0;
          margin: 0;
        }

        .mil-service-list li {
          position: relative;
          padding-left: 20px;
          margin-bottom: 10px;
          color: rgba(255, 255, 255, 0.7);
        }

        .mil-service-list li::before {
          content: '';
          position: absolute;
          left: 0;
          top: 50%;
          transform: translateY(-50%);
          width: 6px;
          height: 6px;
          background: var(--accent-color, #ffc107);
          border-radius: 50%;
        }

        .mil-service-list.mil-light li {
          color: rgba(255, 255, 255, 0.7);
        }

        /* Soft background section */
        .mil-soft-bg {
          background-color: #f5f5f5;
        }

        .mil-center {
          text-align: center;
        }

        .mil-suptitle {
          display: block;
          font-size: 14px;
          text-transform: uppercase;
          letter-spacing: 2px;
          margin-bottom: 30px;
        }

        .mil-suptitle-right {
          text-align: right;
        }

        .mil-suptitle-dark {
          color: #1a1a1a;
        }

        /* Button styles */
        .mil-button {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          padding: 18px 35px;
          background: #FFA801;
          color: #000;
          text-decoration: none;
          font-size: 14px;
          text-transform: uppercase;
          letter-spacing: 2px;
          transition: all 0.3s ease;
          border: none;
          cursor: pointer;
        }

        .mil-button:hover {
          background: #e69500;
        }

        /* Lines decoration */
        .mil-lines-place {
          position: relative;
          height: 100%;
          min-height: 400px;
        }

        .mil-lines-place.mil-light::before {
          display: none;
        }

        /* Menu right frame visibility fix */
        .mil-menu-frame .mil-menu-right-frame {
          display: flex !important;
        }

        @media screen and (max-width: 1200px) {
          .mil-menu-frame .mil-menu-right-frame {
            display: flex !important;
            padding-left: 0;
            border-left: none;
            padding-top: 30px;
          }
        }

        /* Breadcrumbs light */
        .mil-breadcrumbs.mil-light li a {
          color: rgba(255, 255, 255, 0.7);
        }

        .mil-breadcrumbs.mil-light li a:hover {
          color: #fff;
        }


        /* Modal Styles */
        .mil-service-modal-backdrop {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: rgba(0, 0, 0, 0.9);
          backdrop-filter: blur(5px);
          z-index: 9999;
          display: flex;
          justify-content: center;
          align-items: center;
          animation: mil-fade-in 0.3s ease;
        }

        .mil-service-modal {
          background: rgba(18, 18, 18, 0.75);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          width: 90%;
          max-width: 900px;
          max-height: 90vh;
          overflow-y: auto;
          position: relative;
          padding: 60px;
          border-radius: 30px;
          border: 1px solid rgba(255, 255, 255, 0.1);
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
          animation: mil-scale-up 0.4s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .mil-modal-close {
          position: absolute;
          top: 30px;
          right: 30px;
          background: transparent;
          border: 1px solid rgba(255, 255, 255, 0.1);
          color: rgba(255, 255, 255, 0.5);
          width: 40px;
          height: 40px;
          border-radius: 50%;
          display: flex;
          justify-content: center;
          align-items: center;
          cursor: pointer;
          transition: all 0.3s ease;
          z-index: 10;
        }

        .mil-modal-close:hover {
          background: #FFA801;
          border-color: #FFA801;
          color: #000;
          transform: rotate(90deg);
        }

        .mil-modal-title {
          font-size: 42px;
          line-height: 1.2;
          margin-bottom: 30px;
          color: #fff;
        }

        .mil-divider {
          height: 1px;
          background: linear-gradient(90deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0) 100%);
          margin-bottom: 30px;
          width: 100px;
        }

        .mil-service-feature-item {
          display: flex;
          align-items: center;
          gap: 15px;
          margin-bottom: 20px;
          padding: 20px;
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.05);
          transition: all 0.3s ease;
        }

        .mil-service-feature-item:hover {
          background: rgba(255, 255, 255, 0.05);
          border-color: rgba(255, 255, 255, 0.1);
          transform: translateX(5px);
        }

        .mil-accent-dot {
          width: 8px;
          height: 8px;
          background: #FFA801;
          border-radius: 50%;
          flex-shrink: 0;
        }

        @keyframes mil-fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        @keyframes mil-scale-up {
          from { 
            opacity: 0;
            transform: scale(0.95) translateY(20px);
          }
          to { 
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }

        @media (max-width: 768px) {
          .mil-service-modal {
            padding: 30px;
            width: 95%;
          }
          .mil-modal-title {
            font-size: 28px;
          }
        }
      `}</style>
    </div>
  );
};

export default Services;
