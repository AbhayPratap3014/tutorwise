# TutorWise — AI-Powered Personalized Tutoring and Assessment Platform

A CBSE Classes 1–10 tutoring platform where students take AI-generated NCERT-style
quizzes, get instant scoring with charts, receive AI mistake analysis and a
personalized study plan, and track progress over time.

Built as a B.Tech Social Internship project (SDG 4 — Quality Education).

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
