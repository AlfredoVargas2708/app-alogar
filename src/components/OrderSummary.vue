<script setup lang="ts">
import { useProductStore } from '@/stores/productStore';
import { storeToRefs } from 'pinia';
import OrdenCard from './OrdenCard.vue';
import { computed } from 'vue';
import { formatCurrency } from '@/shared/currency.ts';
import type { Product } from '@/interfaces/products.interface.ts';
import Button from 'primevue/button';
import { CreditCard, MoneyBill, Times } from '@/shared/icons.ts';

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
        <div class="actions">
            <Button severity="danger" :disabled="ordenProducts.length === 0">
                <Times :size="32" />
                Borrar Orden
            </Button>
            <Button severity="info" :disabled="ordenProducts.length === 0">
                <CreditCard :size="32" />
                Tarjeta
            </Button>
            <Button :disabled="ordenProducts.length === 0">
                <MoneyBill :size="32" />
                Efectivo
            </Button>
        </div>
    </div>
</template>

<style scoped>
.order {
    grid-area: orden;
    width: 100%;
    min-width: 0;
    min-height: 0;
    height: 100%;
    display: grid;
    grid-template-rows: auto minmax(0, 1fr) auto;
    overflow: hidden;
    border-left: 1px dotted var(--color-principal);
    padding-left: 10px;
}

.summary {
    grid-row: 2;
    min-height: 0;
    display: flex;
    flex-direction: column;
    overflow: hidden;
}

.products {
    flex: 1;
    min-height: 0;
    display: flex;
    flex-direction: column;
    gap: 15px;
    height: auto;
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

.actions {
    grid-row: 3;
    padding-top: 12px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 10px;

    .p-button {
        width: 100%;
        font-size: 24px;

        &:last-child {
            background-color: var(--color-principal);
            border: none;
        }
    }
}
</style>
