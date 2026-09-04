<script setup lang="ts">
import { useProductStore } from '@/stores/productStore';
import { storeToRefs } from 'pinia';
import OrdenCard from './OrdenCard.vue';
import { computed, ref, watch } from 'vue';
import { formatCurrency } from '@/shared/currency.ts';
import type { Product } from '@/interfaces/products.interface.ts';
import Button from 'primevue/button';
import { CartPlus, CreditCard, MoneyBill, Spinner, Times } from '@/shared/icons.ts';
import InputNumber from 'primevue/inputnumber';
import Dialog from 'primevue/dialog';
import CardModal from './CardModal.vue';
import type { Sale } from '@/interfaces/sale.interface.ts';

const productsStore = useProductStore();
const { deleteOrden } = productsStore
const { ordenProducts } = storeToRefs(productsStore)
const saleType = ref<string>("");
const totalRecibido = ref<number | null>(null);
const cardModalVisible = ref<boolean>(false);

const emit = defineEmits<{
    sale: [sale: Sale]
}>()

const props = defineProps<{
    saleLoading: boolean
}>();

const totalPagar = computed(() => {
    return ordenProducts.value.reduce((acc: number, product: Product) => {
        return acc + (product.isWeight ? (((product.weight ?? 0) / (product.grams ?? 0)) * (product.offer_price ?? product.price)) : (product.cantidad ?? 0) * (product.offer_price ?? product.price))
    }, 0);
})

const vuelto = computed(() => {
    return (totalRecibido.value ?? 0) - totalPagar.value > 0 ? (totalRecibido.value ?? 0) - totalPagar.value : 0
})

function changeSaleType(type: string) {
    saleType.value = type;

    if (saleType.value === 'cash') {
        totalRecibido.value = null;
    }

    if (saleType.value === 'card') {
        cardModalVisible.value = true;
    }
}

function restartOrden() {
    void deleteOrden()
    saleType.value = "";
}

function updateShowModal(event: boolean) {
    cardModalVisible.value = event;
}

function sendSaleOrden() {
    const sale: Sale = {
        products: ordenProducts.value,
        change: Math.round(vuelto.value),
        sale_type: saleType.value,
        total_sale: Math.round(totalPagar.value),
        total_payed: totalRecibido.value ?? 0
    };

    emit('sale', sale)
}

const disabledSaleButton = (): boolean => {
    if (props.saleLoading) {
        return true
    }
    if (ordenProducts.value.length === 0) {
        return true
    }
    if (saleType.value === '') {
        return true
    } else if (saleType.value === 'cash' && vuelto.value === 0) {
        return true
    }

    return false;
}


watch(() => ordenProducts.value.length, (productCount) => {
    if (productCount === 0) {
        saleType.value = "";
        totalRecibido.value = null;
    }
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
            <div class="total-resumen">
                <p class="total px-5">Total a Pagar: <span>{{ formatCurrency(totalPagar) }}</span></p>
                <template v-if="ordenProducts.length > 0">
                    <div class="cash-container" v-if="saleType === 'cash'">
                        <p class="recibido pl-5 pr-4">Total Recibido En Efectivo:
                            <InputNumber v-model="totalRecibido" prefix="$" placeholder="Ingrese Monto Recibido"
                                :input-style="{ width: '225px', 'text-align': 'right', 'font-size': '18px' }" />
                        </p>
                        <p class="vuelto px-5">Vuelto a Entregar: <span>{{ formatCurrency(vuelto) }}</span></p>
                    </div>
                </template>
            </div>
        </div>
        <div class="actions">
            <Button severity="danger" :disabled="ordenProducts.length === 0" @click="restartOrden">
                <Times :size="32" />
                Borrar Orden
            </Button>
            <Button severity="info" :disabled="ordenProducts.length === 0" @click="changeSaleType('card')">
                <CreditCard :size="32" />
                Tarjeta
            </Button>
            <Button :disabled="ordenProducts.length === 0" @click="changeSaleType('cash')">
                <MoneyBill :size="32" />
                Efectivo
            </Button>
        </div>
        <div class="final-action">
            <Button severity="secondary" :disabled="disabledSaleButton()" @click="sendSaleOrden">
                <CartPlus :size="32" v-if="!props.saleLoading" />
                <Spinner spin :size="32" v-else />
                Generar Venta
            </Button>
        </div>
    </div>
    <Dialog v-model:visible="cardModalVisible" modal dismissable-mask :closable="false"
        :style="{ width: '50rem', height: '25rem' }">
        <CardModal :show-modal="cardModalVisible" @update:show-modal="updateShowModal($event)" />
    </Dialog>
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

.total,
.vuelto,
.recibido {
    font-size: large;
    display: flex;
    justify-content: space-between;
    align-items: center;

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
    margin-bottom: 20px;

    .p-button {
        width: 100%;
        font-size: 18px;

        &:last-child {
            background-color: var(--color-principal);
            border: none;
        }
    }
}

.final-action {
    width: 100%;
    height: 40px;

    .p-button {
        width: 100%;
        height: 100%;
        font-size: 18px;
        border: 1px solid var(--color-principal);
    }
}

.cash-container {
    display: flex;
    flex-direction: column;
}
</style>
