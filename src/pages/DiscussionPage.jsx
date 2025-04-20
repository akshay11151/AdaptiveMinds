import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import {
  Search,
  Send,
  User,
  Clock,
  ArrowLeft,
  ArrowRight,
  CheckCircle,
  MessageCircle,
  AlertCircle
} from 'lucide-react';
import { collection, query, where, orderBy, getDocs, addDoc, doc, getDoc, updateDoc, onSnapshot, serverTimestamp ,setDoc } from 'firebase/firestore';
import { db } from '../../firebase';
import { useAuth } from '../AuthContext';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const DiscussionPage = () => {
  const { currentUser } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [instructors, setInstructors] = useState([]);
  const [filteredInstructors, setFilteredInstructors] = useState([]);
  const [selectedInstructor, setSelectedInstructor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const messagesEndRef = useRef(null);
  
  // Fetch instructors
  useEffect(() => {
    const fetchInstructors = async () => {
      try {
        setLoading(true);
        const instructorsQuery = query(
          collection(db, 'users'),
          where('role', '==', 'instructor')
        );
        const snapshot = await getDocs(instructorsQuery);
        const instructorsData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          lastMessage: null,
          unreadCount: 0
        }));
        
        setInstructors(instructorsData);
        setFilteredInstructors(instructorsData);
        setError(null);
      } catch (err) {
        console.error('Error fetching instructors:', err);
        setError('Failed to load instructors. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchInstructors();
  }, []);
  
  // Filter instructors based on search term
  useEffect(() => {
    const filtered = instructors.filter(instructor => {
      const name = instructor.displayName || '';
      const title = instructor.title || '';
      return (
        name.toLowerCase().includes(searchTerm.toLowerCase()) || 
        title.toLowerCase().includes(searchTerm.toLowerCase())
      );
    });
    setFilteredInstructors(filtered);
  }, [searchTerm, instructors]);
  
  // Fetch messages when an instructor is selected
  useEffect(() => {
    if (!selectedInstructor || !currentUser) return;
    
    setLoadingMessages(true);
    
    // Create a conversation ID (combo of user and instructor IDs)
    const conversationId = [currentUser.uid, selectedInstructor.id].sort().join('_');
    
    // Get messages for this conversation
    const messagesQuery = query(
      collection(db, 'messages'),
      where('conversationId', '==', conversationId),
      orderBy('timestamp', 'asc')
    );
    
    const unsubscribe = onSnapshot(messagesQuery, (snapshot) => {
      const messagesData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      setMessages(messagesData);
      setLoadingMessages(false);
      
      // Mark messages as read if they were sent by the instructor
      messagesData.forEach(msg => {
        if (msg.senderId === selectedInstructor.id && !msg.read) {
          updateDoc(doc(db, 'messages', msg.id), { read: true });
        }
      });
    }, (err) => {
      console.error('Error fetching messages:', err);
      setLoadingMessages(false);
    });
    
    // Cleanup
    return () => unsubscribe();
  }, [selectedInstructor, currentUser]);
  
  // Scroll to bottom of messages
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);
  
  // Format timestamp
  const formatTime = (timestamp) => {
    if (!timestamp) return '';
    
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };
  
  const formatDate = (timestamp) => {
    if (!timestamp) return '';
    
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString();
  };
  
  // Send message
  const sendMessage = async (e) => {
    e.preventDefault();
    
    if (!message.trim() || !selectedInstructor || !currentUser) return;
    
    try {
      const conversationId = [currentUser.uid, selectedInstructor.id].sort().join('_');
      
      // Add message to Firestore
      await addDoc(collection(db, 'messages'), {
        conversationId,
        text: message,
        senderId: currentUser.uid,
        receiverId: selectedInstructor.id,
        timestamp: serverTimestamp(),
        read: false
      });
      
      // Update or create conversation document
      const conversationRef = doc(db, 'conversations', conversationId);
      const conversationDoc = await getDoc(conversationRef);
      
      if (conversationDoc.exists()) {
        await updateDoc(conversationRef, {
          lastMessage: message,
          lastMessageTimestamp: serverTimestamp(),
          lastMessageSenderId: currentUser.uid,
          [`${selectedInstructor.id}_unreadCount`]: conversationDoc.data()[`${selectedInstructor.id}_unreadCount`] + 1 || 1
        });
      } else {
        // Create new conversation
        await setDoc(conversationRef, {
          participants: [currentUser.uid, selectedInstructor.id],
          lastMessage: message,
          lastMessageTimestamp: serverTimestamp(),
          lastMessageSenderId: currentUser.uid,
          [`${selectedInstructor.id}_unreadCount`]: 1,
          [`${currentUser.uid}_unreadCount`]: 0
        });
      }
      
      // Clear message input
      setMessage('');
      
    } catch (err) {
      console.error('Error sending message:', err);
      alert('Failed to send message. Please try again.');
    }
  };
  
  // Group messages by date
  const groupMessagesByDate = () => {
    const groups = {};
    
    messages.forEach(msg => {
      const dateKey = msg.timestamp ? formatDate(msg.timestamp) : 'Pending';
      if (!groups[dateKey]) {
        groups[dateKey] = [];
      }
      groups[dateKey].push(msg);
    });
    
    return groups;
  };
  
  // Render chat list (instructors)
  const renderInstructorsList = () => (
    <div className="h-full flex flex-col">
      <div className="p-4 border-b">
        <div className="relative">
          <input
            type="text"
            placeholder="Search instructors..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full p-3 pl-10 bg-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400"
          />
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" />
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="flex justify-center items-center h-full">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center h-full p-6 text-center">
            <AlertCircle className="text-red-500 h-12 w-12 mb-4" />
            <p className="text-gray-600">{error}</p>
            <button 
              onClick={() => window.location.reload()}
              className="mt-4 px-4 py-2 bg-orange-500 text-white rounded-lg"
            >
              Try Again
            </button>
          </div>
        ) : filteredInstructors.length > 0 ? (
          filteredInstructors.map(instructor => (
            <div
              key={instructor.id}
              onClick={() => setSelectedInstructor(instructor)}
              className={`p-4 flex items-center cursor-pointer hover:bg-gray-50 transition-colors ${
                selectedInstructor?.id === instructor.id ? 'bg-orange-50' : ''
              }`}
            >
              <div className="flex-shrink-0 mr-3">
                {instructor.profilePicture ? (
                  <img 
                    src={instructor.profilePicture} 
                    alt={instructor.displayName || 'Instructor'} 
                    className="w-12 h-12 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-orange-100 flex items-center justify-center">
                    <span className="text-orange-600 font-medium text-lg">
                      {(instructor.displayName || 'I')[0].toUpperCase()}
                    </span>
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-gray-800 font-medium truncate">
                  {instructor.displayName || 'Unnamed Instructor'}
                </h3>
                <p className="text-gray-500 text-sm truncate">
                  {instructor.title || 'Instructor'}
                </p>
              </div>
              {instructor.unreadCount > 0 && (
                <div className="ml-2 bg-orange-500 text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center">
                  {instructor.unreadCount}
                </div>
              )}
            </div>
          ))
        ) : (
          <div className="flex flex-col items-center justify-center h-full p-6 text-center">
            <MessageCircle className="text-gray-400 h-12 w-12 mb-4" />
            <p className="text-gray-600">No instructors found</p>
            {searchTerm && (
              <button 
                onClick={() => setSearchTerm('')}
                className="mt-4 px-4 py-2 text-orange-500"
              >
                Clear Search
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
  
  // Render chat area
  const renderChatArea = () => {
    const messageGroups = groupMessagesByDate();
    
    return (
      <div className="h-full flex flex-col">
        {/* Chat Header */}
        <div className="p-4 border-b flex items-center">
          <button 
            onClick={() => setSelectedInstructor(null)}
            className="md:hidden mr-2 text-gray-600"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          {selectedInstructor.profilePicture ? (
            <img 
              src={selectedInstructor.profilePicture} 
              alt={selectedInstructor.displayName || 'Instructor'} 
              className="w-10 h-10 rounded-full object-cover mr-3"
            />
          ) : (
            <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center mr-3">
              <span className="text-orange-600 font-medium">
                {(selectedInstructor.displayName || 'I')[0].toUpperCase()}
              </span>
            </div>
          )}
          <div>
            <h3 className="font-medium text-gray-800">
              {selectedInstructor.displayName || 'Unnamed Instructor'}
            </h3>
            <p className="text-xs text-gray-500">{selectedInstructor.title || 'Instructor'}</p>
          </div>
        </div>
        
        {/* Chat Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {loadingMessages ? (
            <div className="flex justify-center items-center h-full">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
            </div>
          ) : messages.length > 0 ? (
            Object.entries(messageGroups).map(([date, msgs]) => (
              <div key={date} className="space-y-3">
                <div className="flex justify-center">
                  <span className="bg-gray-200 text-gray-600 text-xs px-2 py-1 rounded-full">
                    {date}
                  </span>
                </div>
                
                {msgs.map(msg => (
                  <div 
                    key={msg.id} 
                    className={`flex ${msg.senderId === currentUser.uid ? 'justify-end' : 'justify-start'}`}
                  >
                    <div 
                      className={`max-w-[75%] px-4 py-2 rounded-lg ${
                        msg.senderId === currentUser.uid 
                          ? 'bg-orange-500 text-white rounded-br-none' 
                          : 'bg-gray-100 text-gray-800 rounded-bl-none'
                      }`}
                    >
                      <p>{msg.text}</p>
                      <div 
                        className={`text-xs mt-1 flex items-center ${
                          msg.senderId === currentUser.uid ? 'text-orange-100 justify-end' : 'text-gray-500'
                        }`}
                      >
                        {formatTime(msg.timestamp)}
                        {msg.senderId === currentUser.uid && (
                          <CheckCircle 
                            className={`h-3 w-3 ml-1 ${msg.read ? 'text-blue-400' : 'text-orange-100'}`} 
                          />
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ))
          ) : (
            <div className="flex flex-col items-center justify-center h-full">
              <MessageCircle className="text-gray-300 h-16 w-16 mb-4" />
              <p className="text-gray-500">No messages yet</p>
              <p className="text-gray-400 text-sm">Send a message to start the conversation</p>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
        
        {/* Message Input */}
        <div className="p-4 border-t">
          <form onSubmit={sendMessage} className="flex items-center">
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Type a message..."
              className="flex-1 p-3 bg-gray-100 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-orange-400"
            />
            <button
              type="submit"
              className="bg-orange-500 text-white p-3 rounded-r-lg hover:bg-orange-600 transition-colors"
              disabled={!message.trim()}
            >
              <Send className="h-5 w-5" />
            </button>
          </form>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />
      
      {/* Header */}
      <div className="bg-gradient-to-r from-orange-400 to-orange-500 py-8">
        <div className="container mx-auto px-4">
          <h1 className="text-2xl font-bold text-white">Discussion Forum</h1>
          <p className="text-orange-100">Connect with instructors and get your questions answered</p>
        </div>
      </div>
      
      {/* Main Content */}
      <div className="flex-1 container mx-auto px-4 py-8">
        <div className="bg-white rounded-xl shadow-sm overflow-hidden h-[600px] flex">
          {/* Instructors List (left side) */}
          <div className={`w-full md:w-1/3 border-r ${selectedInstructor ? 'hidden md:block' : 'block'}`}>
            {renderInstructorsList()}
          </div>
          
          {/* Chat Area (right side) */}
          <div className={`w-full md:w-2/3 ${selectedInstructor ? 'block' : 'hidden md:flex md:items-center md:justify-center'}`}>
            {selectedInstructor ? (
              renderChatArea()
            ) : (
              <div className="text-center p-8">
                <MessageCircle className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-medium text-gray-700 mb-2">Welcome to Discussions</h3>
                <p className="text-gray-500 max-w-md mx-auto">
                  Select an instructor from the list to start a conversation. 
                  Get help with course material, ask questions, or seek guidance.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default DiscussionPage;