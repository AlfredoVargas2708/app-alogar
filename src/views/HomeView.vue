<script setup lang="ts">
import Button from 'primevue/button';
import Card from 'primevue/card';
import { useRouter } from 'vue-router';
import { useProductStore } from '@/stores/productStore';
import { computed, getCurrentInstance, onMounted, ref } from 'vue';
import InputGroup from 'primevue/inputgroup';
import InputGroupAddon from 'primevue/inputgroupaddon';
import FloatLabel from 'primevue/floatlabel';
import AutoComplete from 'primevue/autocomplete';
import Select from 'primevue/select';
import Checkbox from 'primevue/checkbox';
import InputNumber from 'primevue/inputnumber';
import { Dollar, Filter, Search, SignOut } from '@/shared/icons';
import ProductCard from '@/components/ProductCard.vue';

interface AvailableOption {
    label: string;
    value: boolean;
    total: number;
}

const router = useRouter()
const { fetchProducts, cantidadPorDisponibilidad, maximoPrecio, products } = useProductStore();
const nombreBuscador = ref<string>('');
const nombreOptions = ref<[]>([]);
const availableSelected = ref<AvailableOption[]>([]);
const availableOptions = ref<AvailableOption[]>([]);
const minPrice = ref<number | null>(null);
const maxPrice = ref<number | null>(null);
const maxPriceLimit = ref<number>(0);
const maxPricePlaceholder = ref<string>('');
const instance = getCurrentInstance();
const $filters = instance?.appContext.config.globalProperties.$filters;

function logout() {
    localStorage.removeItem('username');
    localStorage.removeItem('password');

    router.push({ path: '/login' });
}

const isItemSelected = (available: AvailableOption) => availableSelected.value.includes(available);

function restartAvailable() {
    availableSelected.value = [];
}

const precioLimite = computed(() => {
    return (maxPrice.value ?? 0) > maxPriceLimit.value
})

onMounted(async () => {
    const disponibleOptions = await cantidadPorDisponibilidad();
    maxPriceLimit.value = await maximoPrecio() ?? 0;
    const maxPrice = $filters.currency(maxPriceLimit.value);

    disponibleOptions?.forEach(option => {
        availableOptions.value.push({
            label: option.available === true ? 'Disponible' : 'Agotado',
            value: option.available,
            total: option.count
        })
    });

    maxPricePlaceholder.value = `Precio Máximo: (${maxPrice})`

    fetchProducts();
});

</script>
<template>
    <Card class="home-card">
        <template #content>
            <div class="main-container">
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
                                            Se superó el precio límite de {{ $filters.currency(maxPriceLimit) }}
                                        </small>
                                    </div>
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
        </template>
    </Card>
</template>

<style scoped>
.home-card {
    width: 100%;
    height: 100%;
    margin: 0px 10px;
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
    grid-template-areas: "nombre nombre disponible precios precios precios";
    align-items: center;
    gap: 20px;
    flex-wrap: wrap;
}

.name-container {
    grid-area: nombre;
}

.available-container {
    grid-area: disponible;
}

.prices-container {
    grid-area: precios;
    gap: 8px;
}

.name-container,
.available-container,
.prices-container {
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
}

.order {
    grid-area: orden;
    border-left: 1px solid var(--color-principal);
    padding-left: 10px;
}
</style>