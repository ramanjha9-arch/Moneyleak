import express from "express";
import cors from "cors";
import multer from "multer";
import { GoogleGenerativeAI } from "@google/generative-ai";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { promisify } from "util";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const unlinkAsync = promisify(fs.unlink);

const app = express();
const PORT = process.env.PORT || 3001;

// ─── Gemini Client ───────────────────────────────────────────────────────────
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// ─── Middleware ───────────────────────────────────────────────────────────────
app.use(cors({ origin: process.env.FRONTEND_URL || "http://localhost:5173" }));
app.use(express.json({ limit: "50mb" }));

// Temp upload dir
const uploadDir = path.join(__dirname, "tmp_uploads");
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: uploadDir,
  filename: (_, file, cb) => cb(null, `${Date.now()}-${file.originalname}`),
});
const upload = multer({
  storage,
  limits: { fileSize: 20 * 1024 * 1024 },
  fileFilter: (_, file, cb) => {
    const allowed = ["application/pdf", "image/jpeg", "image/png", "image/webp", "text/plain", "text/csv"];
    cb(null, allowed.includes(file.mimetype));
  },
});

// ─── System Prompt ────────────────────────────────────────────────────────────
const SYSTEM_PROMPT = `You are "MoneyLeak Intelligence Engine v2" — an elite AI-powered financial behavior intelligence system designed for Indian consumers.

Your objective is to:
- uncover invisible money leaks
- decode financial behavior patterns
- predict future financial stress
- identify lifestyle inflation
- expose subconscious spending habits
- optimize cash flow
- improve savings discipline
- detect hidden financial risks
- generate emotionally impactful insights

You must analyze every transaction with:
1. Primary Category
2. Subcategory
3. Behavioral Intent
4. Necessity Score (1-10)
5. Emotional Trigger Score (1-10)
6. Financial Risk Weight (1-10)
7. Recurrence Confidence (%)
8. Lifestyle Dependency Score (1-10)

Tone: intelligent, calm, premium, conversational, insightful. Never shame users.

ALWAYS respond with ONLY valid JSON (no markdown, no explanation outside JSON).`;

// ─── Helpers ──────────────────────────────────────────────────────────────────
function fileToBase64(filePath) {
  return fs.readFileSync(filePath).toString("base64");
}

function getMimeType(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  const map = { ".pdf": "application/pdf", ".jpg": "image/jpeg", ".jpeg": "image/jpeg", ".png": "image/png", ".webp": "image/webp" };
  return map[ext] || "application/octet-stream";
}

async function safeDeleteFile(filePath) {
  try { await unlinkAsync(filePath); } catch (_) { /* already gone */ }
}

// ─── Routes ───────────────────────────────────────────────────────────────────

// Health check
app.get("/api/health", (_, res) => res.json({ status: "ok", model: "gemini-3.5-flash" }));

// Main analysis endpoint
app.post("/api/analyze", upload.array("files", 5), async (req, res) => {
  const uploadedPaths = (req.files || []).map((f) => f.path);

  try {
    const { textInput, analysisType = "full" } = req.body;
    const model = genAI.getGenerativeModel({ model: "gemini-3.5-flash" });

    const promptMap = {
      full: buildFullAnalysisPrompt(),
      quick: buildQuickScanPrompt(),
      subscriptions: buildSubscriptionPrompt(),
      leaks: buildLeakPrompt(),
    };

    const userPrompt = promptMap[analysisType] || promptMap.full;

    // Build content parts
    const parts = [{ text: SYSTEM_PROMPT + "\n\n" + userPrompt }];

    if (textInput) {
      parts.push({ text: `\n\nRAW TRANSACTION DATA:\n${textInput}` });
    }

    for (const filePath of uploadedPaths) {
      const mime = getMimeType(filePath);
      if (mime !== "application/octet-stream") {
        parts.push({
          inlineData: { mimeType: mime, data: fileToBase64(filePath) },
        });
      }
    }

    const result = await model.generateContent(parts);
    const rawText = result.response.text().trim();

    // Clean JSON from possible markdown fences
    const cleaned = rawText.replace(/^```json\s*/i, "").replace(/^```\s*/i, "").replace(/\s*```$/i, "").trim();
    const parsed = JSON.parse(cleaned);

    res.json({ success: true, data: parsed });
  } catch (err) {
    console.error("Analysis error:", err.message);
    res.status(500).json({ success: false, error: err.message });
  } finally {
    // Always wipe temp files
    for (const p of uploadedPaths) await safeDeleteFile(p);
  }
});

// Chat with financial context
app.post("/api/chat", async (req, res) => {
  try {
    const { message, context } = req.body;
    if (!message) return res.status(400).json({ error: "message required" });

    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

    const prompt = `${SYSTEM_PROMPT}

You are now acting as an AI financial coach. The user has already uploaded their financial data.
Previous analysis context: ${context ? JSON.stringify(context).slice(0, 3000) : "No prior analysis"}

User question: "${message}"

Respond with JSON: { "reply": "your insightful response", "tips": ["tip1", "tip2"], "alert": null or "alert message if urgent" }`;

    const result = await model.generateContent(prompt);
    const rawText = result.response.text().trim();
    const cleaned = rawText.replace(/^```json\s*/i, "").replace(/^```\s*/i, "").replace(/\s*```$/i, "").trim();
    res.json({ success: true, data: JSON.parse(cleaned) });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ─── Prompt Builders ──────────────────────────────────────────────────────────

function buildFullAnalysisPrompt() {
  return `Analyze the provided financial statement(s) and return a comprehensive JSON report with this EXACT structure:

{
  "summary": {
    "totalIncome": number,
    "totalExpenses": number,
    "netSavings": number,
    "savingsRate": number,
    "analysisMonth": "string",
    "currency": "INR",
    "dataQuality": "high|medium|low",
    "transactionCount": number
  },
  "scores": {
    "moneyLeakScore": number,
    "financialDisciplineScore": number,
    "lifestyleRiskScore": number,
    "debtDependencyScore": number,
    "savingsEfficiencyScore": number,
    "financialStressProbability": number,
    "cashFlowHealthScore": number,
    "emergencyPreparednessScore": number
  },
  "categoryBreakdown": [
    {
      "category": "string",
      "amount": number,
      "percentage": number,
      "transactionCount": number,
      "necessityScore": number,
      "riskLevel": "low|medium|high",
      "behavioralIntent": "string",
      "monthlyTrend": "increasing|stable|decreasing"
    }
  ],
  "moneyLeaks": [
    {
      "type": "string",
      "description": "string",
      "amount": number,
      "annualizedLoss": number,
      "severity": "critical|high|medium|low",
      "fixable": true,
      "recommendation": "string"
    }
  ],
  "behavioralInsights": [
    {
      "pattern": "string",
      "description": "string",
      "emotionalTrigger": "string",
      "frequency": "string",
      "financialImpact": number,
      "insight": "string"
    }
  ],
  "subscriptions": [
    {
      "name": "string",
      "amount": number,
      "frequency": "monthly|annual|quarterly",
      "category": "string",
      "lastUsedIndicator": "string",
      "recommendation": "keep|cancel|downgrade|audit"
    }
  ],
  "riskAlerts": [
    {
      "type": "string",
      "severity": "critical|warning|info",
      "message": "string",
      "action": "string"
    }
  ],
  "topTransactions": [
    {
      "date": "string",
      "merchant": "string",
      "amount": number,
      "category": "string",
      "flag": "string or null"
    }
  ],
  "timeIntelligence": {
    "peakSpendingHour": number,
    "peakSpendingDay": "string",
    "weekendPremium": number,
    "lateNightSpend": number,
    "salaryWeekEffect": "string"
  },
  "savingsOpportunities": [
    {
      "area": "string",
      "currentSpend": number,
      "potentialSaving": number,
      "effort": "easy|medium|hard",
      "suggestion": "string"
    }
  ],
  "financialProjection": {
    "currentTrajectory": "string",
    "projectedSavingsIn6Months": number,
    "burnRateMonthly": number,
    "savingsExhaustionRisk": "string",
    "debtTrapRisk": "low|medium|high",
    "lifestyleInflationIndex": number
  },
  "personalityProfile": {
    "archetype": "string",
    "description": "string",
    "strengths": ["string"],
    "vulnerabilities": ["string"]
  },
  "emotionalInsight": "string",
  "closingMessage": "string",
  "chartData": {
    "categoryPie": { "labels": [], "values": [] },
    "weekdaySpend": { "labels": ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"], "values": [] },
    "dailyTrend": { "labels": [], "values": [] },
    "leakageBreakdown": { "labels": [], "values": [] }
  }
}`;
}

function buildQuickScanPrompt() {
  return `Do a quick 30-second financial scan and return JSON:
{
  "summary": { "totalIncome": number, "totalExpenses": number, "netSavings": number, "savingsRate": number },
  "scores": { "moneyLeakScore": number, "financialDisciplineScore": number },
  "topLeaks": [{ "description": "string", "amount": number, "severity": "string" }],
  "quickWins": [{ "action": "string", "saving": number }],
  "emotionalInsight": "string"
}`;
}

function buildSubscriptionPrompt() {
  return `Focus ONLY on recurring charges, subscriptions, auto-debits. Return JSON:
{
  "subscriptions": [{ "name": "string", "amount": number, "frequency": "string", "recommendation": "keep|cancel|downgrade", "reason": "string" }],
  "totalMonthlySubscriptionBurn": number,
  "annualSubscriptionCost": number,
  "subscriptionSaturationScore": number,
  "topRecommendation": "string"
}`;
}

function buildLeakPrompt() {
  return `Focus ONLY on money leaks, waste, hidden charges, inefficiencies. Return JSON:
{
  "leaks": [{ "type": "string", "amount": number, "annualizedLoss": number, "fix": "string", "severity": "string" }],
  "totalLeakageMonthly": number,
  "totalLeakageAnnual": number,
  "moneyLeakScore": number,
  "biggestLeak": "string",
  "recoveryPotential": number
}`;
}

// ─── Start ────────────────────────────────────────────────────────────────────
app.listen(PORT, () => console.log(`MoneyLeak API running on port ${PORT}`));
