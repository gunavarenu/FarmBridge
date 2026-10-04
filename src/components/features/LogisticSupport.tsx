/**
 * LogisticSupport.tsx
 * Feature 4 — Logistic Support
 * Connects farmers with transport, cold storage, packaging services
 */
import { useState } from 'react'
import type { Language } from '../../types'

interface LogisticProvider {
  id: string; name: string
  type: 'transport' | 'coldstorage' | 'packaging' | 'aggregator'
  location: string; state: string
  capacity: string; rate: string; rating: number
  phone: string; whatsapp?: string
  features: string[]; available: boolean
}

const PROVIDERS: LogisticProvider[] = [
  {
    id: 'l1', name: 'Kisan Transport Services', type: 'transport',
    location: 'Nashik', state: 'Maharashtra',
    capacity: 'Up to 10 tonne', rate: '₹12–18/km',
    rating: 4.6, phone: '9900000001', whatsapp: '9900000001',
    features: ['Refrigerated truck', 'Same day pickup', 'GPS tracking', 'Insurance covered'],
    available: true,
  },
  {
    id: 'l2', name: 'AgriCool Cold Storage', type: 'coldstorage',
    location: 'Pune', state: 'Maharashtra',
    capacity: '500 tonne facility', rate: '₹1.5/kg/month',
    rating: 4.8, phone: '9900000002', whatsapp: '9900000002',
    features: ['0–4°C chambers', 'CA storage for fruits', '24/7 monitoring', 'FSSAI certified'],
    available: true,
  },
  {
    id: 'l3', name: 'FreshPack Solutions', type: 'packaging',
    location: 'Mumbai', state: 'Maharashtra',
    capacity: '10,000 units/day', rate: '₹2–8/unit',
    rating: 4.5, phone: '9900000003',
    features: ['Branded packaging', 'Vacuum sealing', 'Export grade boxes', 'Custom labelling'],
    available: true,
  },
  {
    id: 'l4', name: 'Maharashtra Farmer Collective', type: 'aggregator',
    location: 'Aurangabad', state: 'Maharashtra',
    capacity: 'Group of 50+ farmers', rate: '3% commission only',
    rating: 4.9, phone: '9900000004', whatsapp: '9900000004',
    features: ['Pool shipments', 'Better rates', 'Collective bargaining', 'Free pickup'],
    available: true,
  },
  {
    id: 'l5', name: 'SpeedFresh Logistics', type: 'transport',
    location: 'Solapur', state: 'Maharashtra',
    capacity: 'Mini trucks 1–3 tonne', rate: '₹800 flat/trip',
    rating: 4.3, phone: '9900000005', whatsapp: '9900000005',
    features: ['Short distance', 'Quick booking', 'Daily routes', 'Affordable'],
    available: false,
  },
]

const TYPE_ICONS: Record<string, string> = {
  transport: '🚛', coldstorage: '❄️', packaging: '📦', aggregator: '🤝',
}

interface Props { lang: Language }

export default function LogisticSupport({ lang }: Props) {
  const [typeFilter, setTypeFilter] = useState('all')
  const [showBook, setShowBook]     = useState<LogisticProvider | null>(null)
  const [booked, setBooked]         = useState(false)

  const T = {
    en: {
      title: 'Logistic Support', subtitle: 'Transport, cold storage, packaging — all in one place',
      transport: 'Transport', cold: 'Cold Storage', packaging: 'Packaging', aggregator: 'Collective',
      all: 'All', capacity: 'Capacity', rate: 'Rate', avail: 'Available', unavail: 'Busy',
      book: 'Book Now', call: 'Call', wa: 'WhatsApp',
      bookTitle: 'Book Service', yourQty: 'Your Quantity', pickupDate: 'Pickup Date',
      from: 'Pickup Location', to: 'Delivery Location', notes: 'Special Requirements',
      confirm: 'Confirm Booking', bookSuccess: 'Booking Confirmed! They will call you shortly.',
    },
    hi: {
      title: 'लॉजिस्टिक सहायता', subtitle: 'परिवहन, कोल्ड स्टोरेज, पैकेजिंग — एक जगह',
      transport: 'परिवहन', cold: 'कोल्ड स्टोरेज', packaging: 'पैकेजिंग', aggregator: 'सामूहिक',
      all: 'सभी', capacity: 'क्षमता', rate: 'दर', avail: 'उपलब्ध', unavail: 'व्यस्त',
      book: 'अभी बुक करें', call: 'कॉल करें', wa: 'WhatsApp',
      bookTitle: 'सेवा बुक करें', yourQty: 'आपकी मात्रा', pickupDate: 'पिकअप तारीख',
      from: 'पिकअप स्थान', to: 'डिलीवरी स्थान', notes: 'विशेष आवश्यकताएं',
      confirm: 'बुकिंग की पुष्टि करें', bookSuccess: 'बुकिंग हो गई! वे जल्द कॉल करेंगे।',
    },
    mr: {
      title: 'लॉजिस्टिक सहाय्य', subtitle: 'वाहतूक, कोल्ड स्टोरेज, पॅकेजिंग — एकाच ठिकाणी',
      transport: 'वाहतूक', cold: 'कोल्ड स्टोरेज', packaging: 'पॅकेजिंग', aggregator: 'सामूहिक',
      all: 'सर्व', capacity: 'क्षमता', rate: 'दर', avail: 'उपलब्ध', unavail: 'व्यस्त',
      book: 'आता बुक करा', call: 'कॉल करा', wa: 'WhatsApp',
      bookTitle: 'सेवा बुक करा', yourQty: 'तुमचे प्रमाण', pickupDate: 'पिकअप तारीख',
      from: 'पिकअप ठिकाण', to: 'डिलिव्हरी ठिकाण', notes: 'विशेष आवश्यकता',
      confirm: 'बुकिंग निश्चित करा', bookSuccess: 'बुकिंग झाली! ते लवकरच कॉल करतील.',
    },
  }[lang]

  const types = [
    { v: 'all', l: T.all }, { v: 'transport', l: `🚛 ${T.transport}` },
    { v: 'coldstorage', l: `❄️ ${T.cold}` }, { v: 'packaging', l: `📦 ${T.packaging}` },
    { v: 'aggregator', l: `🤝 ${T.aggregator}` },
  ]

  const filtered = PROVIDERS.filter(p => typeFilter === 'all' || p.type === typeFilter)

  return (
    <div className="logistic-page">
      <h1 className="page-title">🚛 {T.title}</h1>
      <p className="page-sub">{T.subtitle}</p>

      <div className="category-tabs">
        {types.map(t => (
          <button key={t.v} className={`cat-tab ${typeFilter === t.v ? 'cat-active' : ''}`} onClick={() => setTypeFilter(t.v)}>{t.l}</button>
        ))}
      </div>

      <div className="logistic-grid">
        {filtered.map(p => (
          <div key={p.id} className={`logistic-card ${!p.available ? 'logistic-unavail' : ''}`}>
            <div className="logistic-header">
              <span className="logistic-type-icon">{TYPE_ICONS[p.type]}</span>
              <div>
                <div className="logistic-name">{p.name}</div>
                <div className="logistic-location">📍 {p.location}</div>
              </div>
              <span className={`avail-badge ${p.available ? 'avail-yes' : 'avail-no'}`}>
                {p.available ? `✅ ${T.avail}` : `⏳ ${T.unavail}`}
              </span>
            </div>

            <div className="product-rating">
              <span className="stars">{'★'.repeat(Math.round(p.rating))}{'☆'.repeat(5 - Math.round(p.rating))}</span>
              <span className="rating-num">{p.rating}</span>
            </div>

            <div className="logistic-meta">
              <div className="logistic-meta-row"><span>📦 {T.capacity}:</span><strong>{p.capacity}</strong></div>
              <div className="logistic-meta-row"><span>💰 {T.rate}:</span><strong style={{ color: 'var(--green)' }}>{p.rate}</strong></div>
            </div>

            <div className="logistic-features">
              {p.features.map((f, i) => <span key={i} className="bulk-tag">✓ {f}</span>)}
            </div>

            <div className="req-actions" style={{ marginTop: '1rem' }}>
              {p.available && (
                <button className="btn-add-cart" onClick={() => { setShowBook(p); setBooked(false) }}>🗓 {T.book}</button>
              )}
              <a href={`tel:${p.phone}`} className="btn-contact">📞 {T.call}</a>
              {p.whatsapp && (
                <a href={`https://wa.me/91${p.whatsapp}`} target="_blank" rel="noopener noreferrer" className="btn-bulk-wa" style={{ padding: '10px 12px' }}>💬</a>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Booking Modal */}
      {showBook && !booked && (
        <div className="modal-overlay" onClick={() => setShowBook(null)}>
          <div className="modal-box" onClick={e => e.stopPropagation()} style={{ maxWidth: 440 }}>
            <button className="modal-close" onClick={() => setShowBook(null)}>✕</button>
            <div className="modal-icon">{TYPE_ICONS[showBook.type]}</div>
            <h2 className="modal-title" style={{ fontSize: '1.1rem' }}>{T.bookTitle}: {showBook.name}</h2>
            <div className="form-group">
              <label className="form-label">{T.yourQty}</label>
              <input className="form-input" type="text" placeholder="e.g. 500 kg" />
            </div>
            <div className="form-group">
              <label className="form-label">{T.pickupDate}</label>
              <input className="form-input" type="date" min={new Date().toISOString().slice(0,10)} />
            </div>
            <div className="form-group">
              <label className="form-label">{T.from}</label>
              <input className="form-input" placeholder="Your village / district" />
            </div>
            <div className="form-group">
              <label className="form-label">{T.to}</label>
              <input className="form-input" placeholder="Delivery market / city" />
            </div>
            <div className="form-group">
              <label className="form-label">{T.notes}</label>
              <textarea className="form-input form-textarea" rows={2} placeholder="Temperature requirements, fragile items…" />
            </div>
            <button className="btn-submit" onClick={() => setBooked(true)}>✅ {T.confirm}</button>
          </div>
        </div>
      )}

      {booked && showBook && (
        <div className="modal-overlay" onClick={() => { setShowBook(null); setBooked(false) }}>
          <div className="modal-box" onClick={e => e.stopPropagation()} style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>✅</div>
            <h3>{T.bookSuccess}</h3>
            <p style={{ color: 'var(--gray-600)', fontSize: '14px', marginTop: '0.5rem' }}>{showBook.name} — 📞 {showBook.phone}</p>
            <button className="btn-submit" style={{ marginTop: '1rem' }} onClick={() => { setShowBook(null); setBooked(false) }}>Close</button>
          </div>
        </div>
      )}
    </div>
  )
}