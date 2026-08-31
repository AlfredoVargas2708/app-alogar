<script setup lang="ts">
import Button from 'primevue/button';
import Card from 'primevue/card';
import SignOut from '@primeicons/vue/sign-out';

</script>
<template>
    <div class="home-container">
        <Card class="home-card">
            <template #title>
                <div class="flex flex-row align-items-center justify-content-between">
                    <img src="/public/logo-alogar.avif" alt="" class="home-logo" />
                    <h1>Sistema de Ventas</h1>
                    <Button class="sign-out-button">
                        <SignOut :size="24" />
                        Cerrar Sesión
                    </Button>
                </div>
            </template>
            <template #content>

            </template>
        </Card>
    </div>
</template>

<style scoped>
.home-container {
    width: min(100% - 2rem, 100%);
}

.home-card :deep(.p-card-body) {
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    height: 100%;
    box-sizing: border-box;
}

.home-logo {
    width: 250px;
    height: 80px;
}

.sign-out-button.p-button {
    background-color: rgb(24, 76, 71);
    border: 1px solid #FFFFFF;
    height: 50px;
    width: 200px;
    font-size: 22px;
}
</style>