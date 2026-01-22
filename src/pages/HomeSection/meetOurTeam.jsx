import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const MeetOurTeamPage = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [hoveredCard, setHoveredCard] = useState(null);
  const [ctaHovered, setCtaHovered] = useState(false);

  useEffect(() => {
    const timer = requestAnimationFrame(() => {
      setIsVisible(true);
    });
    return () => cancelAnimationFrame(timer);
  }, []);

  const founder = {
    name: 'Rudhvish Patel',
    role: 'Founder of the Company',
    image: '/images/rudvishPatel.jpeg'
  };

  return (
    <div className="w-full min-h-screen bg-[#fafafa] font-['Outfit',sans-serif] relative overflow-hidden max-md:overflow-visible">
      {/* Keyframe animations */}
      <style>
        {`
          @keyframes fadeInUp {
            from {
              opacity: 0;
              transform: translateY(30px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }

          @keyframes scaleIn {
            from {
              opacity: 0;
              transform: scale(0.8);
            }
            to {
              opacity: 1;
              transform: scale(1);
            }
          }

          @media (max-width: 768px) {
            .mobile-container {
              display: block !important;
            }
          }
        `}
      </style>

      <div className="mobile-container flex px-[50px] max-w-[1400px] mx-auto my-[120px] items-start justify-center lg:flex-col lg:px-10 lg:my-20 lg:items-center md:flex-col md:px-5 md:my-16 max-md:block max-md:px-4 max-md:my-10">

        {/* Left Section */}
        <section className="flex-[0_0_600px] pt-0 p-5 lg:flex-[0_0_55%] lg:max-w-[55%] lg:mb-[60px] lg:pt-0 md:max-w-full md:mb-10 md:p-0 max-md:w-full max-md:mb-10 max-md:px-3 max-md:p-0">
          {/* Heading */}
          <h1
            className="text-[65px] font-medium leading-[105px] mb-[50px] text-black tracking-[-3px] lg:text-[52px] lg:leading-[84px] lg:mb-[35px] lg:tracking-[-2px] md:text-[42px] md:leading-[68px] md:mb-[30px] md:tracking-[-1.5px] max-md:text-[32px] max-md:leading-[38px] max-md:mb-[25px]"
            style={{
              opacity: isVisible ? 1 : 0,
              transform: isVisible ? 'translateY(0)' : 'translateY(30px)',
              transition: 'all 0.8s ease-out'
            }}
          >
            Meet Our Founder
          </h1>

          {/* Description 1 */}
          <p
            className="text-[20px] leading-[32px] font-light text-[#9b9b9b] mb-7 w-[90%] max-w-[550px] lg:w-full lg:max-w-full lg:text-[16px] lg:leading-[26px] lg:mb-6 md:w-full md:text-[13px] md:leading-[21px] md:mb-5 max-md:w-full max-md:text-[12px] max-md:leading-[19px] max-md:mb-[18px]"
            style={{
              opacity: isVisible ? 1 : 0,
              transform: isVisible ? 'translateY(0)' : 'translateY(30px)',
              transition: 'all 0.8s ease-out 0.2s'
            }}
          >
            Rudhvish Patel is a GenAI Engineer and AI researcher with a Master's in Computer Science from DePaul University. His expertise spans conversational AI, machine learning, and cloud architecture, with published research accepted at IEEE eScience 2025. He bridges academic innovation with practical implementation, building intelligent solutions deployed on AWS infrastructure.
          </p>

          {/* Description 2 */}
          <p
            className="text-[20px] leading-[32px] text-[#9b9b9b] mb-7 w-[90%] max-w-[550px] lg:w-full lg:max-w-full lg:text-[16px] lg:leading-[26px] lg:mb-6 md:w-full md:text-[13px] md:leading-[21px] md:mb-5 max-md:w-full max-md:text-[12px] max-md:leading-[19px] max-md:mb-[18px]"
            style={{
              opacity: isVisible ? 1 : 0,
              transform: isVisible ? 'translateY(0)' : 'translateY(30px)',
              transition: 'all 0.8s ease-out 0.3s'
            }}
          >
            At NullOverflow, Rudhvish's vision is to democratize AI by making enterprise-grade technology accessible to businesses of all sizes. With certifications in AWS and CompTIA Security+, he leads with a client-first philosophy—delivering measurable results and transforming complex technological challenges into streamlined, scalable solutions.

          </p>

          {/* CTA Button */}
          <Link
            to="/projects"
            className="bg-[#ff9500] text-black border-none rounded-[50px] px-5 py-1 text-[13px] font-semibold tracking-[0.15em] cursor-pointer inline-flex items-center gap-4 transition-all duration-300 uppercase mt-[30px] mb-[100px] lg:mb-[60px] lg:text-[10px] md:px-[35px] md:py-4 md:text-[8px] md:mb-[50px] max-md:px-[30px] max-md:py-[14px] max-md:text-[7px] max-md:gap-[15px]"
            style={{
              opacity: isVisible ? 1 : 0,
              transform: isVisible
                ? (ctaHovered ? 'translateY(-2px)' : 'translateY(0)')
                : 'translateY(30px)',
              transition: 'all 0.8s ease-out 0.4s',
              boxShadow: ctaHovered ? '0 15px 40px rgba(255, 149, 0, 0.4)' : '0 10px 30px rgba(255, 149, 0, 0.3)'
            }}
            onMouseEnter={() => setCtaHovered(true)}
            onMouseLeave={() => setCtaHovered(false)}
          >
            READ MORE
            <div className='mil-button mil-arrow-place mil-icon-button mil-arrow-right'></div>
          </Link>

          {/* Tagline */}
          <div
            className="text-[32px] leading-[52px] mt-[30px] lg:text-[26px] lg:leading-[42px] md:text-[21px] md:leading-[34px] max-md:text-[16px] max-md:leading-[26px]"
            style={{
              opacity: isVisible ? 1 : 0,
              transition: 'all 1s ease-out 0.6s'
            }}
          >
            <span className="text-black font-thin">We </span>
            <span className="text-black font-medium">delivering</span>
            <br />
            <span className="text-black font-thin">exceptional </span>
            <span className="text-black font-medium">results.</span>
          </div>
        </section>

        {/* Right Section - Founder Photo */}
        <section className="flex-1 relative pt-0 max-w-[560px] lg:max-w-full lg:pt-0 md:w-full md:max-w-full max-md:w-full max-md:max-w-full flex items-center justify-center max-md:px-0">

          {/* Single Founder Image Card */}
          <div
            className="w-full max-w-[500px] h-[650px] rounded-[30px] overflow-hidden cursor-pointer transition-all duration-[400ms] ease-[cubic-bezier(0.4,0,0.2,1)] bg-[#e8e8e8] lg:h-[580px] lg:rounded-[28px] md:h-[500px] md:rounded-[25px] max-md:h-[400px] max-md:max-w-full max-md:rounded-[20px]"
            style={{
              opacity: isVisible ? 1 : 0,
              transform: isVisible ? 'scale(1)' : 'scale(0.8)',
              transition: 'all 0.8s ease-out 0.5s'
            }}
            onMouseEnter={() => setHoveredCard(true)}
            onMouseLeave={() => setHoveredCard(false)}
          >
            <img
              src={founder.image}
              alt={founder.name}
              className="w-full h-full object-cover transition-all duration-500 ease-out absolute inset-0"
              loading="lazy"
              style={{
                transform: hoveredCard ? 'scale(1.1)' : 'scale(1)',
                filter: hoveredCard ? 'blur(3px) brightness(0.7)' : 'blur(0px) brightness(1)',
                zIndex: 1
              }}
            />
            <div
              className="absolute inset-0 flex items-center justify-center transition-all duration-300 pointer-events-none overflow-hidden"
              style={{
                opacity: hoveredCard ? 1 : 0,
                transform: hoveredCard ? 'translateY(0)' : 'translateY(20px)',
                zIndex: 2
              }}
            >
              <div className="px-6 py-4 w-full max-w-full text-center">
                <h3 className="text-[52px] leading-[84px] font-bold m-0 mb-3 lg:text-[42px] lg:leading-[68px] md:text-[32px] md:leading-[52px] max-md:text-[26px] max-md:leading-[42px]" style={{ color: '#ffffff' }}>
                  {founder.name}
                </h3>
                <p className="text-[20px] leading-[32px] font-semibold tracking-[2px] m-0 lg:text-[16px] lg:leading-[26px] md:text-[13px] md:leading-[21px] max-md:text-[12px] max-md:leading-[19px]" style={{ color: '#ffffff' }}>
                  {founder.role}
                </p>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default MeetOurTeamPage;