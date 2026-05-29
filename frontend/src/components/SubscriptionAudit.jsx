import { fmt } from "../utils/format.js";

const recMap = {
  keep:      { color: "#2ed573", bg: "rgba(46,213,115,0.1)",  label: "Keep",      icon: "✅" },
  cancel:    { color: "#ff4757", bg: "rgba(255,71,87,0.1)",   label: "Cancel",     icon: "❌" },
  downgrade: { color: "#ffa502", bg: "rgba(255,165,2,0.08)",  label: "Downgrade",  icon: "⬇️" },
  audit:     { color: "#00e5ff", bg: "rgba(0,229,255,0.08)",  label: "Audit",      icon: "🔍" },
};

export default function SubscriptionAudit({ subscriptions }) {
  const totalMonthly = subscriptions.reduce((s, sub) => {
    if (sub.frequency === "annual") return s + (sub.amount || 0) / 12;
    if (sub.frequency === "quarterly") return s + (sub.amount || 0) / 3;
    return s + (sub.amount || 0);
  }, 0);

  const cancellable = subscriptions.filter((s) => s.recommendation === "cancel");
  const savings = cancellable.reduce((s, sub) => {
    if (sub.frequency === "annual") return s + (sub.amount || 0) / 12;
    if (sub.frequency === "quarterly") return s + (sub.amount || 0) / 3;
    return s + (sub.amount || 0);
  }, 0);

  const grouped = subscriptions.reduce((acc, sub) => {
    const rec = sub.recommendation || "audit";
    if (!acc[rec]) acc[rec] = [];
    acc[rec].push(sub);
    return acc;
  }, {});

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: 14 }}>
        <StatBox label="Total Subscriptions" value={subscriptions.length} icon="🔄" color="var(--accent)" />
        <StatBox label="Monthly Burn" value={fmt(totalMonthly)} icon="💸" color="var(--danger)" />
        <StatBox label="Annual Cost" value={fmt(totalMonthly * 12)} icon="📅" color="var(--warning)" />
        <StatBox label="Potential Savings" value={fmt(savings) + "/mo"} icon="💡" color="var(--success)" />
      </div>

      {/* Grouped by recommendation */}
      {Object.entries(grouped).map(([rec, subs]) => {
        const style = recMap[rec] || recMap.audit;
        return (
          <div key={rec} style={{
            padding: 20, borderRadius: 12,
            background: style.bg, border: `1px solid ${style.color}33`,
          }}>
            <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 14 }}>
              <span style={{ fontSize: 18 }}>{style.icon}</span>
              <h4 style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 15, color: style.color }}>
                {style.label} ({subs.length})
              </h4>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {subs.map((sub, i) => (
                <div key={i} style={{
                  display: "flex", justifyContent: "space-between", alignItems: "center",
                  padding: "10px 14px", borderRadius: 8,
                  background: "var(--bg3)", border: "1px solid var(--border)",
                }}>
                  <div>
                    <span style={{ fontWeight: 500, fontSize: 14 }}>{sub.name}</span>
                    <span style={{ fontSize: 12, color: "var(--text3)", marginLeft: 8 }}>{sub.category}</span>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontFamily: "var(--font-mono)", fontSize: 14, fontWeight: 600 }}>
                      {fmt(sub.amount)}
                    </div>
                    <div style={{ fontSize: 11, color: "var(--text3)" }}>{sub.frequency}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      })}

      {subscriptions.length === 0 && (
        <div style={{
          padding: 40, textAlign: "center", borderRadius: 12,
          background: "var(--surface)", border: "1px solid var(--border)",
          color: "var(--text3)",
        }}>
          No recurring subscriptions detected in this statement.
        </div>
      )}
    </div>
  );
}

function StatBox({ label, value, icon, color }) {
  return (
    <div style={{
      padding: "16px 18px", borderRadius: 10,
      background: "var(--surface)", border: "1px solid var(--border)",
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
        <span style={{ fontSize: 11, color: "var(--text3)", textTransform: "uppercase", letterSpacing: "0.06em" }}>{label}</span>
        <span style={{ fontSize: 16 }}>{icon}</span>
      </div>
      <div style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 20, color }}>{value}</div>
    </div>
  );
}
