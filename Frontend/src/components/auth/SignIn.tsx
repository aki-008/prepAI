import React, { useState, type FormEvent } from "react";
import { Mail, Lock, LogIn, Chrome } from "lucide-react";
import API from "../../api/api";

interface SignInProps {
  onClose: () => void;
  onSwitchToSignUp: () => void;
  onAuthSuccess: () => void;
}

const SignIn: React.FC<SignInProps> = ({ onClose, onSwitchToSignUp, onAuthSuccess }) => {
  // const [email, setEmail] = useState("");
  const [username, setUserName] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");

    try {
      const res = await API.post("/auth/login", {
        username: username,   // 🔥 FastAPI expects `username` (OAuth2PasswordRequestForm)
        password,
      });

      localStorage.setItem("token", res.data.access_token);
      onAuthSuccess();
    } catch (err: any) {
      setError(err.response?.data?.detail || "Login failed");
    }
  };

  return (
    <>
      <h2 className="text-3xl font-bold mb-8 text-center text-white">
        Welcome Back
      </h2>

      {error && <p className="text-red-400 text-center mb-3">{error}</p>}

      <form className="space-y-5" onSubmit={handleSubmit}>
        <div>
          <label className="block text-sm mb-1 text-gray-300">Email</label>
          <div className="relative">
            <Mail className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-blue-400" />
            <input
              type="string"
              placeholder="username or email"
              value={username}
              onChange={(e) => setUserName(e.target.value)}
              className="w-full pl-10 py-3 bg-slate-800 border border-slate-700 text-white rounded-lg"
              required
            />
          </div>
        </div>

        <div>
          <label className="block text-sm mb-1 text-gray-300">Password</label>
          <div className="relative">
            <Lock className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-blue-400" />
            <input
              type="string"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full pl-10 py-3 bg-slate-800 border border-slate-700 text-white rounded-lg"
              required
            />
          </div>
        </div>

        <button className="w-full px-5 py-3 rounded-lg bg-linear-to-r from-blue-500 to-gray-500 text-white flex items-center justify-center gap-2">
          <LogIn className="w-5 h-5" />
          Sign In
        </button>
      </form>

      <p className="mt-8 text-center text-sm text-gray-400">
        Don’t have an account?
        <button onClick={onSwitchToSignUp} className="ml-2 text-blue-400">Sign Up</button>
      </p>
    </>
  );
};

export default SignIn;