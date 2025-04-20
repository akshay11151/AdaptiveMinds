import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Award, 
  Download, 
  Calendar, 
  BookOpen, 
  Search, 
  AlertCircle, 
  Loader, 
  ExternalLink 
} from 'lucide-react';
import { 
  collection, 
  query, 
  where, 
  getDocs, 
  orderBy 
} from 'firebase/firestore';
import { db } from '../../firebase';
import { useAuth } from '../AuthContext';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const CertificatesPage = () => {
  const navigate = useNavigate();
  const { currentUser, isAuthenticated } = useAuth();
  
  // State
  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Fetch user's certificates
  useEffect(() => {
    const fetchCertificates = async () => {
      if (!isAuthenticated || !currentUser) {
        navigate('/');
        return;
      }
      
      try {
        setLoading(true);
        
        // Query certificates collection
        const certificatesQuery = query(
          collection(db, 'user_certificates'),
          where('userId', '==', currentUser.uid),
          orderBy('issueDate', 'desc')
        );
        
        const querySnapshot = await getDocs(certificatesQuery);
        
        const certificatesData = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          issueDateFormatted: doc.data().issueDate 
            ? new Date(doc.data().issueDate.toDate()).toLocaleDateString() 
            : 'Unknown'
        }));
        
        setCertificates(certificatesData);
        setError(null);
      } catch (err) {
        console.error('Error fetching certificates:', err);
        setError('Failed to load certificates. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchCertificates();
  }, [currentUser, isAuthenticated, navigate]);
  
  // Filter certificates based on search term
  const filteredCertificates = certificates.filter(certificate => 
    certificate.courseName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    certificate.instructorName?.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  // Handle certificate download
  const handleDownloadCertificate = (certificate) => {
    // Create PDF certificate on the fly
    const certificateContent = `
      <html>
        <head>
          <style>
            body {
              font-family: 'Arial', sans-serif;
              margin: 0;
              padding: 0;
              display: flex;
              justify-content: center;
              align-items: center;
              min-height: 100vh;
              background-color: #f9f9f9;
            }
            .certificate {
              width: 800px;
              height: 600px;
              background-color: white;
              border: 20px solid #f3ae4e;
              padding: 50px;
              text-align: center;
              position: relative;
            }
            .certificate-title {
              font-size: 32px;
              color: #e86820;
              margin-bottom: 20px;
              border-bottom: 2px solid #e86820;
              padding-bottom: 10px;
            }
            .presented-to {
              font-size: 24px;
              margin: 20px 0;
            }
            .student-name {
              font-size: 36px;
              font-weight: bold;
              color: #333;
              margin: 30px 0;
            }
            .course-name {
              font-size: 20px;
              margin: 20px 0;
            }
            .instructor-name {
              font-size: 18px;
              margin: 10px 0 30px 0;
            }
            .date {
              font-size: 16px;
              margin-top: 40px;
            }
            .certificate-id {
              position: absolute;
              bottom: 20px;
              right: 20px;
              font-size: 12px;
              color: #999;
            }
            .signature {
              margin-top: 30px;
              border-top: 1px solid #333;
              display: inline-block;
              padding-top: 10px;
              width: 200px;
            }
          </style>
        </head>
        <body>
          <div class="certificate">
            <div class="certificate-title">Certificate of Completion</div>
            <div class="presented-to">This is to certify that</div>
            <div class="student-name">${certificate.userName || 'Student'}</div>
            <div class="presented-to">has successfully completed</div>
            <div class="course-name">${certificate.courseName}</div>
            <div class="instructor-name">Instructor: ${certificate.instructorName || 'Instructor'}</div>
            <div class="signature">LearningHub</div>
            <div class="date">Date: ${certificate.issueDateFormatted}</div>
            <div class="certificate-id">Certificate ID: ${certificate.certificateId}</div>
          </div>
        </body>
      </html>
    `;
    
    // Create a blob and download
    const blob = new Blob([certificateContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${certificate.courseName.replace(/\s+/g, '_')}_Certificate.html`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      {/* Page Header */}
      <div className="bg-gradient-to-r from-orange-400 to-orange-500 py-12">
        <div className="container mx-auto px-6 text-center">
          <h1 className="text-3xl font-bold text-white mb-4">Your Certificates</h1>
          <p className="text-orange-100 max-w-2xl mx-auto">
            View and download certificates for courses you've successfully completed.
          </p>
        </div>
      </div>
      
      {/* Main Content */}
      <div className="container mx-auto px-6 py-12">
        {/* Search Bar */}
        <div className="max-w-md mx-auto mb-8 relative">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search certificates..."
            className="w-full py-3 pl-12 pr-4 text-gray-700 bg-white rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-300"
          />
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
        </div>
        
        {/* Loading State */}
        {loading && (
          <div className="flex justify-center items-center py-20">
            <Loader className="h-8 w-8 text-orange-500 animate-spin" />
            <span className="ml-2 text-gray-600">Loading certificates...</span>
          </div>
        )}
        
        {/* Error State */}
        {error && !loading && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-6 py-4 rounded-lg flex items-start max-w-2xl mx-auto">
            <AlertCircle className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" />
            <p>{error}</p>
          </div>
        )}
        
        {/* No Certificates */}
        {!loading && !error && certificates.length === 0 && (
          <div className="text-center py-16">
            <Award className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-medium text-gray-700 mb-2">No certificates yet</h3>
            <p className="text-gray-500 mb-6 max-w-md mx-auto">
              Complete a course to earn your first certificate. Certificates are awarded when you finish all videos in a course.
            </p>
            <button
              onClick={() => navigate('/courses')}
              className="px-6 py-2 bg-gradient-to-r from-orange-400 to-orange-500 text-white rounded-lg hover:from-orange-500 hover:to-orange-600"
            >
              Browse Courses
            </button>
          </div>
        )}
        
        {/* Certificates Grid */}
        {!loading && !error && filteredCertificates.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCertificates.map(certificate => (
              <div key={certificate.id} className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100">
                <div className="p-6 border-b border-gray-100">
                  <div className="flex justify-between items-start">
                    <div className="bg-orange-100 p-3 rounded-full">
                      <Award className="h-6 w-6 text-orange-500" />
                    </div>
                    <div className="bg-green-100 px-3 py-1 rounded-full text-xs font-medium text-green-700">
                      Completed
                    </div>
                  </div>
                  
                  <h3 className="font-bold text-lg text-gray-800 mt-4 mb-1">{certificate.courseName}</h3>
                  <p className="text-gray-600 text-sm">Instructor: {certificate.instructorName || 'Unknown'}</p>
                  
                  <div className="flex items-center mt-4 text-sm text-gray-500">
                    <Calendar className="h-4 w-4 mr-1" />
                    <span>Issued on: {certificate.issueDateFormatted}</span>
                  </div>
                </div>
                
                <div className="p-4 bg-gray-50 flex justify-between items-center">
                  <p className="text-xs text-gray-500">ID: {certificate.certificateId}</p>
                  
                  <div className="flex space-x-2">
                    <a 
                      href={`/certificate/${certificate.id}`}
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded"
                      title="View Certificate"
                    >
                      <ExternalLink className="h-5 w-5" />
                    </a>
                    <button
                      onClick={() => handleDownloadCertificate(certificate)}
                      className="p-2 text-green-600 hover:text-green-800 hover:bg-green-50 rounded"
                      title="Download Certificate"
                    >
                      <Download className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
        
        {/* Search Results Empty */}
        {!loading && !error && certificates.length > 0 && filteredCertificates.length === 0 && (
          <div className="text-center py-16">
            <Search className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-medium text-gray-700 mb-2">No matching certificates</h3>
            <p className="text-gray-500 mb-6">
              No certificates matching "{searchTerm}" were found.
            </p>
            <button
              onClick={() => setSearchTerm('')}
              className="px-4 py-2 text-orange-500 border border-orange-500 rounded-lg hover:bg-orange-50"
            >
              Clear Search
            </button>
          </div>
        )}
      </div>
      
      <Footer />
      </div>
  )
};

export default CertificatesPage;