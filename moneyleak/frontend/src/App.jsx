import { useState } from "react";
import UploadScreen from "./pages/UploadScreen.jsx";
import AnalysisScreen from "./pages/AnalysisScreen.jsx";
import Header from "./components/Header.jsx";

export default function App() {
  const [screen, setScreen] = useState("upload"); // upload | analyzing | results
  const [analysisData, setAnalysisData] = useState(null);
  const [progress, setProgress] = useState(0);
  const [progressMsg, setProgressMsg] = useState("");

  const handleAnalysisStart = () => {
    setScreen("analyzing");
    setProgress(0);
  };

  const handleAnalysisComplete = (data) => {
    setAnalysisData(data);
    setScreen("results");
  };

  const handleReset = () => {
    setAnalysisData(null);
    setScreen("upload");
    setProgress(0);
  };

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)" }}>
      <Header onReset={handleReset} showReset={screen === "results"} />
      {screen === "upload" && (
        <UploadScreen
          onAnalysisStart={handleAnalysisStart}
          onAnalysisComplete={handleAnalysisComplete}
          onProgress={setProgress}
          onProgressMsg={setProgressMsg}
        />
      )}
      {screen === "analyzing" && <LoadingScreen progress={progress} message={progressMsg} />}
      {screen === "results" && analysisData && (
        <AnalysisScreen data={analysisData} onReset={handleReset} />
      )}
    </div>
  );
}

function LoadingScreen({ progress, message }) {
  const msgs = [
    "Decoding transaction patterns…",
    "Detecting money leaks…",
    "Analyzing behavioral triggers…",
    "Computing risk scores…",
    "Building your financial profile…",
    "Generating insights…",
  ];
  const [idx] = useState(Math.floor(Math.random() * msgs.length));

  return (
    <div style={{
      display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
      minHeight: "80vh", gap: 32, padding: 24,
    }}>
      {/* Animated logo */}
      <div style={{ position: "relative", width: 96, height: 96 }}>
        <div style={{
          width: 96, height: 96, borderRadius: "50%",
          border: "2px solid var(--border2)",
          borderTop: "2px solid var(--accent)",
          animation: "spin 1s linear infinite",
        }} />
        <div style={{
          position: "absolute", inset: 12,
          borderRadius: "50%",
          border: "2px solid var(--border)",
          borderBottom: "2px solid var(--accent3)",
          animation: "spin 1.5s linear infinite reverse",
        }} />
        <div style={{
          position: "absolute", inset: "50%", transform: "translate(-50%,-50%)",
          width: 20, height: 20, borderRadius: "50%", background: "var(--accent)",
          boxShadow: "0 0 20px var(--accent)",
        }} />
      </div>

      <div style={{ textAlign: "center", maxWidth: 400 }}>
        <h2 style={{ fontFamily: "var(--font-display)", fontSize: 22, marginBottom: 8 }}>
          {message || msgs[idx]}
        </h2>
        <p style={{ color: "var(--text2)", fontSize: 14 }}>
          MoneyLeak Intelligence Engine is at work
        </p>
      </div>

      {/* Progress bar */}
      <div style={{ width: "100%", maxWidth: 400 }}>
        <div style={{
          width: "100%", height: 4, background: "var(--border)",
          borderRadius: 2, overflow: "hidden",
        }}>
          <div style={{
            height: "100%",
            width: `${progress || 30}%`,
            background: "linear-gradient(90deg, var(--accent2), var(--accent))",
            borderRadius: 2,
            transition: "width 0.5s ease",
            boxShadow: "0 0 12px var(--accent)",
          }} />
        </div>
        <p style={{ textAlign: "right", fontSize: 12, color: "var(--text3)", marginTop: 6, fontFamily: "var(--font-mono)" }}>
          {progress || "—"}%
        </p>
      </div>

      <div style={{
        display: "flex", gap: 8, flexWrap: "wrap", justifyContent: "center", maxWidth: 500,
      }}>
        {["OCR Extraction", "Pattern Detection", "Risk Scoring", "Behavioral Analysis"].map((tag) => (
          <span key={tag} style={{
            padding: "4px 12px", borderRadius: 20,
            background: "var(--surface)", border: "1px solid var(--border)",
            fontSize: 12, color: "var(--text3)",
            animation: "pulse 2s ease infinite",
          }}>{tag}</span>
        ))}
      </div>
    </div>
  );
}
