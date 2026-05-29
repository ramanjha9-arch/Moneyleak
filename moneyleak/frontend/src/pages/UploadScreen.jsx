import { useState, useRef, useCallback } from "react";
import { analyzeFiles } from "../utils/api.js";

const ANALYSIS_TYPES = [
  { id: "full", label: "Full Analysis", desc: "Complete 360° financial forensics", icon: "🔬" },
  { id: "quick", label: "Quick Scan", desc: "30-second leak detection", icon: "⚡" },
  { id: "leaks", label: "Money Leaks", desc: "Find all waste & hidden charges", icon: "🚰" },
  { id: "subscriptions", label: "Subscriptions", desc: "Recurring charge audit", icon: "🔄" },
];

const SAMPLE_TRANSACTIONS = `Date,Description,Amount,Type
2024-01-01,Salary Credit,85000,Credit
2024-01-03,Swiggy Order,450,Debit
2024-01-04,Netflix Subscription,649,Debit
2024-01-05,Zomato Order,320,Debit
2024-01-06,Amazon Purchase,2400,Debit
2024-01-07,Petrol Fill,3200,Debit
2024-01-08,Swiggy Order,680,Debit
2024-01-10,Rent Payment,22000,Debit
2024-01-11,ATM Withdrawal,5000,Debit
2024-01-12,Spotify Premium,119,Debit
2024-01-13,Amazon Prime,1499,Debit
2024-01-14,Zomato Order,450,Debit
2024-01-15,Gym Membership,2000,Debit
2024-01-16,Swiggy Order,520,Debit
2024-01-18,Shopping Mall,4500,Debit
2024-01-19,Electricity Bill,1800,Debit
2024-01-20,Swiggy Order,380,Debit
2024-01-21,Mobile Recharge,599,Debit
2024-01-22,Zomato Order,290,Debit
2024-01-23,ATM Withdrawal,3000,Debit
2024-01-24,Amazon Purchase,1850,Debit
2024-01-25,Swiggy Order,720,Debit
2024-01-26,Hotstar Premium,299,Debit
2024-01-27,Uber Rides,1200,Debit
2024-01-28,Pharmacy,650,Debit
2024-01-29,Restaurant Dining,2200,Debit
2024-01-30,Swiggy Order,410,Debit
2024-01-31,SIP Investment,5000,Debit`;

export default function UploadScreen({ onAnalysisStart, onAnalysisComplete, onProgress, onProgressMsg }) {
  const [files, setFiles] = useState([]);
  const [textInput, setTextInput] = useState("");
  const [analysisType, setAnalysisType] = useState("full");
  const [dragging, setDragging] = useState(false);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("upload"); // upload | text
  const fileRef = useRef();

  const handleFiles = useCallback((incoming) => {
    const valid = Array.from(incoming).filter((f) => f.size <= 20 * 1024 * 1024);
    setFiles((prev) => [...prev, ...valid].slice(0, 5));
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setDragging(false);
    handleFiles(e.dataTransfer.files);
  }, [handleFiles]);

  const removeFile = (i) => setFiles((prev) => prev.filter((_, idx) => idx !== i));

  const handleAnalyze = async () => {
    if (!files.length && !textInput.trim()) {
      setError("Please upload a file or paste transaction data.");
      return;
    }
    setError("");
    onAnalysisStart();

    // Simulate progress while waiting for API
    let p = 5;
    const steps = [
      [10, "Extracting transactions…"],
      [30, "Classifying spending categories…"],
      [50, "Detecting money leaks…"],
      [70, "Analyzing behavioral patterns…"],
      [85, "Computing risk scores…"],
      [95, "Generating insights…"],
    ];
    let stepIdx = 0;
    const ticker = setInterval(() => {
      if (stepIdx < steps.length) {
        p = steps[stepIdx][0];
        onProgress(p);
        onProgressMsg(steps[stepIdx][1]);
        stepIdx++;
      }
    }, 800);

    try {
      const res = await analyzeFiles(files, textInput, analysisType);
      clearInterval(ticker);
      onProgress(100);
      if (res.success) {
        onAnalysisComplete(res.data);
      } else {
        throw new Error(res.error || "Analysis failed");
      }
    } catch (err) {
      clearInterval(ticker);
      setError(err.message);
      onAnalysisStart(); // reset to upload
    }
  };

  return (
    <div style={{ maxWidth: 860, margin: "0 auto", padding: "48px 24px" }}>
      {/* Hero */}
      <div style={{ textAlign: "center", marginBottom: 48 }}>
        <div style={{
          display: "inline-flex", alignItems: "center", gap: 8,
          padding: "6px 16px", borderRadius: 20,
          background: "rgba(0,229,255,0.08)", border: "1px solid rgba(0,229,255,0.2)",
          fontSize: 12, color: "var(--accent)", marginBottom: 20, letterSpacing: "0.05em",
        }}>
          ● POWERED BY GEMINI 2.0 FLASH · FREE TIER
        </div>
        <h1 style={{
          fontFamily: "var(--font-display)", fontWeight: 800,
          fontSize: "clamp(28px, 5vw, 52px)", lineHeight: 1.1,
          letterSpacing: "-0.03em", marginBottom: 16,
        }}>
          Your Money Has{" "}
          <span style={{
            background: "linear-gradient(90deg, var(--accent), var(--accent3))",
            WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
          }}>
            Invisible Leaks
          </span>
        </h1>
        <p style={{ color: "var(--text2)", maxWidth: 520, margin: "0 auto", fontSize: 16 }}>
          Upload any bank statement, credit card bill, or paste transactions.
          Our AI forensic engine will expose every leak, pattern, and risk.
        </p>
      </div>

      {/* Analysis type selector */}
      <div style={{ marginBottom: 32 }}>
        <p style={{ fontSize: 12, color: "var(--text3)", marginBottom: 12, letterSpacing: "0.08em", textTransform: "uppercase" }}>
          Analysis Mode
        </p>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: 10 }}>
          {ANALYSIS_TYPES.map((t) => (
            <button key={t.id} onClick={() => setAnalysisType(t.id)} style={{
              padding: "14px 16px", borderRadius: 12, textAlign: "left", cursor: "pointer",
              background: analysisType === t.id ? "rgba(0,229,255,0.08)" : "var(--surface)",
              border: `1px solid ${analysisType === t.id ? "rgba(0,229,255,0.4)" : "var(--border)"}`,
              transition: "all 0.2s",
            }}>
              <div style={{ fontSize: 18, marginBottom: 6 }}>{t.icon}</div>
              <div style={{ fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 13, color: analysisType === t.id ? "var(--accent)" : "var(--text)" }}>
                {t.label}
              </div>
              <div style={{ fontSize: 11, color: "var(--text3)", marginTop: 2 }}>{t.desc}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Input tabs */}
      <div style={{ marginBottom: 32 }}>
        <div style={{ display: "flex", gap: 0, marginBottom: 0, borderBottom: "1px solid var(--border)" }}>
          {[["upload", "📎 Upload Files"], ["text", "📋 Paste Data"]].map(([id, label]) => (
            <button key={id} onClick={() => setActiveTab(id)} style={{
              padding: "10px 20px", background: "none", border: "none", cursor: "pointer",
              color: activeTab === id ? "var(--accent)" : "var(--text3)",
              borderBottom: `2px solid ${activeTab === id ? "var(--accent)" : "transparent"}`,
              fontFamily: "var(--font-body)", fontSize: 14, transition: "all 0.2s",
              marginBottom: -1,
            }}>{label}</button>
          ))}
        </div>

        <div style={{ marginTop: 20 }}>
          {activeTab === "upload" ? (
            <>
              {/* Drop zone */}
              <div
                onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
                onDragLeave={() => setDragging(false)}
                onDrop={handleDrop}
                onClick={() => fileRef.current.click()}
                style={{
                  border: `2px dashed ${dragging ? "var(--accent)" : "var(--border2)"}`,
                  borderRadius: "var(--radius-lg)",
                  padding: "48px 24px",
                  textAlign: "center", cursor: "pointer",
                  background: dragging ? "rgba(0,229,255,0.04)" : "var(--surface)",
                  transition: "all 0.2s",
                  boxShadow: dragging ? "var(--glow)" : "none",
                }}
              >
                <input ref={fileRef} type="file" multiple accept=".pdf,.jpg,.jpeg,.png,.webp,.txt,.csv"
                  style={{ display: "none" }} onChange={(e) => handleFiles(e.target.files)} />
                <div style={{ fontSize: 40, marginBottom: 12 }}>📊</div>
                <div style={{ fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 16, marginBottom: 8 }}>
                  Drop files here or click to browse
                </div>
                <div style={{ fontSize: 13, color: "var(--text3)" }}>
                  Bank statements · Credit card bills · UPI exports · Screenshots
                </div>
                <div style={{ fontSize: 12, color: "var(--text3)", marginTop: 8 }}>
                  PDF · JPG · PNG · TXT · CSV · Max 20MB per file · Up to 5 files
                </div>
              </div>

              {/* File list */}
              {files.length > 0 && (
                <div style={{ marginTop: 12, display: "flex", flexDirection: "column", gap: 8 }}>
                  {files.map((f, i) => (
                    <div key={i} style={{
                      display: "flex", alignItems: "center", justifyContent: "space-between",
                      padding: "10px 14px", borderRadius: 8,
                      background: "var(--surface2)", border: "1px solid var(--border)",
                    }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <span style={{ fontSize: 18 }}>
                          {f.name.endsWith(".pdf") ? "📄" : f.type.startsWith("image") ? "🖼️" : "📃"}
                        </span>
                        <div>
                          <div style={{ fontSize: 13, fontWeight: 500 }}>{f.name}</div>
                          <div style={{ fontSize: 11, color: "var(--text3)" }}>
                            {(f.size / 1024).toFixed(1)} KB
                          </div>
                        </div>
                      </div>
                      <button onClick={() => removeFile(i)} style={{
                        background: "none", border: "none", cursor: "pointer",
                        color: "var(--text3)", fontSize: 18, lineHeight: 1,
                      }}>×</button>
                    </div>
                  ))}
                </div>
              )}
            </>
          ) : (
            <div>
              <textarea
                value={textInput}
                onChange={(e) => setTextInput(e.target.value)}
                placeholder="Paste bank statement text, CSV data, or transaction list here..."
                rows={10}
                style={{
                  width: "100%", padding: 16, borderRadius: 12,
                  background: "var(--surface)", border: "1px solid var(--border2)",
                  color: "var(--text)", fontFamily: "var(--font-mono)", fontSize: 13,
                  resize: "vertical", outline: "none", transition: "border 0.2s",
                }}
                onFocus={e => e.target.style.borderColor = "var(--accent)"}
                onBlur={e => e.target.style.borderColor = "var(--border2)"}
              />
              <button onClick={() => setTextInput(SAMPLE_TRANSACTIONS)} style={{
                marginTop: 8, padding: "6px 14px", borderRadius: 8,
                background: "var(--surface2)", border: "1px solid var(--border)",
                color: "var(--text3)", fontSize: 12, cursor: "pointer",
              }}>
                Load Sample Data (Demo)
              </button>
            </div>
          )}
        </div>
      </div>

      {error && (
        <div style={{
          padding: "12px 16px", borderRadius: 8, marginBottom: 20,
          background: "rgba(255,71,87,0.1)", border: "1px solid rgba(255,71,87,0.3)",
          color: "var(--danger)", fontSize: 14,
        }}>⚠ {error}</div>
      )}

      {/* Analyze button */}
      <button onClick={handleAnalyze} disabled={!files.length && !textInput.trim()} style={{
        width: "100%", padding: "18px 24px", borderRadius: 12, border: "none",
        background: "linear-gradient(135deg, var(--accent2), var(--accent))",
        color: "#000", fontFamily: "var(--font-display)", fontWeight: 700,
        fontSize: 16, cursor: "pointer", letterSpacing: "-0.01em",
        boxShadow: "0 0 32px rgba(0,229,255,0.25)",
        transition: "all 0.2s",
        opacity: (!files.length && !textInput.trim()) ? 0.4 : 1,
      }}>
        🔬 Analyze My Finances
      </button>

      {/* Feature strips */}
      <div style={{
        display: "flex", flexWrap: "wrap", gap: 10, justifyContent: "center",
        marginTop: 32, padding: 20, borderRadius: 12,
        background: "var(--surface)", border: "1px solid var(--border)",
      }}>
        {["💡 Behavioral Insights", "🚰 Leak Detection", "📊 Risk Scoring",
          "🔄 Subscription Audit", "🔮 Financial Forecast", "🧠 AI Coach"].map((f) => (
          <span key={f} style={{
            padding: "4px 12px", borderRadius: 20, fontSize: 12,
            background: "var(--bg)", border: "1px solid var(--border2)", color: "var(--text2)",
          }}>{f}</span>
        ))}
      </div>
    </div>
  );
}
