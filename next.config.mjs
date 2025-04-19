/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  async rewrites() {
    return [
      { source: "/login", destination: "/auth/Login" },
      { source: "/signup", destination: "/auth/Signup" },
      { source: "/forgot-password", destination: "/auth/ForgotPassword" },
      { source: "/reset-password/:id/:token", destination: "/auth/ChangePassword" },
      { source: "/change-success", destination: "/auth/ChangeSuccess" },
      { source: "/email-sent", destination: "/auth/EmailSent" },
      { source: "/allow-voters", destination: "/allowd-voters" },
      { source: "/candidate-registration", destination: "/candidate-registration" },
      { source: "/voter-list", destination: "/voterList" },
      { source: "/admin-login", destination: "/adminAuth/LoginAdmin" },
      { source: "/home-user", destination: "/HomeUser" },
      { source: "/dashboard", destination: "/admin/Dashboard" },
      { source: "/upload", destination: "/UploadFile" },
      { source: "/CandDet/:id", destination: "/CandDetUser" },
      { source: "/Candidates", destination: "/CandidatesUser" },
      { source: "/sessions", destination: "/admin/Sessions" },  
      { source: "/results", destination: "/admin/Results" },    
      { source: "/archives", destination: "/admin/Archives" },  

    ];
  },
};

export default nextConfig;
