import { createClient } from '@supabase/supabase-js'

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const sig = req.headers['stripe-signature']
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET
  const stripeSecret = process.env.STRIPE_SECRET_KEY

  if (!sig || !webhookSecret) return res.status(400).json({ error: 'Missing signature or secret' })

  // Get raw body
  let rawBody
  if (typeof req.body === 'string') {
    rawBody = req.body
  } else {
    rawBody = JSON.stringify(req.body)
  }

  // Verify Stripe signature manually (no stripe SDK to keep it lightweight)
  const crypto = await import('crypto')
  
  try {
    const parts = sig.split(',')
    const timestamp = parts.find(p => p.startsWith('t=')).split('=')[1]
    const signatures = parts.filter(p => p.startsWith('v1=')).map(p => p.split('=')[1])
    
    const signedPayload = `${timestamp}.${rawBody}`
    const expectedSig = crypto.default
      .createHmac('sha256', webhookSecret)
      .update(signedPayload)
      .digest('hex')
    
    const isValid = signatures.some(s => s === expectedSig)
    if (!isValid) return res.status(400).json({ error: 'Invalid signature' })
    
    // Check timestamp (within 5 minutes)
    const diff = Math.abs(Date.now() / 1000 - parseInt(timestamp))
    if (diff > 300) return res.status(400).json({ error: 'Timestamp too old' })

  } catch (err) {
    return res.status(400).json({ error: `Signature error: ${err.message}` })
  }

  // Parse event
  let event
  try {
    event = typeof req.body === 'string' ? JSON.parse(req.body) : req.body
  } catch {
    return res.status(400).json({ error: 'Invalid JSON' })
  }

  // Handle checkout.session.completed
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object
    const userId = session.metadata?.userId
    const plan = session.metadata?.plan

    if (!userId) return res.status(400).json({ error: 'No userId in metadata' })

    try {
      const supabase = createClient(
        'https://skwjfzugcehgkxywmdxb.supabase.co',
        process.env.SUPABASE_SERVICE_ROLE_KEY
      )

      const { error } = await supabase
        .from('profiles')
        .update({
          plan: 'pro',
          stripe_customer_id: session.customer,
          stripe_subscription_id: session.subscription,
          plan_period: plan === 'annual' ? 'annual' : 'monthly',
          plan_activated_at: new Date().toISOString(),
        })
        .eq('id', userId)

      if (error) return res.status(500).json({ error: error.message })
      
      return res.status(200).json({ received: true, userId, plan })
    } catch (err) {
      return res.status(500).json({ error: err.message })
    }
  }

  return res.status(200).json({ received: true, type: event.type })
}
