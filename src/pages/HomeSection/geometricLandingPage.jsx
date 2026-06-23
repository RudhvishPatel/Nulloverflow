import React, { useState, useEffect } from 'react';

export default function GeometricLandingPage() {
  const [scrollY, setScrollY] = useState(0);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    const handleMouseMove = (e) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener('scroll', handleScroll);
    window.addEventListener('mousemove', handleMouseMove);

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  const buttonStyle = {
    backgroundColor: '#FF9500',
    color: '#000',
    border: 'none',
    padding: '18px 40px',
    borderRadius: '50px',
    fontSize: '14px',
    fontWeight: '600',
    letterSpacing: '2px',
    cursor: 'pointer',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '15px',
    transition: 'all 0.3s ease',
    boxShadow: '0 10px 30px rgba(255, 149, 0, 0.3)',
  };

  const arrowCircleStyle = {
    width: '32px',
    height: '32px',
    borderRadius: '50%',
    backgroundColor: '#000',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'transform 0.3s ease',
  };

  const viewWorksButtonStyle = {
    backgroundColor: 'transparent',
    color: '#fff',
    border: '2px solid rgba(255, 255, 255, 0.2)',
    padding: '16px 35px',
    borderRadius: '50px',
    fontSize: '14px',
    fontWeight: '600',
    letterSpacing: '2px',
    cursor: 'pointer',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '15px',
    transition: 'all 0.3s ease',
    marginLeft: '20px',
  };

  return (
    <div style={{
      margin: 0,
      padding: 0,
      fontFamily: "'Inter', 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
      backgroundColor: '#000',
      color: '#fff',
      minHeight: '100vh',
      overflow: 'hidden',
      position: 'relative',
    }}>
      {/* Animated Geometric Background */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        overflow: 'hidden',
        zIndex: 0,
      }}>
        {/* Top Left Geometric Shape */}
        <svg style={{
          position: 'absolute',
          top: '-5%',
          left: '-5%',
          width: '500px',
          height: '500px',
          opacity: 0.15,
          transform: `translate(${mousePosition.x * 0.02}px, ${mousePosition.y * 0.02}px)`,
          transition: 'transform 0.3s ease-out',
        }} viewBox="0 0 200 200">
          <polygon points="100,10 150,50 150,100 100,140 50,100 50,50" 
            fill="none" 
            stroke="rgba(255, 149, 0, 0.3)" 
            strokeWidth="0.5"/>
          <polygon points="100,30 130,55 130,95 100,120 70,95 70,55" 
            fill="none" 
            stroke="rgba(255, 149, 0, 0.2)" 
            strokeWidth="0.5"/>
          <polygon points="150,50 180,70 180,110 150,130 120,110 120,70" 
            fill="none" 
            stroke="rgba(255, 149, 0, 0.2)" 
            strokeWidth="0.5"/>
        </svg>

        {/* Right Side Geometric Shape */}
        <svg style={{
          position: 'absolute',
          top: '10%',
          right: '-10%',
          width: '700px',
          height: '700px',
          opacity: 0.12,
          transform: `translate(${-mousePosition.x * 0.015}px, ${mousePosition.y * 0.015}px)`,
          transition: 'transform 0.3s ease-out',
        }} viewBox="0 0 200 200">
          <polygon points="100,20 140,50 140,100 100,130 60,100 60,50" 
            fill="none" 
            stroke="rgba(255, 255, 255, 0.15)" 
            strokeWidth="0.5"/>
          <polygon points="140,50 170,70 170,110 140,130 110,110 110,70" 
            fill="none" 
            stroke="rgba(255, 255, 255, 0.1)" 
            strokeWidth="0.5"/>
          <polygon points="60,50 90,70 90,110 60,130 30,110 30,70" 
            fill="none" 
            stroke="rgba(255, 255, 255, 0.1)" 
            strokeWidth="0.5"/>
          <polygon points="100,130 130,150 130,180 100,200 70,180 70,150" 
            fill="none" 
            stroke="rgba(255, 255, 255, 0.08)" 
            strokeWidth="0.5"/>
        </svg>

        {/* Bottom Center Geometric Shape */}
        <svg style={{
          position: 'absolute',
          bottom: '-15%',
          left: '35%',
          width: '600px',
          height: '600px',
          opacity: 0.1,
          transform: `translate(${mousePosition.x * 0.01}px, ${-mousePosition.y * 0.01}px)`,
          transition: 'transform 0.3s ease-out',
        }} viewBox="0 0 200 200">
          <polygon points="100,30 135,55 135,95 100,120 65,95 65,55" 
            fill="none" 
            stroke="rgba(255, 149, 0, 0.25)" 
            strokeWidth="0.5"/>
          <polygon points="135,55 165,75 165,105 135,125 105,105 105,75" 
            fill="none" 
            stroke="rgba(255, 149, 0, 0.2)" 
            strokeWidth="0.5"/>
          <polygon points="65,55 95,75 95,105 65,125 35,105 35,75" 
            fill="none" 
            stroke="rgba(255, 149, 0, 0.2)" 
            strokeWidth="0.5"/>
        </svg>
      </div>

      {/* Main Content */}
      <main style={{
        position: 'relative',
        zIndex: 10,
        padding: '80px 60px',
        maxWidth: '1400px',
        margin: '0 auto',
      }}>
        <div style={{
          maxWidth: '800px',
        }}>
          <h1 style={{
            fontSize: '80px',
            fontWeight: '700',
            lineHeight: '1.1',
            marginBottom: '30px',
            animation: 'fadeInUp 1s ease-out',
          }}>
            <span style={{ fontWeight: '700' }}>Designing</span>{' '}
            <span style={{ fontWeight: '300' }}>a Better</span>
            <br />
            <span style={{ fontWeight: '700' }}>World</span>{' '}
            <span style={{ fontWeight: '300' }}>Today</span>
          </h1>

          <p style={{
            fontSize: '16px',
            lineHeight: '1.8',
            color: 'rgba(255, 255, 255, 0.6)',
            maxWidth: '500px',
            marginBottom: '50px',
            animation: 'fadeInUp 1s ease-out 0.2s backwards',
          }}>
            Welcome to our world of endless imagination and boundless creativity. Together, let's embark on a remarkable journey where dreams become tangible realities.
          </p>

          <div style={{
            display: 'flex',
            alignItems: 'center',
            animation: 'fadeInUp 1s ease-out 0.4s backwards',
          }}>
            <button 
              style={buttonStyle}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-3px)';
                e.currentTarget.style.boxShadow = '0 15px 40px rgba(255, 149, 0, 0.4)';
                const arrow = e.currentTarget.querySelector('.arrow-circle');
                if (arrow) arrow.style.transform = 'translateX(5px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 10px 30px rgba(255, 149, 0, 0.3)';
                const arrow = e.currentTarget.querySelector('.arrow-circle');
                if (arrow) arrow.style.transform = 'translateX(0)';
              }}
            >
              WHAT WE DO
              <div className="arrow-circle" style={arrowCircleStyle}>
                <span style={{ color: '#FF9500', fontSize: '18px', marginTop: '-2px' }}>→</span>
              </div>
            </button>

            <button 
              style={viewWorksButtonStyle}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.5)';
                e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.05)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.2)';
                e.currentTarget.style.backgroundColor = 'transparent';
              }}
            >
              VIEW WORKS
              <span style={{ fontSize: '18px' }}>→</span>
            </button>
          </div>
        </div>

        {/* Scroll Down Indicator (Left Side) */}
        <div style={{
          position: 'fixed',
          left: '60px',
          top: '50%',
          transform: 'translateY(-50%)',
          display: 'flex',
          alignItems: 'center',
          gap: '15px',
          zIndex: 50,
        }}>
          <div style={{
            writingMode: 'vertical-rl',
            textOrientation: 'mixed',
            fontSize: '12px',
            letterSpacing: '3px',
            color: 'rgba(255, 255, 255, 0.5)',
            fontWeight: '600',
          }}>
            HOMEPAGE
          </div>
        </div>

        {/* Circular Badge (Right Side) */}
        <div style={{
          position: 'fixed',
          right: '80px',
          bottom: '80px',
          width: '180px',
          height: '180px',
          zIndex: 50,
          animation: 'rotate 20s linear infinite',
        }}>
          <svg viewBox="0 0 200 200" style={{ width: '100%', height: '100%' }}>
            <defs>
              <path id="circlePath" d="M 100, 100 m -80, 0 a 80,80 0 1,1 160,0 a 80,80 0 1,1 -160,0" />
            </defs>
            <text style={{ fontSize: '13px', letterSpacing: '8px', fill: 'rgba(255, 255, 255, 0.6)', fontWeight: '600' }}>
              <textPath href="#circlePath">
                SCROLL DOWN • SCROLL DOWN •
              </textPath>
            </text>
          </svg>
          <div style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: '70px',
            height: '70px',
            borderRadius: '50%',
            backgroundColor: '#FF9500',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translate(-50%, -50%) scale(1.1)';
            e.currentTarget.style.boxShadow = '0 10px 30px rgba(255, 149, 0, 0.5)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translate(-50%, -50%) scale(1)';
            e.currentTarget.style.boxShadow = 'none';
          }}>
            <span style={{ fontSize: '28px', color: '#000', marginTop: '3px' }}>↓</span>
          </div>
        </div>
      </main>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;600;700&display=swap');
        
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

        @keyframes rotate {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }

        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }

        body {
          margin: 0;
          padding: 0;
        }
      `}</style>
    </div>
  );
}