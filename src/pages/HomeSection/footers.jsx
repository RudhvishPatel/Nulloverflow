import { memo, useCallback, useState } from 'react';
import { Link } from 'react-router-dom';
import '../../index.css';

// Social icons data
const SOCIAL_LINKS = [
  {
    name: 'Behance',
    path: 'M20.07 6.35H15v1.33h5.07V6.35zM19.5 14.5c0-1.93-1.57-3.5-3.5-3.5s-3.5 1.57-3.5 3.5c0 1.93 1.57 3.5 3.5 3.5 1.4 0 2.6-.82 3.16-2h-2.32c-.25.3-.63.5-1.07.5-.83 0-1.5-.67-1.5-1.5h5.22c.01-.17.01-.33.01-.5zM14.5 13.5c0-.83.67-1.5 1.5-1.5s1.5.67 1.5 1.5h-3zM9.5 9C8.67 9 8 9.67 8 10.5S8.67 12 9.5 12c.17 0 .33-.03.5-.08v3.58c0 .83-.67 1.5-1.5 1.5H7c-.83 0-1.5-.67-1.5-1.5v-4c0-.83-.67-1.5-1.5-1.5S2.5 10.67 2.5 11.5v4c0 1.93 1.57 3.5 3.5 3.5h1.5c1.93 0 3.5-1.57 3.5-3.5V10.5C11 9.67 10.33 9 9.5 9z',
    fill: 'currentColor'
  },
  {
    name: 'Dribbble',
    stroke: 'currentColor',
    paths: ['M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z', 'M2 12c5 0 10-3 10-10M12 2c0 7 3 12 10 12M22 12c-7 0-12 3-12 10M12 22c0-5-3-10-10-10']
  },
  {
    name: 'Twitter',
    path: 'M23 3a10.9 10.9 0 01-3.14 1.53 4.48 4.48 0 00-7.86 3v1A10.66 10.66 0 013 4s-4 9 5 13a11.64 11.64 0 01-7 2c9 5 20 0 20-11.5a4.5 4.5 0 00-.08-.83A7.72 7.72 0 0023 3z',
    fill: 'currentColor'
  },
  {
    name: 'GitHub',
    path: 'M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.17 6.839 9.49.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.603-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.463-1.11-1.463-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.578 9.578 0 0112 6.836c.85.004 1.705.114 2.504.336 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C19.138 20.167 22 16.418 22 12c0-5.523-4.477-10-10-10z',
    fill: 'currentColor'
  }
];

const NAV_LINKS = [
  { text: 'Home', path: '/', active: true },
  { text: 'Portfolio', path: '/projects', active: true },
  { text: 'Services', path: '/services', active: true },
  { text: 'Personal', path: '/personal', active: true }
];

const POLICY_LINKS = ['Our Research', 'AI Solutions', 'Career & Internships', 'Privacy Policy'];

const LOCATIONS = [
  {
    title: 'Ahmedabad',
    address: '501, Solitaire Building, opp. meghdoot Petrol pump,',
    city: 'Shahibag, Gujarat 380004, India'
  },
  {
    title: 'Chicago',
    address: '220 N Green St,',
    city: 'Chicago, IL 60607'
  }
];

const BRAND_NAME = '∅verflow';

// Memoized SocialIcon component
const SocialIcon = memo(({ name, path, paths, fill, stroke }) => (
  <a
    href="#"
    className="text-[#a0a0a0] transition-all duration-300 ease-in-out hover:text-[#ff9500] hover:-translate-y-0.5 flex items-center cursor-pointer max-md:opacity-80"
    aria-label={name}
  >
    <svg className="w-[22px] h-[22px] sm:w-5 sm:h-5 max-sm:w-[18px] max-sm:h-[18px]" viewBox="0 0 24 24" fill={fill || 'none'} stroke={stroke} strokeWidth={stroke ? '2' : undefined}>
      {paths ? paths.map((p, i) => <path key={i} d={p} />) : <path d={path} />}
    </svg>
  </a>
));

SocialIcon.displayName = 'SocialIcon';

const Footer = () => {
  const [email, setEmail] = useState('');

  const handleSubmit = useCallback((e) => {
    e.preventDefault();
    console.log('Newsletter subscription:', email);
    setEmail('');
  }, [email]);

  const handleEmailChange = useCallback((e) => {
    setEmail(e.target.value);
  }, []);

  return (
    <footer className="bg-[#000000] relative" style={{ backgroundColor: '#000000', color: '#ffffff', paddingTop: '120px', paddingBottom: '120px', paddingLeft: '200px', paddingRight: '200px' }}>
      <style>{`
        @media (max-width: 1280px) {
          footer {
            padding: 96px 60px !important;
          }
        }
        @media (max-width: 1024px) {
          footer {
            padding: 70px 40px !important;
          }
        }
        @media (max-width: 768px) {
          footer {
            padding: 50px 24px !important;
          }
        }
        @media (max-width: 640px) {
          footer {
            padding: 40px 20px !important;
          }
        }
      `}</style>
      <div className="max-w-[1600px] mx-auto relative">
        <style>{`
          @media (min-width: 1025px) {
            .footer-container {
              display: grid;
              grid-template-columns: 1fr auto 1fr;
              gap: 150px;
            }
          }
          @media (max-width: 1024px) {
            .footer-container {
              display: block;
            }
            .footer-column {
              width: 100%;
              margin-bottom: 50px;
            }
            .footer-column:last-child {
              margin-bottom: 0;
            }
          }
          @media (max-width: 768px) {
            .footer-column {
              text-align: center;
              margin-bottom: 40px;
            }
          }
          @media (max-width: 640px) {
            .footer-column {
              margin-bottom: 32px;
            }
          }
        `}</style>

        <div className="footer-container">
          {/* Left Column - Brand and Newsletter */}
          <div className="footer-column" style={{ display: 'flex', flexDirection: 'column', gap: '50px' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', marginBottom: '10px' }}>
              <style>{`
                @media (max-width: 768px) {
                  .brand-container {
                    justify-content: center;
                    width: 100%;
                  }
                }
              `}</style>
              <span className="brand-container" style={{ fontSize: '48px', fontWeight: '300', color: '#ffffff', lineHeight: '1.1', letterSpacing: '-0.02em' }}>
                <style>{`
                  @media (max-width: 1024px) {
                    .brand-container {
                      font-size: 42px;
                    }
                  }
                  @media (max-width: 768px) {
                    .brand-container {
                      font-size: 36px;
                      display: block;
                      text-align: center;
                    }
                  }
                  @media (max-width: 640px) {
                    .brand-container {
                      font-size: 28px;
                    }
                  }
                `}</style>
                {BRAND_NAME}
              </span>
            </div>

            <p style={{ color: '#a0a0a0', fontSize: '15px', fontWeight: '400', margin: 0 }}>
              <style>{`
                @media (max-width: 768px) {
                  .newsletter-text {
                    text-align: center;
                    font-size: 13px;
                  }
                }
                @media (max-width: 640px) {
                  .newsletter-text {
                    font-size: 12px;
                  }
                }
              `}</style>
              <span className="newsletter-text">Subscribe our newsletter:</span>
            </p>

            <form
              style={{ display: 'flex', alignItems: 'center', backgroundColor: '#2a2a2a', borderRadius: '60px', paddingRight: '8px', maxWidth: '450px', width: '100%', height: '60px' }}
              onSubmit={handleSubmit}
            >
              <style>{`
                @media (max-width: 768px) {
                  .newsletter-form {
                    max-width: 100%;
                    margin: 0 auto;
                    height: 50px !important;
                  }
                }
                @media (max-width: 640px) {
                  .newsletter-form {
                    height: 48px !important;
                  }
                }
              `}</style>
              <input
                type="email"
                placeholder="ENTER OUR EMAIL"
                style={{ flex: 1, backgroundColor: 'transparent', marginTop: '16px', border: 'none', color: '#ffffff', fontSize: '13px', letterSpacing: '0.05em', outline: 'none', fontWeight: '400', paddingLeft: '35px', paddingRight: '35px' }}
                className="newsletter-form"
                value={email}
                onChange={handleEmailChange}
                aria-label="Email address"
              />
              <button
                style={{
                  width: '50px',
                  height: '50px',
                  backgroundColor: '#FFA801',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: 0,
                  border: 'none',
                  cursor: 'pointer',
                  transition: 'background-color 0.3s ease',
                }}
                type="submit"
                aria-label="Subscribe"
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#e69500'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#FFA801'}
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="20" height="20">
                  <path fill="#000000" d="M 14 5.3417969 C 13.744125 5.3417969 13.487969 5.4412187 13.292969 5.6367188 L 13.207031 5.7226562 C 12.816031 6.1136563 12.816031 6.7467188 13.207031 7.1367188 L 17.070312 11 L 4 11 C 3.448 11 3 11.448 3 12 C 3 12.552 3.448 13 4 13 L 17.070312 13 L 13.207031 16.863281 C 12.816031 17.254281 12.816031 17.887344 13.207031 18.277344 L 13.292969 18.363281 C 13.683969 18.754281 14.317031 18.754281 14.707031 18.363281 L 20.363281 12.707031 C 20.754281 12.316031 20.754281 11.682969 20.363281 11.292969 L 14.707031 5.6367188 C 14.511531 5.4412187 14.255875 5.3417969 14 5.3417969 z"></path>
                </svg>
              </button>
            </form>

            <div style={{ display: 'flex', gap: '20px' }}>
              <style>{`
                @media (max-width: 768px) {
                  .social-icons {
                    justify-content: center;
                    gap: 14px !important;
                  }
                }
              `}</style>
              <div className="social-icons" style={{ display: 'flex', gap: '20px' }}>
                {SOCIAL_LINKS.map(link => (
                  <SocialIcon key={link.name} {...link} />
                ))}
              </div>
            </div>

            <p style={{ color: '#606060', fontSize: '16px', fontWeight: '400', margin: 0 }}>
              <style>{`
                @media (max-width: 768px) {
                  .copyright {
                    text-align: center;
                    font-size: 11px;
                  }
                }
                @media (max-width: 640px) {
                  .copyright {
                    font-size: 10px;
                  }
                }
              `}</style>
              <span className="copyright">© Copyright 2025 - ∅verflow. All Rights Reserved.</span>
            </p>
          </div>

          {/* Middle Column - Navigation */}
          <nav className="footer-column" style={{ display: 'flex', flexDirection: 'column', gap: '28px', paddingTop: 0, minWidth: '200px' }}>
            <style>{`
              @media (max-width: 1024px) {
                .nav-column {
                  min-width: 0 !important;
                }
              }
              @media (max-width: 768px) {
                .nav-column {
                  align-items: center;
                }
              }
            `}</style>
            <div className="nav-column" style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
              {NAV_LINKS.map(link => (
                link.path.startsWith('#') ? (
                  <a
                    key={link.text}
                    href={link.path}
                    style={{ textDecoration: 'none', color: '#ffffff', fontSize: '38px', fontWeight: '300', letterSpacing: '-0.02em', lineHeight: '1.2' }}
                  >
                    <style>{`
                      @media (max-width: 1024px) {
                        .nav-link {
                          font-size: 32px;
                        }
                      }
                      @media (max-width: 768px) {
                        .nav-link {
                          font-size: 26px;
                          text-align: center;
                          display: block;
                          width: 100%;
                        }
                      }
                      @media (max-width: 640px) {
                        .nav-link {
                          font-size: 20px;
                        }
                      }
                    `}</style>
                    <span className="nav-link">{link.text}</span>
                  </a>
                ) : (
                  <Link
                    key={link.text}
                    to={link.path}
                    style={{ textDecoration: 'none', color: '#ffffff', fontSize: '38px', fontWeight: '300', letterSpacing: '-0.02em', lineHeight: '1.2' }}
                  >
                    <style>{`
                      @media (max-width: 1024px) {
                        .nav-link {
                          font-size: 32px;
                        }
                      }
                      @media (max-width: 768px) {
                        .nav-link {
                          font-size: 26px;
                          text-align: center;
                          display: block;
                          width: 100%;
                        }
                      }
                      @media (max-width: 640px) {
                        .nav-link {
                          font-size: 20px;
                        }
                      }
                    `}</style>
                    <span className="nav-link">{link.text}</span>
                  </Link>
                )
              ))}
            </div>
          </nav>

          {/* Right Column - Policies and Locations */}
          <div className="footer-column" style={{ display: 'flex', flexDirection: 'column', gap: '80px', paddingTop: '5px', justifyContent: 'space-between' }}>
            <style>{`
              @media (max-width: 768px) {
                .right-column {
                  padding-top: 0 !important;
                  align-items: center;
                  gap: 40px !important;
                }
              }
              @media (max-width: 640px) {
                .right-column {
                  gap: 32px !important;
                }
              }
            `}</style>
            <div className="right-column" style={{ display: 'flex', flexDirection: 'column', gap: '80px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
                <style>{`
                  @media (max-width: 768px) {
                    .policy-links {
                      align-items: center;
                      gap: 12px !important;
                    }
                  }
                `}</style>
                <div className="policy-links" style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
                  {POLICY_LINKS.map(policy => (
                    <a
                      key={policy}
                      href="#"
                      style={{ color: '#a0a0a0', textDecoration: 'none', fontSize: '15px', fontWeight: '400' }}
                    >
                      <style>{`
                        @media (max-width: 768px) {
                          .policy-link {
                            text-align: center;
                            font-size: 13px;
                          }
                        }
                        @media (max-width: 640px) {
                          .policy-link {
                            font-size: 12px;
                          }
                        }
                      `}</style>
                      <span className="policy-link">{policy}</span>
                    </a>
                  ))}
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '40px' }}>
                <style>{`
                  @media (max-width: 768px) {
                    .locations {
                      align-items: center;
                      gap: 24px !important;
                    }
                  }
                `}</style>
                <div className="locations" style={{ display: 'flex', flexDirection: 'column', gap: '40px' }}>
                  {LOCATIONS.map(location => (
                    <div key={location.title}>
                      <style>{`
                        @media (max-width: 768px) {
                          .location {
                            text-align: center;
                          }
                        }
                      `}</style>
                      <div className="location">
                        <h3 style={{ fontSize: '24px', fontWeight: '500', marginBottom: '20px', color: '#ffffff', letterSpacing: '-0.02em', marginTop: 0 }}>
                          <style>{`
                            @media (max-width: 1024px) {
                              .location-title {
                                font-size: 20px;
                              }
                            }
                            @media (max-width: 768px) {
                              .location-title {
                                font-size: 18px;
                                margin-bottom: 16px;
                              }
                            }
                            @media (max-width: 640px) {
                              .location-title {
                                font-size: 16px;
                                margin-bottom: 12px;
                              }
                            }
                          `}</style>
                          <span className="location-title">{location.title}</span>
                        </h3>
                        <p style={{ color: '#a0a0a0', fontSize: '15px', lineHeight: '1.9', fontWeight: '400', margin: 0 }}>
                          <style>{`
                            @media (max-width: 768px) {
                              .location-text {
                                font-size: 13px;
                                line-height: 1.7;
                              }
                            }
                            @media (max-width: 640px) {
                              .location-text {
                                font-size: 12px;
                              }
                            }
                          `}</style>
                          <span className="location-text">
                            {location.address}<br />
                            {location.city}
                          </span>
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Back to Top Button - Right Side */}
      <button
        className="fixed right-[30px] bottom-[30px] bg-[#ffffff] border-none cursor-pointer flex flex-col items-center gap-3 py-4 px-3 text-[#000000] transition-all duration-300 ease-in-out rounded-[50px] shadow-[0_4px_20px_rgba(255,255,255,0.1)] hover:text-[#ff9500] hover:bg-[#f8f8f8] hover:-translate-y-0.5 hover:shadow-[0_6px_25px_rgba(255,255,255,0.15)] lg:bottom-[25px] lg:right-[25px] md:bottom-5 md:right-5 sm:bottom-4 sm:right-4 sm:py-2.5 sm:px-2 sm:gap-2 max-sm:bottom-3 max-sm:right-3 max-sm:py-2 max-sm:px-1.5 max-sm:gap-1.5 max-md:shadow-[0_2px_15px_rgba(255,255,255,0.15)]"
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        aria-label="Back to top"
      >
        <svg
          className="w-6 h-6 md:w-5 md:h-5 sm:w-4 sm:h-4 max-sm:w-3.5 max-sm:h-3.5"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path d="M12 19V5M5 12l7-7 7 7" />
        </svg>
        <span className="[writing-mode:vertical-rl] rotate-180 text-[10px] tracking-[3px] text-[#000000] font-medium transition-colors duration-300 ease-in-out hover:text-[#ff9500] md:text-[9px] md:tracking-[2.5px] sm:text-[7px] sm:tracking-[1.5px] max-sm:text-[6px] max-sm:tracking-[1px]">BACK TO TOP</span>
      </button>
    </footer>
  );
};

export default Footer;
