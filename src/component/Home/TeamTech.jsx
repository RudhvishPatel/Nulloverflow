import React from 'react'

function TeamTech() {
  const certifications = [
    'AWS Cloud Practitioner',
    'AWS AI Practitioner',
    'CompTIA Security+',
  ]

  const tools = [
    {
      category: 'Programming',
      items: ['Python', 'R', 'Java', 'JavaScript', 'SQL'],
      iconColor: 'bg-amber-400',
    },
    {
      category: 'AI / ML',
      items: ['TensorFlow', 'PyTorch', 'Hugging Face', 'OpenCV'],
      iconColor: 'bg-fuchsia-500',
    },
    {
      category: 'Cloud & DevOps',
      items: ['AWS', 'Docker', 'Kubernetes'],
      iconColor: 'bg-sky-500',
    },
    {
      category: 'Web Tech',
      items: ['Next.js', 'React', 'Node.js', 'Tailwind CSS'],
      iconColor: 'bg-lime-400',
    },
    {
      category: 'Testing & QA',
      items: ['Selenium', 'JMeter', 'Postman'],
      iconColor: 'bg-rose-500',
    },
    {
      category: 'Design & Marketing',
      items: ['Figma', 'Canva', 'Google Analytics', 'SEO tools'],
      iconColor: 'bg-indigo-400',
    },
  ]

  return (
    <section id="team-tech" className="relative w-full px-6 py-24 md:py-32 lg:py-40">
      <div className="relative max-w-7xl mx-auto w-full space-y-24">
        {/* Team Expertise Section */}
        <div>
          <div className="text-center mb-16 animate-fade-in">
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-semibold text-white mb-6">
              Team Expertise
            </h2>
            <p className="text-lg md:text-xl text-white/60 max-w-3xl mx-auto font-light leading-relaxed">
              A multidisciplinary team driving AI innovation, cloud excellence, and digital growth.
            </p>
          </div>

          {/* Expertise Card */}
          <div className="mx-auto max-w-4xl backdrop-blur-xl bg-white/5 border border-white/10 rounded-3xl shadow-2xl p-10 md:p-14">
            <ul className="space-y-6">
              <li className="flex items-start">
                <span className="w-3 h-3 mt-2 mr-4 rounded-full bg-gradient-to-r from-[var(--color-overflow-blue)] to-[var(--color-null-purple)] flex-shrink-0" />
                <p className="text-white/90 leading-relaxed">
                  <strong className="text-white">Leadership & Development:</strong> Expertise in AI/ML, cloud computing, and full-stack development.
                </p>
              </li>
              <li className="flex items-start">
                <span className="w-3 h-3 mt-2 mr-4 rounded-full bg-gradient-to-r from-[var(--color-overflow-blue)] to-[var(--color-null-purple)] flex-shrink-0" />
                <p className="text-white/90 leading-relaxed">
                  <strong className="text-white">Research Experience:</strong> Published work in AI and computational healthcare.
                </p>
              </li>
              <li className="flex items-start flex-wrap gap-y-3">
                <span className="w-3 h-3 mt-2 mr-4 rounded-full bg-gradient-to-r from-[var(--color-overflow-blue)] to-[var(--color-null-purple)] flex-shrink-0" />
                <div>
                  <strong className="text-white">Certifications:</strong>
                  <div className="flex flex-wrap gap-3 mt-2">
                    {certifications.map((cert) => (
                      <span key={cert} className="px-3 py-1.5 rounded-full bg-white/10 border border-white/10 text-sm text-white/80 backdrop-blur-md shadow">
                        {cert}
                      </span>
                    ))}
                  </div>
                </div>
              </li>
              <li className="flex items-start">
                <span className="w-3 h-3 mt-2 mr-4 rounded-full bg-gradient-to-r from-[var(--color-overflow-blue)] to-[var(--color-null-purple)] flex-shrink-0" />
                <p className="text-white/90 leading-relaxed">
                  <strong className="text-white">Multidisciplinary Skills:</strong> Strong foundation across data science, software engineering, DevOps, and digital marketing.
                </p>
              </li>
            </ul>
          </div>
        </div>

        {/* Tools & Technologies Section */}
        <div>
          <div className="text-center mb-16 animate-fade-in">
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-semibold text-white mb-6">
              Tools & Technologies
            </h2>
          </div>

          {/* Tools Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {tools.map(({ category, items, iconColor }) => (
              <div key={category} className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-3xl shadow-2xl p-8 md:p-10" style={{
                background: 'rgba(255, 255, 255, 0.05)',
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
              }}>
                <div className="flex items-center mb-6">
                  <div className={`w-4 h-4 rounded-full ${iconColor} mr-3`} />
                  <h3 className="text-2xl font-semibold text-white leading-tight">
                    {category}
                  </h3>
                </div>
                <ul className="space-y-2 pl-1">
                  {items.map((item) => (
                    <li key={item} className="text-sm md:text-base text-white/70 leading-relaxed">
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

export default TeamTech
