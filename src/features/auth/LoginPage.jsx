import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, Lock, Mail, AlertCircle } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export default function LoginPage() {
  const { login } = useApp();
  const navigate = useNavigate();

  const [email, setEmail] = useState('siddharth@example.com');
  const [password, setPassword] = useState('password123');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Please provide both email and password.');
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      login(email, 'Siddharth');
      setIsSubmitting(false);
      navigate('/');
    }, 400);
  };

  const handleDemoLogin = () => {
    login('siddharth@example.com', 'Siddharth');
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-pulse-bg flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-pulse-card border border-pulse-border rounded-2xl p-8 shadow-2xl space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-2 mb-1">
            <svg 
              className="w-8 h-8 text-pulse-accent stroke-current" 
              viewBox="0 0 24 24" 
              fill="none" 
              strokeWidth="2.5" 
              strokeLinecap="round" 
              strokeLinejoin="round"
            >
              <path d="M2 12h4l3-7 4 14 3-7h6" />
            </svg>
            <span className="text-2xl font-bold tracking-tight text-white">
              PULSE<span className="text-pulse-accent">.</span>
            </span>
          </div>
          <h1 className="text-xl font-bold text-white">Sign In to Your Account</h1>
          <p className="text-xs text-pulse-text-secondary">
            Personal Expense Tracking Web Application
          </p>
        </div>

        {error && (
          <div className="flex items-center gap-2 p-3 bg-pulse-negative/15 border border-pulse-negative/30 rounded-xl text-pulse-negative text-xs">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-pulse-text-secondary uppercase tracking-wider mb-1.5">
              Email Address
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-pulse-text-secondary absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full pl-9 pr-4 py-2.5 bg-pulse-bg border border-pulse-border focus:border-pulse-accent rounded-xl text-sm text-white focus:outline-none"
                required
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-medium text-pulse-text-secondary uppercase tracking-wider">
                Password
              </label>
              <span className="text-xs text-pulse-accent hover:underline cursor-pointer">
                Forgot password?
              </span>
            </div>
            <div className="relative">
              <Lock className="w-4 h-4 text-pulse-text-secondary absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-9 pr-4 py-2.5 bg-pulse-bg border border-pulse-border focus:border-pulse-accent rounded-xl text-sm text-white focus:outline-none"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-2.5 px-4 bg-pulse-accent text-black font-semibold rounded-xl text-sm hover:bg-pulse-accent-hover transition-colors shadow-md flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {isSubmitting ? (
              <span className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <span>Sign In</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <div className="relative my-4">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-pulse-border"></div>
          </div>
          <div className="relative flex justify-center text-xs">
            <span className="bg-pulse-card px-2 text-pulse-text-secondary">or</span>
          </div>
        </div>

        {/* Instant Demo Login Button */}
        <button
          onClick={handleDemoLogin}
          type="button"
          className="w-full py-2.5 px-4 bg-pulse-bg border border-pulse-border hover:border-pulse-accent text-white font-medium rounded-xl text-xs transition-colors flex items-center justify-center gap-2"
        >
          <span>Continue as Demo User (Siddharth)</span>
        </button>

        <p className="text-center text-xs text-pulse-text-secondary pt-2">
          Don't have an account?{' '}
          <Link to="/register" className="text-pulse-accent hover:underline font-medium">
            Create an account
          </Link>
        </p>
      </div>
    </div>
  );
}
