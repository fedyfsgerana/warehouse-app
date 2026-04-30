import { defineStore } from "pinia";
import { getProducts, getCategories } from "@/services/modules/products";

export const useProductStore = defineStore("product", {
  state: () => ({
    products: [],
    categories: [],
    loading: false,
    error: null,
  }),

  actions: {
    async fetchProducts(params) {
      this.loading = true;
      try {
        const res = await getProducts(params);
        this.products = res.data.data;
      } catch (err) {
        this.error = err.response?.data?.error || "Gagal memuat produk.";
      } finally {
        this.loading = false;
      }
    },

    async fetchCategories() {
      try {
        const res = await getCategories();
        this.categories = res.data.data;
      } catch (err) {
        this.error = err.response?.data?.error || "Gagal memuat kategori.";
      }
    },
  },
});
