import React, { useState } from 'react';
import { ArrowRight } from 'lucide-react';

const PopularPublications = () => {
  const [hoveredCard, setHoveredCard] = useState(null);
  const [hoveredButton, setHoveredButton] = useState(null);

  const publications = [
    {
      id: 1,
      category: 'TECHNOLOGY',
      date: 'SEP 15 2025',
      title: 'Novel Perspective on Ensemble Clustering for Persistent Cluster Patterns',
      description: 'Clustering is the process of finding natural groups within a data set such that patterns within a group are more similar than patterns belonging to different groups.',
      image: 'images/ensemble_clustering.png',
      link: 'https://ieeexplore.ieee.org/document/11181504'
    },
    {
      id: 2,
      category: 'TECHNOLOGY',
      date: 'MAY 24 2023',
      title: 'How to Become a Graphic Designer in 10 Simple Steps',
      description: 'Lorem ipsum dolor sit amet, consectetur adipisicing elit. Eus sequi commodi dignissimos optio, beatae, eos necessitatibus nisi. Nam cupidita...',
      image: 'images/1_1.jpg'
    }
  ];

  return (
    <div className="min-h-screen bg-[#F8F8F8] relative font-['Outfit','Inter',-apple-system,BlinkMacSystemFont,'Segoe_UI',sans-serif]">
      {/* Mobile Specific Styles */}
      <style>
        {`
          @media (max-width: 767px) {
            .publications-grid {
              display: block !important;
              flex-direction: unset !important;
              margin-left: 0 !important;
            }

            .publication-article {
              width: 100% !important;
              margin-bottom: 32px !important;
              display: block !important;
            }

            .publication-article:last-child {
              margin-bottom: 0 !important;
            }

            .publication-image {
              width: 100% !important;
              max-width: 100% !important;
              height: 200px !important;
            }

            .publication-content {
              width: 100% !important;
              max-width: 100% !important;
            }
          }

          @media (max-width: 767px) {
            .mobile-header {
              flex-direction: column !important;
              align-items: flex-start !important;
            }
          }
        `}
      </style>
      {/* Main Content */}
      <main className="pt-20 px-24 pb-[120px] max-w-[1200px] mx-auto lg:pt-16 lg:px-10 lg:pb-24 md:pt-12 md:px-6 md:pb-20 max-md:pt-24 max-md:px-4 max-md:pb-16">
        {/* Section Header */}
        <div className="flex pt-5 justify-between items-center mb-[60px] ml-[100px] lg:ml-0 lg:mb-12 md:flex-col md:items-start md:gap-6 md:mb-10 max-md:mb-8 max-md:gap-5">
          <h1 className="text-[56px] font-medium text-black tracking-[-1px] leading-[1.2] lg:text-[48px] md:text-[36px] md:tracking-[-0.5px] max-md:text-[28px] max-md:leading-[1.3]">
            Popular Publications:
          </h1>

          <button
            onMouseEnter={() => setHoveredButton('viewAll')}
            onMouseLeave={() => setHoveredButton(null)}
            className={`flex items-center gap-3 border-none px-7 py-4 rounded-[50px] text-sm font-semibold tracking-[1.5px] cursor-pointer transition-all duration-300 ease-in-out lg:px-6 lg:py-3.5 lg:text-[13px] md:px-5 md:py-3 md:text-xs md:self-start max-md:px-5 max-md:py-2.5 max-md:text-[10px] max-md:tracking-[1.2px] max-md:gap-2 ${hoveredButton === 'viewAll'
              ? 'bg-black text-white shadow-[0_4px_12px_rgba(0,0,0,0.15)]'
              : 'bg-[#f5f5f5] text-black'
              }`}
          >
            VIEW ALL
            <ArrowRight
              size={18}
              className={`transition-transform duration-300 ease-in-out lg:w-[16px] lg:h-[16px] md:w-[14px] md:h-[14px] max-md:w-[12px] max-md:h-[12px] ${hoveredButton === 'viewAll' ? 'translate-x-1' : 'translate-x-0'
                }`}
            />
          </button>
        </div>

        {/* Publications Grid */}
        <div className="publications-grid flex gap-[60px] ml-[100px] lg:ml-0 lg:gap-12 md:flex-col md:gap-8 max-md:gap-6">
          {publications.map((pub) => (
            <article
              key={pub.id}
              onMouseEnter={() => setHoveredCard(pub.id)}
              onMouseLeave={() => setHoveredCard(null)}
              className={`publication-article bg-transparent overflow-visible transition-all duration-[400ms] ease-[cubic-bezier(0.4,0,0.2,1)] cursor-pointer flex flex-col items-start md:w-full max-md:w-full ${hoveredCard === pub.id ? '-translate-y-2 max-md:-translate-y-1' : 'translate-y-0'
                }`}
            >
              {/* Image */}
              <div className="w-full max-w-[555px] h-[360px] overflow-hidden rounded-[20px] bg-[#f5f5f5] relative lg:max-w-full lg:h-[320px] md:h-[260px] md:rounded-[18px] max-md:h-[220px] max-md:rounded-[16px]">
                <img
                  src={pub.image}
                  alt={pub.title}
                  className={`w-full h-full object-cover object-top transition-transform duration-[600ms] ease-[cubic-bezier(0.4,0,0.2,1)] ${hoveredCard === pub.id ? 'scale-[1.08]' : 'scale-100'
                    }`}
                />
              </div>

              {/* Content */}
              <div className="pt-9 w-full max-w-[555px] lg:max-w-full lg:pt-7 md:pt-6 max-md:pt-5">
                {/* Category and Date */}
                <div className="flex items-center gap-4 mb-[18px] md:mb-4 md:gap-3 max-md:mb-3 max-md:gap-2.5">
                  <span className="text-[11px] font-bold text-[#FF8C00] tracking-[1.5px] md:text-[10px] max-md:text-[9px] max-md:tracking-[1.2px]">
                    {pub.category}
                  </span>
                  <span className="text-[11px] font-semibold text-[#AAAAAA] tracking-wider md:text-[10px] max-md:text-[9px] max-md:tracking-[1px]">
                    {pub.date}
                  </span>
                </div>

                {/* Title */}
                <h2 className="text-[28px] font-medium text-black leading-[1.35] mb-4 tracking-[-0.5px] transition-colors duration-300 lg:text-[24px] md:text-[22px] md:leading-[1.4] md:mb-3.5 max-md:text-[19px] max-md:leading-[1.45] max-md:mb-3 max-md:tracking-[-0.3px]">
                  {pub.title}
                </h2>

                {/* Description */}
                <p className="text-[15px] font-light text-[#888888] leading-[1.65] mb-[26px] lg:text-[14px] md:text-[13px] md:leading-[1.6] md:mb-5 max-md:text-[12px] max-md:leading-[1.6] max-md:mb-4">
                  {pub.description}
                </p>

                {/* Read More Button */}
                <a
                  href={pub.link || '#'}
                  target="_blank"
                  rel="noopener noreferrer"
                  onMouseEnter={() => setHoveredButton(`read-${pub.id}`)}
                  onMouseLeave={() => setHoveredButton(null)}
                  className="inline-flex items-center gap-3.5 bg-transparent border-none p-0 text-[13px] font-bold tracking-[1.5px] text-black cursor-pointer transition-all duration-300 lg:text-[12px] lg:gap-3 md:text-[11px] md:gap-2.5 max-md:text-[10px] max-md:gap-2 max-md:tracking-[1.2px]"
                >
                  READ MORE
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 lg:w-9 lg:h-9 md:w-8 md:h-8 max-md:w-[30px] max-md:h-[30px] ${hoveredButton === `read-${pub.id}`
                        ? 'bg-black translate-x-1.5 max-md:translate-x-1'
                        : 'bg-[#F0F0F0] translate-x-0'
                      }`}
                  >
                    <ArrowRight
                      size={18}
                      className={`transition-colors duration-300 lg:w-[16px] lg:h-[16px] md:w-[14px] md:h-[14px] max-md:w-[12px] max-md:h-[12px] ${hoveredButton === `read-${pub.id}` ? 'text-white' : 'text-black'
                        }`}
                    />
                  </div>
                </a>
              </div>
            </article>
          ))}
        </div>
      </main>

      {/* Homepage Link - Hidden on mobile */}
      <div className="fixed left-10 top-1/2 -translate-y-1/2 [writing-mode:vertical-rl] text-[11px] font-semibold tracking-[2px] text-black md:hidden"></div>
    </div>
  );
};

export default PopularPublications;
