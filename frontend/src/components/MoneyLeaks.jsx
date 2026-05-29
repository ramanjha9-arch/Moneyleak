import { fmt } from "../utils/format.js";

const sevStyle = {
  critical: { bg: "rgba(255,71,87,0.1)", border: "rgba(255,71,87,0.3)", color: "#ff4757", icon: "🔴" },
  high:     { bg: "rgba(255,107,129,0.1)", border: "rgba(255,107,129,0.3)", color: "#ff6b81", icon: "🟠" },
  medium:   { bg: "rgba(255,165,2,0.08)", border: "rgba(255,165,2,0.3)", color: "#ffa502", icon: "🟡" },
  low:      { bg: "rgba(255,215,0,0.06)", border: "rgba(255,215,0,0.2)", color: "#ffd700", icon: "🟢" },
};

export default function MoneyLeaks({ leaks, chartData }) {
  const totalAnnual = leaks.reduce((s, l) => s + (l.annualizedLoss || 0), 0);
  const totalMonthly = leaks.reduce((s, l) => s + (l.amount || 0), 0);

  const sorted = [...leaks].sort((a, b) => {
    const order = { critical: 0, high: 1, medium: 2, low: 3 };
    return (order[a.severity] ?? 4) - (order[b.severity] ?? 4);
  });

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      {/* Impact banner */}
      <div style={{
        padding: "20px 24px", borderRadius: 12,
        background: "linear-gradient(135deg, rgba(255,71,87,0.12), rgba(255,71,87,0.04))",
        border: "1px solid rgba(255,71,87,0.25)",
      }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 20 }}>
          <div>
            <p style={{ fontSize: 11, color: "var(--text3)", textTransform: "uppercase", letterSpacing: "0.08em" }}>Leaks Found</p>
            <p style={{ fontFamily: "var(--font-display)", fontSize: 32, fontWeight: 800, color: "#ff4757" }}>{leaks.length}</p>
          </div>
          <div>
            <p style={{ fontSize: 11, color: "var(--text3)", textTransform: "uppercase", letterSpacing: "0.08em" }}>Monthly Loss</p>
            <p style={{ fontFamily: "var(--font-display)", fontSize: 28, fontWeight: 800, color: "#ff6b81" }}>{fmt(totalMonthly)}</p>
          </div>
          <div>
            <p style={{ fontSize: 11, color: "var(--text3)", textTransform: "uppercase", letterSpacing: "0.08em" }}>Annual Loss</p>
            <p style={{ fontFamily: "var(--font-display)", fontSize: 28, fontWeight: 800, color: "#ffa502" }}>{fmt(totalAnnual)}</p>
          </div>
        </div>
      </div>

      {/* Leak cards */}
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {sorted.length === 0 && (
          <div style={{
            padding: 40, textAlign: "center", borderRadius: 12,
            background: "var(--surface)", border: "1px solid var(--border)",
            color: "var(--text3)",
          }}>
            No significant leaks detected 🎉
          </div>
        )}
        {sorted.map((leak, i) => {
          const s = sevStyle[leak.severity] || sevStyle.low;
          return (
            <div key={i} style={{
              padding: "18px 20px", borderRadius: 12,
              background: s.bg, border: `1px solid ${s.border}`,
            }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
                <div style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                  <span style={{ fontSize: 20, flexShrink: 0 }}>{s.icon}</span>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: 15, display: "flex", gap: 8, alignItems: "center" }}>
                      {leak.type}
                      <span style={{
                        fontSize: 10, padding: "2px 8px", borderRadius: 4,
                        background: s.bg, border: `1px solid ${s.border}`, color: s.color,
                        textTransform: "uppercase", letterSpacing: "0.06em",
                      }}>{leak.severity}</span>
                    </div>
                    <p style={{ fontSize: 13, color: "var(--text2)", marginTop: 4 }}>{leak.description}</p>
                  </div>
                </div>
                <div style={{ textAlign: "right", flexShrink: 0 }}>
                  <div style={{ fontFamily: "var(--font-mono)", fontSize: 16, fontWeight: 700, color: s.color }}>
                    {fmt(leak.amount)}/mo
                  </div>
                  <div style={{ fontSize: 11, color: "var(--text3)" }}>
                    {fmt(leak.annualizedLoss)}/yr
                  </div>
                </div>
              </div>
              {leak.recommendation && (
                <div style={{
                  padding: "8px 12px", borderRadius: 6,
                  background: "rgba(0,0,0,0.2)",
                  fontSize: 12, color: "var(--text2)",
                  display: "flex", gap: 6, alignItems: "flex-start",
                }}>
                  <span style={{ flexShrink: 0 }}>💡</span>
                  {leak.recommendation}
                </div>
              )}
              {leak.fixable && (
                <div style={{ marginTop: 8 }}>
                  <span style={{
                    fontSize: 11, padding: "2px 8px", borderRadius: 4,
                    background: "rgba(46,213,115,0.1)", color: "var(--success)",
                    border: "1px solid rgba(46,213,115,0.2)",
                  }}>✓ Fixable</span>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
