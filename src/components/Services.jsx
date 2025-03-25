import React from 'react';
import { Video, BookOpen, Clock, Headphones, Users } from 'lucide-react';

const ServicesCard = ({ icon, title, description }) => {
  return (
    <div className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow border border-gray-100 flex flex-col items-center text-center">
      <div className="bg-orange-100 p-3 rounded-xl mb-4">
        {icon}
      </div>
      <h3 className="text-lg font-bold text-gray-800 mb-2">{title}</h3>
      <p className="text-gray-600">{description}</p>
    </div>
  );
};

const Services = () => {
  const services = [
    {
      icon: <Video className="h-6 w-6 text-orange-500" />,
      title: "Video Lectures",
      description: "High-quality video lectures with expert instructors guiding you through each topic."
    },
    {
      icon: <BookOpen className="h-6 w-6 text-orange-500" />,
      title: "Rich Content",
      description: "Comprehensive study materials, assignments, and projects to reinforce your learning."
    },
    {
      icon: <Clock className="h-6 w-6 text-orange-500" />,
      title: "Learn at Your Pace",
      description: "Flexible learning schedule allows you to progress at your own convenience."
    },
    
    {
      icon: <Headphones className="h-6 w-6 text-orange-500" />,
      title: "24/7 Support",
      description: "Our dedicated support team is always available to help you with any issues."
    },
    {
      icon: <Users className="h-6 w-6 text-orange-500" />,
      title: "Community Learning",
      description: "Join a community of learners to discuss topics and collaborate on projects."
    },
  ];

  return (
    <section className="py-16 bg-gray-50">
      <div className="container mx-auto px-6">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-gray-800 mb-4">Our Services</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            We provide comprehensive learning solutions to help you achieve your goals. 
            Our platform offers various features to enhance your learning experience.
          </p>
        </div>
        
        {/* Services Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {services.map((service, index) => (
            <ServicesCard 
              key={index}
              icon={service.icon}
              title={service.title}
              description={service.description}
            />
          ))}
        </div>
        
        {/* CTA Banner */}
        <div className="mt-16 bg-gradient-to-r from-orange-400 to-orange-500 rounded-xl p-8 shadow-md">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="text-white mb-6 md:mb-0 text-center md:text-left">
              <h3 className="text-2xl font-bold mb-2">Ready to Start Learning?</h3>
              <p className="text-orange-100">Join thousands of students already learning with us.</p>
            </div>
            <button className="bg-white text-orange-500 hover:bg-orange-50 transition-colors px-6 py-3 rounded-lg font-medium shadow-md">
              Get Started Today
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Services;