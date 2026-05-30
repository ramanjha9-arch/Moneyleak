export default function Header({ onReset, showReset, modelUsed }) {
  return (
    <header style={{
      position: "sticky", top: 0, zIndex: 100,
      background: "rgba(10,14,26,0.88)",
      backdropFilter: "blur(20px)",
      borderBottom: "1px solid var(--border)",
      padding: "0 24px",
      height: 64,
      display: "flex", alignItems: "center", justifyContent: "space-between",
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <div style={{
          width: 38, height: 38, borderRadius: 10,
          background: "linear-gradient(135deg, var(--accent2), var(--accent3))",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 17, fontWeight: 700, color: "#fff",
          boxShadow: "0 0 20px rgba(129,140,248,0.4)",
        }}>₹</div>
        <div>
          <div style={{
            fontFamily: "var(--font-display)", fontWeight: 800,
            fontSize: 16, letterSpacing: "-0.02em",
            background: "linear-gradient(90deg, var(--text), var(--accent))",
            WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
          }}>MoneyLeak</div>
          <div style={{ fontSize: 10, color: "var(--text3)", letterSpacing: "0.1em", textTransform: "uppercase" }}>
            Intelligence Engine v2
          </div>
        </div>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <div style={{
          display: "flex", alignItems: "center", gap: 6,
          padding: "4px 12px", borderRadius: 20,
          background: "var(--surface)", border: "1px solid var(--border)",
          fontSize: 11, color: "var(--success)",
        }}>
          <span style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--success)", display: "inline-block", animation: "pulse 2s ease infinite" }} />
          {modelUsed || "Gemini 1.5 Flash"}
        </div>
        {showReset && (
          <button onClick={onReset} style={{
            padding: "6px 18px", borderRadius: 8,
            background: "var(--surface)", border: "1px solid var(--border)",
            color: "var(--text2)", fontSize: 13, cursor: "pointer",
            transition: "all 0.2s",
          }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = "var(--accent)"; e.currentTarget.style.color = "var(--accent)"; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = "var(--border)"; e.currentTarget.style.color = "var(--text2)"; }}
          >
            + New Analysis
          </button>
        )}
      </div>
    </header>
  );
}
