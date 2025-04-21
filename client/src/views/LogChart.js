import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const LogChart = ({ logs }) => {
  // Format logs to count visits per day
  const dailyVisits = logs.reduce((acc, log) => {
    const date = new Date(log.visitDate).toLocaleDateString(); // e.g., "4/19/2025"
    acc[date] = (acc[date] || 0) + 1;
    return acc;
  }, {});

  // Convert dailyVisits to an array for Recharts
  const chartData = Object.keys(dailyVisits).map(date => ({
    date,
    visits: dailyVisits[date],
  }));

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={chartData}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="date" />
        <YAxis />
        <Tooltip />
        <Legend />
        <Bar dataKey="visits" fill="#8884d8" />
      </BarChart>
    </ResponsiveContainer>
  );
};

export default LogChart;
