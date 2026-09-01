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
  avaiable: boolean
  imageUrl: string
  source: string
}

export interface AvailableResponse {
  available: boolean
  count: number
}
