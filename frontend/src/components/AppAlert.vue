<template>
    <Teleport to="body">
        <div class="fixed top-4 right-4 z-[999] flex flex-col gap-2 w-80">
            <TransitionGroup name="alert">
                <div v-for="alert in alerts" :key="alert.id" role="alert" class="shadow-lg alert"
                    :class="alertClass(alert.type)">
                    <component :is="alertIcon(alert.type)" :size="18" />
                    <div class="flex-1 min-w-0">
                        <p v-if="alert.title" class="text-sm font-bold">{{ alert.title }}</p>
                        <p class="text-sm" :class="alert.title ? 'opacity-80' : ''">{{ alert.message }}</p>
                    </div>
                    <button @click="remove(alert.id)" class="btn btn-ghost btn-xs btn-circle">
                        <X :size="14" />
                    </button>
                </div>
            </TransitionGroup>
        </div>
    </Teleport>
</template>

<script setup>
import { X, CheckCircle, AlertTriangle, Info, XCircle } from 'lucide-vue-next'
import { useAlertStore } from '@/stores/alert.store'
import { storeToRefs } from 'pinia'

const alertStore = useAlertStore()
const { alerts } = storeToRefs(alertStore)
const { remove } = alertStore

const alertClass = (type) => {
    const map = {
        success: 'alert-success',
        error: 'alert-error',
        warning: 'alert-warning',
        info: 'alert-info',
    }
    return map[type] || 'alert-info'
}

const alertIcon = (type) => {
    const map = {
        success: CheckCircle,
        error: XCircle,
        warning: AlertTriangle,
        info: Info,
    }
    return map[type] || Info
}
</script>

<style scoped>
.alert-enter-active {
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.alert-leave-active {
    transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

.alert-enter-from {
    opacity: 0;
    transform: translateX(100%);
}

.alert-leave-to {
    opacity: 0;
    transform: translateX(100%);
}
</style>