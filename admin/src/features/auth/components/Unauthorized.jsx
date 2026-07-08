import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, LayoutDashboard, LifeBuoy } from 'lucide-react';

export const Unauthorized = () => {
  const navigate = useNavigate();
  const [mockSessionId, setMockSessionId] = useState('ACAI-882-990-X');
  const [mockIp, setMockIp] = useState('192.168.1.104');

  useEffect(() => {
    // Generate an administrative-style mock tracking id on mount
    const segment1 = Math.floor(100 + Math.random() * 900);
    const segment2 = Math.floor(100 + Math.random() * 900);
    setMockSessionId(`ACAI-${segment1}-${segment2}-X`);
  }, []);

  return (
    <div className="min-h-screen flex flex-col justify-between text-[#e5e2e1] antialiased select-none relative bg-[#131313]">
      
      {/* Background Atmospheric Glows */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute -top-[20%] -left-[10%] w-[60%] h-[60%] bg-[#abc7ff]/5 rounded-full blur-[120px]"></div>
        <div className="absolute -bottom-[20%] -right-[10%] w-[#046dd9]/5 rounded-full blur-[120px]"></div>
      </div>

      {/* Header Navigation Shell */}
      <header className="fixed top-0 w-full z-50 flex justify-between items-center px-6 md:px-10 h-16 bg-[#201f1f]/80 backdrop-blur-xl border-b border-[#444748]/30 shadow-2xl">
        <div className="flex items-center gap-2">
          <span className="font-sans text-[20px] md:text-[24px] font-bold text-white tracking-tight">AutoCare AI</span>
        </div>
        <div className="flex items-center gap-4">
          <span className="font-mono text-[12px] tracking-widest text-[#c4c7c8] uppercase">ADMIN CONSOLE</span>
        </div>
      </header>

      {/* Main Canvas Area */}
      <main className="flex-grow flex items-center justify-center relative px-6 py-24 z-10">
        <div className="max-w-md w-full text-center space-y-8">
          
          {/* Lock Icon Stack */}
          <div className="relative group">
            <div className="absolute inset-0 bg-[#abc7ff]/10 blur-3xl rounded-full scale-75 group-hover:scale-110 transition-transform duration-1000"></div>
            <div className="relative w-48 h-48 mx-auto bg-[#201f1f]/70 backdrop-blur-md rounded-full border border-[#444748]/50 flex items-center justify-center shadow-2xl">
              <div className="relative">
                <Lock className="h-20 w-20 text-[#abc7ff] transition-all duration-500 group-hover:scale-110" />
                {/* Scanning line effect */}
                <div className="absolute inset-x-0 top-0 h-[2px] bg-[#abc7ff]/40 blur-[1px] animate-[bounce_3s_infinite] opacity-50"></div>
              </div>
            </div>
          </div>

          {/* Typography Content */}
          <div className="space-y-4">
            <div className="inline-block px-4 py-1 rounded-full border border-[#ffb4ab]/30 bg-[#ffb4ab]/5 text-[#ffb4ab] font-mono text-[12px] uppercase tracking-[0.2em] mb-2">
              Error Code: 403
            </div>
            <h1 className="font-sans text-[36px] md:text-[48px] font-bold text-white tracking-tight leading-tight">
              Access Denied
            </h1>
            <p className="font-sans text-[16px] leading-[24px] text-[#c4c7c8] px-4">
              You don't have permission to view this page. This area of the Admin Console is restricted to authorized fleet supervisors only.
            </p>
          </div>

          {/* Actions */}
          <div className="pt-4 flex flex-col sm:flex-row gap-4 items-center justify-center">
            <button
              onClick={() => navigate('/')}
              className="inline-flex items-center justify-center px-8 h-14 bg-white text-[#2f3131] font-sans text-[14px] leading-[20px] font-semibold rounded-full shadow-[0_0_20px_rgba(255,255,255,0.1)] hover:scale-[1.02] active:scale-95 transition-all duration-200 w-full sm:w-auto min-w-[220px] cursor-pointer"
            >
              <LayoutDashboard className="h-4 w-4 mr-2" />
              Return to Dashboard
            </button>
            <button
              onClick={() => window.open('mailto:support@autocare.ai')}
              className="inline-flex items-center justify-center px-8 h-14 border border-[#444748] text-white font-sans text-[14px] leading-[20px] font-semibold rounded-full hover:bg-[#3a3939] transition-all duration-200 w-full sm:w-auto min-w-[220px] group cursor-pointer"
            >
              <LifeBuoy className="h-4 w-4 mr-2 group-hover:text-[#abc7ff] transition-colors" />
              Contact System Admin
            </button>
          </div>

          {/* Contextual Information (Bento-style micro-info) */}
          <div className="grid grid-cols-2 gap-4 mt-12 text-left font-mono">
            <div className="bg-[#201f1f]/70 backdrop-blur-md p-4 rounded-xl border border-[#444748]/50 space-y-1 relative">
              <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-[#abc7ff] to-transparent opacity-30"></div>
              <span className="text-[12px] text-[#abc7ff] tracking-[0.05em] block">SESSION ID</span>
              <span className="text-[10px] text-[#c4c7c8] opacity-80">{mockSessionId}</span>
            </div>
            <div className="bg-[#201f1f]/70 backdrop-blur-md p-4 rounded-xl border border-[#444748]/50 space-y-1 relative">
              <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-[#abc7ff] to-transparent opacity-30"></div>
              <span className="text-[12px] text-[#abc7ff] tracking-[0.05em] block">IP ADDRESS</span>
              <span className="text-[10px] text-[#c4c7c8] opacity-80">{mockIp}</span>
            </div>
          </div>

        </div>
      </main>

      {/* Footer Shell */}
      <footer className="w-full py-8 px-6 md:px-10 flex flex-col md:flex-row justify-between items-center gap-4 border-t border-[#444748]/10 text-[#c4c7c8]/80 font-mono text-[12px]">
        <div className="flex items-center gap-2">
          <span className="font-bold text-white">AutoCare AI</span>
          <span>© 2024 Secure Admin Environment.</span>
        </div>
        <div className="flex gap-6">
          <a className="hover:text-[#abc7ff] transition-colors" href="#">Privacy Policy</a>
          <a className="hover:text-[#abc7ff] transition-colors" href="#">Terms of Service</a>
          <a className="hover:text-[#abc7ff] transition-colors" href="#">Support</a>
        </div>
      </footer>

    </div>
  );
};
