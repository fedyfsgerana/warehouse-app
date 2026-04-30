import { defineStore } from "pinia";
import { getMyMenus } from "@/services/modules/menus";

export const useMenuStore = defineStore("menu", {
  state: () => ({
    menus: [],
    loading: false,
  }),

  actions: {
    async fetchMyMenus() {
      this.loading = true;
      try {
        const res = await getMyMenus();
        this.menus = res.data.data;
      } catch (err) {
        this.menus = [];
      } finally {
        this.loading = false;
      }
    },

    clearMenus() {
      this.menus = [];
    },
  },
});
