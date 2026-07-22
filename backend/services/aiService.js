const fetch = require("node-fetch");
const { env } = require("../config/env");

/**
 * Strips markdown code fences a model sometimes wraps JSON in,
 * then parses it. Throws a descriptive error if parsing fails.
 */
function parseJsonResponse(raw) {
  const clean = raw.replace(/```json|```/g, "").trim();
  try {
    return JSON.parse(clean);
  } catch (err) {
    const parseErr = new Error("AI returned malformed JSON.");
    parseErr.status = 502;
    parseErr.publicMessage = "The AI response couldn't be parsed. Please try again.";
    throw parseErr;
  }
}

async function callClaude(prompt) {
  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": env.anthropicApiKey,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: env.anthropicModel,
      max_tokens: 2000,
      messages: [{ role: "user", content: prompt }],
    }),
  });
  if (!res.ok) throw new Error(`Claude API error: ${res.status} ${await res.text()}`);
  const data = await res.json();
  const text = data.content.map((b) => b.text || "").join("\n");
  return parseJsonResponse(text);
}

async function callOpenAI(prompt) {
  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${env.openaiApiKey}`,
    },
    body: JSON.stringify({
      model: env.openaiModel,
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" },
    }),
  });
  if (!res.ok) throw new Error(`OpenAI API error: ${res.status} ${await res.text()}`);
  const data = await res.json();
  return parseJsonResponse(data.choices[0].message.content);
}

async function callGemini(prompt) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${env.geminiModel}:generateContent?key=${env.geminiApiKey}`;
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: { responseMimeType: "application/json" },
    }),
  });
  if (!res.ok) throw new Error(`Gemini API error: ${res.status} ${await res.text()}`);
  const data = await res.json();
  const text = data.candidates[0].content.parts[0].text;
  return parseJsonResponse(text);
}

/**
 * Single entry point used by controllers. Routes to whichever
 * provider is configured via AI_PROVIDER, so swapping providers
 * never requires touching controller code.
 */
async function generateFromPrompt(prompt) {
  switch (env.aiProvider) {
    case "openai":
      return callOpenAI(prompt);
    case "gemini":
      return callGemini(prompt);
    case "claude":
    default:
      return callClaude(prompt);
  }
}

module.exports = { generateFromPrompt };
