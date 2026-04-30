<template>
    <div>
        <div class="flex items-center justify-between mb-6">
            <div>
                <h2 class="text-2xl font-bold" style="color: var(--color-text);">Sales Order</h2>
                <p class="mt-1 text-sm" style="color: var(--color-text-muted);">Kelola penjualan dan pengiriman</p>
            </div>
            <button @click="openModal()" class="btn-primary">
                <Plus :size="16" />
                Buat SO
            </button>
        </div>

        <div class="mb-6 card">
            <select v-model="filterStatus" @change="fetchSO" class="input" style="width: 200px;">
                <option value="">Semua Status</option>
                <option value="draft">Draft</option>
                <option value="confirmed">Confirmed</option>
                <option value="shipped">Shipped</option>
                <option value="cancelled">Cancelled</option>
            </select>
        </div>

        <div class="table-container">
            <div v-if="loading" class="p-8 text-sm text-center" style="color: var(--color-text-muted);">Memuat...</div>
            <table v-else class="w-full">
                <thead>
                    <tr>
                        <th class="table-header">No. SO</th>
                        <th class="table-header">Tujuan</th>
                        <th class="table-header">Status</th>
                        <th class="table-header">Tracking</th>
                        <th class="table-header">Dibuat Oleh</th>
                        <th class="table-header">Tanggal</th>
                        <th class="table-header">Aksi</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-if="salesOrders.length === 0">
                        <td colspan="7" class="table-cell text-center" style="color: var(--color-text-muted);">Belum ada
                            sales order.</td>
                    </tr>
                    <tr v-for="so in salesOrders" :key="so.id" class="table-row">
                        <td class="table-cell">
                            <span class="px-2 py-1 font-mono text-xs rounded-lg"
                                style="background-color: var(--color-surface-2); color: var(--color-text);">
                                {{ so.so_number }}
                            </span>
                        </td>
                        <td class="table-cell" style="color: var(--color-text);">{{ so.destination || '-' }}</td>
                        <td class="table-cell">
                            <span class="badge" :style="statusClass(so.status)">{{ so.status }}</span>
                        </td>
                        <td class="table-cell">
                            <span v-if="so.tracking_number" class="px-2 py-1 font-mono text-xs rounded-lg"
                                style="background-color: var(--color-surface-2); color: var(--color-text-muted);">
                                {{ so.tracking_number }}
                            </span>
                            <span v-else style="color: var(--color-text-muted);">-</span>
                        </td>
                        <td class="table-cell" style="color: var(--color-text-muted);">{{ so.created_by_name }}</td>
                        <td class="table-cell" style="color: var(--color-text-muted);">{{ formatDate(so.created_at) }}
                        </td>
                        <td class="table-cell">
                            <div class="flex items-center gap-2">
                                <button @click="openDetail(so.id)"
                                    class="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold"
                                    style="background-color: var(--color-surface-2); color: var(--color-text);">
                                    <Eye :size="12" />
                                    Detail
                                </button>
                                <button v-if="(authStore.isAdmin || authStore.isManager) && so.status === 'draft'"
                                    @click="handleConfirm(so.id)"
                                    class="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold"
                                    style="background-color: rgba(245,158,11,0.1); color: var(--color-warning);">
                                    <CheckCircle :size="12" />
                                    Konfirmasi
                                </button>
                                <button v-if="(authStore.isAdmin || authStore.isManager) && so.status === 'confirmed'"
                                    @click="openShip(so)"
                                    class="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold"
                                    style="background-color: rgba(16,185,129,0.1); color: var(--color-success);">
                                    <Truck :size="12" />
                                    Kirim
                                </button>
                            </div>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>

        <div v-if="showModal" class="modal-overlay">
            <div class="modal" style="max-width: 560px;">
                <div class="flex items-center justify-between mb-6">
                    <div>
                        <h3 class="text-lg font-bold" style="color: var(--color-text);">Buat Sales Order</h3>
                        <p class="text-xs mt-0.5" style="color: var(--color-text-muted);">Buat SO baru</p>
                    </div>
                    <button @click="closeModal" class="p-2 btn-ghost rounded-xl">
                        <X :size="18" />
                    </button>
                </div>

                <div class="mb-4 space-y-4">
                    <div>
                        <label class="label">Tujuan</label>
                        <input v-model="form.destination" type="text" placeholder="Nama tujuan pengiriman"
                            class="input" />
                    </div>
                </div>

                <div class="mb-4">
                    <div class="flex items-center justify-between mb-3">
                        <label class="mb-0 label">Items</label>
                        <button @click="addItem" class="px-3 py-1 text-xs btn-ghost">
                            <Plus :size="13" />
                            Tambah Item
                        </button>
                    </div>
                    <div class="space-y-2">
                        <div v-for="(item, index) in form.items" :key="index" class="flex gap-2 p-3 rounded-xl"
                            style="background-color: var(--color-surface-2);">
                            <select v-model="item.product_id" class="flex-1 input">
                                <option value="">Pilih Produk</option>
                                <option v-for="p in products" :key="p.id" :value="p.id">{{ p.name }}</option>
                            </select>
                            <input v-model="item.qty" type="number" placeholder="Qty" class="input"
                                style="width: 80px;" />
                            <button @click="removeItem(index)" class="p-2 rounded-lg"
                                style="color: var(--color-danger); background-color: rgba(239,68,68,0.1);">
                                <Trash2 :size="14" />
                            </button>
                        </div>
                    </div>
                </div>

                <div v-if="error" class="flex items-center gap-2 p-3 text-sm rounded-xl"
                    style="background-color: rgba(239,68,68,0.1); color: var(--color-danger);">
                    <AlertCircle :size="15" />
                    {{ error }}
                </div>
                <div class="flex justify-end gap-3 mt-6">
                    <button @click="closeModal" class="btn-ghost">Batal</button>
                    <button @click="handleSubmit" class="btn-primary">
                        <Save :size="15" />
                        Buat SO
                    </button>
                </div>
            </div>
        </div>

        <div v-if="showDetail" class="modal-overlay">
            <div class="modal" style="max-width: 560px;">
                <div class="flex items-center justify-between mb-6">
                    <div>
                        <h3 class="text-lg font-bold" style="color: var(--color-text);">Detail SO — {{ detail?.so_number
                            }}</h3>
                        <p class="text-xs mt-0.5" style="color: var(--color-text-muted);">{{ detail?.destination }}</p>
                    </div>
                    <button @click="showDetail = false" class="p-2 btn-ghost rounded-xl">
                        <X :size="18" />
                    </button>
                </div>
                <div class="table-container">
                    <table class="w-full text-sm">
                        <thead>
                            <tr>
                                <th class="table-header">Produk</th>
                                <th class="table-header">Qty</th>
                                <th class="table-header">Harga</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr v-for="item in detail?.items" :key="item.id" class="table-row">
                                <td class="table-cell" style="color: var(--color-text);">{{ item.product_name }}</td>
                                <td class="table-cell" style="color: var(--color-text);">{{ item.qty }}</td>
                                <td class="table-cell" style="color: var(--color-text);">{{ item.price }}</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>

        <div v-if="showShip" class="modal-overlay">
            <div class="modal">
                <div class="flex items-center justify-between mb-6">
                    <div>
                        <h3 class="text-lg font-bold" style="color: var(--color-text);">Kirim SO — {{ shippingSONumber
                            }}</h3>
                        <p class="text-xs mt-0.5" style="color: var(--color-text-muted);">Input nomor resi pengiriman
                        </p>
                    </div>
                    <button @click="showShip = false" class="p-2 btn-ghost rounded-xl">
                        <X :size="18" />
                    </button>
                </div>
                <div>
                    <label class="label">Tracking Number</label>
                    <input v-model="trackingNumber" type="text" placeholder="Masukkan nomor resi" class="input" />
                </div>
                <div v-if="error" class="flex items-center gap-2 p-3 mt-4 text-sm rounded-xl"
                    style="background-color: rgba(239,68,68,0.1); color: var(--color-danger);">
                    <AlertCircle :size="15" />
                    {{ error }}
                </div>
                <div class="flex justify-end gap-3 mt-6">
                    <button @click="showShip = false" class="btn-ghost">Batal</button>
                    <button @click="handleShip" class="btn-primary" style="background-color: var(--color-success);">
                        <Truck :size="15" />
                        Kirim
                    </button>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted, reactive } from 'vue'
import { useAuthStore } from '@/stores/auth.store'
import { getSalesOrders, getSalesOrder, createSalesOrder, confirmSalesOrder, shipSalesOrder } from '@/services/modules/sales-orders'
import { getProducts } from '@/services/modules/products'
import { Plus, Eye, CheckCircle, Truck, X, Save, Trash2, AlertCircle } from 'lucide-vue-next'

const authStore = useAuthStore()
const salesOrders = ref([])
const products = ref([])
const loading = ref(false)
const filterStatus = ref('')
const showModal = ref(false)
const showDetail = ref(false)
const showShip = ref(false)
const detail = ref(null)
const shippingSOId = ref(null)
const shippingSONumber = ref('')
const trackingNumber = ref('')
const error = ref('')

const form = reactive({ destination: '', items: [] })

const fetchSO = async () => {
    loading.value = true
    try {
        const res = await getSalesOrders({ status: filterStatus.value })
        salesOrders.value = res.data.data
    } catch (err) { } finally {
        loading.value = false
    }
}

const openModal = () => {
    form.destination = ''
    form.items = [{ product_id: '', qty: 1 }]
    error.value = ''
    showModal.value = true
}

const closeModal = () => { showModal.value = false }
const addItem = () => form.items.push({ product_id: '', qty: 1 })
const removeItem = (index) => form.items.splice(index, 1)

const handleSubmit = async () => {
    error.value = ''
    try {
        await createSalesOrder(form)
        closeModal()
        fetchSO()
    } catch (err) {
        error.value = err.response?.data?.error || 'Terjadi kesalahan.'
    }
}

const handleConfirm = async (id) => {
    if (!confirm('Konfirmasi SO ini? Stok akan dikurangi.')) return
    try {
        await confirmSalesOrder(id)
        fetchSO()
    } catch (err) {
        alert(err.response?.data?.error || 'Gagal konfirmasi SO.')
    }
}

const openDetail = async (id) => {
    const res = await getSalesOrder(id)
    detail.value = res.data.data
    showDetail.value = true
}

const openShip = (so) => {
    shippingSOId.value = so.id
    shippingSONumber.value = so.so_number
    trackingNumber.value = ''
    error.value = ''
    showShip.value = true
}

const handleShip = async () => {
    error.value = ''
    try {
        await shipSalesOrder(shippingSOId.value, { tracking_number: trackingNumber.value })
        showShip.value = false
        fetchSO()
    } catch (err) {
        error.value = err.response?.data?.error || 'Gagal mengirim SO.'
    }
}

const statusClass = (status) => {
    const map = {
        draft: 'background-color: var(--color-surface-2); color: var(--color-text-muted);',
        confirmed: 'background-color: rgba(245,158,11,0.1); color: var(--color-warning);',
        shipped: 'background-color: rgba(16,185,129,0.1); color: var(--color-success);',
        cancelled: 'background-color: rgba(239,68,68,0.1); color: var(--color-danger);'
    }
    return map[status] || ''
}

const formatDate = (date) => {
    return new Date(date).toLocaleDateString('id-ID', {
        day: 'numeric', month: 'short', year: 'numeric'
    })
}

onMounted(async () => {
    fetchSO()
    const res = await getProducts({})
    products.value = res.data.data
})
</script>