<template>
    <Teleport to="body">
        <div v-if="modelValue" class="modal modal-open">
            <div class="modal-box" :style="{
                maxWidth: maxWidth,
                backgroundColor: 'var(--color-surface)',
                border: '1px solid var(--color-border)',
            }">
                <div class="flex items-start justify-between mb-6" v-if="title">
                    <div>
                        <h3 class="text-lg font-bold" style="color: var(--color-text);">{{ title }}</h3>
                        <p v-if="subtitle" class="text-xs mt-0.5" style="color: var(--color-text-muted);">{{ subtitle }}
                        </p>
                    </div>
                    <button @click="$emit('update:modelValue', false)" class="btn btn-sm btn-ghost btn-circle">
                        <X :size="16" />
                    </button>
                </div>

                <slot />

                <div v-if="$slots.footer" class="mt-6 modal-action">
                    <slot name="footer" />
                </div>
            </div>

            <div class="modal-backdrop" style="background: rgba(0,0,0,0.6); backdrop-filter: blur(4px);"
                @click="closeOnBackdrop && $emit('update:modelValue', false)"></div>
        </div>
    </Teleport>
</template>

<script setup>
import { X } from 'lucide-vue-next'

defineProps({
    modelValue: { type: Boolean, required: true },
    title: { type: String, default: '' },
    subtitle: { type: String, default: '' },
    maxWidth: { type: String, default: '480px' },
    closeOnBackdrop: { type: Boolean, default: true },
})

defineEmits(['update:modelValue'])
</script>