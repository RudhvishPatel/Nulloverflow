import React, { useEffect, useRef, useState } from 'react';
import Footer from './HomeSection/footers';
import CustomerTestimonials from './HomeSection/testimonial';
import MeetOurTeamPage from './HomeSection/meetOurTeam';
import AgencyLandingPage from './HomeSection/agencyLanding';
import StudioAboutPage from './HomeSection/studioAboutPage';
import HeroSection from './HomeSection/herosection';
import PopularPublications from './HomeSection/popularPublication';
import CaseStudies from './HomeSection/caseStudies';
import Navbar from '../component/Navbar/Navbar';
import Preloader from '../component/Preloader/Preloader';

const Home = () => {
  const topRef = useRef(null);
  const aboutRef = useRef(null);
  const heroRef = useRef(null);
  const servicesRef = useRef(null);
  const caseStudiesRef = useRef(null);
  const teamRef = useRef(null);
  const testimonialsRef = useRef(null);
  const publicationsRef = useRef(null);
  const footerRef = useRef(null);
  const [showTop, setShowTop] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [logoColor, setLogoColor] = useState('white');

  const scrollToAbout = () => {
    if (aboutRef.current) {
      aboutRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }
  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };
  useEffect(() => {
    let ticking = false;

    const updateUI = () => {
      if (aboutRef.current) {
        setShowTop(window.scrollY >= aboutRef.current.offsetTop - 100);
      }

      // Change logo color based on which section is currently in view
      const scrollPosition = window.scrollY + 100; // Offset for navbar height

      // Helper to check if scroll position is within a ref's element
      const isInSection = (ref) => {
        if (!ref.current) return false;
        const { offsetTop, offsetHeight } = ref.current;
        return scrollPosition >= offsetTop && scrollPosition < offsetTop + offsetHeight;
      };

      // Determine logo color
      // Section 1: Hero (Black background) - White text
      if (isInSection(heroRef)) {
        setLogoColor('white');
      }
      // Section 2: About (White background) - Black text
      else if (isInSection(aboutRef)) {
        setLogoColor('black');
      }
      // Section 3: Services (Black background) - White text
      else if (isInSection(servicesRef)) {
        setLogoColor('white');
      }
      // Section 4: Case Studies (White background) - Black text
      else if (isInSection(caseStudiesRef)) {
        setLogoColor('black');
      }
      // Section 5+: Team, Testimonials, Publications (White backgrounds) - Black text
      else if (
        isInSection(publicationsRef) ||
        isInSection(teamRef) ||
        isInSection(testimonialsRef)
      ) {
        setLogoColor('black');
      }
      // Section Last: Footer (Black background) - White text
      else {
        // Default to white for footer or other areas
        setLogoColor('white');
      }

      ticking = false;
    };

    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(updateUI);
        ticking = true;
      }
    };

    // Run once on mount to set initial state
    updateUI();

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    // Add/remove class to body when menu opens/closes
    if (isMenuOpen) {
      document.body.classList.add('mil-menu-open');
    } else {
      document.body.classList.remove('mil-menu-open');
    }
  }, [isMenuOpen]);

  useEffect(() => {
    // Initialize jQuery plugins and animations after React renders
    // This ensures all DOM elements are available before jQuery tries to manipulate them
    const initializeScripts = () => {
      // Trigger jQuery ready event manually for scripts that depend on it
      if (window.jQuery && window.jQuery.isReady !== undefined) {
        // jQuery is loaded and ready, trigger custom initialization if needed
        console.log('React mounted, jQuery scripts should now initialize');
      }
    };

    // Small delay to ensure all child components have rendered
    const timer = setTimeout(initializeScripts, 100);

    return () => clearTimeout(timer);
  }, []); // Run once on mount

  return (
    <div className="mil-wrapper" id="top" ref={topRef}>
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



      {/* Mobile Responsive Styles */}
      <style>{`
        /* Ensure preloader works on all devices */
        .mil-preloader {
          z-index: 9999 !important;
        }


        /* Center preloader text on mobile */
        @media screen and (max-width: 992px) {
          .mil-preloader .mil-preloader-animation .mil-pos-abs {
            text-align: center !important;
          }

          .mil-preloader .mil-preloader-animation .mil-pos-abs p {
            margin-left: auto !important;
            margin-right: auto !important;
          }
        }

        /* Mobile preloader text adjustments */
        @media screen and (max-width: 768px) {
          .mil-preloader .mil-h3 {
            font-size: 28px !important;
          }

          .mil-preloader .mil-preloader-animation .mil-pos-abs .mil-reveal-frame {
            padding: 0 20px;
          }
        }

        @media screen and (max-width: 480px) {
          .mil-preloader .mil-h3 {
            font-size: 24px !important;
          }
        }

        /* Laptop view - move navbar lower */
        @media screen and (min-width: 1024px) and (max-width: 1440px) {
          .mil-frame-top {
            top: 30px !important;
          }
        }

        /* Make hamburger button visible initially */
        .mil-menu-btn {
          opacity: 1 !important;
          visibility: visible !important;
        }

        .mil-menu-btn span,
        .mil-menu-btn span::before,
        .mil-menu-btn span::after {
          opacity: 1 !important;
          visibility: visible !important;
          transition: background-color 0.3s ease !important;
        }

        /* Ensure pseudo-elements inherit the background color */
        .mil-menu-btn span::before,
        .mil-menu-btn span::after {
          background-color: inherit !important;
        }

        /* Hide main frame when menu is open to avoid duplicate logos and X buttons */
        body.mil-menu-open .mil-frame {
          opacity: 0 !important;
          pointer-events: none !important;
        }

        /* Style menu frame logo to be white */
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

        /* Hide back-to-top button on mobile and tablets to prevent auto-scroll issues */
        @media screen and (max-width: 768px) {
          .mil-back-to-top,
          .mil-back-to-top * {
            display: none !important;
            visibility: hidden !important;
            pointer-events: none !important;
            opacity: 0 !important;
          }

          /* Mobile navigation styles - white background with rounded corners */
          .mil-frame-top {
            background-color: white !important;
            border-radius: 20px !important;
            padding: 10px 20px !important;
            margin: 10px !important;
            box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1) !important;
          }

          /* Force logo color to white on mobile */
          .mil-logo,
          #logoText {
            color: black !important;
          }

          /* Menu button color on mobile */
          .mil-menu-btn span,
          .mil-menu-btn span::before,
          .mil-menu-btn span::after {
            background-color: black !important;
          }
        }
      `}</style>



      {/* Scrollbar Progress */}
      <div className="mil-progress-track">
        <div className="mil-progress"></div>
      </div>

      <Navbar
        activePage="home"
        logoColor={logoColor}
        isMenuOpen={isMenuOpen}
        toggleMenu={toggleMenu}
      />

      {/* Content */}
      <div className="mil-content">
        <div id="swupMain" className="mil-main-transition">

          {/* Banner - New HeroSection Component (Migrated to Tailwind CSS) */}
          <div ref={heroRef}>
            <HeroSection scrollToAbout={scrollToAbout} />
          </div>

          {/*
          OLD BANNER CODE - COMMENTED OUT
          The banner section has been extracted to a separate HeroSection component
          with Tailwind CSS migration. See /src/pages/herosection.jsx
          */}

          {/* About */}
          <div id="about" ref={aboutRef}>
            <div className="mil-about">
              <StudioAboutPage />
            </div>
          </div>

          {/* Services */}
          <div ref={servicesRef}>
            <AgencyLandingPage />
          </div>

          {/* Case Studies */}
          <div ref={caseStudiesRef}>
            <CaseStudies />
          </div>

          {/* Team */}
          <div ref={teamRef}>
            <MeetOurTeamPage />
          </div>

          {/* Reviews */}
          <div ref={testimonialsRef}>
            <CustomerTestimonials />
          </div>

          {/* Blog */}
          <div ref={publicationsRef}>
            <PopularPublications />
          </div>

          {/* Footer */}
          <div ref={footerRef}>
            <Footer />
          </div>

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

            {/* <svg width="250" viewBox="0 0 300 1404" fill="none" xmlns="http://www.w3.org/2000/svg" className="mil-lines">
              <path fillRule="evenodd" clipRule="evenodd" d="M1 892L1 941H299V892C299 809.71 232.29 743 150 743C67.7096 743 1 809.71 1 892ZM0 942H300V892C300 809.157 232.843 742 150 742C67.1573 742 0 809.157 0 892L0 942Z" className="mil-move"></path>
              <path fillRule="evenodd" clipRule="evenodd" d="M299 146V97L1 97V146C1 228.29 67.7096 295 150 295C232.29 295 299 228.29 299 146ZM300 96L0 96V146C0 228.843 67.1573 296 150 296C232.843 296 300 228.843 300 146V96Z" className="mil-move"></path>
              <path fillRule="evenodd" clipRule="evenodd" d="M299 1H1V1403H299V1ZM0 0V1404H300V0H0Z"></path>
              <path fillRule="evenodd" clipRule="evenodd" d="M150 -4.37115e-08L150 1404L149 1404L149 0L150 -4.37115e-08Z"></path>
              <path fillRule="evenodd" clipRule="evenodd" d="M150 1324C232.29 1324 299 1257.29 299 1175C299 1092.71 232.29 1026 150 1026C67.7096 1026 1 1092.71 1 1175C1 1257.29 67.7096 1324 150 1324ZM150 1325C232.843 1325 300 1257.84 300 1175C300 1092.16 232.843 1025 150 1025C67.1573 1025 0 1092.16 0 1175C0 1257.84 67.1573 1325 150 1325Z" className="mil-move"></path>
              <path fillRule="evenodd" clipRule="evenodd" d="M300 1175H0V1174H300V1175Z" className="mil-move"></path>
              <path fillRule="evenodd" clipRule="evenodd" d="M150 678C232.29 678 299 611.29 299 529C299 446.71 232.29 380 150 380C67.7096 380 1 446.71 1 529C1 611.29 67.7096 678 150 678ZM150 679C232.843 679 300 611.843 300 529C300 446.157 232.843 379 150 379C67.1573 379 0 446.157 0 529C0 611.843 67.1573 679 150 679Z" className="mil-move"></path>
              <path fillRule="evenodd" clipRule="evenodd" d="M299 380H1V678H299V380ZM0 379V679H300V379H0Z" className="mil-move"></path>
            </svg> */}
          </div>

        </div>
      </div>
    </div>
  );
};

export default Home;