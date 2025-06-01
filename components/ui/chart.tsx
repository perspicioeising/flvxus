"use client";

import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

interface ChartProps {
  data: any[];
}

export function Chart({ data }: ChartProps) {
  return (
    <ResponsiveContainer width="100%" height={350}>
      <LineChart data={data}>
        <XAxis
          dataKey="date"
          stroke="#888888"
          fontSize={12}
          tickLine={false}
          axisLine={false}
        />
        <YAxis
          stroke="#888888"
          fontSize={12}
          tickLine={false}
          axisLine={false}
          tickFormatter={(value) => `${value}`}
        />
        <Tooltip />
        <Line
          type="monotone"
          dataKey="weight"
          stroke="#10b981"
          strokeWidth={2}
          name="Weight (kg)"
        />
        <Line
          type="monotone"
          dataKey="bodyFat"
          stroke="#f43f5e"
          strokeWidth={2}
          name="Body Fat (%)"
        />
        <Line
          type="monotone"
          dataKey="leanMass"
          stroke="#3b82f6"
          strokeWidth={2}
          name="Lean Mass (kg)"
        />
        <Line
          type="monotone"
          dataKey="fatMass"
          stroke="#eab308"
          strokeWidth={2}
          name="Fat Mass (kg)"
        />
      </LineChart>
    </ResponsiveContainer>
  );
}