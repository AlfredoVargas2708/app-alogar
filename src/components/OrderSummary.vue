<script setup lang="ts">
import { useProductStore } from '@/stores/productStore';
import { storeToRefs } from 'pinia';
import OrdenCard from './OrdenCard.vue';
import { computed } from 'vue';
import { formatCurrency } from '@/shared/currency.ts';
import type { Product } from '@/interfaces/products.interface.ts';

const productsStore = useProductStore();
const { ordenProducts } = storeToRefs(productsStore)

const totalPagar = computed(() => {
    return ordenProducts.value.reduce((acc: number, product: Product) => {
        return acc + ((product.cantidad ?? 0) * (product.offer_price ?? product.price))
    }, 0);
})
</script>

<template>
    <div class="order">
        <h1 class="mt-0 px-5 py-2">Resumen Orden</h1>
        <div class="summary">
            <h2 class="mt-0 px-5 py-2">Productos</h2>
            <div class="products px-5">
                <OrdenCard v-for="product in ordenProducts" :key="product.id" :product="product" />
            </div>
            <hr class="separador" />
            <p class="total px-5">Total a Pagar: <span>{{ formatCurrency(totalPagar) }}</span></p>
        </div>
    </div>
</template>

<style scoped>
.order {
    grid-area: orden;
    width: 100%;
    min-width: 0;
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
    height: calc(100dvh - 500px);
    overflow: auto;
}

.total {
    font-size: large;
    display: flex;
    justify-content: space-between;

    span {
        font-weight: bold;
    }
}

.separador {
    margin: 0;
    border: none;
    border-top: 3px dotted var(--color-principal);
    background-color: transparent;
}
</style>
