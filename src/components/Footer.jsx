import React from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, Mail, Phone, MapPin, Facebook, Twitter, Instagram, Linkedin, Youtube } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-gray-300">
      {/* Main Footer */}
      <div className="container mx-auto py-12 px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Company Info */}
          <div>
            <div className="flex items-center mb-4">
              <div className="bg-gradient-to-r from-orange-400 to-orange-500 p-2 rounded-full">
                <BookOpen className="h-6 w-6 text-white" />
              </div>
              <h2 className="ml-2 text-xl font-bold text-white">LearningHub</h2>
            </div>
            <p className="mb-4">
              Empowering individuals through quality education and accessible learning opportunities for everyone, everywhere.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <Facebook className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <Twitter className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <Instagram className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <Linkedin className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <Youtube className="h-5 w-5" />
              </a>
            </div>
          </div>
          
          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-bold text-white mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="hover:text-orange-400 transition-colors">Home</Link>
              </li>
              <li>
                <Link to="/about" className="hover:text-orange-400 transition-colors">About Us</Link>
              </li>
              <li>
                <Link to="/courses" className="hover:text-orange-400 transition-colors">Courses</Link>
              </li>
              <li>
                <Link to="/instructors" className="hover:text-orange-400 transition-colors">Instructors</Link>
              </li>
              <li>
                <Link to="/blog" className="hover:text-orange-400 transition-colors">Blog</Link>
              </li>
              <li>
                <Link to="/contact" className="hover:text-orange-400 transition-colors">Contact Us</Link>
              </li>
            </ul>
          </div>
          
          {/* Course Categories */}
          <div>
            <h3 className="text-lg font-bold text-white mb-4">Course Categories</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/courses/web-development" className="hover:text-orange-400 transition-colors">Web Development</Link>
              </li>
              <li>
                <Link to="/courses/data-science" className="hover:text-orange-400 transition-colors">Data Science</Link>
              </li>
              <li>
                <Link to="/courses/mobile-development" className="hover:text-orange-400 transition-colors">Mobile Development</Link>
              </li>
              <li>
                <Link to="/courses/business" className="hover:text-orange-400 transition-colors">Business</Link>
              </li>
              <li>
                <Link to="/courses/design" className="hover:text-orange-400 transition-colors">Design</Link>
              </li>
              <li>
                <Link to="/courses/marketing" className="hover:text-orange-400 transition-colors">Marketing</Link>
              </li>
            </ul>
          </div>
          
          {/* Contact Information */}
          <div>
            <h3 className="text-lg font-bold text-white mb-4">Contact Us</h3>
            <ul className="space-y-4">
              <li className="flex items-start">
                <MapPin className="h-5 w-5 text-orange-400 mr-3 mt-1 flex-shrink-0" />
                <span>123 Education Street, Learning City, ED 12345, Country</span>
              </li>
              <li className="flex items-center">
                <Phone className="h-5 w-5 text-orange-400 mr-3 flex-shrink-0" />
                <span>+1 (123) 456-7890</span>
              </li>
              <li className="flex items-center">
                <Mail className="h-5 w-5 text-orange-400 mr-3 flex-shrink-0" />
                <span>info@learninghub.com</span>
              </li>
            </ul>
            
            {/* Newsletter Signup */}
            <div className="mt-6">
              <h4 className="text-white font-medium mb-2">Subscribe to Newsletter</h4>
              <div className="flex">
                <input
                  type="email"
                  placeholder="Your email"
                  className="px-4 py-2 rounded-l-lg bg-gray-800 border border-gray-700 focus:outline-none focus:border-orange-400 flex-grow"
                />
                <button className="bg-gradient-to-r from-orange-400 to-orange-500 text-white px-4 py-2 rounded-r-lg hover:from-orange-500 hover:to-orange-600 transition-colors">
                  Join
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Copyright */}
      <div className="bg-gray-950 py-4">
        <div className="container mx-auto px-6 flex flex-col md:flex-row justify-between items-center">
          <div className="text-sm text-gray-500 mb-4 md:mb-0">
            &copy; {new Date().getFullYear()} LearningHub. All rights reserved.
          </div>
          <div className="flex space-x-6">
            <Link to="/terms" className="text-sm text-gray-500 hover:text-orange-400 transition-colors">
              Terms of Service
            </Link>
            <Link to="/privacy" className="text-sm text-gray-500 hover:text-orange-400 transition-colors">
              Privacy Policy
            </Link>
            <Link to="/cookies" className="text-sm text-gray-500 hover:text-orange-400 transition-colors">
              Cookie Policy
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;