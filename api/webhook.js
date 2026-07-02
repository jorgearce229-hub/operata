import { createClient } from '@supabase/supabase-js'
import crypto from 'crypto'

export const config = {
  api: { bodyParser: false }
}

async function getRawBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = []
    req.on('data', chunk => chunks.push(chunk))
    req.on('end', () => resolve(Buffer.concat(chunks)))
    req.on('error', reject)
  })
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const sig = req.headers['stripe-signature']
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET

  if (!sig || !webhookSecret) return res.status(400).json({ error: 'Missing signature or secret' })

  let rawBody
  try {
    rawBody = await getRawBody(req)
  } catch (err) {
    return res.status(400).json({ error: 'Could not read body' })
  }

  // Verify Stripe signature
  try {
    const parts = sig.split(',')
    const timestamp = parts.find(p => p.startsWith('t=')).split('=')[1]
    const signatures = parts.filter(p => p.startsWith('v1=')).map(p => p.split('=')[1])
    const signedPayload = `${timestamp}.${rawBody.toString()}`
    const expectedSig = crypto.createHmac('sha256', webhookSecret).update(signedPayload).digest('hex')
    const isValid = signatures.some(s => s === expectedSig)
    if (!isValid) return res.status(400).json({ error: 'Invalid signature' })
    const diff = Math.abs(Date.now() / 1000 - parseInt(timestamp))
    if (diff > 300) return res.status(400).json({ error: 'Timestamp too old' })
  } catch (err) {
    return res.status(400).json({ error: `Signature error: ${err.message}` })
  }

  let event
  try {
    event = JSON.parse(rawBody.toString())
  } catch {
    return res.status(400).json({ error: 'Invalid JSON' })
  }

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
      return res.status(200).json({ received: true })
    } catch (err) {
      return res.status(500).json({ error: err.message })
    }
  }

  return res.status(200).json({ received: true, type: event.type })
}
