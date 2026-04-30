import { defineStore } from "pinia";

const COLOR_PRESETS = [
  {
    name: "Blue",
    primary: "#066fd1",
    dark: "#0558a8",
    light: "#e8f3fc",
    lightDark: "#0a2a4a",
  },
  {
    name: "Azure",
    primary: "#4299e1",
    dark: "#2b7dc4",
    light: "#ebf5fb",
    lightDark: "#0e2d45",
  },
  {
    name: "Indigo",
    primary: "#4263eb",
    dark: "#2f4dd4",
    light: "#ebeffe",
    lightDark: "#111a4a",
  },
  {
    name: "Purple",
    primary: "#ae3ec9",
    dark: "#952eaf",
    light: "#f8ecfc",
    lightDark: "#35103d",
  },
  {
    name: "Pink",
    primary: "#d6336c",
    dark: "#b8225a",
    light: "#fdeef4",
    lightDark: "#420d20",
  },
  {
    name: "Red",
    primary: "#d63939",
    dark: "#b82828",
    light: "#fdeaea",
    lightDark: "#420d0d",
  },
  {
    name: "Orange",
    primary: "#f76707",
    dark: "#d45300",
    light: "#fff3e8",
    lightDark: "#472000",
  },
  {
    name: "Yellow",
    primary: "#f59f00",
    dark: "#d48700",
    light: "#fff8e1",
    lightDark: "#473000",
  },
  {
    name: "Lime",
    primary: "#74b816",
    dark: "#5e9612",
    light: "#f2fae3",
    lightDark: "#1e3205",
  },
  {
    name: "Green",
    primary: "#2fb344",
    dark: "#258f36",
    light: "#e9faec",
    lightDark: "#0a2e10",
  },
  {
    name: "Teal",
    primary: "#0ca678",
    dark: "#098560",
    light: "#e6faf5",
    lightDark: "#032e22",
  },
  {
    name: "Cyan",
    primary: "#17a2b8",
    dark: "#1286a0",
    light: "#e3f7fb",
    lightDark: "#062a32",
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
            this.applyColor();
          }
        });
    },

    toggleTheme() {
      this.isDark = !this.isDark;
      localStorage.setItem("wms_theme", this.isDark ? "dark" : "light");
      this.applyTheme();
      this.applyColor();
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
