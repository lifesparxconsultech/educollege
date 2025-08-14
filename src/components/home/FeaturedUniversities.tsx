
import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, MapPin, Star } from 'lucide-react';
import { useContent } from '@/contexts/ContentContext';

const FeaturedUniversities: React.FC = () => {
  const { universities, fetchUniversities } = useContent();

  useEffect(() => {
    fetchUniversities({limit: 20, force: false});
  }, []);
  return (
    <section className="section-padding bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Featured Universities
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Partner with India's top-ranked universities offering UGC-approved online degree programs
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {universities.slice(0, 3).map((university) => (
            <div
              key={university.id}
              className="group bg-white border border-gray-200 rounded-2xl p-5 shadow-sm hover:shadow-lg transition-all duration-300"
            >
              <div className="flex items-center space-x-4 mb-4">
                <img
                  src={university.logo}
                  alt={university.name}
                  className="w-16 h-16 rounded-xl object-cover border border-gray-100"
                />
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 group-hover:text-edu-primary transition-colors">
                    {university.name}
                  </h3>
                  <div className="flex items-center space-x-2 mt-1">
                    <span className="text-xs px-2 py-0.5 rounded-full bg-edu-primary/10 text-edu-primary font-medium">
                      NAAC Grade: {university.naacGrade}
                    </span>
                    <div className="flex items-center text-sm text-yellow-500">
                      <Star className="w-4 h-4 fill-current" />
                      <span className="ml-1 text-gray-700">{university.rating}</span>
                    </div>
                    <div className="flex items-center text-sm text-gray-500">
                      <MapPin className="w-4 h-4" />
                      <span className="ml-1">
                        {university.location}
                        </span>
                    </div>
                  </div>
                </div>
              </div>
              <div>
              
                <p className="text-gray-600 mb-6 text-sm line-clamp-3">
                  {university.description}
                </p>
              </div>

              <div className="flex items-center justify-between">
                <Link
                  to={`/universities`}
                  className="text-sm font-medium text-edu-primary hover:text-edu-primary-dark inline-flex items-center transition-transform group-hover:translate-x-1"
                >
                  View University
                  <ArrowRight className="ml-1 h-4 w-4" />
                </Link>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center mt-12">
          <Link to="/universities" className="btn-primary inline-flex items-center">
            View All Universities
            <ArrowRight className="ml-2 h-5 w-5" />
          </Link>
        </div>
      </div>
    </section>

  );
};

export default FeaturedUniversities;
