import { useState, useEffect } from 'react'
import type { Language, CartItem, AuthUser } from '../types'
import { translations } from '../data/translations'

interface Props {
  lang: Language; setLang: (l: Language) => void
  cart: CartItem[]; currentPage: string; setPage: (p: string) => void
  user: AuthUser | null; guestRole: 'farmer' | 'buyer' | null; onLoginClick: () => void; onLogout: () => void
}

export default function Navbar({ lang, setLang, cart, currentPage, setPage, user, guestRole, onLoginClick, onLogout }: Props) {
  const t = translations[lang]
  const [menuOpen,    setMenuOpen]    = useState(false)
  const [farmerMenu,  setFarmerMenu]  = useState(false)
  const [buyerMenu,   setBuyerMenu]   = useState(false)

  // Close hamburger menu on Escape key
  useEffect(() => {
    if (!menuOpen) return
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMenuOpen(false)
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [menuOpen])
  const cartCount = cart.reduce((s, i) => s + i.qty, 0)
  const go = (p: string) => { setPage(p); setMenuOpen(false); setFarmerMenu(false); setBuyerMenu(false) }

  const farmerItems = [
    { key: 'sell',      label: lang === 'en' ? '📦 Sell Produce'      : '📦 उत्पाद बेचें',      },
    { key: 'dashboard', label: lang === 'en' ? '📊 Profit Dashboard'  : '📊 लाभ डैशबोर्ड',     },
    { key: 'requests',  label: lang === 'en' ? '📩 Buyer Requests'    : '📩 खरीदार अनुरोध',    },
    { key: 'profile',   label: lang === 'en' ? '👨‍🌾 My Profile'       : '👨‍🌾 मेरी प्रोफ़ाइल',   },
    { key: 'whatsapp',  label: lang === 'en' ? '💬 WhatsApp Templates': '💬 WhatsApp टेम्प्लेट',},
  ]

  const buyerItems = [
    { key: 'marketplace', label: lang === 'en' ? '🛒 Marketplace'        : '🛒 बाज़ार',            },
    { key: 'buyers',      label: lang === 'en' ? '🏪 Bulk Buyers'        : '🏪 थोक खरीदार',       },
    { key: 'b2b',         label: lang === 'en' ? '🏭 B2B Mode'           : '🏭 B2B मोड',          },
  ]

  const utilItems = [
    { key: 'logistics',   label: lang === 'en' ? '🚛 Logistics'          : '🚛 लॉजिस्टिक्स',     },
    { key: 'demand',      label: lang === 'en' ? '🔮 Demand Forecast'    : '🔮 मांग पूर्वानुमान', },
  ]

  return (
    <nav className="navbar">
      <div className="nav-inner">
        {/* Logo */}
        <div className="nav-logo" onClick={() => go('home')}>
          <span className="logo-icon">🌾</span>
          <div><div className="logo-name">{t.appName}</div><div className="logo-tag">{t.tagline}</div></div>
        </div>

        {/* Desktop Nav */}
        <div className="nav-links">
          <button className={`nav-btn ${currentPage === 'home' ? 'active' : ''}`} onClick={() => go('home')}>🏠 {t.home}</button>

          {/* Founder admin button */}
          {user?.role === 'founder' && (
            <button
              className={`nav-btn ${currentPage === 'admin' ? 'active' : ''}`}
              onClick={() => go('admin')}
              style={{
                background: currentPage === 'admin'
                  ? 'linear-gradient(135deg, #f59e0b, #d97706)'
                  : 'rgba(245,158,11,0.12)',
                color: currentPage === 'admin' ? '#1a0a00' : '#f59e0b',
                border: '1px solid #f59e0b',
                fontWeight: 800
              }}
            >
              👑 Admin Panel
            </button>
          )}

          {/* Farmer dropdown — only shown for farmers or guests with farmer role */}
          {(!user && guestRole !== 'buyer' || user?.role === 'farmer') && (
            <div className="nav-dropdown" onMouseEnter={() => setFarmerMenu(true)} onMouseLeave={() => setFarmerMenu(false)}>
              <button className={`nav-btn ${['sell','dashboard','requests','profile','whatsapp'].includes(currentPage) ? 'active' : ''}`}>
                👨‍🌾 {lang === 'en' ? 'Farmer' : lang === 'hi' ? 'किसान' : 'शेतकरी'} ▾
              </button>
              {farmerMenu && (
                <div className="nav-dropdown-menu">
                  {farmerItems.map(i => (
                    <button key={i.key} className={`dropdown-item ${currentPage === i.key ? 'dropdown-active' : ''}`} onClick={() => go(i.key)}>{i.label}</button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Buyer dropdown — only shown for buyers or guests with buyer role */}
          {(!user && guestRole !== 'farmer' || user?.role === 'buyer') && (
            <div className="nav-dropdown" onMouseEnter={() => setBuyerMenu(true)} onMouseLeave={() => setBuyerMenu(false)}>
              <button className={`nav-btn ${['marketplace','buyers','b2b'].includes(currentPage) ? 'active' : ''}`}>
                🛒 {lang === 'en' ? 'Buyer' : lang === 'hi' ? 'खरीदार' : 'खरेदीदार'} ▾
              </button>
              {buyerMenu && (
                <div className="nav-dropdown-menu">
                  {buyerItems.map(i => (
                    <button key={i.key} className={`dropdown-item ${currentPage === i.key ? 'dropdown-active' : ''}`} onClick={() => go(i.key)}>{i.label}</button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Farmers Info Panel — visible to all non-founders */}
          {user?.role !== 'founder' && (
            <button
              className={`nav-btn ${currentPage === 'farmerinfo' ? 'active' : ''}`}
              onClick={() => go('farmerinfo')}
              style={currentPage === 'farmerinfo' ? {} : {}}
            >
              🌱 {lang === 'en' ? 'Farmers' : lang === 'hi' ? 'किसान' : 'शेतकरी'}
            </button>
          )}

          {/* Util items — hidden for founder on admin panel */}
          {user?.role !== 'founder' && utilItems.map(item => (
            <button key={item.key} className={`nav-btn ${currentPage === item.key ? 'active' : ''}`} onClick={() => go(item.key)}>{item.label}</button>
          ))}

          {/* Cart — hidden for founder */}
          {user?.role !== 'founder' && (
            <button className={`nav-btn ${currentPage === 'cart' ? 'active' : ''}`} onClick={() => go('cart')}>
              🛍️ {t.cart}
              {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
            </button>
          )}
        </div>

        {/* Auth + Lang */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
          {user
            ? <div className="nav-user" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ fontSize: user.role === 'founder' ? '20px' : '16px' }}>
                  {user.role === 'founder' ? '👑' : user.role === 'buyer' ? '🏪' : '👨‍🌾'}
                </span>
                <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.1 }}>
                  <span className="nav-user-phone" style={{ fontSize: '13px', fontWeight: 'bold', color: user.role === 'founder' ? '#f59e0b' : undefined }}>
                    {user.name || user.phone.slice(-10)}
                  </span>
                  <span style={{ fontSize: '10px', color: user.role === 'founder' ? '#d97706' : 'var(--primary-600)', textTransform: 'capitalize', fontWeight: user.role === 'founder' ? 800 : 400 }}>
                    {user.role === 'founder' ? '👑 Founder' : `(${user.role || 'farmer'})`}
                  </span>
                </div>
                <button className="lang-btn" onClick={onLogout} title="Logout" style={{ marginLeft: '4px' }}>↩</button>
              </div>
            : <button className="nav-login-btn" onClick={onLoginClick}>📱 {lang === 'en' ? 'Login' : 'लॉगिन'}</button>
          }
          <div className="lang-switch">
            {(['en', 'hi', 'mr'] as Language[]).map(l => (
              <button key={l} className={`lang-btn ${lang === l ? 'lang-active' : ''}`} onClick={() => setLang(l)}>
                {l === 'en' ? 'EN' : l === 'hi' ? 'हि' : 'म'}
              </button>
            ))}
          </div>
        </div>

        <button className="hamburger" onClick={() => setMenuOpen(!menuOpen)}>{menuOpen ? '✕' : '☰'}</button>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="mobile-menu">
          <button className="mobile-nav-btn" onClick={() => go('home')}>🏠 {t.home}</button>
          {/* Founder mobile admin button */}
          {user?.role === 'founder' && (
            <button
              className={`mobile-nav-btn ${currentPage === 'admin' ? 'active' : ''}`}
              onClick={() => go('admin')}
              style={{ background: 'rgba(245,158,11,0.15)', color: '#f59e0b', fontWeight: 800, border: '1px solid rgba(245,158,11,0.4)' }}
            >
              👑 Admin Panel
            </button>
          )}
          {(!user && guestRole !== 'buyer' || user?.role === 'farmer') && (
            <>
              <div className="mobile-section-label">{lang === 'en' ? '👨‍🌾 FARMER' : '👨‍🌾 किसान'}</div>
              {farmerItems.map(i => <button key={i.key} className={`mobile-nav-btn ${currentPage === i.key ? 'active' : ''}`} onClick={() => go(i.key)}>{i.label}</button>)}
            </>
          )}
          {(!user && guestRole !== 'farmer' || user?.role === 'buyer') && (
            <>
              <div className="mobile-section-label">{lang === 'en' ? '🛒 BUYER' : '🛒 खरीदार'}</div>
              {buyerItems.map(i => <button key={i.key} className={`mobile-nav-btn ${currentPage === i.key ? 'active' : ''}`} onClick={() => go(i.key)}>{i.label}</button>)}
            </>
          )}
          {user?.role !== 'founder' && (
            <>
              <div className="mobile-section-label">{lang === 'en' ? '🔧 TOOLS' : '🔧 टूल्स'}</div>
              <button className={`mobile-nav-btn ${currentPage === 'farmerinfo' ? 'active' : ''}`} onClick={() => go('farmerinfo')}>
                🌱 {lang === 'en' ? 'Farmers Panel' : lang === 'hi' ? 'किसान पैनल' : 'शेतकरी पॅनेल'}
              </button>
              {utilItems.map(i => <button key={i.key} className={`mobile-nav-btn ${currentPage === i.key ? 'active' : ''}`} onClick={() => go(i.key)}>{i.label}</button>)}
              <button className={`mobile-nav-btn ${currentPage === 'cart' ? 'active' : ''}`} onClick={() => go('cart')}>
                🛍️ {t.cart} {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
              </button>
            </>
          )}
          <div className="mobile-lang">
            {(['en', 'hi', 'mr'] as Language[]).map(l => (
              <button key={l} className={`lang-btn ${lang === l ? 'lang-active' : ''}`} onClick={() => { setLang(l); setMenuOpen(false) }}>
                {l === 'en' ? 'EN' : l === 'hi' ? 'हिं' : 'मर'}
              </button>
            ))}
            {user
              ? <button className="lang-btn" onClick={() => { onLogout(); setMenuOpen(false) }}>↩ Logout</button>
              : <button className="nav-login-btn" onClick={() => { onLoginClick(); setMenuOpen(false) }}>📱 Login</button>
            }
          </div>
        </div>
      )}
    </nav>
  )
}