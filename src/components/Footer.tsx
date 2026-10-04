import type { Language } from '../types'

interface FooterProps {
  lang: Language
  setPage: (p: string) => void
}

export default function Footer({ lang, setPage }: FooterProps) {
  const t = {
    en: {
      tagline: 'Empowering Indian farmers through direct market access, fair prices, and smart tools.',
      quickLinks: 'Quick Links',
      marketplace: 'Marketplace',
      sell: 'Sell Produce',
      buyers: 'Bulk Buyers',
      logistics: 'Logistics Support',
      forFarmers: 'Services & Tools',
      dashboard: 'Farmer Dashboard',
      whatsapp: 'WhatsApp Alerts',
      mandi: 'Mandi Comparison',
      bestBuyer: 'Best Buyer Suggestion',
      contact: 'Contact & Help',
      helpline: 'WhatsApp Helpline',
      email: 'Email Support',
      address: 'Office Address',
      addrText: 'Pune, Maharashtra, India',
      madeIn: 'Made with ❤️ in India',
      privacy: 'Privacy Policy',
      terms: 'Terms of Service',
      stats: 'Farmers • Fresh Produce • Direct Buyers',
    },
    hi: {
      tagline: 'सीधे बाजार पहुंच, उचित मूल्य और स्मार्ट टूल्स के माध्यम से भारतीय किसानों को सशक्त बनाना।',
      quickLinks: 'त्वरित लिंक',
      marketplace: 'मार्केटप्लेस',
      sell: 'उपज बेचें',
      buyers: 'थोक खरीदार',
      logistics: 'लॉजिस्टिक्स सहायता',
      forFarmers: 'सेवाएं और उपकरण',
      dashboard: 'किसान डैशबोर्ड',
      whatsapp: 'व्हाट्सएप अलर्ट',
      mandi: 'मंडी तुलना',
      bestBuyer: 'सर्वश्रेष्ठ खरीदार सुझाव',
      contact: 'संपर्क और सहायता',
      helpline: 'व्हाट्सएप हेल्पलाइन',
      email: 'ईमेल सहायता',
      address: 'कार्यालय का पता',
      addrText: 'पुणे, महाराष्ट्र, भारत',
      madeIn: 'भारत में ❤️ के साथ निर्मित',
      privacy: 'गोपनीयता नीति',
      terms: 'सेवा की शर्तें',
      stats: 'किसान • ताज़ी उपज • सीधे खरीदार',
    },
    mr: {
      tagline: 'थेट बाजारपेठ, योग्य भाव आणि स्मार्ट साधनांद्वारे भारतीय शेतकऱ्यांना सक्षम करणे.',
      quickLinks: 'क्विक लिंक्स',
      marketplace: 'मार्केटप्लेस',
      sell: 'माल विक्री',
      buyers: 'घाऊक खरेदीदार',
      logistics: 'लॉजिस्टिक्स सहाय्य',
      forFarmers: 'सेवा आणि साधने',
      dashboard: 'शेतकरी डॅशबोर्ड',
      whatsapp: 'व्हॉट्सॲप अलर्ट',
      mandi: 'मंडी तुलना',
      bestBuyer: 'सर्वोत्तम खरेदीदार पर्याय',
      contact: 'संपर्क आणि मदत',
      helpline: 'व्हॉट्सॲप हेल्पलाइन',
      email: 'ईमेल सपोर्ट',
      address: 'कार्यालयाचा पत्ता',
      addrText: 'पुणे, महाराष्ट्र, भारत',
      madeIn: 'भारतात ❤️ सह निर्मित',
      privacy: 'गोपनीयता धोरण',
      terms: 'सेवा अटी',
      stats: 'शेतकरी • ताजा शेतमाल • थेट ग्राहक',
    }
  }[lang]

  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-grid">
          {/* Column 1: Brand details */}
          <div className="footer-col brand-col">
            <div className="footer-brand" onClick={() => setPage('home')} style={{ cursor: 'pointer' }}>
              <span className="footer-logo">🌾</span>
              <span className="footer-name">FarmBridge</span>
            </div>
            <p className="footer-desc">{t.tagline}</p>
            <div className="footer-stats-badge">
              <span className="badge-dot">●</span> {t.stats}
            </div>
          </div>

          {/* Column 2: Quick Links */}
          <div className="footer-col">
            <h4 className="footer-title">{t.quickLinks}</h4>
            <ul className="footer-links-list">
              <li><button onClick={() => setPage('marketplace')}>{t.marketplace}</button></li>
              <li><button onClick={() => setPage('sell')}>{t.sell}</button></li>
              <li><button onClick={() => setPage('buyers')}>{t.buyers}</button></li>
              <li><button onClick={() => setPage('logistics')}>{t.logistics}</button></li>
            </ul>
          </div>

          {/* Column 3: Services & Tools */}
          <div className="footer-col">
            <h4 className="footer-title">{t.forFarmers}</h4>
            <ul className="footer-links-list">
              <li><button onClick={() => setPage('dashboard')}>{t.dashboard}</button></li>
              <li><button onClick={() => setPage('whatsapp')}>{t.whatsapp}</button></li>
              <li><button onClick={() => setPage('mandi')}>{t.mandi}</button></li>
              <li><button onClick={() => setPage('bestbuyer')}>{t.bestBuyer}</button></li>
            </ul>
          </div>

          {/* Column 4: Contact & Help */}
          <div className="footer-col">
            <h4 className="footer-title">{t.contact}</h4>
            <div className="footer-contact-info">
              <div className="contact-item">
                <span className="contact-icon">💬</span>
                <div>
                  <div className="contact-label">{t.helpline}</div>
                  <a href="https://wa.me/911800327627" target="_blank" rel="noopener noreferrer" className="contact-val highlight-green">
                    <span className="online-indicator"></span> +91 1800-FarmBridge
                  </a>
                </div>
              </div>
              <div className="contact-item">
                <span className="contact-icon">✉️</span>
                <div>
                  <div className="contact-label">{t.email}</div>
                  <a href="mailto:support@farmbridge.in" className="contact-val">support@farmbridge.in</a>
                </div>
              </div>
              <div className="contact-item">
                <span className="contact-icon">📍</span>
                <div>
                  <div className="contact-label">{t.address}</div>
                  <span className="contact-val">{t.addrText}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Strip */}
        <div className="footer-bottom">
          <div className="footer-copyright">
            © 2026 FarmBridge. All rights reserved.
          </div>
          <div className="footer-made-in">
            {t.madeIn}
          </div>
          <div className="footer-bottom-links">
            <a href="#privacy" onClick={(e) => { e.preventDefault(); alert(t.privacy) }}>{t.privacy}</a>
            <span className="link-divider">•</span>
            <a href="#terms" onClick={(e) => { e.preventDefault(); alert(t.terms) }}>{t.terms}</a>
          </div>
        </div>
      </div>
    </footer>
  )
}