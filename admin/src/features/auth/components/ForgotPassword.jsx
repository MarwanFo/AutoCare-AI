import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, ArrowRight, ArrowLeft, Loader2, CheckCircle, MailCheck } from 'lucide-react';
import { useForgotPassword } from '../hooks/useAuthMutations';

// Zod validation schema
const forgotPasswordSchema = z.object({
  email: z.string()
    .min(1, 'Email address is required')
    .email('Please enter a valid email address'),
});

export const ForgotPassword = () => {
  const [isSuccess, setIsSuccess] = useState(false);
  const [submittedEmail, setSubmittedEmail] = useState('');
  const [resendStatus, setResendStatus] = useState('idle'); // 'idle' | 'resending' | 'sent'
  
  const forgotPasswordMutation = useForgotPassword();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: '',
    },
  });

  const onSubmit = (data) => {
    setSubmittedEmail(data.email);
    forgotPasswordMutation.mutate(data.email, {
      onSuccess: () => {
        setIsSuccess(true);
      },
    });
  };

  const handleResend = () => {
    if (resendStatus !== 'idle') return;
    setResendStatus('resending');
    
    forgotPasswordMutation.mutate(submittedEmail, {
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

  return (
    <div className="w-full relative z-10 flex flex-col justify-between text-[#e5e2e1] antialiased select-none">
      
      {/* Branding Anchor */}
      <div className="flex flex-col items-center mb-10 animate-fade-in text-center">
        <h1 className="font-sans text-[32px] md:text-[36px] font-bold text-white tracking-tight mb-1">
          AutoCare AI
        </h1>
        <p className="font-mono text-[11px] text-[#C4C7C8] uppercase tracking-[0.2em]">
          Admin Console
        </p>
      </div>

      {!isSuccess ? (
        /* Request State View */
        <div className="bg-[#201f1f]/80 backdrop-blur-[20px] rounded-[1rem] border border-[#444748]/30 shadow-2xl relative overflow-hidden animate-fade-in" id="request-state">
          {/* Top highlight gradient border line */}
          <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-[#abc7ff] to-transparent opacity-50"></div>
          
          <div className="p-8 md:p-10">
            <div className="mb-8 text-left">
              <h2 className="font-sans text-[18px] leading-[24px] font-semibold text-white mb-2">
                Reset Password
              </h2>
              <p className="text-[#c4c7c8] text-sm leading-relaxed">
                Enter your administrator email address and we'll send you a secure link to reset your credentials.
              </p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
              {/* Email Input Group */}
              <div className="relative">
                <input
                  {...register('email')}
                  id="email"
                  type="email"
                  placeholder=" "
                  disabled={forgotPasswordMutation.isPending}
                  className="peer w-full bg-[#201f1f] border-none px-0 py-4 text-white focus:ring-0 text-[16px] leading-[24px] focus:outline-none disabled:opacity-50"
                />
                <div className="absolute bottom-0 left-0 w-full h-[2px] bg-[#444748]/30"></div>
                <div className="absolute bottom-0 left-0 h-[2px] bg-[#abc7ff] w-0 peer-focus:w-full transition-all duration-300"></div>
                <label
                  htmlFor="email"
                  className="absolute left-0 top-4 font-mono text-[12px] tracking-[0.05em] text-[#c4c7c8] transition-all pointer-events-none origin-left transform -translate-y-6 scale-85 peer-placeholder-shown:translate-y-0 peer-placeholder-shown:scale-100 peer-placeholder-shown:text-[#c4c7c8] peer-focus:-translate-y-6 peer-focus:scale-85 peer-focus:text-[#abc7ff]"
                >
                  ADMIN EMAIL
                </label>
                {errors.email && (
                  <span className="text-[12px] text-[#ffb4ab] mt-1.5 block font-mono tracking-wide">
                    {errors.email.message}
                  </span>
                )}
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={forgotPasswordMutation.isPending}
                className="w-full h-12 bg-white text-[#2f3131] font-sans text-[14px] leading-[20px] font-semibold tracking-[0.01em] rounded-full transition-all duration-200 active:scale-95 shadow-[0_0_20px_rgba(255,255,255,0.1)] hover:bg-opacity-90 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {forgotPasswordMutation.isPending ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Sending Link...
                  </>
                ) : (
                  <>
                    Send Reset Link
                    <ArrowRight className="h-[18px] w-[18px]" />
                  </>
                )}
              </button>
            </form>

            <div className="mt-8 flex justify-center">
              <Link
                to="/login"
                className="font-mono text-[12px] tracking-[0.05em] text-[#c4c7c8] hover:text-[#abc7ff] transition-colors flex items-center gap-2 group"
              >
                <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
                Back to Login
              </Link>
            </div>
          </div>
        </div>
      ) : (
        /* Success State View */
        <div className="bg-[#201f1f]/85 backdrop-blur-[20px] rounded-[1rem] border border-[#444748]/30 shadow-2xl relative overflow-hidden animate-fade-in" id="success-state">
          {/* Top highlight gradient border line */}
          <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-[#abc7ff] to-transparent opacity-50"></div>
          
          <div className="p-8 md:p-12 text-center flex flex-col items-center">
            {/* Success Envelope Icon */}
            <div className="w-20 h-20 bg-[#abc7ff]/10 rounded-full flex items-center justify-center mb-6">
              <MailCheck className="h-10 w-10 text-[#abc7ff]" />
            </div>
            
            <h2 className="font-sans text-[18px] font-semibold text-white mb-4">
              Check your email
            </h2>
            <p className="text-[#c4c7c8] text-sm mb-8 leading-relaxed">
              We've sent a password reset link to <span className="text-white font-medium">{submittedEmail}</span>. Please follow the instructions to secure your account.
            </p>
            
            <div className="flex flex-col gap-4 w-full">
              <button
                onClick={() => navigate('/login')}
                className="w-full h-12 bg-white text-[#2f3131] font-sans text-[14px] font-semibold rounded-full transition-all duration-200 active:scale-95 flex items-center justify-center cursor-pointer hover:bg-opacity-90"
              >
                Done
              </button>
              
              <button
                onClick={handleResend}
                disabled={resendStatus !== 'idle'}
                className="text-mono text-[12px] text-[#c4c7c8] hover:text-[#abc7ff] transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {resendStatus === 'resending' ? 'Resending...' : resendStatus === 'sent' ? 'Sent!' : "Didn't receive email? Resend"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Footer Info */}
      <footer className="mt-8 text-center select-none">
        <p className="font-mono text-[12px] text-[#c4c7c8]/40">
          © 2024 AutoCare AI. Secure Admin Environment.
        </p>
      </footer>

    </div>
  );
};
