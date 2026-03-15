// frontend/src/components/charts/BarChart.jsx
import React from "react";
import {
  BarChart as RechartsBarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    const data = payload[0];
    return (
      <div
        className="p-3 border rounded-lg shadow-xl"
        style={{
          backgroundColor: "#0F1115",
          borderColor: "#FF4D4D",
          color: "#FFF",
        }}
      >
        <p className="font-bold text-sm text-gray-300">{label}</p>
        <p className="text-lg text-white mt-1">
          {`${data.name}: ${data.value}`}
        </p>
      </div>
    );
  }
  return null;
};

const BarChart = ({
  data,
  dataKey,
  title,
  barColor = "#00F0FF",
  height = 350,
  barSize = 45,
  labelFontSize = 14,
  is3D = true,
}) => {
  if (!data || data.length === 0) {
    return (
      <div className="w-full h-64 bg-secondary-dark flex items-center justify-center rounded-lg border border-gray-700">
        <p className="text-gray-500">No data available for {title}</p>
      </div>
    );
  }

  return (
    <div
      className="bg-secondary-dark p-4 rounded-lg shadow-lg border border-gray-700"
      style={{ height }}
    >
      <h3 className="text-lg font-semibold text-white mb-4">{title}</h3>

      <ResponsiveContainer width="100%" height="80%">
        <RechartsBarChart
          data={data}
          margin={{ top: 20, right: 30, left: 10, bottom: 15 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#4B5563" />

          <XAxis
            dataKey={dataKey}
            stroke="#9CA3AF"
            tick={{ fontSize: labelFontSize }}
            interval={0}
          />

          <YAxis stroke="#9CA3AF" tick={{ fontSize: labelFontSize }} />

          <Tooltip content={<CustomTooltip />} />

          <Bar
            dataKey="value"
            fill={barColor}
            barSize={barSize}
            radius={[10, 10, 0, 0]}
            style={{
              filter: is3D
                ? "drop-shadow(0px 3px 4px rgba(0, 0, 0, 0.35))"
                : "",
            }}
          />
        </RechartsBarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default BarChart;
