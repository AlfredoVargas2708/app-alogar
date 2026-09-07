import type { Product } from './products.interface'

export interface Sale {
  products: Product[]
  sale_type: string
  total_sale: number
  change: number | null
  total_payed: number
}

export interface SaleProductRecord {
  id: number
  sale_id: number
  product_id: number
  quantity: number
  price: number
  Producto?: {
    id: number
    title: string
    imageUrl: string | null
  }
}

export interface SaleRecord {
  id: number
  cant_products: number
  total_sale: number
  sale_type: string
  change: number | null
  total_payed: number
  createdAt: string
  SaleProducts?: SaleProductRecord[]
}

export interface SalesResponse {
  total: number
  pagina: number
  totalPaginas: number
  ventas: SaleRecord[]
}

export interface ResumenVentas {
  cantidad: number
  total: number
}

export interface TopProducto {
  product_id: number
  cantidad: number
  ingresos: number
  Producto?: {
    title: string
  }
}

export interface SalesStats {
  hoy: ResumenVentas
  semana: ResumenVentas
  mes: ResumenVentas
  totalGeneral: ResumenVentas
  topProductos: TopProducto[]
}
