import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Clock,
  DollarSign,
  Award,
  BookOpen,
  CheckCircle,
  Download,
  Star,
  MapPin,
  Calendar,
  Users,
  ArrowLeft
} from 'lucide-react';
import Header from '../components/common/Header';
import Footer from '../components/common/Footer';
import LeadForm from '../components/common/LeadForm';
import { useContent } from '@/contexts/ContentContext';

const ProgramDetail: React.FC = () => {
  const { id } = useParams();
  const { programs, fetchMultiple, loading } = useContent();
  const [isLeadFormOpen, setIsLeadFormOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');

  // Fix the program finding logic
  const program = programs.find(p => p.id === id);

  useEffect(() => {
    fetchMultiple(['programs', 'universities'], { limit: 20, force: false });
  }, [fetchMultiple]);

  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'curriculum', label: 'Curriculum' },
    { id: 'eligibility', label: 'Eligibility' },
    { id: 'fees', label: 'Fees & Duration' }
  ];

  // Show loading state
  if (loading.programs || loading.universities) {
    return (
        <div className="min-h-screen bg-gray-50">
          <Header />
          <div className="flex justify-center items-center min-h-screen">
            <span className="loader"></span>
          </div>
          <Footer />
        </div>
    );
  }

  // Show not found state
  if (!program) {
    return (
        <div className="min-h-screen bg-gray-50">
          <Header />
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Program Not Found</h1>
            <p className="text-gray-600 mb-8">The program you're looking for doesn't exist or has been removed.</p>
            <Link to="/programs" className="btn-primary">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Programs
            </Link>
          </div>
          <Footer />
        </div>
    );
  }

  return (
      <div className="min-h-screen bg-gray-50">
        <Header />

        {/* Breadcrumb */}
        <section className="bg-white border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <Link to="/" className="hover:text-edu-primary">Home</Link>
              <span>/</span>
              <Link to="/programs" className="hover:text-edu-primary">Programs</Link>
              <span>/</span>
              <span className="text-gray-900">{program.title}</span>
            </div>
          </div>
        </section>

        {/* Hero Section */}
        <section className="bg-white section-padding">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2">
                <Link
                    to="/programs"
                    className="inline-flex items-center text-edu-primary hover:text-edu-primary-dark mb-4"
                >
                  <ArrowLeft className="w-4 h-4 mr-1" />
                  Back to Programs
                </Link>

                <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                  {program.title}
                </h1>

                <div className="flex items-center space-x-4 mb-6">
                  {program.university_details?.logo && (
                      <img
                          src={program.university_details.logo}
                          alt={program.university_details.name || 'University'}
                          className="w-12 h-12 rounded-lg object-cover"
                      />
                  )}
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900">
                      {program.university_details?.name || 'University Name'}
                    </h2>
                    <div className="flex items-center space-x-2">
                      {program.university_details?.naacGrade && (
                          <span className="badge-accreditation">
                        NAAC {program.university_details.naacGrade}
                      </span>
                      )}
                      <div className="flex items-center">
                        <Star className="w-4 h-4 text-yellow-400 fill-current" />
                        <span className="text-sm text-gray-600 ml-1">
                        {program.university_details?.rating || '4.5'}
                      </span>
                      </div>
                    </div>
                  </div>
                </div>

                {program.description && (
                    <p className="text-lg text-gray-600 mb-6">
                      {program.description}
                    </p>
                )}

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                  <div className="flex items-center space-x-2">
                    <Clock className="w-5 h-5 text-edu-primary" />
                    <div>
                      <div className="text-sm text-gray-500">Duration</div>
                      <div className="font-semibold">{program.duration || 'N/A'}</div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <DollarSign className="w-5 h-5 text-edu-primary" />
                    <div>
                      <div className="text-sm text-gray-500">Total Fees</div>
                      <div className="font-semibold">₹{program.fees || 'N/A'}</div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <BookOpen className="w-5 h-5 text-edu-primary" />
                    <div>
                      <div className="text-sm text-gray-500">Mode</div>
                      <div className="font-semibold capitalize">{program.mode || 'N/A'}</div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Award className="w-5 h-5 text-edu-primary" />
                    <div>
                      <div className="text-sm text-gray-500">Accredited</div>
                      <div className="font-semibold text-xs">
                        {Array.isArray(program.accreditation)
                            ? program.accreditation.join(', ')
                            : program.accreditation || 'N/A'}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Sticky Sidebar */}
              <div className="lg:col-span-1">
                <div className="card-edu sticky top-24">
                  <div className="text-center mb-6">
                    <div className="text-2xl font-bold text-gray-900 mb-2">
                      ₹{program.fees || 'Contact for fees'}
                    </div>
                    <div className="text-sm text-gray-600">Total Program Fee</div>
                  </div>

                  <div className="space-y-3 mb-6">
                    <button
                        onClick={() => setIsLeadFormOpen(true)}
                        className="w-full btn-primary"
                    >
                      Apply Now
                    </button>
                    <button className="w-full btn-secondary">
                      <Download className="w-4 h-4 mr-2" />
                      Download Brochure
                    </button>
                  </div>

                  {program.university_details && (
                      <div className="border-t pt-4">
                        <h4 className="font-semibold text-gray-900 mb-3">University Details</h4>
                        <div className="space-y-2 text-sm">
                          <div className="flex items-center text-gray-600">
                            <MapPin className="w-4 h-4 mr-2" />
                            {program.university_details.name || 'University Name'}
                          </div>
                          {program.university_details.rating && (
                              <div className="flex items-center text-gray-600">
                                <Calendar className="w-4 h-4 mr-2" />
                                Rating: {program.university_details.rating} / 5
                              </div>
                          )}
                          {program.university_details.programs && (
                              <div className="flex items-center text-gray-600">
                                <Users className="w-4 h-4 mr-2" />
                                {program.university_details.programs} Programs
                              </div>
                          )}
                        </div>
                      </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Tabs Section */}
        <section className="bg-white border-t">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex space-x-8 overflow-x-auto">
              {tabs.map((tab) => (
                  <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`py-4 px-2 border-b-2 font-medium text-sm whitespace-nowrap transition-colors ${
                          activeTab === tab.id
                              ? 'border-edu-primary text-edu-primary'
                              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                      }`}
                  >
                    {tab.label}
                  </button>
              ))}
            </div>
          </div>
        </section>

        {/* Tab Content */}
        <section className="section-padding bg-white">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2">
                {activeTab === 'overview' && (
                    <div className="space-y-6">
                      <div>
                        <h3 className="text-xl font-bold text-gray-900 mb-4">Program Overview</h3>
                        <p className="text-gray-600 leading-relaxed">
                          {program.description || 'Program description not available.'} This comprehensive program is designed to provide you with
                          the knowledge and skills needed to excel in today's competitive business environment.
                          Our curriculum combines theoretical foundations with practical applications, ensuring
                          you graduate with both the knowledge and experience needed for success.
                        </p>
                      </div>

                      <div>
                        <h3 className="text-xl font-bold text-gray-900 mb-4">Why Choose This Program?</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {[
                            'Industry-relevant curriculum',
                            'Expert faculty',
                            'Flexible learning schedule',
                            'Career support services',
                            'Alumni network access',
                            'Industry partnerships'
                          ].map((benefit, index) => (
                              <div key={index} className="flex items-center space-x-2">
                                <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                                <span className="text-gray-700">{benefit}</span>
                              </div>
                          ))}
                        </div>
                      </div>
                    </div>
                )}

                {activeTab === 'curriculum' && (
                    <div>
                      <h3 className="text-xl font-bold text-gray-900 mb-4">Curriculum</h3>
                      <div className="space-y-4">
                        {program.curriculum && Array.isArray(program.curriculum) && program.curriculum.length > 0 ? (
                            program.curriculum.map((subject, index) => (
                                <div key={index} className="flex items-start space-x-3 p-4 bg-gray-50 rounded-lg">
                                  <div className="w-8 h-8 bg-edu-primary text-white rounded-full flex items-center justify-center text-sm font-semibold">
                                    {index + 1}
                                  </div>
                                  <div>
                                    <h4 className="font-semibold text-gray-900">{subject}</h4>
                                    <p className="text-sm text-gray-600">
                                      Comprehensive coverage of {subject.toLowerCase()} concepts and practical applications.
                                    </p>
                                  </div>
                                </div>
                            ))
                        ) : (
                            <p className="text-gray-600">Curriculum information not available.</p>
                        )}
                      </div>
                    </div>
                )}

                {activeTab === 'eligibility' && (
                    <div>
                      <h3 className="text-xl font-bold text-gray-900 mb-4">Eligibility Criteria</h3>
                      <div className="space-y-3">
                        {program.eligibility && Array.isArray(program.eligibility) && program.eligibility.length > 0 ? (
                            program.eligibility.map((requirement, index) => (
                                <div key={index} className="flex items-start space-x-2">
                                  <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                                  <span className="text-gray-700">{requirement}</span>
                                </div>
                            ))
                        ) : (
                            <p className="text-gray-600">Eligibility criteria not available.</p>
                        )}
                      </div>
                    </div>
                )}

                {activeTab === 'fees' && (
                    <div className="space-y-6">
                      <div>
                        <h3 className="text-xl font-bold text-gray-900 mb-4">Fee Structure</h3>
                        <div className="card-edu">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                              <h4 className="font-semibold text-gray-900 mb-2">Total Program Fee</h4>
                              <p className="text-2xl font-bold text-edu-primary">
                                ₹{program.fees || 'Contact for fees'}
                              </p>
                            </div>
                            <div>
                              <h4 className="font-semibold text-gray-900 mb-2">Payment Options</h4>
                              <ul className="text-sm text-gray-600 space-y-1">
                                <li>• Semester-wise payment</li>
                                <li>• EMI options available</li>
                                <li>• Scholarship opportunities</li>
                              </ul>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div>
                        <h3 className="text-xl font-bold text-gray-900 mb-4">Program Duration</h3>
                        <div className="card-edu">
                          <p className="text-lg">
                            <span className="font-semibold">{program.duration || 'Duration not specified'}</span> - Flexible learning schedule
                          </p>
                          <p className="text-gray-600 mt-2">
                            Complete the program at your own pace with our flexible online learning platform.
                          </p>
                        </div>
                      </div>
                    </div>
                )}
              </div>

              {/* Floating CTA for mobile */}
              <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t p-4 z-40">
                <button
                    onClick={() => setIsLeadFormOpen(true)}
                    className="w-full btn-primary"
                >
                  Apply Now
                </button>
              </div>
            </div>
          </div>
        </section>

        <LeadForm
            isOpen={isLeadFormOpen}
            onClose={() => setIsLeadFormOpen(false)}
            programTitle={program.title}
        />

        <Footer />
      </div>
  );
};

export default ProgramDetail;