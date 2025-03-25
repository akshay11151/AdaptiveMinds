import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, Filter, Star, Clock, Users, ChevronDown, X } from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

// Dummy course data
const coursesData = [
  {
    id: 1,
    image: "https://developers.elementor.com/docs/assets/img/elementor-placeholder-image.png",
    category: "Web Development",
    title: "Complete JavaScript Course: From Zero to Expert",
    rating: 4.8,
    students: "15.4K",
    duration: "24h 30m",
    price: 59.99,
    instructor: "John Smith",
    level: "Beginner",
    tags: ["JavaScript", "Frontend", "ES6"]
  },
  {
    id: 2,
    image: "https://developers.elementor.com/docs/assets/img/elementor-placeholder-image.png",
    category: "Data Science",
    title: "Python for Data Science and Machine Learning Bootcamp",
    rating: 4.9,
    students: "12.2K",
    duration: "30h 45m",
    price: 69.99,
    instructor: "Sarah Johnson",
    level: "Intermediate",
    tags: ["Python", "Data Science", "Machine Learning"]
  },
  {
    id: 3,
    image: "https://developers.elementor.com/docs/assets/img/elementor-placeholder-image.png",
    category: "Mobile Development",
    title: "iOS App Development with Swift 5",
    rating: 4.7,
    students: "8.3K",
    duration: "22h 15m",
    price: 64.99,
    instructor: "Michael Chen",
    level: "Intermediate",
    tags: ["iOS", "Swift", "Mobile"]
  },
  {
    id: 4,
    image: "https://developers.elementor.com/docs/assets/img/elementor-placeholder-image.png",
    category: "Marketing",
    title: "Digital Marketing Masterclass: Get Your First 1,000 Customers",
    rating: 4.6,
    students: "9.1K",
    duration: "18h 20m",
    price: 49.99,
    instructor: "Emily Richards",
    level: "Beginner",
    tags: ["Marketing", "SEO", "Social Media"]
  },
  {
    id: 5,
    image: "https://developers.elementor.com/docs/assets/img/elementor-placeholder-image.png",
    category: "Business",
    title: "MBA in a Box: Business Strategy Fundamentals",
    rating: 4.8,
    students: "14.2K",
    duration: "26h 10m",
    price: 79.99,
    instructor: "Robert Wilson",
    level: "Advanced",
    tags: ["Business", "Strategy", "Management"]
  },
  {
    id: 6,
    image: "https://developers.elementor.com/docs/assets/img/elementor-placeholder-image.png",
    category: "Design",
    title: "UI/UX Design: Create Modern Web Experiences",
    rating: 4.9,
    students: "10.5K",
    duration: "20h 45m",
    price: 54.99,
    instructor: "Lisa Wong",
    level: "Intermediate",
    tags: ["UI", "UX", "Design"]
  },
  {
    id: 7,
    image: "https://developers.elementor.com/docs/assets/img/elementor-placeholder-image.png",
    category: "Web Development",
    title: "React - The Complete Guide with React Hooks and Redux",
    rating: 4.8,
    students: "16.7K",
    duration: "28h 30m",
    price: 69.99,
    instructor: "David Miller",
    level: "Intermediate",
    tags: ["React", "Redux", "JavaScript"]
  },
  {
    id: 8,
    image: "https://developers.elementor.com/docs/assets/img/elementor-placeholder-image.png",
    category: "Personal Development",
    title: "Productivity Masterclass: How to Achieve Your Goals",
    rating: 4.7,
    students: "7.8K",
    duration: "15h 15m",
    price: 44.99,
    instructor: "Anna Martinez",
    level: "Beginner",
    tags: ["Productivity", "Time Management", "Goal Setting"]
  },
  {
    id: 9,
    image: "https://developers.elementor.com/docs/assets/img/elementor-placeholder-image.png",
    category: "Web Development",
    title: "Full-Stack Web Development with Node.js and MongoDB",
    rating: 4.9,
    students: "11.3K",
    duration: "32h 20m",
    price: 74.99,
    instructor: "James Wilson",
    level: "Advanced",
    tags: ["Node.js", "MongoDB", "Express", "Backend"]
  },
  {
    id: 10,
    image: "https://developers.elementor.com/docs/assets/img/elementor-placeholder-image.png",
    category: "Data Science",
    title: "Deep Learning A-Z: Hands-On Artificial Neural Networks",
    rating: 4.8,
    students: "9.7K",
    duration: "28h 15m",
    price: 84.99,
    instructor: "Maria Garcia",
    level: "Advanced",
    tags: ["Deep Learning", "Neural Networks", "TensorFlow"]
  },
  {
    id: 11,
    image: "https://developers.elementor.com/docs/assets/img/elementor-placeholder-image.png",
    category: "Design",
    title: "Adobe Photoshop CC – Advanced Training Course",
    rating: 4.6,
    students: "8.9K",
    duration: "21h 10m",
    price: 59.99,
    instructor: "Thomas Brown",
    level: "Advanced",
    tags: ["Photoshop", "Graphic Design", "Adobe"]
  },
  {
    id: 12,
    image: "https://developers.elementor.com/docs/assets/img/elementor-placeholder-image.png",
    category: "Business",
    title: "Financial Modeling & Valuation Analyst Training",
    rating: 4.7,
    students: "7.2K",
    duration: "24h 30m",
    price: 69.99,
    instructor: "Jennifer Lee",
    level: "Intermediate",
    tags: ["Finance", "Excel", "Modeling"]
  }
];

// Course Card Component
const CourseCard = ({ course }) => {
  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow border border-gray-100">
      {/* Course Image */}
      <div className="relative">
        <img 
          src={course.image} 
          alt={course.title} 
          className="w-full h-48 object-cover"
        />
        <div className="absolute top-4 left-4 bg-orange-500 text-white text-xs font-bold px-2 py-1 rounded">
          {course.category}
        </div>
        <div className="absolute top-4 right-4 bg-gray-800 bg-opacity-75 text-white text-xs font-bold px-2 py-1 rounded">
          {course.level}
        </div>
      </div>
      
      {/* Course Content */}
      <div className="p-5">
        <h3 className="font-bold text-lg text-gray-800 mb-2 line-clamp-2">{course.title}</h3>
        
        {/* Rating and Info */}
        <div className="flex flex-wrap items-center text-sm text-gray-600 mb-4">
          <div className="flex items-center mr-4 mb-2">
            <Star className="h-4 w-4 text-yellow-400 mr-1" />
            <span>{course.rating}</span>
          </div>
          <div className="flex items-center mr-4 mb-2">
            <Users className="h-4 w-4 text-gray-400 mr-1" />
            <span>{course.students} students</span>
          </div>
          <div className="flex items-center mb-2">
            <Clock className="h-4 w-4 text-gray-400 mr-1" />
            <span>{course.duration}</span>
          </div>
        </div>
        
        {/* Tags */}
        <div className="flex flex-wrap gap-2 mb-4">
          {course.tags.map((tag, index) => (
            <span key={index} className="bg-orange-100 text-orange-600 text-xs px-2 py-1 rounded-full">
              {tag}
            </span>
          ))}
        </div>
        
        {/* Instructor */}
        <div className="text-sm text-gray-600 mb-4">
          Instructor: <span className="font-medium">{course.instructor}</span>
        </div>
        
        {/* Price and Button */}
        <div className="flex justify-between items-center">
          <div className="font-bold text-lg text-orange-500">
            ${course.price}
          </div>
          <Link 
            to={`/courses/${course.id}`} 
            className="bg-gradient-to-r from-orange-400 to-orange-500 text-white px-4 py-2 rounded-lg hover:from-orange-500 hover:to-orange-600 transition-colors text-sm font-medium"
          >
            Enroll Now
          </Link>
        </div>
      </div>
    </div>
  );
};

// Filter Dropdown Component
const FilterDropdown = ({ title, options, selectedOptions, toggleOption }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative mb-4">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex justify-between items-center px-4 py-2 bg-white border border-gray-300 rounded-lg shadow-sm"
      >
        <span className="font-medium">{title}</span>
        <ChevronDown className={`h-5 w-5 transition-transform ${isOpen ? 'transform rotate-180' : ''}`} />
      </button>
      
      {isOpen && (
        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg">
          <div className="p-3">
            {options.map((option) => (
              <div key={option} className="flex items-center mb-2 last:mb-0">
                <input
                  type="checkbox"
                  id={`${title}-${option}`}
                  checked={selectedOptions.includes(option)}
                  onChange={() => toggleOption(title.toLowerCase(), option)}
                  className="h-4 w-4 text-orange-500 focus:ring-orange-400 border-gray-300 rounded"
                />
                <label htmlFor={`${title}-${option}`} className="ml-2 text-sm text-gray-700">
                  {option}
                </label>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

const CoursesPage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [priceRange, setPriceRange] = useState([0, 100]);
  const [filters, setFilters] = useState({
    categories: [],
    levels: [],
    tags: []
  });
  const [filteredCourses, setFilteredCourses] = useState(coursesData);
  const [sortBy, setSortBy] = useState('popular');

  // Categories, levels, and tags for filters
  const categories = ["Web Development", "Data Science", "Mobile Development", "Marketing", "Business", "Design", "Personal Development"];
  const levels = ["Beginner", "Intermediate", "Advanced"];
  const tags = [...new Set(coursesData.flatMap(course => course.tags))].sort();

  // Apply filters and search
  useEffect(() => {
    let result = coursesData;
    
    // Apply search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(course => 
        course.title.toLowerCase().includes(query) || 
        course.instructor.toLowerCase().includes(query) ||
        course.category.toLowerCase().includes(query) ||
        course.tags.some(tag => tag.toLowerCase().includes(query))
      );
    }
    
    // Apply category filter
    if (filters.categories.length > 0) {
      result = result.filter(course => filters.categories.includes(course.category));
    }
    
    // Apply level filter
    if (filters.levels.length > 0) {
      result = result.filter(course => filters.levels.includes(course.level));
    }
    
    // Apply tags filter
    if (filters.tags.length > 0) {
      result = result.filter(course => 
        course.tags.some(tag => filters.tags.includes(tag))
      );
    }
    
    // Apply price range filter
    result = result.filter(course => 
      course.price >= priceRange[0] && course.price <= priceRange[1]
    );
    
    // Apply sorting
    switch(sortBy) {
      case 'price-low':
        result = [...result].sort((a, b) => a.price - b.price);
        break;
      case 'price-high':
        result = [...result].sort((a, b) => b.price - a.price);
        break;
      case 'rating':
        result = [...result].sort((a, b) => b.rating - a.rating);
        break;
      case 'newest':
        // In a real app, you'd sort by date
        result = [...result].sort((a, b) => b.id - a.id);
        break;
      case 'popular':
      default:
        // Sort by number of students (remove 'K' and convert to number)
        result = [...result].sort((a, b) => {
          const studentsA = parseFloat(a.students.replace('K', '')) * 1000;
          const studentsB = parseFloat(b.students.replace('K', '')) * 1000;
          return studentsB - studentsA;
        });
    }
    
    setFilteredCourses(result);
  }, [searchQuery, filters, priceRange, sortBy]);

  // Toggle filter option
  const toggleFilterOption = (filterType, option) => {
    setFilters(prevFilters => {
      const currentOptions = [...prevFilters[filterType]];
      
      if (currentOptions.includes(option)) {
        return {
          ...prevFilters,
          [filterType]: currentOptions.filter(item => item !== option)
        };
      } else {
        return {
          ...prevFilters,
          [filterType]: [...currentOptions, option]
        };
      }
    });
  };

  // Clear all filters
  const clearAllFilters = () => {
    setFilters({
      categories: [],
      levels: [],
      tags: []
    });
    setPriceRange([0, 100]);
    setSearchQuery('');
  };

  // Get active filter count
  const activeFilterCount = 
    filters.categories.length + 
    filters.levels.length + 
    filters.tags.length + 
    (priceRange[0] > 0 || priceRange[1] < 100 ? 1 : 0);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      {/* Page Header */}
      <div className="bg-gradient-to-r from-orange-400 to-orange-500 py-12">
        <div className="container mx-auto px-6 text-center">
          <h1 className="text-3xl font-bold text-white mb-4">Explore Our Courses</h1>
          <p className="text-orange-100 max-w-2xl mx-auto">
            Discover a wide range of high-quality courses taught by expert instructors to help you develop new skills and achieve your goals.
          </p>
          
          {/* Main Search Bar */}
          <div className="max-w-2xl mx-auto mt-8 relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search for courses, instructors, or topics..."
              className="w-full py-3 pl-12 pr-4 text-gray-700 bg-white rounded-xl shadow-md focus:outline-none focus:ring-2 focus:ring-orange-300"
            />
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
          </div>
        </div>
      </div>
      
      {/* Main Content */}
      <div className="container mx-auto px-6 py-12">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Left Sidebar - Filters */}
          <div className="lg:w-1/4">
            <div className="bg-white rounded-xl shadow-md p-6 sticky top-24">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-gray-800">Filters</h2>
                {activeFilterCount > 0 && (
                  <button 
                    onClick={clearAllFilters}
                    className="text-sm text-orange-500 hover:text-orange-600 font-medium flex items-center"
                  >
                    <X className="h-4 w-4 mr-1" /> Clear all
                  </button>
                )}
              </div>
              
              {/* Price Range */}
              <div className="mb-6">
                <h3 className="font-medium text-gray-800 mb-3">Price Range</h3>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-600">${priceRange[0]}</span>
                  <span className="text-sm text-gray-600">${priceRange[1]}</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={priceRange[0]}
                  onChange={(e) => setPriceRange([parseInt(e.target.value), priceRange[1]])}
                  className="w-full h-2 bg-orange-200 rounded-lg appearance-none cursor-pointer"
                />
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={priceRange[1]}
                  onChange={(e) => setPriceRange([priceRange[0], parseInt(e.target.value)])}
                  className="w-full h-2 bg-orange-200 rounded-lg appearance-none cursor-pointer mt-1"
                />
              </div>
              
              {/* Category Filter */}
              <FilterDropdown 
                title="Category" 
                options={categories}
                selectedOptions={filters.categories}
                toggleOption={toggleFilterOption}
              />
              
              {/* Level Filter */}
              <FilterDropdown 
                title="Level" 
                options={levels}
                selectedOptions={filters.levels}
                toggleOption={toggleFilterOption}
              />
              
              {/* Tags Filter */}
              <FilterDropdown 
                title="Tags" 
                options={tags}
                selectedOptions={filters.tags}
                toggleOption={toggleFilterOption}
              />
            </div>
          </div>
          
          {/* Right Side - Courses List */}
          <div className="lg:w-3/4">
            {/* Results Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
              <div className="mb-4 md:mb-0">
                <h2 className="text-xl font-bold text-gray-800">
                  {filteredCourses.length} {filteredCourses.length === 1 ? 'Course' : 'Courses'} Found
                </h2>
                {activeFilterCount > 0 && (
                  <p className="text-sm text-gray-600">
                    Filtered by: {activeFilterCount} {activeFilterCount === 1 ? 'filter' : 'filters'}
                  </p>
                )}
              </div>
              
              {/* Sort Options */}
              <div className="flex items-center">
                <label htmlFor="sort" className="text-sm text-gray-600 mr-2">Sort by:</label>
                <select
                  id="sort"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="bg-white border border-gray-300 text-gray-700 py-2 px-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-300"
                >
                  <option value="popular">Most Popular</option>
                  <option value="rating">Highest Rated</option>
                  <option value="newest">Newest</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                </select>
              </div>
            </div>
            
            {/* Active Filters */}
            {activeFilterCount > 0 && (
              <div className="flex flex-wrap gap-2 mb-6">
                {filters.categories.map(category => (
                  <div key={category} className="flex items-center bg-orange-100 text-orange-600 px-3 py-1 rounded-full text-sm">
                    {category}
                    <button 
                      onClick={() => toggleFilterOption('categories', category)}
                      className="ml-2"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ))}
                
                {filters.levels.map(level => (
                  <div key={level} className="flex items-center bg-orange-100 text-orange-600 px-3 py-1 rounded-full text-sm">
                    {level}
                    <button 
                      onClick={() => toggleFilterOption('levels', level)}
                      className="ml-2"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ))}
                
                {filters.tags.map(tag => (
                  <div key={tag} className="flex items-center bg-orange-100 text-orange-600 px-3 py-1 rounded-full text-sm">
                    {tag}
                    <button 
                      onClick={() => toggleFilterOption('tags', tag)}
                      className="ml-2"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ))}
                
                {(priceRange[0] > 0 || priceRange[1] < 100) && (
                  <div className="flex items-center bg-orange-100 text-orange-600 px-3 py-1 rounded-full text-sm">
                    Price: ${priceRange[0]} - ${priceRange[1]}
                    <button 
                      onClick={() => setPriceRange([0, 100])}
                      className="ml-2"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                )}
              </div>
            )}
            
            {/* Courses Grid */}
            {filteredCourses.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {filteredCourses.map(course => (
                  <CourseCard key={course.id} course={course} />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="bg-orange-100 rounded-full p-4 inline-block mb-4">
                  <Search className="h-8 w-8 text-orange-500" />
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-2">No courses found</h3>
                <p className="text-gray-600 mb-6">
                  Try adjusting your search or filter criteria to find courses.
                </p>
                <button 
                  onClick={clearAllFilters}
                  className="bg-gradient-to-r from-orange-400 to-orange-500 text-white px-6 py-3 rounded-lg hover:from-orange-500 hover:to-orange-600 transition-colors font-medium"
                >
                  Clear All Filters
                </button>
              </div>
            )}
            
            {/* Pagination - Would be implemented based on API response */}
            {filteredCourses.length > 0 && (
              <div className="flex justify-center mt-12">
                <div className="flex space-x-2">
                  <button className="px-4 py-2 border border-gray-300 rounded-lg bg-white text-gray-600 hover:bg-gray-50 disabled:opacity-50">
                    Previous
                  </button>
                  <button className="px-4 py-2 bg-orange-500 text-white rounded-lg">1</button>
                  <button className="px-4 py-2 border border-gray-300 rounded-lg bg-white text-gray-600 hover:bg-gray-50">2</button>
                  <button className="px-4 py-2 border border-gray-300 rounded-lg bg-white text-gray-600 hover:bg-gray-50">3</button>
                  <button className="px-4 py-2 border border-gray-300 rounded-lg bg-white text-gray-600 hover:bg-gray-50">
                    Next
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default CoursesPage;