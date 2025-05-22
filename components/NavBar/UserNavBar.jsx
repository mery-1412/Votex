import Link from 'next/link';
import { useState ,useContext} from 'react';
import { AuthContext } from '@/pages/context/AuthContext';

function NavBar() {
  const [navbar, setNavbar] = useState(false);
  const {  logout } = useContext(AuthContext);

  return (
    <nav className="w-full fixed top-0 left-0 right-0 z-10">
      <div className="flex justify-between items-center px-6 py-4 mx-auto lg:max-w-7xl md:px-8">
        {/* LOGO */}
        <div className="flex-1">
          <Link href="/">
            <img src="assets/logo.png" alt="" className="w-16 h-16" />
          </Link>
        </div>

        {/* NAV LINKS FOR DESKTOP (Centered) */}
        <div className="hidden md:flex flex-1 justify-center space-x-6 text-white text-lg">
        <Link href="/home-user" onClick={() => setNavbar(false)} className="hover:text-purple-400 text-xl">Home</Link>
        <Link href="#about" onClick={() => setNavbar(false)} className="hover:text-purple-400 text-xl">About</Link>
        <Link href="/Candidates" onClick={() => setNavbar(false)} className="hover:text-purple-400 text-xl">Candidate</Link>
        <Link href="/results-user" onClick={() => setNavbar(false)} className="hover:text-purple-400 text-xl">Results</Link>
        <Link href="#contact" onClick={() => setNavbar(false)} className="hover:text-purple-400 text-xl">Contact</Link>
        </div>

        {/* LOGIN BUTTON (Right) */}
        <div className="hidden md:flex flex-1 justify-end">
          <Link href="/login">
            <button className="gradient-border-button rounded-md" onClick={logout}>
              LOG OUT
            </button>
          </Link>
        </div>

        {/* HAMBURGER BUTTON FOR MOBILE */}
        <div className="md:hidden">
          <button
            className="text-white text-2xl focus:outline-none bg-opacity-30 backdrop-blur-md border border-white"
            onClick={() => setNavbar(!navbar)}
          >
            {navbar ? "" : "☰"} {/* Remove the "✖" here */}
          </button>
        </div>
      </div>

      {/* MOBILE MENU (Animated) */}
      <div
      className={`fixed inset-0 text-white transition-transform duration-300 ease-in-out ${
        navbar ? "translate-x-0 opacity-100" : "-translate-x-full opacity-0"
      } md:hidden flex flex-col items-center justify-center py-20 space-y-6 bg-white/10 backdrop-blur-lg`}
    >
  
        {/* CLOSE BUTTON INSIDE MOBILE MENU */}
        <button
          className="absolute top-6 right-6 text-white text-3xl focus:outline-none"
          onClick={() => setNavbar(false)}
        >
          ✖
        </button>
        <Link href="#home" onClick={() => setNavbar(false)} className="hover:text-purple-400 text-xl">Home</Link>
        <Link href="#about" onClick={() => setNavbar(false)} className="hover:text-purple-400 text-xl">About</Link>
        <Link href="#Candidates" onClick={() => setNavbar(false)} className="hover:text-purple-400 text-xl">Candidates</Link>
        <Link href="#results" onClick={() => setNavbar(false)} className="hover:text-purple-400 text-xl">Results</Link>
        <Link href="#contact" onClick={() => setNavbar(false)} className="hover:text-purple-400 text-xl">Contact</Link>
       

        {/* LOGIN BUTTON IN MOBILE MENU */}
        <Link href="/login">
          <button className="gradient-border-button rounded-md" onClick={logout}>
            LOG OUT
          </button>
        </Link>
      </div>
    </nav>
  );
}

export default NavBar;