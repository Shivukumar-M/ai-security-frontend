// frontend/src/pages/URLScanner.jsx
import React, { useState, useEffect } from "react";
import { scanUrl, getUrlScanHistory } from "../api/urlscan.js";
import apiClient from "../api/config.js";     // ⭐ REQUIRED for delete
import Loader from "../components/Loader.jsx";
import { useNavigate } from "react-router-dom";

import {
  Zap,
  CheckCircle,
  ShieldOff,
  Clock,
  Activity,
  AlertTriangle,
  Globe,
  ChevronRight,
  Trash2,
  XCircle,
} from "lucide-react";

const URLScanner = () => {
  const navigate = useNavigate();

  const [url, setUrl] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [history, setHistory] = useState([]);

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    try {
      const data = await getUrlScanHistory();
      setHistory(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("History load failed:", error);
      setHistory([]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!url.trim()) return;

    setIsLoading(true);
    setResult(null);

    try {
      const data = await scanUrl(url);
      setResult(data);
      setHistory((prev) => [data, ...(Array.isArray(prev) ? prev : [])]);
      setUrl("");
    } catch (err) {
      console.error(err);

      if (err.response?.status === 422) {
        const detail = err.response?.data?.detail;
        const backendMessage = Array.isArray(detail)
          ? detail.map((item) => item?.msg).filter(Boolean).join("\n")
          : detail;

        alert(backendMessage || "Invalid URL format. Try https://example.com");
      } else {
        alert(err.message || err.response?.data?.detail || "Scanning failed.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-10 animate-fadeIn">
      {/* HEADER */}
      <h1 className="text-4xl font-extrabold text-accent-cyber flex items-center gap-3">
        <Zap className="w-10 h-10 text-cyan-400 animate-pulse" />
        URL Malware Scanner
      </h1>

      {/* FORM */}
      <form
        onSubmit={handleSubmit}
        className="flex gap-4 p-5 bg-secondary-dark border border-gray-700 rounded-xl shadow-xl"
      >
        <input
          type="text"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="Enter URL (example: http://malicious-test.com)"
          className="w-full bg-primary-dark border border-gray-700 text-white p-3 rounded-lg focus:border-cyan-400 outline-none"
        />

        <button
          disabled={isLoading}
          className="px-6 py-3 bg-cyan-500 text-black font-bold hover:bg-cyan-400 rounded-lg flex items-center"
        >
          {isLoading ? <Loader /> : "Scan"}
        </button>
      </form>

      {/* SCAN RESULT */}
      {result && <ScanResult result={result} />}

      {/* HISTORY */}
      <HistorySection history={history} setHistory={setHistory} />
    </div>
  );
};

export default URLScanner;

/* ===============================================================
   RESULT CARD (UPDATED WITH RESPONSIVE URL WRAPPING)
=============================================================== */
const ScanResult = ({ result }) => {
  const isBad = result.final_verdict === "Threat Detected";
  const verdictColor = isBad ? "text-red-400" : "text-green-400";

  return (
    <div
      className={`p-8 rounded-xl border shadow-xl ${
        isBad
          ? "border-red-500/40 bg-red-900/10 shadow-red-500/30"
          : "border-cyan-400/40 bg-green-900/10 shadow-cyan-500/30"
      } space-y-8`}
    >
      {/* HEADER */}
      <div className="flex justify-between items-center border-b border-gray-700 pb-4">
        <h2 className="text-3xl font-bold">
          Verdict: <span className={verdictColor}>{result.final_verdict}</span>
        </h2>

        {isBad ? (
          <ShieldOff className="w-10 h-10 text-red-400 animate-pulse" />
        ) : (
          <CheckCircle className="w-10 h-10 text-green-400" />
        )}
      </div>

      {/* GRID */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Stat label="Target URL" value={result.target_url} icon={Globe} wrap />
        <Stat
          label="ML Score"
          value={(result.ml_score * 100).toFixed(1) + "%"}
          icon={Activity}
          color={verdictColor}
        />
        <Stat
          label="VirusTotal Engines"
          value={`${result.vt_malicious || 0}/${result.vt_total || 0}`}
          icon={AlertTriangle}
        />
        <Stat
          label="Scan Time"
          value={new Date(result.scan_time).toLocaleTimeString()}
          icon={Clock}
        />
      </div>

      {Array.isArray(result.mitre_techniques) &&
 result.mitre_techniques.length > 0 && (
  <div className="mt-4 bg-primary-dark border border-gray-700 p-4 rounded-xl">
    <p className="text-sm text-gray-400 uppercase mb-2">
      MITRE Techniques
    </p>

    <div className="flex flex-wrap gap-2">
      {result.mitre_techniques.map((t, i) => (
        <span
          key={i}
          className="px-3 py-1 bg-gray-800 text-cyan-300 text-xs rounded-full border border-cyan-500/40"
        >
          {t.id}: {t.name}
        </span>
      ))}
    </div>
  </div>
)}

    </div>
  );
};

/* ===============================================================
   STAT COMPONENT (⭐ UPDATED FOR WRAPPING)
=============================================================== */
const Stat = ({ label, value, color = "text-gray-300", icon: Icon, wrap = false }) => (
  <div className="bg-primary-dark border border-gray-800 p-4 rounded-xl shadow-lg">
    <div className="flex items-center gap-2 text-xs uppercase text-gray-400">
      <Icon className="w-4 h-4" />
      {label}
    </div>

    <div
      className={`mt-1 font-semibold text-white ${color} ${
        wrap ? "break-words whitespace-normal max-w-full" : ""
      }`}
    >
      {value}
    </div>
  </div>
);

/* ===============================================================
   HISTORY SECTION — DELETE FIXED
=============================================================== */
const HistorySection = ({ history, setHistory }) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  // DELETE ONE SCAN ✔
  const deleteScan = async (id) => {
    if (!window.confirm("Delete this URL scan?")) return;

    try {
      setLoading(true);
      await apiClient.delete(`/urlscan/delete/${id}`);
      setHistory((prev) => prev.filter((s) => s.id !== id)); // update UI
    } catch (err) {
      console.error(err);
      alert("Failed to delete scan.");
    } finally {
      setLoading(false);
    }
  };

  // DELETE ALL SCANS ✔
  const deleteAllScans = async () => {
    if (!window.confirm("Delete ALL scans?")) return;

    try {
      setLoading(true);
      await apiClient.delete("/urlscan/delete_all");
      setHistory([]); // wipe UI
    } catch (err) {
      console.error(err);
      alert("Failed to clear history.");
    } finally {
      setLoading(false);
    }
  };

  if (!Array.isArray(history)) {
    return (
      <div className="bg-secondary-dark border border-gray-700 p-6 rounded-xl">
        <h2 className="text-red-400 text-xl font-bold mb-4">History Error</h2>
        <p className="text-gray-400">Backend returned invalid data.</p>
      </div>
    );
  }

  return (
    <div className="bg-secondary-dark border border-gray-700 p-6 rounded-xl shadow-xl">
      {/* HEADER + CLEAR ALL */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-accent-cyber">Recent URL Scans</h2>

        {history.length > 0 && (
          <button
            onClick={deleteAllScans}
            disabled={loading}
            className="flex items-center gap-2 px-3 py-2 text-red-400 border border-red-600/40 rounded-lg hover:bg-red-600/10 transition"
          >
            <XCircle className="w-4 h-4" />
            Clear All
          </button>
        )}
      </div>

      {history.length === 0 ? (
        <p className="text-gray-500">No scan history available.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="border-b border-gray-700 text-gray-400 uppercase">
                <th className="p-3 text-left">Date</th>
                <th className="p-3 text-left">URL</th>
                <th className="p-3 text-center">Verdict</th>
                <th className="p-3 text-center">View</th>
                <th className="p-3 text-center">Delete</th>
              </tr>
            </thead>

            <tbody>
              {history.map((item) => (
                <tr key={item.id} className="border-b border-gray-800 hover:bg-gray-900/50 transition">
                  <td
                    className="p-3 cursor-pointer"
                    onClick={() => navigate(`/scan/${item.id}`)}
                  >
                    {new Date(item.scan_time).toLocaleDateString()}
                  </td>

                  <td
                    className="p-3 max-w-xs break-words whitespace-normal cursor-pointer"
                    onClick={() => navigate(`/scan/${item.id}`)}
                  >
                    {item.target_url}
                  </td>

                  <td
                    className={`p-3 text-center font-semibold ${
                      item.final_verdict === "Threat Detected"
                        ? "text-red-400"
                        : "text-green-400"
                    } cursor-pointer`}
                    onClick={() => navigate(`/scan/${item.id}`)}
                  >
                    {item.final_verdict}
                  </td>

                  <td
                    className="p-3 text-center cursor-pointer"
                    onClick={() => navigate(`/scan/${item.id}`)}
                  >
                    <ChevronRight className="w-5 h-5 text-cyan-400" />
                  </td>

                  {/* DELETE BUTTON */}
                  <td className="p-3 text-center">
                    <button
                      onClick={() => deleteScan(item.id)}
                      disabled={loading}
                      className="text-red-400 hover:text-red-300 hover:bg-red-600/10 p-2 rounded transition"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>

          </table>
        </div>
      )}
    </div>
  );
};
