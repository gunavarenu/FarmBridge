/**
 * BulkBuyersPage.tsx
 * ------------------
 * A directory of verified bulk buyers — hotels, food factories,
 * exporters, online grocery platforms — who buy directly from farmers.
 *
 * Farmers can:
 *  - Browse buyers by category and state
 *  - See minimum order quantity and price range
 *  - Contact them directly via WhatsApp or phone
 *  - See which products each buyer needs
 *
 * Add this as a new page in App.tsx: page === 'buyers'
 */

import { useState, useMemo } from 'react'
import type { Language } from '../../types'

interface BulkBuyer {
  id:          string
  name:        string
  type:        'hotel' | 'factory' | 'exporter' | 'online' | 'canteen' | 'trader'
  location:    string
  state:       string
  products:    string[]
  minQty:      string
  priceRange:  string
  phone:       string
  whatsapp?:   string
  verified:    boolean
  rating:      number
  description: string
  premium:     boolean   // pays above mandi rate
}

const BULK_BUYERS: BulkBuyer[] = [
  {
    id: 'b1', name: 'Pune Fresh Farms (BigBasket Supplier)', type: 'online',
    location: 'Pune', state: 'Maharashtra',
    products: ['Tomato', 'Onion', 'Potato', 'Cauliflower', 'Cabbage'],
    minQty: '500 kg/week', priceRange: '10–20% above mandi',
    phone: '9800000001', whatsapp: '9800000001',
    verified: true, rating: 4.8, premium: true,
    description: 'We supply BigBasket Maharashtra. Need consistent weekly supply. Grade A quality required. We pick up from farm.',
  },
  {
    id: 'b2', name: 'Hotel Sahyadri Group', type: 'hotel',
    location: 'Mumbai', state: 'Maharashtra',
    products: ['Mango', 'Pomegranate', 'Tomato', 'Fresh herbs', 'Cauliflower'],
    minQty: '50–200 kg/week', priceRange: '15–25% above mandi',
    phone: '9800000002', whatsapp: '9800000002',
    verified: true, rating: 4.6, premium: true,
    description: 'Chain of 12 hotels in Mumbai. We prioritise organic. Direct payment within 3 days of delivery.',
  },
  {
    id: 'b3', name: 'Nashik Grape Export Co.', type: 'exporter',
    location: 'Nashik', state: 'Maharashtra',
    products: ['Grapes', 'Pomegranate', 'Mango', 'Onion'],
    minQty: '1 tonne minimum', priceRange: '20–40% above mandi',
    phone: '9800000003',
    verified: true, rating: 4.9, premium: true,
    description: 'Exporting to UAE, UK, Europe since 2008. Only export-grade produce. We provide packaging. Payment in advance.',
  },
  {
    id: 'b4', name: 'Mother Dairy Procurement', type: 'factory',
    location: 'Navi Mumbai', state: 'Maharashtra',
    products: ['Tomato', 'Potato', 'Onion', 'Carrot', 'Peas'],
    minQty: '2 tonnes/week', priceRange: 'Mandi rate + ₹2/kg transport allowance',
    phone: '9800000004', whatsapp: '9800000004',
    verified: true, rating: 4.5, premium: false,
    description: 'Processing plant for purees, pastes and frozen vegetables. Consistent offtake guaranteed with 1-year contract.',
  },
  {
    id: 'b5', name: 'Army Canteen Services (ECHS)', type: 'canteen',
    location: 'Pune Cantonment', state: 'Maharashtra',
    products: ['All vegetables', 'Fruits', 'Grains'],
    minQty: '200 kg/week', priceRange: 'Government tender rate (stable)',
    phone: '9800000005',
    verified: true, rating: 4.3, premium: false,
    description: 'Government canteen for 5,000+ army families. Stable year-round demand. Tender-based procurement every quarter.',
  },
  {
    id: 'b6', name: 'Zomato Hyperpure Maharashtra', type: 'online',
    location: 'Thane', state: 'Maharashtra',
    products: ['Cherry Tomato', 'Baby Vegetables', 'Organic Herbs', 'Exotic Vegetables'],
    minQty: '100 kg/week', priceRange: '25–45% above mandi',
    phone: '9800000006', whatsapp: '9800000006',
    verified: true, rating: 4.7, premium: true,
    description: 'Supplying 20,000+ restaurants across Maharashtra. Premium for organic. Quality audit team visits farm first.',
  },
  {
    id: 'b7', name: 'Ratnagiri Alphonso Export', type: 'exporter',
    location: 'Ratnagiri', state: 'Maharashtra',
    products: ['Alphonso Mango', 'Hapus Mango'],
    minQty: '100 dozen', priceRange: '30–60% above local mandi',
    phone: '9800000007', whatsapp: '9800000007',
    verified: true, rating: 5.0, premium: true,
    description: 'GI-tag specialist. Exporting Hapus to Japan, Singapore, UK. Only GI-certified Ratnagiri/Devgad Alphonso accepted.',
  },
  {
    id: 'b8', name: 'ITC Agri Business Division', type: 'trader',
    location: 'Nagpur', state: 'Maharashtra',
    products: ['Wheat', 'Soybean', 'Orange', 'Cotton'],
    minQty: '5 tonnes minimum', priceRange: 'MSP + premium for quality',
    phone: '9800000008',
    verified: true, rating: 4.4, premium: true,
    description: 'Part of ITC eChoupal network. Transparent weighing. Payment same day. Pick up from village.',
  },
]

const BUYER_TYPES = [
  { value: 'all',      label: 'All Buyers',    labelHi: 'सभी खरीदार', emoji: '🏪' },
  { value: 'hotel',    label: 'Hotels',         labelHi: 'होटल',       emoji: '🏨' },
  { value: 'factory',  label: 'Factories',      labelHi: 'कारखाने',    emoji: '🏭' },
  { value: 'exporter', label: 'Exporters',      labelHi: 'निर्यातक',   emoji: '✈️' },
  { value: 'online',   label: 'Online Platforms',labelHi: 'ऑनलाइन',   emoji: '📱' },
  { value: 'canteen',  label: 'Canteens',        labelHi: 'कैंटीन',    emoji: '🏫' },
  { value: 'trader',   label: 'Traders',         labelHi: 'व्यापारी',  emoji: '🤝' },
]

interface Props { lang: Language }

export default function BulkBuyersPage({ lang }: Props) {
  const [typeFilter,  setTypeFilter]  = useState('all')
  const [search,      setSearch]      = useState('')
  const [premiumOnly, setPremiumOnly] = useState(false)

  const filtered = useMemo(() => {
    let list = [...BULK_BUYERS]
    if (typeFilter !== 'all') list = list.filter(b => b.type === typeFilter)
    if (premiumOnly)          list = list.filter(b => b.premium)
    if (search.trim()) {
      const q = search.toLowerCase()
      list = list.filter(b =>
        b.name.toLowerCase().includes(q) ||
        b.products.some(p => p.toLowerCase().includes(q)) ||
        b.location.toLowerCase().includes(q)
      )
    }
    return list
  }, [typeFilter, search, premiumOnly])

  const typeLabel = (type: string) => BUYER_TYPES.find(t => t.value === type)?.emoji + ' ' +
    (lang === 'hi' ? BUYER_TYPES.find(t => t.value === type)?.labelHi : BUYER_TYPES.find(t => t.value === type)?.label)

  const title       = lang === 'en' ? 'Direct Bulk Buyers' : lang === 'hi' ? 'थोक खरीदार' : 'थेट मोठे खरेदीदार'
  const subtitle    = lang === 'en' ? 'Hotels, factories, exporters who buy directly from farmers at premium prices'
                    : lang === 'hi' ? 'होटल, कारखाने, निर्यातक — जो किसान से सीधे प्रीमियम दाम पर खरीदते हैं'
                    : 'हॉटेल, कारखाने, निर्यातक — थेट शेतकऱ्यांकडून प्रीमियम भावात खरेदी करतात'
  const premiumLabel= lang === 'en' ? 'Premium Price Only' : lang === 'hi' ? 'केवल प्रीमियम मूल्य' : 'केवळ प्रीमियम किंमत'
  const callLabel   = lang === 'en' ? 'Call' : lang === 'hi' ? 'कॉल करें' : 'कॉल करा'
  const waLabel     = lang === 'en' ? 'WhatsApp' : 'WhatsApp'
  const minQtyLabel = lang === 'en' ? 'Min. Qty' : lang === 'hi' ? 'न्यूनतम मात्रा' : 'किमान प्रमाण'
  const priceLabel  = lang === 'en' ? 'Price' : lang === 'hi' ? 'मूल्य' : 'किंमत'
  const needsLabel  = lang === 'en' ? 'Needs' : lang === 'hi' ? 'जरूरत' : 'गरज'
  const verifiedLabel = lang === 'en' ? 'Verified' : lang === 'hi' ? 'सत्यापित' : 'सत्यापित'
  const premiumTag  = lang === 'en' ? 'Above Mandi' : lang === 'hi' ? 'मंडी से ऊपर' : 'मंडीपेक्षा जास्त'
  const foundLabel  = lang === 'en' ? `${filtered.length} buyers found`
                    : lang === 'hi' ? `${filtered.length} खरीदार मिले`
                    : `${filtered.length} खरेदीदार सापडले`

  return (
    <div className="bulk-page">
      <div className="bulk-header">
        <h1 className="page-title">{title}</h1>
        <p className="page-sub">{subtitle}</p>
      </div>

      {/* Filters */}
      <div className="bulk-filters">
        <div className="search-wrap" style={{ flex: 1 }}>
          <span>🔍</span>
          <input className="search-input" placeholder={lang === 'en' ? 'Search buyers or products…' : 'खरीदार या उत्पाद खोजें…'}
            value={search} onChange={e => setSearch(e.target.value)} />
          {search && <button className="clear-search" onClick={() => setSearch('')}>✕</button>}
        </div>
        <label className="organic-toggle">
          <input type="checkbox" checked={premiumOnly} onChange={e => setPremiumOnly(e.target.checked)} />
          <span className="toggle-label">💰 {premiumLabel}</span>
        </label>
      </div>

      <div className="category-tabs" style={{ marginBottom: '1rem' }}>
        {BUYER_TYPES.map(t => (
          <button key={t.value} className={`cat-tab ${typeFilter === t.value ? 'cat-active' : ''}`}
            onClick={() => setTypeFilter(t.value)}>
            {t.emoji} {lang === 'hi' ? t.labelHi : t.label}
          </button>
        ))}
      </div>

      <div className="results-info">{foundLabel}</div>

      {/* Buyer cards */}
      <div className="bulk-grid">
        {filtered.map(buyer => (
          <div key={buyer.id} className={`bulk-card ${buyer.premium ? 'bulk-premium' : ''}`}>
            {/* Header */}
            <div className="bulk-card-header">
              <div className="bulk-type-badge">{typeLabel(buyer.type)}</div>
              <div style={{ display: 'flex', gap: 6 }}>
                {buyer.verified && <span className="bulk-verified">✓ {verifiedLabel}</span>}
                {buyer.premium  && <span className="bulk-premium-tag">💰 {premiumTag}</span>}
              </div>
            </div>

            <h3 className="bulk-name">{buyer.name}</h3>
            <div className="bulk-location">📍 {buyer.location}, {buyer.state}</div>

            {/* Rating */}
            <div className="product-rating" style={{ marginBottom: 8 }}>
              <span className="stars">{'★'.repeat(Math.round(buyer.rating))}{'☆'.repeat(5 - Math.round(buyer.rating))}</span>
              <span className="rating-num">{buyer.rating}</span>
            </div>

            <p className="bulk-desc">{buyer.description}</p>

            {/* Products needed */}
            <div className="bulk-needs">
              <span className="bulk-needs-label">{needsLabel}:</span>
              <div className="bulk-tags">
                {buyer.products.slice(0, 4).map((p, i) => (
                  <span key={i} className="bulk-tag">{p}</span>
                ))}
                {buyer.products.length > 4 && <span className="bulk-tag bulk-tag-more">+{buyer.products.length - 4}</span>}
              </div>
            </div>

            {/* Price & Qty */}
            <div className="bulk-meta">
              <div className="bulk-meta-item">
                <span className="bulk-meta-label">📦 {minQtyLabel}</span>
                <span className="bulk-meta-val">{buyer.minQty}</span>
              </div>
              <div className="bulk-meta-item">
                <span className="bulk-meta-label">💰 {priceLabel}</span>
                <span className="bulk-meta-val" style={{ color: 'var(--green)', fontWeight: 700 }}>{buyer.priceRange}</span>
              </div>
            </div>

            {/* Action buttons */}
            <div className="bulk-actions">
              <a href={`tel:${buyer.phone}`} className="btn-bulk-call">📞 {callLabel}</a>
              {buyer.whatsapp && (
                <a href={`https://wa.me/91${buyer.whatsapp}?text=Hello, I am a farmer from FarmBridge app. I want to sell my produce directly.`}
                  target="_blank" rel="noopener noreferrer" className="btn-bulk-wa">
                  💬 {waLabel}
                </a>
              )}
            </div>
          </div>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="no-results">
          <div className="no-results-icon">🏪</div>
          <p>{lang === 'en' ? 'No buyers found. Try a different filter.' : lang === 'hi' ? 'कोई खरीदार नहीं मिला।' : 'कोणताही खरेदीदार सापडला नाही.'}</p>
        </div>
      )}

      {/* Register as buyer CTA */}
      <div className="bulk-cta">
        <h3>{lang === 'en' ? 'Are you a bulk buyer?' : lang === 'hi' ? 'क्या आप थोक खरीदार हैं?' : 'तुम्ही मोठे खरेदीदार आहात का?'}</h3>
        <p>{lang === 'en' ? 'Register your business to connect directly with thousands of farmers across India.'
           : lang === 'hi' ? 'हजारों किसानों से सीधे जुड़ने के लिए अपना व्यवसाय पंजीकृत करें।'
           : 'हजारो शेतकऱ्यांशी थेट जोडण्यासाठी आपला व्यवसाय नोंदणी करा.'}</p>
        <button className="btn-primary">
          {lang === 'en' ? '🏪 Register as Buyer' : lang === 'hi' ? '🏪 खरीदार के रूप में पंजीकरण करें' : '🏪 खरेदीदार म्हणून नोंदणी करा'}
        </button>
      </div>
    </div>
  )
}