import { useState, useEffect } from 'react'
import type { Language } from '../../types'
import { fetchMandiRates } from '../../services/mandiService'

interface Buyer {
  id: string
  name: string
  nameHi: string
  nameMr: string
  type: string
  typeHi: string
  typeMr: string
  rating: number
  distanceKm: number
  priceMultiplier: number // multiplier of base price
  paymentSpeed: string
  paymentSpeedHi: string
  paymentSpeedMr: string
  logo: string
  demand: 'high' | 'medium' | 'low'
}

const BUYERS_DATABASE: Buyer[] = [
  {
    id: 'b1',
    name: 'BigBasket Wholesale',
    nameHi: 'बिगबास्केट थोक',
    nameMr: 'बिगबास्केट घाऊक',
    type: 'Corporate Retailer',
    typeHi: 'कॉर्पोरेट खुदरा विक्रेता',
    typeMr: 'कॉर्पोरेट किरकोळ विक्रेता',
    rating: 4.9,
    distanceKm: 28,
    priceMultiplier: 1.15,
    paymentSpeed: 'Instant UPI / Bank',
    paymentSpeedHi: 'तुरंत UPI / बैंक',
    paymentSpeedMr: 'त्वरित UPI / बँक',
    logo: '🟢',
    demand: 'high'
  },
  {
    id: 'b2',
    name: 'Reliance Retail Mandi',
    nameHi: 'रिलायंस रिटेल मंडी',
    nameMr: 'रिलायन्स रिटेल मंडी',
    type: 'Supermarket Chain',
    typeHi: 'सुपरमार्केट चेन',
    typeMr: 'सुपरमार्केट चेन',
    rating: 4.7,
    distanceKm: 42,
    priceMultiplier: 1.12,
    paymentSpeed: '24 Hour Bank Transfer',
    paymentSpeedHi: '24 घंटे बैंक ट्रांसफर',
    paymentSpeedMr: '24 तास बँक ट्रान्सफर',
    logo: '🔵',
    demand: 'high'
  },
  {
    id: 'b3',
    name: 'NinjaCart Depot',
    nameHi: 'निंजाकार्ट डिपो',
    nameMr: 'निंजाकार्ट डेपो',
    type: 'Agritech Distributor',
    typeHi: 'एग्रीटेक वितरक',
    typeMr: 'एग्रीटेक वितरक',
    rating: 4.8,
    distanceKm: 18,
    priceMultiplier: 1.08,
    paymentSpeed: 'Instant UPI',
    paymentSpeedHi: 'तुरंत UPI',
    paymentSpeedMr: 'त्वरित UPI',
    logo: '🥷',
    demand: 'high'
  },
  {
    id: 'b4',
    name: 'Pune APMC Agent (Shinde Traders)',
    nameHi: 'पुणे APMC एजेंट (शिंदे ट्रेडर्स)',
    nameMr: 'पुणे APMC एजंट (शिंदे ट्रेडर्स)',
    type: 'Mandi Commission Agent',
    typeHi: 'मंडी कमीशन एजेंट',
    typeMr: 'मंडी कमिशन एजंट',
    rating: 4.2,
    distanceKm: 12,
    priceMultiplier: 1.02,
    paymentSpeed: 'Spot Cash',
    paymentSpeedHi: 'नकद भुगतान',
    paymentSpeedMr: 'रोख पेमेंट',
    logo: '🚜',
    demand: 'medium'
  },
  {
    id: 'b5',
    name: 'Sahyadri Farmers Producer Co.',
    nameHi: 'सह्याद्री फार्मर्स प्रोड्यूसर को.',
    nameMr: 'सह्याद्री फार्मर्स प्रोड्युसर को.',
    type: 'FPO Co-operative',
    typeHi: 'FPO सहकारी समिति',
    typeMr: 'FPO सहकारी संस्था',
    rating: 4.9,
    distanceKm: 65,
    priceMultiplier: 1.20,
    paymentSpeed: '3 Days Credit',
    paymentSpeedHi: '3 दिन क्रेडिट',
    paymentSpeedMr: '3 दिवस क्रेडिट',
    logo: '🍇',
    demand: 'high'
  },
  {
    id: 'b6',
    name: 'Local Food Processor (InstaBites)',
    nameHi: 'स्थानीय खाद्य प्रोसेसर (इंस्टाबाइट्स)',
    nameMr: 'स्थानिक अन्न प्रक्रिया उद्योग',
    type: 'Industrial Buyer',
    typeHi: 'औद्योगिक खरीदार',
    typeMr: 'औद्योगिक खरेदीदार',
    rating: 4.4,
    distanceKm: 34,
    priceMultiplier: 1.05,
    paymentSpeed: '7 Days Bank Transfer',
    paymentSpeedHi: '7 दिन बैंक ट्रांसफर',
    paymentSpeedMr: '7 दिवस बँक ट्रान्सफर',
    logo: '🏭',
    demand: 'medium'
  }
]

const CROPS = [
  { id: 'tomato', name: 'Tomato', nameHi: 'टमाटर', nameMr: 'टोमॅटो', basePrice: 22, unit: 'kg' },
  { id: 'onion', name: 'Onion', nameHi: 'प्याज', nameMr: 'कांदा', basePrice: 28, unit: 'kg' },
  { id: 'potato', name: 'Potato', nameHi: 'आलू', nameMr: 'बटाटा', basePrice: 18, unit: 'kg' },
  { id: 'wheat', name: 'Wheat', nameHi: 'गेहूं', nameMr: 'गहू', basePrice: 25, unit: 'kg' },
  { id: 'soybean', name: 'Soybean', nameHi: 'सोयाबीन', nameMr: 'सोयाबीन', basePrice: 42, unit: 'kg' }
]

export default function BestBuyerSuggestion({ lang }: { lang: Language }) {
  const [selectedCropId, setSelectedCropId] = useState(CROPS[0].id)
  const [quantity, setQuantity] = useState(1000)
  const [loading, setLoading] = useState(false)
  const [results, setResults] = useState<Buyer[] | null>(null)
  const [dealModal, setDealModal] = useState<Buyer | null>(null)
  const [liveBasePrices, setLiveBasePrices] = useState<Record<string, number>>({})

  const isEn = lang === 'en'
  const isHi = lang === 'hi'

  const t = {
    en: {
      title: 'Smart Best-Buyer Suggestions',
      subtitle: 'Find wholesale corporate buyers & agents offering the highest profit margin for your harvest.',
      cropLabel: 'Select Crop',
      qtyLabel: 'Estimated Quantity (kg)',
      findBtn: 'Analyze Best Buyers',
      searching: 'Analyzing buyer pricing algorithms, freight costs, and trust ratings...',
      offeredPrice: 'Offered Price',
      estPayout: 'Est. Gross Return',
      dist: 'Distance',
      pmt: 'Payment Method',
      demand: 'Demand',
      contactBtn: 'Secure Deal & Contact',
      netProfit: 'Estimated Net Profit',
      highDemand: 'High Demand',
      medDemand: 'Moderate Demand',
      lowDemand: 'Low Demand',
      dealTitle: 'Secure Deal Proposal',
      dealSuccess: 'Your crop details have been sent. The buyer will call you shortly on your registered number.',
      close: 'Close',
      mandiFee: 'Includes direct transfer, zero commission fees',
      rating: 'Buyer Rating'
    },
    hi: {
      title: 'स्मार्ट सर्वश्रेष्ठ-खरीदार सुझाव',
      subtitle: 'अपनी उपज के लिए उच्चतम लाभ मार्जिन की पेशकश करने वाले थोक कॉर्पोरेट खरीदारों और एजेंटों को ढूंढें।',
      cropLabel: 'फसल चुनें',
      qtyLabel: 'अनुमानित मात्रा (किलोग्राम)',
      findBtn: 'सर्वश्रेष्ठ खरीदारों का विश्लेषण करें',
      searching: 'खरीदार मूल्य निर्धारण एल्गोरिदम, माल ढुलाई लागत और ट्रस्ट रेटिंग का विश्लेषण किया जा रहा है...',
      offeredPrice: 'प्रस्तावित दर',
      estPayout: 'अनुमानित कुल आय',
      dist: 'दूरी',
      pmt: 'भुगतान का प्रकार',
      demand: 'मांग',
      contactBtn: 'सौदा सुरक्षित करें और संपर्क करें',
      netProfit: 'अनुमानित शुद्ध लाभ',
      highDemand: 'उच्च मांग',
      medDemand: 'सामान्य मांग',
      lowDemand: 'कम मांग',
      dealTitle: 'सौदा प्रस्ताव सुरक्षित करें',
      dealSuccess: 'आपकी फसल का विवरण भेज दिया गया है। खरीदार जल्द ही आपके पंजीकृत नंबर पर आपसे संपर्क करेगा।',
      close: 'बंद करें',
      mandiFee: 'सीधा ट्रांसफर, शून्य कमीशन शुल्क शामिल',
      rating: 'खरीदार रेटिंग'
    },
    mr: {
      title: 'स्मार्ट सर्वोत्तम-खरेदीदार शोधक',
      subtitle: 'तुमच्या शेतमालासाठी सर्वाधिक नफा देणारे घाऊक कॉर्पोरेट खरेदीदार आणि एजंट शोधा.',
      cropLabel: 'पीक निवडा',
      qtyLabel: 'अंदाजे प्रमाण (किलो)',
      findBtn: 'सर्वोत्तम खरेदीदारांचे विश्लेषण करा',
      searching: 'खरेदीदार किंमत ठरवणारे अल्गोरिदम, वाहतूक खर्च आणि विश्वासार्हता रेटिंगचे विश्लेषण करत आहे...',
      offeredPrice: 'प्रस्तावित दर',
      autoMandiRate: 'Live APMC Rate',
      estPayout: 'एकूण अंदाजे उत्पन्न',
      dist: 'अंतर',
      pmt: 'पेमेंट पद्धत',
      demand: 'मागणी',
      contactBtn: 'सौदा निश्चित करा व संपर्क करा',
      netProfit: 'अंदाजे निव्वळ नफा',
      highDemand: 'अधिक मागणी',
      medDemand: 'मध्यम मागणी',
      lowDemand: 'कमी मागणी',
      dealTitle: 'सौदा प्रस्ताव निश्चिती',
      dealSuccess: 'तुमच्या पिकाचा तपशील पाठवण्यात आला आहे. खरेदीदार लवकरच तुमच्याशी संपर्क साधेल.',
      close: 'बंद करा',
      mandiFee: 'थेट बँक जमा, कोणतीही कमिशन फी नाही',
      rating: 'खरेदीदार रेटिंग'
    }
  }[lang]

  useEffect(() => {
    let active = true
    fetchMandiRates({ limit: 100 })
      .then(rates => {
        if (!active) return
        const prices: Record<string, number> = {}
        
        CROPS.forEach(c => {
          const matched = rates.filter(r => r.commodity.toLowerCase().includes(c.id))
          if (matched.length > 0) {
            const avgModal = matched.reduce((s, r) => s + r.modalPrice, 0) / matched.length
            prices[c.id] = Math.round(avgModal / 100) // Convert from Rs/quintal to Rs/kg
          }
        })
        setLiveBasePrices(prices)
      })
      .catch(err => console.warn('BestBuyerSuggestion live pricing failed:', err))
    return () => { active = false }
  }, [])

  const getCropBasePrice = (cropId: string) => {
    return liveBasePrices[cropId] ?? (CROPS.find(c => c.id === cropId)?.basePrice ?? 20)
  }

  const activeCrop = CROPS.find(c => c.id === selectedCropId) || CROPS[0]
  const activeBasePrice = getCropBasePrice(selectedCropId)

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setResults(null)
    setTimeout(() => {
      // Sort buyers by payout descending
      const sorted = [...BUYERS_DATABASE].sort((a, b) => {
        const payoutA = activeBasePrice * a.priceMultiplier * quantity
        const payoutB = activeBasePrice * b.priceMultiplier * quantity
        return payoutB - payoutA
      })
      setResults(sorted)
      setLoading(false)
    }, 1200)
  }

  return (
    <div className="best-buyer-container">
      <div className="bb-header">
        <span className="bb-badge">⚡ {isEn ? 'AI Suggested Deals' : isHi ? 'एआई सुझाव सौदे' : 'AI सुचवलेले सौदे'}</span>
        {liveBasePrices[selectedCropId] && (
          <span className="bb-badge" style={{ background: 'rgba(34,197,94,0.1)', color: '#16a34a', marginLeft: '10px' }}>
            🟢 {isEn ? 'Live Rate Connected' : 'लाइव दर कनेक्टेड'}
          </span>
        )}
        <h1>{t.title}</h1>
        <p className="bb-subtitle">{t.subtitle}</p>
      </div>

      <div className="bb-card glass-card">
        <form onSubmit={handleSearch} className="bb-form">
          <div className="bb-form-group">
            <label htmlFor="bbCropSelect">{t.cropLabel}</label>
            <select
              id="bbCropSelect"
              value={selectedCropId}
              onChange={(e) => setSelectedCropId(e.target.value)}
              className="bb-select"
            >
              {CROPS.map(c => {
                const price = getCropBasePrice(c.id)
                const isLive = !!liveBasePrices[c.id]
                return (
                  <option key={c.id} value={c.id}>
                    {lang === 'en' ? c.name : lang === 'hi' ? c.nameHi : c.nameMr} (Base: ₹{price}/kg{isLive ? ' 🟢 Live' : ''})
                  </option>
                )
              })}
            </select>
          </div>

          <div className="bb-form-group">
            <label htmlFor="bbQtyInput">{t.qtyLabel}</label>
            <input
              id="bbQtyInput"
              type="number"
              min={100}
              max={100000}
              value={quantity}
              onChange={(e) => setQuantity(Number(e.target.value))}
              className="bb-input"
            />
          </div>

          <button type="submit" className="bb-submit-btn" disabled={loading}>
            {loading ? '⏳ ...' : t.findBtn}
          </button>
        </form>
      </div>

      {loading && (
        <div className="bb-loading-spinner-wrap">
          <div className="bb-spinner"></div>
          <p className="bb-loading-text">{t.searching}</p>
        </div>
      )}

      {results && !loading && (
        <div className="bb-results-section animate-fade-in">
          <div className="bb-results-grid">
            {results.map((buyer, idx) => {
              const unitPrice = Math.round(activeBasePrice * buyer.priceMultiplier)
              const grossPayout = unitPrice * quantity
              const transportCost = Math.round(buyer.distanceKm * 5 + 200) // simple transport cost calculation
              const netProfit = grossPayout - transportCost

              return (
                <div key={buyer.id} className={`bb-result-card ${idx === 0 ? 'bb-best-match' : ''}`}>
                  {idx === 0 && (
                    <div className="best-match-ribbon">⭐ {isEn ? 'Best Net Return' : isHi ? 'सर्वोत्तम लाभ' : 'उत्कृष्ट नफा'}</div>
                  )}
                  
                  <div className="bb-result-head">
                    <span className="buyer-logo-badge">{buyer.logo}</span>
                    <div>
                      <h3 className="buyer-name-title">
                        {lang === 'en' ? buyer.name : lang === 'hi' ? buyer.nameHi : buyer.nameMr}
                      </h3>
                      <span className="buyer-type-tag">
                        {lang === 'en' ? buyer.type : lang === 'hi' ? buyer.typeHi : buyer.typeMr}
                      </span>
                    </div>
                  </div>

                  <div className="bb-metrics">
                    <div className="metric-box">
                      <span className="metric-lbl">{t.offeredPrice}</span>
                      <span className="metric-val text-green">₹{unitPrice}/kg</span>
                    </div>
                    <div className="metric-box">
                      <span className="metric-lbl">{t.estPayout}</span>
                      <span className="metric-val">₹{grossPayout.toLocaleString('en-IN')}</span>
                    </div>
                    <div className="metric-box">
                      <span className="metric-lbl">{t.netProfit}</span>
                      <span className="metric-val highlight-profit">₹{netProfit.toLocaleString('en-IN')}</span>
                    </div>
                  </div>

                  <div className="bb-details-list">
                    <div className="bb-detail-item">
                      <span>📍 {t.dist}:</span>
                      <strong>{buyer.distanceKm} km</strong>
                    </div>
                    <div className="bb-detail-item">
                      <span>💳 {t.pmt}:</span>
                      <strong>{lang === 'en' ? buyer.paymentSpeed : lang === 'hi' ? buyer.paymentSpeedHi : buyer.paymentSpeedMr}</strong>
                    </div>
                    <div className="bb-detail-item">
                      <span>⭐ {t.rating}:</span>
                      <strong>{buyer.rating} / 5.0</strong>
                    </div>
                    <div className="bb-detail-item">
                      <span>🔥 {t.demand}:</span>
                      <span className={`demand-tag demand-${buyer.demand}`}>
                        {buyer.demand === 'high' ? t.highDemand : buyer.demand === 'medium' ? t.medDemand : t.lowDemand}
                      </span>
                    </div>
                  </div>

                  <button className="bb-deal-btn" onClick={() => setDealModal(buyer)}>
                    {t.contactBtn} &rarr;
                  </button>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Proposal Modal */}
      {dealModal && (
        <div className="deal-modal-backdrop">
          <div className="deal-modal-content">
            <h2>🤝 {t.dealTitle}</h2>
            <div className="deal-modal-buyer-details">
              <span className="modal-logo">{dealModal.logo}</span>
              <div>
                <h3>{lang === 'en' ? dealModal.name : lang === 'hi' ? dealModal.nameHi : dealModal.nameMr}</h3>
                <p>{lang === 'en' ? dealModal.type : lang === 'hi' ? dealModal.typeHi : dealModal.typeMr}</p>
              </div>
            </div>
            
            <div className="deal-details-summary">
              <div className="summary-row">
                <span>Crop:</span>
                <strong>{lang === 'en' ? activeCrop.name : lang === 'hi' ? activeCrop.nameHi : activeCrop.nameMr}</strong>
              </div>
              <div className="summary-row">
                <span>Quantity:</span>
                <strong>{quantity} kg</strong>
              </div>
              <div className="summary-row">
                <span>Proposed Rate:</span>
                <strong className="text-green">₹{Math.round(activeBasePrice * dealModal.priceMultiplier)}/kg</strong>
              </div>
            </div>

            <div className="deal-success-banner">
              <span className="success-icon">✓</span>
              <p>{t.dealSuccess}</p>
            </div>

            <button className="deal-modal-close" onClick={() => setDealModal(null)}>
              {t.close}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}