import React from 'react';

const Contact = () => {
  return (
    <div className="min-h-screen flex items-center justify-center " id="contact">
      {/* CONTACT SECTION */}
      <div className="p-6 max-w-4xl w-full flex flex-col md:flex-row gap-6">
        {/* CONTACT INFO (LEFT) */}
        <div className="text-white space-y-4 flex-1">
          <h2 className="text-2xl font-bold">Contact Us</h2>
          <p className="text-sm">
            Have questions or need assistance? Reach out to us!
          </p>
          <div className="space-y-2">
            <p className="text-base flex items-center"> {/* Increased to text-base */}
              <span className="mr-2">📧</span> Email: evoting@gmail.com
            </p>
            <p className="text-base flex items-center"> {/* Increased to text-base */}
              <span className="mr-2">📞</span> Phone: +1 (213 234 342 12) 
            </p>
            <p className="text-base flex items-center"> {/* Increased to text-base */}
              <span className="mr-2">📍</span> Address: 123 Main St, City, Country
            </p>
          </div>
        </div>

        {/* GLASSY CONTACT FORM (RIGHT) */}
        <form className="flex-1 space-y-4 bg-white/20 backdrop-blur-md rounded-lg border border-white/20 p-6 shadow-lg">
          <input
            type="text"
            placeholder="Your Name"
            className="w-full px-4 py-2 bg-white/20 backdrop-blur-sm rounded-lg border border-white/20 text-white placeholder-white/50 focus:outline-none focus:border-purple-400"
          />
          <input
            type="email"
            placeholder="Your Email"
            className="w-full px-4 py-2 bg-white/20 backdrop-blur-sm rounded-lg border border-white/20 text-white placeholder-white/50 focus:outline-none focus:border-purple-400"
          />
          <textarea
            placeholder="Your Message"
            rows="4"
            className="w-full px-4 py-2 bg-white/20 backdrop-blur-sm rounded-lg border border-white/20 text-white placeholder-white/50 focus:outline-none focus:border-purple-400"
          ></textarea>
          <button
            type="submit"
            className="w-full bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded-lg transition-all"
          >
            Send Message
          </button>
        </form>
      </div>
    </div>
  );
};

export default Contact;