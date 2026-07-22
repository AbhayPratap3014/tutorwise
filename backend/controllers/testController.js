const { generateFromPrompt } = require("../services/aiService");
const { buildQuestionPrompt, buildAnalysisPrompt } = require("../utils/promptBuilder");
const supabaseService = require("../services/supabaseService");

const VALID_DIFFICULTY = ["easy", "medium", "hard"];

async function generateTest(req, res, next) {
  try {
    const { classNum, subject, chapter, difficulty, numQuestions } = req.body;

    if (!classNum || classNum < 1 || classNum > 10) {
      return res.status(400).json({ error: "classNum must be between 1 and 10." });
    }
    if (!subject) return res.status(400).json({ error: "subject is required." });
    if (!VALID_DIFFICULTY.includes(difficulty)) {
      return res.status(400).json({ error: "difficulty must be easy, medium, or hard." });
    }
    const count = Math.min(Math.max(Number(numQuestions) || 10, 1), 25);

    const prompt = buildQuestionPrompt({ classNum, subject, chapter, difficulty, count });
    const result = await generateFromPrompt(prompt);

    if (!result?.questions?.length) {
      return res.status(502).json({ error: "AI did not return any questions. Try again." });
    }

    res.json({ questions: result.questions, meta: { classNum, subject, chapter, difficulty } });
  } catch (err) {
    next(err);
  }
}

async function submitTest(req, res, next) {
  try {
    const { classNum, subject, chapter, difficulty, answers, timeTakenSeconds } = req.body;
    // answers: [{ question, chapter, difficulty, selectedIndex, correctIndex, correct, skipped }]

    if (!Array.isArray(answers) || answers.length === 0) {
      return res.status(400).json({ error: "answers array is required." });
    }

    const correctCount = answers.filter((a) => a.correct).length;
    const skippedCount = answers.filter((a) => a.skipped).length;
    const wrongCount = answers.length - correctCount - skippedCount;
    const score = correctCount;

    const analysisPrompt = buildAnalysisPrompt({ classNum, subject, answers });
    let analysis = null;
    try {
      analysis = await generateFromPrompt(analysisPrompt);
    } catch (e) {
      // Analysis is a nice-to-have; don't fail the whole submission if it errors.
      console.error("Analysis generation failed:", e.message);
    }

    const saved = await supabaseService.saveTestResult(req.user.id, {
      classNum,
      subject,
      chapter,
      difficulty,
      score,
      totalQuestions: answers.length,
      correctCount,
      wrongCount,
      skippedCount,
      timeTakenSeconds,
      answers,
      analysis,
    });

    res.status(201).json({ result: saved, analysis });
  } catch (err) {
    next(err);
  }
}

async function getHistory(req, res, next) {
  try {
    const history = await supabaseService.getTestHistory(req.user.id);
    res.json({ history });
  } catch (err) {
    next(err);
  }
}

async function getDashboard(req, res, next) {
  try {
    const stats = await supabaseService.getDashboardStats(req.user.id);
    res.json({ stats });
  } catch (err) {
    next(err);
  }
}

module.exports = { generateTest, submitTest, getHistory, getDashboard };
