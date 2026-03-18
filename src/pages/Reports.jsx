// frontend/src/pages/Reports.jsx
import React, { useState, useEffect } from "react";
import { downloadPDFReport, downloadScanPDF, lookupScans } from "../api/reports.js";
import Loader from "../components/Loader.jsx";

import {
  ClipboardList,
  FileDown,
  FileText,
  Database,
  Search as SearchIcon,
  FileText as ExecIcon,
  Sparkles,
} from "lucide-react";

const KIND_OPTIONS = [
  { key: "url", label: "URL" },
  { key: "file", label: "File" },
  { key: "ids", label: "IDS Event" },
];

const Reports = () => {
  const [loadingType, setLoadingType] = useState(null);

  // search state
  const [kind, setKind] = useState("url");
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [selected, setSelected] = useState(null);
  const [searching, setSearching] = useState(false);
  const [error, setError] = useState(null);

  // handle executive pdf generation
  const handleExecutive = async () => {
    setLoadingType("executive");
    try {
      await downloadPDFReport();
    } catch (err) {
      alert("Executive PDF download failed.");
      console.error(err);
    } finally {
      setLoadingType(null);
    }
  };

  // lookup suggestions
  useEffect(() => {
    const delay = setTimeout(async () => {
      if (!query || query.length < 2) {
        setSuggestions([]);
        return;
      }
      setSearching(true);
      try {
        const res = await lookupScans(query, kind);
        setSuggestions(res.results || []);
        setError(null);
      } catch (err) {
        setError("Lookup failed.");
        setSuggestions([]);
      }
      setSearching(false);
    }, 300);

    return () => clearTimeout(delay);
  }, [query, kind]);

  const handleGenerateSelected = async () => {
    if (!selected) return alert("Select a scan first.");
    setLoadingType("scan");
    try {
      await downloadScanPDF(kind, selected.id);
    } catch (err) {
      alert("Scan PDF generation failed.");
      console.error(err);
    } finally {
      setLoadingType(null);
    }
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      <div className="flex items-center gap-3">
        <ClipboardList className="w-10 h-10 text-cyan-400 animate-pulse" />
        <h1 className="text-3xl font-extrabold text-accent-cyber">Cyber Threat Reporting</h1>
      </div>

      <p className="text-gray-400 max-w-3xl">
        Generate single-scan PDF reports (URL / File / IDS) or executive summary reports.
      </p>

      <div className="bg-secondary-dark p-6 rounded-xl border border-gray-700 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center md:gap-4">
          {/* kind selector */}
          <div>
            <label className="text-sm text-gray-300 block mb-1">Type</label>
            <select
              value={kind}
              onChange={(e) => {
                setKind(e.target.value);
                setSuggestions([]);
                setQuery("");
                setSelected(null);
              }}
              className="bg-primary-dark border border-gray-700 p-2 rounded"
            >
              {KIND_OPTIONS.map((k) => (
                <option key={k.key} value={k.key}>
                  {k.label}
                </option>
              ))}
            </select>
          </div>

          {/* query input */}
          <div className="flex-1 mt-4 md:mt-0">
            <label className="text-sm text-gray-300 block mb-1">Search</label>
            <div className="relative">
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={`Search ${kind} (type at least 2 chars)...`}
                className="w-full bg-primary-dark border border-gray-700 p-3 rounded pr-10"
              />
              <div className="absolute right-3 top-3 text-gray-400">
                {searching ? <Loader small /> : <SearchIcon />}
              </div>
            </div>

            {/* suggestions */}
            {suggestions && suggestions.length > 0 && (
              <div className="mt-2 bg-primary-dark border border-gray-700 rounded max-h-48 overflow-y-auto">
                {suggestions.map((s) => (
                  <div
                    key={s.id}
                    onClick={() => {
                      setSelected(s);
                    }}
                    className={`p-2 cursor-pointer hover:bg-gray-800 ${selected?.id === s.id ? "bg-gray-800" : ""}`}
                  >
                    <div className="text-white font-semibold">{s.label}</div>
                    {s.scan_date && <div className="text-gray-400 text-xs">{new Date(s.scan_date).toLocaleString()}</div>}
                  </div>
                ))}
              </div>
            )}

            {query && suggestions.length === 0 && !searching && (
              <div className="mt-2 text-gray-500">No matching scan found.</div>
            )}
          </div>

          {/* actions */}
          <div className="mt-4 md:mt-0 md:ml-4 flex flex-col gap-2">
            <button
              onClick={handleGenerateSelected}
              className="bg-cyan-500 hover:bg-cyan-400 text-black py-2 px-4 rounded font-bold disabled:opacity-60"
              disabled={!selected || loadingType === "scan"}
            >
              {loadingType === "scan" ? "Generating..." : "Generate PDF for Selected"}
            </button>

            <button
              onClick={handleExecutive}
              className="bg-gray-800 hover:bg-gray-700 text-white py-2 px-4 rounded font-semibold mt-2 flex items-center gap-2"
            >
              {loadingType === "executive" ? "Generating..." : <><ExecIcon className="w-4 h-4" /> Executive PDF</>}
            </button>
          </div>
        </div>

        {error && <div className="mt-3 text-red-400">{error}</div>}

        {selected && (
          <div className="mt-4 p-3 bg-primary-dark border border-gray-700 rounded">
            <div className="text-sm text-gray-400">Selected</div>
            <div className="text-white font-semibold">{selected.label}</div>
          </div>
        )}
      </div>

      <div className="pt-4 opacity-60 flex items-center gap-2 text-cyan-300 text-sm">
        <Sparkles className="w-4 h-4" />
        AI-Enhanced Analytics Engine — ML + RAG + Threat Intel
      </div>
    </div>
  );
};

export default Reports;
