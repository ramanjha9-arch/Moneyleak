import { useState } from "react";
import ScoreCard from "../components/ScoreCard.jsx";
import CategoryBreakdown from "../components/CategoryBreakdown.jsx";
import MoneyLeaks from "../components/MoneyLeaks.jsx";
import BehavioralInsights from "../components/BehavioralInsights.jsx";
import SubscriptionAudit from "../components/SubscriptionAudit.jsx";
import RiskAlerts from "../components/RiskAlerts.jsx";
import FinancialProjection from "../components/FinancialProjection.jsx";
import AIChat from "../components/AIChat.jsx";
import SummaryHero from "../components/SummaryHero.jsx";
import { fmt } from "../utils/format.js";

const TABS = [
  { id: "overview", label: "Overview", icon: "🏠" },
  { id: "leaks", label: "Money Leaks", icon: "🚰" },
  { id: "behavior", label: "Behavioral", icon: "🧠" },
  { id: "subscriptions", label: "Subscriptions", icon: "🔄" },
  { id: "risks", label: "Risk Alerts", icon: "⚠️" },
  { id: "projection", label: "Projection", icon: "🔮" },
  { id: "coach", label: "AI Coach", icon: "💬" },
];

export default function AnalysisScreen({ data, onReset }) {
  const [activeTab, setActiveTab] = useState("overview");

  // Safely access data fields with fallbacks
  const summary = data?.summary || {};
  const scores = data?.scores || {};
  const categoryBreakdown = data?.categoryBreakdown || [];
  const moneyLeaks = data?.moneyLeaks || [];
  const behavioralInsights = data?.behavioralInsights || [];
  const subscriptions = data?.subscriptions || [];
  const riskAlerts = data?.riskAlerts || [];
  const financialProjection = data?.financialProjection || {};
  const savingsOpportunities = data?.savingsOpportunities || [];
  const personalityProfile = data?.personalityProfile || {};
  const emotionalInsight = data?.emotionalInsight || "";
  const chartData = data?.chartData || {};

  const leakCount = moneyLeaks.length;
  const criticalAlerts = riskAlerts.filter((a) => a.severity === "critical").length;

  return (
    <div style={{ maxWidth: 1100, margin: "0 auto", padding: "32px 20px 80px" }}>

      {/* Summary Hero */}
      <SummaryHero
        summary={summary}
        scores={scores}
        personalityProfile={personalityProfile}
        emotionalInsight={emotionalInsight}
        leakCount={leakCount}
        criticalAlerts={criticalAlerts}
      />

      {/* Tabs */}
      <div style={{
        display: "flex", gap: 4, overflowX: "auto", padding: "4px 0",
        marginBottom: 32, borderBottom: "1px solid var(--border)",
        scrollbarWidth: "none",
      }}>
        {TABS.map((tab) => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)} style={{
            display: "flex", alignItems: "center", gap: 6,
            padding: "9px 16px", borderRadius: "8px 8px 0 0", border: "none",
            background: activeTab === tab.id ? "var(--surface)" : "transparent",
            color: activeTab === tab.id ? "var(--accent)" : "var(--text3)",
            fontFamily: "var(--font-body)", fontSize: 13, cursor: "pointer",
            whiteSpace: "nowrap", transition: "all 0.2s",
            borderBottom: `2px solid ${activeTab === tab.id ? "var(--accent)" : "transparent"}`,
            marginBottom: -1,
          }}>
            <span>{tab.icon}</span>
            <span>{tab.label}</span>
            {tab.id === "leaks" && leakCount > 0 && (
              <span style={{
                background: "var(--danger)", color: "#fff",
                borderRadius: 10, padding: "1px 6px", fontSize: 10, fontWeight: 700,
              }}>{leakCount}</span>
            )}
            {tab.id === "risks" && criticalAlerts > 0 && (
              <span style={{
                background: "var(--warning)", color: "#000",
                borderRadius: 10, padding: "1px 6px", fontSize: 10, fontWeight: 700,
              }}>{criticalAlerts}</span>
            )}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div style={{ animation: "fadeUp 0.3s ease" }}>
        {activeTab === "overview" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
            <ScoreCard scores={scores} />
            <CategoryBreakdown categories={categoryBreakdown} chartData={chartData} />
            {savingsOpportunities.length > 0 && (
              <SavingsOpportunities opportunities={savingsOpportunities} />
            )}
          </div>
        )}
        {activeTab === "leaks" && <MoneyLeaks leaks={moneyLeaks} chartData={chartData} />}
        {activeTab === "behavior" && (
          <BehavioralInsights
            insights={behavioralInsights}
            timeIntelligence={data?.timeIntelligence}
            chartData={chartData}
          />
        )}
        {activeTab === "subscriptions" && <SubscriptionAudit subscriptions={subscriptions} />}
        {activeTab === "risks" && <RiskAlerts alerts={riskAlerts} topTransactions={data?.topTransactions} />}
        {activeTab === "projection" && <FinancialProjection projection={financialProjection} summary={summary} scores={scores} />}
        {activeTab === "coach" && <AIChat analysisData={data} />}
      </div>

      {/* Footer insight */}
      <div style={{
        marginTop: 48, padding: "20px 24px", borderRadius: 12,
        background: "var(--surface)", border: "1px solid var(--border)",
        textAlign: "center",
      }}>
        <p style={{ fontFamily: "var(--font-display)", fontSize: 16, color: "var(--text2)", fontStyle: "italic" }}>
          {data?.closingMessage || "Small leaks sink big ships. Awareness is your first financial superpower."}
        </p>
      </div>
    </div>
  );
}

function SavingsOpportunities({ opportunities }) {
  const total = opportunities.reduce((s, o) => s + (o.potentialSaving || 0), 0);
  return (
    <div style={{
      padding: 24, borderRadius: "var(--radius-lg)",
      background: "var(--surface)", border: "1px solid var(--border)",
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <h3 style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 17 }}>
          💡 Savings Opportunities
        </h3>
        <span style={{
          padding: "4px 12px", borderRadius: 20, fontSize: 13,
          background: "rgba(46,213,115,0.1)", border: "1px solid rgba(46,213,115,0.3)",
          color: "var(--success)", fontFamily: "var(--font-mono)",
        }}>
          Save up to {fmt(total)}/mo
        </span>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {opportunities.map((o, i) => (
          <div key={i} style={{
            display: "flex", alignItems: "flex-start", gap: 14,
            padding: 14, borderRadius: 10,
            background: "var(--bg3)", border: "1px solid var(--border)",
          }}>
            <span style={{
              width: 32, height: 32, borderRadius: 8, flexShrink: 0,
              background: "rgba(46,213,115,0.1)", display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 16,
            }}>
              {o.effort === "easy" ? "✅" : o.effort === "medium" ? "🔧" : "💪"}
            </span>
            <div style={{ flex: 1 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                <span style={{ fontWeight: 600, fontSize: 14 }}>{o.area}</span>
                <span style={{ color: "var(--success)", fontFamily: "var(--font-mono)", fontSize: 13 }}>
                  {fmt(o.potentialSaving)}/mo
                </span>
              </div>
              <p style={{ fontSize: 13, color: "var(--text2)", marginTop: 4 }}>{o.suggestion}</p>
              <span style={{
                display: "inline-block", marginTop: 6, padding: "2px 8px", borderRadius: 4,
                fontSize: 11, background: "var(--surface2)", color: "var(--text3)",
              }}>
                {o.effort} effort
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
