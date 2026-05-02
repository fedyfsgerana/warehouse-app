<template>
    <router-view />
    <AppAlert />
    <AppConfirm v-model="confirmStore.show" :title="confirmStore.title" :message="confirmStore.message"
        :confirm-text="confirmStore.confirmText" :cancel-text="confirmStore.cancelText" :type="confirmStore.type"
        :loading="confirmStore.loading" @confirm="confirmStore.confirm()" @cancel="confirmStore.cancel()" />
</template>

<script setup>
import AppAlert from '@/components/AppAlert.vue'
import AppConfirm from '@/components/AppConfirm.vue'
import { useConfirmStore } from '@/stores/confirm.store'

const confirmStore = useConfirmStore()
</script>