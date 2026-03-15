import React, { useEffect, useRef, useState } from "react";
import { getLiveIDSAlerts } from "../api/ids_realtime";
import Loader from "../components/Loader";
// 🔥 Icons for attack types
import {
  ShieldAlert,
  Bug,
  Radar,
  Zap,
} from "lucide-react";

/* ================= SEVERITY STYLES ================= */
const severityStyles = {
  Low: "bg-green-900/30 border-green-500 text-green-400",
  Medium: "bg-yellow-900/30 border-yellow-500 text-yellow-400",
  High: "bg-red-900/30 border-red-500 text-red-400",
  Critical: "bg-red-950 border-red-600 text-red-300",
};

/* ================= ATTACK ICONS ================= */
const attackIcons = {
  "SQL Injection": <Bug className="w-4 h-4 text-red-400" />,
  "Cross-Site Scripting": <Bug className="w-4 h-4 text-yellow-400" />,
  "XSS": <Bug className="w-4 h-4 text-yellow-400" />,
  "Brute Force / DoS": <Zap className="w-4 h-4 text-orange-400" />,
  "DoS": <Zap className="w-4 h-4 text-orange-400" />,
  "DDoS": <Zap className="w-4 h-4 text-orange-400" />,
  "Port Scan": <Radar className="w-4 h-4 text-cyan-400" />,
};

const LiveIDS = () => {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  // 🔒 Track which alert timestamps we already know
  const seenAlertTimestamps = useRef(new Set());
  // 🔒 Ensure DDoS popup shows ONLY ONCE
  const ddosPopupShown = useRef(false);

  useEffect(() => {
    // 🔥 Function moved out to be callable immediately AND via interval
    const fetchAlerts = async () => {
      try {
        const data = await getLiveIDSAlerts();
        const incomingAlerts = data.alerts || [];
        
        setAlerts((prev) => {
          const updated = [...prev];
          let changed = false;
          for (const alert of incomingAlerts) {
            if (!seenAlertTimestamps.current.has(alert.timestamp)) {
              seenAlertTimestamps.current.add(alert.timestamp);
              updated.unshift(alert);
              changed = true;
            }
          }
          return changed ? updated : prev;
        });
      } catch (err) {
        console.error("Live IDS error:", err);
      } finally {
        setLoading(false); // Stop loading after first attempt
      }
    };

    // 1. Run immediately on mount
    fetchAlerts();

    // 2. Set the interval for subsequent updates
    const interval = setInterval(fetchAlerts, 2000);

    return () => clearInterval(interval);
  }, []);

  if (loading) return <Loader />;

  return (
    <div className="p-6 space-y-6 text-white">
      {/* ================= HEADER ================= */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">🚨 Live IDS Monitor</h1>
        <div className="text-sm px-3 py-1 rounded bg-gray-800 border border-gray-700">
          Active Alerts:{" "}
          <span className="font-semibold text-red-400">
            {alerts.length}
          </span>
        </div>
      </div>

      {/* ================= EMPTY STATE ================= */}
      {alerts.length === 0 && (
        <div className="p-6 text-center border border-gray-700 rounded bg-gray-900 text-gray-400">
          No suspicious activity detected.
        </div>
      )}

      {/* ================= ALERT LIST ================= */}
      <div className="space-y-4">
        {alerts.map((alert, index) => {
          const severityClass =
            severityStyles[alert.severity] ||
            "bg-gray-900 border-gray-600 text-gray-300";
          return (
            <div
              key={`${alert.timestamp}-${index}`}
              className={`p-4 rounded border shadow ${severityClass}`}
            >
              {/* ---------- TOP ROW ---------- */}
              <div className="flex justify-between items-center mb-2">
                <p className="font-semibold">
                  Source IP:{" "}
                  <span className="font-mono">{alert.ip}</span>
                </p>
                <div className="flex gap-2">
                  <span className="px-2 py-0.5 text-xs rounded bg-black/40 border">
                    {alert.severity}
                  </span>
                  {alert.correlated_attack && (
                    <span className="px-2 py-0.5 text-xs rounded bg-red-800 text-red-200">
                      Multi-Stage
                    </span>
                  )}
                </div>
              </div>

              {/* ---------- DETAILS ---------- */}
              <div className="text-sm space-y-1">
                <p>
                  <b>Endpoint:</b>{" "}
                  <span className="font-mono">{alert.endpoint}</span>
                </p>
                {/* Attack Types */}
                {alert.attack_types?.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-1">
                    {alert.attack_types.map((type, i) => (
                      <span
                        key={i}
                        className="flex items-center gap-1 px-2 py-0.5 text-xs rounded bg-black/40 border border-red-500/40 text-red-300"
                      >
                        {attackIcons[type] || (
                          <ShieldAlert className="w-4 h-4" />
                        )}
                        {type}
                      </span>
                    ))}
                  </div>
                )}
                {/* MITRE */}
                {alert.mitre_techniques?.length > 0 && (
                  <p className="text-cyan-400">
                    <b>MITRE:</b>{" "}
                    {alert.mitre_techniques
                      .map((m) => m.technique_id)
                      .join(", ")}
                  </p>
                )}
                {/* Timestamp */}
                <p className="text-gray-400">
                  {new Date(alert.timestamp * 1000).toLocaleString()}
                </p>
                {/* Action */}
                {alert.recommended_action && (
                  <p className="text-yellow-300">
                    <b>Action:</b> {alert.recommended_action}
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default LiveIDS;