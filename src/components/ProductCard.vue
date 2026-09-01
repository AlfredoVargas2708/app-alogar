<script setup lang="ts">
import type { Product } from '@/interfaces/products.interface';
import Card from 'primevue/card';
import Tag from 'primevue/tag';

const props = defineProps<{ product: Product }>()
</script>

<template>
    <Card>
        <template #content>
            <div class="product-body">
                <div class="product-image">
                    <span class="product-status" :class="{ unavailable: !props.product.avaiable }">
                        {{ props.product.avaiable ? 'Disponible' : 'Agotado' }}
                    </span>
                    <span class="product-offer" :class="{ 'with-offer': props.product.offer_price }">
                        En Oferta
                    </span>
                    <img v-if="props.product.imageUrl" :src="props.product.imageUrl" :alt="props.product.title" />
                </div>
                <div class="product-content">
                    <div class="product-title">
                        <h4>{{ props.product.title }}</h4>
                        <div class="prices">
                            <p class="product-price" :class="{ 'with-offer': props.product.offer_price }">{{
                                Number(props.product.price).toLocaleString('es-CL', {
                                    style: 'currency',
                                    currency: 'CLP'
                                }) }}</p>
                            <p class="product-price" v-if="props.product.offer_price">{{
                                Number(props.product.offer_price).toLocaleString('es-CL', {
                                    style: 'currency',
                                    currency: 'CLP'
                                }) }}</p>
                        </div>
                    </div>
                    <div class="product-types">
                        <h4>Categorías</h4>
                        <div class="types">
                            <Tag v-for="type in props.product.productType" :key="type" class="product-type">{{ type }}
                            </Tag>
                        </div>
                    </div>
                </div>
            </div>
        </template>
    </Card>
</template>

<style scoped>
.p-card {
    border: 1px solid var(--color-principal);
    width: 100%;
    height: 100%;
    display: flex;
    justify-content: center;
}

:deep(.p-card) {
    height: 100%;
}

:deep(.p-card-body) {
    height: 100%;
    padding: 0;
}

:deep(.p-card-content) {
    height: 100%;
}

.product-body {
    display: grid;
    grid-template-areas: "imagen contenido";
    grid-template-columns: 200px 1fr;
    height: 175px;
    gap: 15px;
}

.product-image {
    grid-area: imagen;
    width: 100%;
    height: 100%;
    overflow: hidden;
    position: relative;

    .product-status,
    .product-offer {
        position: absolute;
        padding: 5px;
        border-radius: 10px;
        border: 1px solid var(--color-principal);
        background-color: #FFFFFF;

        &.unavailable {
            background-color: red;
            color: #FFFFFF;
            border: none;
        }
    }

    .product-status {
        top: 5%;
        left: 5%;
    }

    .product-offer {
        top: 5%;
        right: 5%;
    }

    img {
        display: block;
        width: 100%;
        height: 100%;
        object-fit: cover;
        border-radius: 10px 0px 0px 10px;
    }
}

.product-content {
    grid-area: contenido;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    min-height: 0;
    padding: 8px 0;

    .product-title {
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        gap: 6px;

        h4,
        p {
            margin: 0px;
        }

        h4 {
            font-size: large;
        }

        .prices {
            display: flex;
            align-items: center;
            gap: 10px;

            .product-price {
                font-size: large;

                &.with-offer {
                    font-size: medium;
                    text-decoration: line-through;
                    opacity: 0.5;
                }
            }
        }
    }

    .product-types {
        display: flex;
        flex-direction: column;
        gap: 5px;

        h4 {
            margin: 0;
        }

        .types {
            display: flex;
            align-items: center;
            gap: 10px;
            flex-wrap: wrap;
        }

        .product-type {
            padding: 5px 10px;
            font-size: 14px;
            background-color: var(--color-principal);
            color: #FFFFFF;
            text-transform: capitalize;
        }
    }
}
</style>