import { supabase } from '../config/supabaseClient'
import { isAdminPhone } from '../config/adminConfig'
import type { AuthUser } from '../types'

const OTP_API = import.meta.env.VITE_OTP_API_URL as string

export interface FarmerProfileData {
  id: string
  name: string
  phone: string
  village: string
  taluka: string
  district: string
  state: string
  birthDate: string
  verified: boolean
  avatarUrl: string
  bio: string
  farmSizeAcres: number
  experience: number
  role: 'farmer' | 'buyer' | 'founder'
}

export async function requestOtp(phone: string): Promise<{ error?: string }> {
  const e164 = toE164(phone)
  if (!e164) return { error: 'Enter a valid 10-digit Indian mobile number.' }
  
  if (!OTP_API) {
    console.log(`[DEV OTP] Mocking OTP send to ${e164}. Verification code is: 123456`)
    return {}
  }

  try {
    const res = await fetch(`${OTP_API}/send`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone: e164 }),
    })
    if (!res.ok) return { error: 'Failed to send OTP. Try again.' }
    return {}
  } catch {
    return { error: 'Network error. Check your connection.' }
  }
}

export async function confirmOtp(
  phone: string, 
  code: string,
  registerProfile?: {
    name: string
    role: 'farmer' | 'buyer'
    village: string
    taluka: string
    district: string
    state: string
    birthDate: string
  }
): Promise<{ user?: AuthUser; error?: string }> {
  const e164 = toE164(phone)
  if (!e164) return { error: 'Invalid phone number.' }

  const isFounder = isAdminPhone(phone)

  if (!OTP_API) {
    if (code !== '123456') {
      return { error: 'Incorrect OTP. Use 123456 in demo mode.' }
    }
    
    const resolvedRole = isFounder ? 'founder' : (registerProfile?.role ?? 'farmer')
    const resolvedName = registerProfile?.name ?? (isFounder ? 'Siddhesh Patil (Founder)' : '')

    // Try to persist to Supabase, but fall back gracefully if unavailable
    if (supabase) {
      try {
        const fakeEmail = `${e164.replace('+', '')}@farmbridge.local`
        const fakePassword = 'FarmPassword123!'
        
        let { data, error } = await supabase.auth.signInWithPassword({
          email: fakeEmail,
          password: fakePassword,
        })
        
        if (error && (error.message.includes('Invalid login credentials') || error.message.includes('Email not confirmed'))) {
          const signUpRes = await supabase.auth.signUp({
            email: fakeEmail,
            password: fakePassword,
          })
          data = signUpRes.data as any
          error = signUpRes.error
        }

        if (!error && data?.user) {
          const userId = data.user.id
          
          await supabase.from('farmers').upsert(
            { 
              id: userId, 
              name: resolvedName,
              phone: e164, 
              village: registerProfile?.village ?? (isFounder ? 'Pune' : ''),
              taluka: registerProfile?.taluka ?? '',
              district: registerProfile?.district ?? (isFounder ? 'Pune' : ''),
              state: registerProfile?.state ?? 'Maharashtra',
              birth_date: registerProfile?.birthDate || null,
              bio: isFounder 
                ? 'Founder & CEO of FarmBridge — connecting farmers directly with buyers.' 
                : (resolvedRole === 'buyer' ? 'Buyer / Merchant profile' : ''),
              farm_size_acres: 0,
              experience: 0,
              avatar_url: isFounder ? '👑' : (resolvedRole === 'buyer' ? '🏪' : '👨‍🌾'),
              role: resolvedRole
            },
            { onConflict: 'id', ignoreDuplicates: false }
          ).then(({ error: upsertErr }) => {
            if (upsertErr) console.warn('Profile upsert warning:', upsertErr.message)
          })

          return { 
            user: { 
              id: userId, 
              phone: e164, 
              name: resolvedName,
              role: resolvedRole
            } 
          }
        }
      } catch (networkErr) {
        // Supabase unreachable (e.g. wrong key version, CORS, offline) — fall through to demo user
        console.warn('[FarmBridge] Supabase unreachable, using local demo session:', (networkErr as Error).message)
      }
    }

    // Demo / offline fallback — always succeeds
    return { 
      user: { 
        id: 'demo-' + Date.now(), 
        phone: e164, 
        name: resolvedName,
        role: resolvedRole
      } 
    }
  }

  try {
    const res = await fetch(`${OTP_API}/verify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone: e164, code }),
    })
    const body = await res.json()
    if (!res.ok || !body.valid) return { error: 'Incorrect OTP. Please try again.' }

    if (supabase) {
      const fakeEmail = `${e164.replace('+', '')}@farmbridge.local`
      const fakePassword = 'FarmPassword123!'
      
      let { data, error } = await supabase.auth.signInWithPassword({
        email: fakeEmail,
        password: fakePassword,
      })
      
      if (error && error.message.includes('Invalid login credentials')) {
        const signUpRes = await supabase.auth.signUp({
          email: fakeEmail,
          password: fakePassword,
        })
        data = signUpRes.data as any
        error = signUpRes.error
      }

      if (error) return { error: error.message }
      const userId = data.user!.id

      const resolvedRole = isFounder ? 'founder' : (registerProfile?.role ?? 'farmer')
      
      await supabase.from('farmers').upsert(
        { 
          id: userId, 
          name: registerProfile?.name ?? (isFounder ? 'Siddhesh Patil (Founder)' : ''), 
          phone: e164, 
          village: registerProfile?.village ?? '', 
          taluka: registerProfile?.taluka ?? '',
          district: registerProfile?.district ?? '', 
          state: registerProfile?.state ?? 'Maharashtra',
          birth_date: registerProfile?.birthDate || null,
          role: resolvedRole,
          avatar_url: isFounder ? '👑' : (resolvedRole === 'buyer' ? '🏪' : '👨‍🌾')
        },
        { onConflict: 'id', ignoreDuplicates: false }
      )
      return { user: { id: userId, phone: e164, name: registerProfile?.name ?? '', role: resolvedRole } }
    }

    const resolvedRole = isFounder ? 'founder' : (registerProfile?.role ?? 'farmer')
    return { user: { id: 'demo-' + Date.now(), phone: e164, name: registerProfile?.name ?? '', role: resolvedRole } }
  } catch {
    return { error: 'Network error. Try again.' }
  }
}

export async function signOut(): Promise<void> {
  if (supabase) await supabase.auth.signOut()
}

export async function signInWithGoogle(): Promise<{ error?: string }> {
  if (!supabase) return { error: 'Database not initialized.' }
  try {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin
      }
    })
    if (error) return { error: error.message }
    return {}
  } catch (err) {
    return { error: 'Failed to start Google login' }
  }
}

export async function getCurrentUser(): Promise<AuthUser | null> {
  if (!supabase) return null
  try {
    const { data } = await supabase.auth.getUser()
    if (!data.user) return null

    let { data: farmer, error } = await supabase
      .from('farmers')
      .select('name, phone, role')
      .eq('id', data.user.id)
      .single()
      
    // If user exists in Auth but not in farmers table (e.g. Google Sign in)
    if (error && error.code === 'PGRST116') {
      const email = data.user.email || ''
      const name = data.user.user_metadata?.full_name || email.split('@')[0] || 'User'
      
      await supabase.from('farmers').upsert({
        id: data.user.id,
        name: name,
        role: 'farmer'
      })
      
      farmer = { name, phone: '', role: 'farmer' }
    }

    return { 
      id: data.user.id, 
      phone: data.user.phone ?? farmer?.phone ?? '',
      name: farmer?.name ?? '',
      role: farmer?.role as any
    }
  } catch (err) {
    console.error('Error in getCurrentUser:', err)
    return null
  }
}

export async function getFarmerProfile(id: string): Promise<FarmerProfileData | null> {
  if (!supabase) return null
  try {
    const { data, error } = await supabase
      .from('farmers')
      .select('*')
      .eq('id', id)
      .single()

    if (error || !data) return null

    return {
      id: data.id,
      name: data.name || '',
      phone: data.phone || '',
      village: data.village || '',
      taluka: data.taluka || '',
      district: data.district || '',
      state: data.state || 'Maharashtra',
      birthDate: data.birth_date || '',
      verified: !!data.verified,
      avatarUrl: data.avatar_url || '👨‍🌾',
      bio: data.bio || '',
      farmSizeAcres: Number(data.farm_size_acres || 0),
      experience: Number(data.experience || 0),
      role: data.role || 'farmer'
    }
  } catch (err) {
    console.error('Error in getFarmerProfile:', err)
    return null
  }
}

export async function updateFarmerProfile(profile: Partial<FarmerProfileData> & { id: string }): Promise<{ success: boolean; error?: string }> {
  if (!supabase) return { success: false, error: 'Database client not initialized' }
  try {
    const updateData: Record<string, any> = {}
    if (profile.name !== undefined) updateData.name = profile.name
    if (profile.village !== undefined) updateData.village = profile.village
    if (profile.district !== undefined) updateData.district = profile.district
    if (profile.state !== undefined) updateData.state = profile.state
    if (profile.avatarUrl !== undefined) updateData.avatar_url = profile.avatarUrl
    if (profile.bio !== undefined) updateData.bio = profile.bio
    if (profile.farmSizeAcres !== undefined) updateData.farm_size_acres = profile.farmSizeAcres
    if (profile.experience !== undefined) updateData.experience = profile.experience
    if (profile.role !== undefined) updateData.role = profile.role

    const { error } = await supabase
      .from('farmers')
      .update(updateData)
      .eq('id', profile.id)

    if (error) {
      console.error('Supabase profile update error:', error)
      return { success: false, error: error.message }
    }

    return { success: true }
  } catch (err) {
    console.error('Error in updateFarmerProfile:', err)
    return { success: false, error: (err as Error).message }
  }
}

function toE164(raw: string): string | null {
  const digits = raw.replace(/\D/g, '')
  if (digits.length === 10 && /^[6-9]/.test(digits)) return `+91${digits}`
  if (digits.length === 12 && digits.startsWith('91')) return `+${digits}`
  return null
}