export interface ProductsResponse {
  total: number
  pagina: number
  totalPaginas: number
  productos: Product[]
}

export interface Product {
  id: number
  title: string
  handle: string
  price: number
  available: boolean
  imageUrl: string
  source: string
  offer_price: number | null
  productType: string[]
}

export interface AvailableResponse {
  available: boolean
  count: number
}

export interface AvailableFilterOption {
  label: string
  value: boolean
  total: number
}
