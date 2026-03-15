// frontend/src/components/charts/PieChart.jsx
import React from "react";
import {
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from "recharts";

/**
 * COLOR RULES
 * - Safe / Clean  → BLUE
 * - Threat        → RED
 * - Others        → YELLOW
 */
const getColorByLabel = (name) => {
  const label = name.toLowerCase();

  if (label.includes("threat") || label.includes("malicious")) {
    return "#FF4D4D"; // 🔴 Threat
  }
  if (
    label.includes("safe") ||
    label.includes("clean") ||
    label.includes("benign")
  ) {
    return "#00F0FF"; // 🔵 Safe
  }
  return "#FFC400"; // 🟡 Other
};

// ------------------------------
// CUSTOM TOOLTIP
// ------------------------------
const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const data = payload[0];

    return (
      <div
        className="p-2 border rounded-lg shadow-lg"
        style={{
          backgroundColor: "#1A1C20",
          borderColor: data.fill,
          color: "#FFF",
        }}
      >
        <p className="font-semibold text-sm">{data.name}</p>
        <p className="text-xs text-gray-300">
          Count: {data.value.toLocaleString()}
        </p>
       
      </div>
    );
  }
  return null;
};

// ------------------------------
// CUSTOM LABEL (⬆ moved up)
// ------------------------------
const renderLabel = ({
  cx,
  cy,
  midAngle,
  outerRadius,
  percent,
  name,
}) => {
  const RADIAN = Math.PI / 190;

  // Pull label closer & slightly upward
  const radius = outerRadius + 12;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN) - 6; // ⬆ UP

  return (
    <text
      x={x}
      y={y}
      fill="#E5E7EB"
      textAnchor={x > cx ? "start" : "end"}
      dominantBaseline="central"
      fontSize={11.5}
      fontWeight={500}
      style={{ textShadow: "1px 1px 2px #000" }}
    >
      {`${name}: ${(percent * 100).toFixed(0)}%`}
    </text>
  );
};

// ------------------------------
// PIE CHART
// ------------------------------
const PieChart = ({
  data,
  dataKey,
  nameKey,
  title,
  height = 350,
  radius = 100,
  innerRadius = 45,
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
      style={{ height: `${height}px` }}
    >
      <h3 className="text-base font-semibold text-white mb-3">{title}</h3>

      <ResponsiveContainer width="100%" height="80%">
        <RechartsPieChart>
          <Pie
            data={data}
            dataKey={dataKey}
            nameKey={nameKey}
            cx="57%"
            cy="50%"
            outerRadius={radius}
            innerRadius={innerRadius}
            labelLine={false}
            label={renderLabel}      // ✅ custom label
            isAnimationActive
            style={{
              filter: "drop-shadow(0px 4px 8px rgba(0,0,0,0.4))",
            }}
          >
            {data.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={getColorByLabel(entry[nameKey])}
              />
            ))}
          </Pie>

          <Tooltip content={<CustomTooltip />} />

          <Legend
            verticalAlign="bottom"
            align="center"
            wrapperStyle={{
              paddingTop: 10,
              color: "#9CA3AF",
              fontSize: 13,
            }}
          />
        </RechartsPieChart>
      </ResponsiveContainer>
    </div>
  );
};

export default PieChart;
