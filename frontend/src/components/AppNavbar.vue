<template>
    <header class="fixed top-0 left-0 right-0 z-30"
        style="background-color: var(--color-surface); border-bottom: 1px solid var(--color-border);">

        <div class="flex items-center justify-between px-6 h-14" style="border-bottom: 1px solid var(--color-border);">

            <div class="flex items-center gap-3">
                <button v-if="!showMenu" @click="emit('toggle-sidebar')" class="btn-ghost p-2 rounded-xl">
                    <Menu :size="18" />
                </button>
                <div class="flex items-center gap-2.5">
                    <div class="w-8 h-8 rounded-xl flex items-center justify-center"
                        style="background: linear-gradient(135deg, var(--color-primary), var(--color-primary-dark));">
                        <Warehouse :size="16" class="text-white" />
                    </div>
                    <span class="font-bold text-sm" style="color: var(--color-text);">Warehouse MS</span>
                </div>
            </div>

            <div class="flex items-center gap-1">

                <div class="relative">
                    <button @click="showSettings = !showSettings" class="btn-ghost p-2 rounded-xl">
                        <Settings :size="18" />
                    </button>
                    <div v-if="showSettings" class="absolute right-0 top-11 w-72 rounded-2xl shadow-2xl z-50 p-4"
                        style="background-color: var(--color-surface); border: 1px solid var(--color-border);">
                        <p class="text-xs font-bold uppercase tracking-widest mb-3"
                            style="color: var(--color-text-muted);">Pengaturan Tampilan</p>

                        <div class="mb-4">
                            <p class="text-xs font-semibold mb-2" style="color: var(--color-text-muted);">Layout</p>
                            <div class="grid grid-cols-2 gap-2">
                                <button @click="setLayout('navbar')"
                                    class="flex flex-col items-center gap-1.5 p-3 rounded-xl border-2 transition-all"
                                    :style="themeStore.layout === 'navbar' ? 'border-color: var(--color-primary); background-color: var(--color-primary-light);' : 'border-color: var(--color-border);'">
                                    <LayoutTemplate :size="20"
                                        :style="themeStore.layout === 'navbar' ? 'color: var(--color-primary)' : 'color: var(--color-text-muted)'" />
                                    <span class="text-xs font-semibold"
                                        :style="themeStore.layout === 'navbar' ? 'color: var(--color-primary)' : 'color: var(--color-text-muted)'">Navbar</span>
                                </button>
                                <button @click="setLayout('sidebar')"
                                    class="flex flex-col items-center gap-1.5 p-3 rounded-xl border-2 transition-all"
                                    :style="themeStore.layout === 'sidebar' ? 'border-color: var(--color-primary); background-color: var(--color-primary-light);' : 'border-color: var(--color-border);'">
                                    <LayoutDashboard :size="20"
                                        :style="themeStore.layout === 'sidebar' ? 'color: var(--color-primary)' : 'color: var(--color-text-muted)'" />
                                    <span class="text-xs font-semibold"
                                        :style="themeStore.layout === 'sidebar' ? 'color: var(--color-primary)' : 'color: var(--color-text-muted)'">Sidebar</span>
                                </button>
                            </div>
                        </div>

                        <div class="mb-4">
                            <p class="text-xs font-semibold mb-2" style="color: var(--color-text-muted);">Mode Tampilan
                            </p>
                            <div class="grid grid-cols-3 gap-2">
                                <button v-for="mode in modes" :key="mode.key" @click="setMode(mode.key)"
                                    class="flex flex-col items-center gap-1.5 p-2.5 rounded-xl border-2 transition-all"
                                    :style="currentMode === mode.key ? 'border-color: var(--color-primary); background-color: var(--color-primary-light);' : 'border-color: var(--color-border);'">
                                    <component :is="mode.icon" :size="18"
                                        :style="currentMode === mode.key ? 'color: var(--color-primary)' : 'color: var(--color-text-muted)'" />
                                    <span class="text-xs font-semibold"
                                        :style="currentMode === mode.key ? 'color: var(--color-primary)' : 'color: var(--color-text-muted)'">{{
                                            mode.label }}</span>
                                </button>
                            </div>
                        </div>

                        <div>
                            <p class="text-xs font-semibold mb-2" style="color: var(--color-text-muted);">Warna Aksen
                            </p>
                            <div class="flex flex-wrap gap-2">
                                <button v-for="(color, index) in themeStore.presets" :key="index"
                                    @click="themeStore.setColor(index)"
                                    class="w-7 h-7 rounded-lg transition-all hover:scale-110" :style="{
                                        backgroundColor: color.primary,
                                        outline: themeStore.colorPreset === index ? `3px solid ${color.primary}` : 'none',
                                        outlineOffset: '2px'
                                    }" :title="color.name"></button>
                            </div>
                        </div>
                    </div>
                </div>

                <button @click="themeStore.toggleTheme()" class="btn-ghost p-2 rounded-xl">
                    <Sun v-if="themeStore.isDark" :size="18" />
                    <Moon v-else :size="18" />
                </button>

                <div class="relative">
                    <button @click="showNotif = !showNotif" class="btn-ghost p-2 rounded-xl relative">
                        <Bell :size="18" />
                        <span v-if="lowStockCount > 0"
                            class="absolute top-0.5 right-0.5 w-4 h-4 rounded-full text-white flex items-center justify-center"
                            style="background-color: var(--color-danger); font-size: 9px; font-weight: 700;">{{
                                lowStockCount }}</span>
                    </button>
                    <div v-if="showNotif"
                        class="absolute right-0 top-11 w-80 rounded-2xl shadow-2xl z-50 overflow-hidden"
                        style="background-color: var(--color-surface); border: 1px solid var(--color-border);">
                        <div class="px-4 py-3" style="border-bottom: 1px solid var(--color-border);">
                            <p class="font-bold text-sm" style="color: var(--color-text);">Notifikasi Stok</p>
                        </div>
                        <div v-if="lowStockItems.length === 0" class="p-6 text-center text-sm"
                            style="color: var(--color-text-muted);">
                            Semua stok aman.
                        </div>
                        <div v-else class="max-h-64 overflow-y-auto">
                            <div v-for="item in lowStockItems" :key="item.id" class="flex items-center gap-3 px-4 py-3"
                                style="border-bottom: 1px solid var(--color-border);">
                                <div class="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
                                    style="background-color: rgba(239,68,68,0.1);">
                                    <AlertTriangle :size="14" style="color: var(--color-danger);" />
                                </div>
                                <div class="flex-1 min-w-0">
                                    <p class="text-sm font-semibold truncate" style="color: var(--color-text);">{{
                                        item.name }}</p>
                                    <p class="text-xs" style="color: var(--color-text-muted);">
                                        Stok: <span style="color: var(--color-danger); font-weight: 700;">{{
                                            item.total_qty || 0 }}</span>
                                        / Min: {{ item.min_stock }}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="w-px h-5 mx-1" style="background-color: var(--color-border);"></div>

                <div class="relative">
                    <button @click="showUserMenu = !showUserMenu"
                        class="flex items-center gap-2.5 px-3 py-1.5 rounded-xl btn-ghost">
                        <div class="w-7 h-7 rounded-lg flex items-center justify-center text-white text-xs font-bold"
                            style="background: linear-gradient(135deg, var(--color-primary), var(--color-primary-dark));">
                            {{ userInitial }}
                        </div>
                        <div class="hidden md:block text-left">
                            <p class="text-xs font-bold leading-tight" style="color: var(--color-text);">{{
                                authStore.user?.name }}</p>
                            <p class="text-xs capitalize leading-tight" style="color: var(--color-text-muted);">{{
                                authStore.user?.role }}</p>
                        </div>
                        <ChevronDown :size="12" style="color: var(--color-text-muted);" />
                    </button>
                    <div v-if="showUserMenu"
                        class="absolute right-0 top-11 w-44 rounded-2xl shadow-2xl z-50 overflow-hidden p-2"
                        style="background-color: var(--color-surface); border: 1px solid var(--color-border);">
                        <button @click="handleLogout"
                            class="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium transition-all"
                            style="color: var(--color-danger);"
                            onmouseover="this.style.backgroundColor='rgba(239,68,68,0.08)'"
                            onmouseout="this.style.backgroundColor='transparent'">
                            <LogOut :size="15" />
                            Logout
                        </button>
                    </div>
                </div>
            </div>
        </div>

        <div v-if="showMenu" class="flex items-center gap-1 px-4 h-11 overflow-x-auto">
            <router-link v-for="item in menuStore.menus" :key="item.id" :to="item.path"
                class="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all"
                :class="isActive(item.path) ? 'nav-active' : 'nav-inactive'">
                <component :is="getIcon(item.icon)" :size="13" />
                {{ item.label }}
            </router-link>
        </div>

    </header>

    <div v-if="showNotif || showUserMenu || showSettings" class="fixed inset-0 z-20"
        @click="showNotif = false; showUserMenu = false; showSettings = false"></div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth.store'
import { useThemeStore } from '@/stores/theme.store'
import { useMenuStore } from '@/stores/menu.store'
import { getDashboard } from '@/services/modules/reports'
import {
    Menu, Warehouse, Settings, Sun, Moon, Monitor,
    Bell, AlertTriangle, LogOut, ChevronDown,
    LayoutDashboard, LayoutTemplate,
    Package, Layers, ShoppingCart,
    TrendingUp, BarChart2, Users, Truck,
    FileText, Home, Box, Database, PieChart, ClipboardList
} from 'lucide-vue-next'

const props = defineProps({
    showMenu: { type: Boolean, default: false },
    sidebarOpen: { type: Boolean, default: true }
})

const emit = defineEmits(['toggle-sidebar'])

const authStore = useAuthStore()
const themeStore = useThemeStore()
const menuStore = useMenuStore()
const router = useRouter()
const route = useRoute()

const showNotif = ref(false)
const showUserMenu = ref(false)
const showSettings = ref(false)
const lowStockItems = ref([])
const currentMode = ref(localStorage.getItem('wms_mode') || 'system')

const lowStockCount = computed(() => lowStockItems.value.length)
const userInitial = computed(() => authStore.user?.name?.charAt(0).toUpperCase() || 'U')

const iconMap = {
    LayoutDashboard, Package, Warehouse, Layers,
    ShoppingCart, TrendingUp, BarChart2, Users,
    Truck, Menu, Settings, FileText, Home,
    Box, Database, PieChart, ClipboardList
}

const getIcon = (name) => iconMap[name] || LayoutDashboard

const modes = [
    { key: 'light', label: 'Terang', icon: Sun },
    { key: 'dark', label: 'Gelap', icon: Moon },
    { key: 'system', label: 'Sistem', icon: Monitor },
]

const isActive = (path) => {
    if (path === '/') return route.path === '/'
    return route.path.startsWith(path)
}

const setLayout = (layout) => {
    themeStore.setLayout(layout)
    showSettings.value = false
}

const setMode = (mode) => {
    currentMode.value = mode
    localStorage.setItem('wms_mode', mode)
    if (mode === 'system') {
        const systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches
        if (systemDark !== themeStore.isDark) themeStore.toggleTheme()
        localStorage.removeItem('wms_theme')
    } else {
        const wantDark = mode === 'dark'
        if (wantDark !== themeStore.isDark) themeStore.toggleTheme()
    }
}

const handleLogout = async () => {
    await authStore.logout()
    menuStore.clearMenus()
    router.push('/login')
}

const fetchLowStock = async () => {
    try {
        const res = await getDashboard()
        lowStockItems.value = res.data.data.low_stock
    } catch (err) { }
}

onMounted(fetchLowStock)
</script>

<style scoped>
.nav-active {
    background-color: var(--color-primary-light);
    color: var(--color-primary);
}

.nav-inactive {
    color: var(--color-text-muted);
}

.nav-inactive:hover {
    background-color: var(--color-surface-2);
    color: var(--color-text);
}
</style>