import { useState } from 'react'
import { detectLocation } from '../services/locationService'
import type { GpsLocation } from '../services/locationService'

export function useLocation() {
  const [location, setLocation] = useState<GpsLocation | null>(null)
  const [loading,  setLoading]  = useState(false)
  const [error,    setError]    = useState('')

  const detect = async () => {
    setLoading(true)
    setError('')
    try {
      const loc = await detectLocation()
      setLocation(loc)
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setLoading(false)
    }
  }

  return { location, loading, error, detect }
}