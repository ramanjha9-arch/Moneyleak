import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine, CartesianGrid } from "recharts";
import { fmt, scoreColor } from "../utils/format.js";

function buildProjectionData(summary, projection) {
  const monthly = (summary.netSavings || 0);
  const points = [];
  for (let m = 0; m <= 12; m++) {
    points.push({
      month: m === 0 ? "Now" : `M${m}`,
      savings: Math.max(0, monthly * m),
      projected: Math.max(0, (projection.projectedSavingsIn6Months || monthly * 6) * (m / 6)),
    });
  }
  return points;
}

export default function FinancialProjection({ projection, summary, scores }) {
  const projData = buildProjectionData(summary, projection);
  const debtRiskColor = { low: "#2ed573", medium: "#ffa502", high: "#ff4757" };
  const drColor = debtRiskColor[projection.debtTrapRisk] || "#8fa8c0";

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>

      {/* Key projection metrics */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 14 }}>
        {[
          { label: "Current Trajectory", value: projection.currentTrajectory || "—", color: "var(--text)", icon: "📈" },
          { label: "Projected 6M Savings", value: fmt(projection.projectedSavingsIn6Months), color: "var(--success)", icon: "🏦" },
          { label: "Monthly Burn Rate", value: fmt(projection.burnRateMonthly), color: "var(--danger)", icon: "🔥" },
          { label: "Debt Trap Risk", value: projection.debtTrapRisk?.toUpperCase() || "—", color: drColor, icon: "⚠️" },
          { label: "Lifestyle Inflation", value: projection.lifestyleInflationIndex != null ? `${projection.lifestyleInflationIndex}%` : "—", color: "var(--warning)", icon: "📊" },
          { label: "Savings Risk", value: projection.savingsExhaustionRisk || "—", color: "var(--text2)", icon: "⏳" },
        ].map((item) => (
          <div key={item.label} style={{
            padding: "16px 18px", borderRadius: 10,
            background: "var(--surface)", border: "1px solid var(--border)",
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
              <span style={{ fontSize: 11, color: "var(--text3)", textTransform: "uppercase", letterSpacing: "0.06em" }}>{item.label}</span>
              <span style={{ fontSize: 16 }}>{item.icon}</span>
            </div>
            <div style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 17, color: item.color, lineHeight: 1.3 }}>
              {item.value}
            </div>
          </div>
        ))}
      </div>

      {/* Projection chart */}
      <div style={{
        padding: 24, borderRadius: "var(--radius-lg)",
        background: "var(--surface)", border: "1px solid var(--border)",
      }}>
        <h3 style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 17, marginBottom: 20 }}>
          🔮 12-Month Savings Projection
        </h3>
        <ResponsiveContainer width="100%" height={220}>
          <LineChart data={projData}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
            <XAxis dataKey="month" tick={{ fontSize: 11, fill: "var(--text3)" }} />
            <YAxis tick={{ fontSize: 11, fill: "var(--text3)" }} tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`} />
            <Tooltip
              contentStyle={{ background: "var(--surface2)", border: "1px solid var(--border)", borderRadius: 8, fontSize: 12 }}
              formatter={(v) => [fmt(v), ""]}
            />
            <Line type="monotone" dataKey="savings" stroke="var(--accent)" strokeWidth={2} dot={false} name="Current" />
            <Line type="monotone" dataKey="projected" stroke="var(--success)" strokeWidth={2} strokeDasharray="5 5" dot={false} name="Optimized" />
          </LineChart>
        </ResponsiveContainer>
        <div style={{ display: "flex", gap: 16, marginTop: 12, justifyContent: "center" }}>
          <Legend color="var(--accent)" label="Current Path" />
          <Legend color="var(--success)" dashed label="Optimized Path" />
        </div>
      </div>

      {/* Financial personality strengths / vulnerabilities */}
    </div>
  );
}

function Legend({ color, label, dashed }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
      <div style={{
        width: 24, height: 2,
        background: dashed ? `repeating-linear-gradient(90deg, ${color} 0, ${color} 4px, transparent 4px, transparent 8px)` : color,
      }} />
      <span style={{ fontSize: 12, color: "var(--text3)" }}>{label}</span>
    </div>
  );
}
