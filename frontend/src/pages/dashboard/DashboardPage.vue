<template>
    <div>
        <h2 class="text-2xl font-bold text-gray-800 mb-6">Dashboard</h2>

        <div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div v-for="card in summaryCards" :key="card.label" class="bg-white rounded-xl shadow-sm p-6">
                <p class="text-sm text-gray-500">{{ card.label }}</p>
                <p class="text-3xl font-bold text-gray-800 mt-1">{{ card.value }}</p>
            </div>
        </div>

        <div class="bg-white rounded-xl shadow-sm p-6 mb-6">
            <h3 class="text-lg font-semibold text-gray-800 mb-4">Stok Menipis</h3>
            <div v-if="lowStock.length === 0" class="text-gray-400 text-sm">
                Tidak ada produk dengan stok menipis.
            </div>
            <table v-else class="w-full text-sm">
                <thead>
                    <tr class="text-left text-gray-500 border-b">
                        <th class="pb-2">SKU</th>
                        <th class="pb-2">Produk</th>
                        <th class="pb-2">Stok</th>
                        <th class="pb-2">Min Stok</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="item in lowStock" :key="item.id" class="border-b last:border-0">
                        <td class="py-2 text-gray-500">{{ item.sku }}</td>
                        <td class="py-2 font-medium">{{ item.name }}</td>
                        <td class="py-2 text-red-500 font-medium">{{ item.total_qty || 0 }}</td>
                        <td class="py-2">{{ item.min_stock }}</td>
                    </tr>
                </tbody>
            </table>
        </div>

        <div class="bg-white rounded-xl shadow-sm p-6">
            <h3 class="text-lg font-semibold text-gray-800 mb-4">Transaksi Terbaru</h3>
            <div v-if="recentTransactions.length === 0" class="text-gray-400 text-sm">
                Belum ada transaksi.
            </div>
            <table v-else class="w-full text-sm">
                <thead>
                    <tr class="text-left text-gray-500 border-b">
                        <th class="pb-2">Produk</th>
                        <th class="pb-2">Tipe</th>
                        <th class="pb-2">Qty</th>
                        <th class="pb-2">Oleh</th>
                        <th class="pb-2">Waktu</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="item in recentTransactions" :key="item.id" class="border-b last:border-0">
                        <td class="py-2 font-medium">{{ item.product_name }}</td>
                        <td class="py-2">
                            <span :class="typeClass(item.type)" class="px-2 py-0.5 rounded-full text-xs font-medium">
                                {{ item.type }}
                            </span>
                        </td>
                        <td class="py-2">{{ item.qty }}</td>
                        <td class="py-2 text-gray-500">{{ item.created_by_name }}</td>
                        <td class="py-2 text-gray-500">{{ formatDate(item.created_at) }}</td>
                    </tr>
                </tbody>
            </table>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { getDashboard } from '@/services/modules/reports'

const summary = ref({})
const lowStock = ref([])
const recentTransactions = ref([])

const summaryCards = computed(() => [
    { label: 'Total Produk', value: summary.value.total_products || 0 },
    { label: 'Total Gudang', value: summary.value.total_warehouses || 0 },
    { label: 'Total PO', value: summary.value.total_po || 0 },
    { label: 'Total SO', value: summary.value.total_so || 0 },
])

const typeClass = (type) => {
    if (type === 'IN') return 'bg-green-100 text-green-700'
    if (type === 'OUT') return 'bg-red-100 text-red-700'
    return 'bg-yellow-100 text-yellow-700'
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