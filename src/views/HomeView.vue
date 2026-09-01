<script setup lang="ts">
import Button from 'primevue/button';
import Card from 'primevue/card';
import { useRouter } from 'vue-router';
import { storeToRefs } from 'pinia';
import { useProductStore } from '@/stores/productStore';
import { computed, onMounted, ref } from 'vue';
import InputGroup from 'primevue/inputgroup';
import InputGroupAddon from 'primevue/inputgroupaddon';
import FloatLabel from 'primevue/floatlabel';
import AutoComplete from 'primevue/autocomplete';
import Select from 'primevue/select';
import Checkbox from 'primevue/checkbox';
import InputNumber from 'primevue/inputnumber';
import ProgressBar from 'primevue/progressbar';
import { Dollar, Filter, Search, SignOut } from '@/shared/icons';
import ProductCard from '@/components/ProductCard.vue';

interface AvailableOption {
    label: string;
    value: boolean;
    total: number;
}

const router = useRouter()
const productStore = useProductStore();
const { fetchProducts, cantidadPorDisponibilidad, maximoPrecio, categorias } = productStore;
const { products, isLoading } = storeToRefs(productStore);
const nombreBuscador = ref<string>('');
const nombreOptions = ref<[]>([]);
const availableSelected = ref<AvailableOption[]>([]);
const availableOptions = ref<AvailableOption[]>([]);
const categoriesSelected = ref<string[]>([]);
const categoriesOptions = ref<string[]>([]);
const minPrice = ref<number | null>(null);
const maxPrice = ref<number | null>(null);
const maxPriceLimit = ref<number>(0);
const maxPricePlaceholder = ref<string>('');

function logout() {
    localStorage.removeItem('username');
    localStorage.removeItem('password');

    router.push({ path: '/login' });
}

const isItemSelected = (available: AvailableOption) => availableSelected.value.includes(available);
const isCategorySelected = (category: string) => categoriesSelected.value.includes(category);

function restartAvailable() {
    availableSelected.value = [];
}

function restartCategories() {
    categoriesSelected.value = [];
}

const allSelected = computed(() => categoriesSelected.value.length === categoriesOptions.value.length);
const indeterminate = computed(() => categoriesSelected.value.length > 0 && !allSelected.value);

const onToggleAll = (checked: unknown) => {
    categoriesSelected.value = checked ? categoriesOptions.value.map((c) => c) : [];
};

const precioLimite = computed(() => {
    return (maxPrice.value ?? 0) > maxPriceLimit.value
})

function formatCurrency(value: number) {
    return new Intl.NumberFormat('es-CL', {
        style: 'currency',
        currency: 'CLP',
        maximumFractionDigits: 0,
    }).format(value);
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
    void fetchProducts();
    void loadFilterOptions();
});

</script>
<template>
    <Card class="home-card">
        <template #content>
            <div class="main-container" v-if="!isLoading">
                <div class="header">
                    <div class="image-container">
                        <img src="/logo-alogar.avif" alt="logo Alogar" />
                    </div>
                    <h1 class="title m-0 pb-2 font-italic text-5xl">Sistema de Ventas</h1>
                    <div class="button-container">
                        <Button class="sign-out-button" v-on:click="logout()">
                            <SignOut :size="24" />
                            Cerrar Sesión
                        </Button>
                    </div>
                </div>
                <div class="products">
                    <div class="products-filters">
                        <h3 class="mt-0">Filtrar Productos</h3>
                        <div class="filters">
                            <div class="name-container">
                                <InputGroup>
                                    <InputGroupAddon>
                                        <Search />
                                    </InputGroupAddon>
                                    <FloatLabel>
                                        <AutoComplete v-model="nombreBuscador" :suggestions="nombreOptions"
                                            option-label="title" />
                                        <label for="">Buscar Por Nombre Producto</label>
                                    </FloatLabel>
                                </InputGroup>
                            </div>
                            <div class="available-container">
                                <InputGroup>
                                    <InputGroupAddon>
                                        <Filter />
                                    </InputGroupAddon>
                                    <Select placeholder="Disponibilidad del Producto" multiple
                                        v-model="availableSelected" :options="availableOptions" option-label="label"
                                        class="w-full">
                                        <template #option="slotProps">
                                            <div class="flex flex-row gap-1">
                                                <div class="flex items-center gap-2">
                                                    <Checkbox :modelValue="isItemSelected(slotProps.option)" binary
                                                        :tabindex="-1" readonly />
                                                    <span>{{ slotProps.option.label }}</span>
                                                </div>
                                                <span>({{ slotProps.option.total }})</span>

                                            </div>
                                        </template>
                                        <template #header>
                                            <div class="flex flex-row align-items-center justify-content-between p-2">
                                                <div class="flex flex-row align-items-center gap-2">
                                                    <span class="text-sm">{{ availableSelected.length }}
                                                        seleccionados</span>
                                                </div>
                                                <span class="text-sm underline cursor-pointer"
                                                    v-on:click="restartAvailable()">Reestablecer</span>
                                            </div>
                                        </template>
                                    </Select>
                                </InputGroup>
                            </div>
                            <div class="prices-container">
                                <InputGroup>
                                    <InputGroupAddon>
                                        <Dollar />
                                    </InputGroupAddon>
                                    <FloatLabel>
                                        <InputNumber input-id="min-price" v-model="minPrice" mode="currency"
                                            currency="CLP" locale="es-CL">
                                        </InputNumber>
                                        <label for="min-price">Precio Mínimo:</label>
                                    </FloatLabel>
                                </InputGroup>
                                <InputGroup>
                                    <InputGroupAddon>
                                        <Dollar />
                                    </InputGroupAddon>
                                    <div class="flex flex-column w-full relative">
                                        <FloatLabel>
                                            <InputNumber input-id="max-price" mode="currency" v-model="maxPrice"
                                                currency="CLP" locale="es-CL" :invalid="precioLimite" />
                                            <!-- Se corrigió "max-prie" a "max-price" -->
                                            <label for="max-price">{{ maxPricePlaceholder }}</label>
                                        </FloatLabel>

                                        <!-- El mensaje de error ahora vive fuera del FloatLabel -->
                                        <small class="max-price-error" v-if="precioLimite">
                                            Se superó el precio límite de {{ formatCurrency(maxPriceLimit) }}
                                        </small>
                                    </div>
                                </InputGroup>
                            </div>
                            <div class="categories-container">
                                <InputGroup>
                                    <InputGroupAddon>
                                        <Filter />
                                    </InputGroupAddon>
                                    <Select placeholder="Categorias de Productos" multiple v-model="categoriesSelected"
                                        :options="categoriesOptions" class="w-full capitalize">
                                        <template #option="slotProps">
                                            <div class="flex flex-row gap-1">
                                                <div class="flex items-center gap-2">
                                                    <Checkbox :modelValue="isCategorySelected(slotProps.option)" binary
                                                        :tabindex="-1" readonly />
                                                    <span class="capitalize">{{ slotProps.option }}</span>
                                                </div>
                                            </div>
                                        </template>
                                        <template #header>
                                            <div class="flex flex-row align-items-center justify-content-between p-2">
                                                <div class="flex flex-row align-items-center gap-2">
                                                    <Checkbox :modelValue="allSelected" binary
                                                        :indeterminate="indeterminate" @update:modelValue="onToggleAll"
                                                        label="Select All" class="ml-1.5" />
                                                    <span class="text-sm">{{ categoriesSelected.length }}
                                                        seleccionados</span>
                                                </div>
                                                <span class="text-sm underline cursor-pointer"
                                                    v-on:click="restartCategories()">Reestablecer</span>
                                            </div>
                                        </template>
                                        <template #value="slotProps">
                                            <div v-if="slotProps.value.length" class="selected-categories">
                                                <span v-for="category in slotProps.value" :key="category"
                                                    class="selected-category">
                                                    {{ category }}
                                                </span>
                                            </div>
                                            <span v-else>{{ slotProps.placeholder }}</span>
                                        </template>
                                    </Select>
                                </InputGroup>
                            </div>
                        </div>
                    </div>
                    <div class="products-list">
                        <h3>Listado de Productos</h3>
                        <div class="list">
                            <ProductCard v-for="product in products" :key="product.id" :product="product" />
                        </div>
                    </div>
                </div>
                <div class="order">
                    <h3 class="mt-0 px-5 py-2">Resumen Orden</h3>
                </div>
            </div>
            <div class="loading-bar" v-else>
                <img src="/logo-alogar.avif" alt="logo Alogar" class="loading-logo" />
                <ProgressBar mode="indeterminate" :show-value="false" class="progress-bar" />
                <span>Cargando productos...</span>
            </div>
        </template>
    </Card>
</template>

<style scoped>
.home-card {
    width: 100%;
    height: 100%;
    margin: 10px;
    padding: 10px 15px;
}

.main-container {
    display: grid;
    grid-template-areas:
        "header header header"
        "productos productos orden";
}

.header {
    grid-area: header;
    display: grid;
    grid-template-areas: "logo titulo titulo titulo titulo boton";
    padding-bottom: 10px;
    align-items: center;
}

.image-container {
    grid-area: logo;
    display: flex;
    justify-content: start;
    align-items: center;
}

.title {
    grid-area: titulo;
    text-align: center;
}

.button-container {
    grid-area: boton;
    display: flex;
    justify-content: end;
    align-items: center;
    height: 100%;

    .p-button {
        width: 150px;
        height: 50px;
        background-color: var(--color-principal);
        border: none;

        &:hover {
            background-color: #FFFFFF;
            border: 1px solid var(--color-principal);
            color: var(--color-principal);
        }
    }
}

.products {
    grid-area: productos;
    display: flex;
    flex-direction: column;
    width: 100%;
    height: 100%;
    padding-right: 10px;
}

.products-filters {
    display: flex;
    flex-direction: column;
    width: 100%;
    height: 100%;
}

.filters {
    display: grid;
    grid-template-columns: minmax(0, 1fr) minmax(0, 1fr) minmax(0, 2fr);
    grid-template-areas:
        "nombre disponible precios"
        "categoria categoria categoria";
    align-items: center;
    gap: 20px;
    flex-wrap: wrap;
}

.name-container {
    grid-area: nombre;
}

.categories-container {
    grid-area: categoria;
}

.available-container {
    grid-area: disponible;
}

.prices-container {
    grid-area: precios;
    gap: 8px;
}

.name-container,
.categories-container,
.available-container,
.prices-container {
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
}

.selected-categories {
    display: flex;
    flex-wrap: wrap;
    gap: 0.25rem;
    max-width: 100%;
}

.selected-category {
    padding: 0.125rem 0.375rem;
    border-radius: 4px;
    background-color: color-mix(in srgb, var(--color-principal) 12%, transparent);
    color: var(--color-principal);
    line-height: 1.25;
}

.products-list {
    display: flex;
    flex-direction: column;
    width: 100%;
    height: 100%;
    flex: 1;
}

.list {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(550px, 1fr));
    gap: 15px;
    width: 100%;
    flex: 1;
    height: 100px;
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

.loading-logo {
    width: 200px;
    height: 50px;
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

.order {
    grid-area: orden;
    border-left: 1px dotted var(--color-principal);
    padding-left: 10px;
}
</style>