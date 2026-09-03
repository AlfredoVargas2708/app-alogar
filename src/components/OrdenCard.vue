<script setup lang="ts">
import type { Product } from '@/interfaces/products.interface';
import { formatCurrency } from '@/shared/currency';
import { Minus, Plus, Trash } from '@/shared/icons';
import { useProductStore } from '@/stores/productStore';
import type Button from 'primevue/button';
import InputNumber from 'primevue/inputnumber';
import RadioButton from 'primevue/radiobutton';
import { computed, ref } from 'vue';

const productStore = useProductStore();
const { deleteOrdenProduct } = productStore;

const isWeight = ref<boolean>(false);
const weight = ref<number | null>(null);

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
            <span class="product-kicker">Producto</span>
            <h3 class="m-0">{{ props.product.title }}</h3>
        </div>
        <div class="product-descripcion">
            <div class="price-detail">
                <span class="detail-label">Precio unitario</span>
                <span class="detail-value">{{ formatCurrency(props.product.offer_price ?? props.product.price) }}</span>
            </div>
            <div class="price-detail total-price">
                <span class="detail-label">Subtotal</span>
                <span class="detail-value">{{ formatCurrency(subtotal) }}</span>
            </div>
        </div>
        <div class="product-actions">
            <div class="weight-select">
                <span class="detail-label">Tipo de venta</span>
                <div class="radio-buttons">
                    <div class="flex items-center gap-3">
                        <RadioButton v-model="isWeight" :inputId="`pesable-${props.product.id}`"
                            :name="`peso-${props.product.id}`" :value="true" />
                        <Label :for="`pesable-${props.product.id}`" class="text-sm!">Por peso</Label>
                    </div>
                    <div class="flex items-center gap-3">
                        <RadioButton v-model="isWeight" :inputId="`no-pesable-${props.product.id}`"
                            :name="`peso-${props.product.id}`" :value="false" />
                        <Label :for="`no-pesable-${props.product.id}`" class="text-sm!">Por unidad</Label>
                    </div>
                </div>
            </div>
            <div class="input-actions">
                <ng-container v-if=isWeight>
                    <InputNumber placeholder="Ingresar peso en gramos" suffix="gr" :inputStyle="{ width: '100%' }" />
                </ng-container>
                <ng-container v-else>
                    <InputNumber v-model="props.product.cantidad" showButtons buttonLayout="horizontal"
                        inputId="vertical" :inputStyle="{ width: '100%', 'text-align': 'center' }">
                        <template #incrementicon>
                            <Plus :size="20" />
                        </template>
                        <template #decrementicon>
                            <Minus :size="20" />
                        </template>
                    </InputNumber>
                </ng-container>
            </div>
            <Button class="trash-button" @click="deleteOrdenProduct(props.product)">
                <Trash :size="24" />
            </Button>
        </div>
    </div>
</template>

<style scoped>
.orden-card {
    width: 100%;
    min-height: 150px;
    display: grid;
    grid-template-columns: 88px minmax(0, 1fr);
    grid-template-rows: 60px auto auto;
    grid-template-areas:
        "imagen titulo"
        "imagen descripcion"
        "acciones acciones";
    gap: 0 14px;
    overflow: hidden;
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

.product-image {
    grid-area: imagen;
    width: 88px;
    height: 100%;
    overflow: hidden;
    background: #e8f0ee;

    img {
        width: 100%;
        height: 100%;
        object-fit: cover;
        display: block;
    }
}

.product-title {
    grid-area: titulo;
    min-width: 0;
    padding: 16px 16px 8px 0;

    .product-kicker,
    h3 {
        display: block;
    }

    .product-kicker {
        margin-bottom: 5px;
        color: #78908c;
        font-size: 11px;
        font-weight: 700;
        letter-spacing: 0.08em;
        text-transform: uppercase;
    }

    h3 {
        overflow: hidden;
        color: #163f3b;
        font-size: 16px;
        line-height: 1.3;
        text-overflow: ellipsis;
        white-space: nowrap;
    }
}

.product-descripcion {
    grid-area: descripcion;
    align-self: end;
    display: flex;
    justify-content: space-between;
    gap: 16px;
    min-width: 0;
    padding: 8px 16px 16px 0;

    .price-detail {
        display: flex;
        flex-direction: column;
        gap: 3px;
        min-width: 0;
    }

    .detail-label {
        color: #78908c;
        font-size: 11px;
        font-weight: 600;
        text-transform: uppercase;
    }

    .detail-value {
        color: #315f59;
        font-size: 14px;
        font-weight: 600;
        white-space: nowrap;
    }

    .total-price {
        align-items: flex-end;

        .detail-value {
            color: var(--color-principal);
            font-size: 18px;
            font-weight: 800;
        }
    }
}

.product-actions {
    grid-area: acciones;
    display: grid;
    grid-template-columns: minmax(185px, 1fr) minmax(150px, 1.1fr) 42px;
    grid-template-areas: "radios input button";
    align-items: center;
    gap: 14px;
    width: 100%;
    padding: 12px 14px;
    border-top: 1px solid #e5edeb;
    background: #f7faf9;

    .trash-button.p-button {
        grid-area: button;
        width: 38px;
        height: 38px;
        padding: 0;
        border: 1px solid #f2caca;
        border-radius: 8px;
        background: #fff5f5;
        color: #c84c4c;

        &:hover {
            border-color: #c84c4c;
            background: #c84c4c;
            color: #ffffff;
        }
    }

    .p-inputnumber {
        min-width: 0;
    }
}

.weight-select {
    grid-area: radios;
    display: flex;
    flex-direction: column;
    gap: 6px;
    min-width: 0;

    .radio-buttons {
        display: flex;
        flex-wrap: wrap;
        gap: 8px 14px;
    }

    label {
        color: #315f59;
        font-size: 12px;
    }
}

.input-actions {
    grid-area: input;
    width: 100%;

    .p-inputnumber {
        width: 100%;
    }
}

@media (max-width: 560px) {
    .orden-card {
        grid-template-columns: 72px minmax(0, 1fr);
    }

    .product-image {
        width: 72px;
        min-height: 138px;
    }

    .product-title {
        padding-top: 12px;
    }

    .product-descripcion {
        padding-bottom: 12px;
    }

    .product-actions {
        grid-template-columns: minmax(0, 1fr) 38px;
        grid-template-areas:
            "radios button"
            "input input";
        gap: 10px;
    }
}
</style>