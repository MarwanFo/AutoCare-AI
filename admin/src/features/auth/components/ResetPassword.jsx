import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Eye, EyeOff, ArrowLeft, Loader2, CheckCircle, Shield } from 'lucide-react';
import { useResetPassword } from '../hooks/useAuthMutations';
import { toast } from 'sonner';

// Zod validation schema
const resetPasswordSchema = z.object({
  newPassword: z.string()
    .min(8, 'Password must be at least 8 characters long')
    .regex(/[!@#$%^&*(),.?":{}|<>]/, 'Password must contain at least one special character'),
  confirmPassword: z.string()
    .min(1, 'Please confirm your new password'),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

export const ResetPassword = () => {
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') || '';
  const navigate = useNavigate();
  const resetPasswordMutation = useResetPassword();

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      newPassword: '',
      confirmPassword: '',
    },
  });

  const newPassword = watch('newPassword', '');
  const [score, setScore] = useState(0);

  // Monitor rules
  const hasMinLength = newPassword.length >= 8;
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(newPassword);

  useEffect(() => {
    let currentScore = 0;
    if (hasMinLength) currentScore += 50;
    if (hasSpecialChar) currentScore += 50;
    setScore(currentScore);
  }, [newPassword, hasMinLength, hasSpecialChar]);

  const getStrengthProps = () => {
    if (score === 0) {
      return { text: 'Incomplete', colorClass: 'bg-[#8e9192]' };
    }
    if (score === 50) {
      return { text: 'Weak', colorClass: 'bg-[#ffb4ab]' };
    }
    return { text: 'Secure', colorClass: 'bg-[#abc7ff]' };
  };

  const strengthProps = getStrengthProps();

  const onSubmit = (data) => {
    if (!token) {
      toast.error('Reset token is missing from URL. Please request a new recovery link.');
      return;
    }
    
    resetPasswordMutation.mutate({
      token,
      newPassword: data.newPassword,
      confirmPassword: data.confirmPassword,
    });
  };

  return (
    <div className="relative min-h-screen w-full flex flex-col justify-between text-[#e5e2e1] antialiased select-none">
      
      {/* Top Navigation Bar - spans full viewport width */}
      <header className="fixed top-0 left-0 right-0 w-full z-50 flex justify-between items-center px-6 md:px-10 h-16 bg-[#201f1f]/80 backdrop-blur-xl border-b border-[#444748]/30 shadow-2xl">
        <div className="font-sans text-[20px] md:text-[24px] font-bold text-white tracking-tight">
          AutoCare AI
        </div>
        <div className="flex items-center gap-4">
          <Shield className="h-5 w-5 text-[#c4c7c8]" />
        </div>
      </header>

      {/* Main Content Card Container */}
      <main className="flex-grow flex items-center justify-center px-4 py-24 relative z-10">
        <div className="max-w-[448px] w-full bg-[#201f1f]/70 backdrop-blur-[24px] rounded-[1rem] border border-[#444748]/30 p-8 md:p-10 shadow-2xl relative overflow-hidden">
          
          {/* Top highlight gradient border line */}
          <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-[#abc7ff] to-transparent opacity-50"></div>

          {/* Header Section */}
          <div className="text-center mb-8 select-none">
            <h1 className="font-sans text-[32px] leading-[40px] font-bold text-white mb-2 tracking-tight">
              Secure Reset
            </h1>
            <p className="font-sans text-[16px] leading-[24px] text-[#c4c7c8]">
              Configure your new administrative credentials below.
            </p>
          </div>

          {/* Form Section */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
            
            {/* New Password Field */}
            <div className="relative">
              <input
                {...register('newPassword')}
                id="newPassword"
                type={showNewPassword ? 'text' : 'password'}
                placeholder=" "
                disabled={resetPasswordMutation.isPending}
                className="peer block w-full pr-10 py-3 bg-transparent border-0 border-b-2 border-[#444748] focus:ring-0 focus:border-[#abc7ff] transition-all text-white text-[16px] leading-[24px] focus:outline-none disabled:opacity-50"
              />
              <label
                htmlFor="newPassword"
                className="absolute left-0 top-3.5 font-mono text-[12px] tracking-[0.05em] text-[#c4c7c8] transition-all pointer-events-none origin-left transform -translate-y-6 scale-85 peer-placeholder-shown:translate-y-0 peer-placeholder-shown:scale-100 peer-placeholder-shown:text-[#c4c7c8] peer-focus:-translate-y-6 peer-focus:scale-85 peer-focus:text-[#abc7ff]"
              >
                New Password
              </label>
              <div className="absolute bottom-0 left-0 h-[2px] bg-[#abc7ff] w-0 peer-focus:w-full transition-all duration-300"></div>
              <button
                type="button"
                onClick={() => setShowNewPassword(!showNewPassword)}
                disabled={resetPasswordMutation.isPending}
                className="absolute right-0 top-3 text-[#c4c7c8] hover:text-white transition-colors focus:outline-none cursor-pointer disabled:opacity-50"
                aria-label={showNewPassword ? 'Hide password' : 'Show password'}
              >
                {showNewPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>

            {/* Password Strength Indicator */}
            <div className="space-y-3">
              <div className="flex justify-between items-center select-none">
                <span className="font-mono text-[12px] tracking-[0.05em] text-[#c4c7c8]">Security Rating</span>
                <span className="font-mono text-[12px] tracking-[0.05em] text-[#c4c7c8]" id="strength-text">
                  {strengthProps.text}
                </span>
              </div>
              <div className="w-full bg-[#353534] rounded-full h-1 overflow-hidden">
                <div
                  className={`h-full rounded-full ${strengthProps.colorClass} transition-all duration-500`}
                  style={{ width: `${score}%` }}
                ></div>
              </div>
              <div className="grid grid-cols-2 gap-2 select-none">
                
                {/* Rule 1: Length */}
                <div className={`flex items-center gap-2 transition-all duration-300 ${hasMinLength ? 'text-[#abc7ff]' : 'opacity-50'}`}>
                  <CheckCircle className="h-[14px] w-[14px]" />
                  <span className="font-mono text-[10px] uppercase tracking-wider">8+ Characters</span>
                </div>
                
                {/* Rule 2: Special Char */}
                <div className={`flex items-center gap-2 transition-all duration-300 ${hasSpecialChar ? 'text-[#abc7ff]' : 'opacity-50'}`}>
                  <CheckCircle className="h-[14px] w-[14px]" />
                  <span className="font-mono text-[10px] uppercase tracking-wider">Special Char</span>
                </div>

              </div>
              {errors.newPassword && (
                <span className="text-[12px] text-[#ffb4ab] mt-1.5 block font-mono tracking-wide">
                  {errors.newPassword.message}
                </span>
              )}
            </div>

            {/* Confirm Password Field */}
            <div className="relative">
              <input
                {...register('confirmPassword')}
                id="confirmPassword"
                type={showConfirmPassword ? 'text' : 'password'}
                placeholder=" "
                disabled={resetPasswordMutation.isPending}
                className="peer block w-full pr-10 py-3 bg-transparent border-0 border-b-2 border-[#444748] focus:ring-0 focus:border-[#abc7ff] transition-all text-white text-[16px] leading-[24px] focus:outline-none disabled:opacity-50"
              />
              <label
                htmlFor="confirmPassword"
                className="absolute left-0 top-3.5 font-mono text-[12px] tracking-[0.05em] text-[#c4c7c8] transition-all pointer-events-none origin-left transform -translate-y-6 scale-85 peer-placeholder-shown:translate-y-0 peer-placeholder-shown:scale-100 peer-placeholder-shown:text-[#c4c7c8] peer-focus:-translate-y-6 peer-focus:scale-85 peer-focus:text-[#abc7ff]"
              >
                Confirm Password
              </label>
              <div className="absolute bottom-0 left-0 h-[2px] bg-[#abc7ff] w-0 peer-focus:w-full transition-all duration-300"></div>
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                disabled={resetPasswordMutation.isPending}
                className="absolute right-0 top-3 text-[#c4c7c8] hover:text-white transition-colors focus:outline-none cursor-pointer disabled:opacity-50"
                aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
              >
                {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
              {errors.confirmPassword && (
                <span className="text-[12px] text-[#ffb4ab] mt-1.5 block font-mono tracking-wide">
                  {errors.confirmPassword.message}
                </span>
              )}
            </div>

            {/* Primary Action Button */}
            <div className="pt-4">
              <button
                type="submit"
                disabled={resetPasswordMutation.isPending}
                className="w-full bg-white text-[#2f3131] py-4 rounded-full font-sans text-[14px] leading-[20px] font-semibold tracking-[0.01em] shadow-[0_0_20px_rgba(255,255,255,0.1)] hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 cursor-pointer disabled:opacity-75 disabled:cursor-not-allowed"
              >
                {resetPasswordMutation.isPending ? (
                  <div className="flex items-center justify-center gap-2">
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Resetting...
                  </div>
                ) : (
                  'Reset Password'
                )}
              </button>
            </div>

            {/* Secondary Back Link */}
            <div className="text-center">
              <Link
                to="/login"
                className="font-mono text-[12px] tracking-[0.05em] text-[#c4c7c8] hover:text-[#abc7ff] transition-colors inline-flex items-center gap-2 group"
              >
                <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
                Back to Login
              </Link>
            </div>

          </form>

        </div>
      </main>

      {/* Footer Section */}
      <footer className="w-full py-8 px-6 md:px-10 flex flex-col md:flex-row justify-between items-center gap-4 border-t border-[#444748]/10 select-none">
        <p className="font-mono text-[12px] tracking-[0.05em] text-[#c4c7c8]/80">
          © 2024 AutoCare AI. Secure Admin Environment.
        </p>
        <div className="flex gap-6">
          <a href="#" className="font-mono text-[12px] tracking-[0.05em] text-[#c4c7c8] hover:text-[#abc7ff] transition-colors">
            Privacy Policy
          </a>
          <a href="#" className="font-mono text-[12px] tracking-[0.05em] text-[#c4c7c8] hover:text-[#abc7ff] transition-colors">
            Terms of Service
          </a>
          <a href="#" className="font-mono text-[12px] tracking-[0.05em] text-[#c4c7c8] hover:text-[#abc7ff] transition-colors">
            Support
          </a>
        </div>
      </footer>

    </div>
  );
};
