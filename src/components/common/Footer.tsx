
import React from 'react';
import { Link } from 'react-router-dom';
import { GraduationCap, Mail, Phone, MapPin } from 'lucide-react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="col-span-1 lg:col-span-2">
            <Link to="/" className="flex items-center space-x-2 mb-4">
              <GraduationCap className="h-8 w-8 text-edu-primary" />
              <span className="text-xl font-bold">EduPlatform</span>
            </Link>
            <p className="text-gray-300 mb-4 max-w-md">
              Your trusted platform for UGC-approved online degree programs. 
              Empowering professionals to advance their careers through quality education.
            </p>
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Mail className="h-4 w-4 text-edu-primary" />
                <span className="text-sm">info@eduplatform.com</span>
              </div>
              <div className="flex items-center space-x-2">
                <Phone className="h-4 w-4 text-edu-primary" />
                <span className="text-sm">+91 1234567890</span>
              </div>
              <div className="flex items-center space-x-2">
                <MapPin className="h-4 w-4 text-edu-primary" />
                <span className="text-sm">New Delhi, India</span>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li><Link to="/" className="text-gray-300 hover:text-white transition-colors">Home</Link></li>
              <li><Link to="/universities" className="text-gray-300 hover:text-white transition-colors">Universities</Link></li>
              <li><Link to="/programs" className="text-gray-300 hover:text-white transition-colors">Programs</Link></li>
            </ul>
          </div>

          {/* Program Categories */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Programs</h3>
            <ul className="space-y-2">
              <li><span className="text-gray-300">MBA Programs</span></li>
              <li><span className="text-gray-300">BBA Programs</span></li>
              <li><span className="text-gray-300">PG Diplomas</span></li>
              <li><span className="text-gray-300">Certificate Courses</span></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8 text-center">
          <p className="text-gray-400 text-sm">
            © 2024 EduPlatform. All rights reserved. | <Link to="/privacy-policy" className="hover:text-white transition-colors">Privacy
            Policy</Link> | Terms of Service
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
