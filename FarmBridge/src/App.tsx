import { useState, useEffect } from 'react'
import type { Language, CartItem, Product, AuthUser } from './types'
import { getCurrentUser, signOut } from './services/authService'
import { logUserActivity } from './services/activityService'

import Navbar              from './components/Navbar'
import HeroSection         from './components/HeroSection'
import MarketplacePage     from './components/MarketplacePage'
import SellPage            from './components/SellPage'
import CartPage            from './components/CartPage'
import Footer              from './components/Footer'
import RoleSelection       from './components/RoleSelection'
import OtpLoginModal       from './components/auth/OtpLoginModal'
import BulkBuyersPage      from './components/features/BulkBuyersPage'
import FarmerDashboard     from './components/features/FarmerDashboard'
import DirectBuyerRequests from './components/features/DirectBuyerRequest'
import LogisticSupport     from './components/features/LogisticSupport'
import DemandPrediction    from './components/features/DemandPrediction'
import FarmerProfile       from './components/features/FarmerProfile'
import WhatsAppAutomation  from './components/features/WhatsAppAutomation'
import B2BMode             from './components/features/B2BMode'
import AdminDashboard      from './components/features/AdminDashboard'
import FarmerInfoPanel     from './components/features/FarmerInfoPanel'
import MandiComparison     from './components/features/MandiComparison'
import BestBuyerSuggestion from './components/features/BestBuyerSuggestion'
import { supabase }         from './config/supabaseClient'
import './App.css'

export default function App() {
  const [lang,         setLang]         = useState<Language>('en')
  const [page,         setPage]         = useState('home')
  const [cart,         setCart]         = useState<CartItem[]>([])
  const [toast,        setToast]        = useState<string | null>(null)
  const [user,         setUser]         = useState<AuthUser | null>(null)
  const [guestRole,    setGuestRole]    = useState<'farmer' | 'buyer' | null>(null)
  const [showLogin,    setShowLogin]    = useState(false)
  const [isOnline,     setIsOnline]     = useState(navigator.onLine)
  const [demoBar,      setDemoBar]      = useState(false)
  const [pageKey,      setPageKey]      = useState(0) // triggers fade-in

  // Restore session
  useEffect(() => { getCurrentUser().then(u => { if (u) setUser(u) }) }, [])

  // Check database/network for offline mode
  useEffect(() => {
    const isDismissed = sessionStorage.getItem('dismissDemoBar') === 'true'
    if (isDismissed) return

    if (!navigator.onLine) {
      setDemoBar(true)
      return
    }
    if (!supabase) {
      setDemoBar(true)
      return
    }

    ;(async () => {
      try {
        const { error } = await supabase.from('farmers').select('id').limit(1)
        if (error) setDemoBar(true)
      } catch {
        setDemoBar(true)
      }
    })()
  }, [])

  // Online / offline listener
  useEffect(() => {
    const online  = () => {
      setIsOnline(true)
      const isDismissed = sessionStorage.getItem('dismissDemoBar') === 'true'
      if (!isDismissed) {
        if (supabase) {
          ;(async () => {
            try {
              const { error } = await supabase.from('farmers').select('id').limit(1)
              if (error) setDemoBar(true)
            } catch {
              setDemoBar(true)
            }
          })()
        } else {
          setDemoBar(true)
        }
      }
    }
    const offline = () => {
      setIsOnline(false)
      const isDismissed = sessionStorage.getItem('dismissDemoBar') === 'true'
      if (!isDismissed) setDemoBar(true)
    }
    window.addEventListener('online',  online)
    window.addEventListener('offline', offline)
    return () => { window.removeEventListener('online', online); window.removeEventListener('offline', offline) }
  }, [])

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(null), 3500) }

  const addToCart = (product: Product) => {
    setCart(prev => {
      const found = prev.find(i => i.product.id === product.id)
      if (found) return prev.map(i => i.product.id === product.id ? { ...i, qty: i.qty + 1 } : i)
      return [...prev, { product, qty: 1 }]
    })
    showToast(`✅ ${product.name} added to cart!`)
  }

  const updateQty  = (id: string, qty: number) => { if (qty < 1) return; setCart(prev => prev.map(i => i.product.id === id ? { ...i, qty } : i)) }
  const removeItem = (id: string) => setCart(prev => prev.filter(i => i.product.id !== id))

  const handleLogout = async () => {
    await signOut()
    setUser(null)
    setGuestRole(null)
    navigate('home')
    showToast('👋 Logged out successfully')
  }

  const handleLoginSuccess = (u: AuthUser) => {
    setUser(u)
    logUserActivity(u, 'login', `User logged in successfully (Role: ${u.role || 'farmer'})`)
    if (u.role === 'founder') {
      navigate('admin')
      showToast('👑 Welcome back, Founder! Admin panel is ready.')
    } else {
      showToast(`🎉 Welcome to FarmBridge${u.name ? `, ${u.name.split(' ')[0]}` : ''}!`)
    }
  }

  const navigate = (p: string) => {
    if (p === 'admin' && user?.role !== 'founder') return
    const protected_ = ['sell', 'dashboard', 'requests', 'profile', 'whatsapp']
    if (protected_.includes(p) && !user) { setShowLogin(true); return }
    window.scrollTo({ top: 0, behavior: 'smooth' })
    setPage(p)
    setPageKey(k => k + 1) // triggers fade-in on new page
  }

  const isFounder    = user?.role === 'founder'
  const showingAdmin = isFounder && page === 'admin'
  const cartCount    = cart.reduce((s, i) => s + i.qty, 0)

  return (
    <div className="app">
      {/* ── Demo / Offline banner ── */}
      {demoBar && (
        <div className="demo-bar">
          <span>⚠ Offline Mode — using demo data &nbsp;|&nbsp; OTP: <strong>123456</strong></span>
          <button className="demo-bar-close" onClick={() => {
            setDemoBar(false)
            sessionStorage.setItem('dismissDemoBar', 'true')
          }}>✕</button>
        </div>
      )}

      <Navbar
        lang={lang} setLang={setLang} cart={cart} currentPage={page}
        setPage={navigate} user={user} guestRole={guestRole}
        onLoginClick={() => setShowLogin(true)} onLogout={handleLogout}
      />

      <main className="main">
        {showingAdmin && <AdminDashboard lang={lang} user={user} />}
        {!showingAdmin && (
          <div key={pageKey} className="page-fade">
            {page === 'home' && !user && !guestRole && <RoleSelection lang={lang} onSelectRole={setGuestRole} onLoginClick={() => setShowLogin(true)} />}
            {page === 'home' && (user || guestRole) && <HeroSection lang={lang} role={user && user.role !== 'founder' ? (user.role as 'farmer' | 'buyer') : (guestRole || 'farmer')} setPage={navigate} />}
            {page === 'marketplace' && <MarketplacePage     lang={lang} onAddToCart={addToCart} user={user} guestRole={guestRole} />}
            {page === 'sell'        && <SellPage            lang={lang} user={user} />}
            {page === 'cart'        && <CartPage            lang={lang} cart={cart} onUpdateQty={updateQty} onRemove={removeItem} setPage={navigate} user={user} onLoginClick={() => setShowLogin(true)} />}
            {page === 'buyers'      && <BulkBuyersPage      lang={lang} />}
            {page === 'dashboard'   && <FarmerDashboard     lang={lang} user={user} />}
            {page === 'requests'    && <DirectBuyerRequests lang={lang} />}
            {page === 'logistics'   && <LogisticSupport     lang={lang} />}
            {page === 'demand'      && <DemandPrediction    lang={lang} />}
            {page === 'profile'     && <FarmerProfile       lang={lang} onAddToCart={addToCart} user={user} />}
            {page === 'whatsapp'    && <WhatsAppAutomation  lang={lang} />}
            {page === 'b2b'         && <B2BMode             lang={lang} />}
            {page === 'farmerinfo'  && <FarmerInfoPanel      lang={lang} onAddToCart={addToCart} />}
            {page === 'mandi'       && <MandiComparison      lang={lang} />}
            {page === 'bestbuyer'   && <BestBuyerSuggestion  lang={lang} />}
          </div>
        )}
      </main>

      {!showingAdmin && <Footer lang={lang} setPage={navigate} />}

      <OtpLoginModal isOpen={showLogin} onClose={() => setShowLogin(false)} onSuccess={handleLoginSuccess} lang={lang} />

      {/* Toast */}
      {toast && (
        <div
          className="toast"
          style={toast.startsWith('👑')
            ? { background: 'linear-gradient(135deg, #f59e0b, #d97706)', color: '#1a0a00', fontWeight: 800 }
            : toast.startsWith('✅')
            ? { background: 'linear-gradient(135deg, #16a34a, #22c55e)' }
            : {}
          }
        >
          {toast}
        </div>
      )}

      {/* Offline indicator dot */}
      {!isOnline && (
        <div style={{ position: 'fixed', bottom: '16px', right: '16px', background: '#374151', color: '#fff', fontSize: '11px', fontWeight: 700, padding: '6px 12px', borderRadius: '20px', zIndex: 999, display: 'flex', alignItems: 'center', gap: '6px', boxShadow: '0 4px 12px rgba(0,0,0,0.25)' }}>
          <span style={{ width: '7px', height: '7px', background: '#ef4444', borderRadius: '50%', animation: 'pulse 1.5s ease-in-out infinite', flexShrink: 0 }} />
          No internet
        </div>
      )}
    </div>
  )
}