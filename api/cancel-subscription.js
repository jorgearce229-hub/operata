export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
  if (req.method === 'OPTIONS') return res.status(200).end()
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const STRIPE_SECRET = process.env.STRIPE_SECRET_KEY
  if (!STRIPE_SECRET) return res.status(500).json({ error: 'Stripe not configured' })

  let body = req.body
  if (typeof body === 'string') { try { body = JSON.parse(body) } catch { body = {} } }

  const { subscriptionId } = body
  if (!subscriptionId) return res.status(400).json({ error: 'Missing subscriptionId' })

  try {
    // Cancel at period end - user keeps Pro until billing period ends
    const response = await fetch(`https://api.stripe.com/v1/subscriptions/${subscriptionId}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${STRIPE_SECRET}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({ 'cancel_at_period_end': 'true' }).toString()
    })

    const data = await response.json()
    if (!response.ok) return res.status(400).json({ error: data.error?.message || 'Error al cancelar' })

    const periodEnd = new Date(data.current_period_end * 1000).toLocaleDateString('es-MX', {
      day: 'numeric', month: 'long', year: 'numeric'
    })

    return res.status(200).json({ success: true, periodEnd })
  } catch (err) {
    return res.status(500).json({ error: err.message })
  }
}
