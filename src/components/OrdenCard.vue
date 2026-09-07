<script setup lang="ts">
import type { Product } from '@/interfaces/products.interface';
import { formatCurrency } from '@/shared/currency';
import { Minus, Plus, Trash } from '@/shared/icons';
import { useProductStore } from '@/stores/productStore';
import { getImageSrc } from '@/services/api';
import Button from 'primevue/button';
import InputNumber, { type InputNumberInputEvent } from 'primevue/inputnumber';
import RadioButton from 'primevue/radiobutton';
import { computed } from 'vue';

const productStore = useProductStore();
const { deleteOrdenProduct, updateOrdenProduct } = productStore;

const props = defineProps<{ product: Product }>()

const subtotal = computed(() => {
    return props.product.isWeight ? (((props.product.weight ?? 0) / (props.product.grams ?? 0)) * (props.product.offer_price ?? props.product.price)) : (props.product.cantidad ?? 0) * (props.product.offer_price ?? props.product.price)
})

const onWeightInput = (event: InputNumberInputEvent) => {
    const value = event.value;

    if (value !== null && value !== undefined) {
        updateOrdenProduct(props.product.id, { weight: Number(value) });
    }
}

const onIsWeightChange = (isWeight: boolean) => {
    updateOrdenProduct(props.product.id, { isWeight });
}

const onCantidadChange = (event: InputNumberInputEvent) => {
    const value = event.value;
    if (value !== null && value !== undefined) {
        updateOrdenProduct(props.product.id, { cantidad: Number(value) });
    }
}
</script>
<template>
    <div class="orden-card">
        <div class="product-image">
            <img :src="getImageSrc(props.product.imageUrl)" alt="">
        </div>
        <div class="product-contenido">
            <div class="product-title">
                <span class="product-kicker">Producto</span>
                <h3 class="m-0">{{ props.product.title }}</h3>
            </div>
            <div class="product-descripcion">
                <div class="price-detail">
                    <span class="detail-label">Precio unitario</span>
                    <span class="detail-value">{{ formatCurrency(props.product.offer_price ?? props.product.price)
                    }}</span>
                </div>
                <div class="price-detail total-price">
                    <span class="detail-label">Subtotal</span>
                    <span class="detail-value">{{ formatCurrency(subtotal) }}</span>
                </div>
            </div>
        </div>
        <div class="product-actions">
            <div class="weight-select">
                <span class="detail-label">Tipo de venta</span>
                <div class="radio-buttons">
                    <div class="radio">
                        <RadioButton :modelValue="props.product.isWeight" @update:modelValue="onIsWeightChange(true)"
                            :inputId="`pesable-${props.product.id}`" :name="`peso-${props.product.id}`" :value="true" />
                        <label :for="`pesable-${props.product.id}`" class="text-sm!">Por peso</label>
                    </div>
                    <div class="radio">
                        <RadioButton :modelValue="props.product.isWeight" @update:modelValue="onIsWeightChange(false)"
                            :inputId="`no-pesable-${props.product.id}`" :name="`peso-${props.product.id}`"
                            :value="false" />
                        <label :for="`no-pesable-${props.product.id}`" class="text-sm!">Por unidad</label>
                    </div>
                </div>
            </div>
            <div class="input-actions">
                <template v-if="props.product.isWeight">
                    <InputNumber :modelValue="props.product.weight" placeholder="Ingresar peso en gramos" suffix=" gr"
                        :inputStyle="{ width: '100%' }" @input="onWeightInput" />
                </template>
                <template v-else>
                    <InputNumber :modelValue="props.product.cantidad" showButtons buttonLayout="horizontal"
                        inputId="vertical" :inputStyle="{ width: '100%', 'text-align': 'center' }"
                        @input="onCantidadChange">
                        <template #incrementicon>
                            <Plus :size="20" />
                        </template>
                        <template #decrementicon>
                            <Minus :size="20" />
                        </template>
                    </InputNumber>
                </template>
            </div>
            <Button class="trash-button" @click="deleteOrdenProduct(props.product)">
                <Trash :size="24" />
            </Button>
        </div>
    </div>
</template>


<style scoped>
.orden-card {
    display: grid;
    grid-template-columns: 150px 1fr;
    border: 1px solid color-mix(in srgb, var(--color-principal) 18%, white);
    border-radius: 12px;
    background: #ffffff;
    box-shadow: 0 4px 14px rgba(24, 76, 71, 0.08);
    transition: box-shadow 180ms ease, border-color 180ms ease;

    &:hover {
        border-color: color-mix(in srgb, var(--color-principal) 38%, white);
        box-shadow: 0 7px 20px rgba(24, 76, 71, 0.13);
    }
}

div:not(.orden-card, .product-descripcion, .product-title, .price-detail, .weight-select, .radio-buttons, .radio, .p-radiobutton-input, .p-radiobutton, .input-actions) {
    width: 100%;
    min-height: 100px;
}

.product-image {
    height: 100px;

    img {
        width: 100%;
        height: 100%;
        object-fit: cover;
    }
}

.product-contenido {
    grid-row: span 2;

    .product-title {
        display: flex;
        flex-direction: column;
        padding: 10px;
    }

    .product-descripcion {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 0px 10px;

        .price-detail {
            display: flex;
            gap: 5px;

            .detail-value {
                font-weight: bold;
            }
        }
    }
}

.product-actions {
    grid-column: span 2;
    display: flex;
    align-items: center;
    gap: 40px;

    .weight-select {
        display: flex;
        flex-direction: column;
        padding: 5px 10px;
        gap: 10px;
    }

    .radio-buttons {
        display: flex;
        flex-direction: column;
        gap: 10px;

        .radio {
            display: flex;
            align-items: center;
            gap: 5px;
        }
    }

    .input-actions {
        width: 200px;
    }

    .p-inputnumber {
        width: 100%;
    }

    .trash-button {
        background-color: red;
        border: none;
    }
}
</style>