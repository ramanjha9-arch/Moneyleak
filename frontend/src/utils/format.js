export const fmt = (n) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(n || 0);

export const fmtNum = (n) =>
  new Intl.NumberFormat("en-IN").format(n || 0);

export const pct = (n) => `${(n || 0).toFixed(1)}%`;

export const scoreColor = (score) => {
  if (score >= 75) return "#ff4757";
  if (score >= 50) return "#ffa502";
  if (score >= 25) return "#ffd700";
  return "#2ed573";
};

export const severityColor = (sev) => {
  const map = { critical: "#ff4757", high: "#ff6b81", warning: "#ffa502", medium: "#ffa502", low: "#ffd700", info: "#00e5ff" };
  return map[sev] || "#8fa8c0";
};

export const getRiskLabel = (score) => {
  if (score >= 80) return { label: "Critical", color: "#ff4757" };
  if (score >= 60) return { label: "High Risk", color: "#ff6b81" };
  if (score >= 40) return { label: "Moderate", color: "#ffa502" };
  if (score >= 20) return { label: "Stable", color: "#ffd700" };
  return { label: "Excellent", color: "#2ed573" };
};
