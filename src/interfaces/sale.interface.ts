import type { Product } from './products.interface'

export interface Sale {
  products: Product[]
  sale_type: string
  total_sale: number
  change: number | null
  total_payed: number
}
