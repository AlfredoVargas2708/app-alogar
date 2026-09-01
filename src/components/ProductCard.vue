<script setup lang="ts">
import type { Product } from '@/interfaces/products.interface';

const props = defineProps<{ product: Product }>()
</script>

<template>
    <div class="product-card">
        <!-- <div class="product-image">
            <img v-if="props.product.imageUrl" :src="props.product.imageUrl" :alt="props.product.title" />
        </div>
        <div class="product-content">
            <h4>{{ props.product.title }}</h4>
            <p class="product-price">{{ Number(props.product.price).toLocaleString('es-CL', {
                style: 'currency',
                currency: 'CLP'
            }) }}</p>
            <span class="product-status" :class="{ unavailable: !props.product.avaiable }">
                {{ props.product.avaiable ? 'Disponible' : 'Agotado' }}
            </span>
        </div> -->
    </div>
</template>

<style scoped></style>