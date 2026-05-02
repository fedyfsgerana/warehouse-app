<template>
    <div>
        <div class="flex items-center justify-between mb-6">
            <div>
                <h2 class="text-2xl font-bold" style="color: var(--color-text);">Gudang</h2>
                <p class="mt-1 text-sm" style="color: var(--color-text-muted);">Kelola gudang dan lokasi penyimpanan</p>
            </div>
            <button v-if="authStore.isAdmin || authStore.isManager" @click="openModal()"
                class="gap-2 btn btn-primary btn-sm">
                <Plus :size="16" />
                Tambah Gudang
            </button>
        </div>

        <div class="table-container">
            <div v-if="loading" class="flex justify-center p-8">
                <span class="loading loading-spinner" style="color: var(--color-primary);"></span>
            </div>
            <div v-else class="overflow-x-auto">
                <table class="table">
                    <thead>
                        <tr style="border-color: var(--color-border);">
                            <th style="background-color: var(--color-surface-2); color: var(--color-text-muted);">Nama
                            </th>
                            <th style="background-color: var(--color-surface-2); color: var(--color-text-muted);">Alamat
                            </th>
                            <th style="background-color: var(--color-surface-2); color: var(--color-text-muted);">Aksi
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-if="warehouses.length === 0">
                            <td colspan="3" class="py-8 text-center" style="color: var(--color-text-muted);">Belum ada
                                gudang.</td>
                        </tr>
                        <tr v-for="warehouse in warehouses" :key="warehouse.id"
                            style="border-color: var(--color-border);">
                            <td>
                                <div class="flex items-center gap-3">
                                    <div class="flex items-center justify-center flex-shrink-0 w-8 h-8 rounded-lg"
                                        style="background-color: var(--color-primary-light);">
                                        <Warehouse :size="15" style="color: var(--color-primary);" />
                                    </div>
                                    <span class="font-semibold" style="color: var(--color-text);">{{ warehouse.name
                                    }}</span>
                                </div>
                            </td>
                            <td style="color: var(--color-text-muted);">{{ warehouse.address || '-' }}</td>
                            <td>
                                <div class="flex gap-2">
                                    <button @click="openLocations(warehouse)" class="gap-1 btn btn-xs btn-ghost"
                                        style="color: var(--color-success);">
                                        <MapPin :size="12" /> Lokasi
                                    </button>
                                    <button v-if="authStore.isAdmin || authStore.isManager"
                                        @click="openModal(warehouse)" class="gap-1 btn btn-xs btn-ghost"
                                        style="color: var(--color-primary);">
                                        <Pencil :size="12" /> Edit
                                    </button>
                                    <button v-if="authStore.isAdmin" @click="handleDelete(warehouse)"
                                        class="gap-1 btn btn-xs btn-ghost" style="color: var(--color-danger);">
                                        <Trash2 :size="12" /> Hapus
                                    </button>
                                </div>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>

        <AppModal v-model="showModal" :title="editingWarehouse ? 'Edit Gudang' : 'Tambah Gudang'"
            :subtitle="editingWarehouse ? 'Update informasi gudang' : 'Tambah gudang baru'">
            <div class="space-y-4">
                <div>
                    <label class="label">Nama Gudang</label>
                    <input v-model="form.name" type="text" placeholder="Nama gudang" class="w-full input input-bordered"
                        style="background-color: var(--color-surface-2); border-color: var(--color-border); color: var(--color-text);" />
                </div>
                <div>
                    <label class="label">Alamat</label>
                    <textarea v-model="form.address" rows="3" placeholder="Alamat gudang"
                        class="w-full textarea textarea-bordered"
                        style="background-color: var(--color-surface-2); border-color: var(--color-border); color: var(--color-text);"></textarea>
                </div>
            </div>

            <template #footer>
                <button @click="showModal = false" class="btn btn-ghost">Batal</button>
                <button @click="handleSubmit" class="btn btn-primary" :disabled="loading">
                    <span v-if="loading" class="loading loading-spinner loading-sm"></span>
                    <Save v-else :size="15" />
                    {{ editingWarehouse ? 'Simpan' : 'Tambah' }}
                </button>
            </template>
        </AppModal>

        <AppModal v-model="showLocations" :title="`Lokasi — ${selectedWarehouse?.name}`"
            subtitle="Daftar rak dan lokasi penyimpanan" max-width="560px">
            <div class="mb-4 overflow-x-auto">
                <table class="table table-sm">
                    <thead>
                        <tr style="border-color: var(--color-border);">
                            <th style="background-color: var(--color-surface-2); color: var(--color-text-muted);">Kode
                                Lokasi
                            </th>
                            <th style="background-color: var(--color-surface-2); color: var(--color-text-muted);">Produk
                            </th>
                            <th style="background-color: var(--color-surface-2); color: var(--color-text-muted);">Qty
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-if="locations.length === 0">
                            <td colspan="3" class="py-4 text-center" style="color: var(--color-text-muted);">Belum ada
                                lokasi.
                            </td>
                        </tr>
                        <tr v-for="loc in locations" :key="loc.id" style="border-color: var(--color-border);">
                            <td>
                                <kbd class="kbd kbd-sm"
                                    style="background-color: var(--color-surface-2); color: var(--color-text);">{{
                                        loc.location_code }}</kbd>
                            </td>
                            <td style="color: var(--color-text-muted);">{{ loc.product_name || '-' }}</td>
                            <td class="font-semibold" style="color: var(--color-text);">{{ loc.qty }}</td>
                        </tr>
                    </tbody>
                </table>
            </div>

            <div v-if="authStore.isAdmin || authStore.isManager">
                <label class="label">Tambah Lokasi Baru</label>
                <div class="flex gap-2">
                    <input v-model="newLocation.location_code" placeholder="Kode lokasi, ex: A-01-03"
                        class="flex-1 input input-bordered input-sm"
                        style="background-color: var(--color-surface-2); border-color: var(--color-border); color: var(--color-text);" />
                    <button @click="handleAddLocation" class="gap-1 btn btn-primary btn-sm">
                        <Plus :size="14" />
                        Tambah
                    </button>
                </div>
            </div>

            <template #footer>
                <button @click="showLocations = false" class="btn btn-ghost">Tutup</button>
            </template>
        </AppModal>
    </div>
</template>

<script setup>
import { ref, onMounted, reactive } from 'vue'
import { useAuthStore } from '@/stores/auth.store'
import { useNotify } from '@/composables/useNotify'
import { getWarehouses, createWarehouse, updateWarehouse, deleteWarehouse, getLocations, createLocation } from '@/services/modules/warehouses'
import { Plus, Pencil, Trash2, Save, Warehouse, MapPin } from 'lucide-vue-next'
import AppModal from '@/components/AppModal.vue'

const authStore = useAuthStore()
const notify = useNotify()

const warehouses = ref([])
const locations = ref([])
const loading = ref(false)
const showModal = ref(false)
const showLocations = ref(false)
const editingWarehouse = ref(null)
const selectedWarehouse = ref(null)

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
    form.name = warehouse?.name || ''
    form.address = warehouse?.address || ''
    showModal.value = true
}

const handleSubmit = async () => {
    loading.value = true
    try {
        if (editingWarehouse.value) {
            await updateWarehouse(editingWarehouse.value.id, form)
            notify.success('Gudang berhasil diupdate.')
        } else {
            await createWarehouse(form)
            notify.success('Gudang berhasil ditambahkan.')
        }
        showModal.value = false
        fetchWarehouses()
    } catch (err) {
        notify.error(err.response?.data?.error || 'Terjadi kesalahan.')
    } finally {
        loading.value = false
    }
}

const handleDelete = async (warehouse) => {
    const ok = await notify.confirmDelete(warehouse.name)
    if (!ok) return
    try {
        notify.setLoading(true)
        await deleteWarehouse(warehouse.id)
        notify.success('Gudang berhasil dihapus.')
        fetchWarehouses()
    } catch (err) {
        notify.error(err.response?.data?.error || 'Gagal menghapus gudang.')
    } finally {
        notify.closeConfirm()
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
        notify.success('Lokasi berhasil ditambahkan.')
    } catch (err) {
        notify.error(err.response?.data?.error || 'Gagal menambah lokasi.')
    }
}

onMounted(fetchWarehouses)
</script>