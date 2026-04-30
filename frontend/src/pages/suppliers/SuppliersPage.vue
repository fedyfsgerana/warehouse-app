<template>
    <div>
        <div class="flex items-center justify-between mb-6">
            <div>
                <h2 class="text-2xl font-bold" style="color: var(--color-text);">Supplier</h2>
                <p class="mt-1 text-sm" style="color: var(--color-text-muted);">Kelola data supplier</p>
            </div>
            <button v-if="authStore.isAdmin || authStore.isManager" @click="openModal()" class="btn-primary">
                <Plus :size="16" />
                Tambah Supplier
            </button>
        </div>

        <div class="table-container">
            <div v-if="loading" class="p-8 text-sm text-center" style="color: var(--color-text-muted);">Memuat...</div>
            <table v-else class="w-full">
                <thead>
                    <tr>
                        <th class="table-header">Nama</th>
                        <th class="table-header">Telepon</th>
                        <th class="table-header">Alamat</th>
                        <th class="table-header">Aksi</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-if="suppliers.length === 0">
                        <td colspan="4" class="table-cell text-center" style="color: var(--color-text-muted);">Belum ada
                            supplier.</td>
                    </tr>
                    <tr v-for="supplier in suppliers" :key="supplier.id" class="table-row">
                        <td class="table-cell">
                            <div class="flex items-center gap-3">
                                <div class="flex items-center justify-center flex-shrink-0 w-8 h-8 text-xs font-bold text-white rounded-lg"
                                    :style="{ background: `linear-gradient(135deg, ${avatarColor(supplier.name)})` }">
                                    {{ supplier.name?.charAt(0).toUpperCase() }}
                                </div>
                                <span class="font-semibold" style="color: var(--color-text);">{{ supplier.name }}</span>
                            </div>
                        </td>
                        <td class="table-cell">
                            <span v-if="supplier.phone" class="text-sm" style="color: var(--color-text-muted);">{{
                                supplier.phone }}</span>
                            <span v-else style="color: var(--color-text-muted);">-</span>
                        </td>
                        <td class="table-cell text-sm" style="color: var(--color-text-muted);">{{ supplier.address ||
                            '-' }}</td>
                        <td class="table-cell">
                            <div class="flex items-center gap-2">
                                <button v-if="authStore.isAdmin || authStore.isManager" @click="openModal(supplier)"
                                    class="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold"
                                    style="background-color: var(--color-primary-light); color: var(--color-primary);">
                                    <Pencil :size="12" />
                                    Edit
                                </button>
                                <button v-if="authStore.isAdmin" @click="handleDelete(supplier.id)"
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
                            {{ editingSupplier ? 'Edit Supplier' : 'Tambah Supplier' }}
                        </h3>
                        <p class="text-xs mt-0.5" style="color: var(--color-text-muted);">
                            {{ editingSupplier ? 'Update informasi supplier' : 'Tambah supplier baru' }}
                        </p>
                    </div>
                    <button @click="closeModal" class="p-2 btn-ghost rounded-xl">
                        <X :size="18" />
                    </button>
                </div>

                <div class="space-y-4">
                    <div>
                        <label class="label">Nama Supplier</label>
                        <input v-model="form.name" type="text" placeholder="Nama supplier" class="input" />
                    </div>
                    <div>
                        <label class="label">Telepon</label>
                        <input v-model="form.phone" type="text" placeholder="Nomor telepon" class="input" />
                    </div>
                    <div>
                        <label class="label">Alamat</label>
                        <textarea v-model="form.address" rows="3" placeholder="Alamat supplier"
                            class="input"></textarea>
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
import { Plus, Pencil, Trash2, X, Save, AlertCircle } from 'lucide-vue-next'

const authStore = useAuthStore()
const suppliers = ref([])
const loading = ref(false)
const showModal = ref(false)
const editingSupplier = ref(null)
const error = ref('')

const form = reactive({ name: '', phone: '', address: '' })

const avatarColor = (name) => {
    const colors = [
        '#2563eb, #1d4ed8',
        '#7c3aed, #6d28d9',
        '#059669, #047857',
        '#ea580c, #c2410c',
        '#db2777, #be185d',
    ]
    const index = (name?.charCodeAt(0) || 0) % colors.length
    return colors[index]
}

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
    error.value = ''
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