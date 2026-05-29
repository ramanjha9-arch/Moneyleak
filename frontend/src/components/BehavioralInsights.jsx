import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { fmt } from "../utils/format.js";

const TRIGGERS = {
  impulse: { icon: "⚡", color: "#ff4757" },
  dopamine: { icon: "🎯", color: "#a855f7" },
  loneliness: { icon: "💙", color: "#3b82f6" },
  boredom: { icon: "😴", color: "#6b7280" },
  stress: { icon: "😰", color: "#ef4444" },
  payday: { icon: "💸", color: "#f59e0b" },
  "social validation": { icon: "👥", color: "#ec4899" },
  convenience: { icon: "🛋️", color: "#8b5cf6" },
  festival: { icon: "🎉", color: "#f97316" },
};

function getTriggerStyle(trigger = "") {
  const key = Object.keys(TRIGGERS).find((k) => trigger.toLowerCase().includes(k));
  return TRIGGERS[key] || { icon: "🧠", color: "var(--accent)" };
}

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export default function BehavioralInsights({ insights, timeIntelligence, chartData }) {
  const weekdayData = (chartData?.weekdaySpend?.values || []).map((v, i) => ({
    day: DAYS[i] || `D${i}`,
    amount: v || 0,
  }));

  const maxDay = weekdayData.reduce((m, d) => (d.amount > m.amount ? d : m), { amount: 0 });

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>

      {/* Time Intelligence */}
      {timeIntelligence && (
        <div style={{
          padding: 24, borderRadius: "var(--radius-lg)",
          background: "var(--surface)", border: "1px solid var(--border)",
        }}>
          <h3 style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 17, marginBottom: 20 }}>
            ⏰ Time Intelligence
          </h3>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))", gap: 12, marginBottom: 24 }}>
            {[
              { label: "Peak Hour", value: timeIntelligence.peakSpendingHour != null ? `${timeIntelligence.peakSpendingHour}:00` : "—" },
              { label: "Peak Day", value: timeIntelligence.peakSpendingDay || "—" },
              { label: "Weekend Premium", value: timeIntelligence.weekendPremium ? `+${timeIntelligence.weekendPremium}%` : "—" },
              { label: "Late Night Spend", value: fmt(timeIntelligence.lateNightSpend) },
            ].map((item) => (
              <div key={item.label} style={{
                padding: "14px 16px", borderRadius: 10,
                background: "var(--bg3)", border: "1px solid var(--border)",
              }}>
                <p style={{ fontSize: 11, color: "var(--text3)", marginBottom: 4 }}>{item.label}</p>
                <p style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 18, color: "var(--accent)" }}>
                  {item.value}
                </p>
              </div>
            ))}
          </div>

          {weekdayData.length > 0 && (
            <>
              <p style={{ fontSize: 12, color: "var(--text3)", marginBottom: 12 }}>Spending by Day of Week</p>
              <ResponsiveContainer width="100%" height={160}>
                <BarChart data={weekdayData}>
                  <XAxis dataKey="day" tick={{ fontSize: 11, fill: "var(--text3)" }} />
                  <YAxis hide />
                  <Tooltip
                    contentStyle={{ background: "var(--surface2)", border: "1px solid var(--border)", borderRadius: 8, fontSize: 12 }}
                    formatter={(v) => [fmt(v), "Spend"]}
                  />
                  <Bar dataKey="amount" radius={[4, 4, 0, 0]}>
                    {weekdayData.map((d, i) => (
                      <Cell key={i} fill={d.day === maxDay.day ? "var(--accent)" : "var(--border2)"} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </>
          )}
        </div>
      )}

      {/* Behavioral insight cards */}
      <div style={{
        padding: 24, borderRadius: "var(--radius-lg)",
        background: "var(--surface)", border: "1px solid var(--border)",
      }}>
        <h3 style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 17, marginBottom: 20 }}>
          🧠 Behavioral Spending Patterns
        </h3>
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {insights.length === 0 && (
            <p style={{ color: "var(--text3)", textAlign: "center", padding: 20 }}>
              No behavioral patterns detected in this data.
            </p>
          )}
          {insights.map((insight, i) => {
            const style = getTriggerStyle(insight.emotionalTrigger);
            return (
              <div key={i} style={{
                padding: "16px 18px", borderRadius: 10,
                background: "var(--bg3)", border: "1px solid var(--border)",
                borderLeft: `3px solid ${style.color}`,
              }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
                  <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                    <span style={{ fontSize: 18 }}>{style.icon}</span>
                    <span style={{ fontWeight: 600, fontSize: 14 }}>{insight.pattern}</span>
                  </div>
                  {insight.financialImpact > 0 && (
                    <span style={{ fontFamily: "var(--font-mono)", fontSize: 13, color: "#ff6b81" }}>
                      {fmt(insight.financialImpact)}
                    </span>
                  )}
                </div>
                <p style={{ fontSize: 13, color: "var(--text2)", marginBottom: 8 }}>{insight.description}</p>
                {insight.insight && (
                  <div style={{
                    padding: "8px 12px", borderRadius: 6,
                    background: `${style.color}14`,
                    fontSize: 12, color: "var(--text)",
                    borderLeft: `2px solid ${style.color}`,
                  }}>
                    💡 {insight.insight}
                  </div>
                )}
                <div style={{ display: "flex", gap: 8, marginTop: 10, flexWrap: "wrap" }}>
                  {insight.emotionalTrigger && (
                    <Tag label={`Trigger: ${insight.emotionalTrigger}`} color={style.color} />
                  )}
                  {insight.frequency && <Tag label={insight.frequency} color="var(--text3)" />}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function Tag({ label, color }) {
  return (
    <span style={{
      padding: "3px 10px", borderRadius: 4, fontSize: 11,
      background: `${color}18`, color, border: `1px solid ${color}33`,
    }}>{label}</span>
  );
}
