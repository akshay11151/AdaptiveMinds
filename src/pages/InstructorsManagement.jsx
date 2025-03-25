import React, { useState } from 'react';
import { 
  Search, 
  PlusCircle, 
  Download, 
  Filter, 
  Edit, 
  Trash2, 
  MoreHorizontal, 
  Star,
  Eye,
  ChevronLeft,
  ChevronRight,
  Book,
  Users,
  Award
} from 'lucide-react';

const InstructorsManagement = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);

  // Sample instructor data
  const instructors = [
    {
      id: 1,
      name: 'Dr. Sarah Johnson',
      email: 'sarah@example.com',
      avatar: '/api/placeholder/40/40',
      rating: 4.9,
      students: 1245,
      courses: 5,
      category: 'Data Science',
      earnings: 52450,
      status: 'active',
      joinDate: '2022-03-15'
    },
    {
      id: 2,
      name: 'Prof. James Wilson',
      email: 'james@example.com',
      avatar: '/api/placeholder/40/40',
      rating: 4.7,
      students: 980,
      courses: 3,
      category: 'Business',
      earnings: 37820,
      status: 'active',
      joinDate: '2022-05-20'
    },
    {
      id: 3,
      name: 'Dr. Michael Chen',
      email: 'michael@example.com',
      avatar: '/api/placeholder/40/40',
      rating: 4.8,
      students: 1560,
      courses: 7,
      category: 'Computer Science',
      earnings: 64300,
      status: 'active',
      joinDate: '2021-11-10'
    },
    {
      id: 4,
      name: 'Emily Rodriguez',
      email: 'emily@example.com',
      avatar: '/api/placeholder/40/40',
      rating: 4.6,
      students: 720,
      courses: 2,
      category: 'Design',
      earnings: 28600,
      status: 'pending',
      joinDate: '2022-08-05'
    },
    {
      id: 5,
      name: 'Robert Thompson',
      email: 'robert@example.com',
      avatar: '/api/placeholder/40/40',
      rating: 4.5,
      students: 850,
      courses: 4,
      category: 'Marketing',
      earnings: 39750,
      status: 'inactive',
      joinDate: '2022-02-18'
    },
    {
      id: 6,
      name: 'Dr. Lisa Wang',
      email: 'lisa@example.com',
      avatar: '/api/placeholder/40/40',
      rating: 4.9,
      students: 1380,
      courses: 6,
      category: 'Data Science',
      earnings: 58200,
      status: 'active',
      joinDate: '2021-09-30'
    },
    {
      id: 7,
      name: 'David Miller',
      email: 'david@example.com',
      avatar: '/api/placeholder/40/40',
      rating: 4.7,
      students: 930,
      courses: 3,
      category: 'Web Development',
      earnings: 41500,
      status: 'active',
      joinDate: '2022-04-12'
    },
    {
      id: 8,
      name: 'Prof. Jennifer Adams',
      email: 'jennifer@example.com',
      avatar: '/api/placeholder/40/40',
      rating: 4.8,
      students: 1120,
      courses: 5,
      category: 'Business',
      earnings: 47300,
      status: 'pending',
      joinDate: '2022-06-22'
    }
  ];

  // Filter instructors based on search term, status, and category
  const filteredInstructors = instructors.filter(instructor => {
    const matchesSearch = 
      instructor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      instructor.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      instructor.category.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = selectedStatus === 'all' || instructor.status === selectedStatus;
    
    const matchesCategory = selectedCategory === 'all' || instructor.category === selectedCategory;
    
    return matchesSearch && matchesStatus && matchesCategory;
  });

  // Options for filters
  const statusOptions = [
    { value: 'all', label: 'All Status' },
    { value: 'active', label: 'Active' },
    { value: 'pending', label: 'Pending' },
    { value: 'inactive', label: 'Inactive' }
  ];
  
  // Extract unique categories from instructors
  const categories = ['all', ...new Set(instructors.map(instructor => instructor.category))];
  
  // Pagination
  const instructorsPerPage = 6;
  const totalPages = Math.ceil(filteredInstructors.length / instructorsPerPage);
  const indexOfLastInstructor = currentPage * instructorsPerPage;
  const indexOfFirstInstructor = indexOfLastInstructor - instructorsPerPage;
  const currentInstructors = filteredInstructors.slice(indexOfFirstInstructor, indexOfLastInstructor);

  const paginate = (pageNumber) => {
    if (pageNumber > 0 && pageNumber <= totalPages) {
      setCurrentPage(pageNumber);
    }
  };

  return (
    <div>
      {/* Action Bar */}
      <div className="mb-6 flex flex-col sm:flex-row sm:justify-between sm:items-center space-y-4 sm:space-y-0">
        <div className="flex items-center space-x-4">
          <div className="relative">
            <input
              type="text"
              placeholder="Search instructors..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent"
            />
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
          </div>
          
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent"
          >
            {statusOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent"
          >
            {categories.map(category => (
              <option key={category} value={category}>
                {category === 'all' ? 'All Categories' : category}
              </option>
            ))}
          </select>
        </div>
        
        <div className="flex items-center space-x-3">
          <button className="bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 transition-colors flex items-center">
            <PlusCircle className="h-5 w-5 mr-2" />
            Add Instructor
          </button>
          <button className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors flex items-center">
            <Download className="h-5 w-5 mr-2" />
            Export
          </button>
        </div>
      </div>

      {/* Instructors Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {currentInstructors.map(instructor => (
          <div key={instructor.id} className="bg-white rounded-xl shadow-sm overflow-hidden">
            {/* Card Header */}
            <div className="p-4 border-b border-gray-100 flex justify-between items-center">
              <div className="flex items-center">
                <img 
                  src={instructor.avatar} 
                  alt={instructor.name}
                  className="h-10 w-10 rounded-full object-cover"
                />
                <div className="ml-3">
                  <h3 className="text-gray-800 font-medium">{instructor.name}</h3>
                  <p className="text-sm text-gray-500">{instructor.email}</p>
                </div>
              </div>
              <div>
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                  instructor.status === 'active' 
                    ? 'bg-green-100 text-green-800' 
                    : instructor.status === 'pending'
                      ? 'bg-yellow-100 text-yellow-800'
                      : 'bg-red-100 text-red-800'
                }`}>
                  {instructor.status.charAt(0).toUpperCase() + instructor.status.slice(1)}
                </span>
              </div>
            </div>
            
            {/* Card Content */}
            <div className="p-4">
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="flex flex-col items-center p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center text-yellow-500 mb-1">
                    <Star className="h-5 w-5 fill-current" />
                    <span className="ml-1 font-medium text-gray-800">{instructor.rating}</span>
                  </div>
                  <p className="text-xs text-gray-500">Rating</p>
                </div>
                <div className="flex flex-col items-center p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center text-blue-500 mb-1">
                    <Users className="h-5 w-5" />
                    <span className="ml-1 font-medium text-gray-800">{instructor.students}</span>
                  </div>
                  <p className="text-xs text-gray-500">Students</p>
                </div>
                <div className="flex flex-col items-center p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center text-orange-500 mb-1">
                    <Book className="h-5 w-5" />
                    <span className="ml-1 font-medium text-gray-800">{instructor.courses}</span>
                  </div>
                  <p className="text-xs text-gray-500">Courses</p>
                </div>
                <div className="flex flex-col items-center p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center text-green-500 mb-1">
                    <Award className="h-5 w-5" />
                    <span className="ml-1 font-medium text-gray-800">${instructor.earnings.toLocaleString()}</span>
                  </div>
                  <p className="text-xs text-gray-500">Earnings</p>
                </div>
              </div>
              
              <div className="mb-4">
                <div className="flex justify-between items-center mb-1">
                  <p className="text-sm font-medium text-gray-700">Category</p>
                  <p className="text-sm text-gray-800">{instructor.category}</p>
                </div>
                <div className="flex justify-between items-center">
                  <p className="text-sm font-medium text-gray-700">Join Date</p>
                  <p className="text-sm text-gray-800">{new Date(instructor.joinDate).toLocaleDateString()}</p>
                </div>
              </div>
              
              <div className="flex justify-between pt-3 border-t border-gray-100">
                <button className="text-blue-600 hover:text-blue-900 flex items-center text-sm">
                  <Eye className="h-4 w-4 mr-1" />
                  View Profile
                </button>
                <div className="flex space-x-2">
                  <button className="text-blue-600 hover:text-blue-900">
                    <Edit className="h-5 w-5" />
                  </button>
                  <button className="text-red-600 hover:text-red-900">
                    <Trash2 className="h-5 w-5" />
                  </button>
                  <button className="text-gray-600 hover:text-gray-900">
                    <MoreHorizontal className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      {/* Empty state */}
      {filteredInstructors.length === 0 && (
        <div className="bg-white rounded-xl p-12 text-center">
          <div className="mx-auto h-12 w-12 text-gray-400">
            <Users className="h-12 w-12" />
          </div>
          <h3 className="mt-2 text-sm font-medium text-gray-900">No instructors found</h3>
          <p className="mt-1 text-sm text-gray-500">
            Try adjusting your search or filter to find what you're looking for.
          </p>
          <div className="mt-6">
            <button
              type="button"
              className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-orange-600 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
              onClick={() => {
                setSearchTerm('');
                setSelectedStatus('all');
                setSelectedCategory('all');
              }}
            >
              Clear filters
            </button>
          </div>
        </div>
      )}
      
      {/* Pagination */}
      {filteredInstructors.length > 0 && (
        <div className="mt-8 flex items-center justify-between">
          <div className="flex-1 flex justify-between sm:hidden">
            <button
              onClick={() => paginate(currentPage - 1)}
              disabled={currentPage === 1}
              className={`relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md ${
                currentPage === 1
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              Previous
            </button>
            <button
              onClick={() => paginate(currentPage + 1)}
              disabled={currentPage === totalPages}
              className={`relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md ${
                currentPage === totalPages
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              Next
            </button>
          </div>
          <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-gray-700">
                Showing <span className="font-medium">{indexOfFirstInstructor + 1}</span> to{' '}
                <span className="font-medium">
                  {indexOfLastInstructor > filteredInstructors.length ? filteredInstructors.length : indexOfLastInstructor}
                </span>{' '}
                of <span className="font-medium">{filteredInstructors.length}</span> instructors
              </p>
            </div>
            <div>
              <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                <button
                  onClick={() => paginate(currentPage - 1)}
                  disabled={currentPage === 1}
                  className={`relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 text-sm font-medium ${
                    currentPage === 1
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      : 'bg-white text-gray-500 hover:bg-gray-50'
                  }`}
                >
                  <span className="sr-only">Previous</span>
                  <ChevronLeft className="h-5 w-5" />
                </button>
                
                {/* Page numbers */}
                {[...Array(totalPages)].map((_, i) => (
                  <button
                    key={i}
                    onClick={() => paginate(i + 1)}
                    className={`relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium ${
                      currentPage === i + 1
                        ? 'z-10 bg-orange-50 border-orange-500 text-orange-600'
                        : 'bg-white text-gray-500 hover:bg-gray-50'
                    }`}
                  >
                    {i + 1}
                  </button>
                ))}
                
                <button
                  onClick={() => paginate(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className={`relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 text-sm font-medium ${
                    currentPage === totalPages
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      : 'bg-white text-gray-500 hover:bg-gray-50'
                  }`}
                >
                  <span className="sr-only">Next</span>
                  <ChevronRight className="h-5 w-5" />
                </button>
              </nav>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default InstructorsManagement;