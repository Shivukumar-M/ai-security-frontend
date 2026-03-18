// frontend/src/pages/URLDetails.jsx
import React, { useEffect, useState, useCallback } from "react";
import { useParams, Link } from "react-router-dom";
import {
  ShieldCheck,
  AlertTriangle,
  Layers,
  Link2,
  ChevronLeft,
  Fingerprint,
  Info,
  Server,
  Cpu,
} from "lucide-react";
import Loader from "../components/Loader.jsx";
import api from "../api/config.js";

// ===========================================================
// MAIN COMPONENT
// ===========================================================
const URLDetails = () => {
  const { scanId } = useParams();
  const [scan, setScan] = useState(null);
  const [tab, setTab] = useState("detection");

  const [ragResult, setRagResult] = useState(null);
  const [ragLoading, setRagLoading] = useState(false);
  const [ragError, setRagError] = useState(null);

  const [engineFilter, setEngineFilter] = useState("all");

  // ENGINE EXPLANATION MODAL
  const [engineModal, setEngineModal] = useState(null); // {engine, verdict}
  const [engineLoading, setEngineLoading] = useState(false);
  const [engineSimple, setEngineSimple] = useState(null);
  const [engineExpert, setEngineExpert] = useState(null);
  const [engineError, setEngineError] = useState(null);
  const [engineTab, setEngineTab] = useState("simple");

  useEffect(() => {
  let mounted = true;

  api
    .get(`/urlscan/${scanId}`)
    .then((res) => {
      if (mounted) setScan(res.data);
    })
    .catch(() => {
      if (mounted) setScan("error");
    });

  return () => {
    mounted = false;
  };
}, [scanId]);


  const fetchRag = useCallback(async () => {
    if (!scan || ragResult || ragLoading) return;
    try {
      setRagLoading(true);
      const payload = {
        threat_type:
          scan.final_verdict === "Threat Detected"
            ? "Malicious URL"
            : "Suspicious URL",
        context_data: {
          id: scan.id,
          target_url: scan.target_url,
          ml_verdict: scan.ml_verdict,
          ml_score: scan.ml_score,
          final_verdict: scan.final_verdict,
          urlhaus_status: scan.urlhaus_status,
          vt: scan.vt_details || {},
        },
      };
      const res = await api.post("/rag/explain", payload);
      setRagResult(res.data);
    } catch {
      setRagError("AI explanation failed.");
    } finally {
      setRagLoading(false);
    }
  }, [scan, ragResult, ragLoading]);

  useEffect(() => {
    if (tab === "ai") fetchRag();
  }, [tab, fetchRag]);

  // ===========================================================
  // ENGINE EXPLANATION FETCH
  // ===========================================================
  const explainEngine = async (engine, verdict) => {
    setEngineModal({ engine, verdict });
    setEngineLoading(true);
    setEngineError(null);
    setEngineSimple(null);
    setEngineExpert(null);
    setEngineTab("simple");

    try {
      const payload = {
        threat_type: `Expert Analysis - ${engine}`,
        context_data: {
          engine,
          verdict,
          target_url: scan.target_url,
        },
      };

      const res = await api.post("/rag/explain", payload);

      // 2-line simple explanation
      const twoLine =
        res.data.summary.length > 150
          ? res.data.summary.slice(0, 150) + "..."
          : res.data.summary;

      setEngineSimple(twoLine);
      setEngineExpert(res.data.full_explanation);
    } catch (err) {
      setEngineError("AI explanation unavailable.");
    }

    setEngineLoading(false);
  };

  // ===========================================================
  // PAGE LOADING
  // ===========================================================
  if (!scan)
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader />
      </div>
    );
  if (scan === "error")
    return (
      <div className="text-center text-red-500 p-6">
        ❌ Scan not found.
      </div>
    );

  const vt = scan.vt_details || {};
  const isMal = scan.final_verdict === "Threat Detected";

  return (
    <div className="space-y-10 animate-fadeIn">
      {/* BACK BUTTON */}
      <Link
        to="/scanner"
        className="flex items-center gap-2 text-gray-300 hover:text-white"
      >
        <ChevronLeft /> Back to Scanner
      </Link>

      {/* HEADER */}
      <div className="p-6 bg-secondary-dark rounded-xl border border-gray-700 shadow-lg">
        <h1 className="text-3xl font-bold flex items-center gap-3">
          <Link2 className="text-accent-cyber" />
          URL Analysis Report
        </h1>

        <p className="text-gray-400 mt-2 break-words">{scan.target_url}</p>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
          <SummaryItem
            label="Final Verdict"
            value={scan.final_verdict}
            icon={isMal ? AlertTriangle : ShieldCheck}
            color={isMal ? "text-red-400" : "text-green-400"}
          />
          <SummaryItem
            label="ML Score"
            value={(scan.ml_score * 100).toFixed(1) + "%"}
            icon={Fingerprint}
          />
          <SummaryItem
            label="URLHaus"
            value={scan.urlhaus_status || "Unknown"}
            icon={Layers}
          />
          <SummaryItem
            label="Scan Time"
            value={new Date(scan.scan_time).toLocaleString()}
            icon={Info}
          />
        </div>
      </div>

      {/* TABS */}
      <div className="flex gap-6 border-b border-gray-700 pb-2">
        <TabButton id="detection" label="Detection" tab={tab} setTab={setTab} />
        <TabButton id="details" label="Details" tab={tab} setTab={setTab} />
        <TabButton id="metadata" label="Metadata" tab={tab} setTab={setTab} />
        <TabButton id="ai" label="AI Explanation" tab={tab} setTab={setTab} />
      </div>

      {tab === "detection" && <DetectionView scan={scan} />}
      {tab === "details" && (
        <DetailsView
          scan={scan}
          engineFilter={engineFilter}
          setEngineFilter={setEngineFilter}
          onExplain={explainEngine}
        />
      )}
      {tab === "metadata" && <MetadataView scan={scan} />}
      {tab === "ai" && (
        <AIExplanationPanel
          ragLoading={ragLoading}
          ragError={ragError}
          ragResult={ragResult}
        />
      )}

      {/* ===========================================================
          ENGINE EXPLANATION MODAL
      =========================================================== */}
      {engineModal && (
  <div className="fixed inset-0 bg-black/60 flex justify-center items-center z-50 p-4">
    <div className="bg-secondary-dark w-full max-w-[500px] max-h-[90vh] rounded-xl border border-gray-700 shadow-xl flex flex-col">

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
        
        {/* Loading */}
        {engineLoading && (
          <div className="text-center py-6">
            <Loader />
            <p className="text-gray-400 mt-2">AI analyzing…</p>
          </div>
        )}

        {/* Error */}
        {engineError && !engineLoading && (
          <p className="text-red-400">{engineError}</p>
        )}

        {/* Simple Explanation */}
        {!engineLoading && engineTab === "simple" && (
          <p className="text-gray-200 leading-relaxed">{engineSimple}</p>
        )}

        {/* Expert Explanation */}
        {!engineLoading && engineTab === "expert" && (
          <pre className="text-gray-300 whitespace-pre-wrap text-sm bg-primary-dark p-3 rounded-lg border border-gray-700">
            {engineExpert}
          </pre>
        )}
      </div>

      {/* Footer with Close Button (always visible) */}
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

// ===========================================================
// SMALL COMPONENTS
// ===========================================================
const SummaryItem = ({ label, value, icon: Icon, color }) => (
  <div className="p-4 bg-primary-dark rounded-lg border border-gray-800">
    <div className="flex items-center gap-2 text-gray-400 text-sm">
      <Icon className="w-4 h-4" /> {label}
    </div>
    <p className={`text-xl font-semibold mt-1 ${color}`}>{value}</p>
  </div>
);

const TabButton = ({ label, tab, setTab, id }) => (
  <button
    onClick={() => setTab(id)}
    className={`pb-2 text-lg ${
      tab === id
        ? "text-accent-cyber border-b-2 border-accent-cyber"
        : "text-gray-400 hover:text-white"
    } transition`}
  >
    {label}
  </button>
);

// ===========================================================
// DETECTION VIEW
// ===========================================================
const DetectionView = ({ scan }) => {
  const vt = scan.vt_details || {};
  return (
    <div className="p-6 bg-secondary-dark rounded-xl border border-gray-700">
      <h2 className="text-xl font-bold text-accent-cyber mb-4">
        Threat Intelligence Summary
      </h2>

      <div className="space-y-4">
        <DetailBox label="ML Verdict" value={scan.ml_verdict} />
        <DetailBox
          label="VirusTotal Verdict"
          value={vt.malicious_count > 0 ? "Malicious" : "Clean"}
        />
        <DetailBox
          label="Malicious Engines"
          value={`${vt.malicious_count ?? 0}/${vt.total_engines ?? "?"}`}
        />
      </div>
    </div>
  );
};

// ===========================================================
// DETAILS VIEW
// ===========================================================
const DetailsView = ({ scan, engineFilter, setEngineFilter, onExplain }) => {
  const vt = scan.vt_details || {};
  const engines = vt.engine_results || {};

  const severityOrder = {
    malicious: 1,
    suspicious: 2,
    harmless: 3,
    undetected: 4,
    unrated: 5,
  };

  const sortedEngines = Object.entries(engines)
    .filter(([_, data]) => engineFilter === "all" || data.category === engineFilter)
    .sort((a, b) => severityOrder[a[1].category] - severityOrder[b[1].category]);

  const colors = {
    malicious: "text-red-400",
    suspicious: "text-yellow-400",
    harmless: "text-green-400",
    undetected: "text-gray-400",
    unrated: "text-gray-400",
  };

  return (
    <div className="p-6 bg-secondary-dark border border-gray-700 rounded-xl space-y-6">
      <h2 className="text-xl font-bold text-accent-cyber flex items-center gap-2">
        <Server className="text-accent-cyber" /> VirusTotal Technical Details
      </h2>

      {/* FILTER BUTTONS */}
      <div className="flex flex-wrap gap-3 mb-4">
        {["all", "malicious", "suspicious", "harmless", "undetected"].map((f) => (
          <button
            key={f}
            onClick={() => setEngineFilter(f)}
            className={`px-3 py-1 rounded-lg text-sm border ${
              engineFilter === f
                ? "bg-accent-cyber text-black border-accent-cyber"
                : "bg-primary-dark text-gray-300 border-gray-700 hover:bg-gray-800"
            }`}
          >
            {f.toUpperCase()}
          </button>
        ))}
      </div>

      {/* SUMMARY GRID */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <DetailBox label="Malicious" value={vt.malicious_count ?? 0} />
        <DetailBox label="Suspicious" value={vt.suspicious_count ?? 0} />
        <DetailBox label="Harmless" value={vt.harmless_count ?? 0} />
        <DetailBox label="Undetected" value={vt.undetected ?? 0} />
        <DetailBox label="Total Engines" value={vt.total_engines ?? "?"} />
        <DetailBox
          label="Scan Date"
          value={
            vt.scan_date
              ? new Date(vt.scan_date * 1000).toLocaleString()
              : "Unknown"
          }
        />
      </div>

      {/* ENGINE LIST */}
      {sortedEngines.length > 0 && (
        <div className="max-h-96 overflow-y-auto bg-primary-dark border border-gray-800 p-4 rounded-xl">
          {sortedEngines.map(([engine, data]) => (
            <div
              key={engine}
              className="flex justify-between py-2 border-b border-gray-700"
            >
              {/* CLICK ENGINE NAME */}
              <span
                className="text-gray-300 hover:text-accent-cyber cursor-pointer"
                onClick={() => onExplain(engine, data.result || data.category)}
              >
                {engine}
              </span>

              <span className={`font-semibold ${colors[data.category]}`}>
                {data.result || data.category}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// ===========================================================
// METADATA VIEW
// ===========================================================
const MetadataView = ({ scan }) => {
  const vt = scan.vt_details || {};
  const geo = vt.geoip || {};

  return (
    <div className="p-6 bg-secondary-dark border border-gray-700 rounded-xl space-y-6">
      <h2 className="text-xl font-bold text-accent-cyber">URL Metadata</h2>

      {/* -------- NEW -------- */}
      <DetailGrid label="Resolved IP" value={scan.resolved_ip} />
      <DetailGrid label="HTTP Status" value={scan.http_status_code} />
      <DetailGrid
        label="Reachable"
        value={scan.url_reachable ? "Yes" : "No"}
      />
      {/* --------------------- */}
      
      

      <DetailGrid
        label="Scan Time"
        value={new Date(scan.scan_time).toLocaleString()}
      />
      <DetailGrid label="Title" value={vt.title} />
      <DetailGrid label="Content-Type" value={vt.content_type} />
      <DetailGrid label="Server" value={vt.server} />

      <DetailGrid label="ASN" value={geo.asn || "Unknown"} />
      <DetailGrid label="Country" value={geo.country || "Unknown"} />


      <DetailGrid label="HTTP Code" value={vt.last_http_response_code} />
    </div>
  );
};

// ===========================================================
// SMALL COMPONENTS
// ===========================================================
const DetailBox = ({ label, value }) => (
  <div className="bg-primary-dark border border-gray-700 p-4 rounded-xl">
    <p className="text-gray-400 text-xs uppercase">{label}</p>
    <p className="text-2xl font-bold text-white">{value ?? "Unknown"}</p>
  </div>
);

const DetailGrid = ({ label, value }) => (
  <div className="grid grid-cols-3 py-1">
    <span className="text-gray-400">{label}</span>
    <span className="col-span-2 text-white break-all">{value ?? "Unknown"}</span>
  </div>
);

// ===========================================================
// AI EXPLANATION PANEL
// ===========================================================
const AIExplanationPanel = ({ ragLoading, ragError, ragResult }) => (
  <div className="p-6 bg-secondary-dark rounded-xl border border-gray-700 space-y-6 min-h-[200px]">
    <h2 className="text-xl font-bold text-accent-cyber flex items-center gap-2">
      <Cpu /> AI Explanation
    </h2>

    {ragLoading && (
      <div className="text-center py-10">
        <Loader />
        <p className="text-gray-400 mt-3">Generating explanation…</p>
      </div>
    )}

    {ragError && (
      <div className="p-4 bg-red-900/30 rounded">
        <p className="text-red-400">{ragError}</p>
      </div>
    )}

    {ragResult && (
      <div className="space-y-6">
        <div className="bg-primary-dark p-4 rounded-lg border border-gray-800">
          <h3 className="text-sm text-accent-cyber font-semibold uppercase">
            Summary
          </h3>
          <p className="text-white mt-2">{ragResult.summary}</p>
        </div>

        <div className="bg-primary-dark p-4 rounded-lg border border-gray-800">
          <h3 className="text-sm text-accent-cyber font-semibold uppercase">
            Full Explanation
          </h3>
          <p className="text-gray-200 mt-2 whitespace-pre-wrap">
            {ragResult.full_explanation}
          </p>
        </div>

        <div>
          <h3 className="text-sm text-accent-cyber font-semibold uppercase mb-2">
            MITRE Techniques
          </h3>
          <div className="flex flex-wrap gap-2">
            {ragResult.mitre_techniques.map((t, i) => (
              <span
                key={i}
                className="px-3 py-1 bg-gray-700 text-xs text-cyan-300 rounded-full border border-cyan-500/40"
              >
                {t.id}: {t.name}
              </span>
            ))}
          </div>
        </div>
      </div>
    )}
  </div>
);

export default URLDetails;
