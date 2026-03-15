import React, { useState } from "react";
import { loginUser, registerUser, getMe } from "../api/auth.js";
import { useAuth } from "../context/AuthContext.jsx";
import { useNavigate } from "react-router-dom";
import Loader from "../components/Loader.jsx";
import { LogIn, UserPlus, Shield, Lock, KeyRound } from "lucide-react";

const AuthToggle = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [form, setForm] = useState({
    username: "",   // used only on register
    email: "",       // used on both login and register
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const navigate = useNavigate();
  const { login } = useAuth();

  const switchMode = () => {
    setIsLogin((prev) => !prev);
    setError("");
    setForm({ username: "", email: "", password: "" });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // ✅ Prevent double submit
    if (loading) return;

    setLoading(true);
    setError("");

    try {
      if (isLogin) {
        // 1️⃣ Login → get token (cookie handled in API)
        const { access_token } = await loginUser({
          email: form.email.trim(),
          password: form.password,
        });

        // ❌ DO NOT store token in localStorage
        // Cookies are already handled inside api/auth.js

        // 2️⃣ Fetch user profile
        const userObj = await getMe();

        // 3️⃣ Update auth context
        login(access_token, userObj);

        // 4️⃣ Redirect
        navigate("/dashboard", { replace: true });
      } else {
        // Register
        await registerUser({
          username: form.username.trim(),
          email: form.email.trim(),
          password: form.password,
        });

        setForm((f) => ({ ...f, email: form.email.trim(), password: "" }));
        alert("Registration successful! You can log in now.");
        switchMode();
      }
    } catch (err) {
      console.error("Auth error:", err);

      setError(
        err.response?.data?.detail ||
          err.response?.data?.message ||
          "Authentication failed. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-primary-dark">

      {/* ---------- CYBER BACKGROUND GRID ---------- */}
      <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_center,rgba(0,255,255,0.3),transparent_70%)]"></div>
      <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(0,255,255,0.15)_1px,transparent_1px),linear-gradient(rgba(0,255,255,0.15)_1px,transparent_1px)] bg-[size:40px_40px] animate-pulse"></div>

      {/* Floating icons */}
      <Lock
        className="absolute top-10 left-10 text-cyan-400 opacity-20 animate-bounce-slow"
        size={60}
      />
      <KeyRound
        className="absolute bottom-10 right-12 text-cyan-300 opacity-20 animate-float"
        size={70}
      />

      {/* ---------- AUTH CARD ---------- */}
      <div className="bg-secondary-dark p-8 rounded-xl w-full max-w-md border border-gray-700 shadow-xl backdrop-blur-sm relative z-10">

        <div className="flex items-center justify-center mb-6">
          <Shield className="text-accent-cyber w-10 h-10 animate-pulse" />
        </div>

        <h2 className="text-2xl text-center font-bold text-white mb-4">
          {isLogin ? "Secure Login" : "Create Account"}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">

          {/* Email — used for both login and register */}
          <input
            type="email"
            placeholder="Email address"
            value={form.email}
            onChange={(e) =>
              setForm({ ...form, email: e.target.value })
            }
            className="input-cyber text-white placeholder-gray-400"
            required
            autoComplete="email"
          />

          {/* Username — only needed on register */}
          {!isLogin && (
            <input
              type="text"
              placeholder="Username (display name)"
              value={form.username}
              onChange={(e) =>
                setForm({ ...form, username: e.target.value })
              }
              className="input-cyber text-white placeholder-gray-400"
              required
            />
          )}

          {/* Password */}
          <input
            type="password"
            placeholder="Password"
            value={form.password}
            onChange={(e) =>
              setForm({ ...form, password: e.target.value })
            }
            className="input-cyber text-white placeholder-gray-400"
            required
          />

          {error && (
            <p className="bg-red-900/40 p-2 rounded text-red-400 text-sm">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full flex justify-center"
          >
            {loading ? <Loader /> : isLogin ? "Login" : "Register"}
          </button>
        </form>

        {/* Toggle link */}
        <button
          onClick={switchMode}
          className="text-accent-cyber mt-4 w-full text-center hover:underline"
        >
          {isLogin ? (
            <span className="flex justify-center gap-1">
              <UserPlus size={18} /> Create Account
            </span>
          ) : (
            <span className="flex justify-center gap-1">
              <LogIn size={18} /> Back to Login
            </span>
          )}
        </button>
      </div>
    </div>
  );
};

export default AuthToggle;
