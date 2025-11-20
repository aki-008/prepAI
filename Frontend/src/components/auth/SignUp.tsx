import React, { useState } from "react";
import { User, Mail, Lock, UserPlus, Chrome } from "lucide-react";
import API from "../../api/api";

interface SignUpProps {
  onClose: () => void;
  onSwitchToSignIn: () => void;
  onAuthSuccess: () => void;
}

const SignUp: React.FC<SignUpProps> = ({ onSwitchToSignIn, onAuthSuccess }) => {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (password !== confirm) {
      return setError("Passwords do not match.");
    }

    try {
      await API.post("/auth/register", {
        full_name: fullName,
        email,
        password,
      });

      const loginRes = await API.post("/auth/login", {
        username: email,
        password,
      });

      localStorage.setItem("token", loginRes.data.access_token);
      onAuthSuccess();
    } catch (err: any) {
      setError(err.response?.data?.detail || "Registration failed");
    }
  };

  return (
    <>
      <h2 className="text-3xl font-bold mb-8 text-center text-white">
        Create Your Account
      </h2>

      {error && <p className="text-red-400 text-center mb-3">{error}</p>}

      <form className="space-y-5" onSubmit={handleSubmit}>
        <div>
          <label className="text-gray-300">Full Name</label>
          <div className="relative">
            <User className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-blue-400" />
            <input
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              type="text"
              className="w-full pl-10 py-3 bg-slate-800 border border-slate-700 text-white rounded-lg"
              required
            />
          </div>
        </div>

        <div>
          <label className="text-gray-300">Email</label>
          <div className="relative">
            <Mail className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-blue-400" />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full pl-10 py-3 bg-slate-800 border border-slate-700 text-white rounded-lg"
              required
            />
          </div>
        </div>

        <div>
          <label className="text-gray-300">Password</label>
          <div className="relative">
            <Lock className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-blue-400" />
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full pl-10 py-3 bg-slate-800 border border-slate-700 text-white rounded-lg"
              required
            />
          </div>
        </div>

        <div>
          <label className="text-gray-300">Confirm Password</label>
          <div className="relative">
            <Lock className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-blue-400" />
            <input
              type="password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              className="w-full pl-10 py-3 bg-slate-800 border border-slate-700 text-white rounded-lg"
              required
            />
          </div>
        </div>

        <button className="w-full px-5 py-3 rounded-lg bg-linear-to-r from-blue-500 to-gray-500 text-white flex items-center justify-center gap-2">
          <UserPlus className="w-5 h-5" />
          Sign Up
        </button>
      </form>

      <p className="mt-8 text-center text-sm text-gray-400">
        Already have an account?
        <button onClick={onSwitchToSignIn} className="text-blue-400 ml-2">
          Sign In
        </button>
      </p>
    </>
  );
};

export default SignUp;