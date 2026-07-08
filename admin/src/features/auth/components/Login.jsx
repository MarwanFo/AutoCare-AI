import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Link } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, ArrowRight, Car } from 'lucide-react';
import { useLogin } from '../hooks/useAuthMutations';

// Zod Validation Schema matching authentication requirements
const loginSchema = z.object({
  email: z.string()
    .min(1, 'Email address is required')
    .email('Please enter a valid email address'),
  password: z.string()
    .min(8, 'Password must be at least 8 characters long'),
  rememberMe: z.boolean().default(false),
});

export const Login = () => {
  const [showPassword, setShowPassword] = useState(false);
  const loginMutation = useLogin();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
      rememberMe: false,
    },
  });

  const onSubmit = (data) => {
    loginMutation.mutate(data);
  };

  return (
    <>
      {/* Header */}
      <header className="text-center mb-12 select-none">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-[#2a2a2a] mb-6 border border-[#444748]/30 shadow-inner">
          <Car className="h-9 w-9 text-white animate-pulse" />
        </div>
        <h1 className="font-sans text-[48px] leading-[56px] text-white mb-2 tracking-tight font-bold">
          AutoCare AI
        </h1>
        <p className="font-sans text-[16px] leading-[24px] text-[#c4c7c8]">
          Welcome back. Your vehicle's health is our priority.
        </p>
      </header>

      {/* Login Form Container */}
      <div className="bg-[#201f1f] rounded-[1rem] p-6 md:p-10 border border-[#444748] shadow-2xl relative overflow-hidden">
        {/* Subtle gradient line at the top of the card */}
        <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-[#abc7ff] to-transparent opacity-50"></div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
          {/* Input Fields */}
          <div className="space-y-6">
            
            {/* Email Field */}
            <div className="flex flex-col">
              <div className="relative bg-[#131313] rounded-md p-4 border-b-2 border-[#444748] focus-within:border-[#abc7ff] transition-colors duration-300 group flex items-center">
                <Mail className="h-5 w-5 text-[#c4c7c8] mr-3 group-focus-within:text-[#abc7ff] transition-colors shrink-0" />
                <div className="flex-1 relative">
                  <input
                    {...register('email')}
                    id="email"
                    type="email"
                    placeholder="Email"
                    disabled={loginMutation.isPending}
                    className="peer w-full bg-transparent border-none p-0 text-[#e5e2e1] focus:outline-none focus:ring-0 text-[16px] leading-[24px] placeholder-transparent disabled:opacity-50"
                  />
                  <label
                    htmlFor="email"
                    className="absolute left-0 -top-6 font-mono text-[12px] leading-[16px] tracking-[0.05em] font-medium text-[#c4c7c8] peer-focus:text-[#abc7ff] transition-all peer-placeholder-shown:top-0 peer-placeholder-shown:text-base peer-placeholder-shown:text-[#c4c7c8] peer-focus:-top-6 peer-focus:text-[12px] cursor-text"
                  >
                    Email Address
                  </label>
                </div>
              </div>
              {errors.email && (
                <span className="text-[12px] text-[#ffb4ab] mt-1.5 ml-1 font-mono tracking-wide">
                  {errors.email.message}
                </span>
              )}
            </div>

            {/* Password Field */}
            <div className="flex flex-col">
              <div className="relative bg-[#131313] rounded-md p-4 border-b-2 border-[#444748] focus-within:border-[#abc7ff] transition-colors duration-300 group flex items-center">
                <Lock className="h-5 w-5 text-[#c4c7c8] mr-3 group-focus-within:text-[#abc7ff] transition-colors shrink-0" />
                <div className="flex-1 relative">
                  <input
                    {...register('password')}
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Password"
                    disabled={loginMutation.isPending}
                    className="peer w-full bg-transparent border-none p-0 text-[#e5e2e1] focus:outline-none focus:ring-0 text-[16px] leading-[24px] placeholder-transparent disabled:opacity-50"
                  />
                  <label
                    htmlFor="password"
                    className="absolute left-0 -top-6 font-mono text-[12px] leading-[16px] tracking-[0.05em] font-medium text-[#c4c7c8] peer-focus:text-[#abc7ff] transition-all peer-placeholder-shown:top-0 peer-placeholder-shown:text-base peer-placeholder-shown:text-[#c4c7c8] peer-focus:-top-6 peer-focus:text-[12px] cursor-text"
                  >
                    Password
                  </label>
                </div>
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={loginMutation.isPending}
                  className="ml-3 text-[#c4c7c8] hover:text-white transition-colors focus:outline-none cursor-pointer disabled:opacity-50"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5 shrink-0" />
                  ) : (
                    <Eye className="h-5 w-5 shrink-0" />
                  )}
                </button>
              </div>
              {errors.password && (
                <span className="text-[12px] text-[#ffb4ab] mt-1.5 ml-1 font-mono tracking-wide">
                  {errors.password.message}
                </span>
              )}
            </div>
          </div>

          {/* Remember Me & Forgot Password */}
          <div className="flex items-center justify-between font-sans text-sm">
            <label className="flex items-center cursor-pointer group select-none">
              <input
                {...register('rememberMe')}
                type="checkbox"
                disabled={loginMutation.isPending}
                className="form-checkbox bg-[#2a2a2a] border-[#444748] rounded text-[#abc7ff] focus:ring-[#abc7ff] focus:ring-offset-[#131313] w-5 h-5 transition-colors group-hover:border-white disabled:opacity-50 cursor-pointer"
              />
              <span className="ml-3 text-[#c4c7c8] group-hover:text-white transition-colors">
                Remember me
              </span>
            </label>
            <Link
              to="/forgot-password"
              className="text-[#abc7ff] hover:text-white transition-colors hover:underline underline-offset-4 decoration-[#abc7ff]/50"
            >
              Forgot password?
            </Link>
          </div>

          {/* Actions */}
          <div className="space-y-4 pt-4">
            <button
              type="submit"
              disabled={loginMutation.isPending}
              className="w-full bg-white text-[#2f3131] font-sans text-[14px] leading-[20px] tracking-[0.01em] font-semibold py-4 px-6 rounded-full hover:bg-opacity-90 active:scale-[0.98] transition-all flex items-center justify-center shadow-[0_0_20px_rgba(255,255,255,0.1)] cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed group"
            >
              {loginMutation.isPending ? 'Logging in...' : 'Login'}
              {!loginMutation.isPending && (
                <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
              )}
            </button>

            <button
              type="button"
              disabled={loginMutation.isPending}
              className="w-full bg-transparent border border-[#444748] text-white font-sans text-[14px] leading-[20px] tracking-[0.01em] font-semibold py-4 px-6 rounded-full hover:bg-[#353534] hover:border-[#8e9192] active:scale-[0.98] transition-all flex items-center justify-center group cursor-pointer disabled:opacity-50"
            >
              <svg
                className="w-5 h-5 mr-3 group-hover:scale-110 transition-transform shrink-0"
                fill="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  fill="#4285F4"
                />
                <path
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  fill="#34A853"
                />
                <path
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  fill="#FBBC05"
                />
                <path
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  fill="#EA4335"
                />
              </svg>
              Continue with Google
            </button>
          </div>
        </form>
      </div>

    </>
  );
};
