<template>
    <div>
        <div class="flex items-center justify-between mb-6">
            <div>
                <h2 class="text-2xl font-bold" style="color: var(--color-text);">Purchase Order</h2>
                <p class="mt-1 text-sm" style="color: var(--color-text-muted);">Kelola pembelian dari supplier</p>
            </div>
            <button v-if="authStore.isAdmin || authStore.isManager" @click="openModal()" class="btn-primary">
                <Plus :size="16" />
                Buat PO
            </button>
        </div>

        <div class="flex gap-4 mb-6 card">
            <select v-model="filterStatus" @change="fetchPO" class="input" style="width: 200px;">
                <option value="">Semua Status</option>
                <option value="draft">Draft</option>
                <option value="sent">Sent</option>
                <option value="received">Received</option>
                <option value="cancelled">Cancelled</option>
            </select>
        </div>

        <div class="table-container">
            <div v-if="loading" class="p-8 text-sm text-center" style="color: var(--color-text-muted);">Memuat...</div>
            <table v-else class="w-full">
                <thead>
                    <tr>
                        <th class="table-header">No. PO</th>
                        <th class="table-header">Supplier</th>
                        <th class="table-header">Status</th>
                        <th class="table-header">Dibuat Oleh</th>
                        <th class="table-header">Tanggal</th>
                        <th class="table-header">Aksi</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-if="purchaseOrders.length === 0">
                        <td colspan="6" class="table-cell text-center" style="color: var(--color-text-muted);">Belum ada
                            purchase order.</td>
                    </tr>
                    <tr v-for="po in purchaseOrders" :key="po.id" class="table-row">
                        <td class="table-cell">
                            <span class="px-2 py-1 font-mono text-xs rounded-lg"
                                style="background-color: var(--color-surface-2); color: var(--color-text);">
                                {{ po.po_number }}
                            </span>
                        </td>
                        <td class="table-cell" style="color: var(--color-text);">{{ po.supplier_name || '-' }}</td>
                        <td class="table-cell">
                            <span class="badge" :style="statusClass(po.status)">{{ po.status }}</span>
                        </td>
                        <td class="table-cell" style="color: var(--color-text-muted);">{{ po.created_by_name }}</td>
                        <td class="table-cell" style="color: var(--color-text-muted);">{{ formatDate(po.created_at) }}
                        </td>
                        <td class="table-cell">
                            <div class="flex items-center gap-2">
                                <button @click="openDetail(po.id)"
                                    class="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold"
                                    style="background-color: var(--color-surface-2); color: var(--color-text);">
                                    <Eye :size="12" />
                                    Detail
                                </button>
                                <button v-if="(authStore.isAdmin || authStore.isManager) && po.status === 'draft'"
                                    @click="handleUpdateStatus(po.id, 'sent')"
                                    class="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold"
                                    style="background-color: rgba(245,158,11,0.1); color: var(--color-warning);">
                                    <Send :size="12" />
                                    Kirim
                                </button>
                                <button v-if="(authStore.isAdmin || authStore.isManager) && po.status === 'sent'"
                                    @click="openReceive(po)"
                                    class="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold"
                                    style="background-color: rgba(16,185,129,0.1); color: var(--color-success);">
                                    <PackageCheck :size="12" />
                                    Terima
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
                        <h3 class="text-lg font-bold" style="color: var(--color-text);">Buat Purchase Order</h3>
                        <p class="text-xs mt-0.5" style="color: var(--color-text-muted);">Buat PO baru ke supplier</p>
                    </div>
                    <button @click="closeModal" class="p-2 btn-ghost rounded-xl">
                        <X :size="18" />
                    </button>
                </div>

                <div class="mb-4 space-y-4">
                    <div>
                        <label class="label">Supplier</label>
                        <select v-model="form.supplier_id" class="input">
                            <option value="">Pilih Supplier</option>
                            <option v-for="s in suppliers" :key="s.id" :value="s.id">{{ s.name }}</option>
                        </select>
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
                            <input v-model="item.price" type="number" placeholder="Harga" class="input"
                                style="width: 110px;" />
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
                        Buat PO
                    </button>
                </div>
            </div>
        </div>

        <div v-if="showDetail" class="modal-overlay">
            <div class="modal" style="max-width: 560px;">
                <div class="flex items-center justify-between mb-6">
                    <div>
                        <h3 class="text-lg font-bold" style="color: var(--color-text);">Detail PO — {{ detail?.po_number
                        }}</h3>
                        <p class="text-xs mt-0.5" style="color: var(--color-text-muted);">{{ detail?.supplier_name }}
                        </p>
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
                                <th class="table-header">Diterima</th>
                                <th class="table-header">Harga</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr v-for="item in detail?.items" :key="item.id" class="table-row">
                                <td class="table-cell" style="color: var(--color-text);">{{ item.product_name }}</td>
                                <td class="table-cell" style="color: var(--color-text);">{{ item.qty }}</td>
                                <td class="table-cell" style="color: var(--color-text);">{{ item.qty_received }}</td>
                                <td class="table-cell" style="color: var(--color-text);">{{ item.price }}</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>

        <div v-if="showReceive" class="modal-overlay">
            <div class="modal" style="max-width: 560px;">
                <div class="flex items-center justify-between mb-6">
                    <div>
                        <h3 class="text-lg font-bold" style="color: var(--color-text);">Terima Barang — {{
                            receivingPO?.po_number }}</h3>
                        <p class="text-xs mt-0.5" style="color: var(--color-text-muted);">Input qty barang yang diterima
                        </p>
                    </div>
                    <button @click="showReceive = false" class="p-2 btn-ghost rounded-xl">
                        <X :size="18" />
                    </button>
                </div>

                <div class="mb-4">
                    <label class="label">Gudang Tujuan</label>
                    <select v-model="receiveForm.warehouse_id" class="input">
                        <option value="">Pilih Gudang</option>
                        <option v-for="w in warehouses" :key="w.id" :value="w.id">{{ w.name }}</option>
                    </select>
                </div>

                <div class="mb-4 table-container">
                    <table class="w-full text-sm">
                        <thead>
                            <tr>
                                <th class="table-header">Produk</th>
                                <th class="table-header">Qty PO</th>
                                <th class="table-header">Qty Diterima</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr v-for="item in receiveForm.items" :key="item.product_id" class="table-row">
                                <td class="table-cell" style="color: var(--color-text);">{{ item.product_name }}</td>
                                <td class="table-cell" style="color: var(--color-text-muted);">{{ item.qty }}</td>
                                <td class="table-cell">
                                    <input v-model="item.qty_received" type="number" class="input py-1.5 text-xs"
                                        style="width: 80px;" />
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                <div v-if="error" class="flex items-center gap-2 p-3 text-sm rounded-xl"
                    style="background-color: rgba(239,68,68,0.1); color: var(--color-danger);">
                    <AlertCircle :size="15" />
                    {{ error }}
                </div>
                <div class="flex justify-end gap-3 mt-6">
                    <button @click="showReceive = false" class="btn-ghost">Batal</button>
                    <button @click="handleReceive" class="btn-primary" style="background-color: var(--color-success);">
                        <PackageCheck :size="15" />
                        Terima Barang
                    </button>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted, reactive } from 'vue'
import { useAuthStore } from '@/stores/auth.store'
import { getPurchaseOrders, getPurchaseOrder, createPurchaseOrder, updatePurchaseOrderStatus, receivePurchaseOrder } from '@/services/modules/purchase-orders'
import { getProducts } from '@/services/modules/products'
import { getWarehouses } from '@/services/modules/warehouses'
import { getSuppliers } from '@/services/modules/suppliers'
import { Plus, Eye, Send, PackageCheck, X, Save, Trash2, AlertCircle } from 'lucide-vue-next'

const authStore = useAuthStore()
const purchaseOrders = ref([])
const products = ref([])
const suppliers = ref([])
const warehouses = ref([])
const loading = ref(false)
const filterStatus = ref('')
const showModal = ref(false)
const showDetail = ref(false)
const showReceive = ref(false)
const detail = ref(null)
const receivingPO = ref(null)
const error = ref('')

const form = reactive({ supplier_id: '', items: [] })
const receiveForm = reactive({ warehouse_id: '', items: [] })

const fetchPO = async () => {
    loading.value = true
    try {
        const res = await getPurchaseOrders({ status: filterStatus.value })
        purchaseOrders.value = res.data.data
    } catch (err) { } finally {
        loading.value = false
    }
}

const openModal = () => {
    form.supplier_id = ''
    form.items = [{ product_id: '', qty: 1, price: 0 }]
    error.value = ''
    showModal.value = true
}

const closeModal = () => { showModal.value = false }
const addItem = () => form.items.push({ product_id: '', qty: 1, price: 0 })
const removeItem = (index) => form.items.splice(index, 1)

const handleSubmit = async () => {
    error.value = ''
    try {
        await createPurchaseOrder(form)
        closeModal()
        fetchPO()
    } catch (err) {
        error.value = err.response?.data?.error || 'Terjadi kesalahan.'
    }
}

const handleUpdateStatus = async (id, status) => {
    try {
        await updatePurchaseOrderStatus(id, { status })
        fetchPO()
    } catch (err) {
        alert(err.response?.data?.error || 'Gagal update status.')
    }
}

const openDetail = async (id) => {
    const res = await getPurchaseOrder(id)
    detail.value = res.data.data
    showDetail.value = true
}

const openReceive = async (po) => {
    receivingPO.value = po
    const res = await getPurchaseOrder(po.id)
    receiveForm.warehouse_id = ''
    receiveForm.items = res.data.data.items.map(i => ({
        product_id: i.product_id,
        product_name: i.product_name,
        qty: i.qty,
        qty_received: i.qty
    }))
    error.value = ''
    showReceive.value = true
}

const handleReceive = async () => {
    error.value = ''
    try {
        await receivePurchaseOrder(receivingPO.value.id, receiveForm)
        showReceive.value = false
        fetchPO()
    } catch (err) {
        error.value = err.response?.data?.error || 'Gagal menerima barang.'
    }
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
    return new Date(date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })
}

onMounted(async () => {
    fetchPO()
    const [p, w, s] = await Promise.all([getProducts({}), getWarehouses(), getSuppliers()])
    products.value = p.data.data
    warehouses.value = w.data.data
    suppliers.value = s.data.data
})
</script>