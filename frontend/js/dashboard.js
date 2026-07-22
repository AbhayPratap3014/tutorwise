(async function () {
  const session = await TutorwiseAuth.requireSession();
  if (!session) return;

  // Show admin nav link if the current user is an admin (best-effort;
  // the backend still enforces this on every admin request regardless).
  try {
    const { profile } = await TutorwiseAPI.getProfile();
    document.getElementById("welcomeMsg").textContent = `Welcome back, ${profile?.name?.split(" ")[0] || "Student"} 👋`;
  } catch (e) {
    console.error(e);
  }

  try {
    const { stats } = await TutorwiseAPI.getDashboardStats();
    renderStatCards(stats);
    renderSubjectChart(stats.subjectAccuracy);
    renderStrongWeak(stats.strongSubjects, stats.weakSubjects);
    renderRecentTests(stats.recentTests);
  } catch (err) {
    console.error(err);
    document.getElementById("statCards").innerHTML =
      `<div class="col-12"><div class="alert alert-danger">Couldn't load your stats: ${err.message}</div></div>`;
  }

  function renderStatCards(stats) {
    document.getElementById("statCards").innerHTML = `
      <div class="col-6 col-md-3"><div class="solid-card stat-card">
        <div class="stat-value">${stats.totalTests}</div><div class="stat-label">Tests completed</div>
      </div></div>
      <div class="col-6 col-md-3"><div class="solid-card stat-card">
        <div class="stat-value">${stats.avgScore}%</div><div class="stat-label">Average score</div>
      </div></div>
      <div class="col-6 col-md-3"><div class="solid-card stat-card">
        <div class="stat-value">${stats.subjectAccuracy.length}</div><div class="stat-label">Subjects tracked</div>
      </div></div>
      <div class="col-6 col-md-3"><div class="solid-card stat-card">
        <div class="stat-value">${stats.strongSubjects[0]?.subject || "—"}</div><div class="stat-label">Strongest subject</div>
      </div></div>`;
  }

  function renderSubjectChart(subjectAccuracy) {
    const avg = subjectAccuracy.length
      ? Math.round(subjectAccuracy.reduce((sum, s) => sum + s.accuracy, 0) / subjectAccuracy.length)
      : 0;
    document.getElementById("avgScore").textContent = `${avg}%`;

    const ringCtx = document.getElementById("subjectRingChart");
    new Chart(ringCtx, {
      type: "doughnut",
      data: {
        labels: ["Accuracy", "Remaining"],
        datasets: [{
          data: [avg, 100 - avg],
          backgroundColor: ["rgba(108,92,231,0.9)", "rgba(255,255,255,0.12)"],
          borderWidth: 0,
          cutout: "78%",
        }],
      },
      options: {
        responsive: true,
        plugins: { legend: { display: false } },
      },
    });

    const barCtx = document.getElementById("subjectBarChart");
    new Chart(barCtx, {
      type: "bar",
      data: {
        labels: subjectAccuracy.map((s) => s.subject),
        datasets: [{
          label: "Accuracy %",
          data: subjectAccuracy.map((s) => s.accuracy),
          backgroundColor: subjectAccuracy.map((s) => s.subject === "Math" ? "rgba(20, 184, 166, 0.9)" : "rgba(99, 102, 241, 0.85)"),
          borderRadius: 8,
        }],
      },
      options: {
        responsive: true,
        scales: { y: { beginAtZero: true, max: 100, grid: { color: "rgba(255,255,255,0.08)" } }, x: { grid: { display: false } } },
        plugins: { legend: { display: false } },
      },
    });
  }

  function renderStrongWeak(strong, weak) {
    const rows = (list, icon, color) =>
      list.map((s) => `
        <div class="d-flex justify-content-between align-items-center py-2">
          <span><i class="fa-solid ${icon} me-2" style="color:${color}"></i>${s.subject}</span>
          <span class="fw-semibold">${s.accuracy}%</span>
        </div>`).join("");

    document.getElementById("strongWeakList").innerHTML = `
      <p class="text-muted-soft small mb-1">Strong</p>
      ${rows(strong, "fa-arrow-trend-up", "var(--success)") || '<p class="text-muted-soft small">Not enough data yet.</p>'}
      <hr style="border-color:var(--border);">
      <p class="text-muted-soft small mb-1">Needs work</p>
      ${rows(weak, "fa-arrow-trend-down", "var(--danger)") || '<p class="text-muted-soft small">Not enough data yet.</p>'}
    `;
  }

  function renderRecentTests(tests) {
    const body = document.getElementById("recentTestsBody");
    if (!tests.length) {
      body.innerHTML = "";
      document.getElementById("emptyState").classList.remove("d-none");
      return;
    }
    body.innerHTML = tests.map((t) => `
      <tr>
        <td>${t.subject}</td>
        <td>Class ${t.class_num || "-"}</td>
        <td><span class="badge bg-gradient-brand">${t.difficulty || "-"}</span></td>
        <td>${t.correct_count}/${t.total_questions}</td>
        <td>${new Date(t.created_at).toLocaleDateString()}</td>
      </tr>`).join("");
  }
})();
