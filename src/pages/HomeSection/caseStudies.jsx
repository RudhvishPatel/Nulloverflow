import React from 'react';
import { Link } from 'react-router-dom';

const CaseStudies = () => {
  const projects = [
    {
      id: 1,
      title: 'Indian Food Solutions',
      subtitle: 'Website & Digital Marketing',
      problem: 'Limited online visibility and lack of professional digital presence.',
      solution: 'Revamped website with modern UI/UX, integrated SEO, and targeted social media campaigns.',
      impact: '60% increase in web traffic and enhanced lead generation within 3 months.',
      category: 'Web Development',
      color: '#FF9800'
    },
    {
      id: 2,
      title: 'AI CardVault',
      subtitle: 'Smart Lead Management App',
      problem: 'Manual and inefficient lead capturing at trade shows.',
      solution: 'Developed an AI-powered app for scanning business cards, organizing leads, adding notes, and integrating with CRMs (Zoho, Salesforce, HubSpot).',
      impact: 'Streamlined lead capture and improved conversion tracking; successfully deployed at Asia Labex 2025.',
      category: 'AI & Mobile',
      color: '#2196F3'
    },
    {
      id: 3,
      title: 'Road Sign Detection',
      subtitle: 'Computer Vision Research',
      problem: 'Detecting and recognizing multilingual traffic signs under real-world conditions.',
      solution: 'Designed a two-stage pipeline using YOLOv8 for detection and ResNet18 for classification, integrated with OCR for multilingual text recognition.',
      impact: 'Achieved high-precision detection on GTSRB + TT100K datasets, contributing to advancements in intelligent transportation systems.',
      category: 'Computer Vision',
      color: '#4CAF50'
    },
    {
      id: 4,
      title: 'Syndemic Disease Clustering',
      subtitle: 'Healthcare AI with Rush Hospital',
      problem: 'Identifying disease correlations in patient populations to improve healthcare delivery.',
      solution: 'Applied ensemble clustering and machine learning models (Random Forest, XGBoost, SVM) on multimorbidity datasets.',
      impact: 'Research accepted at IEEE eScience 2025; provided insights into depression and comorbidity clusters in healthcare.',
      category: 'Healthcare AI',
      color: '#9C27B0'
    }
  ];

  return (
    <section className="mil-case-studies-section">
      <div className="container">
        <div className="mil-section-header">
          <div className="row align-items-end">
            <div className="col-lg-6">
              <span className="mil-suptitle mil-suptitle-dark mil-mb-30">Featured Work</span>
              <h2 className="mil-mb-30">Case Studies & Projects</h2>
            </div>
            <div className="col-lg-6">
              <p className="mil-text-m mil-soft">
                Explore our portfolio of innovative solutions across web development, AI, computer vision, and healthcare technology.
              </p>
            </div>
          </div>
        </div>

        <div className="mil-cases-grid">
          {projects.map((project, index) => (
            <div
              key={project.id}
              className="mil-case-card"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="mil-case-card-inner">
                <div className="mil-case-header">
                  <span className="mil-case-category" style={{ color: project.color }}>
                    {project.category}
                  </span>
                  <h3 className="mil-case-title">{project.title}</h3>
                  <p className="mil-case-subtitle">{project.subtitle}</p>
                </div>

                <div className="mil-case-content">
                  <div className="mil-case-section">
                    <h4 className="mil-case-label">Problem</h4>
                    <p className="mil-case-text">{project.problem}</p>
                  </div>

                  <div className="mil-case-section">
                    <h4 className="mil-case-label">Solution</h4>
                    <p className="mil-case-text">{project.solution}</p>
                  </div>

                  <div className="mil-case-section mil-impact">
                    <h4 className="mil-case-label">Impact</h4>
                    <p className="mil-case-text mil-impact-text">{project.impact}</p>
                  </div>
                </div>

                {/* <div className="mil-case-footer">
                                    <Link to="/projects" className="mil-case-link">
                                        <span>View Details</span>
                                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="20" height="20">
                                            <path d="M14 5.3417969 C 13.744125 5.3417969 13.487969 5.4412187 13.292969 5.6367188 L 13.207031 5.7226562 C 12.816031 6.1136563 12.816031 6.7467188 13.207031 7.1367188 L 17.070312 11 L 4 11 C 3.448 11 3 11.448 3 12 C 3 12.552 3.448 13 4 13 L 17.070312 13 L 13.207031 16.863281 C 12.816031 17.254281 12.816031 17.887344 13.207031 18.277344 L 13.292969 18.363281 C 13.683969 18.754281 14.317031 18.754281 14.707031 18.363281 L 20.363281 12.707031 C 20.754281 12.316031 20.754281 11.682969 20.363281 11.292969 L 14.707031 5.6367188 C 14.511531 5.4412187 14.255875 5.3417969 14 5.3417969 z" fill="currentColor" />
                                        </svg>
                                    </Link>
                                </div> */}
              </div>
            </div>
          ))}
        </div>

        <div className="mil-center mil-mt-60">
          <Link to="/projects" className="mil-button mil-arrow-place">
            <span>View All Projects</span>
          </Link>
        </div>
      </div>

      <style>{`
        .mil-case-studies-section {
          background-color: #ffffff;
          padding: 120px 0;
          position: relative;
        }

        .mil-section-header {
          margin-bottom: 80px;
        }

        .mil-section-header h2 {
          font-size: 48px;
          font-weight: 400;
          line-height: 1.2;
          color: #1a1a1a;
        }

        .mil-text-m {
          font-size: 16px;
          line-height: 1.8;
          color: #666;
        }

        .mil-cases-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 40px;
          margin-bottom: 60px;
        }

        @media (max-width: 992px) {
          .mil-cases-grid {
            grid-template-columns: 1fr;
            gap: 30px;
          }
        }

        .mil-case-card {
          background: #ffffff;
          border: 1px solid rgba(0, 0, 0, 0.08);
          border-radius: 8px;
          overflow: hidden;
          transition: all 0.4s cubic-bezier(0, 0, 0.3642, 1);
          opacity: 0;
          transform: translateY(30px);
          animation: fadeInUp 0.6s ease forwards;
        }

        @keyframes fadeInUp {
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .mil-case-card:hover {
          transform: translateY(-8px);
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.12);
          border-color: rgba(255, 152, 0, 0.3);
        }

        .mil-case-card-inner {
          padding: 40px;
          display: flex;
          flex-direction: column;
          height: 100%;
        }

        .mil-case-header {
          margin-bottom: 30px;
        }

        .mil-case-category {
          display: inline-block;
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 2px;
          text-transform: uppercase;
          margin-bottom: 15px;
          padding: 6px 12px;
          background-color: rgba(255, 152, 0, 0.1);
          border-radius: 4px;
        }

        .mil-case-title {
          font-size: 28px;
          font-weight: 500;
          line-height: 1.3;
          color: #1a1a1a;
          margin-bottom: 8px;
        }

        .mil-case-subtitle {
          font-size: 14px;
          color: #666;
          font-weight: 400;
        }

        .mil-case-content {
          flex: 1;
          margin-bottom: 30px;
        }

        .mil-case-section {
          margin-bottom: 24px;
        }

        .mil-case-section:last-child {
          margin-bottom: 0;
        }

        .mil-case-label {
          font-size: 12px;
          font-weight: 700;
          letter-spacing: 2px;
          text-transform: uppercase;
          color: #1a1a1a;
          margin-bottom: 10px;
        }

        .mil-case-text {
          font-size: 14px;
          line-height: 1.7;
          color: #666;
        }

        .mil-impact {
          padding-top: 20px;
          border-top: 1px solid rgba(0, 0, 0, 0.08);
        }

        .mil-impact-text {
          color: #1a1a1a;
          font-weight: 500;
        }

        .mil-case-footer {
          padding-top: 20px;
          border-top: 1px solid rgba(0, 0, 0, 0.08);
        }

        .mil-case-link {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          font-size: 12px;
          font-weight: 700;
          letter-spacing: 2px;
          text-transform: uppercase;
          color: #1a1a1a;
          text-decoration: none;
          transition: all 0.3s ease;
        }

        .mil-case-link:hover {
          color: #FF9800;
          gap: 15px;
        }

        .mil-case-link svg {
          transition: transform 0.3s ease;
        }

        .mil-case-link:hover svg {
          transform: translateX(5px);
        }

        .mil-center {
          text-align: center;
        }

        .mil-mt-60 {
          margin-top: 60px;
        }

        .mil-button {
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          border: none;
          letter-spacing: 2px;
          font-size: 12px;
          background-color: rgb(255, 152, 0);
          color: rgb(0, 0, 0);
          border-radius: 70px;
          padding: 0 50px;
          height: 70px;
          text-transform: uppercase;
          font-weight: 500;
          text-decoration: none;
          transition: 0.4s cubic-bezier(0, 0, 0.3642, 1);
        }

        .mil-button:hover {
          transform: scale(1.015);
          filter: brightness(110%);
        }

        @media (max-width: 768px) {
          .mil-case-studies-section {
            padding: 80px 0;
          }

          .mil-section-header {
            margin-bottom: 50px;
          }

          .mil-section-header h2 {
            font-size: 32px;
          }

          .mil-case-card-inner {
            padding: 30px;
          }

          .mil-case-title {
            font-size: 24px;
          }

          .mil-button {
            height: 60px;
            padding: 0 40px;
          }
        }
      `}</style>
    </section>
  );
};

export default CaseStudies;
