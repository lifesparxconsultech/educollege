import React, { useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight, Star, Quote } from 'lucide-react';
import { useContent } from '@/contexts/ContentContext';

const TestimonialsSection: React.FC = () => {
  const { testimonials, fetchTestimonials, loading } = useContent();

  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    fetchTestimonials({ limit: 20, force: false });
  }, []);

  const nextTestimonial = () => {
    if (testimonials.length > 0) {
      setCurrentIndex((prev) => (prev + 1) % testimonials.length);
    }
  };

  const prevTestimonial = () => {
    if (testimonials.length > 0) {
      setCurrentIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length);
    }
  };

  // Reset currentIndex if testimonials change
  useEffect(() => {
    if (currentIndex >= testimonials.length && testimonials.length > 0) {
      setCurrentIndex(0);
    }
  }, [testimonials.length, currentIndex]);

  if (loading.testimonials) {
    return (
        <section className="section-padding bg-white">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                What Our Students Say
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Hear from professionals who have transformed their careers through our programs
              </p>
            </div>
            <div className="flex justify-center items-center py-20">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-edu-primary mx-auto mb-4"></div>
                <p className="text-gray-600">Loading testimonials...</p>
              </div>
            </div>
          </div>
        </section>
    );
  }

  if (!testimonials || testimonials.length === 0) {
    return (
        <section className="section-padding bg-white">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                What Our Students Say
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Hear from professionals who have transformed their careers through our programs
              </p>
            </div>
            <div className="text-center py-20">
              <Quote className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">No testimonials available at the moment.</p>
            </div>
          </div>
        </section>
    );
  }

  return (
      <section className="section-padding bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              What Our Students Say
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Hear from professionals who have transformed their careers through our programs
            </p>
          </div>

          {/* Desktop Grid View */}
          <div className="hidden md:grid md:grid-cols-3 gap-8">
            {testimonials.slice(0, 3).map((testimonial) => (
                <div key={testimonial?.id} className="card-edu">
                  <div className="flex items-center space-x-1 mb-4">
                    {[...Array(5)].map((_, i) => (
                        <Star
                            key={i}
                            className={`w-5 h-5 ${
                                i < (testimonial?.rating || 0)
                                    ? 'text-yellow-400 fill-current'
                                    : 'text-gray-300'
                            }`}
                        />
                    ))}
                  </div>

                  <Quote className="w-8 h-8 text-edu-primary mb-4" />

                  <p className="text-gray-600 mb-6 italic">
                    "{testimonial?.content || 'No content available'}"
                  </p>

                  <div className="flex items-center space-x-3">
                    <img
                        src={testimonial?.image || '/api/placeholder/48/48'}
                        alt={testimonial?.name || 'Anonymous'}
                        className="w-12 h-12 rounded-full object-cover bg-blue-400"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = '/api/placeholder/48/48';
                        }}
                    />
                    <div>
                      <h4 className="font-semibold text-gray-900">{testimonial?.name || 'Anonymous'}</h4>
                      <p className="text-sm text-gray-600">{testimonial?.role || 'Student'}</p>
                      <p className="text-sm text-gray-500">{testimonial?.company || testimonial?.university || 'Unknown'}</p>
                    </div>
                  </div>

                  {testimonial?.program && (
                      <div className="mt-4 pt-4 border-t border-gray-100">
                  <span className="text-sm text-edu-primary font-medium">
                    {testimonial.program}
                  </span>
                      </div>
                  )}
                </div>
            ))}
          </div>

          {/* Mobile Carousel View */}
          <div className="md:hidden">
            {testimonials[currentIndex] && (
                <div className="card-edu">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-1">
                      {[...Array(5)].map((_, i) => (
                          <Star
                              key={i}
                              className={`w-5 h-5 ${
                                  i < (testimonials[currentIndex]?.rating || 0)
                                      ? 'text-yellow-400 fill-current'
                                      : 'text-gray-300'
                              }`}
                          />
                      ))}
                    </div>

                    <div className="flex space-x-2">
                      <button
                          onClick={prevTestimonial}
                          className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
                          disabled={testimonials.length <= 1}
                      >
                        <ChevronLeft className="w-5 h-5" />
                      </button>
                      <button
                          onClick={nextTestimonial}
                          className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
                          disabled={testimonials.length <= 1}
                      >
                        <ChevronRight className="w-5 h-5" />
                      </button>
                    </div>
                  </div>

                  <Quote className="w-8 h-8 text-edu-primary mb-4" />

                  <p className="text-gray-600 mb-6 italic">
                    "{testimonials[currentIndex]?.content || 'No content available'}"
                  </p>

                  <div className="flex items-center space-x-3">
                    <img
                        src={testimonials[currentIndex]?.image || '/api/placeholder/48/48'}
                        alt={testimonials[currentIndex]?.name || 'Anonymous'}
                        className="w-12 h-12 rounded-full object-cover"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = '/api/placeholder/48/48';
                        }}
                    />
                    <div>
                      <h4 className="font-semibold text-gray-900">{testimonials[currentIndex]?.name || 'Anonymous'}</h4>
                      <p className="text-sm text-gray-600">{testimonials[currentIndex]?.role || 'Student'}</p>
                      <p className="text-sm text-gray-500">{testimonials[currentIndex]?.company || testimonials[currentIndex]?.university || 'Unknown'}</p>
                    </div>
                  </div>

                  {testimonials[currentIndex]?.program && (
                      <div className="mt-4 pt-4 border-t border-gray-100">
                  <span className="text-sm text-edu-primary font-medium">
                    {testimonials[currentIndex].program}
                  </span>
                      </div>
                  )}
                </div>
            )}

            {/* Dots indicator */}
            {testimonials.length > 1 && (
                <div className="flex justify-center space-x-2 mt-6">
                  {testimonials.map((_, index) => (
                      <button
                          key={index}
                          onClick={() => setCurrentIndex(index)}
                          className={`w-3 h-3 rounded-full transition-colors ${
                              currentIndex === index ? 'bg-edu-primary' : 'bg-gray-300'
                          }`}
                      />
                  ))}
                </div>
            )}
          </div>
        </div>
      </section>
  );
};

export default TestimonialsSection;