<template>
    <Teleport to="body">
        <div v-if="modelValue" class="modal modal-open">
            <div class="modal-box"
                style="max-width: 400px; background-color: var(--color-surface); border: 1px solid var(--color-border);">
                <div class="flex flex-col items-center mb-6 text-center">
                    <div class="flex items-center justify-center mb-4 rounded-full w-14 h-14" :style="iconBg">
                        <component :is="iconComponent" :size="28" :style="iconColor" />
                    </div>
                    <h3 class="text-lg font-bold" style="color: var(--color-text);">{{ title }}</h3>
                    <p v-if="message" class="mt-2 text-sm" style="color: var(--color-text-muted);">{{ message }}</p>
                </div>

                <div class="flex gap-3">
                    <button @click="handleCancel" class="flex-1 btn btn-ghost">
                        {{ cancelText }}
                    </button>
                    <button @click="handleConfirm" class="flex-1 btn" :class="confirmClass" :disabled="loading">
                        <span v-if="loading" class="loading loading-spinner loading-sm"></span>
                        <component v-else :is="iconComponent" :size="15" />
                        {{ confirmText }}
                    </button>
                </div>
            </div>

            <div class="modal-backdrop" style="background: rgba(0,0,0,0.6); backdrop-filter: blur(4px);"
                @click="handleCancel"></div>
        </div>
    </Teleport>
</template>

<script setup>
import { computed } from 'vue'
import { Trash2, AlertTriangle, Info, CheckCircle } from 'lucide-vue-next'

const props = defineProps({
    modelValue: { type: Boolean, required: true },
    title: { type: String, default: 'Konfirmasi' },
    message: { type: String, default: '' },
    confirmText: { type: String, default: 'Ya, Lanjutkan' },
    cancelText: { type: String, default: 'Batal' },
    type: { type: String, default: 'danger' },
    loading: { type: Boolean, default: false },
})

const emit = defineEmits(['update:modelValue', 'confirm', 'cancel'])

const iconComponent = computed(() => {
    const map = {
        danger: Trash2,
        warning: AlertTriangle,
        info: Info,
        success: CheckCircle,
    }
    return map[props.type] || AlertTriangle
})

const iconBg = computed(() => {
    const map = {
        danger: 'background-color: rgba(214,57,57,0.1);',
        warning: 'background-color: rgba(245,159,0,0.1);',
        info: 'background-color: rgba(23,162,184,0.1);',
        success: 'background-color: rgba(47,179,68,0.1);',
    }
    return map[props.type] || map.danger
})

const iconColor = computed(() => {
    const map = {
        danger: 'color: var(--color-danger);',
        warning: 'color: var(--color-warning);',
        info: 'color: #17a2b8;',
        success: 'color: var(--color-success);',
    }
    return map[props.type] || map.danger
})

const confirmClass = computed(() => {
    const map = {
        danger: 'btn-error',
        warning: 'btn-warning',
        info: 'btn-info',
        success: 'btn-success',
    }
    return map[props.type] || 'btn-error'
})

const handleConfirm = () => emit('confirm')
const handleCancel = () => {
    emit('update:modelValue', false)
    emit('cancel')
}
</script>