<script setup lang="ts">
import { computed, markRaw, onMounted, type Component } from 'vue';
import { storeToRefs } from 'pinia';
import { useSaleStore } from '@/stores/saleStore';
import { formatCurrency } from '@/shared/currency';
import { Calendar, ChartBar, Dollar, List, TagIcon } from '@/shared/icons';
import type { ResumenVentas } from '@/interfaces/sale.interface';

const saleStore = useSaleStore();
const { fetchStats } = saleStore;
const { stats, isLoadingStats } = storeToRefs(saleStore);

interface StatCard {
    label: string;
    resumen: ResumenVentas | undefined;
    icon: Component;
}

const cards = computed<StatCard[]>(() => [
    { label: 'Ventas de Hoy', resumen: stats.value?.hoy, icon: markRaw(Calendar) },
    { label: 'Últimos 7 Días', resumen: stats.value?.semana, icon: markRaw(ChartBar) },
    { label: 'Este Mes', resumen: stats.value?.mes, icon: markRaw(Dollar) },
    { label: 'Total Histórico', resumen: stats.value?.totalGeneral, icon: markRaw(List) },
]);

onMounted(() => {
    void fetchStats();
});
</script>

<template>
    <div class="stats-grid" :class="{ loading: isLoadingStats }">
        <div v-for="card in cards" :key="card.label" class="stat-card">
            <div class="stat-icon">
                <component :is="card.icon" :size="22" />
            </div>
            <div class="stat-info">
                <span class="stat-label">{{ card.label }}</span>
                <span class="stat-value">{{ card.resumen ? formatCurrency(card.resumen.total) : '—' }}</span>
                <span class="stat-detail">{{ card.resumen?.cantidad ?? 0 }} ventas</span>
            </div>
        </div>
        <div class="stat-card top-products">
            <div class="stat-icon">
                <TagIcon :size="22" />
            </div>
            <div class="stat-info">
                <span class="stat-label">Productos Más Vendidos</span>
                <ol v-if="stats?.topProductos?.length" class="top-list">
                    <li v-for="top in stats.topProductos" :key="top.product_id">
                        <span class="top-name">{{ top.Producto?.title ?? `Producto #${top.product_id}` }}</span>
                        <span class="top-qty">{{ top.cantidad }} uds · {{ formatCurrency(Number(top.ingresos)) }}</span>
                    </li>
                </ol>
                <span v-else class="stat-detail">Sin ventas registradas</span>
            </div>
        </div>
    </div>
</template>

<style scoped>
.stats-grid {
    grid-area: stats;
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
    gap: 15px;
    padding-bottom: 15px;
}

.stat-card {
    display: flex;
    align-items: center;
    gap: 14px;
    padding: 14px 16px;
    border-radius: 12px;
    border: 1px solid color-mix(in srgb, var(--color-principal) 18%, white);
    background: #ffffff;
    box-shadow: 0 4px 14px rgba(24, 76, 71, 0.08);
    transition: box-shadow 180ms ease, border-color 180ms ease;
}

.stat-card:hover {
    border-color: color-mix(in srgb, var(--color-principal) 38%, white);
    box-shadow: 0 7px 20px rgba(24, 76, 71, 0.13);
}

.stat-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    min-width: 44px;
    height: 44px;
    border-radius: 10px;
    background-color: var(--color-principal);
    color: #ffffff;
}

.stat-info {
    display: flex;
    flex-direction: column;
    gap: 2px;
    min-width: 0;
}

.stat-label {
    font-size: 13px;
    opacity: 0.75;
    text-transform: uppercase;
    letter-spacing: 0.4px;
}

.stat-value {
    font-size: 22px;
    font-weight: bold;
}

.stat-detail {
    font-size: 13px;
    opacity: 0.7;
}

.top-products {
    grid-column: span 2;
    align-items: flex-start;
}

.top-list {
    margin: 4px 0 0;
    padding-left: 20px;
    display: flex;
    flex-direction: column;
    gap: 4px;
    width: 100%;
}

.top-list li {
    font-size: 13px;
}

.top-name {
    font-weight: 600;
    text-transform: capitalize;
}

.top-qty {
    float: right;
    font-weight: bold;
}

@media (max-width: 1100px) {
    .top-products {
        grid-column: span 1;
    }
}
</style>
