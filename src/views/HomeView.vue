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

interface AvailableOption {
    label: string;
    value: boolean;
    total: number;
}

const router = useRouter()
const { fetchProducts, cantidadPorDisponibilidad, maximoPrecio } = useProductStore();
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
                        <img src="/public/logo-alogar.avif" alt="" class="home-logo" />
                    </div>
                    <h1 class="m-0 pb-2 font-italic text-5xl">Sistema de Ventas</h1>
                    <Button class="sign-out-button" v-on:click="logout()">
                        <SignOut :size="24" />
                        Cerrar Sesión
                    </Button>
                </div>
                <div class="products">
                    <div class="products-filters">
                        <h3 class="mt-0">Filtrar Productos</h3>
                        <div class="filters">
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
                            <InputGroup>
                                <InputGroupAddon>
                                    <Filter />
                                </InputGroupAddon>
                                <Select placeholder="Disponibilidad del Producto" multiple v-model="availableSelected"
                                    :options="availableOptions" option-label="label" class="w-full">
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
                    </div>
                </div>
                <div class="order"></div>
            </div>
        </template>
    </Card>
</template>

<style scoped>
.home-card {
    width: min(100% - 2rem, 100%);
    height: calc(100dvh - 2rem);
    box-sizing: border-box;
}

.home-card :deep(.p-card-body) {
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    height: 100%;
    box-sizing: border-box;
}

.main-container {
    width: 100%;
    height: 100%;
    display: grid;
    grid-template-areas:
        "cabecera cabecera cabecera cabecera"
        "contenido contenido contenido sidebar";
    column-gap: 10px;
    row-gap: 15px;
}

.header {
    grid-area: cabecera;
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.image-container {
    width: 200px;
    height: 55px;
}

.home-logo {
    width: 100%;
    height: 100%;
    object-fit: contain;
}

.sign-out-button.p-button {
    background-color: rgb(24, 76, 71);
    border: 1px solid #FFFFFF;
    height: 100%;
    width: 200px;
    font-size: 22px;
}

.products {
    grid-area: contenido;
    gap: 20px;
}

.order {
    grid-area: sidebar;
}

.products,
.order {
    display: flex;
    flex-direction: column;
    border: 1px solid rgb(24, 76, 71);
    height: 100%;
    border-radius: 15px;
    padding: 10px 15px;
}

.products-filters {
    display: flex;
    flex-direction: column;
    width: 100%;
}

.filters {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(200px, 550px));
    gap: 10px;
    justify-content: space-between;
}

.prices-container {
    display: flex;
    justify-content: space-between;
    gap: 10px;
    width: 100%;
}

.max-price-error {
    position: absolute;
    top: 100%;
    color: red;
    font-size: 14px;
}
</style>