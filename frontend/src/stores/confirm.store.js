import { defineStore } from "pinia";

export const useConfirmStore = defineStore("confirm", {
  state: () => ({
    show: false,
    title: "Konfirmasi",
    message: "",
    confirmText: "Ya, Lanjutkan",
    cancelText: "Batal",
    type: "danger",
    loading: false,
    resolveFn: null,
  }),

  actions: {
    open({ title, message, confirmText, cancelText, type = "danger" }) {
      this.title = title || "Konfirmasi";
      this.message = message || "";
      this.confirmText = confirmText || "Ya, Lanjutkan";
      this.cancelText = cancelText || "Batal";
      this.type = type;
      this.loading = false;
      this.show = true;

      return new Promise((resolve) => {
        this.resolveFn = resolve;
      });
    },

    confirm() {
      if (this.resolveFn) this.resolveFn(true);
      this.show = false;
    },

    cancel() {
      if (this.resolveFn) this.resolveFn(false);
      this.show = false;
    },

    setLoading(val) {
      this.loading = val;
    },
  },
});
