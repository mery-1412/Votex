import React from 'react'
import RequireAuth from './protectingRoutes/RequireAuth';
import UserNavBar from "../components/NavBar/UserNavBar"
import HeroUser from '@/components/HeroSection/HeroUser';
import About from '@/components/About/About';
import Contact from '@/components/Contact/Contact';
import Footer from '@/components/Footer/Footer';

const HomeUser = () => {
  return (
    <RequireAuth>
      <div className="user-pages">
        <UserNavBar/>
        <HeroUser/>
        <About/>
        <Contact/>
        <Footer/>
      </div>
    </RequireAuth>
  )
}

export default HomeUser


