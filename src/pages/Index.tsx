
import Header from '../components/common/Header';
import Footer from '../components/common/Footer';
import HeroSection from '../components/home/HeroSection';
import FeaturedUniversities from '../components/home/FeaturedUniversities';
import ProgramCategories from '../components/home/ProgramCategories';
import TestimonialsSection from '../components/home/TestimonialsSection';
import TopRecruitersSection from '../components/home/TopRecruitersSection';

const Index = () => {
  return (
    <div className="min-h-screen">
      <Header />
      <HeroSection />
      <FeaturedUniversities />
      <ProgramCategories />
      <TopRecruitersSection />
      <TestimonialsSection />
      <Footer />
    </div>
  );
};

export default Index;
