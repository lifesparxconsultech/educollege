// import React from 'react';
// import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
// import { Button } from '@/components/ui/button';
// import { Input } from '@/components/ui/input';
// import { Label } from '@/components/ui/label';
// import { Slider } from '@/components/ui/slider';
// import { Progress } from '@/components/ui/progress';
// import { Calculator, Sparkles, ChevronLeft, ChevronRight } from 'lucide-react';
//
// interface ComparisonFormData {
//   degree: string;
//   course: string;
//   specialization: string;
//   currentlyWorking: boolean;
//   totalFee: number;
//   emiMonths: number;
//   expectedSalary: number;
//   highestQualification: string;
//   qualificationPercentage: number;
//   workExperience: number;
//   networkingImportance: number;
// }
//
// interface ComparisonFormProps {
//   onSubmit: (data: ComparisonFormData) => void;
//   isLoading: boolean;
// }
//
// const ComparisonForm: React.FC<ComparisonFormProps> = ({ onSubmit, isLoading }) => {
//   const [currentStep, setCurrentStep] = React.useState(1);
//   const [formData, setFormData] = React.useState<ComparisonFormData>({
//     degree: '',
//     course: '',
//     specialization: '',
//     currentlyWorking: false,
//     totalFee: 500000,
//     emiMonths: 12,
//     expectedSalary: 800000,
//     highestQualification: '',
//     qualificationPercentage: 70,
//     workExperience: 0,
//     networkingImportance: 5
//   });
//
//   const totalSteps = 4;
//   const progress = (currentStep / totalSteps) * 100;
//
//   const degrees = ['Bachelor', 'Master', 'Diploma', 'Certificate', 'PhD'];
//   const courses = ['MBA', 'BBA', 'Engineering', 'Computer Science', 'Management', 'Finance', 'Marketing', 'Data Science', 'AI/ML'];
//   const specializations = ['General Management', 'Finance', 'Marketing', 'HR', 'Operations', 'Technology', 'Healthcare', 'International Business'];
//   const qualifications = ['10th', '12th', 'Diploma', 'Bachelor\'s', 'Master\'s', 'PhD'];
//
//   const calculateEMI = () => {
//     const principal = formData.totalFee;
//     const rate = 12 / 100 / 12; // 12% annual rate
//     const months = formData.emiMonths;
//     const emi = (principal * rate * Math.pow(1 + rate, months)) / (Math.pow(1 + rate, months) - 1);
//     return Math.round(emi);
//   };
//
//   const handleSubmit = (e: React.FormEvent) => {
//     e.preventDefault();
//     onSubmit(formData);
//   };
//
//   const handleNext = () => {
//     if (currentStep < totalSteps) {
//       setCurrentStep(currentStep + 1);
//     }
//   };
//
//   const handlePrevious = () => {
//     if (currentStep > 1) {
//       setCurrentStep(currentStep - 1);
//     }
//   };
//
//   const isStepValid = () => {
//     switch (currentStep) {
//       case 1:
//         return formData.degree && formData.course;
//       case 2:
//         return formData.highestQualification;
//       case 3:
//         return true; // Financial details have default values
//       case 4:
//         return true; // Preferences step
//       default:
//         return false;
//     }
//   };
//
//   const renderStepContent = () => {
//     switch (currentStep) {
//       case 1:
//         return renderBasicDetailsStep();
//       case 2:
//         return renderQualificationStep();
//       case 3:
//         return renderFinancialStep();
//       case 4:
//         return renderPreferencesStep();
//       default:
//         return null;
//     }
//   };
//
//   const renderBasicDetailsStep = () => (
//       <div className="space-y-6">
//         <div className="text-center mb-6">
//           <h3 className="text-lg font-semibold mb-2">Basic Program Details</h3>
//           <p className="text-muted-foreground">Tell us about your preferred program</p>
//         </div>
//
//         <div className="space-y-8">
//           {/* Degree Level Cards */}
//           <div className="space-y-3">
//             <Label className="text-base font-medium">Degree Level *</Label>
//             <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
//               {degrees.map(degree => (
//                   <Card
//                       key={degree}
//                       className={`cursor-pointer transition-all hover:shadow-md ${
//                           formData.degree === degree
//                               ? 'ring-2 ring-primary bg-primary/5 border-primary'
//                               : 'hover:border-primary/50'
//                       }`}
//                       onClick={() => setFormData({...formData, degree})}
//                   >
//                     <CardContent className="p-4 text-center">
//                       <div className="font-medium text-sm">{degree}</div>
//                     </CardContent>
//                   </Card>
//               ))}
//             </div>
//           </div>
//
//           {/* Course Cards */}
//           <div className="space-y-3">
//             <Label className="text-base font-medium">Course *</Label>
//             <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
//               {courses.map(course => (
//                   <Card
//                       key={course}
//                       className={`cursor-pointer transition-all hover:shadow-md ${
//                           formData.course === course
//                               ? 'ring-2 ring-primary bg-primary/5 border-primary'
//                               : 'hover:border-primary/50'
//                       }`}
//                       onClick={() => setFormData({...formData, course})}
//                   >
//                     <CardContent className="p-4 text-center">
//                       <div className="font-medium text-sm">{course}</div>
//                     </CardContent>
//                   </Card>
//               ))}
//             </div>
//           </div>
//
//           {/* Specialization Cards */}
//           <div className="space-y-3">
//             <Label className="text-base font-medium">Specialization</Label>
//             <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
//               {specializations.map(spec => (
//                   <Card
//                       key={spec}
//                       className={`cursor-pointer transition-all hover:shadow-md ${
//                           formData.specialization === spec
//                               ? 'ring-2 ring-primary bg-primary/5 border-primary'
//                               : 'hover:border-primary/50'
//                       }`}
//                       onClick={() => setFormData({...formData, specialization: spec})}
//                   >
//                     <CardContent className="p-4 text-center">
//                       <div className="font-medium text-sm">{spec}</div>
//                     </CardContent>
//                   </Card>
//               ))}
//             </div>
//           </div>
//
//           {/* Currently Working Toggle */}
//           <div className="space-y-3">
//             <Label className="text-base font-medium">Currently Working</Label>
//             <div className="grid grid-cols-2 gap-3 max-w-md">
//               <Card
//                   className={`cursor-pointer transition-all hover:shadow-md ${
//                       formData.currentlyWorking === true
//                           ? 'ring-2 ring-primary bg-primary/5 border-primary'
//                           : 'hover:border-primary/50'
//                   }`}
//                   onClick={() => setFormData({...formData, currentlyWorking: true})}
//               >
//                 <CardContent className="p-4 text-center">
//                   <div className="font-medium text-sm">Yes</div>
//                 </CardContent>
//               </Card>
//               <Card
//                   className={`cursor-pointer transition-all hover:shadow-md ${
//                       formData.currentlyWorking === false
//                           ? 'ring-2 ring-primary bg-primary/5 border-primary'
//                           : 'hover:border-primary/50'
//                   }`}
//                   onClick={() => setFormData({...formData, currentlyWorking: false})}
//               >
//                 <CardContent className="p-4 text-center">
//                   <div className="font-medium text-sm">No</div>
//                 </CardContent>
//               </Card>
//             </div>
//           </div>
//         </div>
//       </div>
//   );
//
//   const renderQualificationStep = () => (
//       <div className="space-y-6">
//         <div className="text-center mb-6">
//           <h3 className="text-lg font-semibold mb-2">Educational Background</h3>
//           <p className="text-muted-foreground">Your qualifications and experience</p>
//         </div>
//
//         <div className="space-y-8">
//           {/* Highest Qualification Cards */}
//           <div className="space-y-3">
//             <Label className="text-base font-medium">Highest Qualification *</Label>
//             <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
//               {qualifications.map(qual => (
//                   <Card
//                       key={qual}
//                       className={`cursor-pointer transition-all hover:shadow-md ${
//                           formData.highestQualification === qual
//                               ? 'ring-2 ring-primary bg-primary/5 border-primary'
//                               : 'hover:border-primary/50'
//                       }`}
//                       onClick={() => setFormData({...formData, highestQualification: qual})}
//                   >
//                     <CardContent className="p-4 text-center">
//                       <div className="font-medium text-sm">{qual}</div>
//                     </CardContent>
//                   </Card>
//               ))}
//             </div>
//           </div>
//
//           {/* Work Experience Input */}
//           <div className="space-y-3 max-w-md">
//             <Label htmlFor="experience" className="text-base font-medium">Work Experience (Years)</Label>
//             <Input
//                 type="number"
//                 min="0"
//                 max="30"
//                 value={formData.workExperience}
//                 onChange={(e) => setFormData({...formData, workExperience: parseInt(e.target.value) || 0})}
//                 className="text-center"
//             />
//           </div>
//
//           {/* Qualification Percentage Slider */}
//           <div className="space-y-4">
//             <Label className="text-base font-medium">Qualification Percentage (%)</Label>
//             <div className="space-y-2">
//               <Slider
//                   value={[formData.qualificationPercentage]}
//                   onValueChange={(value) => setFormData({...formData, qualificationPercentage: value[0]})}
//                   max={100}
//                   min={40}
//                   step={5}
//                   className="w-full"
//               />
//               <div className="flex justify-between text-sm text-muted-foreground">
//                 <span>40%</span>
//                 <span className="font-medium">{formData.qualificationPercentage}%</span>
//                 <span>100%</span>
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>
//   );
//
//   const renderFinancialStep = () => (
//       <div className="space-y-6">
//         <div className="text-center mb-6">
//           <h3 className="text-lg font-semibold mb-2">Financial Planning</h3>
//           <p className="text-muted-foreground">Budget and salary expectations</p>
//         </div>
//
//         <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//           <div className="space-y-4">
//             <Label>Total Fee Budget (₹)</Label>
//             <div className="space-y-2">
//               <Slider
//                   value={[formData.totalFee]}
//                   onValueChange={(value) => setFormData({...formData, totalFee: value[0]})}
//                   max={2000000}
//                   min={50000}
//                   step={50000}
//                   className="w-full"
//               />
//               <div className="flex justify-between text-sm text-muted-foreground">
//                 <span>₹50K</span>
//                 <span className="font-medium">₹{(formData.totalFee / 100000).toFixed(1)}L</span>
//                 <span>₹20L</span>
//               </div>
//             </div>
//           </div>
//
//           <div className="space-y-4">
//             <Label>EMI Duration (Months)</Label>
//             <div className="space-y-2">
//               <Slider
//                   value={[formData.emiMonths]}
//                   onValueChange={(value) => setFormData({...formData, emiMonths: value[0]})}
//                   max={60}
//                   min={6}
//                   step={6}
//                   className="w-full"
//               />
//               <div className="flex justify-between text-sm text-muted-foreground">
//                 <span>6M</span>
//                 <span className="font-medium">{formData.emiMonths} months</span>
//                 <span>60M</span>
//               </div>
//               <div className="flex items-center gap-2 p-2 bg-muted/50 rounded-lg">
//                 <Calculator className="h-4 w-4 text-primary" />
//                 <span className="text-sm font-medium">EMI: ₹{calculateEMI().toLocaleString()}</span>
//               </div>
//             </div>
//           </div>
//
//           <div className="space-y-4 md:col-span-2">
//             <Label>Expected Salary Package (₹/year)</Label>
//             <div className="space-y-2">
//               <Slider
//                   value={[formData.expectedSalary]}
//                   onValueChange={(value) => setFormData({...formData, expectedSalary: value[0]})}
//                   max={5000000}
//                   min={300000}
//                   step={100000}
//                   className="w-full"
//               />
//               <div className="flex justify-between text-sm text-muted-foreground">
//                 <span>₹3L</span>
//                 <span className="font-medium">₹{(formData.expectedSalary / 100000).toFixed(1)}L</span>
//                 <span>₹50L</span>
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>
//   );
//
//   const renderPreferencesStep = () => (
//       <div className="space-y-6">
//         <div className="text-center mb-6">
//           <h3 className="text-lg font-semibold mb-2">Learning Preferences</h3>
//           <p className="text-muted-foreground">What matters most to you?</p>
//         </div>
//
//         <div className="space-y-6">
//           <div className="space-y-4">
//             <Label>Importance of University Networking Opportunities</Label>
//             <div className="space-y-2">
//               <Slider
//                   value={[formData.networkingImportance]}
//                   onValueChange={(value) => setFormData({...formData, networkingImportance: value[0]})}
//                   max={10}
//                   min={1}
//                   step={1}
//                   className="w-full"
//               />
//               <div className="flex justify-between text-sm text-muted-foreground">
//                 <span>Not Important</span>
//                 <span className="font-medium">{formData.networkingImportance}/10</span>
//                 <span>Very Important</span>
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>
//   );
//
//   return (
//       <div className="max-w-4xl mx-auto">
//         <Card className="shadow-lg border-0 bg-gradient-to-br from-card via-card to-muted/20">
//           <CardHeader className="pb-4">
//             <div className="flex items-center justify-between">
//               <CardTitle className="flex items-center gap-2">
//                 <Sparkles className="h-5 w-5 text-primary" />
//                 AI Program Recommendation
//               </CardTitle>
//               <div className="text-sm text-muted-foreground">
//                 Step {currentStep} of {totalSteps}
//               </div>
//             </div>
//
//             {/* Progress Bar */}
//             <div className="space-y-2">
//               <Progress value={progress} className="h-2" />
//               <div className="flex justify-between text-xs text-muted-foreground">
//                 <span>Basic Details</span>
//                 <span>Qualifications</span>
//                 <span>Financial</span>
//                 <span>Preferences</span>
//               </div>
//             </div>
//           </CardHeader>
//
//           <CardContent className="pt-0">
//             <form onSubmit={handleSubmit} className="space-y-8">
//               {/* Step Content */}
//               <div className="min-h-[400px]">
//                 {renderStepContent()}
//               </div>
//
//               {/* Navigation Buttons */}
//               <div className="flex justify-between pt-6 border-t">
//                 <Button
//                     type="button"
//                     variant="outline"
//                     onClick={handlePrevious}
//                     disabled={currentStep === 1}
//                     className="flex items-center gap-2"
//                 >
//                   <ChevronLeft className="h-4 w-4" />
//                   Previous
//                 </Button>
//
//                 {currentStep === totalSteps ? (
//                     <Button
//                         type="submit"
//                         disabled={isLoading || !isStepValid()}
//                         className="flex items-center gap-2 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70"
//                     >
//                       {isLoading ? (
//                           <>
//                             <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
//                             Analyzing...
//                           </>
//                       ) : (
//                           <>
//                             <Sparkles className="h-4 w-4" />
//                             Get Recommendations
//                           </>
//                       )}
//                     </Button>
//                 ) : (
//                     <Button
//                         type="button"
//                         onClick={handleNext}
//                         disabled={!isStepValid()}
//                         className="flex items-center gap-2"
//                     >
//                       Next
//                       <ChevronRight className="h-4 w-4" />
//                     </Button>
//                 )}
//               </div>
//             </form>
//           </CardContent>
//         </Card>
//       </div>
//   );
// };
//
// export default ComparisonForm;


import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Progress } from '@/components/ui/progress';
import { Calculator, Sparkles, ChevronLeft, ChevronRight } from 'lucide-react';

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

interface ComparisonFormProps {
  onSubmit: (data: ComparisonFormData) => void;
  isLoading: boolean;
}

const ComparisonForm: React.FC<ComparisonFormProps> = ({ onSubmit, isLoading }) => {
  const [currentStep, setCurrentStep] = React.useState(1);
  const [formData, setFormData] = React.useState<ComparisonFormData>({
    degree: '',
    course: '',
    specialization: '',
    currentlyWorking: false,
    totalFee: 500000,
    emiMonths: 12,
    expectedSalary: 800000,
    highestQualification: '',
    qualificationPercentage: 70,
    workExperience: 0,
    networkingImportance: 5
  });

  const totalSteps = 7; // Increased for more granular steps
  const progress = (currentStep / totalSteps) * 100;

  const degrees = ['Bachelor', 'Master', 'Diploma', 'Certificate', 'PhD'];
  const courses = ['MBA', 'BBA', 'Engineering', 'Computer Science', 'Management', 'Finance', 'Marketing', 'Data Science', 'AI/ML'];
  const specializations = ['General Management', 'Finance', 'Marketing', 'HR', 'Operations', 'Technology', 'Healthcare', 'International Business'];
  const qualifications = ['10th', '12th', 'Diploma', 'Bachelor\'s', 'Master\'s', 'PhD'];

  const calculateEMI = () => {
    const principal = formData.totalFee;
    const rate = 12 / 100 / 12; // 12% annual rate
    const months = formData.emiMonths;
    const emi = (principal * rate * Math.pow(1 + rate, months)) / (Math.pow(1 + rate, months) - 1);
    return Math.round(emi);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const handleNext = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const isStepValid = () => {
    switch (currentStep) {
      case 1:
        return formData.degree !== '';
      case 2:
        return formData.course !== '';
      case 3:
        return true; // Specialization is optional
      case 4:
        return true; // Working status has default
      case 5:
        return formData.highestQualification !== '';
      case 6:
        return true; // Financial details have default values
      case 7:
        return true; // Preferences step
      default:
        return false;
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return renderDegreeStep();
      case 2:
        return renderCourseStep();
      case 3:
        return renderSpecializationStep();
      case 4:
        return renderWorkingStatusStep();
      case 5:
        return renderQualificationStep();
      case 6:
        return renderFinancialStep();
      case 7:
        return renderPreferencesStep();
      default:
        return null;
    }
  };

  const renderDegreeStep = () => (
      <div className="space-y-6">
        <div className="text-center mb-8">
          <h3 className="text-2xl font-bold mb-2 bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">Choose Your Degree Level</h3>
          <p className="text-muted-foreground">Select the type of program you're interested in</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {degrees.map(degree => (
              <Card
                  key={degree}
                  className={`cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-lg ${
                      formData.degree === degree
                          ? 'ring-2 ring-primary bg-gradient-to-br from-primary/10 to-primary/5 border-primary shadow-md scale-105'
                          : 'hover:border-primary/50 bg-gradient-to-br from-card to-muted/10'
                  }`}
                  onClick={() => setFormData({...formData, degree})}
              >
                <CardContent className="p-6 text-center">
                  <div className="font-semibold text-lg">{degree}</div>
                  {formData.degree === degree && (
                      <div className="mt-2 text-xs text-primary font-medium">✓ Selected</div>
                  )}
                </CardContent>
              </Card>
          ))}
        </div>
      </div>
  );

  const renderCourseStep = () => (
      <div className="space-y-6">
        <div className="text-center mb-8">
          <h3 className="text-2xl font-bold mb-2 bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">Select Your Course</h3>
          <p className="text-muted-foreground">Pick the course that aligns with your career goals</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {courses.map(course => (
              <Card
                  key={course}
                  className={`cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-lg ${
                      formData.course === course
                          ? 'ring-2 ring-primary bg-gradient-to-br from-primary/10 to-primary/5 border-primary shadow-md scale-105'
                          : 'hover:border-primary/50 bg-gradient-to-br from-card to-muted/10'
                  }`}
                  onClick={() => setFormData({...formData, course})}
              >
                <CardContent className="p-6 text-center">
                  <div className="font-semibold text-lg">{course}</div>
                  {formData.course === course && (
                      <div className="mt-2 text-xs text-primary font-medium">✓ Selected</div>
                  )}
                </CardContent>
              </Card>
          ))}
        </div>
      </div>
  );

  const renderSpecializationStep = () => (
      <div className="space-y-6">
        <div className="text-center mb-8">
          <h3 className="text-2xl font-bold mb-2 bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">Choose Specialization</h3>
          <p className="text-muted-foreground">Focus on your area of interest (Optional)</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {specializations.map(spec => (
              <Card
                  key={spec}
                  className={`cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-lg ${
                      formData.specialization === spec
                          ? 'ring-2 ring-primary bg-gradient-to-br from-primary/10 to-primary/5 border-primary shadow-md scale-105'
                          : 'hover:border-primary/50 bg-gradient-to-br from-card to-muted/10'
                  }`}
                  onClick={() => setFormData({...formData, specialization: spec})}
              >
                <CardContent className="p-6 text-center">
                  <div className="font-semibold text-lg">{spec}</div>
                  {formData.specialization === spec && (
                      <div className="mt-2 text-xs text-primary font-medium">✓ Selected</div>
                  )}
                </CardContent>
              </Card>
          ))}
        </div>
      </div>
  );

  const renderWorkingStatusStep = () => (
      <div className="space-y-6">
        <div className="text-center mb-8">
          <h3 className="text-2xl font-bold mb-2 bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">Current Employment Status</h3>
          <p className="text-muted-foreground">Are you currently working?</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-md mx-auto">
          <Card
              className={`cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-lg ${
                  formData.currentlyWorking === true
                      ? 'ring-2 ring-primary bg-gradient-to-br from-primary/10 to-primary/5 border-primary shadow-md scale-105'
                      : 'hover:border-primary/50 bg-gradient-to-br from-card to-muted/10'
              }`}
              onClick={() => setFormData({...formData, currentlyWorking: true})}
          >
            <CardContent className="p-8 text-center">
              <div className="text-4xl mb-4">💼</div>
              <div className="font-semibold text-lg">Yes, I'm working</div>
              {formData.currentlyWorking === true && (
                  <div className="mt-2 text-xs text-primary font-medium">✓ Selected</div>
              )}
            </CardContent>
          </Card>
          <Card
              className={`cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-lg ${
                  formData.currentlyWorking === false
                      ? 'ring-2 ring-primary bg-gradient-to-br from-primary/10 to-primary/5 border-primary shadow-md scale-105'
                      : 'hover:border-primary/50 bg-gradient-to-br from-card to-muted/10'
              }`}
              onClick={() => setFormData({...formData, currentlyWorking: false})}
          >
            <CardContent className="p-8 text-center">
              <div className="text-4xl mb-4">🎓</div>
              <div className="font-semibold text-lg">No, I'm a student</div>
              {formData.currentlyWorking === false && (
                  <div className="mt-2 text-xs text-primary font-medium">✓ Selected</div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
  );

  const renderQualificationStep = () => (
      <div className="space-y-6">
        <div className="text-center mb-8">
          <h3 className="text-2xl font-bold mb-2 bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">Educational Background</h3>
          <p className="text-muted-foreground">Your qualifications and experience</p>
        </div>

        <div className="space-y-8">
          {/* Highest Qualification Cards */}
          <div className="space-y-3">
            <Label className="text-base font-medium">Highest Qualification *</Label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {qualifications.map(qual => (
                  <Card
                      key={qual}
                      className={`cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-lg ${
                          formData.highestQualification === qual
                              ? 'ring-2 ring-primary bg-gradient-to-br from-primary/10 to-primary/5 border-primary shadow-md scale-105'
                              : 'hover:border-primary/50 bg-gradient-to-br from-card to-muted/10'
                      }`}
                      onClick={() => setFormData({...formData, highestQualification: qual})}
                  >
                    <CardContent className="p-6 text-center">
                      <div className="font-semibold text-lg">{qual}</div>
                      {formData.highestQualification === qual && (
                          <div className="mt-2 text-xs text-primary font-medium">✓ Selected</div>
                      )}
                    </CardContent>
                  </Card>
              ))}
            </div>
          </div>

          {/* Work Experience Input */}
          <div className="space-y-3 max-w-md mx-auto">
            <Label htmlFor="experience" className="text-base font-medium">Work Experience (Years)</Label>
            <Input
                type="number"
                min="0"
                max="30"
                value={formData.workExperience}
                onChange={(e) => setFormData({...formData, workExperience: parseInt(e.target.value) || 0})}
                className="text-center text-lg p-4"
            />
          </div>

          {/* Qualification Percentage Slider */}
          <div className="space-y-4 max-w-md mx-auto">
            <Label className="text-base font-medium">Qualification Percentage (%)</Label>
            <div className="space-y-2">
              <Slider
                  value={[formData.qualificationPercentage]}
                  onValueChange={(value) => setFormData({...formData, qualificationPercentage: value[0]})}
                  max={100}
                  min={40}
                  step={5}
                  className="w-full"
              />
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>40%</span>
                <span className="font-medium text-lg text-primary">{formData.qualificationPercentage}%</span>
                <span>100%</span>
              </div>
            </div>
          </div>
        </div>
      </div>
  );

  const renderFinancialStep = () => (
      <div className="space-y-6">
        <div className="text-center mb-6">
          <h3 className="text-lg font-semibold mb-2">Financial Planning</h3>
          <p className="text-muted-foreground">Budget and salary expectations</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <Label>Total Fee Budget (₹)</Label>
            <div className="space-y-2">
              <Slider
                  value={[formData.totalFee]}
                  onValueChange={(value) => setFormData({...formData, totalFee: value[0]})}
                  max={2000000}
                  min={50000}
                  step={50000}
                  className="w-full"
              />
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>₹50K</span>
                <span className="font-medium">₹{(formData.totalFee / 100000).toFixed(1)}L</span>
                <span>₹20L</span>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <Label>EMI Duration (Months)</Label>
            <div className="space-y-2">
              <Slider
                  value={[formData.emiMonths]}
                  onValueChange={(value) => setFormData({...formData, emiMonths: value[0]})}
                  max={60}
                  min={6}
                  step={6}
                  className="w-full"
              />
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>6M</span>
                <span className="font-medium">{formData.emiMonths} months</span>
                <span>60M</span>
              </div>
              <div className="flex items-center gap-2 p-2 bg-muted/50 rounded-lg">
                <Calculator className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium">EMI: ₹{calculateEMI().toLocaleString()}</span>
              </div>
            </div>
          </div>

          <div className="space-y-4 md:col-span-2">
            <Label>Expected Salary Package (₹/year)</Label>
            <div className="space-y-2">
              <Slider
                  value={[formData.expectedSalary]}
                  onValueChange={(value) => setFormData({...formData, expectedSalary: value[0]})}
                  max={5000000}
                  min={300000}
                  step={100000}
                  className="w-full"
              />
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>₹3L</span>
                <span className="font-medium">₹{(formData.expectedSalary / 100000).toFixed(1)}L</span>
                <span>₹50L</span>
              </div>
            </div>
          </div>
        </div>
      </div>
  );

  const renderPreferencesStep = () => (
      <div className="space-y-6">
        <div className="text-center mb-6">
          <h3 className="text-lg font-semibold mb-2">Learning Preferences</h3>
          <p className="text-muted-foreground">What matters most to you?</p>
        </div>

        <div className="space-y-6">
          <div className="space-y-4">
            <Label>Importance of University Networking Opportunities</Label>
            <div className="space-y-2">
              <Slider
                  value={[formData.networkingImportance]}
                  onValueChange={(value) => setFormData({...formData, networkingImportance: value[0]})}
                  max={10}
                  min={1}
                  step={1}
                  className="w-full"
              />
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>Not Important</span>
                <span className="font-medium">{formData.networkingImportance}/10</span>
                <span>Very Important</span>
              </div>
            </div>
          </div>
        </div>
      </div>
  );

  return (
      <div className="max-w-4xl mx-auto">
        <Card className="shadow-lg border-0 bg-gradient-to-br from-card via-card to-muted/20">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-primary" />
                AI Program Recommendation
              </CardTitle>
              <div className="text-sm text-muted-foreground">
                Step {currentStep} of {totalSteps}
              </div>
            </div>

            {/* Progress Bar */}
            <div className="space-y-2">
              <Progress value={progress} className="h-2" />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Degree</span>
                <span>Course</span>
                <span>Specialization</span>
                <span>Status</span>
                <span>Education</span>
                <span>Budget</span>
                <span>Preferences</span>
              </div>
            </div>
          </CardHeader>

          <CardContent className="pt-0">
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Step Content */}
              <div className="min-h-[400px]">
                {renderStepContent()}
              </div>

              {/* Navigation Buttons */}
              <div className="flex justify-between pt-6 border-t">
                <Button
                    type="button"
                    variant="outline"
                    onClick={handlePrevious}
                    disabled={currentStep === 1}
                    className="flex items-center gap-2"
                >
                  <ChevronLeft className="h-4 w-4" />
                  Previous
                </Button>

                {currentStep === totalSteps ? (
                    <Button
                        type="submit"
                        disabled={isLoading || !isStepValid()}
                        className="flex items-center gap-2 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70"
                    >
                      {isLoading ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                            Analyzing...
                          </>
                      ) : (
                          <>
                            <Sparkles className="h-4 w-4" />
                            Get Recommendations
                          </>
                      )}
                    </Button>
                ) : (
                    <Button
                        type="button"
                        onClick={handleNext}
                        disabled={!isStepValid()}
                        className="flex items-center gap-2"
                    >
                      Next
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                )}
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
  );
};

export default ComparisonForm;