import React, { useState, useEffect } from 'react';
import { Menu, ArrowUp, Pause, Play } from 'lucide-react';

const StudioAboutPage = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="studio-about-container font-['Poppins',sans-serif] m-0 p-0 bg-white min-h-screen relative">
      {/* Google Fonts */}
      <style>
        {`
          @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap');

          html, body {
            margin: 0 !important;
            padding: 0 !important;
            background-color: #ffffff !important;
            overflow-x: hidden;
          }

          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }

          .studio-about-container {
            background-color: #ffffff !important;
          }

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

          @keyframes fadeIn {
            from {
              opacity: 0;
            }
            to {
              opacity: 1;
            }
          }

          .fade-in-up {
            animation: fadeInUp 0.8s ease-out forwards;
          }

          .fade-in {
            animation: fadeIn 1s ease-out forwards;
          }

          .delay-1 {
            animation-delay: 0.2s;
            opacity: 0;
          }

          .delay-2 {
            animation-delay: 0.4s;
            opacity: 0;
          }

          .delay-3 {
            animation-delay: 0.6s;
            opacity: 0;
          }

          .delay-4 {
            animation-delay: 0.8s;
            opacity: 0;
          }
        `}
      </style>

      {/* Main Content */}
      <main className="pt-[120px] px-[140px] pb-[60px] flex gap-10 max-w-[1400px] mx-auto items-center flex-nowrap">
        {/* Left Content */}
        <div className="flex-[1_1_500px] min-w-[400px]">
          <h1 className="text-[68px] font-thin leading-[1.2] mb-[60px] text-black fade-in-up">
            <br />
            <span className="font-medium">Discover</span> <br />
            <span className="font-medium">Our</span>Company
          </h1>

          <p className="text-base leading-6 w-[500px] text-[#666] mb-5 font-light fade-in-up delay-1">
            At our design studio, we are a collective of talented individuals ignited by our unwavering passion for transforming ideas into reality. With a harmonious blend of diverse backgrounds and a vast array of skill sets, we join forces to create compelling solutions for our esteemed clients.
          </p>
          <p className="text-base leading-6 w-[500px] text-[#666] my-[30px] font-light fade-in-up delay-2">
            Collaboration is at the heart of what we do. Our team thrives on the synergy that arises when unique perspectives converge, fostering an environment of boundless creativity. By harnessing our collective expertise, we produce extraordinary results that consistently surpass expectations.
          </p>

          <div className="flex items-center gap-[15px] py-[15px] fade-in-up delay-3">
            <img
              src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop"
              alt="Profile"
              className="w-[90px] h-[90px] rounded-full object-cover"
            />

            <div>
              <div className="text-lg leading-[27px] font-medium text-black mb-[3px]">
                Passionately Creating <span className="font-light text-[#666]">Design Wonders:</span>
              </div>
              <div className="text-lg leading-[27px] font-thin text-black">
                Unleashing <span className="font-light text-[#666]">Boundless Creativity</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Image */}
        <div className="flex-1 min-w-[400px] order-2 flex items-stretch fade-in delay-4">
          <img
            src="/images/1_2.jpg"
            className="studio-img w-full h-[620px] rounded-[30px] object-cover shadow-[0_20px_60px_rgba(0,0,0,0.15)] transition-transform duration-500 cursor-pointer"
            alt="Studio workspace"
          />
        </div>
      </main>

      {/* Side Navigation */}



      {/* Back to Top Button */}




      {/* Responsive Styles */}
      <style>
        {`
          /* Tablet View (768px - 1024px) */
          @media (max-width: 1024px) {
            header {
              padding: 20px 40px !important;
            }

            main {
              padding: 100px 40px 40px !important;
              flex-direction: column !important;
              gap: 40px !important;
            }

            main > div:first-child {
              flex: 1 1 auto !important;
              min-width: 100% !important;
            }

            main > div:last-child {
              flex: 1 1 auto !important;
              min-width: 100% !important;
            }

            h1 {
              font-size: 56px !important;
              margin-bottom: 40px !important;
            }

            p {
              width: 100% !important;
              max-width: 600px !important;
            }

            .studio-img {
              height: 500px !important;
            }
          }

          /* Mobile View (up to 767px) */
          @media (max-width: 767px) {
            header {
              padding: 20px 20px !important;
            }

            main {
              padding: 80px 20px 40px !important;
              flex-direction: column !important;
              gap: 30px !important;
            }

            main > div:first-child {
              flex: 1 1 auto !important;
              min-width: 100% !important;
            }

            main > div:last-child {
              flex: 1 1 auto !important;
              min-width: 100% !important;
            }

            h1 {
              font-size: 42px !important;
              margin-bottom: 30px !important;
            }

            p {
              width: 100% !important;
              font-size: 15px !important;
              line-height: 22px !important;
              margin: 20px 0 !important;
            }

            .studio-img {
              height: 400px !important;
            }

            .side-nav {
              display: none !important;
            }
          }

          /* Small Mobile View (up to 480px) */
          @media (max-width: 480px) {
            main {
              padding: 80px 15px 30px !important;
            }

            h1 {
              font-size: 36px !important;
              margin-bottom: 25px !important;
            }

            p {
              font-size: 14px !important;
              line-height: 21px !important;
            }

            .studio-img {
              height: 300px !important;
            }

            img[alt="Profile"] {
              width: 70px !important;
              height: 70px !important;
            }

            img[alt="Profile"] + div {
              font-size: 16px !important;
            }

            img[alt="Profile"] + div > div {
              font-size: 16px !important;
              line-height: 24px !important;
            }
          }
        `}
      </style>
    </div>
  );
};

export default StudioAboutPage;