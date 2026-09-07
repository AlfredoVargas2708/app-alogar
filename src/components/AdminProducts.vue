<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { storeToRefs } from 'pinia'
import axios from 'axios'
import { debounce } from 'lodash-es'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import Button from 'primevue/button'
import ToggleSwitch from 'primevue/toggleswitch'
import Tag from 'primevue/tag'
import InputText from 'primevue/inputtext'
import IconField from 'primevue/iconfield'
import InputIcon from 'primevue/inputicon'
import { useToast } from 'primevue/usetoast'
import { useConfirm } from 'primevue/useconfirm'
import type { PageState } from 'primevue/paginator'
import { useProductStore } from '@/stores/productStore'
import { formatCurrency } from '@/shared/currency'
import { Pencil, Plus, Search, Trash, Times } from '@/shared/icons'
import { getImageSrc } from '@/services/api'
import type { Product, ProductPayload } from '@/interfaces/products.interface'
import ProductFormDialog from './ProductFormDialog.vue'

const productStore = useProductStore()
const { fetchAdminProducts, createProduct, updateProduct, deleteProduct } = productStore
const { adminProducts, adminTotal, adminLoading } = storeToRefs(productStore)

const toast = useToast()
const confirm = useConfirm()

const first = ref(0)
const rows = ref(10)
const busqueda = ref<string>('')
const sortField = ref<string | null>(null)
const sortOrder = ref<1 | -1 | 0>(0)
const dialogVisible = ref(false)
const editingProduct = ref<Product | null>(null)
const saving = ref(false)
const togglingId = ref<number | null>(null)

// Indica si hay un orden distinto al inicial activo
const hasActiveSort = computed(() => sortField.value !== null && sortOrder.value !== 0)

function apiError(err: unknown, fallback: string): string {
  return axios.isAxiosError<{ message?: string }>(err)
    ? (err.response?.data?.message ?? fallback)
    : fallback
}

function loadProducts(page: number) {
  void fetchAdminProducts(
    page,
    rows.value,
    busqueda.value || null,
    sortField.value,
    sortOrder.value === 1 ? 'ASC' : sortOrder.value === -1 ? 'DESC' : null,
  )
}

function onPage(event: PageState) {
  first.value = event.first
  rows.value = event.rows
  loadProducts(event.page + 1)
}

// En modo lazy el DataTable no ordena por sí mismo:
// se captura el evento y se vuelve a pedir la página 1 ordenada al backend.
// El tercer clic (sortOrder = 0) vuelve al estado inicial.
function onSort(event: { sortField?: unknown; sortOrder?: 1 | -1 | 0 | null }) {
  const newSortOrder = event.sortOrder === 1 || event.sortOrder === -1 ? event.sortOrder : 0
  // Si el orden se neutraliza, también se limpia la columna para volver al orden por id
  sortField.value =
    newSortOrder === 0 ? null : typeof event.sortField === 'string' ? event.sortField : null
  sortOrder.value = newSortOrder
  first.value = 0
  loadProducts(1)
}

// Restablece explícitamente el orden inicial (id ascendente)
function resetSort() {
  sortField.value = null
  sortOrder.value = 0
  first.value = 0
  loadProducts(1)
}

const onSearch = debounce(() => {
  first.value = 0
  loadProducts(1)
}, 400)

function openCreate() {
  editingProduct.value = null
  dialogVisible.value = true
}

function openEdit(product: Product) {
  editingProduct.value = product
  dialogVisible.value = true
}

async function onSave({ id, payload }: { id: number | null; payload: ProductPayload }) {
  saving.value = true
  try {
    if (id !== null) {
      await updateProduct(id, payload)
      toast.add({
        severity: 'success',
        summary: 'Producto Actualizado',
        detail: 'Los cambios se guardaron correctamente.',
        life: 4000,
      })
    } else {
      await createProduct(payload)
      toast.add({
        severity: 'success',
        summary: 'Producto Creado',
        detail: 'El producto se creó correctamente.',
        life: 4000,
      })
    }
    dialogVisible.value = false
    loadProducts(Math.floor(first.value / rows.value) + 1)
  } catch (err: unknown) {
    toast.add({
      severity: 'error',
      summary: 'Error al Guardar',
      detail: apiError(err, 'No se pudo guardar el producto.'),
      life: 5000,
    })
  } finally {
    saving.value = false
  }
}

function onDelete(product: Product) {
  confirm.require({
    message: `¿Eliminar "${product.title}"? Esta acción no se puede deshacer.`,
    header: 'Eliminar Producto',
    icon: 'pi pi-exclamation-triangle',
    acceptLabel: 'Eliminar',
    rejectLabel: 'Cancelar',
    acceptClass: 'p-button-danger',
    accept: async () => {
      try {
        await deleteProduct(product.id)
        toast.add({
          severity: 'success',
          summary: 'Producto Eliminado',
          detail: `"${product.title}" fue eliminado.`,
          life: 4000,
        })
        loadProducts(Math.floor(first.value / rows.value) + 1)
      } catch (err: unknown) {
        toast.add({
          severity: 'error',
          summary: 'Error al Eliminar',
          detail: apiError(err, 'No se pudo eliminar el producto.'),
          life: 5000,
        })
      }
    },
  })
}

async function onToggleAvailable(product: Product, available: boolean) {
  togglingId.value = product.id
  try {
    await updateProduct(product.id, { available })
    product.available = available
    toast.add({
      severity: 'success',
      summary: 'Disponibilidad',
      detail: `"${product.title}" ahora está ${available ? 'disponible' : 'agotado'}.`,
      life: 3000,
    })
  } catch (err: unknown) {
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: apiError(err, 'No se pudo actualizar la disponibilidad.'),
      life: 5000,
    })
  } finally {
    togglingId.value = null
  }
}

onMounted(() => {
  loadProducts(1)
})
</script>

<template>
  <div class="admin-products">
    <DataTable
      :value="adminProducts"
      :loading="adminLoading"
      data-key="id"
      lazy
      paginator
      :first="first"
      :rows="rows"
      :total-records="adminTotal"
      :rows-per-page-options="[10, 20, 50]"
      @page="onPage"
      :sort-field="sortField ?? undefined"
      :sort-order="sortOrder"
      @sort="onSort"
      current-page-report-template="Mostrando {first} a {last} de {totalRecords} productos"
      paginator-template="FirstPageLink PrevPageLink CurrentPageReport NextPageLink LastPageLink RowsPerPageDropdown"
      class="products-table"
      scrollable
      scroll-height="calc(100vh - 450px)"
    >
      <template #header>
        <div class="table-header">
          <IconField>
            <InputIcon>
              <Search :size="16" />
            </InputIcon>
            <InputText
              v-model="busqueda"
              placeholder="Buscar producto..."
              @update:model-value="onSearch"
            />
          </IconField>
          <div class="header-actions">
            <Button v-if="hasActiveSort" class="reset-sort-button" @click="resetSort">
              <Times :size="16" />
              Restablecer orden
            </Button>
            <Button class="new-button" @click="openCreate">
              <Plus :size="18" />
              Nuevo Producto
            </Button>
          </div>
        </div>
      </template>
      <template #empty>
        <div class="empty-message">No se encontraron productos.</div>
      </template>
      <Column header="Imagen" style="width: 80px">
        <template #body="{ data }">
          <img
            v-if="data.imageUrl"
            :src="getImageSrc(data.imageUrl)"
            :alt="data.title"
            class="row-image"
          />
          <div v-else class="row-image no-image">Sin imagen</div>
        </template>
      </Column>
      <Column field="title" header="Título" sortable style="min-width: 220px">
        <template #body="{ data }">
          <span class="row-title">{{ data.title }}</span>
        </template>
      </Column>
      <Column header="Categorías" style="min-width: 160px">
        <template #body="{ data }">
          <div class="row-tags" v-if="data.productType?.length">
            <Tag v-for="type in data.productType" :key="type" class="row-tag">{{ type }}</Tag>
          </div>
          <span v-else class="empty-message">—</span>
        </template>
      </Column>
      <Column field="price" header="Precio" sortable style="width: 130px">
        <template #body="{ data }">
          <span :class="{ 'old-price': data.offer_price }">{{ formatCurrency(data.price) }}</span>
        </template>
      </Column>
      <Column header="Oferta" style="width: 130px">
        <template #body="{ data }">
          <span v-if="data.offer_price" class="offer-price">{{
            formatCurrency(data.offer_price)
          }}</span>
          <span v-else class="empty-message">—</span>
        </template>
      </Column>
      <Column header="Disponible" style="width: 110px">
        <template #body="{ data }">
          <ToggleSwitch
            :model-value="data.available"
            :disabled="togglingId === data.id"
            @update:model-value="onToggleAvailable(data, $event)"
          />
        </template>
      </Column>
      <Column header="Acciones" style="width: 130px">
        <template #body="{ data }">
          <div class="row-actions">
            <Button
              class="edit-button"
              rounded
              :aria-label="`Editar ${data.title}`"
              @click="openEdit(data)"
            >
              <Pencil :size="16" />
            </Button>
            <Button
              severity="danger"
              rounded
              :aria-label="`Eliminar ${data.title}`"
              @click="onDelete(data)"
            >
              <Trash :size="16" />
            </Button>
          </div>
        </template>
      </Column>
    </DataTable>
    <ProductFormDialog
      v-model:visible="dialogVisible"
      :product="editingProduct"
      :saving="saving"
      @save="onSave"
    />
  </div>
</template>

<style scoped>
.admin-products {
  display: flex;
  flex-direction: column;
  min-height: 0;
  height: 100%;
}

.products-table {
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
}

.products-table :deep(.p-datatable-table-container) {
  overflow: auto;
}

.table-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 15px;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 10px;
}

.new-button {
  background-color: var(--color-principal);
  border: none;
  white-space: nowrap;
}

.reset-sort-button {
  background-color: transparent;
  border: 1px solid var(--color-principal);
  color: var(--color-principal);
  white-space: nowrap;

  &:hover {
    background-color: color-mix(in srgb, var(--color-principal) 10%, white);
  }
}

.row-image {
  width: 52px;
  height: 52px;
  object-fit: cover;
  border-radius: 8px;
  border: 1px solid color-mix(in srgb, var(--color-principal) 18%, white);
}

.no-image {
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 10px;
  text-align: center;
  color: color-mix(in srgb, var(--color-principal) 60%, white);
  background-color: color-mix(in srgb, var(--color-principal) 8%, white);
}

.row-title {
  font-weight: 600;
}

.row-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
}

.row-tag {
  padding: 3px 8px;
  font-size: 11px;
  background-color: var(--color-principal);
  color: #ffffff;
  text-transform: capitalize;
}

.old-price {
  text-decoration: line-through;
  opacity: 0.55;
}

.offer-price {
  font-weight: bold;
}

.row-actions {
  display: flex;
  gap: 8px;
}

.edit-button {
  background-color: var(--color-principal);
  border: none;
}

.empty-message {
  color: color-mix(in srgb, var(--color-principal) 60%, white);
}
</style>
