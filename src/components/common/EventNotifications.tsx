
import React, { useState, useEffect } from 'react';
import { Bell, Calendar, Clock, MapPin, X, ExternalLink, GraduationCap, BookOpen } from 'lucide-react';

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
}

const EventNotifications: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [hasNewEvents, setHasNewEvents] = useState(true);
  
  // Mock upcoming events with new types
  const upcomingEvents: Event[] = [
    {
      id: '1',
      title: 'MBA Admission Webinar 2024',
      description: 'Learn about MBA programs and admission process',
      eventDate: '2024-12-25',
      eventTime: '18:00',
      location: 'Online',
      eventType: 'webinar',
      image: 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=400&h=200&fit=crop',
      registrationLink: 'https://example.com/register',
      isActive: true
    },
    {
      id: '2',
      title: 'Engineering Entrance Exam',
      description: 'JEE Main 2024 examination',
      eventDate: '2024-12-28',
      eventTime: '09:00',
      location: 'Multiple Centers',
      eventType: 'exam',
      isActive: true
    },
    {
      id: '3',
      title: 'New Student Orientation',
      description: 'Welcome session for newly joined students',
      eventDate: '2024-12-30',
      eventTime: '15:00',
      location: 'University Campus',
      eventType: 'joining',
      isActive: true
    }
  ];

  const getEventTypeColor = (type: string) => {
    const colors = {
      webinar: 'bg-blue-100 text-blue-800',
      workshop: 'bg-green-100 text-green-800',
      seminar: 'bg-purple-100 text-purple-800',
      admission: 'bg-orange-100 text-orange-800',
      exam: 'bg-red-100 text-red-800',
      joining: 'bg-cyan-100 text-cyan-800',
      other: 'bg-gray-100 text-gray-800'
    };
    return colors[type as keyof typeof colors] || colors.other;
  };

  const getEventIcon = (type: string) => {
    switch (type) {
      case 'exam':
        return <BookOpen className="h-3 w-3" />;
      case 'joining':
        return <GraduationCap className="h-3 w-3" />;
      case 'admission':
        return <Calendar className="h-3 w-3" />;
      default:
        return <Calendar className="h-3 w-3" />;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      weekday: 'short',
      month: 'short', 
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
    return diffInHours <= 72 && diffInHours > 0; // Events within 72 hours
  };

  const soonEvents = upcomingEvents.filter(event => 
    isEventSoon(event.eventDate, event.eventTime) && event.isActive
  );

  useEffect(() => {
    setHasNewEvents(soonEvents.length > 0);
  }, [soonEvents.length]);

  if (soonEvents.length === 0) {
    return null;
  }

  return (
    <div className="relative">
      {/* Notification Bell */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
      >
        <Bell className="h-5 w-5" />
        {hasNewEvents && (
          <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-pulse" />
        )}
        {soonEvents.length > 0 && (
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
            {soonEvents.length}
          </span>
        )}
      </button>

      {/* Notifications Dropdown */}
      {isOpen && (
        <>
          {/* Overlay */}
          <div
            className="fixed inset-0 z-30"
            onClick={() => setIsOpen(false)}
          />
          
          {/* Dropdown */}
          <div className="absolute right-0 top-full mt-2 w-96 bg-white rounded-lg shadow-lg border border-gray-200 z-40 max-h-96 overflow-y-auto">
            <div className="p-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-gray-900">Upcoming Events & Notifications</h3>
                <button
                  onClick={() => setIsOpen(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
              <p className="text-sm text-gray-600 mt-1">
                Events happening within 72 hours
              </p>
            </div>

            <div className="divide-y divide-gray-100">
              {soonEvents.map((event) => (
                <div key={event.id} className="p-4 hover:bg-gray-50">
                  <div className="flex items-start space-x-3">
                    {event.image && (
                      <img
                        src={event.image}
                        alt={event.title}
                        className="w-12 h-12 object-cover rounded-lg flex-shrink-0"
                      />
                    )}
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between">
                        <h4 className="font-medium text-gray-900 text-sm line-clamp-2">
                          {event.title}
                        </h4>
                        <span className={`px-2 py-1 text-xs rounded-full ml-2 flex-shrink-0 flex items-center space-x-1 ${getEventTypeColor(event.eventType)}`}>
                          {getEventIcon(event.eventType)}
                          <span>{event.eventType}</span>
                        </span>
                      </div>
                      
                      <p className="text-xs text-gray-600 mt-1 line-clamp-2">
                        {event.description}
                      </p>
                      
                      <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                        <div className="flex items-center space-x-1">
                          <Calendar className="h-3 w-3" />
                          <span>{formatDate(event.eventDate)}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Clock className="h-3 w-3" />
                          <span>{formatTime(event.eventTime)}</span>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-1 mt-1 text-xs text-gray-500">
                        <MapPin className="h-3 w-3" />
                        <span>{event.location}</span>
                      </div>
                      
                      {event.registrationLink && (
                        <a
                          href={event.registrationLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center space-x-1 mt-2 text-xs text-blue-600 hover:text-blue-800"
                        >
                          <span>Register Now</span>
                          <ExternalLink className="h-3 w-3" />
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="p-3 border-t border-gray-200 bg-gray-50">
              <button className="w-full text-center text-sm text-blue-600 hover:text-blue-800 font-medium">
                View All Notifications
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default EventNotifications;
