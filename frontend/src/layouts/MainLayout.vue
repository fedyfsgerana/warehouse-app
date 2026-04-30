<template>
    <div class="min-h-screen" style="background-color: var(--color-bg);">

        <template v-if="themeStore.layout === 'navbar'">
            <AppNavbar :show-menu="true" />
            <div class="flex flex-col min-h-screen" style="padding-top: calc(var(--navbar-height) + 44px);">
                <main class="flex-1 p-6">
                    <router-view v-slot="{ Component }">
                        <transition name="page" mode="out-in">
                            <component :is="Component" />
                        </transition>
                    </router-view>
                </main>
                <AppFooter />
            </div>
        </template>

        <template v-else>
            <AppSidebar :open="sidebarOpen" @close="sidebarOpen = false" />
            <AppNavbar :show-menu="false" :sidebar-open="sidebarOpen" @toggle-sidebar="toggleSidebar" />
            <div class="flex flex-col min-h-screen transition-all duration-300" :style="{
                marginLeft: sidebarOpen && !isMobile ? 'var(--sidebar-width)' : '0',
                paddingTop: 'var(--navbar-height)'
            }">
                <main class="flex-1 p-6">
                    <router-view v-slot="{ Component }">
                        <transition name="page" mode="out-in">
                            <component :is="Component" />
                        </transition>
                    </router-view>
                </main>
                <AppFooter />
            </div>
        </template>

    </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useThemeStore } from '@/stores/theme.store'
import { useMenuStore } from '@/stores/menu.store'
import AppSidebar from '@/components/AppSidebar.vue'
import AppNavbar from '@/components/AppNavbar.vue'
import AppFooter from '@/components/AppFooter.vue'

const themeStore = useThemeStore()
const menuStore = useMenuStore()
const sidebarOpen = ref(true)
const isMobile = ref(false)

const checkMobile = () => {
    isMobile.value = window.innerWidth < 768
    sidebarOpen.value = !isMobile.value
}

const toggleSidebar = () => {
    sidebarOpen.value = !sidebarOpen.value
}

onMounted(async () => {
    checkMobile()
    window.addEventListener('resize', checkMobile)
    await menuStore.fetchMyMenus()
})

onUnmounted(() => {
    window.removeEventListener('resize', checkMobile)
})
</script>

<style>
.page-enter-active,
.page-leave-active {
    transition: all 0.18s ease;
}

.page-enter-from {
    opacity: 0;
    transform: translateY(6px);
}

.page-leave-to {
    opacity: 0;
    transform: translateY(-6px);
}
</style>