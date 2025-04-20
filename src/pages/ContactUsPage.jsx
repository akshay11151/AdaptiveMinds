import React, { useState } from 'react';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../firebase';
import { useAuth } from '../AuthContext';
import { Mail, Phone, MapPin, Send, AlertCircle, Check, Info } from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

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

const ContactUsPage = () => {
  const { currentUser } = useAuth();
  
  // Form state
  const [formData, setFormData] = useState({
    name: currentUser?.displayName || '',
    email: currentUser?.email || '',
    subject: '',
    message: '',
    phone: ''
  });
  
  // Form status
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null); // 'success', 'error', null
  const [errorMessage, setErrorMessage] = useState('');
  
  // FAQs data
  const faqs = [
    {
      id: 1,
      question: "How do I enroll in a course?",
      answer: "To enroll in a course, browse our course catalog, select the course you're interested in, and click the 'Enroll Now' button. You'll be prompted to create an account or log in if you haven't already. Once logged in, follow the payment instructions to complete your enrollment."
    },
    {
      id: 2,
      question: "What payment methods do you accept?",
      answer: "We accept all major credit cards (Visa, MasterCard, American Express, Discover), PayPal, and bank transfers for course payments. In some regions, we also offer payment plans to help spread the cost over multiple installments."
    },
    {
      id: 3,
      question: "Can I get a refund if I'm not satisfied with a course?",
      answer: "Yes, we offer a 30-day money-back guarantee on all our courses. If you're not satisfied with your learning experience, you can request a full refund within 30 days of purchase, no questions asked."
    },
    {
      id: 4,
      question: "How do I access my course materials?",
      answer: "After enrolling in a course, you can access all course materials through your student dashboard. Simply log in to your account, navigate to 'My Courses,' and select the course you want to access. All videos, assignments, and resources will be available there."
    },
    {
      id: 5,
      question: "Do I get a certificate after completing a course?",
      answer: "Yes, upon successful completion of a course (including all required lectures, assignments, and assessments), you'll receive a digital certificate of completion. This certificate can be downloaded directly from your course page or from your achievements section."
    },
    {
      id: 6,
      question: "How long do I have access to course materials?",
      answer: "Once you enroll in a course, you have lifetime access to the course materials. You can revisit the content, videos, and resources whenever you need to refresh your knowledge, even after completing the course."
    },
    {
      id: 7,
      question: "Is there a mobile app available?",
      answer: "Yes, we have mobile apps available for both iOS and Android devices. You can download our app from the App Store or Google Play Store to access your courses on the go, download videos for offline viewing, and track your progress."
    }
  ];
  
  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };
  
  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus(null);
    setErrorMessage('');
    
    try {
      // Create contact message in Firestore
      await addDoc(collection(db, "contact_messages"), {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        subject: formData.subject,
        message: formData.message,
        userId: currentUser ? currentUser.uid : 'anonymous',
        createdAt: serverTimestamp(),
        status: 'new' // For admin to track status (new, read, responded)
      });
      
      // Set success status
      setSubmitStatus('success');
      
      // Reset form after success
      setFormData({
        name: currentUser?.displayName || '',
        email: currentUser?.email || '',
        subject: '',
        message: '',
        phone: ''
      });
      
    } catch (error) {
      console.error('Error submitting contact form:', error);
      setSubmitStatus('error');
      setErrorMessage('Failed to submit your message. Please try again later.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      {/* Page Header */}
      <div className="bg-gradient-to-r from-orange-400 to-orange-500 py-12">
        <div className="container mx-auto px-6 text-center">
          <h1 className="text-3xl font-bold text-white mb-4">Contact Us</h1>
          <p className="text-orange-100 max-w-2xl mx-auto">
            Have questions or need assistance? We're here to help! Reach out to our team and we'll get back to you as soon as possible.
          </p>
        </div>
      </div>
      
      {/* Main Content */}
      <div className="container mx-auto px-6 py-12">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Left Side - Contact Form */}
          <div className="lg:w-2/3">
            <div className="bg-white rounded-xl shadow-md p-6 mb-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">Get in Touch</h2>
              
              {/* Status Messages */}
              {submitStatus === 'success' && (
                <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-6 flex items-start">
                  <Check className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" />
                  <p>Thank you for your message! We'll get back to you as soon as possible.</p>
                </div>
              )}
              
              {submitStatus === 'error' && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6 flex items-start">
                  <AlertCircle className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" />
                  <p>{errorMessage}</p>
                </div>
              )}
              
              {/* Contact Form */}
              <form onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  {/* Name Field */}
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                      Full Name
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-orange-300 focus:border-transparent"
                      placeholder="John Doe"
                      required
                      disabled={isSubmitting || (currentUser && currentUser.displayName)}
                    />
                    {currentUser && currentUser.displayName && (
                      <p className="text-xs text-gray-500 mt-1">Using your account name</p>
                    )}
                  </div>
                  
                  {/* Email Field */}
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                      Email Address
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-orange-300 focus:border-transparent"
                      placeholder="john@example.com"
                      required
                      disabled={isSubmitting || (currentUser && currentUser.email)}
                    />
                    {currentUser && currentUser.email && (
                      <p className="text-xs text-gray-500 mt-1">Using your account email</p>
                    )}
                  </div>
                  
                  {/* Phone Field */}
                  <div>
                    <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                      Phone Number (Optional)
                    </label>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-orange-300 focus:border-transparent"
                      placeholder="+1 (123) 456-7890"
                      disabled={isSubmitting}
                    />
                  </div>
                  
                  {/* Subject Field */}
                  <div>
                    <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-1">
                      Subject
                    </label>
                    <input
                      type="text"
                      id="subject"
                      name="subject"
                      value={formData.subject}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-orange-300 focus:border-transparent"
                      placeholder="How can we help you?"
                      required
                      disabled={isSubmitting}
                    />
                  </div>
                </div>
                
                {/* Message Field */}
                <div className="mb-6">
                  <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">
                    Message
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleInputChange}
                    rows="5"
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-orange-300 focus:border-transparent"
                    placeholder="Please describe your inquiry in detail..."
                    required
                    disabled={isSubmitting}
                  ></textarea>
                </div>
                
                {/* Submit Button */}
                <button
                  type="submit"
                  className="w-full bg-gradient-to-r from-orange-400 to-orange-500 text-white font-medium py-3 px-4 rounded-lg hover:from-orange-500 hover:to-orange-600 focus:outline-none focus:ring-2 focus:ring-orange-300 shadow-md transition-all flex items-center justify-center"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Sending...
                    </>
                  ) : (
                    <>
                      <Send className="h-5 w-5 mr-2" />
                      Send Message
                    </>
                  )}
                </button>
              </form>
            </div>
            
            {/* Additional Contact Information */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">Our Information</h2>
              
              <div className="space-y-6">
                <div className="flex items-start">
                  <div className="bg-orange-100 p-3 rounded-full mr-4">
                    <MapPin className="h-6 w-6 text-orange-500" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-800 mb-1">Office Location</h3>
                    <p className="text-gray-600">123 Education Street, Learning City, ED 12345</p>
                    <p className="text-gray-600">United States</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="bg-orange-100 p-3 rounded-full mr-4">
                    <Mail className="h-6 w-6 text-orange-500" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-800 mb-1">Email Us</h3>
                    <p className="text-gray-600">support@learninghub.com</p>
                    <p className="text-gray-600">info@learninghub.com</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="bg-orange-100 p-3 rounded-full mr-4">
                    <Phone className="h-6 w-6 text-orange-500" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-800 mb-1">Call Us</h3>
                    <p className="text-gray-600">+1 (123) 456-7890</p>
                    <p className="text-gray-600">+1 (987) 654-3210</p>
                  </div>
                </div>
              </div>
              
              <div className="mt-8 p-4 bg-orange-50 rounded-lg">
                <div className="flex items-start">
                  <Info className="h-5 w-5 text-orange-500 mr-3 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-gray-800 mb-1">Support Hours</h4>
                    <p className="text-sm text-gray-600 mb-1">Monday - Friday: 9:00 AM - 8:00 PM EST</p>
                    <p className="text-sm text-gray-600">Saturday - Sunday: 10:00 AM - 6:00 PM EST</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Right Side - FAQs */}
          <div className="lg:w-1/3">
            <div className="bg-white rounded-xl shadow-md p-6 mb-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">Frequently Asked Questions</h2>
              
              <div className="space-y-1">
                {faqs.map((faq) => (
                  <FAQItem
                    key={faq.id}
                    question={faq.question}
                    answer={faq.answer}
                  />
                ))}
              </div>
              
              <div className="mt-8 p-4 bg-blue-50 rounded-lg">
                <div className="flex items-start">
                  <Info className="h-5 w-5 text-blue-500 mr-3 mt-0.5" />
                  <p className="text-sm text-gray-700">
                    Can't find what you're looking for? Feel free to contact us directly using the form, and our support team will be happy to assist you.
                  </p>
                </div>
              </div>
            </div>
            
            {/* Map Placeholder */}
            <div className="bg-white rounded-xl shadow-md p-6 h-64 flex items-center justify-center">
              <div className="text-center">
                <MapPin className="h-10 w-10 text-orange-400 mx-auto mb-2" />
                <p className="text-gray-500">Google Map will be displayed here</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default ContactUsPage;