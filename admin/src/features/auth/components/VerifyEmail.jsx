import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Check, Mail, Loader2, ArrowRight, ShieldAlert, Sparkles } from 'lucide-react';
import { useVerifyEmail, useResendVerification, useLogout } from '../hooks/useAuthMutations';
import { toast } from 'sonner';

export const VerifyEmail = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token') || '';
  const emailParam = searchParams.get('email') || '';

  const verifyEmailMutation = useVerifyEmail();
  const resendMutation = useResendVerification();
  const logoutMutation = useLogout();

  const [hasVerified, setHasVerified] = useState(false);
  const [resendStatus, setResendStatus] = useState('idle'); // 'idle' | 'resending' | 'sent'

  // Trigger verification automatically if token is in search params
  useEffect(() => {
    if (token) {
      verifyEmailMutation.mutate(token, {
        onSuccess: () => {
          setHasVerified(true);
        },
      });
    }
  }, [token]);

  const handleResend = () => {
    const emailToUse = emailParam || localStorage.getItem('pending_verify_email');
    if (!emailToUse) {
      toast.error('Email address not found. Please contact your system administrator.');
      return;
    }

    if (resendStatus !== 'idle') return;
    setResendStatus('resending');

    resendMutation.mutate(emailToUse, {
      onSuccess: () => {
        setResendStatus('sent');
        setTimeout(() => {
          setResendStatus('idle');
        }, 3000);
      },
      onError: () => {
        setResendStatus('idle');
      }
    });
  };

  const handleSignOut = () => {
    logoutMutation.mutate();
  };

  // Rendering loading state during verification
  if (token && verifyEmailMutation.isPending) {
    return (
      <div className="w-full relative z-10 flex flex-col justify-between text-[#e5e2e1] antialiased select-none">
        <main className="flex-grow flex items-center justify-center px-4 py-24">
          <div className="max-w-[448px] w-full bg-[#201f1f]/70 backdrop-blur-[24px] rounded-[1rem] border border-[#444748]/40 shadow-2xl p-8 md:p-10 flex flex-col items-center text-center space-y-8 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-[#abc7ff] to-transparent opacity-50"></div>
            
            <div className="mb-2">
              <h1 className="font-sans text-[32px] leading-[40px] font-bold text-white tracking-tight">AutoCare AI</h1>
            </div>
            
            <div className="relative flex items-center justify-center">
              <div className="w-24 h-24 rounded-full border border-[#abc7ff]/20 flex items-center justify-center">
                <div className="w-20 h-20 rounded-full bg-[#abc7ff]/10 flex items-center justify-center">
                  <div className="w-14 h-14 bg-white rounded-full flex items-center justify-center shadow-[0_0_20px_rgba(255,255,255,0.2)]">
                    <Loader2 className="h-6 w-6 text-[#131313] animate-spin" />
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <h2 className="font-sans text-[20px] font-semibold text-white">Verifying Identity</h2>
              <p className="text-[#c4c7c8] text-sm leading-relaxed max-w-xs mx-auto">
                Processing your administrator activation token. Please hold on...
              </p>
            </div>
          </div>
        </main>
      </div>
    );
  }

  // Rendering verification failure state
  if (token && verifyEmailMutation.isError) {
    return (
      <div className="w-full relative z-10 flex flex-col justify-between text-[#e5e2e1] antialiased select-none">
        <main className="flex-grow flex items-center justify-center px-4 py-24">
          <div className="max-w-[448px] w-full bg-[#201f1f]/70 backdrop-blur-[24px] rounded-[1rem] border border-[#444748]/40 shadow-2xl p-8 md:p-10 flex flex-col items-center text-center space-y-8 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-[#ffb4ab] to-transparent opacity-50"></div>
            
            <div className="mb-2">
              <h1 className="font-sans text-[32px] leading-[40px] font-bold text-white tracking-tight">AutoCare AI</h1>
            </div>
            
            <div className="relative flex items-center justify-center">
              <div className="w-24 h-24 rounded-full border border-[#ffb4ab]/20 flex items-center justify-center">
                <div className="w-20 h-20 rounded-full bg-[#ffb4ab]/10 flex items-center justify-center">
                  <div className="w-14 h-14 bg-[#ffb4ab] rounded-full flex items-center justify-center shadow-[0_0_20px_rgba(255,180,171,0.2)]">
                    <ShieldAlert className="h-6 w-6 text-[#690005]" />
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <h2 className="font-sans text-[20px] font-semibold text-white">Verification Failed</h2>
              <p className="text-[#c4c7c8] text-sm leading-relaxed max-w-xs mx-auto">
                The activation token is invalid, expired, or has already been used.
              </p>
            </div>

            <div className="w-full space-y-4 pt-4">
              <button
                onClick={handleResend}
                disabled={resendStatus !== 'idle'}
                className="group relative flex w-full items-center justify-center px-8 py-4 bg-white text-[#2f3131] font-sans text-[14px] leading-[20px] font-semibold rounded-full transition-all duration-300 hover:shadow-[0_0_24px_rgba(255,255,255,0.15)] active:scale-[0.98] cursor-pointer"
              >
                <span>{resendStatus === 'resending' ? 'Resending...' : resendStatus === 'sent' ? 'Sent!' : 'Request New Verification Link'}</span>
              </button>
              
              <button
                onClick={() => navigate('/login')}
                className="text-on-surface-variant hover:text-secondary font-button text-button transition-colors underline underline-offset-4 decoration-outline-variant cursor-pointer"
              >
                Back to Sign In
              </button>
            </div>
          </div>
        </main>
      </div>
    );
  }

  // Rendering successful verification state OR verification success banner
  if (hasVerified || verifyEmailMutation.isSuccess) {
    return (
      <div className="w-full relative z-10 flex flex-col justify-between text-[#e5e2e1] antialiased select-none">
        
        {/* Main Content Canvas */}
        <main className="flex-grow flex items-center justify-center px-4 py-24">
          <div className="max-w-[448px] w-full bg-[#201f1f]/70 backdrop-blur-[24px] rounded-[1rem] border border-[#444748]/40 shadow-2xl p-8 md:p-10 flex flex-col items-center text-center space-y-8 relative overflow-hidden">
            
            <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-[#abc7ff] to-transparent opacity-50"></div>
            
            {/* Brand Logo */}
            <div className="mb-2">
              <h1 className="font-sans text-[32px] leading-[40px] font-bold text-white tracking-tight">AutoCare AI</h1>
            </div>
            
            {/* Success Icon Stack */}
            <div className="relative flex items-center justify-center">
              {/* Outer Ring */}
              <div className="w-24 h-24 rounded-full border border-[#abc7ff]/20 flex items-center justify-center">
                {/* Middle Ring */}
                <div className="w-20 h-20 rounded-full bg-[#abc7ff]/10 flex items-center justify-center">
                  {/* Checkmark Container */}
                  <div className="w-14 h-14 bg-white rounded-full flex items-center justify-center shadow-[0_0_20px_rgba(255,255,255,0.2)] animate-[scale-up_0.6s_cubic-bezier(0.34,1.56,0.64,1)_forwards]">
                    <Check className="h-6 w-6 text-[#131313] stroke-[3]" />
                  </div>
                </div>
              </div>
              {/* Sparkle Accents */}
              <div className="absolute -top-2 -right-2 opacity-70">
                <Sparkles className="h-5 w-5 text-[#abc7ff]" />
              </div>
            </div>

            {/* Text Content */}
            <div className="space-y-3">
              <h2 className="font-sans text-[24px] font-bold text-white">Identity Verified</h2>
              <p className="text-[#c4c7c8] text-sm leading-relaxed max-w-xs mx-auto">
                Your admin account for <span className="text-[#abc7ff] font-medium">AutoCare AI</span> has been successfully authenticated. You now have full access to the control panel.
              </p>
            </div>

            {/* Action Buttons */}
            <div className="w-full space-y-4 pt-4">
              <button
                onClick={() => navigate('/')}
                className="group relative flex w-full items-center justify-center px-8 py-4 bg-white text-[#2f3131] font-sans text-[14px] leading-[20px] font-semibold rounded-full transition-all duration-300 hover:shadow-[0_0_24px_rgba(255,255,255,0.15)] active:scale-[0.98] cursor-pointer"
              >
                <span>Continue to Dashboard</span>
                <ArrowRight className="h-4 w-4 ml-2 transition-transform group-hover:translate-x-1" />
              </button>
              
              <div className="flex flex-col space-y-2 select-none">
                <p className="font-mono text-[10px] tracking-widest text-[#c4c7c8] uppercase">Wrong account?</p>
                <button
                  onClick={handleSignOut}
                  className="text-white hover:text-[#abc7ff] font-sans text-[14px] font-semibold transition-colors underline underline-offset-4 decoration-[#444748] cursor-pointer"
                >
                  Sign out and switch
                </button>
              </div>
            </div>

            {/* Subtle Resend (Secondary State Indicator) */}
            <div className="pt-4 border-t border-[#444748]/20 w-full select-none">
              <p className="font-mono text-[12px] tracking-[0.05em] text-[#c4c7c8]/60">
                Verification link expired? 
                <button
                  onClick={handleResend}
                  disabled={resendStatus !== 'idle'}
                  className="text-[#abc7ff] hover:underline ml-1 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {resendStatus === 'resending' ? 'Resending...' : resendStatus === 'sent' ? 'Sent!' : 'Resend Email'}
                </button>
              </p>
            </div>

          </div>

          {/* System Status Footer (Non-Nav Shell) */}
          <div className="absolute bottom-8 left-0 right-0 text-center space-y-4 select-none">
            <div className="flex items-center justify-center gap-2 opacity-60">
              <span className="w-2 h-2 rounded-full bg-[#34A853]"></span>
              <span className="font-mono text-[10px] tracking-wider text-[#c4c7c8] uppercase">System Online: v2.4.0</span>
            </div>
            <p className="font-mono text-[12px] text-[#c4c7c8]/40">
              © 2024 AutoCare AI. Secure Admin Environment.
            </p>
          </div>

        </main>
        
      </div>
    );
  }

  // Rendering instruction/pending state view if no verification action has run yet
  return (
    <div className="w-full relative z-10 flex flex-col justify-between text-[#e5e2e1] antialiased select-none">
      
      <main className="flex-grow flex items-center justify-center px-4 py-24">
        <div className="max-w-[448px] w-full bg-[#201f1f]/70 backdrop-blur-[24px] rounded-[1rem] border border-[#444748]/40 shadow-2xl p-8 md:p-10 flex flex-col items-center text-center space-y-8 relative overflow-hidden">
          
          <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-[#abc7ff] to-transparent opacity-50"></div>
          
          <div className="mb-2">
            <h1 className="font-sans text-[32px] leading-[40px] font-bold text-white tracking-tight">AutoCare AI</h1>
          </div>
          
          <div className="relative flex items-center justify-center">
            <div className="w-24 h-24 rounded-full border border-[#abc7ff]/20 flex items-center justify-center">
              <div className="w-20 h-20 rounded-full bg-[#abc7ff]/10 flex items-center justify-center">
                <div className="w-14 h-14 bg-white rounded-full flex items-center justify-center shadow-[0_0_20px_rgba(255,255,255,0.2)]">
                  <Mail className="h-6 w-6 text-[#131313]" />
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <h2 className="font-sans text-[24px] font-bold text-white">Verify Your Email</h2>
            <p className="text-[#c4c7c8] text-sm leading-relaxed max-w-xs mx-auto">
              We've sent an activation link to <span className="text-white font-medium">{emailParam || 'your administrator email'}</span>. Please verify your identity to proceed.
            </p>
          </div>

          <div className="w-full space-y-4 pt-4">
            <button
              onClick={handleResend}
              disabled={resendStatus !== 'idle'}
              className="w-full py-4 bg-white text-[#2f3131] font-sans text-[14px] leading-[20px] font-semibold rounded-full transition-all duration-300 hover:shadow-[0_0_24px_rgba(255,255,255,0.15)] active:scale-[0.98] cursor-pointer disabled:opacity-50"
            >
              {resendStatus === 'resending' ? (
                <div className="flex items-center justify-center gap-2">
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Resending...
                </div>
              ) : resendStatus === 'sent' ? (
                'Sent!'
              ) : (
                'Resend Verification Email'
              )}
            </button>
            
            <button
              onClick={() => navigate('/login')}
              className="text-on-surface-variant hover:text-white font-sans text-[14px] transition-colors underline underline-offset-4 decoration-[#444748] cursor-pointer"
            >
              Back to Sign In
            </button>
          </div>
        </div>
      </main>

    </div>
  );
};
