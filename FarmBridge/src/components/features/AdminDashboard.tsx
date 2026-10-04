import { useState, useEffect } from 'react'
import { supabase } from '../../config/supabaseClient'
import type { AuthUser, Language } from '../../types'
import { getUserActivities, type UserActivity } from '../../services/activityService'

interface Props {
  lang: Language
  user: AuthUser | null
}

interface UserRecord {
  id: string
  name: string
  phone: string
  village: string
  district: string
  state: string
  role: string
  avatar_url: string
  bio: string
  verified: boolean
  created_at: string
}

interface ProductRecord {
  id: string
  name: string
  price: number
  quantity: number
  category: string
  farmer_name: string
  location: string
  posted_at: string
}

interface OrderRecord {
  id: string
  buyer_name: string
  product_name: string
  quantity: number
  total_amount: number
  status: string
  created_at: string
}

type AdminTab = 'overview' | 'users' | 'products' | 'orders' | 'activities'

const GOLD = '#f59e0b'
const GOLD_DIM = 'rgba(245,158,11,0.12)'

export default function AdminDashboard({ user }: Props) {
  const [tab, setTab] = useState<AdminTab>('overview')
  const [users, setUsers] = useState<UserRecord[]>([])
  const [products, setProducts] = useState<ProductRecord[]>([])
  const [orders, setOrders] = useState<OrderRecord[]>([])
  const [activities, setActivities] = useState<UserActivity[]>([])
  const [loading, setLoading] = useState(true)
  const [statusMsg, setStatusMsg] = useState('')
  const [expandedUserId, setExpandedUserId] = useState<string | null>(null)
  const [actSearch, setActSearch] = useState('')
  const [actFilter, setActFilter] = useState<'all' | 'login' | 'list_product' | 'place_order' | 'update_profile'>('all')

  useEffect(() => {
    loadAll()
  }, [])

  async function loadAll() {
    setLoading(true)

    // Supplement with any locally-saved products/orders (created while offline)
    let localProducts: any[] = []
    let localOrders: any[] = []
    try {
      const pData = localStorage.getItem('farmbridge_local_products')
      if (pData) localProducts = JSON.parse(pData)
    } catch { /* ignore */ }
    try {
      const oData = localStorage.getItem('farmbridge_local_orders')
      if (oData) localOrders = JSON.parse(oData)
    } catch { /* ignore */ }

    if (!supabase) {
      setUsers([])
      setProducts([])
      setOrders([])
      setActivities([])
      setLoading(false)
      return
    }

    try {
      const [usersRes, productsRes, ordersRes, activitiesRes] = await Promise.all([
        supabase.from('farmers').select('*').order('created_at', { ascending: false }),
        supabase.from('products').select('*, farmers(name, village, district, state)').order('created_at', { ascending: false }).limit(100),
        supabase.from('orders').select('*, products(name)').order('created_at', { ascending: false }).limit(100),
        supabase.from('user_activities')
          .select('*, farmers(name, phone, role)')
          .order('created_at', { ascending: false })
          .limit(200)
      ])

      if (usersRes.error) throw new Error('Users: ' + usersRes.error.message)
      if (productsRes.error) throw new Error('Products: ' + productsRes.error.message)
      if (ordersRes.error) throw new Error('Orders: ' + ordersRes.error.message)

      const dbUsers = (usersRes.data ?? []) as UserRecord[]

      // If current admin session user is not yet in DB, surface them
      const finalUsers = [...dbUsers]
      if (user && !finalUsers.some(u => u.id === user.id)) {
        finalUsers.unshift({
          id: user.id,
          name: user.name || '',
          phone: user.phone || '',
          village: '', district: '', state: 'Maharashtra',
          role: user.role || 'founder',
          avatar_url: user.role === 'founder' ? '👑' : user.role === 'buyer' ? '🏪' : '👨‍🌾',
          bio: '',
          verified: true,
          created_at: new Date().toISOString()
        })
      }
      setUsers(finalUsers)

      // DB products — primary source of truth
      const dbProductsMapped: ProductRecord[] = (productsRes.data || []).map((p: any) => ({
        id: p.id,
        name: p.name,
        price: Number(p.price),
        quantity: Number(p.quantity),
        category: p.category,
        farmer_name: p.farmers?.name || 'Farmer',
        location: p.location_label || p.state || '—',
        posted_at: p.created_at
      }))

      // Supplement with locally-saved offline products (not yet synced)
      const seenProductIds = new Set<string>(dbProductsMapped.map(p => p.id))
      const mergedProducts = [...dbProductsMapped]
      localProducts.forEach((p: any) => {
        if (!seenProductIds.has(p.id)) {
          mergedProducts.push({
            id: p.id, name: p.name, price: Number(p.price),
            quantity: Number(p.quantity), category: p.category,
            farmer_name: p.farmerName || 'Farmer',
            location: p.location || p.state || '—',
            posted_at: p.postedAt || new Date().toISOString()
          })
        }
      })
      setProducts(mergedProducts)

      // DB orders
      const dbOrdersMapped: OrderRecord[] = (ordersRes.data || []).map((o: any) => {
        const buyer = finalUsers.find(u => u.id === o.buyer_id)
        return {
          id: o.id,
          buyer_name: buyer?.name || 'Buyer',
          product_name: o.products?.name || 'Crop',
          quantity: Number(o.quantity),
          total_amount: Number(o.total_amount),
          status: o.status,
          created_at: o.created_at
        }
      })

      // Supplement with offline-created orders
      const seenOrderIds = new Set<string>(dbOrdersMapped.map(o => o.id))
      const mergedOrders = [...dbOrdersMapped]
      localOrders.forEach((o: any) => {
        if (!seenOrderIds.has(o.id)) {
          const buyer = finalUsers.find(u => u.id === o.buyer_id)
          const product = mergedProducts.find(p => p.id === o.product_id)
          mergedOrders.push({
            id: o.id,
            buyer_name: buyer?.name || 'Buyer',
            product_name: product?.name || 'Crop',
            quantity: Number(o.quantity),
            total_amount: Number(o.total_amount),
            status: o.status,
            created_at: o.created_at
          })
        }
      })
      setOrders(mergedOrders)

      // Activities from DB
      if (activitiesRes && !activitiesRes.error && activitiesRes.data) {
        const mapped = (activitiesRes.data as any[]).map((row: any) => ({
          id: row.id,
          user_id: row.user_id,
          user_name: row.farmers?.name || 'User',
          user_phone: row.farmers?.phone || '',
          activity_type: row.activity_type,
          description: row.description,
          metadata: row.metadata,
          created_at: row.created_at
        }))
        setActivities(mapped)
      }
    } catch (err) {
      console.error('Error in AdminDashboard loadAll:', err)
      // On DB error — show offline-only data
      const localProductsMapped: ProductRecord[] = localProducts.map((p: any) => ({
        id: p.id, name: p.name, price: Number(p.price), quantity: Number(p.quantity),
        category: p.category, farmer_name: p.farmerName || 'Farmer',
        location: p.location || p.state || '—', posted_at: p.postedAt || new Date().toISOString()
      }))
      setProducts(localProductsMapped)
      setUsers([])
      setOrders([])
      const localActs = await getUserActivities()
      setActivities(localActs)
    } finally {
      setLoading(false)
    }
  }

  async function deleteUser(id: string, name: string) {
    if (!confirm(`Delete user "${name}"? This cannot be undone.`)) return
    if (!supabase) {
      setUsers(prev => prev.filter(u => u.id !== id))
      showStatus(`✅ User "${name}" deleted (demo mode).`)
      return
    }
    const { error } = await supabase.from('farmers').delete().eq('id', id)
    if (error) { showStatus(`❌ Error: ${error.message}`); return }
    setUsers(prev => prev.filter(u => u.id !== id))
    showStatus(`✅ User "${name}" deleted.`)
  }

  async function deleteProduct(id: string, name: string) {
    if (!confirm(`Delete product "${name}"?`)) return

    // Handle locally-stored offline products
    if (!supabase || id.startsWith('local-')) {
      try {
        const data = localStorage.getItem('farmbridge_local_products')
        if (data) {
          const list = JSON.parse(data)
          const updated = list.filter((p: any) => p.id !== id)
          localStorage.setItem('farmbridge_local_products', JSON.stringify(updated))
        }
      } catch (e) {
        console.error('Error removing local product', e)
      }
      setProducts(prev => prev.filter(p => p.id !== id))
      showStatus(`✅ Product "${name}" removed.`)
      return
    }

    const { error } = await supabase.from('products').delete().eq('id', id)
    if (error) { showStatus(`❌ Error: ${error.message}`); return }
    setProducts(prev => prev.filter(p => p.id !== id))
    showStatus(`✅ Product "${name}" removed.`)
  }

  function showStatus(msg: string) {
    setStatusMsg(msg)
    setTimeout(() => setStatusMsg(''), 3000)
  }

  const farmers = users.filter(u => u.role === 'farmer')
  const buyers = users.filter(u => u.role === 'buyer')

  const stats = [
    { label: 'Total Users', value: users.length, icon: '👥', color: '#3b82f6' },
    { label: 'Farmers', value: farmers.length, icon: '👨‍🌾', color: '#22c55e' },
    { label: 'Buyers', value: buyers.length, icon: '🏪', color: '#8b5cf6' },
    { label: 'Products Listed', value: products.length, icon: '🌾', color: '#f97316' },
    { label: 'Orders', value: orders.length, icon: '📦', color: '#06b6d4' },
  ]

  const tabs: { id: AdminTab; label: string; icon: string }[] = [
    { id: 'overview', label: 'Overview', icon: '📊' },
    { id: 'users', label: `Users (${users.length})`, icon: '👥' },
    { id: 'products', label: `Products (${products.length})`, icon: '🌾' },
    { id: 'orders', label: `Orders (${orders.length})`, icon: '📦' },
    { id: 'activities', label: `Activities (${activities.length})`, icon: '⚡' },
  ]

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0a0800 0%, #111008 50%, #0d0c05 100%)',
      padding: '0',
      fontFamily: "'Inter', sans-serif"
    }}>
      {/* Header */}
      <div style={{
        background: 'linear-gradient(135deg, #1a1207, #2d2005)',
        borderBottom: `2px solid ${GOLD}`,
        padding: '24px 32px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        boxShadow: `0 4px 30px rgba(245,158,11,0.15)`
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{
            width: '56px', height: '56px',
            background: 'linear-gradient(135deg, #f59e0b, #d97706)',
            borderRadius: '14px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '28px',
            boxShadow: '0 4px 16px rgba(245,158,11,0.4)'
          }}>👑</div>
          <div>
            <h1 style={{ margin: 0, color: GOLD, fontSize: '24px', fontWeight: 800, letterSpacing: '-0.02em' }}>
              FarmBridge Admin Panel
            </h1>
            <p style={{ margin: '4px 0 0', color: 'rgba(245,158,11,0.6)', fontSize: '13px' }}>
            Founder Dashboard · {user?.name || 'Founder'} · +91 {user?.phone?.replace('+91', '') || ''}            </p>
          </div>
        </div>
        <button
          onClick={loadAll}
          style={{
            background: GOLD_DIM,
            border: `1px solid ${GOLD}`,
            color: GOLD,
            borderRadius: '10px',
            padding: '10px 20px',
            cursor: 'pointer',
            fontWeight: 600,
            fontSize: '14px',
            transition: 'all 0.2s'
          }}
        >
          🔄 Refresh
        </button>
      </div>

      {/* Status toast */}
      {statusMsg && (
        <div style={{
          position: 'fixed', top: '80px', left: '50%', transform: 'translateX(-50%)',
          background: '#1a1207', border: `1px solid ${GOLD}`, color: GOLD,
          borderRadius: '10px', padding: '12px 24px', zIndex: 9999,
          fontWeight: 600, boxShadow: '0 8px 30px rgba(0,0,0,0.5)'
        }}>
          {statusMsg}
        </div>
      )}

      {/* Stats */}
      <div style={{ padding: '24px 32px 0', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '16px' }}>
        {stats.map(s => (
          <div key={s.label} style={{
            background: 'linear-gradient(145deg, #1a1207, #221a08)',
            border: '1px solid rgba(245,158,11,0.2)',
            borderRadius: '14px',
            padding: '20px',
            textAlign: 'center',
            boxShadow: '0 4px 20px rgba(0,0,0,0.3)'
          }}>
            <div style={{ fontSize: '28px', marginBottom: '8px' }}>{s.icon}</div>
            <div style={{ color: s.color, fontSize: '28px', fontWeight: 800 }}>{loading ? '…' : s.value}</div>
            <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '12px', marginTop: '4px' }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div style={{ padding: '20px 32px 0', display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
        {tabs.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)} style={{
            background: tab === t.id ? 'linear-gradient(135deg, #f59e0b, #d97706)' : GOLD_DIM,
            border: `1px solid ${tab === t.id ? '#f59e0b' : 'rgba(245,158,11,0.3)'}`,
            color: tab === t.id ? '#1a0a00' : GOLD,
            borderRadius: '10px',
            padding: '10px 20px',
            cursor: 'pointer',
            fontWeight: tab === t.id ? 800 : 600,
            fontSize: '14px',
            transition: 'all 0.2s'
          }}>
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div style={{ padding: '20px 32px 40px' }}>

        {/* ─── OVERVIEW ─── */}
        {tab === 'overview' && (
          <div>
            <h2 style={{ color: GOLD, marginBottom: '16px' }}>📊 Platform Overview</h2>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
              {/* Farmers list */}
              <div style={{ background: '#1a1207', border: '1px solid rgba(245,158,11,0.2)', borderRadius: '14px', padding: '20px' }}>
                <h3 style={{ color: '#22c55e', margin: '0 0 12px' }}>👨‍🌾 Registered Farmers ({farmers.length})</h3>
                {loading ? <p style={{ color: '#888' }}>Loading…</p> : farmers.length === 0 ? (
                  <p style={{ color: '#555' }}>No farmers registered yet.</p>
                ) : farmers.slice(0, 5).map(f => (
                  <div key={f.id} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '8px 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                    <span style={{ fontSize: '22px' }}>{f.avatar_url || '👨‍🌾'}</span>
                    <div>
                      <div style={{ color: '#fff', fontWeight: 600, fontSize: '14px' }}>{f.name || 'Unnamed'}</div>
                      <div style={{ color: '#888', fontSize: '12px' }}>{f.village}, {f.district}, {f.state}</div>
                    </div>
                  </div>
                ))}
                {farmers.length > 5 && <p style={{ color: GOLD, fontSize: '13px', marginTop: '8px', cursor: 'pointer' }} onClick={() => setTab('users')}>View all {farmers.length} farmers →</p>}
              </div>
              {/* Buyers list */}
              <div style={{ background: '#1a1207', border: '1px solid rgba(245,158,11,0.2)', borderRadius: '14px', padding: '20px' }}>
                <h3 style={{ color: '#8b5cf6', margin: '0 0 12px' }}>🏪 Registered Buyers ({buyers.length})</h3>
                {loading ? <p style={{ color: '#888' }}>Loading…</p> : buyers.length === 0 ? (
                  <p style={{ color: '#555' }}>No buyers registered yet.</p>
                ) : buyers.slice(0, 5).map(b => (
                  <div key={b.id} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '8px 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                    <span style={{ fontSize: '22px' }}>{b.avatar_url || '🏪'}</span>
                    <div>
                      <div style={{ color: '#fff', fontWeight: 600, fontSize: '14px' }}>{b.name || 'Unnamed'}</div>
                      <div style={{ color: '#888', fontSize: '12px' }}>{b.village}, {b.district}, {b.state}</div>
                    </div>
                  </div>
                ))}
                {buyers.length > 5 && <p style={{ color: GOLD, fontSize: '13px', marginTop: '8px', cursor: 'pointer' }} onClick={() => setTab('users')}>View all {buyers.length} buyers →</p>}
              </div>
            </div>

            {/* Recent Platform Activities */}
            <div style={{
              marginTop: '24px',
              background: '#1a1207',
              border: '1px solid rgba(245,158,11,0.2)',
              borderRadius: '14px',
              padding: '20px'
            }}>
              <h3 style={{ color: GOLD, margin: '0 0 16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span>⚡</span> Recent Platform Activities
              </h3>
              {loading ? <p style={{ color: '#888' }}>Loading activities…</p> : activities.length === 0 ? (
                <p style={{ color: '#555' }}>No activities recorded yet.</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {activities.slice(0, 8).map(act => {
                    const dateStr = new Date(act.created_at).toLocaleString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit', day: 'numeric', month: 'short' })
                    
                    let badgeColor = '#9ca3af'
                    let badgeText: string = act.activity_type
                    let badgeBg = 'rgba(156,163,175,0.1)'
                    
                    if (act.activity_type === 'login') {
                      badgeColor = '#60a5fa'
                      badgeBg = 'rgba(96,165,250,0.12)'
                      badgeText = '🔑 LOGIN'
                    } else if (act.activity_type === 'list_product') {
                      badgeColor = '#fb923c'
                      badgeBg = 'rgba(251,146,60,0.12)'
                      badgeText = '🌾 LISTING'
                    } else if (act.activity_type === 'place_order') {
                      badgeColor = '#34d399'
                      badgeBg = 'rgba(52,211,153,0.12)'
                      badgeText = '📦 ORDER'
                    } else if (act.activity_type === 'update_profile') {
                      badgeColor = '#a78bfa'
                      badgeBg = 'rgba(167,139,250,0.12)'
                      badgeText = '👤 PROFILE'
                    }
                    
                    return (
                      <div key={act.id} style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '10px 14px',
                        background: 'rgba(255,255,255,0.02)',
                        border: '1px solid rgba(255,255,255,0.05)',
                        borderRadius: '8px',
                        flexWrap: 'wrap',
                        gap: '8px'
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1, minWidth: '200px' }}>
                          <span style={{
                            fontSize: '10px',
                            fontWeight: 700,
                            padding: '2px 8px',
                            borderRadius: '6px',
                            color: badgeColor,
                            background: badgeBg,
                            textTransform: 'uppercase',
                            display: 'inline-block',
                            marginRight: '6px',
                            width: '75px',
                            textAlign: 'center',
                            flexShrink: 0
                          }}>{badgeText}</span>
                          <div>
                            <strong style={{ color: '#fff', fontSize: '13px' }}>{act.user_name}</strong>
                            <span style={{ color: '#888', fontSize: '12px', marginLeft: '6px' }}>({act.user_phone})</span>
                            <p style={{ color: '#ccc', margin: '4px 0 0', fontSize: '13px' }}>{act.description}</p>
                          </div>
                        </div>
                        <span style={{ color: 'rgba(245,158,11,0.6)', fontSize: '11px', fontWeight: 600 }}>{dateStr}</span>
                      </div>
                    )
                  })}
                  {activities.length > 8 && (
                    <p style={{ color: GOLD, fontSize: '13px', marginTop: '8px', cursor: 'pointer', textAlign: 'center' }} onClick={() => setTab('activities')}>
                      View all {activities.length} activities →
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ─── USERS ─── */}
        {tab === 'users' && (
          <div>
            <h2 style={{ color: GOLD, marginBottom: '16px' }}>👥 All Registered Users</h2>
            {loading ? <p style={{ color: '#888' }}>Loading users…</p> : users.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '60px 0', color: '#555' }}>
                <div style={{ fontSize: '48px', marginBottom: '12px' }}>📭</div>
                <p>No users registered yet.</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {users.map(u => {
                  const userActivities = activities.filter(act => act.user_id === u.id || (act.user_phone === u.phone && u.phone))
                  const lastActiveAct = userActivities[0]
                  const lastActiveStr = lastActiveAct
                    ? new Date(lastActiveAct.created_at).toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })
                    : 'No recorded activity'

                  return (
                    <div key={u.id} style={{
                      display: 'flex',
                      flexDirection: 'column',
                      background: 'linear-gradient(145deg, #1a1207, #221a08)',
                      border: `1px solid ${u.role === 'founder' ? GOLD : 'rgba(245,158,11,0.15)'}`,
                      borderRadius: '12px',
                      padding: '16px 20px',
                      gap: '12px',
                      boxShadow: u.role === 'founder' ? `0 0 20px rgba(245,158,11,0.2)` : 'none'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
                        <div style={{ fontSize: '36px', minWidth: '44px', textAlign: 'center' }}>{u.avatar_url || '👤'}</div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                            <span style={{ color: '#fff', fontWeight: 700, fontSize: '15px' }}>{u.name || 'Unnamed User'}</span>
                            <span style={{
                              background: u.role === 'founder' ? 'linear-gradient(135deg, #f59e0b, #d97706)' : u.role === 'buyer' ? '#581c87' : '#14532d',
                              color: u.role === 'founder' ? '#1a0a00' : '#fff',
                              borderRadius: '20px', padding: '2px 10px', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase'
                            }}>
                              {u.role === 'founder' ? '👑 Founder' : u.role === 'buyer' ? '🏪 Buyer' : '👨‍🌾 Farmer'}
                            </span>
                          </div>
                          <div style={{ color: '#aaa', fontSize: '13px', marginTop: '4px' }}>
                            📞 {u.phone} &nbsp;|&nbsp; 📍 {[u.village, u.district, u.state].filter(Boolean).join(', ') || 'Location not set'}
                          </div>
                          {u.bio && <div style={{ color: '#666', fontSize: '12px', marginTop: '4px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{u.bio}</div>}
                          <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', marginTop: '4px', fontSize: '11px', color: '#666' }}>
                            <span>Joined: {u.created_at ? new Date(u.created_at).toLocaleDateString('en-IN') : 'Unknown'}</span>
                            <span style={{ color: lastActiveAct ? '#4ade80' : '#666', fontWeight: lastActiveAct ? 600 : 400 }}>
                              🟢 Last Active: {lastActiveStr} {lastActiveAct && `(${lastActiveAct.activity_type.replace('_', ' ')})`}
                            </span>
                          </div>
                        </div>
                        <div style={{ display: 'flex', gap: '8px', flexShrink: 0 }}>
                          {u.role !== 'founder' && (
                            <button
                              onClick={() => deleteUser(u.id, u.name)}
                              style={{
                                background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.4)',
                                color: '#f87171', borderRadius: '8px', padding: '8px 14px',
                                cursor: 'pointer', fontSize: '12px', fontWeight: 600, whiteSpace: 'nowrap',
                                flexShrink: 0
                              }}
                            >
                              🗑 Remove
                            </button>
                          )}
                          <button
                            onClick={() => setExpandedUserId(expandedUserId === u.id ? null : u.id)}
                            style={{
                              background: expandedUserId === u.id ? GOLD : GOLD_DIM,
                              border: `1px solid ${GOLD}`,
                              color: expandedUserId === u.id ? '#1a0a00' : GOLD,
                              borderRadius: '8px', padding: '8px 14px',
                              cursor: 'pointer', fontSize: '12px', fontWeight: 600, whiteSpace: 'nowrap'
                            }}
                          >
                            {expandedUserId === u.id ? '▲ Hide Logs' : `👁 Logs (${userActivities.length})`}
                          </button>
                        </div>
                      </div>

                      {expandedUserId === u.id && (
                        <div style={{
                          marginTop: '8px',
                          padding: '12px',
                          background: 'rgba(0,0,0,0.3)',
                          borderRadius: '8px',
                          border: '1px solid rgba(245,158,11,0.15)',
                          maxHeight: '200px',
                          overflowY: 'auto',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '8px'
                        }}>
                          <div style={{ fontSize: '12px', fontWeight: 800, color: GOLD, borderBottom: '1px solid rgba(245,158,11,0.2)', paddingBottom: '4px', marginBottom: '4px' }}>
                            User Activity History ({userActivities.length} events)
                          </div>
                          {userActivities.length === 0 ? (
                            <div style={{ color: '#555', fontSize: '12px', padding: '8px 0' }}>No activities recorded.</div>
                          ) : (
                            userActivities.map(act => (
                              <div key={act.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', fontSize: '12px', padding: '4px 0', borderBottom: '1px solid rgba(255,255,255,0.02)' }}>
                                <div>
                                  <span style={{
                                    color: act.activity_type === 'login' ? '#60a5fa' : act.activity_type === 'place_order' ? '#34d399' : act.activity_type === 'list_product' ? '#fb923c' : '#a78bfa',
                                    fontWeight: 700,
                                    marginRight: '6px'
                                  }}>[{act.activity_type.toUpperCase()}]</span>
                                  <span style={{ color: '#ddd' }}>{act.description}</span>
                                </div>
                                <span style={{ color: '#666', fontSize: '11px', flexShrink: 0, marginLeft: '10px' }}>
                                  {new Date(act.created_at).toLocaleString('en-IN', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                </span>
                              </div>
                            ))
                          )}
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )}

        {/* ─── PRODUCTS ─── */}
        {tab === 'products' && (
          <div>
            <h2 style={{ color: GOLD, marginBottom: '16px' }}>🌾 All Product Listings</h2>
            {loading ? <p style={{ color: '#888' }}>Loading products…</p> : products.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '60px 0', color: '#555' }}>
                <div style={{ fontSize: '48px', marginBottom: '12px' }}>📦</div>
                <p>No products listed yet.</p>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '14px' }}>
                {products.map(p => (
                  <div key={p.id} style={{
                    background: '#1a1207', border: '1px solid rgba(245,158,11,0.15)',
                    borderRadius: '12px', padding: '16px'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div>
                        <div style={{ color: '#fff', fontWeight: 700 }}>{p.name}</div>
                        <div style={{ color: '#888', fontSize: '12px', marginTop: '4px' }}>{p.farmer_name} · {p.location}</div>
                        <div style={{ color: GOLD, fontWeight: 700, marginTop: '8px' }}>₹{p.price} <span style={{ color: '#888', fontWeight: 400, fontSize: '12px' }}>· {p.quantity}kg</span></div>
                        <div style={{ color: '#555', fontSize: '11px', marginTop: '4px' }}>{p.category} · {p.posted_at ? new Date(p.posted_at).toLocaleDateString('en-IN') : ''}</div>
                      </div>
                      <button onClick={() => deleteProduct(p.id, p.name)} style={{
                        background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)',
                        color: '#f87171', borderRadius: '6px', padding: '6px 10px',
                        cursor: 'pointer', fontSize: '12px', flexShrink: 0
                      }}>🗑</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ─── ORDERS ─── */}
        {tab === 'orders' && (
          <div>
            <h2 style={{ color: GOLD, marginBottom: '16px' }}>📦 All Orders</h2>
            {loading ? <p style={{ color: '#888' }}>Loading orders…</p> : orders.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '60px 0', color: '#555' }}>
                <div style={{ fontSize: '48px', marginBottom: '12px' }}>📋</div>
                <p>No orders placed yet.</p>
              </div>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ borderBottom: `2px solid ${GOLD}` }}>
                      {['Buyer', 'Product', 'Qty', 'Amount', 'Status', 'Date'].map(h => (
                        <th key={h} style={{ color: GOLD, textAlign: 'left', padding: '12px 16px', fontWeight: 700, fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {orders.map((o, i) => (
                      <tr key={o.id} style={{ background: i % 2 === 0 ? '#1a1207' : '#111008', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                        <td style={{ padding: '12px 16px', color: '#fff', fontSize: '14px' }}>{o.buyer_name || '—'}</td>
                        <td style={{ padding: '12px 16px', color: '#ddd', fontSize: '14px' }}>{o.product_name || '—'}</td>
                        <td style={{ padding: '12px 16px', color: '#aaa', fontSize: '14px' }}>{o.quantity}</td>
                        <td style={{ padding: '12px 16px', color: GOLD, fontWeight: 700, fontSize: '14px' }}>₹{o.total_amount}</td>
                        <td style={{ padding: '12px 16px' }}>
                          <span style={{
                            background: o.status === 'delivered' ? '#14532d' : o.status === 'pending' ? '#78350f' : '#1e3a5f',
                            color: o.status === 'delivered' ? '#86efac' : o.status === 'pending' ? '#fde68a' : '#93c5fd',
                            borderRadius: '20px', padding: '3px 10px', fontSize: '12px', fontWeight: 600
                          }}>{o.status || 'pending'}</span>
                        </td>
                        <td style={{ padding: '12px 16px', color: '#666', fontSize: '12px' }}>{o.created_at ? new Date(o.created_at).toLocaleDateString('en-IN') : '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* ─── User Activities Timeline ─── */}
        {tab === 'activities' && (
          <div>
            <h2 style={{ color: GOLD, marginBottom: '16px' }}>⚡ User Logins & Platform Activities</h2>
            
            {/* Search and Filters */}
            <div style={{
              display: 'flex',
              gap: '12px',
              marginBottom: '20px',
              flexWrap: 'wrap',
              background: '#1a1207',
              border: '1px solid rgba(245,158,11,0.15)',
              borderRadius: '12px',
              padding: '16px'
            }}>
              <div style={{ flex: 1, minWidth: '240px' }}>
                <input
                  type="text"
                  placeholder="Search by user name, phone, or details..."
                  value={actSearch}
                  onChange={e => setActSearch(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    borderRadius: '8px',
                    border: '1px solid rgba(245,158,11,0.3)',
                    background: 'rgba(0,0,0,0.3)',
                    color: '#fff',
                    fontSize: '13px',
                    outline: 'none',
                    boxSizing: 'border-box'
                  }}
                />
              </div>
              <div style={{ width: '180px' }}>
                <select
                  value={actFilter}
                  onChange={e => setActFilter(e.target.value as any)}
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    borderRadius: '8px',
                    border: '1px solid rgba(245,158,11,0.3)',
                    background: '#1a1207',
                    color: GOLD,
                    fontSize: '13px',
                    fontWeight: 600,
                    outline: 'none',
                    cursor: 'pointer',
                    boxSizing: 'border-box'
                  }}
                >
                  <option value="all">All Activities</option>
                  <option value="login">🔑 Logins</option>
                  <option value="list_product">🌾 Crop Listings</option>
                  <option value="place_order">📦 Orders Placed</option>
                  <option value="update_profile">👤 Profile Updates</option>
                </select>
              </div>
            </div>

            {loading ? <p style={{ color: '#888' }}>Loading activities logs…</p> : (
              (() => {
                const filteredActivities = activities.filter(act => {
                  const matchesSearch = 
                    act.user_name.toLowerCase().includes(actSearch.toLowerCase()) ||
                    act.user_phone.includes(actSearch) ||
                    act.description.toLowerCase().includes(actSearch.toLowerCase())
                  const matchesFilter = actFilter === 'all' || act.activity_type === actFilter
                  return matchesSearch && matchesFilter
                })

                if (filteredActivities.length === 0) {
                  return (
                    <div style={{ textAlign: 'center', padding: '60px 0', color: '#555' }}>
                      <div style={{ fontSize: '48px', marginBottom: '12px' }}>📭</div>
                      <p>No matching activities found.</p>
                    </div>
                  )
                }

                return (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {filteredActivities.map(act => {
                      const dateStr = new Date(act.created_at).toLocaleString('en-IN', {
                        hour: '2-digit', minute: '2-digit', second: '2-digit',
                        day: 'numeric', month: 'short', year: 'numeric'
                      })
                      
                      let badgeColor = '#9ca3af'
                      let badgeText: string = act.activity_type
                      let badgeBg = 'rgba(156,163,175,0.1)'
                      
                      if (act.activity_type === 'login') {
                        badgeColor = '#60a5fa'
                        badgeBg = 'rgba(96,165,250,0.12)'
                        badgeText = '🔑 LOGIN'
                      } else if (act.activity_type === 'list_product') {
                        badgeColor = '#fb923c'
                        badgeBg = 'rgba(251,146,60,0.12)'
                        badgeText = '🌾 LISTING'
                      } else if (act.activity_type === 'place_order') {
                        badgeColor = '#34d399'
                        badgeBg = 'rgba(52,211,153,0.12)'
                        badgeText = '📦 ORDER'
                      } else if (act.activity_type === 'update_profile') {
                        badgeColor = '#a78bfa'
                        badgeBg = 'rgba(167,139,250,0.12)'
                        badgeText = '👤 PROFILE'
                      }

                      return (
                        <div key={act.id} style={{
                          background: 'linear-gradient(145deg, #1a1207, #221a08)',
                          border: '1px solid rgba(245,158,11,0.15)',
                          borderRadius: '10px',
                          padding: '12px 18px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          gap: '16px',
                          flexWrap: 'wrap'
                        }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1, minWidth: '240px' }}>
                            <span style={{
                              fontSize: '10px',
                              fontWeight: 700,
                              padding: '4px 10px',
                              borderRadius: '6px',
                              color: badgeColor,
                              background: badgeBg,
                              textTransform: 'uppercase',
                              width: '90px',
                              textAlign: 'center',
                              flexShrink: 0
                            }}>{badgeText}</span>
                            <div>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                                <span style={{ color: '#fff', fontWeight: 700, fontSize: '14px' }}>{act.user_name}</span>
                                <span style={{ color: '#888', fontSize: '12px' }}>📞 {act.user_phone}</span>
                              </div>
                              <p style={{ color: '#ddd', margin: '4px 0 0', fontSize: '13px' }}>{act.description}</p>
                              {act.metadata && Object.keys(act.metadata).length > 0 && (
                                <pre style={{
                                  margin: '6px 0 0',
                                  padding: '6px 10px',
                                  background: 'rgba(0,0,0,0.2)',
                                  borderRadius: '6px',
                                  fontSize: '11px',
                                  color: '#888',
                                  fontFamily: 'monospace',
                                  overflowX: 'auto',
                                  maxWidth: '100%',
                                  border: '1px solid rgba(255,255,255,0.05)'
                                }}>
                                  {JSON.stringify(act.metadata, null, 2)}
                                </pre>
                              )}
                            </div>
                          </div>
                          <div style={{ textAlign: 'right', flexShrink: 0, marginLeft: 'auto' }}>
                            <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: '11px' }}>{dateStr}</span>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )
              })()
            )}
          </div>
        )}
      </div>
    </div>
  )
}
