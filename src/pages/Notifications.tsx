
import React, { useEffect, useState } from 'react';
import { Bell, Calendar, Clock, MapPin, Filter, Search, GraduationCap, BookOpen, ExternalLink } from 'lucide-react';
import Header from '../components/common/Header';
import Footer from '../components/common/Footer';
import { useContent } from '@/contexts/ContentContext';

interface Event {
  id: string;
  title: string;
  description: string;
  eventDate: string;
  eventTime: string;
  location: string;
  eventType: 'webinar' | 'workshop' | 'seminar' | 'admission' | 'exam' | 'joining' | 'other';
  image?: string;
  registrationLink?: string;
  isActive: boolean;
  priority: 'high' | 'medium' | 'low';
}

const Notifications: React.FC = () => {
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const {events, fetchEvents} = useContent();

  useEffect(() => {
    fetchEvents({limit: 20, force: false});
  }, [])

  const getEventTypeColor = (type: string) => {
    const colors = {
      webinar: 'bg-blue-100 text-blue-800 border-blue-200',
      workshop: 'bg-green-100 text-green-800 border-green-200',
      seminar: 'bg-purple-100 text-purple-800 border-purple-200',
      admission: 'bg-orange-100 text-orange-800 border-orange-200',
      exam: 'bg-red-100 text-red-800 border-red-200',
      joining: 'bg-cyan-100 text-cyan-800 border-cyan-200',
      other: 'bg-gray-100 text-gray-800 border-gray-200'
    };
    return colors[type as keyof typeof colors] || colors.other;
  };

  const getPriorityColor = (priority: string) => {
    const colors = {
      high: 'bg-red-500',
      medium: 'bg-yellow-500',
      low: 'bg-green-500'
    };
    return colors[priority as keyof typeof colors] || colors.low;
  };

  const getEventIcon = (type: string) => {
    switch (type) {
      case 'exam':
        return <BookOpen className="h-4 w-4" />;
      case 'joining':
        return <GraduationCap className="h-4 w-4" />;
      case 'admission':
        return <Calendar className="h-4 w-4" />;
      default:
        return <Bell className="h-4 w-4" />;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      weekday: 'long',
      month: 'long', 
      day: 'numeric',
      year: 'numeric'
    });
  };

  const formatTime = (timeString: string) => {
    return new Date(`2000-01-01T${timeString}`).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  const isEventSoon = (eventDate: string, eventTime: string) => {
    const eventDateTime = new Date(`${eventDate}T${eventTime}`);
    const now = new Date();
    const diffInHours = (eventDateTime.getTime() - now.getTime()) / (1000 * 60 * 60);
    return diffInHours <= 72 && diffInHours > 0;
  };

  const filteredNotifications = events.filter(notification => {
    const matchesFilter = selectedFilter === 'all' || notification.event_type === selectedFilter;
    const matchesSearch = notification.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         notification.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch && notification.is_active;
  });

  const eventTypes = [
    { value: 'all', label: 'All Notifications' },
    { value: 'exam', label: 'Exams' },
    { value: 'admission', label: 'Admissions' },
    { value: 'joining', label: 'University Joining' },
    { value: 'webinar', label: 'Webinars' },
    { value: 'workshop', label: 'Workshops' },
    { value: 'seminar', label: 'Seminars' }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Notifications & Events</h1>
          <p className="text-gray-600">Stay updated with the latest university events, exams, and important announcements</p>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search notifications..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex items-center space-x-2">
              <Filter className="h-4 w-4 text-gray-400" />
              <select
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={selectedFilter}
                onChange={(e) => setSelectedFilter(e.target.value)}
              >
                {eventTypes.map(type => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Notifications List */}
        <div className="space-y-4">
          {events.map((notification) => (
            <div key={notification.id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              <div className="p-6">
                <div className="flex items-start space-x-4">
                  {/* Priority Indicator */}
                  <div className={`w-1 h-16 rounded-full ${getPriorityColor(notification.event_type)} flex-shrink-0`} />
                  
                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-3">
                        <div className={`p-2 rounded-lg ${getEventTypeColor(notification.event_type).split(' ')[0]} ${getEventTypeColor(notification.event_type).split(' ')[1]}`}>
                          {getEventIcon(notification.event_type)}
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">{notification.title}</h3>
                          <div className="flex items-center space-x-4 mt-1 text-sm text-gray-500">
                            <div className="flex items-center space-x-1">
                              <Calendar className="h-3 w-3" />
                              <span>{formatDate(notification.event_date)}</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <Clock className="h-3 w-3" />
                              <span>{formatTime(notification.event_time)}</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <MapPin className="h-3 w-3" />
                              <span>{notification.location}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-3">
                        {isEventSoon(notification.event_date, notification.event_time) && (
                          <span className="px-2 py-1 bg-red-100 text-red-800 text-xs font-medium rounded-full">
                            Urgent
                          </span>
                        )}
                        <span className={`px-3 py-1 text-xs font-medium rounded-full border ${getEventTypeColor(notification.event_type)}`}>
                          {notification.event_type}
                        </span>
                      </div>
                    </div>
                    
                    <p className="text-gray-600 mt-3">{notification.description}</p>

                    {notification.registration_link && (
                      <div className="mt-4">
                        <a
                          href={notification.registration_link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                        >
                          <span>Register Now</span>
                          <ExternalLink className="h-4 w-4" />
                        </a>
                      </div>
                    )}
                  </div>
                  
                  {/* Image */}
                  {notification.image && (
                    <img
                      src={notification.image}
                      alt={notification.title}
                      className="w-24 h-24 object-cover rounded-lg flex-shrink-0"
                    />
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredNotifications.length === 0 && (
          <div className="text-center py-12">
            <Bell className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No notifications found</h3>
            <p className="text-gray-500">Try adjusting your search or filter criteria</p>
          </div>
        )}
      </main>
      
      <Footer />
    </div>
  );
};

export default Notifications;
