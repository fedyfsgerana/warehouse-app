import { defineStore } from "pinia";

const COLOR_PRESETS = [
  {
    name: "Blue",
    primary: "#2563eb",
    dark: "#1d4ed8",
    light: "#eff6ff",
    lightDark: "#1e3a5f",
  },
  {
    name: "Violet",
    primary: "#7c3aed",
    dark: "#6d28d9",
    light: "#f5f3ff",
    lightDark: "#2e1065",
  },
  {
    name: "Rose",
    primary: "#e11d48",
    dark: "#be123c",
    light: "#fff1f2",
    lightDark: "#4c0519",
  },
  {
    name: "Emerald",
    primary: "#059669",
    dark: "#047857",
    light: "#ecfdf5",
    lightDark: "#064e3b",
  },
  {
    name: "Orange",
    primary: "#ea580c",
    dark: "#c2410c",
    light: "#fff7ed",
    lightDark: "#431407",
  },
  {
    name: "Cyan",
    primary: "#0891b2",
    dark: "#0e7490",
    light: "#ecfeff",
    lightDark: "#164e63",
  },
  {
    name: "Pink",
    primary: "#db2777",
    dark: "#be185d",
    light: "#fdf2f8",
    lightDark: "#500724",
  },
  {
    name: "Slate",
    primary: "#475569",
    dark: "#334155",
    light: "#f8fafc",
    lightDark: "#0f172a",
  },
];

export const useThemeStore = defineStore("theme", {
  state: () => ({
    isDark: false,
    layout: "sidebar",
    colorPreset: 0,
  }),

  getters: {
    presets: () => COLOR_PRESETS,
    currentColor: (state) => COLOR_PRESETS[state.colorPreset],
  },

  actions: {
    init() {
      const systemDark = window.matchMedia(
        "(prefers-color-scheme: dark)",
      ).matches;
      const savedTheme = localStorage.getItem("wms_theme");
      const savedLayout = localStorage.getItem("wms_layout");
      const savedColor = localStorage.getItem("wms_color");

      this.isDark = savedTheme ? savedTheme === "dark" : systemDark;
      this.layout = savedLayout || "sidebar";
      this.colorPreset = savedColor ? parseInt(savedColor) : 0;

      this.applyTheme();
      this.applyColor();

      window
        .matchMedia("(prefers-color-scheme: dark)")
        .addEventListener("change", (e) => {
          if (!localStorage.getItem("wms_theme")) {
            this.isDark = e.matches;
            this.applyTheme();
          }
        });
    },

    toggleTheme() {
      this.isDark = !this.isDark;
      localStorage.setItem("wms_theme", this.isDark ? "dark" : "light");
      this.applyTheme();
    },

    setLayout(layout) {
      this.layout = layout;
      localStorage.setItem("wms_layout", layout);
    },

    setColor(index) {
      this.colorPreset = index;
      localStorage.setItem("wms_color", index);
      this.applyColor();
    },

    applyTheme() {
      if (this.isDark) {
        document.documentElement.classList.add("dark");
      } else {
        document.documentElement.classList.remove("dark");
      }
    },

    applyColor() {
      const color = COLOR_PRESETS[this.colorPreset];
      const root = document.documentElement;
      root.style.setProperty("--color-primary", color.primary);
      root.style.setProperty("--color-primary-dark", color.dark);
      root.style.setProperty(
        "--color-primary-light",
        this.isDark ? color.lightDark : color.light,
      );
    },
  },
});
