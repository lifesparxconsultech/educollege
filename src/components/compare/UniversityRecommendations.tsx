import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Star, MapPin, Calendar, DollarSign, GraduationCap, BookOpen, Award, TrendingUp, Network } from 'lucide-react';
import {Program} from '@/dto/program.ts'

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

interface UniversityRecommendationsProps {
  recommendations: RecommendationData[];
  onViewDetails: (program: Program) => void;
}

const UniversityRecommendations: React.FC<UniversityRecommendationsProps> = ({
                                                                               recommendations,
                                                                               onViewDetails
                                                                             }) => {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const getMatchScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600 bg-green-50';
    if (score >= 80) return 'text-blue-600 bg-blue-50';
    if (score >= 70) return 'text-yellow-600 bg-yellow-50';
    return 'text-gray-600 bg-gray-50';
  };

  return (
      <div className="space-y-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">AI-Powered Program Recommendations</h2>
          <p className="text-muted-foreground">
            Based on your preferences, here are the best program matches for you
          </p>
        </div>

        <div className="space-y-6">
          {recommendations.map((rec, index) => (
              <Card key={rec.program.id} className="overflow-hidden">
                <CardHeader className="pb-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <Badge className="text-lg px-3 py-1">#{index + 1}</Badge>
                        <Badge
                            className={`${getMatchScoreColor(rec.matchScore)} font-semibold`}
                        >
                          {rec.matchScore}% Match
                        </Badge>
                      </div>
                      <CardTitle className="text-xl mb-1">{rec.program.title}</CardTitle>
                      {rec.program.university_details && (
                          <>
                            <p className="text-lg font-medium text-primary">{rec.program.university_details.name}</p>
                            <div className="flex items-center gap-2 mt-2">
                              <MapPin className="h-4 w-4 text-muted-foreground" />
                              <span className="text-sm text-muted-foreground">{rec.program.university_details.location}</span>
                              <Star className="h-4 w-4 text-yellow-500 ml-4" />
                              <span className="text-sm font-medium">{rec.program.university_details.naacGrade}</span>
                            </div>
                          </>
                      )}
                      <p className="text-sm text-muted-foreground mt-1">{rec.program.category}</p>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="space-y-6">
                  {/* Program Details Grid */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-xs text-muted-foreground">Duration</p>
                        <p className="font-medium">{typeof rec.program.duration === 'number' ? `${rec.program.duration} months` : rec.program.duration}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <DollarSign className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-xs text-muted-foreground">Fees</p>
                        <p className="font-medium">{formatCurrency(rec.program.fees)}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <BookOpen className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-xs text-muted-foreground">Mode</p>
                        <p className="font-medium capitalize">{rec.program.mode || 'Online'}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Award className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-xs text-muted-foreground">Accreditation</p>
                        <p className="font-medium">{Array.isArray(rec.program.accreditation) ? rec.program.accreditation.join(', ') : rec.program.accreditation}</p>
                      </div>
                    </div>
                  </div>

                  {/* ROI Analysis */}
                  <div className="bg-muted/50 rounded-lg p-4">
                    <h4 className="font-semibold flex items-center gap-2 mb-3">
                      <TrendingUp className="h-4 w-4 text-primary" />
                      ROI Analysis
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <p className="text-xs text-muted-foreground">Investment</p>
                        <p className="font-semibold text-red-600">{formatCurrency(rec.roi.investment)}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Expected Returns (5 years)</p>
                        <p className="font-semibold text-green-600">{formatCurrency(rec.roi.expectedReturns)}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Payback Period</p>
                        <p className="font-semibold text-blue-600">{rec.roi.paybackYears} years</p>
                      </div>
                    </div>
                  </div>

                  {/* Match Reasons */}
                  <div>
                    <h4 className="font-semibold flex items-center gap-2 mb-3">
                      <Network className="h-4 w-4 text-primary" />
                      Why This Matches Your Profile
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {rec.reasons.map((reason, idx) => (
                          <div key={idx} className="flex items-start gap-2 text-sm">
                            <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                            <span>{reason}</span>
                          </div>
                      ))}
                    </div>
                  </div>

                  {/* Eligibility */}
                  {rec.program.eligibility && rec.program.eligibility.length > 0 && (
                      <div>
                        <h4 className="font-semibold flex items-center gap-2 mb-3">
                          <GraduationCap className="h-4 w-4 text-primary" />
                          Eligibility Criteria
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                          {rec.program.eligibility.map((req, idx) => (
                              <div key={idx} className="flex items-start gap-2 text-sm">
                                <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                                <span>{req}</span>
                              </div>
                          ))}
                        </div>
                      </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex gap-3 pt-4">
                    <Button onClick={() => onViewDetails(rec.program)} className="flex-1">
                      View Full Details
                    </Button>
                    <Button variant="outline" className="flex-1">
                      Download Brochure
                    </Button>
                    <Button variant="outline">
                      Contact Advisor
                    </Button>
                  </div>
                </CardContent>
              </Card>
          ))}
        </div>
      </div>
  );
};

export default UniversityRecommendations;