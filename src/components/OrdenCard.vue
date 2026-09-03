<script setup lang="ts">
import type { Product } from '@/interfaces/products.interface';
import { formatCurrency } from '@/shared/currency';
import { Minus, Plus, Trash } from '@/shared/icons';
import { useProductStore } from '@/stores/productStore';
import type Button from 'primevue/button';
import InputNumber from 'primevue/inputnumber';
import { computed } from 'vue';

const productStore = useProductStore();
const { deleteOrdenProduct } = productStore;

const props = defineProps<{ product: Product }>()

const subtotal = computed(() => {
    return (props.product.cantidad ?? 0) * (props.product.offer_price ?? props.product.price)
})
</script>
<template>
    <div class="orden-card">
        <div class="product-image">
            <img :src="props.product.imageUrl" alt="">
        </div>
        <div class="product-title">
            <h3 class="m-0 mt-2">{{ props.product.title }}</h3>
        </div>
        <div class="product-descripcion">
            <div class="unit-price">
                <span>Precio Unitario</span>
                <span>{{ formatCurrency(props.product.offer_price ?? props.product.price) }}</span>
            </div>
            <div class="total-price">
                <span>Subtotal</span>
                <span>{{ formatCurrency(subtotal) }}</span>
            </div>
        </div>
        <div class="product-actions">
            <InputNumber v-model="props.product.cantidad" showButtons buttonLayout="horizontal" inputId="vertical"
                :inputStyle="{ width: '3rem' }">
                <template #incrementicon>
                    <Plus />
                </template>
                <template #decrementicon>
                    <Minus />
                </template>
            </InputNumber>
            <Button class="trash-button" @click="deleteOrdenProduct(props.product)">
                <Trash :size="16" />
            </Button>
        </div>
    </div>
</template>

<style scoped>
.orden-card {
    width: 100%;
    min-height: 90px;
    border: 1px solid var(--color-principal);
    border-radius: 8px;
    display: grid;
    grid-template-areas: "imagen titulo titulo titulo"
        "imagen descripcion acciones acciones";
    grid-template-columns: 200px 1fr 150px;
    grid-template-rows: auto auto;
    column-gap: 10px;
    row-gap: 4px;
    padding: 0px 10px 0px 0;
}

.product-image {
    grid-area: imagen;
    width: 100%;
    height: 90px;
    overflow: hidden;

    img {
        width: 100%;
        height: 100%;
        object-fit: cover;
        border-radius: 10px 0px 0px 10px;
    }
}

.product-title {
    grid-area: titulo;
    min-width: 0;

    h3 {
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
    }
}

.product-descripcion {
    grid-area: descripcion;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0px 10px 0px 0px;

    span {
        font-size: 14px;
        display: block;
    }
}

.unit-price {
    display: flex;
    flex-direction: column;
}

.product-actions {
    grid-area: acciones;
    display: flex;
    align-items: center;
    justify-content: flex-end;
    gap: 10px;
    width: 100%;
}
</style>