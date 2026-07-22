(async function () {
  const session = await TutorwiseAuth.requireSession();
  if (!session) return;

  try {
    const { profile } = await TutorwiseAPI.getProfile();
    document.getElementById("profileName").textContent = profile.name;
    document.getElementById("profileEmail").textContent = profile.email;
    document.getElementById("profileClass").textContent = `Class ${profile.class_num}`;
    document.getElementById("avatarInitial").textContent = (profile.name || "?").charAt(0).toUpperCase();
    document.getElementById("editName").value = profile.name;
    document.getElementById("editClass").value = profile.class_num;
  } catch (err) {
    console.error(err);
  }

  document.getElementById("editForm").addEventListener("submit", async (e) => {
    e.preventDefault();
    try {
      await TutorwiseAPI.updateProfile({
        name: document.getElementById("editName").value,
        classNum: Number(document.getElementById("editClass").value),
      });
      location.reload();
    } catch (err) {
      alert(err.message || "Couldn't save changes.");
    }
  });

  try {
    const { stats } = await TutorwiseAPI.getDashboardStats();
    document.getElementById("statTests").textContent = stats.totalTests;
    document.getElementById("statAvg").textContent = `${stats.avgScore}%`;
    document.getElementById("statStreak").textContent = stats.strongSubjects[0]?.subject || "—";
  } catch (err) {
    console.error(err);
  }

  try {
    const { history } = await TutorwiseAPI.getHistory();
    const body = document.getElementById("historyBody");
    if (!history.length) {
      body.innerHTML = `<tr><td colspan="5" class="text-center text-muted-soft py-4">No tests taken yet.</td></tr>`;
      return;
    }
    body.innerHTML = history.map((t) => `
      <tr>
        <td>${t.subject}</td>
        <td>Class ${t.class_num}</td>
        <td><span class="badge bg-gradient-brand">${t.difficulty}</span></td>
        <td>${t.correct_count}/${t.total_questions}</td>
        <td>${new Date(t.created_at).toLocaleDateString()}</td>
      </tr>`).join("");
  } catch (err) {
    console.error(err);
  }
})();
