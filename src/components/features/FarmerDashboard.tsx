/**
 * FarmerDashboard.tsx
 * Feature 2 — Farmer Profit Dashboard
 * Shows earnings, listings, orders, profit vs mandi comparison,
 * monthly chart, and top performing products
 */
import { useState, useEffect } from 'react'
import type { Language, AuthUser } from '../../types'
import { supabase } from '../../config/supabaseClient'

interface Props { lang: Language; user: AuthUser | null }

interface Order {
  id: string; product: string; qty: number; unit: string
  salePrice: number; mandiPrice: number; buyer: string
  date: string; status: 'paid' | 'pending' | 'delivered'
}

/** Build monthly earnings chart from real paid orders */
function buildMonthlyChart(orders: any[]): { month: string; earning: number; mandi: number }[] {
  const paidOrders = orders.filter(o => o.payment_status === 'paid')
  if (paidOrders.length === 0) return []

  // Group by YYYY-MM
  const map = new Map<string, { earning: number; mandi: number }>()
  paidOrders.forEach(o => {
    const d = new Date(o.created_at)
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
    const earning = Number(o.unit_price) * Number(o.quantity)
    const existing = map.get(key) || { earning: 0, mandi: 0 }
    map.set(key, {
      earning: existing.earning + earning,
      mandi: existing.mandi + Math.round(earning * 0.75),
    })
  })

  // Sort by date and take last 6 months
  const sorted = Array.from(map.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .slice(-6)

  const monthNames = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
  return sorted.map(([key, val]) => ({
    month: monthNames[Number(key.split('-')[1]) - 1],
    earning: val.earning,
    mandi: val.mandi,
  }))
}

export default function FarmerDashboard({ lang, user }: Props) {
  const [tab, setTab] = useState<'overview' | 'orders' | 'chart'>('overview')
  const [orders, setOrders] = useState<any[]>([])
  const [activeListingsCount, setActiveListingsCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [monthly, setMonthly] = useState<{ month: string; earning: number; mandi: number }[]>([])

  useEffect(() => {
    let active = true
    async function loadDashboard() {
      if (!supabase || !user) {
        setLoading(false)
        return
      }
      try {
        const { data: dbOrders, error: err } = await supabase
          .from('orders')
          .select('*, products(*)')
          .eq('farmer_id', user.id)
          .order('created_at', { ascending: false })
        
        if (err) throw err

        const { count, error: countErr } = await supabase
          .from('products')
          .select('*', { count: 'exact', head: true })
          .eq('farmer_id', user.id)
          .eq('active', true)

        if (countErr) throw countErr

        if (active) {
          const loadedOrders = dbOrders || []
          setOrders(loadedOrders)
          setMonthly(buildMonthlyChart(loadedOrders))
          setActiveListingsCount(count || 0)
          setLoading(false)
        }
      } catch (e) {
        console.error('Error loading dashboard data:', e)
        if (active) setLoading(false)
      }
    }
    loadDashboard()
    return () => { active = false }
  }, [user])

  const displayedOrders = orders.map(o => ({
    id: o.id,
    product: o.products?.name || 'Produce',
    qty: Number(o.quantity),
    unit: o.products?.unit || 'kg',
    salePrice: Number(o.unit_price),
    mandiPrice: Math.round(Number(o.unit_price) * 0.75),
    buyer: o.payment_id ? 'Buyer (Paid)' : 'Direct Merchant',
    date: o.created_at ? o.created_at.split('T')[0] : new Date().toISOString().split('T')[0],
    status: o.payment_status === 'paid' ? 'paid' as const : 'pending' as const
  }))

  const totalEarnings  = displayedOrders.filter(o => o.status === 'paid').reduce((s, o) => s + o.salePrice * o.qty, 0)
  const totalMandiWould = displayedOrders.filter(o => o.status === 'paid').reduce((s, o) => s + o.mandiPrice * o.qty, 0)
  const extraEarned    = totalEarnings - totalMandiWould
  const extraPct       = totalMandiWould > 0 ? Math.round((extraEarned / totalMandiWould) * 100) : 0
  const activeListings = activeListingsCount
  const pendingOrders  = displayedOrders.filter(o => o.status === 'pending').length

  const T = {
    en: {
      title: 'My Profit Dashboard', totalEarned: 'Total Earned', extraVsMandi: 'Extra vs Mandi',
      activeListings: 'Active Listings', pendingOrders: 'Pending Orders',
      orders: 'Order History', chart: 'Monthly Earnings', overview: 'Overview',
      product: 'Product', qty: 'Qty', yourPrice: 'Your Price', mandiRate: 'Mandi',
      profit: 'Extra Profit', buyer: 'Buyer', status: 'Status', date: 'Date',
      paid: '✅ Paid', pending: '⏳ Pending', delivered: '📦 Delivered',
      vsMandiTitle: 'You earned extra compared to selling at mandi',
      yourEarning: 'Your Earning', mandiEarning: 'If sold at Mandi',
    },
    hi: {
      title: 'मेरा लाभ डैशबोर्ड', totalEarned: 'कुल कमाई', extraVsMandi: 'मंडी से अतिरिक्त',
      activeListings: 'सक्रिय लिस्टिंग', pendingOrders: 'लंबित ऑर्डर',
      orders: 'ऑर्डर इतिहास', chart: 'मासिक कमाई', overview: 'अवलोकन',
      product: 'उत्पाद', qty: 'मात्रा', yourPrice: 'आपका मूल्य', mandiRate: 'मंडी',
      profit: 'अतिरिक्त लाभ', buyer: 'खरीदार', status: 'स्थिति', date: 'तारीख',
      paid: '✅ भुगतान हुआ', pending: '⏳ लंबित', delivered: '📦 डिलीवर',
      vsMandiTitle: 'मंडी में बेचने की तुलना में आपने अधिक कमाया',
      yourEarning: 'आपकी कमाई', mandiEarning: 'मंडी में होती',
    },
    mr: {
      title: 'माझा नफा डॅशबोर्ड', totalEarned: 'एकूण कमाई', extraVsMandi: 'मंडीपेक्षा जास्त',
      activeListings: 'सक्रिय यादी', pendingOrders: 'प्रलंबित ऑर्डर',
      orders: 'ऑर्डर इतिहास', chart: 'मासिक कमाई', overview: 'आढावा',
      product: 'उत्पादन', qty: 'प्रमाण', yourPrice: 'तुमची किंमत', mandiRate: 'मंडी',
      profit: 'अतिरिक्त नफा', buyer: 'खरेदीदार', status: 'स्थिती', date: 'तारीख',
      paid: '✅ पेमेंट झाले', pending: '⏳ प्रलंबित', delivered: '📦 डिलीव्हर',
      vsMandiTitle: 'मंडीत विकण्यापेक्षा तुम्ही जास्त कमवले',
      yourEarning: 'तुमची कमाई', mandiEarning: 'मंडीत मिळाली असती',
    },
  }[lang]

  const maxEarning = Math.max(...monthly.map(m => m.earning), 1000)

  return (
    <div className="dashboard-page">
      <h1 className="page-title">📊 {T.title}</h1>

      {/* KPI Cards */}
      <div className="dashboard-kpis">
        <div className="kpi-card kpi-green">
          <div className="kpi-icon">💰</div>
          <div className="kpi-value">₹{(totalEarnings / 1000).toFixed(1)}K</div>
          <div className="kpi-label">{T.totalEarned}</div>
        </div>
        <div className="kpi-card kpi-gold">
          <div className="kpi-icon">📈</div>
          <div className="kpi-value">+₹{(extraEarned / 1000).toFixed(1)}K</div>
          <div className="kpi-label">{T.extraVsMandi} (+{extraPct}%)</div>
        </div>
        <div className="kpi-card kpi-blue">
          <div className="kpi-icon">🌾</div>
          <div className="kpi-value">{activeListings}</div>
          <div className="kpi-label">{T.activeListings}</div>
        </div>
        <div className="kpi-card kpi-orange">
          <div className="kpi-icon">⏳</div>
          <div className="kpi-value">{pendingOrders}</div>
          <div className="kpi-label">{T.pendingOrders}</div>
        </div>
      </div>

      {/* vs Mandi bar */}
      <div className="vs-mandi-card">
        <div className="vs-mandi-title">{T.vsMandiTitle}</div>
        <div className="vs-mandi-bars">
          <div className="vs-bar-row">
            <span className="vs-bar-label">{T.yourEarning}</span>
            <div className="vs-bar-track">
              <div className="vs-bar-fill vs-bar-yours" style={{ width: '100%' }} />
            </div>
            <span className="vs-bar-val">₹{totalEarnings.toLocaleString()}</span>
          </div>
          <div className="vs-bar-row">
            <span className="vs-bar-label">{T.mandiEarning}</span>
            <div className="vs-bar-track">
              <div className="vs-bar-fill vs-bar-mandi" style={{ width: `${(totalMandiWould / totalEarnings) * 100}%` }} />
            </div>
            <span className="vs-bar-val">₹{totalMandiWould.toLocaleString()}</span>
          </div>
        </div>
        <div className="vs-mandi-savings">🎉 +₹{extraEarned.toLocaleString()} extra earned via FarmBridge!</div>
      </div>

      {/* Tabs */}
      <div className="dashboard-tabs">
        {(['overview', 'orders', 'chart'] as const).map(t2 => (
          <button key={t2} className={`dash-tab ${tab === t2 ? 'dash-tab-active' : ''}`} onClick={() => setTab(t2)}>
            {t2 === 'overview' ? T.overview : t2 === 'orders' ? T.orders : T.chart}
          </button>
        ))}
      </div>

      {/* Overview tab */}
      {tab === 'overview' && (
        <div className="dash-overview">
          <h3 className="dash-section-title">🏆 {lang === 'en' ? 'Top Products by Profit' : lang === 'hi' ? 'शीर्ष उत्पाद' : 'शीर्ष उत्पादने'}</h3>
          {displayedOrders.length === 0 && (
            <p style={{ color: 'var(--gray-500)', fontStyle: 'italic', padding: '2rem 0', textAlign: 'center' }}>
              {lang === 'en' ? 'No sales data yet. Start selling to see your profits here!' : lang === 'hi' ? 'अभी कोई बिक्री डेटा नहीं है।' : 'अद्याप कोणताही विक्री डेटा नाही.'}
            </p>
          )}
          {displayedOrders.filter(o => o.status === 'paid').map(o => {
            const extra = (o.salePrice - o.mandiPrice) * o.qty
            const pct   = Math.round(((o.salePrice - o.mandiPrice) / o.mandiPrice) * 100)
            return (
              <div key={o.id} className="top-product-row">
                <div className="top-product-name">🌾 {o.product}</div>
                <div className="top-product-detail">{o.qty} {o.unit} @ ₹{o.salePrice}</div>
                <div className="top-product-extra">+₹{extra.toLocaleString()} <span className="extra-pct">(+{pct}%)</span></div>
              </div>
            )
          })}
        </div>
      )}

      {/* Orders tab */}
      {tab === 'orders' && (
        <div className="orders-table-wrap">
          <table className="orders-table">
            <thead>
              <tr>
                <th>{T.product}</th><th>{T.qty}</th>
                <th>{T.yourPrice}</th><th>{T.mandiRate}</th>
                <th>{T.profit}</th><th>{T.buyer}</th>
                <th>{T.status}</th>
              </tr>
            </thead>
            <tbody>
              {displayedOrders.length === 0 && (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: '3rem', color: 'var(--gray-500)', fontStyle: 'italic' }}>
                    {lang === 'en' ? 'No orders yet.' : lang === 'hi' ? 'अभी तक कोई ऑर्डर नहीं।' : 'अद्याप कोणतीही ऑर्डर नाही.'}
                  </td>
                </tr>
              )}
              {displayedOrders.map(o => {
                const extra = (o.salePrice - o.mandiPrice) * o.qty
                return (
                  <tr key={o.id}>
                    <td className="td-product">🌾 {o.product}</td>
                    <td>{o.qty} {o.unit}</td>
                    <td className="td-price">₹{o.salePrice}</td>
                    <td className="td-mandi">₹{o.mandiPrice}</td>
                    <td className="td-extra">+₹{extra.toLocaleString()}</td>
                    <td className="td-buyer">{o.buyer}</td>
                    <td>
                      <span className={`status-pill pill-${o.status}`}>
                        {o.status === 'paid' ? T.paid : o.status === 'pending' ? T.pending : T.delivered}
                      </span>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Chart tab */}
      {tab === 'chart' && (
        <div className="chart-wrap">
          {monthly.length === 0 && (
            <p style={{ textAlign: 'center', padding: '3rem', color: 'var(--gray-500)', fontStyle: 'italic' }}>
              {lang === 'en' ? 'No paid orders yet — chart will appear after first sale.' : lang === 'hi' ? 'अभी कोई बिक्री नहीं — पहली बिक्री के बाद चार्ट दिखेगा।' : 'अद्याप कोणती विक्री नाही — पहिल्या विक्रीनंतर चार्ट दिसेल.'}
            </p>
          )}
          <div className="bar-chart">
            {monthly.map((m, i) => (
              <div key={i} className="bar-col">
                <div className="bar-pair">
                  <div className="bar-your" style={{ height: `${(m.earning / maxEarning) * 180}px` }}>
                    <span className="bar-tip">₹{(m.earning / 1000).toFixed(0)}K</span>
                  </div>
                  <div className="bar-mandi" style={{ height: `${(m.mandi / maxEarning) * 180}px` }} />
                </div>
                <div className="bar-month">{m.month}</div>
              </div>
            ))}
          </div>
          <div className="chart-legend">
            <span className="legend-yours">■ {lang === 'en' ? 'FarmBridge earnings' : 'FarmBridge कमाई'}</span>
            <span className="legend-mandi">■ {lang === 'en' ? 'Mandi rate earnings' : 'मंडी दर कमाई'}</span>
          </div>
        </div>
      )}
    </div>
  )
}