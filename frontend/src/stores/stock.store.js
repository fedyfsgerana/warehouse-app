import { defineStore } from "pinia";
import { getStock } from "@/services/modules/stock";

export const useStockStore = defineStore("stock", {
  state: () => ({
    stocks: [],
    loading: false,
    error: null,
  }),

  actions: {
    async fetchStock(params) {
      this.loading = true;
      try {
        const res = await getStock(params);
        this.stocks = res.data.data;
      } catch (err) {
        this.error = err.response?.data?.error || "Gagal memuat stok.";
      } finally {
        this.loading = false;
      }
    },
  },
});
