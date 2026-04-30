import { createApp } from "vue";
import { createPinia } from "pinia";
import router from "./router";
import App from "./App.vue";
import "./assets/main.css";

const app = createApp(App);
const pinia = createPinia();

app.use(pinia);
app.use(router);

import { useThemeStore } from "./stores/theme.store";
const themeStore = useThemeStore(pinia);
themeStore.init();

app.mount("#app");
