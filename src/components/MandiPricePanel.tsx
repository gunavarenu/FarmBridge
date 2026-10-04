import { useEffect, useState, useMemo } from 'react'
import { fetchMandiRates, FALLBACK_RATES } from '../services/mandiService'
import type { MandiRate } from '../services/mandiService'
import type { Language } from '../types'

interface Props { state?: string; lang: Language }

const CATEGORY_EMOJIS: Record<string, string> = {
  vegetable: '🥦',
  fruit: '🍎',
  grain: '🌾',
  spice: '🌶️',
}

const CATEGORY_COLORS: Record<string, string> = {
  vegetable: '#22c55e',
  fruit:     '#f97316',
  grain:     '#eab308',
  spice:     '#ef4444',
}

export default function MandiPricePanel({ state = 'Maharashtra', lang }: Props) {
  const [rates,      setRates]     = useState<MandiRate[]>(FALLBACK_RATES)
  const [loading,    setLoading]   = useState(true)
  const [isLive,     setIsLive]    = useState(false)
  const [fetchTime,  setFetchTime] = useState('')
  const [search,     setSearch]    = useState('')
  const [category,   setCategory]  = useState<'all' | 'vegetable' | 'fruit' | 'grain' | 'spice'>('all')

  const title = lang === 'en' ? "Today's Mandi Rates" : lang === 'hi' ? 'आज की मंडी दरें' : 'आजचे मंडी दर'
  const searchPlaceholder = lang === 'en' ? 'Search vegetable / fruit…' : lang === 'hi' ? 'सब्जी / फल खोजें…' : 'भाजी / फळ शोधा…'

  async function load() {
    setLoading(true)
    const data = await fetchMandiRates({ state, limit: 100 })
    setRates(data)
    setIsLive(data !== FALLBACK_RATES && data.length > 0 && !data.some(r => r.date === 'today'))
    setFetchTime(new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }))
    setLoading(false)
  }

  useEffect(() => {
    load()
    const t = setInterval(load, 5 * 60 * 1000)
    return () => clearInterval(t)
  }, [state])

  const filtered = useMemo(() => {
    let result = rates
    if (category !== 'all') {
      result = result.filter(r => r.category === category || r.category == null)
    }
    if (search.trim()) {
      const q = search.trim().toLowerCase()
      result = result.filter(r =>
        r.commodity.toLowerCase().includes(q) ||
        r.market.toLowerCase().includes(q)
      )
    }
    return result
  }, [rates, category, search])

  const categories: Array<{ key: typeof category; label: string; emoji: string }> = [
    { key: 'all',       label: lang === 'en' ? 'All'        : lang === 'hi' ? 'सभी'    : 'सर्व',     emoji: '🌐' },
    { key: 'vegetable', label: lang === 'en' ? 'Vegetables' : lang === 'hi' ? 'सब्जियाँ' : 'भाज्या', emoji: '🥦' },
    { key: 'fruit',     label: lang === 'en' ? 'Fruits'     : lang === 'hi' ? 'फल'      : 'फळे',     emoji: '🍎' },
    { key: 'grain',     label: lang === 'en' ? 'Grains'     : lang === 'hi' ? 'अनाज'    : 'धान्य',   emoji: '🌾' },
    { key: 'spice',     label: lang === 'en' ? 'Spices'     : lang === 'hi' ? 'मसाले'   : 'मसाले',   emoji: '🌶️' },
  ]

  return (
    <div className="tips-card market-rates">
      {/* Header */}
      <div className="mandi-header">
        <h3 className="tips-title" style={{ marginBottom: 0 }}>📊 {title}</h3>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span className={isLive ? 'live-badge' : 'fallback-badge'}>{isLive ? 'LIVE' : 'Est.'}</span>
          {fetchTime && <span style={{ fontSize: 11, color: 'var(--gray-400)' }}>{fetchTime}</span>}
          <button className="refresh-btn" onClick={load} disabled={loading}>↻</button>
        </div>
      </div>

      {/* Category filter pills */}
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 10 }}>
        {categories.map(c => (
          <button
            key={c.key}
            onClick={() => setCategory(c.key)}
            style={{
              padding: '3px 10px',
              borderRadius: 20,
              border: 'none',
              cursor: 'pointer',
              fontSize: 12,
              fontWeight: 600,
              background: category === c.key ? 'var(--green)' : 'rgba(255,255,255,0.08)',
              color: category === c.key ? '#fff' : 'var(--gray-400)',
              transition: 'all 0.2s',
            }}
          >
            {c.emoji} {c.label}
          </button>
        ))}
      </div>

      {/* Search box */}
      <input
        type="text"
        placeholder={searchPlaceholder}
        value={search}
        onChange={e => setSearch(e.target.value)}
        style={{
          width: '100%',
          padding: '7px 12px',
          borderRadius: 10,
          border: '1px solid rgba(255,255,255,0.12)',
          background: 'rgba(255,255,255,0.06)',
          color: 'var(--gray-200)',
          fontSize: 13,
          marginBottom: 10,
          outline: 'none',
          boxSizing: 'border-box',
        }}
      />

      {loading ? (
        <div className="mandi-loading"><div className="spinner" /><span>Fetching prices…</span></div>
      ) : filtered.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '2rem 0', color: 'var(--gray-500)' }}>
          {lang === 'en' ? 'No results found.' : lang === 'hi' ? 'कोई परिणाम नहीं।' : 'कोणतेही निकाल नाहीत.'}
        </div>
      ) : (
        <>
          <div style={{ fontSize: 11, color: 'var(--gray-500)', marginBottom: 6 }}>
            {filtered.length} {lang === 'en' ? 'commodities shown' : lang === 'hi' ? 'वस्तुएँ' : 'वस्तू'}
          </div>
          <div style={{ maxHeight: 420, overflowY: 'auto', paddingRight: 4 }}>
            {filtered.map((r, i) => (
              <div key={i} className="rate-row">
                <div>
                  <div className="rate-name" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span style={{ fontSize: 15 }}>
                      {CATEGORY_EMOJIS[r.category ?? ''] || '🌿'}
                    </span>
                    <span>{r.commodity}</span>
                    {r.category && (
                      <span style={{
                        fontSize: 9,
                        padding: '2px 6px',
                        borderRadius: 8,
                        background: `${CATEGORY_COLORS[r.category]}22`,
                        color: CATEGORY_COLORS[r.category],
                        fontWeight: 700,
                        textTransform: 'uppercase',
                      }}>
                        {r.category}
                      </span>
                    )}
                  </div>
                  <div className="rate-market">📍 {r.market}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div className="rate-price">₹{r.modalPrice}/q</div>
                  <div className="rate-range">₹{r.minPrice}–{r.maxPrice}</div>
                </div>
              </div>
            ))}
          </div>
          <p className="mandi-source">Source: Agmarknet / data.gov.in</p>
        </>
      )}
    </div>
  )
}