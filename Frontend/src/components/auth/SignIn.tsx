import React, { type FormEvent } from 'react'; // FIXED: Use 'type' import for FormEvent
import { Mail, Lock, LogIn, Chrome, X } from 'lucide-react'; // Added 'X' icon for close button

interface SignInProps {
  onClose: () => void;
  onSwitchToSignUp: () => void;
  onAuthSuccess: () => void; // New prop to handle successful auth
}

const SignIn: React.FC<SignInProps> = ({ onClose, onSwitchToSignUp, onAuthSuccess }) => {
  
  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    // TODO: Add your actual authentication logic here
    
    // Simulate successful login
    onAuthSuccess();
  };

  const handleGoogleSignIn = () => {
    // TODO: Add Google OAuth logic here
    // For now, simulate successful login
    onAuthSuccess();
  };

  return (
    <> 
      <h2 className="text-3xl font-bold mb-8 text-center text-white">
        Welcome Back
      </h2>

      {/* Sign In Form */}
      <form className="space-y-5" onSubmit={handleSubmit}>
        {/* Email Input */}
        <div>
          <label htmlFor="email" className="block text-sm font-medium mb-1 text-gray-300">
            Email Address
          </label>
          <div className="relative">
            <Mail className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-blue-400" />
            <input
              id="email"
              type="email"
              placeholder="you@example.com"
              className="w-full pl-10 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 bg-slate-800 border-slate-700 text-white focus:ring-blue-500 transition-colors"
              required
            />
          </div>
        </div>

        {/* Password Input */}
        <div>
          <label htmlFor="password" className="block text-sm font-medium mb-1 text-gray-300">
            Password
          </label>
          <div className="relative">
            <Lock className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-blue-400" />
            <input
              id="password"
              type="password"
              placeholder="••••••••"
              className="w-full pl-10 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 bg-slate-800 border-slate-700 text-white focus:ring-blue-500 transition-colors"
              required
            />
          </div>
        </div>

        {/* Sign In Button */}
        <button
          type="submit"
          // FIXED: Changed bg-gradient-to-r to bg-linear-to-r (canonical class)
          className="w-full px-5 py-3 rounded-lg bg-linear-to-r from-blue-500 to-gray-500 hover:from-blue-600 hover:to-blue-500 transition shadow-lg shadow-blue-500/50 text-lg font-semibold flex items-center justify-center gap-2 mt-6 text-white"
        >
          <LogIn className="w-5 h-5" />
          Sign In
        </button>
      </form>

      <div className="flex items-center my-6">
        {/* FIXED: Changed flex-grow to grow (canonical class) */}
        <div className="grow border-t border-slate-700"></div>
        {/* FIXED: Changed flex-shrink to shrink (canonical class) */}
        <span className="shrink mx-4 text-sm text-gray-400">OR</span>
        {/* FIXED: Changed flex-grow to grow (canonical class) */}
        <div className="grow border-t border-slate-700"></div>
      </div>

      {/* Social Sign In */}
      <button
        type="button"
        onClick={handleGoogleSignIn}
        className="w-full px-5 py-3 rounded-lg border-2 border-blue-400 text-blue-400 hover:bg-blue-400/10 transition-all font-semibold flex items-center justify-center gap-3 bg-slate-900"
      >
        <Chrome className="w-5 h-5" />
        Sign In with Google
      </button>

      <p className="mt-8 text-center text-sm text-gray-400">
        Don't have an account?
        <button 
          type="button" 
          onClick={onSwitchToSignUp} 
          className="ml-2 font-medium text-blue-400 hover:text-blue-300 transition-colors"
        >
          Sign Up
        </button>
      </p>
    </>
  );
};

export default SignIn;