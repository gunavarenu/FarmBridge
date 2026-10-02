declare const Razorpay: any

const RAZORPAY_KEY = import.meta.env.VITE_RAZORPAY_KEY_ID as string
const PAYMENT_API  = import.meta.env.VITE_OTP_API_URL
  ? (import.meta.env.VITE_OTP_API_URL as string).replace('/otp', '/payment')
  : '/api/payment'

export interface PaymentResult {
  success: boolean
  paymentId?: string
  error?: string
}

export async function createRazorpayOrder(amountRs: number, notes: Record<string, string>): Promise<string> {
  const res = await fetch(`${PAYMENT_API}/create`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ amount: amountRs * 100, currency: 'INR', notes }),
  })
  if (!res.ok) throw new Error('Failed to create payment order.')
  const data = await res.json()
  return data.id
}

export function openUpiCheckout(opts: {
  productName: string; amountRs: number; farmerName: string
  buyerPhone?: string; buyerName?: string; orderId: string
}): Promise<PaymentResult> {
  return new Promise((resolve) => {
    if (typeof Razorpay === 'undefined') {
      resolve({ success: false, error: 'Payment SDK not loaded. Refresh and try again.' })
      return
    }
    const rz = new Razorpay({
      key: RAZORPAY_KEY,
      amount: opts.amountRs * 100,
      currency: 'INR',
      name: 'FarmBridge',
      description: `${opts.productName} from ${opts.farmerName}`,
      order_id: opts.orderId,
      prefill: { name: opts.buyerName, contact: opts.buyerPhone ? `+91${opts.buyerPhone}` : undefined },
      notes: { product: opts.productName, farmer: opts.farmerName },
      theme: { color: '#2d6a4f' },
      handler: (response: any) => resolve({ success: true, paymentId: response.razorpay_payment_id }),
      modal: { ondismiss: () => resolve({ success: false, error: 'Payment cancelled.' }) },
    })
    rz.open()
  })
}