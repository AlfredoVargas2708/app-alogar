<script setup lang="ts">
import Card from 'primevue/card';
</script>

<template>
    <div class="login-container">
        <Card class="max-w-sm w-full">
            <template #title>
                <div class="title-container">
                    <img src="https://alogar.cl/cdn/shop/files/Logo-2025_da742222-4572-4aa9-8ccb-f15ed9de1f2f.png?v=1772139348&width=330"
                        alt="">
                    <h2 class="text-center mb-0">Iniciar Sesión</h2>
                </div>
            </template>
            <template #subtitle>
                <h3 class="text-center mt-0">Sistema de Ventas ALOGAR</h3>
            </template>
            <template #content>
                <div class="login-form"></div>
            </template>
        </Card>
    </div>
</template>

<style scoped>
.login-container {
    width: min(100% - 2rem, 28rem);
}

.title-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;

    img {
        width: 200px;
        height: 50px;
    }
}
</style>