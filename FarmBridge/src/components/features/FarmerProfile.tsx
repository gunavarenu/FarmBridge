/**
 * FarmerProfile.tsx
 * Feature 6 — Farmer Profile Page
 * Public profile showing farmer's listings, ratings, certifications,
 * farm details and contact options
 */
import { useState, useEffect } from 'react'
import type { Language, AuthUser, Product } from '../../types'
import { getFarmerProfile, updateFarmerProfile, type FarmerProfileData } from '../../services/authService'
import { getMarketplaceProducts } from '../../services/productService'
import { logUserActivity } from '../../services/activityService'

interface Props { lang: Language; onAddToCart: (p: any) => void; user: AuthUser | null }

/** Read locally-stored products for a specific farmer */
function getLocalProductsForUser(userId: string): Product[] {
  try {
    const data = localStorage.getItem('farmbridge_local_products')
    const all: Product[] = data ? JSON.parse(data) : []
    return all.filter(p => p.farmerId === userId)
  } catch {
    return []
  }
}

const DEFAULT_PROFILE: FarmerProfileData = {
  id: '',
  name: '',
  phone: '',
  village: '',
  district: '',
  state: 'Maharashtra',
  verified: false,
  avatarUrl: '👨‍🌾',
  bio: '',
  farmSizeAcres: 0,
  experience: 0,
  taluka: '',
  birthDate: '',
  role: 'farmer'
}

const CERTIFICATIONS: string[] = []
const CROPS: string[] = []
const BADGES: string[] = []
const REVIEWS: any[] = []

export default function FarmerProfile({ lang, onAddToCart, user }: Props) {
  const [tab, setTab] = useState<'listings' | 'reviews' | 'about'>('listings')
  const [profile, setProfile] = useState<FarmerProfileData | null>(null)
  const [farmerProducts, setFarmerProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [isEditing, setIsEditing] = useState(false)

  // Edit form state
  const [editForm, setEditForm] = useState({
    name: '',
    village: '',
    district: '',
    state: 'Maharashtra',
    bio: '',
    farmSizeAcres: 0,
    experience: 0,
    avatarUrl: '👨‍🌾'
  })

  const [errorMsg, setErrorMsg] = useState('')
  const [successMsg, setSuccessMsg] = useState('')
  const [saving, setSaving] = useState(false)

  const loadData = async () => {
    setLoading(true)
    if (user) {
      try {
        const dbProfile = await getFarmerProfile(user.id)
        if (dbProfile) {
          setProfile(dbProfile)
          setEditForm({
            name: dbProfile.name,
            village: dbProfile.village,
            district: dbProfile.district,
            state: dbProfile.state || 'Maharashtra',
            bio: dbProfile.bio,
            farmSizeAcres: dbProfile.farmSizeAcres,
            experience: dbProfile.experience,
            avatarUrl: dbProfile.avatarUrl || '👨‍🌾'
          })

          const allProds = await getMarketplaceProducts()
          // Also merge locally-stored products for this farmer
          const localProds = getLocalProductsForUser(user.id)
          const combined = [...allProds.filter(p => p.farmerId === user.id), ...localProds.filter(lp => !allProds.some(p => p.id === lp.id))]
          setFarmerProducts(combined)
          setLoading(false)
          return
        }
      } catch (err) {
        console.error('Error loading dynamic farmer profile:', err)
      }
    }

    // Default Fallback (Empty State)
    setProfile(user ? {
      ...DEFAULT_PROFILE,
      id: user.id,
      name: user.name || 'Farmer',
      phone: user.phone || ''
    } : DEFAULT_PROFILE)

    const allProds = await getMarketplaceProducts()
    const localProds = user ? getLocalProductsForUser(user.id) : []
    const combined = user
      ? [...allProds.filter(p => p.farmerId === user.id), ...localProds.filter(lp => !allProds.some(p => p.id === lp.id))]
      : []
    setFarmerProducts(combined)
    setLoading(false)
  }

  useEffect(() => {
    loadData()
  }, [user])

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return
    setErrorMsg('')
    setSuccessMsg('')
    setSaving(true)

    try {
      const res = await updateFarmerProfile({
        id: user.id,
        name: editForm.name,
        village: editForm.village,
        district: editForm.district,
        state: editForm.state,
        bio: editForm.bio,
        farmSizeAcres: editForm.farmSizeAcres,
        experience: editForm.experience,
        avatarUrl: editForm.avatarUrl
      })

      if (res.success) {
        logUserActivity(
          user,
          'update_profile',
          `Updated profile details: ${editForm.name} (Location: ${editForm.village}, ${editForm.district}, ${editForm.state})`,
          editForm
        )
        setSuccessMsg(lang === 'en' ? 'Profile updated!' : 'प्रोफ़ाइल सहेज ली गई!')
        setIsEditing(false)
        await loadData()
      } else {
        setErrorMsg(res.error || 'Failed to update profile.')
      }
    } catch (err) {
      setErrorMsg((err as Error).message)
    } finally {
      setSaving(false)
    }
  }

  const T = {
    en: {
      listings: 'Listings', reviews: 'Reviews', about: 'About Farm',
      totalSales: 'Total Sales', repeatBuyers: 'Repeat Buyers', rating: 'Rating',
      experience: 'Years Experience', farmSize: 'Farm Size',
      call: 'Call Farmer', wa: 'WhatsApp', sendRequest: 'Send Buy Request',
      certifications: 'Certifications', crops: 'Main Crops', joinedOn: 'On FarmBridge since',
      bio: 'About', noListings: 'No active listings right now.',
      acres: 'acres', years: 'years',
    },
    hi: {
      listings: 'लिस्टिंग', reviews: 'समीक्षाएं', about: 'खेत के बारे में',
      totalSales: 'कुल बिक्री', repeatBuyers: 'नियमित खरीदार', rating: 'रेटिंग',
      experience: 'वर्ष अनुभव', farmSize: 'खेत का आकार',
      call: 'किसान को कॉल करें', wa: 'WhatsApp', sendRequest: 'खरीद अनुरोध भेजें',
      certifications: 'प्रमाणपत्र', crops: 'मुख्य फसलें', joinedOn: 'FarmBridge पर कब से',
      bio: 'परिचय', noListings: 'अभी कोई सक्रिय लिस्टिंग नहीं।',
      acres: 'एकड़', years: 'वर्ष',
    },
    mr: {
      listings: 'यादी', reviews: 'समीक्षा', about: 'शेताबद्दल',
      totalSales: 'एकूण विक्री', repeatBuyers: 'नियमित खरेदीदार', rating: 'रेटिंग',
      experience: 'वर्षे अनुभव', farmSize: 'शेताचा आकार',
      call: 'शेतकऱ्याला कॉल करा', wa: 'WhatsApp', sendRequest: 'खरेदी विनंती पाठवा',
      certifications: 'प्रमाणपत्रे', crops: 'मुख्य पिके', joinedOn: 'FarmBridge वर कधीपासून',
      bio: 'परिचय', noListings: 'सध्या कोणतीही सक्रिय यादी नाही.',
      acres: 'एकर', years: 'वर्षे',
    },
  }[lang]

  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '300px' }}>
        <span className="btn-spinner" style={{ borderLeftColor: 'var(--primary-600)', width: '30px', height: '30px' }} />
        <p style={{ marginTop: '1rem', color: 'var(--gray-500)' }}>
          {lang === 'en' ? 'Loading profile...' : 'प्रोफ़ाइल लोड हो रही है...'}
        </p>
      </div>
    )
  }

  const fp = profile || DEFAULT_PROFILE
  const displayBio = fp.bio || (lang === 'hi' ? 'कोई विवरण नहीं उपलब्ध है।' : lang === 'mr' ? 'कोणतीही माहिती उपलब्ध नाही.' : 'No bio provided.')

  return (
    <div className="profile-page">
      {/* Hero banner */}
      <div className="profile-banner">
        <div className="profile-banner-bg" />
        <div className="profile-hero">
          <div className="profile-avatar">{fp.avatarUrl || '👨‍🌾'}</div>
          <div className="profile-info">
            <h1 className="profile-name">{fp.name}</h1>
            <div className="profile-location">📍 {fp.village}, {fp.district}, {fp.state}</div>
            <div className="profile-badges">
              {BADGES.map((b, i) => <span key={i} className="profile-badge">{b}</span>)}
            </div>
          </div>
          <div className="profile-actions">
            {user && fp.id === user.id && (
              <button className="btn-gps" onClick={() => { setIsEditing(!isEditing); setErrorMsg(''); setSuccessMsg('') }} style={{ background: 'var(--primary-50)', color: 'var(--primary-800)', border: '1px solid var(--primary-200)' }}>
                {isEditing ? '✕ Cancel' : '⚙️ Edit Profile'}
              </button>
            )}
            <a href={`tel:${fp.phone}`} className="btn-primary">📞 {T.call}</a>
            <a href={`https://wa.me/91${fp.phone}?text=Hello ${fp.name}, I found your profile on FarmBridge. I want to discuss a purchase.`}
              target="_blank" rel="noopener noreferrer" className="btn-bulk-wa">💬 {T.wa}</a>
          </div>
        </div>
      </div>

      {/* Edit Profile Form */}
      {isEditing && (
        <form onSubmit={handleSaveProfile} className="listing-form" style={{ maxWidth: '600px', margin: '2rem auto', padding: '1.5rem', background: '#fff', borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.06)' }}>
          <h2 style={{ marginBottom: '1.5rem', fontSize: '1.25rem', color: 'var(--primary-800)', borderBottom: '1px solid var(--gray-100)', paddingBottom: '0.5rem' }}>⚙️ {lang === 'en' ? 'Edit Profile Details' : 'प्रोफ़ाइल संपादित करें'}</h2>
          
          <div className="form-group">
            <label className="form-label">{lang === 'en' ? 'Farmer Name *' : 'किसान का नाम *'}</label>
            <input className="form-input" type="text" value={editForm.name} onChange={e => setEditForm(prev => ({ ...prev, name: e.target.value }))} required />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">{lang === 'en' ? 'Village / Local Area *' : 'गाँव *'}</label>
              <input className="form-input" type="text" value={editForm.village} onChange={e => setEditForm(prev => ({ ...prev, village: e.target.value }))} required />
            </div>
            <div className="form-group">
              <label className="form-label">{lang === 'en' ? 'District *' : 'जिला *'}</label>
              <input className="form-input" type="text" value={editForm.district} onChange={e => setEditForm(prev => ({ ...prev, district: e.target.value }))} required />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">{lang === 'en' ? 'State *' : 'राज्य *'}</label>
              <input className="form-input" type="text" value={editForm.state} onChange={e => setEditForm(prev => ({ ...prev, state: e.target.value }))} required />
            </div>
            <div className="form-group">
              <label className="form-label">{lang === 'en' ? 'Avatar Emoji' : 'अवतार इमोजी'}</label>
              <input className="form-input" type="text" value={editForm.avatarUrl} onChange={e => setEditForm(prev => ({ ...prev, avatarUrl: e.target.value }))} />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">{T.farmSize} ({T.acres})</label>
              <input className="form-input" type="number" min="0" value={editForm.farmSizeAcres} onChange={e => setEditForm(prev => ({ ...prev, farmSizeAcres: Number(e.target.value) }))} />
            </div>
            <div className="form-group">
              <label className="form-label">{T.experience} ({T.years})</label>
              <input className="form-input" type="number" min="0" value={editForm.experience} onChange={e => setEditForm(prev => ({ ...prev, experience: Number(e.target.value) }))} />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">{T.bio}</label>
            <textarea className="form-input form-textarea" rows={3} value={editForm.bio} onChange={e => setEditForm(prev => ({ ...prev, bio: e.target.value }))} />
          </div>

          {errorMsg && <p className="error-msg" style={{ margin: '0.75rem 0' }}>⚠ {errorMsg}</p>}
          {successMsg && <p style={{ color: 'green', margin: '0.75rem 0' }}>✅ {successMsg}</p>}

          <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
            <button type="submit" className="btn-submit" disabled={saving} style={{ flex: 1 }}>
              {saving ? '⏳ Saving…' : `💾 Save Profile`}
            </button>
            <button type="button" className="btn-gps" style={{ flex: 1, background: 'var(--gray-100)', color: 'var(--gray-700)' }} onClick={() => setIsEditing(false)}>
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* Stats row */}
      <div className="profile-stats">
        <div className="pstat">
          <div className="pstat-val">⭐ 4.8</div>
          <div className="pstat-label">{T.rating}</div>
        </div>
        <div className="pstat">
          <div className="pstat-val">0</div>
          <div className="pstat-label">{T.totalSales}</div>
        </div>
        <div className="pstat">
          <div className="pstat-val">0%</div>
          <div className="pstat-label">{T.repeatBuyers}</div>
        </div>
        <div className="pstat">
          <div className="pstat-val">{fp.experience}</div>
          <div className="pstat-label">{T.experience}</div>
        </div>
        <div className="pstat">
          <div className="pstat-val">{fp.farmSizeAcres}</div>
          <div className="pstat-label">{T.farmSize} ({T.acres})</div>
        </div>
      </div>

      {/* Tabs */}
      <div className="sell-tabs" style={{ marginBottom: '1.5rem' }}>
        {([['listings', T.listings], ['reviews', T.reviews], ['about', T.about]] as [string,string][]).map(([k, l]) => (
          <button key={k} className={`sell-tab ${tab === k ? 'sell-tab-active' : ''}`} onClick={() => setTab(k as any)}>{l}</button>
        ))}
      </div>

      {/* Listings tab */}
      {tab === 'listings' && (
        <div className="products-grid">
          {farmerProducts.length > 0
            ? farmerProducts.map(p => (
                <div key={p.id} className="product-card">
                  <div className="product-img-wrap">
                    <img src={p.image} alt={p.name} className="product-img"
                      onError={e => { (e.target as HTMLImageElement).src = `https://placehold.co/400x240?text=${p.name}` }} />
                    {p.organic && <span className="organic-badge">🌿 Organic</span>}
                  </div>
                  <div className="product-body">
                    <div className="product-name-row">
                      <h3 className="product-name">{p.name}</h3>
                      <div className="price-tag"><span className="price-rupee">₹{p.price}</span><span className="price-unit">/{p.unit}</span></div>
                    </div>
                    <div className="product-rating">
                      <span className="stars">{'★'.repeat(Math.round(p.rating))}{'☆'.repeat(5-Math.round(p.rating))}</span>
                      <span className="rating-num">{p.rating}</span>
                    </div>
                    <p className="product-desc">{p.description}</p>
                    <div className="product-actions">
                      <button className="btn-add-cart" onClick={() => onAddToCart(p)}>🛒 {lang === 'en' ? 'Add to Cart' : 'कार्ट में जोड़ें'}</button>
                    </div>
                  </div>
                </div>
              ))
            : <p className="tab-hint">{T.noListings}</p>
          }
        </div>
      )}

      {/* Reviews tab */}
      {tab === 'reviews' && (
        <div className="reviews-list">
          {REVIEWS.length > 0 ? REVIEWS.map((r, i) => (
            <div key={i} className="review-card">
              <div className="review-header">
                <div>
                  <div className="review-buyer">{r.buyer}</div>
                  <div className="review-type">🏪 {r.type}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div className="stars">{'★'.repeat(r.rating)}{'☆'.repeat(5-r.rating)}</div>
                  <div style={{ fontSize: '12px', color: 'var(--gray-400)' }}>{r.date}</div>
                </div>
              </div>
              <p className="review-comment">"{r.comment}"</p>
            </div>
          )) : <p className="tab-hint" style={{ textAlign: 'center', padding: '2rem', color: 'var(--gray-500)', fontStyle: 'italic' }}>{lang === 'en' ? 'No reviews yet.' : 'कोई समीक्षा नहीं।'}</p>}
        </div>
      )}

      {/* About tab */}
      {tab === 'about' && (
        <div className="about-farm">
          <div className="about-card">
            <h3 className="about-title">👨‍🌾 {T.bio}</h3>
            <p className="about-bio">{displayBio}</p>
          </div>
          <div className="about-card">
            <h3 className="about-title">🌾 {T.crops}</h3>
            <div className="bulk-tags">
              {CROPS.map((c, i) => <span key={i} className="bulk-tag">{c}</span>)}
            </div>
          </div>
          <div className="about-card">
            <h3 className="about-title">📋 {T.certifications}</h3>
            {CERTIFICATIONS.map((c, i) => (
              <div key={i} className="cert-row">✅ {c}</div>
            ))}
          </div>
          <div className="about-card">
            <div className="about-meta-row">
              <span>📅 {T.joinedOn}</span><strong>2023</strong>
            </div>
            <div className="about-meta-row">
              <span>📍 {lang === 'en' ? 'Location' : 'स्थान'}</span>
              <strong>{fp.village}, {fp.district}, {fp.state}</strong>
            </div>
            <div className="about-meta-row">
              <span>🚜 {T.farmSize}</span><strong>{fp.farmSizeAcres} {T.acres}</strong>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}