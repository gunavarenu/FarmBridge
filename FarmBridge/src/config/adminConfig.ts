// Admin / Founder configuration
// The ADMIN_PHONE below identifies the founder of FarmBridge.
// When this number logs in, the special admin dashboard is shown.
export const ADMIN_PHONE = import.meta.env.VITE_ADMIN_PHONE ?? '8080218122'

export function isAdminPhone(phone: string): boolean {
  // Strip any country code and match just 10 digits
  const digits = phone.replace(/\D/g, '')
  const adminDigits = ADMIN_PHONE.replace(/\D/g, '')
  return digits.endsWith(adminDigits) || adminDigits.endsWith(digits)
}
