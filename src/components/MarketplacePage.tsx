import { useState, useMemo, useEffect } from 'react'
import type { Product, Language, AuthUser } from '../types'
import { translations } from '../data/translations'
import { categories } from '../data/mockData'
import { getMarketplaceProducts } from '../services/productService'
import ProductCard from './ProductCard'

// Buyer sees ₹5 more per unit than the farmer-set price
const BUYER_MARKUP = 5

interface Props {
  lang: Language
  onAddToCart: (p: Product) => void
  user: AuthUser | null
  guestRole: 'farmer' | 'buyer' | null
}

export default function MarketplacePage({ lang, onAddToCart, user, guestRole }: Props) {
  const t = translations[lang]
  const [products,    setProducts]    = useState<Product[]>([])
  const [loading,     setLoading]     = useState(true)
  const [search,      setSearch]      = useState('')
  const [category,    setCategory]    = useState('all')
  const [sortBy,      setSortBy]      = useState('newest')
  const [organicOnly, setOrganicOnly] = useState(false)

  const isEn = lang === 'en'
  const isHi = lang === 'hi'

  // Determine if current viewer is a buyer (applies +₹5 markup)
  const effectiveRole = user?.role ?? guestRole
  const isBuyer = effectiveRole === 'buyer'

  useEffect(() => {
    let active = true
    getMarketplaceProducts().then(list => {
      setTimeout(() => {
        if (active) {
          setProducts(list)
          setLoading(false)
        }
      }, 600)
    })
    return () => { active = false }
  }, [])

  // Apply buyer markup: create a new product object with bumped price
  const applyMarkup = (p: Product): Product => {
    if (!isBuyer) return p
    return { ...p, price: p.price + BUYER_MARKUP }
  }

  // When buyer adds to cart, they add at buyer price
  const handleAddToCart = (p: Product) => onAddToCart(applyMarkup(p))

  const filtered = useMemo(() => {
    let list = products.map(applyMarkup)
    if (search.trim()) {
      const q = search.toLowerCase()
      list = list.filter(p => p.name.toLowerCase().includes(q) || p.nameHi.includes(q) || p.location.toLowerCase().includes(q) || p.farmerName.toLowerCase().includes(q))
    }
    if (category !== 'all') list = list.filter(p => p.category === category)
    if (organicOnly)        list = list.filter(p => p.organic)
    if (sortBy === 'priceAsc')  list.sort((a, b) => a.price - b.price)
    if (sortBy === 'priceDesc') list.sort((a, b) => b.price - a.price)
    if (sortBy === 'rating')    list.sort((a, b) => b.rating - a.rating)
    if (sortBy === 'newest')    list.sort((a, b) => b.postedAt.localeCompare(a.postedAt))
    return list
  }, [products, search, category, sortBy, organicOnly, isBuyer])

  const hasActiveFilters = category !== 'all' || organicOnly || search.trim() !== ''

  const handleResetFilters = () => {
    setSearch('')
    setCategory('all')
    setOrganicOnly(false)
  }

  return (
    <div className="marketplace-page">
      <div className="marketplace-header">
        <h1 className="page-title">{t.marketplace}</h1>
        <p className="page-sub">
          {isEn 
            ? 'Buy fresh produce directly from farmers across India' 
            : isHi 
            ? 'पूरे भारत के किसानों से सीधे ताज़ी उपज खरीदें' 
            : 'भारतभरातील शेतकऱ्यांकडून थेट ताजी उपज खरेदी करा'}
        </p>

        {/* Buyer markup notice */}
        {isBuyer && (
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            marginTop: 8,
            padding: '6px 14px',
            borderRadius: 20,
            background: 'rgba(249,115,22,0.1)',
            border: '1px solid rgba(249,115,22,0.25)',
            fontSize: 12,
            color: '#f97316',
            fontWeight: 600,
          }}>
            🛒 {isEn
              ? `Buyer price includes ₹${BUYER_MARKUP} convenience fee`
              : isHi
              ? `खरीदार मूल्य में ₹${BUYER_MARKUP} सुविधा शुल्क शामिल है`
              : `खरेदीदार किंमतीत ₹${BUYER_MARKUP} सुविधा शुल्क समाविष्ट आहे`}
          </div>
        )}
      </div>

      <div className="filter-bar">
        <div className="search-wrap">
          <span>🔍</span>
          <input 
            type="text" 
            className="search-input" 
            placeholder={t.searchPlaceholder} 
            value={search} 
            onChange={e => setSearch(e.target.value)} 
          />
          {search && <button className="clear-search" onClick={() => setSearch('')}>✕</button>}
        </div>
        <select className="filter-select" value={sortBy} onChange={e => setSortBy(e.target.value)}>
          <option value="newest">{t.newest}</option>
          <option value="priceAsc">{t.priceAsc}</option>
          <option value="priceDesc">{t.priceDesc}</option>
          <option value="rating">⭐ Top Rated</option>
        </select>
        <label className="organic-toggle">
          <input type="checkbox" checked={organicOnly} onChange={e => setOrganicOnly(e.target.checked)} />
          <span className="toggle-label">🌿 {t.organic}</span>
        </label>
      </div>

      <div className="category-tabs-container">
        <div className="category-tabs">
          {categories.map(cat => (
            <button 
              key={cat.value} 
              className={`cat-tab ${category === cat.value ? 'cat-active' : ''}`} 
              onClick={() => setCategory(cat.value)}
            >
              {cat.emoji} {lang === 'hi' ? cat.labelHi : cat.label}
            </button>
          ))}
        </div>

        {hasActiveFilters && (
          <button className="clear-filters-btn animate-fade-in" onClick={handleResetFilters}>
            ✕ {isEn ? 'Clear Filters' : isHi ? 'फ़िल्टर साफ़ करें' : 'फिल्टर साफ करा'}
          </button>
        )}
      </div>

      {loading ? (
        <>
          <div className="results-info">
            {isEn ? 'Finding fresh products...' : isHi ? 'ताजे उत्पाद खोज रहे हैं...' : 'ताजी उत्पादने शोधत आहे...'}
          </div>
          <div className="products-grid">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="skeleton-card">
                <div className="skeleton-image shinning"></div>
                <div className="skeleton-line title shinning"></div>
                <div className="skeleton-line subtitle shinning"></div>
                <div className="skeleton-line price shinning"></div>
                <div className="skeleton-button shinning"></div>
              </div>
            ))}
          </div>
        </>
      ) : (
        <>
          <div className="results-info">
            {filtered.length} {isEn ? 'products found' : isHi ? 'उत्पाद मिले' : 'उत्पादने सापडली'}
          </div>

          {filtered.length > 0 ? (
            <div className="products-grid">
              {filtered.map(p => (
                <ProductCard key={p.id} product={p} lang={lang} onAddToCart={handleAddToCart} isBuyer={isBuyer} />
              ))}
            </div>
          ) : (
            <div className="no-results-state animate-fade-in">
              <div className="no-results-icon">🔍</div>
              <h3>
                {isEn 
                  ? 'No products match your criteria' 
                  : isHi 
                  ? 'आपकी खोज के अनुसार कोई उत्पाद नहीं मिला' 
                  : 'तुमच्या निकषांनुसार कोणतेही उत्पादन सापडले नाही'}
              </h3>
              <p>
                {isEn 
                  ? 'Try adjusting your filters, searching for something else, or clear active filters.' 
                  : isHi 
                  ? 'फ़िल्टर बदलने या खोज शब्द बदलने का प्रयास करें।' 
                  : 'तुमचे फिल्टर बदलून किंवा नवीन शोध घेऊन पहा.'}
              </p>
              <button className="clear-filters-action-btn" onClick={handleResetFilters}>
                {isEn ? 'Reset All Filters' : isHi ? 'सभी फ़िल्टर रीसेट करें' : 'सर्व फिल्टर रिसेट करा'}
              </button>
            </div>
          )}
        </>
      )}
    </div>
  )
}