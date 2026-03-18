// frontend/src/pages/FileScanner.jsx
import React, { useState, useEffect } from "react";
import { useDropzone } from "react-dropzone";
import Loader from "../components/Loader.jsx";
import { useNavigate } from "react-router-dom";
import { useScanState } from "../context/ScanStateContext.jsx";

import {
  FileText,
  UploadCloud,
  Hash,
  Activity,
  ArrowRightCircle,
  History,
  Trash2,
} from "lucide-react";

const FileScanner = () => {
  const navigate = useNavigate();
  const { fileState, startFileScan, clearFileState } = useScanState();
  const { isLoading, result, error } = fileState;

  // Local state: dropzone file selection and history list
  const [file, setFile] = useState(null);
  const [history, setHistory] = useState([]);
  const [showHistory, setShowHistory] = useState(false);

  /* -----------------------------------
      LOAD HISTORY ONCE
  ----------------------------------- */
  useEffect(() => {
    const saved = localStorage.getItem("file_scan_history");
    if (saved) setHistory(JSON.parse(saved));
  }, []);

  /* -----------------------------------
      PERSIST RESULT TO HISTORY
      Runs when a scan finishes — even if
      the user navigated away and came back.
  ----------------------------------- */
  useEffect(() => {
    if (result && !isLoading) {
      setHistory(prev => {
        const alreadyIn = prev.some(h => h.id === result.id);
        if (alreadyIn) return prev;
        const updated = [result, ...prev];
        localStorage.setItem("file_scan_history", JSON.stringify(updated));
        return updated;
      });
    }
  }, [result, isLoading]);

  /* -----------------------------------
      DELETE ONE ITEM
  ----------------------------------- */
  const deleteItem = (id) => {
    const updated = history.filter((item) => item.id !== id);
    setHistory(updated);
    localStorage.setItem("file_scan_history", JSON.stringify(updated));
  };

  /* -----------------------------------
      DELETE ALL HISTORY
  ----------------------------------- */
  const clearHistory = () => {
    setHistory([]);
    localStorage.removeItem("file_scan_history");
  };

  /* -----------------------------------
      SAVE HISTORY ITEM (legacy compat)
  ----------------------------------- */
  // (history persistence is handled by the useEffect above)

  /* -----------------------------------
      DROPZONE
  ----------------------------------- */
  const onDrop = (acceptedFiles) => {
    if (acceptedFiles.length) {
      setFile(acceptedFiles[0]);
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    maxFiles: 1,
  });

  /* -----------------------------------
      SCAN FILE
  ----------------------------------- */
  const handleScan = async () => {
    if (!file) return;
    const fileToScan = file;
    setFile(null); // clear selection immediately
    startFileScan(fileToScan); // fires and forgets — result stored in context
  };

  return (
    <div className="space-y-10 animate-fadeIn">

      <div className="flex justify-between items-center">
        <h1 className="text-4xl font-bold text-accent-cyber flex items-center gap-3">
          <FileText className="w-10 h-10 text-cyan-400" />
          Static File Malware Scanner
        </h1>

        {/* ⭐ SHOW HISTORY BUTTON ⭐ */}
        <button
          onClick={() => setShowHistory(!showHistory)}
          className="px-5 py-2 bg-primary-dark border border-gray-700 rounded-lg text-cyan-400 flex items-center gap-2 hover:bg-gray-800"
        >
          <History className="w-5 h-5" />
          {showHistory ? "Hide History" : "Show History"}
        </button>
      </div>


      {/* UPLOAD */}
      <div className="p-8 bg-secondary-dark border border-gray-700 rounded-xl shadow-xl space-y-6">
        <div
          {...getRootProps()}
          className={`p-10 rounded-xl border-2 border-dashed cursor-pointer transition ${
            isDragActive
              ? "border-cyan-400 bg-cyan-900/20 shadow-cyan-500/40"
              : "border-gray-600 hover:border-cyan-400 bg-primary-dark"
          }`}
        >
          <input {...getInputProps()} />
          <UploadCloud className="w-12 h-12 mx-auto text-gray-400 mb-4" />

          {file ? (
            <p className="text-lg text-cyan-300 font-semibold">
              {file.name} ({Math.round(file.size / 1024)} KB)
            </p>
          ) : (
            <p className="text-gray-400 text-lg">Drag & drop or click to upload</p>
          )}
        </div>

        <button
          onClick={handleScan}
          disabled={!file || isLoading}
          className={`w-full py-4 rounded-lg font-bold flex justify-center gap-3 ${
            isLoading || !file
              ? "bg-gray-800 text-gray-500 cursor-not-allowed"
              : "bg-cyan-500 text-black hover:bg-cyan-400"
          }`}
        >
          {isLoading ? <Loader /> : "Scan File (no redirect)"}
        </button>
      </div>

      {/* ERROR */}
      {error && !isLoading && (
        <div className="p-4 bg-red-900/40 border border-red-600 rounded text-red-300 flex justify-between items-center">
          <span>⚠ {error}</span>
          <button onClick={clearFileState} className="text-xs text-red-400 hover:text-red-200 underline">Dismiss</button>
        </div>
      )}

      {/* RESULT */}
      {result && !isLoading && (
        <>
          <div className="flex justify-end">
            <button onClick={clearFileState} className="text-xs text-gray-400 hover:text-cyan-300 underline">Clear result</button>
          </div>
          <FileScanResult result={result} />
        </>
      )}

      {/* HISTORY SECTION */}
      {showHistory && (
        <HistorySection
          history={history}
          navigate={navigate}
          deleteItem={deleteItem}
          clearHistory={clearHistory}
        />
      )}
    </div>
  );
};

export default FileScanner;

/* ===================================================
      RESULT CARD
=================================================== */
const FileScanResult = ({ result }) => {
  const verdict = result.analysis?.verdict;
  const isBad = verdict === "Malicious";
  const isSuspicious = verdict === "Suspicious";

  const cardClass = isBad
    ? "border-red-500/40 bg-red-900/10"
    : isSuspicious
    ? "border-orange-500/40 bg-orange-900/10"
    : "border-cyan-400/40 bg-green-900/10";

  const verdictColor = isBad
    ? "text-red-400"
    : isSuspicious
    ? "text-orange-400"
    : "text-green-400";

  return (
    <div className={`p-8 rounded-xl border shadow-xl ${cardClass} space-y-6`}>
      <h2 className="text-3xl font-bold">
        Verdict:{" "}
        <span className={verdictColor}>{verdict}</span>
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Stat label="File Name" value={result.filename} icon={FileText} />
        <Stat
          label="Detection"
          value={`${result.analysis.malicious_count}/${result.analysis.total_engines}`}
          icon={Activity}
        />
        <Stat label="SHA-256" value={result.hash} icon={Hash} color="text-cyan-300" />
      </div>

      <MalwareTypeBadges result={result} />

      <a
        href={`/file/${result.id}`}
        className="flex items-center gap-2 mt-4 text-accent-cyber hover:text-cyan-300"
      >
        View Full File Details <ArrowRightCircle className="w-5 h-5" />
      </a>
    </div>
  );
};

/* ===================================================
      MALWARE TYPE BADGES
=================================================== */
const BADGE_COLORS = {
  "Keylogger":        "bg-red-900/40 border-red-500/50 text-red-300",
  "Reverse Shell":    "bg-orange-900/40 border-orange-500/50 text-orange-300",
  "Bind Shell":       "bg-orange-900/40 border-orange-500/50 text-orange-300",
  "Process Injection":"bg-purple-900/40 border-purple-500/50 text-purple-300",
  "Shellcode":        "bg-yellow-900/40 border-yellow-500/50 text-yellow-300",
  "Network C2":       "bg-blue-900/40 border-blue-500/50 text-blue-300",
  "Automation/Macro": "bg-gray-700/40 border-gray-500/50 text-gray-300",
};

const MalwareTypeBadges = ({ result }) => {
  const local = result.analysis?.engine_results?.LocalStatic;
  const threatTypes = local?.details?.threat_types || [];
  const suspiciousStrings = local?.details?.suspicious_strings || [];

  if (threatTypes.length === 0 && suspiciousStrings.length === 0) return null;

  return (
    <div className="space-y-3">
      {threatTypes.length > 0 && (
        <div>
          <p className="text-xs text-gray-400 uppercase tracking-wider mb-2">Detected Threat Types</p>
          <div className="flex flex-wrap gap-2">
            {threatTypes.map((type) => (
              <span
                key={type}
                className={`px-3 py-1 rounded-full border text-xs font-bold ${
                  BADGE_COLORS[type] || "bg-gray-800 border-gray-600 text-gray-300"
                }`}
              >
                {type}
              </span>
            ))}
          </div>
        </div>
      )}

      {suspiciousStrings.length > 0 && (
        <div>
          <p className="text-xs text-gray-400 uppercase tracking-wider mb-2">Matched Signatures</p>
          <div className="flex flex-wrap gap-2">
            {suspiciousStrings.map((s) => (
              <code
                key={s}
                className="px-2 py-0.5 rounded bg-gray-800 border border-gray-700 text-xs text-cyan-200"
              >
                {s}
              </code>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

/* ===================================================
      HISTORY SECTION WITH DELETE
=================================================== */
const HistorySection = ({ history, navigate, deleteItem, clearHistory }) => (
  <div className="p-6 bg-secondary-dark border border-gray-700 rounded-xl shadow-xl">

    <div className="flex justify-between items-center mb-4">
      <h2 className="text-xl font-bold text-accent-cyber">Recent File Scans</h2>

      {history.length > 0 && (
        <button
          onClick={clearHistory}
          className="px-3 py-1 bg-red-700/40 border border-red-600 text-red-300 text-xs rounded hover:bg-red-700/60"
        >
          Clear All
        </button>
      )}
    </div>

    {history.length === 0 ? (
      <p className="text-gray-500">No scans yet.</p>
    ) : (
      <div className="space-y-3">
        {history.map((item) => (
          <div
            key={item.id}
            className="p-4 rounded-lg bg-primary-dark border border-gray-700 flex justify-between items-center"
          >
            <div
              onClick={() => navigate(`/file/${item.id}`)}
              className="cursor-pointer"
            >
              <p className="text-white font-semibold">{item.filename}</p>
              <p className="text-gray-400 text-sm break-all">{item.hash}</p>
            </div>

            {/* Delete button */}
            <button
              onClick={() => deleteItem(item.id)}
              className="text-red-400 hover:text-red-300"
            >
              <Trash2 className="w-5 h-5" />
            </button>
          </div>
        ))}
      </div>
    )}
  </div>
);

/* ===================================================
      Stat Component
=================================================== */
const Stat = ({ label, value, icon: Icon, color = "text-gray-300" }) => (
  <div className="bg-primary-dark border border-gray-800 p-4 rounded-lg">
    <div className="flex items-center gap-2 text-xs text-gray-400 uppercase">
      <Icon className="w-4 h-4" /> {label}
    </div>
    <p className={`mt-1 text-white font-semibold break-all ${color}`}>{value}</p>
  </div>
);
