<template>
    <div>
        <h2 class="text-2xl font-bold text-gray-800 mb-6">Laporan</h2>

        <div class="flex gap-2 mb-6">
            <button v-for="tab in tabs" :key="tab.key" @click="activeTab = tab.key"
                :class="activeTab === tab.key ? 'bg-primary-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'"
                class="px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-sm">
                {{ tab.label }}
            </button>
        </div>

        <div v-if="activeTab === 'stock'">
            <div class="bg-white rounded-xl shadow-sm p-4 mb-6 flex gap-4">
                <input v-model="stockFilter.from" type="date"
                    class="border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
                <input v-model="stockFilter.to" type="date"
                    class="border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
                <button @click="fetchStockMovement"
                    class="bg-primary-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-primary-700">Filter</button>
            </div>

            <div class="bg-white rounded-xl shadow-sm overflow-hidden">
                <div v-if="loading" class="p-8 text-center text-gray-400">Memuat...</div>
                <table v-else class="w-full text-sm">
                    <thead class="bg-gray-50">
                        <tr class="text-left text-gray-500">
                            <th class="px-6 py-3">Produk</th>
                            <th class="px-6 py-3">SKU</th>
                            <th class="px-6 py-3">Gudang</th>
                            <th class="px-6 py-3">Tipe</th>
                            <th class="px-6 py-3">Qty</th>
                            <th class="px-6 py-3">Referensi</th>
                            <th class="px-6 py-3">Oleh</th>
                            <th class="px-6 py-3">Tanggal</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-if="stockMovement.length === 0">
                            <td colspan="8" class="px-6 py-8 text-center text-gray-400">Belum ada data.</td>
                        </tr>
                        <tr v-for="item in stockMovement" :key="item.id" class="border-t hover:bg-gray-50">
                            <td class="px-6 py-3 font-medium">{{ item.product_name }}</td>
                            <td class="px-6 py-3 text-gray-500">{{ item.sku }}</td>
                            <td class="px-6 py-3">{{ item.warehouse_name }}</td>
                            <td class="px-6 py-3">
                                <span :class="typeClass(item.type)"
                                    class="px-2 py-0.5 rounded-full text-xs font-medium">
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

        <div v-if="activeTab === 'po'">
            <div class="bg-white rounded-xl shadow-sm p-4 mb-6 flex gap-4">
                <input v-model="poFilter.from" type="date"
                    class="border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
                <input v-model="poFilter.to" type="date"
                    class="border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
                <button @click="fetchPOSummary"
                    class="bg-primary-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-primary-700">Filter</button>
            </div>

            <div class="bg-white rounded-xl shadow-sm overflow-hidden">
                <div v-if="loading" class="p-8 text-center text-gray-400">Memuat...</div>
                <table v-else class="w-full text-sm">
                    <thead class="bg-gray-50">
                        <tr class="text-left text-gray-500">
                            <th class="px-6 py-3">No. PO</th>
                            <th class="px-6 py-3">Supplier</th>
                            <th class="px-6 py-3">Status</th>
                            <th class="px-6 py-3">Total Item</th>
                            <th class="px-6 py-3">Total Nilai</th>
                            <th class="px-6 py-3">Tanggal</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-if="poSummary.length === 0">
                            <td colspan="6" class="px-6 py-8 text-center text-gray-400">Belum ada data.</td>
                        </tr>
                        <tr v-for="item in poSummary" :key="item.id" class="border-t hover:bg-gray-50">
                            <td class="px-6 py-3 font-medium">{{ item.po_number }}</td>
                            <td class="px-6 py-3">{{ item.supplier_name || '-' }}</td>
                            <td class="px-6 py-3">
                                <span :class="statusClass(item.status)"
                                    class="px-2 py-0.5 rounded-full text-xs font-medium capitalize">
                                    {{ item.status }}
                                </span>
                            </td>
                            <td class="px-6 py-3">{{ item.total_items }}</td>
                            <td class="px-6 py-3">{{ formatCurrency(item.total_value) }}</td>
                            <td class="px-6 py-3 text-gray-500">{{ formatDate(item.created_at) }}</td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted, reactive } from 'vue'
import { getStockMovement, getPOSummary } from '@/services/modules/reports'

const activeTab = ref('stock')
const loading = ref(false)
const stockMovement = ref([])
const poSummary = ref([])

const tabs = [
    { key: 'stock', label: 'Mutasi Stok' },
    { key: 'po', label: 'Ringkasan PO' }
]

const stockFilter = reactive({ from: '', to: '' })
const poFilter = reactive({ from: '', to: '' })

const fetchStockMovement = async () => {
    loading.value = true
    try {
        const res = await getStockMovement(stockFilter)
        stockMovement.value = res.data.data
    } catch (err) { } finally {
        loading.value = false
    }
}

const fetchPOSummary = async () => {
    loading.value = true
    try {
        const res = await getPOSummary(poFilter)
        poSummary.value = res.data.data
    } catch (err) { } finally {
        loading.value = false
    }
}

const typeClass = (type) => {
    if (type === 'IN') return 'bg-green-100 text-green-700'
    if (type === 'OUT') return 'bg-red-100 text-red-700'
    return 'bg-yellow-100 text-yellow-700'
}

const statusClass = (status) => {
    const map = {
        draft: 'bg-gray-100 text-gray-600',
        sent: 'bg-yellow-100 text-yellow-700',
        received: 'bg-green-100 text-green-700',
        cancelled: 'bg-red-100 text-red-700'
    }
    return map[status] || 'bg-gray-100 text-gray-600'
}

const formatDate = (date) => {
    return new Date(date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })
}

const formatCurrency = (value) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(value || 0)
}

onMounted(() => {
    fetchStockMovement()
    fetchPOSummary()
})
</script>