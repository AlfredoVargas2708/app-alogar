import { defineStore } from 'pinia'
import { ref } from 'vue'
import axios from 'axios'
import api from '@/services/api'

type Product = Record<string, unknown>
type NewProduct = Record<string, unknown>

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
      const response = await api.get<Product[]>('/products')
      products.value = response.data
    } catch (err: unknown) {
      error.value = getErrorMessage(err, 'Error al obtener productos')
    } finally {
      isLoading.value = false
    }
  }

  async function addProduct(newProduct: NewProduct) {
    isLoading.value = true
    error.value = null
    try {
      const response = await api.post<Product>('/products', newProduct)
      products.value.push(response.data)
    } catch (err: unknown) {
      error.value = getErrorMessage(err, 'Error al guardar producto')
    } finally {
      isLoading.value = false
    }
  }

  return {
    products,
    isLoading,
    error,
    fetchProducts,
    addProduct,
  }
})
