import { defineStore } from 'pinia'
import { ref } from 'vue'
import axios from 'axios'
import api from '@/services/api'
import type { AvailableResponse, Product, ProductsResponse } from '@/interfaces/products.interface'

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
      setTimeout(() => {
        isLoading.value = false
      }, 500)
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

  async function maximoPrecio() {
    try {
      const response = await api.get<number>('/max-price')
      return response.data
    } catch (err: unknown) {
      error.value = getErrorMessage(err, 'Errr al Obtner el Máximo de Precio')
    }
  }

  return {
    products,
    isLoading,
    error,
    fetchProducts,
    cantidadPorDisponibilidad,
    maximoPrecio,
  }
})
