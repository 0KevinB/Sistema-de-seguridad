<template>
  <div id="app">
    <router-view />
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import { useAuthStore } from './stores/authStore'

const authStore = useAuthStore()

onMounted(async () => {
  if (authStore.isAuthenticated) {
    await authStore.verificarSesion()
  }
})
</script>

<style>
/* Estilos globales ya están en style.css */
</style>
