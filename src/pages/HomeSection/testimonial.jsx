import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const CustomerTestimonials = () => {
  const [activeTestimonial, setActiveTestimonial] = useState(0);
  const [hoveredAvatar, setHoveredAvatar] = useState(null);
  const [hoveredNav, setHoveredNav] = useState(null);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  const testimonials = [
    {
      id: 0,
      name: 'Sarah Newman',
      company: 'ENVATO MARKET',
      text: 'This creative agency stands out with their exceptional talent and expertise. Their ability to think outside the box and bring unique ideas to life is truly impressive. With meticulous attention to detail, they consistently deliver visually stunning and impactful work.',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah&backgroundColor=b6e3f4'
    },
    {
      id: 1,
      name: 'Emma Wilson',
      company: 'CREATIVE STUDIO',
      text: 'Working with this team has been an absolute pleasure. Their professionalism and creativity exceeded all expectations. They bring fresh perspectives to every project.',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Emma&backgroundColor=c0aede'
    },
    {
      id: 2,
      name: 'Michael Chen',
      company: 'TECH INNOVATIONS',
      text: 'Outstanding service and remarkable attention to detail. The team delivered beyond what we imagined and transformed our vision into reality.',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Michael&backgroundColor=d1d4f9'
    },
    {
      id: 3,
      name: 'Lisa Anderson',
      company: 'DESIGN HOUSE',
      text: 'Exceptional creativity and flawless execution. Their innovative approach and dedication to excellence make them stand out in the industry.',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Lisa&backgroundColor=ffd5dc'
    },
    {
      id: 4,
      name: 'David Martinez',
      company: 'BRAND STUDIO',
      text: 'The quality of work is simply outstanding. They understand client needs perfectly and deliver results that surpass expectations every single time.',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=David&backgroundColor=ffdfbf'
    },
    {
      id: 5,
      name: 'Sophie Taylor',
      company: 'DIGITAL AGENCY',
      text: 'Incredible team with amazing talent. Their creative solutions and professional approach make them the best choice for any project.',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sophie&backgroundColor=c0f0dd'
    },
    {
      id: 6,
      name: 'James Wilson',
      company: 'STARTUP CO',
      text: 'Truly impressive work ethic and creativity. They brought our ideas to life in ways we never thought possible. Highly recommended!',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=James&backgroundColor=ffeaa7'
    }
  ];

  // Auto-rotate testimonials every 4 seconds
  useEffect(() => {
    if (!isAutoPlaying) return;

    const interval = setInterval(() => {
      setActiveTestimonial((prev) => (prev === testimonials.length - 1 ? 0 : prev + 1));
    }, 4000);

    return () => clearInterval(interval);
  }, [isAutoPlaying, testimonials.length]);

  const handlePrevious = () => {
    setIsAutoPlaying(false);
    setActiveTestimonial((prev) => (prev === 0 ? testimonials.length - 1 : prev - 1));
    setTimeout(() => setIsAutoPlaying(true), 10000);
  };

  const handleNext = () => {
    setIsAutoPlaying(false);
    setActiveTestimonial((prev) => (prev === testimonials.length - 1 ? 0 : prev + 1));
    setTimeout(() => setIsAutoPlaying(true), 10000);
  };

  const handleAvatarClick = (index) => {
    setIsAutoPlaying(false);
    setActiveTestimonial(index);
    setTimeout(() => setIsAutoPlaying(true), 10000);
  };

  return (
    <div className="min-h-screen bg-[#F5F5F5] relative overflow-hidden font-['Outfit','Inter',-apple-system,BlinkMacSystemFont,'Segoe_UI',sans-serif]">
      {/* Keyframe Animations */}
      <style>
        {`
          @keyframes fadeInUp {
            from {
              opacity: 0;
              transform: translateY(20px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }

          @keyframes scaleIn {
            from {
              transform: scale(0.8);
              opacity: 0;
            }
            to {
              transform: scale(1);
              opacity: 1;
            }
          }

          .testimonial-content {
            animation: fadeInUp 0.6s ease-out;
          }

          .quote-icon {
            animation: scaleIn 0.5s ease-out;
          }
        `}
      </style>


      {/* Main Content */}
      <main className="py-16 px-20 pb-[140px] flex flex-col items-center justify-center lg:py-12 lg:px-10 lg:pb-[120px] md:py-10 md:px-5 md:pb-24 max-md:py-8 max-md:px-[15px] max-md:pb-[70px]">

        {/* Top Section - Description and Title Centered */}
        <div className="w-full flex flex-col items-center justify-center gap-[60px] text-center mb-24 lg:mb-20 md:mb-16 max-md:mb-12">
          {/* Description Text */}
          <p className="text-center mt-[40px] text-[16px] font-right text-[#888888] leading-[20px] max-w-[450px] mb-24 lg:max-w-[400px] lg:text-[12px] lg:leading-[18px] lg:mb-20 md:max-w-full md:text-[12px] md:leading-5 md:mb-16 max-md:text-[11px] max-md:leading-[18px] max-md:mb-12">
            Customer reviews are a valuable source<br />
            of information for both businesses and consumers.
          </p>

          {/* Title */}
          <h1 className="text-[64px] text-black text-center leading-[76px] tracking-[-1.5px] animate-[fadeInUp_0.8s_ease-out] lg:text-[52px] lg:leading-[62px] md:text-[40px] md:leading-[48px] max-md:text-[32px] max-md:leading-[38px]">
            <span className="font-bold">Customer</span> <span className="font-light">Voices:</span>
            <br />
            <span className="font-bold">Hear What</span> <span className="font-light">They Say!</span>
          </h1>
        </div>

        {/* Avatar Carousel */}
        <div className="flex items-end justify-between gap-4 mt-[100px] mb-[50px] relative h-[160px] lg:gap-3 lg:mt-20 lg:mb-12 lg:h-[140px] md:gap-2.5 md:mt-16 md:mb-10 md:h-[120px] max-md:gap-3 max-md:mt-12 max-md:mb-8 max-md:h-[100px] max-md:px-[15px] max-md:pb-3 max-md:-ml-[15px] max-md:flex-nowrap max-md:overflow-x-auto max-md:overflow-y-hidden max-md:justify-start max-md:w-screen max-md:scroll-smooth max-md:scrollbar-hide">
          {testimonials.map((testimonial, index) => {
            const isActive = index === activeTestimonial;

            // Smaller sizes for mobile only
            let size = isActive ? '100px' : '80px';
            if (typeof window !== 'undefined' && window.innerWidth < 768) {
              size = isActive ? '70px' : '60px';
            }

            const borderWidth = isActive ? '3px' : '0px';

            // Wave pattern: alternating top and bottom positions for all screen sizes
            let marginBottom = '0px';
            if (index === 0 || index === 2 || index === 4 || index === 6) {
              marginBottom = '0px'; // Bottom row
            } else if (index === 1 || index === 3 || index === 5) {
              // Different spacing for mobile vs desktop
              if (typeof window !== 'undefined' && window.innerWidth < 768) {
                marginBottom = '30px'; // Smaller offset for mobile
              } else {
                marginBottom = '50px'; // Larger offset for desktop/tablet
              }
            }

            return (
              <div
                key={testimonial.id}
                onMouseEnter={() => setHoveredAvatar(index)}
                onMouseLeave={() => setHoveredAvatar(null)}
                onClick={() => handleAvatarClick(index)}
                className={`rounded-full overflow-hidden cursor-pointer transition-all duration-[400ms] ease-[cubic-bezier(0.4,0,0.2,1)] relative flex-shrink-0 box-border ${
                  hoveredAvatar === index && !isActive ? 'scale-105' : 'scale-100'
                }`}
                style={{
                  width: size,
                  height: size,
                  border: isActive ? `${borderWidth} solid #ff9500` : 'none',
                  marginBottom: marginBottom,
                  transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)'
                }}
              >
                <img
                  src={testimonial.avatar}
                  alt={testimonial.name}
                  crossOrigin="anonymous"
                  className="w-full h-full object-cover"
                />
              </div>
            );
          })}
        </div>

        {/* Scroll Hint for Mobile */}
        <div className="hidden text-center text-xs text-[#999] mb-[35px] font-light max-md:block max-md:after:content-['_←_Swipe_to_scroll_→'] max-md:text-[11px] max-md:mb-[30px]"></div>

        {/* Quote Icon */}
        <div
          key={`quote-${activeTestimonial}`}
          className="quote-icon text-[40px] m-5 text-[#ff9500] mb-12 font-bold lg:text-[36px] lg:mb-10 md:text-[32px] md:mb-8 max-md:text-[28px] max-md:mb-6"
        >
          ,,
        </div>

        {/* Testimonial Content with Side Navigation */}
        <div className="w-full max-w-[1000px] relative flex items-center justify-content-between gap-8 lg:max-w-[850px] lg:gap-6 md:flex-col md:max-w-full md:gap-8">
          {/* Previous Button - Left Side */}
          <button
            onClick={handlePrevious}
            onMouseEnter={() => setHoveredNav('prev')}
            onMouseLeave={() => setHoveredNav(null)}
            className={`w-[46px] h-[46px] rounded-full border border-[#DDDDDD] flex items-center justify-center transition-all duration-300 cursor-pointer flex-shrink-0 lg:w-[42px] lg:h-[42px] md:w-[38px] md:h-[38px] max-md:w-[36px] max-md:h-[36px] md:order-2 ${
              hoveredNav === 'prev'
                ? 'bg-black border-black shadow-[0_2px_8px_rgba(0,0,0,0.15)]'
                : 'bg-white'
            }`}
          >
            <ChevronLeft
              size={20}
              className={`transition-colors duration-300 ${
                hoveredNav === 'prev' ? 'text-white' : 'text-black'
              }`}
            />
          </button>

          {/* Testimonial Content */}
          <div
            key={`content-${activeTestimonial}`}
            className="testimonial-content max-w-[800px] text-center lg:max-w-[700px] md:max-w-full md:px-4 md:order-1"
          >
            {/* Name */}
            <h3 className="text-[18px] leading-[26px] font-semibold text-black mb-3 tracking-normal lg:text-[17px] lg:leading-[24px] md:text-[16px] md:leading-[22px] max-md:text-[15px] max-md:leading-[20px]">
              {testimonials[activeTestimonial].name}
            </h3>

            {/* Company */}
            <p className="text-[11px] font-medium leading-6 text-[#AAAAAA] tracking-[2.5px] mb-12 uppercase lg:text-[10px] lg:mb-10 md:text-[10px] md:mb-8 max-md:text-[9px] max-md:mb-7">
              {testimonials[activeTestimonial].company}
            </p>

            {/* Testimonial Text */}
            <p className="text-[17px] leading-[32px] font-normal text-[#888888] tracking-normal lg:text-[16px] lg:leading-[30px] md:text-[15px] md:leading-[28px] max-md:text-[14px] max-md:leading-[24px]">
              {testimonials[activeTestimonial].text}
            </p>
          </div>

          {/* Next Button - Right Side */}
          <button
            onClick={handleNext}
            onMouseEnter={() => setHoveredNav('next')}
            onMouseLeave={() => setHoveredNav(null)}
            className={`w-[46px] h-[46px] rounded-full border border-[#DDDDDD] flex items-center justify-center transition-all duration-300 cursor-pointer flex-shrink-0 lg:w-[42px] lg:h-[42px] md:w-[38px] md:h-[38px] max-md:w-[36px] max-md:h-[36px] md:order-3 ${
              hoveredNav === 'next'
                ? 'bg-black border-black shadow-[0_2px_8px_rgba(0,0,0,0.15)]'
                : 'bg-white'
            }`}
          >
            <ChevronRight
              size={20}
              className={`transition-colors duration-300 ${
                hoveredNav === 'next' ? 'text-white' : 'text-black'
              }`}
            />
          </button>
        </div>
      </main>

      {/* Custom scrollbar styles for mobile avatar carousel */}
      <style>
        {`
          @media (max-width: 767px) {
            .md\\:overflow-x-auto::-webkit-scrollbar {
              height: 4px;
            }

            .md\\:overflow-x-auto::-webkit-scrollbar-track {
              background: rgba(0, 0, 0, 0.05);
              border-radius: 10px;
            }

            .md\\:overflow-x-auto::-webkit-scrollbar-thumb {
              background: rgba(255, 140, 0, 0.5);
              border-radius: 10px;
            }

            .md\\:overflow-x-auto::-webkit-scrollbar-thumb:hover {
              background: rgba(255, 140, 0, 0.8);
            }
          }
        `}
      </style>
    </div>
  );
};

export default CustomerTestimonials;