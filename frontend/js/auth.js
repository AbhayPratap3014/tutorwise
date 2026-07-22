// Thin wrapper around Supabase Auth. Every page that needs a logged-in
// user should call TutorwiseAuth.requireSession() on load.
const TutorwiseAuth = {
  async register(email, password, name, classNum) {
    const { data, error } = await window.supabaseClient.auth.signUp({ email, password });
    if (error) throw error;

    // Create the app-side profile row via the backend, using the fresh session token.
    const token = data.session?.access_token;
    if (token) {
      await fetch(`${window.TUTORWISE_CONFIG.API_BASE_URL}/auth/complete-registration`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ name, classNum }),
      });
    }
    return data;
  },

  async login(email, password) {
    const { data, error } = await window.supabaseClient.auth.signInWithPassword({ email, password });
    if (error) throw error;
    return data;
  },

  async loginWithProvider(provider) {
    const { error } = await window.supabaseClient.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${window.location.origin}/pages/dashboard.html`,
      },
    });
    if (error) throw error;
  },

  async logout() {
    await window.supabaseClient.auth.signOut();
    window.location.href = "/pages/login.html";
  },

  async sendPasswordReset(email) {
    const { error } = await window.supabaseClient.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/pages/reset-password.html`,
    });
    if (error) throw error;
  },

  async getSession() {
    const { data } = await window.supabaseClient.auth.getSession();
    return data.session;
  },

  // Redirects to login if there's no active session. Call at the top
  // of every protected page (dashboard, quiz, result, profile, admin).
  async requireSession() {
    try {
      const session = await this.getSession();
      if (!session) {
        await this.logout();
        return null;
      }
      return session;
    } catch (err) {
      await this.logout();
      return null;
    }
  },
};
