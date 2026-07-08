import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Link, useNavigate } from 'react-router-dom';
import { User, Mail, Phone, Lock, Eye, EyeOff, ArrowRight, Loader2, CheckCircle, Shield } from 'lucide-react';
import { useRegister } from '../hooks/useAuthMutations';

// Zod validation schema matching register requirements
const registerSchema = z.object({
  fullName: z.string()
    .min(1, 'Full name is required')
    .min(2, 'Name must be at least 2 characters long')
    .max(100, 'Name must not exceed 100 characters'),
  email: z.string()
    .min(1, 'Email address is required')
    .email('Please enter a valid email address'),
  phoneNumber: z.string()
    .optional()
    .refine(val => !val || /^[+]?[0-9\s-()]{7,18}$/.test(val), {
      message: 'Please enter a valid phone number',
    }),
  password: z.string()
    .min(8, 'Password must be at least 8 characters long')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number')
    .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character'),
  confirmPassword: z.string()
    .min(1, 'Please confirm your password'),
  terms: z.boolean()
    .refine(val => val === true, {
      message: 'You must agree to the Terms of Service and Privacy Policy',
    }),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

export const Register = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const registerMutation = useRegister();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      fullName: '',
      email: '',
      phoneNumber: '',
      password: '',
      confirmPassword: '',
      terms: false,
    },
  });

  const password = watch('password', '');
  const [strength, setStrength] = useState(0);

  // Calculate password strength dynamically
  useEffect(() => {
    let score = 0;
    if (password.length > 5) score++;
    if (password.length > 8) score++;
    if (/[A-Z]/.test(password) && /[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;
    setStrength(score);
  }, [password]);

  // Map strength score to visual indicators
  const getStrengthProps = () => {
    if (!password) {
      return {
        message: 'Enter at least 8 characters',
        textColor: 'text-[#c4c7c8]/50',
        colors: ['bg-[#353534]', 'bg-[#353534]', 'bg-[#353534]', 'bg-[#353534]']
      };
    }

    const messages = ['Too weak', 'Fair', 'Strong', 'Ultra Secure'];
    const textColors = ['text-[#ffb4ab]', 'text-[#FBBC05]', 'text-[#34A853]', 'text-[#abc7ff]'];
    const barColors = ['bg-[#ffb4ab]', 'bg-[#FBBC05]', 'bg-[#34A853]', 'bg-[#abc7ff]'];

    const activeColor = barColors[strength - 1] || 'bg-[#ffb4ab]';
    const displayMessage = messages[strength - 1] || 'Too weak';
    const displayTextColor = textColors[strength - 1] || 'text-[#ffb4ab]';

    const colors = Array.from({ length: 4 }, (_, i) =>
      i < strength ? activeColor : 'bg-[#353534]'
    );

    return {
      message: displayMessage,
      textColor: displayTextColor,
      colors
    };
  };

  const strengthProps = getStrengthProps();

  const onSubmit = (data) => {
    // Send register request to backend. 
    // Phone is optional; if empty string, send undefined or null.
    registerMutation.mutate({
      fullName: data.fullName,
      email: data.email,
      password: data.password,
      phoneNumber: data.phoneNumber || undefined
    }, {
      onSuccess: () => {
        // Navigate to verify-email view after some delay or let user read the success toast
        setTimeout(() => {
          navigate(`/verify-email?email=${encodeURIComponent(data.email)}`);
        }, 2000);
      }
    });
  };

  return (
    <div className="relative min-h-screen w-full flex flex-col justify-between text-[#e5e2e1] antialiased">
      
      {/* Top Header Panel - escape constraint width with absolute positioning */}
      <header className="absolute top-0 left-0 right-0 w-full flex justify-between items-center px-6 md:px-10 h-16 z-50 select-none">
        <div className="font-sans text-[24px] font-bold text-white tracking-tight">
          AutoCare AI
        </div>
        <div className="flex items-center gap-4">
          <span className="text-[#c4c7c8] font-mono text-[12px] tracking-[0.05em] hidden md:block">
            ADMIN CONSOLE V2.4
          </span>
          <div className="w-8 h-8 rounded-full bg-[#2a2a2a] border border-[#444748]/30 flex items-center justify-center">
            <Shield className="h-[18px] w-[18px] text-[#c4c7c8]" />
          </div>
        </div>
      </header>

      {/* Main Form Area */}
      <main className="flex-grow flex items-center justify-center px-4 py-24 relative z-10">
        <div className="w-full max-w-[448px] bg-[#201f1f]/70 backdrop-blur-[20px] rounded-[1rem] border border-[#444748]/30 shadow-2xl p-8 relative overflow-hidden">
          
          {/* Top highlight gradient border line */}
          <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-[#abc7ff] to-transparent opacity-50"></div>

          {/* Form Header */}
          <div className="text-center mb-10 select-none">
            <h1 className="font-sans text-[32px] leading-[40px] font-bold text-white mb-2 tracking-tight">
              Create Admin Account
            </h1>
            <p className="font-sans text-[16px] leading-[24px] text-[#c4c7c8]">
              Secure access to the AutoCare Fleet Management System.
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            
            {/* Full Name Field */}
            <div className="relative">
              <input
                {...register('fullName')}
                id="fullName"
                type="text"
                placeholder=" "
                disabled={registerMutation.isPending}
                className="peer block w-full px-0 py-4 bg-transparent border-0 border-b-2 border-[#444748] focus:ring-0 focus:border-[#abc7ff] transition-all text-[#e5e2e1] text-[16px] leading-[24px] focus:outline-none disabled:opacity-50"
              />
              <label
                htmlFor="fullName"
                className="absolute left-0 top-4 font-mono text-[12px] tracking-[0.05em] text-[#c4c7c8] transition-all pointer-events-none origin-left transform -translate-y-6 scale-85 peer-placeholder-shown:translate-y-0 peer-placeholder-shown:scale-100 peer-placeholder-shown:text-[#c4c7c8] peer-focus:-translate-y-6 peer-focus:scale-85 peer-focus:text-[#abc7ff]"
              >
                FULL NAME
              </label>
              <div className="absolute bottom-0 left-0 h-[2px] bg-[#abc7ff] w-0 peer-focus:w-full transition-all duration-300"></div>
              {errors.fullName && (
                <span className="text-[12px] text-[#ffb4ab] mt-1.5 block font-mono tracking-wide">
                  {errors.fullName.message}
                </span>
              )}
            </div>

            {/* Email Field */}
            <div className="relative">
              <input
                {...register('email')}
                id="email"
                type="email"
                placeholder=" "
                disabled={registerMutation.isPending}
                className="peer block w-full px-0 py-4 bg-transparent border-0 border-b-2 border-[#444748] focus:ring-0 focus:border-[#abc7ff] transition-all text-[#e5e2e1] text-[16px] leading-[24px] focus:outline-none disabled:opacity-50"
              />
              <label
                htmlFor="email"
                className="absolute left-0 top-4 font-mono text-[12px] tracking-[0.05em] text-[#c4c7c8] transition-all pointer-events-none origin-left transform -translate-y-6 scale-85 peer-placeholder-shown:translate-y-0 peer-placeholder-shown:scale-100 peer-placeholder-shown:text-[#c4c7c8] peer-focus:-translate-y-6 peer-focus:scale-85 peer-focus:text-[#abc7ff]"
              >
                EMAIL ADDRESS
              </label>
              <div className="absolute bottom-0 left-0 h-[2px] bg-[#abc7ff] w-0 peer-focus:w-full transition-all duration-300"></div>
              {errors.email && (
                <span className="text-[12px] text-[#ffb4ab] mt-1.5 block font-mono tracking-wide">
                  {errors.email.message}
                </span>
              )}
            </div>

            {/* Phone Number Field */}
            <div className="relative">
              <input
                {...register('phoneNumber')}
                id="phoneNumber"
                type="tel"
                placeholder=" "
                disabled={registerMutation.isPending}
                className="peer block w-full px-0 py-4 bg-transparent border-0 border-b-2 border-[#444748] focus:ring-0 focus:border-[#abc7ff] transition-all text-[#e5e2e1] text-[16px] leading-[24px] focus:outline-none disabled:opacity-50"
              />
              <label
                htmlFor="phoneNumber"
                className="absolute left-0 top-4 font-mono text-[12px] tracking-[0.05em] text-[#c4c7c8] transition-all pointer-events-none origin-left transform -translate-y-6 scale-85 peer-placeholder-shown:translate-y-0 peer-placeholder-shown:scale-100 peer-placeholder-shown:text-[#c4c7c8] peer-focus:-translate-y-6 peer-focus:scale-85 peer-focus:text-[#abc7ff]"
              >
                PHONE NUMBER (OPTIONAL)
              </label>
              <div className="absolute bottom-0 left-0 h-[2px] bg-[#abc7ff] w-0 peer-focus:w-full transition-all duration-300"></div>
              {errors.phoneNumber && (
                <span className="text-[12px] text-[#ffb4ab] mt-1.5 block font-mono tracking-wide">
                  {errors.phoneNumber.message}
                </span>
              )}
            </div>

            {/* Password Field */}
            <div className="space-y-3">
              <div className="relative">
                <input
                  {...register('password')}
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder=" "
                  disabled={registerMutation.isPending}
                  className="peer block w-full pr-10 py-4 bg-transparent border-0 border-b-2 border-[#444748] focus:ring-0 focus:border-[#abc7ff] transition-all text-[#e5e2e1] text-[16px] leading-[24px] focus:outline-none disabled:opacity-50"
                />
                <label
                  htmlFor="password"
                  className="absolute left-0 top-4 font-mono text-[12px] tracking-[0.05em] text-[#c4c7c8] transition-all pointer-events-none origin-left transform -translate-y-6 scale-85 peer-placeholder-shown:translate-y-0 peer-placeholder-shown:scale-100 peer-placeholder-shown:text-[#c4c7c8] peer-focus:-translate-y-6 peer-focus:scale-85 peer-focus:text-[#abc7ff]"
                >
                  PASSWORD
                </label>
                <div className="absolute bottom-0 left-0 h-[2px] bg-[#abc7ff] w-0 peer-focus:w-full transition-all duration-300"></div>
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={registerMutation.isPending}
                  className="absolute right-0 top-4 text-[#c4c7c8] hover:text-white transition-colors focus:outline-none cursor-pointer disabled:opacity-50"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>

              {/* Password Strength Indicator Bars */}
              <div className="flex gap-1.5 h-1 mt-2 select-none">
                {strengthProps.colors.map((bgClass, idx) => (
                  <div key={idx} className={`h-full flex-1 rounded-full ${bgClass} transition-colors duration-300`}></div>
                ))}
              </div>
              <p className={`font-mono text-[12px] tracking-[0.05em] transition-colors duration-300 ${strengthProps.textColor}`}>
                {strengthProps.message}
              </p>

              {errors.password && (
                <span className="text-[12px] text-[#ffb4ab] block font-mono tracking-wide">
                  {errors.password.message}
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
                disabled={registerMutation.isPending}
                className="peer block w-full pr-10 py-4 bg-transparent border-0 border-b-2 border-[#444748] focus:ring-0 focus:border-[#abc7ff] transition-all text-[#e5e2e1] text-[16px] leading-[24px] focus:outline-none disabled:opacity-50"
              />
              <label
                htmlFor="confirmPassword"
                className="absolute left-0 top-4 font-mono text-[12px] tracking-[0.05em] text-[#c4c7c8] transition-all pointer-events-none origin-left transform -translate-y-6 scale-85 peer-placeholder-shown:translate-y-0 peer-placeholder-shown:scale-100 peer-placeholder-shown:text-[#c4c7c8] peer-focus:-translate-y-6 peer-focus:scale-85 peer-focus:text-[#abc7ff]"
              >
                CONFIRM PASSWORD
              </label>
              <div className="absolute bottom-0 left-0 h-[2px] bg-[#abc7ff] w-0 peer-focus:w-full transition-all duration-300"></div>
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                disabled={registerMutation.isPending}
                className="absolute right-0 top-4 text-[#c4c7c8] hover:text-white transition-colors focus:outline-none cursor-pointer disabled:opacity-50"
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

            {/* Terms of Service Checkbox */}
            <div className="flex items-start gap-3 select-none">
              <input
                {...register('terms')}
                id="terms"
                type="checkbox"
                disabled={registerMutation.isPending}
                className="form-checkbox w-5 h-5 rounded border-[#444748] bg-[#201f1f] text-[#abc7ff] focus:ring-[#abc7ff] focus:ring-offset-[#131313] transition-colors duration-200 cursor-pointer disabled:opacity-50"
              />
              <label htmlFor="terms" className="text-[#c4c7c8] font-mono text-[12px] tracking-[0.05em] leading-tight cursor-pointer hover:text-white transition-colors flex-1">
                I AGREE TO THE <span className="text-[#abc7ff] hover:underline transition-all">TERMS OF SERVICE</span> AND <span className="text-[#abc7ff] hover:underline transition-all">PRIVACY POLICY</span> REGARDING ADMIN ACCESS.
              </label>
            </div>
            {errors.terms && (
              <span className="text-[12px] text-[#ffb4ab] block font-mono tracking-wide mt-1">
                {errors.terms.message}
              </span>
            )}

            {/* Action Submit Button */}
            <div className="pt-4">
              <button
                type="submit"
                disabled={registerMutation.isPending || registerMutation.isSuccess}
                className="w-full py-4 bg-white text-[#2f3131] rounded-full font-sans text-[14px] leading-[20px] font-semibold tracking-[0.01em] shadow-[0_0_20px_rgba(255,255,255,0.1)] hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-75 disabled:cursor-not-allowed disabled:hover:scale-100"
              >
                {registerMutation.isPending ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Processing...
                  </>
                ) : registerMutation.isSuccess ? (
                  <>
                    <CheckCircle className="h-5 w-5 text-[#34A853]" />
                    Success
                  </>
                ) : (
                  <>
                    Create Account
                    <ArrowRight className="h-[18px] w-[18px]" />
                  </>
                )}
              </button>
            </div>

          </form>

          {/* Navigation to Login */}
          <div className="mt-8 text-center select-none">
            <p className="font-sans text-[16px] leading-[24px] text-[#c4c7c8]">
              Already have an account?
              <Link to="/login" className="text-white font-bold hover:underline ml-1">
                Sign In
              </Link>
            </p>
          </div>

        </div>
      </main>

      {/* Footer Section */}
      <footer className="w-full py-8 px-6 md:px-10 flex flex-col md:flex-row justify-between items-center gap-4 border-t border-[#444748]/10 relative z-50 select-none">
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
