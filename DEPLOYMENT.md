# Deployment Guide: CBSE Class 12 Board Exam Study Tracker

The project is cleanly split into two independent, self-contained sub-projects:
- `frontend/` (Next.js 15 App Router + Tailwind CSS + TypeScript + Zustand + Motion + GSAP)
- `backend/` (Express.js + SQLite DatabaseSync + Groq AI / xAI OpenAI-compatible endpoints)

---

## 1. Local Development (Running Separately or Together)

### Option A: Run Both in Dedicated Windows (Recommended)
Double-click `run-both.bat`. This automatically opens two separate command prompt windows:
- **Backend window** on `http://localhost:5000`
- **Frontend window** on `http://localhost:3000`

### Option B: Run Standalone Manually
- **To run Frontend only:**
  ```bash
  cd frontend
  npm run dev
  ```
  App opens on: `http://localhost:3000`

- **To run Backend only:**
  ```bash
  cd backend
  npm run dev
  ```
  API opens on: `http://localhost:5000`

---

## 2. Deploying the Backend (Express + SQLite + Groq AI)

You can deploy the `backend` folder to **Render**, **Railway**, **Fly.io**, or any Node.js hosting platform.

### Deploying to Render (Recommended):
1. Create an account on [render.com](https://render.com).
2. Click **New +** -> **Web Service**.
3. Connect your Git repository.
4. Configure the settings:
   - **Root Directory**: `backend`
   - **Environment**: `Node`
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`
5. In **Environment Variables**, add:
   - `PORT`: `5000` (or leave default for Render to assign)
   - `NODE_ENV`: `production`
   - `CORS_ORIGIN`: Your frontend URL (e.g., `https://cbse12-tracker.vercel.app`) or `*`
   - `GROQ_API_KEY`: `gsk_...` (Your Groq API key)
   - `GROQ_MODEL`: `openai/gpt-oss-120b` (or `openai/gpt-oss-20b`)
6. Click **Deploy Web Service**.
7. Copy your backend live URL (e.g. `https://cbse12-tracker-api.onrender.com`).

---

## 3. Deploying the Frontend (Next.js 15 to Vercel)

1. Create an account on [vercel.com](https://vercel.com).
2. Click **Add New...** -> **Project**.
3. Import your Git repository.
4. In the configuration screen:
   - **Root Directory**: Click *Edit* and select `frontend`.
   - **Framework Preset**: `Next.js` (automatically detected).
5. In **Environment Variables**, add:
   - `NEXT_PUBLIC_API_URL`: Your deployed backend URL from Step 2 (e.g. `https://cbse12-tracker-api.onrender.com`).
6. Click **Deploy**.

Your frontend is now live globally with offline-first synchronization to your deployed backend!
