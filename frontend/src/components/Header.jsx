export default function Header({ onReset, showReset }) {
  return (
    <header style={{
      position: "sticky", top: 0, zIndex: 100,
      background: "rgba(8,12,16,0.92)",
      backdropFilter: "blur(16px)",
      borderBottom: "1px solid var(--border)",
      padding: "0 24px",
      height: 64,
      display: "flex", alignItems: "center", justifyContent: "space-between",
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        {/* Logo mark */}
        <div style={{
          width: 36, height: 36, borderRadius: 8,
          background: "linear-gradient(135deg, var(--accent2), var(--accent3))",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 16, fontWeight: 700, color: "#fff",
          boxShadow: "0 0 16px rgba(0,153,255,0.3)",
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

      <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
        <div style={{
          display: "flex", alignItems: "center", gap: 6,
          padding: "4px 10px", borderRadius: 20,
          background: "var(--surface)", border: "1px solid var(--border)",
          fontSize: 11, color: "var(--success)",
        }}>
          <span style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--success)", display: "inline-block" }} />
          Gemini 2.0 Flash
        </div>
        {showReset && (
          <button onClick={onReset} style={{
            padding: "6px 16px", borderRadius: 8,
            background: "var(--surface)", border: "1px solid var(--border)",
            color: "var(--text2)", fontSize: 13, cursor: "pointer",
            transition: "all 0.2s",
          }}
            onMouseEnter={e => e.currentTarget.style.borderColor = "var(--accent)"}
            onMouseLeave={e => e.currentTarget.style.borderColor = "var(--border)"}
          >
            + New Analysis
          </button>
        )}
      </div>
    </header>
  );
}
