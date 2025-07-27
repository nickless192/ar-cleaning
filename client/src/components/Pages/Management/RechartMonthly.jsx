// RechartMonthly.jsx
import React from 'react';
import { ResponsiveContainer, ComposedChart, XAxis, YAxis, Tooltip, Legend, Bar, Line } from 'recharts';

const monthNames = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

export default function RechartMonthly({ data }) {
  const chartData = data.map(d => ({
    name: monthNames[d.month - 1],
    recognized: d.recognized,
    projected: d.projected,
    expenses: d.expenses,
    net: d.net,
  }));

  return (
    <ResponsiveContainer width="100%" height={350}>
      <ComposedChart data={chartData}>
        <XAxis dataKey="name" />
        <YAxis />
        <Tooltip />
        <Legend />
        <Bar dataKey="recognized" stackId="a" />
        <Bar dataKey="projected"  stackId="a" />
        <Bar dataKey="expenses" />
        <Line dataKey="net" strokeWidth={2} />
      </ComposedChart>
    </ResponsiveContainer>
  );
}
