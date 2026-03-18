// frontend/src/pages/IDSAnalyzer.jsx

import React, { useState } from "react";
import { useDropzone } from "react-dropzone";
import { useNavigate } from "react-router-dom";
import api from "../api/config.js";
import { useScanState } from "../context/ScanStateContext.jsx";

import {
  ShieldAlert,
  UploadCloud,
  Sliders,
  HardDrive,
  Zap,
  History,
  ArrowRightCircle,
  Activity,
} from "lucide-react";

const IDSAnalyzer = () => {
  const navigate = useNavigate();
  const { idsState, startIdsScan, clearIdsState } = useScanState();
  const { isLoading, result, error } = idsState;

  // Local state: dropzone file, log type selector, and history panel
  const [file, setFile] = useState(null);
  const [logType, setLogType] = useState("Mixed");
  const [showHistory, setShowHistory] = useState(false);
  const [history, setHistory] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  const toggleHistory = async () => {
    const newState = !showHistory;
    setShowHistory(newState);

    if (newState) {
      try {
        setLoadingHistory(true);
        const res = await api.get("/ids/history");
        setHistory(res.data);
      } catch (err) {
        console.error("History error", err);
      } finally {
        setLoadingHistory(false);
      }
    }
  };

  const onDrop = (acceptedFiles) => {
    if (acceptedFiles.length > 0) {
      setFile(acceptedFiles[0]);
      setError("");
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    multiple: false,
    accept: { "text/csv": [".csv"] },
  });

  const runAnalysis = async (data) => {
    const formData = new FormData();
    if (data.file) {
      formData.append("file", data.file);
    } else {
      formData.append("log_type", data.log_type);
      formData.append("count", String(data.count));
    }
    startIdsScan(formData); // fires and forgets — result stored in context
  };

  return (
    <div className="space-y-6 sm:space-y-8 lg:space-y-10 
                    animate-fadeIn 
                    px-4 sm:px-6 lg:px-8 xl:px-0">

      {/* HEADER */}
      <div className="flex flex-col lg:flex-row 
                      lg:justify-between lg:items-center 
                      gap-4">

        <h1 className="text-2xl sm:text-3xl lg:text-4xl 
                       font-extrabold text-accent-cyber 
                       flex items-center gap-3">
          <ShieldAlert className="w-8 h-8 sm:w-10 sm:h-10 text-red-400 animate-pulse" />
          Intrusion Detection System (IDS) Analyzer
        </h1>

        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => navigate("/ids/live")}
            className="flex items-center gap-2 px-4 py-2 
                       bg-black border border-red-500 text-red-400 
                       rounded-lg hover:bg-red-900/30 transition 
                       shadow shadow-red-500/40"
          >
            <Activity className="w-5 h-5 animate-pulse" />
            Live IDS
          </button>

          <button
            onClick={toggleHistory}
            className="flex items-center gap-2 px-4 py-2 
                       bg-primary-dark border border-cyan-600 
                       text-cyan-300 rounded-lg hover:bg-primary-light 
                       transition shadow shadow-cyan-500/40"
          >
            <History className="w-5 h-5" />
            {showHistory ? "Hide History" : "History"}
          </button>
        </div>
      </div>

      {/* MAIN GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

        {/* AUTO GENERATION */}
        <div className="p-6 bg-secondary-dark border border-gray-700 
                        rounded-xl shadow-xl space-y-5">
          <h2 className="text-lg sm:text-xl font-bold 
                         text-cyan-300 flex items-center gap-2">
            <Sliders className="w-6 h-6 text-cyan-400" />
            Synthetic Traffic Generator
          </h2>

          <select
            className="w-full p-3 bg-primary-dark border 
                       border-gray-700 rounded-lg text-white"
            value={logType}
            onChange={(e) => setLogType(e.target.value)}
          >
            <option value="Mixed">Mixed (Normal + Attacks)</option>
            <option value="DoS">DoS High Traffic Attack</option>
            <option value="PortScan">Port Scan Reconnaissance</option>
            <option value="Normal">Normal Benign Traffic</option>
          </select>

          <button
            onClick={() => runAnalysis({ log_type: logType, count: 1000 })}
            className="w-full p-3 bg-cyan-500 text-black 
                       font-bold rounded-lg hover:bg-cyan-400 
                       shadow-lg flex items-center justify-center gap-2"
          >
            <HardDrive className="w-6 h-6" />
            Generate & Analyze
          </button>
        </div>

        {/* FILE UPLOAD */}
        <div className="p-6 bg-secondary-dark border border-gray-700 
                        rounded-xl shadow-xl space-y-5">
          <h2 className="text-lg sm:text-xl font-bold 
                         text-cyan-300 flex items-center gap-2">
            <UploadCloud className="w-6 h-6 text-cyan-400" />
            Upload Network Log (.csv)
          </h2>

          <div
            {...getRootProps()}
            className={`h-40 border-dashed border-2 rounded-lg 
                        flex items-center justify-center 
                        cursor-pointer transition ${
              isDragActive
                ? "border-cyan-400 bg-cyan-900/10"
                : "border-gray-600 bg-primary-dark"
            }`}
          >
            <input {...getInputProps()} />
            {file ? (
              <span className="text-cyan-300 font-semibold text-sm">
                {file.name}
              </span>
            ) : (
              <span className="text-gray-400 text-sm">
                Click or Drag CSV here
              </span>
            )}
          </div>

          <button
            onClick={() => file && runAnalysis({ file })}
            disabled={!file}
            className={`w-full p-3 font-bold rounded-lg 
                        flex items-center justify-center gap-2 ${
              file
                ? "bg-cyan-500 text-black hover:bg-cyan-400 shadow-lg"
                : "bg-gray-800 text-gray-500 cursor-not-allowed"
            }`}
          >
            <Zap className="w-6 h-6" />
            Analyze Uploaded File
          </button>
        </div>
      </div>

      {/* ERROR */}
      {error && !isLoading && (
        <div className="p-4 bg-red-900/30 border border-red-600 
                        text-red-300 rounded-lg flex justify-between items-center">
          <span>⚠ {error}</span>
          <button onClick={clearIdsState} className="text-xs text-red-400 hover:text-red-200 underline">Dismiss</button>
        </div>
      )}

      {/* RESULT */}
      {result && !isLoading && (
        <div className="p-6 bg-primary-dark border border-gray-700 
                        rounded-xl shadow-xl space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl text-cyan-300 font-bold">
              ✔ Scan Complete
            </h2>
            <button onClick={clearIdsState} className="text-xs text-gray-400 hover:text-cyan-300 underline">Clear result</button>
          </div>

          <p className="text-gray-300">
            Packets: <span className="text-white">{result.total_packets}</span>
          </p>

          <button
            onClick={() => navigate("/ids/details", { state: { data: result } })}
            className="w-full bg-cyan-500 hover:bg-cyan-400 
                       text-black font-bold p-3 rounded-lg 
                       flex items-center justify-center gap-2"
          >
            View Detailed Report
            <ArrowRightCircle className="w-5 h-5" />
          </button>
        </div>
      )}

      {/* HISTORY */}
      {showHistory && (
        <div className="p-6 bg-secondary-dark rounded-xl 
                        border border-gray-700 shadow-xl 
                        space-y-6 animate-fadeIn">

          <div className="flex flex-col sm:flex-row 
                          sm:justify-between sm:items-center gap-3">
            <h2 className="text-xl font-bold text-cyan-300 
                           flex items-center gap-2">
              <History className="w-6 h-6" />
              Recent IDS Scans
            </h2>

            {history.length > 0 && (
              <button
                onClick={async () => {
                  if (!confirm("Delete ALL scan history?")) return;
                  await api.delete("/ids/delete_all");
                  setHistory([]);
                }}
                className="px-4 py-2 text-sm bg-red-700/40 
                           border border-red-500 text-red-300 
                           rounded-lg hover:bg-red-700/60"
              >
                Clear All
              </button>
            )}
          </div>

          {loadingHistory ? (
            <p className="text-gray-400">Loading history...</p>
          ) : history.length === 0 ? (
            <p className="text-gray-500">No IDS history available.</p>
          ) : (
            <div className="space-y-3">
              {history.map((scan) => (
                <div
                  key={scan.id}
                  className="p-4 bg-primary-dark rounded-lg 
                             border border-gray-700 
                             hover:bg-primary-light transition 
                             flex flex-col sm:flex-row 
                             sm:justify-between sm:items-center gap-3"
                >
                  <div
                    className="cursor-pointer"
                    onClick={() =>
                      navigate("/ids/details", { state: { data: scan } })
                    }
                  >
                    <p className="text-white font-semibold">
                      {scan.file_name}
                    </p>
                    <p className="text-gray-400 text-xs">
                      {new Date(scan.scan_time).toLocaleString()}
                    </p>
                  </div>

                  <button
                    onClick={async () => {
                      if (!confirm("Delete this scan?")) return;
                      await api.delete(`/ids/delete/${scan.id}`);
                      setHistory(history.filter((h) => h.id !== scan.id));
                    }}
                    className="px-3 py-1 text-sm bg-red-600/30 
                               border border-red-500 rounded-lg 
                               text-red-300 hover:bg-red-600/40"
                  >
                    Delete
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

    </div>
  );
};

export default IDSAnalyzer;
