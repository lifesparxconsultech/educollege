import React, { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  Filter,
  Search,
  Clock,
  DollarSign,
  Award,
  BookOpen,
  Star,
} from 'lucide-react';
import Header from '../components/common/Header';
import Footer from '../components/common/Footer';
import LeadForm from '../components/common/LeadForm';
import { useContent } from '@/contexts/ContentContext';

const Programs: React.FC = () => {
  const { programs, searchTerm, setSearchTerm, fetchPrograms } = useContent();
  const [searchParams] = useSearchParams();
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || '');
  const [selectedMode, setSelectedMode] = useState('');
  const [priceRange, setPriceRange] = useState('');
  const [isLeadFormOpen, setIsLeadFormOpen] = useState(false);
  const [selectedProgram, setSelectedProgram] = useState('');

  useEffect(() => {
    fetchPrograms({limit: 20, force: false});
  }, [searchTerm]);

  const categories = [...new Set(programs.map(p => p.category).filter(Boolean))];
  const modes = ['online', 'hybrid', 'offline'];
  const priceRanges = [
    { label: 'Under ₹50,000', value: '0-50000' },
    { label: '₹50,000 - ₹1,00,000', value: '50000-100000' },
    { label: '₹1,00,000 - ₹2,00,000', value: '100000-200000' },
    { label: 'Above ₹2,00,000', value: '200000-999999' },
  ];

  const filteredPrograms = programs.filter(program => {
  const matchesSearch =
    program.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    program.university_details.name.toLowerCase().includes(searchTerm.toLowerCase());

  const matchesCategory = !selectedCategory || program.category === selectedCategory;
  const matchesMode = !selectedMode || program.mode === selectedMode;

  let matchesPrice = true;
  if (priceRange) {
    const [min, max] = priceRange.split('-').map(Number);
    const fee = Number(program.fees); // ✅ Convert to number
    matchesPrice = !isNaN(fee) && fee >= min && fee <= max;
  }

  return matchesSearch && matchesCategory && matchesMode && matchesPrice;
});


  const handleApplyNow = (programTitle: string) => {
    setSelectedProgram(programTitle);
    setIsLeadFormOpen(true);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      {/* Hero */}
      <section className="bg-gradient-to-br from-edu-primary to-edu-primary-dark text-white section-padding">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Online Degree Programs
          </h1>
          <p className="text-xl opacity-90 max-w-3xl mx-auto">
            Explore UGC-approved online programs from top universities
          </p>
        </div>
      </section>

      {/* Filters */}
      <section className="section-padding bg-white shadow-sm">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="lg:col-span-2 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search programs or universities..."
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-edu-primary focus:border-transparent"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <select className="select-field" value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)}>
              <option value="">All Categories</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>

            <select className="select-field" value={selectedMode} onChange={(e) => setSelectedMode(e.target.value)}>
              <option value="">All Modes</option>
              {modes.map((mode) => (
                <option key={mode} value={mode}>{mode.charAt(0).toUpperCase() + mode.slice(1)}</option>
              ))}
            </select>

            <select className="select-field" value={priceRange} onChange={(e) => setPriceRange(e.target.value)}>
              <option value="">All Prices</option>
              {priceRanges.map((range) => (
                <option key={range.value} value={range.value}>{range.label}</option>
              ))}
            </select>
          </div>

          <div className="flex items-center justify-between mt-6">
            <p className="text-gray-600">
              Showing {filteredPrograms.length} of {programs.length} programs
            </p>
            <button className="flex items-center text-edu-primary hover:text-edu-primary-dark">
              <Filter className="w-4 h-4 mr-1" />
              More Filters
            </button>
          </div>
        </div>
      </section>

      {/* Programs Grid */}
      <section className="section-padding">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8">
            {filteredPrograms.map((program) => (
              <div key={program.id} className="card-edu group hover:shadow-xl transition-all duration-300">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-edu-primary transition-colors line-clamp-2">
                      {program.title}
                    </h3>
                    <div className="flex items-center space-x-2 mb-2">
                      {/* Placeholder logo */}
                      {/* <div className="w-8 h-8 bg-gray-200 rounded"></div> */}
                      <span className="text-sm text-gray-600">{program.university_details.name}</span>
                    </div>
                  </div>
                  {program.featured && (
                    <span className="bg-yellow-100 text-yellow-800 text-xs font-medium px-2 py-1 rounded-full">
                      Featured
                    </span>
                  )}
                </div>

                <p className="text-gray-600 mb-4 line-clamp-3">{program.description}</p>

                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="flex items-center text-sm text-gray-600">
                    <Clock className="w-4 h-4 mr-2 text-edu-primary" />
                    <span>{program.duration} Years</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <DollarSign className="w-4 h-4 mr-2 text-edu-primary" />
                    <span>₹{program.fees.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <BookOpen className="w-4 h-4 mr-2 text-edu-primary" />
                    <span className="capitalize">{program.mode}</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <Award className="w-4 h-4 mr-2 text-edu-primary" />
                    <span>{program.accreditation}</span>
                  </div>
                </div>

                {/* Placeholder University Rating */}
                <div className="flex items-center justify-between mb-4 p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <span className="badge-accreditation">UGC Approved</span>
                    <div className="flex items-center">
                      <Star className="w-4 h-4 text-yellow-400 fill-current" />
                      <span className="text-sm text-gray-600 ml-1">4.5</span>
                    </div>
                  </div>
                  <span className="text-xs text-gray-500">Online</span>
                </div>

                <div className="flex space-x-3">
                  <Link to={`/programs/${program.id}`} className="flex-1 btn-secondary text-center">
                    View Details
                  </Link>
                  <button onClick={() => handleApplyNow(program.title)} className="flex-1 btn-primary">
                    Apply Now
                  </button>
                </div>
              </div>
            ))}
          </div>

          {filteredPrograms.length === 0 && (
            <div className="text-center py-12">
              <BookOpen className="w-16 h-16 mx-auto text-gray-300 mb-4" />
              <h3 className="text-xl font-semibold text-gray-600 mb-2">No programs found</h3>
              <p className="text-gray-500">Try adjusting your filters or search terms</p>
            </div>
          )}
        </div>
      </section>

      <LeadForm
        isOpen={isLeadFormOpen}
        onClose={() => setIsLeadFormOpen(false)}
        programTitle={selectedProgram}
      />

      <Footer />
    </div>
  );
};

export default Programs;
