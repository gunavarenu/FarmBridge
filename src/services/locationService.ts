export interface GpsLocation {
  lat: number
  lng: number
  village: string
  district: string
  state: string
  label: string
}

export async function detectLocation(): Promise<GpsLocation> {
  const coords = await getCoords()
  return reverseGeocode(coords.latitude, coords.longitude)
}

function getCoords(): Promise<GeolocationCoordinates> {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) { reject(new Error('Geolocation not supported by your browser.')); return }
    navigator.geolocation.getCurrentPosition(
      pos => resolve(pos.coords),
      err => {
        if (err.code === err.PERMISSION_DENIED) reject(new Error('Location access denied. Enable it in browser settings.'))
        else if (err.code === err.POSITION_UNAVAILABLE) reject(new Error('Location unavailable. Check GPS or network.'))
        else reject(new Error('Location request timed out. Try again.'))
      },
      { timeout: 10000, maximumAge: 60000, enableHighAccuracy: true }
    )
  })
}

async function reverseGeocode(lat: number, lng: number): Promise<GpsLocation> {
  const url = `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&addressdetails=1&accept-language=en`
  const res = await fetch(url, {
    headers: { 'User-Agent': 'FarmBridge/1.0' },
    signal: AbortSignal.timeout(8000),
  })
  if (!res.ok) throw new Error('Could not detect location. Enter manually.')
  const data = await res.json()
  const addr = data.address ?? {}
  const village  = addr.village || addr.town || addr.suburb || ''
  const district = addr.county  || addr.district || addr.city || ''
  const state    = addr.state   || ''
  const label    = [village, district, state].filter(Boolean).join(', ') || data.display_name
  return { lat, lng, village, district, state, label }
}