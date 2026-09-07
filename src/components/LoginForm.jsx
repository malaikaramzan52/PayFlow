import React, { useState } from 'react';
import { Mail, Lock, Eye, EyeOff, ArrowRight, AlertCircle } from 'lucide-react';
import PayFlowLogo from './PayFlowLogo';

export default function LoginForm({ onLoginSuccess }) {
  const [identifier, setIdentifier] = useState('admin@payflow.com');
  const [password, setPassword] = useState('admin123');
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [authError, setAuthError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Mock valid credentials
  const MOCK_CREDENTIALS = [
    { email: 'admin@payflow.com', password: 'admin123', role: 'System Administrator', name: 'Alex Vance' },
    { email: 'demo@payflow.com', password: 'demo123', role: 'Finance Manager', name: 'Sarah Jenkins' }
  ];

  const handleQuickFill = (email, pwd) => {
    setIdentifier(email);
    setPassword(pwd);
    setErrors({});
    setAuthError('');
  };

  const validate = () => {
    const newErrors = {};
    if (!identifier.trim()) {
      newErrors.identifier = 'Email or Username is required';
    }
    if (!password) {
      newErrors.password = 'Password is required';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setAuthError('');

    if (!validate()) {
      return;
    }

    setIsLoading(true);

    // Simulate network delay for realistic UI feedback
    setTimeout(() => {
      setIsLoading(false);
      const userMatch = MOCK_CREDENTIALS.find(
        (cred) =>
          (cred.email.toLowerCase() === identifier.trim().toLowerCase() ||
           cred.email.split('@')[0].toLowerCase() === identifier.trim().toLowerCase()) &&
          cred.password === password
      );

      if (userMatch) {
        onLoginSuccess(userMatch);
      } else {
        setAuthError('Invalid credentials. Please check your username and password.');
      }
    }, 600);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 sm:p-6 md:p-8 bg-grid-pattern select-none">
      {/* Clean Centered Card */}
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl shadow-slate-200/80 border border-slate-200/80 p-6 sm:p-8 md:p-10 flex flex-col justify-between relative">
        
        <div>
          {/* Top Header Branding */}
          <div className="mb-8 pb-6 border-b border-slate-100 flex justify-center">
            <PayFlowLogo size="md" lightMode={false} />
          </div>

          <div className="w-full">
            
            {/* Form Title */}
            <div className="mb-8 text-center sm:text-left">
              <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
                Sign in to PayFlow
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 mt-1.5">
                Enter your credentials to access your ERP portal
              </p>
            </div>

            {/* Error Banner for Invalid Credentials */}
            {authError && (
              <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 flex items-start gap-3 text-red-700 text-sm animate-fade-in">
                <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="font-semibold text-red-800">Authentication Failed</p>
                  <p className="text-xs text-red-600 mt-0.5">{authError}</p>
                </div>
              </div>
            )}

            {/* Login Form */}
            <form onSubmit={handleSubmit} noValidate className="space-y-5">
              
              {/* Email / Username Input */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                  Email or Username <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Mail className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    value={identifier}
                    onChange={(e) => {
                      setIdentifier(e.target.value);
                      if (errors.identifier) setErrors({ ...errors, identifier: null });
                      if (authError) setAuthError('');
                    }}
                    placeholder="e.g. admin@payflow.com"
                    className={`w-full pl-10 pr-4 py-3 bg-slate-50 text-slate-900 placeholder:text-slate-400 rounded-lg text-sm border transition focus:outline-none focus:ring-2 ${
                      errors.identifier
                        ? 'border-red-300 focus:border-red-500 focus:ring-red-200'
                        : 'border-slate-200 focus:border-blue-600 focus:ring-blue-100 hover:border-slate-300'
                    }`}
                  />
                </div>
                {errors.identifier && (
                  <p className="text-xs text-red-500 mt-1.5 font-medium flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5" /> {errors.identifier}
                  </p>
                )}
              </div>

              {/* Password Input with Show/Hide Toggle */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                    Password <span className="text-red-500">*</span>
                  </label>
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      if (errors.password) setErrors({ ...errors, password: null });
                      if (authError) setAuthError('');
                    }}
                    placeholder="••••••••"
                    className={`w-full pl-10 pr-11 py-3 bg-slate-50 text-slate-900 placeholder:text-slate-400 rounded-lg text-sm border transition focus:outline-none focus:ring-2 ${
                      errors.password
                        ? 'border-red-300 focus:border-red-500 focus:ring-red-200'
                        : 'border-slate-200 focus:border-blue-600 focus:ring-blue-100 hover:border-slate-300'
                    }`}
                  />
                  {/* Password Toggle Button */}
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    tabIndex={-1}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 focus:outline-none transition cursor-pointer"
                    title={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-xs text-red-500 mt-1.5 font-medium flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5" /> {errors.password}
                  </p>
                )}
              </div>

              {/* Login Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full mt-2 py-3 px-4 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-semibold rounded-lg text-sm shadow-md shadow-blue-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-75 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span>Authenticating...</span>
                  </>
                ) : (
                  <>
                    <span>Log In to ERP</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

          </div>
        </div>

      </div>
    </div>
  );
}
