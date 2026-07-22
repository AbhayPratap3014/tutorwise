(async function () {
  const session = await TutorwiseAuth.requireSession();
  if (!session) return;

  try {
    const { analytics } = await TutorwiseAPI.adminAnalytics();
    document.getElementById("adminContent").classList.remove("d-none");
    document.getElementById("analyticsCards").innerHTML = `
      <div class="col-md-4"><div class="solid-card stat-card">
        <div class="stat-value">${analytics.totalUsers}</div><div class="stat-label">Total users</div>
      </div></div>
      <div class="col-md-4"><div class="solid-card stat-card">
        <div class="stat-value">${analytics.totalTests}</div><div class="stat-label">Tests taken</div>
      </div></div>
      <div class="col-md-4"><div class="solid-card stat-card">
        <div class="stat-value">${analytics.avgScore}%</div><div class="stat-label">Platform avg score</div>
      </div></div>`;
  } catch (err) {
    // A 403 from the backend means this user isn't in ADMIN_EMAILS.
    document.getElementById("accessDenied").classList.remove("d-none");
    document.getElementById("accessDenied").textContent = err.message || "You don't have admin access.";
    return;
  }

  async function loadUsers() {
    const { users } = await TutorwiseAPI.adminListUsers();
    document.getElementById("usersBody").innerHTML = users.map((u) => `
      <tr>
        <td>${u.name}</td>
        <td>${u.email}</td>
        <td>Class ${u.class_num}</td>
        <td>${u.testsCompleted}</td>
        <td>${u.avgScore}%</td>
        <td><button class="btn btn-sm btn-outline-danger" data-user-id="${u.id}">Delete</button></td>
      </tr>`).join("");

    document.querySelectorAll("[data-user-id]").forEach((btn) => {
      btn.addEventListener("click", async () => {
        if (!confirm("Permanently delete this user and all their data?")) return;
        try {
          await TutorwiseAPI.adminDeleteUser(btn.dataset.userId);
          loadUsers();
        } catch (err) {
          alert(err.message || "Couldn't delete user.");
        }
      });
    });
  }

  loadUsers();
})();
