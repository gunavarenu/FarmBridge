export interface MandiRate {
  commodity: string
  market: string
  state: string
  minPrice: number
  maxPrice: number
  modalPrice: number
  date: string
  category?: 'vegetable' | 'fruit' | 'grain' | 'spice'
}

// ─── Comprehensive Fallback Rates: 60+ vegetables & fruits across major states ───
export const FALLBACK_RATES: MandiRate[] = [
  // ── Maharashtra ──────────────────────────────────────────────────────────────
  { commodity: 'Tomato',       market: 'Nashik',          state: 'Maharashtra', minPrice: 1200, maxPrice: 2200, modalPrice: 1800, date: 'today', category: 'vegetable' },
  { commodity: 'Onion',        market: 'Lasalgaon',       state: 'Maharashtra', minPrice:  800, maxPrice: 1800, modalPrice: 1200, date: 'today', category: 'vegetable' },
  { commodity: 'Potato',       market: 'Pune',            state: 'Maharashtra', minPrice: 1000, maxPrice: 1600, modalPrice: 1300, date: 'today', category: 'vegetable' },
  { commodity: 'Brinjal',      market: 'Pune APMC',       state: 'Maharashtra', minPrice:  600, maxPrice: 1400, modalPrice:  900, date: 'today', category: 'vegetable' },
  { commodity: 'Cauliflower',  market: 'Mahabaleshwar',   state: 'Maharashtra', minPrice: 1500, maxPrice: 2500, modalPrice: 2000, date: 'today', category: 'vegetable' },
  { commodity: 'Cabbage',      market: 'Nashik',          state: 'Maharashtra', minPrice:  500, maxPrice: 1200, modalPrice:  800, date: 'today', category: 'vegetable' },
  { commodity: 'Capsicum',     market: 'Nashik',          state: 'Maharashtra', minPrice: 1500, maxPrice: 3000, modalPrice: 2200, date: 'today', category: 'vegetable' },
  { commodity: 'Bhindi',       market: 'Pune',            state: 'Maharashtra', minPrice: 1000, maxPrice: 2000, modalPrice: 1500, date: 'today', category: 'vegetable' },
  { commodity: 'Bitter Gourd', market: 'Mumbai Vashi',    state: 'Maharashtra', minPrice: 1200, maxPrice: 2200, modalPrice: 1700, date: 'today', category: 'vegetable' },
  { commodity: 'Bottle Gourd', market: 'Nashik',          state: 'Maharashtra', minPrice:  600, maxPrice: 1400, modalPrice:  900, date: 'today', category: 'vegetable' },
  { commodity: 'Pumpkin',      market: 'Solapur',         state: 'Maharashtra', minPrice:  400, maxPrice: 1000, modalPrice:  700, date: 'today', category: 'vegetable' },
  { commodity: 'Carrot',       market: 'Mahabaleshwar',   state: 'Maharashtra', minPrice: 1000, maxPrice: 2000, modalPrice: 1500, date: 'today', category: 'vegetable' },
  { commodity: 'Radish',       market: 'Pune',            state: 'Maharashtra', minPrice:  500, maxPrice: 1200, modalPrice:  800, date: 'today', category: 'vegetable' },
  { commodity: 'Spinach',      market: 'Mumbai Vashi',    state: 'Maharashtra', minPrice:  800, maxPrice: 1600, modalPrice: 1200, date: 'today', category: 'vegetable' },
  { commodity: 'Fenugreek',    market: 'Nashik',          state: 'Maharashtra', minPrice: 1000, maxPrice: 2000, modalPrice: 1400, date: 'today', category: 'vegetable' },
  { commodity: 'Coriander',    market: 'Nashik',          state: 'Maharashtra', minPrice: 2000, maxPrice: 5000, modalPrice: 3500, date: 'today', category: 'vegetable' },
  { commodity: 'Green Chilli', market: 'Nashik',          state: 'Maharashtra', minPrice: 2000, maxPrice: 5000, modalPrice: 3500, date: 'today', category: 'vegetable' },
  { commodity: 'Garlic',       market: 'Nashik',          state: 'Maharashtra', minPrice: 5000, maxPrice:12000, modalPrice: 8000, date: 'today', category: 'vegetable' },
  { commodity: 'Ginger',       market: 'Satara',          state: 'Maharashtra', minPrice: 4000, maxPrice: 9000, modalPrice: 6000, date: 'today', category: 'vegetable' },
  { commodity: 'Sweet Corn',   market: 'Pune',            state: 'Maharashtra', minPrice: 1000, maxPrice: 2000, modalPrice: 1500, date: 'today', category: 'vegetable' },
  { commodity: 'Mango',        market: 'Ratnagiri',       state: 'Maharashtra', minPrice: 6000, maxPrice:15000, modalPrice: 9000, date: 'today', category: 'fruit' },
  { commodity: 'Banana',       market: 'Jalgaon',         state: 'Maharashtra', minPrice: 1500, maxPrice: 3500, modalPrice: 2200, date: 'today', category: 'fruit' },
  { commodity: 'Pomegranate',  market: 'Ahmednagar',      state: 'Maharashtra', minPrice: 5000, maxPrice: 9000, modalPrice: 7000, date: 'today', category: 'fruit' },
  { commodity: 'Watermelon',   market: 'Solapur',         state: 'Maharashtra', minPrice:  600, maxPrice: 1500, modalPrice: 1000, date: 'today', category: 'fruit' },
  { commodity: 'Grapes',       market: 'Nashik',          state: 'Maharashtra', minPrice: 3000, maxPrice: 8000, modalPrice: 5500, date: 'today', category: 'fruit' },
  { commodity: 'Strawberry',   market: 'Mahabaleshwar',   state: 'Maharashtra', minPrice: 8000, maxPrice:20000, modalPrice:13000, date: 'today', category: 'fruit' },
  { commodity: 'Guava',        market: 'Nashik',          state: 'Maharashtra', minPrice: 1500, maxPrice: 3500, modalPrice: 2500, date: 'today', category: 'fruit' },
  { commodity: 'Papaya',       market: 'Nashik',          state: 'Maharashtra', minPrice:  800, maxPrice: 2000, modalPrice: 1200, date: 'today', category: 'fruit' },
  { commodity: 'Lemon',        market: 'Vidarbha',        state: 'Maharashtra', minPrice: 3000, maxPrice: 7000, modalPrice: 5000, date: 'today', category: 'fruit' },
  { commodity: 'Orange',       market: 'Nagpur',          state: 'Maharashtra', minPrice: 2000, maxPrice: 5000, modalPrice: 3500, date: 'today', category: 'fruit' },
  { commodity: 'Sapota',       market: 'Konkan',          state: 'Maharashtra', minPrice: 2000, maxPrice: 5000, modalPrice: 3200, date: 'today', category: 'fruit' },
  { commodity: 'Custard Apple',market: 'Aurangabad',      state: 'Maharashtra', minPrice: 4000, maxPrice: 9000, modalPrice: 6500, date: 'today', category: 'fruit' },

  // ── Punjab ────────────────────────────────────────────────────────────────────
  { commodity: 'Onion',        market: 'Amritsar Mandi',  state: 'Punjab',      minPrice: 1000, maxPrice: 2200, modalPrice: 1600, date: 'today', category: 'vegetable' },
  { commodity: 'Potato',       market: 'Jalandhar',       state: 'Punjab',      minPrice:  900, maxPrice: 1700, modalPrice: 1200, date: 'today', category: 'vegetable' },
  { commodity: 'Tomato',       market: 'Ludhiana',        state: 'Punjab',      minPrice: 1200, maxPrice: 2500, modalPrice: 1800, date: 'today', category: 'vegetable' },
  { commodity: 'Cauliflower',  market: 'Amritsar',        state: 'Punjab',      minPrice: 1200, maxPrice: 2200, modalPrice: 1700, date: 'today', category: 'vegetable' },
  { commodity: 'Capsicum',     market: 'Ludhiana',        state: 'Punjab',      minPrice: 2000, maxPrice: 4000, modalPrice: 3000, date: 'today', category: 'vegetable' },
  { commodity: 'Peas',         market: 'Amritsar',        state: 'Punjab',      minPrice: 2000, maxPrice: 4500, modalPrice: 3000, date: 'today', category: 'vegetable' },
  { commodity: 'Spinach',      market: 'Ludhiana',        state: 'Punjab',      minPrice:  600, maxPrice: 1500, modalPrice: 1000, date: 'today', category: 'vegetable' },
  { commodity: 'Muskmelon',    market: 'Amritsar',        state: 'Punjab',      minPrice:  800, maxPrice: 2000, modalPrice: 1300, date: 'today', category: 'fruit' },
  { commodity: 'Watermelon',   market: 'Ludhiana',        state: 'Punjab',      minPrice:  700, maxPrice: 1600, modalPrice: 1100, date: 'today', category: 'fruit' },
  { commodity: 'Litchi',       market: 'Ludhiana',        state: 'Punjab',      minPrice: 4000, maxPrice: 9000, modalPrice: 6500, date: 'today', category: 'fruit' },

  // ── Uttar Pradesh ─────────────────────────────────────────────────────────────
  { commodity: 'Potato',       market: 'Agra Mandi',      state: 'Uttar Pradesh', minPrice:  700, maxPrice: 1400, modalPrice: 1100, date: 'today', category: 'vegetable' },
  { commodity: 'Tomato',       market: 'Lucknow',         state: 'Uttar Pradesh', minPrice: 1000, maxPrice: 2200, modalPrice: 1600, date: 'today', category: 'vegetable' },
  { commodity: 'Onion',        market: 'Varanasi',        state: 'Uttar Pradesh', minPrice:  900, maxPrice: 2000, modalPrice: 1400, date: 'today', category: 'vegetable' },
  { commodity: 'Brinjal',      market: 'Kanpur',          state: 'Uttar Pradesh', minPrice:  500, maxPrice: 1200, modalPrice:  800, date: 'today', category: 'vegetable' },
  { commodity: 'Pumpkin',      market: 'Gorakhpur',       state: 'Uttar Pradesh', minPrice:  300, maxPrice:  900, modalPrice:  600, date: 'today', category: 'vegetable' },
  { commodity: 'Mango',        market: 'Lucknow',         state: 'Uttar Pradesh', minPrice: 3000, maxPrice: 9000, modalPrice: 6000, date: 'today', category: 'fruit' },
  { commodity: 'Banana',       market: 'Varanasi',        state: 'Uttar Pradesh', minPrice: 1200, maxPrice: 3000, modalPrice: 2000, date: 'today', category: 'fruit' },
  { commodity: 'Guava',        market: 'Allahabad',       state: 'Uttar Pradesh', minPrice: 1500, maxPrice: 4000, modalPrice: 2700, date: 'today', category: 'fruit' },
  { commodity: 'Amla',         market: 'Pratapgarh',      state: 'Uttar Pradesh', minPrice: 1000, maxPrice: 3000, modalPrice: 2000, date: 'today', category: 'fruit' },

  // ── Gujarat ───────────────────────────────────────────────────────────────────
  { commodity: 'Tomato',       market: 'Rajkot',          state: 'Gujarat',     minPrice: 1000, maxPrice: 2200, modalPrice: 1600, date: 'today', category: 'vegetable' },
  { commodity: 'Onion',        market: 'Ahmedabad',       state: 'Gujarat',     minPrice:  800, maxPrice: 1800, modalPrice: 1300, date: 'today', category: 'vegetable' },
  { commodity: 'Potato',       market: 'Surat',           state: 'Gujarat',     minPrice:  900, maxPrice: 1700, modalPrice: 1300, date: 'today', category: 'vegetable' },
  { commodity: 'Bhindi',       market: 'Vadodara',        state: 'Gujarat',     minPrice: 1200, maxPrice: 2400, modalPrice: 1800, date: 'today', category: 'vegetable' },
  { commodity: 'Green Chilli', market: 'Ahmedabad',       state: 'Gujarat',     minPrice: 2500, maxPrice: 6000, modalPrice: 4000, date: 'today', category: 'vegetable' },
  { commodity: 'Papaya',       market: 'Surat',           state: 'Gujarat',     minPrice:  700, maxPrice: 1800, modalPrice: 1200, date: 'today', category: 'fruit' },
  { commodity: 'Banana',       market: 'Surat',           state: 'Gujarat',     minPrice: 1500, maxPrice: 3500, modalPrice: 2300, date: 'today', category: 'fruit' },
  { commodity: 'Kesar Mango',  market: 'Junagadh',        state: 'Gujarat',     minPrice: 5000, maxPrice:14000, modalPrice: 8500, date: 'today', category: 'fruit' },

  // ── Karnataka ─────────────────────────────────────────────────────────────────
  { commodity: 'Tomato',       market: 'Bangalore APMC',  state: 'Karnataka',   minPrice: 1500, maxPrice: 3000, modalPrice: 2300, date: 'today', category: 'vegetable' },
  { commodity: 'Onion',        market: 'Hubli',           state: 'Karnataka',   minPrice: 1000, maxPrice: 2200, modalPrice: 1600, date: 'today', category: 'vegetable' },
  { commodity: 'Potato',       market: 'Kolar',           state: 'Karnataka',   minPrice: 1200, maxPrice: 2200, modalPrice: 1700, date: 'today', category: 'vegetable' },
  { commodity: 'Beans',        market: 'Hassan',          state: 'Karnataka',   minPrice: 2000, maxPrice: 4500, modalPrice: 3200, date: 'today', category: 'vegetable' },
  { commodity: 'Drumstick',    market: 'Bangalore',       state: 'Karnataka',   minPrice: 2000, maxPrice: 5000, modalPrice: 3500, date: 'today', category: 'vegetable' },
  { commodity: 'Coconut',      market: 'Tumkur',          state: 'Karnataka',   minPrice: 1500, maxPrice: 3500, modalPrice: 2500, date: 'today', category: 'fruit' },
  { commodity: 'Mango',        market: 'Bangalore',       state: 'Karnataka',   minPrice: 4000, maxPrice:11000, modalPrice: 7500, date: 'today', category: 'fruit' },

  // ── Rajasthan ─────────────────────────────────────────────────────────────────
  { commodity: 'Onion',        market: 'Jaipur Mandi',    state: 'Rajasthan',   minPrice:  700, maxPrice: 1700, modalPrice: 1200, date: 'today', category: 'vegetable' },
  { commodity: 'Garlic',       market: 'Kota',            state: 'Rajasthan',   minPrice: 6000, maxPrice:14000, modalPrice: 9000, date: 'today', category: 'vegetable' },
  { commodity: 'Tomato',       market: 'Jodhpur',         state: 'Rajasthan',   minPrice: 1000, maxPrice: 2200, modalPrice: 1600, date: 'today', category: 'vegetable' },

  // ── Madhya Pradesh ────────────────────────────────────────────────────────────
  { commodity: 'Onion',        market: 'Indore Mandi',    state: 'Madhya Pradesh', minPrice: 900, maxPrice: 2000, modalPrice: 1400, date: 'today', category: 'vegetable' },
  { commodity: 'Garlic',       market: 'Mandsaur',        state: 'Madhya Pradesh', minPrice: 5000, maxPrice:13000, modalPrice: 8500, date: 'today', category: 'vegetable' },
  { commodity: 'Potato',       market: 'Bhopal',          state: 'Madhya Pradesh', minPrice: 800, maxPrice: 1600, modalPrice: 1200, date: 'today', category: 'vegetable' },
  { commodity: 'Tomato',       market: 'Indore',          state: 'Madhya Pradesh', minPrice: 1100, maxPrice: 2400, modalPrice: 1700, date: 'today', category: 'vegetable' },

  // ── Tamil Nadu ────────────────────────────────────────────────────────────────
  { commodity: 'Tomato',       market: 'Koyambedu',       state: 'Tamil Nadu',  minPrice: 1500, maxPrice: 3000, modalPrice: 2200, date: 'today', category: 'vegetable' },
  { commodity: 'Brinjal',      market: 'Hosur',           state: 'Tamil Nadu',  minPrice:  700, maxPrice: 1600, modalPrice: 1100, date: 'today', category: 'vegetable' },
  { commodity: 'Bhindi',       market: 'Madurai',         state: 'Tamil Nadu',  minPrice: 1200, maxPrice: 2500, modalPrice: 1800, date: 'today', category: 'vegetable' },
  { commodity: 'Drumstick',    market: 'Salem',           state: 'Tamil Nadu',  minPrice: 2500, maxPrice: 6000, modalPrice: 4000, date: 'today', category: 'vegetable' },
  { commodity: 'Banana',       market: 'Tiruchirapalli',  state: 'Tamil Nadu',  minPrice: 1200, maxPrice: 2800, modalPrice: 2000, date: 'today', category: 'fruit' },
  { commodity: 'Mango',        market: 'Salem',           state: 'Tamil Nadu',  minPrice: 3000, maxPrice: 9000, modalPrice: 6000, date: 'today', category: 'fruit' },
  { commodity: 'Sapota',       market: 'Krishnagiri',     state: 'Tamil Nadu',  minPrice: 1800, maxPrice: 4500, modalPrice: 3000, date: 'today', category: 'fruit' },

  // ── Haryana ───────────────────────────────────────────────────────────────────
  { commodity: 'Tomato',       market: 'Gurgaon Mandi',   state: 'Haryana',     minPrice: 1200, maxPrice: 2600, modalPrice: 1900, date: 'today', category: 'vegetable' },
  { commodity: 'Potato',       market: 'Karnal',          state: 'Haryana',     minPrice:  900, maxPrice: 1700, modalPrice: 1300, date: 'today', category: 'vegetable' },
  { commodity: 'Peas',         market: 'Hisar',           state: 'Haryana',     minPrice: 2500, maxPrice: 5000, modalPrice: 3500, date: 'today', category: 'vegetable' },
  { commodity: 'Mango',        market: 'Ambala',          state: 'Haryana',     minPrice: 3500, maxPrice: 8000, modalPrice: 5500, date: 'today', category: 'fruit' },

  // ── Andhra Pradesh ────────────────────────────────────────────────────────────
  { commodity: 'Chilli',       market: 'Guntur',          state: 'Andhra Pradesh', minPrice: 8000, maxPrice:20000, modalPrice:13000, date: 'today', category: 'spice' },
  { commodity: 'Tomato',       market: 'Madanapalle',     state: 'Andhra Pradesh', minPrice: 1200, maxPrice: 2800, modalPrice: 2000, date: 'today', category: 'vegetable' },
  { commodity: 'Onion',        market: 'Kurnool',         state: 'Andhra Pradesh', minPrice: 900, maxPrice: 2100, modalPrice: 1500, date: 'today', category: 'vegetable' },
  { commodity: 'Mango',        market: 'Vijayawada',      state: 'Andhra Pradesh', minPrice: 4000, maxPrice:12000, modalPrice: 8000, date: 'today', category: 'fruit' },
  { commodity: 'Banana',       market: 'Eluru',           state: 'Andhra Pradesh', minPrice: 1000, maxPrice: 2500, modalPrice: 1700, date: 'today', category: 'fruit' },
]

let _cache: MandiRate[] | null = null
let _cacheAt = 0
const CACHE_TTL = 5 * 60 * 1000

export async function fetchMandiRates(opts: {
  state?: string
  commodity?: string
  limit?: number
} = {}): Promise<MandiRate[]> {
  const { state, commodity, limit = 100 } = opts

  // Return cached data if fresh
  if (_cache && Date.now() - _cacheAt < CACHE_TTL) {
    let result = _cache
    if (state) result = result.filter(r => r.state.toLowerCase().includes(state.toLowerCase()))
    if (commodity) result = result.filter(r => r.commodity.toLowerCase().includes(commodity.toLowerCase()))
    return result.length ? result : getFilteredFallback(state, commodity)
  }

  const apiKey = import.meta.env.VITE_DATA_GOV_KEY as string
  if (!apiKey) return getFilteredFallback(state, commodity)

  try {
    const params = new URLSearchParams({
      format: 'json',
      limit: String(limit),
      ...(state && { 'filters[State]': state }),
      ...(commodity && { 'filters[Commodity]': commodity }),
    })

    const url = import.meta.env.DEV
      ? `/api-proxy/resource/9ef84268-d588-465a-a308-a864a43d0070?api-key=${apiKey}&${params}`
      : `/api/mandi?${params}`

    const res = await fetch(url, { signal: AbortSignal.timeout(8000) })
    if (!res.ok) throw new Error('API error')
    const json = await res.json()
    const rates = (json.records ?? []).map((r: any) => ({
      commodity:  r.commodity    ?? '',
      market:     r.market       ?? '',
      state:      r.state        ?? '',
      minPrice:   Number(r.min_price   ?? 0),
      maxPrice:   Number(r.max_price   ?? 0),
      modalPrice: Number(r.modal_price ?? 0),
      date:       r.arrival_date ?? '',
    }))
    _cache = rates
    _cacheAt = Date.now()
    if (rates.length) {
      let result = rates
      if (state) result = result.filter((r: MandiRate) => r.state.toLowerCase().includes(state.toLowerCase()))
      if (commodity) result = result.filter((r: MandiRate) => r.commodity.toLowerCase().includes(commodity.toLowerCase()))
      return result.length ? result : getFilteredFallback(state, commodity)
    }
    return getFilteredFallback(state, commodity)
  } catch {
    return _cache
      ? (() => {
          let result = _cache!
          if (state) result = result.filter(r => r.state.toLowerCase().includes(state.toLowerCase()))
          if (commodity) result = result.filter(r => r.commodity.toLowerCase().includes(commodity.toLowerCase()))
          return result.length ? result : getFilteredFallback(state, commodity)
        })()
      : getFilteredFallback(state, commodity)
  }
}

/** Return filtered fallback data matching given state/commodity */
function getFilteredFallback(state?: string, commodity?: string): MandiRate[] {
  let result = FALLBACK_RATES
  if (state) result = result.filter(r => r.state.toLowerCase().includes(state.toLowerCase()))
  if (commodity) result = result.filter(r => r.commodity.toLowerCase().includes(commodity.toLowerCase()))
  return result.length ? result : FALLBACK_RATES.slice(0, 20)
}