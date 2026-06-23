import React from 'react'

function Achievements() {
  const achievements = [
    {
      title: 'IEEE eScience 2025',
      description: 'Paper acceptance for disease clustering research with Rush Hospital.',
      color: 'bg-blue-500',
      icon: (
        <svg className="w-6 h-6 text-white/70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l6.16-3.422A12.083 12.083 0 0118 18.083V21" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14L5.84 10.578A12.083 12.083 0 006 18.083V21" />
        </svg>
      ),
    },
    {
      title: 'AI CardVault',
      description: 'Successfully deployed at Asia Labex 2025, delivering proven value in real-world trade shows.',
      color: 'bg-purple-500',
      icon: (
        <svg className="w-6 h-6 text-white/70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 4h10a2 2 0 012 2v12a2 2 0 01-2 2H7a2 2 0 01-2-2V6a2 2 0 012-2z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01" />
        </svg>
      ),
    },
    {
      title: 'Client Growth Stories',
      description: 'Multiple clients reported measurable improvements in traffic, engagement, and conversions.',
      color: 'bg-green-500',
      icon: (
        <svg className="w-6 h-6 text-white/70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
      ),
    },
  ]

  return (
    <section id="achievements" className="relative w-full px-6 py-24 md:py-32 lg:py-40">
      <div className="relative max-w-5xl mx-auto w-full">
        {/* Header */}
        <div className="text-center mb-16 animate-fade-in">
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-semibold text-white mb-6">
            Achievements & Recognition
          </h2>
        </div>

        {/* Achievements list */}
        <div className="space-y-6">
          {achievements.map(({ title, description, icon, color }, idx) => (
            <div
              key={idx}
              className="flex items-start backdrop-blur-xl bg-white/10 rounded-3xl border border-white/20 shadow-2xl p-6 md:p-8"
            >
              <div className={`w-12 h-12 flex items-center justify-center rounded-2xl ${color} bg-opacity-30 mr-5 flex-shrink-0`}>
                {icon}
              </div>
              <div>
                <h3 className="text-xl md:text-2xl font-semibold text-white mb-2 leading-tight">
                  {title}
                </h3>
                <p className="text-sm md:text-base text-white/70 leading-relaxed">
                  {description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default Achievements