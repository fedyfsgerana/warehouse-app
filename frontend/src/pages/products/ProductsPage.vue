<template>
    <div>
        <div class="flex items-center justify-between mb-6">
            <div>
                <h2 class="text-2xl font-bold" style="color: var(--color-text);">Produk</h2>
                <p class="mt-1 text-sm" style="color: var(--color-text-muted);">Kelola master data produk</p>
            </div>
            <button v-if="authStore.isAdmin || authStore.isManager" @click="openModal()"
                class="gap-2 btn btn-primary btn-sm">
                <Plus :size="16" />
                Tambah Produk
            </button>
        </div>

        <div class="mb-6 card">
            <div class="flex gap-4">
                <label class="flex items-center flex-1 gap-2 input input-bordered"
                    style="background-color: var(--color-surface-2); border-color: var(--color-border);">
                    <Search :size="14" style="color: var(--color-text-muted);" />
                    <input v-model="search" @input="fetchProducts" type="text" placeholder="Cari nama atau SKU..."
                        class="text-sm grow" style="background: transparent; color: var(--color-text);" />
                </label>
                <select v-model="selectedCategory" @change="fetchProducts" class="select select-bordered"
                    style="background-color: var(--color-surface-2); border-color: var(--color-border); color: var(--color-text);">
                    <option value="">Semua Kategori</option>
                    <option v-for="cat in productStore.categories" :key="cat.id" :value="cat.id">{{ cat.name }}</option>
                </select>
            </div>
        </div>

        <div class="table-container">
            <div v-if="productStore.loading" class="flex justify-center p-8">
                <span class="loading loading-spinner" style="color: var(--color-primary);"></span>
            </div>
            <div v-else class="overflow-x-auto">
                <table class="table">
                    <thead>
                        <tr style="border-color: var(--color-border);">
                            <th style="background-color: var(--color-surface-2); color: var(--color-text-muted);">SKU
                            </th>
                            <th style="background-color: var(--color-surface-2); color: var(--color-text-muted);">Nama
                            </th>
                            <th style="background-color: var(--color-surface-2); color: var(--color-text-muted);">
                                Kategori</th>
                            <th style="background-color: var(--color-surface-2); color: var(--color-text-muted);">Unit
                            </th>
                            <th style="background-color: var(--color-surface-2); color: var(--color-text-muted);">Min
                                Stok</th>
                            <th v-if="authStore.isAdmin || authStore.isManager"
                                style="background-color: var(--color-surface-2); color: var(--color-text-muted);">Aksi
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-if="productStore.products.length === 0">
                            <td colspan="6" class="py-8 text-center" style="color: var(--color-text-muted);">Belum ada
                                produk.</td>
                        </tr>
                        <tr v-for="product in productStore.products" :key="product.id"
                            style="border-color: var(--color-border);">
                            <td>
                                <kbd class="kbd kbd-sm"
                                    style="background-color: var(--color-surface-2); color: var(--color-text-muted);">{{
                                        product.sku }}</kbd>
                            </td>
                            <td class="font-semibold" style="color: var(--color-text);">{{ product.name }}</td>
                            <td>
                                <span v-if="product.category_name" class="badge badge-sm"
                                    style="background-color: var(--color-primary-light); color: var(--color-primary);">{{
                                        product.category_name }}</span>
                                <span v-else style="color: var(--color-text-muted);">-</span>
                            </td>
                            <td style="color: var(--color-text-muted);">{{ product.unit }}</td>
                            <td style="color: var(--color-text);">{{ product.min_stock }}</td>
                            <td v-if="authStore.isAdmin || authStore.isManager">
                                <div class="flex gap-2">
                                    <button @click="openModal(product)" class="gap-1 btn btn-xs btn-ghost"
                                        style="color: var(--color-primary);">
                                        <Pencil :size="12" /> Edit
                                    </button>
                                    <button v-if="authStore.isAdmin" @click="handleDelete(product)"
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

        <AppModal v-model="showModal" :title="editingProduct ? 'Edit Produk' : 'Tambah Produk'"
            :subtitle="editingProduct ? 'Update informasi produk' : 'Tambah produk baru ke sistem'">
            <div class="space-y-4">
                <div v-if="!editingProduct">
                    <label class="label">SKU</label>
                    <input v-model="form.sku" type="text" placeholder="contoh: PRD-001"
                        class="w-full input input-bordered"
                        style="background-color: var(--color-surface-2); border-color: var(--color-border); color: var(--color-text);" />
                </div>
                <div>
                    <label class="label">Nama Produk</label>
                    <input v-model="form.name" type="text" placeholder="Nama produk" class="w-full input input-bordered"
                        style="background-color: var(--color-surface-2); border-color: var(--color-border); color: var(--color-text);" />
                </div>
                <div>
                    <label class="label">Kategori</label>
                    <div class="flex gap-2">
                        <select v-model="form.category_id" class="flex-1 select select-bordered"
                            style="background-color: var(--color-surface-2); border-color: var(--color-border); color: var(--color-text);">
                            <option value="">Pilih Kategori</option>
                            <option v-for="cat in productStore.categories" :key="cat.id" :value="cat.id">{{ cat.name }}
                            </option>
                        </select>
                        <button @click="showAddCategory = !showAddCategory" class="btn btn-ghost btn-square">
                            <Plus :size="16" />
                        </button>
                    </div>
                    <div v-if="showAddCategory" class="flex gap-2 mt-2">
                        <input v-model="newCategory" type="text" placeholder="Nama kategori baru"
                            class="flex-1 input input-bordered input-sm"
                            style="background-color: var(--color-surface-2); border-color: var(--color-border); color: var(--color-text);" />
                        <button @click="handleAddCategory" class="btn btn-primary btn-sm">Tambah</button>
                    </div>
                </div>
                <div class="grid grid-cols-2 gap-4">
                    <div>
                        <label class="label">Unit</label>
                        <input v-model="form.unit" type="text" placeholder="pcs, kg, liter..."
                            class="w-full input input-bordered"
                            style="background-color: var(--color-surface-2); border-color: var(--color-border); color: var(--color-text);" />
                    </div>
                    <div>
                        <label class="label">Min Stok</label>
                        <input v-model="form.min_stock" type="number" placeholder="0"
                            class="w-full input input-bordered"
                            style="background-color: var(--color-surface-2); border-color: var(--color-border); color: var(--color-text);" />
                    </div>
                </div>
            </div>

            <template #footer>
                <button @click="showModal = false" class="btn btn-ghost">Batal</button>
                <button @click="handleSubmit" class="btn btn-primary" :disabled="loading">
                    <span v-if="loading" class="loading loading-spinner loading-sm"></span>
                    <Save v-else :size="15" />
                    {{ editingProduct ? 'Simpan' : 'Tambah' }}
                </button>
            </template>
        </AppModal>
    </div>
</template>

<script setup>
import { ref, onMounted, reactive } from 'vue'
import { useProductStore } from '@/stores/product.store'
import { useAuthStore } from '@/stores/auth.store'
import { useNotify } from '@/composables/useNotify'
import { createProduct, updateProduct, deleteProduct, createCategory } from '@/services/modules/products'
import { Plus, Search, Pencil, Trash2, Save } from 'lucide-vue-next'
import AppModal from '@/components/AppModal.vue'

const productStore = useProductStore()
const authStore = useAuthStore()
const notify = useNotify()

const search = ref('')
const selectedCategory = ref('')
const showModal = ref(false)
const showAddCategory = ref(false)
const newCategory = ref('')
const editingProduct = ref(null)
const loading = ref(false)

const form = reactive({ sku: '', name: '', category_id: '', unit: '', min_stock: 0 })

const fetchProducts = () => {
    productStore.fetchProducts({ search: search.value, category: selectedCategory.value })
}

const openModal = (product = null) => {
    editingProduct.value = product
    showAddCategory.value = false
    form.sku = product?.sku || ''
    form.name = product?.name || ''
    form.category_id = product?.category_id || ''
    form.unit = product?.unit || ''
    form.min_stock = product?.min_stock || 0
    showModal.value = true
}

const handleAddCategory = async () => {
    if (!newCategory.value) return
    try {
        await createCategory({ name: newCategory.value })
        newCategory.value = ''
        showAddCategory.value = false
        productStore.fetchCategories()
        notify.success('Kategori berhasil ditambahkan.')
    } catch (err) {
        notify.error('Gagal menambahkan kategori.')
    }
}

const handleSubmit = async () => {
    loading.value = true
    try {
        if (editingProduct.value) {
            await updateProduct(editingProduct.value.id, form)
            notify.success('Produk berhasil diupdate.')
        } else {
            await createProduct(form)
            notify.success('Produk berhasil ditambahkan.')
        }
        showModal.value = false
        fetchProducts()
    } catch (err) {
        notify.error(err.response?.data?.error || 'Terjadi kesalahan.')
    } finally {
        loading.value = false
    }
}

const handleDelete = async (product) => {
    const ok = await notify.confirmDelete(product.name)
    if (!ok) return
    try {
        notify.setLoading(true)
        await deleteProduct(product.id)
        notify.success('Produk berhasil dihapus.')
        fetchProducts()
    } catch (err) {
        notify.error(err.response?.data?.error || 'Gagal menghapus produk.')
    } finally {
        notify.closeConfirm()
    }
}

onMounted(() => {
    fetchProducts()
    productStore.fetchCategories()
})
</script>