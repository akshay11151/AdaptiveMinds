import React from 'react'
import PopularCourses from '../components/PopularCourses'
import Navbar from "../components/Navbar"
import Hero from '../components/Hero'
import Services from '../components/Services'
import Footer from '../components/Footer'

const LandingPage = () => {
  return (
    <div>
      <Navbar />
      <Hero />
      <Services />
      <PopularCourses />
      <Footer />
    </div>
  )
}

export default LandingPage