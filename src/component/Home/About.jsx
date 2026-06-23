import React from 'react'

function About() {
  return (
    <section id="about" className="relative w-full min-h-screen px-6 py-24 md:py-32 lg:py-40">
      <div className="relative max-w-7xl mx-auto w-full">
        
        {/* Hero Statement - Apple Style */}
        <div className="text-center mb-20 md:mb-32 animate-fade-in backdrop-blur-xl bg-white/10 rounded-3xl p-8 md:p-12 border border-white/10 shadow-xl">
          <h2 className="text-5xl md:text-6xl lg:text-7xl font-semibold mb-6 text-white leading-tight tracking-tight">
            Innovation meets
            <br />
            <span className="bg-clip-text bg-gradient-to-r from-[var(--color-overflow-blue)] to-[var(--color-null-purple)] text-transparent">
              execution.
            </span>
          </h2>
          <p className="text-xl md:text-2xl text-white/70 max-w-3xl mx-auto font-light leading-relaxed mt-8">
            NullOverflow transforms businesses through AI-driven innovation, cutting-edge development, and strategic digital solutions.
          </p>
        </div>

        {/* Bento Grid Layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 mb-20 animate-slide-up">
          
          {/* Large Feature Card - Spans 2 columns */}
          <div className="lg:col-span-2 backdrop-blur-xl bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-3xl p-8 md:p-12 border border-white/10 hover:border-white/20 transition-all duration-500 group">
            <div className="flex flex-col justify-between h-full">
              <div>
                <div className="inline-block px-4 py-1.5 bg-white/10 rounded-full text-sm text-white/90 mb-6">
                  Our Approach
                </div>
                <h3 className="text-3xl md:text-4xl font-semibold text-white mb-6 leading-tight">
                  Bridging research and reality
                </h3>
                <p className="text-lg md:text-xl text-white/70 leading-relaxed">
                  We operate at the intersection of AI research, enterprise-grade software engineering, and digital growth strategy—turning theoretical breakthroughs into practical solutions.
                </p>
              </div>
              <div className="mt-8 flex items-center text-white/60 group-hover:text-white/90 transition-colors">
                <span className="text-sm font-medium">Learn more</span>
                <svg className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </div>
            </div>
          </div>

          {/* Vertical Card */}
          <div className="backdrop-blur-xl bg-white/5 rounded-3xl p-8 border border-white/10 hover:border-white/20 transition-all duration-500 flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[var(--color-overflow-blue)] to-[var(--color-null-purple)] flex items-center justify-center mb-6">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-2xl font-semibold text-white mb-4">
                AI-Driven
              </h3>
              <p className="text-base text-white/70 leading-relaxed">
                Advanced machine learning, computer vision, and NLP solutions that drive measurable results.
              </p>
            </div>
          </div>

          {/* Small Card 1 */}
          <div className="backdrop-blur-xl bg-white/5 rounded-3xl p-8 border border-white/10 hover:border-white/20 transition-all duration-500">
            <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center mb-6">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-white mb-3">
              Innovation First
            </h3>
            <p className="text-sm text-white/70 leading-relaxed">
              Cutting-edge research meets practical implementation.
            </p>
          </div>

          {/* Small Card 2 */}
          <div className="backdrop-blur-xl bg-white/5 rounded-3xl p-8 border border-white/10 hover:border-white/20 transition-all duration-500">
            <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center mb-6">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-white mb-3">
              Cloud Native
            </h3>
            <p className="text-sm text-white/70 leading-relaxed">
              Scalable infrastructure on AWS, Azure, and GCP.
            </p>
          </div>

          {/* Small Card 3 */}
          <div className="backdrop-blur-xl bg-white/5 rounded-3xl p-8 border border-white/10 hover:border-white/20 transition-all duration-500">
            <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center mb-6">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-white mb-3">
              Data-Driven
            </h3>
            <p className="text-sm text-white/70 leading-relaxed">
              Analytics and insights that fuel strategic growth.
            </p>
          </div>

        </div>

        {/* Bottom Statement - Minimal & Clean */}
        <div className="text-center max-w-4xl mx-auto animate-fade-in">
          <p className="text-2xl md:text-3xl lg:text-4xl font-light text-white/90 leading-relaxed">
            We help businesses evolve in a digital-first world by combining{' '}
            <span className="font-medium text-white">cutting-edge research</span>
            {' '}with{' '}
            <span className="font-medium text-white">industry-grade implementation</span>.
          </p>
          
        </div>

      </div>
    </section>
  )
}

export default About