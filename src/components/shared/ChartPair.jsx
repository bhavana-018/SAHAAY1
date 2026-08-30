import { LineChart, Line, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from "recharts";

export function TrendChart({ data, xKey, lines, height = 220 }) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <LineChart data={data} margin={{ top: 8, right: 12, left: -18, bottom: 0 }}>
        <CartesianGrid stroke="#EFE7D4" vertical={false} />
        <XAxis dataKey={xKey} tick={{ fontSize: 11, fill: "#2A3F3B" }} axisLine={{ stroke: "#EFE7D4" }} tickLine={false} />
        <YAxis tick={{ fontSize: 11, fill: "#2A3F3B" }} axisLine={false} tickLine={false} />
        <Tooltip contentStyle={{ borderRadius: 10, border: "1px solid #CFE6DD", fontSize: 12 }} />
        {lines.length > 1 && <Legend wrapperStyle={{ fontSize: 12 }} />}
        {lines.map((l) => (
          <Line key={l.key} type="monotone" dataKey={l.key} name={l.name} stroke={l.color} strokeWidth={2.5} dot={{ r: 3 }} />
        ))}
      </LineChart>
    </ResponsiveContainer>
  );
}

export function CompareBarChart({ data, xKey, bars, height = 220 }) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={data} margin={{ top: 8, right: 12, left: -18, bottom: 0 }}>
        <CartesianGrid stroke="#EFE7D4" vertical={false} />
        <XAxis dataKey={xKey} tick={{ fontSize: 11, fill: "#2A3F3B" }} axisLine={{ stroke: "#EFE7D4" }} tickLine={false} />
        <YAxis tick={{ fontSize: 11, fill: "#2A3F3B" }} axisLine={false} tickLine={false} />
        <Tooltip contentStyle={{ borderRadius: 10, border: "1px solid #CFE6DD", fontSize: 12 }} />
        {bars.length > 1 && <Legend wrapperStyle={{ fontSize: 12 }} />}
        {bars.map((b) => (
          <Bar key={b.key} dataKey={b.key} name={b.name} fill={b.color} radius={[5, 5, 0, 0]} />
        ))}
      </BarChart>
    </ResponsiveContainer>
  );
}

export default function ChartPair({ title, trendData, xKey, lines, barData, bars }) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <div className="rounded-xl2 border border-teal-100 bg-white p-4 shadow-card">
        <p className="text-sm font-semibold text-ink mb-1">{title?.trend || "Trend"}</p>
        <TrendChart data={trendData} xKey={xKey} lines={lines} />
      </div>
      <div className="rounded-xl2 border border-teal-100 bg-white p-4 shadow-card">
        <p className="text-sm font-semibold text-ink mb-1">{title?.compare || "Comparison"}</p>
        <CompareBarChart data={barData} xKey={xKey} bars={bars} />
      </div>
    </div>
  );
}
