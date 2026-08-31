import { defineStore } from 'pinia'
import { ref } from 'vue'
import axios from 'axios'
import api from '@/services/api'

type Product = Record<string, unknown>

interface ProductsResponse {
  total: number
  pagina: number
  totalPaginas: number
  productos: Product[]
}

interface AvailableResponse {
  available: boolean
  count: number
}

export const useProductStore = defineStore('products', () => {
  // Estado
  const products = ref<Product[]>([])
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  function getErrorMessage(error: unknown, fallback: string) {
    if (axios.isAxiosError<{ message?: string }>(error)) {
      return error.response?.data?.message ?? fallback
    }

    return fallback
  }

  async function fetchProducts() {
    isLoading.value = true
    error.value = null
    try {
      const response = await api.get<ProductsResponse>('/products')
      products.value = response.data.productos
    } catch (err: unknown) {
      error.value = getErrorMessage(err, 'Error al obtener productos')
    } finally {
      isLoading.value = false
    }
  }

  async function cantidadPorDisponibilidad() {
    try {
      const response = await api.get<AvailableResponse[]>('/cant-available')
      return response.data
    } catch (err: unknown) {
      error.value = getErrorMessage(err, 'Error al Obtener Tipos Disponibilidad')
    }
  }

  return {
    products,
    isLoading,
    error,
    fetchProducts,
    cantidadPorDisponibilidad,
  }
})
