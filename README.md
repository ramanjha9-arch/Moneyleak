# MoneyLeak Intelligence Engine v2
### AI-Powered Financial Behavior Intelligence for Indian Consumers

---

## 🏗️ Architecture

```
moneyleak/
├── backend/          ← Node.js + Express API (keeps your Gemini key safe)
│   ├── server.js     ← Main server (Gemini calls happen here)
│   ├── package.json
│   ├── .env.example  ← Copy to .env and fill in your key
│   └── .gitignore
└── frontend/         ← React + Vite UI
    ├── src/
    │   ├── App.jsx
    │   ├── pages/
    │   └── components/
    ├── index.html
    ├── vite.config.js
    └── package.json
```

**Key security design:**
- Your `GEMINI_API_KEY` lives ONLY in `backend/.env` — never in the frontend
- Frontend talks to your backend via `/api/*` — never directly to Gemini
- Uploaded files are wiped from disk immediately after analysis
- No transaction data is logged or stored

---

## ⚡ Quick Start (Local Dev — 10 minutes)

### Prerequisites
- Node.js 18+ (`node -v` to check)
- A free Gemini API key from https://aistudio.google.com/app/apikey

### Step 1 — Backend

```bash
cd backend
cp .env.example .env
# Edit .env and add your GEMINI_API_KEY
npm install
npm run dev
# ✅ API running at http://localhost:3001
```

### Step 2 — Frontend

```bash
cd frontend
npm install
npm run dev
# ✅ App running at http://localhost:5173
```

Open http://localhost:5173 and upload a bank statement or paste sample data.

---

## 🚀 Production Deployment

### Option A — Render.com (Recommended, Free Tier)

**Backend:**
1. Push your code to GitHub
2. Go to https://render.com → New → Web Service
3. Connect your repo, set root to `backend/`
4. Build command: `npm install`
5. Start command: `node server.js`
6. Add environment variable: `GEMINI_API_KEY=your_key_here`
7. Copy the deployed URL e.g. `https://moneyleak-api.onrender.com`

**Frontend:**
1. Render → New → Static Site
2. Root: `frontend/`
3. Build command: `npm install && npm run build`
4. Publish directory: `dist`
5. Add environment variable: `VITE_API_BASE_URL=https://moneyleak-api.onrender.com`
6. In `frontend/vite.config.js`, the proxy only applies to local dev — the `VITE_API_BASE_URL` handles production

---

### Option B — Railway.app

**Backend:**
```bash
cd backend
railway init
railway add
# Set GEMINI_API_KEY in Railway dashboard → Variables
railway up
```

**Frontend:**
```bash
cd frontend
# Set VITE_API_BASE_URL=https://your-railway-backend-url.up.railway.app
npm run build
# Deploy dist/ to Netlify, Vercel, or Cloudflare Pages
```

---

### Option C — Vercel (Frontend) + Railway (Backend)

**Backend on Railway:** (see above)

**Frontend on Vercel:**
```bash
cd frontend
npx vercel
# Set VITE_API_BASE_URL in Vercel project settings → Environment Variables
```

---

### Option D — VPS / Ubuntu Server

```bash
# Install Node.js 20
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# Backend
cd /var/www/moneyleak/backend
cp .env.example .env
nano .env    # Add GEMINI_API_KEY
npm install
npm install -g pm2
pm2 start server.js --name moneyleak-api
pm2 startup && pm2 save

# Frontend build
cd /var/www/moneyleak/frontend
npm install
VITE_API_BASE_URL=https://yourdomain.com npm run build
# Serve dist/ with nginx
```

**Nginx config snippet:**
```nginx
server {
    listen 80;
    server_name yourdomain.com;

    # Frontend
    location / {
        root /var/www/moneyleak/frontend/dist;
        try_files $uri $uri/ /index.html;
    }

    # Backend proxy
    location /api/ {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

---

## 🔑 Environment Variables Reference

### Backend (`backend/.env`)
| Variable | Required | Description |
|----------|----------|-------------|
| `GEMINI_API_KEY` | ✅ Yes | From https://aistudio.google.com/app/apikey |
| `PORT` | No | Default: 3001 |
| `FRONTEND_URL` | No | For CORS. Default: http://localhost:5173 |

### Frontend (`frontend/.env` — for production only)
| Variable | Required | Description |
|----------|----------|-------------|
| `VITE_API_BASE_URL` | Production only | Your deployed backend URL |

In local dev, the Vite proxy in `vite.config.js` handles routing automatically — no frontend `.env` needed.

---

## 💰 Gemini Free Tier Limits (as of 2024)

| Model | Free RPM | Free TPM | Daily Limit |
|-------|----------|----------|-------------|
| gemini-2.0-flash | 15 | 1,000,000 | 1,500 req/day |

This is **more than enough for a POC**. For production at scale, consider the paid tier.

Get your key: https://aistudio.google.com/app/apikey (no credit card needed)

---

## 📊 Features

- **Full Analysis** — 360° financial forensics with 15+ scores
- **Money Leak Detection** — finds forgotten subscriptions, hidden charges, waste
- **Behavioral Analysis** — detects impulse, stress, late-night spending patterns
- **Subscription Audit** — categorizes every recurring charge with cancel/keep advice
- **Risk Alerts** — debt trap, liquidity risk, lifestyle inflation warnings
- **12-Month Projection** — savings trajectory and burn rate forecasting
- **AI Chat Coach** — conversational financial advice powered by Gemini

## 📁 Supported Input Formats
- PDF bank statements (including password-protected)
- JPG/PNG screenshots of statements
- CSV/TXT transaction exports
- Pasted transaction text

---

## 🛡️ Security Notes

1. Never commit `.env` files (already in `.gitignore`)
2. The API key is only used server-side — cannot be extracted from the browser
3. Uploaded files are stored only in `backend/tmp_uploads/` and deleted immediately after processing
4. No transaction data is persisted anywhere

---

*"Small leaks sink big ships. Awareness is your first financial superpower."*
