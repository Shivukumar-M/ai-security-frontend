// frontend/src/components/charts/LineChart.jsx
import React from 'react';
import {
  LineChart as RechartsLineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';

const LineChart = ({
  data,
  dataKeyX,
  dataKeyY,
  title,
  lineColor = '#00F0FF',
  height = 350,
  strokeWidth = 3
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
      className="bg-secondary-dark p-4 rounded-lg shadow-lg"
      style={{ height: `${height}px` }}
    >
      <h3 className="text-lg font-semibold text-white mb-4">{title}</h3>

      <ResponsiveContainer width="100%" height="80%">
        <RechartsLineChart
          data={data}
          margin={{ top: 5, right: 20, left: 0, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#4B5563" />

          <XAxis
            dataKey={dataKeyX}
            stroke="#9CA3AF"
            tick={{ fontSize: 13 }}
          />
          <YAxis
            stroke="#9CA3AF"
            tick={{ fontSize: 13 }}
          />

          <Tooltip
            contentStyle={{
              backgroundColor: '#1A1C20',
              border: '1px solid #00F0FF',
              color: '#FFF'
            }}
          />

          <Legend wrapperStyle={{ paddingTop: '10px' }} />

          <Line
            type="monotone"
            dataKey={dataKeyY}
            stroke={lineColor}
            strokeWidth={strokeWidth}
            dot={{ r: 4 }}
            activeDot={{ r: 8 }}
            style={{
              filter: `drop-shadow(0px 0px 6px ${lineColor})`
            }}
          />
        </RechartsLineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default LineChart;
