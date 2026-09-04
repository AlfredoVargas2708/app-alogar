<script setup lang="ts">
import { Check, Times } from '@/shared/icons';
import Button from 'primevue/button';
import ProgressSpinner from 'primevue/progressspinner';

defineProps<{ showModal: boolean }>()
const emit = defineEmits<{ 'update:showModal': [value: boolean] }>()

</script>
<template>
    <div class="card-modal">
        <h1>Conectandose a pago con tarjeta...</h1>
        <div class="flex justify-center">
            <ProgressSpinner aria-label="loading" />
        </div>
        <div class="buttons">
            <Button severity="danger" @click="emit('update:showModal', false)">
                <Times :size="24" />
                Cancelar
            </Button>
            <Button @click="emit('update:showModal', false)">
                <Check :size="24" />
                Aceptar
            </Button>
        </div>
    </div>
</template>

<style scoped>
.card-modal {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: space-between;
    height: 100%;
}

.buttons {
    display: flex;
    align-items: center;
    width: 100%;
    justify-content: center;
    gap: 20px;

    .p-button:last-child {
        background-color: var(--color-principal);
        border: none;
    }
}
</style>