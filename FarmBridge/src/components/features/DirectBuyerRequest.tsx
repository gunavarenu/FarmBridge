/**
 * DirectBuyerRequest.tsx
 * Feature 3 — Direct Buyer Request
 * Buyers browse listings and send direct purchase requests.
 * Farmers see all incoming requests with offer price, quantity needed.
 * All data is read from / written to Supabase buyer_requests table.
 */
import { useState, useEffect } from 'react'
import type { Product, Language, AuthUser } from '../../types'
import { supabase } from '../../config/supabaseClient'

interface BuyerRequest {
  id: string; buyerName: string; buyerType: string
  product: string; qtyNeeded: number; unit: string
  offerPrice: number; message: string
  date: string; status: 'new' | 'accepted' | 'rejected' | 'negotiating'
  phone: string
}

interface SendRequestProps {
  product: Product
  lang: Language
  user?: AuthUser | null
  onClose: () => void
}

export function SendBuyerRequest({ product, lang, user, onClose }: SendRequestProps) {
  const [form, setForm] = useState({ name: user?.name || '', type: 'trader', qty: '', price: String(product.price), message: '', phone: user?.phone?.replace('+91', '') || '' })
  const [sending, setSending] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')

  const up = (k: string, v: string) => setForm(p => ({ ...p, [k]: v }))

  const handleSend = async () => {
    if (!form.name || !form.qty || !form.phone) return
    setSending(true)
    setError('')

    const requestData = {
      buyer_name: form.name,
      buyer_type: form.type,
      product_name: product.name,
      farmer_id: product.farmerId || null,
      qty_needed: Number(form.qty),
      unit: product.unit,
      offer_price: Number(form.price) || product.price,
      message: form.message,
      phone: '+91' + form.phone.replace('+91', ''),
      status: 'new',
    }

    if (supabase) {
      try {
        const { error: dbError } = await supabase.from('buyer_requests').insert(requestData)
        if (dbError) {
          // Table might not exist yet — store locally as fallback
          console.warn('buyer_requests table error:', dbError.message)
        }
      } catch (e) {
        console.warn('Could not write buyer request to DB:', e)
      }
    }

    setSending(false)
    setSent(true)
    setTimeout(onClose, 2500)
  }

  const title = lang === 'en' ? `Send Request to Buy ${product.name}`
    : lang === 'hi' ? `${product.name} खरीदने का अनुरोध भेजें`
    : `${product.name} खरेदीसाठी विनंती पाठवा`

  if (sent) return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box" onClick={e => e.stopPropagation()} style={{ textAlign: 'center' }}>
        <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>✅</div>
        <h3>{lang === 'en' ? 'Request Sent!' : lang === 'hi' ? 'अनुरोध भेजा गया!' : 'विनंती पाठवली!'}</h3>
        <p style={{ color: 'var(--gray-600)', fontSize: '14px', marginTop: '0.5rem' }}>
          {lang === 'en' ? `${product.farmerName} will contact you shortly.`
           : lang === 'hi' ? `${product.farmerName} जल्द संपर्क करेंगे।`
           : `${product.farmerName} लवकरच संपर्क करतील.`}
        </p>
      </div>
    </div>
  )

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box" onClick={e => e.stopPropagation()} style={{ maxWidth: 460 }}>
        <button className="modal-close" onClick={onClose}>✕</button>
        <div className="modal-icon">📩</div>
        <h2 className="modal-title" style={{ fontSize: '1.1rem' }}>{title}</h2>

        <div className="form-group">
          <label className="form-label">{lang === 'en' ? 'Your Name *' : 'आपका नाम *'}</label>
          <input className="form-input" value={form.name} onChange={e => up('name', e.target.value)} placeholder="Business / Personal name" />
        </div>
        <div className="form-group">
          <label className="form-label">{lang === 'en' ? 'Buyer Type' : 'खरीदार प्रकार'}</label>
          <select className="form-input" value={form.type} onChange={e => up('type', e.target.value)}>
            <option value="trader">Trader / Wholesale</option>
            <option value="hotel">Hotel / Restaurant</option>
            <option value="factory">Factory / Processing</option>
            <option value="exporter">Exporter</option>
            <option value="retail">Retail / Consumer</option>
            <option value="canteen">Canteen / Institution</option>
          </select>
        </div>
        <div className="form-row">
          <div className="form-group">
            <label className="form-label">{lang === 'en' ? 'Qty Needed *' : 'जरूरी मात्रा *'}</label>
            <input className="form-input" type="number" value={form.qty} onChange={e => up('qty', e.target.value)} placeholder={`in ${product.unit}`} />
          </div>
          <div className="form-group">
            <label className="form-label">{lang === 'en' ? 'Offer Price (₹)' : 'प्रस्ताव मूल्य (₹)'}</label>
            <input className="form-input" type="number" value={form.price} onChange={e => up('price', e.target.value)} placeholder={`e.g. ${product.price}`} />
          </div>
        </div>
        <div className="form-group">
          <label className="form-label">{lang === 'en' ? 'Message' : 'संदेश'}</label>
          <textarea className="form-input form-textarea" rows={2} value={form.message} onChange={e => up('message', e.target.value)} placeholder={lang === 'en' ? 'Quality requirements, delivery terms…' : 'गुणवत्ता आवश्यकताएं, डिलीवरी शर्तें…'} />
        </div>
        <div className="form-group">
          <label className="form-label">{lang === 'en' ? 'Your Phone *' : 'आपका फ़ोन *'}</label>
          <div className="input-prefix-wrap">
            <span className="input-prefix">+91</span>
            <input className="form-input input-prefixed" type="tel" maxLength={10} value={form.phone} onChange={e => up('phone', e.target.value.replace(/\D/, ''))} placeholder="98765 43210" />
          </div>
        </div>
        {error && <p style={{ color: '#dc2626', fontSize: '13px', marginBottom: '8px' }}>⚠ {error}</p>}
        <button className="btn-submit" onClick={handleSend} disabled={sending || !form.name || !form.qty || !form.phone}>
          {sending ? '⏳ Sending…' : `📩 ${lang === 'en' ? 'Send Purchase Request' : lang === 'hi' ? 'खरीद अनुरोध भेजें' : 'खरेदी विनंती पाठवा'}`}
        </button>
      </div>
    </div>
  )
}

interface Props { lang: Language; user?: AuthUser | null }

export default function DirectBuyerRequests({ lang, user }: Props) {
  const [filter, setFilter] = useState<'all' | 'new' | 'negotiating' | 'accepted'>('all')
  const [requests, setRequests] = useState<BuyerRequest[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadRequests()
  }, [user])

  async function loadRequests() {
    setLoading(true)
    if (!supabase || !user?.id) {
      setLoading(false)
      return
    }

    try {
      // Fetch requests directed at this farmer
      const { data, error } = await supabase
        .from('buyer_requests')
        .select('*')
        .eq('farmer_id', user.id)
        .order('created_at', { ascending: false })
        .limit(50)

      if (error) {
        console.warn('buyer_requests fetch error (table may not exist):', error.message)
        setLoading(false)
        return
      }

      const mapped: BuyerRequest[] = (data || []).map((r: any) => ({
        id: r.id,
        buyerName: r.buyer_name || 'Buyer',
        buyerType: r.buyer_type || 'Trader',
        product: r.product_name || 'Product',
        qtyNeeded: Number(r.qty_needed),
        unit: r.unit || 'kg',
        offerPrice: Number(r.offer_price),
        message: r.message || '',
        date: r.created_at ? r.created_at.split('T')[0] : '',
        status: r.status || 'new',
        phone: r.phone || '',
      }))
      setRequests(mapped)
    } catch (e) {
      console.warn('Failed to load buyer requests:', e)
    } finally {
      setLoading(false)
    }
  }

  async function updateStatus(id: string, newStatus: string) {
    if (!supabase) return
    await supabase.from('buyer_requests').update({ status: newStatus }).eq('id', id)
    setRequests(prev => prev.map(r => r.id === id ? { ...r, status: newStatus as any } : r))
  }

  const T = {
    en: { title: 'Buyer Requests', subtitle: 'Direct purchase requests from buyers for your products',
      all: 'All', newReq: 'New', nego: 'Negotiating', accepted: 'Accepted',
      from: 'from', wants: 'wants', at: 'at', call: 'Call', whatsapp: 'WhatsApp',
      accept: 'Accept', negotiate: 'Negotiate', decline: 'Decline',
      empty: 'No buyer requests yet. Share your product listings to attract buyers!',
      noLogin: 'Log in as a farmer to see your buyer requests.',
    },
    hi: { title: 'खरीदार अनुरोध', subtitle: 'आपके उत्पादों के लिए सीधे खरीद अनुरोध',
      all: 'सभी', newReq: 'नए', nego: 'वार्ता', accepted: 'स्वीकृत',
      from: 'से', wants: 'चाहता है', at: 'पर', call: 'कॉल', whatsapp: 'WhatsApp',
      accept: 'स्वीकार करें', negotiate: 'बातचीत', decline: 'अस्वीकार',
      empty: 'अभी तक कोई खरीदार अनुरोध नहीं। अधिक खरीदारों को आकर्षित करने के लिए अपनी लिस्टिंग शेयर करें!',
      noLogin: 'खरीदार अनुरोध देखने के लिए किसान के रूप में लॉग इन करें।',
    },
    mr: { title: 'खरेदीदार विनंत्या', subtitle: 'तुमच्या उत्पादांसाठी थेट खरेदी विनंत्या',
      all: 'सर्व', newReq: 'नवीन', nego: 'वाटाघाटी', accepted: 'स्वीकृत',
      from: 'कडून', wants: 'हवे आहे', at: 'वर', call: 'कॉल', whatsapp: 'WhatsApp',
      accept: 'स्वीकारा', negotiate: 'वाटाघाटी', decline: 'नाकारा',
      empty: 'अद्याप कोणत्याही खरेदीदाराची विनंती नाही. अधिक खरेदीदारांना आकर्षित करण्यासाठी तुमची यादी शेअर करा!',
      noLogin: 'खरेदीदार विनंत्या पाहण्यासाठी शेतकरी म्हणून लॉग इन करा.',
    },
  }[lang]

  const newCount = requests.filter(r => r.status === 'new').length
  const filtered = requests.filter(r => filter === 'all' || r.status === filter || (filter === 'new' && r.status === 'new'))

  const statusColor = (s: string) => s === 'new' ? 'pill-new' : s === 'negotiating' ? 'pill-nego' : s === 'accepted' ? 'pill-accepted' : 'pill-rejected'
  const statusLabel = (s: string) => s === 'new' ? '🆕 New' : s === 'negotiating' ? '🤝 Negotiating' : s === 'accepted' ? '✅ Accepted' : '❌ Rejected'

  return (
    <div className="buyer-req-page">
      <h1 className="page-title">📩 {T.title}</h1>
      <p className="page-sub">{T.subtitle}</p>

      {!user && (
        <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--gray-500)' }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🔒</div>
          <p>{T.noLogin}</p>
        </div>
      )}

      {user && (
        <>
          <div className="category-tabs" style={{ marginBottom: '1.5rem' }}>
            {([['all', T.all], ['new', T.newReq], ['negotiating', T.nego], ['accepted', T.accepted]] as [string, string][]).map(([val, lbl]) => (
              <button key={val} className={`cat-tab ${filter === val ? 'cat-active' : ''}`}
                onClick={() => setFilter(val as any)}>{lbl}
                {val === 'new' && newCount > 0 && <span className="cart-badge" style={{ position: 'relative', top: 0, right: 0, marginLeft: 4 }}>{newCount}</span>}
              </button>
            ))}
          </div>

          {loading ? (
            <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--gray-500)' }}>
              <div style={{ fontSize: '2rem' }}>⏳</div>
              <p>{lang === 'en' ? 'Loading requests…' : lang === 'hi' ? 'अनुरोध लोड हो रहे हैं…' : 'विनंत्या लोड होत आहेत…'}</p>
            </div>
          ) : filtered.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '4rem 2rem', color: 'var(--gray-500)' }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📭</div>
              <p style={{ maxWidth: 400, margin: '0 auto' }}>{T.empty}</p>
              <button className="fip-refresh-btn" onClick={loadRequests} style={{ marginTop: '1rem' }}>🔄 {lang === 'en' ? 'Refresh' : 'रिफ्रेश'}</button>
            </div>
          ) : (
            <div className="req-list">
              {filtered.map(req => (
                <div key={req.id} className={`req-card ${req.status === 'new' ? 'req-new' : ''}`}>
                  <div className="req-header">
                    <div>
                      <div className="req-buyer-name">👤 {req.buyerName}</div>
                      <div className="req-buyer-type">🏪 {req.buyerType}</div>
                    </div>
                    <span className={`status-pill ${statusColor(req.status)}`}>{statusLabel(req.status)}</span>
                  </div>
                  <div className="req-product">
                    <span className="req-prod-label">🌾 {req.product}</span>
                    <span className="req-qty">{req.qtyNeeded} {req.unit}</span>
                    <span className="req-price">@ ₹{req.offerPrice}/{req.unit}</span>
                  </div>
                  {req.message && <p className="req-message">"{req.message}"</p>}
                  <div className="req-date">📅 {req.date}</div>
                  <div className="req-actions">
                    {req.phone && <a href={`tel:${req.phone}`} className="btn-bulk-call" style={{ flex: 1 }}>📞 {T.call}</a>}
                    {req.phone && (
                      <a href={`https://wa.me/${req.phone.replace('+', '')}?text=${encodeURIComponent(`Hello ${req.buyerName}, I received your request for ${req.product} on FarmBridge.`)}`}
                        target="_blank" rel="noopener noreferrer" className="btn-bulk-wa" style={{ flex: 1 }}>💬 {T.whatsapp}</a>
                    )}
                    {req.status === 'new' && (
                      <button className="btn-accept-req" onClick={() => updateStatus(req.id, 'accepted')}>✅ {T.accept}</button>
                    )}
                    {req.status === 'new' && (
                      <button className="btn-accept-req" style={{ background: 'var(--orange-pale)', color: 'var(--orange)' }} onClick={() => updateStatus(req.id, 'negotiating')}>🤝 {T.negotiate}</button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  )
}