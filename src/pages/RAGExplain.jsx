import React, { useState } from "react";
import Loader from "../components/Loader.jsx";
import { useScanState } from "../context/ScanStateContext.jsx";
import {
  BookOpen,
  AlertTriangle,
  Cpu,
  Bot,
  Sparkles,
  ChevronDown,
} from "lucide-react";

const THREAT_TYPES = [
  "Malicious URL",
  "Suspicious URL",
  "Phishing URL",
  "Malware File",
  "Suspicious File",
  "IDS Alert",
  "Port Scan",
  "DDoS Attempt",
  "Network Traffic",
  "Email Threat",
  "Unknown Threat",
];

/* ================= NEW: HIGHLIGHT CONFIG ================= */

const MALICIOUS_KEYWORDS = [
  "malware",
  "phishing",
  "attack",
  "exploit",
  "payload",
  "breach",
  "unauthorized",
  "compromise",
  "backdoor",
  "botnet",
  "malicious",
];

const ATTACK_TYPES = [
  "sql injection",
  "xss",
  "cross-site scripting",
  "ddos",
  "dos",
  "port scan",
  "brute force",
  "phishing",
];

/* ================= NEW: FORMAT + HIGHLIGHT ================= */

const highlightAndFormatText = (text) => {
  if (!text) return "";

  let formatted = text;

  // Normalize bullet points → only "*"
  formatted = formatted.replace(/^[-•]\s+/gm, " ");
  formatted = formatted.replace(/^\d+\.\s+/gm, " ");

  // 🔴 Malicious keywords
  MALICIOUS_KEYWORDS.forEach((word) => {
    const regex = new RegExp(`(${word})`, "gi");
    formatted = formatted.replace(
      regex,
      `<span class="text-red-400 font-semibold">$1</span>`
    );
  });

  // 🟡 Attack types
  ATTACK_TYPES.forEach((word) => {
    const regex = new RegExp(`(${word})`, "gi");
    formatted = formatted.replace(
      regex,
      `<span class="text-yellow-400 font-semibold">$1</span>`
    );
  });

  return formatted;
};

/* ================= COMPONENT ================= */

const RAGExplain = () => {
  const { ragState, startRagExplain, clearRagState } = useScanState();
  const { isLoading, result, error } = ragState;

  // Local state: form inputs only
  const [threatType, setThreatType] = useState("Malicious URL");
  const [showDropdown, setShowDropdown] = useState(false);
  const [context, setContext] = useState("");

  const handleExplain = async (e) => {
    e.preventDefault();

    let contextData = { raw_input: context };

    try {
      if (
        context.trim().startsWith("{") ||
        context.trim().startsWith("[")
      ) {
        contextData = JSON.parse(context);
      }
    } catch {}

    startRagExplain(threatType, contextData); // fires and forgets — result stored in context
  };

  return (
    <div className="animate-fadeIn w-full h-[calc(100vh-72px)] overflow-hidden flex flex-col gap-4 px-4 sm:px-6">

      {/* ================= HEADER ================= */}
      <div className="shrink-0">
        <div className="flex items-center gap-3">
          <BookOpen className="w-7 h-7 xl:w-8 xl:h-8 text-cyan-400 animate-pulse" />
          <h1 className="text-2xl sm:text-3xl font-extrabold text-accent-cyber tracking-wide">
            RAG Threat Intelligence Console
          </h1>
        </div>
        <p className="text-gray-400 max-w-3xl text-sm mt-1">
          AI-driven threat analysis with MITRE ATT&CK mapping.
        </p>
      </div>

      {/* ================= MAIN GRID ================= */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 flex-1 min-h-0 overflow-hidden">

        {/* ================= LEFT PANEL ================= */}
        <div className="bg-secondary-dark border border-gray-700 p-4 rounded-xl shadow-xl space-y-4 h-[calc(100vh-190px)] overflow-y-auto">

          <h2 className="text-lg font-bold text-accent-cyber flex items-center gap-2">
            <Cpu className="w-5 h-5 text-cyan-400" />
            Input Threat Context
          </h2>

          <form onSubmit={handleExplain} className="space-y-5">

            {/* Threat Type */}
            <div className="relative">
              <label className="text-sm text-gray-300 mb-1 block">
                Threat Type
              </label>

              <div className="flex flex-col sm:flex-row gap-2">
                <div className="relative w-full sm:w-1/3">
                  <button
                    type="button"
                    className="w-full bg-primary-dark border border-gray-700 p-2.5 rounded-lg text-white flex justify-between items-center hover:border-cyan-500"
                    onClick={() => setShowDropdown(!showDropdown)}
                  >
                    <span className="truncate">{threatType}</span>
                    <ChevronDown className="w-4 h-4" />
                  </button>

                  {showDropdown && (
                    <div className="absolute z-20 w-full bg-primary-dark border border-gray-700 rounded-lg mt-1 max-h-44 overflow-y-auto shadow-xl">
                      {THREAT_TYPES.map((t, idx) => (
                        <div
                          key={idx}
                          onClick={() => {
                            setThreatType(t);
                            setShowDropdown(false);
                          }}
                          className="p-2 hover:bg-cyan-500 hover:text-black cursor-pointer text-sm"
                        >
                          {t}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <input
                  type="text"
                  value={threatType}
                  onChange={(e) => setThreatType(e.target.value)}
                  className="w-full sm:w-2/3 bg-primary-dark border border-gray-700 p-2.5 rounded-lg text-white outline-none focus:border-cyan-400"
                  placeholder="Custom threat type"
                />
              </div>
            </div>

            {/* Context */}
            <div>
              <label className="text-sm text-gray-300 mb-1 block">
                Threat Logs / Data
              </label>
              <textarea
                value={context}
                onChange={(e) => setContext(e.target.value)}
                className="w-full h-36 bg-primary-dark border border-gray-700 p-3 rounded-lg text-white text-sm outline-none focus:border-cyan-400"
                placeholder="Paste scan results, IDS logs, file data..."
                required
              />
            </div>

            {error && !isLoading && (
              <div className="text-red-400 text-sm bg-red-900/30 p-2 rounded flex justify-between items-center">
                <span>⚠ {error}</span>
                <button onClick={clearRagState} className="text-xs underline hover:text-red-200 ml-2">Dismiss</button>
              </div>
            )}

            <button
              type="submit"
              className="w-full bg-cyan-500 hover:bg-cyan-400 text-black font-bold p-3 rounded-lg shadow-cyan-500/40 shadow-lg flex items-center justify-center gap-2 transition"
              disabled={isLoading}
            >
              {isLoading ? (
                <Loader />
              ) : (
                <>
                  <Bot className="w-5 h-5" />
                  Generate Explanation
                </>
              )}
            </button>
          </form>
        </div>

        {/* ================= RIGHT PANEL ================= */}
        <div className="xl:col-span-2 bg-primary-dark border border-gray-700 p-6 rounded-xl shadow-xl h-[calc(100vh-190px)] overflow-y-auto">

          {!result && !isLoading && (
            <div className="text-center text-gray-500 py-20">
              <AlertTriangle className="w-12 h-12 mx-auto mb-4 text-yellow-500" />
              <p>Enter threat context and click “Generate AI Explanation”.</p>
            </div>
          )}

          {result && !isLoading && (
            <div className="space-y-5 animate-fadeIn">
              <div className="flex justify-end">
                <button onClick={clearRagState} className="text-xs text-gray-400 hover:text-cyan-300 underline">Clear result</button>
              </div>

              {/* Summary */}
              <div className="p-4 bg-secondary-dark border border-cyan-500/40 rounded-xl">
                <h3 className="text-accent-cyber text-xs font-semibold uppercase mb-1">
                  Summary
                </h3>
                <p
                  className="text-gray-200 text-base leading-relaxed whitespace-pre-wrap"
                  dangerouslySetInnerHTML={{
                    __html: highlightAndFormatText(result.summary),
                  }}
                />
              </div>

              {/* Explanation */}
              <div className="p-4 bg-secondary-dark border border-gray-700 rounded-xl">
                <h3 className="text-gray-300 text-xs font-semibold uppercase mb-2">
                  Detailed Explanation
                </h3>

                {result.full_explanation_html ? (
                  <div
                    className="text-gray-200 rag-html"
                    dangerouslySetInnerHTML={{
                      __html: result.full_explanation_html,
                    }}
                  />
                ) : (
                  <p
                    className="text-gray-200 whitespace-pre-wrap"
                    dangerouslySetInnerHTML={{
                      __html: highlightAndFormatText(result.full_explanation),
                    }}
                  />
                )}
              </div>

              {/* MITRE */}
              <div>
                <h3 className="text-gray-300 text-xs font-semibold uppercase mb-2">
                  MITRE ATT&CK Mapping
                </h3>

                <div className="flex flex-wrap gap-2">
                  {result.mitre_techniques?.map((tech, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-gray-700 text-xs text-cyan-300 rounded-full border border-cyan-500/40"
                    >
                      {tech.id}: {tech.name}
                    </span>
                  ))}
                </div>
              </div>

              {/* <div className="text-cyan-400 text-sm flex items-center gap-2 opacity-70">
                <Sparkles className="w-4 h-4" />
                AI Generated using Gemini + RAG Engine
              </div> */}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RAGExplain;
