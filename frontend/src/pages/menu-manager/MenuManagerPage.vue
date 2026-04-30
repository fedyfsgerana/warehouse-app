<template>
    <div>
        <div class="flex items-center justify-between mb-6">
            <div>
                <h2 class="text-2xl font-bold" style="color: var(--color-text);">Menu Manager</h2>
                <p class="text-sm mt-1" style="color: var(--color-text-muted);">Kelola navigasi menu aplikasi secara
                    dinamis</p>
            </div>
            <button @click="openModal()" class="btn-primary">
                <Plus :size="16" />
                Tambah Menu
            </button>
        </div>

        <div class="flex items-center gap-3 p-4 rounded-xl mb-6 text-sm"
            style="background-color: var(--color-primary-light); color: var(--color-primary);">
            <Info :size="16" class="flex-shrink-0" />
            <span>Seret baris menu untuk mengubah urutan tampilan. Perubahan urutan disimpan otomatis.</span>
        </div>

        <div class="table-container">
            <div class="flex items-center justify-between px-5 py-4"
                style="border-bottom: 1px solid var(--color-border);">
                <p class="text-sm font-bold" style="color: var(--color-text);">Daftar Menu</p>
                <span class="text-xs px-3 py-1 rounded-full"
                    style="background-color: var(--color-surface-2); color: var(--color-text-muted);">
                    {{ menus.length }} menu
                </span>
            </div>

            <div v-if="loading" class="p-8 text-center text-sm" style="color: var(--color-text-muted);">Memuat...</div>

            <table v-else class="w-full">
                <thead>
                    <tr>
                        <th class="table-header w-10"></th>
                        <th class="table-header">Label</th>
                        <th class="table-header">Path</th>
                        <th class="table-header">Icon</th>
                        <th class="table-header">Roles</th>
                        <th class="table-header">Status</th>
                        <th class="table-header">Aksi</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-if="menus.length === 0">
                        <td colspan="7" class="table-cell text-center" style="color: var(--color-text-muted);">Belum ada
                            menu.</td>
                    </tr>
                    <tr v-for="(menu, index) in menus" :key="menu.id" class="table-row"
                        :class="{ 'opacity-50': dragIndex === index }" draggable="true" @dragstart="onDragStart(index)"
                        @dragover.prevent="onDragOver(index)" @dragend="onDragEnd">
                        <td class="table-cell cursor-grab">
                            <GripVertical :size="16" style="color: var(--color-text-muted);" />
                        </td>
                        <td class="table-cell">
                            <div class="flex items-center gap-3">
                                <div class="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                                    style="background-color: var(--color-primary-light);">
                                    <component :is="getIcon(menu.icon)" :size="15"
                                        style="color: var(--color-primary);" />
                                </div>
                                <span class="text-sm font-semibold" style="color: var(--color-text);">{{ menu.label
                                    }}</span>
                            </div>
                        </td>
                        <td class="table-cell">
                            <span class="text-xs font-mono px-2 py-1 rounded-lg"
                                style="background-color: var(--color-surface-2); color: var(--color-text-muted);">
                                {{ menu.path }}
                            </span>
                        </td>
                        <td class="table-cell">
                            <span class="text-xs px-2 py-1 rounded-lg"
                                style="background-color: var(--color-surface-2); color: var(--color-text-muted);">
                                {{ menu.icon }}
                            </span>
                        </td>
                        <td class="table-cell">
                            <div class="flex flex-wrap gap-1">
                                <span v-for="role in menu.roles" :key="role" class="badge text-xs"
                                    :style="roleBadge(role)">
                                    {{ role }}
                                </span>
                            </div>
                        </td>
                        <td class="table-cell">
                            <button @click="toggleActive(menu)"
                                class="flex items-center gap-1.5 text-xs font-semibold transition-all">
                                <div class="w-8 h-4 rounded-full relative transition-all"
                                    :style="menu.is_active ? 'background-color: var(--color-success);' : 'background-color: var(--color-border);'">
                                    <div class="absolute top-0.5 w-3 h-3 rounded-full bg-white transition-all"
                                        :style="menu.is_active ? 'left: 17px;' : 'left: 2px;'"></div>
                                </div>
                                <span
                                    :style="menu.is_active ? 'color: var(--color-success);' : 'color: var(--color-text-muted);'">
                                    {{ menu.is_active ? 'Aktif' : 'Nonaktif' }}
                                </span>
                            </button>
                        </td>
                        <td class="table-cell">
                            <div class="flex items-center gap-2">
                                <button @click="openModal(menu)"
                                    class="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold"
                                    style="background-color: var(--color-primary-light); color: var(--color-primary);">
                                    <Pencil :size="12" />
                                    Edit
                                </button>
                                <button @click="handleDelete(menu)"
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
            <div class="modal" style="max-width: 520px;">
                <div class="flex items-center justify-between mb-6">
                    <div>
                        <h3 class="text-lg font-bold" style="color: var(--color-text);">
                            {{ editingMenu ? 'Edit Menu' : 'Tambah Menu' }}
                        </h3>
                        <p class="text-xs mt-0.5" style="color: var(--color-text-muted);">
                            {{ editingMenu ? 'Update informasi menu' : 'Tambah menu navigasi baru' }}
                        </p>
                    </div>
                    <button @click="closeModal" class="btn-ghost p-2 rounded-xl">
                        <X :size="18" />
                    </button>
                </div>

                <div class="space-y-4">
                    <div class="grid grid-cols-2 gap-4">
                        <div>
                            <label class="label">Label Menu</label>
                            <input v-model="form.label" type="text" placeholder="contoh: Dashboard" class="input" />
                        </div>
                        <div>
                            <label class="label">Path URL</label>
                            <input v-model="form.path" type="text" placeholder="contoh: /dashboard" class="input" />
                        </div>
                    </div>

                    <div>
                        <label class="label">Icon</label>
                        <div class="grid grid-cols-6 gap-2 p-3 rounded-xl max-h-48 overflow-y-auto"
                            style="background-color: var(--color-surface-2);">
                            <button v-for="icon in availableIcons" :key="icon" @click="form.icon = icon"
                                class="flex flex-col items-center gap-1 p-2 rounded-lg transition-all"
                                :style="form.icon === icon ? 'background-color: var(--color-primary); color: white;' : 'color: var(--color-text-muted);'"
                                :title="icon">
                                <component :is="getIcon(icon)" :size="18" />
                                <span class="text-xs leading-tight text-center" style="font-size: 9px;">{{ icon
                                    }}</span>
                            </button>
                        </div>
                    </div>

                    <div>
                        <label class="label">Akses Role</label>
                        <div class="flex gap-3">
                            <label v-for="role in ['admin', 'manager', 'staff']" :key="role"
                                class="flex items-center gap-2 cursor-pointer">
                                <input type="checkbox" :value="role" v-model="form.roles" class="rounded" />
                                <span class="text-sm capitalize" style="color: var(--color-text);">{{ role }}</span>
                            </label>
                        </div>
                    </div>

                    <div class="grid grid-cols-2 gap-4">
                        <div>
                            <label class="label">Urutan</label>
                            <input v-model="form.sort_order" type="number" placeholder="0" class="input" />
                        </div>
                        <div>
                            <label class="label">Status</label>
                            <select v-model="form.is_active" class="input">
                                <option :value="true">Aktif</option>
                                <option :value="false">Nonaktif</option>
                            </select>
                        </div>
                    </div>
                </div>

                <div v-if="error" class="flex items-center gap-2 mt-4 p-3 rounded-xl text-sm"
                    style="background-color: rgba(239,68,68,0.1); color: var(--color-danger);">
                    <AlertCircle :size="15" />
                    {{ error }}
                </div>

                <div class="flex justify-end gap-3 mt-6">
                    <button @click="closeModal" class="btn-ghost">Batal</button>
                    <button @click="handleSubmit" class="btn-primary">
                        <Save :size="15" />
                        {{ editingMenu ? 'Simpan' : 'Tambah Menu' }}
                    </button>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted, reactive } from 'vue'
import { useMenuStore } from '@/stores/menu.store'
import { getAllMenus, createMenu, updateMenu, updateMenuOrder, deleteMenu } from '@/services/modules/menus'
import {
    Plus, Info, GripVertical, Pencil, Trash2,
    X, Save, AlertCircle,
    LayoutDashboard, Package, Warehouse, Layers,
    ShoppingCart, TrendingUp, BarChart2, Users,
    Truck, Menu, Settings, FileText, Home,
    Box, Database, PieChart, ClipboardList,
    Bell, Star, Heart, Zap, Globe, Lock
} from 'lucide-vue-next'

const menuStore = useMenuStore()
const menus = ref([])
const loading = ref(false)
const showModal = ref(false)
const editingMenu = ref(null)
const error = ref('')
const dragIndex = ref(null)

const form = reactive({
    label: '',
    path: '',
    icon: 'LayoutDashboard',
    sort_order: 0,
    roles: ['admin', 'manager', 'staff'],
    is_active: true
})

const iconMap = {
    LayoutDashboard, Package, Warehouse, Layers,
    ShoppingCart, TrendingUp, BarChart2, Users,
    Truck, Menu, Settings, FileText, Home,
    Box, Database, PieChart, ClipboardList,
    Bell, Star, Heart, Zap, Globe, Lock
}

const availableIcons = Object.keys(iconMap)
const getIcon = (name) => iconMap[name] || LayoutDashboard

const roleBadge = (role) => {
    const map = {
        admin: 'background-color: rgba(124,58,237,0.1); color: #7c3aed;',
        manager: 'background-color: var(--color-primary-light); color: var(--color-primary);',
        staff: 'background-color: rgba(16,185,129,0.1); color: var(--color-success);',
    }
    return map[role] || ''
}

const fetchMenus = async () => {
    loading.value = true
    try {
        const res = await getAllMenus()
        menus.value = res.data.data
    } catch (err) { } finally {
        loading.value = false
    }
}

const openModal = (menu = null) => {
    editingMenu.value = menu
    error.value = ''
    form.label = menu?.label || ''
    form.path = menu?.path || ''
    form.icon = menu?.icon || 'LayoutDashboard'
    form.sort_order = menu?.sort_order || 0
    form.roles = menu?.roles || ['admin', 'manager', 'staff']
    form.is_active = menu?.is_active ?? true
    showModal.value = true
}

const closeModal = () => {
    showModal.value = false
    editingMenu.value = null
}

const handleSubmit = async () => {
    error.value = ''
    if (!form.label || !form.path || !form.icon) {
        error.value = 'Label, path, dan icon wajib diisi.'
        return
    }
    if (form.roles.length === 0) {
        error.value = 'Pilih minimal satu role.'
        return
    }
    try {
        if (editingMenu.value) {
            await updateMenu(editingMenu.value.id, form)
        } else {
            await createMenu(form)
        }
        closeModal()
        fetchMenus()
        menuStore.fetchMyMenus()
    } catch (err) {
        error.value = err.response?.data?.error || 'Terjadi kesalahan.'
    }
}

const toggleActive = async (menu) => {
    try {
        await updateMenu(menu.id, { ...menu, is_active: !menu.is_active })
        fetchMenus()
        menuStore.fetchMyMenus()
    } catch (err) { }
}

const handleDelete = async (menu) => {
    if (!confirm(`Yakin ingin menghapus menu "${menu.label}"?`)) return
    try {
        await deleteMenu(menu.id)
        fetchMenus()
        menuStore.fetchMyMenus()
    } catch (err) {
        alert(err.response?.data?.error || 'Gagal menghapus menu.')
    }
}

const onDragStart = (index) => {
    dragIndex.value = index
}

const onDragOver = (index) => {
    if (dragIndex.value === null || dragIndex.value === index) return
    const items = [...menus.value]
    const dragged = items.splice(dragIndex.value, 1)[0]
    items.splice(index, 0, dragged)
    menus.value = items
    dragIndex.value = index
}

const onDragEnd = async () => {
    dragIndex.value = null
    const items = menus.value.map((menu, index) => ({
        id: menu.id,
        sort_order: index + 1
    }))
    try {
        await updateMenuOrder(items)
        menuStore.fetchMyMenus()
    } catch (err) { }
}

onMounted(fetchMenus)
</script>