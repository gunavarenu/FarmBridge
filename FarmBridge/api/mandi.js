// Vercel serverless function — proxies data.gov.in Mandi API to avoid browser CORS
// This runs server-side so CORS is never an issue.
export default async function handler(req, res) {
  const { state, limit = '8' } = req.query
  const apiKey = process.env.DATA_GOV_KEY

  if (!apiKey) {
    res.status(500).json({ error: 'DATA_GOV_KEY not set in Vercel env vars' })
    return
  }

  const params = new URLSearchParams({
    format: 'json',
    limit: String(limit),
    'api-key': apiKey,
    ...(state ? { 'filters[State]': String(state) } : {}),
  })

  try {
    const upstream = await fetch(
      `https://api.data.gov.in/resource/9ef84268-d588-465a-a308-a864a43d0070?${params}`
    )
    const json = await upstream.json()
    // Cache response for 5 minutes on Vercel's edge
    res.setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate=600')
    res.status(upstream.status).json(json)
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch mandi prices' })
  }
}