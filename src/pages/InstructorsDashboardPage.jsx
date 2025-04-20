// import React, { useState } from 'react';
// import { Link, useNavigate } from 'react-router-dom';
// import { useAuth } from '../AuthContext';
// import { 
//   BookOpen, 
//   BarChart2, 
//   User, 
//   Users, 
//   MessageSquare, 
//   LogOut, 
//   Menu, 
//   X,
//   ChevronDown,
//   Clock,
//   DollarSign,
//   Award,
//   TrendingUp
// } from 'lucide-react';
// import InstructorsProfile from './InstructorsProfile';
// import InstructorStudents from './InstructorStudents';
// import InstructorCourses from './InstructorCourses';
// import InstructorDiscussions from './InstructorDiscussions';

// const InstructorsDashboardPage = () => {
//   const { currentUser, logout } = useAuth();
//   const navigate = useNavigate();
//   const [isSidebarOpen, setIsSidebarOpen] = useState(false);
//   const [activeView, setActiveView] = useState('dashboard');
  
//   // Get the first name from displayName or fallback to "Instructor"
//   const firstName = currentUser?.displayName?.split(' ')[0] 
//     || currentUser?.email?.split('@')[0] 
//     || 'Instructor';

//   // Handle logout with proper navigation
//   const handleLogout = async () => {
//     try {
//       await logout();
//       navigate('/'); // Navigate to login page after logout
//     } catch (error) {
//       console.error('Error logging out:', error);
//     }
//   };

//   // Sample data for instructor dashboard
//   const upcomingClasses = [
//     { id: 1, title: 'Advanced Data Analysis', time: 'Today, 2:00 PM', students: 24 },
//     { id: 2, title: 'Python Programming Basics', time: 'Tomorrow, 10:00 AM', students: 32 },
//     { id: 3, title: 'Machine Learning Fundamentals', time: 'Friday, 3:30 PM', students: 18 }
//   ];

//   const recentAssignments = [
//     { id: 1, title: 'Data Visualization Project', course: 'Data Science', submissions: 18, total: 24 },
//     { id: 2, title: 'Python Algorithms Exercise', course: 'Python Programming', submissions: 28, total: 32 },
//     { id: 3, title: 'Model Training Report', course: 'Machine Learning', submissions: 10, total: 18 }
//   ];

//   // Dashboard stats
//   const stats = [
//     { label: 'Total Students', value: '568', icon: <Users className="h-6 w-6 text-blue-600" />, bgColor: 'bg-blue-100' },
//     { label: 'Active Courses', value: '12', icon: <BookOpen className="h-6 w-6 text-orange-600" />, bgColor: 'bg-orange-100' },
//     { label: 'Total Earnings', value: '$24,500', icon: <DollarSign className="h-6 w-6 text-green-600" />, bgColor: 'bg-green-100' },
//     { label: 'Student Reviews', value: '4.8/5', icon: <Award className="h-6 w-6 text-purple-600" />, bgColor: 'bg-purple-100' }
//   ];

//   // Function to close sidebar on mobile
//   const closeSidebar = () => {
//     if (window.innerWidth < 768) {
//       setIsSidebarOpen(false);
//     }
//   };

//   // Sidebar menu items
//   const menuItems = [
//     {
//       id: 'dashboard',
//       label: 'Dashboard',
//       icon: <BarChart2 className="h-5 w-5" />,
//       onClick: () => setActiveView('dashboard')
//     },
//     {
//       id: 'students',
//       label: 'Students',
//       icon: <Users className="h-5 w-5" />,
//       onClick: () => setActiveView('students')
//     },
//     {
//       id: 'courses',
//       label: 'Courses',
//       icon: <BookOpen className="h-5 w-5" />,
//       onClick: () => setActiveView('courses')
//     },
//     {
//       id: 'profile',
//       label: 'Profile',
//       icon: <User className="h-5 w-5" />,
//       onClick: () => setActiveView('profile')
//     },
//     {
//       id: 'discussions',
//       label: 'Discussions',
//       icon: <MessageSquare className="h-5 w-5" />,
//       onClick: () => setActiveView('discussions')
//     },
//     {
//       id: 'logout',
//       label: 'Logout',
//       icon: <LogOut className="h-5 w-5" />,
//       onClick: handleLogout
//     }
//   ];

//   // Render dashboard content
//   const renderDashboard = () => (
//     <div className="space-y-8">
//       {/* Welcome Section */}
//       <div className="bg-gradient-to-r from-orange-400 to-orange-500 rounded-xl p-6 text-white">
//         <h2 className="text-2xl font-bold mb-2">Welcome back, {firstName}!</h2>
//         <p>Here's an overview of your teaching activities and student progress.</p>
//       </div>

//       {/* Stats Cards */}
//       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
//         {stats.map((stat, index) => (
//           <div key={index} className="bg-white rounded-xl p-6 shadow-sm">
//             <div className="flex justify-between items-start">
//               <div>
//                 <p className="text-sm text-gray-500 mb-1">{stat.label}</p>
//                 <h3 className="text-2xl font-bold text-gray-800">{stat.value}</h3>
//               </div>
//               <div className={`p-3 ${stat.bgColor} rounded-lg`}>
//                 {stat.icon}
//               </div>
//             </div>
//           </div>
//         ))}
//       </div>

//       {/* Two Column Layout */}
//       <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
//         {/* Upcoming Classes */}
//         <div>
//           <div className="flex justify-between items-center mb-6">
//             <h2 className="text-xl font-bold text-gray-800">Upcoming Classes</h2>
//             <button className="text-orange-500 hover:text-orange-600 text-sm font-medium">
//               View all
//             </button>
//           </div>
          
//           <div className="bg-white rounded-xl shadow-sm overflow-hidden">
//             {upcomingClasses.map(classItem => (
//               <div key={classItem.id} className="p-4 border-b border-gray-100 last:border-b-0">
//                 <div className="flex justify-between items-start">
//                   <div>
//                     <h3 className="font-medium text-gray-800">{classItem.title}</h3>
//                     <div className="flex items-center mt-1 text-sm text-gray-500">
//                       <Clock className="h-4 w-4 mr-1" />
//                       <span>{classItem.time}</span>
//                     </div>
//                   </div>
//                   <div className="bg-blue-50 text-blue-700 px-2 py-1 rounded-full text-xs font-medium">
//                     {classItem.students} students
//                   </div>
//                 </div>
//               </div>
//             ))}
            
//             {upcomingClasses.length === 0 && (
//               <div className="p-6 text-center">
//                 <p className="text-gray-500">No upcoming classes scheduled.</p>
//               </div>
//             )}
//           </div>
//         </div>
        
//         {/* Recent Assignments */}
//         <div>
//           <div className="flex justify-between items-center mb-6">
//             <h2 className="text-xl font-bold text-gray-800">Recent Assignments</h2>
//             <button className="text-orange-500 hover:text-orange-600 text-sm font-medium">
//               View all
//             </button>
//           </div>
          
//           <div className="bg-white rounded-xl shadow-sm overflow-hidden">
//             {recentAssignments.map(assignment => (
//               <div key={assignment.id} className="p-4 border-b border-gray-100 last:border-b-0">
//                 <div className="flex justify-between items-start">
//                   <div>
//                     <h3 className="font-medium text-gray-800">{assignment.title}</h3>
//                     <p className="text-sm text-gray-500 mt-1">{assignment.course}</p>
//                   </div>
//                   <div>
//                     <div className="text-sm text-gray-600 text-right mb-1">
//                       {assignment.submissions} / {assignment.total} submissions
//                     </div>
//                     <div className="w-32 h-2 bg-gray-200 rounded-full overflow-hidden">
//                       <div 
//                         className="h-full bg-orange-500 rounded-full" 
//                         style={{ width: `${(assignment.submissions / assignment.total) * 100}%` }}
//                       ></div>
//                     </div>
//                   </div>
//                 </div>
//               </div>
//             ))}
            
//             {recentAssignments.length === 0 && (
//               <div className="p-6 text-center">
//                 <p className="text-gray-500">No recent assignments.</p>
//               </div>
//             )}
//           </div>
//         </div>
//       </div>

//       {/* Recent Activity */}
//       <div className="bg-white rounded-xl p-6 shadow-sm">
//         <h2 className="text-xl font-bold text-gray-800 mb-6">Recent Activity</h2>
//         <div className="space-y-4">
//           <div className="flex items-start">
//             <div className="bg-blue-100 p-2 rounded-full mr-3">
//               <Users className="h-5 w-5 text-blue-600" />
//             </div>
//             <div>
//               <p className="text-gray-800 font-medium">5 new students enrolled in your courses</p>
//               <p className="text-sm text-gray-500">2 hours ago</p>
//             </div>
//           </div>
//           <div className="flex items-start">
//             <div className="bg-green-100 p-2 rounded-full mr-3">
//               <MessageSquare className="h-5 w-5 text-green-600" />
//             </div>
//             <div>
//               <p className="text-gray-800 font-medium">15 new discussion posts in your courses</p>
//               <p className="text-sm text-gray-500">5 hours ago</p>
//             </div>
//           </div>
//           <div className="flex items-start">
//             <div className="bg-orange-100 p-2 rounded-full mr-3">
//               <Award className="h-5 w-5 text-orange-600" />
//             </div>
//             <div>
//               <p className="text-gray-800 font-medium">Your "Data Science Fundamentals" course was featured</p>
//               <p className="text-sm text-gray-500">1 day ago</p>
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );

//   // Conditional rendering based on active view
//   let mainContent;
//   switch (activeView) {
//     case 'students':
//       mainContent = <InstructorStudents />;
//       break;
//     case 'courses':
//       mainContent = <InstructorCourses />;
//       break;
//     case 'profile':
//       mainContent = <InstructorsProfile />;
//       break;
//     case 'discussions':
//       mainContent = <InstructorDiscussions />;
//       break;
//     default:
//       mainContent = renderDashboard();
//   }

//   return (
//     <div className="flex h-screen bg-gray-50">
//       {/* Mobile sidebar backdrop */}
//       {isSidebarOpen && (
//         <div 
//           className="fixed inset-0 z-20 bg-black bg-opacity-50 md:hidden"
//           onClick={() => setIsSidebarOpen(false)}
//         ></div>
//       )}

//       {/* Sidebar */}
//       <div className={`
//         fixed inset-y-0 left-0 z-30 w-64 bg-white shadow-lg transition-transform duration-300 ease-in-out transform
//         ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
//         md:relative md:translate-x-0
//       `}>
//         {/* Sidebar Header */}
//         <div className="flex items-center justify-between h-16 px-6 border-b border-gray-200">
//           <div className="flex items-center">
//             <div className="bg-gradient-to-r from-orange-400 to-orange-500 p-2 rounded-full">
//               <BookOpen className="h-6 w-6 text-white" />
//             </div>
//             <h2 className="ml-3 text-xl font-bold text-gray-800">LearningHub</h2>
//           </div>
//           <button onClick={() => setIsSidebarOpen(false)} className="md:hidden text-gray-500">
//             <X className="h-6 w-6" />
//           </button>
//         </div>

//         {/* Sidebar Navigation */}
//         <div className="px-2 py-4 h-full flex flex-col">
//           <div className="flex-1 space-y-1">
//             {menuItems.map((item) => (
//               <button
//                 key={item.id}
//                 onClick={() => {
//                   item.onClick();
//                   closeSidebar();
//                 }}
//                 className={`
//                   w-full flex items-center px-4 py-3 text-sm rounded-lg transition-colors
//                   ${activeView === item.id
//                     ? 'bg-orange-500 text-white'
//                     : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
//                   }
//                 `}
//               >
//                 <span className="mr-3">{item.icon}</span>
//                 <span>{item.label}</span>
//               </button>
//             ))}
//           </div>
//         </div>
//       </div>

//       {/* Main Content */}
//       <div className="flex-1 flex flex-col overflow-hidden">
//         {/* Top Header */}
//         <header className="bg-white shadow-sm px-6 py-3">
//           <div className="flex items-center justify-between">
//             <div className="flex items-center">
//               <button
//                 onClick={() => setIsSidebarOpen(!isSidebarOpen)}
//                 className="text-gray-500 mr-4 md:hidden"
//               >
//                 <Menu className="h-6 w-6" />
//               </button>
//               <h1 className="text-xl font-bold text-gray-800 hidden md:block">
//                 {activeView === 'dashboard' && 'Instructor Dashboard'}
//                 {activeView === 'students' && 'My Students'}
//                 {activeView === 'courses' && 'My Courses'}
//                 {activeView === 'profile' && 'My Profile'}
//                 {activeView === 'discussions' && 'Discussions'}
//               </h1>
//             </div>
//             <div className="flex items-center space-x-4">
//               <div className="relative">
//                 <button className="flex items-center focus:outline-none">
//                   <span className="mr-2 text-sm font-medium text-gray-700 hidden md:block">{firstName}</span>
//                   <div className="h-8 w-8 rounded-full bg-orange-100 flex items-center justify-center">
//                     <User className="h-5 w-5 text-orange-600" />
//                   </div>
//                   <ChevronDown className="h-4 w-4 ml-1 text-gray-500" />
//                 </button>
//               </div>
//             </div>
//           </div>
//         </header>

//         {/* Main Content */}
//         <main className="flex-1 overflow-y-auto bg-gray-50 p-6">
//           {mainContent}
//         </main>
//       </div>
//     </div>
//   );
// };

// export default InstructorsDashboardPage;

import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import { 
  BookOpen, 
  BarChart2, 
  User, 
  Users, 
  MessageSquare, 
  LogOut, 
  Menu, 
  X,
  ChevronDown,
  Clock,
  DollarSign,
  Award,
  TrendingUp,
  Edit,
  Eye,
  Plus
} from 'lucide-react';
import { 
  collection, 
  query, 
  where, 
  getDocs, 
  orderBy, 
  limit 
} from 'firebase/firestore';
import { db } from '../../firebase';
import InstructorsProfile from './InstructorsProfile';
import InstructorStudents from './InstructorStudents';
import InstructorCourses from './InstructorCourses';
import InstructorDiscussions from './InstructorDiscussions';

const InstructorsDashboardPage = () => {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [activeView, setActiveView] = useState('dashboard');
  
  // State for dashboard data
  const [instructorCourses, setInstructorCourses] = useState([]);
  const [totalStudents, setTotalStudents] = useState(0);
  const [totalEarnings, setTotalEarnings] = useState(0);
  const [avgRating, setAvgRating] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Get instructor name from currentUser
  const instructorName = currentUser?.displayName || currentUser?.email?.split('@')[0] || 'Instructor';
  const firstName = instructorName.split(' ')[0];

  // Quotes for inspiration
  const quotes = [
    {
      text: "Education is not the filling of a pail, but the lighting of a fire.",
      author: "William Butler Yeats"
    },
    {
      text: "The beautiful thing about learning is that nobody can take it away from you.",
      author: "B.B. King"
    },
    {
      text: "Tell me and I forget. Teach me and I remember. Involve me and I learn.",
      author: "Benjamin Franklin"
    },
    {
      text: "The mediocre teacher tells. The good teacher explains. The superior teacher demonstrates. The great teacher inspires.",
      author: "William Arthur Ward"
    },
    {
      text: "Education is the most powerful weapon which you can use to change the world.",
      author: "Nelson Mandela"
    }
  ];
  
  // Pick a random quote
  const randomQuote = quotes[Math.floor(Math.random() * quotes.length)];

  // Handle logout with proper navigation
  const handleLogout = async () => {
    try {
      await logout();
      navigate('/'); // Navigate to login page after logout
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };
  
  // Fetch instructor data
  useEffect(() => {
    const fetchInstructorData = async () => {
      if (!currentUser) return;
      
      try {
        setLoading(true);
        
        // Fetch instructor's courses
        const coursesQuery = query(
          collection(db, 'courses'),
          where('instructorId', '==', currentUser.uid),
          orderBy('createdAt', 'desc')
        );
        
        const coursesSnapshot = await getDocs(coursesQuery);
        
        const coursesData = coursesSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        
        setInstructorCourses(coursesData);
        
        // Calculate stats from courses
        let students = 0;
        let earnings = 0;
        let totalRating = 0;
        let coursesWithRating = 0;
        
        coursesData.forEach(course => {
          // Add enrolled students
          students += course.enrolledStudents || 0;
          
          // Calculate earnings (enrolled students * course price)
          earnings += (course.enrolledStudents || 0) * (course.price || 0);
          
          // Add ratings
          if (course.rating) {
            totalRating += course.rating;
            coursesWithRating++;
          }
        });
        
        setTotalStudents(students);
        setTotalEarnings(earnings);
        setAvgRating(coursesWithRating > 0 ? (totalRating / coursesWithRating).toFixed(1) : 0);
        
        setError(null);
      } catch (err) {
        console.error('Error fetching instructor data:', err);
        setError('Failed to load dashboard data. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchInstructorData();
  }, [currentUser]);

  // Function to close sidebar on mobile
  const closeSidebar = () => {
    if (window.innerWidth < 768) {
      setIsSidebarOpen(false);
    }
  };

  // Sidebar menu items
  const menuItems = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: <BarChart2 className="h-5 w-5" />,
      onClick: () => setActiveView('dashboard')
    },
    {
      id: 'students',
      label: 'Students',
      icon: <Users className="h-5 w-5" />,
      onClick: () => setActiveView('students')
    },
    {
      id: 'courses',
      label: 'Courses',
      icon: <BookOpen className="h-5 w-5" />,
      onClick: () => setActiveView('courses')
    },
    {
      id: 'profile',
      label: 'Profile',
      icon: <User className="h-5 w-5" />,
      onClick: () => setActiveView('profile')
    },
    {
      id: 'discussions',
      label: 'Discussions',
      icon: <MessageSquare className="h-5 w-5" />,
      onClick: () => setActiveView('discussions')
    },
    {
      id: 'logout',
      label: 'Logout',
      icon: <LogOut className="h-5 w-5" />,
      onClick: handleLogout
    }
  ];

  // Render dashboard content
  const renderDashboard = () => (
    <div className="space-y-8">
      {/* Welcome Section with Quote */}
      <div className="bg-gradient-to-r from-orange-400 to-orange-500 rounded-xl p-8 text-white">
        <h2 className="text-2xl md:text-3xl font-bold mb-3">Welcome back, {firstName}!</h2>
        <p className="mb-6">Here's an overview of your teaching activities and student progress.</p>
        
        {/* Inspirational Quote */}
        <div className="bg-white bg-opacity-10 p-6 rounded-lg backdrop-blur-sm">
          <p className="text-lg md:text-xl italic text-white mb-2">"{randomQuote.text}"</p>
          <p className="text-sm text-orange-100 text-right">— {randomQuote.author}</p>
        </div>
      </div>

      

      {/* Your Courses Section */}
      <div>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-gray-800">Your Published Courses</h2>
          <Link 
            to="/instructor/courses"
            className="text-orange-500 hover:text-orange-600 flex items-center font-medium"
          >
            View All Courses
            <ChevronDown className="h-4 w-4 ml-1 transform rotate-270" />
          </Link>
        </div>
        
        {loading ? (
          <div className="bg-white rounded-xl p-8 text-center">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-orange-500 border-r-transparent"></div>
            <p className="mt-4 text-gray-600">Loading courses...</p>
          </div>
        ) : error ? (
          <div className="bg-white rounded-xl p-8 text-center">
            <p className="text-red-500">{error}</p>
          </div>
        ) : instructorCourses.length === 0 ? (
          <div className="bg-white rounded-xl p-12 text-center">
            <div className="bg-orange-100 h-16 w-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <BookOpen className="h-8 w-8 text-orange-500" />
            </div>
            <h3 className="text-xl font-medium text-gray-700 mb-2">No courses published yet</h3>
            <p className="text-gray-500 mb-6 max-w-md mx-auto">
              Get started by creating your first course. Share your knowledge and expertise with students around the world.
            </p>
            <Link 
              to="/instructor/courses"
              className="px-6 py-2 bg-gradient-to-r from-orange-400 to-orange-500 text-white rounded-lg hover:from-orange-500 hover:to-orange-600"
            >
              Create Your First Course
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {instructorCourses.slice(0, 6).map(course => (
              <div key={course.id} className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-lg transition-shadow border border-gray-100">
                {/* Course Image */}
                <div className="relative">
                  <img 
                    src={course.imageUrl || "https://img.freepik.com/free-photo/ai-nuclear-energy-background-future-innovation-disruptive-technology_53876-129783.jpg"} 
                    alt={course.title} 
                    className="w-full h-48 object-cover"
                  />
                  <div className="absolute top-4 left-4 bg-orange-500 text-white text-xs font-bold px-2 py-1 rounded">
                    {course.category || 'General'}
                  </div>
                  <div className={`absolute top-4 right-4 px-2 py-1 text-xs font-bold text-white rounded-full ${
                    course.status === 'published' ? 'bg-green-500' : 'bg-yellow-500'
                  }`}>
                    {course.status === 'published' ? 'Published' : 'Draft'}
                  </div>
                </div>
                
                {/* Course Content */}
                <div className="p-5">
                  <h3 className="font-bold text-lg text-gray-800 mb-2 line-clamp-2">{course.title}</h3>
                  
                  <div className="flex flex-wrap items-center text-sm text-gray-600 mb-4">
                    <div className="flex items-center mr-4 mb-2">
                      <Award className="h-4 w-4 text-yellow-400 mr-1" />
                      <span>{course.rating || '0'} Rating</span>
                    </div>
                    <div className="flex items-center mb-2">
                      <Users className="h-4 w-4 text-gray-400 mr-1" />
                      <span>{course.enrolledStudents || 0} students</span>
                    </div>
                  </div>
                  
                  {/* Price and Buttons */}
                  <div className="flex justify-between items-center">
                    <div className="font-bold text-lg text-orange-500">
                      ${course.price?.toFixed(2) || '0.00'}
                    </div>
                    <div className="flex space-x-2">
                      <Link
                        to={`/instructor/courses?edit=${course.id}`}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded"
                        title="Edit Course"
                      >
                        <Edit className="h-5 w-5" />
                      </Link>
                      <Link
                        to={`/course-view/${course.id}`}
                        className="p-2 text-green-600 hover:bg-green-50 rounded"
                        title="View Course"
                      >
                        <Eye className="h-5 w-5" />
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
        
        {/* Create New Course Button */}
        {instructorCourses.length > 0 && (
          <div className="mt-8 text-center">
            <Link 
              to="/instructor/courses" 
              className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-orange-400 to-orange-500 text-white rounded-lg hover:from-orange-500 hover:to-orange-600 shadow-md"
            >
              <Plus className="h-5 w-5 mr-2" />
              Create New Course
            </Link>
          </div>
        )}
      </div>

      
    </div>
  );

  // Conditional rendering based on active view
  let mainContent;
  switch (activeView) {
    case 'students':
      mainContent = <InstructorStudents />;
      break;
    case 'courses':
      mainContent = <InstructorCourses />;
      break;
    case 'profile':
      mainContent = <InstructorsProfile />;
      break;
    case 'discussions':
      mainContent = <InstructorDiscussions />;
      break;
    default:
      mainContent = renderDashboard();
  }

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Mobile sidebar backdrop */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 z-20 bg-black bg-opacity-50 md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        ></div>
      )}

      {/* Sidebar */}
      <div className={`
        fixed inset-y-0 left-0 z-30 w-64 bg-white shadow-lg transition-transform duration-300 ease-in-out transform
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        md:relative md:translate-x-0
      `}>
        {/* Sidebar Header */}
        <div className="flex items-center justify-between h-16 px-6 border-b border-gray-200">
          <div className="flex items-center">
            <div className="bg-gradient-to-r from-orange-400 to-orange-500 p-2 rounded-full">
              <BookOpen className="h-6 w-6 text-white" />
            </div>
            <h2 className="ml-3 text-xl font-bold text-gray-800">LearningHub</h2>
          </div>
          <button onClick={() => setIsSidebarOpen(false)} className="md:hidden text-gray-500">
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Sidebar Navigation */}
        <div className="px-2 py-4 h-full flex flex-col">
          <div className="flex-1 space-y-1">
            {menuItems.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  item.onClick();
                  closeSidebar();
                }}
                className={`
                  w-full flex items-center px-4 py-3 text-sm rounded-lg transition-colors
                  ${activeView === item.id
                    ? 'bg-orange-500 text-white'
                    : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                  }
                `}
              >
                <span className="mr-3">{item.icon}</span>
                <span>{item.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Header */}
        <header className="bg-white shadow-sm px-6 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <button
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                className="text-gray-500 mr-4 md:hidden"
              >
                <Menu className="h-6 w-6" />
              </button>
              <h1 className="text-xl font-bold text-gray-800 hidden md:block">
                {activeView === 'dashboard' && 'Instructor Dashboard'}
                {activeView === 'students' && 'My Students'}
                {activeView === 'courses' && 'My Courses'}
                {activeView === 'profile' && 'My Profile'}
                {activeView === 'discussions' && 'Discussions'}
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <div className="relative">
                <button className="flex items-center focus:outline-none">
                  <span className="mr-2 text-sm font-medium text-gray-700 hidden md:block">{firstName}</span>
                  <div className="h-8 w-8 rounded-full bg-orange-100 flex items-center justify-center">
                    <User className="h-5 w-5 text-orange-600" />
                  </div>
                  <ChevronDown className="h-4 w-4 ml-1 text-gray-500" />
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto bg-gray-50 p-6">
          {mainContent}
        </main>
      </div>
    </div>
  );
};

export default InstructorsDashboardPage;