<script setup lang="ts">
import { useProductStore } from '@/stores/productStore';
import { storeToRefs } from 'pinia';
import OrdenCard from './OrdenCard.vue';

const productsStore = useProductStore();
const { ordenProducts } = storeToRefs(productsStore)
</script>

<template>
    <div class="order">
        <h2 class="mt-0 px-5 py-2">Resumen Orden</h2>
        <div class="summary">
            <h3 class="mt-0 px-5 py-2">Productos</h3>
            <div class="products px-5">
                <OrdenCard v-for="product in ordenProducts" :key="product.id" :product="product" />
            </div>
        </div>
    </div>
</template>

<style scoped>
.order {
    grid-area: orden;
    border-left: 1px dotted var(--color-principal);
    padding-left: 10px;
}

.summary {
    display: flex;
    flex-direction: column;
    justify-content: center;
}

.products {
    display: flex;
    flex-direction: column;
    gap: 15px;
    height: 180px;
    overflow: auto;
}
</style>
