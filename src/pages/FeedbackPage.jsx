import React, { useState } from 'react';
import { Star, Send, MessageCircle, ThumbsUp, User, Users, Mail, AlertCircle } from 'lucide-react';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from "../../firebase"
import { useAuth } from '../AuthContext';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

// Feedback form component
const FeedbackForm = () => {
  const { currentUser } = useAuth();
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [feedback, setFeedback] = useState('');
  const [category, setCategory] = useState('');
  const [name, setName] = useState(currentUser?.displayName || '');
  const [email, setEmail] = useState(currentUser?.email || '');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      // Create feedback object
      const feedbackData = {
        rating,
        category,
        message: feedback,
        name,
        email,
        userId: currentUser ? currentUser.uid : 'anonymous',
        createdAt: serverTimestamp(),
        status: 'pending' // For admin to track feedback status
      };

      // Add document to Firestore
      await addDoc(collection(db, "feedbacks"), feedbackData);
      
      console.log('Feedback submitted successfully');
      setIsSubmitted(true);
      
      // Reset form after submission
      setTimeout(() => {
        setRating(0);
        setFeedback('');
        setCategory('');
        if (!currentUser) {
          setName('');
          setEmail('');
        }
        setIsSubmitted(false);
      }, 3000);

    } catch (error) {
      console.error('Error submitting feedback:', error);
      setError('Failed to submit feedback. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-md p-6 mb-8">
      <h3 className="text-xl font-bold text-gray-800 mb-4">Share Your Feedback</h3>
      
      {isSubmitted ? (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
          <div className="flex items-center">
            <ThumbsUp className="h-5 w-5 mr-2" />
            <p>Thank you for your feedback! We appreciate your input.</p>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit}>
          {/* Error Message */}
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              <div className="flex items-center">
                <AlertCircle className="h-5 w-5 mr-2" />
                <p>{error}</p>
              </div>
            </div>
          )}
          
          {/* Rating */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              How would you rate your experience?
            </label>
            <div className="flex items-center">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  className="focus:outline-none"
                  onMouseEnter={() => setHoveredRating(star)}
                  onMouseLeave={() => setHoveredRating(0)}
                  onClick={() => setRating(star)}
                  disabled={isLoading}
                >
                  <Star
                    className={`h-8 w-8 ${
                      star <= (hoveredRating || rating)
                        ? 'fill-yellow-400 text-yellow-400'
                        : 'text-gray-300'
                    } transition-colors`}
                  />
                </button>
              ))}
              <span className="ml-2 text-sm text-gray-600">
                {rating > 0 ? `${rating} out of 5 stars` : 'Select a rating'}
              </span>
            </div>
          </div>
          
          {/* Feedback Category */}
          <div className="mb-6">
            <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
              Feedback Category
            </label>
            <select
              id="category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-orange-300 focus:border-transparent"
              required
              disabled={isLoading}
            >
              <option value="" disabled>Select a category</option>
              <option value="course-content">Course Content</option>
              <option value="instructor">Instructor</option>
              <option value="platform">Learning Platform</option>
              <option value="support">Customer Support</option>
              <option value="suggestion">Suggestion</option>
              <option value="other">Other</option>
            </select>
          </div>
          
          {/* Feedback Message */}
          <div className="mb-6">
            <label htmlFor="feedback" className="block text-sm font-medium text-gray-700 mb-2">
              Your Feedback
            </label>
            <textarea
              id="feedback"
              rows="4"
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              placeholder="Please share your thoughts, suggestions, or concerns..."
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-orange-300 focus:border-transparent"
              required
              disabled={isLoading}
            ></textarea>
          </div>
          
          {/* Contact Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                Your Name
              </label>
              <input
                type="text"
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="John Doe"
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-orange-300 focus:border-transparent"
                required
                disabled={isLoading || (currentUser && currentUser.displayName)}
              />
              {currentUser && currentUser.displayName && (
                <p className="text-xs text-gray-500 mt-1">Using your account name</p>
              )}
            </div>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Your Email
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="john@example.com"
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-orange-300 focus:border-transparent"
                required
                disabled={isLoading || (currentUser && currentUser.email)}
              />
              {currentUser && currentUser.email && (
                <p className="text-xs text-gray-500 mt-1">Using your account email</p>
              )}
            </div>
          </div>
          
          {/* Submit Button */}
          <button
            type="submit"
            className={`w-full bg-gradient-to-r from-orange-400 to-orange-500 text-white font-medium py-3 px-4 rounded-lg hover:from-orange-500 hover:to-orange-600 focus:outline-none focus:ring-2 focus:ring-orange-300 shadow-md transition-all flex items-center justify-center ${
              isLoading ? 'opacity-70 cursor-not-allowed' : ''
            }`}
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Submitting...
              </>
            ) : (
              <>
                <Send className="h-5 w-5 mr-2" />
                Submit Feedback
              </>
            )}
          </button>
        </form>
      )}
    </div>
  );
};

// Testimonial component
const Testimonial = ({ name, role, image, rating, content }) => {
  return (
    <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100 hover:shadow-lg transition-shadow">
      <div className="flex items-start">
        <div className="flex-shrink-0 mr-4">
          <img 
            src={image} 
            alt={name} 
            className="h-12 w-12 rounded-full object-cover"
          />
        </div>
        <div>
          <div className="flex items-center mb-1">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className={`h-4 w-4 ${
                  i < rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
                }`}
              />
            ))}
          </div>
          <h4 className="font-bold text-gray-800">{name}</h4>
          <p className="text-sm text-gray-600 mb-3">{role}</p>
          <p className="text-gray-700">{content}</p>
        </div>
      </div>
    </div>
  );
};

// FAQ Item component
const FAQItem = ({ question, answer }) => {
  const [isOpen, setIsOpen] = useState(false);
  
  return (
    <div className="border-b border-gray-200 py-4 last:border-0">
      <button
        className="flex justify-between items-center w-full text-left focus:outline-none"
        onClick={() => setIsOpen(!isOpen)}
      >
        <h4 className="font-medium text-gray-800">{question}</h4>
        <svg
          className={`h-5 w-5 text-gray-500 transform transition-transform ${
            isOpen ? 'rotate-180' : ''
          }`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>
      <div className={`mt-2 ${isOpen ? 'block' : 'hidden'}`}>
        <p className="text-gray-600">{answer}</p>
      </div>
    </div>
  );
};

const FeedbackPage = () => {
  // Sample testimonials data
  const testimonials = [
    {
      id: 1,
      name: "Emily Johnson",
      role: "Web Development Student",
      image: "/api/placeholder/100/100",
      rating: 5,
      content: "The JavaScript course was exactly what I needed to advance my career. The instructor was knowledgeable and the content was well-structured. I've already recommended it to several colleagues!"
    },
    {
      id: 2,
      name: "Michael Chen",
      role: "Data Scientist",
      image: "/api/placeholder/100/100",
      rating: 4,
      content: "The machine learning course helped me understand complex concepts in a simple way. The practical examples were particularly useful. Would definitely take more courses from this platform."
    },
    {
      id: 3,
      name: "Sarah Williams",
      role: "UX Designer",
      image: "/api/placeholder/100/100",
      rating: 5,
      content: "As someone transitioning into UI/UX design, this course provided the perfect foundation. The assignments were challenging but helped me build a strong portfolio. Excellent experience overall!"
    },
    {
      id: 4,
      name: "David Rodriguez",
      role: "Marketing Specialist",
      image: "/api/placeholder/100/100",
      rating: 4,
      content: "The digital marketing course was comprehensive and up-to-date with the latest trends. I've already been able to implement several strategies I learned and see real results for my business."
    }
  ];
  
  // FAQ data
  const faqs = [
    {
      id: 1,
      question: "How can I track my course progress?",
      answer: "You can track your course progress through your student dashboard. Each course displays a progress bar showing your completion percentage. You can also see detailed analytics about time spent, assignments completed, and quiz scores."
    },
    {
      id: 2,
      question: "What happens if I'm not satisfied with a course?",
      answer: "We offer a 30-day money-back guarantee on all our courses. If you're not satisfied with your learning experience, you can request a full refund within 30 days of purchase, no questions asked."
    },
    {
      id: 3,
      question: "Can I download course materials for offline viewing?",
      answer: "Yes, most of our courses allow you to download video lectures and learning materials for offline viewing through our mobile app. However, some instructors may disable this feature for their specific courses."
    },
    {
      id: 4,
      question: "How do I get a certificate after completing a course?",
      answer: "Certificates are automatically generated once you complete all required lectures, assignments, and assessments in a course. You can download your certificate directly from your course completion page or from your achievements section."
    },
    {
      id: 5,
      question: "Are there any live sessions with instructors?",
      answer: "Some of our premium courses include scheduled live Q&A sessions with instructors. Information about these sessions can be found in the course description. We also host monthly webinars with industry experts for all our students."
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      {/* Page Header */}
      <div className="bg-gradient-to-r from-orange-400 to-orange-500 py-12">
        <div className="container mx-auto px-6 text-center">
          <h1 className="text-3xl font-bold text-white mb-4">Feedback & Support</h1>
          <p className="text-orange-100 max-w-2xl mx-auto">
            We value your input! Share your thoughts, experiences, and suggestions to help us improve our learning platform.
          </p>
        </div>
      </div>
      
      {/* Main Content */}
      <div className="container mx-auto px-6 py-12">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Left Side - Feedback Form */}
          <div className="lg:w-2/3">
            <FeedbackForm />
            
            {/* Stats Section */}
            <div className="bg-white rounded-xl shadow-md p-6 mb-8">
              <h3 className="text-xl font-bold text-gray-800 mb-6">Why Your Feedback Matters</h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="bg-orange-100 rounded-full p-4 mb-4 inline-block">
                    <MessageCircle className="h-8 w-8 text-orange-500" />
                  </div>
                  <h4 className="font-bold text-gray-800 mb-1">2,500+</h4>
                  <p className="text-sm text-gray-600">Monthly Feedback Received</p>
                </div>
                
                <div className="text-center">
                  <div className="bg-orange-100 rounded-full p-4 mb-4 inline-block">
                    <ThumbsUp className="h-8 w-8 text-orange-500" />
                  </div>
                  <h4 className="font-bold text-gray-800 mb-1">85%</h4>
                  <p className="text-sm text-gray-600">Implementation Rate</p>
                </div>
                
                <div className="text-center">
                  <div className="bg-orange-100 rounded-full p-4 mb-4 inline-block">
                    <Users className="h-8 w-8 text-orange-500" />
                  </div>
                  <h4 className="font-bold text-gray-800 mb-1">50,000+</h4>
                  <p className="text-sm text-gray-600">Satisfied Students</p>
                </div>
              </div>
            </div>
            
            {/* Testimonials Section */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-gray-800">Student Testimonials</h3>
                <a href="#" className="text-orange-500 hover:text-orange-600 font-medium text-sm">View All</a>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {testimonials.map((testimonial) => (
                  <Testimonial
                    key={testimonial.id}
                    name={testimonial.name}
                    role={testimonial.role}
                    image={testimonial.image}
                    rating={testimonial.rating}
                    content={testimonial.content}
                  />
                ))}
              </div>
            </div>
          </div>
          
          {/* Right Side - FAQ and Contact Info */}
          <div className="lg:w-1/3">
            {/* FAQ Section */}
            <div className="bg-white rounded-xl shadow-md p-6 mb-8">
              <h3 className="text-xl font-bold text-gray-800 mb-6">Frequently Asked Questions</h3>
              
              <div>
                {faqs.map((faq) => (
                  <FAQItem
                    key={faq.id}
                    question={faq.question}
                    answer={faq.answer}
                  />
                ))}
              </div>
              
              <div className="mt-6 text-center">
                <a href="#" className="inline-flex items-center text-orange-500 hover:text-orange-600 font-medium">
                  View all FAQs
                  <svg className="ml-1 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </a>
              </div>
            </div>
            
            {/* Contact Information */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <h3 className="text-xl font-bold text-gray-800 mb-6">Contact Support</h3>
              
              <div className="space-y-6">
                <div className="flex items-start">
                  <div className="bg-orange-100 p-2 rounded-full mr-4">
                    <MessageCircle className="h-6 w-6 text-orange-500" />
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-800 mb-1">Live Chat Support</h4>
                    <p className="text-sm text-gray-600 mb-2">Available 24/7 for all your questions</p>
                    <a href="#" className="text-orange-500 hover:text-orange-600 font-medium text-sm">
                      Start Live Chat
                    </a>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="bg-orange-100 p-2 rounded-full mr-4">
                    <Mail className="h-6 w-6 text-orange-500" />
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-800 mb-1">Email Support</h4>
                    <p className="text-sm text-gray-600 mb-2">Get a response within 24 hours</p>
                    <a href="mailto:support@learninghub.com" className="text-orange-500 hover:text-orange-600 font-medium text-sm">
                      support@learninghub.com
                    </a>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="bg-orange-100 p-2 rounded-full mr-4">
                    <User className="h-6 w-6 text-orange-500" />
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-800 mb-1">Technical Support</h4>
                    <p className="text-sm text-gray-600 mb-2">For platform and course access issues</p>
                    <a href="mailto:tech@learninghub.com" className="text-orange-500 hover:text-orange-600 font-medium text-sm">
                      tech@learninghub.com
                    </a>
                  </div>
                </div>
              </div>
              
              <div className="mt-8 p-4 bg-orange-50 rounded-lg">
                <h4 className="font-medium text-gray-800 mb-2">Support Hours</h4>
                <p className="text-sm text-gray-600 mb-1">Monday - Friday: 9:00 AM - 8:00 PM EST</p>
                <p className="text-sm text-gray-600">Saturday - Sunday: 10:00 AM - 6:00 PM EST</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* CTA Section */}
      <div className="bg-gradient-to-r from-orange-400 to-orange-500 py-12">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-2xl font-bold text-white mb-4">Ready to Transform Your Learning Experience?</h2>
          <p className="text-orange-100 max-w-2xl mx-auto mb-8">
            Join thousands of students already learning with us and advance your skills today.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <a href="#" className="bg-white text-orange-500 hover:bg-orange-50 transition-colors px-6 py-3 rounded-lg font-medium shadow-md">
              Explore Courses
            </a>
            <a href="#" className="bg-orange-600 text-white hover:bg-orange-700 transition-colors px-6 py-3 rounded-lg font-medium shadow-md">
              Sign Up Now
            </a>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default FeedbackPage;