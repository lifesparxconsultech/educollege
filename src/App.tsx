import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";

// Public Pages
import Index from "./pages/Index";
import Universities from "./pages/Universities";
import Programs from "./pages/Programs";
import ProgramDetail from "./pages/ProgramDetail";
import Notifications from "./pages/Notifications";
import NotFound from "./pages/NotFound";
import Blog from "@/pages/Blog.tsx";
import Compare from "@/pages/Compare.tsx";
import Signup from "./pages/admin/Signup";
import PrivacyPolicy from "@/pages/PrivacyPolicy.tsx";
import BlogDetail from "@/pages/BlogDetail.tsx";

// Admin Pages
import AdminLogin from "./pages/admin/AdminLogin";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminUniversity from "./pages/admin/university/admin-university/admin-university.tsx";
import AdminPrograms from "./pages/admin/program/admin-program/admin-program.tsx";
import AdminTestimonials from "./pages/admin/testimonials/admin-testimonials/admin-testimonials.tsx";
import AdminEvents from "./pages/admin/events/admin-event/admin-event.tsx";
import AdminLeads from "./pages/admin/lead/admin-lead/admin-lead.tsx";
import AdminHero from "./pages/admin/hero/admin-hero/admin-hero.tsx";
import AdminRecruiters from "./pages/admin/recruiter/admin-recruiter/admin-recruiter.tsx";
import AdminBlog from "./pages/admin/blog/admin-blog/admin-blog.tsx";



const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Index />} />
            <Route path="/universities" element={<Universities />} />
            <Route path="/programs" element={<Programs />} />
            <Route path="/programs/:id" element={<ProgramDetail />} />
            <Route path="/notifications" element={<Notifications />} />
            <Route path='/blogs' element={<Blog />} />
            <Route path='/blogs/:id' element={<BlogDetail />} />
            <Route path='/compare' element={<Compare />} />
            <Route path='/privacy-policy' element={<PrivacyPolicy />} />
            
            {/* Admin Routes */}
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route path="/admin/signup" element={<Signup />} />

            <Route path="/admin/dashboard" element={<AdminDashboard />} />
            <Route path="/admin/universities" element={<AdminUniversity />} />
            <Route path="/admin/programs" element={<AdminPrograms />} />
            <Route path="/admin/testimonials" element={<AdminTestimonials />} />
            <Route path="/admin/leads" element={<AdminLeads />} />
            <Route path="/admin/events" element={<AdminEvents />} />
            <Route path="/admin/recruiters" element={<AdminRecruiters />} />
            <Route path="/admin/hero" element={<AdminHero />} />
            <Route path="/admin/blog" element={<AdminBlog />} />
            
            {/* Catch-all route */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
