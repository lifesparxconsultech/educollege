
import React, { useState, useEffect } from 'react';
import { ArrowRight, Play, ChevronLeft, ChevronRight } from 'lucide-react';
import { useContent } from '@/contexts/ContentContext';
import { useNavigate } from 'react-router-dom';


const HeroSection: React.FC = () => {
  const navigate = useNavigate();
  const [currentSlide, setCurrentSlide] = useState(0);
  const { heroCarousel, universities, programs, testimonials, fetchMultiple } = useContent();

  useEffect(() => {
    fetchMultiple(['heroCarousel', 'universities', 'programs', 'testimonials'], { limit: 20, force: false });
  }, []);

  const activeSlides = heroCarousel
    .filter(item => item.is_active)
    .sort((a, b) => a.display_order - b.display_order);

  // Auto-advance carousel
  useEffect(() => {
    if (activeSlides.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % activeSlides.length);
    }, 10000); // Change slide every 10 seconds

    return () => clearInterval(interval);
  }, [activeSlides.length]);

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
  };

  const goToPrevious = () => {
    setCurrentSlide((prev) => (prev - 1 + activeSlides.length) % activeSlides.length);
  };

  const goToNext = () => {
    setCurrentSlide((prev) => (prev + 1) % activeSlides.length);
  };

  const currentSlideData = activeSlides[currentSlide] || activeSlides[0];

  if (!currentSlideData) {
    // Fallback content if no carousel items

    return (
      <>
        <section className="relative bg-gradient-to-br from-blue-50 to-indigo-100 overflow-hidden">
          <div className="absolute inset-0">
            <img
              src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=1920&h=1080&fit=crop"
              alt="Students learning online"
              className="w-full h-full object-cover opacity-20"
            />
          </div>

          <div className="relative section-padding">
            <div className="max-w-7xl mx-auto">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                <div className="space-y-8">
                  <div className="space-y-4">
                    <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight">
                      Advance Your Career with{' '}
                      <span className="text-edu-primary">UGC-Approved</span>{' '}
                      Online Degrees
                    </h1>
                    <p className="text-xl text-gray-600 max-w-2xl">
                      Join thousands of professionals who have transformed their careers
                      with our comprehensive online education programs from top universities.
                    </p>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-4">
                    <button
                      onClick={() => navigate('/programs')}
                      className="btn-primary group"
                    >
                      Explore UGC-approved Online Degrees
                      <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                    </button>
                    <button className="btn-secondary group">
                      <Play className="mr-2 h-5 w-5" />
                      Watch Demo
                    </button>
                  </div>

                  <div className="grid grid-cols-3 gap-8 pt-8 border-t border-gray-200">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-gray-900">
                        <span>{universities.length}+</span>
                      </div>
                      <div className="text-sm text-gray-600">Universities</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-gray-900">
                        <span>{programs.length}+</span>
                      </div>
                      <div className="text-sm text-gray-600">Programs</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-gray-900">
                        <span>{testimonials.length}+</span>
                      </div>
                      <div className="text-sm text-gray-600">Students</div>
                    </div>
                  </div>
                </div>

                <div className="relative">
                  <div className="relative z-10">
                    <img
                      src="https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=600&h=400&fit=crop"
                      alt="Student with laptop"
                      className="rounded-2xl shadow-2xl"
                    />
                  </div>
                  <div className="absolute -top-4 -right-4 w-72 h-72 bg-edu-primary opacity-20 rounded-full blur-3xl"></div>
                  <div className="absolute -bottom-4 -left-4 w-72 h-72 bg-purple-400 opacity-20 rounded-full blur-3xl"></div>
                </div>
              </div>
            </div>
          </div>
        </section>
        {/* {isLeadFormOpen && <LeadForm isOpen={true} onClose={() => setIsLeadFormOpen(false)} />} */}
      </>
    );
  }

  return (
    <>
      <section className="relative overflow-hidden min-h-screen flex items-center">
        {/* Background Image with Overlay */}
        <div className="absolute inset-0">
          <img
            src={currentSlideData.background_image}
            alt={currentSlideData.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0"></div>
        </div>

        {/* Navigation Arrows */}
        {activeSlides.length > 1 && (
          <>
            <button
              onClick={goToPrevious}
              className="absolute left-4 top-1/2 -translate-y-1/2 z-20 p-2 rounded-full bg-white/20 hover:bg-white/30 text-white transition-colors"
            >
              <ChevronLeft className="h-6 w-6" />
            </button>
            <button
              onClick={goToNext}
              className="absolute right-4 top-1/2 -translate-y-1/2 z-20 p-2 rounded-full bg-white/20 hover:bg-white/30 text-white transition-colors"
            >
              <ChevronRight className="h-6 w-6" />
            </button>
          </>
        )}

        <div className="relative z-10 section-padding w-full">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div className="space-y-8 text-white">
                <div className="space-y-4">
                  <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight animate-fade-in">
                    {currentSlideData.title}
                  </h1>
                  <h2 className="text-2xl md:text-3xl font-semibold opacity-90 animate-fade-in">
                    {currentSlideData.subtitle}
                  </h2>
                  {currentSlideData.description && (
                    <p className="text-xl opacity-80 max-w-2xl animate-fade-in">
                      {currentSlideData.description}
                    </p>
                  )}
                </div>

                <div className="flex flex-col sm:flex-row gap-4 animate-fade-in">
                  <button
                    onClick={() => navigate(currentSlideData.cta_link)}
                    className="bg-white text-gray-900 px-8 py-4 rounded-lg font-semibold hover:bg-gray-100 transition-colors group"
                  >
                    {currentSlideData.cta_text}
                    <ArrowRight className="ml-2 h-5 w-5 inline group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>

                <div className="grid grid-cols-3 gap-8 pt-8 border-t border-white/20 animate-fade-in">
                  <div className="text-center">
                    <div className="text-2xl font-bold">
                      <span>{universities.length}+</span>
                    </div>
                    <div className="text-sm opacity-80">Universities</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold">
                      <span>{programs.length}+</span>
                    </div>
                    <div className="text-sm opacity-80">Programs</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold">
                      <span>{testimonials.length}+</span>
                    </div>
                    <div className="text-sm opacity-80">Students</div>
                  </div>
                </div>
              </div>

              {/* Optional: Add some visual element on the right */}
              <div className="hidden lg:block">
                <div className="relative">
                  <div className="w-96 h-96 bg-white/10 rounded-full blur-3xl"></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Slide Indicators */}
        {activeSlides.length > 1 && (
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex space-x-2">
            {activeSlides.map((_, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                className={`w-3 h-3 rounded-full transition-colors ${index === currentSlide
                  ? 'bg-white'
                  : 'bg-white/40 hover:bg-white/60'
                  }`}
              />
            ))}
          </div>
        )}
      </section>

      {/* {isLeadFormOpen && <LeadForm isOpen={true} onClose={() => setIsLeadFormOpen(false)} />} */}

    </>
  );
};

export default HeroSection;
