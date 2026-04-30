<template>
    <div class="min-h-screen bg-gray-100 flex items-center justify-center">
        <div class="bg-white p-8 rounded-xl shadow-md w-full max-w-md">
            <h2 class="text-2xl font-bold text-gray-800 mb-2">Warehouse MS</h2>
            <p class="text-gray-500 mb-6">Silakan login untuk melanjutkan</p>

            <div v-if="authStore.error" class="bg-red-50 text-red-600 px-4 py-3 rounded-lg mb-4 text-sm">
                {{ authStore.error }}
            </div>

            <form @submit.prevent="handleLogin" class="space-y-4">
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Email</label>
                    <input v-model="form.email" type="email" placeholder="admin@warehouse.com"
                        class="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary-500"
                        required />
                </div>

                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Password</label>
                    <input v-model="form.password" type="password" placeholder="password"
                        class="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary-500"
                        required />
                </div>

                <button type="submit" :disabled="authStore.loading"
                    class="w-full bg-primary-600 text-white py-2.5 rounded-lg font-medium hover:bg-primary-700 transition-colors disabled:opacity-50">
                    {{ authStore.loading ? 'Memproses...' : 'Login' }}
                </button>
            </form>
        </div>
    </div>
</template>

<script setup>
import { reactive } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth.store'

const authStore = useAuthStore()
const router = useRouter()

const form = reactive({
    email: '',
    password: ''
})

const handleLogin = async () => {
    try {
        await authStore.login(form)
        router.push('/')
    } catch (err) { }
}
</script>