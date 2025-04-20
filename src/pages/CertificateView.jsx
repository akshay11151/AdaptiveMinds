import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Download, ChevronLeft, AlertCircle, Loader } from 'lucide-react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../firebase';
import { useAuth } from '../AuthContext';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const CertificateView = () => {
  const { certificateId } = useParams();
  const navigate = useNavigate();
  const { currentUser, isAuthenticated } = useAuth();
  
  // State
  const [certificate, setCertificate] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Fetch certificate data
  useEffect(() => {
    const fetchCertificate = async () => {
      if (!isAuthenticated || !currentUser) {
        navigate('/');
        return;
      }
      
      try {
        setLoading(true);
        
        // Get certificate data
        const certificateRef = doc(db, 'user_certificates', certificateId);
        const certificateSnap = await getDoc(certificateRef);
        
        if (!certificateSnap.exists()) {
          setError('Certificate not found');
          setLoading(false);
          return;
        }
        
        const certificateData = certificateSnap.data();
        
        // Verify this certificate belongs to the current user
        if (certificateData.userId !== currentUser.uid) {
          setError('You do not have permission to view this certificate');
          setLoading(false);
          return;
        }
        
        // Format the date
        let formattedDate = 'Unknown date';
        if (certificateData.issueDate) {
          const date = certificateData.issueDate.toDate ? 
            certificateData.issueDate.toDate() : 
            new Date(certificateData.issueDate);
          
          formattedDate = new Intl.DateTimeFormat('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          }).format(date);
        }
        
        setCertificate({
          ...certificateData,
          issueDateFormatted: formattedDate
        });
        
      } catch (err) {
        console.error('Error fetching certificate:', err);
        setError('Failed to load certificate. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchCertificate();
  }, [certificateId, currentUser, isAuthenticated, navigate]);
  
  // Handle certificate download
  const handleDownloadCertificate = () => {
    if (!certificate) return;
    
    // Create the certificate content
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
  
  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="container mx-auto px-6 py-12 flex justify-center items-center">
          <Loader className="h-8 w-8 text-orange-500 animate-spin" />
          <span className="ml-2 text-gray-600">Loading certificate...</span>
        </div>
        <Footer />
      </div>
    );
  }
  
  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="container mx-auto px-6 py-12">
          <div className="bg-red-50 border border-red-200 text-red-600 px-6 py-4 rounded-lg flex items-start max-w-2xl mx-auto">
            <AlertCircle className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-medium">{error}</p>
              <button 
                onClick={() => navigate('/certificates')}
                className="mt-2 text-sm underline"
              >
                Return to Certificates
              </button>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }
  
  // If no certificate data
  if (!certificate) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="container mx-auto px-6 py-12">
          <div className="text-center py-16">
            <h3 className="text-xl font-medium text-gray-700 mb-2">Certificate not found</h3>
            <p className="text-gray-500 mb-6">The certificate you're looking for doesn't exist or you don't have access to it.</p>
            <button
              onClick={() => navigate('/certificates')}
              className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600"
            >
              View All Certificates
            </button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="container mx-auto px-6 py-8">
        <div className="mb-6">
          <button 
            onClick={() => navigate('/certificates')}
            className="flex items-center text-gray-600 hover:text-orange-500 mb-4"
          >
            <ChevronLeft className="h-5 w-5 mr-1" />
            Back to Certificates
          </button>
          
          <div className="flex justify-between items-center">
            <h1 className="text-2xl md:text-3xl font-bold text-gray-800">Course Certificate</h1>
            <button 
              onClick={handleDownloadCertificate}
              className="flex items-center bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 transition-colors"
            >
              <Download className="h-5 w-5 mr-2" />
              Download Certificate
            </button>
          </div>
        </div>
        
        {/* Certificate Display */}
        <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-lg overflow-hidden p-6 md:p-8">
          <div className="border-8 border-orange-400 p-8 relative">
            <div className="text-center">
              <h2 className="text-2xl md:text-4xl font-bold text-orange-500 mb-6 pb-4 border-b-2 border-orange-300">Certificate of Completion</h2>
              
              <p className="text-xl md:text-2xl text-gray-600 mt-8">This is to certify that</p>
              <h3 className="text-2xl md:text-4xl font-bold text-gray-800 my-6">{certificate.userName || currentUser.displayName || 'Student'}</h3>
              <p className="text-xl md:text-2xl text-gray-600">has successfully completed</p>
              <h3 className="text-xl md:text-3xl font-bold text-gray-800 my-6">{certificate.courseName}</h3>
              <p className="text-lg md:text-xl text-gray-600">Instructor: {certificate.instructorName || 'Instructor'}</p>
              
              <div className="mt-12 mb-8">
                <div className="w-48 mx-auto border-t-2 border-gray-400 pt-2">
                  <p className="text-lg font-medium">LearningHub</p>
                </div>
              </div>
              
              <p className="text-lg text-gray-600">Date: {certificate.issueDateFormatted}</p>
              <p className="text-xs text-gray-400 mt-8">Certificate ID: {certificate.certificateId}</p>
            </div>
            
            {/* Certificate Seal */}
            <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-gradient-to-br from-orange-400 to-orange-500 rounded-full flex items-center justify-center border-4 border-white">
              <div className="w-28 h-28 rounded-full border-2 border-dashed border-white flex items-center justify-center">
                <div className="text-white text-center">
                  <div className="text-xs">VERIFIED</div>
                  <div className="text-lg font-bold my-1">LMS</div>
                  <div className="text-xs">CERTIFIED</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default CertificateView;