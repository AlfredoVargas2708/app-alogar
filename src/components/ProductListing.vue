<script setup lang="ts">
import ProgressBar from 'primevue/progressbar';
import Paginator from 'primevue/paginator';
import type { PageState } from 'primevue/paginator';
import ProductCard from '@/components/ProductCard.vue';
import type { Product } from '@/interfaces/products.interface';

defineProps<{
    products: Product[];
    isLoading: boolean;
    total: number;
}>();

defineEmits<{ page: [event: PageState] }>();

const first = defineModel<number>('first', { required: true });
const rows = defineModel<number>('rows', { required: true });
</script>

<template>
    <div class="products-list">
        <h3>Listado de Productos</h3>
        <div class="loading-bar" v-if="isLoading">
            <ProgressBar mode="indeterminate" :show-value="false" class="progress-bar" />
            <span>Cargando productos...</span>
        </div>
        <template v-else>
            <div v-if="products.length > 0" class="list">
                <ProductCard v-for="product in products" :key="product.id" :product="product" />
            </div>
            <div v-else class="empty-state">
                <h4>No se encontraron productos</h4>
                <p>Prueba cambiando o limpiando los filtros de búsqueda.</p>
            </div>
            <div class="flex justify-content-center mt-2 paginator-container">
                <Paginator v-model:first="first" v-model:rows="rows" :totalRecords="total"
                    :rowsPerPageOptions="[12, 24, 36, 48, 60]" @page="$emit('page', $event)"
                    currentPageReportTemplate="Mostrando {first} a {last} de {totalRecords} productos"
                    template="FirstPageLink PrevPageLink CurrentPageReport NextPageLink LastPageLink RowsPerPageDropdown" />
            </div>
        </template>
    </div>
</template>

<style scoped>
.products-list {
    display: flex;
    flex-direction: column;
    width: 100%;
    flex: 1;
    min-height: 0;
}

.products-list>h3 {
    flex-shrink: 0;
}

.paginator-container {
    flex-shrink: 0;
}

.list {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(600px, 1fr));
    grid-auto-rows: min-content;
    align-content: start;
    gap: 15px;
    width: 100%;
    flex: 1;
    min-height: 0;
    overflow-y: auto;
}

.empty-state {
    flex: 1;
    min-height: 180px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 6px;
    padding: 2rem;
    text-align: center;
    color: color-mix(in srgb, var(--color-principal) 70%, white);
}

.empty-state h4,
.empty-state p {
    margin: 0;
}

.empty-state h4 {
    color: var(--color-principal);
    font-size: 18px;
}

.empty-state p {
    font-size: 14px;
}

.loading-bar {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 16px;
    padding: 2.5rem 2rem;
    color: var(--color-principal);
    font-size: 15px;
    font-weight: bold;
    font-style: italic;
}

.progress-bar {
    width: min(100%, 28rem);
    height: 10px;
    overflow: hidden;
}

.progress-bar :deep(.p-progressbar-value) {
    background-color: var(--color-principal);
}

@media (max-width: 640px) {
    .list {
        grid-template-columns: 1fr;
    }
}
</style>
