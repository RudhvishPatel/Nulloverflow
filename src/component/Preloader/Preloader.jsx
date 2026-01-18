import { useEffect } from 'react';

const Preloader = () => {
  useEffect(() => {
    if (typeof gsap === 'undefined') return;

    // Detect mobile devices
    const isMobileDevice = window.innerWidth <= 768;

    // Set timing based on device
    const companyNameDuration = isMobileDevice ? 1.2 : 0.6;
    const companyNameDelay = isMobileDevice ? 0.8 : 0.5;

    // First reset any previous states if they exist
    gsap.set(".mil-preloader", { opacity: 1, display: 'block', visibility: 'visible', pointerEvents: 'all' });
    gsap.set(".mil-preloader-animation", { opacity: 0 });
    gsap.set(".mil-reveal-box", { width: "0%", x: '-30', opacity: 0, display: "block" });
    gsap.set(".mil-animation-1 .mil-h3", { y: "30px", opacity: 0 });
    gsap.set(".mil-animation-2 .mil-h3", { y: "0px", opacity: 0 });

    const timeline = gsap.timeline();

    timeline.to(".mil-preloader-animation", {
      opacity: 1,
    });

    timeline.fromTo(
      ".mil-animation-1 .mil-h3",
      {
        y: "30px",
        opacity: 0
      },
      {
        y: "0px",
        opacity: 1,
        stagger: 0.4
      }
    );

    timeline.to(".mil-animation-1 .mil-h3", {
      opacity: 0,
      y: '-30',
    }, "+=.3");

    // Set reveal box timing based on device
    const revealBoxDuration = isMobileDevice ? 0.15 : 0.3;
    const revealBoxDelay = isMobileDevice ? 0.05 : 0.2;
    const revealBoxFinalDelay = isMobileDevice ? 0 : 0.1;

    timeline.fromTo(".mil-reveal-box", 0.1, {
      opacity: 0,
    }, {
      opacity: 1,
      x: '-30',
    });

    timeline.to(".mil-reveal-box", revealBoxDuration, {
      width: "100%",
      x: 0,
    }, "+=" + revealBoxDelay);

    timeline.to(".mil-reveal-box", {
      right: "0"
    });

    timeline.to(".mil-reveal-box", revealBoxDuration, {
      width: "0%"
    }, "+=" + revealBoxFinalDelay);

    // Ensure box is completely hidden before company name appears
    timeline.set(".mil-reveal-box", {
      opacity: 0,
      display: "none"
    });

    timeline.fromTo(".mil-animation-2 .mil-h3", {
      opacity: 0,
    }, {
      opacity: 1,
    }, "-=.5");

    timeline.to(".mil-animation-2 .mil-h3", companyNameDuration, {
      opacity: 0,
      y: '-30'
    }, "+=" + companyNameDelay);

    timeline.to(".mil-preloader", 0.8, {
      opacity: 0,
      ease: 'sine',
    }, "+=.2");

    timeline.to(".mil-preloader", 0, {
      display: 'none',
      onComplete: () => {
        document.querySelector('.mil-preloader')?.classList.add("mil-hidden");
      }
    });

  }, []);

  return (
    <>
      {/* Preloader */}
      <div className="mil-preloader">
        <div className="mil-preloader-animation" style={{ opacity: 0 }}>
          <div className="mil-pos-abs mil-animation-1">
            <p className="mil-h3 mil-muted mil-thin">Pioneering</p>
            <p className="mil-h3 mil-muted">Creative</p>
            <p className="mil-h3 mil-muted mil-thin">Excellence</p>
          </div>
          <div className="mil-pos-abs mil-animation-2">
            <div className="mil-reveal-frame">
              <p className="mil-reveal-box"></p>
              <p className="mil-h3 mil-muted mil-thin">∅verflow()</p>
            </div>
          </div>
        </div>
      </div>

      {/* Preloader Styles */}
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
      `}</style>
    </>
  );
};

export default Preloader;
