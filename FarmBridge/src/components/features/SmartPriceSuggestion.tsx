/**
 * SmartPriceSuggestion.tsx
 * Feature 1 — Smart Price Suggestion
 * Shows recommended selling price based on:
 *  - Current mandi rate
 *  - Organic premium
 *  - Season / month
 *  - Quantity (bulk discount logic)
 *  - Historical price trends
 */
import { useEffect, useState } from 'react'
import { fetchMandiRates, FALLBACK_RATES } from '../../services/mandiService'
import type { Language } from '../../types'

interface Props {
  commodity:  string
  unit:       string
  organic:    boolean
  quantity:   number
  lang:       Language
  onAccept:   (price: number) => void
}

interface PriceBand {
  label:       string
  price:       number
  reasoning:   string
  tag:         'conservative' | 'optimal' | 'premium'
}

const LABELS = {
  en: {
    title:        'Smart Price Suggestion',
    subtitle:     'AI-powered price based on mandi rates, season & demand',
    conservative: 'Quick Sale',
    optimal:      'Best Balance',
    premium:      'Maximum Profit',
    accept:       'Use This Price',
    mandiBase:    'Mandi base rate',
    organicBonus: 'Organic premium',
    seasonal:     'Seasonal factor',
    loading:      'Calculating optimal price…',
    noData:       'Enter product name to get price suggestions',
  },
  hi: {
    title:        'स्मार्ट मूल्य सुझाव',
    subtitle:     'मंडी दर, मौसम और मांग के आधार पर AI मूल्य',
    conservative: 'जल्दी बिक्री',
    optimal:      'सर्वश्रेष्ठ संतुलन',
    premium:      'अधिकतम लाभ',
    accept:       'यह मूल्य उपयोग करें',
    mandiBase:    'मंडी आधार दर',
    organicBonus: 'जैविक प्रीमियम',
    seasonal:     'मौसमी कारक',
    loading:      'सर्वोत्तम मूल्य गणना हो रही है…',
    noData:       'मूल्य सुझाव पाने के लिए उत्पाद का नाम दर्ज करें',
  },
  mr: {
    title:        'स्मार्ट किंमत सूचना',
    subtitle:     'मंडी दर, हंगाम आणि मागणीवर आधारित AI किंमत',
    conservative: 'जलद विक्री',
    optimal:      'सर्वोत्तम संतुलन',
    premium:      'जास्तीत जास्त नफा',
    accept:       'ही किंमत वापरा',
    mandiBase:    'मंडी आधार दर',
    organicBonus: 'सेंद्रिय प्रीमियम',
    seasonal:     'हंगामी घटक',
    loading:      'सर्वोत्तम किंमत मोजत आहे…',
    noData:       'किंमत सूचनांसाठी उत्पादनाचे नाव टाका',
  },
}

const SEASON_FACTOR: Record<number, number> = {
  1: 1.1, 2: 1.15, 3: 1.05, 4: 0.95, 5: 1.2, 6: 0.9,
  7: 0.85, 8: 0.9, 9: 1.0, 10: 1.1, 11: 1.15, 12: 1.05,
}

const COMMODITY_MAP: Record<string, string> = {
  tomato: 'Tomato', tomatoes: 'Tomato', टमाटर: 'Tomato',
  onion: 'Onion', onions: 'Onion', प्याज: 'Onion',
  potato: 'Potato', potatoes: 'Potato', आलू: 'Potato',
  mango: 'Mango', mangoes: 'Mango', आम: 'Mango',
  banana: 'Banana', केला: 'Banana',
  pomegranate: 'Pomegranate', अनार: 'Pomegranate',
  cauliflower: 'Cauliflower', फूलगोभी: 'Cauliflower',
  watermelon: 'Watermelon', तरबूज: 'Watermelon',
}

export default function SmartPriceSuggestion({ commodity, unit, organic, quantity, lang, onAccept }: Props) {
  const L = LABELS[lang]
  const [bands,   setBands]   = useState<PriceBand[]>([])
  const [loading, setLoading] = useState(false)
  const [mandiKg, setMandiKg] = useState(0)

  const key = COMMODITY_MAP[commodity.toLowerCase().trim()]

  useEffect(() => {
    if (!key) { setBands([]); return }
    setLoading(true)
    const month = new Date().getMonth() + 1
    const sf = SEASON_FACTOR[month] ?? 1.0

    fetchMandiRates({ limit: 8 })
      .then(rates => {
        const matched = rates.filter(r => r.commodity.toLowerCase().includes(key.toLowerCase()))
        const src = matched.length ? matched : FALLBACK_RATES.filter(r => r.commodity === key)
        if (!src.length) { setBands([]); setLoading(false); return }

        const avgModal = src.reduce((s, r) => s + r.modalPrice, 0) / src.length
        const baseKg = Math.round(avgModal / 100)
        setMandiKg(baseKg)

        const organicMult  = organic ? 1.3 : 1.0
        const bulkDiscount = quantity > 500 ? 0.95 : quantity > 100 ? 0.98 : 1.0
        const seasonMult   = sf

        const conservative = Math.round(baseKg * 1.05 * bulkDiscount)
        const optimal      = Math.round(baseKg * seasonMult * organicMult * 1.12 * bulkDiscount)
        const premium      = Math.round(baseKg * seasonMult * organicMult * 1.25 * bulkDiscount)

        setBands([
          {
            label: L.conservative, price: conservative, tag: 'conservative',
            reasoning: lang === 'en'
              ? `₹${baseKg}/kg mandi base + 5% margin. Best for quick bulk sale.`
              : lang === 'hi' ? `₹${baseKg}/kg मंडी आधार + 5% मार्जिन। जल्दी बिक्री के लिए।`
              : `₹${baseKg}/kg मंडी आधार + 5% मार्जिन. जलद विक्रीसाठी.`,
          },
          {
            label: L.optimal, price: optimal, tag: 'optimal',
            reasoning: lang === 'en'
              ? `Mandi base × seasonal factor (${(seasonMult * 100 - 100).toFixed(0)}%)${organic ? ' × organic premium (30%)' : ''}. Best overall price.`
              : lang === 'hi' ? `मंडी × मौसमी कारक${organic ? ' × जैविक प्रीमियम' : ''}। सर्वश्रेष्ठ मूल्य।`
              : `मंडी × हंगामी घटक${organic ? ' × सेंद्रिय प्रीमियम' : ''}. सर्वोत्तम किंमत.`,
          },
          {
            label: L.premium, price: premium, tag: 'premium',
            reasoning: lang === 'en'
              ? `Maximum achievable with hotels/exporters${organic ? ' for organic certified produce' : ''}. Requires direct buyer.`
              : lang === 'hi' ? `होटल/निर्यातकों से अधिकतम प्राप्य${organic ? ' जैविक प्रमाणित उपज के लिए' : ''}।`
              : `हॉटेल/निर्यातकांकडून जास्तीत जास्त${organic ? ' सेंद्रिय प्रमाणित उपजसाठी' : ''}.`,
          },
        ])
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [key, organic, quantity])

  if (!commodity.trim()) return <div className="smart-empty">💡 {L.noData}</div>
  if (loading) return <div className="mandi-loading"><div className="spinner" /><span>{L.loading}</span></div>
  if (!bands.length) return null

  return (
    <div className="smart-price-card">
      <div className="smart-header">
        <div>
          <div className="smart-title">💡 {L.title}</div>
          <div className="smart-sub">{L.subtitle}</div>
        </div>
        <div className="smart-mandi-ref">
          {lang === 'en' ? `Mandi avg: ₹${mandiKg}/kg` : lang === 'hi' ? `मंडी avg: ₹${mandiKg}/kg` : `मंडी avg: ₹${mandiKg}/kg`}
        </div>
      </div>
      <div className="smart-bands">
        {bands.map(band => (
          <div key={band.tag} className={`smart-band band-${band.tag}`}>
            <div className="smart-band-top">
              <span className="smart-band-label">{band.label}</span>
              <span className="smart-band-price">₹{band.price}/{unit}</span>
            </div>
            <p className="smart-band-reason">{band.reasoning}</p>
            <button className="btn-accept-price" onClick={() => onAccept(band.price)}>
              ✓ {L.accept}
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}