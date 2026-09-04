<script setup lang="ts">
import type { Product } from '@/interfaces/products.interface';
import { formatCurrency } from '@/shared/currency';
import { ShoppingCart } from '@/shared/icons';
import { useProductStore } from '@/stores/productStore';
import { storeToRefs } from 'pinia';
import type Button from 'primevue/button';
import Tag from 'primevue/tag';
import { computed } from 'vue';

const props = defineProps<{ product: Product }>()

const productStore = useProductStore();
const { addOrdenProduct } = productStore;
const { ordenProducts } = storeToRefs(productStore)

const isInOrden = computed(() => ordenProducts.value.some(product => product.id === props.product.id))

function addProduct() {
    void addOrdenProduct(props.product);
}
</script>

<template>
    <div class="product-body">
        <div class="product-image">
            <span class="product-status" :class="{ unavailable: !props.product.available }">
                {{ props.product.available ? 'Disponible' : 'Agotado' }}
            </span>
            <span v-if="props.product.offer_price" class="product-offer">
                En Oferta
            </span>
            <img v-if="props.product.imageUrl" :src="props.product.imageUrl" :alt="props.product.title" />
        </div>
        <div class="product-content">
            <div class="product-title">
                <h4>{{ props.product.title }}</h4>
                <div class="prices">
                    <p class="product-price" :class="{ 'with-offer': props.product.offer_price }">{{
                        formatCurrency(props.product.price) }}</p>
                    <p class="product-price" v-if="props.product.offer_price">{{
                        formatCurrency(props.product.offer_price) }}</p>
                </div>
            </div>
            <div class="product-types">
                <h4>Categorías</h4>
                <div class="types">
                    <template v-if="props.product.productType.length > 0">
                        <Tag v-for="type in props.product.productType" :key="type" class="product-type">{{ type }}
                        </Tag>
                    </template>
                    <template v-else>
                        <span>Sin Categorización</span>
                    </template>
                </div>
            </div>
        </div>
        <div class="product-footer">
            <Button class="button" :disabled="!props.product.available || isInOrden" @click="addProduct">
                <ShoppingCart :size="18" />
                Agregar al carrito
            </Button>
        </div>
    </div>
</template>

<style scoped>
.product-body {
    display: grid;
    grid-template-areas: "imagen contenido"
        "footer footer";
    grid-template-columns: 150px 1fr;
    height: 200px;
    column-gap: 10px;
    border: 1px solid var(--color-principal);
    border-radius: 10px;
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
    }

    .product-status {
        top: 5%;
        left: 5%;
        border: 1px solid #FFFFFF;
        background-color: var(--color-principal);
        color: #FFFFFF;

        &.unavailable {
            background-color: red;
            color: #FFFFFF;
            border: none;
        }
    }

    .product-offer {
        bottom: 5%;
        left: 5%;
        border: 1px solid var(--color-principal);
        background-color: #FFFFFF;
    }

    img {
        display: block;
        width: 100%;
        height: 100%;
        object-fit: cover;
        border-radius: 10px 0px 0px 0px;
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
            font-size: 12px;
            background-color: var(--color-principal);
            color: #FFFFFF;
            text-transform: capitalize;
        }
    }
}

.product-footer {
    grid-area: footer;

    .button {
        border-radius: 0px 0px 10px 10px;
        width: 100%;
        border: 1px solid var(--color-principal);
        border-width: 1px 0px 0px 0px;
        background-color: var(--color-principal);
        height: 40px;
    }
}
</style>