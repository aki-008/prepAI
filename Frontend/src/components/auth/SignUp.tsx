// src/components/SignUp.tsx - CORRECTED CODE

import React from 'react';
import { User, Mail, Lock, UserPlus, Chrome, X } from 'lucide-react'; 

interface SignUpProps {
    onClose: () => void;
    onSwitchToSignIn: () => void;
    onAuthSuccess: () => void;
}

const SignUp: React.FC<SignUpProps> = ({ onClose, onSwitchToSignIn, onAuthSuccess }) => {
    
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // ... (Authentication logic remains the same)
        
        // Simulate successful first-time sign-up (which logs them in)
        console.log("Sign Up successful. Logging in and redirecting to dashboard.");
        onAuthSuccess();
    };

    const handleGoogleSignUp = () => {
        // ... (Google Auth logic remains the same)
        onAuthSuccess();
    };

    return (
        <>
            <h2 className="text-3xl font-bold mb-8 text-center text-white">
                Create Your Account
            </h2>
            {/* --- Sign Up Form --- */}
            <form className="space-y-5" onSubmit={handleSubmit}>
                {/* Name Input */}
                <div>
                    <label htmlFor="name" className="block text-sm font-medium mb-1 text-gray-300">Full Name</label>
                    <div className="relative">
                        <User className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-blue-400" />
                        <input
                            id="name"
                            type="text"
                            placeholder="John Doe"
                            className="w-full pl-10 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 bg-slate-800 border-slate-700 text-white focus:ring-blue-500 transition-colors"
                            required
                        />
                    </div>
                </div>

                {/* Email Input */}
                <div>
                    <label htmlFor="email" className="block text-sm font-medium mb-1 text-gray-300">Email Address</label>
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
                    <label htmlFor="password" className="block text-sm font-medium mb-1 text-gray-300">Password</label>
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

                {/* Confirm Password Input */}
                <div>
                    <label htmlFor="confirm-password" className="block text-sm font-medium mb-1 text-gray-300">Confirm Password</label>
                    <div className="relative">
                        <Lock className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-blue-400" />
                        <input
                            id="confirm-password"
                            type="password"
                            placeholder="••••••••"
                            className="w-full pl-10 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 bg-slate-800 border-slate-700 text-white focus:ring-blue-500 transition-colors"
                            required
                        />
                    </div>
                </div>

                {/* Sign Up Button */}
                <button
                    type="submit"
                    // FIXED: Changed bg-gradient-to-r to bg-linear-to-r (canonical class)
                    className="w-full px-5 py-3 rounded-lg bg-linear-to-r from-blue-500 to-gray-500 hover:from-blue-600 hover:to-blue-500 transition shadow-lg shadow-blue-500/50 text-lg font-semibold flex items-center justify-center gap-2 mt-6 text-white"
                >
                    <UserPlus className="w-5 h-5" />
                    Sign Up
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

            {/* --- Social Sign Up --- */}
            <button
                type="button"
                onClick={handleGoogleSignUp}
                className="w-full px-5 py-3 rounded-lg border-2 border-blue-400 text-blue-400 hover:bg-blue-400/10 transition-all font-semibold flex items-center justify-center gap-3 bg-slate-900"
            >
                <Chrome className="w-5 h-5" />
                Sign Up with Google
            </button>

            <p className="mt-8 text-center text-sm text-gray-400">
                Already have an account?
                <button type="button" onClick={onSwitchToSignIn} className="ml-2 font-medium text-blue-400 hover:text-blue-300 transition-colors">
                    Sign In
                </button>
            </p>
        </>
    );
};

export default SignUp;