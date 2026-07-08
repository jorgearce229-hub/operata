export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')

  if (req.method === 'OPTIONS') return res.status(200).end()
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const STRIPE_SECRET = process.env.STRIPE_SECRET_KEY
  if (!STRIPE_SECRET) return res.status(500).json({ error: 'Stripe not configured' })

  const PRICE_IDS = {
    mxn: {
      monthly: 'price_1TqnZSKakgJrAyl3nRMDnyGe',
      annual:  'price_1TqnYhKakgJrAyl3DEgpKSkN',
    },
    usd: {
      monthly: 'price_1TpNgUKakgJrAyl33oRMa8ue',
      annual:  'price_1TpNh1KakgJrAyl39OVbedaG',
    },
  }

  try {
    // Handle both string and already-parsed body
    let body = req.body
    if (typeof body === 'string') {
      try { body = JSON.parse(body) } catch { body = {} }
    }
    if (!body || typeof body !== 'object') body = {}

    const { plan, userId, email } = body
    // OXXO siempre es MXN (es un método exclusivamente mexicano), así que no aplica moneda seleccionable ahí.
    const currency = body.currency === 'usd' ? 'usd' : 'mxn'

    // 'annual_oxxo' es un pago único (no suscripción) porque OXXO no admite cobros recurrentes en Stripe.
    // Usamos price_data dinámico en lugar de un Price ID guardado, ya que es un modo de pago distinto (payment, no subscription).
    const isOxxo = plan === 'annual_oxxo'
    const priceId = PRICE_IDS[currency]?.[plan]
    if (!isOxxo && !priceId) return res.status(400).json({ error: `Invalid plan: ${plan}` })

    const origin = req.headers.origin || 'https://operata.tech'

    const params = new URLSearchParams({
      'success_url': `${origin}/?upgrade=success`,
      'cancel_url': `${origin}/?upgrade=cancelled`,
      'metadata[userId]': userId || '',
      'metadata[plan]': plan || '',
      'metadata[currency]': isOxxo ? 'mxn' : currency,
    })

    if (isOxxo) {
      params.append('payment_method_types[]', 'card')
      params.append('payment_method_types[]', 'oxxo')
      params.append('mode', 'payment')
      params.append('line_items[0][price_data][currency]', 'mxn')
      params.append('line_items[0][price_data][product_data][name]', 'Operata Pro Anual (pago único)')
      params.append('line_items[0][price_data][unit_amount]', '104900') // $1,049.00 MXN en centavos
      params.append('line_items[0][quantity]', '1')
      params.append('payment_method_options[oxxo][expires_after_days]', '3')
    } else {
      params.append('payment_method_types[]', 'card')
      params.append('line_items[0][price]', priceId)
      params.append('line_items[0][quantity]', '1')
      params.append('mode', 'subscription')
    }

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
