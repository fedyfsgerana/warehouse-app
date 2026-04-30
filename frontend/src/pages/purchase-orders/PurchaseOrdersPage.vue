<template>
    <div>
        <div class="flex items-center justify-between mb-6">
            <h2 class="text-2xl font-bold text-gray-800">Purchase Order</h2>
            <button v-if="authStore.isAdmin || authStore.isManager" @click="openModal()"
                class="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors">
                Buat PO
            </button>
        </div>

        <div class="bg-white rounded-xl shadow-sm p-4 mb-6 flex gap-4">
            <select v-model="filterStatus" @change="fetchPO"
                class="border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500">
                <option value="">Semua Status</option>
                <option value="draft">Draft</option>
                <option value="sent">Sent</option>
                <option value="received">Received</option>
                <option value="cancelled">Cancelled</option>
            </select>
        </div>

        <div class="bg-white rounded-xl shadow-sm overflow-hidden">
            <div v-if="loading" class="p-8 text-center text-gray-400">Memuat...</div>
            <table v-else class="w-full text-sm">
                <thead class="bg-gray-50">
                    <tr class="text-left text-gray-500">
                        <th class="px-6 py-3">No. PO</th>
                        <th class="px-6 py-3">Supplier</th>
                        <th class="px-6 py-3">Status</th>
                        <th class="px-6 py-3">Dibuat Oleh</th>
                        <th class="px-6 py-3">Tanggal</th>
                        <th class="px-6 py-3">Aksi</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-if="purchaseOrders.length === 0">
                        <td colspan="6" class="px-6 py-8 text-center text-gray-400">Belum ada purchase order.</td>
                    </tr>
                    <tr v-for="po in purchaseOrders" :key="po.id" class="border-t hover:bg-gray-50">
                        <td class="px-6 py-3 font-medium">{{ po.po_number }}</td>
                        <td class="px-6 py-3">{{ po.supplier_name || '-' }}</td>
                        <td class="px-6 py-3">
                            <span :class="statusClass(po.status)"
                                class="px-2 py-0.5 rounded-full text-xs font-medium capitalize">
                                {{ po.status }}
                            </span>
                        </td>
                        <td class="px-6 py-3 text-gray-500">{{ po.created_by_name }}</td>
                        <td class="px-6 py-3 text-gray-500">{{ formatDate(po.created_at) }}</td>
                        <td class="px-6 py-3 flex gap-2">
                            <button @click="openDetail(po.id)" class="text-primary-600 hover:underline">Detail</button>
                            <button v-if="(authStore.isAdmin || authStore.isManager) && po.status === 'draft'"
                                @click="handleUpdateStatus(po.id, 'sent')" class="text-yellow-600 hover:underline">
                                Kirim
                            </button>
                            <button v-if="(authStore.isAdmin || authStore.isManager) && po.status === 'sent'"
                                @click="openReceive(po)" class="text-green-600 hover:underline">
                                Terima
                            </button>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>

        <div v-if="showModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div class="bg-white rounded-xl p-6 w-full max-w-lg shadow-xl">
                <h3 class="text-lg font-semibold mb-4">Buat Purchase Order</h3>
                <div class="space-y-3 mb-4">
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">Supplier</label>
                        <select v-model="form.supplier_id"
                            class="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500">
                            <option value="">Pilih Supplier</option>
                            <option v-for="s in suppliers" :key="s.id" :value="s.id">{{ s.name }}</option>
                        </select>
                    </div>
                </div>

                <div class="mb-4">
                    <div class="flex items-center justify-between mb-2">
                        <p class="text-sm font-medium text-gray-700">Items</p>
                        <button @click="addItem" class="text-primary-600 text-sm hover:underline">+ Tambah Item</button>
                    </div>
                    <div v-for="(item, index) in form.items" :key="index" class="flex gap-2 mb-2">
                        <select v-model="item.product_id"
                            class="flex-1 border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500">
                            <option value="">Pilih Produk</option>
                            <option v-for="p in products" :key="p.id" :value="p.id">{{ p.name }}</option>
                        </select>
                        <input v-model="item.qty" type="number" placeholder="Qty"
                            class="w-24 border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
                        <input v-model="item.price" type="number" placeholder="Harga"
                            class="w-28 border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
                        <button @click="removeItem(index)" class="text-red-500 hover:underline text-sm">Hapus</button>
                    </div>
                </div>

                <div v-if="error" class="text-red-500 text-sm mb-3">{{ error }}</div>
                <div class="flex justify-end gap-3">
                    <button @click="closeModal" class="px-4 py-2 text-sm text-gray-600 hover:underline">Batal</button>
                    <button @click="handleSubmit"
                        class="px-4 py-2 text-sm bg-primary-600 text-white rounded-lg hover:bg-primary-700">Buat
                        PO</button>
                </div>
            </div>
        </div>

        <div v-if="showDetail" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div class="bg-white rounded-xl p-6 w-full max-w-lg shadow-xl">
                <div class="flex items-center justify-between mb-4">
                    <h3 class="text-lg font-semibold">Detail PO - {{ detail?.po_number }}</h3>
                    <button @click="showDetail = false" class="text-gray-400 hover:text-gray-600">Tutup</button>
                </div>
                <table class="w-full text-sm">
                    <thead class="bg-gray-50">
                        <tr class="text-left text-gray-500">
                            <th class="px-4 py-2">Produk</th>
                            <th class="px-4 py-2">Qty</th>
                            <th class="px-4 py-2">Diterima</th>
                            <th class="px-4 py-2">Harga</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-for="item in detail?.items" :key="item.id" class="border-t">
                            <td class="px-4 py-2">{{ item.product_name }}</td>
                            <td class="px-4 py-2">{{ item.qty }}</td>
                            <td class="px-4 py-2">{{ item.qty_received }}</td>
                            <td class="px-4 py-2">{{ item.price }}</td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>

        <div v-if="showReceive" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div class="bg-white rounded-xl p-6 w-full max-w-lg shadow-xl">
                <h3 class="text-lg font-semibold mb-4">Terima Barang - {{ receivingPO?.po_number }}</h3>
                <div class="mb-3">
                    <label class="block text-sm font-medium text-gray-700 mb-1">Gudang Tujuan</label>
                    <select v-model="receiveForm.warehouse_id"
                        class="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500">
                        <option value="">Pilih Gudang</option>
                        <option v-for="w in warehouses" :key="w.id" :value="w.id">{{ w.name }}</option>
                    </select>
                </div>
                <table class="w-full text-sm mb-4">
                    <thead class="bg-gray-50">
                        <tr class="text-left text-gray-500">
                            <th class="px-4 py-2">Produk</th>
                            <th class="px-4 py-2">Qty PO</th>
                            <th class="px-4 py-2">Qty Diterima</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-for="item in receiveForm.items" :key="item.product_id" class="border-t">
                            <td class="px-4 py-2">{{ item.product_name }}</td>
                            <td class="px-4 py-2">{{ item.qty }}</td>
                            <td class="px-4 py-2">
                                <input v-model="item.qty_received" type="number"
                                    class="w-20 border rounded px-2 py-1 text-sm" />
                            </td>
                        </tr>
                    </tbody>
                </table>
                <div v-if="error" class="text-red-500 text-sm mb-3">{{ error }}</div>
                <div class="flex justify-end gap-3">
                    <button @click="showReceive = false"
                        class="px-4 py-2 text-sm text-gray-600 hover:underline">Batal</button>
                    <button @click="handleReceive"
                        class="px-4 py-2 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700">Terima
                        Barang</button>
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

onMounted(async () => {
    fetchPO()
    const [p, w] = await Promise.all([getProducts({}), getWarehouses()])
    products.value = p.data.data
    warehouses.value = w.data.data
})
</script>