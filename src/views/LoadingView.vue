<script setup lang="ts">
import ProgressBar from 'primevue/progressbar';
import { ref, onMounted, onBeforeUnmount } from 'vue';

const emit = defineEmits<{ complete: [] }>();

const value = ref(0);
const interval = ref<number | null>(null);

onMounted(() => {
    interval.value = setInterval(() => {
        const newValue = Math.round(value.value + Math.random() * 35 + 15);
        if (newValue >= 100) {
            value.value = 100;
            clearInterval(interval.value ?? 0);
            emit('complete');
        } else {
            value.value = newValue;
        }
    }, 400);
});
onBeforeUnmount(() => {
    if (interval.value) {
        clearInterval(interval.value);
    }
});

</script>
<template>
    <div class="loading-card">
        <img src="/logo-alogar.avif" alt="" class="loading-logo" />
        <ProgressBar :value="value" :showValue="false" class="loading-bar" />
        <span class="loading-text">Cargando... {{ value }}%</span>
    </div>
</template>

<style scoped>
.loading-card {
    width: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 16px;
    padding: 2.5rem 2rem;
    background: var(--p-card-background, #fff);
    border-radius: var(--p-card-border-radius, 12px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}

.loading-logo {
    width: 200px;
    height: 50px;
}

.loading-bar {
    width: 100%;
    height: 10px;
    border-radius: 999px;
    overflow: hidden;
}

.loading-bar :deep(.p-progressbar-value) {
    background-color: rgb(24, 76, 71);
    transition: width 400ms ease;
}

.loading-text {
    font-size: 15px;
    font-weight: bold;
    color: rgb(24, 76, 71);
    font-style: italic;
}
</style>
