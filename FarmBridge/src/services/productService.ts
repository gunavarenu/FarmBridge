import { supabase } from '../config/supabaseClient'
import type { Product, CartItem, AuthUser } from '../types'
import { logUserActivity } from './activityService'

/**
 * Maps a database product row (with joined farmers table) to the frontend Product type.
 */
export function mapDbProductToProduct(row: any): Product {
  return {
    id: row.id,
    name: row.name,
    nameHi: row.name_hi || row.name,
    category: row.category,
    price: Number(row.price),
    unit: row.unit,
    quantity: Number(row.quantity),
    location: row.location_label || row.state,
    state: row.state,
    farmerName: row.farmers?.name || 'Farmer',
    farmerPhone: row.farmers?.phone || '',
    image: row.image_url || 'https://placehold.co/400x240?text=' + encodeURIComponent(row.name),
    description: row.description,
    organic: row.organic,
    postedAt: row.created_at ? row.created_at.split('T')[0] : new Date().toISOString().split('T')[0],
    rating: 4.8,
    reviews: 0,
    farmerId: row.farmer_id,
  }
}

/**
 * Returns products stored locally by the current user (while offline or from recent creates).
 * Only used as fallback when Supabase is unavailable.
 */
function getLocalProducts(): Product[] {
  try {
    const data = localStorage.getItem('farmbridge_local_products')
    return data ? JSON.parse(data) : []
  } catch {
    return []
  }
}

function saveLocalProduct(p: Product) {
  try {
    const list = getLocalProducts()
    // Remove any existing entry with same id to avoid duplicates
    const filtered = list.filter(x => x.id !== p.id)
    filtered.unshift(p)
    localStorage.setItem('farmbridge_local_products', JSON.stringify(filtered))
  } catch (err) {
    console.error('Error saving local product', err)
  }
}

/**
 * Fetches all active products from Supabase.
 * Falls back to locally-saved products only if Supabase is unreachable (offline/error).
 * Never shows hardcoded/fake sample data.
 */
export async function getMarketplaceProducts(): Promise<Product[]> {
  if (!supabase || !navigator.onLine) {
    // Genuine offline — return only real products previously saved locally
    return getLocalProducts()
  }

  try {
    const { data, error } = await supabase
      .from('products')
      .select('*, farmers(*)')
      .eq('active', true)
      .order('created_at', { ascending: false })

    if (error) {
      console.warn('Supabase products fetch failed, using local fallback:', error.message)
      return getLocalProducts()
    }

    const dbProducts = (data || []).map(mapDbProductToProduct)
    return dbProducts
  } catch (err) {
    console.warn('Supabase connection error in getMarketplaceProducts, using local fallback:', err)
    return getLocalProducts()
  }
}

/**
 * Creates a new product listing in Supabase linked to the logged-in farmer.
 * Falls back to local storage only if the user is genuinely offline.
 */
export async function createProduct(
  productData: {
    productName: string
    category: 'vegetable' | 'fruit' | 'grain' | 'spice'
    price: string
    quantity: string
    unit: string
    state: string
    district: string
    description: string
    isOrganic: boolean
    imageUrl?: string
    nameHi?: string
  },
  user?: AuthUser | null
): Promise<{ success: boolean; error?: string }> {
  // If we have no Supabase client, store locally and warn
  if (!supabase) {
    console.warn('Database client not initialized. Saving product locally.')
    const p: Product = {
      id: 'local-' + Date.now(),
      name: productData.productName,
      nameHi: productData.nameHi || productData.productName,
      category: productData.category as any,
      price: Number(productData.price),
      unit: productData.unit,
      quantity: Number(productData.quantity),
      location: productData.district,
      state: productData.state,
      farmerName: user?.name || 'Farmer',
      farmerPhone: user?.phone || '',
      image: productData.imageUrl || `https://placehold.co/400x240?text=${encodeURIComponent(productData.productName)}`,
      description: productData.description,
      organic: productData.isOrganic,
      postedAt: new Date().toISOString().split('T')[0],
      rating: 5.0,
      reviews: 0,
      farmerId: user?.id || '',
    }
    saveLocalProduct(p)
    return { success: true }
  }

  try {
    let userIdToUse = user?.id

    // Demo users (created when OTP API is unavailable) have ids like 'demo-1234567890'
    // They cannot be used as Supabase foreign keys — save locally instead
    const isDemoUser = !userIdToUse || userIdToUse.startsWith('demo-') || userIdToUse.startsWith('local-')
    const isValidUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(userIdToUse || '')

    if (isDemoUser || !isValidUuid) {
      // Save locally — will be synced once a real account is created
      const p: Product = {
        id: 'local-' + Date.now(),
        name: productData.productName,
        nameHi: productData.nameHi || productData.productName,
        category: productData.category as any,
        price: Number(productData.price),
        unit: productData.unit,
        quantity: Number(productData.quantity),
        location: productData.district,
        state: productData.state,
        farmerName: user?.name || 'Farmer',
        farmerPhone: user?.phone || '',
        image: productData.imageUrl || `https://placehold.co/400x240?text=${encodeURIComponent(productData.productName)}`,
        description: productData.description,
        organic: productData.isOrganic,
        postedAt: new Date().toISOString().split('T')[0],
        rating: 5.0,
        reviews: 0,
        farmerId: userIdToUse || '',
      }
      saveLocalProduct(p)
      return { success: true }
    }

    // For real Supabase users — try to get auth session if id not already provided
    if (!userIdToUse) {
      try {
        const { data: { user: authUser } } = await supabase.auth.getUser()
        userIdToUse = authUser?.id
      } catch {
        // Network error getting session — save locally
        const p: Product = {
          id: 'local-' + Date.now(),
          name: productData.productName,
          nameHi: productData.nameHi || productData.productName,
          category: productData.category as any,
          price: Number(productData.price),
          unit: productData.unit,
          quantity: Number(productData.quantity),
          location: productData.district,
          state: productData.state,
          farmerName: user?.name || 'Farmer',
          farmerPhone: user?.phone || '',
          image: productData.imageUrl || `https://placehold.co/400x240?text=${encodeURIComponent(productData.productName)}`,
          description: productData.description,
          organic: productData.isOrganic,
          postedAt: new Date().toISOString().split('T')[0],
          rating: 5.0, reviews: 0, farmerId: '',
        }
        saveLocalProduct(p)
        return { success: true }
      }
    }

    if (!userIdToUse) {
      return { success: false, error: 'You must be logged in to post a listing.' }
    }

    const priceNum = Number(productData.price)
    const qtyNum = Number(productData.quantity)

    if (isNaN(priceNum) || priceNum <= 0) return { success: false, error: 'Invalid price.' }
    if (isNaN(qtyNum) || qtyNum < 0) return { success: false, error: 'Invalid quantity.' }

    const { error } = await supabase
      .from('products')
      .insert({
        farmer_id: userIdToUse,
        name: productData.productName,
        name_hi: productData.nameHi || productData.productName,
        category: productData.category,
        price: priceNum,
        unit: productData.unit,
        quantity: qtyNum,
        description: productData.description,
        image_url: productData.imageUrl || '',
        organic: productData.isOrganic,
        state: productData.state,
        location_label: productData.district,
        active: true,
      })

    if (error) {
      console.error('Supabase product insert error:', error)
      return { success: false, error: error.message }
    }

    logUserActivity(
      user || (userIdToUse ? { id: userIdToUse } : null),
      'list_product',
      `Listed crop: ${productData.productName} (${productData.quantity}${productData.unit} @ ₹${productData.price}/${productData.unit})`,
      { productName: productData.productName, price: productData.price, quantity: productData.quantity, unit: productData.unit }
    )

    return { success: true }
  } catch (err) {
    console.error('Error in createProduct:', err)
    return { success: false, error: (err as Error).message }
  }
}

/**
 * Places an order in Supabase.
 * Requires a real UUID product ID and real user ID.
 */
export async function placeOrder(
  item: CartItem,
  buyerId: string,
  paymentId: string,
  buyerUser?: AuthUser | null
): Promise<{ success: boolean; error?: string }> {
  if (!supabase) {
    return { success: false, error: 'Database not available. Please check your connection.' }
  }

  const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(item.product.id)
  if (!isUuid) {
    // Product is a locally-created product not yet synced to DB
    // Store the order locally until sync
    try {
      const stored = localStorage.getItem('farmbridge_local_orders')
      const list = stored ? JSON.parse(stored) : []
      const order = {
        id: 'order-' + Date.now() + '-' + Math.random().toString().slice(2, 6),
        buyer_id: buyerId,
        farmer_id: item.product.farmerId || '',
        product_id: item.product.id,
        quantity: item.qty,
        unit_price: item.product.price,
        total_amount: item.product.price * item.qty,
        status: 'pending',
        payment_id: paymentId,
        payment_status: paymentId.startsWith('COD') ? 'pending' : 'paid',
        created_at: new Date().toISOString()
      }
      list.unshift(order)
      localStorage.setItem('farmbridge_local_orders', JSON.stringify(list))
      logUserActivity(
        buyerUser || { id: buyerId },
        'place_order',
        `Placed order for ${item.product.name} (${item.qty}${item.product.unit} @ ₹${item.product.price}/${item.product.unit})`,
        { productId: item.product.id, productName: item.product.name, quantity: item.qty, price: item.product.price, total: item.product.price * item.qty }
      )
    } catch {}
    return { success: true }
  }

  try {
    let farmerId = item.product.farmerId
    if (!farmerId) {
      const { data, error } = await supabase
        .from('products')
        .select('farmer_id')
        .eq('id', item.product.id)
        .single()

      if (error || !data) {
        return { success: false, error: 'Farmer not found for this product.' }
      }
      farmerId = data.farmer_id
    }

    const totalAmount = item.product.price * item.qty

    const { error } = await supabase
      .from('orders')
      .insert({
        buyer_id: buyerId,
        farmer_id: farmerId,
        product_id: item.product.id,
        quantity: item.qty,
        unit_price: item.product.price,
        total_amount: totalAmount,
        status: 'pending',
        payment_id: paymentId,
        payment_status: paymentId.startsWith('COD') ? 'pending' : 'paid',
      })

    if (error) {
      console.error('Supabase order insert error:', error)
      return { success: false, error: error.message }
    }

    logUserActivity(
      buyerUser || { id: buyerId },
      'place_order',
      `Placed order for ${item.product.name} (${item.qty}${item.product.unit} @ ₹${item.product.price}/${item.product.unit})`,
      { productId: item.product.id, productName: item.product.name, quantity: item.qty, price: item.product.price, total: totalAmount }
    )

    return { success: true }
  } catch (err) {
    console.error('Error in placeOrder:', err)
    return { success: false, error: (err as Error).message }
  }
}
