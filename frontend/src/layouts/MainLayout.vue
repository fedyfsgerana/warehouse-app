<template>
    <div class="flex h-screen bg-gray-100">
        <aside class="w-64 bg-white shadow-md flex flex-col">
            <div class="p-6 border-b">
                <h1 class="text-xl font-bold text-primary-600">Warehouse MS</h1>
                <p class="text-sm text-gray-500 mt-1">{{ authStore.user?.name }}</p>
                <span class="text-xs bg-primary-100 text-primary-700 px-2 py-0.5 rounded-full capitalize">
                    {{ authStore.user?.role }}
                </span>
            </div>

            <nav class="flex-1 p-4 space-y-1">
                <router-link v-for="item in menuItems" :key="item.path" :to="item.path"
                    class="flex items-center gap-3 px-4 py-2.5 rounded-lg text-gray-600 hover:bg-primary-50 hover:text-primary-600 transition-colors"
                    active-class="bg-primary-50 text-primary-600 font-medium">
                    <span>{{ item.icon }}</span>
                    <span>{{ item.label }}</span>
                </router-link>
            </nav>

            <div class="p-4 border-t">
                <button @click="handleLogout"
                    class="w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-red-500 hover:bg-red-50 transition-colors">
                    <span>Logout</span>
                </button>
            </div>
        </aside>

        <main class="flex-1 overflow-auto">
            <div class="p-8">
                <router-view />
            </div>
        </main>
    </div>
</template>

<script setup>
import { useAuthStore } from '@/stores/auth.store'
import { useRouter } from 'vue-router'

const authStore = useAuthStore()
const router = useRouter()

const menuItems = [
    { path: '/', label: 'Dashboard', icon: 'D' },
    { path: '/products', label: 'Produk', icon: 'P' },
    { path: '/warehouses', label: 'Gudang', icon: 'G' },
    { path: '/stock', label: 'Stok', icon: 'S' },
    { path: '/purchase-orders', label: 'Purchase Order', icon: 'PO' },
    { path: '/sales-orders', label: 'Sales Order', icon: 'SO' },
    { path: '/reports', label: 'Laporan', icon: 'L' },
    { path: '/suppliers', label: 'Supplier', icon: 'SP' },
]

const handleLogout = async () => {
    await authStore.logout()
    router.push('/login')
}
</script>