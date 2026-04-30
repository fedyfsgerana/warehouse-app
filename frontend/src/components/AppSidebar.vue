<template>
    <aside class="fixed top-0 left-0 h-screen z-40 flex flex-col" :style="{
        width: 'var(--sidebar-width)',
        background: 'var(--color-surface)',
        borderRight: '1px solid var(--color-border)',
        transform: open ? 'translateX(0)' : 'translateX(-100%)',
        transition: 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
    }">
        <div class="flex items-center gap-3 px-6 py-5" style="border-bottom: 1px solid var(--color-border);">
            <div class="w-9 h-9 rounded-xl flex items-center justify-center"
                style="background: linear-gradient(135deg, var(--color-primary), var(--color-primary-dark));">
                <Warehouse :size="18" class="text-white" />
            </div>
            <div>
                <p class="font-bold text-sm leading-tight" style="color: var(--color-text);">Warehouse MS</p>
                <p class="text-xs leading-tight" style="color: var(--color-text-muted);">Management System</p>
            </div>
        </div>

        <nav class="flex-1 overflow-y-auto px-3 py-4 space-y-1">
            <p class="text-xs font-bold px-3 mb-2 uppercase tracking-widest" style="color: var(--color-text-muted);">
                Menu</p>

            <div v-if="menuStore.loading" class="px-3 py-2 text-xs" style="color: var(--color-text-muted);">Memuat
                menu...</div>

            <router-link v-for="item in menuStore.menus" :key="item.id" :to="item.path"
                class="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all"
                :class="isActive(item.path) ? 'active-nav' : 'inactive-nav'" @click="$emit('close')">
                <div class="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 transition-all"
                    :class="isActive(item.path) ? 'active-icon' : 'inactive-icon'">
                    <component :is="getIcon(item.icon)" :size="16" />
                </div>
                <span>{{ item.label }}</span>
                <div v-if="isActive(item.path)" class="ml-auto w-1.5 h-1.5 rounded-full"
                    style="background-color: var(--color-primary);"></div>
            </router-link>
        </nav>

        <div class="px-3 py-4" style="border-top: 1px solid var(--color-border);">
            <div class="flex items-center gap-3 px-3 py-3 rounded-xl" style="background-color: var(--color-surface-2);">
                <div class="w-8 h-8 rounded-lg flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
                    style="background: linear-gradient(135deg, var(--color-primary), var(--color-primary-dark));">
                    {{ userInitial }}
                </div>
                <div class="flex-1 min-w-0">
                    <p class="text-sm font-semibold truncate leading-tight" style="color: var(--color-text);">{{
                        authStore.user?.name }}</p>
                    <p class="text-xs capitalize leading-tight" style="color: var(--color-text-muted);">{{
                        authStore.user?.role }}</p>
                </div>
            </div>
        </div>
    </aside>

    <div v-if="open && isMobile" class="fixed inset-0 z-30"
        style="background: rgba(0,0,0,0.5); backdrop-filter: blur(2px);" @click="$emit('close')"></div>
</template>

<script setup>
import { computed, ref, onMounted, onUnmounted } from 'vue'
import { useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth.store'
import { useMenuStore } from '@/stores/menu.store'
import {
    Warehouse, LayoutDashboard, Package, Layers,
    ShoppingCart, TrendingUp, BarChart2, Users,
    Truck, Menu, Settings, FileText, Home,
    Box, Database, PieChart, ClipboardList
} from 'lucide-vue-next'

defineProps({ open: Boolean })
defineEmits(['close'])

const authStore = useAuthStore()
const menuStore = useMenuStore()
const route = useRoute()
const isMobile = ref(false)

const iconMap = {
    LayoutDashboard, Package, Warehouse, Layers,
    ShoppingCart, TrendingUp, BarChart2, Users,
    Truck, Menu, Settings, FileText, Home,
    Box, Database, PieChart, ClipboardList
}

const getIcon = (name) => iconMap[name] || LayoutDashboard

const userInitial = computed(() => authStore.user?.name?.charAt(0).toUpperCase() || 'U')

const isActive = (path) => {
    if (path === '/') return route.path === '/'
    return route.path.startsWith(path)
}

const checkMobile = () => { isMobile.value = window.innerWidth < 768 }

onMounted(() => {
    checkMobile()
    window.addEventListener('resize', checkMobile)
})

onUnmounted(() => window.removeEventListener('resize', checkMobile))
</script>

<style scoped>
.active-nav {
    background-color: var(--color-primary-light);
    color: var(--color-primary);
}

.inactive-nav {
    color: var(--color-text-muted);
}

.inactive-nav:hover {
    background-color: var(--color-surface-2);
    color: var(--color-text);
}

.active-icon {
    background-color: var(--color-primary);
    color: white;
}

.inactive-icon {
    background-color: var(--color-surface-2);
    color: var(--color-text-muted);
}

.inactive-nav:hover .inactive-icon {
    background-color: var(--color-border);
    color: var(--color-text);
}
</style>