import { fmt } from "../utils/format.js";

const sevConfig = {
  critical: { bg: "rgba(255,71,87,0.1)", border: "rgba(255,71,87,0.35)", color: "#ff4757", icon: "🚨" },
  warning:  { bg: "rgba(255,165,2,0.08)", border: "rgba(255,165,2,0.3)", color: "#ffa502", icon: "⚠️" },
  info:     { bg: "rgba(0,229,255,0.06)", border: "rgba(0,229,255,0.2)", color: "#00e5ff", icon: "ℹ️" },
};

export default function RiskAlerts({ alerts, topTransactions }) {
  const sorted = [...alerts].sort((a, b) => {
    const order = { critical: 0, warning: 1, info: 2 };
    return (order[a.severity] ?? 3) - (order[b.severity] ?? 3);
  });

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>

      {/* Alert cards */}
      <div style={{
        padding: 24, borderRadius: "var(--radius-lg)",
        background: "var(--surface)", border: "1px solid var(--border)",
      }}>
        <h3 style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 17, marginBottom: 20 }}>
          🚨 Risk Alerts
        </h3>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {sorted.length === 0 && (
            <div style={{ textAlign: "center", padding: 30, color: "var(--success)" }}>
              ✅ No significant risk alerts detected
            </div>
          )}
          {sorted.map((alert, i) => {
            const s = sevConfig[alert.severity] || sevConfig.info;
            return (
              <div key={i} style={{
                padding: "16px 18px", borderRadius: 10,
                background: s.bg, border: `1px solid ${s.border}`,
              }}>
                <div style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                  <span style={{ fontSize: 18, flexShrink: 0 }}>{s.icon}</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                      <span style={{ fontWeight: 600, fontSize: 14, color: s.color }}>{alert.type}</span>
                      <span style={{
                        fontSize: 10, padding: "2px 8px", borderRadius: 4,
                        background: s.bg, border: `1px solid ${s.border}`,
                        color: s.color, textTransform: "uppercase", letterSpacing: "0.06em",
                      }}>{alert.severity}</span>
                    </div>
                    <p style={{ fontSize: 13, color: "var(--text2)", marginTop: 5 }}>{alert.message}</p>
                    {alert.action && (
                      <p style={{ fontSize: 12, color: s.color, marginTop: 8 }}>
                        → {alert.action}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Top / flagged transactions */}
      {topTransactions && topTransactions.length > 0 && (
        <div style={{
          padding: 24, borderRadius: "var(--radius-lg)",
          background: "var(--surface)", border: "1px solid var(--border)",
        }}>
          <h3 style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 17, marginBottom: 20 }}>
            📋 Notable Transactions
          </h3>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {topTransactions.map((tx, i) => (
              <div key={i} style={{
                display: "grid",
                gridTemplateColumns: "90px 1fr auto auto",
                gap: 12, alignItems: "center",
                padding: "10px 14px", borderRadius: 8,
                background: "var(--bg3)", border: "1px solid var(--border)",
              }}>
                <span style={{ fontSize: 12, color: "var(--text3)", fontFamily: "var(--font-mono)" }}>{tx.date}</span>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 500 }}>{tx.merchant}</div>
                  <div style={{ fontSize: 11, color: "var(--text3)" }}>{tx.category}</div>
                </div>
                {tx.flag && (
                  <span style={{
                    fontSize: 10, padding: "2px 8px", borderRadius: 4,
                    background: "rgba(255,165,2,0.1)", color: "#ffa502",
                    border: "1px solid rgba(255,165,2,0.3)",
                  }}>{tx.flag}</span>
                )}
                <span style={{ fontFamily: "var(--font-mono)", fontSize: 14, fontWeight: 600, color: "var(--danger)" }}>
                  {fmt(tx.amount)}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
