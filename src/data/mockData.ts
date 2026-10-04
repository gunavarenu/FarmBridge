import type { Product } from '../types'

export const mockProducts: Product[] = []

export const categories = [
  { value: 'all',       label: 'All Products', labelHi: 'सभी उत्पाद', emoji: '🌾' },
  { value: 'vegetable', label: 'Vegetables',   labelHi: 'सब्जियाँ',   emoji: '🥦' },
  { value: 'fruit',     label: 'Fruits',       labelHi: 'फल',         emoji: '🍎' },
  { value: 'grain',     label: 'Grains',       labelHi: 'अनाज',       emoji: '🌾' },
  { value: 'spice',     label: 'Spices',       labelHi: 'मसाले',      emoji: '🌶️' },
]

export const indianStates = [
  'Maharashtra', 'Punjab', 'Uttar Pradesh', 'Gujarat', 'Rajasthan',
  'Karnataka', 'Madhya Pradesh', 'Tamil Nadu', 'Andhra Pradesh', 'Haryana',
]
