<script setup lang="ts">
import type { Product } from '@/interfaces/products.interface';


const props = defineProps<{ product: Product }>()
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
            </div>
            <div class="total-price">
                <span>Subtotal</span>
            </div>
        </div>
        <div class="product-actions"></div>
    </div>
</template>

<style scoped>
.orden-card {
    width: 100%;
    height: 100%;
    max-height: 80px;
    border: 1px solid var(--color-principal);
    display: grid;
    grid-template-areas: "imagen titulo titulo"
        "imagen descripcion acciones";
    column-gap: 10px;
}

.product-image {
    grid-area: imagen;
    width: 100%;
    max-width: 150px;
    height: 100%;
    overflow: hidden;

    img {
        width: 100%;
        height: 100%;
        object-fit: cover;
    }
}

.product-title {
    grid-area: titulo;

}

.product-descripcion {
    grid-area: descripcion;
    display: flex;
    align-items: center;
    justify-content: space-between;
}

.product.actions {
    grid-area: acciones;
}
</style>