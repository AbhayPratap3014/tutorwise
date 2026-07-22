const { supabaseAdmin } = require("../config/supabase");

function throwIfError(error, message) {
  if (error) {
    const err = new Error(message || error.message);
    err.status = 400;
    err.publicMessage = message || error.message;
    throw err;
  }
}

// ---------- Profiles ----------

async function getProfile(userId) {
  const { data, error } = await supabaseAdmin
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .single();
  throwIfError(error, "Could not load profile.");
  return data;
}

async function upsertProfile(userId, fields) {
  const { data, error } = await supabaseAdmin
    .from("profiles")
    .upsert({ id: userId, ...fields, updated_at: new Date().toISOString() })
    .select()
    .single();
  throwIfError(error, "Could not update profile.");
  return data;
}

// ---------- Test results ----------

async function saveTestResult(userId, result) {
  const { data, error } = await supabaseAdmin
    .from("test_results")
    .insert({
      user_id: userId,
      class_num: result.classNum,
      subject: result.subject,
      chapter: result.chapter,
      difficulty: result.difficulty,
      score: result.score,
      total_questions: result.totalQuestions,
      correct_count: result.correctCount,
      wrong_count: result.wrongCount,
      skipped_count: result.skippedCount,
      time_taken_seconds: result.timeTakenSeconds,
      answers: result.answers, // jsonb: per-question detail
      analysis: result.analysis, // jsonb: AI mistake analysis / study plan
      created_at: new Date().toISOString(),
    })
    .select()
    .single();
  throwIfError(error, "Could not save test result.");
  return data;
}

async function getTestHistory(userId, limit = 20) {
  const { data, error } = await supabaseAdmin
    .from("test_results")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(limit);
  throwIfError(error, "Could not load test history.");
  return data;
}

async function getDashboardStats(userId) {
  const { data, error } = await supabaseAdmin
    .from("test_results")
    .select("subject, score, total_questions, correct_count, created_at")
    .eq("user_id", userId);
  throwIfError(error, "Could not load dashboard stats.");

  const totalTests = data.length;
  const avgScore = totalTests
    ? Math.round(data.reduce((sum, t) => sum + (t.score / t.total_questions) * 100, 0) / totalTests)
    : 0;

  const bySubject = {};
  data.forEach((t) => {
    if (!bySubject[t.subject]) bySubject[t.subject] = { correct: 0, total: 0 };
    bySubject[t.subject].correct += t.correct_count;
    bySubject[t.subject].total += t.total_questions;
  });

  const subjectAccuracy = Object.entries(bySubject).map(([subject, v]) => ({
    subject,
    accuracy: v.total ? Math.round((v.correct / v.total) * 100) : 0,
  }));

  const strongSubjects = [...subjectAccuracy].sort((a, b) => b.accuracy - a.accuracy).slice(0, 2);
  const weakSubjects = [...subjectAccuracy].sort((a, b) => a.accuracy - b.accuracy).slice(0, 2);

  return { totalTests, avgScore, subjectAccuracy, strongSubjects, weakSubjects, recentTests: data.slice(-5).reverse() };
}

// ---------- Admin ----------

async function getAllUsersWithStats() {
  const { data: profiles, error } = await supabaseAdmin.from("profiles").select("*");
  throwIfError(error, "Could not load users.");

  const { data: results, error: resultsError } = await supabaseAdmin
    .from("test_results")
    .select("user_id, score, total_questions");
  throwIfError(resultsError, "Could not load test results for analytics.");

  return profiles.map((p) => {
    const userResults = results.filter((r) => r.user_id === p.id);
    const avgScore = userResults.length
      ? Math.round(userResults.reduce((s, r) => s + (r.score / r.total_questions) * 100, 0) / userResults.length)
      : 0;
    return { ...p, testsCompleted: userResults.length, avgScore };
  });
}

async function deleteUser(userId) {
  const { error } = await supabaseAdmin.auth.admin.deleteUser(userId);
  throwIfError(error, "Could not delete user.");
  return true;
}

async function getPlatformAnalytics() {
  const { data: results, error } = await supabaseAdmin
    .from("test_results")
    .select("subject, class_num, score, total_questions, created_at");
  throwIfError(error, "Could not load analytics.");

  const { count: userCount, error: userErr } = await supabaseAdmin
    .from("profiles")
    .select("*", { count: "exact", head: true });
  throwIfError(userErr, "Could not count users.");

  return {
    totalUsers: userCount || 0,
    totalTests: results.length,
    avgScore: results.length
      ? Math.round(results.reduce((s, r) => s + (r.score / r.total_questions) * 100, 0) / results.length)
      : 0,
  };
}

module.exports = {
  getProfile,
  upsertProfile,
  saveTestResult,
  getTestHistory,
  getDashboardStats,
  getAllUsersWithStats,
  deleteUser,
  getPlatformAnalytics,
};
