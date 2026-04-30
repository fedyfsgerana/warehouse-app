<template>
    <div>
        <div class="mb-6">
            <h2 class="text-2xl font-bold" style="color: var(--color-text);">Dashboard</h2>
            <p class="mt-1 text-sm" style="color: var(--color-text-muted);">Selamat datang, {{ authStore.user?.name }}
            </p>
        </div>

        <div class="grid grid-cols-1 gap-4 mb-6 md:grid-cols-2 lg:grid-cols-4">
            <div v-for="card in summaryCards" :key="card.label" class="card">
                <div class="flex items-center justify-between mb-3">
                    <p class="text-xs font-bold tracking-widest uppercase" style="color: var(--color-text-muted);">{{
                        card.label }}</p>
                    <div class="flex items-center justify-center w-9 h-9 rounded-xl"
                        :style="{ backgroundColor: card.bg }">
                        <component :is="card.icon" :size="18" :style="{ color: card.color }" />
                    </div>
                </div>
                <p class="text-3xl font-bold" style="color: var(--color-text);">{{ card.value }}</p>
            </div>
        </div>

        <div class="grid grid-cols-1 gap-6 lg:grid-cols-2">

            <div class="card">
                <div class="flex items-center gap-3 mb-4">
                    <div class="flex items-center justify-center w-8 h-8 rounded-lg"
                        style="background-color: rgba(214,57,57,0.1);">
                        <AlertTriangle :size="16" style="color: var(--color-danger);" />
                    </div>
                    <h3 class="text-base font-bold" style="color: var(--color-text);">Stok Menipis</h3>
                    <div v-if="lowStock.length > 0" class="ml-auto badge badge-error badge-sm">{{ lowStock.length }}
                    </div>
                </div>

                <div v-if="lowStock.length === 0" class="flex flex-col items-center gap-2 py-6">
                    <CheckCircle :size="32" style="color: var(--color-success);" />
                    <p class="text-sm" style="color: var(--color-text-muted);">Semua stok aman.</p>
                </div>

                <div v-else class="overflow-x-auto">
                    <table class="table table-sm">
                        <thead>
                            <tr style="border-color: var(--color-border);">
                                <th style="background-color: var(--color-surface-2); color: var(--color-text-muted);">
                                    SKU</th>
                                <th style="background-color: var(--color-surface-2); color: var(--color-text-muted);">
                                    Produk</th>
                                <th style="background-color: var(--color-surface-2); color: var(--color-text-muted);">
                                    Stok</th>
                                <th style="background-color: var(--color-surface-2); color: var(--color-text-muted);">
                                    Min</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr v-for="item in lowStock" :key="item.id" style="border-color: var(--color-border);">
                                <td>
                                    <kbd class="kbd kbd-sm"
                                        style="background-color: var(--color-surface-2); color: var(--color-text-muted);">{{
                                            item.sku }}</kbd>
                                </td>
                                <td class="font-semibold" style="color: var(--color-text);">{{ item.name }}</td>
                                <td>
                                    <span class="badge badge-error badge-sm">{{ item.total_qty || 0 }}</span>
                                </td>
                                <td style="color: var(--color-text-muted);">{{ item.min_stock }}</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>

            <div class="card">
                <div class="flex items-center gap-3 mb-4">
                    <div class="flex items-center justify-center w-8 h-8 rounded-lg"
                        style="background-color: var(--color-primary-light);">
                        <Activity :size="16" style="color: var(--color-primary);" />
                    </div>
                    <h3 class="text-base font-bold" style="color: var(--color-text);">Transaksi Terbaru</h3>
                </div>

                <div v-if="recentTransactions.length === 0" class="flex flex-col items-center gap-2 py-6">
                    <ClipboardList :size="32" style="color: var(--color-text-muted);" />
                    <p class="text-sm" style="color: var(--color-text-muted);">Belum ada transaksi.</p>
                </div>

                <div v-else class="overflow-x-auto">
                    <table class="table table-sm">
                        <thead>
                            <tr style="border-color: var(--color-border);">
                                <th style="background-color: var(--color-surface-2); color: var(--color-text-muted);">
                                    Produk</th>
                                <th style="background-color: var(--color-surface-2); color: var(--color-text-muted);">
                                    Tipe</th>
                                <th style="background-color: var(--color-surface-2); color: var(--color-text-muted);">
                                    Qty</th>
                                <th style="background-color: var(--color-surface-2); color: var(--color-text-muted);">
                                    Waktu</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr v-for="item in recentTransactions" :key="item.id"
                                style="border-color: var(--color-border);">
                                <td class="font-semibold" style="color: var(--color-text);">{{ item.product_name }}</td>
                                <td>
                                    <span class="badge badge-sm" :style="typeClass(item.type)">{{ item.type }}</span>
                                </td>
                                <td class="font-semibold" style="color: var(--color-text);">{{ item.qty }}</td>
                                <td class="text-xs" style="color: var(--color-text-muted);">{{
                                    formatDate(item.created_at) }}</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>

        </div>
    </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useAuthStore } from '@/stores/auth.store'
import { getDashboard } from '@/services/modules/reports'
import {
    Package, Warehouse, ShoppingCart, TrendingUp,
    AlertTriangle, Activity, CheckCircle, ClipboardList
} from 'lucide-vue-next'

const authStore = useAuthStore()
const summary = ref({})
const lowStock = ref([])
const recentTransactions = ref([])

const summaryCards = computed(() => [
    {
        label: 'Total Produk',
        value: summary.value.total_products || 0,
        icon: Package,
        color: 'var(--color-primary)',
        bg: 'var(--color-primary-light)'
    },
    {
        label: 'Total Gudang',
        value: summary.value.total_warehouses || 0,
        icon: Warehouse,
        color: '#ae3ec9',
        bg: 'rgba(174,62,201,0.1)'
    },
    {
        label: 'Total PO',
        value: summary.value.total_po || 0,
        icon: ShoppingCart,
        color: 'var(--color-success)',
        bg: 'rgba(47,179,68,0.1)'
    },
    {
        label: 'Total SO',
        value: summary.value.total_so || 0,
        icon: TrendingUp,
        color: 'var(--color-warning)',
        bg: 'rgba(245,159,0,0.1)'
    },
])

const typeClass = (type) => {
    if (type === 'IN') return 'background-color: rgba(47,179,68,0.1); color: var(--color-success);'
    if (type === 'OUT') return 'background-color: rgba(214,57,57,0.1); color: var(--color-danger);'
    return 'background-color: rgba(245,159,0,0.1); color: var(--color-warning);'
}

const formatDate = (date) => {
    return new Date(date).toLocaleDateString('id-ID', {
        day: 'numeric', month: 'short', year: 'numeric'
    })
}

onMounted(async () => {
    try {
        const res = await getDashboard()
        summary.value = res.data.data.summary
        lowStock.value = res.data.data.low_stock
        recentTransactions.value = res.data.data.recent_transactions
    } catch (err) { }
})
</script>