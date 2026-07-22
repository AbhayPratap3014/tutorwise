(async function () {
  const session = await TutorwiseAuth.requireSession();
  if (!session) return;

  const stored = JSON.parse(sessionStorage.getItem("tutorwise_last_result") || "null");
  if (!stored) {
    window.location.href = "dashboard.html";
    return;
  }

  const { result, analysis } = stored;
  const answers = result.answers || [];
  const correct = result.correct_count;
  const wrong = result.wrong_count;
  const skipped = result.skipped_count;
  const total = result.total_questions;

  document.getElementById("scoreText").textContent = `${correct}/${total}`;
  document.getElementById("percentText").textContent = `${Math.round((correct / total) * 100)}% accuracy`;
  document.getElementById("correctStat").textContent = correct;
  document.getElementById("wrongStat").textContent = wrong;
  document.getElementById("skippedStat").textContent = skipped;
  document.getElementById("timeStat").textContent = result.time_taken_seconds
    ? `${Math.floor(result.time_taken_seconds / 60)}m ${result.time_taken_seconds % 60}s`
    : "—";

  new Chart(document.getElementById("pieChart"), {
    type: "pie",
    data: {
      labels: ["Correct", "Wrong", "Skipped"],
      datasets: [{
        data: [correct, wrong, skipped],
        backgroundColor: ["#00B894", "#E84393", "#FDCB6E"],
      }],
    },
    options: { plugins: { legend: { position: "bottom" } } },
  });

  // Topic-wise accuracy derived from per-question chapter tags
  const byTopic = {};
  answers.forEach((a) => {
    const key = a.chapter || "General";
    if (!byTopic[key]) byTopic[key] = { correct: 0, total: 0 };
    byTopic[key].total++;
    if (a.correct) byTopic[key].correct++;
  });
  const topics = Object.keys(byTopic);

  new Chart(document.getElementById("barChart"), {
    type: "bar",
    data: {
      labels: topics,
      datasets: [{
        label: "Accuracy %",
        data: topics.map((t) => Math.round((byTopic[t].correct / byTopic[t].total) * 100)),
        backgroundColor: "rgba(0,206,201,0.65)",
        borderRadius: 8,
      }],
    },
    options: { scales: { y: { beginAtZero: true, max: 100 } }, plugins: { legend: { display: false } } },
  });

  // AI analysis: mistake pattern, recommendations, suggested chapters, study plan
  if (analysis) {
    document.getElementById("analysisContent").innerHTML = `
      <p>${analysis.mistakeAnalysis || ""}</p>
      ${analysis.recommendations?.length ? `
        <p class="fw-semibold mb-1 mt-3">Recommendations</p>
        <ul>${analysis.recommendations.map((r) => `<li>${r}</li>`).join("")}</ul>` : ""}
      ${analysis.suggestedChapters?.length ? `
        <p class="fw-semibold mb-1 mt-3">Suggested chapters to revisit</p>
        <div class="d-flex flex-wrap gap-2 mb-2">
          ${analysis.suggestedChapters.map((c) => `<span class="badge bg-gradient-brand">${c}</span>`).join("")}
        </div>` : ""}
      ${analysis.studyPlan?.length ? `
        <p class="fw-semibold mb-1 mt-3">Suggested study plan</p>
        <div class="list-group">
          ${analysis.studyPlan.map((d) => `
            <div class="list-group-item bg-transparent border-0 border-bottom d-flex gap-2">
              <strong>Day ${d.day}:</strong> <span>${d.focus}</span>
            </div>`).join("")}
        </div>` : ""}
    `;
  }

  // Per-question review
  document.getElementById("reviewList").innerHTML = answers.map((a, i) => `
    <div class="mb-3 pb-3" style="border-bottom:1px solid var(--border);">
      <p class="mb-2"><strong>Q${i + 1}.</strong> ${a.question}</p>
      <p class="small mb-1">
        ${a.skipped
          ? '<span style="color:var(--warning)"><i class="fa-solid fa-circle-minus me-1"></i>Skipped</span>'
          : a.correct
            ? '<span style="color:var(--success)"><i class="fa-solid fa-circle-check me-1"></i>Correct</span>'
            : '<span style="color:var(--danger)"><i class="fa-solid fa-circle-xmark me-1"></i>Incorrect</span>'}
      </p>
      ${a.explanation ? `<p class="text-muted-soft small mb-0">${a.explanation}</p>` : ""}
    </div>
  `).join("");
})();
