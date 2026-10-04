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

/**
 * Logs an action performed by a user to both local storage (always) and Supabase (if online and configured).
 */
export async function logUserActivity(
  user: { id: string; name?: string; phone?: string; role?: string } | null,
  type: UserActivity['activity_type'],
  description: string,
  metadata?: any
): Promise<void> {
  const isDemoUser = !user?.id || user.id.startsWith('demo-') || user.id === 'demo-user'

  const activityData = {
    user_id: user?.id && !isDemoUser ? user.id : null,
    user_name: user?.name || 'Anonymous User',
    user_phone: user?.phone || 'Unknown Phone',
    activity_type: type,
    description: description,
    metadata: metadata || {},
    created_at: new Date().toISOString()
  }

  // 1. Always save to Local Storage for offline review / fallback
  try {
    const localData = localStorage.getItem('mockLocalActivities')
    const list = localData ? JSON.parse(localData) : []
    list.unshift({
      id: 'activity-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
      ...activityData
    })
    // Cap at 200 items to avoid bloated local storage
    localStorage.setItem('mockLocalActivities', JSON.stringify(list.slice(0, 200)))
  } catch (e) {
    console.error('Error saving activity to localStorage:', e)
  }

  // 2. Save to Supabase DB if it is a real registered user and database is connected
  if (supabase && user?.id && !isDemoUser) {
    try {
      const { error } = await supabase.from('user_activities').insert({
        user_id: user.id,
        activity_type: type,
        description: description,
        metadata: metadata || {}
      })
      if (error) {
        console.warn('Failed to insert user activity in Supabase:', error.message)
      }
    } catch (e) {
      console.warn('Supabase activity insertion warning:', e)
    }
  }
}

/**
 * Retrieves all user activities, combining Supabase DB data with local storage logs.
 */
export async function getUserActivities(): Promise<UserActivity[]> {
  let localList: UserActivity[] = []
  try {
    const localData = localStorage.getItem('mockLocalActivities')
    if (localData) localList = JSON.parse(localData)
  } catch (e) {
    console.error('Error loading local activities:', e)
  }

  if (!supabase || !navigator.onLine) {
    return localList
  }

  try {
    // Fetch from Supabase, joining farmers to get name/phone/role
    const { data, error } = await supabase
      .from('user_activities')
      .select('*, farmers(name, phone, role)')
      .order('created_at', { ascending: false })
      .limit(100)

    if (error) {
      console.warn('Failed to query user_activities table from Supabase:', error.message)
      return localList
    }

    const dbList: UserActivity[] = (data || []).map((row: any) => ({
      id: row.id,
      user_id: row.user_id,
      user_name: row.farmers?.name || 'User',
      user_phone: row.farmers?.phone || 'Unknown Phone',
      activity_type: row.activity_type,
      description: row.description,
      metadata: row.metadata,
      created_at: row.created_at
    }))

    // Merge both lists, preserving local mock/offline activities
    const merged = [...localList.filter(l => l.id.startsWith('activity-')), ...dbList]
    merged.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    return merged
  } catch (err) {
    console.error('Error in getUserActivities fetching from DB:', err)
    return localList
  }
}
