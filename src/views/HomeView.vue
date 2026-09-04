<script setup lang="ts">
import Card from 'primevue/card';
import { useRouter } from 'vue-router';
import { storeToRefs } from 'pinia';
import { useProductStore } from '@/stores/productStore';
import { onMounted, ref, watch } from 'vue';
import type { PageState } from 'primevue/paginator';
import type { AvailableFilterOption } from '@/interfaces/products.interface';
import AppHeader from '@/components/AppHeader.vue';
import ProductFilters from '@/components/ProductFilters.vue';
import ProductListing from '@/components/ProductListing.vue';
import OrderSummary from '@/components/OrderSummary.vue';
import type { Sale } from '@/interfaces/sale.interface';
import { useSaleStore } from '@/stores/saleStore';

const router = useRouter()
const productStore = useProductStore();
const saleStore = useSaleStore();
const { fetchProducts, categorias } = productStore;
const { createSale } = saleStore
const { products, isLoading, pagina, total } = storeToRefs(productStore);
const { isLoadingSale } = storeToRefs(saleStore);
const availableSelected = ref<AvailableFilterOption>({ label: 'Todos', value: null });
const availableOptions = ref<AvailableFilterOption[]>([
    { label: 'Todos', value: null },
    { label: 'Disponible', value: true },
    { label: 'Agotado', value: false }
]);
const categoriesOptions = ref<string[]>([]);
const minPrice = ref<number | null>(null);
const maxPrice = ref<number | null>(null);
const categoriesSelected = ref<string[]>([]);
const first = ref(0);
const rows = ref(12);
const ofertaValue = ref<boolean>(false);

function logout() {
    localStorage.removeItem('username');
    localStorage.removeItem('password');

    router.push({ path: '/login' });
}

function changePage(event: PageState) {
    void fetchProducts(event.page + 1, event.rows, null, null, minPrice.value, maxPrice.value, categoriesSelected.value, ofertaValue.value);
}

watch(pagina, (currentPage) => {
    first.value = (currentPage - 1) * rows.value;
});

watch(availableSelected, (available) => {
    // Solo se envía el filtro cuando hay una única opción seleccionada (disponible o agotado)
    const disponible = available.value;
    void fetchProducts(pagina.value, rows.value, null, disponible, minPrice.value, maxPrice.value, categoriesSelected.value, ofertaValue.value)
})

function onProductSelected(name: string) {
    first.value = 0;
    void fetchProducts(1, rows.value, name, null, minPrice.value, maxPrice.value, categoriesSelected.value, ofertaValue.value);
}

function onMinPriceChange(value: number | null) {
    minPrice.value = value;
    first.value = 0;
    void fetchProducts(1, rows.value, null, null, value, maxPrice.value, categoriesSelected.value, ofertaValue.value);
}

function onMaxPriceChange(value: number | null) {
    maxPrice.value = value;
    first.value = 0;
    void fetchProducts(1, rows.value, null, null, minPrice.value, value, categoriesSelected.value, ofertaValue.value);
}

function onCategoriesChange(categories: string[]) {
    categoriesSelected.value = categories;
    first.value = 0;
    void fetchProducts(1, rows.value, null, null, minPrice.value, maxPrice.value, categories, ofertaValue.value);
}

function onFiltersClear() {
    minPrice.value = null;
    maxPrice.value = null;
    categoriesSelected.value = [];
    void fetchProducts(1, rows.value);
}

function onOfertaChange(oferta: boolean) {
    ofertaValue.value = oferta;
    first.value = 0;
    void fetchProducts(1, rows.value, null, null, minPrice.value, maxPrice.value, null, oferta);
}

function onSale(sale: Sale) {
    void createSale(sale);
}

async function loadFilterOptions() {
    categoriesOptions.value = await categorias() ?? [];
}

onMounted(() => {
    void fetchProducts(first.value + 1, rows.value);
    void loadFilterOptions();
});

</script>
<template>
    <Card class="home-card">
        <template #content>
            <div class="main-container">
                <AppHeader @logout="logout" />
                <div class="products">
                    <ProductFilters v-model:available-selected="availableSelected" :available-options="availableOptions"
                        :categories-options="categoriesOptions" @select-product="onProductSelected"
                        @min-price="onMinPriceChange" @max-price="onMaxPriceChange" @categories="onCategoriesChange"
                        @clear="onFiltersClear" @oferta="onOfertaChange" />
                    <ProductListing v-model:first="first" v-model:rows="rows" :products="products"
                        :is-loading="isLoading" :total="total" @page="changePage" />
                </div>
                <OrderSummary @sale="onSale" :sale-loading="isLoadingSale" />
            </div>
        </template>
    </Card>
</template>

<style scoped>
.home-card {
    width: 100%;
    height: calc(100dvh - 20px);
    margin: 10px;
    padding: 10px 15px;
    overflow: hidden;
}

.home-card :deep(.p-card-body) {
    height: 100%;
    display: flex;
    flex-direction: column;
    min-height: 0;
}

.home-card :deep(.p-card-content) {
    flex: 1;
    min-height: 0;
}

.main-container {
    display: grid;
    grid-template-areas:
        "header header"
        "productos orden";
    grid-template-columns: 1fr 600px;
    grid-template-rows: auto 1fr;
    height: 100%;
    min-height: 0;
}

.products {
    grid-area: productos;
    display: flex;
    flex-direction: column;
    width: 100%;
    height: 100%;
    min-height: 0;
    min-width: 0;
    padding-right: 10px;
}
</style>
