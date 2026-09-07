<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { storeToRefs } from 'pinia';
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import Tag from 'primevue/tag';
import type { PageState } from 'primevue/paginator';
import { useSaleStore } from '@/stores/saleStore';
import { formatCurrency } from '@/shared/currency';
import { CreditCard, MoneyBill } from '@/shared/icons';
import type { SaleRecord } from '@/interfaces/sale.interface';

const saleStore = useSaleStore();
const { fetchSales } = saleStore;
const { sales, salesTotal, isLoadingSales } = storeToRefs(saleStore);

const first = ref(0);
const rows = ref(10);
const expandedRows = ref<SaleRecord[]>([]);

function loadSales(page: number) {
    expandedRows.value = [];
    void fetchSales(page, rows.value);
}

function onPage(event: PageState) {
    first.value = event.first;
    rows.value = event.rows;
    loadSales(event.page + 1);
}

function formatFecha(fecha: string): string {
    return new Date(fecha).toLocaleString('es-CL', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });
}

onMounted(() => {
    loadSales(1);
});
</script>

<template>
    <div class="admin-sales">
        <DataTable v-model:expanded-rows="expandedRows" :value="sales" :loading="isLoadingSales" data-key="id" lazy
            paginator :first="first" :rows="rows" :total-records="salesTotal" :rows-per-page-options="[10, 20, 50]"
            @page="onPage" current-page-report-template="Mostrando {first} a {last} de {totalRecords} ventas"
            paginator-template="FirstPageLink PrevPageLink CurrentPageReport NextPageLink LastPageLink RowsPerPageDropdown"
            class="sales-table">
            <template #empty>
                <div class="empty-message">Aún no hay ventas registradas.</div>
            </template>
            <Column expander style="width: 50px" />
            <Column field="id" header="N° Venta" sortable style="width: 110px" />
            <Column field="createdAt" header="Fecha" sortable style="width: 180px">
                <template #body="{ data }">
                    {{ formatFecha(data.createdAt) }}
                </template>
            </Column>
            <Column header="Tipo de Pago" style="width: 150px">
                <template #body="{ data }">
                    <Tag :severity="data.sale_type === 'cash' ? 'success' : 'info'" class="sale-type-tag">
                        <MoneyBill v-if="data.sale_type === 'cash'" :size="14" />
                        <CreditCard v-else :size="14" />
                        {{ data.sale_type === 'cash' ? 'Efectivo' : 'Tarjeta' }}
                    </Tag>
                </template>
            </Column>
            <Column field="cant_products" header="Productos" style="width: 110px" />
            <Column field="total_sale" header="Total Venta" sortable style="width: 140px">
                <template #body="{ data }">
                    <span class="money">{{ formatCurrency(data.total_sale) }}</span>
                </template>
            </Column>
            <Column field="total_payed" header="Total Pagado" style="width: 140px">
                <template #body="{ data }">
                    {{ formatCurrency(data.total_payed) }}
                </template>
            </Column>
            <Column field="change" header="Vuelto" style="width: 120px">
                <template #body="{ data }">
                    {{ data.change !== null ? formatCurrency(data.change) : '—' }}
                </template>
            </Column>
            <template #expansion="{ data }">
                <div class="sale-detail">
                    <h4 class="detail-title">Detalle de la Venta #{{ data.id }}</h4>
                    <DataTable :value="data.SaleProducts ?? []" data-key="id" class="detail-table">
                        <Column header="Producto">
                            <template #body="{ data: item }">
                                <div class="detail-product">
                                    <img v-if="item.Producto?.imageUrl" :src="item.Producto.imageUrl"
                                        :alt="item.Producto?.title" class="detail-image" />
                                    <span>{{ item.Producto?.title ?? `Producto #${item.product_id}` }}</span>
                                </div>
                            </template>
                        </Column>
                        <Column field="quantity" header="Cantidad" style="width: 110px" />
                        <Column field="price" header="Monto" style="width: 130px">
                            <template #body="{ data: item }">
                                {{ formatCurrency(item.price) }}
                            </template>
                        </Column>
                    </DataTable>
                </div>
            </template>
        </DataTable>
    </div>
</template>

<style scoped>
.admin-sales {
    display: flex;
    flex-direction: column;
    min-height: 0;
    height: 100%;
}

.sales-table {
    flex: 1;
    min-height: 0;
    display: flex;
    flex-direction: column;
}

.sales-table :deep(.p-datatable-table-container) {
    overflow: auto;
}

.sale-type-tag {
    display: inline-flex;
    align-items: center;
    gap: 6px;
}

.money {
    font-weight: bold;
}

.sale-detail {
    padding: 10px 20px;
    background-color: color-mix(in srgb, var(--color-principal) 5%, white);
    border-radius: 10px;
}

.detail-title {
    margin: 0 0 10px;
}

.detail-product {
    display: flex;
    align-items: center;
    gap: 10px;
}

.detail-image {
    width: 36px;
    height: 36px;
    object-fit: cover;
    border-radius: 6px;
}

.empty-message {
    color: color-mix(in srgb, var(--color-principal) 60%, white);
}
</style>
