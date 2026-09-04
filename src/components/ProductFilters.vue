<script setup lang="ts">
import { computed, nextTick, onMounted, onUnmounted, ref, watch } from 'vue';
import InputGroup from 'primevue/inputgroup';
import InputGroupAddon from 'primevue/inputgroupaddon';
import FloatLabel from 'primevue/floatlabel';
import AutoComplete from 'primevue/autocomplete';
import Select from 'primevue/select';
import Checkbox from 'primevue/checkbox';
import InputNumber, { type InputNumberInputEvent } from 'primevue/inputnumber';
import type { AutoCompleteOptionSelectEvent } from 'primevue/autocomplete';
import { debounce } from 'lodash-es';
import { Check, Dollar, Filter, Search, Times } from '@/shared/icons';
import { formatCurrency } from '@/shared/currency';
import { useProductStore } from '@/stores/productStore';
import type { AvailableFilterOption } from '@/interfaces/products.interface';
import InputText from 'primevue/inputtext';

const props = defineProps<{
    availableOptions: AvailableFilterOption[];
    categoriesOptions: string[];
    maxPriceLimit: number;
    maxPricePlaceholder: string;
}>();

const emit = defineEmits<{
    'select-product': [name: string];
    'min-price': [precio: number | null];
    'max-price': [precio: number | null];
    categories: [categorias: string[]];
    oferta: [oferta: boolean]
    clear: [];
}>();

const availableSelected = defineModel<AvailableFilterOption[]>('availableSelected', { default: () => [] });

const { buscadorNombres } = useProductStore();

const nombreBuscador = ref<string | null>(null);
const nombreOptions = ref<string[]>([]);
const barcodeSearch = ref<string | null>(null);
const isNameLoading = ref<boolean>(false);
const nameAutoComplete = ref<{ show: () => void } | null>(null);
const categoriesSelected = ref<string[]>([]);
const minPrice = ref<number | null>(null);
const maxPrice = ref<number | null>(null);
const checked = ref(false);
const isIndeterminate = ref(true);
let skipNextNameSearch = false;
let nameSearchRequest = 0;

const isItemSelected = (available: AvailableFilterOption) => availableSelected.value.includes(available);
const isCategorySelected = (category: string) => categoriesSelected.value.includes(category);

const onCheck = () => {
    isIndeterminate.value = false;
    emit('oferta', checked.value)
};

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

watch(categoriesSelected, (categories) => {
    emit('categories', [...categories]);
});

const precioLimite = computed(() => {
    return (maxPrice.value ?? 0) > props.maxPriceLimit
})

const mainInputRef = ref<InstanceType<typeof InputText> | null>(null)

// Función para forzar el foco en el input principal
const keepFocus = () => {
    nextTick(() => {
        // Comprobar si el elemento activo actual es otro input/textarea/select o un componente de PrimeVue
        const activeEl = document.activeElement
        const isAnotherInput = activeEl && (
            activeEl.tagName === 'INPUT' ||
            activeEl.tagName === 'TEXTAREA' ||
            activeEl.tagName === 'SELECT' ||
            activeEl.classList.contains('p-inputtext') ||
            activeEl.closest('.p-component') // Cubre dropdowns, calendar, etc. de PrimeVue
        )

        // Si no se está enfocando otro input válido, regresa el foco al principal
        if (!isAnotherInput && mainInputRef.value) {
            const element = (mainInputRef.value as unknown as { $el: HTMLInputElement }).$el
            element?.focus()
        }
    })
}

const handleFocusOut = () => {
    // Pequeña espera para dar tiempo al navegador de actualizar document.activeElement
    setTimeout(() => {
        keepFocus()
    }, 10)
}

function searchByPrice() {
    emit('min-price', minPrice.value);
    emit('max-price', maxPrice.value);
}

const searchByPriceDebounced = debounce(searchByPrice, 500);

function normalizePrice(value: InputNumberInputEvent['value']): number | null {
    if (value === undefined || value === null || value === '') {
        return null;
    }

    const numericValue = Number(value);
    return Number.isFinite(numericValue) ? numericValue : null;
}

function onMinPriceInput(event: InputNumberInputEvent) {
    minPrice.value = normalizePrice(event.value);
    searchByPriceDebounced();
}

function onMaxPriceInput(event: InputNumberInputEvent) {
    maxPrice.value = normalizePrice(event.value);
    searchByPriceDebounced();
}

onMounted(() => {
    keepFocus()
    window.addEventListener('focusout', handleFocusOut)
})

onUnmounted(() => {
    searchByPriceDebounced.cancel();
    window.removeEventListener('focusout', handleFocusOut)
})
</script>

<template>
    <div class="products-filters">
        <h3 class="mt-0">Filtrar Productos</h3>
        <div class="filters">
            <div class="barcode-container">
                <InputGroup>
                    <InputGroupAddon>
                        <Search />
                    </InputGroupAddon>
                    <FloatLabel>
                        <InputText ref="mainInputRef" v-model="barcodeSearch" :autofocus="true" />
                        <label for="">Buscar Por Código de Barras</label>
                    </FloatLabel>
                </InputGroup>
            </div>
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
                            locale="es-CL" @input="onMinPriceInput">
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
                                locale="es-CL" :invalid="precioLimite" @input="onMaxPriceInput" />
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
            <div class="oferta-container">
                <Checkbox v-model="checked" binary indeterminate inputId="checkbox-indicator" @change="onCheck">
                    <template #icon="{ checked, class: iconClass }">
                        <Check v-if="checked" :class="iconClass" />
                        <Times v-else :class="iconClass" />
                    </template>
                </Checkbox>
                <label for="checkbox-indicator" class="text-medium">En Oferta</label>
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
        "codigo nombre nombre nombre"
        "disponible precios precios precios"
        "categoria categoria categoria oferta";
    align-items: center;
    gap: 20px;
}

.barcode-container {
    grid-area: codigo;
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

.oferta-container {
    grid-area: oferta;
    gap: 10px;
}

.name-container,
.categories-container,
.available-container,
.prices-container,
.oferta-container {
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
