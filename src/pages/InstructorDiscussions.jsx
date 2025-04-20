import React, { useState, useEffect, useRef } from 'react';
import {
  Search,
  Send,
  User,
  Clock,
  ChevronDown,
  MessageCircle,
  CheckCircle,
  AlertCircle,
  ArrowLeft
} from 'lucide-react';
import { collection, query, where, orderBy, getDocs, addDoc, doc, getDoc, updateDoc, onSnapshot, serverTimestamp , setDoc } from 'firebase/firestore';
import { db } from '../../firebase';
import { useAuth } from '../AuthContext';

const InstructorDiscussions = () => {
  const { currentUser } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [students, setStudents] = useState([]);
  const [filteredStudents, setFilteredStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const messagesEndRef = useRef(null);
  
  // Fetch students and conversations
  useEffect(() => {
    const fetchConversations = async () => {
      if (!currentUser) return;
      
      try {
        setLoading(true);
        
        // Fetch conversations where instructor is a participant
        const conversationsQuery = query(
          collection(db, 'conversations'),
          where('participants', 'array-contains', currentUser.uid)
        );
        
        const conversationsSnapshot = await getDocs(conversationsQuery);
        
        // Extract student IDs from conversations
        const studentIds = [];
        const conversationsData = [];
        
        conversationsSnapshot.forEach(doc => {
          const data = doc.data();
          
          // Find the other participant (student)
          const studentId = data.participants.find(id => id !== currentUser.uid);
          
          if (studentId) {
            studentIds.push(studentId);
            
            conversationsData.push({
              id: doc.id,
              studentId,
              lastMessage: data.lastMessage,
              lastMessageTimestamp: data.lastMessageTimestamp,
              lastMessageSenderId: data.lastMessageSenderId,
              unreadCount: data[`${currentUser.uid}_unreadCount`] || 0
            });
          }
        });
        
        // Fetch student details
        if (studentIds.length > 0) {
          const studentsData = [];
          
          // Get student details in batches (Firestore "in" query has limits)
          const batchSize = 10;
          for (let i = 0; i < studentIds.length; i += batchSize) {
            const batch = studentIds.slice(i, i + batchSize);
            const studentsQuery = query(
              collection(db, 'users'),
              where('role', '==', 'user'),
              where('__name__', 'in', batch)
            );
            
            const studentsSnapshot = await getDocs(studentsQuery);
            
            studentsSnapshot.forEach(doc => {
              const studentData = doc.data();
              
              // Find conversation for this student
              const conversation = conversationsData.find(c => c.studentId === doc.id);
              
              if (conversation) {
                studentsData.push({
                  id: doc.id,
                  ...studentData,
                  lastMessage: conversation.lastMessage,
                  lastMessageTimestamp: conversation.lastMessageTimestamp,
                  lastMessageSenderId: conversation.lastMessageSenderId,
                  unreadCount: conversation.unreadCount,
                  conversationId: conversation.id
                });
              }
            });
          }
          
          // Sort students by timestamp (most recent message first)
          studentsData.sort((a, b) => {
            if (!a.lastMessageTimestamp) return 1;
            if (!b.lastMessageTimestamp) return -1;
            
            const timestampA = a.lastMessageTimestamp.toDate ? a.lastMessageTimestamp.toDate() : new Date(a.lastMessageTimestamp);
            const timestampB = b.lastMessageTimestamp.toDate ? b.lastMessageTimestamp.toDate() : new Date(b.lastMessageTimestamp);
            
            return timestampB - timestampA;
          });
          
          // Sort again to put conversations with unread messages at the top
          studentsData.sort((a, b) => b.unreadCount - a.unreadCount);
          
          setStudents(studentsData);
          setFilteredStudents(studentsData);
        }
        
        setError(null);
      } catch (err) {
        console.error('Error fetching conversations:', err);
        setError('Failed to load conversations. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchConversations();
  }, [currentUser]);
  
  // Filter students based on search term
  useEffect(() => {
    const filtered = students.filter(student => {
      const name = student.displayName || '';
      const email = student.email || '';
      return (
        name.toLowerCase().includes(searchTerm.toLowerCase()) || 
        email.toLowerCase().includes(searchTerm.toLowerCase())
      );
    });
    setFilteredStudents(filtered);
  }, [searchTerm, students]);
  
  // Fetch messages when a student is selected
  useEffect(() => {
    if (!selectedStudent || !currentUser) return;
    
    setLoadingMessages(true);
    
    // Create a conversation ID (combo of user and instructor IDs)
    const conversationId = [currentUser.uid, selectedStudent.id].sort().join('_');
    
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
      
      // Mark messages as read if they were sent by the student
      messagesData.forEach(msg => {
        if (msg.senderId === selectedStudent.id && !msg.read) {
          updateDoc(doc(db, 'messages', msg.id), { read: true });
        }
      });
      
      // Update the conversation's unread count
      updateDoc(doc(db, 'conversations', conversationId), {
        [`${currentUser.uid}_unreadCount`]: 0
      });
      
      // Update local state
      setStudents(prev => 
        prev.map(s => 
          s.id === selectedStudent.id 
            ? { ...s, unreadCount: 0 } 
            : s
        )
      );
      setFilteredStudents(prev => 
        prev.map(s => 
          s.id === selectedStudent.id 
            ? { ...s, unreadCount: 0 } 
            : s
        )
      );
    }, (err) => {
      console.error('Error fetching messages:', err);
      setLoadingMessages(false);
    });
    
    // Cleanup
    return () => unsubscribe();
  }, [selectedStudent, currentUser]);
  
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
    
    if (!message.trim() || !selectedStudent || !currentUser) return;
    
    try {
      const conversationId = [currentUser.uid, selectedStudent.id].sort().join('_');
      
      // Add message to Firestore
      await addDoc(collection(db, 'messages'), {
        conversationId,
        text: message,
        senderId: currentUser.uid,
        receiverId: selectedStudent.id,
        timestamp: serverTimestamp(),
        read: false
      });
      
      // Update conversation document
      const conversationRef = doc(db, 'conversations', conversationId);
      const conversationDoc = await getDoc(conversationRef);
      
      if (conversationDoc.exists()) {
        await updateDoc(conversationRef, {
          lastMessage: message,
          lastMessageTimestamp: serverTimestamp(),
          lastMessageSenderId: currentUser.uid,
          [`${selectedStudent.id}_unreadCount`]: conversationDoc.data()[`${selectedStudent.id}_unreadCount`] + 1 || 1
        });
      } else {
        // This shouldn't happen normally since we're selecting from existing conversations
        // But just in case, create new conversation
        await setDoc(conversationRef, {
          participants: [currentUser.uid, selectedStudent.id],
          lastMessage: message,
          lastMessageTimestamp: serverTimestamp(),
          lastMessageSenderId: currentUser.uid,
          [`${selectedStudent.id}_unreadCount`]: 1,
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
  
  // Format preview message
  const formatPreviewMessage = (student) => {
    if (!student.lastMessage) return 'No messages yet';
    
    const isSender = student.lastMessageSenderId === currentUser.uid;
    return `${isSender ? 'You: ' : ''}${student.lastMessage}`;
  };
  
  // Format preview time
  const formatPreviewTime = (timestamp) => {
    if (!timestamp) return '';
    
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    const now = new Date();
    const diffMs = now - date;
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) {
      return formatTime(timestamp);
    } else if (diffDays === 1) {
      return 'Yesterday';
    } else if (diffDays < 7) {
      return date.toLocaleDateString(undefined, { weekday: 'short' });
    } else {
      return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
    }
  };
  
  // Render students list
  const renderStudentsList = () => (
    <div className="h-full flex flex-col">
      <div className="p-4 border-b">
        <div className="relative">
          <input
            type="text"
            placeholder="Search students..."
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
        ) : filteredStudents.length > 0 ? (
          filteredStudents.map(student => (
            <div
              key={student.id}
              onClick={() => setSelectedStudent(student)}
              className={`p-4 flex items-start cursor-pointer hover:bg-gray-50 transition-colors ${
                selectedStudent?.id === student.id ? 'bg-orange-50' : ''
              }`}
            >
              <div className="flex-shrink-0 mr-3">
                {student.profilePicture ? (
                  <img 
                    src={student.profilePicture} 
                    alt={student.displayName || 'Student'} 
                    className="w-12 h-12 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-orange-100 flex items-center justify-center">
                    <span className="text-orange-600 font-medium text-lg">
                      {(student.displayName || student.email || 'S')[0].toUpperCase()}
                    </span>
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-center">
                  <h3 className="text-gray-800 font-medium truncate">
                    {student.displayName || student.email || 'Unnamed Student'}
                  </h3>
                  <span className="text-xs text-gray-500">
                    {formatPreviewTime(student.lastMessageTimestamp)}
                  </span>
                </div>
                <div className="flex justify-between items-center mt-1">
                  <p className="text-gray-500 text-sm truncate">
                    {formatPreviewMessage(student)}
                  </p>
                  {student.unreadCount > 0 && (
                    <div className="ml-2 bg-orange-500 text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center">
                      {student.unreadCount}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="flex flex-col items-center justify-center h-full p-6 text-center">
            <MessageCircle className="text-gray-400 h-12 w-12 mb-4" />
            <p className="text-gray-600">No conversations found</p>
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
            onClick={() => setSelectedStudent(null)}
            className="md:hidden mr-2 text-gray-600"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          {selectedStudent.profilePicture ? (
            <img 
              src={selectedStudent.profilePicture} 
              alt={selectedStudent.displayName || 'Student'} 
              className="w-10 h-10 rounded-full object-cover mr-3"
            />
          ) : (
            <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center mr-3">
              <span className="text-orange-600 font-medium">
                {(selectedStudent.displayName || selectedStudent.email || 'S')[0].toUpperCase()}
              </span>
            </div>
          )}
          <div>
            <h3 className="font-medium text-gray-800">
              {selectedStudent.displayName || selectedStudent.email || 'Unnamed Student'}
            </h3>
            <p className="text-xs text-gray-500">Student</p>
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
    <div className="h-full bg-white rounded-xl shadow-sm overflow-hidden flex">
      {/* Students List (left side) */}
      <div className={`w-full md:w-1/3 border-r ${selectedStudent ? 'hidden md:block' : 'block'}`}>
        {renderStudentsList()}
      </div>
      
      {/* Chat Area (right side) */}
      <div className={`w-full md:w-2/3 ${selectedStudent ? 'block' : 'hidden md:flex md:items-center md:justify-center'}`}>
        {selectedStudent ? (
          renderChatArea()
        ) : (
          <div className="text-center p-8">
            <MessageCircle className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-medium text-gray-700 mb-2">Welcome to Discussions</h3>
            <p className="text-gray-500 max-w-md mx-auto">
              Select a student from the list to view your conversation.
              Students with unread messages appear at the top of the list.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default InstructorDiscussions;