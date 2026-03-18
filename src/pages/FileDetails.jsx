// frontend/src/pages/FileDetails.jsx
import React, { useEffect, useState, useCallback } from "react";
import { useParams, Link } from "react-router-dom";
import {
  ChevronLeft,
  FileText,
  Hash,
  Cpu,
  Sparkles,
  Shield,
  BarChart,
  Server,
  ClipboardCopy,
  ClipboardCheck,
  Activity
} from "lucide-react";

import Loader from "../components/Loader.jsx";
import api from "../api/config.js";

const FileDetails = () => {
  const { id } = useParams();

  const [scan, setScan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const [tab, setTab] = useState("details");

  const [ragResult, setRagResult] = useState(null);
  const [ragLoading, setRagLoading] = useState(false);
  const [ragError, setRagError] = useState(null);

  const [engineFilter, setEngineFilter] = useState("all");

  // Engine explanation modal states
  const [engineModal, setEngineModal] = useState(null); // {engine, verdict}
  const [engineLoading, setEngineLoading] = useState(false);
  const [engineSimple, setEngineSimple] = useState(null);
  const [engineExpert, setEngineExpert] = useState(null);
  const [engineError, setEngineError] = useState(null);
  const [engineTab, setEngineTab] = useState("simple");

  /* -----------------------------
        FETCH FILE DETAILS
  ----------------------------- */
  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError(false);

      try {
        const res = await api.get(`/filescan/${id}`);
        setScan(res.data);
      } catch {
        try {
          const res2 = await api.get(`/filescan?hash=${id}`);
          setScan(res2.data);
        } catch {
          setError(true);
        }
      }
      setLoading(false);
    };
    load();
  }, [id]);

  /* -----------------------------
        AI (Gemini + RAG for whole file)
  ----------------------------- */
  const fetchRag = useCallback(async () => {
    if (!scan || ragResult || ragLoading) return;

    setRagLoading(true);
    setRagError(null);

    try {
      const isMal = scan.analysis?.malicious_count > 0;

      const payload = {
        threat_type: isMal ? "Malicious File" : "Suspicious File",
        context_data: {
          filename: scan.filename,
          hash: scan.hash,
          engines: scan.analysis.malicious_count,
          total: scan.analysis.total_engines,
          type_description: scan.analysis.type_description,
        },
      };

      const res = await api.post("/rag/explain", payload);
      setRagResult(res.data);
    } catch (err) {
      setRagError("AI explanation failed.");
    }

    setRagLoading(false);
  }, [scan, ragResult, ragLoading]);

  useEffect(() => {
    if (tab === "ai") fetchRag();
  }, [tab]);

  /* -----------------------------
        Engine explanation (per-engine) - Expert Mode
  ----------------------------- */
  const explainEngine = async (engineName, verdict) => {
    setEngineModal({ engine: engineName, verdict });
    setEngineLoading(true);
    setEngineError(null);
    setEngineSimple(null);
    setEngineExpert(null);
    setEngineTab("simple");

    try {
      const payload = {
        threat_type: `Expert Analysis - ${engineName}`,
        context_data: {
          engine: engineName,
          verdict,
          filename: scan.filename,
          hash: scan.hash,
          engine_results: scan.analysis.engine_results
        },
      };

      const res = await api.post("/rag/explain", payload);

      const twoLine =
        res.data.summary && res.data.summary.length > 150
          ? res.data.summary.slice(0, 150) + "..."
          : res.data.summary || "No summary available.";

      setEngineSimple(twoLine);
      setEngineExpert(res.data.full_explanation || "No expert explanation available.");
    } catch (err) {
      setEngineError("AI explanation unavailable.");
    }

    setEngineLoading(false);
  };

  /* -----------------------------
        RENDER STATES
  ----------------------------- */

  if (loading) return <LoaderScreen />;
  if (error) return <ErrorScreen />;

  return (
    <div className="animate-fadeIn space-y-8">

      {/* Back */}
      <Link to="/filescan" className="flex items-center gap-2 text-accent-cyber">
        <ChevronLeft /> Back to Scanner
      </Link>

      {/* Header */}
      <HeaderCard scan={scan} />

      {/* Tabs */}
      <Tabs tab={tab} setTab={setTab} />

      {/* Panels */}
      {tab === "details" && <DetailsPanel scan={scan} />}
      {tab === "hashes" && <HashPanel scan={scan} />}
      {tab === "engines" && (
        <EnginePanel
          scan={scan}
          engineFilter={engineFilter}
          setEngineFilter={setEngineFilter}
          onExplain={explainEngine}
        />
      )}
      {tab === "ai" && (
        <AIPanel
          aiSummary={ragResult}
          aiLoading={ragLoading}
          aiError={ragError}
        />
      )}

      {/* ================= ENGINE EXPERT MODAL ================= */}
      {engineModal && (
        <div className="fixed inset-0 bg-black/60 flex justify-center items-center z-50 p-4">
          <div className="bg-secondary-dark w-full max-w-[680px] max-h-[90vh] rounded-xl border border-gray-700 shadow-xl flex flex-col">

            {/* Header */}
            <div className="p-4 border-b border-gray-700">
              <h3 className="text-xl font-bold text-accent-cyber">
                {engineModal.engine} — {engineModal.verdict}
              </h3>

              {/* Tabs */}
              <div className="flex gap-4 mt-4 border-b border-gray-700">
                <button
                  className={`pb-2 ${
                    engineTab === "simple"
                      ? "text-accent-cyber border-b-2 border-accent-cyber"
                      : "text-gray-400 hover:text-white"
                  }`}
                  onClick={() => setEngineTab("simple")}
                >
                  Simple
                </button>

                <button
                  className={`pb-2 ${
                    engineTab === "expert"
                      ? "text-accent-cyber border-b-2 border-accent-cyber"
                      : "text-gray-400 hover:text-white"
                  }`}
                  onClick={() => setEngineTab("expert")}
                >
                  Expert Mode
                </button>
              </div>
            </div>

            {/* Scrollable Content */}
            <div className="p-4 overflow-y-auto flex-1">
              {engineLoading && (
                <div className="text-center py-6">
                  <Loader />
                  <p className="text-gray-400 mt-2">AI analyzing…</p>
                </div>
              )}

              {engineError && !engineLoading && (
                <p className="text-red-400">{engineError}</p>
              )}

              {!engineLoading && engineTab === "simple" && (
                <p className="text-gray-200 leading-relaxed">{engineSimple}</p>
              )}

              {!engineLoading && engineTab === "expert" && (
                <pre className="text-gray-300 whitespace-pre-wrap text-sm bg-primary-dark p-3 rounded-lg border border-gray-700">
                  {engineExpert}
                </pre>
              )}
            </div>

            {/* Footer with Close Button */}
            <div className="p-4 border-t border-gray-700">
              <button
                onClick={() => setEngineModal(null)}
                className="w-full bg-accent-cyber text-black py-2 rounded-lg font-semibold"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FileDetails;

/* =======================================================
    COMPONENTS
======================================================= */

const LoaderScreen = () => (
  <div className="flex-center min-h-screen">
    <Loader />
  </div>
);

const ErrorScreen = () => (
  <div className="text-center text-red-400 p-8 text-xl">
    ❌ File scan not found.
  </div>
);

/* ------------------------------------------------------
    HEADER CARD
------------------------------------------------------ */
const HeaderCard = ({ scan }) => {
  const isMalicious = scan.analysis.malicious_count > 0;

  return (
    <div className="p-6 rounded-xl bg-secondary-dark border border-gray-700 shadow-xl">
      <h1 className="text-3xl font-bold flex items-center gap-3">
        <FileText className="text-accent-cyber" /> {scan.filename}
      </h1>

      <p className="text-gray-400 mt-2">{scan.hash}</p>

      {/* Verdict Badge */}
      <span
        className={`inline-block mt-3 px-4 py-1 rounded-full text-sm font-semibold ${
          isMalicious
            ? "bg-red-900/40 text-red-400 border border-red-600"
            : "bg-green-900/30 text-green-400 border border-green-600"
        }`}
      >
        {isMalicious ? "Malicious" : "Clean"}
      </span>
    </div>
  );
};

/* ------------------------------------------------------
    TABS
------------------------------------------------------ */
const Tabs = ({ tab, setTab }) => {
  const items = ["details", "hashes", "engines", "ai"];
  return (
    <div className="flex gap-6 border-b border-gray-700 pb-2">
      {items.map((t) => (
        <button
          key={t}
          onClick={() => setTab(t)}
          className={`pb-2 ${
            tab === t
              ? "text-accent-cyber border-b-2 border-accent-cyber"
              : "text-gray-400 hover:text-white"
          }`}
        >
          {t.toUpperCase()}
        </button>
      ))}
    </div>
  );
};

/* ------------------------------------------------------
    DETAILS PANEL — cleaner and dynamic
------------------------------------------------------ */
const DetailsPanel = ({ scan }) => (
  <div className="p-6 bg-secondary-dark border border-gray-700 rounded-xl space-y-3">
    <DetailRow label="Filename" value={scan.filename} />
    <DetailRow label="SHA-256" value={scan.hash} />
    <DetailRow label="Type" value={scan.analysis.type_description} />
    <DetailRow
      label="Scan Date"
      value={new Date(scan.analysis.scan_date).toLocaleString()}
    />
    <DetailRow label="VT Link" value={scan.analysis.permalink} />
    <DetailRow
      label="Detected Engines"
      value={`${scan.analysis.malicious_count}/${scan.analysis.total_engines}`}
    />
  </div>
);

/* ------------------------------------------------------
    HASH PANEL
------------------------------------------------------ */
const HashPanel = ({ scan }) => {
  const hashList = [
    { label: "SHA-256", value: scan.hash },
  ];

  const [copied, setCopied] = useState("");

  const copy = (v) => {
    navigator.clipboard.writeText(v);
    setCopied(v);
    setTimeout(() => setCopied(""), 1000);
  };

  return (
    <div className="p-6 bg-secondary-dark border border-gray-700 rounded-xl space-y-4">
      {hashList.map((h, i) => (
        <div
          key={i}
          className="flex justify-between items-center bg-primary-dark border border-gray-800 p-3 rounded"
        >
          <div>
            <p className="text-gray-400 text-xs">{h.label}</p>
            <p className="text-white break-all">{h.value}</p>
          </div>

          <button onClick={() => copy(h.value)}>
            {copied === h.value ? (
              <ClipboardCheck className="w-5 h-5 text-cyan-400" />
            ) : (
              <ClipboardCopy className="w-5 h-5 text-gray-400" />
            )}
          </button>
        </div>
      ))}

      <EntropyPanel />
    </div>
  );
};

/* ------------------------------------------------------
    ENTROPY
------------------------------------------------------ */
const EntropyPanel = () => {
  const entropy = 7.3;
  let color = "text-yellow-300";
  if (entropy > 7.5) color = "text-red-400";
  if (entropy < 6) color = "text-green-400";

  return (
    <div className="bg-primary-dark p-4 rounded border border-gray-800">
      <h3 className="text-sm text-accent-cyber">Entropy</h3>
      <div className="flex justify-between items-center mt-2">
        <p className={`text-xl font-bold ${color}`}>{entropy}</p>
        <BarChart className="w-5 h-5 text-gray-400" />
      </div>
      <p className="text-gray-400 text-xs mt-1">
        High entropy suggests encrypted/packed malware.
      </p>
    </div>
  );
};

/* ------------------------------------------------------
    VT ENGINE PANEL (simplified for only malicious checks)
------------------------------------------------------ */
const EnginePanel = ({ scan, engineFilter, setEngineFilter, onExplain }) => {
  const engines = scan.analysis.engine_results || {};

  // Filter options: Only ALL + MALICIOUS
  const filters = ["all", "malicious"];

  // Reduce engine list
  const filtered = Object.entries(engines)
    .filter(([_, data]) => {
      if (engineFilter === "malicious") {
        return data.category === "malicious";
      }
      return true; // ALL
    })
    .sort((a, b) => {
      // malicious engines first
      if (a[1].category === "malicious" && b[1].category !== "malicious") return -1;
      if (a[1].category !== "malicious" && b[1].category === "malicious") return 1;
      return 0;
    });

  const color = {
    malicious: "text-red-400",
  };

  return (
    <div className="p-6 bg-secondary-dark border border-gray-700 rounded-xl space-y-5">

      {/* FILTERS — ONLY ALL / MALICIOUS */}
      <div className="flex gap-3">
        {filters.map((f) => (
          <button
            key={f}
            onClick={() => setEngineFilter(f)}
            className={`px-3 py-1 rounded border ${
              engineFilter === f
                ? "bg-accent-cyber text-black"
                : "bg-primary-dark text-gray-300 border-gray-700"
            }`}
          >
            {f.toUpperCase()}
          </button>
        ))}
      </div>

      {/* ENGINE LIST */}
      <div className="bg-primary-dark border border-gray-800 p-3 rounded max-h-96 overflow-y-auto">
        {filtered.length === 0 ? (
          <p className="text-gray-400 text-center py-4">
            No malicious detections found
          </p>
        ) : (
          filtered.map(([engine, data]) => (
            <div
              key={engine}
              className="flex justify-between py-2 border-b border-gray-700"
            >
              <span
                className="text-gray-300 hover:text-accent-cyber cursor-pointer"
                onClick={() => onExplain(engine, data.result || data.category)}
              >
                {engine}
              </span>

              <span className={`font-semibold ${color[data.category]}`}>
                {data.result || data.category}
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  );
};


/* ------------------------------------------------------
    AI PANEL (Gemini + RAG short summary)
------------------------------------------------------ */
const AIPanel = ({ aiSummary, aiLoading, aiError }) => (
  <div className="p-6 bg-secondary-dark border border-gray-700 rounded-xl">
    <h2 className="text-xl text-accent-cyber font-bold flex gap-2 items-center">
      <Cpu /> AI Summary (Gemini + RAG)
    </h2>

    {aiLoading && (
      <div className="py-10 text-center">
        <Loader />
        <p className="text-gray-400 mt-3">Generating AI summary…</p>
      </div>
    )}

    {aiError && (
      <div className="p-4 bg-red-900/40 text-red-400 rounded">{aiError}</div>
    )}

    {aiSummary && (
      <div className="mt-4 space-y-6">

        {/* ⭐ Short Summary */}
        <div className="bg-primary-dark p-4 rounded border border-gray-800">
          <h3 className="text-sm text-accent-cyber uppercase">Quick Summary</h3>
          <p className="text-white mt-2">{aiSummary.short_summary}</p>
        </div>

        {/* ⭐ Full Summary */}
        <div className="bg-primary-dark p-4 rounded border border-gray-800">
          <h3 className="text-sm text-accent-cyber uppercase">Summary</h3>
          <p className="text-gray-200 mt-2 whitespace-pre-wrap">
            {aiSummary.summary}
          </p>
        </div>

        {/* ⭐ Full Explanation */}
        <div className="bg-primary-dark p-4 rounded border border-gray-800">
          <h3 className="text-sm text-accent-cyber uppercase">Full Explanation</h3>
          <p className="text-gray-300 mt-2 whitespace-pre-wrap">
            {aiSummary.full_explanation}
          </p>
        </div>

        {/* ⭐ MITRE Techniques */}
        {aiSummary.mitre_techniques?.length > 0 && (
          <div>
            <h3 className="text-sm text-accent-cyber uppercase mb-2">MITRE</h3>
            <div className="flex gap-2 flex-wrap">
              {aiSummary.mitre_techniques.map((t, i) => (
                <span
                  key={i}
                  className="px-3 py-1 bg-gray-700 border border-cyan-500/40 text-cyan-300 rounded-full text-xs"
                >
                  {t.id}: {t.name}
                </span>
              ))}
            </div>
          </div>
        )}

        <p className="text-cyan-400 opacity-80 flex gap-2 items-center text-sm">
          <Sparkles className="w-4 h-4" /> Powered by Gemini + RAG
        </p>
      </div>
    )}
  </div>
);

/* ------------------------------------------------------
    Detail Row Component
------------------------------------------------------ */
const DetailRow = ({ label, value }) => (
  <div className="grid grid-cols-3 py-1">
    <span className="text-gray-400">{label}</span>
    <span className="col-span-2 text-white break-all">{value}</span>
  </div>
);
