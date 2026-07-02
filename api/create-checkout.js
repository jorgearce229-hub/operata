export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')

  if (req.method === 'OPTIONS') return res.status(200).end()
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const STRIPE_SECRET = process.env.STRIPE_SECRET_KEY
  if (!STRIPE_SECRET) return res.status(500).json({ error: 'Stripe not configured' })

  const PRICE_IDS = {
    monthly: 'price_1TobP4KLLoXtV6JQQl2M6FHz',
    annual:  'price_1TobQBKLLoXtV6JQOjwgEoid',
  }

  try {
    // Handle both string and already-parsed body
    let body = req.body
    if (typeof body === 'string') {
      try { body = JSON.parse(body) } catch { body = {} }
    }
    if (!body || typeof body !== 'object') body = {}

    const { plan, userId, email } = body
    const priceId = PRICE_IDS[plan]
    if (!priceId) return res.status(400).json({ error: `Invalid plan: ${plan}` })

    const origin = req.headers.origin || 'https://operata-pi.vercel.app'

    const params = new URLSearchParams({
      'payment_method_types[]': 'card',
      'line_items[0][price]': priceId,
      'line_items[0][quantity]': '1',
      'mode': 'subscription',
      'success_url': `${origin}/?upgrade=success`,
      'cancel_url': `${origin}/?upgrade=cancelled`,
      'metadata[userId]': userId || '',
      'metadata[plan]': plan || '',
    })
    if (email) params.append('customer_email', email)

    const response = await fetch('https://api.stripe.com/v1/checkout/sessions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${STRIPE_SECRET}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: params.toString(),
    })

    const session = await response.json()
    if (session.error) return res.status(400).json({ error: session.error.message })
    if (!session.url) return res.status(500).json({ error: 'No checkout URL from Stripe', session })
    
    return res.status(200).json({ url: session.url })
  } catch (error) {
    return res.status(500).json({ error: error.message })
  }
}
