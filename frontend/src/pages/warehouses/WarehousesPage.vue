<template>
    <div>
        <div class="flex items-center justify-between mb-6">
            <div>
                <h2 class="text-2xl font-bold" style="color: var(--color-text);">Gudang</h2>
                <p class="mt-1 text-sm" style="color: var(--color-text-muted);">Kelola gudang dan lokasi penyimpanan</p>
            </div>
            <button v-if="authStore.isAdmin || authStore.isManager" @click="openModal()" class="btn-primary">
                <Plus :size="16" />
                Tambah Gudang
            </button>
        </div>

        <div class="table-container">
            <div v-if="loading" class="p-8 text-sm text-center" style="color: var(--color-text-muted);">Memuat...</div>
            <table v-else class="w-full">
                <thead>
                    <tr>
                        <th class="table-header">Nama</th>
                        <th class="table-header">Alamat</th>
                        <th class="table-header">Aksi</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-if="warehouses.length === 0">
                        <td colspan="3" class="table-cell text-center" style="color: var(--color-text-muted);">Belum ada
                            gudang.</td>
                    </tr>
                    <tr v-for="warehouse in warehouses" :key="warehouse.id" class="table-row">
                        <td class="table-cell">
                            <div class="flex items-center gap-3">
                                <div class="flex items-center justify-center flex-shrink-0 w-8 h-8 rounded-lg"
                                    style="background-color: var(--color-primary-light);">
                                    <Warehouse :size="15" style="color: var(--color-primary);" />
                                </div>
                                <span class="font-semibold" style="color: var(--color-text);">{{ warehouse.name
                                    }}</span>
                            </div>
                        </td>
                        <td class="table-cell text-sm" style="color: var(--color-text-muted);">{{ warehouse.address ||
                            '-' }}</td>
                        <td class="table-cell">
                            <div class="flex items-center gap-2">
                                <button @click="openLocations(warehouse)"
                                    class="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold"
                                    style="background-color: rgba(16,185,129,0.1); color: var(--color-success);">
                                    <MapPin :size="12" />
                                    Lokasi
                                </button>
                                <button v-if="authStore.isAdmin || authStore.isManager" @click="openModal(warehouse)"
                                    class="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold"
                                    style="background-color: var(--color-primary-light); color: var(--color-primary);">
                                    <Pencil :size="12" />
                                    Edit
                                </button>
                                <button v-if="authStore.isAdmin" @click="handleDelete(warehouse.id)"
                                    class="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold"
                                    style="background-color: rgba(239,68,68,0.1); color: var(--color-danger);">
                                    <Trash2 :size="12" />
                                    Hapus
                                </button>
                            </div>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>

        <div v-if="showModal" class="modal-overlay">
            <div class="modal">
                <div class="flex items-center justify-between mb-6">
                    <div>
                        <h3 class="text-lg font-bold" style="color: var(--color-text);">
                            {{ editingWarehouse ? 'Edit Gudang' : 'Tambah Gudang' }}
                        </h3>
                        <p class="text-xs mt-0.5" style="color: var(--color-text-muted);">
                            {{ editingWarehouse ? 'Update informasi gudang' : 'Tambah gudang baru' }}
                        </p>
                    </div>
                    <button @click="closeModal" class="p-2 btn-ghost rounded-xl">
                        <X :size="18" />
                    </button>
                </div>
                <div class="space-y-4">
                    <div>
                        <label class="label">Nama Gudang</label>
                        <input v-model="form.name" type="text" placeholder="Nama gudang" class="input" />
                    </div>
                    <div>
                        <label class="label">Alamat</label>
                        <textarea v-model="form.address" rows="3" placeholder="Alamat gudang" class="input"></textarea>
                    </div>
                </div>
                <div v-if="error" class="flex items-center gap-2 p-3 mt-4 text-sm rounded-xl"
                    style="background-color: rgba(239,68,68,0.1); color: var(--color-danger);">
                    <AlertCircle :size="15" />
                    {{ error }}
                </div>
                <div class="flex justify-end gap-3 mt-6">
                    <button @click="closeModal" class="btn-ghost">Batal</button>
                    <button @click="handleSubmit" class="btn-primary">
                        <Save :size="15" />
                        {{ editingWarehouse ? 'Simpan' : 'Tambah' }}
                    </button>
                </div>
            </div>
        </div>

        <div v-if="showLocations" class="modal-overlay">
            <div class="modal" style="max-width: 560px;">
                <div class="flex items-center justify-between mb-6">
                    <div>
                        <h3 class="text-lg font-bold" style="color: var(--color-text);">Lokasi — {{
                            selectedWarehouse?.name }}</h3>
                        <p class="text-xs mt-0.5" style="color: var(--color-text-muted);">Daftar rak dan lokasi
                            penyimpanan</p>
                    </div>
                    <button @click="showLocations = false" class="p-2 btn-ghost rounded-xl">
                        <X :size="18" />
                    </button>
                </div>

                <div class="mb-4 table-container">
                    <table class="w-full text-sm">
                        <thead>
                            <tr>
                                <th class="table-header">Kode Lokasi</th>
                                <th class="table-header">Produk</th>
                                <th class="table-header">Qty</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr v-if="locations.length === 0">
                                <td colspan="3" class="table-cell text-center" style="color: var(--color-text-muted);">
                                    Belum ada lokasi.</td>
                            </tr>
                            <tr v-for="loc in locations" :key="loc.id" class="table-row">
                                <td class="table-cell">
                                    <span class="px-2 py-1 font-mono text-xs rounded-lg"
                                        style="background-color: var(--color-surface-2); color: var(--color-text);">
                                        {{ loc.location_code }}
                                    </span>
                                </td>
                                <td class="table-cell" style="color: var(--color-text-muted);">{{ loc.product_name ||
                                    '-' }}</td>
                                <td class="table-cell font-semibold" style="color: var(--color-text);">{{ loc.qty }}
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                <div v-if="authStore.isAdmin || authStore.isManager">
                    <label class="label">Tambah Lokasi Baru</label>
                    <div class="flex gap-2">
                        <input v-model="newLocation.location_code" placeholder="Kode lokasi, ex: A-01-03"
                            class="flex-1 input" />
                        <button @click="handleAddLocation" class="px-4 btn-primary">
                            <Plus :size="15" />
                            Tambah
                        </button>
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
import { Plus, Pencil, Trash2, X, Save, AlertCircle, Warehouse, MapPin } from 'lucide-vue-next'

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
    error.value = ''
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
    if (!newLocation.location_code) return
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