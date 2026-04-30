import { defineStore } from "pinia";

export const useAlertStore = defineStore("alert", {
  state: () => ({
    alerts: [],
  }),

  actions: {
    add({ type = "info", title = "", message, duration = 3000 }) {
      const id = Date.now();
      this.alerts.push({ id, type, title, message });
      if (duration > 0) {
        setTimeout(() => this.remove(id), duration);
      }
    },

    success(message, title = "") {
      this.add({ type: "success", title, message });
    },

    error(message, title = "") {
      this.add({ type: "error", title, message, duration: 5000 });
    },

    warning(message, title = "") {
      this.add({ type: "warning", title, message });
    },

    info(message, title = "") {
      this.add({ type: "info", title, message });
    },

    remove(id) {
      this.alerts = this.alerts.filter((a) => a.id !== id);
    },
  },
});
