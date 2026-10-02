import { useState, useEffect, useRef } from 'react'
import type { Language, AuthUser } from '../types'
import { translations } from '../data/translations'
import { indianStates } from '../data/mockData'
import { useLocation } from '../hooks/useLocation'
import ImageUploader from './upload/ImageUploader'
import MandiPricePanel from './MandiPricePanel'
import { createProduct } from '../services/productService'
import { fetchMandiRates } from '../services/mandiService'

interface Props { lang: Language; user: AuthUser | null }

interface FormData {
  productName: string; category: string; price: string; quantity: string
  unit: string; state: string; district: string; description: string
  phone: string; isOrganic: boolean
}
const INIT: FormData = { productName: '', category: 'vegetable', price: '', quantity: '', unit: 'kg', state: 'Maharashtra', district: '', description: '', phone: '', isOrganic: false }

// ── Mandi price auto-suggest: price per kg = (mandiModalPrice per quintal / 100) * 1.4 ──
const MANDI_MARKUP = 1.40   // farmer gets 40% above mandi modal price

export default function SellPage({ lang, user }: Props) {
  const t = translations[lang]
  const [form,        setForm]        = useState<FormData>(INIT)
  const [errors,      setErrors]      = useState<Partial<Record<keyof FormData, string>>>({})
  const [imageUrl,    setImageUrl]    = useState('')
  const [saving,      setSaving]      = useState(false)
  const [submitted,   setSubmitted]   = useState(false)
  const [submitError, setSubmitError] = useState('')

  // Mandi price suggestion state
  const [mandiSuggest,    setMandiSuggest]    = useState<{ price: number; market: string; source: string } | null>(null)
  const [loadingSuggest,  setLoadingSuggest]  = useState(false)
  const suggestTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const { location, loading: gpsLoading, error: gpsError, detect } = useLocation()

  // Auto-fill location from GPS
  const applyGps = () => {
    if (!location) return
    setForm(prev => ({ ...prev, district: [location.village, location.district].filter(Boolean).join(', '), state: location.state || prev.state }))
  }

  const update = (key: keyof FormData, val: string | boolean) => {
    setForm(prev => ({ ...prev, [key]: val }))
    setErrors(prev => ({ ...prev, [key]: undefined }))
  }

  // Debounce product name → fetch mandi price suggestion
  useEffect(() => {
    const name = form.productName.trim()
    if (name.length < 3) {
      setMandiSuggest(null)
      return
    }
    if (suggestTimer.current) clearTimeout(suggestTimer.current)
    suggestTimer.current = setTimeout(async () => {
      setLoadingSuggest(true)
      try {
        const rates = await fetchMandiRates({ state: form.state, limit: 200 })
        // Find best matching commodity
        const lname = name.toLowerCase()
        const match = rates.find(r => r.commodity.toLowerCase().includes(lname) || lname.includes(r.commodity.toLowerCase()))
        if (match && match.modalPrice > 0) {
          // mandi price is per quintal (100kg) → convert to per kg then add 40% markup
          const pricePerKg = Math.round((match.modalPrice / 100) * MANDI_MARKUP)
          setMandiSuggest({ price: pricePerKg, market: match.market, source: `${match.commodity} @ ${match.market}` })
        } else {
          setMandiSuggest(null)
        }
      } catch {
        setMandiSuggest(null)
      }
      setLoadingSuggest(false)
    }, 700)
    return () => { if (suggestTimer.current) clearTimeout(suggestTimer.current) }
  }, [form.productName, form.state])

  // Apply the mandi suggestion to the price field
  const applySuggestedPrice = () => {
    if (!mandiSuggest) return
    // Adjust unit: if unit is quintal, multiply back by 100
    const unitMult = form.unit === 'quintal' ? 100 : form.unit === 'dozen' ? 12 : 1
    update('price', String(Math.round(mandiSuggest.price * unitMult)))
  }

  const validate = () => {
    const e: Partial<Record<keyof FormData, string>> = {}
    if (!form.productName.trim())                      e.productName = 'Required'
    if (!form.price || isNaN(Number(form.price)))      e.price       = 'Enter a valid price'
    if (!form.quantity || isNaN(Number(form.quantity)))e.quantity    = 'Enter valid quantity'
    if (!form.district.trim())                         e.district    = 'Required'
    if (!form.phone.trim() || form.phone.length < 10)  e.phone       = 'Enter 10-digit phone number'
    if (!form.description.trim())                      e.description = 'Required'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) return
    setSaving(true)
    setSubmitError('')
    
    const res = await createProduct({
      productName: form.productName,
      category: form.category as any,
      price: form.price,
      quantity: form.quantity,
      unit: form.unit,
      state: form.state,
      district: form.district,
      description: form.description,
      isOrganic: form.isOrganic,
      imageUrl: imageUrl
    }, user)

    setSaving(false)
    if (res.success) {
      setSubmitted(true)
      setTimeout(() => { setSubmitted(false); setForm(INIT); setImageUrl(''); setSubmitError('') }, 4000)
    } else {
      setSubmitError(res.error || 'Failed to post listing. Please login and try again.')
    }
  }

  if (submitted) return (
    <div className="sell-page">
      <div className="success-screen">
        <div className="success-icon">🎉</div>
        <h2 className="success-title">{lang === 'en' ? 'Listing Posted!' : lang === 'hi' ? 'लिस्टिंग पोस्ट हो गई!' : 'यादी पोस्ट झाली!'}</h2>
        <p className="success-msg">{lang === 'en' ? 'Buyers will contact you shortly.' : lang === 'hi' ? 'खरीदार जल्द संपर्क करेंगे।' : 'खरेदीदार लवकरच संपर्क करतील.'}</p>
        <div className="success-product">🌾 {form.productName} — ₹{form.price}/{form.unit}</div>
      </div>
    </div>
  )

  const suggestLabel = lang === 'en'
    ? '💡 Suggested price (mandi +40%)'
    : lang === 'hi' ? '💡 सुझाया मूल्य (मंडी +40%)' : '💡 सुचवलेली किंमत (मंडी +40%)'

  return (
    <div className="sell-page">
      <div className="sell-header">
        <h1 className="page-title">{t.listProduct}</h1>
        <p className="page-sub">{lang === 'en' ? 'List your produce and get direct offers from buyers' : lang === 'hi' ? 'अपनी उपज सूचीबद्ध करें और ऑफर प्राप्त करें' : 'आपली उपज सूचीबद्ध करा आणि ऑफर मिळवा'}</p>
      </div>

      <div className="sell-layout">
        <form className="listing-form" onSubmit={handleSubmit}>

          <div className="form-section-title">📸 {lang === 'en' ? 'Product Photo' : lang === 'hi' ? 'उत्पाद फ़ोटो' : 'उत्पादन फोटो'}</div>
          <ImageUploader onUpload={setImageUrl} existingUrl={imageUrl} lang={lang} />

          <div className="form-section-title" style={{ marginTop: '1.5rem' }}>📦 {lang === 'en' ? 'Product Details' : lang === 'hi' ? 'उत्पाद विवरण' : 'उत्पादन तपशील'}</div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">{t.productName} *</label>
              <input className={`form-input ${errors.productName ? 'input-error' : ''}`} type="text" value={form.productName} onChange={e => update('productName', e.target.value)} placeholder={lang === 'en' ? 'e.g. Fresh Tomatoes' : 'जैसे: ताज़े टमाटर'} />
              {errors.productName && <span className="error-msg">⚠ {errors.productName}</span>}
            </div>
            <div className="form-group">
              <label className="form-label">{t.productCategory} *</label>
              <select className="form-input" value={form.category} onChange={e => update('category', e.target.value)}>
                <option value="vegetable">{lang === 'hi' ? 'सब्जियाँ' : lang === 'mr' ? 'भाज्या' : 'Vegetable'}</option>
                <option value="fruit">{lang === 'hi' ? 'फल' : lang === 'mr' ? 'फळे' : 'Fruit'}</option>
                <option value="grain">{lang === 'hi' ? 'अनाज' : lang === 'mr' ? 'धान्य' : 'Grain'}</option>
                <option value="spice">{lang === 'hi' ? 'मसाले' : lang === 'mr' ? 'मसाले' : 'Spice'}</option>
              </select>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">{t.pricePerUnit} *</label>
              <div className="input-prefix-wrap">
                <span className="input-prefix">₹</span>
                <input className={`form-input input-prefixed ${errors.price ? 'input-error' : ''}`} type="number" min="0" value={form.price} onChange={e => update('price', e.target.value)} placeholder="0" />
              </div>
              {errors.price && <span className="error-msg">⚠ {errors.price}</span>}

              {/* ── Mandi price suggestion banner ── */}
              {loadingSuggest && (
                <div style={{ marginTop: 6, fontSize: 12, color: 'var(--gray-400)', display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ width: 12, height: 12, border: '2px solid var(--green)', borderTopColor: 'transparent', borderRadius: '50%', display: 'inline-block', animation: 'spin 0.8s linear infinite' }} />
                  {lang === 'en' ? 'Fetching mandi price…' : lang === 'hi' ? 'मंडी दर खोज रहे हैं…' : 'मंडी भाव शोधत आहे…'}
                </div>
              )}
              {!loadingSuggest && mandiSuggest && (
                <div style={{
                  marginTop: 8,
                  padding: '10px 14px',
                  borderRadius: 10,
                  background: 'linear-gradient(135deg, rgba(34,197,94,0.12), rgba(16,185,129,0.08))',
                  border: '1px solid rgba(34,197,94,0.3)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: 8,
                  flexWrap: 'wrap',
                }}>
                  <div>
                    <div style={{ fontSize: 12, fontWeight: 700, color: '#16a34a' }}>{suggestLabel}</div>
                    <div style={{ fontSize: 11, color: 'var(--gray-400)', marginTop: 2 }}>
                      📍 {mandiSuggest.source}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={applySuggestedPrice}
                    style={{
                      padding: '5px 14px',
                      borderRadius: 20,
                      background: 'linear-gradient(135deg, #16a34a, #22c55e)',
                      color: '#fff',
                      border: 'none',
                      cursor: 'pointer',
                      fontWeight: 700,
                      fontSize: 13,
                      whiteSpace: 'nowrap',
                    }}
                  >
                    ✓ Use ₹{mandiSuggest.price}/{form.unit === 'quintal' ? 'q' : form.unit}
                  </button>
                </div>
              )}
            </div>
            <div className="form-group">
              <label className="form-label">{t.unit} *</label>
              <select className="form-input" value={form.unit} onChange={e => update('unit', e.target.value)}>
                <option value="kg">kg</option><option value="quintal">Quintal</option>
                <option value="dozen">Dozen</option><option value="piece">Piece</option>
                <option value="bundle">Bundle</option><option value="litre">Litre</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">{t.availableQty} *</label>
              <input className={`form-input ${errors.quantity ? 'input-error' : ''}`} type="number" min="0" value={form.quantity} onChange={e => update('quantity', e.target.value)} placeholder="500" />
              {errors.quantity && <span className="error-msg">⚠ {errors.quantity}</span>}
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">{t.description} *</label>
            <textarea className={`form-input form-textarea ${errors.description ? 'input-error' : ''}`} rows={3} value={form.description} onChange={e => update('description', e.target.value)} placeholder={lang === 'en' ? 'Describe quality, variety, freshness…' : lang === 'hi' ? 'गुणवत्ता, किस्म…' : 'गुणवत्ता, प्रकार…'} />
            {errors.description && <span className="error-msg">⚠ {errors.description}</span>}
          </div>

          <div className="organic-check">
            <label className="checkbox-label">
              <input type="checkbox" className="checkbox-input" checked={form.isOrganic} onChange={e => update('isOrganic', e.target.checked)} />
              <span>🌿 {t.isOrganic}</span>
            </label>
          </div>

          <div className="form-section-title">📍 {lang === 'en' ? 'Location & Contact' : lang === 'hi' ? 'स्थान और संपर्क' : 'स्थान आणि संपर्क'}</div>

          <div className="gps-row">
            <button type="button" className="btn-gps" onClick={async () => { await detect(); applyGps() }} disabled={gpsLoading}>
              {gpsLoading ? '⏳ Detecting…' : '📍 Auto-detect Location'}
            </button>
            {location && <span className="gps-label">✅ {location.label}</span>}
            {gpsError  && <span className="gps-error">⚠ {gpsError}</span>}
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">{t.state} *</label>
              <select className="form-input" value={form.state} onChange={e => update('state', e.target.value)}>
                {indianStates.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">{t.district} *</label>
              <input className={`form-input ${errors.district ? 'input-error' : ''}`} type="text" value={form.district} onChange={e => update('district', e.target.value)} placeholder={lang === 'en' ? 'e.g. Nashik' : 'जैसे: नासिक'} />
              {errors.district && <span className="error-msg">⚠ {errors.district}</span>}
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">{t.phone} *</label>
            <div className="input-prefix-wrap">
              <span className="input-prefix">+91</span>
              <input className={`form-input input-prefixed ${errors.phone ? 'input-error' : ''}`} type="tel" maxLength={10} value={form.phone} onChange={e => update('phone', e.target.value.replace(/\D/, ''))} placeholder="98765 43210" />
            </div>
            {errors.phone && <span className="error-msg">⚠ {errors.phone}</span>}
          </div>
          
          {submitError && <p className="error-msg" style={{ margin: '1rem 0' }}>⚠ {submitError}</p>}

          <button type="submit" className="btn-submit" disabled={saving}>
            {saving ? '⏳ Saving…' : `🌾 ${t.submitListing}`}
          </button>
          {!user && <p className="form-login-hint">💡 {lang === 'en' ? 'Login required to post a listing.' : lang === 'hi' ? 'लिस्टिंग के लिए लॉगिन जरूरी है।' : 'यादीसाठी लॉगिन आवश्यक आहे.'}</p>}
        </form>

        <div className="tips-panel">
          <div className="tips-card">
            <h3 className="tips-title">💡 {lang === 'en' ? 'Tips for Better Sales' : lang === 'hi' ? 'बेहतर बिक्री के टिप्स' : 'चांगल्या विक्रीसाठी टिप्स'}</h3>
            {[
              lang === 'en' ? '📸 Add a photo — listings with photos get 3× more views' : '📸 फ़ोटो डालें — 3× अधिक व्यूज़',
              lang === 'en' ? '✅ Price is auto-suggested at 40% above today\'s mandi rate' : '✅ कीमत मंडी दर से 40% अधिक स्वतः सुझाई जाती है',
              lang === 'en' ? '📍 Use GPS auto-detect for accurate village location' : '📍 सटीक स्थान के लिए GPS उपयोग करें',
              lang === 'en' ? '📞 Keep your phone on — buyers call immediately' : '📞 फ़ोन ऑन रखें',
              lang === 'en' ? '🌿 Mark organic produce — sells for 20-40% more' : '🌿 जैविक उत्पाद अधिक कीमत पर बिकता है',
            ].map((tip, i) => <div key={i} className="tip-item">{tip}</div>)}
          </div>
          <MandiPricePanel state={form.state} lang={lang} />
        </div>
      </div>
    </div>
  )
}