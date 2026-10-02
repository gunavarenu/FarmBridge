import { useState } from 'react'
import type { CartItem, Language, AuthUser } from '../types'
import { translations } from '../data/translations'
import UpiPayButton from './payment/UpiPayButton'
import { placeOrder } from '../services/productService'

interface Props {
  lang: Language; cart: CartItem[]
  onUpdateQty: (id: string, qty: number) => void
  onRemove: (id: string) => void; setPage: (p: string) => void
  user: AuthUser | null; onLoginClick: () => void
}

export default function CartPage({ lang, cart, onUpdateQty, onRemove, setPage, user, onLoginClick }: Props) {
  const t = translations[lang]
  const total = cart.reduce((s, i) => s + i.product.price * i.qty, 0)
  const [paid, setPaid]         = useState(false)
  const [paymentId, setPaymentId] = useState('')
  const [payError,  setPayError]  = useState('')
  const [payMethod, setPayMethod] = useState<'upi' | 'cod'>('upi')
  const [isPlacingCod, setIsPlacingCod] = useState(false)

  const handlePlaceCodOrder = async () => {
    if (!user) return
    setIsPlacingCod(true)
    setPayError('')
    const pid = `COD-${Date.now().toString().slice(-6)}`
    try {
      const results = await Promise.all(cart.map(item => placeOrder(item, user.id, pid, user)))
      const firstError = results.find(r => !r.success)
      if (firstError) {
        setPayError(firstError.error || 'Failed to register orders.')
        setIsPlacingCod(false)
        return
      }
      setPaymentId(pid)
      setPaid(true)
    } catch (err) {
      setPayError((err as Error).message)
      setIsPlacingCod(false)
    }
  }

  if (cart.length === 0) return (
    <div className="cart-page">
      <div className="empty-cart">
        <div className="empty-icon">🛒</div>
        <h2>{t.emptyCart}</h2>
        <button className="btn-primary" onClick={() => setPage('marketplace')}>🛍️ {t.browseBuy}</button>
      </div>
    </div>
  )

  if (paid) {
    const isCod = paymentId.startsWith('COD')
    return (
      <div className="cart-page">
        <div className="success-screen">
          <div className="success-icon">🎉</div>
          <h2 className="success-title">
            {lang === 'en' 
              ? (isCod ? 'Order Placed Successfully!' : 'Payment Successful!') 
              : lang === 'hi' 
              ? (isCod ? 'ऑर्डर सफलतापूर्वक दर्ज!' : 'भुगतान सफल!') 
              : (isCod ? 'ऑर्डर यशस्वीरित्या नोंदवली!' : 'पेमेंट यशस्वी!')}
          </h2>
          <p className="success-msg">
            {isCod 
              ? (lang === 'en' 
                  ? `Your order is confirmed. Cash on Delivery (COD) of ₹${total} is due on delivery. The farmer will contact you shortly.`
                  : lang === 'hi'
                  ? `आपका ऑर्डर पुष्ट हो गया है। ₹${total} का नकद भुगतान डिलीवरी के समय करना होगा। किसान जल्द आपसे संपर्क करेंगे।`
                  : `तुमची ऑर्डर निश्चित झाली आहे. डिलिव्हरीच्या वेळी ₹${total} रोख पेमेंट करावे लागेल. शेतकरी लवकरच संपर्क करेल.`)
              : (lang === 'en' 
                  ? 'Order placed. Farmer will contact you shortly.' 
                  : lang === 'hi' 
                  ? 'ऑर्डर दर्ज। किसान जल्द संपर्क करेगा।' 
                  : 'ऑर्डर नोंदणी झाली. शेतकरी लवकरच संपर्क करेल.')
            }
          </p>
          <div className="success-product">
            {isCod ? '💰 Method: Cash on Delivery' : `🆔 Payment ID: ${paymentId.slice(-12)}`}
          </div>
          <button className="btn-primary" style={{ marginTop: '1.5rem' }} onClick={() => setPage('marketplace')}>🛒 {t.browseBuy}</button>
        </div>
      </div>
    )
  }

  return (
    <div className="cart-page">
      <h1 className="page-title">{t.yourCart}</h1>
      <div className="cart-layout">
        <div className="cart-items">
          {cart.map(item => (
            <div key={item.product.id} className="cart-item">
              <img src={item.product.image} alt={item.product.name} className="cart-item-img" />
              <div className="cart-item-info">
                <h3 className="cart-item-name">{item.product.name}</h3>
                <div className="cart-item-farmer">👨‍🌾 {item.product.farmerName} • 📍 {item.product.location}</div>
                <div className="cart-item-price">₹{item.product.price}/{item.product.unit}</div>
              </div>
              <div className="cart-item-controls">
                <div className="qty-control">
                  <button className="qty-btn" onClick={() => onUpdateQty(item.product.id, item.qty - 1)} disabled={item.qty <= 1}>−</button>
                  <span className="qty-val">{item.qty} {item.product.unit}</span>
                  <button className="qty-btn" onClick={() => onUpdateQty(item.product.id, item.qty + 1)} disabled={item.qty >= item.product.quantity}>+</button>
                </div>
                <div className="cart-item-subtotal">₹{item.product.price * item.qty}</div>
                <button className="btn-remove" onClick={() => onRemove(item.product.id)}>🗑 {t.remove}</button>
              </div>
            </div>
          ))}
        </div>

        <div className="cart-summary">
          <div className="summary-card">
            <h3 className="summary-title">{lang === 'en' ? 'Order Summary' : lang === 'hi' ? 'ऑर्डर सारांश' : 'ऑर्डर सारांश'}</h3>
            {cart.map(item => (
              <div key={item.product.id} className="summary-row">
                <span>{item.product.name} × {item.qty}</span>
                <span>₹{item.product.price * item.qty}</span>
              </div>
            ))}
            <div className="summary-divider" />
            <div className="summary-total-row">
              <span>{t.total}</span>
              <span className="summary-total-price">₹{total}</span>
            </div>

            {user ? (
              <>
                <div style={{ marginBottom: '1.25rem' }}>
                  <label style={{ fontSize: '11px', fontWeight: 800, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: '8px' }}>
                    {lang === 'en' ? 'Payment Method' : lang === 'hi' ? 'भुगतान विधि' : 'पेमेंट पद्धत'}
                  </label>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                      type="button"
                      onClick={() => setPayMethod('upi')}
                      style={{
                        flex: 1, padding: '10px', borderRadius: '10px', border: '1.5px solid', fontWeight: 700, fontSize: '13px', cursor: 'pointer', transition: 'all 0.2s',
                        borderColor: payMethod === 'upi' ? '#2d6a4f' : '#e5e7eb',
                        background: payMethod === 'upi' ? '#f0fdf4' : '#fff',
                        color: payMethod === 'upi' ? '#2d6a4f' : '#4b5563'
                      }}
                    >
                      💳 {lang === 'en' ? 'Pay UPI' : lang === 'hi' ? 'यूपीआई' : 'यूपीआय'}
                    </button>
                    <button
                      type="button"
                      onClick={() => setPayMethod('cod')}
                      style={{
                        flex: 1, padding: '10px', borderRadius: '10px', border: '1.5px solid', fontWeight: 700, fontSize: '13px', cursor: 'pointer', transition: 'all 0.2s',
                        borderColor: payMethod === 'cod' ? '#2d6a4f' : '#e5e7eb',
                        background: payMethod === 'cod' ? '#f0fdf4' : '#fff',
                        color: payMethod === 'cod' ? '#2d6a4f' : '#4b5563'
                      }}
                    >
                      🤝 {lang === 'en' ? 'COD' : lang === 'hi' ? 'कैश ऑन डिलीवरी' : 'कॅश ऑन डिलिव्हरी'}
                    </button>
                  </div>
                </div>

                {payError && <p className="error-msg" style={{ marginBottom: '0.75rem' }}>⚠ {payError}</p>}
                
                {payMethod === 'upi' ? (
                  <UpiPayButton
                    amountRs={total}
                    productName={cart.map(i => i.product.name).join(', ')}
                    farmerName={cart[0]?.product.farmerName ?? ''}
                    orderId={`cart-${Date.now()}`}
                    buyerPhone={user.phone.replace('+91', '')}
                    lang={lang}
                    onSuccess={async pid => {
                      setPayError('')
                      try {
                        const results = await Promise.all(cart.map(item => placeOrder(item, user.id, pid, user)))
                        const firstError = results.find(r => !r.success)
                        if (firstError) {
                          setPayError(firstError.error || 'Failed to register orders.')
                          return
                        }
                        setPaymentId(pid)
                        setPaid(true)
                      } catch (err) {
                        setPayError((err as Error).message)
                      }
                    }}
                    onError={setPayError}
                  />
                ) : (
                  <button
                    type="button"
                    className="btn-submit"
                    onClick={handlePlaceCodOrder}
                    disabled={isPlacingCod}
                    style={{
                      background: 'linear-gradient(135deg, #15803d, #16a34a)',
                      boxShadow: '0 4px 12px rgba(22, 163, 74, 0.2)',
                      border: 'none',
                      color: '#fff',
                      width: '100%',
                      padding: '12px',
                      borderRadius: '12px',
                      fontWeight: 800,
                      cursor: 'pointer'
                    }}
                  >
                    {isPlacingCod ? 'Placing Order…' : `🤝 ${lang === 'en' ? 'Confirm COD Order' : lang === 'hi' ? 'COD ऑर्डर की पुष्टि करें' : 'COD ऑर्डर निश्चित करा'}`}
                  </button>
                )}
              </>
            ) : (
              <div className="login-to-pay">
                <p>{lang === 'en' ? 'Login to complete purchase' : lang === 'hi' ? 'खरीदारी के लिए लॉगिन करें' : 'खरेदीसाठी लॉगिन करा'}</p>
                <button className="btn-submit" onClick={onLoginClick}>📱 Login</button>
              </div>
            )}

            <button className="btn-continue" onClick={() => setPage('marketplace')}>← {lang === 'en' ? 'Continue Shopping' : lang === 'hi' ? 'खरीदारी जारी रखें' : 'खरेदी सुरू ठेवा'}</button>
          </div>
        </div>
      </div>
    </div>
  )
}