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
  const pagina = ref<number>(1)
  const total = ref<number>(0)
  const totalPaginas = ref<number>(1)
  const ordenProducts = ref<Product[]>([])

  function getErrorMessage(error: unknown, fallback: string) {
    if (axios.isAxiosError<{ message?: string }>(error)) {
      return error.response?.data?.message ?? fallback
    }

    return fallback
  }

  async function fetchProducts(
    page: number,
    limit: number,
    nombre?: string | null,
    available?: boolean | null,
  ) {
    isLoading.value = true
    error.value = null
    try {
      const response = await api.get<ProductsResponse>('/products', {
        params: {
          pagina: page,
          limite: limit,
          ...(nombre ? { busqueda: encodeURIComponent(nombre ?? '') } : {}),
          ...(available !== undefined && available !== null ? { disponible: available } : {}),
        },
      })
      products.value = response.data.productos
      pagina.value = Number(response.data.pagina) || 1
      total.value = Number(response.data.total) || 0
      totalPaginas.value = Number(response.data.totalPaginas) || 1
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

  async function categorias() {
    try {
      const response = await api.get<string[]>('/categories')
      return response.data
    } catch (err: unknown) {
      error.value = getErrorMessage(err, 'Error al Obtner el Máximo de Precio')
    }
  }

  async function buscadorNombres(name: string) {
    try {
      const response = await api.get<string[]>('/products-names', {
        params: { name },
      })
      return response.data
    } catch (err: unknown) {
      error.value = getErrorMessage(err, 'Error al Obtener Opciones de Nombre')
      return []
    }
  }

  function addOrdenProduct(product: Product) {
    ordenProducts.value.push(product)
    console.log(ordenProducts)
  }

  return {
    products,
    isLoading,
    error,
    fetchProducts,
    cantidadPorDisponibilidad,
    maximoPrecio,
    categorias,
    pagina,
    total,
    totalPaginas,
    buscadorNombres,
    ordenProducts,
    addOrdenProduct,
  }
})
