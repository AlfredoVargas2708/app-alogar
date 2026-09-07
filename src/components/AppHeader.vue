<script setup lang="ts">
import Button from 'primevue/button'
import { Box, ChartBar, SignOut } from '@/shared/icons'
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useUserStore } from '@/stores/userStore'

defineEmits<{ logout: [] }>()

const userStore = useUserStore()
const route = useRoute()
const router = useRouter()

const userRole = computed(() => userStore.userData?.role ?? userStore.userData?.user_role ?? '')
const isAdmin = computed(() => userRole.value === 'admin')
const isAdminRoute = computed(() => route.path === '/admin')
</script>

<template>
  <div class="header">
    <div class="image-container">
      <img src="/logo-alogar.avif" alt="logo Alogar" />
    </div>
    <h1 class="title m-0 pb-2 font-italic text-5xl">
      {{ isAdminRoute ? 'Vista de Administrador' : 'Sistema de Ventas' }}
    </h1>
    <div v-if="isAdmin" class="nav-container">
      <Button :outlined="!isAdminRoute" class="nav-button" @click="router.push({ path: '/admin' })">
        <ChartBar :size="20" />
        Administración
      </Button>
      <Button :outlined="isAdminRoute" class="nav-button" @click="router.push({ path: '/home' })">
        <Box :size="20" />
        Punto de Venta
      </Button>
    </div>
    <div class="button-container">
      <Button v-on:click="$emit('logout')">
        <SignOut :size="24" />
        Cerrar Sesión
      </Button>
    </div>
  </div>
</template>

<style scoped>
.header {
  grid-area: header;
  display: grid;
  grid-template-areas: 'logo titulo nav boton';
  grid-template-columns: auto 1fr auto auto;
  gap: 15px;
  padding-bottom: 10px;
  align-items: center;
  height: 75px;
}

.image-container {
  grid-area: logo;
  display: flex;
  justify-content: start;
  align-items: center;
  height: 60px;

  img {
    height: 100%;
  }
}

.title {
  grid-area: titulo;
  text-align: center;
}

.nav-container {
  grid-area: nav;
  display: flex;
  align-items: center;
  gap: 10px;
  height: 100%;

  .nav-button {
    height: 44px;
    font-size: 14px;

    &:not(.p-button-outlined) {
      background-color: var(--color-principal);
      border: none;
    }

    &.p-button-outlined {
      border: 1px solid var(--color-principal);
      color: var(--color-principal);

      &:hover {
        background-color: color-mix(in srgb, var(--color-principal) 10%, white);
      }
    }
  }
}

.button-container {
  grid-area: boton;
  display: flex;
  justify-content: end;
  align-items: center;
  height: 100%;

  .p-button {
    width: 150px;
    height: 50px;
    background-color: var(--color-principal);
    border: none;

    &:hover {
      background-color: #ffffff;
      border: 1px solid var(--color-principal);
      color: var(--color-principal);
    }
  }
}
</style>
