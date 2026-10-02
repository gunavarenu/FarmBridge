export interface Product {
  id: string
  name: string
  nameHi: string
  category: 'vegetable' | 'fruit' | 'grain' | 'spice'
  price: number
  unit: string
  quantity: number
  location: string
  state: string
  farmerName: string
  farmerPhone: string
  image: string
  description: string
  organic: boolean
  postedAt: string
  rating: number
  reviews: number
  farmerId?: string
}

export interface CartItem {
  product: Product
  qty: number
}

export interface AuthUser {
  id: string
  phone: string
  name?: string
  role?: 'farmer' | 'buyer' | 'founder'
}

export type Language = 'en' | 'hi' | 'mr'