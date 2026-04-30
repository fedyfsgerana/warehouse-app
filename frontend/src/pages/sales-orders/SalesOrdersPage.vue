<template>
    <div>
        <div class="flex items-center justify-between mb-6">
            <h2 class="text-2xl font-bold text-gray-800">Sales Order</h2>
            <button @click="openModal()"
                class="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors">
                Buat SO
            </button>
        </div>

        <div class="bg-white rounded-xl shadow-sm p-4 mb-6">
            <select v-model="filterStatus" @change="fetchSO"
                class="border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500">
                <option value="">Semua Status</option>
                <option value="draft">Draft</option>
                <option value="confirmed">Confirmed</option>
                <option value="shipped">Shipped</option>
                <option value="cancelled">Cancelled</option>
            </select>
        </div>

        <div class="bg-white rounded-xl shadow-sm overflow-hidden">
            <div v-if="loading" class="p-8 text-center text-gray-400">Memuat...</div>
            <table v-else class="w-full text-sm">
                <thead class="bg-gray-50">
                    <tr class="text-left text-gray-500">
                        <th class="px-6 py-3">No. SO</th>
                        <th class="px-6 py-3">Tujuan</th>
                        <th class="px-6 py-3">Status</th>
                        <th class="px-6 py-3">Tracking</th>
                        <th class="px-6 py-3">Dibuat Oleh</th>
                        <th class="px-6 py-3">Tanggal</th>
                        <th class="px-6 py-3">Aksi</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-if="salesOrders.length === 0">
                        <td colspan="7" class="px-6 py-8 text-center text-gray-400">Belum ada sales order.</td>
                    </tr>
                    <tr v-for="so in salesOrders" :key="so.id" class="border-t hover:bg-gray-50">
                        <td class="px-6 py-3 font-medium">{{ so.so_number }}</td>
                        <td class="px-6 py-3">{{ so.destination || '-' }}</td>
                        <td class="px-6 py-3">
                            <span :class="statusClass(so.status)"
                                class="px-2 py-0.5 rounded-full text-xs font-medium capitalize">
                                {{ so.status }}
                            </span>
                        </td>
                        <td class="px-6 py-3 text-gray-500">{{ so.tracking_number || '-' }}</td>
                        <td class="px-6 py-3 text-gray-500">{{ so.created_by_name }}</td>
                        <td class="px-6 py-3 text-gray-500">{{ formatDate(so.created_at) }}</td>
                        <td class="px-6 py-3 flex gap-2">
                            <button @click="openDetail(so.id)" class="text-primary-600 hover:underline">Detail</button>
                            <button v-if="(authStore.isAdmin || authStore.isManager) && so.status === 'draft'"
                                @click="handleConfirm(so.id)" class="text-yellow-600 hover:underline">
                                Konfirmasi
                            </button>
                            <button v-if="(authStore.isAdmin || authStore.isManager) && so.status === 'confirmed'"
                                @click="openShip(so)" class="text-green-600 hover:underline">
                                Kirim
                            </button>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>

        <div v-if="showModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div class="bg-white rounded-xl p-6 w-full max-w-lg shadow-xl">
                <h3 class="text-lg font-semibold mb-4">Buat Sales Order</h3>
                <div class="space-y-3 mb-4">
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">Tujuan</label>
                        <input v-model="form.destination" type="text" placeholder="Nama tujuan pengiriman"
                            class="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
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
                        <button @click="removeItem(index)" class="text-red-500 hover:underline text-sm">Hapus</button>
                    </div>
                </div>

                <div v-if="error" class="text-red-500 text-sm mb-3">{{ error }}</div>
                <div class="flex justify-end gap-3">
                    <button @click="closeModal" class="px-4 py-2 text-sm text-gray-600 hover:underline">Batal</button>
                    <button @click="handleSubmit"
                        class="px-4 py-2 text-sm bg-primary-600 text-white rounded-lg hover:bg-primary-700">Buat
                        SO</button>
                </div>
            </div>
        </div>

        <div v-if="showDetail" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div class="bg-white rounded-xl p-6 w-full max-w-lg shadow-xl">
                <div class="flex items-center justify-between mb-4">
                    <h3 class="text-lg font-semibold">Detail SO - {{ detail?.so_number }}</h3>
                    <button @click="showDetail = false" class="text-gray-400 hover:text-gray-600">Tutup</button>
                </div>
                <table class="w-full text-sm">
                    <thead class="bg-gray-50">
                        <tr class="text-left text-gray-500">
                            <th class="px-4 py-2">Produk</th>
                            <th class="px-4 py-2">Qty</th>
                            <th class="px-4 py-2">Harga</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-for="item in detail?.items" :key="item.id" class="border-t">
                            <td class="px-4 py-2">{{ item.product_name }}</td>
                            <td class="px-4 py-2">{{ item.qty }}</td>
                            <td class="px-4 py-2">{{ item.price }}</td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>

        <div v-if="showShip" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div class="bg-white rounded-xl p-6 w-full max-w-md shadow-xl">
                <h3 class="text-lg font-semibold mb-4">Kirim SO - {{ shippingSONumber }}</h3>
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Tracking Number</label>
                    <input v-model="trackingNumber" type="text" placeholder="Masukkan nomor resi"
                        class="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
                </div>
                <div v-if="error" class="text-red-500 text-sm mt-3">{{ error }}</div>
                <div class="flex justify-end gap-3 mt-6">
                    <button @click="showShip = false"
                        class="px-4 py-2 text-sm text-gray-600 hover:underline">Batal</button>
                    <button @click="handleShip"
                        class="px-4 py-2 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700">Kirim</button>
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
        draft: 'bg-gray-100 text-gray-600',
        confirmed: 'bg-yellow-100 text-yellow-700',
        shipped: 'bg-green-100 text-green-700',
        cancelled: 'bg-red-100 text-red-700'
    }
    return map[status] || 'bg-gray-100 text-gray-600'
}

const formatDate = (date) => {
    return new Date(date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })
}

onMounted(async () => {
    fetchSO()
    const res = await getProducts({})
    products.value = res.data.data
})
</script>