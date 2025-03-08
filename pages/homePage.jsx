import NavBar from '@/components/NavBar/NavBar'
import Heroo from "@/components/HeroSection/Heroo"; 
import About from '@/components/About/About';
import  Contact  from '@/components/Contact/Contact';
import Footer from '@/components/Footer/Footer';


const HomePage = () => {
  return (
    <div>
      <NavBar/>
      <Heroo/>
      <About/>
      <Contact/>
      <Footer/>
   
    </div>
  )
}

export default HomePage
