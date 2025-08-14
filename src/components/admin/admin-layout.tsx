import React, { useCallback, useMemo } from 'react';
import { Link, useLocation, Navigate, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  GraduationCap,
  BookOpen,
  MessageSquare,
  Users,
  LogOut,
  Menu,
  X,
  Calendar,
  Building2,
  FileText,
  Eye,
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import {Button} from "@/components/ui/button.tsx";

interface AdminLayoutProps {
  children: React.ReactNode;
}

const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
  // All hooks must be called before any conditional returns
  const { user, logout, isAuthenticated } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(false);

  // Memoize navigation to prevent unnecessary re-renders
  const navigation = useMemo(() => [
    { name: 'Dashboard', to: '/admin/dashboard', icon: LayoutDashboard, description: 'Overview & analytics' },
    { name: 'Universities', to: '/admin/universities', icon: GraduationCap, description: 'Manage partner institutions' },
    { name: 'Programs', to: '/admin/programs', icon: BookOpen, description: 'Course catalog management' },
    { name: 'Testimonials', to: '/admin/testimonials', icon: MessageSquare, description: 'Student reviews & feedback' },
    { name: 'Leads', to: '/admin/leads', icon: Users, description: 'Student inquiries' },
    { name: 'Events', to: '/admin/events', icon: Calendar, description: 'Webinars & workshops' },
    { name: 'Top Recruiters', to: '/admin/recruiters', icon: Building2, description: 'Partner companies' },
    { name: 'Hero Content', to: '/admin/hero', icon: Eye, description: 'Homepage carousel slides' },
    { name: 'Blog', to: '/admin/blog', icon: FileText, description: 'Content management' },
  ], []);

  // Memoize active check to prevent unnecessary calculations
  const isActive = useCallback((path: string) => location.pathname === path, [location.pathname]);

  // Memoize current page info
  const currentPage = useMemo(() =>
          navigation.find((item) => isActive(item.to)) || { name: 'Admin Panel', description: '' },
      [navigation, isActive]
  );

  const handleLogout = useCallback(() => {
    logout();
  }, [logout]);

  const closeSidebar = useCallback(() => {
    setIsSidebarOpen(false);
  }, []);

  const openSidebar = useCallback(() => {
    setIsSidebarOpen(true);
  }, []);

  // Conditional return after all hooks
  if (!isAuthenticated) {
    return <Navigate to="/admin/login" replace />;
  }

  return (
      <div className="min-h-screen bg-gray-50 flex relative">
        {/* Mobile sidebar overlay */}
        {isSidebarOpen && (
            <div className="fixed inset-0 z-40 lg:hidden">
              <div
                  className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm"
                  onClick={closeSidebar}
              />
            </div>
        )}

        {/* Sidebar - Fixed height with proper flex layout */}
        <div
            className={`fixed inset-y-0 left-0 z-50 w-72 bg-white shadow-xl transform transition-transform duration-300 ease-in-out lg:translate-x-0 flex flex-col ${
                isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
            }`}
        >
          {/* Sidebar Header - Fixed height */}
          <div className="flex items-center justify-between h-16 px-6 border-b border-gray-200 bg-gradient-to-r from-blue-600 to-purple-600 flex-shrink-0">
            <Link to="/admin/dashboard" className="flex items-center space-x-3" onClick={closeSidebar}>
              <div className="bg-white/20 p-2 rounded-lg">
                <GraduationCap className="h-6 w-6 text-white" />
              </div>
              <div>
                <span className="text-lg font-bold text-white">EduAdmin</span>
                <p className="text-xs text-blue-100">Management Panel</p>
              </div>
            </Link>
            <button
                onClick={closeSidebar}
                className="lg:hidden text-white/80 hover:text-white transition-colors"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          {/* Navigation - Scrollable middle section */}
          <nav className="flex-1 px-1 py-4 space-y-1 overflow-y-auto min-h-0">
            {navigation.map((item) => {
              const IconComponent = item.icon;
              const active = isActive(item.to);
              return (
                  <Link
                      key={item.to}
                      to={item.to}
                      className={`group flex items-center px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                          active
                              ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg transform scale-[1.02]'
                              : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900 hover:scale-[1.01]'
                      }`}
                      onClick={closeSidebar}
                  >
                    <div className={`p-1.5 rounded-lg transition-colors flex-shrink-0 ${
                        active ? 'bg-white/20' : 'bg-gray-100 group-hover:bg-gray-200'
                    }`}>
                      <IconComponent className={`h-4 w-4 ${active ? 'text-white' : 'text-gray-600'}`}/>
                    </div>
                    <div className="ml-3 min-w-0 flex-1">
                      <div className={`font-medium truncate ${active ? 'text-white' : 'text-gray-900'}`}>
                        {item.name}
                      </div>
                      <div className={`text-xs truncate ${active ? 'text-blue-100' : 'text-gray-500'}`}>
                        {item.description}
                      </div>
                    </div>
                  </Link>
              );
            })}
            <div className="border-t border-gray-200 p-4 bg-gray-50 flex-shrink-0">
              <div className="flex items-center space-x-3 mb-3">
                <div
                    className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-white text-sm font-semibold">
                {user?.email?.charAt(0).split(1).join(' ')}
              </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {user?.email?.split('@')[0] || 'Admin'}
                  </p>
                  <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                </div>
              </div>

              <div className="space-y-1">
                <button
                    onClick={handleLogout}
                    className="flex items-center w-full px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <LogOut className="mr-3 h-4 w-4 flex-shrink-0"/>
                  <span className="truncate">Sign Out</span>
                </button>
              </div>
            </div>

          </nav>

          {/* User Profile Section - Fixed at bottom */}
        </div>

        {/* Main content */}
        <div className="flex-1 flex flex-col min-h-screen lg:pl-72">
          {/* Enhanced Top bar */}
          <header className="bg-white shadow-sm border-b border-gray-200 flex-shrink-0">
            <div className="flex items-center justify-between h-16 px-6">
              <div className="flex items-center space-x-4 min-w-0 flex-1">
                <button
                    onClick={openSidebar}
                    className="lg:hidden text-gray-500 hover:text-gray-700 transition-colors flex-shrink-0"
                >
                  <Menu className="h-6 w-6"/>
                </button>
                <div className="min-w-0 flex-1">
                  <h1 className="text-xl font-semibold text-gray-900 truncate">
                    {currentPage.name}
                  </h1>
                  {currentPage.description && (
                      <p className="text-sm text-gray-500 truncate">{currentPage.description}</p>
                  )}
                </div>
              </div>

              {/* Header Actions */}
              <div className="flex items-center space-x-4 flex-shrink-0">
                {/* Quick Actions */}
                <div className="hidden md:flex items-center space-x-2">
                  <Button
                      onClick={() => navigate('/admin/hero')}
                  >
                    Quick Edit
                  </Button>
                </div>
              </div>
            </div>
          </header>

          {/* Scrollable content */}
          <main className="flex-1 overflow-y-auto">
            <div className="p-6 max-w-7xl mx-auto">
              {children}
            </div>
          </main>
        </div>
      </div>
  );
};

export default AdminLayout;