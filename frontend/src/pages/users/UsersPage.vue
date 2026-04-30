<template>
    <div>
        <div class="flex items-center justify-between mb-6">
            <div>
                <h2 class="text-2xl font-bold" style="color: var(--color-text);">User Management</h2>
                <p class="text-sm mt-1" style="color: var(--color-text-muted);">Kelola akun dan hak akses pengguna</p>
            </div>
            <button @click="openModal()" class="btn-primary">
                <UserPlus :size="16" />
                Tambah User
            </button>
        </div>

        <div class="grid grid-cols-3 gap-4 mb-6">
            <div v-for="stat in stats" :key="stat.label" class="card flex items-center gap-4">
                <div class="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                    :style="{ backgroundColor: stat.bg }">
                    <component :is="stat.icon" :size="18" :style="{ color: stat.color }" />
                </div>
                <div>
                    <p class="text-2xl font-bold" style="color: var(--color-text);">{{ stat.value }}</p>
                    <p class="text-xs font-semibold" style="color: var(--color-text-muted);">{{ stat.label }}</p>
                </div>
            </div>
        </div>

        <div class="table-container">
            <div class="flex items-center justify-between px-5 py-4"
                style="border-bottom: 1px solid var(--color-border);">
                <p class="text-sm font-bold" style="color: var(--color-text);">Daftar User</p>
                <div class="relative">
                    <Search :size="14" class="absolute left-3 top-1/2 -translate-y-1/2"
                        style="color: var(--color-text-muted);" />
                    <input v-model="search" type="text" placeholder="Cari user..."
                        class="input pl-8 py-2 text-xs w-48" />
                </div>
            </div>

            <div v-if="loading" class="p-8 text-center text-sm" style="color: var(--color-text-muted);">Memuat...</div>

            <table v-else class="w-full">
                <thead>
                    <tr>
                        <th class="table-header">User</th>
                        <th class="table-header">Role</th>
                        <th class="table-header">Bergabung</th>
                        <th class="table-header">Aksi</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-if="filteredUsers.length === 0">
                        <td colspan="4" class="table-cell text-center" style="color: var(--color-text-muted);">Belum ada
                            user.</td>
                    </tr>
                    <tr v-for="user in filteredUsers" :key="user.id" class="table-row">
                        <td class="table-cell">
                            <div class="flex items-center gap-3">
                                <div class="w-9 h-9 rounded-xl flex items-center justify-center text-white text-sm font-bold flex-shrink-0"
                                    :style="{ background: `linear-gradient(135deg, ${avatarColor(user.name)})` }">
                                    {{ user.name?.charAt(0).toUpperCase() }}
                                </div>
                                <div>
                                    <p class="text-sm font-semibold" style="color: var(--color-text);">{{ user.name }}
                                    </p>
                                    <p class="text-xs" style="color: var(--color-text-muted);">{{ user.email }}</p>
                                </div>
                            </div>
                        </td>
                        <td class="table-cell">
                            <span class="badge" :style="roleBadge(user.role)">
                                {{ user.role }}
                            </span>
                        </td>
                        <td class="table-cell text-sm" style="color: var(--color-text-muted);">
                            {{ formatDate(user.created_at) }}
                        </td>
                        <td class="table-cell">
                            <div class="flex items-center gap-2">
                                <button @click="openModal(user)"
                                    class="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all"
                                    style="background-color: var(--color-primary-light); color: var(--color-primary);">
                                    <Pencil :size="12" />
                                    Edit
                                </button>
                                <button @click="openResetPassword(user)"
                                    class="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all"
                                    style="background-color: rgba(245,158,11,0.1); color: #d97706;">
                                    <KeyRound :size="12" />
                                    Reset
                                </button>
                                <button v-if="user.id !== authStore.user?.id" @click="handleDelete(user)"
                                    class="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all"
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
                            {{ editingUser ? 'Edit User' : 'Tambah User' }}
                        </h3>
                        <p class="text-xs mt-0.5" style="color: var(--color-text-muted);">
                            {{ editingUser ? 'Update informasi user' : 'Buat akun user baru' }}
                        </p>
                    </div>
                    <button @click="closeModal" class="btn-ghost p-2 rounded-xl">
                        <X :size="18" />
                    </button>
                </div>

                <div class="space-y-4">
                    <div v-if="!editingUser">
                        <label class="label">Email</label>
                        <input v-model="form.email" type="email" placeholder="email@example.com" class="input" />
                    </div>
                    <div>
                        <label class="label">Nama Lengkap</label>
                        <input v-model="form.name" type="text" placeholder="Nama lengkap" class="input" />
                    </div>
                    <div>
                        <label class="label">Role</label>
                        <select v-model="form.role" class="input">
                            <option value="">Pilih role</option>
                            <option value="admin">Admin</option>
                            <option value="manager">Manager</option>
                            <option value="staff">Staff</option>
                        </select>
                    </div>
                    <div v-if="!editingUser">
                        <label class="label">Password</label>
                        <div class="relative">
                            <input v-model="form.password" :type="showPassword ? 'text' : 'password'"
                                placeholder="Minimal 6 karakter" class="input pr-10" />
                            <button @click="showPassword = !showPassword"
                                class="absolute right-3 top-1/2 -translate-y-1/2"
                                style="color: var(--color-text-muted);">
                                <Eye v-if="!showPassword" :size="16" />
                                <EyeOff v-else :size="16" />
                            </button>
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
                        {{ editingUser ? 'Simpan' : 'Buat User' }}
                    </button>
                </div>
            </div>
        </div>

        <div v-if="showResetModal" class="modal-overlay">
            <div class="modal">
                <div class="flex items-center justify-between mb-6">
                    <div>
                        <h3 class="text-lg font-bold" style="color: var(--color-text);">Reset Password</h3>
                        <p class="text-xs mt-0.5" style="color: var(--color-text-muted);">Reset password untuk {{
                            resettingUser?.name }}</p>
                    </div>
                    <button @click="showResetModal = false" class="btn-ghost p-2 rounded-xl">
                        <X :size="18" />
                    </button>
                </div>

                <div>
                    <label class="label">Password Baru</label>
                    <div class="relative">
                        <input v-model="newPassword" :type="showNewPassword ? 'text' : 'password'"
                            placeholder="Minimal 6 karakter" class="input pr-10" />
                        <button @click="showNewPassword = !showNewPassword"
                            class="absolute right-3 top-1/2 -translate-y-1/2" style="color: var(--color-text-muted);">
                            <Eye v-if="!showNewPassword" :size="16" />
                            <EyeOff v-else :size="16" />
                        </button>
                    </div>
                </div>

                <div v-if="error" class="flex items-center gap-2 mt-4 p-3 rounded-xl text-sm"
                    style="background-color: rgba(239,68,68,0.1); color: var(--color-danger);">
                    <AlertCircle :size="15" />
                    {{ error }}
                </div>

                <div class="flex justify-end gap-3 mt-6">
                    <button @click="showResetModal = false" class="btn-ghost">Batal</button>
                    <button @click="handleResetPassword" class="btn-primary">
                        <KeyRound :size="15" />
                        Reset Password
                    </button>
                </div>
            </div>
        </div>

    </div>
</template>

<script setup>
import { ref, computed, onMounted, reactive } from 'vue'
import { useAuthStore } from '@/stores/auth.store'
import { getUsers, createUser, updateUser, resetPassword, deleteUser } from '@/services/modules/users'
import {
    UserPlus, Search, Pencil, Trash2, KeyRound,
    X, Save, Eye, EyeOff, AlertCircle,
    Shield, Users, User
} from 'lucide-vue-next'

const authStore = useAuthStore()
const users = ref([])
const loading = ref(false)
const search = ref('')
const showModal = ref(false)
const showResetModal = ref(false)
const editingUser = ref(null)
const resettingUser = ref(null)
const newPassword = ref('')
const showPassword = ref(false)
const showNewPassword = ref(false)
const error = ref('')

const form = reactive({ email: '', name: '', role: '', password: '' })

const filteredUsers = computed(() => {
    if (!search.value) return users.value
    const q = search.value.toLowerCase()
    return users.value.filter(u =>
        u.name.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q) ||
        u.role.toLowerCase().includes(q)
    )
})

const stats = computed(() => [
    {
        label: 'Total User',
        value: users.value.length,
        icon: Users,
        color: 'var(--color-primary)',
        bg: 'var(--color-primary-light)'
    },
    {
        label: 'Admin',
        value: users.value.filter(u => u.role === 'admin').length,
        icon: Shield,
        color: '#7c3aed',
        bg: 'rgba(124,58,237,0.1)'
    },
    {
        label: 'Staff & Manager',
        value: users.value.filter(u => u.role !== 'admin').length,
        icon: User,
        color: 'var(--color-success)',
        bg: 'rgba(16,185,129,0.1)'
    },
])

const roleBadge = (role) => {
    const map = {
        admin: 'background-color: rgba(124,58,237,0.1); color: #7c3aed;',
        manager: 'background-color: rgba(37,99,235,0.1); color: var(--color-primary);',
        staff: 'background-color: rgba(16,185,129,0.1); color: var(--color-success);',
    }
    return map[role] || ''
}

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

const formatDate = (date) => {
    return new Date(date).toLocaleDateString('id-ID', {
        day: 'numeric', month: 'short', year: 'numeric'
    })
}

const fetchUsers = async () => {
    loading.value = true
    try {
        const res = await getUsers()
        users.value = res.data.data
    } catch (err) { } finally {
        loading.value = false
    }
}

const openModal = (user = null) => {
    editingUser.value = user
    error.value = ''
    showPassword.value = false
    form.email = user?.email || ''
    form.name = user?.name || ''
    form.role = user?.role || ''
    form.password = ''
    showModal.value = true
}

const closeModal = () => {
    showModal.value = false
    editingUser.value = null
}

const handleSubmit = async () => {
    error.value = ''
    try {
        if (editingUser.value) {
            await updateUser(editingUser.value.id, { name: form.name, role: form.role })
        } else {
            if (form.password.length < 6) {
                error.value = 'Password minimal 6 karakter.'
                return
            }
            await createUser(form)
        }
        closeModal()
        fetchUsers()
    } catch (err) {
        error.value = err.response?.data?.error || 'Terjadi kesalahan.'
    }
}

const openResetPassword = (user) => {
    resettingUser.value = user
    newPassword.value = ''
    showNewPassword.value = false
    error.value = ''
    showResetModal.value = true
}

const handleResetPassword = async () => {
    error.value = ''
    if (newPassword.value.length < 6) {
        error.value = 'Password minimal 6 karakter.'
        return
    }
    try {
        await resetPassword(resettingUser.value.id, { newPassword: newPassword.value })
        showResetModal.value = false
    } catch (err) {
        error.value = err.response?.data?.error || 'Terjadi kesalahan.'
    }
}

const handleDelete = async (user) => {
    if (!confirm(`Yakin ingin menghapus user "${user.name}"?`)) return
    try {
        await deleteUser(user.id)
        fetchUsers()
    } catch (err) {
        alert(err.response?.data?.error || 'Gagal menghapus user.')
    }
}

onMounted(fetchUsers)
</script>