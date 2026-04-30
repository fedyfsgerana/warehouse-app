<template>
    <div>
        <div class="flex items-center justify-between mb-6">
            <h2 class="text-2xl font-bold text-gray-800">Produk</h2>
            <button v-if="authStore.isAdmin || authStore.isManager" @click="openModal()"
                class="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors">
                Tambah Produk
            </button>
        </div>

        <div class="bg-white rounded-xl shadow-sm p-4 mb-6 flex gap-4">
            <input v-model="search" @input="fetchProducts" type="text" placeholder="Cari nama atau SKU..."
                class="border border-gray-300 rounded-lg px-4 py-2 text-sm flex-1 focus:outline-none focus:ring-2 focus:ring-primary-500" />
            <select v-model="selectedCategory" @change="fetchProducts"
                class="border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500">
                <option value="">Semua Kategori</option>
                <option v-for="cat in productStore.categories" :key="cat.id" :value="cat.id">
                    {{ cat.name }}
                </option>
            </select>
        </div>

        <div class="bg-white rounded-xl shadow-sm overflow-hidden">
            <div v-if="productStore.loading" class="p-8 text-center text-gray-400">Memuat...</div>
            <table v-else class="w-full text-sm">
                <thead class="bg-gray-50">
                    <tr class="text-left text-gray-500">
                        <th class="px-6 py-3">SKU</th>
                        <th class="px-6 py-3">Nama</th>
                        <th class="px-6 py-3">Kategori</th>
                        <th class="px-6 py-3">Unit</th>
                        <th class="px-6 py-3">Min Stok</th>
                        <th v-if="authStore.isAdmin || authStore.isManager" class="px-6 py-3">Aksi</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-if="productStore.products.length === 0">
                        <td colspan="6" class="px-6 py-8 text-center text-gray-400">Belum ada produk.</td>
                    </tr>
                    <tr v-for="product in productStore.products" :key="product.id" class="border-t hover:bg-gray-50">
                        <td class="px-6 py-3 text-gray-500">{{ product.sku }}</td>
                        <td class="px-6 py-3 font-medium">{{ product.name }}</td>
                        <td class="px-6 py-3">{{ product.category_name || '-' }}</td>
                        <td class="px-6 py-3">{{ product.unit }}</td>
                        <td class="px-6 py-3">{{ product.min_stock }}</td>
                        <td v-if="authStore.isAdmin || authStore.isManager" class="px-6 py-3">
                            <button @click="openModal(product)"
                                class="text-primary-600 hover:underline mr-3">Edit</button>
                            <button v-if="authStore.isAdmin" @click="handleDelete(product.id)"
                                class="text-red-500 hover:underline">Hapus</button>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>

        <div v-if="showModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div class="bg-white rounded-xl p-6 w-full max-w-md shadow-xl">
                <h3 class="text-lg font-semibold mb-4">{{ editingProduct ? 'Edit Produk' : 'Tambah Produk' }}</h3>

                <div class="space-y-3">
                    <div v-if="!editingProduct">
                        <label class="block text-sm font-medium text-gray-700 mb-1">SKU</label>
                        <input v-model="form.sku" type="text"
                            class="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">Nama</label>
                        <input v-model="form.name" type="text"
                            class="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">Kategori</label>
                        <select v-model="form.category_id"
                            class="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500">
                            <option value="">Pilih Kategori</option>
                            <option v-for="cat in productStore.categories" :key="cat.id" :value="cat.id">{{ cat.name }}
                            </option>
                        </select>
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">Unit</label>
                        <input v-model="form.unit" type="text" placeholder="pcs, kg, liter..."
                            class="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">Min Stok</label>
                        <input v-model="form.min_stock" type="number"
                            class="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
                    </div>
                </div>

                <div v-if="error" class="text-red-500 text-sm mt-3">{{ error }}</div>

                <div class="flex justify-end gap-3 mt-6">
                    <button @click="closeModal" class="px-4 py-2 text-sm text-gray-600 hover:underline">Batal</button>
                    <button @click="handleSubmit"
                        class="px-4 py-2 text-sm bg-primary-600 text-white rounded-lg hover:bg-primary-700">
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
import { createProduct, updateProduct, deleteProduct } from '@/services/modules/products'

const productStore = useProductStore()
const authStore = useAuthStore()

const search = ref('')
const selectedCategory = ref('')
const showModal = ref(false)
const editingProduct = ref(null)
const error = ref('')

const form = reactive({
    sku: '', name: '', category_id: '', unit: '', min_stock: 0
})

const fetchProducts = () => {
    productStore.fetchProducts({ search: search.value, category: selectedCategory.value })
}

const openModal = (product = null) => {
    editingProduct.value = product
    error.value = ''
    if (product) {
        form.sku = product.sku
        form.name = product.name
        form.category_id = product.category_id
        form.unit = product.unit
        form.min_stock = product.min_stock
    } else {
        form.sku = ''
        form.name = ''
        form.category_id = ''
        form.unit = ''
        form.min_stock = 0
    }
    showModal.value = true
}

const closeModal = () => {
    showModal.value = false
    editingProduct.value = null
}

const handleSubmit = async () => {
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