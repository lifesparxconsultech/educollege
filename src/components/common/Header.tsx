
import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, GraduationCap } from 'lucide-react';
import EventNotifications from './EventNotifications';
import LeadForm from './LeadForm';

const Header = () => {
  const [isLeadFormOpen, setIsLeadFormOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProgramsOpen, setIsProgramsOpen] = useState(false);
  const location = useLocation();

  const navigation = [
    { name: 'Home', to: '/' },
    {name: 'Programs', to: '/programs',},
    { name: 'Universities', to: '/universities' },
    { name: 'Notifications', to: '/notifications' },
    {name: 'Blogs', to: '/blogs' },
    {name: 'Compare', to: '/compare' },
  ];

  const isActive = (href: string) => {
    if (href === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(href);
  };

  return (
    <>
      <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center space-x-2">
              <GraduationCap className="h-8 w-8 text-edu-primary" />
              <span className="text-xl font-bold text-gray-900">BrowseCampus</span>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-8">
              {navigation.map((item) => (
                <div key={item.name}>
                  {item ? (
                        <Link
                        to={item.to}
                        className={`flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium transition-colors ${isActive(item.to)
                            ? 'text-edu-primary bg-edu-primary/5'
                            : 'text-gray-700 hover:text-edu-primary hover:bg-gray-50'
                          }`}
                      >
                        <span>{item.name}</span>
                      </Link>
                  ) : (
                    <Link
                      to={item.to}
                      className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${isActive(item.to)
                          ? 'text-edu-primary bg-edu-primary/5'
                          : 'text-gray-700 hover:text-edu-primary hover:bg-gray-50'
                        }`}
                    >
                      {item.name}
                    </Link>
                  )}
                </div>
              ))}
            </nav>

            {/* Right side actions */}
            <div className="flex items-center space-x-4">
              {/* Event Notifications */}
              <EventNotifications />
              <button
                onClick={() => setIsLeadFormOpen(true)}
                className="flex-1 btn-primary disabled:opacity-50 disabled:cursor-not-allowed">
                Join Now
              </button>

              {/* Mobile menu button */}
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="md:hidden p-2 rounded-md text-gray-700 hover:text-gray-900 hover:bg-gray-100"
              >
                {isMenuOpen ? (
                  <X className="h-6 w-6" />
                ) : (
                  <Menu className="h-6 w-6" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden border-t border-gray-200 bg-white">
            <div className="px-4 py-3 space-y-3">
              {navigation.map((item) => (
                <div key={item.name}>
                  <Link
                    to={item.to}
                    className={`block px-3 py-2 rounded-md text-base font-medium ${isActive(item.to)
                        ? 'text-edu-primary bg-edu-primary/5'
                        : 'text-gray-700 hover:text-edu-primary hover:bg-gray-50'
                      }`}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {item.name}
                  </Link>
                </div>
              ))}

              <div className="pt-3 border-t border-gray-200">
                <button
                  onClick={() => setIsLeadFormOpen(true)}
                  className="flex-1 btn-primary disabled:opacity-50 disabled:cursor-not-allowed">
                  Join Now
                </button>
              </div>
            </div>
          </div>
        )}
      </header>
      <LeadForm isOpen={isLeadFormOpen} onClose={() => setIsLeadFormOpen(false)} />
    </>
  );
};

export default Header;
