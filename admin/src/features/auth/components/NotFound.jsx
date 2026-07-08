import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Home, ArrowLeft } from 'lucide-react';

export const NotFound = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Parallax effect on mousemove
    const handleMouseMove = (e) => {
      const moveX = (e.clientX - window.innerWidth / 2) * 0.01;
      const moveY = (e.clientY - window.innerHeight / 2) * 0.01;
      const card = document.getElementById('not-found-image-container');
      if (card) {
        card.style.transform = `translate(${moveX}px, ${moveY}px)`;
      }
    };
    
    window.addEventListener('mousemove', handleMouseMove);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  return (
    <div className="min-h-screen flex flex-col justify-between text-[#e5e2e1] antialiased select-none relative bg-[#131313]">
      
      {/* Top Bar Header */}
      <header className="fixed top-0 w-full z-50 flex justify-between items-center px-6 md:px-10 h-16 bg-[#201f1f]/20 backdrop-blur-md border-b border-[#444748]/10">
        <div className="flex items-center gap-2">
          <span className="font-sans text-[20px] md:text-[24px] font-bold text-white tracking-tight">AutoCare AI</span>
        </div>
        <div className="hidden md:flex items-center gap-6">
          <span className="font-mono text-[12px] tracking-widest text-[#c4c7c8]/50 uppercase">Admin Environment</span>
        </div>
      </header>

      {/* Main 404 Canvas */}
      <main className="relative flex-grow flex items-center justify-center overflow-hidden z-10 px-6 py-20">
        
        {/* Background Atmosphere */}
        <div className="absolute inset-0 z-0 pointer-events-none">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-white/[0.02] rounded-full blur-[100px] opacity-40"></div>
          <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-[#abc7ff]/5 blur-[120px] rounded-full"></div>
          <div className="absolute top-1/4 -right-24 w-64 h-64 bg-white/5 blur-[100px] rounded-full"></div>
        </div>

        <div className="relative z-10 flex flex-col items-center text-center">
          
          {/* Automotive 404 Concept Asset */}
          <div className="relative mb-10" id="not-found-image-container" style={{ transition: 'transform 0.1s ease-out' }}>
            <div className="w-72 h-72 md:w-[350px] md:h-[350px] rounded-full overflow-hidden bg-[#201f1f]/70 border border-white/10 p-1 flex items-center justify-center shadow-[0_0_40px_rgba(255,255,255,0.05)]">
              <div className="w-full h-full rounded-full overflow-hidden relative">
                <div className="absolute inset-0 bg-gradient-to-t from-[#131313] via-transparent to-transparent z-10"></div>
                <img
                  className="w-full h-full object-cover transition-transform duration-700 hover:scale-105"
                  alt="Futuristic headlights in foggy darkness representing high-end admin interface aesthetics"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuBtL5UTOGnl_QOJ9AzfbkpkwAIGuhMN2VcT1hu_jJHZ2zhzkS6g47MxxoAyZJdVEkLqgvZhpmka9raxnF12jGeFLXxLy95FgnhQgRLwIaVcxXn0iJn0c5LHWBkEexsm8AGOBYLKFz1hCG_Lcr3htBKRVmFRbaH2mFKel8AvtoKBUz4Z3Bom5rTbh2KnUPZQB81dKDonQQlHzy0AfELjf_KxRFUIxtzsMEP2wUK0z459WNfgY5Z_R9fADcCXxtIQx9gGEEHehwmdHtgD"
                />
              </div>
            </div>
            {/* Floating 404 Tag */}
            <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 bg-[#201f1f]/90 backdrop-blur-md px-6 py-2 rounded-full border border-[#444748]/50 shadow-lg">
              <span className="font-mono text-[12px] text-[#abc7ff] tracking-[0.2em] font-bold">ERROR 404</span>
            </div>
          </div>

          {/* Typography Content */}
          <div className="max-w-xl space-y-4">
            <h1 className="font-sans text-[36px] md:text-[48px] font-bold text-white tracking-tight leading-tight">
              The road ends here.
            </h1>
            <p className="font-sans text-[16px] leading-[24px] text-[#c4c7c8] max-w-md mx-auto">
              The requested system path does not exist in the AutoCare AI database. Your vehicle maintenance session may have timed out or the link has expired.
            </p>
            
            {/* Action CTAs */}
            <div className="pt-6 flex flex-col sm:flex-row items-center justify-center gap-4">
              <button
                onClick={() => navigate('/')}
                className="group relative inline-flex items-center justify-center px-10 py-4 bg-white text-[#2f3131] font-sans text-[14px] leading-[20px] font-semibold rounded-full transition-all duration-300 hover:shadow-[0_0_20px_rgba(255,255,255,0.2)] active:scale-95 cursor-pointer w-full sm:w-auto min-w-[200px]"
              >
                <Home className="h-4 w-4 mr-2" />
                Return Home
              </button>
              <button
                onClick={() => navigate(-1)}
                className="inline-flex items-center justify-center px-8 py-4 border border-[#444748] text-white font-sans text-[14px] leading-[20px] font-semibold rounded-full hover:bg-[#3a3939] transition-all duration-200 active:scale-95 cursor-pointer w-full sm:w-auto min-w-[200px]"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Go Back
              </button>
            </div>
          </div>

          {/* Decorative Coordinate/Data String */}
          <div className="mt-16 opacity-30 select-none font-mono">
            <p className="text-[10px] tracking-widest text-[#c4c7c8] uppercase">
              SYSTEM_FAIL_LAT: 40.7128 | LONG: -74.0060 | ENV: PRODUCTION_BETA
            </p>
          </div>

        </div>
      </main>

      {/* Simple Footer */}
      <footer className="w-full py-8 px-6 md:px-10 flex flex-col md:flex-row justify-between items-center gap-4 opacity-60 font-mono text-[12px] z-10 border-t border-[#444748]/10">
        <p className="text-[#c4c7c8]">© 2024 AutoCare AI. Secure Admin Environment.</p>
        <div className="flex gap-6">
          <a className="text-[#c4c7c8] hover:text-[#abc7ff] transition-colors" href="#">Support</a>
          <a className="text-[#c4c7c8] hover:text-[#abc7ff] transition-colors" href="#">Status</a>
        </div>
      </footer>

    </div>
  );
};
