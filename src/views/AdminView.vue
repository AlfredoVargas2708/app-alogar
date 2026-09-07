<script setup lang="ts">
import { watch } from 'vue'
import { useRouter } from 'vue-router'
import { storeToRefs } from 'pinia'
import Card from 'primevue/card'
import Tabs from 'primevue/tabs'
import TabList from 'primevue/tablist'
import Tab from 'primevue/tab'
import TabPanels from 'primevue/tabpanels'
import TabPanel from 'primevue/tabpanel'
import Toast from 'primevue/toast'
import ConfirmDialog from 'primevue/confirmdialog'
import { useToast } from 'primevue/usetoast'
import AppHeader from '@/components/AppHeader.vue'
import AdminStats from '@/components/AdminStats.vue'
import AdminProducts from '@/components/AdminProducts.vue'
import AdminSales from '@/components/AdminSales.vue'
import { useUserStore } from '@/stores/userStore'
import { useProductStore } from '@/stores/productStore'
import { useSaleStore } from '@/stores/saleStore'
import { Box, List } from '@/shared/icons'

const router = useRouter()
const userStore = useUserStore()
const productStore = useProductStore()
const saleStore = useSaleStore()
const { error: productError } = storeToRefs(productStore)
const { error: saleError } = storeToRefs(saleStore)
const toast = useToast()

function logout() {
    userStore.logout()
    router.push({ path: '/login' })
}

watch(productError, (message) => {
    if (message) {
        toast.add({ severity: 'error', summary: 'Productos', detail: message, life: 5000 })
        productStore.error = null
    }
})

watch(saleError, (message) => {
    if (message) {
        toast.add({ severity: 'error', summary: 'Ventas', detail: message, life: 5000 })
        saleStore.error = null
    }
})
</script>

<template>
    <Card class="admin-card">
        <template #content>
            <div class="admin-container">
                <AppHeader @logout="logout" />
                <AdminStats />
                <div class="admin-content">
                    <Tabs value="productos" class="admin-tabs">
                        <TabList>
                            <Tab value="productos">
                                <Box :size="18" />
                                Productos
                            </Tab>
                            <Tab value="ventas">
                                <List :size="18" />
                                Historial de Ventas
                            </Tab>
                        </TabList>
                        <TabPanels class="admin-panels">
                            <TabPanel value="productos" class="admin-panel">
                                <AdminProducts />
                            </TabPanel>
                            <TabPanel value="ventas" class="admin-panel">
                                <AdminSales />
                            </TabPanel>
                        </TabPanels>
                    </Tabs>
                </div>
            </div>
        </template>
    </Card>
    <Toast position="center" class="toast" />
    <ConfirmDialog />
</template>

<style scoped>
.admin-card {
    width: 100%;
    height: calc(100dvh - 20px);
    margin: 10px;
    padding: 10px 15px;
    overflow: hidden;
}

.admin-card :deep(.p-card-body) {
    height: 100%;
    display: flex;
    flex-direction: column;
    min-height: 0;
}

.admin-card :deep(.p-card-content) {
    flex: 1;
    min-height: 0;
    display: flex;
}

.admin-container {
    display: grid;
    grid-template-areas:
        "header"
        "stats"
        "contenido";
    grid-template-rows: auto auto minmax(0, 1fr);
    height: 100%;
    width: 100%;
    min-height: 0;
}

.admin-content {
    grid-area: contenido;
    min-height: 0;
    display: flex;
    flex-direction: column;
}

.admin-tabs {
    display: flex;
    flex-direction: column;
    height: 100%;
    min-height: 0;
}

.admin-tabs :deep(.p-tablist-tab-list) {
    gap: 6px;
}

.admin-tabs :deep(.p-tab) {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    color: var(--color-principal);
}

.admin-tabs :deep(.p-tab-active) {
    border-color: var(--color-principal);
    color: var(--color-principal);
    font-weight: bold;
}

.admin-tabs :deep(.p-tablist-active-bar) {
    background: var(--color-principal);
}

.admin-panels {
    flex: 1;
    min-height: 0;
    display: flex;
    flex-direction: column;
}

.admin-panels :deep(.p-tabpanels) {
    flex: 1;
    min-height: 0;
    display: flex;
    flex-direction: column;
    padding: 15px 0 0;
}

.admin-panel {
    height: 100%;
    min-height: 0;
}
</style>
