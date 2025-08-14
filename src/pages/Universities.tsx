import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { MapPin, ExternalLink, Star } from 'lucide-react';

import Header from '../components/common/Header';
import Footer from '../components/common/Footer';
import { useContent } from '@/contexts/ContentContext';

const Universities: React.FC = () => {
  const { universities, fetchUniversities } = useContent();

  useEffect(() => {
    fetchUniversities({limit: 20, force: false});
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-edu-primary to-edu-primary-dark text-white section-padding">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Our Partner Universities
          </h1>
          <p className="text-xl opacity-90 max-w-3xl mx-auto">
            Discover top-ranked universities offering UGC-approved online degree programs
          </p>
        </div>
      </section>

      {/* Universities Grid */}
      <section className="section-padding">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {universities.map((university) => (
              <div key={university.id} className="card-edu group hover:shadow-xl transition-all duration-300">
                {/* University Header */}
                <div className="flex items-start space-x-4 mb-6">
                  <img
                    src={university.logo}
                    alt={university.name}
                    className="w-20 h-20 rounded-xl object-cover flex-shrink-0"
                  />
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-edu-primary transition-colors">
                      {university.name}
                    </h3>
                    <div className="flex items-center space-x-2 mb-2">
                      <span className="badge-accreditation">NAAC {university.rating}</span>
                      <div className="flex items-center">
                        <Star className="w-4 h-4 text-yellow-400 fill-current" />
                        <span className="text-sm text-gray-600 ml-1">4.5</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* University Details */}
                <p className="text-gray-600 mb-4 line-clamp-3">
                  {university.description}
                </p>

                <div className="space-y-3 mb-6">
                  <div className="flex items-center text-sm text-gray-600">
                    <MapPin className="w-4 h-4 mr-2 flex-shrink-0" />
                    <span>{university.location}</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex space-x-3">
                  <Link
                    to={`/programs?university=${university.id}`}
                    className="flex-1 btn-primary text-center"
                  >
                    View Programs
                  </Link>
                  {university.website && (
                    <a
                      href={university.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-3 border-2 border-gray-200 rounded-lg hover:border-edu-primary hover:text-edu-primary transition-colors"
                    >
                      <ExternalLink className="w-5 h-5" />
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Load More Section */}
          {universities.length > 0 && universities.length >= 6 && (
              <div className="text-center mt-12">
                <p className="text-gray-600 mb-4">Showing 6 of + universities</p>
                <button className="btn-secondary">
                  Load More Universities
                </button>
              </div>
          )}
        </div>
      </section>

      <Footer/>
    </div>
  );
};

export default Universities;
