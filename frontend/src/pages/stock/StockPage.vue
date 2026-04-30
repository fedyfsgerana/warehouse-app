<template>
    <div>
        <div class="flex items-center justify-between mb-6">
            <div>
                <h2 class="text-2xl font-bold" style="color: var(--color-text);">Stok</h2>
                <p class="mt-1 text-sm" style="color: var(--color-text-muted);">Monitor stok dan history transaksi</p>
            </div>
        </div>

        <div class="flex gap-4 mb-6 card">
            <select v-model="selectedWarehouse" @change="fetchStock" class="input" style="width: 220px;">
                <option value="">Semua Gudang</option>
                <option v-for="w in warehouses" :key="w.id" :value="w.id">{{ w.name }}</option>
            </select>
        </div>

        <div class="mb-6 table-container">
            <div class="flex items-center justify-between px-5 py-4"
                style="border-bottom: 1px solid var(--color-border);">
                <p class="text-sm font-bold" style="color: var(--color-text);">Data Stok</p>
                <span class="px-3 py-1 text-xs rounded-full"
                    style="background-color: var(--color-surface-2); color: var(--color-text-muted);">
                    {{ stockStore.stocks.length }} item
                </span>
            </div>
            <div v-if="stockStore.loading" class="p-8 text-sm text-center" style="color: var(--color-text-muted);">
                Memuat...</div>
            <table v-else class="w-full">
                <thead>
                    <tr>
                        <th class="table-header">SKU</th>
                        <th class="table-header">Produk</th>
                        <th class="table-header">Gudang</th>
                        <th class="table-header">Lokasi</th>
                        <th class="table-header">Qty</th>
                        <th class="table-header">Unit</th>
                        <th class="table-header">Status</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-if="stockStore.stocks.length === 0">
                        <td colspan="7" class="table-cell text-center" style="color: var(--color-text-muted);">Belum ada
                            data stok.</td>
                    </tr>
                    <tr v-for="item in stockStore.stocks" :key="item.id" class="table-row">
                        <td class="table-cell">
                            <span class="px-2 py-1 font-mono text-xs rounded-lg"
                                style="background-color: var(--color-surface-2); color: var(--color-text-muted);">
                                {{ item.sku }}
                            </span>
                        </td>
                        <td class="table-cell font-semibold" style="color: var(--color-text);">{{ item.product_name }}
                        </td>
                        <td class="table-cell" style="color: var(--color-text-muted);">{{ item.warehouse_name }}</td>
                        <td class="table-cell">
                            <span class="px-2 py-1 font-mono text-xs rounded-lg"
                                style="background-color: var(--color-surface-2); color: var(--color-text-muted);">
                                {{ item.location_code || '-' }}
                            </span>
                        </td>
                        <td class="table-cell font-bold" style="color: var(--color-text);">{{ item.qty }}</td>
                        <td class="table-cell" style="color: var(--color-text-muted);">{{ item.unit }}</td>
                        <td class="table-cell">
                            <span class="badge" :style="item.qty <= item.min_stock
                                ? 'background-color: rgba(239,68,68,0.1); color: var(--color-danger);'
                                : 'background-color: rgba(16,185,129,0.1); color: var(--color-success);'">
                                {{ item.qty <= item.min_stock ? 'Menipis' : 'Normal' }} </span>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>

        <div class="card">
            <div class="flex items-center justify-between mb-4">
                <div class="flex items-center gap-3">
                    <div class="flex items-center justify-center w-8 h-8 rounded-lg"
                        style="background-color: var(--color-primary-light);">
                        <History :size="15" style="color: var(--color-primary);" />
                    </div>
                    <h3 class="text-base font-bold" style="color: var(--color-text);">History Transaksi</h3>
                </div>
                <div class="flex items-center gap-2">
                    <input v-model="historyFilter.from" type="date" class="input py-1.5 text-xs"
                        style="width: 150px;" />
                    <input v-model="historyFilter.to" type="date" class="input py-1.5 text-xs" style="width: 150px;" />
                    <button @click="fetchHistory" class="btn-primary py-1.5 px-3 text-xs">Filter</button>
                </div>
            </div>
            <div class="table-container">
                <table class="w-full">
                    <thead>
                        <tr>
                            <th class="table-header">Produk</th>
                            <th class="table-header">Tipe</th>
                            <th class="table-header">Qty</th>
                            <th class="table-header">Referensi</th>
                            <th class="table-header">Oleh</th>
                            <th class="table-header">Waktu</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-if="history.length === 0">
                            <td colspan="6" class="table-cell text-center" style="color: var(--color-text-muted);">Belum
                                ada history.</td>
                        </tr>
                        <tr v-for="item in history" :key="item.id" class="table-row">
                            <td class="table-cell font-semibold" style="color: var(--color-text);">{{ item.product_name
                            }}</td>
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
    </div>
</template>

<script setup>
import { ref, onMounted, reactive } from 'vue'
import { useStockStore } from '@/stores/stock.store'
import { getStockHistory } from '@/services/modules/stock'
import { getWarehouses } from '@/services/modules/warehouses'
import { History } from 'lucide-vue-next'

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
    fetchStock()
    fetchHistory()
    const res = await getWarehouses()
    warehouses.value = res.data.data
})
</script>