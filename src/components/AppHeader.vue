<script setup lang="ts">
import Button from 'primevue/button'
import { SignOut } from '@/shared/icons'
import { onMounted, ref } from 'vue'

defineEmits<{ logout: [] }>()

const userRole = ref<string>('')

onMounted(() => {
  const user = JSON.parse(localStorage.getItem('user') ?? '')
  userRole.value = user.role
})
</script>

<template>
  <div class="header">
    <div class="image-container">
      <img src="/logo-alogar.avif" alt="logo Alogar" />
    </div>
    <h1 class="title m-0 pb-2 font-italic text-5xl">
      {{ userRole === 'admin' ? 'Vista de Administrador' : 'Sistema de Ventas' }}
    </h1>
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
  grid-template-areas: 'logo titulo titulo titulo titulo boton';
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
