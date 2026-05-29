import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid } from "recharts";
import { fmt, pct } from "../utils/format.js";

const PALETTE = [
  "#00e5ff","#0099ff","#7c3aed","#ff4757","#ffa502","#2ed573",
  "#ffd700","#ff6b81","#a29bfe","#74b9ff","#55efc4","#fd79a8",
];

const riskBg = { low: "rgba(46,213,115,0.1)", medium: "rgba(255,165,2,0.1)", high: "rgba(255,71,87,0.1)" };
const riskColor = { low: "#2ed573", medium: "#ffa502", high: "#ff4757" };

export default function CategoryBreakdown({ categories, chartData }) {
  const pieData = (chartData?.categoryPie?.labels || []).map((label, i) => ({
    name: label,
    value: chartData.categoryPie.values[i] || 0,
  })).filter((d) => d.value > 0);

  const barData = categories.slice(0, 8).map((c) => ({
    name: c.category?.length > 12 ? c.category.slice(0, 12) + "…" : c.category,
    amount: c.amount || 0,
  }));

  return (
    <div style={{
      padding: 24, borderRadius: "var(--radius-lg)",
      background: "var(--surface)", border: "1px solid var(--border)",
    }}>
      <h3 style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 17, marginBottom: 24 }}>
        📂 Spending by Category
      </h3>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 32, marginBottom: 28 }}>
        {/* Pie */}
        <div>
          <p style={{ fontSize: 12, color: "var(--text3)", marginBottom: 12, textAlign: "center" }}>Distribution</p>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={pieData} cx="50%" cy="50%" outerRadius={90} dataKey="value"
                stroke="none" paddingAngle={2}>
                {pieData.map((_, i) => (
                  <Cell key={i} fill={PALETTE[i % PALETTE.length]} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{ background: "var(--surface2)", border: "1px solid var(--border)", borderRadius: 8, fontSize: 12 }}
                formatter={(v) => [fmt(v), ""]}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Bar */}
        <div>
          <p style={{ fontSize: 12, color: "var(--text3)", marginBottom: 12, textAlign: "center" }}>Top Categories</p>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={barData} layout="vertical" margin={{ left: 0, right: 16 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" horizontal={false} />
              <XAxis type="number" tick={{ fontSize: 10, fill: "var(--text3)" }} tickFormatter={(v) => `₹${(v/1000).toFixed(0)}k`} />
              <YAxis type="category" dataKey="name" tick={{ fontSize: 10, fill: "var(--text2)" }} width={80} />
              <Tooltip
                contentStyle={{ background: "var(--surface2)", border: "1px solid var(--border)", borderRadius: 8, fontSize: 12 }}
                formatter={(v) => [fmt(v), "Spend"]}
              />
              <Bar dataKey="amount" radius={[0, 4, 4, 0]}>
                {barData.map((_, i) => <Cell key={i} fill={PALETTE[i % PALETTE.length]} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Category table */}
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {categories.map((c, i) => (
          <div key={i} style={{
            display: "grid",
            gridTemplateColumns: "1fr auto auto auto",
            gap: 12, alignItems: "center",
            padding: "10px 14px", borderRadius: 8,
            background: "var(--bg3)", border: "1px solid var(--border)",
          }}>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{
                  width: 10, height: 10, borderRadius: "50%", flexShrink: 0,
                  background: PALETTE[i % PALETTE.length],
                }} />
                <span style={{ fontSize: 14, fontWeight: 500 }}>{c.category}</span>
                {c.monthlyTrend === "increasing" && (
                  <span style={{ fontSize: 10, color: "var(--danger)" }}>↑</span>
                )}
                {c.monthlyTrend === "decreasing" && (
                  <span style={{ fontSize: 10, color: "var(--success)" }}>↓</span>
                )}
              </div>
              {c.behavioralIntent && (
                <div style={{ fontSize: 11, color: "var(--text3)", marginLeft: 18, marginTop: 2 }}>
                  {c.behavioralIntent}
                </div>
              )}
            </div>
            <span style={{ fontSize: 12, color: "var(--text3)" }}>{c.transactionCount} txns</span>
            <span style={{
              fontSize: 11, padding: "2px 8px", borderRadius: 4,
              background: riskBg[c.riskLevel] || "var(--surface2)",
              color: riskColor[c.riskLevel] || "var(--text3)",
            }}>{c.riskLevel}</span>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontFamily: "var(--font-mono)", fontSize: 14, fontWeight: 600 }}>{fmt(c.amount)}</div>
              <div style={{ fontSize: 11, color: "var(--text3)" }}>{pct(c.percentage)}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
