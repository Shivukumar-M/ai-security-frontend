import React, { useRef, useState } from "react";
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
  const [bgMotion, setBgMotion] = useState({
    x: 50,
    y: 50,
    shiftX: 0,
    shiftY: 0,
    energy: 0,
    active: false,
  });
  const lastMouseRef = useRef({ x: 50, y: 50, t: 0 });

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

  const handleBackgroundMove = (event) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width) * 100;
    const y = ((event.clientY - rect.top) / rect.height) * 100;
    const shiftX = ((x - 50) / 50) * 16;
    const shiftY = ((y - 50) / 50) * 12;

    const now = performance.now();
    const dt = Math.max(16, now - lastMouseRef.current.t);
    const dx = x - lastMouseRef.current.x;
    const dy = y - lastMouseRef.current.y;
    const speed = Math.sqrt(dx * dx + dy * dy) / dt;
    const energy = Math.min(1, speed * 1.2);

    lastMouseRef.current = { x, y, t: now };
    setBgMotion({ x, y, shiftX, shiftY, energy, active: true });
  };

  const resetBackgroundMove = () => {
    setBgMotion((prev) => ({ ...prev, shiftX: 0, shiftY: 0, energy: 0, active: false }));
  };

  return (
    <div
      className="auth-scene min-h-screen flex items-center justify-center relative overflow-hidden bg-primary-dark px-4 py-10"
      onMouseMove={handleBackgroundMove}
      onMouseEnter={handleBackgroundMove}
      onMouseLeave={resetBackgroundMove}
      style={{
        "--mx": `${bgMotion.x}%`,
        "--my": `${bgMotion.y}%`,
        "--bg-shift-x": `${bgMotion.shiftX}px`,
        "--bg-shift-y": `${bgMotion.shiftY}px`,
        "--bg-energy": bgMotion.energy,
        "--bg-active-opacity": bgMotion.active ? 1 : 0,
      }}
    >

      {/* ---------- CYBER BACKGROUND GRID ---------- */}
      <div className="absolute inset-0 auth-vignette" />
      <div className="absolute inset-0 auth-grid" />
      <div className="absolute inset-0 auth-scanlines" />
      <div className="absolute -left-20 top-10 h-64 w-64 rounded-full bg-cyan-500/15 blur-3xl auth-blob" />
      <div className="absolute -right-24 bottom-6 h-72 w-72 rounded-full bg-teal-400/10 blur-3xl auth-blob auth-blob-delay" />

      {/* Floating icons */}
      <Lock
        className="absolute top-8 left-8 text-cyan-400/30 auth-float-icon"
        size={60}
      />
      <KeyRound
        className="absolute bottom-10 right-10 text-cyan-300/30 auth-float-icon auth-float-icon-delay"
        size={70}
      />

      {/* ---------- AUTH CARD ---------- */}
      <div className="auth-card-wrap relative z-10 w-full max-w-md rounded-2xl p-[1px]">
        <div className="bg-[#1a2129]/95 p-8 rounded-2xl w-full border border-cyan-300/15 shadow-2xl backdrop-blur-md relative overflow-hidden">
          <div className="pointer-events-none absolute inset-0 auth-card-noise" />
          <div className="pointer-events-none absolute inset-0 auth-card-shimmer" />

          <div className="flex items-center justify-center mb-6 relative">
            <div className="absolute h-14 w-14 rounded-full bg-cyan-400/20 blur-xl" />
            <Shield className="text-accent-cyber w-10 h-10 animate-pulse relative z-10" />
          </div>

          <h2 className="text-2xl text-center font-bold text-white mb-4 auth-title-glow">
            {isLogin ? "Secure Login" : "Create Account"}
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4 relative z-10">

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
              className="btn-primary w-full flex justify-center auth-submit-btn"
            >
              {loading ? <Loader /> : isLogin ? "Login" : "Register"}
            </button>
          </form>

          {/* Toggle link */}
          <button
            onClick={switchMode}
            className="text-accent-cyber mt-4 w-full text-center hover:underline relative z-10"
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

      <style>{`
        @keyframes authGridDrift {
          from { background-position: 0 0, 0 0; }
          to { background-position: -42px -42px, -42px -42px; }
        }

        @keyframes authScan {
          0% { transform: translateY(-100%); opacity: 0; }
          10% { opacity: 0.3; }
          100% { transform: translateY(100%); opacity: 0; }
        }

        @keyframes authHoverSweep {
          0% { background-position: -22% 0, 50% 0, 122% 0; }
          100% { background-position: 12% 0, 50% 0, 88% 0; }
        }

        @keyframes authBlobFloat {
          0%, 100% { transform: translate3d(0, 0, 0) scale(1); }
          50% { transform: translate3d(0, -10px, 0) scale(1.03); }
        }

        @keyframes authCardEnter {
          0% { opacity: 0; transform: translateY(24px) scale(0.97); }
          100% { opacity: 1; transform: translateY(0) scale(1); }
        }

        @keyframes authCardFloat {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-3px); }
        }

        @keyframes authBorderSpin {
          from { background-position: 0% 50%; }
          to { background-position: 200% 50%; }
        }

        @keyframes authIconFloat {
          0%, 100% { transform: translateY(0); opacity: 0.25; }
          50% { transform: translateY(-7px); opacity: 0.35; }
        }

        @keyframes authShimmer {
          0% {
            transform: translateX(-180%);
            opacity: 0;
          }
          15% {
            opacity: 0.55;
          }
          85% {
            opacity: 0.55;
          }
          100% {
            transform: translateX(220%);
            opacity: 0;
          }
        }

        @keyframes authTitleGlow {
          0%, 100% { text-shadow: 0 0 0 rgba(34, 211, 238, 0); }
          50% { text-shadow: 0 0 18px rgba(34, 211, 238, 0.45); }
        }

        .auth-vignette {
          background:
            radial-gradient(circle at 12% 10%, rgba(34, 211, 238, 0.12), transparent 35%),
            radial-gradient(circle at 88% 86%, rgba(45, 212, 191, 0.1), transparent 42%),
            linear-gradient(180deg, #13161a 0%, #111317 100%);
          transition: transform 700ms cubic-bezier(0.22, 1, 0.36, 1);
        }

        .auth-grid {
          opacity: 0.52;
          position: relative;
          background-image:
            linear-gradient(rgba(0, 240, 255, 0.18) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0, 240, 255, 0.18) 1px, transparent 1px);
          background-size: 54px 54px, 54px 54px;
          animation: authGridDrift 32s linear infinite;
          transition: transform 760ms cubic-bezier(0.22, 1, 0.36, 1), opacity 480ms ease;
        }

        .auth-grid::after {
          content: "";
          position: absolute;
          inset: 0;
          background:
            linear-gradient(100deg, transparent 0%, rgba(34, 211, 238, calc(0.08 + var(--bg-energy) * 0.18)) 40%, transparent 80%),
            radial-gradient(circle at var(--mx) var(--my), rgba(34, 211, 238, calc(0.12 + var(--bg-energy) * 0.2)), transparent 32%),
            linear-gradient(-100deg, transparent 0%, rgba(45, 212, 191, calc(0.07 + var(--bg-energy) * 0.16)) 42%, transparent 84%);
          background-size: 28% 100%, 100% 100%, 28% 100%;
          background-repeat: no-repeat;
          background-position: -22% 0, 50% 0, 122% 0;
          animation: authHoverSweep 2.2s ease-in-out infinite alternate;
          opacity: calc(var(--bg-active-opacity) * (0.3 + var(--bg-energy) * 0.4));
          transition: opacity 460ms ease;
          mix-blend-mode: screen;
          pointer-events: none;
        }

        .auth-scanlines::before {
          content: "";
          position: absolute;
          left: 0;
          right: 0;
          height: 22%;
          background: linear-gradient(180deg, rgba(34, 211, 238, 0), rgba(34, 211, 238, 0.22), rgba(34, 211, 238, 0));
          animation: authScan 8.8s linear infinite;
        }

        .auth-scanlines {
          transition: transform 840ms cubic-bezier(0.22, 1, 0.36, 1);
        }

        .auth-blob {
          animation: authBlobFloat 14s ease-in-out infinite;
        }

        .auth-blob-delay {
          animation-delay: 1.2s;
        }

        .auth-float-icon {
          animation: authIconFloat 8s ease-in-out infinite;
        }

        .auth-float-icon-delay {
          animation-delay: 1s;
        }

        .auth-card-wrap {
          background: linear-gradient(120deg, rgba(34, 211, 238, 0.18), rgba(45, 212, 191, 0.2), rgba(34, 211, 238, 0.18));
          background-size: 180% 180%;
          animation: authCardEnter 0.65s ease-out both, authCardFloat 10s ease-in-out 0.7s infinite, authBorderSpin 9s linear infinite;
          box-shadow: 0 28px 90px rgba(0, 0, 0, 0.55);
        }

        .auth-card-noise {
          opacity: 0.08;
          background-image: radial-gradient(circle at 1px 1px, rgba(255, 255, 255, 0.5) 1px, transparent 0);
          background-size: 3px 3px;
        }

        .auth-card-shimmer::before {
          content: "";
          position: absolute;
          inset: 0;
          left: -20%;
          width: 60%;
          transform: translateX(-180%);
          opacity: 0;
          background: linear-gradient(120deg, transparent, rgba(255, 255, 255, 0.08), transparent);
          animation: authShimmer 7.8s ease-in-out infinite;
          will-change: transform, opacity;
        }

        .auth-scene:hover .auth-vignette {
          transform: translate3d(calc(var(--bg-shift-x) * 0.22), calc(var(--bg-shift-y) * 0.22 - 8px), 0) scale(1.02);
        }

        .auth-scene:hover .auth-grid {
          transform: translate3d(calc(var(--bg-shift-x) * 0.65), calc(var(--bg-shift-y) * 0.65 - 12px), 0) scale(1.03);
          opacity: 0.52;
        }

        .auth-scene:hover .auth-scanlines {
          transform: translate3d(calc(var(--bg-shift-x) * 0.4), calc(var(--bg-shift-y) * 0.4 - 6px), 0);
        }

        .auth-title-glow {
          animation: authTitleGlow 4.5s ease-in-out infinite;
        }

        .auth-submit-btn {
          box-shadow: 0 8px 24px rgba(0, 240, 255, 0.26);
          transition: transform 0.2s ease, box-shadow 0.2s ease;
        }

        .auth-submit-btn:hover {
          transform: translateY(-1px);
          box-shadow: 0 12px 28px rgba(0, 240, 255, 0.34);
        }

        @media (max-width: 640px) {
          .auth-float-icon {
            display: none;
          }

          .auth-card-wrap {
            animation: authCardEnter 0.65s ease-out both, authBorderSpin 8s linear infinite;
          }
        }
      `}</style>
    </div>
  );
};

export default AuthToggle;
