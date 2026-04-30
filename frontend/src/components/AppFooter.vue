<template>
    <footer class="px-6 py-4 flex items-center justify-between text-xs" style="
      background-color: var(--color-surface);
      border-top: 1px solid var(--color-border);
      color: var(--color-text-muted);
    ">
        <div class="flex items-center gap-2">
            <div class="w-5 h-5 rounded-md flex items-center justify-center"
                style="background: linear-gradient(135deg, var(--color-primary), var(--color-primary-dark));">
                <Warehouse :size="12" class="text-white" />
            </div>
            <span>Warehouse MS &copy; {{ year }}</span>
        </div>

        <div class="flex items-center gap-4">
            <span>Version 1.0.0</span>
            <div class="flex items-center gap-1.5">
                <div class="w-1.5 h-1.5 rounded-full" style="background-color: var(--color-success);"></div>
                <span>System Online</span>
            </div>
        </div>
    </footer>
</template>

<script setup>
import { Warehouse } from 'lucide-vue-next'
const year = new Date().getFullYear()
</script>