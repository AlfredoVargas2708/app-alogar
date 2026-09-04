import { defineStore } from 'pinia'
import { ref } from 'vue'
import axios from 'axios'
import api from '@/services/api'
import type { Sale } from '@/interfaces/sale.interface'

export const useSaleStore = defineStore('sale', () => {
  const isLoadingSale = ref<boolean>(false)
  const error = ref<string | null>(null)

  function getErrorMessage(error: unknown, fallback: string) {
    if (axios.isAxiosError<{ message?: string }>(error)) {
      return error.response?.data?.message ?? fallback
    }

    return fallback
  }

  async function createSale(sale: Sale) {
    isLoadingSale.value = true
    error.value = null
    try {
      await api.post('/sale', { sale })
    } catch (err) {
      error.value = getErrorMessage(err, 'Error al obtener productos')
    } finally {
      setTimeout(() => {
        isLoadingSale.value = false
      }, 500)
    }
  }

  return {
    isLoadingSale,
    error,
    createSale,
  }
})
