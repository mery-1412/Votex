/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  async rewrites() {
    return [
      { source: "/login", destination: "/auth/Login" },
      { source: "/signup", destination: "/auth/Signup" },
      { source: "/forgot-password", destination: "/auth/ForgotPassword" },
      { source: "/change-password", destination: "/auth/ChangePassword" },
      { source: "/change-success", destination: "/auth/ChangeSuccess" },
      { source: "/email-sent", destination: "/auth/EmailSent" },
      { source: "/allow-voters", destination: "/allowd-voters" },
      { source: "/candidate-registration", destination: "/candidate-registration" },
      { source: "/voter-list", destination: "/voterList" },
      { source: "/admin-login", destination: "/adminAuth/LoginAdmin" },
      
      
    ];
  },
};

export default nextConfig;
