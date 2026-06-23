import React from 'react'

function Hero() {
  return (
    <section className="relative w-full h-screen flex items-center justify-center px-6 py-16 overflow-hidden">
      {/* Dark overlay for better text readability */}
      <div className="absolute inset-0 bg-black/30 -z-10" aria-hidden="true" />

      <div className="max-w-3xl text-center">
        {/* Tagline */}
        <p className="mt-6 text-white font-medium" style={{ fontSize: 'var(--fs-primary)', lineHeight: '1.4' }}>
          AI-driven innovation, seamless digital experiences & cloud transformation.
        </p>
        <p className="mt-6 text-white max-w-xl mx-auto" style={{ fontSize: 'var(--fs-secondary)', lineHeight: '1.6' }}>
          We bridge research & real-world impact through precision engineering and a client-first mindset.
        </p>

        {/* Call-to-action buttons */}
        <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
          <a
            href="#contact"
            className="px-8 py-3 inline-block rounded-full text-white font-semibold shadow-md transition transform-gpu hover:shadow-lg hover:scale-[1.02] focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#1E83F3]"
            style={{ background: 'linear-gradient(135deg, #1E83F3 0%, #B464F3 100%)' }}
          >
            Start Your Transformation
          </a>
          <a
            href="#work"
            className="px-8 py-3 inline-block rounded-full border-2 border-white text-white font-semibold transition hover:bg-white hover:text-black focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-white"
          >
            View Our Work
          </a>
        </div>
      </div>
    </section>
  )
}

export default Hero
