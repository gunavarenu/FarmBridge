import { useState, useEffect, useMemo } from 'react'
import { supabase } from '../../config/supabaseClient'
import type { Language } from '../../types'

interface Props {
  lang: Language
  onAddToCart?: (p: any) => void
}

interface FarmerWithProducts {
  id: string
  name: string
  phone: string
  village: string
  taluka: string
  district: string
  state: string
  role: string
  avatar_url: string
  bio: string
  farm_size_acres: number
  experience: number
  verified: boolean
  created_at: string
  products: ProductRow[]
}

interface ProductRow {
  id: string
  farmer_id: string
  name: string
  name_hi: string
  category: string
  price: number
  unit: string
  quantity: number
  description: string
  image_url: string
  organic: boolean
  state: string
  location_label: string
  created_at: string
  active: boolean
}

const CATEGORY_ICONS: Record<string, string> = {
  vegetable: '🥦',
  fruit:     '🍎',
  grain:     '🌾',
  spice:     '🌶️',
}

const CATEGORY_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  vegetable: { bg: '#f0fdf4', text: '#15803d', border: '#bbf7d0' },
  fruit:     { bg: '#fff7ed', text: '#c2410c', border: '#fed7aa' },
  grain:     { bg: '#fefce8', text: '#a16207', border: '#fef08a' },
  spice:     { bg: '#fdf2f8', text: '#be185d', border: '#f9a8d4' },
}

const L = {
  en: {
    title: 'Farmer Information Panel',
    subtitle: 'Real produce listed by registered farmers — directly from our database',
    search: 'Search farmers, crops, location…',
    allCats: 'All Categories',
    noData: 'No farmer listings found.',
    noDataSub: 'Farmers haven\'t uploaded produce yet. Check back soon!',
    refresh: 'Refresh',
    liveDb: 'Live Database',
    lastUpdated: 'Last updated',
    products: 'products',
    product: 'product',
    organic: 'Organic',
    farmerSince: 'Farmer since',
    farmSize: 'Farm size',
    experience: 'Experience',
    acres: 'acres',
    years: 'years',
    location: 'Location',
    contact: 'Contact',
    addToCart: 'Add to Cart',
    viewAll: 'All Farmers',
    onlyVeg: 'Vegetables',
    onlyFruit: 'Fruits',
    onlyGrain: 'Grains',
    onlySpice: 'Spices',
    loading: 'Fetching real data from database…',
    perKg: '/kg',
  },
  hi: {
    title: 'किसान सूचना पैनल',
    subtitle: 'पंजीकृत किसानों द्वारा सूचीबद्ध वास्तविक उपज — हमारे डेटाबेस से',
    search: 'किसान, फसल, स्थान खोजें…',
    allCats: 'सभी श्रेणियां',
    noData: 'कोई किसान सूची नहीं मिली।',
    noDataSub: 'किसानों ने अभी तक उपज अपलोड नहीं की है।',
    refresh: 'रिफ्रेश',
    liveDb: 'लाइव डेटाबेस',
    lastUpdated: 'अंतिम अपडेट',
    products: 'उत्पाद',
    product: 'उत्पाद',
    organic: 'जैविक',
    farmerSince: 'किसान कब से',
    farmSize: 'खेत का आकार',
    experience: 'अनुभव',
    acres: 'एकड़',
    years: 'वर्ष',
    location: 'स्थान',
    contact: 'संपर्क',
    addToCart: 'कार्ट में जोड़ें',
    viewAll: 'सभी किसान',
    onlyVeg: 'सब्ज़ियाँ',
    onlyFruit: 'फल',
    onlyGrain: 'अनाज',
    onlySpice: 'मसाले',
    loading: 'डेटाबेस से डेटा लोड हो रहा है…',
    perKg: '/किलो',
  },
  mr: {
    title: 'शेतकरी माहिती पॅनेल',
    subtitle: 'नोंदणीकृत शेतकऱ्यांनी अपलोड केलेली खरी उत्पादने — थेट आमच्या डेटाबेसमधून',
    search: 'शेतकरी, पीक, ठिकाण शोधा…',
    allCats: 'सर्व श्रेणी',
    noData: 'कोणतीही शेतकरी यादी सापडली नाही.',
    noDataSub: 'शेतकऱ्यांनी अद्याप उत्पादने अपलोड केलेली नाहीत.',
    refresh: 'रिफ्रेश',
    liveDb: 'लाइव्ह डेटाबेस',
    lastUpdated: 'अंतिम अपडेट',
    products: 'उत्पादने',
    product: 'उत्पादन',
    organic: 'सेंद्रिय',
    farmerSince: 'शेतकरी कधीपासून',
    farmSize: 'शेत आकार',
    experience: 'अनुभव',
    acres: 'एकर',
    years: 'वर्षे',
    location: 'ठिकाण',
    contact: 'संपर्क',
    addToCart: 'कार्टमध्ये जोडा',
    viewAll: 'सर्व शेतकरी',
    onlyVeg: 'भाजीपाला',
    onlyFruit: 'फळे',
    onlyGrain: 'धान्य',
    onlySpice: 'मसाले',
    loading: 'डेटाबेसमधून डेटा लोड होत आहे…',
    perKg: '/किलो',
  },
}

function maskPhone(phone: string): string {
  const digits = phone.replace(/\D/g, '')
  if (digits.length >= 10) {
    const last = digits.slice(-10)
    return `+91 ${last.slice(0, 2)}XXXXXX${last.slice(-2)}`
  }
  return phone ? '📞 Contact via FarmBridge' : '—'
}

export default function FarmerInfoPanel({ lang, onAddToCart }: Props) {
  const lx = L[lang]
  const [farmers,       setFarmers]       = useState<FarmerWithProducts[]>([])
  const [loading,       setLoading]       = useState(true)
  const [search,        setSearch]        = useState('')
  const [catFilter,     setCatFilter]     = useState<string>('all')
  const [lastRefreshed, setLastRefreshed] = useState<Date | null>(null)
  const [dbOnline,      setDbOnline]      = useState(!!supabase)
  const [expandedId,    setExpandedId]    = useState<string | null>(null)
  const [addedMap,      setAddedMap]      = useState<Record<string, boolean>>({})

  useEffect(() => { loadData() }, [])

  async function loadData() {
    setLoading(true)
    setDbOnline(!!supabase && navigator.onLine)

    // Load local storage products first
    let localProducts: any[] = []
    try {
      const stored = localStorage.getItem('farmbridge_local_products')
      if (stored) {
        const list = JSON.parse(stored)
        localProducts = list.map((p: any) => ({
          id: p.id,
          farmer_id: p.farmerId || p.farmer_id || '',
          name: p.name,
          name_hi: p.nameHi || p.name,
          category: p.category,
          price: p.price,
          unit: p.unit,
          quantity: p.quantity,
          description: p.description,
          image_url: p.image || '',
          organic: p.organic,
          state: p.state,
          location_label: p.location,
          created_at: p.postedAt || new Date().toISOString(),
          active: true
        }))
      }
    } catch (e) {
      console.warn('Error reading local storage products:', e)
    }

    const loadOffline = () => {
      // Offline mode — only show products that were saved locally (real, user-created)
      // Never show hardcoded fake demo data
      const map = new Map<string, FarmerWithProducts>()

      localProducts.forEach(p => {
        const fid = p.farmer_id
        if (map.has(fid)) {
          map.get(fid)!.products.push(p)
        } else {
          map.set(fid, {
            id: fid,
            name: 'Local Farmer',
            phone: '',
            village: p.location_label || '',
            taluka: '',
            district: '',
            state: p.state || 'Maharashtra',
            role: 'farmer',
            avatar_url: '👨‍🌾',
            bio: '',
            farm_size_acres: 0,
            experience: 0,
            verified: false,
            created_at: new Date().toISOString(),
            products: [p]
          })
        }
      })

      setFarmers(Array.from(map.values()))
      setLastRefreshed(new Date())
      setLoading(false)
    }

    if (!supabase || !navigator.onLine) {
      loadOffline()
      return
    }

    try {
      // 1. Fetch all farmers (excluding buyers & founders)
      const { data: farmerRows, error: farmerErr } = await supabase
        .from('farmers')
        .select('*')
        .eq('role', 'farmer')
        .order('created_at', { ascending: false })

      if (farmerErr || !farmerRows) {
        console.warn('Error fetching farmers from Supabase, using local fallback:', farmerErr)
        loadOffline()
        return
      }

      // 2. Fetch all active products
      const { data: productRows, error: productErr } = await supabase
        .from('products')
        .select('*')
        .eq('active', true)
        .in('category', ['vegetable', 'fruit', 'grain', 'spice'])
        .order('created_at', { ascending: false })

      if (productErr) {
        console.warn('Error fetching products from Supabase:', productErr)
      }

      const dbProducts: ProductRow[] = productRows ?? []
      // Merge DB products with locally-saved products (offline-created)
      const localProductsMapped = localProducts.map((p: any) => ({
        id: p.id, farmer_id: p.farmerId || p.farmer_id || '',
        name: p.name, name_hi: p.nameHi || p.name,
        category: p.category, price: p.price, unit: p.unit,
        quantity: p.quantity, description: p.description,
        image_url: p.image || p.image_url,
        organic: p.organic, state: p.state,
        location_label: p.location || p.location_label,
        created_at: p.postedAt || new Date().toISOString(),
        active: true
      }))
      const dbProductIds = new Set(dbProducts.map(p => p.id))
      const allProducts = [...dbProducts, ...localProductsMapped.filter((p: any) => !dbProductIds.has(p.id))]

      // 3. Group products by farmer
      const farmerMap = new Map<string, ProductRow[]>()
      allProducts.forEach(p => {
        if (!farmerMap.has(p.farmer_id)) farmerMap.set(p.farmer_id, [])
        farmerMap.get(p.farmer_id)!.push(p)
      })

      // 4. Merge — only show farmers who have at least 1 active product
      const activeFarmers: FarmerWithProducts[] = farmerRows
        .map(f => ({ ...f, products: farmerMap.get(f.id) ?? [] }))

      // For offline-created products with no DB farmer record, still show them
      const dbFarmerIds = new Set(farmerRows.map(f => f.id))
      const localOnlyFarmerMap = new Map<string, FarmerWithProducts>()
      allProducts.forEach(p => {
        if (!dbFarmerIds.has(p.farmer_id)) {
          if (!localOnlyFarmerMap.has(p.farmer_id)) {
            localOnlyFarmerMap.set(p.farmer_id, {
              id: p.farmer_id,
              name: 'Farmer',
              phone: '',
              village: p.location_label || '',
              taluka: '',
              district: '',
              state: p.state || 'Maharashtra',
              role: 'farmer',
              avatar_url: '👨‍🌾',
              bio: '',
              farm_size_acres: 0,
              experience: 0,
              verified: false,
              created_at: new Date().toISOString(),
              products: []
            })
          }
          localOnlyFarmerMap.get(p.farmer_id)!.products.push(p)
        }
      })
      localOnlyFarmerMap.forEach(f => activeFarmers.push(f))

      const finalFarmers = activeFarmers.filter(f => f.products.length > 0)

      setFarmers(finalFarmers)
      setLastRefreshed(new Date())
    } catch (err) {
      console.warn('FarmerInfoPanel load error, using local fallback:', err)
      loadOffline()
    } finally {
      setLoading(false)
    }
  }

  const filtered = useMemo(() => {
    let list = [...farmers]
    if (catFilter !== 'all') {
      list = list.map(f => ({ ...f, products: f.products.filter(p => p.category === catFilter) })).filter(f => f.products.length > 0)
    }
    if (search.trim()) {
      const q = search.toLowerCase()
      list = list.filter(f =>
        f.name.toLowerCase().includes(q) ||
        f.district.toLowerCase().includes(q) ||
        f.village.toLowerCase().includes(q) ||
        f.state.toLowerCase().includes(q) ||
        f.products.some(p => p.name.toLowerCase().includes(q) || (p.name_hi && p.name_hi.includes(q)))
      )
    }
    return list
  }, [farmers, search, catFilter])

  const totalProducts = filtered.reduce((s, f) => s + f.products.length, 0)

  const catTabs = [
    { key: 'all',       label: lx.viewAll,   icon: '🌱' },
    { key: 'vegetable', label: lx.onlyVeg,   icon: '🥦' },
    { key: 'fruit',     label: lx.onlyFruit, icon: '🍎' },
    { key: 'grain',     label: lx.onlyGrain, icon: '🌾' },
    { key: 'spice',     label: lx.onlySpice, icon: '🌶️' },
  ]

  return (
    <div className="farmer-info-panel">
      {/* ─── PAGE HEADER ─── */}
      <div className="fip-header">
        <div className="fip-header-bg" />
        <div className="fip-header-content">
          <div className="fip-title-row">
            <div className="fip-icon-box">🌾</div>
            <div>
              <h1 className="fip-title">{lx.title}</h1>
              <p className="fip-subtitle">{lx.subtitle}</p>
            </div>
          </div>

          <div className="fip-meta-row">
            {/* DB live badge */}
            <div className={`fip-db-badge ${dbOnline ? 'fip-db-online' : 'fip-db-offline'}`}>
              <span className={`fip-db-dot ${dbOnline ? 'fip-dot-online' : 'fip-dot-offline'}`} />
              {dbOnline ? `🗄 ${lx.liveDb}` : '📴 Offline Mode'}
            </div>
            {lastRefreshed && (
              <div className="fip-last-updated">
                🕐 {lx.lastUpdated}: {lastRefreshed.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
              </div>
            )}
            <div className="fip-count-badge">
              👨‍🌾 {filtered.length} farmers · 📦 {totalProducts} {totalProducts === 1 ? lx.product : lx.products}
            </div>
            <button className="fip-refresh-btn" onClick={loadData} disabled={loading}>
              <span style={{ display: 'inline-block', animation: loading ? 'spin 1s linear infinite' : 'none' }}>🔄</span>
              {lx.refresh}
            </button>
          </div>
        </div>
      </div>

      {/* ─── FILTERS ─── */}
      <div className="fip-filters">
        <div className="fip-search-wrap">
          <span className="fip-search-icon">🔍</span>
          <input
            type="text"
            className="fip-search-input"
            placeholder={lx.search}
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          {search && (
            <button className="fip-clear-btn" onClick={() => setSearch('')}>✕</button>
          )}
        </div>

        <div className="fip-cat-tabs">
          {catTabs.map(tab => (
            <button
              key={tab.key}
              className={`fip-cat-tab ${catFilter === tab.key ? 'fip-cat-active' : ''}`}
              onClick={() => setCatFilter(tab.key)}
            >
              {tab.icon} {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* ─── CONTENT ─── */}
      <div className="fip-content">
        {loading ? (
          <div className="fip-loading">
            <div className="fip-loading-spinner" />
            <p className="fip-loading-text">{lx.loading}</p>
            <p className="fip-loading-sub">Querying Supabase — farmers &amp; products table…</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="fip-empty">
            <div className="fip-empty-icon">🌱</div>
            <h3 className="fip-empty-title">{lx.noData}</h3>
            <p className="fip-empty-sub">{lx.noDataSub}</p>
            <button className="fip-refresh-btn" onClick={loadData} style={{ marginTop: '16px' }}>
              🔄 {lx.refresh}
            </button>
          </div>
        ) : (
          <div className="fip-grid">
            {filtered.map(farmer => {
              const isExpanded = expandedId === farmer.id
              const location = [farmer.village, farmer.taluka, farmer.district, farmer.state].filter(Boolean).join(', ')
              const joinYear = farmer.created_at ? new Date(farmer.created_at).getFullYear() : '—'

              return (
                <div key={farmer.id} className={`fip-farmer-card ${isExpanded ? 'fip-card-expanded' : ''}`}>
                  {/* Farmer Card Header */}
                  <div className="fip-farmer-header" onClick={() => setExpandedId(isExpanded ? null : farmer.id)}>
                    <div className="fip-avatar-wrap">
                      <div className="fip-avatar">
                        {farmer.avatar_url && farmer.avatar_url.length <= 4
                          ? farmer.avatar_url
                          : (farmer.avatar_url?.startsWith('http')
                            ? <img src={farmer.avatar_url} alt={farmer.name} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }} />
                            : '👨‍🌾')}
                      </div>
                      {farmer.verified && (
                        <div className="fip-verified-badge" title="Verified Farmer">✓</div>
                      )}
                    </div>

                    <div className="fip-farmer-info">
                      <div className="fip-farmer-name">
                        {farmer.name || 'Unknown Farmer'}
                        {farmer.role === 'founder' && <span className="fip-founder-badge">👑</span>}
                      </div>
                      <div className="fip-farmer-location">📍 {location || 'Location not set'}</div>
                      {farmer.bio && <div className="fip-farmer-bio">{farmer.bio}</div>}
                    </div>

                    <div className="fip-farmer-stats">
                      <div className="fip-stat-chip fip-stat-products">
                        📦 {farmer.products.length} {farmer.products.length === 1 ? lx.product : lx.products}
                      </div>
                      {farmer.experience > 0 && (
                        <div className="fip-stat-chip fip-stat-exp">
                          ⏳ {farmer.experience} {lx.years}
                        </div>
                      )}
                      {farmer.farm_size_acres > 0 && (
                        <div className="fip-stat-chip fip-stat-farm">
                          🌾 {farmer.farm_size_acres} {lx.acres}
                        </div>
                      )}
                    </div>

                    <div className="fip-expand-btn">
                      <span style={{ display: 'inline-block', transform: isExpanded ? 'rotate(180deg)' : 'rotate(0)', transition: 'transform 0.3s ease', fontSize: '16px' }}>▼</span>
                    </div>
                  </div>

                  {/* Farmer meta info strip */}
                  <div className="fip-farmer-meta">
                    <span>📞 {maskPhone(farmer.phone)}</span>
                    <span>📅 {lx.farmerSince} {joinYear}</span>
                    <span>🏡 {farmer.state}</span>
                  </div>

                  {/* Products Grid */}
                  <div className="fip-products-section">
                    <div className="fip-products-label">
                      🛒 Listed Produce
                    </div>
                    <div className="fip-products-grid">
                      {(isExpanded ? farmer.products : farmer.products.slice(0, 4)).map(product => {
                        const catStyle = CATEGORY_COLORS[product.category] ?? CATEGORY_COLORS.vegetable
                        const catIcon  = CATEGORY_ICONS[product.category] ?? '🌿'
                        const isAdded  = addedMap[product.id]

                        return (
                          <div key={product.id} className="fip-product-card">
                            {/* Product image / icon */}
                            <div className="fip-product-img-wrap" style={{ background: catStyle.bg }}>
                              {product.image_url && product.image_url.startsWith('http') ? (
                                <img src={product.image_url} alt={product.name} className="fip-product-img" />
                              ) : (
                                <div className="fip-product-emoji">{catIcon}</div>
                              )}
                              {product.organic && (
                                <div className="fip-organic-badge">🌿 {lx.organic}</div>
                              )}
                            </div>

                            <div className="fip-product-body">
                              <div className="fip-product-name">{product.name}</div>
                              {product.name_hi && product.name_hi !== product.name && (
                                <div className="fip-product-name-hi">{product.name_hi}</div>
                              )}

                              <div className="fip-product-cat" style={{ background: catStyle.bg, color: catStyle.text, border: `1px solid ${catStyle.border}` }}>
                                {catIcon} {product.category.charAt(0).toUpperCase() + product.category.slice(1)}
                              </div>

                              <div className="fip-product-price">
                                ₹{product.price}
                                <span className="fip-product-unit">/{product.unit}</span>
                              </div>

                              <div className="fip-product-qty">
                                Available: <strong>{product.quantity} {product.unit}</strong>
                              </div>

                              {product.description && (
                                <div className="fip-product-desc">{product.description}</div>
                              )}

                              {onAddToCart && (
                                <button
                                  className={`fip-add-btn ${isAdded ? 'fip-added' : ''}`}
                                  onClick={() => {
                                    onAddToCart({
                                      id: product.id, name: product.name, nameHi: product.name_hi,
                                      category: product.category, price: product.price, unit: product.unit,
                                      quantity: product.quantity, location: product.location_label || product.state,
                                      state: product.state, farmerName: farmer.name, farmerPhone: farmer.phone,
                                      image: product.image_url || '', description: product.description,
                                      organic: product.organic, postedAt: product.created_at?.split('T')[0] ?? '',
                                      rating: 4.8, reviews: 0, farmerId: farmer.id,
                                    })
                                    setAddedMap(prev => ({ ...prev, [product.id]: true }))
                                    setTimeout(() => setAddedMap(prev => ({ ...prev, [product.id]: false })), 2000)
                                  }}
                                >
                                  {isAdded ? '✓ Added!' : `🛒 ${lx.addToCart}`}
                                </button>
                              )}
                            </div>
                          </div>
                        )
                      })}

                      {/* Show-more tile */}
                      {!isExpanded && farmer.products.length > 4 && (
                        <div className="fip-more-tile" onClick={() => setExpandedId(farmer.id)}>
                          <div className="fip-more-icon">+{farmer.products.length - 4}</div>
                          <div className="fip-more-label">more products</div>
                        </div>
                      )}
                    </div>

                    {isExpanded && farmer.products.length > 4 && (
                      <button className="fip-collapse-btn" onClick={() => setExpandedId(null)}>
                        ▲ Show less
                      </button>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
