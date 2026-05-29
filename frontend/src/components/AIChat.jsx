import { useState, useRef, useEffect } from "react";
import { chatWithAI } from "../utils/api.js";

const STARTERS = [
  "Where am I leaking the most money?",
  "How can I save ₹5,000 more each month?",
  "What's my biggest financial risk right now?",
  "Which subscriptions should I cancel first?",
  "How do I break my late-night ordering habit?",
  "Am I at risk of a debt trap?",
];

export default function AIChat({ analysisData }) {
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      text: "Hello! I'm your AI Financial Coach. I've analyzed your financial data. Ask me anything — from where you're leaking money to how to improve your savings. I'm here to give you honest, personalized guidance.",
      tips: [],
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef();

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const send = async (text) => {
    const msg = text || input.trim();
    if (!msg || loading) return;
    setInput("");
    setMessages((prev) => [...prev, { role: "user", text: msg }]);
    setLoading(true);
    try {
      const res = await chatWithAI(msg, analysisData);
      if (res.success && res.data) {
        setMessages((prev) => [...prev, {
          role: "assistant",
          text: res.data.reply || "I'm processing your question.",
          tips: res.data.tips || [],
          alert: res.data.alert,
        }]);
      } else {
        throw new Error("No response");
      }
    } catch {
      setMessages((prev) => [...prev, {
        role: "assistant",
        text: "I encountered an issue processing that. Please try again.",
        tips: [],
      }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      display: "flex", flexDirection: "column",
      height: "calc(100vh - 280px)", minHeight: 500,
      borderRadius: "var(--radius-lg)",
      background: "var(--surface)", border: "1px solid var(--border)",
      overflow: "hidden",
    }}>
      {/* Header */}
      <div style={{
        padding: "16px 20px",
        borderBottom: "1px solid var(--border)",
        display: "flex", alignItems: "center", gap: 10,
      }}>
        <div style={{
          width: 36, height: 36, borderRadius: "50%",
          background: "linear-gradient(135deg, var(--accent2), var(--accent3))",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 16,
        }}>🤖</div>
        <div>
          <div style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 14 }}>
            AI Financial Coach
          </div>
          <div style={{ fontSize: 11, color: "var(--success)", display: "flex", alignItems: "center", gap: 4 }}>
            <span style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--success)", display: "inline-block" }} />
            Online · Powered by Gemini
          </div>
        </div>
      </div>

      {/* Messages */}
      <div style={{ flex: 1, overflowY: "auto", padding: 20, display: "flex", flexDirection: "column", gap: 16 }}>
        {messages.map((msg, i) => (
          <div key={i} style={{ display: "flex", gap: 10, justifyContent: msg.role === "user" ? "flex-end" : "flex-start" }}>
            {msg.role === "assistant" && (
              <div style={{
                width: 28, height: 28, borderRadius: "50%", flexShrink: 0,
                background: "linear-gradient(135deg, var(--accent2), var(--accent3))",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 13, marginTop: 2,
              }}>🤖</div>
            )}
            <div style={{ maxWidth: "80%" }}>
              {msg.alert && (
                <div style={{
                  padding: "6px 12px", borderRadius: 6, marginBottom: 6,
                  background: "rgba(255,165,2,0.1)", border: "1px solid rgba(255,165,2,0.3)",
                  fontSize: 12, color: "#ffa502",
                }}>⚠️ {msg.alert}</div>
              )}
              <div style={{
                padding: "12px 16px", borderRadius: msg.role === "user" ? "12px 12px 4px 12px" : "12px 12px 12px 4px",
                background: msg.role === "user" ? "linear-gradient(135deg, var(--accent2), var(--accent3))" : "var(--bg3)",
                border: msg.role === "user" ? "none" : "1px solid var(--border)",
                fontSize: 14, lineHeight: 1.6,
                color: msg.role === "user" ? "#fff" : "var(--text)",
              }}>
                {msg.text}
              </div>
              {msg.tips && msg.tips.length > 0 && (
                <div style={{ marginTop: 8, display: "flex", flexDirection: "column", gap: 4 }}>
                  {msg.tips.map((tip, j) => (
                    <div key={j} style={{
                      padding: "6px 12px", borderRadius: 6,
                      background: "rgba(0,229,255,0.06)", border: "1px solid rgba(0,229,255,0.15)",
                      fontSize: 12, color: "var(--accent)",
                      display: "flex", gap: 6, alignItems: "flex-start",
                    }}>
                      <span style={{ flexShrink: 0 }}>→</span> {tip}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
        {loading && (
          <div style={{ display: "flex", gap: 10 }}>
            <div style={{
              width: 28, height: 28, borderRadius: "50%",
              background: "linear-gradient(135deg, var(--accent2), var(--accent3))",
              display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13,
            }}>🤖</div>
            <div style={{
              padding: "12px 16px", borderRadius: "12px 12px 12px 4px",
              background: "var(--bg3)", border: "1px solid var(--border)",
            }}>
              <div style={{ display: "flex", gap: 4 }}>
                {[0, 1, 2].map((j) => (
                  <div key={j} style={{
                    width: 6, height: 6, borderRadius: "50%",
                    background: "var(--text3)",
                    animation: `pulse 1s ease infinite ${j * 0.2}s`,
                  }} />
                ))}
              </div>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Quick starters */}
      {messages.length <= 1 && (
        <div style={{
          padding: "0 20px 12px",
          display: "flex", gap: 8, flexWrap: "wrap",
        }}>
          {STARTERS.map((s) => (
            <button key={s} onClick={() => send(s)} style={{
              padding: "6px 12px", borderRadius: 20,
              background: "var(--bg3)", border: "1px solid var(--border2)",
              color: "var(--text2)", fontSize: 12, cursor: "pointer",
              transition: "all 0.2s",
            }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = "var(--accent)"; e.currentTarget.style.color = "var(--accent)"; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = "var(--border2)"; e.currentTarget.style.color = "var(--text2)"; }}
            >{s}</button>
          ))}
        </div>
      )}

      {/* Input */}
      <div style={{
        padding: "12px 16px",
        borderTop: "1px solid var(--border)",
        display: "flex", gap: 10,
      }}>
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && send()}
          placeholder="Ask your AI financial coach…"
          style={{
            flex: 1, padding: "10px 14px", borderRadius: 10,
            background: "var(--bg3)", border: "1px solid var(--border2)",
            color: "var(--text)", fontFamily: "var(--font-body)", fontSize: 14,
            outline: "none",
          }}
          onFocus={e => e.target.style.borderColor = "var(--accent)"}
          onBlur={e => e.target.style.borderColor = "var(--border2)"}
        />
        <button onClick={() => send()} disabled={!input.trim() || loading} style={{
          padding: "10px 18px", borderRadius: 10, border: "none",
          background: "linear-gradient(135deg, var(--accent2), var(--accent))",
          color: "#000", fontWeight: 700, cursor: "pointer", fontSize: 14,
          opacity: (!input.trim() || loading) ? 0.5 : 1,
          transition: "opacity 0.2s",
        }}>
          Send
        </button>
      </div>
    </div>
  );
}
