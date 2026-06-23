import React from 'react';

const HeroSection = ({ scrollToAbout }) => {
  return (
    <>
      {/* Hero Section Styles */}
      <style>{`
        /* Force black background */
        .mil-banner.mil-dark-bg {
          background-color: white  !important;
        }


        /* Tablet View (1024px and below) */
        @media screen and (max-width: 1024px) {
          .hero-banner-content {
            padding-bottom: 100px !important;
          }
          .hero-heading {
            font-size: 64px !important;
            line-height: 1.2 !important;
            margin-bottom: 40px !important;
          }
          .hero-description {
            font-size: 15px !important;
            line-height: 22px !important;
            margin-bottom: 40px !important;
          }
        }

        /* Tablet and Phone View (768px and below) */
        @media screen and (max-width: 768px) {
          .hero-banner-content {
            padding-bottom: 80px !important;
          }
          .hero-heading {
            font-size: 48px !important;
            line-height: 1.3 !important;
            margin-bottom: 30px !important;
          }
          .hero-description {
            font-size: 14px !important;
            line-height: 20px !important;
            margin-bottom: 35px !important;
          }
          .hero-description br {
            display: none;
          }
          .hero-view-works {
            display: none !important;
          }
        }

        /* Phone View (600px and below) */
        @media screen and (max-width: 600px) {
          .hero-banner-content {
            padding-bottom: 60px !important;
          }
          .hero-heading {
            font-size: 40px !important;
            line-height: 1.25 !important;
            margin-bottom: 25px !important;
          }
          .hero-description {
            font-size: 13px !important;
            line-height: 19px !important;
            margin-bottom: 30px !important;
          }
        }

        /* Small Phone View (480px and below) */
        @media screen and (max-width: 480px) {
          .hero-banner-content {
            padding-bottom: 50px !important;
          }
          .hero-heading {
            font-size: 36px !important;
            line-height: 1.3 !important;
            margin-bottom: 20px !important;
          }
          .hero-description {
            font-size: 12px !important;
            line-height: 18px !important;
            margin-bottom: 25px !important;
            padding: 0 10px !important;
          }
          .hero-cta-button {
            font-size: 10px !important;
            height: 60px !important;
            padding: 0 10px 0 40px !important;
          }
        }

        /* Extra Small Phone View (375px and below) */
        @media screen and (max-width: 375px) {
          .hero-heading {
            font-size: 32px !important;
            line-height: 1.3 !important;
          }
          .hero-description {
            font-size: 20px !important;
            line-height: 17px !important;
          }
        }
      `}</style>

      {/* Banner */}
      <section className="mil-banner mil-dark-bg">
        <div className="mi-invert-fix">
          <div className="mil-animation-frame">
            <div className="mil-animation mil-position-1 mil-scale" data-value-1="7" data-value-2="1.6"></div>
            <div className="mil-animation mil-position-2 mil-scale" data-value-1="4" data-value-2="1"></div>
            <div className="mil-animation mil-position-3 mil-scale" data-value-1="1.2" data-value-2=".1"></div>
          </div>

          {/* <div class="mil-animation-frame">
              <div class="mil-animation mil-position-1 mil-scale" data-value-1="2.4" data-value-2="1.4" style="top: 300px; right: -100px"></div>
              <div class="mil-animation mil-position-2 mil-scale" data-value-1="2" data-value-2="1" style="left: 150px"></div>
            </div> */}

          <div className="mil-gradient"></div>

          <div className="container mx-auto px-4">
            <div className="hero-banner-content mil-banner-content mil-up md:text-left max-md:flex max-md:flex-col max-md:items-center max-md:text-center">
              <h1 className="hero-heading mil-muted mil-mb-60 max-md:text-center">
                Designing <span className="mil-thin">a Better</span><br /> World <span className="mil-thin">Today</span>
              </h1>
              <div className="row w-full max-md:justify-center">
                <div className="col-md-7 col-lg-5 max-md:max-w-full max-md:px-5">
                  <p className="hero-description mil-light-soft mil-mb-60 max-md:text-center" style={{ fontSize: "34px", lineHeight: "40px" }}>
                    {/* Welcome to our world of endless imigination and boundless <br /> creativity. Together, let's embark on a remarkable journey where <br /> */}Dreams become tangible realities.
                  </p>
                </div>
              </div>
              <a href="/services" className="hero-cta-button mil-button mil-arrow-place mil-btn-space max-md:mx-auto max-md:mb-5">
                <span>What we do</span>
              </a>
              <a href="/projects" className="hero-view-works mil-link mil-muted mil-arrow-place mil-view-works">
                <span>View works</span>
              </a>
              <div className="mil-circle-text">
                <svg
                  version="1.1"
                  xmlns="http://www.w3.org/2000/svg"
                  xmlnsXlink="http://www.w3.org/1999/xlink"
                  x="0px"
                  y="0px"
                  viewBox="0 0 300 300"
                  enableBackground="new 0 0 300 300"
                  xmlSpace="preserve"
                  className="mil-ct-svg mil-rotate"
                  data-value="360"
                >
                  <defs>
                    <path id="circlePath" d="M 150, 150 m -60, 0 a 60,60 0 0,1 120,0 a 60,60 0 0,1 -120,0 "></path>
                  </defs>
                  <circle cx="60" cy="80" r="45" fill="none"></circle>
                  <g>
                    <use xlinkHref="#circlePath" fill="none"></use>
                    <text style={{ letterSpacing: '6.5px' }}>
                      <textPath xlinkHref="#circlePath">Scroll down - Scroll down - </textPath>
                    </text>
                  </g>
                </svg>
                <a
                  href="#about"
                  onClick={(e) => {
                    e.preventDefault();
                    if (scrollToAbout) scrollToAbout();
                  }}
                  className="mil-button mil-arrow-place mil-icon-button mil-arrow-down"
                ></a>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default HeroSection;