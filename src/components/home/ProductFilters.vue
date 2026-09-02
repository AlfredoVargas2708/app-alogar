<script setup lang="ts">
import { computed, nextTick, ref, watch } from 'vue';
import InputGroup from 'primevue/inputgroup';
import InputGroupAddon from 'primevue/inputgroupaddon';
import FloatLabel from 'primevue/floatlabel';
import AutoComplete from 'primevue/autocomplete';
import Select from 'primevue/select';
import Checkbox from 'primevue/checkbox';
import InputNumber from 'primevue/inputnumber';
import type { AutoCompleteOptionSelectEvent } from 'primevue/autocomplete';
import { debounce } from 'lodash-es';
import { Dollar, Filter, Search } from '@/shared/icons';
import { formatCurrency } from '@/shared/currency';
import { useProductStore } from '@/stores/productStore';
import type { AvailableFilterOption } from '@/interfaces/products.interface';

const props = defineProps<{
    availableOptions: AvailableFilterOption[];
    categoriesOptions: string[];
    maxPriceLimit: number;
    maxPricePlaceholder: string;
}>();

const emit = defineEmits<{
    'select-product': [name: string];
    clear: [];
}>();

const availableSelected = defineModel<AvailableFilterOption[]>('availableSelected', { default: () => [] });

const { buscadorNombres } = useProductStore();

const nombreBuscador = ref<string | null>(null);
const nombreOptions = ref<string[]>([]);
const isNameLoading = ref<boolean>(false);
const nameAutoComplete = ref<{ show: () => void } | null>(null);
const categoriesSelected = ref<string[]>([]);
const minPrice = ref<number | null>(null);
const maxPrice = ref<number | null>(null);
let skipNextNameSearch = false;
let nameSearchRequest = 0;

const isItemSelected = (available: AvailableFilterOption) => availableSelected.value.includes(available);
const isCategorySelected = (category: string) => categoriesSelected.value.includes(category);

function restartAvailable() {
    availableSelected.value = [];
}

function restartCategories() {
    categoriesSelected.value = [];
}

const searchProductNames = debounce(async (newQuery: string | null) => {
    if (skipNextNameSearch) {
        skipNextNameSearch = false;
        return;
    }

    const request = ++nameSearchRequest;
    if (!newQuery || !newQuery.trim()) {
        nombreOptions.value = [];
        isNameLoading.value = false;
        emit('clear');
        return;
    }

    isNameLoading.value = true;
    try {
        const names = await buscadorNombres(newQuery.trim()) ?? [];
        if (request !== nameSearchRequest) {
            return;
        }

        nombreOptions.value = names;
        await nextTick();

        if (names.length > 0) {
            nameAutoComplete.value?.show();
        }
    } catch (error) {
        console.error('Error en la busqueda', error);
    } finally {
        if (request === nameSearchRequest) {
            isNameLoading.value = false;
        }
    }
}, 300);

watch(nombreBuscador, searchProductNames);

function onClearBuscador() {
    nombreOptions.value = [];
    emit('clear');
}

function onSelectProduct(event: AutoCompleteOptionSelectEvent) {
    skipNextNameSearch = true;
    nameSearchRequest++;
    searchProductNames.cancel();
    nombreOptions.value = [];
    isNameLoading.value = false;
    emit('select-product', event.value);
}

const allSelected = computed(() => categoriesSelected.value.length === props.categoriesOptions.length);
const indeterminate = computed(() => categoriesSelected.value.length > 0 && !allSelected.value);

const onToggleAll = (checked: unknown) => {
    categoriesSelected.value = checked ? props.categoriesOptions.map((c) => c) : [];
};

const precioLimite = computed(() => {
    return (maxPrice.value ?? 0) > props.maxPriceLimit
})
</script>

<template>
    <div class="products-filters">
        <h3 class="mt-0">Filtrar Productos</h3>
        <div class="filters">
            <div class="name-container">
                <InputGroup>
                    <InputGroupAddon>
                        <Search />
                    </InputGroupAddon>
                    <FloatLabel>
                        <AutoComplete ref="nameAutoComplete" v-model="nombreBuscador" :suggestions="nombreOptions"
                            :loading="isNameLoading" :show-empty-message="false" @option-select="onSelectProduct"
                            :show-clear="true" @clear="onClearBuscador" />
                        <label for="">Buscar Por Nombre Producto</label>
                    </FloatLabel>
                </InputGroup>
            </div>
            <div class="available-container">
                <InputGroup>
                    <InputGroupAddon>
                        <Filter />
                    </InputGroupAddon>
                    <Select placeholder="Disponibilidad del Producto" multiple v-model="availableSelected"
                        :options="availableOptions" option-label="label" class="w-full">
                        <template #option="slotProps">
                            <div class="flex flex-row gap-1">
                                <div class="flex items-center gap-2">
                                    <Checkbox :modelValue="isItemSelected(slotProps.option)" binary :tabindex="-1"
                                        readonly />
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
                        <InputNumber input-id="min-price" v-model="minPrice" mode="currency" currency="CLP"
                            locale="es-CL">
                        </InputNumber>
                        <label for="min-price">Precio Mínimo:</label>
                    </FloatLabel>
                </InputGroup>
                <div class="max-price-container">
                    <InputGroup>
                        <InputGroupAddon>
                            <Dollar />
                        </InputGroupAddon>
                        <FloatLabel>
                            <InputNumber input-id="max-price" mode="currency" v-model="maxPrice" currency="CLP"
                                locale="es-CL" :invalid="precioLimite" />
                            <label for="max-price">{{ maxPricePlaceholder }}</label>
                        </FloatLabel>
                    </InputGroup>
                    <small class="max-price-error" v-if="precioLimite">
                        Se superó el precio límite de {{ formatCurrency(maxPriceLimit) }}
                    </small>
                </div>
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
                                    <Checkbox :modelValue="isCategorySelected(slotProps.option)" binary :tabindex="-1"
                                        readonly />
                                    <span class="capitalize">{{ slotProps.option }}</span>
                                </div>
                            </div>
                        </template>
                        <template #header>
                            <div class="flex flex-row align-items-center justify-content-between p-2">
                                <div class="flex flex-row align-items-center gap-2">
                                    <Checkbox :modelValue="allSelected" binary :indeterminate="indeterminate"
                                        @update:modelValue="onToggleAll" label="Select All" class="ml-1.5" />
                                    <span class="text-sm">{{ categoriesSelected.length }}
                                        seleccionados</span>
                                </div>
                                <span class="text-sm underline cursor-pointer"
                                    v-on:click="restartCategories()">Reestablecer</span>
                            </div>
                        </template>
                        <template #value="slotProps">
                            <div v-if="slotProps.value.length" class="selected-categories">
                                <span v-for="category in slotProps.value" :key="category" class="selected-category">
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
</template>

<style scoped>
.products-filters {
    display: flex;
    flex-direction: column;
    width: 100%;
    flex-shrink: 0;
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

.max-price-container {
    position: relative;
    width: 100%;
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
</style>
