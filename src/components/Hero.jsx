import React from 'react';
import { Link } from 'react-router-dom';
import { Search, Play, Award, Users } from 'lucide-react';

const Hero = () => {
  return (
    <div className="bg-gradient-to-br from-white to-orange-50 py-16">
      <div className="container mx-auto px-6 flex flex-col lg:flex-row items-center">
        {/* Left Side Content */}
        <div className="lg:w-1/2 flex flex-col items-start space-y-6">
          <div className="bg-orange-100 text-orange-600 px-4 py-1 rounded-full font-medium text-sm">
            #1 Learning Platform
          </div>
          
          <h1 className="text-4xl md:text-5xl font-bold text-gray-800 leading-tight">
            Unlock Your Potential with <span className="text-orange-500">Online Learning</span>
          </h1>
          
          <p className="text-gray-600 text-lg">
            Access over 10,000 courses taught by industry experts and transform your career. Learn at your own pace, anytime, anywhere.
          </p>
          
          {/* Search Bar */}
          <div className="w-full relative mt-4">
            <input
              type="text"
              placeholder="What do you want to learn today?"
              className="w-full py-4 pl-12 pr-4 text-gray-700 bg-white rounded-xl shadow-md focus:outline-none focus:ring-2 focus:ring-orange-300"
            />
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <button className="absolute right-3 top-1/2 transform -translate-y-1/2 bg-gradient-to-r from-orange-400 to-orange-500 text-white px-4 py-2 rounded-lg hover:from-orange-500 hover:to-orange-600 transition-colors">
              Search
            </button>
          </div>
          
          {/* Stats */}
          <div className="flex flex-wrap mt-6 w-full justify-between">
            <div className="mr-8 mb-4">
              <p className="text-2xl font-bold text-gray-800">10K+</p>
              <p className="text-sm text-gray-600">Online Courses</p>
            </div>
            <div className="mr-8 mb-4">
              <p className="text-2xl font-bold text-gray-800">200+</p>
              <p className="text-sm text-gray-600">Expert Instructors</p>
            </div>
            <div className="mb-4">
              <p className="text-2xl font-bold text-gray-800">50K+</p>
              <p className="text-sm text-gray-600">Active Students</p>
            </div>
          </div>
          
          {/* CTA Buttons */}
          <div className="flex flex-wrap gap-4 mt-2">
            <Link to="/courses" className="bg-gradient-to-r from-orange-400 to-orange-500 text-white px-6 py-3 rounded-xl font-medium hover:from-orange-500 hover:to-orange-600 transition-colors shadow-md">
              Explore Courses
            </Link>
            <button className="flex items-center bg-white px-6 py-3 rounded-xl font-medium text-gray-700 hover:bg-gray-50 transition-colors shadow-md">
              <Play className="h-5 w-5 text-orange-500 mr-2" />
              Watch Demo
            </button>
          </div>
        </div>
        
        {/* Right Side Image */}
        <div className="lg:w-1/2 mt-12 lg:mt-0 flex justify-center">
          <div className="relative">
            <div className="absolute -top-6 -left-6 bg-orange-100 p-4 rounded-lg shadow-md">
              <Award className="h-8 w-8 text-orange-500" />
              <p className="font-bold text-gray-800 mt-1">Certified</p>
              <p className="text-xs text-gray-600">All Courses</p>
            </div>
            
            <div className="absolute -bottom-6 -right-6 bg-orange-100 p-4 rounded-lg shadow-md">
              <Users className="h-8 w-8 text-orange-500" />
              <p className="font-bold text-gray-800 mt-1">Community</p>
              <p className="text-xs text-gray-600">Join Today</p>
            </div>
            
            <img 
              src="https://ofy.org/wp-content/uploads/2015/11/OFY-learning-to-learn-cover-photo.jpg"
              alt="Student learning online"
              className="rounded-2xl shadow-xl w-full max-w-md"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Hero;