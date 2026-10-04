import { supabase } from '../config/supabaseClient'

export interface UserActivity {
  id: string
  user_id: string | null
  user_name: string
  user_phone: string
  activity_type: 'login' | 'logout' | 'list_product' | 'place_order' | 'update_profile'
  description: string
  metadata?: any
  created_at: string
}

export async function logUserActivity(
  user: { id: string; name?: string; phone?: string; role?: string } | null,
  type: UserActivity['activity_type'],
  description: string,
  metadata?: any
): Promise<void> {
  if (!supabase || !user?.id || user.id.startsWith('demo-')) return
  const { error } = await supabase.from('user_activities').insert({
    user_id: user.id, activity_type: type, description, metadata: metadata ?? {},
  })
  if (error) console.warn('Activity log failed:', error.message)
}

export async function getUserActivities(): Promise<UserActivity[]> {
  if (!supabase) return []
  const { data, error } = await supabase
    .from('user_activities')
    .select('*, farmers(name, phone, role)')
    .order('created_at', { ascending: false })
    .limit(100)
  if (error) return []
  return (data ?? []).map((row: any) => ({
    id: row.id,
    user_id: row.user_id,
    user_name: row.farmers?.name || 'User',
    user_phone: row.farmers?.phone || '',
    activity_type: row.activity_type,
    description: row.description,
    metadata: row.metadata,
    created_at: row.created_at,
  }))
}