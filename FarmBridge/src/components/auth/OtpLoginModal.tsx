import { useState, useEffect, useRef } from 'react'
import { requestOtp, confirmOtp, saveProfile, signInWithGoogle } from '../../services/authService'
import { supabase } from '../../config/supabaseClient'
import type { AuthUser, Language } from '../../types'

interface Props {
  isOpen: boolean
  onClose: () => void
  onSuccess: (user: AuthUser) => void
  lang: Language
}

const L = {
  en: {
    title: 'Welcome to FarmBridge',
    subtitle: 'Login to connect farmers & buyers',
    phoneLabel: 'Mobile Number',
    sendOtp: 'Send OTP',
    otpLabel: 'Enter 6-digit OTP',
    verify: 'Verify & Login',
    resend: 'Resend OTP',
    back: '← Change number',
    sending: 'Sending…',
    verifying: 'Verifying…',
    disclaimer: 'OTP sent via SMS to your registered mobile.',
    googleBtn: 'Continue with Google',
    orText: 'or continue with',
  },
  hi: {
    title: 'FarmBridge में आपका स्वागत है',
    subtitle: 'किसानों और खरीदारों को जोड़ें',
    phoneLabel: 'मोबाइल नंबर',
    sendOtp: 'OTP भेजें',
    otpLabel: '6 अंक OTP दर्ज करें',
    verify: 'सत्यापित करें',
    resend: 'OTP पुनः भेजें',
    back: '← नंबर बदलें',
    sending: 'भेज रहे हैं…',
    verifying: 'सत्यापित…',
    disclaimer: 'SMS द्वारा OTP भेजा जाएगा।',
    googleBtn: 'Google से जारी रखें',
    orText: 'या जारी रखें',
  },
  mr: {
    title: 'FarmBridge मध्ये स्वागत आहे',
    subtitle: 'शेतकरी आणि खरेदीदार जोडा',
    phoneLabel: 'मोबाइल नंबर',
    sendOtp: 'OTP पाठवा',
    otpLabel: '6 अंक OTP टाका',
    verify: 'सत्यापित करा',
    resend: 'OTP पुन्हा पाठवा',
    back: '← नंबर बदला',
    sending: 'पाठवत आहे…',
    verifying: 'सत्यापित…',
    disclaimer: 'SMS द्वारे OTP पाठवला जाईल.',
    googleBtn: 'Google सह पुढे जा',
    orText: 'किंवा पुढे जा',
  },
}

type DbStatus = 'checking' | 'connected' | 'disconnected'

export default function OtpLoginModal({ isOpen, onClose, onSuccess, lang }: Props) {
  const lx = L[lang]
  const [step,      setStep]      = useState<'phone' | 'otp' | 'profile'>('phone')
  const [phone,     setPhone]     = useState('')
  const [otp,       setOtp]       = useState(['', '', '', '', '', ''])
  const [loading,   setLoading]   = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)
  const [error,     setError]     = useState('')
  const [countdown, setCountdown] = useState(0)
  const [dbStatus,  setDbStatus]  = useState<DbStatus>('checking')
  const [consent, setConsent] = useState(false)
  const refs = useRef<(HTMLInputElement | null)[]>([])

  const [profileName, setProfileName] = useState('')
  const [role,        setRole]        = useState<'farmer' | 'buyer'>('farmer')
  const [village,     setVillage]     = useState('')
  const [taluka,      setTaluka]      = useState('')
  const [district,    setDistrict]    = useState('')
  const [state,       setState]       = useState('Maharashtra')
  const [birthDate,   setBirthDate]   = useState('')
  const [gpsLoading,  setGpsLoading]  = useState(false)
  const [gpsError,    setGpsError]    = useState('')

  
  // Check DB connection status
  useEffect(() => {
    if (!isOpen) return
    setDbStatus('checking')
    if (!supabase) { setDbStatus('disconnected'); return }
    ;(async () => {
      try {
        const { error } = await supabase.from('farmers').select('id').limit(1)
        setDbStatus(error ? 'disconnected' : 'connected')
      } catch {
        setDbStatus('disconnected')
      }
    })()
  }, [isOpen])

  useEffect(() => {
    if (countdown <= 0) return
    const t = setTimeout(() => setCountdown(c => c - 1), 1000)
    return () => clearTimeout(t)
  }, [countdown])

  useEffect(() => {
    if (isOpen) {
      setStep('phone'); setPhone(''); setOtp(['','','','','','']); setError('')
      setProfileName(''); setRole('farmer'); setVillage(''); setTaluka('')
      setDistrict(''); setState('Maharashtra'); setBirthDate(''); setGpsError('')
      setConsent(false)
    }
  }, [isOpen])

  if (!isOpen) return null

  async function handleSend() {
    if (!consent) { setError('Please accept the privacy notice to continue.'); return }
    setError(''); setLoading(true)
    const { error: err } = await requestOtp(phone)
    setLoading(false)
    if (err) { setError(err); return }
    setStep('otp'); setCountdown(60)
    setTimeout(() => refs.current[0]?.focus(), 100)
  }

  function handleOtpChange(i: number, val: string) {
    const digit = val.replace(/\D/, '').slice(-1)
    const next = [...otp]; next[i] = digit; setOtp(next)
    if (digit && i < 5) refs.current[i + 1]?.focus()
  }

  function handleOtpKey(i: number, e: React.KeyboardEvent) {
    if (e.key === 'Backspace' && !otp[i] && i > 0) refs.current[i - 1]?.focus()
  }

  async function handleVerify() {
  const code = otp.join('')
  if (code.length < 6) { setError('Enter all 6 digits.'); return }
  setError(''); setLoading(true)
  const { user, needsProfile, error: err } = await confirmOtp(phone, code)
  setLoading(false)
  if (err || !user) { setError(err ?? 'Verification failed.'); return }
  if (needsProfile) { setStep('profile'); return }
  onSuccess(user); onClose()
}

async function handleProfileSubmit() {
  if (!profileName.trim()) { setError('Please enter your full name.'); return }
  if (!district.trim())    { setError('Please enter your district.'); return }
  if (!birthDate)          { setError('Please enter your date of birth.'); return }
  const cutoff = new Date(); cutoff.setFullYear(cutoff.getFullYear() - 18)
  if (new Date(birthDate) > cutoff) { setError('You must be 18 or older to register.'); return }
  setError(''); setLoading(true)
  const { user, error: err } = await saveProfile(phone, { name: profileName.trim(), role, village, taluka, district, state })
  setLoading(false)
  if (err || !user) { setError(err ?? 'Failed to register profile.'); return }
  onSuccess(user); onClose()
}
  async function handleGoogleLogin() {
    setGoogleLoading(true); setError('')
    const { error: err } = await signInWithGoogle()
    if (err) { setError(err); setGoogleLoading(false) }
    // If no error, page will redirect to Google
  }

  async function detectLocation() {
    setGpsLoading(true); setGpsError('')
    try {
      if (!navigator.geolocation) throw new Error('Geolocation not supported.')
      navigator.geolocation.getCurrentPosition(
        async (pos) => {
          try {
            const { latitude, longitude } = pos.coords
            const res = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json&addressdetails=1&accept-language=en`, { headers: { 'User-Agent': 'FarmBridge/1.0' } })
            if (!res.ok) throw new Error('Geocoding failed.')
            const data = await res.json()
            const a = data.address ?? {}
            setVillage(a.village || a.town || a.suburb || '')
            setTaluka(a.county || a.suburb || '')
            setDistrict(a.county || a.district || a.city || '')
            setState(a.state || 'Maharashtra')
            setGpsLoading(false)
          } catch { setGpsError('Could not detect location. Enter manually.'); setGpsLoading(false) }
        },
        () => { setGpsError('Location permission denied.'); setGpsLoading(false) },
        { timeout: 8000, enableHighAccuracy: true }
      )
    } catch (err) { setGpsError((err as Error).message); setGpsLoading(false) }
  }

  const INP: React.CSSProperties = {
    width: '100%', padding: '10px 14px', borderRadius: '10px',
    border: '1.5px solid #e5e7eb', fontSize: '13px',
    color: '#1f2937', outline: 'none', boxSizing: 'border-box',
    background: '#fafafa', transition: 'border-color 0.2s, box-shadow 0.2s'
  }
  const LBL: React.CSSProperties = {
    fontSize: '11px', fontWeight: 700, color: '#6b7280',
    textTransform: 'uppercase', letterSpacing: '0.06em',
    display: 'block', marginBottom: '5px'
  }

  // DB Status Badge
  const dbBadge = (
    <div style={{
      display: 'inline-flex', alignItems: 'center', gap: '5px',
      padding: '3px 10px', borderRadius: '20px', fontSize: '10px', fontWeight: 700,
      background: dbStatus === 'connected' ? 'rgba(34,197,94,0.12)' : dbStatus === 'checking' ? 'rgba(245,158,11,0.12)' : 'rgba(239,68,68,0.12)',
      color: dbStatus === 'connected' ? '#16a34a' : dbStatus === 'checking' ? '#d97706' : '#dc2626',
      border: `1px solid ${dbStatus === 'connected' ? 'rgba(34,197,94,0.3)' : dbStatus === 'checking' ? 'rgba(245,158,11,0.3)' : 'rgba(239,68,68,0.3)'}`,
    }}>
      <span style={{
        width: '6px', height: '6px', borderRadius: '50%',
        background: dbStatus === 'connected' ? '#22c55e' : dbStatus === 'checking' ? '#f59e0b' : '#ef4444',
        animation: dbStatus === 'checking' ? 'pulse 1.2s ease-in-out infinite' : dbStatus === 'connected' ? 'livePulse 2s ease-in-out infinite' : 'none',
        display: 'inline-block', flexShrink: 0,
      }} />
      {dbStatus === 'connected' ? '🗄 Live Database' : dbStatus === 'checking' ? 'Connecting…' : '⚠ Offline Mode'}
    </div>
  )

  /* ── PROFILE STEP */
  if (step === 'profile') {
    return (
      <div className="modal-overlay" onClick={onClose}>
        <div
          className="modal-box modal-box-wide"
          onClick={e => e.stopPropagation()}
          style={{ background: '#fff', borderRadius: '20px', width: '100%', maxWidth: '720px', position: 'relative', boxShadow: '0 24px 64px rgba(0,0,0,0.22)', animation: 'modalIn 0.25s ease', overflow: 'hidden' }}
        >
          <button
            onClick={onClose}
            style={{ position: 'absolute', top: '14px', right: '14px', zIndex: 10, width: '30px', height: '30px', borderRadius: '50%', background: 'rgba(255,255,255,0.2)', border: 'none', cursor: 'pointer', fontSize: '14px', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(4px)' }}
          >✕</button>

          {/* Header */}
          <div style={{ background: 'linear-gradient(135deg, #1a3c2e 0%, #2d6a4f 50%, #40916c 100%)', padding: '22px 28px', display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div style={{ width: '48px', height: '48px', background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(8px)', borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px', flexShrink: 0, border: '1px solid rgba(255,255,255,0.2)' }}>
              {role === 'farmer' ? '👨‍🌾' : '🏪'}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ color: '#fff', fontWeight: 800, fontSize: '17px', letterSpacing: '-0.01em' }}>
                {lang === 'en' ? 'Complete Your Profile' : lang === 'hi' ? 'प्रोफ़ाइल पूरा करें' : 'प्रोफाईल पूर्ण करा'}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
                <span style={{ color: 'rgba(255,255,255,0.7)', fontSize: '12px' }}>+91 {phone}</span>
                <span style={{ background: 'rgba(255,255,255,0.15)', color: '#a7f3d0', fontSize: '10px', fontWeight: 700, padding: '1px 8px', borderRadius: '10px', border: '1px solid rgba(167,243,208,0.3)' }}>✓ Verified</span>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '6px', flexShrink: 0 }}>
              {(['farmer', 'buyer'] as const).map(r => (
                <button key={r} type="button" onClick={() => setRole(r)}
                  style={{ padding: '7px 14px', borderRadius: '20px', border: 'none', cursor: 'pointer', fontWeight: 700, fontSize: '12px', transition: 'all 0.2s',
                    background: role === r ? 'rgba(255,255,255,0.95)' : 'rgba(255,255,255,0.12)',
                    color: role === r ? '#1a3c2e' : '#fff',
                    boxShadow: role === r ? '0 2px 8px rgba(0,0,0,0.2)' : 'none'
                  }}>
                  {r === 'farmer' ? '👨‍🌾 Farmer' : '🏪 Buyer'}
                </button>
              ))}
            </div>
          </div>

          {/* Two-column body */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0' }}>
            {/* LEFT — Personal info */}
            <div style={{ padding: '22px 24px', borderRight: '1px solid #f0fdf4', background: '#fff' }}>
              <div style={{ fontSize: '11px', fontWeight: 800, color: '#2d6a4f', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span>👤</span> Personal Information
              </div>

              <div style={{ marginBottom: '14px' }}>
                <label style={LBL}>Full Name *</label>
                <input style={INP} type="text"
                  placeholder={lang === 'en' ? 'e.g. Siddhesh Patil' : lang === 'hi' ? 'जैसे: सिद्धेश पाटिल' : 'उदा: सिद्धेश पाटील'}
                  value={profileName} onChange={e => setProfileName(e.target.value)} autoFocus
                  onFocus={e => { e.target.style.borderColor = '#40916c'; e.target.style.boxShadow = '0 0 0 3px rgba(64,145,108,0.12)' }}
                  onBlur={e => { e.target.style.borderColor = '#e5e7eb'; e.target.style.boxShadow = 'none' }}
                />
              </div>

              <div style={{ marginBottom: '14px' }}>
                <label style={LBL}>Mobile Number</label>
                <div style={{ ...INP, display: 'flex', alignItems: 'center', gap: '8px', background: '#f9fafb', color: '#6b7280', cursor: 'default' }}>
                  <span style={{ fontSize: '14px' }}>📱</span>
                  <span style={{ fontWeight: 700, color: '#374151' }}>+91 {phone}</span>
                  <span style={{ marginLeft: 'auto', fontSize: '10px', background: '#dcfce7', color: '#16a34a', padding: '2px 8px', borderRadius: '10px', fontWeight: 700 }}>✓ Verified</span>
                </div>
              </div>

              <div style={{ marginBottom: '14px' }}>
                <label style={LBL}>🎂 Date of Birth *</label>
                <input style={{ ...INP, cursor: 'pointer' }} type="date"
                  max={new Date(new Date().setFullYear(new Date().getFullYear() - 18)).toISOString().split('T')[0]}
                  min="1940-01-01"
                  value={birthDate} onChange={e => setBirthDate(e.target.value)}
                  onFocus={e => { e.target.style.borderColor = '#40916c'; e.target.style.boxShadow = '0 0 0 3px rgba(64,145,108,0.12)' }}
                  onBlur={e => { e.target.style.borderColor = '#e5e7eb'; e.target.style.boxShadow = 'none' }}
                />
              </div>

              <div style={{ marginTop: '8px', padding: '12px', background: role === 'farmer' ? '#f0fdf4' : '#f5f3ff', borderRadius: '10px', border: `1px solid ${role === 'farmer' ? '#bbf7d0' : '#ddd6fe'}` }}>
                <div style={{ fontSize: '12px', fontWeight: 700, color: role === 'farmer' ? '#15803d' : '#7c3aed', marginBottom: '4px' }}>
                  {role === 'farmer' ? '👨‍🌾 Farmer Account' : '🏪 Buyer / Merchant Account'}
                </div>
                <div style={{ fontSize: '11px', color: '#6b7280', lineHeight: 1.5 }}>
                  {role === 'farmer'
                    ? 'List produce, track orders & view live mandi prices.'
                    : 'Browse produce, contact farmers & place bulk orders.'}
                </div>
              </div>
            </div>

            {/* RIGHT — Location */}
            <div style={{ padding: '22px 24px', background: '#fafafa' }}>
              <div style={{ fontSize: '11px', fontWeight: 800, color: '#2d6a4f', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span>📍</span> Your Location
              </div>

              <button type="button" onClick={detectLocation} disabled={gpsLoading}
                style={{ width: '100%', padding: '9px 14px', borderRadius: '10px', border: '1.5px solid #d1fae5', background: gpsLoading ? '#f0fdf4' : 'linear-gradient(135deg, #ecfdf5, #d1fae5)', color: '#065f46', fontWeight: 700, fontSize: '12px', cursor: gpsLoading ? 'default' : 'pointer', marginBottom: '4px', transition: 'all 0.2s', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                {gpsLoading ? <><span style={{ fontSize: '14px' }}>⏳</span> Detecting location…</> : <><span style={{ fontSize: '14px' }}>📍</span> Auto-detect My Location</>}
              </button>
              {gpsError && <div style={{ fontSize: '11px', color: '#dc2626', marginBottom: '10px', textAlign: 'center' }}>⚠ {gpsError}</div>}
              {!gpsError && <div style={{ fontSize: '11px', color: '#9ca3af', marginBottom: '12px', textAlign: 'center' }}>Or fill in manually below</div>}

              <div style={{ marginBottom: '12px' }}>
                <label style={LBL}>State *</label>
                <select style={{ ...INP, cursor: 'pointer' }} value={state} onChange={e => setState(e.target.value)}>
                  {['Maharashtra','Punjab','Uttar Pradesh','Gujarat','Rajasthan','Karnataka','Madhya Pradesh','Tamil Nadu','Andhra Pradesh','Haryana','Bihar','West Bengal','Telangana','Odisha','Chhattisgarh','Jharkhand','Assam','Kerala','Uttarakhand','Himachal Pradesh'].map(s => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '12px' }}>
                <div>
                  <label style={LBL}>District *</label>
                  <input style={INP} type="text"
                    placeholder={lang === 'en' ? 'e.g. Nashik' : 'नाशिक'}
                    value={district} onChange={e => setDistrict(e.target.value)}
                    onFocus={e => { e.target.style.borderColor = '#40916c'; e.target.style.boxShadow = '0 0 0 3px rgba(64,145,108,0.12)' }}
                    onBlur={e => { e.target.style.borderColor = '#e5e7eb'; e.target.style.boxShadow = 'none' }}
                  />
                </div>
                <div>
                  <label style={LBL}>Taluka</label>
                  <input style={INP} type="text"
                    placeholder={lang === 'en' ? 'e.g. Igatpuri' : 'इगतपुरी'}
                    value={taluka} onChange={e => setTaluka(e.target.value)}
                    onFocus={e => { e.target.style.borderColor = '#40916c'; e.target.style.boxShadow = '0 0 0 3px rgba(64,145,108,0.12)' }}
                    onBlur={e => { e.target.style.borderColor = '#e5e7eb'; e.target.style.boxShadow = 'none' }}
                  />
                </div>
              </div>

              <div style={{ marginBottom: '14px' }}>
                <label style={LBL}>Village / Town</label>
                <input style={INP} type="text"
                  placeholder={lang === 'en' ? 'e.g. Ghoti Budruk' : 'घोटी बुद्रुक'}
                  value={village} onChange={e => setVillage(e.target.value)}
                  onFocus={e => { e.target.style.borderColor = '#40916c'; e.target.style.boxShadow = '0 0 0 3px rgba(64,145,108,0.12)' }}
                  onBlur={e => { e.target.style.borderColor = '#e5e7eb'; e.target.style.boxShadow = 'none' }}
                />
              </div>

              {error && (
                <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '8px', padding: '8px 12px', fontSize: '12px', color: '#dc2626', fontWeight: 600, marginBottom: '12px', textAlign: 'center' }}>
                  ⚠ {error}
                </div>
              )}

              <button
                onClick={handleProfileSubmit}
                disabled={loading || !profileName.trim() || !district.trim() || !birthDate}
                style={{ width: '100%', padding: '12px', borderRadius: '10px', border: 'none', cursor: loading || !profileName.trim() || !district.trim() || !birthDate ? 'default' : 'pointer', fontWeight: 800, fontSize: '14px', transition: 'all 0.2s', background: loading || !profileName.trim() || !district.trim() || !birthDate ? '#d1d5db' : 'linear-gradient(135deg, #1a3c2e, #2d6a4f, #40916c)', color: '#fff', boxShadow: loading || !profileName.trim() || !district.trim() || !birthDate ? 'none' : '0 4px 16px rgba(45,106,79,0.4)', letterSpacing: '0.01em' }}
              >
                {loading ? 'Completing Setup…' : '✅ Complete Registration'}
              </button>

              <p style={{ textAlign: 'center', fontSize: '11px', color: '#9ca3af', marginTop: '8px', marginBottom: 0 }}>
                * Required fields. Your data is stored securely.
              </p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  /* ── PHONE + OTP STEPS */
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-box login-modal-redesign"
        onClick={e => e.stopPropagation()}
        style={{
          background: '#fff',
          borderRadius: '24px',
          width: '100%',
          maxWidth: '420px',
          position: 'relative',
          boxShadow: '0 32px 80px rgba(0,0,0,0.25), 0 0 0 1px rgba(0,0,0,0.05)',
          animation: 'modalIn 0.3s cubic-bezier(0.34,1.56,0.64,1)',
          overflow: 'hidden',
          padding: 0,
        }}
      >
        {/* Close button */}
        <button onClick={onClose} style={{
          position: 'absolute', top: '14px', right: '14px', zIndex: 20,
          width: '30px', height: '30px', borderRadius: '50%',
          background: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(8px)',
          border: '1px solid rgba(255,255,255,0.3)', cursor: 'pointer',
          fontSize: '13px', color: '#fff',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          transition: 'all 0.2s',
        }}>✕</button>

        {/* Hero gradient header */}
        <div style={{
          background: 'linear-gradient(135deg, #0a2118 0%, #1a3c2e 40%, #2d6a4f 80%, #40916c 100%)',
          padding: '28px 28px 24px',
          position: 'relative',
          overflow: 'hidden',
        }}>
          {/* Decorative circles */}
          <div style={{ position: 'absolute', top: '-30px', right: '-30px', width: '120px', height: '120px', borderRadius: '50%', background: 'rgba(64,145,108,0.15)', pointerEvents: 'none' }} />
          <div style={{ position: 'absolute', bottom: '-20px', left: '-20px', width: '80px', height: '80px', borderRadius: '50%', background: 'rgba(45,106,79,0.2)', pointerEvents: 'none' }} />

          <div style={{ position: 'relative', zIndex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '10px' }}>
              <div style={{
                width: '48px', height: '48px',
                background: 'rgba(255,255,255,0.12)',
                backdropFilter: 'blur(8px)',
                borderRadius: '14px',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '26px',
                border: '1px solid rgba(255,255,255,0.2)',
                flexShrink: 0,
              }}>🌾</div>
              <div>
                <div style={{ color: '#fff', fontWeight: 800, fontSize: '18px', letterSpacing: '-0.02em' }}>
                  {lx.title}
                </div>
                <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: '12px', marginTop: '2px' }}>
                  {lx.subtitle}
                </div>
              </div>
            </div>
            {/* DB Status badge */}
            <div style={{ marginTop: '6px' }}>{dbBadge}</div>
          </div>
        </div>

        {/* Body */}
        <div style={{ padding: '24px 28px 28px' }}>

          {/* PHONE STEP */}
          {step === 'phone' ? (
            <>
              <label style={{ ...LBL, marginBottom: '6px' }}>{lx.phoneLabel}</label>
              <div style={{ display: 'flex', marginBottom: '14px', borderRadius: '12px', overflow: 'hidden', border: '1.5px solid #e5e7eb', transition: 'border-color 0.2s, box-shadow 0.2s' }}
                onFocusCapture={e => { (e.currentTarget as HTMLElement).style.borderColor = '#40916c'; (e.currentTarget as HTMLElement).style.boxShadow = '0 0 0 3px rgba(64,145,108,0.12)' }}
                onBlurCapture={e => { (e.currentTarget as HTMLElement).style.borderColor = '#e5e7eb'; (e.currentTarget as HTMLElement).style.boxShadow = 'none' }}
              >
                <div style={{ padding: '12px 14px', background: '#f0fdf4', borderRight: '1.5px solid #e5e7eb', fontWeight: 700, color: '#2d6a4f', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '4px', whiteSpace: 'nowrap' }}>
                  🇮🇳 +91
                </div>
                <input
                  type="tel" inputMode="numeric" maxLength={10}
                  placeholder="98765 43210"
                  value={phone} autoFocus
                  onChange={e => setPhone(e.target.value.replace(/\D/, ''))}
                  onKeyDown={e => e.key === 'Enter' && handleSend()}
                  style={{ flex: 1, padding: '12px 14px', border: 'none', outline: 'none', fontSize: '15px', fontWeight: 600, color: '#111827', background: '#fff', letterSpacing: '0.05em' }}
                />
                {phone.length === 10 && (
                  <div style={{ padding: '12px', display: 'flex', alignItems: 'center', color: '#22c55e', fontSize: '18px' }}>✓</div>
                )}
              </div>
              <label style={{ display: 'flex', gap: '8px', alignItems: 'flex-start', fontSize: '12px', color: '#4b5563', marginBottom: '12px', lineHeight: 1.5 }}>
              <input type="checkbox" checked={consent} onChange={e => setConsent(e.target.checked)} style={{ marginTop: '2px' }} />
              <span>I agree that FarmBridge may collect my name, mobile number and location to run my account, and may show my mobile number to buyers/farmers so they can contact me. See Privacy Policy in the footer.</span>
              </label>
              {error && <p style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '8px', padding: '8px 12px', fontSize: '12px', color: '#dc2626', fontWeight: 600, marginBottom: '12px', textAlign: 'center' }}>⚠ {error}</p>}

              <button
                onClick={handleSend}
                disabled={loading || phone.length < 10}
                style={{
                  width: '100%', padding: '13px', borderRadius: '12px', border: 'none',
                  cursor: loading || phone.length < 10 ? 'default' : 'pointer',
                  fontWeight: 800, fontSize: '15px', transition: 'all 0.2s',
                  background: loading || phone.length < 10
                    ? '#d1d5db'
                    : 'linear-gradient(135deg, #1a3c2e, #2d6a4f, #40916c)',
                  color: '#fff',
                  boxShadow: loading || phone.length < 10 ? 'none' : '0 4px 16px rgba(45,106,79,0.4)',
                  letterSpacing: '0.01em',
                }}
              >
                {loading ? <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}><span className="btn-spinner" style={{ borderLeftColor: '#fff' }} />{lx.sending}</span> : `📲 ${lx.sendOtp}`}
              </button>


              {/* Google Sign-In — Coming Soon notice */}
              <div style={{
                width: '100%', padding: '12px 16px', borderRadius: '12px',
                border: '1.5px dashed #d1d5db',
                background: '#f9fafb',
                color: '#9ca3af',
                fontSize: '13px', fontWeight: 600,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                gap: '10px',
                userSelect: 'none',
              }}>
                {/* Google G icon (greyed) */}
                <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden="true" style={{ opacity: 0.35 }}>
                  <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
                  <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
                  <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
                  <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
                </svg>
                <span>
                  {lang === 'en' ? 'Continue with Google' : lang === 'hi' ? 'Google से जारी रखें' : 'Google सह सुरू ठेवा'}
                </span>
                <span style={{
                  marginLeft: 'auto', fontSize: '10px', fontWeight: 800,
                  background: '#e5e7eb', color: '#6b7280',
                  padding: '2px 8px', borderRadius: '8px', letterSpacing: '0.06em',
                  textTransform: 'uppercase',
                }}>Coming Soon</span>
              </div>

              <p style={{ textAlign: 'center', fontSize: '11px', color: '#9ca3af', marginTop: '14px', marginBottom: 0, lineHeight: 1.5 }}>
                {lx.disclaimer}
              </p>
            </>

          /* OTP STEP */
          ) : (
            <>
              <div style={{ textAlign: 'center', marginBottom: '20px' }}>
                <div style={{ fontSize: '40px', marginBottom: '8px' }}>📲</div>
                <div style={{ fontWeight: 700, color: '#111827', fontSize: '15px' }}>OTP sent to</div>
                <div style={{ fontWeight: 800, color: '#2d6a4f', fontSize: '17px', marginTop: '2px' }}>+91 {phone}</div>

              </div>

              <label className="form-label">{lx.otpLabel}</label>
              <div className="otp-boxes" style={{ marginBottom: '16px' }}>
                {otp.map((digit, i) => (
                  <input key={i} ref={el => { refs.current[i] = el }}
                    className="otp-box" type="text" inputMode="numeric" maxLength={1} value={digit}
                    onChange={e => handleOtpChange(i, e.target.value)}
                    onKeyDown={e => handleOtpKey(i, e)}
                  />
                ))}
              </div>

              {error && <p style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '8px', padding: '8px 12px', fontSize: '12px', color: '#dc2626', fontWeight: 600, marginBottom: '12px', textAlign: 'center' }}>⚠ {error}</p>}

              <button
                onClick={handleVerify}
                disabled={loading || otp.join('').length < 6}
                style={{
                  width: '100%', padding: '13px', borderRadius: '12px', border: 'none',
                  cursor: loading || otp.join('').length < 6 ? 'default' : 'pointer',
                  fontWeight: 800, fontSize: '15px', marginBottom: '14px',
                  background: loading || otp.join('').length < 6 ? '#d1d5db' : 'linear-gradient(135deg, #1a3c2e, #2d6a4f, #40916c)',
                  color: '#fff',
                  boxShadow: loading || otp.join('').length < 6 ? 'none' : '0 4px 16px rgba(45,106,79,0.4)',
                  transition: 'all 0.2s',
                }}
              >
                {loading ? lx.verifying : `✅ ${lx.verify}`}
              </button>

              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                <button className="link-btn" onClick={() => setStep('phone')}>{lx.back}</button>
                {countdown > 0
                  ? <span style={{ color: 'var(--gray-400)' }}>Resend in {countdown}s</span>
                  : <button className="link-btn" onClick={handleSend}>{lx.resend}</button>}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}