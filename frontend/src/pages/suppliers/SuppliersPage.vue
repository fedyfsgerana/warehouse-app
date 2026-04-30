<template>
    <div>
        <div class="flex items-center justify-between mb-6">
            <h2 class="text-2xl font-bold text-gray-800">Supplier</h2>
            <button v-if="authStore.isAdmin || authStore.isManager" @click="openModal()"
                class="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors">
                Tambah Supplier
            </button>
        </div>

        <div class="bg-white rounded-xl shadow-sm overflow-hidden">
            <div v-if="loading" class="p-8 text-center text-gray-400">Memuat...</div>
            <table v-else class="w-full text-sm">
                <thead class="bg-gray-50">
                    <tr class="text-left text-gray-500">
                        <th class="px-6 py-3">Nama</th>
                        <th class="px-6 py-3">Telepon</th>
                        <th class="px-6 py-3">Alamat</th>
                        <th class="px-6 py-3">Aksi</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-if="suppliers.length === 0">
                        <td colspan="4" class="px-6 py-8 text-center text-gray-400">Belum ada supplier.</td>
                    </tr>
                    <tr v-for="supplier in suppliers" :key="supplier.id" class="border-t hover:bg-gray-50">
                        <td class="px-6 py-3 font-medium">{{ supplier.name }}</td>
                        <td class="px-6 py-3 text-gray-500">{{ supplier.phone || '-' }}</td>
                        <td class="px-6 py-3 text-gray-500">{{ supplier.address || '-' }}</td>
                        <td class="px-6 py-3 flex gap-3">
                            <button v-if="authStore.isAdmin || authStore.isManager" @click="openModal(supplier)"
                                class="text-primary-600 hover:underline">
                                Edit
                            </button>
                            <button v-if="authStore.isAdmin" @click="handleDelete(supplier.id)"
                                class="text-red-500 hover:underline">
                                Hapus
                            </button>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>

        <div v-if="showModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div class="bg-white rounded-xl p-6 w-full max-w-md shadow-xl">
                <h3 class="text-lg font-semibold mb-4">{{ editingSupplier ? 'Edit Supplier' : 'Tambah Supplier' }}</h3>
                <div class="space-y-3">
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">Nama</label>
                        <input v-model="form.name" type="text"
                            class="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">Telepon</label>
                        <input v-model="form.phone" type="text"
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
                        {{ editingSupplier ? 'Simpan' : 'Tambah' }}
                    </button>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted, reactive } from 'vue'
import { useAuthStore } from '@/stores/auth.store'
import { getSuppliers, createSupplier, updateSupplier, deleteSupplier } from '@/services/modules/suppliers'

const authStore = useAuthStore()
const suppliers = ref([])
const loading = ref(false)
const showModal = ref(false)
const editingSupplier = ref(null)
const error = ref('')

const form = reactive({ name: '', phone: '', address: '' })

const fetchSuppliers = async () => {
    loading.value = true
    try {
        const res = await getSuppliers()
        suppliers.value = res.data.data
    } catch (err) { } finally {
        loading.value = false
    }
}

const openModal = (supplier = null) => {
    editingSupplier.value = supplier
    error.value = ''
    form.name = supplier?.name || ''
    form.phone = supplier?.phone || ''
    form.address = supplier?.address || ''
    showModal.value = true
}

const closeModal = () => {
    showModal.value = false
    editingSupplier.value = null
}

const handleSubmit = async () => {
    try {
        if (editingSupplier.value) {
            await updateSupplier(editingSupplier.value.id, form)
        } else {
            await createSupplier(form)
        }
        closeModal()
        fetchSuppliers()
    } catch (err) {
        error.value = err.response?.data?.error || 'Terjadi kesalahan.'
    }
}

const handleDelete = async (id) => {
    if (!confirm('Yakin ingin menghapus supplier ini?')) return
    try {
        await deleteSupplier(id)
        fetchSuppliers()
    } catch (err) {
        alert(err.response?.data?.error || 'Gagal menghapus supplier.')
    }
}

onMounted(fetchSuppliers)
</script>