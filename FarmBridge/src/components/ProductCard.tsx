import type { Product, Language } from '../types'
import { translations } from '../data/translations'

interface Props {
  product: Product
  lang: Language
  onAddToCart: (p: Product) => void
  isBuyer?: boolean
}

export default function ProductCard({ product, lang, onAddToCart, isBuyer }: Props) {
  const t = translations[lang]
  const stars = Array.from({ length: 5 }, (_, i) => i < Math.round(product.rating) ? '★' : '☆').join('')

  // When isBuyer=true, the product.price is already the buyer price (base + ₹5)
  // We show the farmer's base price as a struck-through reference
  const farmerBasePrice = isBuyer ? product.price - 5 : product.price

  return (
    <div className="product-card">
      <div className="product-img-wrap">
        <img src={product.image} alt={product.name} className="product-img"
          onError={e => { (e.target as HTMLImageElement).src = `https://placehold.co/400x240?text=${product.name}` }} />
        {product.organic && <span className="organic-badge">🌿 Organic</span>}
        <span className="category-tag">{product.category === 'vegetable' ? '🥦' : product.category === 'fruit' ? '🍎' : '🌾'} {product.category}</span>
      </div>

      <div className="product-body">
        <div className="product-name-row">
          <div>
            <h3 className="product-name">{product.name}</h3>
            <div className="product-name-hi">{product.nameHi}</div>
          </div>
          <div className="price-tag">
            <span className="price-rupee">₹{product.price}</span>
            <span className="price-unit">/{product.unit}</span>
            {isBuyer && (
              <div style={{ fontSize: 10, color: 'var(--gray-400)', textDecoration: 'line-through', textAlign: 'right' }}>
                ₹{farmerBasePrice} farmer
              </div>
            )}
          </div>
        </div>

        <div className="product-rating">
          <span className="stars">{stars}</span>
          <span className="rating-num">{product.rating}</span>
          <span className="rating-count">({product.reviews} {t.ratings})</span>
        </div>

        <div className="product-meta">
          <div className="meta-item">📍 {product.location}, {product.state}</div>
          <div className="meta-item">📦 {t.quantity}: {product.quantity} {product.unit}</div>
        </div>

        <p className="product-desc">{product.description}</p>

        <div className="farmer-info">
          <span>👨‍🌾</span>
          <div>
            <div className="farmer-nm">{product.farmerName}</div>
            <div className="farmer-ver">✓ {t.verified}</div>
          </div>
        </div>

        <div className="product-actions">
          <button className="btn-add-cart" onClick={() => onAddToCart(product)}>🛒 {t.addToCart}</button>
{product.farmerPhone
  ? <a href={`tel:${product.farmerPhone}`} className="btn-contact">📞 {t.contactFarmer}</a>
  : <span className="btn-contact" style={{ opacity: 0.6, cursor: 'default' }}>🔒 Login to contact</span>}        </div>
      </div>
    </div>
  )
}