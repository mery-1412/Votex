import Link from 'next/link';
import { useState } from 'react';

function NavBar() {
  const [navbar, setNavbar] = useState(false);

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
          <Link href="#about" className="hover:text-purple-400 transition">About</Link>
          <Link href="#blog" className="hover:text-purple-400 transition">Blogs</Link>
          <Link href="#contact" className="hover:text-purple-400 transition">Contact</Link>
          <Link href="#projects" className="hover:text-purple-400 transition">Projects</Link>
        </div>

        {/* LOGIN BUTTON (Right) */}
        <div className="hidden md:flex flex-1 justify-end">
          <Link href="/login">
            <button className="gradient-border-button rounded-md">
              LOG IN
            </button>
          </Link>
        </div>

        {/* HAMBURGER BUTTON FOR MOBILE */}
        <div className="md:hidden">
          <button
            className="text-white text-2xl focus:outline-none"
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
        } md:hidden flex flex-col items-center justify-center py-20 space-y-6`}
      >
        {/* CLOSE BUTTON INSIDE MOBILE MENU */}
        <button
          className="absolute top-6 right-6 text-white text-3xl focus:outline-none"
          onClick={() => setNavbar(false)}
        >
          ✖
        </button>

        <Link href="#about" onClick={() => setNavbar(false)} className="hover:text-purple-400 text-xl">About</Link>
        <Link href="#blog" onClick={() => setNavbar(false)} className="hover:text-purple-400 text-xl">Blogs</Link>
        <Link href="#contact" onClick={() => setNavbar(false)} className="hover:text-purple-400 text-xl">Contact</Link>
        <Link href="#projects" onClick={() => setNavbar(false)} className="hover:text-purple-400 text-xl">Projects</Link>

        {/* LOGIN BUTTON IN MOBILE MENU */}
        <Link href="/login">
          <button className="gradient-border-button rounded-md">
            LOG IN
          </button>
        </Link>
      </div>
    </nav>
  );
}

export default NavBar;