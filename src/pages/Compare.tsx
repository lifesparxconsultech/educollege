import React, { useEffect, useState } from 'react';
import Header from '@/components/common/Header';
import Footer from '@/components/common/Footer';
import { Sparkles } from 'lucide-react';
import { toast } from 'sonner';
import { Program } from '@/dto/program.ts';
import ComparisonForm from '@/components/compare/ComparisonForm';
import UniversityRecommendations from '@/components/compare/UniversityRecommendations';
import { useContent } from '@/contexts/ContentContext.tsx';
import { useNavigate } from 'react-router-dom';
import LeadForm from '@/components/common/LeadForm';

interface ComparisonFormData {
  degree: string;
  course: string;
  specialization: string;
  currentlyWorking: boolean;
  totalFee: number;
  emiMonths: number;
  expectedSalary: number;
  highestQualification: string;
  qualificationPercentage: number;
  workExperience: number;
  networkingImportance: number;
}

interface RecommendationData {
  program: Program;
  matchScore: number;
  reasons: string[];
  roi: {
    investment: number;
    expectedReturns: number;
    paybackYears: number;
  };
}

const Compare: React.FC = () => {
  const { programs, fetchPrograms } = useContent();
  const [recommendations, setRecommendations] = useState<RecommendationData[]>([]);
  const [isLoadingAI, setIsLoadingAI] = useState(false);
  const [showRecommendations, setShowRecommendations] = useState(false);
  const [showLeadForm, setShowLeadForm] = useState(false);
  const [pendingFormData, setPendingFormData] = useState<ComparisonFormData | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchPrograms({ limit: 20, force: false });
  }, []);

  const generateRecommendations = (formData: ComparisonFormData) => {
    setPendingFormData(formData);
    setShowLeadForm(true);
  };

  const processRecommendations = (formData: ComparisonFormData) => {
    setIsLoadingAI(true);

    setTimeout(() => {
      const scoredPrograms = programs.map(program => {
        let score = 0;
        const reasons: string[] = [];

        if (program.category.toLowerCase().includes(formData.course.toLowerCase())) {
          score += 30;
          reasons.push(`Perfect match for ${formData.course} program`);
        }

        if (program.fees <= formData.totalFee) {
          score += 25;
          reasons.push('Fits within your budget range');
        } else if (program.fees <= formData.totalFee * 1.2) {
          score += 15;
          reasons.push('Slightly above budget but offers great value');
        }

        if (formData.currentlyWorking && program.mode && program.mode !== 'offline') {
          score += 20;
          reasons.push('Flexible learning mode suitable for working professionals');
        }

        if (typeof program.duration === 'number') {
          if (formData.currentlyWorking && program.duration <= 24) {
            score += 10;
            reasons.push('Optimal duration for career professionals');
          } else if (!formData.currentlyWorking && program.duration >= 12) {
            score += 10;
            reasons.push('Comprehensive duration for thorough learning');
          }
        }

        if (program.university_details && parseFloat(program.university_details.naacGrade) >= 4.0) {
          score += 10;
          reasons.push('High-rated university with excellent reputation');
        }

        if (program.accreditation && program.accreditation.length > 0) {
          score += 5;
          reasons.push('Well-accredited program with quality assurance');
        }

        score += Math.random() * 5;

        return {
          program,
          score: Math.min(100, score),
          reasons: reasons.slice(0, 4)
        };
      });

      const topPrograms = scoredPrograms
          .sort((a, b) => b.score - a.score)
          .slice(0, 5);

      const recommendations: RecommendationData[] = topPrograms.map(item => ({
        program: item.program,
        matchScore: Math.round(item.score),
        reasons: item.reasons,
        roi: {
          investment: item.program.fees,
          expectedReturns: formData.expectedSalary * 5,
          paybackYears: Math.round(item.program.fees / (formData.expectedSalary * 0.3))
        }
      }));

      setRecommendations(recommendations);
      setShowRecommendations(true);
      setIsLoadingAI(false);
      setPendingFormData(null);
      toast.success('AI recommendations generated!');
    }, 3000);
  };

  const handleLeadFormSubmit = () => {
    setShowLeadForm(false);
    if (pendingFormData) {
      processRecommendations(pendingFormData);
    }
  };

  const handleLeadFormClose = () => {
    setShowLeadForm(false);
    setPendingFormData(null);
    setIsLoadingAI(false);
  };

  const handleViewDetails = (program: Program) => {
    navigate(`/programs/${program.id}`);
    toast.success(`Viewing details for ${program.title}`);
  };

  return (
      <div className="min-h-screen bg-background">
        <Header />

        {/* Hero Section */}
        <section className="bg-gradient-to-br from-edu-primary to-edu-primary-dark text-white section-padding">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 mb-4">
                <Sparkles className="h-8 w-8 text-yellow-300" />
                <h1 className="text-4xl md:text-5xl font-bold">
                  AI-Powered Program Compare
                </h1>
              </div>
              <p className="text-xl text-primary-foreground/90 max-w-3xl mx-auto">
                Compare university programs side-by-side and get AI-powered recommendations tailored to your goals
              </p>
            </div>
          </div>
        </section>

        <section className="py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {!showRecommendations ? (
                <ComparisonForm onSubmit={generateRecommendations} isLoading={isLoadingAI} />
            ) : (
                <div className="space-y-8">
                  <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-bold">Your Personalized Recommendations</h2>
                    <button
                        onClick={() => setShowRecommendations(false)}
                        className="text-primary hover:underline"
                    >
                      ← Back to Form
                    </button>
                  </div>

                  <UniversityRecommendations
                      recommendations={recommendations}
                      onViewDetails={handleViewDetails}
                  />
                </div>
            )}
          </div>
        </section>

        {/* Lead Form Modal */}
        <LeadForm
            isOpen={showLeadForm}
            onClose={handleLeadFormClose}
            programTitle="AI Program Recommendations"
            onSubmit={handleLeadFormSubmit}
        />

        <Footer />
      </div>
  );
};

export default Compare;
