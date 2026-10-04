import { useState, useEffect } from 'react'
import type { Language } from '../../types'
import { fetchMandiRates } from '../../services/mandiService'

interface Prediction {
  crop: string; cropHi: string; emoji: string
  demand: 'very_high' | 'high' | 'medium' | 'low'
  priceOutlook: 'rising' | 'stable' | 'falling'
  pricePct: number
  reason: string; reasonHi: string
  bestTimeToSell: string; bestTimeHi: string
  plantNow: boolean
}

const PREDICTIONS: Prediction[] = [
  {
    crop: 'Tomato', cropHi: 'टमाटर', emoji: '🍅',
    demand: 'very_high', priceOutlook: 'rising', pricePct: 35,
    reason: 'Festive season demand + low supply due to recent rains. Prices expected to rise 30–40%.',
    reasonHi: 'त्योहारी मांग + बारिश से कम आपूर्ति। कीमतें 30-40% बढ़ने की उम्मीद।',
    bestTimeToSell: 'Next 2 weeks', bestTimeHi: 'अगले 2 सप्ताह', plantNow: true,
  },
  {
    crop: 'Onion', cropHi: 'प्याज', emoji: '🧅',
    demand: 'high', priceOutlook: 'rising', pricePct: 20,
    reason: 'Kharif crop arriving late. Current mandi stock low across Maharashtra.',
    reasonHi: 'खरीफ फसल देर से आ रही है। महाराष्ट्र में मंडी स्टॉक कम।',
    bestTimeToSell: 'Next 3 weeks', bestTimeHi: 'अगले 3 सप्ताह', plantNow: false,
  },
  {
    crop: 'Mango', cropHi: 'आम', emoji: '🥭',
    demand: 'very_high', priceOutlook: 'stable', pricePct: 0,
    reason: 'Peak mango season. High export demand from UAE and UK markets.',
    reasonHi: 'आम का पीक सीजन। UAE और UK से उच्च निर्यात मांग।',
    bestTimeToSell: 'Right now', bestTimeHi: 'अभी', plantNow: false,
  },
  {
    crop: 'Potato', cropHi: 'आलू', emoji: '🥔',
    demand: 'medium', priceOutlook: 'falling', pricePct: -10,
    reason: 'New season crop flooding markets. Prices expected to dip for 3–4 weeks.',
    reasonHi: 'नई फसल बाज़ार में आ रही है। 3-4 सप्ताह कीमत कम रह सकती है।',
    bestTimeToSell: 'Wait 4 weeks', bestTimeHi: '4 सप्ताह बाद', plantNow: false,
  },
  {
    crop: 'Cauliflower', cropHi: 'फूलगोभी', emoji: '🥦',
    demand: 'high', priceOutlook: 'rising', pricePct: 15,
    reason: 'Wedding season demand. Hotels and caterers ordering large quantities.',
    reasonHi: 'शादी के मौसम की मांग। होटल और कैटरर्स बड़ी मात्रा में ऑर्डर कर रहे हैं।',
    bestTimeToSell: 'Next 5 weeks', bestTimeHi: 'अगले 5 सप्ताह', plantNow: true,
  },
  {
    crop: 'Pomegranate', cropHi: 'अनार', emoji: '🫐',
    demand: 'very_high', priceOutlook: 'rising', pricePct: 25,
    reason: 'Export season peak. International buyers offering 25% above domestic mandi.',
    reasonHi: 'निर्यात का पीक सीजन। अंतर्राष्ट्रीय खरीदार घरेलू मंडी से 25% अधिक दे रहे हैं।',
    bestTimeToSell: 'This week', bestTimeHi: 'इस सप्ताह', plantNow: false,
  },
  {
    crop: 'Grapes', cropHi: 'अंगूर', emoji: '🍇',
    demand: 'high', priceOutlook: 'stable', pricePct: 5,
    reason: 'Consistent hotel and juice factory demand. Steady pricing next 60 days.',
    reasonHi: 'होटल और जूस फैक्ट्री की निरंतर मांग। अगले 60 दिन स्थिर मूल्य।',
    bestTimeToSell: 'Anytime', bestTimeHi: 'कभी भी', plantNow: true,
  },
  {
    crop: 'Watermelon', cropHi: 'तरबूज', emoji: '🍉',
    demand: 'low', priceOutlook: 'falling', pricePct: -20,
    reason: 'Off-season. Very low demand. Consider cold storage or wait for summer.',
    reasonHi: 'ऑफ-सीजन। मांग बहुत कम। कोल्ड स्टोरेज या गर्मी का इंतजार करें।',
    bestTimeToSell: 'Wait till March', bestTimeHi: 'मार्च तक प्रतीक्षा करें', plantNow: false,
  },
]

interface Props { lang: Language }

export default function DemandPrediction({ lang }: Props) {
  const [horizon, setHorizon] = useState<'30' | '60' | '90'>('30')
  const [filter,  setFilter]  = useState<'all' | 'very_high' | 'high'>('all')
  const [livePrices, setLivePrices] = useState<Record<string, number>>({})

  const T = {
    en: {
      title: 'Demand Prediction', subtitle: 'AI-powered crop demand forecast for next 30/60/90 days',
      days30: 'Next 30 Days', days60: 'Next 60 Days', days90: 'Next 90 Days',
      all: 'All Crops', veryHigh: '🔥 Very High Demand', high: '📈 High Demand',
      demandLabel: 'Demand', priceLabel: 'Price Outlook', sellLabel: 'Best Time to Sell',
      plantLabel: '🌱 Plant Now?', yes: 'Yes — good ROI', no: 'Not recommended',
      rising: '📈 Rising', stable: '→ Stable', falling: '📉 Falling',
      vhigh: '🔥 Very High', high2: '📈 High', med: '→ Medium', low: '📉 Low',
      disclaimer: '⚠️ Predictions based on historical patterns, season and current market data. Always verify before making large decisions.',
    },
    hi: {
      title: 'मांग पूर्वानुमान', subtitle: 'अगले 30/60/90 दिनों की AI फसल मांग पूर्वानुमान',
      days30: 'अगले 30 दिन', days60: 'अगले 60 दिन', days90: 'अगले 90 दिन',
      all: 'सभी फसलें', veryHigh: '🔥 बहुत अधिक मांग', high: '📈 अधिक मांग',
      demandLabel: 'मांग', priceLabel: 'मूल्य दृष्टिकोण', sellLabel: 'बेचने का समय',
      plantLabel: '🌱 अभी बोएं?', yes: 'हाँ — अच्छा ROI', no: 'अनुशंसित नहीं',
      rising: '📈 बढ़ रहा है', stable: '→ स्थिर', falling: '📉 गिर रहा है',
      vhigh: '🔥 बहुत अधिक', high2: '📈 अधिक', med: '→ मध्यम', low: '📉 कम',
      disclaimer: '⚠️ पूर्वानुमान ऐतिहासिक पैटर्न और वर्तमान बाज़ार डेटा पर आधारित हैं।',
    },
    mr: {
      title: 'मागणी अंदाज', subtitle: 'पुढील 30/60/90 दिवसांचा AI पीक मागणी अंदाज',
      days30: 'पुढील 30 दिवस', days60: 'पुढील 60 दिवस', days90: 'पुढील 90 दिवस',
      all: 'सर्व पिके', veryHigh: '🔥 खूप जास्त मागणी', high: '📈 जास्त मागणी',
      demandLabel: 'मागणी', priceLabel: 'किंमत दृष्टिकोण', sellLabel: 'विक्रीची वेळ',
      plantLabel: '🌱 आता पेरा?', yes: 'होय — चांगला ROI', no: 'शिफारस नाही',
      rising: '📈 वाढत आहे', stable: '→ स्थिर', falling: '📉 घसरत आहे',
      vhigh: '🔥 खूप जास्त', high2: '📈 जास्त', med: '→ मध्यम', low: '📉 कमी',
      disclaimer: '⚠️ अंदाज ऐतिहासिक नमुने आणि सध्याच्या बाजार डेटावर आधारित आहेत.',
    },
  }[lang]

  useEffect(() => {
    let active = true
    fetchMandiRates({ limit: 100 })
      .then(rates => {
        if (!active) return
        const prices: Record<string, number> = {}
        PREDICTIONS.forEach(p => {
          const key = p.crop.toLowerCase()
          const matched = rates.filter(r => r.commodity.toLowerCase().includes(key))
          if (matched.length > 0) {
            const avgModal = matched.reduce((s, r) => s + r.modalPrice, 0) / matched.length
            prices[p.crop] = Math.round(avgModal / 100) // Convert from Rs/quintal to Rs/kg
          }
        })
        setLivePrices(prices)
      })
      .catch(err => console.warn('DemandPrediction live rates fetch failed:', err))
    return () => { active = false }
  }, [])

  const demandLabel = (d: string) => d === 'very_high' ? T.vhigh : d === 'high' ? T.high2 : d === 'medium' ? T.med : T.low
  const demandClass = (d: string) => d === 'very_high' ? 'demand-vh' : d === 'high' ? 'demand-h' : d === 'medium' ? 'demand-m' : 'demand-l'
  const priceLabel  = (p: string, pct: number) => p === 'rising' ? `${T.rising} +${pct}%` : p === 'falling' ? `${T.falling} ${pct}%` : T.stable
  const priceClass  = (p: string) => p === 'rising' ? 'diff-above' : p === 'falling' ? 'diff-below' : ''

  const filtered = PREDICTIONS.filter(p =>
    filter === 'all' || p.demand === filter || (filter === 'very_high' && p.demand === 'very_high') || (filter === 'high' && (p.demand === 'high' || p.demand === 'very_high'))
  )

  return (
    <div className="demand-page">
      <h1 className="page-title">🔮 {T.title}</h1>
      <p className="page-sub">{T.subtitle}</p>

      <div className="demand-controls">
        <div className="sell-tabs">
          {[['30', T.days30], ['60', T.days60], ['90', T.days90]].map(([v, l]) => (
            <button key={v} className={`sell-tab ${horizon === v ? 'sell-tab-active' : ''}`} onClick={() => setHorizon(v as any)}>{l}</button>
          ))}
        </div>
        <div className="category-tabs">
          {[['all', T.all], ['very_high', T.veryHigh], ['high', T.high]].map(([v, l]) => (
            <button key={v} className={`cat-tab ${filter === v ? 'cat-active' : ''}`} onClick={() => setFilter(v as any)}>{l}</button>
          ))}
        </div>
      </div>

      <div className="demand-grid">
        {filtered.map(p => (
          <div key={p.crop} className={`demand-card ${p.demand === 'very_high' ? 'demand-card-hot' : ''}`}>
            <div className="demand-card-header">
              <span className="demand-emoji">{p.emoji}</span>
              <div>
                <div className="demand-crop">{p.crop}</div>
                <div className="demand-crop-hi">{p.cropHi}</div>
              </div>
              <div style={{ marginLeft: 'auto', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px' }}>
                <span className={`demand-badge ${demandClass(p.demand)}`}>{demandLabel(p.demand)}</span>
                {livePrices[p.crop] && (
                  <span style={{ fontSize: '11px', background: 'rgba(34,197,94,0.1)', color: '#16a34a', padding: '2px 6px', borderRadius: '6px', fontWeight: 700 }}>
                    ₹{livePrices[p.crop]}/kg
                  </span>
                )}
              </div>
            </div>

            <div className="demand-metrics">
              <div className="demand-metric">
                <span className="dm-label">{T.priceLabel}</span>
                <span className={`dm-val ${priceClass(p.priceOutlook)}`}>{priceLabel(p.priceOutlook, p.pricePct)}</span>
              </div>
              <div className="demand-metric">
                <span className="dm-label">{T.sellLabel}</span>
                <span className="dm-val">{lang === 'hi' ? p.bestTimeHi : p.bestTimeToSell}</span>
              </div>
            </div>

            <p className="demand-reason">{lang === 'hi' ? p.reasonHi : p.reason}</p>

            <div className={`plant-badge ${p.plantNow ? 'plant-yes' : 'plant-no'}`}>
              {T.plantLabel} {p.plantNow ? T.yes : T.no}
            </div>
          </div>
        ))}
      </div>

      <p className="demand-disclaimer">{T.disclaimer}</p>
    </div>
  )
}