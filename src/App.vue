<script setup lang="ts">
import { RouterView } from 'vue-router';

</script>

<template>
  <div class="app-container">
    <RouterView />
  </div>
</template>

<style scoped>
:global(body) {
  margin: 0;
}

.app-container {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100dvh;
  background-color: rgba(24, 76, 71, 0.8);
}
</style>
