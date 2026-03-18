import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import MatrixRain from "../components/MatrixRain";
import {
  BrainCircuit,
  CircleCheckBig,
  FileSearch,
  Github,
  Link2,
  Linkedin,
  Radar,
} from "lucide-react";

const GRID_STYLE = {
  backgroundImage:
    "linear-gradient(to right, rgba(0, 242, 255, 0.03) 1px, transparent 1px), linear-gradient(to bottom, rgba(0, 242, 255, 0.03) 1px, transparent 1px)",
  backgroundSize: "52px 52px",
};

const modules = [
  {
    title: "URL Detection",
    text: "Real-time scanning of malicious links and phishing patterns.",
    icon: Link2,
  },
  {
    title: "File Scanner",
    text: "Deep static and behavioral analysis for suspicious files.",
    icon: FileSearch,
  },
  {
    title: "IDS Core",
    text: "Detects network anomalies, brute force, and lateral movement.",
    icon: Radar,
  },
  {
    title: "Threat Intel",
    text: "AI-assisted threat context and mitigation recommendations.",
    icon: BrainCircuit,
  },
];

const DECRYPT_CHARS = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789#@!$%";

function useDecryptText(target, delay = 0) {
  const [value, setValue] = useState("");

  useEffect(() => {
    let frame = 0;
    let intervalId;
    let timeoutId;

    const run = () => {
      intervalId = setInterval(() => {
        frame += 1;
        const revealed = frame / 1.6;

        const next = target
          .split("")
          .map((char, index) => {
            if (char === " ") return " ";
            if (index < revealed) return target[index];
            return DECRYPT_CHARS[Math.floor(Math.random() * DECRYPT_CHARS.length)];
          })
          .join("");

        setValue(next);

        if (revealed >= target.length) {
          clearInterval(intervalId);
          setValue(target);
        }
      }, 32);
    };

    timeoutId = setTimeout(run, delay);

    return () => {
      clearInterval(intervalId);
      clearTimeout(timeoutId);
    };
  }, [target, delay]);

  return value || target;
}

function Home() {
  const decryptLine1 = useDecryptText("AI-Powered", 110);
  const decryptLine2 = useDecryptText("Cybersecurity Threat", 400);
  const decryptLine3 = useDecryptText("Detection", 700);

  return (
    <div className="relative isolate min-h-screen overflow-x-hidden bg-[#020202] text-white selection:bg-cyan-300 selection:text-black">
      {/* Cyber background for top area */}
      <div className="pointer-events-none fixed inset-0 z-0 bg-base" />
      <div className="pointer-events-none fixed inset-0 z-0 bg-secondary" />
      <div className="pointer-events-none fixed inset-0 z-0 bg-left-glow" />
      <div className="pointer-events-none fixed inset-0 z-0 bg-right-glow" />
      <div className="pointer-events-none fixed inset-0 z-0 bg-grid opacity-100" style={GRID_STYLE} />

      <div className="relative z-10">
        {/* NAVBAR */}
        <nav className="fixed top-0 z-50 w-full border-b border-cyan-400/20 bg-white/[0.04] backdrop-blur-2xl shadow-[0_4px_32px_rgba(0,242,255,0.07)] navbar-glass">
          <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-6 py-2">
            <Link to="/" className="flex items-center gap-2">
              <img src="/logo.png" alt="SentinelAI Logo" className="h-10 w-10" />
              <span className="text-lg font-extrabold tracking-wide leading-none text-cyan-400">SentinelAI</span>
            </Link>

            <div className="hidden items-center gap-7 text-sm text-gray-300 md:flex">
              <Link to="/scanner" className="transition-colors hover:text-cyan-300">URL Scanner</Link>
              <Link to="/filescan" className="transition-colors hover:text-cyan-300">File Scanner</Link>
              <Link to="/ids" className="transition-colors hover:text-cyan-300">IDS Analyzer</Link>
              <Link to="/rag" className="transition-colors hover:text-cyan-300">Threat RAG</Link>
            </div>

            <div className="flex items-center gap-3">
              <Link to="/login" className="text-sm font-semibold text-white hover:text-cyan-300">
                Sign In
              </Link>
            </div>
          </div>
        </nav>

        {/* HERO */}
        <header className="mx-auto max-w-7xl px-6 pb-14 pt-40 md:pt-36">
          <div className="mb-6 inline-flex items-center rounded-full border border-cyan-400/40 bg-cyan-500/10 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.16em] text-cyan-300">
            Next-Gen Neural Defense Active
          </div>

          <h1 className="hero-title max-w-7xl text-4xl font-black leading-[0.95] sm:text-5xl md:text-7xl">
            <span className="hero-decrypt-line md:whitespace-nowrap">{decryptLine1}</span>
            <br />
            <span className="hero-decrypt-line text-cyan-300 md:whitespace-nowrap">{decryptLine2}</span>
            <br />
            <span className="hero-decrypt-line hero-decrypt-final md:whitespace-nowrap">{decryptLine3}</span>
          </h1>

          <p className="mt-5 max-w-2xl text-sm text-gray-300 md:text-base">
            Detect malicious URLs, analyze suspicious files, and identify network intrusions in milliseconds using our
            proprietary deep-learning security engine.
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Link
              to="/register"
              className="rounded-md bg-cyan-400 px-4 py-2 text-sm font-bold text-black shadow-[0_0_24px_rgba(0,255,255,0.35)] transition hover:brightness-110"
            >
              Get Started
            </Link>
            <Link
              to="/login"
              className="rounded-md border border-white/20 bg-white/5 px-5 py-3 text-sm font-bold text-white transition hover:border-cyan-300/60 hover:bg-cyan-500/10"
            >
              View Live Dashboard
            </Link>
          </div>

          <div className="mt-10 rounded-2xl border border-cyan-500/20 bg-[#061018]/75 p-3 shadow-[0_25px_100px_rgba(0,0,0,0.55)]">
            <div className="relative h-[230px] w-full overflow-hidden rounded-xl md:h-[330px]">
              <MatrixRain />
              <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_35%,rgba(0,0,0,0.6)_100%)]" />
              <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_bottom,rgba(0,0,0,0.45)_0%,transparent_35%,rgba(0,0,0,0.35)_100%)]" />
            </div>
            <div className="mt-3 flex flex-wrap items-center justify-between gap-2 px-2 text-xs text-cyan-200/80">
              <span className="max-w-[70%] sm:max-w-none">Encrypted network telemetry stream</span>
              <span className="text-2xl font-black text-white">99.9%</span>
            </div>
          </div>
        </header>

        {/* MODULES - still top cyber background */}
        <section className="mx-auto max-w-7xl px-6 py-20">
          <div className="text-center">
            <h2 className="text-4xl font-black md:text-5xl">Advanced Defense Modules</h2>
            <p className="mx-auto mt-3 max-w-2xl text-sm text-gray-400">
              Our unified platform combines multiple layers of artificial intelligence to secure every vector of your digital infrastructure.
            </p>
          </div>

          <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {modules.map((item, index) => {
              const Icon = item.icon;
              return (
                <article
                  key={item.title}
                  className="module-card rounded-xl border border-cyan-500/15 bg-[#071018]/80 p-5 transition hover:-translate-y-0.5 hover:border-cyan-300/50"
                  style={{ animationDelay: `${0.05 + index * 0.1}s` }}
                >
                  <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-lg bg-cyan-500/15 text-cyan-300">
                    <Icon className="h-5 w-5" />
                  </div>
                  <h3 className="text-lg font-extrabold">{item.title}</h3>
                  <p className="mt-2 text-sm text-gray-400">{item.text}</p>
                </article>
              );
            })}
          </div>
        </section>

        {/* Dark gray area starts after modules */}
        <div className="post-modules-zone">
          <section className="mx-auto max-w-7xl px-6 py-14">
            <h2 className="text-center text-4xl font-black md:text-5xl">How It Works</h2>
            <div className="mt-12 grid gap-10 md:grid-cols-3">
              <div className="text-center">
                <span className="mx-auto flex h-10 w-10 items-center justify-center rounded-full border-2 border-cyan-300 text-sm font-black text-cyan-300">01</span>
                <h3 className="mt-4 text-lg font-extrabold">Submit Data</h3>
                <p className="mt-2 text-sm text-gray-400">Ingest telemetry from logs, files, and API endpoints.</p>
              </div>
              <div className="text-center">
                <span className="mx-auto flex h-10 w-10 items-center justify-center rounded-full border-2 border-cyan-300 text-sm font-black text-cyan-300">02</span>
                <h3 className="mt-4 text-lg font-extrabold">AI Analysis</h3>
                <p className="mt-2 text-sm text-gray-400">Deep inspection and behavioral analytics in real-time.</p>
              </div>
              <div className="text-center">
                <span className="mx-auto flex h-10 w-10 items-center justify-center rounded-full border-2 border-cyan-300 text-sm font-black text-cyan-300">03</span>
                <h3 className="mt-4 text-lg font-extrabold">Security Report</h3>
                <p className="mt-2 text-sm text-gray-400">Clear findings with risk score and mitigation actions.</p>
              </div>
            </div>
          </section>

          <section className="mx-auto grid max-w-7xl items-center gap-10 px-6 py-16 lg:grid-cols-2">
            <div>
              <h2 className="text-4xl font-black leading-tight md:text-5xl">
                The Future of
                <span className="block text-cyan-300">Autonomous Cyber Defense</span>
              </h2>
              <p className="mt-5 max-w-xl text-sm text-gray-400">
                SentinelAI reduces the latency between detection and response with integrated AI-driven security operations.
              </p>
              <p className="mt-3 max-w-xl text-sm text-gray-400">
                Models are trained on modern threat intelligence and anomaly patterns.
              </p>
              <div className="mt-6 flex flex-wrap gap-3 text-xs font-semibold">
                <span className="rounded-md border border-cyan-400/30 bg-cyan-500/10 px-3 py-2 text-cyan-200">Adaptive Learning</span>
                <span className="rounded-md border border-cyan-400/30 bg-cyan-500/10 px-3 py-2 text-cyan-200">Global Mesh</span>
              </div>
            </div>

            <div className="rounded-2xl border border-cyan-500/20 bg-[#071018]/70 p-4">
              <a
                href="https://shivukumar.vercel.app/"
                target="_blank"
                rel="noreferrer"
                className="profile-image-link group relative block rounded-xl focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300/80"
                aria-label="Visit developer profile"
                title="Tap to visit developer profile"
              >
                <img
                  src="./landing.png?auto=format&fit=crop&w=1200&q=80"
                  className="feature-image h-[360px] w-full rounded-xl object-cover opacity-85"
                  alt="Malware detection and cybersecurity analysis"
                />
                <span className="pointer-events-none absolute left-3 top-3 rounded-full border border-cyan-300/40 bg-black/55 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.12em] text-cyan-200/95 shadow-[0_0_18px_rgba(34,211,238,0.25)]">
                  Tap image to view profile
                </span>
              </a>
              <div className="mt-4 flex items-start gap-3 rounded-lg border border-cyan-400/20 bg-black/35 p-3 text-xs text-gray-300">
                <CircleCheckBig className="mt-0.5 h-4 w-4 text-cyan-300" />
                <p>Encrypted and secure. AI models run in controlled, compliance-ready environments.</p>
              </div>
            </div>
          </section>

          <section className="mx-auto max-w-4xl px-6 py-16 text-center">
            <p className="text-3xl text-cyan-300">,,</p>
            <p className="mt-2 text-2xl italic leading-relaxed text-white/95">
              In the digital age, cybersecurity is not just a feature, it is a fundamental human right.
              SentinelAI is the guardian we have been waiting for.
            </p>
            <div className="mx-auto mt-7 h-5 w-5 rounded-full border border-cyan-400/60 bg-cyan-500/20" />
            <p className="mt-4 text-xs font-bold tracking-[0.14em] text-gray-400">LEAD ARCHITECT, GLOBAL DEFENSE CORP</p>
          </section>

          <section className="mx-auto max-w-7xl px-6 py-16">
            <div className="rounded-3xl bg-[linear-gradient(105deg,#22d3ee,#2dd4bf,#22d3ee)] p-[1px]">
              <div className="flex flex-col items-start justify-between gap-8 rounded-3xl bg-[#0b1117] p-8 md:flex-row md:items-center md:p-12">
                <div>
                  <h2 className="text-4xl font-black leading-tight text-white">
                    Ready to Secure
                    <br />
                    Your Infrastructure?
                  </h2>
                  <p className="mt-4 text-sm text-cyan-100/80">Join 500+ enterprise teams using SentinelAI today.</p>
                </div>
                <Link
                  to="/register"
                  className="rounded-md bg-cyan-400 px-6 py-3 text-sm font-extrabold text-black transition hover:brightness-110"
                >
                  GET STARTED NOW
                </Link>
              </div>
            </div>
          </section>

          <footer className="border-t border-cyan-500/20 bg-black/95 py-10 backdrop-blur-lg">
            <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-5 px-6 md:flex-row">
              <div className="flex flex-col items-center md:items-start">
                <Link to="/" className="mb-1 flex items-center gap-2">
                  <img src="/logo.png" alt="SentinelAI Logo" className="h-12 w-12" />
                  <span className="text-lg font-extrabold tracking-wide leading-none text-cyan-400">SentinelAI</span>
                </Link>
                <p className="max-w-md text-sm text-gray-300">AI-powered, real-time cyber defense for URLs, files, and network activity.</p>
                <div className="mt-1 flex items-center gap-4 mt-5">
                  <a href="https://github.com/Shivukumar-M" target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 hover:text-cyan-300">
                    <Github className="h-4 w-4" />
                    <span>GitHub</span>
                  </a>
                  <a href="https://www.linkedin.com/in/shivu-kumar-a-m/" target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 hover:text-cyan-300">
                    <Linkedin className="h-4 w-4" />
                    <span>LinkedIn</span>
                  </a>
                </div>
              </div>

              <div className="flex flex-col items-start gap-2 text-sm text-gray-300">
                <p className="text-xs font-bold uppercase tracking-[0.14em] text-cyan-300">Developer</p>
                <p className="font-semibold text-white">Shivu Kumar A M</p>
                <p className="text-sm text-gray-300">MCA Final Year</p>
                <p className="text-sm text-gray-400">AI and Cybersecurity</p>

                
              </div>
            </div>

            <div className="mx-auto mt-8 flex max-w-7xl items-center justify-between px-6 text-[10px] text-gray-500">
              <p>© 2026 SentinelAI Platform. All rights reserved.</p>
              <div className="flex items-center gap-4">
                <a href="#" className="hover:text-cyan-300">Privacy Policy</a>
                <a href="#" className="hover:text-cyan-300">Terms of Service</a>
              </div>
            </div>
          </footer>
        </div>
      </div>

      <style>{`
        @keyframes heroFloat {
          0% { transform: translateY(0px) scale(1); }
          50% { transform: translateY(-8px) scale(1.01); }
          100% { transform: translateY(0px) scale(1); }
        }

        @keyframes gridDrift {
          0% { transform: translate3d(0, 0, 0); }
          100% { transform: translate3d(-22px, -22px, 0); }
        }

        @keyframes glowPulse {
          0% { opacity: 0.72; filter: blur(0px); }
          50% { opacity: 1; filter: blur(2px); }
          100% { opacity: 0.72; filter: blur(0px); }
        }

        @keyframes scanMove {
          0% { background-position-y: 0; }
          100% { background-position-y: 160px; }
        }

        @keyframes titlePulse {
          0% { text-shadow: 0 0 0 rgba(34, 211, 238, 0.0); }
          50% { text-shadow: 0 0 18px rgba(34, 211, 238, 0.35); }
          100% { text-shadow: 0 0 0 rgba(34, 211, 238, 0.0); }
        }

        @keyframes cardReveal {
          from { opacity: 0; transform: translateY(16px); }
          to { opacity: 1; transform: translateY(0); }
        }

        @keyframes decryptCursor {
          0%, 45% { opacity: 1; }
          46%, 100% { opacity: 0; }
        }

        .bg-base {
          background: linear-gradient(180deg, #020202 0%, #050505 100%);
        }

        .bg-secondary {
          background: radial-gradient(circle at 50% 35%, rgba(0, 0, 0, 0.15), rgba(0, 0, 0, 0.45) 70%, rgba(0, 0, 0, 0.6));
        }

        .bg-left-glow {
          background: radial-gradient(40% 45% at 8% 16%, rgba(0, 242, 255, 0.16), transparent 70%);
          filter: blur(8px);
          animation: glowPulse 10s ease-in-out infinite;
        }

        .bg-right-glow {
          background: radial-gradient(36% 40% at 92% 84%, rgba(0, 242, 255, 0.12), transparent 72%);
          filter: blur(10px);
          animation: glowPulse 12s ease-in-out infinite;
        }

        .bg-grid {
          animation: gridDrift 28s linear infinite;
        }

        .hero-title {
          animation: titlePulse 6s ease-in-out infinite;
        }

        .hero-decrypt-line {
          position: relative;
          display: inline-block;
          letter-spacing: 0.01em;
        }

        .hero-decrypt-line::after {
          content: "_";
          margin-left: 0.16em;
          color: rgba(34, 211, 238, 0.85);
          animation: decryptCursor 0.9s steps(1, end) infinite;
        }

        .hero-decrypt-final::after {
          content: "";
          margin-left: 0;
          animation: none;
        }

        .hero-image {
          animation: heroFloat 7s ease-in-out infinite;
        }

        .feature-image {
          animation: heroFloat 9s ease-in-out infinite;
        }

        .profile-image-link {
          border: 1px solid rgba(34, 211, 238, 0.2);
          box-shadow: 0 0 0 rgba(34, 211, 238, 0);
          transition: transform 180ms ease, border-color 180ms ease, box-shadow 220ms ease;
        }

        .profile-image-link:hover,
        .profile-image-link:focus-visible {
          transform: translateY(-2px);
          border-color: rgba(103, 232, 249, 0.65);
          box-shadow: 0 0 0 1px rgba(103, 232, 249, 0.2), 0 0 22px rgba(34, 211, 238, 0.35);
        }

        .profile-image-link::after {
          content: "";
          position: absolute;
          inset: -2px;
          border-radius: 0.9rem;
          border: 1px solid rgba(34, 211, 238, 0.35);
          opacity: 0;
          transition: opacity 220ms ease;
          pointer-events: none;
        }

        .profile-image-link:hover::after,
        .profile-image-link:focus-visible::after {
          opacity: 1;
        }

        .module-card {
          opacity: 0;
          animation: cardReveal 0.7s ease-out forwards;
        }

        .post-modules-zone {
          background: transparent;
        }

        .navbar-glass {
          background: linear-gradient(
            135deg,
            rgba(255, 255, 255, 0.05) 0%,
            rgba(0, 242, 255, 0.04) 50%,
            rgba(255, 255, 255, 0.03) 100%
          );
          backdrop-filter: blur(24px) saturate(180%);
          -webkit-backdrop-filter: blur(24px) saturate(180%);
          box-shadow:
            0 4px 32px rgba(0, 242, 255, 0.07),
            inset 0 1px 0 rgba(255, 255, 255, 0.07),
            inset 0 -1px 0 rgba(0, 242, 255, 0.06);
        }
      `}</style>
    </div>
  );
}

export default Home;
