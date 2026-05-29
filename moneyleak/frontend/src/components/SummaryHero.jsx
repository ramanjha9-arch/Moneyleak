import { fmt, pct, getRiskLabel } from "../utils/format.js";

export default function SummaryHero({ summary, scores, personalityProfile, emotionalInsight, leakCount, criticalAlerts }) {
  const leakRisk = getRiskLabel(scores.moneyLeakScore || 0);
  const discipline = getRiskLabel(100 - (scores.financialDisciplineScore || 50));

  return (
    <div style={{ marginBottom: 40 }}>
      {/* Emotional insight banner */}
      {emotionalInsight && (
        <div style={{
          padding: "14px 20px", borderRadius: 10, marginBottom: 24,
          background: "linear-gradient(135deg, rgba(124,58,237,0.12), rgba(0,229,255,0.06))",
          border: "1px solid rgba(124,58,237,0.25)",
          display: "flex", gap: 12, alignItems: "flex-start",
        }}>
          <span style={{ fontSize: 20, flexShrink: 0 }}>💡</span>
          <p style={{ fontSize: 14, color: "var(--text)", lineHeight: 1.6, fontStyle: "italic" }}>
            {emotionalInsight}
          </p>
        </div>
      )}

      {/* Top-level numbers */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 16, marginBottom: 24 }}>
        <MetricTile
          label="Total Income"
          value={fmt(summary.totalIncome)}
          icon="💰" color="var(--success)"
        />
        <MetricTile
          label="Total Expenses"
          value={fmt(summary.totalExpenses)}
          icon="💸" color="var(--danger)"
        />
        <MetricTile
          label="Net Savings"
          value={fmt(summary.netSavings)}
          sub={`${pct(summary.savingsRate)} rate`}
          icon="🏦"
          color={summary.netSavings >= 0 ? "var(--success)" : "var(--danger)"}
        />
        <MetricTile
          label="Transactions"
          value={summary.transactionCount || "—"}
          icon="📊" color="var(--accent)"
        />
      </div>

      {/* Personality + alerts row */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        {personalityProfile?.archetype && (
          <div style={{
            padding: "18px 20px", borderRadius: 12,
            background: "linear-gradient(135deg, rgba(124,58,237,0.1), var(--surface))",
            border: "1px solid rgba(124,58,237,0.2)",
          }}>
            <p style={{ fontSize: 11, color: "var(--text3)", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 6 }}>
              Financial Personality
            </p>
            <p style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 16, color: "#c084fc", marginBottom: 6 }}>
              {personalityProfile.archetype}
            </p>
            <p style={{ fontSize: 13, color: "var(--text2)" }}>{personalityProfile.description}</p>
          </div>
        )}
        <div style={{
          padding: "18px 20px", borderRadius: 12,
          background: "var(--surface)", border: "1px solid var(--border)",
          display: "flex", flexDirection: "column", gap: 10,
        }}>
          <p style={{ fontSize: 11, color: "var(--text3)", letterSpacing: "0.08em", textTransform: "uppercase" }}>
            Alert Summary
          </p>
          <div style={{ display: "flex", gap: 12 }}>
            <AlertChip count={leakCount} label="Leaks" color="var(--danger)" />
            <AlertChip count={criticalAlerts} label="Critical" color="var(--warning)" />
            <AlertChip count={summary.transactionCount || 0} label="Txns" color="var(--accent)" />
          </div>
          <p style={{ fontSize: 12, color: "var(--text3)" }}>Data quality: {summary.dataQuality || "—"}</p>
        </div>
      </div>
    </div>
  );
}

function MetricTile({ label, value, sub, icon, color }) {
  return (
    <div style={{
      padding: "18px 20px", borderRadius: 12,
      background: "var(--surface)", border: "1px solid var(--border)",
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <span style={{ fontSize: 11, color: "var(--text3)", textTransform: "uppercase", letterSpacing: "0.08em" }}>{label}</span>
        <span style={{ fontSize: 18 }}>{icon}</span>
      </div>
      <div style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 22, color, marginTop: 8 }}>
        {value}
      </div>
      {sub && <div style={{ fontSize: 12, color: "var(--text3)", marginTop: 4 }}>{sub}</div>}
    </div>
  );
}

function AlertChip({ count, label, color }) {
  return (
    <div style={{
      display: "flex", flexDirection: "column", alignItems: "center",
      padding: "8px 14px", borderRadius: 8,
      background: "var(--bg3)", border: `1px solid ${color}22`,
    }}>
      <span style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 20, color }}>{count}</span>
      <span style={{ fontSize: 11, color: "var(--text3)" }}>{label}</span>
    </div>
  );
}
