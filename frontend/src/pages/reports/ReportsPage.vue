<template>
    <div>
        <div class="flex items-center justify-between mb-6">
            <div>
                <h2 class="text-2xl font-bold" style="color: var(--color-text);">Laporan</h2>
                <p class="mt-1 text-sm" style="color: var(--color-text-muted);">Laporan dan analitik bisnis</p>
            </div>
        </div>

        <div class="flex gap-2 mb-6">
            <button v-for="tab in tabs" :key="tab.key" @click="activeTab = tab.key"
                class="flex items-center gap-2 px-4 py-2 text-sm font-semibold transition-all rounded-xl" :style="activeTab === tab.key
                    ? 'background-color: var(--color-primary); color: white;'
                    : 'background-color: var(--color-surface-2); color: var(--color-text-muted);'">
                <component :is="tab.icon" :size="15" />
                {{ tab.label }}
            </button>
        </div>

        <div v-if="activeTab === 'stock'">
            <div class="flex items-center gap-4 mb-6 card">
                <div class="flex items-center flex-1 gap-2">
                    <label class="mb-0 label whitespace-nowrap">Dari</label>
                    <input v-model="stockFilter.from" type="date" class="input" />
                </div>
                <div class="flex items-center flex-1 gap-2">
                    <label class="mb-0 label whitespace-nowrap">Sampai</label>
                    <input v-model="stockFilter.to" type="date" class="input" />
                </div>
                <button @click="fetchStockMovement" class="btn-primary whitespace-nowrap">
                    <Filter :size="15" />
                    Filter
                </button>
            </div>

            <div class="table-container">
                <div class="flex items-center justify-between px-5 py-4"
                    style="border-bottom: 1px solid var(--color-border);">
                    <p class="text-sm font-bold" style="color: var(--color-text);">Mutasi Stok</p>
                    <span class="px-3 py-1 text-xs rounded-full"
                        style="background-color: var(--color-surface-2); color: var(--color-text-muted);">
                        {{ stockMovement.length }} transaksi
                    </span>
                </div>
                <div v-if="loading" class="p-8 text-sm text-center" style="color: var(--color-text-muted);">Memuat...
                </div>
                <table v-else class="w-full">
                    <thead>
                        <tr>
                            <th class="table-header">Produk</th>
                            <th class="table-header">SKU</th>
                            <th class="table-header">Gudang</th>
                            <th class="table-header">Tipe</th>
                            <th class="table-header">Qty</th>
                            <th class="table-header">Referensi</th>
                            <th class="table-header">Oleh</th>
                            <th class="table-header">Tanggal</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-if="stockMovement.length === 0">
                            <td colspan="8" class="table-cell text-center" style="color: var(--color-text-muted);">Belum
                                ada data.</td>
                        </tr>
                        <tr v-for="item in stockMovement" :key="item.id" class="table-row">
                            <td class="table-cell font-semibold" style="color: var(--color-text);">{{ item.product_name
                            }}</td>
                            <td class="table-cell">
                                <span class="px-2 py-1 font-mono text-xs rounded-lg"
                                    style="background-color: var(--color-surface-2); color: var(--color-text-muted);">
                                    {{ item.sku }}
                                </span>
                            </td>
                            <td class="table-cell" style="color: var(--color-text-muted);">{{ item.warehouse_name }}
                            </td>
                            <td class="table-cell">
                                <span class="badge" :style="typeClass(item.type)">{{ item.type }}</span>
                            </td>
                            <td class="table-cell font-semibold" style="color: var(--color-text);">{{ item.qty }}</td>
                            <td class="table-cell">
                                <span class="px-2 py-1 text-xs rounded-lg"
                                    style="background-color: var(--color-surface-2); color: var(--color-text-muted);">
                                    {{ item.reference_type }} #{{ item.reference_id }}
                                </span>
                            </td>
                            <td class="table-cell" style="color: var(--color-text-muted);">{{ item.created_by_name }}
                            </td>
                            <td class="table-cell" style="color: var(--color-text-muted);">{{
                                formatDate(item.created_at) }}</td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>

        <div v-if="activeTab === 'po'">
            <div class="flex items-center gap-4 mb-6 card">
                <div class="flex items-center flex-1 gap-2">
                    <label class="mb-0 label whitespace-nowrap">Dari</label>
                    <input v-model="poFilter.from" type="date" class="input" />
                </div>
                <div class="flex items-center flex-1 gap-2">
                    <label class="mb-0 label whitespace-nowrap">Sampai</label>
                    <input v-model="poFilter.to" type="date" class="input" />
                </div>
                <button @click="fetchPOSummary" class="btn-primary whitespace-nowrap">
                    <Filter :size="15" />
                    Filter
                </button>
            </div>

            <div class="table-container">
                <div class="flex items-center justify-between px-5 py-4"
                    style="border-bottom: 1px solid var(--color-border);">
                    <p class="text-sm font-bold" style="color: var(--color-text);">Ringkasan Purchase Order</p>
                    <span class="px-3 py-1 text-xs rounded-full"
                        style="background-color: var(--color-surface-2); color: var(--color-text-muted);">
                        {{ poSummary.length }} PO
                    </span>
                </div>
                <div v-if="loading" class="p-8 text-sm text-center" style="color: var(--color-text-muted);">Memuat...
                </div>
                <table v-else class="w-full">
                    <thead>
                        <tr>
                            <th class="table-header">No. PO</th>
                            <th class="table-header">Supplier</th>
                            <th class="table-header">Status</th>
                            <th class="table-header">Total Item</th>
                            <th class="table-header">Total Nilai</th>
                            <th class="table-header">Tanggal</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-if="poSummary.length === 0">
                            <td colspan="6" class="table-cell text-center" style="color: var(--color-text-muted);">Belum
                                ada data.</td>
                        </tr>
                        <tr v-for="item in poSummary" :key="item.id" class="table-row">
                            <td class="table-cell">
                                <span class="px-2 py-1 font-mono text-xs rounded-lg"
                                    style="background-color: var(--color-surface-2); color: var(--color-text);">
                                    {{ item.po_number }}
                                </span>
                            </td>
                            <td class="table-cell" style="color: var(--color-text);">{{ item.supplier_name || '-' }}
                            </td>
                            <td class="table-cell">
                                <span class="badge" :style="statusClass(item.status)">{{ item.status }}</span>
                            </td>
                            <td class="table-cell font-semibold" style="color: var(--color-text);">{{ item.total_items
                            }}</td>
                            <td class="table-cell font-semibold" style="color: var(--color-text);">{{
                                formatCurrency(item.total_value) }}</td>
                            <td class="table-cell" style="color: var(--color-text-muted);">{{
                                formatDate(item.created_at) }}</td>
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
import { Layers, ShoppingCart, Filter } from 'lucide-vue-next'

const activeTab = ref('stock')
const loading = ref(false)
const stockMovement = ref([])
const poSummary = ref([])

const tabs = [
    { key: 'stock', label: 'Mutasi Stok', icon: Layers },
    { key: 'po', label: 'Ringkasan PO', icon: ShoppingCart },
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
    if (type === 'IN') return 'background-color: rgba(16,185,129,0.1); color: var(--color-success);'
    if (type === 'OUT') return 'background-color: rgba(239,68,68,0.1); color: var(--color-danger);'
    return 'background-color: rgba(245,158,11,0.1); color: var(--color-warning);'
}

const statusClass = (status) => {
    const map = {
        draft: 'background-color: var(--color-surface-2); color: var(--color-text-muted);',
        sent: 'background-color: rgba(245,158,11,0.1); color: var(--color-warning);',
        received: 'background-color: rgba(16,185,129,0.1); color: var(--color-success);',
        cancelled: 'background-color: rgba(239,68,68,0.1); color: var(--color-danger);'
    }
    return map[status] || ''
}

const formatDate = (date) => {
    return new Date(date).toLocaleDateString('id-ID', {
        day: 'numeric', month: 'short', year: 'numeric'
    })
}

const formatCurrency = (value) => {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0
    }).format(value || 0)
}

onMounted(() => {
    fetchStockMovement()
    fetchPOSummary()
})
</script>