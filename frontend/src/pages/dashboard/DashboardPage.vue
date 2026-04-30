<template>
    <div>
        <h2 class="text-2xl font-bold mb-6" style="color: var(--color-text);">Dashboard</h2>

        <div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div v-for="card in summaryCards" :key="card.label" class="card">
                <div class="flex items-center justify-between mb-3">
                    <p class="text-xs font-bold uppercase tracking-widest" style="color: var(--color-text-muted);">{{
                        card.label }}</p>
                    <div class="w-9 h-9 rounded-xl flex items-center justify-center"
                        :style="{ backgroundColor: card.bg }">
                        <component :is="card.icon" :size="18" :style="{ color: card.color }" />
                    </div>
                </div>
                <p class="text-3xl font-bold" style="color: var(--color-text);">{{ card.value }}</p>
            </div>
        </div>

        <div class="card mb-6">
            <div class="flex items-center gap-3 mb-4">
                <div class="w-8 h-8 rounded-lg flex items-center justify-center"
                    style="background-color: rgba(239,68,68,0.1);">
                    <AlertTriangle :size="16" style="color: var(--color-danger);" />
                </div>
                <h3 class="text-base font-bold" style="color: var(--color-text);">Stok Menipis</h3>
            </div>
            <div v-if="lowStock.length === 0" class="text-sm py-4 text-center" style="color: var(--color-text-muted);">
                Tidak ada produk dengan stok menipis.
            </div>
            <table v-else class="w-full text-sm">
                <thead>
                    <tr style="border-bottom: 1px solid var(--color-border);">
                        <th class="text-left pb-3 text-xs font-bold uppercase tracking-widest"
                            style="color: var(--color-text-muted);">SKU</th>
                        <th class="text-left pb-3 text-xs font-bold uppercase tracking-widest"
                            style="color: var(--color-text-muted);">Produk</th>
                        <th class="text-left pb-3 text-xs font-bold uppercase tracking-widest"
                            style="color: var(--color-text-muted);">Stok</th>
                        <th class="text-left pb-3 text-xs font-bold uppercase tracking-widest"
                            style="color: var(--color-text-muted);">Min Stok</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="item in lowStock" :key="item.id" style="border-bottom: 1px solid var(--color-border);">
                        <td class="py-3 text-xs font-mono" style="color: var(--color-text-muted);">{{ item.sku }}</td>
                        <td class="py-3 font-semibold" style="color: var(--color-text);">{{ item.name }}</td>
                        <td class="py-3 font-bold" style="color: var(--color-danger);">{{ item.total_qty || 0 }}</td>
                        <td class="py-3" style="color: var(--color-text-muted);">{{ item.min_stock }}</td>
                    </tr>
                </tbody>
            </table>
        </div>

        <div class="card">
            <div class="flex items-center gap-3 mb-4">
                <div class="w-8 h-8 rounded-lg flex items-center justify-center"
                    style="background-color: var(--color-primary-light);">
                    <Activity :size="16" style="color: var(--color-primary);" />
                </div>
                <h3 class="text-base font-bold" style="color: var(--color-text);">Transaksi Terbaru</h3>
            </div>
            <div v-if="recentTransactions.length === 0" class="text-sm py-4 text-center"
                style="color: var(--color-text-muted);">
                Belum ada transaksi.
            </div>
            <table v-else class="w-full text-sm">
                <thead>
                    <tr style="border-bottom: 1px solid var(--color-border);">
                        <th class="text-left pb-3 text-xs font-bold uppercase tracking-widest"
                            style="color: var(--color-text-muted);">Produk</th>
                        <th class="text-left pb-3 text-xs font-bold uppercase tracking-widest"
                            style="color: var(--color-text-muted);">Tipe</th>
                        <th class="text-left pb-3 text-xs font-bold uppercase tracking-widest"
                            style="color: var(--color-text-muted);">Qty</th>
                        <th class="text-left pb-3 text-xs font-bold uppercase tracking-widest"
                            style="color: var(--color-text-muted);">Oleh</th>
                        <th class="text-left pb-3 text-xs font-bold uppercase tracking-widest"
                            style="color: var(--color-text-muted);">Waktu</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="item in recentTransactions" :key="item.id"
                        style="border-bottom: 1px solid var(--color-border);">
                        <td class="py-3 font-semibold" style="color: var(--color-text);">{{ item.product_name }}</td>
                        <td class="py-3">
                            <span class="badge" :style="typeClass(item.type)">{{ item.type }}</span>
                        </td>
                        <td class="py-3 font-semibold" style="color: var(--color-text);">{{ item.qty }}</td>
                        <td class="py-3" style="color: var(--color-text-muted);">{{ item.created_by_name }}</td>
                        <td class="py-3" style="color: var(--color-text-muted);">{{ formatDate(item.created_at) }}</td>
                    </tr>
                </tbody>
            </table>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { getDashboard } from '@/services/modules/reports'
import { Package, Warehouse, ShoppingCart, TrendingUp, AlertTriangle, Activity } from 'lucide-vue-next'

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
        color: '#7c3aed',
        bg: 'rgba(124,58,237,0.1)'
    },
    {
        label: 'Total PO',
        value: summary.value.total_po || 0,
        icon: ShoppingCart,
        color: 'var(--color-success)',
        bg: 'rgba(16,185,129,0.1)'
    },
    {
        label: 'Total SO',
        value: summary.value.total_so || 0,
        icon: TrendingUp,
        color: 'var(--color-warning)',
        bg: 'rgba(245,158,11,0.1)'
    },
])

const typeClass = (type) => {
    if (type === 'IN') return 'background-color: rgba(16,185,129,0.1); color: var(--color-success);'
    if (type === 'OUT') return 'background-color: rgba(239,68,68,0.1); color: var(--color-danger);'
    return 'background-color: rgba(245,158,11,0.1); color: var(--color-warning);'
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