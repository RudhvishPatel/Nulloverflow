import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Footer from './HomeSection/footers';
import Navbar from '../component/Navbar/Navbar';
import Preloader from '../component/Preloader/Preloader';

// Portfolio Item Component with hover effect
const PortfolioItem = ({ item, onClick }) => {
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
    <div className={item.colSize}>
      <a
        href={`#project-${item.id}`}
        onClick={(e) => { e.preventDefault(); onClick(item); }}
        className={`mil-portfolio-item mil-mb-60 ${item.parallax ? 'mil-parallax' : ''}`}
        data-value-1={item.parallax ? "60" : undefined}
        data-value-2={item.parallax ? "-60" : undefined}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onMouseMove={handleMouseMove}
        style={{ cursor: 'none', position: 'relative', display: 'block' }}
      >
        <div className={`mil-cover-frame mil-${item.layout} mil-up`} style={{ overflow: 'hidden' }}>
          <div className="mil-cover" style={{ overflow: 'hidden' }}>
            <img
              src={item.image}
              alt={item.title}
              style={{
                transition: 'transform 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
                transform: isHovered ? 'scale(1.1)' : 'scale(1)',
                width: '100%',
                height: '100%',
                objectFit: 'cover'
              }}
            />
          </div>
        </div>
        <div className="mil-descr">
          <div className="mil-labels mil-up mil-mb-15">
            <div className="mil-label mil-upper mil-accent">{item.category}</div>
            <div className="mil-label mil-upper">{item.date}</div>
          </div>
          <h4 className="mil-up">{item.title}</h4>
        </div>
        {/* Cursor-following MORE circle - now covers whole card */}
        <div
          style={{
            position: 'absolute',
            left: mousePos.x,
            top: mousePos.y,
            transform: `translate(-50%, -50%) scale(${isHovered ? 1 : 0})`,
            width: '100px',
            height: '100px',
            backgroundColor: '#000',
            borderRadius: '50%',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            opacity: isHovered ? '0.8' : 0,
            transition: 'transform 0.2s ease-out, opacity 0.2s ease-out',
            pointerEvents: 'none',
            zIndex: 10
          }}
        >
          <span
            style={{
              color: 'rgba(255, 255, 255, 0.9)',
              fontSize: '12px',
              fontWeight: 500,
              letterSpacing: '2px',
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

// Project Modal Component
const ProjectModal = ({ project, onClose }) => {
  useEffect(() => {
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = originalOverflow || '';
    };
  }, []);

  if (!project) return null;

  return (
    <div className="mil-project-modal-backdrop" onClick={onClose}>
      <div className="mil-project-modal" onClick={e => e.stopPropagation()}>
        <button className="mil-modal-close" onClick={onClose}>
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
        <div className="mil-modal-content">
          <div className="mil-labels mil-mb-15">
            <div className="mil-label mil-upper mil-accent">{project.category}</div>
            <div className="mil-label mil-upper">{project.date}</div>
          </div>
          <h2 className="mil-modal-title mil-up mil-mb-30" style={{ color: '#fff' }}>{project.title}</h2>
          <p className="mil-type-label mil-mb-30" style={{ color: '#fff' }}>{project.type}</p>

          <div className="mil-divider mil-mb-30"></div>

          <div className="row">
            <div className="col-lg-6 mil-mb-30">
              <h5 className="mil-light mil-mb-15">Problem Statement</h5>
              <p className="mil-descr mil-light-soft">{project.problem}</p>
            </div>
            <div className="col-lg-6 mil-mb-30">
              <h5 className="mil-light mil-mb-15">Objective</h5>
              <p className="mil-descr mil-light-soft">{project.objective}</p>
            </div>
          </div>

          <div className="row mil-mb-30">
            <div className="col-lg-12">
              <h5 className="mil-light mil-mb-15">Key Features</h5>
              <ul className="mil-modal-list">
                {project.features.map((feature, index) => (
                  <li key={index}>
                    <span className="mil-accent-dot"></span>
                    {feature}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="row">
            <div className="col-lg-12">
              <h5 className="mil-light mil-mb-15">Technologies & Methods</h5>
              <div className="mil-tech-tags">
                {project.tech.map((t, i) => (
                  <span key={i} className="mil-tech-tag">{t}</span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Portfolio data
const portfolioItems = [
  {
    id: 1,
    image: '/images/Projects/recommender.png',
    category: 'Graduate Research',
    date: 'Jan 2024',
    title: 'Structured & Cross-Domain Recommender Systems',
    layout: 'vert',
    colSize: 'col-lg-5',
    type: 'Graduate Research + Independent Research Project',
    problem: 'Traditional systems optimize for engagement but lack learning structure, fail to transfer preferences across domains, and don\'t model long-term progression.',
    objective: 'Design a system that guides users through educational content step-by-step and transfers preferences between education, entertainment, and travel.',
    features: [
      'Structured Recommendation Layer for learning continuity',
      'Cross-Domain Preference Transfer using shared latent representations',
      'Personalization Engine combining implicit behavior and personality traits',
      'Evaluation Metrics focused on completion and retention'
    ],
    tech: ['Collaborative Filtering', 'Graph-based Learning', 'User Profiling', 'Research Frameworks']
  },
  {
    id: 2,
    image: '/images/Projects/vision37.png',
    category: 'Edge AI / Computer Vision',
    date: 'Nov 2023',
    title: 'Vision37: Real-Time Theft Detection & Retail Intelligence',
    layout: 'hori',
    colSize: 'col-lg-6',
    parallax: true,
    type: 'Industry-Scale Computer Vision System (Edge AI)',
    problem: 'Retail theft in liquor stores due to blind spots, lack of real-time tracking, and no automated evidence capture.',
    objective: 'Build a fully automated, real-time edge system to detect humans, track behavior, identify theft, and monitor shelf gaps.',
    features: [
      'Real-time Human Detection using YOLOv8',
      'Theft Detection Logic with spatial interaction heuristics',
      'Automated Video Clip Generation for evidence',
      'Shelf Monitoring for out-of-stock pattern analysis'
    ],
    tech: ['YOLOv8', 'Jetson Orin', 'Raspberry Pi', 'GStreamer', 'DBSCAN', 'Soft-NMS']
  },
  {
    id: 3,
    image: '/images/Projects/roadsign.png',
    category: 'Master\'s Project / CV',
    date: 'Aug 2023',
    title: 'Multilingual Road Sign Detection & OCR System',
    layout: 'hori',
    colSize: 'col-lg-6',
    parallax: true,
    type: 'Master’s Final Computer Vision Project',
    problem: 'ADAS systems require accurate detection and multilingual text reading under complex lighting and small object constraints.',
    objective: 'Develop a two-stage CV pipeline to detect, classify, and recognize multilingual text on global road signs.',
    features: [
      'Two-stage Pipeline: Localization + Classification + OCR',
      'Hybrid Feature Engineering (HOG, LBP, CNN embeddings)',
      'Multilingual OCR using TrOCR',
      'Adaptive Thresholding and Robust NMS'
    ],
    tech: ['YOLOv8', 'ResNet18 + SVM', 'TrOCR', 'VGG16', 'GPU Optimization']
  },
  {
    id: 4,
    image: '/images/Projects/eeg.png',
    category: 'BCI / Neuroscience',
    date: 'Jun 2023',
    title: 'EEG-Based Attention Detection & Analytics',
    layout: 'vert',
    colSize: 'col-lg-5',
    type: 'Research Project (BCI + Data Analytics)',
    problem: 'Educational environments lack objective attention measurement and real-time neuro-adaptive engagement feedback.',
    objective: 'Build a BCI system to process raw EEG signals and detect attention levels in real time with high accuracy.',
    features: [
      'Real-time Signal Processing (Fourier Transform, Filtering)',
      'RNN-based Attention Level Prediction',
      'Engagement Visualization and Trend Analysis',
      'Achieved >90% prediction accuracy'
    ],
    tech: ['EEG Signal Processing', 'RNN', 'Frequency-domain Analysis', 'Data Analytics']
  },
  {
    id: 5,
    image: '/images/Projects/automation.png',
    category: 'AI consulting / Automation',
    date: '2023 - Present',
    title: 'AI-Driven Digital Platforms & Business Systems',
    layout: 'hori',
    colSize: 'col-lg-6',
    parallax: true,
    type: 'Professional + Entrepreneurial Project',
    problem: 'Small businesses struggle with manual operations, weak digital presence, and lack of data-driven decision tools.',
    objective: 'Design and deploy scalable digital platforms enhanced with AI and automation for business efficiency.',
    features: [
      'Dynamic Web Platforms with Content Management',
      'AI-powered Content Generation & Marketing',
      'Business Intelligence Dashboards',
      'Workflow and Compliance Automation'
    ],
    tech: ['Full-stack Dev', 'Cloud Deployment', 'Business Intelligence', 'AI Automation']
  },
];

const Projects = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [logoColor, setLogoColor] = useState('black');
  const [selectedProject, setSelectedProject] = useState(null);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  useEffect(() => {
    if (isMenuOpen) {
      document.body.classList.add('mil-menu-open');
    } else {
      document.body.classList.remove('mil-menu-open');
    }
  }, [isMenuOpen]);

  useEffect(() => {
    const handleScroll = () => {
      // Logo stays black on this page (white background)
      setLogoColor('black');
    };

    handleScroll();
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="mil-wrapper" id="top">
      {/* Preloader */}
      <Preloader />

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

      {/* Scrollbar Progress */}
      <div className="mil-progress-track">
        <div className="mil-progress"></div>
      </div>

      {/* Page Styles */}
      <style>{`
        .mil-menu-btn {
          opacity: 1 !important;
          visibility: visible !important;
        }

        body.mil-menu-open .mil-frame {
          opacity: 0 !important;
          pointer-events: none !important;
        }

        .mil-menu-frame .mil-logo {
          color: white !important;
        }

        /* Override: Show menu right section on all screen sizes */
        .mil-menu-frame .mil-menu-right-frame {
          display: flex !important;
        }

        /* Make menu scrollable on smaller screens */
        @media screen and (max-width: 1200px) {
          .mil-menu-frame .mil-menu-right-frame {
            display: flex !important;
            padding-left: 0;
            border-left: none;
            padding-top: 30px;
          }
          .mil-menu-frame .mil-menu-content .row {
            flex-direction: column;
          }
          .mil-menu-frame .mil-menu-content {
            overflow-y: auto;
            max-height: 80vh;
          }
        }

        /* Hide ball cursor when hovering over portfolio images */
        body.mil-hide-ball .mil-ball {
          opacity: 0 !important;
          transform: scale(0) !important;
          transition: opacity 0.2s ease, transform 0.2s ease !important;
        }

        /* ===== 3D DODECAHEDRON ANIMATION STYLES ===== */

        /* Force show animation on all screen sizes - override display:none */
        .mil-inner-banner {
          position: relative;
          overflow: visible;
        }

        .mil-inner-banner .mil-banner-content {
          position: relative;
        }

        .mil-inner-banner .mil-animation-frame {
          position: absolute !important;
          width: 100% !important;
          height: 100vh !important;
          top: 0 !important;
          left: 0 !important;
          pointer-events: none !important;
          z-index: 0 !important;
          overflow: visible !important;
          animation: jump 10s linear infinite !important;
        }

        /* Override the display:none from style.css for smaller screens */
        .mil-inner-banner .mil-animation.mil-position-4 {
          display: block !important;
          position: absolute !important;
          width: 300px !important;
          height: 300px !important;
          top: 80px !important;
          right: 15% !important;
          opacity: 0.2 !important;
        }

        /* Dark pentagon borders for inner banner */
        .mil-inner-banner .mil-animation.mil-position-4.mil-dark .mil-pentagon div {
          border-top: 0.1px solid rgb(0, 0, 0) !important;
        }

        /* Ensure dodecahedron is visible */
        .mil-inner-banner .mil-animation .mil-dodecahedron {
          position: relative !important;
          left: 100px !important;
          top: 40px !important;
          width: 100px !important;
          height: 223px !important;
          transform-style: preserve-3d !important;
          animation: rotate 100s infinite linear !important;
        }

        .mil-inner-banner .mil-animation .mil-pentagon {
          position: absolute !important;
          width: 100px !important;
        }

        .mil-inner-banner .mil-animation .mil-pentagon div {
          position: absolute !important;
          width: 100px !important;
          height: 69px !important;
          transform-origin: bottom !important;
        }

        /* Ensure banner content is above animation */
        .mil-inner-banner .mil-banner-content .container {
          position: relative;
          z-index: 1;
        }

        /* ===== RESPONSIVE STYLES ===== */
        @media screen and (max-width: 768px) {
          .mil-frame-top {
            background-color: white !important;
            border-radius: 20px !important;
            padding: 10px 20px !important;
            margin: 10px !important;
            box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1) !important;
          }

          .mil-logo,
          #logoText {
            color: black !important;
          }

          .mil-menu-btn span,
          .mil-menu-btn span::before,
          .mil-menu-btn span::after {
            background-color: black !important;
          }

          .mil-inner-banner .mil-animation.mil-position-4 {
            right: 5% !important;
            top: 50px !important;
            width: 200px !important;
            height: 200px !important;
            opacity: 0.15 !important;
          }
        }

        @media screen and (max-width: 480px) {
          .mil-inner-banner .mil-animation.mil-position-4 {
            display: none !important;
          }
        }


        /* Modal Styles */
        .mil-project-modal-backdrop {
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

        .mil-project-modal {
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

        .mil-type-label {
          color: #FFA801;
          font-size: 14px;
          text-transform: uppercase;
          letter-spacing: 2px;
          font-weight: 500;
        }

        .mil-tech-tags {
          display: flex;
          flex-wrap: wrap;
          gap: 10px;
        }

        .mil-tech-tag {
          padding: 8px 16px;
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 20px;
          font-size: 12px;
          color: rgba(255, 255, 255, 0.7);
        }

        .mil-modal-list {
          list-style: none;
          padding: 0;
        }

        .mil-modal-list li {
          display: flex;
          align-items: flex-start;
          gap: 15px;
          margin-bottom: 12px;
          color: rgba(255, 255, 255, 0.7);
        }

        .mil-modal-list .mil-accent-dot {
          width: 6px;
          height: 6px;
          background: #FFA801;
          border-radius: 50%;
          margin-top: 8px;
        }

        @media (max-width: 768px) {
          .mil-project-modal {
            padding: 30px;
            width: 95%;
          }
          .mil-modal-title {
            font-size: 28px;
          }
        }
      `}</style>

      <Navbar
        activePage="projects"
        logoColor={logoColor}
        isMenuOpen={isMenuOpen}
        toggleMenu={toggleMenu}
      />

      {/* Content */}
      <div className="mil-content">
        <div id="swupMain" className="mil-main-transition">

          {/* Banner */}
          <div className="mil-inner-banner">
            <div className="mil-banner-content mil-up">
              <div className="mil-animation-frame">
                <div className="mil-animation mil-position-4 mil-dark mil-scale" data-value-1="6" data-value-2="1.4">
                  {/* 3D Dodecahedron Animation */}
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
              <div className="container">
                <ul className="mil-breadcrumbs mil-mb-60">
                  <li><Link to="/" onClick={(e) => { e.preventDefault(); window.location.href = '/'; }}>Homepage</Link></li>
                  <li><Link to="/projects" onClick={(e) => { e.preventDefault(); window.location.href = '/projects'; }}>Portfolio</Link></li>
                </ul>
                <h1 className="mil-mb-60">Designing a <br /> Better <span className="mil-thin">World Today</span></h1>
                <a href="#portfolio" className="mil-link mil-dark mil-arrow-place mil-down-arrow">
                  <span>Our works</span>
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="mil-arrow">
                    <path d="M 14 5.3417969 C 13.744125 5.3417969 13.487969 5.4412187 13.292969 5.6367188 L 13.207031 5.7226562 C 12.816031 6.1136563 12.816031 6.7467188 13.207031 7.1367188 L 17.070312 11 L 4 11 C 3.448 11 3 11.448 3 12 C 3 12.552 3.448 13 4 13 L 17.070312 13 L 13.207031 16.863281 C 12.816031 17.254281 12.816031 17.887344 13.207031 18.277344 L 13.292969 18.363281 C 13.683969 18.754281 14.317031 18.754281 14.707031 18.363281 L 20.363281 12.707031 C 20.754281 12.316031 20.754281 11.682969 20.363281 11.292969 L 14.707031 5.6367188 C 14.511531 5.4412187 14.255875 5.3417969 14 5.3417969 z"></path>
                  </svg>
                </a>
              </div>
            </div>
          </div>
          {/* Banner End */}

          {/* Portfolio */}
          <section id="portfolio">
            <div className="container mil-portfolio mil-p-120-60">
              <div className="mil-lines-place">
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
              <div className="mil-lines-place mil-lines-long">
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

              <div className="row justify-content-between align-items-center">
                {portfolioItems.map((item) => (
                  <PortfolioItem key={item.id} item={item} onClick={setSelectedProject} />
                ))}
              </div>
            </div>
          </section>
          {/* Portfolio End */}

          {/* Project Modal */}
          {selectedProject && <ProjectModal project={selectedProject} onClose={() => setSelectedProject(null)} />}

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
                  Ready to bring your <span className="mil-thin">ideas to</span> life? <br /> We're <span className="mil-thin">here to help</span>
                </h2>
                <div className="mil-up">
                  <Link to="/contact" className="mil-button mil-arrow-place">
                    <span>Contact us</span>
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="mil-arrow">
                      <path d="M 14 5.3417969 C 13.744125 5.3417969 13.487969 5.4412187 13.292969 5.6367188 L 13.207031 5.7226562 C 12.816031 6.1136563 12.816031 6.7467188 13.207031 7.1367188 L 17.070312 11 L 4 11 C 3.448 11 3 11.448 3 12 C 3 12.552 3.448 13 4 13 L 17.070312 13 L 13.207031 16.863281 C 12.816031 17.254281 12.816031 17.887344 13.207031 18.277344 L 13.292969 18.363281 C 13.683969 18.754281 14.317031 18.754281 14.707031 18.363281 L 20.363281 12.707031 C 20.754281 12.316031 20.754281 11.682969 20.363281 11.292969 L 14.707031 5.6367188 C 14.511531 5.4412187 14.255875 5.3417969 14 5.3417969 z"></path>
                    </svg>
                  </Link>
                </div>
              </div>
            </div>
          </section>
          {/* Call to Action End */}

          {/* Footer */}
          <Footer />

          {/* Hidden Elements */}
          <div className="mil-hidden-elements">
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

        </div>
      </div>
    </div>
  );
};

export default Projects;
