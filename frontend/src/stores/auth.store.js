import { defineStore } from "pinia";
import { login, logout, getMe } from "@/services/modules/auth";

export const useAuthStore = defineStore("auth", {
  state: () => ({
    user: null,
    token: localStorage.getItem("token") || null,
    loading: false,
    error: null,
  }),

  getters: {
    isAuthenticated: (state) => !!state.token,
    isAdmin: (state) => state.user?.role === "admin",
    isManager: (state) => state.user?.role === "manager",
    isStaff: (state) => state.user?.role === "staff",
  },

  actions: {
    async login(credentials) {
      this.loading = true;
      this.error = null;
      try {
        const res = await login(credentials);
        this.token = res.data.data.token;
        this.user = res.data.data.user;
        localStorage.setItem("token", this.token);
      } catch (err) {
        this.error = err.response?.data?.error || "Login gagal.";
        throw err;
      } finally {
        this.loading = false;
      }
    },

    async fetchMe() {
      try {
        const res = await getMe();
        this.user = res.data.data;
      } catch (err) {
        this.logout();
      }
    },

    async logout() {
      try {
        await logout();
      } catch (err) {}
      this.user = null;
      this.token = null;
      localStorage.removeItem("token");
    },
  },
});
