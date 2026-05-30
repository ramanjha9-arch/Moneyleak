import { useState } from "react";
import UploadScreen from "./pages/UploadScreen.jsx";
import AnalysisScreen from "./pages/AnalysisScreen.jsx";
import Header from "./components/Header.jsx";

export default function App() {
  const [screen, setScreen] = useState("upload"); // upload | analyzing | results
  const [analysisData, setAnalysisData] = useState(null);
  const [progress, setProgress] = useState(0);
  const [progressMsg, setProgressMsg] = useState("");
  const [logs, setLogs] = useState([]);
  const [analysisError, setAnalysisError] = useState(null);
  const [modelUsed, setModelUsed] = useState(null);

  const handleAnalysisStart = () => {
    setScreen("analyzing");
    setProgress(0);
    setLogs([]);
    setAnalysisError(null);
  };

  const handleLog = (logEvt) => {
    setLogs((prev) => [...prev, logEvt]);
    setProgressMsg(logEvt.message);
    // Map step to progress %
    const stepProgress = { 1: 10, 2: 30, 3: 55, 4: 75, 5: 90, 6: 100 };
    if (logEvt.step) setProgress(stepProgress[logEvt.step] || progress);
  };

  const handleAnalysisComplete = (data, model) => {
    setAnalysisData(data);
    setModelUsed(model);
    setScreen("results");
  };

  const handleAnalysisError = (errMsg) => {
    setAnalysisError(errMsg);
    setScreen("error");
  };

  const handleReset = () => {
    setAnalysisData(null);
    setScreen("upload");
    setProgress(0);
    setLogs([]);
    setAnalysisError(null);
  };

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)" }}>
      <Header onReset={handleReset} showReset={screen === "results"} modelUsed={modelUsed} />
      {screen === "upload" && (
        <UploadScreen
          onAnalysisStart={handleAnalysisStart}
          onAnalysisComplete={handleAnalysisComplete}
          onAnalysisError={handleAnalysisError}
          onLog={handleLog}
          onProgress={setProgress}
          onProgressMsg={setProgressMsg}
        />
      )}
      {screen === "analyzing" && (
        <LoadingScreen progress={progress} message={progressMsg} logs={logs} />
      )}
      {screen === "error" && (
        <ErrorScreen error={analysisError} onReset={handleReset} />
      )}
      {screen === "results" && analysisData && (
        <AnalysisScreen data={analysisData} onReset={handleReset} />
      )}
    </div>
  );
}

function LoadingScreen({ progress, message, logs }) {
  return (
    <div style={{
      display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
      minHeight: "85vh", gap: 32, padding: "32px 24px",
    }}>
      {/* Animated orb */}
      <div style={{ position: "relative", width: 100, height: 100 }}>
        <div style={{
          width: 100, height: 100, borderRadius: "50%",
          border: "2px solid var(--border2)",
          borderTop: "2px solid var(--accent)",
          animation: "spin 1s linear infinite",
        }} />
        <div style={{
          position: "absolute", inset: 14,
          borderRadius: "50%",
          border: "2px solid var(--border)",
          borderBottom: "2px solid var(--accent3)",
          animation: "spin 1.5s linear infinite reverse",
        }} />
        <div style={{
          position: "absolute", inset: "50%", transform: "translate(-50%,-50%)",
          width: 22, height: 22, borderRadius: "50%",
          background: "radial-gradient(circle, var(--accent2), var(--accent))",
          boxShadow: "0 0 24px var(--accent)",
        }} />
      </div>

      <div style={{ textAlign: "center", maxWidth: 440 }}>
        <h2 style={{ fontFamily: "var(--font-display)", fontSize: 22, marginBottom: 8, color: "var(--text)" }}>
          {message || "MoneyLeak Intelligence Engine is at work…"}
        </h2>
        <p style={{ color: "var(--text3)", fontSize: 14 }}>
          AI-powered financial forensics in progress
        </p>
      </div>

      {/* Progress bar */}
      <div style={{ width: "100%", maxWidth: 440 }}>
        <div style={{
          width: "100%", height: 5, background: "var(--surface)",
          borderRadius: 3, overflow: "hidden",
        }}>
          <div style={{
            height: "100%",
            width: `${progress || 8}%`,
            background: "linear-gradient(90deg, var(--accent2), var(--accent), var(--accent4))",
            borderRadius: 3,
            transition: "width 0.6s cubic-bezier(0.4,0,0.2,1)",
            boxShadow: "0 0 16px var(--accent)",
          }} />
        </div>
        <p style={{ textAlign: "right", fontSize: 12, color: "var(--text3)", marginTop: 6, fontFamily: "var(--font-mono)" }}>
          {progress || "—"}%
        </p>
      </div>

      {/* Live logs panel */}
      {logs.length > 0 && (
        <div style={{
          width: "100%", maxWidth: 520,
          background: "var(--surface)", border: "1px solid var(--border)",
          borderRadius: "var(--radius-lg)", overflow: "hidden",
        }}>
          <div style={{
            padding: "10px 16px", borderBottom: "1px solid var(--border)",
            display: "flex", alignItems: "center", gap: 8,
            background: "var(--bg3)",
          }}>
            <span style={{
              width: 8, height: 8, borderRadius: "50%", background: "var(--success)",
              display: "inline-block", animation: "pulse 1.5s ease infinite",
            }} />
            <span style={{ fontSize: 11, color: "var(--text3)", letterSpacing: "0.08em", textTransform: "uppercase" }}>
              Live Processing Log
            </span>
          </div>
          <div style={{ padding: "12px 16px", display: "flex", flexDirection: "column", gap: 8 }}>
            {logs.map((log, i) => (
              <div key={i} style={{
                display: "flex", alignItems: "flex-start", gap: 10,
                animation: "logFadeIn 0.3s ease forwards",
                fontSize: 13,
              }}>
                <span style={{
                  minWidth: 20, height: 20, borderRadius: "50%",
                  background: "rgba(56,189,248,0.15)", border: "1px solid rgba(56,189,248,0.3)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 10, color: "var(--accent)", fontFamily: "var(--font-mono)",
                  flexShrink: 0, marginTop: 1,
                }}>{log.step}</span>
                <span style={{ color: i === logs.length - 1 ? "var(--text)" : "var(--text2)" }}>
                  {log.message}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function ErrorScreen({ error, onReset }) {
  return (
    <div style={{
      display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
      minHeight: "80vh", gap: 24, padding: "32px 24px", maxWidth: 600, margin: "0 auto",
    }}>
      <div style={{
        width: 72, height: 72, borderRadius: "50%",
        background: "rgba(248,113,113,0.1)", border: "2px solid rgba(248,113,113,0.3)",
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: 32, boxShadow: "var(--glow-danger)",
      }}>⚠️</div>

      <div style={{ textAlign: "center" }}>
        <h2 style={{ fontFamily: "var(--font-display)", fontSize: 24, marginBottom: 12, color: "var(--text)" }}>
          Analysis Failed
        </h2>
        <p style={{ color: "var(--text2)", fontSize: 14, marginBottom: 20 }}>
          The AI engine encountered an error while processing your data.
        </p>
      </div>

      <div style={{
        width: "100%", padding: "16px 20px", borderRadius: "var(--radius)",
        background: "rgba(248,113,113,0.08)", border: "1px solid rgba(248,113,113,0.25)",
        color: "var(--danger)", fontSize: 13, fontFamily: "var(--font-mono)",
        wordBreak: "break-word", lineHeight: 1.7,
      }}>
        {error}
      </div>

      <div style={{ display: "flex", gap: 12 }}>
        <button onClick={onReset} style={{
          padding: "12px 28px", borderRadius: "var(--radius)",
          background: "linear-gradient(135deg, var(--accent2), var(--accent))",
          border: "none", color: "#fff", fontFamily: "var(--font-display)",
          fontWeight: 700, fontSize: 15, cursor: "pointer",
          boxShadow: "var(--glow)",
        }}>
          ↩ Try Again
        </button>
      </div>

      <p style={{ fontSize: 12, color: "var(--text3)", textAlign: "center", maxWidth: 400 }}>
        Common fixes: ensure your GEMINI_API_KEY is valid, the backend is reachable, and the file is a supported format (PDF, image, CSV, TXT, or Excel).
      </p>
    </div>
  );
}
