import React, { useState } from 'react'

function Projects() {
  const [selectedProject, setSelectedProject] = useState(null)

  const projects = [
    {
      title: 'Indian Food Solutions',
      subtitle: 'Website & Digital Marketing',
      problem: 'Limited online visibility and lack of professional digital presence.',
      solution: 'Revamped website with modern UI/UX, integrated SEO, and targeted social media campaigns.',
      impact: '60% increase in web traffic and enhanced lead generation within 3 months.',
      category: 'Web & Marketing',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
        </svg>
      ),
      gradient: 'from-orange-500/20 to-amber-500/20',
    },
    {
      title: 'AI CardVault',
      subtitle: 'Smart Lead Management App',
      problem: 'Manual and inefficient lead capturing at trade shows.',
      solution: 'Developed an AI-powered app for scanning business cards, organizing leads, adding notes, and integrating with CRMs (Zoho, Salesforce, HubSpot).',
      impact: 'Streamlined lead capture and improved conversion tracking; successfully deployed at Asia Labex 2025.',
      category: 'AI & Mobile',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2" />
        </svg>
      ),
      gradient: 'from-blue-500/20 to-cyan-500/20',
    },
    {
      title: 'Road Sign Detection',
      subtitle: 'Computer Vision Research',
      problem: 'Detecting and recognizing multilingual traffic signs under real-world conditions.',
      solution: 'Designed a two-stage pipeline using YOLOv8 for detection and ResNet18 for classification, integrated with OCR for multilingual text recognition.',
      impact: 'Achieved high-precision detection on GTSRB + TT100K datasets, contributing to advancements in intelligent transportation systems.',
      category: 'AI Research',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
        </svg>
      ),
      gradient: 'from-purple-500/20 to-pink-500/20',
    },
    {
      title: 'Syndemic Disease Clustering',
      subtitle: 'Healthcare AI with Rush Hospital',
      problem: 'Identifying disease correlations in patient populations to improve healthcare delivery.',
      solution: 'Applied ensemble clustering and machine learning models (Random Forest, XGBoost, SVM) on multimorbidity datasets.',
      impact: 'Research accepted at IEEE eScience 2025; provided insights into depression and comorbidity clusters in healthcare.',
      category: 'Healthcare AI',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
        </svg>
      ),
      gradient: 'from-emerald-500/20 to-teal-500/20',
    },
  ]

  const openModal = (project) => {
    setSelectedProject(project)
  }

  const closeModal = () => {
    setSelectedProject(null)
  }

  return (
    <section id="projects" className="relative w-full px-6 py-24 md:py-32 lg:py-40">
      <div className="relative max-w-7xl mx-auto w-full">
        
        {/* Section Header */}
        <div className="text-center mb-20 animate-fade-in">
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-semibold bg-clip-text text-white mb-6">
            Featured Projects
          </h2>
          <p className="text-lg md:text-xl text-white/70 max-w-2xl mx-auto font-light leading-relaxed">
            Real-world solutions that deliver measurable impact across industries.
          </p>
        </div>

        {/* Projects Grid - Apple-style Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
          {projects.map((project, idx) => (
            <div
              key={idx}
              onClick={() => openModal(project)}
              className="group relative overflow-hidden rounded-3xl backdrop-blur-xl bg-white/5 border border-white/10 hover:border-white/20 shadow-2xl transition-all duration-500 hover:shadow-glow-brand cursor-pointer"
            >

              <div className="relative z-10 p-8 md:p-10">
                {/* Icon & Category */}
                <div className="flex items-center justify-between mb-6">
                  <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center text-white/90">
                    {project.icon}
                  </div>
                  <span className="text-xs font-medium text-white/60 uppercase tracking-wider">
                    {project.category}
                  </span>
                </div>

                {/* Title */}
                <h3 className="text-2xl md:text-3xl font-semibold text-white mb-2 leading-tight">
                  {project.title}
                </h3>
                <p className="text-base text-white/70 mb-6">
                  {project.subtitle}
                </p>

                {/* Impact Preview */}
                <p className="text-sm text-white/60 leading-relaxed line-clamp-2">
                  {project.impact}
                </p>

                {/* View More Arrow */}
                <div className="mt-6 flex items-center text-white/60 group-hover:text-white/90 transition-colors">
                  <span className="text-sm font-medium">View Details</span>
                  <svg className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </div>
              </div>
            </div>
          ))}
        </div>

      </div>

      {/* Modal - macOS Style */}
      {selectedProject && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in"
          onClick={closeModal}
        >
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/60 backdrop-blur-md" />

          {/* Modal Content */}
          <div
            className="relative max-w-3xl w-full backdrop-blur-2xl bg-white/10 border border-white/20 rounded-3xl shadow-2xl overflow-hidden animate-scale-in"
            onClick={(e) => e.stopPropagation()}
          >
            {/* macOS-style Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
              <div className="flex items-center space-x-2">
                <button
                  onClick={closeModal}
                  className="w-3 h-3 rounded-full bg-red-500 hover:bg-red-600 transition-colors"
                  aria-label="Close"
                />
                <button className="w-3 h-3 rounded-full bg-yellow-500 hover:bg-yellow-600 transition-colors" aria-label="Minimize" />
                <button className="w-3 h-3 rounded-full bg-green-500 hover:bg-green-600 transition-colors" aria-label="Maximize" />
              </div>
              <div className="text-sm font-medium text-white/70">
                {selectedProject.category}
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-8 md:p-10 max-h-[70vh] overflow-y-auto">
              {/* Title */}
              <div className="flex items-start mb-8">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[var(--color-overflow-blue)] to-[var(--color-null-purple)] flex items-center justify-center text-white mr-4 flex-shrink-0">
                  {selectedProject.icon}
                </div>
                <div>
                  <h3 className="text-3xl md:text-4xl font-semibold text-white mb-2 leading-tight">
                    {selectedProject.title}
                  </h3>
                  <p className="text-lg text-white/70">
                    {selectedProject.subtitle}
                  </p>
                </div>
              </div>

              {/* Problem */}
              <div className="mb-6">
                <h4 className="text-xl font-semibold text-white mb-3 flex items-center">
                  <span className="w-2 h-2 rounded-full bg-red-500 mr-3" />
                  Problem
                </h4>
                <p className="text-base text-white/80 leading-relaxed pl-5">
                  {selectedProject.problem}
                </p>
              </div>

              {/* Solution */}
              <div className="mb-6">
                <h4 className="text-xl font-semibold text-white mb-3 flex items-center">
                  <span className="w-2 h-2 rounded-full bg-blue-500 mr-3" />
                  Solution
                </h4>
                <p className="text-base text-white/80 leading-relaxed pl-5">
                  {selectedProject.solution}
                </p>
              </div>

              {/* Impact */}
              <div className="mb-6">
                <h4 className="text-xl font-semibold text-white mb-3 flex items-center">
                  <span className="w-2 h-2 rounded-full bg-green-500 mr-3" />
                  Impact
                </h4>
                <p className="text-base text-white/80 leading-relaxed pl-5">
                  {selectedProject.impact}
                </p>
              </div>

              {/* Close Button */}
              <div className="mt-8 flex justify-end">
                <button
                  onClick={closeModal}
                  className="px-6 py-3 rounded-xl backdrop-blur-xl bg-white/10 border border-white/20 text-white font-medium hover:bg-white/20 transition-all duration-300"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  )
}

export default Projects
