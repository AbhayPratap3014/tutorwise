// Every call to the backend goes through here so the auth token and
// error handling are consistent across pages.
const TutorwiseAPI = {
  async _request(path, options = {}) {
    const session = await window.supabaseClient.auth.getSession();
    const token = session.data.session?.access_token;

    const res = await fetch(`${window.TUTORWISE_CONFIG.API_BASE_URL}${path}`, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...(options.headers || {}),
      },
    });

    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.error || `Request failed (${res.status})`);
    return data;
  },

  get(path) {
    return this._request(path, { method: "GET" });
  },
  post(path, body) {
    return this._request(path, { method: "POST", body: JSON.stringify(body) });
  },
  put(path, body) {
    return this._request(path, { method: "PUT", body: JSON.stringify(body) });
  },
  delete(path) {
    return this._request(path, { method: "DELETE" });
  },

  // ---------- Convenience methods matching backend routes ----------
  generateTest(payload) { return this.post("/tests/generate", payload); },
  submitTest(payload) { return this.post("/tests/submit", payload); },
  getHistory() { return this.get("/tests/history"); },
  getDashboardStats() { return this.get("/tests/dashboard"); },
  getProfile() { return this.get("/users/profile"); },
  updateProfile(payload) { return this.put("/users/profile", payload); },
  adminListUsers() { return this.get("/admin/users"); },
  adminDeleteUser(userId) { return this.delete(`/admin/users/${userId}`); },
  adminAnalytics() { return this.get("/admin/analytics"); },
};
