import { defineStore } from 'pinia'
import { ref } from 'vue'
import axios from 'axios'
import api from '@/services/api'
import type { Sale, SaleRecord, SalesResponse, SalesStats } from '@/interfaces/sale.interface'

export const useSaleStore = defineStore('sale', () => {
  const isLoadingSale = ref<boolean>(false)
  const error = ref<string | null>(null)

  // Estado del historial y estadísticas (panel de administración)
  const sales = ref<SaleRecord[]>([])
  const salesTotal = ref<number>(0)
  const salesPagina = ref<number>(1)
  const salesTotalPaginas = ref<number>(1)
  const isLoadingSales = ref<boolean>(false)
  const stats = ref<SalesStats | null>(null)
  const isLoadingStats = ref<boolean>(false)

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

  async function fetchSales(page: number = 1, limit: number = 10) {
    isLoadingSales.value = true
    error.value = null
    try {
      const response = await api.get<SalesResponse>('/sales', {
        params: { pagina: page, limite: limit },
      })
      sales.value = response.data.ventas
      salesTotal.value = Number(response.data.total) || 0
      salesPagina.value = Number(response.data.pagina) || 1
      salesTotalPaginas.value = Number(response.data.totalPaginas) || 1
    } catch (err: unknown) {
      error.value = getErrorMessage(err, 'Error al obtener el historial de ventas')
    } finally {
      isLoadingSales.value = false
    }
  }

  async function fetchStats() {
    isLoadingStats.value = true
    error.value = null
    try {
      const response = await api.get<SalesStats>('/sales/stats')
      stats.value = response.data
    } catch (err: unknown) {
      error.value = getErrorMessage(err, 'Error al obtener las estadísticas')
    } finally {
      isLoadingStats.value = false
    }
  }

  return {
    isLoadingSale,
    error,
    createSale,
    sales,
    salesTotal,
    salesPagina,
    salesTotalPaginas,
    isLoadingSales,
    stats,
    isLoadingStats,
    fetchSales,
    fetchStats,
  }
})
