import React, { useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import apiClient from "../api/config.js";

// ----- Chart.js + react-chartjs-2 FIX -----
import { Pie, Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  ArcElement,
  BarElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
} from "chart.js";

ChartJS.register(
  ArcElement,
  BarElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale
);

import {
  ShieldAlert,
  Activity,
  ListOrdered,
  FileSearch,
  Cpu,
  ArrowLeft,
} from "lucide-react";

const IDSDetails = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const params = useParams();

  // If opened from navigation → location.state.data exists
  // If opened from history → location.state is empty → must fetch
  const initialData = location.state?.data || null;

  const [data, setData] = useState(initialData);
  const [loading, setLoading] = useState(!initialData);

  // ============================================================
  // FETCH FULL DATA WHEN OPENED FROM HISTORY
  // ============================================================
  useEffect(() => {
    const loadFromHistory = async () => {
      if (!initialData) {
        try {
          const res = await apiClient.get(`/ids/history`);
          const findScan = res.data.find((x) => x.id === Number(params.scanId));

          if (findScan) {
            // Decode JSON string from DB
            setData({
              ...findScan,
              attack_breakdown: findScan.attack_breakdown || [],
              engine_results: findScan.engine_results || [],
            });
          }
        } catch (err) {
          console.error("Failed loading history data", err);
        }
      }
      setLoading(false);
    };

    loadFromHistory();
  }, [initialData, params.scanId]);

  // ============================================================
  // LOADING STATE
  // ============================================================
  if (loading) {
    return (
      <div className="text-center text-cyan-300 text-xl mt-10">
        Loading IDS Report…
      </div>
    );
  }

  // ============================================================
  // SAFETY FALLBACKS
  // ============================================================
  if (!data) {
    return (
      <div className="text-center text-red-400 text-xl mt-10">
        ❌ No IDS Report Data Found.
      </div>
    );
  }

  const safeData = {
    attack_breakdown: data.attack_breakdown || [],
    engine_results: data.engine_results || [],
    total_packets: data.total_packets || 0,
    malicious_packets: data.malicious_packets || 0,
    normal_packets: data.normal_packets || 0,
    overall_severity: data.overall_severity || "Low",
  };

  // Badge color
  const badgeColor =
    safeData.overall_severity === "High"
      ? "bg-red-900/40 text-red-300 border border-red-700"
      : safeData.overall_severity === "Medium"
        ? "bg-yellow-900/40 text-yellow-300 border border-yellow-700"
        : "bg-green-900/40 text-green-300 border border-green-700";

  // PIE chart data
  const pieData = {
    labels: ["Malicious", "Normal"],
    datasets: [
      {
        data: [safeData.malicious_packets, safeData.normal_packets],
        backgroundColor: ["#ef4444", "#22c55e"],
        borderWidth: 2,
        borderColor: "#020617",
        hoverOffset: 8,
        radius: "90%",          // 🔥 reduce size
      },
    ],
  };

  const pieOptions = {
    responsive: true,
    maintainAspectRatio: false, // 🔥 allows size control
    plugins: {
      legend: {
        position: "bottom",
        labels: {
          color: "#cbd5f5",
          padding: 10,
          boxWidth: 16,
        },
      },
      tooltip: {
        backgroundColor: "#020617",
        borderColor: "#38bdf8",
        borderWidth: 3,
      },
    },
  };

  // BAR chart 
  const barData = {
    labels: safeData.attack_breakdown.map((i) => i.attack_type),
    datasets: [
      {
        label: "Attack Count",
        data: safeData.attack_breakdown.map((i) => i.count),
        backgroundColor: "#38bdf8",
        borderRadius: 6,
        barThickness: 22,   // 🔥 uniform bars
      },
    ],
  };

  const barOptions = {
    responsive: true,
    maintainAspectRatio: false,
    indexAxis: "x", // 🔥 horizontal bar chart
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        backgroundColor: "#020617",
        borderColor: "#38bdf8",
        borderWidth: 1,
      },
    },
    scales: {
      x: {
        ticks: {
          color: "#cbd5f5",
          precision: 0,
        },
        grid: {
          color: "#1e293b",
        },
      },
      y: {
        ticks: {
          color: "#cbd5f5",
        },
        grid: {
          display: false,
        },
      },
    },
  };

  return (
    <div className="space-y-10 animate-fadeIn">
      {/* BACK BUTTON */}
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-cyan-400 hover:text-cyan-300 transition"
      >
        <ArrowLeft className="w-5 h-5" /> Back
      </button>

      {/* HEADER */}
      <div className="p-6 rounded-xl bg-secondary-dark border border-gray-700 shadow-2xl flex justify-between items-center">
        <div className="flex items-center gap-3">
          <ShieldAlert className="w-10 h-10 text-red-400 animate-pulse" />
          <h1 className="text-3xl font-extrabold text-white tracking-wide">
            IDS Analysis Report
          </h1>
        </div>

        <span className={`text-3xl font-bold px-4 py-2 rounded-lg ${badgeColor}`}>
          {safeData.overall_severity.toUpperCase()}
        </span>
      </div>

      {/* SUMMARY GRID */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard
          label="Total Packets"
          value={safeData.total_packets}
          icon={<ListOrdered className="text-cyan-300" />}
        />
        <StatCard
          label="Malicious Packets"
          value={safeData.malicious_packets}
          color="text-red-400"
          icon={<Activity className="text-red-400" />}
        />
        <StatCard
          label="Normal Packets"
          value={safeData.normal_packets}
          color="text-green-400"
          icon={<FileSearch className="text-green-400" />}
        />
      </div>

      {/* ENGINE RESULTS
      <div className="p-6 bg-secondary-dark border border-gray-700 rounded-xl shadow-xl">
        <h2 className="text-xl font-semibold text-cyan-300 flex gap-2 mb-4">
          <Cpu className="w-7 h-7 text-cyan-400" /> Detection Engines
        </h2>

        {safeData.engine_results.length === 0 ? (
          <p className="text-gray-400">No engine results stored for this scan.</p>
        ) : (
          <div className="space-y-3">
            {safeData.engine_results.map((eng, i) => (
              <div
                key={i}
                className="flex justify-between p-4 bg-primary-dark border border-gray-700 rounded-lg hover:bg-primary-light transition"
              >
                <span className="text-gray-300 font-medium">{eng.engine}</span>
                <span className="text-cyan-300 font-semibold">
                  {eng.verdict} ({Math.round(eng.score * 100)}%)
                </span>
              </div>
            ))}
          </div>
        )}
      </div> */}

      {/* ATTACK BREAKDOWN */}
      <div className="p-6 rounded-xl bg-secondary-dark border border-gray-700 shadow-xl">
        <h2 className="text-xl font-bold text-cyan-300 mb-4 flex gap-2">
          <Activity className="w-7 h-7" /> Attack Breakdown
        </h2>

        {safeData.attack_breakdown.length === 0 ? (
          <p className="text-gray-400">No malicious activity detected.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border border-gray-700 rounded-lg overflow-hidden">
              <thead className="bg-primary-dark text-gray-300">
                <tr>
                  <th className="p-3">Attack Type</th>
                  <th className="p-3">Count</th>
                  <th className="p-3">Severity</th>
                </tr>
              </thead>
              <tbody>
                {safeData.attack_breakdown.map((row, idx) => (
                  <tr key={idx} className="border-t border-gray-700 hover:bg-primary-light transition">
                    <td className="p-3">{row.attack_type}</td>
                    <td className="p-3 text-cyan-300 font-semibold">{row.count}</td>
                    <td className="p-3">
                      <span
                        className={`px-3 py-1 rounded-lg border ${row.severity === "High"
                            ? "bg-red-900/40 border-red-700 text-red-300"
                            : row.severity === "Medium"
                              ? "bg-yellow-900/40 border-yellow-700 text-yellow-300"
                              : "bg-green-900/40 border-green-700 text-green-300"
                          }`}
                      >
                        {row.severity}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* MITRE ATT&CK */}
      {data.mitre_techniques?.length > 0 && (
        <div className="p-6 rounded-xl bg-secondary-dark border border-gray-700 shadow-xl">
          <h2 className="text-xl font-bold text-cyan-300 mb-4">
            MITRE ATT&CK Mapping
          </h2>

          <table className="w-full border border-gray-700 rounded-lg">
            <thead className="bg-primary-dark text-gray-300">
              <tr>
                <th className="p-3">Tactic</th>
                <th className="p-3">Technique ID</th>
                <th className="p-3">Technique</th>
              </tr>
            </thead>
            <tbody>
              {data.mitre_techniques.map((m, i) => (
                <tr key={i} className="border-t border-gray-700">
                  <td className="p-3">{m.tactic}</td>
                  <td className="p-3 text-cyan-300 font-semibold">{m.technique_id}</td>
                  <td className="p-3">{m.technique}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}


      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* PIE CHART */}
        <ChartCard title="Traffic Distribution">
          <div className="h-64 flex items-center justify-center">
            <Pie data={pieData} options={pieOptions} />
          </div>
        </ChartCard>

        {/* BAR CHART */}
        <ChartCard title="Attack Frequency">
          <div className="h-64">
            <Bar data={barData} options={barOptions} />
          </div>
        </ChartCard>
      </div>

    </div>
  );
};

export default IDSDetails;

// ===============================
const StatCard = ({ label, value, icon, color = "text-white" }) => (
  <div className="p-6 bg-primary-dark border border-gray-700 rounded-lg shadow-lg flex justify-between items-center">
    <div>
      <p className="text-gray-400 text-sm uppercase">{label}</p>
      <p className={`text-2xl font-bold mt-1 ${color}`}>{value}</p>
    </div>
    <div className="text-cyan-300">{icon}</div>
  </div>
);

const ChartCard = ({ title, children }) => (
  <div className="p-6 bg-primary-dark border border-gray-700 rounded-xl shadow-xl">
    <h3 className="text-lg font-semibold text-gray-300 mb-3">{title}</h3>
    {children}
  </div>
);
