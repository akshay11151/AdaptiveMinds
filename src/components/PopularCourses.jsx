import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Star, Clock, Users, ChevronRight } from 'lucide-react';
import { collection, query, orderBy, limit, getDocs, where } from 'firebase/firestore';
import { db } from '../../firebase';

const CourseCard = ({ image, category, title, rating, students, duration, price, instructor, id }) => {
  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow border border-gray-100">
      {/* Course Image */}
      <div className="relative">
        <img 
          src={image || "https://img.freepik.com/free-vector/website-development-banner_33099-1687.jpg?semt=ais_hybrid"} 
          alt={title} 
          className="w-full h-48 object-cover"
        />
        <div className="absolute top-4 left-4 bg-orange-500 text-white text-xs font-bold px-2 py-1 rounded">
          {category}
        </div>
      </div>
      
      {/* Course Content */}
      <div className="p-5">
        <h3 className="font-bold text-lg text-gray-800 mb-2 line-clamp-2">{title}</h3>
        
        {/* Rating and Info */}
        <div className="flex items-center text-sm text-gray-600 mb-4">
          <div className="flex items-center mr-4">
            <Star className="h-4 w-4 text-yellow-400 mr-1" />
            <span>{rating}</span>
          </div>
          <div className="flex items-center mr-4">
            <Users className="h-4 w-4 text-gray-400 mr-1" />
            <span>{students} students</span>
          </div>
          <div className="flex items-center">
            <Clock className="h-4 w-4 text-gray-400 mr-1" />
            <span>{duration}</span>
          </div>
        </div>
        
        {/* Instructor */}
        <div className="text-sm text-gray-600 mb-4">
          Instructor: <span className="font-medium">{instructor}</span>
        </div>
        
        {/* Price and Button */}
        <div className="flex justify-between items-center">
          <div className="font-bold text-lg text-orange-500">
            ${price}
          </div>
          <Link to="/courses" className="flex items-center text-sm font-medium text-orange-500 hover:text-orange-600 transition-colors">
            View Course
            <ChevronRight className="h-4 w-4 ml-1" />
          </Link>
        </div>
      </div>
    </div>
  );
};

const PopularCourses = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        setLoading(true);
        
        // Create query to get published courses, sorted by enrollment count
        const coursesQuery = query(
          collection(db, 'courses'),
          where('status', '==', 'published'),
          orderBy('enrolledStudents', 'desc'),
          limit(8)
        );
        
        const querySnapshot = await getDocs(coursesQuery);
        
        const coursesData = querySnapshot.docs.map(doc => {
          const data = doc.data();
          return {
            id: doc.id,
            title: data.title || 'Unnamed Course',
            description: data.description || '',
            category: data.category || 'General',
            price: data.price ? data.price.toFixed(2) : '0.00',
            rating: data.rating ? data.rating.toFixed(1) : '0.0',
            students: data.enrolledStudents ? `${data.enrolledStudents}` : '0',
            image: data.imageUrl || null,
            instructor: data.instructorName || 'Unknown Instructor',
            duration: data.duration || data.sections 
              ? `${data.sections.reduce((total, section) => total + section.videos.length, 0)} videos` 
              : 'Self-paced'
          };
        });
        
        setCourses(coursesData);
        setError(null);
      } catch (err) {
        console.error('Error fetching courses:', err);
        setError('Failed to load courses. Please try again.');
        
        // Fallback to sample data if Firestore fetch fails
        setCourses(sampleCourses);
      } finally {
        setLoading(false);
      }
    };
    
    fetchCourses();
  }, []);

  // Sample courses data as fallback
  const sampleCourses = [
    {
      id: 1,
      image: "https://img.freepik.com/free-vector/website-development-banner_33099-1687.jpg?semt=ais_hybrid",
      category: "Web Development",
      title: "Complete JavaScript Course: From Zero to Expert",
      rating: "4.8",
      students: "15.4K",
      duration: "24h 30m",
      price: "59.99",
      instructor: "John Smith"
    },
    {
      id: 2,
      image: "https://static.vecteezy.com/system/resources/thumbnails/005/442/693/small_2x/data-science-analytics-internet-and-technology-concept-concept-photo.jpg",
      category: "Data Science",
      title: "Python for Data Science and Machine Learning Bootcamp",
      rating: "4.9",
      students: "12.2K",
      duration: "30h 45m",
      price: "69.99",
      instructor: "Sarah Johnson"
    },
    {
      id: 3,
      image: "https://img.freepik.com/free-vector/app-development-banner_33099-1720.jpg",
      category: "Mobile Development",
      title: "iOS App Development with Swift 5",
      rating: "4.7",
      students: "8.3K",
      duration: "22h 15m",
      price: "64.99",
      instructor: "Michael Chen"
    },
    {
      id: 4,
      image: "https://www.shutterstock.com/image-photo/digital-marketing-business-technology-banner-600nw-2229459565.jpg",
      category: "Marketing",
      title: "Digital Marketing Masterclass: Get Your First 1,000 Customers",
      rating: "4.6",
      students: "9.1K",
      duration: "18h 20m",
      price: "19.99",
      instructor: "Emily Richards"
    }
  ];

  // Loading state
  if (loading) {
    return (
      <section className="py-16">
        <div className="container mx-auto px-6">
          <div className="text-center">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-orange-500 border-r-transparent"></div>
            <p className="mt-4 text-gray-600">Loading courses...</p>
          </div>
        </div>
      </section>
    );
  }

  // Error state with fallback data
  if (error && courses.length === 0) {
    return (
      <section className="py-16">
        <div className="container mx-auto px-6">
          <div className="text-center mb-8 text-red-500">
            <p>{error}</p>
          </div>
          {/* Still render sample courses for better UX */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {sampleCourses.map(course => (
              <CourseCard key={course.id} {...course} />
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16">
      <div className="container mx-auto px-6">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-12">
          <div>
            <h2 className="text-3xl font-bold text-gray-800 mb-2">Popular Courses</h2>
            <p className="text-gray-600">Explore our most popular courses that students love</p>
          </div>
          <Link to="/courses" className="mt-4 md:mt-0 bg-gradient-to-r from-orange-400 to-orange-500 hover:from-orange-500 hover:to-orange-600 text-white px-5 py-2 rounded-lg transition-colors font-medium">
            View All Courses
          </Link>
        </div>
        
        {/* Courses Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {courses.slice(0, 8).map(course => (
            <CourseCard 
              key={course.id}
              id={course.id}
              image={course.image}
              category={course.category}
              title={course.title}
              rating={course.rating}
              students={course.students}
              duration={course.duration}
              price={course.price}
              instructor={course.instructor}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default PopularCourses;