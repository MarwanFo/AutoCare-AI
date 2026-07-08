import React from 'react';
import { Outlet } from 'react-router-dom';

const AuthLayout = () => {
  return (
    <main className="min-h-screen flex items-center justify-center p-6 md:p-10 bg-[#131313] relative overflow-hidden font-sans text-white antialiased">
      {/* Abstract background glows */}
      <div className="absolute top-[-20%] right-[-10%] w-[60vw] h-[60vw] rounded-full bg-[#abc7ff] opacity-[0.03] blur-[100px] pointer-events-none"></div>
      <div className="absolute bottom-[-20%] left-[-10%] w-[40vw] h-[40vw] rounded-full bg-white opacity-[0.03] blur-[80px] pointer-events-none"></div>
      
      <div className="w-full max-w-md z-10">
        <Outlet />
      </div>
    </main>
  );
};

export default AuthLayout;
