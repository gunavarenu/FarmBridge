/**
 * WhatsAppAutomation.tsx
 * Feature 7 — WhatsApp / Call Automation
 * Pre-built message templates for common farmer-buyer scenarios.
 * One tap to open WhatsApp with the message pre-filled.
 * Also shows call scripts for phone negotiations.
 */
import { useState } from 'react'
import type { Language } from '../../types'

interface Template {
  id: string
  scenario: string; scenarioHi: string; scenarioMr: string
  emoji: string
  message: (p: TemplateParams) => string
  messageHi: (p: TemplateParams) => string
  messageMr: (p: TemplateParams) => string
  category: 'sale' | 'followup' | 'negotiate' | 'logistics'
}

interface TemplateParams {
  farmerName: string; product: string; qty: string
  price: string; unit: string; location: string; buyerName: string
}

const TEMPLATES: Template[] = [
  {
    id: 't1', emoji: '🌾',
    scenario: 'Introduce your produce', scenarioHi: 'अपनी उपज का परिचय दें', scenarioMr: 'उपज परिचय द्या',
    category: 'sale',
    message: p => `Hello ${p.buyerName || 'Sir/Madam'} 🙏\n\nI am *${p.farmerName}*, a farmer from *${p.location}*.\n\nI have fresh *${p.product}* available:\n📦 Quantity: *${p.qty} ${p.unit}*\n💰 Price: *₹${p.price}/${p.unit}*\n✅ Grade A quality\n🌿 No harmful pesticides\n\nAre you interested in purchasing directly from my farm? I can arrange delivery or pickup.\n\nFound you on *FarmBridge* app.`,
    messageHi: p => `नमस्ते ${p.buyerName || 'जी'} 🙏\n\nमैं *${p.farmerName}* हूं, *${p.location}* का किसान।\n\nमेरे पास ताज़ा *${p.product}* उपलब्ध है:\n📦 मात्रा: *${p.qty} ${p.unit}*\n💰 मूल्य: *₹${p.price}/${p.unit}*\n✅ Grade A गुणवत्ता\n🌿 बिना कीटनाशक\n\nक्या आप सीधे मेरे खेत से खरीदना चाहते हैं?\n\n*FarmBridge* ऐप पर मिला।`,
    messageMr: p => `नमस्कार ${p.buyerName || 'जी'} 🙏\n\nमी *${p.farmerName}*, *${p.location}* चा शेतकरी.\n\nमाझ्याकडे ताजे *${p.product}* उपलब्ध आहे:\n📦 प्रमाण: *${p.qty} ${p.unit}*\n💰 किंमत: *₹${p.price}/${p.unit}*\n✅ Grade A दर्जा\n\n*FarmBridge* अॅपवर सापडले.`,
  },
  {
    id: 't2', emoji: '💰',
    scenario: 'Send price quote', scenarioHi: 'मूल्य कोटेशन भेजें', scenarioMr: 'किंमत कोटेशन पाठवा',
    category: 'sale',
    message: p => `Hello ${p.buyerName} 🙏\n\n*PRICE QUOTE — ${p.product.toUpperCase()}*\n━━━━━━━━━━━━━━━\nProduct: ${p.product}\nQuantity: ${p.qty} ${p.unit}\nPrice: ₹${p.price}/${p.unit}\nTotal: ₹${Number(p.price) * Number(p.qty)}\nLocation: ${p.location}\n━━━━━━━━━━━━━━━\n✅ Fresh from farm\n🚚 Delivery available\n💳 UPI / Cash accepted\n\nQuote valid for 48 hours. Please confirm.`,
    messageHi: p => `नमस्ते ${p.buyerName} 🙏\n\n*मूल्य कोटेशन — ${p.product.toUpperCase()}*\n━━━━━━━━━━━━━━━\nउत्पाद: ${p.product}\nमात्रा: ${p.qty} ${p.unit}\nमूल्य: ₹${p.price}/${p.unit}\nकुल: ₹${Number(p.price) * Number(p.qty)}\nस्थान: ${p.location}\n━━━━━━━━━━━━━━━\n✅ खेत से ताज़ा\n💳 UPI / नकद स्वीकार्य\n\n48 घंटे के लिए मान्य।`,
    messageMr: p => `नमस्कार ${p.buyerName} 🙏\n\n*किंमत कोटेशन — ${p.product.toUpperCase()}*\n━━━━━━━━━━━━━━━\nउत्पादन: ${p.product}\nप्रमाण: ${p.qty} ${p.unit}\nकिंमत: ₹${p.price}/${p.unit}\nएकूण: ₹${Number(p.price) * Number(p.qty)}\nस्थान: ${p.location}\n━━━━━━━━━━━━━━━\n48 तासांसाठी वैध.`,
  },
  {
    id: 't3', emoji: '🔄',
    scenario: 'Follow up on enquiry', scenarioHi: 'पूछताछ पर फॉलो-अप', scenarioMr: 'चौकशीवर फॉलो-अप',
    category: 'followup',
    message: p => `Hello ${p.buyerName} 🙏\n\nThis is ${p.farmerName} from FarmBridge.\n\nJust following up on my ${p.product} offer. I still have *${p.qty} ${p.unit}* available at *₹${p.price}/${p.unit}*.\n\nAs harvest season is ending, this is your last chance for fresh stock. Let me know if you'd like to proceed? 🌾`,
    messageHi: p => `नमस्ते ${p.buyerName} 🙏\n\nमैं ${p.farmerName} हूं FarmBridge से।\n\nमेरे ${p.product} ऑफर पर फॉलो-अप। अभी भी *${p.qty} ${p.unit}* उपलब्ध है *₹${p.price}/${p.unit}* पर।\n\nफसल का मौसम खत्म हो रहा है। क्या आगे बढ़ना चाहेंगे? 🌾`,
    messageMr: p => `नमस्कार ${p.buyerName} 🙏\n\nमी ${p.farmerName} FarmBridge वरून.\n\n${p.product} च्या ऑफरवर फॉलो-अप. अजूनही *${p.qty} ${p.unit}* उपलब्ध आहे *₹${p.price}/${p.unit}* वर. 🌾`,
  },
  {
    id: 't4', emoji: '🤝',
    scenario: 'Negotiate price', scenarioHi: 'मूल्य पर बातचीत', scenarioMr: 'किंमत वाटाघाटी',
    category: 'negotiate',
    message: p => `Hello ${p.buyerName} 🙏\n\nThank you for your interest in ${p.product}.\n\nI understand you need a better price. My current rate is *₹${p.price}/${p.unit}*.\n\nFor an order of *${p.qty} ${p.unit}* or more, I can offer:\n• ₹${Math.round(Number(p.price) * 0.95)}/${p.unit} for immediate payment\n• ₹${Math.round(Number(p.price) * 0.97)}/${p.unit} for weekly contract\n\nI cannot go lower than this as my production cost is high. Hope we can work together! 🌾`,
    messageHi: p => `नमस्ते ${p.buyerName} 🙏\n\n${p.product} में रुचि के लिए धन्यवाद।\n\nमेरी वर्तमान दर *₹${p.price}/${p.unit}* है।\n\n*${p.qty} ${p.unit}* या अधिक के ऑर्डर पर:\n• तत्काल भुगतान पर ₹${Math.round(Number(p.price) * 0.95)}/${p.unit}\n• साप्ताहिक अनुबंध पर ₹${Math.round(Number(p.price) * 0.97)}/${p.unit}\n\nइससे कम नहीं हो सकता। 🌾`,
    messageMr: p => `नमस्कार ${p.buyerName} 🙏\n\n${p.product} मध्ये स्वारस्याबद्दल धन्यवाद.\n\nमाझा सध्याचा दर *₹${p.price}/${p.unit}* आहे.\n\n*${p.qty} ${p.unit}* किंवा जास्त ऑर्डरसाठी:\n• तात्काळ पेमेंटवर ₹${Math.round(Number(p.price) * 0.95)}/${p.unit}\n• साप्ताहिक करारावर ₹${Math.round(Number(p.price) * 0.97)}/${p.unit} 🌾`,
  },
  {
    id: 't5', emoji: '🚚',
    scenario: 'Confirm delivery', scenarioHi: 'डिलीवरी की पुष्टि', scenarioMr: 'डिलिव्हरी पुष्टी',
    category: 'logistics',
    message: p => `Hello ${p.buyerName} 🙏\n\n*ORDER CONFIRMED ✅*\n\n🌾 Product: ${p.product}\n📦 Quantity: ${p.qty} ${p.unit}\n💰 Amount: ₹${Number(p.price) * Number(p.qty)}\n📍 Pickup from: ${p.location}\n\n🚚 Delivery details:\n• Your goods will be dispatched today\n• Driver will call 1 hour before arrival\n• Please arrange payment on delivery\n\nThank you for choosing FarmBridge! 🙏`,
    messageHi: p => `नमस्ते ${p.buyerName} 🙏\n\n*ऑर्डर की पुष्टि ✅*\n\n🌾 उत्पाद: ${p.product}\n📦 मात्रा: ${p.qty} ${p.unit}\n💰 राशि: ₹${Number(p.price) * Number(p.qty)}\n📍 पिकअप: ${p.location}\n\n🚚 आज डिस्पैच होगा। ड्राइवर पहुंचने से 1 घंटे पहले कॉल करेगा।\n\nFarmBridge चुनने के लिए धन्यवाद! 🙏`,
    messageMr: p => `नमस्कार ${p.buyerName} 🙏\n\n*ऑर्डर निश्चित ✅*\n\n🌾 उत्पादन: ${p.product}\n📦 प्रमाण: ${p.qty} ${p.unit}\n💰 रक्कम: ₹${Number(p.price) * Number(p.qty)}\n\n🚚 आज पाठवले जाईल. ड्रायव्हर 1 तास आधी कॉल करेल.\n\nFarmBridge निवडल्याबद्दल धन्यवाद! 🙏`,
  },
]

interface Props { lang: Language }

export default function WhatsAppAutomation({ lang }: Props) {
  const [params, setParams] = useState<TemplateParams>({
    farmerName: 'Ramesh Patil', product: '', qty: '', price: '',
    unit: 'kg', location: 'Nashik, Maharashtra', buyerName: '',
  })
  const [selected, setSelected] = useState<Template | null>(null)
  const [category, setCategory] = useState('all')
  const [copied,   setCopied]   = useState(false)

  const up = (k: keyof TemplateParams, v: string) => setParams(p => ({ ...p, [k]: v }))

  const getMessage = (t: Template) => lang === 'hi' ? t.messageHi(params) : lang === 'mr' ? t.messageMr(params) : t.message(params)
  const getScenario = (t: Template) => lang === 'hi' ? t.scenarioHi : lang === 'mr' ? t.scenarioMr : t.scenario

  const handleCopy = (msg: string) => {
    navigator.clipboard.writeText(msg)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const filtered = TEMPLATES.filter(t => category === 'all' || t.category === category)

  const T = {
    en: { title: 'WhatsApp & Call Automation', subtitle: 'Ready-made message templates for every buyer situation',
      fill: 'Fill your details', farmerName: 'Your Name', product: 'Product', qty: 'Quantity',
      price: 'Price', unit: 'Unit', location: 'Your Location', buyerName: "Buyer's Name (optional)",
      templates: 'Choose Template', preview: 'Message Preview', sendWa: 'Send on WhatsApp',
      copy: 'Copy Message', copied: '✅ Copied!', all: 'All', sale: 'Sale', followup: 'Follow-up',
      negotiate: 'Negotiate', logistics: 'Logistics', callScript: 'Call Script',
      callTip: '💡 Call tip: Always greet in the buyer\'s language, mention FarmBridge, and quote your price with confidence.',
    },
    hi: { title: 'WhatsApp और कॉल ऑटोमेशन', subtitle: 'हर खरीदार स्थिति के लिए तैयार संदेश टेम्प्लेट',
      fill: 'अपनी जानकारी भरें', farmerName: 'आपका नाम', product: 'उत्पाद', qty: 'मात्रा',
      price: 'मूल्य', unit: 'इकाई', location: 'आपका स्थान', buyerName: 'खरीदार का नाम (वैकल्पिक)',
      templates: 'टेम्प्लेट चुनें', preview: 'संदेश पूर्वावलोकन', sendWa: 'WhatsApp पर भेजें',
      copy: 'संदेश कॉपी करें', copied: '✅ कॉपी हो गया!', all: 'सभी', sale: 'बिक्री', followup: 'फॉलो-अप',
      negotiate: 'बातचीत', logistics: 'लॉजिस्टिक्स', callScript: 'कॉल स्क्रिप्ट',
      callTip: '💡 कॉल टिप: खरीदार की भाषा में अभिवादन करें, FarmBridge का उल्लेख करें, आत्मविश्वास से मूल्य बताएं।',
    },
    mr: { title: 'WhatsApp आणि कॉल ऑटोमेशन', subtitle: 'प्रत्येक खरेदीदार परिस्थितीसाठी तयार संदेश टेम्प्लेट',
      fill: 'तुमचे तपशील भरा', farmerName: 'तुमचे नाव', product: 'उत्पादन', qty: 'प्रमाण',
      price: 'किंमत', unit: 'एकक', location: 'तुमचे स्थान', buyerName: 'खरेदीदाराचे नाव (पर्यायी)',
      templates: 'टेम्प्लेट निवडा', preview: 'संदेश पूर्वावलोकन', sendWa: 'WhatsApp वर पाठवा',
      copy: 'संदेश कॉपी करा', copied: '✅ कॉपी झाले!', all: 'सर्व', sale: 'विक्री', followup: 'फॉलो-अप',
      negotiate: 'वाटाघाटी', logistics: 'लॉजिस्टिक्स', callScript: 'कॉल स्क्रिप्ट',
      callTip: '💡 कॉल टिप: खरेदीदाराच्या भाषेत अभिवादन करा, FarmBridge चा उल्लेख करा, आत्मविश्वासाने किंमत सांगा.',
    },
  }[lang]

  return (
    <div className="wa-page">
      <h1 className="page-title">💬 {T.title}</h1>
      <p className="page-sub">{T.subtitle}</p>

      <div className="wa-layout">
        {/* Left: fill details */}
        <div className="wa-left">
          <div className="tips-card">
            <h3 className="tips-title">✏️ {T.fill}</h3>
            {[
              ['farmerName', T.farmerName, 'text', 'Ramesh Patil'],
              ['product',    T.product,    'text', 'Tomatoes'],
              ['qty',        T.qty,        'number', '100'],
              ['price',      T.price,      'number', '22'],
              ['location',   T.location,   'text', 'Nashik, Maharashtra'],
              ['buyerName',  T.buyerName,  'text', 'Hotel Sahyadri'],
            ].map(([k, lbl, type, ph]) => (
              <div key={k} className="form-group">
                <label className="form-label">{lbl}</label>
                <input className="form-input" type={type as string}
                  value={(params as any)[k]} placeholder={ph as string}
                  onChange={e => up(k as keyof TemplateParams, e.target.value)} />
              </div>
            ))}
            <div className="form-group">
              <label className="form-label">{T.unit}</label>
              <select className="form-input" value={params.unit} onChange={e => up('unit', e.target.value)}>
                <option value="kg">kg</option><option value="quintal">Quintal</option>
                <option value="dozen">Dozen</option><option value="piece">Piece</option>
              </select>
            </div>
          </div>

          <div className="tips-card" style={{ marginTop: '1rem' }}>
            <div className="tip-item">{T.callTip}</div>
          </div>
        </div>

        {/* Right: templates + preview */}
        <div className="wa-right">
          <h3 className="tips-title">📋 {T.templates}</h3>

          <div className="category-tabs" style={{ marginBottom: '1rem' }}>
            {[['all',T.all],['sale',T.sale],['followup',T.followup],['negotiate',T.negotiate],['logistics',T.logistics]].map(([v,l]) => (
              <button key={v} className={`cat-tab ${category === v ? 'cat-active' : ''}`} onClick={() => setCategory(v)}>{l}</button>
            ))}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {filtered.map(t => (
              <div key={t.id} className={`wa-template ${selected?.id === t.id ? 'wa-template-active' : ''}`}
                onClick={() => setSelected(selected?.id === t.id ? null : t)}>
                <span style={{ fontSize: '1.5rem' }}>{t.emoji}</span>
                <div>
                  <div className="wa-tmpl-label">{getScenario(t)}</div>
                  <div className="wa-tmpl-cat">{t.category}</div>
                </div>
                <span style={{ marginLeft: 'auto', color: 'var(--gray-400)' }}>{selected?.id === t.id ? '▲' : '▼'}</span>
              </div>
            ))}
          </div>

          {selected && (
            <div className="wa-preview">
              <div className="wa-preview-title">📱 {T.preview}</div>
              <div className="wa-message-box">{getMessage(selected)}</div>
              <div className="wa-preview-actions">
                <button className="btn-bulk-wa" style={{ flex: 1 }}
                  onClick={() => window.open(`https://wa.me/?text=${encodeURIComponent(getMessage(selected))}`, '_blank')}>
                  💬 {T.sendWa}
                </button>
                <button className="btn-add-cart" style={{ flex: 1 }} onClick={() => handleCopy(getMessage(selected))}>
                  {copied ? T.copied : `📋 ${T.copy}`}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}