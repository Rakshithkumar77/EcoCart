import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import { User, Mail, Lock, Phone, Eye, EyeOff, AlertCircle } from 'lucide-react';

const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().min(1, 'Email is required').email('Must be a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string().min(6, 'Please confirm your password'),
  phone: z.string().optional(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

const Register = () => {
  const { register: signup } = useAuth();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      await signup(data.name, data.email, data.password, data.phone);
      toast.success("Account created successfully!");
      navigate('/');
    } catch (err) {
      if (typeof err === 'object') {
        // Display validation errors if returned as an object map from backend
        Object.values(err).forEach((msg) => toast.error(msg));
      } else {
        toast.error(err || "Registration failed");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-gray-50">
      <div className="max-w-md w-full bg-white rounded-3xl border border-gray-100 shadow-xl p-8 space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">Create Account</h2>
          <p className="text-sm text-gray-500">Register today and access exclusive coupons and deals</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Name */}
          <div className="space-y-1">
            <label className="text-sm font-semibold text-gray-700">Full Name</label>
            <div className="relative">
              <span className="absolute left-3.5 top-3 text-gray-400">
                <User size={18} />
              </span>
              <input
                type="text"
                placeholder="John Doe"
                {...register('name')}
                className={`w-full bg-gray-50 text-gray-800 placeholder-gray-400 pl-10 pr-4 py-2.5 rounded-xl border ${
                  errors.name ? 'border-red-500 focus:border-red-500' : 'border-gray-200 focus:border-indigo-500'
                } focus:outline-none focus:bg-white transition-all text-sm`}
              />
            </div>
            {errors.name && (
              <span className="text-xs text-red-500 flex items-center mt-1">
                <AlertCircle size={12} className="mr-1" />
                {errors.name.message}
              </span>
            )}
          </div>

          {/* Email */}
          <div className="space-y-1">
            <label className="text-sm font-semibold text-gray-700">Email Address</label>
            <div className="relative">
              <span className="absolute left-3.5 top-3 text-gray-400">
                <Mail size={18} />
              </span>
              <input
                type="email"
                placeholder="john@example.com"
                {...register('email')}
                className={`w-full bg-gray-50 text-gray-800 placeholder-gray-400 pl-10 pr-4 py-2.5 rounded-xl border ${
                  errors.email ? 'border-red-500 focus:border-red-500' : 'border-gray-200 focus:border-indigo-500'
                } focus:outline-none focus:bg-white transition-all text-sm`}
              />
            </div>
            {errors.email && (
              <span className="text-xs text-red-500 flex items-center mt-1">
                <AlertCircle size={12} className="mr-1" />
                {errors.email.message}
              </span>
            )}
          </div>

          {/* Phone */}
          <div className="space-y-1">
            <label className="text-sm font-semibold text-gray-700">Phone Number (Optional)</label>
            <div className="relative">
              <span className="absolute left-3.5 top-3 text-gray-400">
                <Phone size={18} />
              </span>
              <input
                type="text"
                placeholder="+1 (555) 000-0000"
                {...register('phone')}
                className="w-full bg-gray-50 text-gray-800 placeholder-gray-400 pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 focus:border-indigo-500 focus:outline-none focus:bg-white transition-all text-sm"
              />
            </div>
          </div>

          {/* Password */}
          <div className="space-y-1">
            <label className="text-sm font-semibold text-gray-700">Password</label>
            <div className="relative">
              <span className="absolute left-3.5 top-3 text-gray-400">
                <Lock size={18} />
              </span>
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                {...register('password')}
                className={`w-full bg-gray-50 text-gray-800 placeholder-gray-400 pl-10 pr-10 py-2.5 rounded-xl border ${
                  errors.password ? 'border-red-500 focus:border-red-500' : 'border-gray-200 focus:border-indigo-500'
                } focus:outline-none focus:bg-white transition-all text-sm`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-3 text-gray-400 hover:text-gray-600 focus:outline-none"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {errors.password && (
              <span className="text-xs text-red-500 flex items-center mt-1">
                <AlertCircle size={12} className="mr-1" />
                {errors.password.message}
              </span>
            )}
          </div>

          {/* Confirm Password */}
          <div className="space-y-1">
            <label className="text-sm font-semibold text-gray-700">Confirm Password</label>
            <div className="relative">
              <span className="absolute left-3.5 top-3 text-gray-400">
                <Lock size={18} />
              </span>
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                placeholder="••••••••"
                {...register('confirmPassword')}
                className={`w-full bg-gray-50 text-gray-800 placeholder-gray-400 pl-10 pr-10 py-2.5 rounded-xl border ${
                  errors.confirmPassword ? 'border-red-500 focus:border-red-500' : 'border-gray-200 focus:border-indigo-500'
                } focus:outline-none focus:bg-white transition-all text-sm`}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-3 text-gray-400 hover:text-gray-600 focus:outline-none"
              >
                {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {errors.confirmPassword && (
              <span className="text-xs text-red-500 flex items-center mt-1">
                <AlertCircle size={12} className="mr-1" />
                {errors.confirmPassword.message}
              </span>
            )}
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white font-bold py-3 rounded-xl transition-all shadow-md hover:shadow-lg focus:outline-none flex justify-center items-center"
          >
            {loading ? (
              <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div>
            ) : (
              'Create Account'
            )}
          </button>
        </form>

        <hr className="border-gray-100" />

        {/* Footer */}
        <div className="text-center text-sm text-gray-500">
          Already have an account?{' '}
          <Link to="/login" className="font-semibold text-indigo-600 hover:text-indigo-700 transition-colors">
            Log In
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Register;
