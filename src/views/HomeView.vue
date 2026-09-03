<script setup lang="ts">
import Card from 'primevue/card';
import { useRouter } from 'vue-router';
import { storeToRefs } from 'pinia';
import { useProductStore } from '@/stores/productStore';
import { onMounted, ref, watch } from 'vue';
import type { PageState } from 'primevue/paginator';
import { formatCurrency } from '@/shared/currency';
import type { AvailableFilterOption } from '@/interfaces/products.interface';
import AppHeader from '@/components/AppHeader.vue';
import ProductFilters from '@/components/ProductFilters.vue';
import ProductListing from '@/components/ProductListing.vue';
import OrderSummary from '@/components/OrderSummary.vue';

const router = useRouter()
const productStore = useProductStore();
const { fetchProducts, cantidadPorDisponibilidad, maximoPrecio, categorias } = productStore;
const { products, isLoading, pagina, total } = storeToRefs(productStore);
const availableSelected = ref<AvailableFilterOption[]>([]);
const availableOptions = ref<AvailableFilterOption[]>([]);
const categoriesOptions = ref<string[]>([]);
const maxPriceLimit = ref<number>(0);
const maxPricePlaceholder = ref<string>('');
const first = ref(0);
const rows = ref(12);

function logout() {
    localStorage.removeItem('username');
    localStorage.removeItem('password');

    router.push({ path: '/login' });
}

function changePage(event: PageState) {
    void fetchProducts(event.page + 1, event.rows);
}

watch(pagina, (currentPage) => {
    first.value = (currentPage - 1) * rows.value;
});

watch(availableSelected, (available) => {
    // Solo se envía el filtro cuando hay una única opción seleccionada (disponible o agotado)
    const disponible = available.length === 1 ? available[0]!.value : undefined;
    void fetchProducts(pagina.value, rows.value, null, disponible)
})

function onProductSelected(name: string) {
    first.value = 0;
    void fetchProducts(1, rows.value, name);
}

function onFiltersClear() {
    void fetchProducts(pagina.value, rows.value);
}

async function loadFilterOptions() {
    const disponibleOptions = await cantidadPorDisponibilidad();
    maxPriceLimit.value = await maximoPrecio() ?? 0;
    categoriesOptions.value = await categorias() ?? [];

    availableOptions.value = [];
    disponibleOptions?.forEach(option => {
        availableOptions.value.push({
            label: option.available === true ? 'Disponible' : 'Agotado',
            value: option.available,
            total: option.count
        })
    });

    maxPricePlaceholder.value = `Precio Máximo: (${formatCurrency(maxPriceLimit.value)})`;
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
                        :categories-options="categoriesOptions" :max-price-limit="maxPriceLimit"
                        :max-price-placeholder="maxPricePlaceholder" @select-product="onProductSelected"
                        @clear="onFiltersClear" />
                    <ProductListing v-model:first="first" v-model:rows="rows" :products="products"
                        :is-loading="isLoading" :total="total" @page="changePage" />
                </div>
                <OrderSummary />
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
