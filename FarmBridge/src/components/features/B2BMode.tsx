/**
 * B2BMode.tsx
 * Feature 8 — B2B Mode
 * Dedicated business interface for:
 * - Bulk purchase contracts
 * - Recurring order agreements
 * - Verified business buyer registration
 * - Invoice generation
 * - Cooperative / FPO (Farmer Producer Organisation) listings
 */
import { useState, useEffect } from 'react'
import type { Language, AuthUser } from '../../types'
import { supabase } from '../../config/supabaseClient'

interface B2BListing {
  id: string; farmerName: string; cooperative?: string
  product: string; totalQty: number; unit: string
  pricePerUnit: number; minOrderQty: number
  contractDuration: string; deliveryFrequency: string
  location: string; state: string; organic: boolean
  certifications: string[]; gradeAvail: string[]
  farmerCount?: number; rating: number; phone: string
}



interface Props { lang: Language; user?: AuthUser | null }

export default function B2BMode({ lang, user }: Props) {
  const [mode,      setMode]      = useState<'browse' | 'register' | 'invoice'>('browse')
  const [showDeal,  setShowDeal]  = useState<B2BListing | null>(null)
  const [dealSent,  setDealSent]  = useState(false)
  const [invoiceData, setInvoiceData] = useState({ buyer: '', product: '', qty: '', price: '', gst: '5', fromName: user?.name || '', fromLocation: '' })
  const [listings, setListings] = useState<B2BListing[]>([])
  const [loadingListings, setLoadingListings] = useState(true)

  useEffect(() => {
    loadListings()
  }, [])

  async function loadListings() {
    setLoadingListings(true)
    if (!supabase) {
      setLoadingListings(false)
      return
    }
    try {
      // Try to load from b2b_listings table if it exists
      const { data, error } = await supabase
        .from('b2b_listings')
        .select('*')
        .eq('active', true)
        .order('created_at', { ascending: false })
      if (!error && data && data.length > 0) {
        setListings(data.map((r: any) => ({
          id: r.id, farmerName: r.farmer_name || r.farmerName,
          cooperative: r.cooperative,
          product: r.product, totalQty: Number(r.total_qty), unit: r.unit,
          pricePerUnit: Number(r.price_per_unit), minOrderQty: Number(r.min_order_qty),
          contractDuration: r.contract_duration, deliveryFrequency: r.delivery_frequency,
          location: r.location, state: r.state, organic: r.organic,
          certifications: r.certifications || [],
          gradeAvail: r.grade_avail || [],
          farmerCount: r.farmer_count, rating: r.rating, phone: r.phone
        })))
      }
    } catch (e) {
      console.warn('b2b_listings table may not exist yet:', e)
    } finally {
      setLoadingListings(false)
    }
  }

  async function submitContractRequest(listing: B2BListing, formData: Record<string, string>) {
    if (!supabase) return
    try {
      await supabase.from('buyer_requests').insert({
        buyer_name: formData.company || 'Business Buyer',
        buyer_type: formData.buyerType || 'Business',
        product_name: listing.product,
        farmer_id: null, // Will be linked when b2b_listings table has farmer_id
        qty_needed: Number(formData.qty) || listing.minOrderQty,
        unit: listing.unit,
        offer_price: Number(formData.price) || listing.pricePerUnit,
        message: `Contract request: ${formData.duration || listing.contractDuration}. ${formData.terms || ''}`.trim(),
        phone: formData.gst || '',
        status: 'new',
      })
    } catch (e) {
      console.warn('Failed to save contract request:', e)
    }
  }

  const T = {
    en: {
      title: 'B2B Marketplace', subtitle: 'Bulk contracts between verified businesses and farmer cooperatives',
      browse: 'Browse Listings', register: 'Register Business', invoice: 'Generate Invoice',
      fpo: 'FPO / Cooperative', totalAvail: 'Total Available', minOrder: 'Min. Order',
      contract: 'Contract Duration', frequency: 'Delivery Frequency', organic: 'Organic',
      certified: 'Certifications', grades: 'Grades Available', farmers: 'Farmers in network',
      sendDeal: 'Send Contract Request', call: 'Call', wa: 'WhatsApp',
      dealTitle: 'Send Contract Request', yourCompany: 'Company Name', gst: 'GST Number',
      buyerType: 'Business Type', reqQty: 'Required Qty/month', offerPrice: 'Offer Price',
      duration: 'Contract Duration', terms: 'Special Terms', submit: 'Submit Contract Request',
      sent: 'Contract request sent! Their procurement team will contact you within 24 hours.',
      regTitle: 'Register as B2B Buyer', compName: 'Company Name', gstNum: 'GST Number',
      turnover: 'Annual Turnover', prodNeeded: 'Products Needed', regBtn: 'Submit Registration',
      invTitle: 'Generate Invoice', invBuyer: 'Buyer Name & Address', invProduct: 'Product',
      invQty: 'Quantity', invPrice: 'Price per unit', invGst: 'GST %', genInv: 'Generate Invoice',
    },
    hi: {
      title: 'B2B बाज़ार', subtitle: 'सत्यापित व्यवसायों और किसान सहकारी समितियों के बीच थोक अनुबंध',
      browse: 'लिस्टिंग देखें', register: 'व्यवसाय पंजीकरण', invoice: 'चालान बनाएं',
      fpo: 'FPO / सहकारी', totalAvail: 'कुल उपलब्ध', minOrder: 'न्यूनतम ऑर्डर',
      contract: 'अनुबंध अवधि', frequency: 'डिलीवरी आवृत्ति', organic: 'जैविक',
      certified: 'प्रमाणपत्र', grades: 'ग्रेड उपलब्ध', farmers: 'नेटवर्क में किसान',
      sendDeal: 'अनुबंध अनुरोध भेजें', call: 'कॉल', wa: 'WhatsApp',
      dealTitle: 'अनुबंध अनुरोध भेजें', yourCompany: 'कंपनी का नाम', gst: 'GST नंबर',
      buyerType: 'व्यवसाय प्रकार', reqQty: 'आवश्यक मात्रा/माह', offerPrice: 'प्रस्ताव मूल्य',
      duration: 'अनुबंध अवधि', terms: 'विशेष शर्तें', submit: 'अनुबंध अनुरोध सबमिट करें',
      sent: 'अनुबंध अनुरोध भेजा गया! उनकी खरीद टीम 24 घंटे में संपर्क करेगी।',
      regTitle: 'B2B खरीदार के रूप में पंजीकरण करें', compName: 'कंपनी का नाम', gstNum: 'GST नंबर',
      turnover: 'वार्षिक टर्नओवर', prodNeeded: 'आवश्यक उत्पाद', regBtn: 'पंजीकरण सबमिट करें',
      invTitle: 'चालान बनाएं', invBuyer: 'खरीदार का नाम और पता', invProduct: 'उत्पाद',
      invQty: 'मात्रा', invPrice: 'प्रति इकाई मूल्य', invGst: 'GST %', genInv: 'चालान बनाएं',
    },
    mr: {
      title: 'B2B बाज़ार', subtitle: 'सत्यापित व्यवसाय आणि शेतकरी सहकारी संस्थांमधील थेट करार',
      browse: 'यादी पाहा', register: 'व्यवसाय नोंदणी', invoice: 'चलन तयार करा',
      fpo: 'FPO / सहकारी', totalAvail: 'एकूण उपलब्ध', minOrder: 'किमान ऑर्डर',
      contract: 'करार कालावधी', frequency: 'डिलिव्हरी वारंवारता', organic: 'सेंद्रिय',
      certified: 'प्रमाणपत्रे', grades: 'उपलब्ध दर्जे', farmers: 'नेटवर्कमधील शेतकरी',
      sendDeal: 'करार विनंती पाठवा', call: 'कॉल', wa: 'WhatsApp',
      dealTitle: 'करार विनंती पाठवा', yourCompany: 'कंपनीचे नाव', gst: 'GST नंबर',
      buyerType: 'व्यवसाय प्रकार', reqQty: 'आवश्यक प्रमाण/महिना', offerPrice: 'ऑफर किंमत',
      duration: 'करार कालावधी', terms: 'विशेष अटी', submit: 'करार विनंती सबमिट करा',
      sent: 'करार विनंती पाठवली! त्यांची खरेदी टीम 24 तासांत संपर्क करेल.',
      regTitle: 'B2B खरेदीदार म्हणून नोंदणी करा', compName: 'कंपनीचे नाव', gstNum: 'GST नंबर',
      turnover: 'वार्षिक उलाढाल', prodNeeded: 'आवश्यक उत्पादने', regBtn: 'नोंदणी सबमिट करा',
      invTitle: 'चलन तयार करा', invBuyer: 'खरेदीदाराचे नाव आणि पत्ता', invProduct: 'उत्पादन',
      invQty: 'प्रमाण', invPrice: 'प्रति एकक किंमत', invGst: 'GST %', genInv: 'चलन तयार करा',
    },
  }[lang]

  const total   = Number(invoiceData.qty) * Number(invoiceData.price)
  const gstAmt  = total * (Number(invoiceData.gst) / 100)
  const grandTot = total + gstAmt

  return (
    <div className="b2b-page">
      <div className="b2b-banner">
        <div className="b2b-banner-content">
          <div className="b2b-icon">🏭</div>
          <div>
            <h1 className="b2b-title">{T.title}</h1>
            <p className="b2b-sub">{T.subtitle}</p>
          </div>
        </div>
      </div>

      <div className="sell-tabs">
        {[['browse',T.browse],['register',T.register],['invoice',T.invoice]].map(([v,l]) => (
          <button key={v} className={`sell-tab ${mode === v ? 'sell-tab-active' : ''}`} onClick={() => setMode(v as any)}>{l}</button>
        ))}
      </div>

      {/* Browse */}
      {mode === 'browse' && (
        <div className="b2b-grid">
          {loadingListings ? (
            <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '3rem', color: 'var(--gray-500)' }}>
              <div style={{ fontSize: '2rem' }}>⏳</div>
              <p>{lang === 'en' ? 'Loading B2B listings…' : 'B2B लिस्टिंग लोड हो रही है…'}</p>
            </div>
          ) : listings.length === 0 ? (
            <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '4rem 2rem' }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🏭</div>
              <h3 style={{ color: 'var(--gray-700)' }}>
                {lang === 'en' ? 'No B2B listings yet' : lang === 'hi' ? 'अभी कोई B2B लिस्टिंग नहीं' : 'अद्याप B2B यादी नाही'}
              </h3>
              <p style={{ color: 'var(--gray-500)', maxWidth: 400, margin: '0.5rem auto' }}>
                {lang === 'en' ? 'B2B listings from farmer cooperatives and FPOs will appear here. Ask your cooperative to register on FarmBridge.' : 'शेतकरी सहकारी समितियों से B2B लिस्टिंग यहाँ दिखेगी।'}
              </p>
              <button className="fip-refresh-btn" onClick={loadListings} style={{ marginTop: '1rem' }}>🔄 {lang === 'en' ? 'Refresh' : 'रिफ्रेश'}</button>
            </div>
          ) : listings.map(l => (
            <div key={l.id} className="b2b-card">
              <div className="b2b-card-header">
                {l.cooperative && <div className="b2b-coop">🤝 {l.cooperative}</div>}
                <div className="b2b-farmer-name">{l.farmerName}</div>
                <div className="b2b-location">📍 {l.location}, {l.state}</div>
                {l.farmerCount && <div className="b2b-farmers-count">👨‍🌾 {l.farmerCount} {T.farmers}</div>}
              </div>

              <div className="b2b-product">
                <h3 className="b2b-product-name">🌾 {l.product}</h3>
                {l.organic && <span className="organic-badge" style={{ position: 'static' }}>🌿 {T.organic}</span>}
              </div>

              <div className="b2b-meta-grid">
                <div className="b2b-meta-item"><span>{T.totalAvail}</span><strong>{(l.totalQty / 1000).toFixed(0)}K {l.unit}</strong></div>
                <div className="b2b-meta-item"><span>{T.minOrder}</span><strong>{l.minOrderQty} {l.unit}</strong></div>
                <div className="b2b-meta-item"><span>💰 Price</span><strong style={{ color: 'var(--green)' }}>₹{l.pricePerUnit}/{l.unit}</strong></div>
                <div className="b2b-meta-item"><span>{T.frequency}</span><strong>{l.deliveryFrequency}</strong></div>
                <div className="b2b-meta-item"><span>{T.contract}</span><strong>{l.contractDuration}</strong></div>
                <div className="b2b-meta-item"><span>⭐ Rating</span><strong>{l.rating}</strong></div>
              </div>

              <div style={{ marginBottom: 10 }}>
                <div className="bulk-needs-label">{T.certified}</div>
                <div className="bulk-tags">{l.certifications.map((c,i) => <span key={i} className="bulk-tag">✅ {c}</span>)}</div>
              </div>
              <div style={{ marginBottom: 14 }}>
                <div className="bulk-needs-label">{T.grades}</div>
                <div className="bulk-tags">{l.gradeAvail.map((g,i) => <span key={i} className="bulk-tag" style={{ background: 'var(--orange-pale)', color: 'var(--orange)' }}>🏆 {g}</span>)}</div>
              </div>

              <div className="req-actions">
                <button className="btn-add-cart" style={{ flex: 2 }} onClick={() => { setShowDeal(l); setDealSent(false) }}>📄 {T.sendDeal}</button>
                <a href={`tel:${l.phone}`} className="btn-contact">📞</a>
                <a href={`https://wa.me/91${l.phone}`} target="_blank" rel="noopener noreferrer" className="btn-bulk-wa" style={{ padding: '10px 12px' }}>💬</a>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Register */}
      {mode === 'register' && (
        <div className="listing-form" style={{ maxWidth: 600 }}>
          <div className="form-section-title">🏢 {T.regTitle}</div>
          {[[T.compName,'text','Reliance Fresh / ITC Hotels'],['gst',T.gstNum,'text','27AAACR5055K1ZZ'],
            [T.turnover,'text','₹50L–1Cr'],[T.prodNeeded,'text','Tomatoes, Onions, Mangoes']].map(([lbl,type,ph],i) => (
            <div key={i} className="form-group">
              <label className="form-label">{lbl}</label>
              <input className="form-input" type={type as string} placeholder={ph as string} />
            </div>
          ))}
          <div className="form-group">
            <label className="form-label">{T.buyerType}</label>
            <select className="form-input">
              <option>Hotel / Restaurant Chain</option><option>Food Processing Factory</option>
              <option>Export House</option><option>Online Grocery Platform</option>
              <option>Government / Institutional</option><option>Retail Chain</option>
            </select>
          </div>
          <button className="btn-submit">✅ {T.regBtn}</button>
        </div>
      )}

      {/* Invoice */}
      {mode === 'invoice' && (
        <div className="b2b-invoice-wrap">
          <div className="listing-form" style={{ maxWidth: 480 }}>
            <div className="form-section-title">🧾 {T.invTitle}</div>
            {([['buyer',T.invBuyer,'text','Hotel Sahyadri, Pune'],['product',T.invProduct,'text','Fresh Tomatoes'],
               ['qty',T.invQty,'number','200'],['price',T.invPrice,'number','22'],
               ['fromName', lang === 'en' ? 'Your Name / Farm Name' : 'आपका नाम / फार्म नाम', 'text', user?.name || 'Farmer Name'],
               ['fromLocation', lang === 'en' ? 'Your Location' : 'आपका स्थान', 'text', 'Village, District, State'],
              ]).map(([k,lbl,type,ph]) => (
              <div key={k} className="form-group">
                <label className="form-label">{lbl}</label>
                <input className="form-input" type={type as string} placeholder={ph as string}
                  value={(invoiceData as any)[k]} onChange={e => setInvoiceData(p => ({ ...p, [k]: e.target.value }))} />
              </div>
            ))}
            <div className="form-group">
              <label className="form-label">{T.invGst}</label>
              <select className="form-input" value={invoiceData.gst} onChange={e => setInvoiceData(p => ({ ...p, gst: e.target.value }))}>
                <option value="0">0% (Exempt)</option><option value="5">5% (Most produce)</option>
                <option value="12">12%</option><option value="18">18%</option>
              </select>
            </div>
          </div>

          {invoiceData.buyer && invoiceData.product && invoiceData.qty && invoiceData.price && (
            <div className="invoice-preview">
              <div className="invoice-header">
                <div className="invoice-logo">🌾 FarmBridge</div>
                <div className="invoice-title">TAX INVOICE</div>
                <div className="invoice-num">INV-{Date.now().toString().slice(-6)}</div>
                <div className="invoice-date">{new Date().toLocaleDateString('en-IN')}</div>
              </div>
              <div className="invoice-parties">
                <div><strong>From:</strong> {invoiceData.fromName || user?.name || 'Farmer'}{invoiceData.fromLocation ? `, ${invoiceData.fromLocation}` : ''}</div>
                <div><strong>To:</strong> {invoiceData.buyer}</div>
              </div>
              <table className="invoice-table">
                <thead><tr><th>Item</th><th>Qty</th><th>Rate</th><th>Amount</th></tr></thead>
                <tbody>
                  <tr>
                    <td>{invoiceData.product}</td>
                    <td>{invoiceData.qty} kg</td>
                    <td>₹{invoiceData.price}</td>
                    <td>₹{total.toLocaleString()}</td>
                  </tr>
                </tbody>
              </table>
              <div className="invoice-totals">
                <div className="inv-row"><span>Subtotal</span><span>₹{total.toLocaleString()}</span></div>
                <div className="inv-row"><span>GST ({invoiceData.gst}%)</span><span>₹{gstAmt.toFixed(2)}</span></div>
                <div className="inv-row inv-grand"><span>Total</span><span>₹{grandTot.toFixed(2)}</span></div>
              </div>
              <div className="invoice-footer">Thank you for choosing FarmBridge. Payment due within 7 days.</div>
              <button className="btn-submit" onClick={() => window.print()}>🖨️ {lang === 'en' ? 'Print Invoice' : 'चालान प्रिंट करें'}</button>
            </div>
          )}
        </div>
      )}

      {/* Contract request modal */}
      {showDeal && !dealSent && (
        <div className="modal-overlay" onClick={() => setShowDeal(null)}>
          <div className="modal-box" onClick={e => e.stopPropagation()} style={{ maxWidth: 460 }}>
            <button className="modal-close" onClick={() => setShowDeal(null)}>✕</button>
            <div className="modal-icon">📄</div>
            <h2 className="modal-title" style={{ fontSize: '1rem' }}>{T.dealTitle}: {showDeal.product}</h2>
            {[[T.yourCompany,'text','Hotel Sahyadri'],[T.gst,'text','27AAACR5055K1ZZ'],[T.reqQty,'number',showDeal.minOrderQty.toString()],
               [T.offerPrice,'number',showDeal.pricePerUnit.toString()],[T.duration,'text',showDeal.contractDuration],[T.terms,'text','Need delivery by Tuesday']].map(([lbl,type,ph],i) => (
              <div key={i} className="form-group">
                <label className="form-label">{lbl}</label>
                <input className="form-input" type={type as string} placeholder={ph as string} />
              </div>
            ))}
            <button className="btn-submit" onClick={() => setDealSent(true)}>📄 {T.submit}</button>
          </div>
        </div>
      )}
      {dealSent && (
        <div className="modal-overlay" onClick={() => setShowDeal(null)}>
          <div className="modal-box" onClick={e => e.stopPropagation()} style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>✅</div>
            <h3>{T.sent}</h3>
            <button className="btn-submit" style={{ marginTop: '1rem' }} onClick={() => { setShowDeal(null); setDealSent(false) }}>Close</button>
          </div>
        </div>
      )}
    </div>
  )
}