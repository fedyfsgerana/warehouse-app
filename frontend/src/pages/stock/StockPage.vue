<template>
    <div>
        <h2 class="text-2xl font-bold text-gray-800 mb-6">Stok</h2>

        <div class="bg-white rounded-xl shadow-sm p-4 mb-6 flex gap-4">
            <select v-model="selectedWarehouse" @change="fetchStock"
                class="border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500">
                <option value="">Semua Gudang</option>
                <option v-for="w in warehouses" :key="w.id" :value="w.id">{{ w.name }}</option>
            </select>
        </div>

        <div class="bg-white rounded-xl shadow-sm overflow-hidden mb-6">
            <div v-if="stockStore.loading" class="p-8 text-center text-gray-400">Memuat...</div>
            <table v-else class="w-full text-sm">
                <thead class="bg-gray-50">
                    <tr class="text-left text-gray-500">
                        <th class="px-6 py-3">SKU</th>
                        <th class="px-6 py-3">Produk</th>
                        <th class="px-6 py-3">Gudang</th>
                        <th class="px-6 py-3">Lokasi</th>
                        <th class="px-6 py-3">Qty</th>
                        <th class="px-6 py-3">Unit</th>
                        <th class="px-6 py-3">Status</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-if="stockStore.stocks.length === 0">
                        <td colspan="7" class="px-6 py-8 text-center text-gray-400">Belum ada data stok.</td>
                    </tr>
                    <tr v-for="item in stockStore.stocks" :key="item.id" class="border-t hover:bg-gray-50">
                        <td class="px-6 py-3 text-gray-500">{{ item.sku }}</td>
                        <td class="px-6 py-3 font-medium">{{ item.product_name }}</td>
                        <td class="px-6 py-3">{{ item.warehouse_name }}</td>
                        <td class="px-6 py-3">{{ item.location_code || '-' }}</td>
                        <td class="px-6 py-3 font-medium">{{ item.qty }}</td>
                        <td class="px-6 py-3 text-gray-500">{{ item.unit }}</td>
                        <td class="px-6 py-3">
                            <span
                                :class="item.qty <= item.min_stock ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'"
                                class="px-2 py-0.5 rounded-full text-xs font-medium">
                                {{ item.qty <= item.min_stock ? 'Menipis' : 'Normal' }} </span>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>

        <div class="bg-white rounded-xl shadow-sm p-6">
            <div class="flex items-center justify-between mb-4">
                <h3 class="text-lg font-semibold text-gray-800">History Transaksi</h3>
                <div class="flex gap-2">
                    <input v-model="historyFilter.from" type="date"
                        class="border rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
                    <input v-model="historyFilter.to" type="date"
                        class="border rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
                    <button @click="fetchHistory"
                        class="bg-primary-600 text-white px-4 py-1.5 rounded-lg text-sm hover:bg-primary-700">Filter</button>
                </div>
            </div>
            <table class="w-full text-sm">
                <thead class="bg-gray-50">
                    <tr class="text-left text-gray-500">
                        <th class="px-6 py-3">Produk</th>
                        <th class="px-6 py-3">Tipe</th>
                        <th class="px-6 py-3">Qty</th>
                        <th class="px-6 py-3">Referensi</th>
                        <th class="px-6 py-3">Oleh</th>
                        <th class="px-6 py-3">Waktu</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-if="history.length === 0">
                        <td colspan="6" class="px-6 py-8 text-center text-gray-400">Belum ada history.</td>
                    </tr>
                    <tr v-for="item in history" :key="item.id" class="border-t hover:bg-gray-50">
                        <td class="px-6 py-3 font-medium">{{ item.product_name }}</td>
                        <td class="px-6 py-3">
                            <span :class="typeClass(item.type)" class="px-2 py-0.5 rounded-full text-xs font-medium">
                                {{ item.type }}
                            </span>
                        </td>
                        <td class="px-6 py-3">{{ item.qty }}</td>
                        <td class="px-6 py-3 text-gray-500">{{ item.reference_type }} #{{ item.reference_id }}</td>
                        <td class="px-6 py-3 text-gray-500">{{ item.created_by_name }}</td>
                        <td class="px-6 py-3 text-gray-500">{{ formatDate(item.created_at) }}</td>
                    </tr>
                </tbody>
            </table>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted, reactive } from 'vue'
import { useStockStore } from '@/stores/stock.store'
import { getStockHistory } from '@/services/modules/stock'
import { getWarehouses } from '@/services/modules/warehouses'

const stockStore = useStockStore()
const warehouses = ref([])
const selectedWarehouse = ref('')
const history = ref([])
const historyFilter = reactive({ from: '', to: '' })

const fetchStock = () => {
    stockStore.fetchStock({ warehouse_id: selectedWarehouse.value })
}

const fetchHistory = async () => {
    try {
        const res = await getStockHistory(historyFilter)
        history.value = res.data.data
    } catch (err) { }
}

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
    fetchStock()
    fetchHistory()
    const res = await getWarehouses()
    warehouses.value = res.data.data
})
</script>