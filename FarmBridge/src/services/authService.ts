import { supabase } from '../config/supabaseClient'
import type { AuthUser } from '../types'


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
  if (!supabase) return { error: 'Service unavailable. Try again later.' }
  const { error } = await supabase.auth.signInWithOtp({ phone: e164 })
  return error ? { error: 'Failed to send OTP. Try again.' } : {}
}

export async function confirmOtp(
  phone: string,
  code: string
): Promise<{ user?: AuthUser; needsProfile?: boolean; error?: string }> {
  const e164 = toE164(phone)
  if (!e164) return { error: 'Invalid phone number.' }
  if (!supabase) return { error: 'Service unavailable. Try again later.' }
  const { data, error } = await supabase.auth.verifyOtp({ phone: e164, token: code, type: 'sms' })
  if (error || !data.user) return { error: 'Incorrect or expired OTP.' }
  const { data: farmer } = await supabase
    .from('farmers').select('name, role').eq('id', data.user.id).maybeSingle()
  return {
    user: { id: data.user.id, phone: e164, name: farmer?.name ?? '', role: (farmer?.role ?? 'farmer') as AuthUser['role'] },
    needsProfile: !farmer?.name,
  }
}

export async function saveProfile(
  phone: string,
  p: { name: string; role: 'farmer' | 'buyer'; village: string; taluka: string; district: string; state: string }
): Promise<{ user?: AuthUser; error?: string }> {
  const e164 = toE164(phone)
  if (!e164 || !supabase) return { error: 'Service unavailable.' }
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Session expired. Please log in again.' }
  const { error } = await supabase.from('farmers').upsert({
    id: user.id, name: p.name, phone: e164, village: p.village, taluka: p.taluka,
    district: p.district, state: p.state, role: p.role,
    avatar_url: p.role === 'buyer' ? '🏪' : '👨‍🌾',
    consent_at: new Date().toISOString(), consent_version: '2026-10-v1',
  }, { onConflict: 'id' })
  if (error) return { error: error.message }
  return { user: { id: user.id, phone: e164, name: p.name, role: p.role } }
}

export async function deleteMyAccount(): Promise<{ error?: string }> {
  if (!supabase) return { error: 'Service unavailable.' }
  const { error } = await supabase.functions.invoke('delete-account')
  if (error) return { error: error.message }
  await supabase.auth.signOut()
  return {}
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
      phone: farmer?.phone || (data.user.phone ? '+' + data.user.phone : ''),      name: farmer?.name ?? '',
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