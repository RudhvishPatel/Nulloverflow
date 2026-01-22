import React from 'react'

// Stunning Services section with immersive glassmorphism cards
function Services() {
  const services = [
    {
      title: 'Web & App Development',
      points: [
        'Dynamic websites with Next.js, React, Node.js',
        'Cross-platform mobile apps (iOS, Android, Flutter)',
        'Robust backend systems & secure APIs',
      ],
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 16v-2a4 4 0 014-4h5m0 0V8a2 2 0 00-2-2H7a2 2 0 00-2 2v8a2 2 0 002 2h3" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 16l4-4m0 0l-4-4m4 4H9" />
        </svg>
      ),
      gradient: 'from-fuchsia-500/20 via-indigo-500/10 to-cyan-500/20',
    },
    {
      title: 'AI & Machine Learning',
      points: [
        'Computer vision (object detection, OCR)',
        'NLP chatbots & sentiment analysis',
        'Predictive analytics & automation',
      ],
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      ),
      gradient: 'from-blue-600/20 via-purple-600/10 to-pink-600/20',
    },
    {
      title: 'Cloud & DevOps',
      points: [
        'Deployments on AWS, Azure, GCP',
        'Cloud migration & cost optimisation',
        'CI/CD, Docker & Kubernetes',
      ],
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" />
        </svg>
      ),
      gradient: 'from-sky-500/20 via-emerald-500/10 to-teal-500/20',
    },
    {
      title: 'Digital Marketing & SEO',
      points: [
        'SEO for targeted industries',
        'Multi-platform digital campaigns',
        'AI-powered lead gen & conversion',
      ],
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8c1.654 0 3-.672 3-1.5S13.654 5 12 5s-3 .672-3 1.5S10.346 8 12 8zM9 12.5c0 .828 1.346 1.5 3 1.5s3-.672 3-1.5" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 17c1.654 0 3-.672 3-1.5S13.654 14 12 14s-3 .672-3 1.5S10.346 17 12 17z" />
        </svg>
      ),
      gradient: 'from-amber-500/20 via-rose-500/10 to-red-500/20',
    },
    {
      title: 'Consulting & Research',
      points: [
        'AI-driven transformation advisory',
        'Collaborative research programmes',
        'Workshops on AI, ML & Cloud',
      ],
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 14l9-5-9-5-9 5 9 5zm0 0v7" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 14l6.16-3.422A12.083 12.083 0 0121 20.5" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 14L5.84 10.578A12.083 12.083 0 003 20.5" />
        </svg>
      ),
      gradient: 'from-lime-500/20 via-cyan-500/10 to-violet-500/20',
    },
  ]

  return (
    <section id="services" className="relative w-full px-6 py-24 md:py-32 lg:py-40">
      <div className="absolute inset-0 pointer-events-none opacity-20">
        {/* abstract blurred gradient background */}
        <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-[120vw] h-[120vw] rounded-full bg-[radial-gradient(circle,_rgba(99,102,241,0.6)_0%,_rgba(139,92,246,0)_70%)] blur-3xl"></div>
      </div>

      <div className="relative max-w-7xl mx-auto w-full">
        {/* Section Header */}
        <div className="text-center mb-20 animate-fade-in">
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-semibold bg-clip-text text-white text-transparent mb-6">
            Our Services
          </h2>
          <p className="text-lg md:text-xl text-white/70 max-w-2xl mx-auto font-light leading-relaxed">
            From concept to execution, we deliver end-to-end solutions that drive growth and innovation.
          </p>
        </div>

        {/* Services Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {services.map(({ title, points, icon, gradient }, idx) => (
            <div
              key={idx}
              className={`group relative overflow-hidden rounded-3xl p-8 md:p-10 backdrop-blur-xl bg-white/5 border border-white/10 hover:border-white/20 shadow-2xl transition-all duration-500 hover:shadow-glow-brand flex flex-col justify-between`}
            >
              {/* Glow overlay */}
              <div
                className={`absolute inset-0 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-br ${gradient}`}
              />

              {/* Content */}
              <div className="relative z-10 flex items-start mb-6">
                <div className="w-14 h-14 flex items-center justify-center rounded-2xl bg-white/10 text-white/90 mr-4">
                  {icon}
                </div>
                <h3 className="text-2xl md:text-3xl font-semibold text-white leading-tight">
                  {title}
                </h3>
              </div>

              <ul className="relative z-10 space-y-2 pl-2">
                {points.map((p, i) => (
                  <li key={i} className="text-sm md:text-base text-white/70 leading-relaxed flex items-start">
                    {/* <span className="w-1.5 h-1.5 mt-2 mr-3 rounded-full bg-gradient-to-r from-[var(--color-overflow-blue)] to-[var(--color-null-purple)] flex-shrink-0" /> */}
                    {p}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default Services
