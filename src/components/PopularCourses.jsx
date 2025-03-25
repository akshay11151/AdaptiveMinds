import React from 'react';
import { Star, Clock, Users, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const CourseCard = ({ image, category, title, rating, students, duration, price, instructor }) => {
  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow border border-gray-100">
      {/* Course Image */}
      <div className="relative">
        <img 
          src={image} 
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
          <Link to={`/courses/${title.toLowerCase().replace(/\s+/g, '-')}`} className="flex items-center text-sm font-medium text-orange-500 hover:text-orange-600 transition-colors">
            View Details
            <ChevronRight className="h-4 w-4 ml-1" />
          </Link>
        </div>
      </div>
    </div>
  );
};

const PopularCourses = () => {
  // Sample courses data (in a real app, this would come from an API)
  const courses = [
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
        
        {/* Courses Grid - First Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
          {courses.slice(0, 4).map((course) => (
            <CourseCard 
              key={course.id}
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
        
        {/* Courses Grid - Second Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {courses.slice(4, 8).map((course) => (
            <CourseCard 
              key={course.id}
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