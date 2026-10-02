import type { Language } from '../types'
import { translations } from '../data/translations'

interface Props { 
  lang: Language
  role: 'farmer' | 'buyer'
  setPage: (p: string) => void 
}

export default function HeroSection({ lang, role, setPage }: Props) {
  const t = translations[lang]

  const farmerStats = [
    { value: '2.4L+', label: t.totalFarmers,  icon: '👨‍🌾' },
    { value: '18K+',  label: t.totalProducts,  icon: '🥦' },
    { value: '₹340Cr+', label: t.stateSaved,   icon: '💰' },
  ]

  const buyerStats = [
    { value: '18K+',  label: lang === 'en' ? 'Fresh Products' : 'ताज़ा उत्पाद', icon: '🥦' },
    { value: '12+',   label: lang === 'en' ? 'States Covered' : 'कवर किए गए राज्य', icon: '🗺️' },
    { value: '100%',  label: lang === 'en' ? 'Quality Assured' : 'गुणवत्ता का भरोसा', icon: '⭐' },
  ]

  const stats = role === 'farmer' ? farmerStats : buyerStats

  const farmerSteps = [
    { num: '01', title: t.step1, desc: t.step1Desc, icon: '📝' },
    { num: '02', title: t.step2, desc: t.step2Desc, icon: '📲' },
    { num: '03', title: t.step3, desc: t.step3Desc, icon: '✅' },
  ]

  const buyerSteps = [
    { num: '01', title: lang === 'en' ? 'Browse' : 'खोजें', desc: lang === 'en' ? 'Find fresh produce directly from farmers.' : 'किसानों से सीधे ताज़ा उपज खोजें।', icon: '🔍' },
    { num: '02', title: lang === 'en' ? 'Connect' : 'जुड़ें', desc: lang === 'en' ? 'Contact farmers or place bulk orders.' : 'किसानों से संपर्क करें या थोक ऑर्डर दें।', icon: '💬' },
    { num: '03', title: lang === 'en' ? 'Receive' : 'प्राप्त करें', desc: lang === 'en' ? 'Get quality produce delivered to you.' : 'गुणवत्तापूर्ण उपज प्राप्त करें।', icon: '🚚' },
  ]

  const steps = role === 'farmer' ? farmerSteps : buyerSteps

  const testimonials = [
    { name: 'Ramesh Patil',    village: 'Nashik',     profit: '+125%', avatar: '👨‍🌾', text: lang === 'en' ? '"Before FarmBridge I sold tomatoes for ₹8/kg to middlemen. Now I get ₹18/kg directly!"' : lang === 'hi' ? '"पहले बिचौलियों को ₹8/kg में बेचता था। अब ₹18/kg मिलता है!"' : '"आधी दलालांना ₹8/kg मध्ये विकत होतो. आता ₹18/kg मिळतो!"' },
    { name: 'Kavita Jadhav',   village: 'Solapur',    profit: '+98%',  avatar: '👩‍🌾', text: lang === 'en' ? '"Sold 800 kg of watermelons in 2 days through this app. No hassle!"' : lang === 'hi' ? '"2 दिनों में 800 किग्रा तरबूज बेचे। कोई परेशानी नहीं!"' : '"2 दिवसांत 800 किलो टरबूज विकले. कोणताही त्रास नाही!"' },
    { name: 'Suresh Sawant',   village: 'Ratnagiri',  profit: '+200%', avatar: '🧑‍🌾', text: lang === 'en' ? '"Alphonso mangoes now reach Mumbai buyers directly. Income doubled!"' : lang === 'hi' ? '"हापुस आम मुंबई तक सीधे पहुंचते हैं। आमदनी दोगुनी!"' : '"हापूस आंबे थेट मुंबईला पोहोचतात. उत्पन्न दुप्पट!"' },
  ]

  return (
    <div className="home-page">
      <section className="hero">
        <div className="hero-bg-pattern" />
        <div className="hero-content">
          <div className="hero-badge">🇮🇳 Made for Indian {role === 'farmer' ? 'Farmers' : 'Buyers'}</div>
          
          {role === 'farmer' ? (
            <>
              <h1 className="hero-title">{t.heroTitle}</h1>
              <p className="hero-sub">{t.heroSub}</p>
              <div className="hero-btns">
                <button className="btn-secondary" onClick={() => setPage('sell')}>📦 {t.sellProduce}</button>
                <button className="btn-primary" style={{ background: 'transparent', border: '2px solid var(--green)', color: 'var(--green)' }} onClick={() => setPage('dashboard')}>📊 Dashboard</button>
              </div>
            </>
          ) : (
            <>
              <h1 className="hero-title">{lang === 'en' ? 'Fresh Produce, Directly From Farmers' : 'सीधे किसानों से ताज़ा उपज'}</h1>
              <p className="hero-sub">{lang === 'en' ? 'Get the best quality crops at fair prices by buying directly from the source.' : 'सीधे स्रोत से खरीदकर उचित मूल्य पर सर्वोत्तम गुणवत्ता वाली फसलें प्राप्त करें।'}</p>
              <div className="hero-btns">
                <button className="btn-primary" onClick={() => setPage('marketplace')}>🛒 {t.browseBuy}</button>
                <button className="btn-secondary" style={{ background: 'transparent', border: '2px solid var(--orange)', color: 'var(--orange)' }} onClick={() => setPage('b2b')}>🏭 B2B Mode</button>
              </div>
            </>
          )}

        </div>
        <div className="hero-image">
          <div className="hero-produce-grid">
            {['🍅','🥭','🧅','🍌','🥦','🍉','🥕','🌽'].map((e, i) => (
              <div key={i} className="produce-bubble" style={{ animationDelay: `${i * 0.15}s` }}>{e}</div>
            ))}
          </div>
        </div>
      </section>

      <section className="stats-bar">
        {stats.map((s, i) => (
          <div key={i} className="stat-item">
            <span className="stat-icon">{s.icon}</span>
            <div className="stat-value">{s.value}</div>
            <div className="stat-label">{s.label}</div>
          </div>
        ))}
      </section>

      <section className="section">
        <h2 className="section-title">{t.howItWorks}</h2>
        <div className="steps-grid">
          {steps.map((s, i) => (
            <div key={i} className="step-card">
              <div className="step-num">{s.num}</div>
              <div className="step-icon">{s.icon}</div>
              <h3 className="step-title">{s.title}</h3>
              <p className="step-desc">{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {role === 'farmer' && (
        <section className="section testimonials-section">
          <h2 className="section-title">{t.successStories}</h2>
          <div className="testimonials-grid">
            {testimonials.map((tm, i) => (
              <div key={i} className="testimonial-card">
                <div className="testimonial-header">
                  <div className="farmer-avatar">{tm.avatar}</div>
                  <div><div className="farmer-name">{tm.name}</div><div className="farmer-village">📍 {tm.village}</div></div>
                  <div className="profit-badge">{tm.profit}</div>
                </div>
                <p className="testimonial-text">{tm.text}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      <section className="cta-section">
        <div className="cta-inner">
          {role === 'farmer' ? (
            <>
              <h2>{lang === 'en' ? 'Ready to get fair prices for your harvest?' : lang === 'hi' ? 'अपनी फसल का उचित मूल्य पाने के लिए तैयार?' : 'आपल्या पिकाला योग्य भाव मिळवण्यास तयार?'}</h2>
              <button className="btn-cta" onClick={() => setPage('sell')}>🌾 {t.sellProduce} →</button>
            </>
          ) : (
            <>
              <h2>{lang === 'en' ? 'Ready to source quality produce directly?' : lang === 'hi' ? 'सीधे गुणवत्तापूर्ण उपज प्राप्त करने के लिए तैयार हैं?' : 'थेट गुणवत्तापूर्ण शेतमाल खरेदी करण्यास तयार आहात?'}</h2>
              <button className="btn-cta" onClick={() => setPage('marketplace')}>🛒 {t.browseBuy} →</button>
            </>
          )}
        </div>
      </section>
    </div>
  )
}