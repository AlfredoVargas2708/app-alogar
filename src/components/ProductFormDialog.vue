<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import Dialog from 'primevue/dialog';
import Button from 'primevue/button';
import InputText from 'primevue/inputtext';
import InputNumber from 'primevue/inputnumber';
import FloatLabel from 'primevue/floatlabel';
import ToggleSwitch from 'primevue/toggleswitch';
import type { Product, ProductPayload } from '@/interfaces/products.interface';
import { getImageSrc } from '@/services/api';
import { Check, Times, Upload } from '@/shared/icons';

const props = defineProps<{
    product: Product | null;
    saving: boolean;
}>();

const emit = defineEmits<{
    save: [{ id: number | null; payload: ProductPayload }];
}>();

const visible = defineModel<boolean>('visible', { required: true });

const title = ref<string>('');
const price = ref<number | null>(null);
const offerPrice = ref<number | null>(null);
const grams = ref<number | null>(null);
const imageUrl = ref<string>('');
const imageFile = ref<File | null>(null);
const imagePreview = ref<string>('');
const fileInputRef = ref<HTMLInputElement | null>(null);
const categoriasText = ref<string>('');
const barcode = ref<string>('');
const available = ref<boolean>(true);

const isEditing = computed(() => props.product !== null);

const isValid = computed(() => title.value.trim().length > 0 && (price.value ?? 0) > 0);

function onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0] ?? null;

    imageFile.value = file;
    if (file) {
        imagePreview.value = URL.createObjectURL(file);
    }
}

function removeSelectedFile() {
    imageFile.value = null;
    imagePreview.value = imageUrl.value.trim() ? getImageSrc(imageUrl.value.trim()) : '';
    if (fileInputRef.value) {
        fileInputRef.value.value = '';
    }
}

watch(imageUrl, (url) => {
    // La URL solo genera vista previa si no hay un archivo seleccionado
    if (!imageFile.value) {
        imagePreview.value = url.trim() ? getImageSrc(url.trim()) : '';
    }
});

watch(visible, (isVisible) => {
    if (!isVisible) {
        return;
    }

    title.value = props.product?.title ?? '';
    price.value = props.product?.price ?? null;
    offerPrice.value = props.product?.offer_price ?? null;
    grams.value = props.product?.grams ?? null;
    imageUrl.value = props.product?.imageUrl ?? '';
    imageFile.value = null;
    imagePreview.value = props.product?.imageUrl ? getImageSrc(props.product.imageUrl) : '';
    categoriasText.value = props.product?.productType?.join(', ') ?? '';
    barcode.value = props.product?.barcode ?? '';
    available.value = props.product?.available ?? true;
});

function onSave() {
    if (!isValid.value) {
        return;
    }

    const categorias = categoriasText.value
        .split(',')
        .map((categoria) => categoria.trim().toUpperCase())
        .filter(Boolean);

    const payload: ProductPayload = {
        title: title.value.trim(),
        price: price.value,
        offer_price: offerPrice.value ?? null,
        available: available.value,
        imageUrl: imageUrl.value.trim() || null,
        productType: categorias.length > 0 ? categorias.join(',') : null,
        grams: grams.value ?? null,
        barcode: barcode.value.trim() || null,
        imageFile: imageFile.value,
    };

    emit('save', { id: props.product?.id ?? null, payload });
}

function onCancel() {
    visible.value = false;
}
</script>

<template>
    <Dialog v-model:visible="visible" modal :header="isEditing ? 'Editar Producto' : 'Nuevo Producto'"
        :style="{ width: '34rem' }" :closable="!saving">
        <div class="product-form">
            <div class="form-row full">
                <FloatLabel>
                    <InputText id="product-title" v-model="title" class="w-full" :invalid="title.trim() === ''" />
                    <label for="product-title">Título del Producto *</label>
                </FloatLabel>
            </div>
            <div class="form-row">
                <FloatLabel>
                    <InputNumber id="product-price" v-model="price" mode="currency" currency="CLP" locale="es-CL"
                        class="w-full" :invalid="(price ?? 0) <= 0" />
                    <label for="product-price">Precio *</label>
                </FloatLabel>
                <FloatLabel>
                    <InputNumber id="product-offer" v-model="offerPrice" mode="currency" currency="CLP" locale="es-CL"
                        class="w-full" />
                    <label for="product-offer">Precio Oferta</label>
                </FloatLabel>
            </div>
            <div class="form-row">
                <FloatLabel>
                    <InputNumber id="product-grams" v-model="grams" suffix=" gr" class="w-full" />
                    <label for="product-grams">Gramos (productos pesables)</label>
                </FloatLabel>
                <FloatLabel>
                    <InputText id="product-barcode" v-model="barcode" class="w-full" />
                    <label for="product-barcode">Código de Barras</label>
                </FloatLabel>
            </div>
            <div class="form-row full">
                <div class="available-toggle">
                    <ToggleSwitch v-model="available" input-id="product-available" />
                    <label for="product-available">Disponible para la venta</label>
                </div>
            </div>
            <div class="form-row full">
                <FloatLabel>
                    <InputText id="product-categories" v-model="categoriasText" class="w-full" />
                    <label for="product-categories">Categorías (separadas por coma)</label>
                </FloatLabel>
            </div>
            <div class="form-row full">
                <span class="image-label">Imagen del Producto</span>
                <div class="image-source">
                    <input ref="fileInputRef" type="file" accept="image/png,image/jpeg,image/gif,image/webp,image/avif"
                        class="file-input" @change="onFileSelected" />
                    <Button type="button" class="upload-button" :disabled="saving"
                        @click="fileInputRef?.click()">
                        <Upload :size="16" />
                        {{ imageFile ? 'Cambiar archivo' : 'Subir imagen' }}
                    </Button>
                    <span v-if="imageFile" class="file-name">
                        {{ imageFile.name }}
                        <Button type="button" text rounded severity="danger" aria-label="Quitar archivo"
                            :disabled="saving" @click="removeSelectedFile">
                            <Times :size="14" />
                        </Button>
                    </span>
                </div>
                <FloatLabel v-if="!imageFile">
                    <InputText id="product-image" v-model="imageUrl" class="w-full" />
                    <label for="product-image">O pega la URL de la Imagen</label>
                </FloatLabel>
                <img v-if="imagePreview" :src="imagePreview" alt="Vista previa" class="image-preview"
                    @error="($event.target as HTMLImageElement).style.display = 'none'"
                    @load="($event.target as HTMLImageElement).style.display = 'block'" />
            </div>
        </div>
        <template #footer>
            <div class="dialog-actions">
                <Button severity="danger" :disabled="saving" @click="onCancel">
                    <Times :size="18" />
                    Cancelar
                </Button>
                <Button class="save-button" :disabled="!isValid || saving" :loading="saving" @click="onSave">
                    <Check :size="18" v-if="!saving" />
                    {{ isEditing ? 'Guardar Cambios' : 'Crear Producto' }}
                </Button>
            </div>
        </template>
    </Dialog>
</template>

<style scoped>
.product-form {
    display: flex;
    flex-direction: column;
    gap: 22px;
    padding-top: 10px;
}

.form-row {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 15px;
    align-items: center;
}

.form-row.full {
    grid-template-columns: 1fr;
}

.available-toggle {
    display: flex;
    align-items: center;
    gap: 10px;
}

.image-label {
    font-size: 13px;
    font-weight: 600;
    color: var(--color-principal);
}

.image-source {
    display: flex;
    align-items: center;
    gap: 12px;
    flex-wrap: wrap;
}

.file-input {
    display: none;
}

.upload-button {
    background-color: transparent;
    border: 1px solid var(--color-principal);
    color: var(--color-principal);

    &:hover {
        background-color: color-mix(in srgb, var(--color-principal) 10%, white);
    }
}

.file-name {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    font-size: 13px;
    color: var(--color-principal);
    background-color: color-mix(in srgb, var(--color-principal) 8%, white);
    padding: 4px 8px;
    border-radius: 8px;
    max-width: 260px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}

.image-preview {
    display: none;
    width: 100%;
    max-height: 140px;
    object-fit: contain;
    border-radius: 8px;
    border: 1px solid color-mix(in srgb, var(--color-principal) 18%, white);
}

.dialog-actions {
    display: flex;
    justify-content: flex-end;
    gap: 12px;
}

.save-button {
    background-color: var(--color-principal);
    border: none;
}
</style>
