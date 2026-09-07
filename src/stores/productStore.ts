import { defineStore } from 'pinia'
import { ref } from 'vue'
import axios from 'axios'
import api from '@/services/api'
import type { Product, ProductPayload, ProductsResponse } from '@/interfaces/products.interface'

export const useProductStore = defineStore('products', () => {
  // Estado
  const products = ref<Product[]>([])
  const isLoading = ref(false)
  const error = ref<string | null>(null)
  const pagina = ref<number>(1)
  const total = ref<number>(0)
  const totalPaginas = ref<number>(1)
  const ordenProducts = ref<Product[]>([])

  // Estado del panel de administración (independiente del POS)
  const adminProducts = ref<Product[]>([])
  const adminTotal = ref<number>(0)
  const adminLoading = ref(false)

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
    minPrice?: number | null,
    maxPrice?: number | null,
    categories?: string[] | null,
    oferta?: boolean,
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
          ...(minPrice !== undefined && minPrice !== null ? { precioMinimo: minPrice } : {}),
          ...(maxPrice !== undefined && maxPrice !== null ? { precioMaximo: maxPrice } : {}),
          ...(categories && categories.length > 0 ? { categorias: categories } : {}),
          ...(oferta === true ? { oferta } : {}),
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

  async function buscarPorBarcode(barcode: string) {
    try {
      const response = await api.get<Product>(`/products/barcode/${encodeURIComponent(barcode.trim())}`)
      return response.data
    } catch (err: unknown) {
      if (axios.isAxiosError(err) && err.response?.status === 404) {
        return null
      }
      error.value = getErrorMessage(err, 'Error al buscar el código de barras')
      return null
    }
  }

  function addOrdenProduct(product: Product) {
    ordenProducts.value.push({ ...product, cantidad: 1, isWeight: false })
  }

  function deleteOrdenProduct(product: Product) {
    ordenProducts.value = ordenProducts.value.filter((prod) => prod.id !== product.id)
  }

  function updateOrdenProduct(productId: number, updates: Partial<Product>) {
    const index = ordenProducts.value.findIndex((p) => p.id === productId)
    const product = ordenProducts.value[index]

    if (product) {
      ordenProducts.value[index] = { ...product, ...updates }
    }
  }

  function deleteOrden() {
    ordenProducts.value = []
  }

  // --- Funciones del panel de administración ---

  async function fetchAdminProducts(
    page: number,
    limit: number,
    nombre?: string | null,
    ordenarPor?: string | null,
    orden?: 'ASC' | 'DESC' | null,
  ) {
    adminLoading.value = true
    error.value = null
    try {
      const response = await api.get<ProductsResponse>('/products', {
        params: {
          pagina: page,
          limite: limit,
          ...(nombre ? { busqueda: encodeURIComponent(nombre) } : {}),
          ...(ordenarPor ? { ordenarPor } : {}),
          ...(orden ? { orden } : {}),
        },
      })
      adminProducts.value = response.data.productos
      adminTotal.value = Number(response.data.total) || 0
    } catch (err: unknown) {
      error.value = getErrorMessage(err, 'Error al obtener productos')
    } finally {
      adminLoading.value = false
    }
  }

  // Arma el FormData para crear/editar productos (permite adjuntar imagen)
  function buildProductFormData(payload: Partial<ProductPayload>): FormData {
    const formData = new FormData()

    for (const [key, value] of Object.entries(payload)) {
      if (value === undefined || value === null || key === 'imageFile') {
        continue
      }
      formData.append(key, String(value))
    }

    if (payload.imageFile) {
      formData.append('imageFile', payload.imageFile)
    }

    return formData
  }

  async function createProduct(payload: ProductPayload) {
    const response = await api.post<Product>('/products', buildProductFormData(payload), {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    return response.data
  }

  async function updateProduct(id: number, payload: Partial<ProductPayload>) {
    const response = await api.put<Product>(`/products/${id}`, buildProductFormData(payload), {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    return response.data
  }

  async function deleteProduct(id: number) {
    await api.delete(`/products/${id}`)
  }

  return {
    products,
    isLoading,
    error,
    fetchProducts,
    categorias,
    pagina,
    total,
    totalPaginas,
    buscadorNombres,
    buscarPorBarcode,
    ordenProducts,
    addOrdenProduct,
    deleteOrdenProduct,
    updateOrdenProduct,
    deleteOrden,
    adminProducts,
    adminTotal,
    adminLoading,
    fetchAdminProducts,
    createProduct,
    updateProduct,
    deleteProduct,
  }
})
