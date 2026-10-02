import type { Language } from '../types'

interface Props {
  lang: Language
  onSelectRole: (role: 'farmer' | 'buyer') => void
  onLoginClick: () => void
}

export default function RoleSelection({ lang, onSelectRole, onLoginClick }: Props) {
  const isEn = lang === 'en'
  const isHi = lang === 'hi'

  const title = isEn ? 'Welcome to FarmBridge' : isHi ? 'FarmBridge में आपका स्वागत है' : 'FarmBridge मध्ये आपले स्वागत आहे'
  const subtitle = isEn ? 'Are you looking to buy or sell produce today?' : isHi ? 'क्या आप आज उपज खरीदना या बेचना चाह रहे हैं?' : 'तुम्ही आज शेतमाल खरेदी किंवा विक्री करू इच्छिता?'

  const trustText = isEn 
    ? '🌾 India\'s leading direct farmer-to-buyer platform' 
    : isHi 
    ? '🌾 भारत का प्रमुख प्रत्यक्ष किसान-से-खरीदार मंच' 
    : '🌾 भारतातील अग्रगण्य थेट शेतकरी-ते-खरेदीदार मंच'

  const statsText = isEn 
    ? 'Grow Better. Sell Smarter.' 
    : isHi 
    ? 'बेहतर उगाएँ। समझदारी से बेचें।' 
    : 'शेतकरी • ताजा शेतमाल • थेट ग्राहक'

  const orText = isEn 
    ? 'Already have an account?' 
    : isHi 
    ? 'क्या आपका पहले से अकाउंट है?' 
    : 'आधीच खाते आहे का?'

  const loginCTA = isEn 
    ? 'Sign in directly with Phone / OTP' 
    : isHi 
    ? 'फ़ोन / OTP के साथ सीधे लॉग इन करें' 
    : 'फोन / OTP सह थेट लॉग इन करा'

  return (
    <div className="role-selection-hero">
      {/* Animated Floating Emojis */}
      <div className="floating-emojis">
        <span className="float-item item-1">🍎</span>
        <span className="float-item item-2">🥦</span>
        <span className="float-item item-3">🌽</span>
        <span className="float-item item-4">🍇</span>
        <span className="float-item item-5">🥕</span>
        <span className="float-item item-6">🌾</span>
        <span className="float-item item-7">🥔</span>
      </div>

      <div className="role-selection-container">
        {/* Trust Badges */}
        <div className="trust-badge-container">
          <span className="trust-badge-top">{trustText}</span>
        </div>

        <h1 className="role-hero-title">{title}</h1>
        <p className="role-hero-subtitle">{subtitle}</p>

        <div className="role-cards-grid">
          {/* Farmer Card */}
          <div className="role-card glass-card farmer-card-glow" onClick={() => onSelectRole('farmer')}>
            <div className="role-card-inner">
              <div className="role-card-icon">👨‍🌾</div>
              <h2 className="role-card-title text-green">
                {isEn ? 'I am a Farmer' : isHi ? 'मैं एक किसान हूँ' : 'मी शेतकरी आहे'}
              </h2>
              <p className="role-card-desc">
                {isEn ? 'Sell your harvest directly to buyers at better prices without middlemen.' : isHi ? 'अपनी फसल को सीधे खरीदारों को बिना बिचौलियों के बेहतर दाम पर बेचें।' : 'मध्यस्थांशिवाय चांगल्या किमतीत आपला शेतमाल थेट खरेदीदारांना विका.'}
              </p>
              <span className="role-card-btn btn-green">
                {isEn ? 'Enter Farm App' : isHi ? 'कृषि ऐप खोलें' : 'अॅप सुरू करा'} &rarr;
              </span>
            </div>
          </div>

          {/* Buyer Card */}
          <div className="role-card glass-card buyer-card-glow" onClick={() => onSelectRole('buyer')}>
            <div className="role-card-inner">
              <div className="role-card-icon">🏪</div>
              <h2 className="role-card-title text-blue">
                {isEn ? 'I am a Buyer' : isHi ? 'मैं एक खरीदार हूँ' : 'मी खरेदीदार आहे'}
              </h2>
              <p className="role-card-desc">
                {isEn ? 'Browse fresh, organic produce and buy directly from trusted farmers.' : isHi ? 'ताजे, जैविक उत्पाद खोजें और सीधे भरोसेमंद किसानों से खरीदें।' : 'ताजे, सेंद्रिय उत्पादन ब्राउझ करा आणि थेट विश्वसनीय शेतकऱ्यांकडून खरेदी करा.'}
              </p>
              <span className="role-card-btn btn-blue">
                {isEn ? 'Browse Produce' : isHi ? 'उत्पाद देखें' : 'माल खरेदी करा'} &rarr;
              </span>
            </div>
          </div>
        </div>

        {/* Trust Stats */}
        <div className="role-trust-stats">
          <p>{statsText}</p>
        </div>

        {/* Direct login CTA */}
        <div className="role-direct-login">
          <span>{orText} </span>
          <button className="role-login-btn" onClick={onLoginClick}>
            {loginCTA}
          </button>
        </div>
      </div>
    </div>
  )
}
