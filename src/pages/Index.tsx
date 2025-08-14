import { useEffect, useState } from "react";
import Header from '../components/common/Header';
import Footer from '../components/common/Footer';
import HeroSection from '../components/home/HeroSection';
import FeaturedUniversities from '../components/home/FeaturedUniversities';
import ProgramCategories from '../components/home/ProgramCategories';
import TestimonialsSection from '../components/home/TestimonialsSection';
import TopRecruitersSection from '../components/home/TopRecruitersSection';
import LoadingScreen from "@/components/common/loading-screen.tsx";
import { useContent } from "@/contexts/ContentContext.tsx";

const Index = () => {
    const { fetchMultiple } = useContent();
    const [isFirstLoad, setIsFirstLoad] = useState(true);

    useEffect(() => {
        const loadData = async () => {
            await fetchMultiple([
                "universities",
                "programs",
                "testimonials",
                "topRecruiters",
                "heroCarousel"
            ]);
            setIsFirstLoad(false); // only after initial load completes
        };
        loadData();
    }, [fetchMultiple]);

    if (isFirstLoad) {
        return <LoadingScreen />;
    }

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
