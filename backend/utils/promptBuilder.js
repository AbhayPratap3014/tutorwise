/**
 * Builds the prompt used to generate a set of NCERT-style MCQs.
 * Kept centralized so the "Manage AI prompt templates" admin feature
 * has one place to read/update the template from.
 */
function buildQuestionPrompt({ classNum, subject, chapter, difficulty, count }) {
  const chapterLine = chapter
    ? `Focus specifically on the NCERT chapter: "${chapter}".`
    : "Cover a reasonable spread of topics from the NCERT syllabus for this subject and class.";

  return `You are an expert CBSE curriculum designer.
Generate exactly ${count} multiple-choice questions for Class ${classNum} ${subject}, difficulty level: ${difficulty}.
${chapterLine}
Base every question strictly on the official NCERT syllabus and phrasing conventions for this class.

For each question include:
- "question": the question text
- "options": an array of exactly 4 answer choices
- "correctIndex": zero-based index of the correct option
- "explanation": 2-3 sentences explaining why the correct answer is right, written directly to the student
- "difficulty": one of "easy", "medium", "hard"
- "chapter": the NCERT chapter this question belongs to

Return ONLY minified JSON matching this exact shape, no markdown fences, no commentary:
{"questions":[{"question":"...","options":["...","...","...","..."],"correctIndex":0,"explanation":"...","difficulty":"easy","chapter":"..."}]}`;
}

/**
 * Builds the prompt used to generate post-test analysis: mistake
 * patterns, topic-wise performance, and a personalized study plan.
 */
function buildAnalysisPrompt({ classNum, subject, answers }) {
  const answerSummary = answers
    .map(
      (a, i) =>
        `${i + 1}. [${a.chapter}] ${a.correct ? "Correct" : "Incorrect"} (difficulty: ${a.difficulty})`
    )
    .join("\n");

  return `A Class ${classNum} student just completed a ${subject} test. Here is their per-question result:
${answerSummary}

Based on this, provide:
- "mistakeAnalysis": 2-3 sentences describing patterns in what they got wrong
- "topicPerformance": array of {"topic": string, "accuracy": number 0-100}
- "recommendations": array of 2-4 short, specific, actionable study tips
- "suggestedChapters": array of 1-3 NCERT chapter names worth revisiting
- "studyPlan": array of {"day": number, "focus": string} for a short 3-5 day plan

Return ONLY minified JSON, no markdown, no commentary, in this exact shape:
{"mistakeAnalysis":"...","topicPerformance":[{"topic":"...","accuracy":0}],"recommendations":["..."],"suggestedChapters":["..."],"studyPlan":[{"day":1,"focus":"..."}]}`;
}

module.exports = { buildQuestionPrompt, buildAnalysisPrompt };
