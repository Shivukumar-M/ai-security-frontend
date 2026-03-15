import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { getDashboardMetrics } from "../api/dashboard.js";

import PieChart from "../components/charts/PieChart.jsx";
import BarChart from "../components/charts/BarChart.jsx";
import LineChart from "../components/charts/LineChart.jsx";
import Loader from "../components/Loader.jsx";

import {
  Activity,
  ShieldAlert,
  Link as LinkIcon,
  AlertCircle,
  FileScan,
  Clock,
  CheckCircle,
} from "lucide-react";

// ------------------------------------------------------------
// MAIN DASHBOARD COMPONENT
// ------------------------------------------------------------
const Dashboard = () => {
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await getDashboardMetrics();
        setMetrics({
          total_url_scans: data.total_url_scans || 0,
          safe_url_count: data.safe_url_count || 0,
          total_file_scans: data.total_file_scans || 0,
          safe_file_count: data.safe_file_count || 0,
          total_ids_scans:
            Object.values(data.ids_severity_distribution || {}).reduce(
              (a, b) => a + b,
              0
            ),
          total_threats_detected: data.total_threats_detected || 0,
          url_verdict_distribution: data.url_verdict_distribution || {},
          ids_severity_distribution: data.ids_severity_distribution || {},
          traffic_trend: data.traffic_trend || [],
          live_alerts: data.live_alerts || [],
          recent_activity: data.recent_activity || [],
        });
      } catch {
        setError("Failed to load dashboard metrics.");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading)
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader />
      </div>
    );

  if (error)
    return <p className="text-center text-red-400">{error}</p>;

  const urlData = Object.entries(metrics.url_verdict_distribution).map(
    ([name, value]) => ({ name, value })
  );
  const idsData = Object.entries(metrics.ids_severity_distribution).map(
    ([name, value]) => ({ name, value })
  );

  return (
    <div className="space-y-10 px-4 sm:px-6 lg:px-8 pb-20 animate-fadeIn">

      {/* HEADER */}
      <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-accent-cyber flex items-center gap-3">
        <Activity className="w-7 h-7 sm:w-9 sm:h-9 text-cyan-400 animate-pulse" />
        Cyber Security Operations Dashboard
      </h1>

      {/* ---------------------------------------------------- */}
      {/* STAT CARDS */}
      {/* ---------------------------------------------------- */}
      <div className="
        grid gap-5
        grid-cols-1
        sm:grid-cols-2
        md:grid-cols-3
        xl:grid-cols-6
      ">
        <StatCard title="Total URL Scans" value={metrics.total_url_scans} icon={LinkIcon} color="cyan-400" />
        <StatCard title="Safe URLs" value={metrics.safe_url_count} icon={CheckCircle} color="green-400" />
        <StatCard title="Total File Scans" value={metrics.total_file_scans} icon={FileScan} color="orange-300" />
        <StatCard title="Safe Files" value={metrics.safe_file_count} icon={CheckCircle} color="green-300" />
        <StatCard title="IDS Events" value={metrics.total_ids_scans} icon={Activity} color="yellow-300" />
        <StatCard title="Total Threats" value={metrics.total_threats_detected} icon={ShieldAlert} color="red-400" pulse />
      </div>

      {/* ---------------------------------------------------- */}
      {/* TREND CHART */}
      {/* ---------------------------------------------------- */}
      <div className="bg-secondary-dark border border-gray-700 rounded-xl p-4 sm:p-6 shadow-xl">
        <LineChart
          data={metrics.traffic_trend}
          dataKeyX="time"
          dataKeyY="count"
          title="Security Activity Trend — URLs • IDS • Files (Last 7 Days)"
          lineColor="#00F0FF"
          height={300}
          strokeWidth={3}
        />
      </div>

      {/* ---------------------------------------------------- */}
      {/* PIE + BAR */}
      {/* ---------------------------------------------------- */}
      <div className="grid grid-cols-1 p-6 xl:grid-cols-2 gap-8">
        <div className="bg-secondary-dark p-6 sm:p-6 rounded-xl border border-gray-700 shadow-lg">
          <PieChart
            data={urlData}
            dataKey="value"
            nameKey="name"
            title="URL Scan Verdict Distribution"
            height={430}
            radius={100}
            innerRadius={30}
          />
        </div>

        <div className="bg-secondary-dark p-4 sm:p-6 rounded-xl border border-gray-700 shadow-lg">
          <BarChart
            data={idsData}
            dataKey="name"
            title="IDS Event Severity Breakdown"
            barColor="#FF4D4D"
            height={380}
            barSize={40}
          />
        </div>
      </div>

      {/* ---------------------------------------------------- */}
      {/* LIVE THREAT FEED */}
      {/* ---------------------------------------------------- */}
      <LiveThreatFeed feed={metrics.live_alerts} />

      {/* ---------------------------------------------------- */}
      {/* RECENT ACTIVITY */}
      {/* ---------------------------------------------------- */}
      <RecentActivityList activities={metrics.recent_activity} />
    </div>
  );
};

// ------------------------------------------------------------
// STAT CARD (Responsive)
// ------------------------------------------------------------
const StatCard = ({ title, value, icon: Icon, color, pulse = false }) => (
  <div className="p-4 sm:p-6 bg-secondary-dark rounded-xl border border-gray-700 shadow-lg">
    <div className="flex justify-between items-center">
      <h4 className="text-xs sm:text-sm font-bold text-gray-400 uppercase">
        {title}
      </h4>
      <Icon className={`w-6 h-6 sm:w-7 sm:h-7 text-${color} ${pulse ? "animate-pulse" : ""}`} />
    </div>
    <p className={`text-3xl sm:text-4xl font-extrabold mt-3 text-${color}`}>
      {value}
    </p>
  </div>
);

// ------------------------------------------------------------
// LIVE THREAT FEED (Fully Responsive)
// ------------------------------------------------------------
const LiveThreatFeed = ({ feed }) => {
  const getIcon = (level) => {
    switch (level) {
      case "CRITICAL":
        return <ShieldAlert className="text-red-400" />;
      case "HIGH":
        return <Activity className="text-yellow-400" />;
      default:
        return <AlertCircle className="text-gray-400" />;
    }
  };

  const getPath = (item) => {
    switch (item.type) {
      case "url":
        return `/scan/${item.id}`;
      case "ids":
        return `/ids/${item.id}`;
      case "file":
        return `/file/${item.id}`;
      default:
        return "#";
    }
  };

  return (
    <div className="bg-secondary-dark p-4 sm:p-6 rounded-xl border border-gray-700 shadow-lg">
      <h2 className="text-lg sm:text-xl font-semibold text-red-400 mb-4 flex items-center gap-2">
        <AlertCircle className="w-5 h-5 sm:w-6 sm:h-6 animate-pulse" />
        Live Threat Alerts
      </h2>

      {!feed || feed.length === 0 ? (
        <p className="text-gray-500">No active threats detected.</p>
      ) : (
        <div className="space-y-3 text-sm font-mono">
          {feed.map((item, i) => (
            <Link key={i} to={getPath(item)}>
              <div className="
                flex flex-col sm:flex-row gap-2 sm:gap-4
                p-3 bg-primary-dark rounded-lg border border-gray-700
                hover:bg-gray-800 transition
              ">
                <div className="flex items-center gap-2">
                  {getIcon(item.level)}
                  <span className="text-gray-400">[{item.time}]</span>
                </div>

                <div className="flex flex-wrap gap-2 text-sm">
                  <span className={`font-bold text-${item.color}`}>
                    {item.level}
                  </span>
                  <span className="text-gray-300 break-all">
                    {item.message} — <b>{item.detail}</b>
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

// ------------------------------------------------------------
// RECENT ACTIVITY (Responsive)
// ------------------------------------------------------------
const RecentActivityList = ({ activities }) => (
  <div className="bg-secondary-dark p-4 sm:p-6 rounded-xl border border-gray-700 shadow-lg">
    <h2 className="text-lg sm:text-xl font-semibold text-cyan-400 mb-4 flex items-center gap-2">
      <Clock className="w-5 h-5 sm:w-6 sm:h-6" />
      Recent Security Activity
    </h2>

    {!activities || activities.length === 0 ? (
      <p className="text-gray-500">No recent activity.</p>
    ) : (
      <ul className="space-y-3">
        {activities.map((item, i) => (
          <li
            key={i}
            className="p-3 bg-primary-dark rounded-lg border border-gray-700 text-gray-300 text-sm break-words"
          >
            {item}
          </li>
        ))}
      </ul>
    )}
  </div>
);

export default Dashboard;
