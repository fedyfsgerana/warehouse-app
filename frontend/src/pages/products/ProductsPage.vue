<template>
    <div>
        <div class="flex items-center justify-between mb-6">
            <div>
                <h2 class="text-2xl font-bold" style="color: var(--color-text);">Produk</h2>
                <p class="mt-1 text-sm" style="color: var(--color-text-muted);">Kelola master data produk</p>
            </div>
            <button v-if="authStore.isAdmin || authStore.isManager" @click="openModal()" class="btn-primary">
                <Plus :size="16" />
                Tambah Produk
            </button>
        </div>

        <div class="flex gap-4 mb-6 card">
            <div class="relative flex-1">
                <Search :size="14" class="absolute -translate-y-1/2 left-3 top-1/2"
                    style="color: var(--color-text-muted);" />
                <input v-model="search" @input="fetchProducts" type="text" placeholder="Cari nama atau SKU..."
                    class="input pl-9" />
            </div>
            <select v-model="selectedCategory" @change="fetchProducts" class="input" style="width: 200px;">
                <option value="">Semua Kategori</option>
                <option v-for="cat in productStore.categories" :key="cat.id" :value="cat.id">
                    {{ cat.name }}
                </option>
            </select>
        </div>

        <div class="table-container">
            <div v-if="productStore.loading" class="p-8 text-sm text-center" style="color: var(--color-text-muted);">
                Memuat...</div>
            <table v-else class="w-full">
                <thead>
                    <tr>
                        <th class="table-header">SKU</th>
                        <th class="table-header">Nama</th>
                        <th class="table-header">Kategori</th>
                        <th class="table-header">Unit</th>
                        <th class="table-header">Min Stok</th>
                        <th v-if="authStore.isAdmin || authStore.isManager" class="table-header">Aksi</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-if="productStore.products.length === 0">
                        <td colspan="6" class="table-cell text-center" style="color: var(--color-text-muted);">Belum ada
                            produk.</td>
                    </tr>
                    <tr v-for="product in productStore.products" :key="product.id" class="table-row">
                        <td class="table-cell">
                            <span class="px-2 py-1 font-mono text-xs rounded-lg"
                                style="background-color: var(--color-surface-2); color: var(--color-text-muted);">
                                {{ product.sku }}
                            </span>
                        </td>
                        <td class="table-cell font-semibold" style="color: var(--color-text);">{{ product.name }}</td>
                        <td class="table-cell">
                            <span v-if="product.category_name" class="badge"
                                style="background-color: var(--color-primary-light); color: var(--color-primary);">
                                {{ product.category_name }}
                            </span>
                            <span v-else style="color: var(--color-text-muted);">-</span>
                        </td>
                        <td class="table-cell" style="color: var(--color-text-muted);">{{ product.unit }}</td>
                        <td class="table-cell" style="color: var(--color-text);">{{ product.min_stock }}</td>
                        <td v-if="authStore.isAdmin || authStore.isManager" class="table-cell">
                            <div class="flex items-center gap-2">
                                <button @click="openModal(product)"
                                    class="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold"
                                    style="background-color: var(--color-primary-light); color: var(--color-primary);">
                                    <Pencil :size="12" />
                                    Edit
                                </button>
                                <button v-if="authStore.isAdmin" @click="handleDelete(product.id)"
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
                            {{ editingProduct ? 'Edit Produk' : 'Tambah Produk' }}
                        </h3>
                        <p class="text-xs mt-0.5" style="color: var(--color-text-muted);">
                            {{ editingProduct ? 'Update informasi produk' : 'Tambah produk baru ke sistem' }}
                        </p>
                    </div>
                    <button @click="closeModal" class="p-2 btn-ghost rounded-xl">
                        <X :size="18" />
                    </button>
                </div>

                <div class="space-y-4">
                    <div v-if="!editingProduct">
                        <label class="label">SKU</label>
                        <input v-model="form.sku" type="text" placeholder="contoh: PRD-001" class="input" />
                    </div>
                    <div>
                        <label class="label">Nama Produk</label>
                        <input v-model="form.name" type="text" placeholder="Nama produk" class="input" />
                    </div>
                    <div>
                        <label class="label">Kategori</label>
                        <div class="flex gap-2">
                            <select v-model="form.category_id" class="flex-1 input">
                                <option value="">Pilih Kategori</option>
                                <option v-for="cat in productStore.categories" :key="cat.id" :value="cat.id">{{ cat.name
                                    }}</option>
                            </select>
                            <button @click="showAddCategory = !showAddCategory" class="px-3 btn-ghost rounded-xl">
                                <Plus :size="16" />
                            </button>
                        </div>
                        <div v-if="showAddCategory" class="flex gap-2 mt-2">
                            <input v-model="newCategory" type="text" placeholder="Nama kategori baru"
                                class="flex-1 input" />
                            <button @click="handleAddCategory" class="px-3 btn-primary">Tambah</button>
                        </div>
                    </div>
                    <div class="grid grid-cols-2 gap-4">
                        <div>
                            <label class="label">Unit</label>
                            <input v-model="form.unit" type="text" placeholder="pcs, kg, liter..." class="input" />
                        </div>
                        <div>
                            <label class="label">Min Stok</label>
                            <input v-model="form.min_stock" type="number" placeholder="0" class="input" />
                        </div>
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
                        {{ editingProduct ? 'Simpan' : 'Tambah' }}
                    </button>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted, reactive } from 'vue'
import { useProductStore } from '@/stores/product.store'
import { useAuthStore } from '@/stores/auth.store'
import { createProduct, updateProduct, deleteProduct, createCategory } from '@/services/modules/products'
import { Plus, Search, Pencil, Trash2, X, Save, AlertCircle } from 'lucide-vue-next'

const productStore = useProductStore()
const authStore = useAuthStore()

const search = ref('')
const selectedCategory = ref('')
const showModal = ref(false)
const showAddCategory = ref(false)
const newCategory = ref('')
const editingProduct = ref(null)
const error = ref('')

const form = reactive({ sku: '', name: '', category_id: '', unit: '', min_stock: 0 })

const fetchProducts = () => {
    productStore.fetchProducts({ search: search.value, category: selectedCategory.value })
}

const openModal = (product = null) => {
    editingProduct.value = product
    error.value = ''
    showAddCategory.value = false
    form.sku = product?.sku || ''
    form.name = product?.name || ''
    form.category_id = product?.category_id || ''
    form.unit = product?.unit || ''
    form.min_stock = product?.min_stock || 0
    showModal.value = true
}

const closeModal = () => {
    showModal.value = false
    editingProduct.value = null
}

const handleAddCategory = async () => {
    if (!newCategory.value) return
    try {
        await createCategory({ name: newCategory.value })
        newCategory.value = ''
        showAddCategory.value = false
        productStore.fetchCategories()
    } catch (err) { }
}

const handleSubmit = async () => {
    error.value = ''
    try {
        if (editingProduct.value) {
            await updateProduct(editingProduct.value.id, form)
        } else {
            await createProduct(form)
        }
        closeModal()
        fetchProducts()
    } catch (err) {
        error.value = err.response?.data?.error || 'Terjadi kesalahan.'
    }
}

const handleDelete = async (id) => {
    if (!confirm('Yakin ingin menghapus produk ini?')) return
    try {
        await deleteProduct(id)
        fetchProducts()
    } catch (err) {
        alert(err.response?.data?.error || 'Gagal menghapus produk.')
    }
}

onMounted(() => {
    fetchProducts()
    productStore.fetchCategories()
})
</script>