import React, { useEffect, useState } from 'react';
import {
  Users,
  GraduationCap,
  BookOpen,
  TrendingUp,
  MessageSquare,
  UserCheck,
  Calendar,
  Activity,
  Eye,
  Star,
  RefreshCw,
  BarChart3,
  ArrowUpRight,
  ArrowDownRight,
  Clock,
  MapPin,
  Phone,
  Mail
} from 'lucide-react';
import AdminLayout from '../../components/admin/admin-layout.tsx';
import { useContent } from '@/contexts/ContentContext';
import { useNavigate } from 'react-router-dom';

const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const {
    universities,
    programs,
    testimonials,
    leads,
    heroCarousel,
    loading,
    fetchMultiple,
  } = useContent();

  const [dateRange, setDateRange] = useState('30'); // days
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchMultiple(['universities', 'programs', 'testimonials', 'leads', 'heroCarousel']);
  }, []);

  // Calculate dynamic stats
  const stats = [
    {
      name: 'Universities',
      value: universities.length.toString(),
      change: '+12%',
      changeType: 'increase',
      icon: GraduationCap,
      color: 'bg-blue-500',
      trend: 'up',
      description: 'Partner institutions'
    },
    {
      name: 'Programs',
      value: programs.length.toString(),
      change: '+8%',
      changeType: 'increase',
      icon: BookOpen,
      color: 'bg-green-500',
      trend: 'up',
      description: 'Available courses'
    },
    {
      name: 'Active Leads',
      value: leads.filter(lead => ['new', 'contacted', 'qualified'].includes(lead.status)).length.toString(),
      change: '+24%',
      changeType: 'increase',
      icon: Users,
      color: 'bg-purple-500',
      trend: 'up',
      description: 'Potential students'
    },
    {
      name: 'Testimonials',
      value: testimonials.length.toString(),
      change: '+5%',
      changeType: 'increase',
      icon: MessageSquare,
      color: 'bg-orange-500',
      trend: 'up',
      description: 'Student reviews'
    }
  ];

  // Calculate additional metrics
  const conversionRate = leads.length > 0 ? ((leads.filter(l => l.status === 'converted').length / leads.length) * 100).toFixed(1) : '0';
  const avgRating = testimonials.length > 0 ? (testimonials.reduce((acc, t) => acc + t.rating, 0) / testimonials.length).toFixed(1) : '0';
  const activeSlides = heroCarousel.filter(slide => slide.is_active).length;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'new': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'contacted': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'qualified': return 'bg-green-100 text-green-800 border-green-200';
      case 'converted': return 'bg-purple-100 text-purple-800 border-purple-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchMultiple(['universities', 'programs', 'testimonials', 'leads', 'heroCarousel']);
    setRefreshing(false);
  };

  // Get recent leads (last 10)
  const recentLeads = leads
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice(0, 8);

  // Get top performing programs (by lead count)
  const programLeadCounts = leads.reduce((acc, lead) => {
    acc[lead.program] = (acc[lead.program] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const topPrograms = Object.entries(programLeadCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5);

  return (
      <AdminLayout>
        <div className="space-y-6">
          {/* Header Section */}
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl shadow-sm p-6 text-white">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold mb-2">Welcome back, Admin!</h2>
                <p className="text-blue-100">Here's what's happening with your education platform today.</p>
                <div className="flex items-center mt-3 text-sm text-blue-100">
                  <Clock className="h-4 w-4 mr-1" />
                  Last updated: {new Date().toLocaleTimeString()}
                </div>
              </div>
              <div className="flex space-x-3">
                <select
                    value={dateRange}
                    onChange={(e) => setDateRange(e.target.value)}
                    className="bg-white/20 text-white border border-white/30 rounded-lg px-3 py-2 text-sm"
                >
                  <option value="7" className="text-gray-900">Last 7 days</option>
                  <option value="30" className="text-gray-900">Last 30 days</option>
                  <option value="90" className="text-gray-900">Last 90 days</option>
                </select>
                <button
                    onClick={handleRefresh}
                    disabled={refreshing}
                    className="bg-white/20 hover:bg-white/30 border border-white/30 rounded-lg px-4 py-2 text-sm flex items-center space-x-2 transition-colors"
                >
                  <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
                  <span>Refresh</span>
                </button>
              </div>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {stats.map((stat) => {
              const IconComponent = stat.icon;
              const TrendIcon = stat.trend === 'up' ? ArrowUpRight : ArrowDownRight;
              return (
                  <div key={stat.name} className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between mb-4">
                      <div className={`${stat.color} p-3 rounded-lg`}>
                        <IconComponent className="h-6 w-6 text-white" />
                      </div>
                      <span className={`text-sm font-medium px-2 py-1 rounded-full ${
                          stat.trend === 'up' ? 'text-green-700 bg-green-100' : 'text-red-700 bg-red-100'
                      }`}>
                    {stat.change}
                  </span>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-600 mb-1">{stat.name}</p>
                      <p className="text-3xl font-bold text-gray-900 mb-1">{stat.value}</p>
                      <p className="text-xs text-gray-500">{stat.description}</p>
                    </div>
                  </div>
              );
            })}
          </div>

          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="bg-green-100 p-3 rounded-lg">
                  <BarChart3 className="h-6 w-6 text-green-600" />
                </div>
              </div>
              <h4 className="text-sm font-semibold text-gray-900 mb-1">Conversion Rate</h4>
              <p className="text-2xl font-bold text-gray-900 mb-1">{conversionRate}%</p>
              <p className="text-sm text-gray-600">Lead to enrollment</p>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="bg-yellow-100 p-3 rounded-lg">
                  <Star className="h-6 w-6 text-yellow-600" />
                </div>
              </div>
              <h4 className="text-sm font-semibold text-gray-900 mb-1">Avg. Rating</h4>
              <p className="text-2xl font-bold text-gray-900 mb-1">{avgRating}</p>
              <p className="text-sm text-gray-600">Student satisfaction</p>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="bg-blue-100 p-3 rounded-lg">
                  <Eye className="h-6 w-6 text-blue-600" />
                </div>
              </div>
              <h4 className="text-sm font-semibold text-gray-900 mb-1">Active Slides</h4>
              <p className="text-2xl font-bold text-gray-900 mb-1">{activeSlides}</p>
              <p className="text-sm text-gray-600">Hero carousel slides</p>
            </div>
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Recent Leads */}
            <div className="lg:col-span-2 bg-white rounded-xl shadow-sm">
              <div className="p-6 border-b border-gray-200">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-semibold text-gray-900">Recent Leads</h3>
                  <button
                      onClick={() => navigate('/admin/leads')}
                      className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                  >
                    View all
                  </button>
                </div>
              </div>
              <div className="p-6">
                {loading.leads ? (
                    <div className="flex justify-center items-center py-12">
                      <span className="animate-spin h-8 w-8 border-4 border-t-transparent border-blue-600 rounded-full"></span>
                      <span className="ml-4 text-gray-600 font-medium">Loading leads...</span>
                    </div>
                ) : recentLeads.length === 0 ? (
                    <div className="text-center py-12">
                      <Users className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                      <h4 className="text-lg font-medium text-gray-900 mb-2">No leads yet</h4>
                      <p className="text-gray-500">Leads will appear here as they come in.</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                      {recentLeads.map((lead) => (
                          <div key={lead.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                            <div className="flex items-center space-x-4">
                              <div
                                  className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                              <span className="text-white text-sm font-semibold">
                                {(lead.name?.charAt(0) || '?').toUpperCase()}
                              </span>
                              </div>
                              <div>
                                <h4 className="text-sm font-semibold text-gray-900">{lead.name}</h4>
                                <div className="flex items-center space-x-2 text-xs text-gray-600">
                                  <Mail className="h-3 w-3" />
                                  <span>{lead.email}</span>
                                </div>
                                <div className="flex items-center space-x-2 text-xs text-gray-500">
                                  <BookOpen className="h-3 w-3" />
                                  <span>{lead.program}</span>
                                </div>
                              </div>
                            </div>
                            <div className="text-right">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(lead.status)}`}>
                          {lead.status ? lead.status.charAt(0).toUpperCase() + lead.status.slice(1) : 'Unknown'}
                        </span>
                              <p className="text-xs text-gray-500 mt-2">{formatDate(lead.created_at)}</p>
                            </div>
                          </div>
                      ))}
                    </div>
                )}
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Quick Actions */}
              <div className="bg-white rounded-xl shadow-sm">
                <div className="p-6 border-b border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900">Quick Actions</h3>
                </div>
                <div className="p-6 space-y-2">
                  <button
                      className="w-full flex items-center space-x-3 p-3 text-left hover:bg-blue-50 rounded-lg transition-colors group"
                      onClick={() => navigate('/admin/universities')}
                  >
                    <div className="bg-blue-100 group-hover:bg-blue-200 p-2 rounded-lg transition-colors">
                      <GraduationCap className="h-4 w-4 text-blue-600" />
                    </div>
                    <span className="text-sm font-medium text-gray-900">Manage Universities</span>
                  </button>
                  <button
                      className="w-full flex items-center space-x-3 p-3 text-left hover:bg-green-50 rounded-lg transition-colors group"
                      onClick={() => navigate('/admin/programs')}
                  >
                    <div className="bg-green-100 group-hover:bg-green-200 p-2 rounded-lg transition-colors">
                      <BookOpen className="h-4 w-4 text-green-600" />
                    </div>
                    <span className="text-sm font-medium text-gray-900">Manage Programs</span>
                  </button>
                  <button
                      className="w-full flex items-center space-x-3 p-3 text-left hover:bg-orange-50 rounded-lg transition-colors group"
                      onClick={() => navigate('/admin/testimonials')}
                  >
                    <div className="bg-orange-100 group-hover:bg-orange-200 p-2 rounded-lg transition-colors">
                      <MessageSquare className="h-4 w-4 text-orange-600" />
                    </div>
                    <span className="text-sm font-medium text-gray-900">Manage Testimonials</span>
                  </button>
                  <button
                      className="w-full flex items-center space-x-3 p-3 text-left hover:bg-purple-50 rounded-lg transition-colors group"
                      onClick={() => navigate('/admin/hero')}
                  >
                    <div className="bg-purple-100 group-hover:bg-purple-200 p-2 rounded-lg transition-colors">
                      <Eye className="h-4 w-4 text-purple-600" />
                    </div>
                    <span className="text-sm font-medium text-gray-900">Manage Hero Slides</span>
                  </button>
                  <button
                      className="w-full flex items-center space-x-3 p-3 text-left hover:bg-indigo-50 rounded-lg transition-colors group"
                      onClick={() => navigate('/admin/leads')}
                  >
                    <div className="bg-indigo-100 group-hover:bg-indigo-200 p-2 rounded-lg transition-colors">
                      <UserCheck className="h-4 w-4 text-indigo-600" />
                    </div>
                    <span className="text-sm font-medium text-gray-900">Review Leads</span>
                  </button>
                </div>
              </div>

              {/* Top Programs */}
              <div className="bg-white rounded-xl shadow-sm">
                <div className="p-6 border-b border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900">Popular Programs</h3>
                </div>
                <div className="p-6">
                  {topPrograms.length === 0 ? (
                      <p className="text-gray-500 text-sm text-center py-4">No program data available</p>
                  ) : (
                      <div className="space-y-3">
                        {topPrograms.map(([program, count], index) => (
                            <div key={program} className="flex items-center justify-between">
                              <div className="flex items-center space-x-3">
                                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white ${
                                    index === 0 ? 'bg-yellow-500' : index === 1 ? 'bg-gray-400' : index === 2 ? 'bg-orange-500' : 'bg-gray-300'
                                }`}>
                                  {index + 1}
                                </div>
                                <span className="text-sm font-medium text-gray-900 truncate">{program}</span>
                              </div>
                              <span className="text-sm text-gray-600 font-semibold">{count}</span>
                            </div>
                        ))}
                      </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </AdminLayout>
  );
};

export default AdminDashboard;