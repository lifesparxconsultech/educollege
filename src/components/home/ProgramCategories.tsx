import { useContent } from '@/contexts/ContentContext';
import {
  Briefcase,
  Users,
  Award,
  BookOpen,
  TrendingUp,
  GraduationCap,
  ArrowRight,
} from 'lucide-react';
import { useEffect } from 'react';
import { Link } from 'react-router-dom';

const CATEGORY_CONFIG: Record<string, {
  icon: React.ElementType;
  color: string;
  bgColor: string;
}> = {
  MBA: {
    icon: Briefcase,
    color: 'text-blue-600',
    bgColor: 'bg-blue-100',
  },
  BBA: {
    icon: Users,
    color: 'text-purple-600',
    bgColor: 'bg-purple-100',
  },
  MCom: {
    icon: Award,
    color: 'text-yellow-600',
    bgColor: 'bg-yellow-100',
  },
  BCom: {
    icon: BookOpen,
    color: 'text-green-600',
    bgColor: 'bg-green-100',
  },
  DataScience: {
    icon: TrendingUp,
    color: 'text-pink-600',
    bgColor: 'bg-pink-100',
  },
  Engineering: {
    icon: GraduationCap,
    color: 'text-red-600',
    bgColor: 'bg-red-100',
  },
};

const ProgramCategories: React.FC = () => {
  const { programs, fetchPrograms } = useContent();

  useEffect(() => {
    fetchPrograms({limit: 20, force: false});
  }, []);

  return (
    <section className="section-padding bg-gray-50">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Program Categories
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Choose from a wide range of UGC-approved online programs designed for working professionals
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {programs.slice(0,3).map((program) => {
            const config = CATEGORY_CONFIG[program.category || program.title] || {
              icon: GraduationCap,
              color: 'text-gray-600',
              bgColor: 'bg-gray-100',
            };

            const Icon = config.icon;

            return (
              <Link
                key={program.id}
                to={`/programs`}
                className="group"
                >
                <div className="p-6 rounded-2xl border border-gray-200 bg-white shadow-sm hover:shadow-lg transition">
                  <div className="flex items-center space-x-4 mb-4">
                    <div className={`p-3 rounded-xl ${config.bgColor}`}>
                      <Icon className={`h-6 w-6 ${config.color}`} />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        {program.title}
                      </h3>
                      {/* <p className="text-sm text-gray-500">
                        {program.programCount || '0'} Programs
                      </p> */}
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 line-clamp-3">
                    {program.description}
                  </p>
                  <div className="flex items-center justify-between mt-2">
                    <Link
                      to={`/programs`}
                      className="text-sm font-medium text-edu-primary hover:text-edu-primary-dark inline-flex items-center transition-transform group-hover:translate-x-1"
                    >
                      View Program
                      <ArrowRight className="ml-1 h-4 w-4" />
                    </Link>
                  </div>
                </div>
              </Link>

            );
          })}
        </div>

        <div className="text-center mt-12">
          <Link to="/programs" className="btn-primary">
            Browse All Programs
          </Link>
        </div>
      </div>
    </section>
  );
};

export default ProgramCategories;
