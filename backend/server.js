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

// Primary model: gemini-1.5-flash, fallback: gemini-1.5-pro
const PRIMARY_MODEL   = "gemini-1.5-flash";
const FALLBACK_MODEL  = "gemini-1.5-pro";

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

const ALLOWED_MIMES = [
  "application/pdf",
  "image/jpeg",
  "image/png",
  "image/webp",
  "text/plain",
  "text/csv",
  // Excel
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "application/vnd.ms-excel.sheet.macroEnabled.12",
];

const upload = multer({
  storage,
  limits: { fileSize: 20 * 1024 * 1024 },
  fileFilter: (_, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const allowedExts = [".pdf",".jpg",".jpeg",".png",".webp",".txt",".csv",".xls",".xlsx",".xlsm"];
    if (ALLOWED_MIMES.includes(file.mimetype) || allowedExts.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error(`Unsupported file type: ${file.mimetype}`));
    }
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

Tone: intelligent, calm, premium, conversational, insightful. Never shame users.

ALWAYS respond with ONLY valid JSON (no markdown, no explanation outside JSON).`;

// ─── Helpers ──────────────────────────────────────────────────────────────────
function fileToBase64(filePath) {
  return fs.readFileSync(filePath).toString("base64");
}

function getMimeType(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  const map = {
    ".pdf": "application/pdf",
    ".jpg": "image/jpeg", ".jpeg": "image/jpeg",
    ".png": "image/png", ".webp": "image/webp",
    // Excel files — send as plain text after note; Gemini can't parse binary xlsx,
    // we'll attach a text note saying it's tabular data
  };
  return map[ext] || null;
}

function isExcelFile(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  return [".xls", ".xlsx", ".xlsm"].includes(ext);
}

async function safeDeleteFile(filePath) {
  try { await unlinkAsync(filePath); } catch (_) { /* already gone */ }
}

async function generateWithFallback(parts) {
  // Try primary model first
  try {
    const model = genAI.getGenerativeModel({ model: PRIMARY_MODEL });
    const result = await model.generateContent(parts);
    return { result, modelUsed: PRIMARY_MODEL };
  } catch (primaryErr) {
    console.warn(`Primary model (${PRIMARY_MODEL}) failed: ${primaryErr.message}. Trying fallback…`);
    try {
      const model = genAI.getGenerativeModel({ model: FALLBACK_MODEL });
      const result = await model.generateContent(parts);
      return { result, modelUsed: FALLBACK_MODEL };
    } catch (fallbackErr) {
      throw new Error(`Both models failed. Primary: ${primaryErr.message} | Fallback: ${fallbackErr.message}`);
    }
  }
}

// ─── Routes ───────────────────────────────────────────────────────────────────

// Health check
app.get("/api/health", (_, res) => res.json({ status: "ok", primaryModel: PRIMARY_MODEL, fallbackModel: FALLBACK_MODEL }));

// Main analysis endpoint (SSE streaming logs)
app.post("/api/analyze", upload.array("files", 5), async (req, res) => {
  const uploadedPaths = (req.files || []).map((f) => f.path);

  // Use Server-Sent Events for real-time logs
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.flushHeaders();

  const sendEvent = (type, payload) => {
    res.write(`data: ${JSON.stringify({ type, ...payload })}\n\n`);
  };

  try {
    const { textInput, analysisType = "full" } = req.body;

    sendEvent("log", { step: 1, message: "📂 Files received, preparing analysis…" });

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
      sendEvent("log", { step: 2, message: "📋 Processing pasted transaction data…" });
      parts.push({ text: `\n\nRAW TRANSACTION DATA:\n${textInput}` });
    }

    let fileCount = 0;
    for (const filePath of uploadedPaths) {
      fileCount++;
      const fname = path.basename(filePath);
      sendEvent("log", { step: 2, message: `📄 Processing file ${fileCount}: ${fname}…` });

      if (isExcelFile(filePath)) {
        // For Excel, we attach a note since Gemini can't parse binary xlsx
        parts.push({ text: `\n\n[Excel file attached: ${fname}. Please analyze any transaction data present in this spreadsheet.]` });
        sendEvent("log", { step: 2, message: `📊 Excel file detected — extracting as tabular data hint…` });
      } else {
        const mime = getMimeType(filePath);
        if (mime) {
          parts.push({ inlineData: { mimeType: mime, data: fileToBase64(filePath) } });
        }
      }
    }

    sendEvent("log", { step: 3, message: "🧠 Sending to Gemini AI for deep analysis…" });

    const { result, modelUsed } = await generateWithFallback(parts);

    sendEvent("log", { step: 4, message: `✅ Response received from ${modelUsed}. Parsing JSON…` });

    const rawText = result.response.text().trim();

    // Clean JSON from possible markdown fences
    const cleaned = rawText
      .replace(/^```json\s*/i, "")
      .replace(/^```\s*/i, "")
      .replace(/\s*```$/i, "")
      .trim();

    sendEvent("log", { step: 5, message: "🔍 Validating and structuring your report…" });

    let parsed;
    try {
      parsed = JSON.parse(cleaned);
    } catch (parseErr) {
      throw new Error(`AI returned invalid JSON. Raw response preview: ${cleaned.slice(0, 200)}…`);
    }

    sendEvent("log", { step: 6, message: "🎉 Analysis complete! Loading your report…" });
    sendEvent("done", { success: true, data: parsed, modelUsed });

  } catch (err) {
    console.error("Analysis error:", err.message);
    sendEvent("error", { success: false, error: err.message });
  } finally {
    for (const p of uploadedPaths) await safeDeleteFile(p);
    res.end();
  }
});

// Chat with financial context
app.post("/api/chat", async (req, res) => {
  try {
    const { message, context } = req.body;
    if (!message) return res.status(400).json({ error: "message required" });

    const prompt = `${SYSTEM_PROMPT}

You are now acting as an AI financial coach. The user has already uploaded their financial data.
Previous analysis context: ${context ? JSON.stringify(context).slice(0, 3000) : "No prior analysis"}

User question: "${message}"

Respond with JSON: { "reply": "your insightful response", "tips": ["tip1", "tip2"], "alert": null or "alert message if urgent" }`;

    const { result } = await generateWithFallback([{ text: prompt }]);
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
app.listen(PORT, () => console.log(`MoneyLeak API running on port ${PORT} | Primary: ${PRIMARY_MODEL} | Fallback: ${FALLBACK_MODEL}`));
