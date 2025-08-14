
import React, { useEffect } from 'react';
import { ExternalLink, TrendingUp, Users, Building } from 'lucide-react';
import { useContent } from '@/contexts/ContentContext';
import { Link } from 'react-router-dom';


const TopRecruitersSection: React.FC = () => {
  const { topRecruiters, fetchTopRecruiters } = useContent();

  useEffect(() => {
    fetchTopRecruiters({limit: 20, force: false});
  }, []);

  const activeRecruiters = topRecruiters
    .filter(recruiter => recruiter.is_active)
    .sort((a, b) => a.display_order - b.display_order);

  return (
    <section className="section-padding bg-gray-50">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Top Recruiters
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Our graduates are hired by leading companies across industries.
            Join the thousands who have successfully placed in top organizations.
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          <div className="text-center">
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <Building className="h-8 w-8 text-edu-primary mx-auto mb-3" />
              <div className="text-2xl font-bold text-gray-900">500+</div>
              <div className="text-gray-600">Partner Companies</div>
            </div>
          </div>
          <div className="text-center">
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <Users className="h-8 w-8 text-edu-primary mx-auto mb-3" />
              <div className="text-2xl font-bold text-gray-900">15,000+</div>
              <div className="text-gray-600">Students Placed</div>
            </div>
          </div>
          <div className="text-center">
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <TrendingUp className="h-8 w-8 text-edu-primary mx-auto mb-3" />
              <div className="text-2xl font-bold text-gray-900">₹45 LPA</div>
              <div className="text-gray-600">Highest Package</div>
            </div>
          </div>
        </div>

        {/* Recruiters Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:grid-cols-4">
          {activeRecruiters.slice(0, 4).map((recruiter) => (
            <div
              key={recruiter.id}
              className="p-6 rounded-2xl border border-gray-200 bg-white shadow-sm hover:shadow-lg transition"
            >
              {/* Header with Logo and Company Info */}
              <div className="flex items-center space-x-4 mb-4">
                <div className="p-3 rounded-xl bg-gray-100 w-16 h-16 flex items-center justify-center overflow-hidden">
                  <img
                    src={recruiter.logo}
                    alt={recruiter.company_name}
                    className="max-h-full max-w-full object-contain grayscale group-hover:grayscale-0 transition-transform duration-300 group-hover:scale-105"
                  />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    {recruiter.company_name}
                  </h3>
                  <p className="text-sm text-gray-500">{recruiter.industry}</p>
                </div>
              </div>

              {/* Description and Stats */}
              <p className="text-sm text-gray-600 mb-3 line-clamp-3">
                {recruiter.description || 'Leading recruiter in tech and innovation domains.'}
              </p>

              <div className="flex flex-wrap items-center gap-4 text-sm text-gray-700">
                {recruiter.average_package && (
                  <span className="text-green-600 font-medium">
                    Package: {recruiter.average_package}
                  </span>
                )}
                {recruiter.hiring_count && (
                  <span>positions: {recruiter.hiring_count}</span>
                )}
              </div>
              <div className="mt-4">
                <Link
                  to={recruiter.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-edu-primary hover:text-edu-primary-dark inline-flex items-center text-sm font-medium transition-transform group-hover:translate-x-1"
                >
                  Visit Website
                  <ExternalLink className="ml-1 h-4 w-4" />
                </Link>
              </div>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="text-center mt-12">
          <div className="bg-white rounded-lg p-8 shadow-sm">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              Ready to Join These Companies?
            </h3>
            <p className="text-gray-600 mb-6">
              Start your journey with our industry-relevant programs and dedicated placement support.
            </p>
            <button className="btn-primary">
              Explore Programs
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default TopRecruitersSection;
