import { createClient } from '@supabase/supabase-js'

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  try {
    // Parse event - Vercel pre-parses the body
    let event = req.body
    if (typeof event === 'string') {
      try { event = JSON.parse(event) } catch { return res.status(400).json({ error: 'Invalid JSON' }) }
    }

    if (!event?.type) return res.status(400).json({ error: 'Invalid event' })

    if (event.type === 'checkout.session.completed') {
      const session = event.data?.object
      const userId = session?.metadata?.userId
      const plan = session?.metadata?.plan

      if (!userId) return res.status(400).json({ error: 'No userId in metadata' })

      const supabaseUrl = 'https://skwjfzugcehgkxywmdxb.supabase.co'
      const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

      if (!serviceKey) return res.status(500).json({ error: 'Missing Supabase service key' })

      const supabase = createClient(supabaseUrl, serviceKey)

      const { error } = await supabase
        .from('profiles')
        .update({
          plan: 'pro',
          stripe_customer_id: session.customer || null,
          stripe_subscription_id: session.subscription || null,
          plan_period: plan === 'annual' ? 'annual' : 'monthly',
          plan_activated_at: new Date().toISOString(),
        })
        .eq('id', userId)

      if (error) return res.status(500).json({ error: error.message })
      return res.status(200).json({ received: true, userId, plan })
    }

    return res.status(200).json({ received: true, type: event.type })
  } catch (err) {
    return res.status(500).json({ error: err.message })
  }
}
