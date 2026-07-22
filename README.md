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

## Project Structure

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
│   └── schema.sql         # Supabase schema for profiles, test_results, prompt_templates
└── README.md
```

---

## Get Started

**Visit the live app:** [tutorwise.vercel.app](https://tutorwise.vercel.app)

1. Sign up with your email
2. Select your class (1–10)
3. Create a quiz → pick subject, chapter, difficulty
4. Answer 10 auto-generated questions
5. Get instant AI feedback and a personalized study plan

**It's free. No credit card needed.**

---

## For Developers

Want to run TutorWise locally or contribute? See [SETUP.md](./SETUP.md) for installation and deployment instructions.

---

## License

Built as a B.Tech Social Internship project for educational purposes (SDG 4 — Quality Education).

