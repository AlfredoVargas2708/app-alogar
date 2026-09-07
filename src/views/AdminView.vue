<script setup lang="ts">
import { onMounted } from 'vue'
import { useProductStore } from '@/stores/productStore'
import Card from 'primevue/card'
import { useRouter } from 'vue-router'

const { fetchProducts } = useProductStore()
const router = useRouter()

function logout() {
    localStorage.removeItem('username');
    localStorage.removeItem('password');

    router.push({ path: '/login' });
}

onMounted(() => {
    void fetchProducts(1, 12)
})
</script>

<template>
    <Card class="admin-card">
        <template #content>
            <div class="admin-container">
                <AppHeader @logout="logout" />
            </div>
        </template>
    </Card>
</template>

<style scoped>
.admin-card {
    width: 100%;
    height: calc(100dvh - 20px);
    margin: 10px;
    padding: 10px 15px;
    overflow: hidden;
}

.admin-container {
    display: grid;
    grid-template-areas: "header header"
        "filtros filtros"
        "productos productos";
    height: 100%;
    min-height: 0;
}
</style>