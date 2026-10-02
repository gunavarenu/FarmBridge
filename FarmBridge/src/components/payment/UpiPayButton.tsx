import { useState } from 'react'
import { createRazorpayOrder, openUpiCheckout } from '../../services/paymentService'
import type { Language } from '../../types'

interface Props {
  amountRs: number; productName: string; farmerName: string
  orderId: string; buyerPhone?: string; buyerName?: string
  lang: Language
  onSuccess: (paymentId: string) => void
  onError?: (msg: string) => void
}

export default function UpiPayButton({ amountRs, productName, farmerName, orderId, buyerPhone, buyerName, lang, onSuccess, onError }: Props) {
  const [loading, setLoading] = useState(false)
  const label = lang === 'en' ? `Pay ₹${amountRs} via UPI` : lang === 'hi' ? `₹${amountRs} UPI से भुगतान करें` : `₹${amountRs} UPI ने पेमेंट करा`

  async function handlePay() {
    setLoading(true)
    try {
      const rzpOrderId = await createRazorpayOrder(amountRs, { db_order_id: orderId, product_name: productName, farmer_name: farmerName })
      const result = await openUpiCheckout({ productName, amountRs, farmerName, buyerPhone, buyerName, orderId: rzpOrderId })
      if (result.success && result.paymentId) onSuccess(result.paymentId)
      else if (result.error) onError?.(result.error)
    } catch (err) {
      onError?.((err as Error).message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="upi-pay-wrap">
      <button className="btn-upi-pay" onClick={handlePay} disabled={loading}>
        {loading ? <><span className="btn-spinner" /> Opening payment…</> : <>💳 {label}</>}
      </button>
      <p className="upi-methods">PhonePe · GPay · Paytm · BHIM</p>
    </div>
  )
}