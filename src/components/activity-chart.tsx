'use client';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';
export default function ActivityChart({ data }: { data: { day: string; views: number }[] }) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={data}>
        <defs>
          <linearGradient id="chartColor" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#e89763" stopOpacity={0.22} />
            <stop offset="100%" stopColor="#e89763" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid stroke="#242931" vertical={false} />
        <XAxis dataKey="day" stroke="#879099" fontSize={11} tickLine={false} axisLine={false} />
        <YAxis
          stroke="#879099"
          fontSize={11}
          tickLine={false}
          axisLine={false}
          allowDecimals={false}
        />
        <Tooltip
          contentStyle={{
            background: '#171c22',
            border: '1px solid #343a42',
            borderRadius: 8,
            color: '#edece8',
          }}
        />
        <Area
          isAnimationActive={false}
          type="monotone"
          dataKey="views"
          stroke="#e89763"
          strokeWidth={2}
          fill="url(#chartColor)"
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
