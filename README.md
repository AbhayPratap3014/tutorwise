# TutorWise — AI-Powered Personalized Tutoring for CBSE

**TutorWise** is an adaptive AI tutoring platform that helps CBSE students (Classes 1–10) study smarter, not harder.

## What It Does

1. **AI-Generated Quizzes** — Pick your subject, chapter, and difficulty level. TutorWise instantly generates unique NCERT-aligned questions tailored to your learning level.

2. **Instant Feedback & Scoring** — Complete a quiz and get:
   - Your score breakdown (topic-wise accuracy)
   - Which topics you're strong in and where you're struggling
   - Explanation of why you got answers wrong

3. **AI Mistake Analysis** — Our AI analyzes each wrong answer and explains:
   - The core concept you missed
   - Common misconceptions
   - How to approach similar problems

4. **Personalized Study Plan** — After each quiz, get a custom 7-day study plan that focuses on your weak areas:
   - Prioritized topics to revise
   - Estimated time to spend on each topic
   - Link to NCERT chapters for reference

5. **Progress Tracking** — Dashboard shows:
   - All your past quiz attempts with scores
   - Progress charts for each subject and topic
   - Trending weak areas
   - Time spent studying

## How It Works

**For Students:**
1. Sign up and select your class
2. Go to Dashboard → "Create Quiz"
3. Pick a subject, chapter, and difficulty
4. Answer 10 auto-generated questions
5. Get instant score breakdown and AI-powered mistake analysis
6. Receive a personalized study plan
7. Track progress in your profile

**Under the Hood:**
- Frontend calls `/api/quiz/generate` with chapter + difficulty
- Backend uses **Claude/OpenAI/Gemini API** to generate questions
- Responses stored in **Supabase PostgreSQL**
- Student answers evaluated by AI for explanations
- Progress data aggregated into charts (Chart.js)
- All data encrypted and secured with Row Level Security

## Why It's Different

| Feature | TutorWise | Traditional Tutoring | Generic Quiz Sites |
|---------|-----------|---------------------|-------------------|
| AI-Generated | ✅ Every quiz is unique | ❌ One-size-fits-all | ✅ But generic |
| Adaptive Difficulty | ✅ Adjusts to your level | ⚠️ Fixed by tutor | ❌ No adaptation |
| Instant Feedback | ✅ Immediate AI analysis | ⚠️ Wait for tutor | ✅ But shallow |
| Study Plan | ✅ AI-powered, personalized | ✅ But manual | ❌ None |
| NCERT-Aligned | ✅ Built for CBSE | ✅ Some tutors are | ❌ Generic questions |
| 24/7 Availability | ✅ Always on | ❌ Limited hours | ✅ But impersonal |
| Cost | ✅ Free | ❌ ₹500–2000/hour | ✅ But limited features |

## Built For SDG 4 (Quality Education)

TutorWise is built to make personalized tutoring accessible to every student, regardless of their background or resources. No paywalls. No subscriptions. Just pure, AI-powered learning.

**Built as a B.Tech Social Internship project.**

---

## Tech stack

| Layer      | Technology |
|------------|------------|
| Frontend   | HTML5, CSS3, Vanilla JS, Bootstrap 5, Chart.js, Font Awesome |
| Backend    | Node.js, Express.js |
| Database & Auth | Supabase (PostgreSQL + Supabase Auth) |
| AI         | Claude (default) / OpenAI / Gemini — swappable via env var |
| Deployment | Frontend → Vercel · Backend → Render/Railway · DB → Supabase free tier |

No MongoDB, Docker, Kubernetes, or Redis — kept intentionally simple to deploy
on free tiers.

---

## Project structure

```
tutorwise/
├── backend/
│   ├── config/          # env loader, Supabase client
│   ├── controllers/     # request handlers
│   ├── middleware/      # auth guard, error handler
│   ├── routes/          # Express routers
│   ├── services/        # AI provider abstraction, Supabase queries
│   ├── utils/           # prompt templates
│   ├── server.js
│   ├── package.json
│   └── .env.example
├── frontend/
│   ├── css/style.css
│   ├── js/               # config, supabase client, auth, api, theme, page scripts
│   ├── pages/             # login, register, dashboard, quiz-setup, quiz, result, profile, admin
│   └── index.html         # marketing home page
├── database/
│   └── schema.sql         # run in Supabase SQL editor
└── README.md
```

---

## 1. Set up Supabase

1. Create a free project at [supabase.com](https://supabase.com).
2. In **SQL Editor**, run `database/schema.sql` — this creates `profiles`,
   `test_results`, and `prompt_templates` tables with Row Level Security enabled.
3. In **Authentication → Providers**, make sure **Email** is enabled.
4. In **Authentication → URL Configuration**, add your frontend URL (e.g.
   `http://localhost:5500` for local dev, your Vercel URL for production) to
   the redirect allow-list — needed for the password-reset flow.
5. Copy from **Project Settings → API**:
   - `Project URL` → `SUPABASE_URL`
   - `anon public` key → `SUPABASE_ANON_KEY`
   - `service_role` key → `SUPABASE_SERVICE_ROLE_KEY` (backend only — never expose this in frontend code)

---

## 2. Backend setup

```bash
cd backend
npm install
cp .env.example .env
```

Fill in `.env`:
- `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `SUPABASE_ANON_KEY` from step 1
- `ANTHROPIC_API_KEY` (get one at [console.anthropic.com](https://console.anthropic.com)) — or set `AI_PROVIDER=openai`/`gemini` and fill the matching key instead
- `ADMIN_EMAILS` — comma-separated emails that should see `/admin`
- `FRONTEND_URL` — your frontend's origin, for CORS

Run it:
```bash
npm run dev     # nodemon, auto-restarts on change
# or
npm start
```

Visit `http://localhost:5000/api/health` — should return `{"status":"ok"}`.

---

## 3. Frontend setup

Edit `frontend/js/config.js`:
```js
window.TUTORWISE_CONFIG = {
  SUPABASE_URL: "https://your-project.supabase.co",
  SUPABASE_ANON_KEY: "your-anon-key",
  API_BASE_URL: "http://localhost:5000/api",
};
```

Serve the `frontend` folder with any static server, e.g.:
```bash
cd frontend
npx serve .
# or use the VS Code "Live Server" extension
```

Open the site, register an account, and take a test end to end.

---

## 4. Deployment

### Frontend → Vercel
1. Push the repo to GitHub.
2. In Vercel, "New Project" → select the repo → set **Root Directory** to `frontend`.
3. Before deploying, update `frontend/js/config.js` with your **production**
   `API_BASE_URL` (your Render/Railway backend URL) and Supabase keys.
4. Deploy. Vercel serves static HTML/CSS/JS with no build step needed.

### Backend → Render or Railway
1. New Web Service → select the repo → set **Root Directory** to `backend`.
2. Build command: `npm install`. Start command: `npm start`.
3. Add all variables from `.env.example` in the service's environment settings.
4. Set `FRONTEND_URL` to your deployed Vercel URL (for CORS).
5. Deploy, then update `frontend/js/config.js`'s `API_BASE_URL` to this
   service's URL and redeploy the frontend.

### Database → Supabase
Already hosted — nothing to deploy. Just make sure your production frontend
URL is in the Auth redirect allow-list (step 1.4).

---

## 5. Admin access

Add your account's email to `ADMIN_EMAILS` in the backend `.env` (or your
Render/Railway environment variables), then visit `/pages/admin.html` while
logged in as that user.

---

## Notes on AI provider swapping

`backend/services/aiService.js` exposes one function, `generateFromPrompt(prompt)`,
that routes to Claude, OpenAI, or Gemini based on `AI_PROVIDER`. Every
controller calls this one function — switching providers never requires
touching controller code, only the `.env` value and matching API key.

## Notes on the sandboxed build

This codebase was generated in an offline sandbox, so `npm install` and live
API calls were not run here — follow the setup steps above to install
dependencies and verify end-to-end locally before your demo/submission.
