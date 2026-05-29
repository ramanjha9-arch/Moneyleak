import { scoreColor } from "../utils/format.js";

const SCORE_DEFS = [
  { key: "moneyLeakScore",           label: "Money Leak",         desc: "Higher = more leaks",   invert: true },
  { key: "financialDisciplineScore", label: "Discipline",          desc: "Higher = better",       invert: false },
  { key: "lifestyleRiskScore",       label: "Lifestyle Risk",      desc: "Higher = riskier",      invert: true },
  { key: "debtDependencyScore",      label: "Debt Dependency",     desc: "Higher = more debt",    invert: true },
  { key: "savingsEfficiencyScore",   label: "Savings Efficiency",  desc: "Higher = better",       invert: false },
  { key: "cashFlowHealthScore",      label: "Cash Flow",           desc: "Higher = healthier",    invert: false },
  { key: "financialStressProbability", label: "Stress Risk",       desc: "Probability of stress", invert: true },
  { key: "emergencyPreparednessScore", label: "Emergency Ready",   desc: "Higher = safer",        invert: false },
];

function CircleScore({ value = 0, label, desc, invert }) {
  const display = Math.round(Math.min(100, Math.max(0, value)));
  const color = invert ? scoreColor(display) : scoreColor(100 - display);
  const r = 28;
  const circ = 2 * Math.PI * r;
  const offset = circ - (display / 100) * circ;

  return (
    <div style={{
      display: "flex", flexDirection: "column", alignItems: "center", gap: 8,
      padding: "16px 12px", borderRadius: 12,
      background: "var(--surface)", border: "1px solid var(--border)",
      transition: "all 0.2s",
    }}>
      <svg width={72} height={72} viewBox="0 0 72 72">
        <circle cx={36} cy={36} r={r} fill="none" stroke="var(--border)" strokeWidth={5} />
        <circle
          cx={36} cy={36} r={r} fill="none"
          stroke={color} strokeWidth={5}
          strokeDasharray={circ}
          strokeDashoffset={offset}
          strokeLinecap="round"
          transform="rotate(-90 36 36)"
          style={{ transition: "stroke-dashoffset 1s ease, stroke 0.5s ease" }}
        />
        <text x={36} y={40} textAnchor="middle" fill={color}
          fontSize="15" fontWeight="700" fontFamily="var(--font-display)">
          {display}
        </text>
      </svg>
      <div style={{ textAlign: "center" }}>
        <div style={{ fontSize: 12, fontWeight: 600, color: "var(--text)" }}>{label}</div>
        <div style={{ fontSize: 10, color: "var(--text3)", marginTop: 2 }}>{desc}</div>
      </div>
    </div>
  );
}

export default function ScoreCard({ scores }) {
  return (
    <div style={{
      padding: 24, borderRadius: "var(--radius-lg)",
      background: "var(--bg2)", border: "1px solid var(--border)",
    }}>
      <h3 style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 17, marginBottom: 20 }}>
        📊 Financial Health Scores
      </h3>
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(120px, 1fr))",
        gap: 12,
      }}>
        {SCORE_DEFS.map((s) => (
          <CircleScore
            key={s.key}
            value={scores[s.key]}
            label={s.label}
            desc={s.desc}
            invert={s.invert}
          />
        ))}
      </div>
    </div>
  );
}
