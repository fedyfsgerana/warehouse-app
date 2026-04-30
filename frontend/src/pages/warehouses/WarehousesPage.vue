<template>
    <div>
        <div class="flex items-center justify-between mb-6">
            <h2 class="text-2xl font-bold text-gray-800">Gudang</h2>
            <button v-if="authStore.isAdmin || authStore.isManager" @click="openModal()"
                class="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors">
                Tambah Gudang
            </button>
        </div>

        <div class="bg-white rounded-xl shadow-sm overflow-hidden">
            <div v-if="loading" class="p-8 text-center text-gray-400">Memuat...</div>
            <table v-else class="w-full text-sm">
                <thead class="bg-gray-50">
                    <tr class="text-left text-gray-500">
                        <th class="px-6 py-3">Nama</th>
                        <th class="px-6 py-3">Alamat</th>
                        <th class="px-6 py-3">Aksi</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-if="warehouses.length === 0">
                        <td colspan="3" class="px-6 py-8 text-center text-gray-400">Belum ada gudang.</td>
                    </tr>
                    <tr v-for="warehouse in warehouses" :key="warehouse.id" class="border-t hover:bg-gray-50">
                        <td class="px-6 py-3 font-medium">{{ warehouse.name }}</td>
                        <td class="px-6 py-3 text-gray-500">{{ warehouse.address || '-' }}</td>
                        <td class="px-6 py-3 flex gap-3">
                            <button @click="openLocations(warehouse)"
                                class="text-gray-600 hover:underline">Lokasi</button>
                            <button v-if="authStore.isAdmin || authStore.isManager" @click="openModal(warehouse)"
                                class="text-primary-600 hover:underline">Edit</button>
                            <button v-if="authStore.isAdmin" @click="handleDelete(warehouse.id)"
                                class="text-red-500 hover:underline">Hapus</button>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>

        <div v-if="showModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div class="bg-white rounded-xl p-6 w-full max-w-md shadow-xl">
                <h3 class="text-lg font-semibold mb-4">{{ editingWarehouse ? 'Edit Gudang' : 'Tambah Gudang' }}</h3>
                <div class="space-y-3">
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">Nama Gudang</label>
                        <input v-model="form.name" type="text"
                            class="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">Alamat</label>
                        <textarea v-model="form.address" rows="3"
                            class="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"></textarea>
                    </div>
                </div>
                <div v-if="error" class="text-red-500 text-sm mt-3">{{ error }}</div>
                <div class="flex justify-end gap-3 mt-6">
                    <button @click="closeModal" class="px-4 py-2 text-sm text-gray-600 hover:underline">Batal</button>
                    <button @click="handleSubmit"
                        class="px-4 py-2 text-sm bg-primary-600 text-white rounded-lg hover:bg-primary-700">
                        {{ editingWarehouse ? 'Simpan' : 'Tambah' }}
                    </button>
                </div>
            </div>
        </div>

        <div v-if="showLocations" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div class="bg-white rounded-xl p-6 w-full max-w-lg shadow-xl">
                <div class="flex items-center justify-between mb-4">
                    <h3 class="text-lg font-semibold">Lokasi - {{ selectedWarehouse?.name }}</h3>
                    <button @click="showLocations = false" class="text-gray-400 hover:text-gray-600">Tutup</button>
                </div>

                <table class="w-full text-sm mb-4">
                    <thead class="bg-gray-50">
                        <tr class="text-left text-gray-500">
                            <th class="px-4 py-2">Kode Lokasi</th>
                            <th class="px-4 py-2">Produk</th>
                            <th class="px-4 py-2">Qty</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-if="locations.length === 0">
                            <td colspan="3" class="px-4 py-4 text-center text-gray-400">Belum ada lokasi.</td>
                        </tr>
                        <tr v-for="loc in locations" :key="loc.id" class="border-t">
                            <td class="px-4 py-2 font-medium">{{ loc.location_code }}</td>
                            <td class="px-4 py-2">{{ loc.product_name || '-' }}</td>
                            <td class="px-4 py-2">{{ loc.qty }}</td>
                        </tr>
                    </tbody>
                </table>

                <div v-if="authStore.isAdmin || authStore.isManager" class="border-t pt-4">
                    <p class="text-sm font-medium text-gray-700 mb-2">Tambah Lokasi</p>
                    <div class="flex gap-2">
                        <input v-model="newLocation.location_code" placeholder="Kode lokasi, ex: A-01"
                            class="flex-1 border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
                        <button @click="handleAddLocation"
                            class="bg-primary-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-primary-700">Tambah</button>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted, reactive } from 'vue'
import { useAuthStore } from '@/stores/auth.store'
import { getWarehouses, createWarehouse, updateWarehouse, deleteWarehouse, getLocations, createLocation } from '@/services/modules/warehouses'

const authStore = useAuthStore()
const warehouses = ref([])
const locations = ref([])
const loading = ref(false)
const showModal = ref(false)
const showLocations = ref(false)
const editingWarehouse = ref(null)
const selectedWarehouse = ref(null)
const error = ref('')

const form = reactive({ name: '', address: '' })
const newLocation = reactive({ location_code: '' })

const fetchWarehouses = async () => {
    loading.value = true
    try {
        const res = await getWarehouses()
        warehouses.value = res.data.data
    } catch (err) { } finally {
        loading.value = false
    }
}

const openModal = (warehouse = null) => {
    editingWarehouse.value = warehouse
    error.value = ''
    form.name = warehouse?.name || ''
    form.address = warehouse?.address || ''
    showModal.value = true
}

const closeModal = () => {
    showModal.value = false
    editingWarehouse.value = null
}

const handleSubmit = async () => {
    try {
        if (editingWarehouse.value) {
            await updateWarehouse(editingWarehouse.value.id, form)
        } else {
            await createWarehouse(form)
        }
        closeModal()
        fetchWarehouses()
    } catch (err) {
        error.value = err.response?.data?.error || 'Terjadi kesalahan.'
    }
}

const handleDelete = async (id) => {
    if (!confirm('Yakin ingin menghapus gudang ini?')) return
    try {
        await deleteWarehouse(id)
        fetchWarehouses()
    } catch (err) {
        alert(err.response?.data?.error || 'Gagal menghapus gudang.')
    }
}

const openLocations = async (warehouse) => {
    selectedWarehouse.value = warehouse
    showLocations.value = true
    const res = await getLocations(warehouse.id)
    locations.value = res.data.data
}

const handleAddLocation = async () => {
    try {
        await createLocation(selectedWarehouse.value.id, newLocation)
        newLocation.location_code = ''
        const res = await getLocations(selectedWarehouse.value.id)
        locations.value = res.data.data
    } catch (err) {
        alert(err.response?.data?.error || 'Gagal menambah lokasi.')
    }
}

onMounted(fetchWarehouses)
</script>