<template>
    <div class="flex items-center justify-center min-h-screen" style="background-color: var(--color-bg);">
        <div class="w-full max-w-md px-4">

            <div class="flex flex-col items-center mb-8">
                <div class="flex items-center justify-center mb-4 text-2xl font-black text-white w-14 h-14 rounded-2xl"
                    style="background: linear-gradient(135deg, var(--color-primary), var(--color-primary-dark));">
                    W
                </div>
                <h1 class="text-2xl font-bold" style="color: var(--color-text);">Warehouse MS</h1>
                <p class="mt-1 text-sm" style="color: var(--color-text-muted);">Silakan login untuk melanjutkan</p>
            </div>

            <div class="card">

                <div v-if="authStore.error" role="alert" class="mb-6 alert alert-error">
                    <AlertCircle :size="16" />
                    <span class="text-sm">{{ authStore.error }}</span>
                </div>

                <div class="mb-4 form-control">
                    <label class="label">
                        <span class="font-semibold label-text" style="color: var(--color-text-muted);">EMAIL</span>
                    </label>
                    <label class="flex items-center gap-2 input input-bordered"
                        style="background-color: var(--color-surface-2); border-color: var(--color-border);">
                        <Mail :size="15" style="color: var(--color-text-muted);" />
                        <input v-model="form.email" type="email" placeholder="admin@warehouse.com" class="text-sm grow"
                            style="background: transparent; color: var(--color-text);" @keyup.enter="handleLogin" />
                    </label>
                </div>

                <div class="mb-6 form-control">
                    <label class="label">
                        <span class="font-semibold label-text" style="color: var(--color-text-muted);">PASSWORD</span>
                    </label>
                    <label class="flex items-center gap-2 input input-bordered"
                        style="background-color: var(--color-surface-2); border-color: var(--color-border);">
                        <Lock :size="15" style="color: var(--color-text-muted);" />
                        <input v-model="form.password" :type="showPassword ? 'text' : 'password'" placeholder="Password"
                            class="text-sm grow" style="background: transparent; color: var(--color-text);"
                            @keyup.enter="handleLogin" />
                        <button @click="showPassword = !showPassword" type="button">
                            <Eye v-if="!showPassword" :size="15" style="color: var(--color-text-muted);" />
                            <EyeOff v-else :size="15" style="color: var(--color-text-muted);" />
                        </button>
                    </label>
                </div>

                <button @click="handleLogin" :disabled="authStore.loading" class="w-full btn btn-primary">
                    <span v-if="authStore.loading" class="loading loading-spinner loading-sm"></span>
                    <LogIn v-else :size="16" />
                    {{ authStore.loading ? 'Memproses...' : 'Login' }}
                </button>

            </div>

            <p class="mt-6 text-xs text-center" style="color: var(--color-text-muted);">
                Warehouse MS &copy; {{ year }}
            </p>
        </div>
    </div>
</template>

<script setup>
import { reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth.store'
import { Mail, Lock, LogIn, Eye, EyeOff, AlertCircle } from 'lucide-vue-next'

const authStore = useAuthStore()
const router = useRouter()
const showPassword = ref(false)
const year = new Date().getFullYear()

const form = reactive({ email: '', password: '' })

const handleLogin = async () => {
    try {
        await authStore.login(form)
        router.push('/')
    } catch (err) { }
}
</script>