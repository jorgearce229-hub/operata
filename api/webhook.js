import { createClient } from '@supabase/supabase-js'
import crypto from 'crypto'

const META_PIXEL_ID = '830808339964113'

// Envía el evento de "Purchase" a la API de Conversiones de Meta (del lado del servidor),
// para que los anuncios puedan optimizarse hacia gente que realmente paga, no solo hace clic.
// No debe interrumpir el webhook si falla — el pago y el acceso Pro ya se procesaron antes de esto.
async function sendMetaPurchaseEvent({ email, amount, currency, eventId, sourceUrl }) {
  const token = process.env.META_CAPI_TOKEN
  if (!token || !email) return

  const hashedEmail = crypto.createHash('sha256').update(email.trim().toLowerCase()).digest('hex')

  try {
    await fetch(`https://graph.facebook.com/v20.0/${META_PIXEL_ID}/events?access_token=${token}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        data: [{
          event_name: 'Purchase',
          event_time: Math.floor(Date.now() / 1000),
          event_id: eventId, // mismo id que se podría usar del lado del navegador, evita contar el evento dos veces
          action_source: 'website',
          event_source_url: sourceUrl,
          user_data: { em: [hashedEmail] },
          custom_data: { currency: (currency || 'mxn').toUpperCase(), value: amount },
        }],
      }),
    })
  } catch {
    // Falla silenciosa: no queremos que un problema con Meta afecte la activación del plan Pro del usuario.
  }
}

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
      const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ''
      const supabase = createClient(supabaseUrl, serviceKey)

      // Los pagos en modo 'payment' (ej. OXXO anual) no tienen suscripción de Stripe que se renueve sola,
      // así que les asignamos una fecha de expiración manual (1 año). Los pagos en modo 'subscription'
      // (tarjeta) se renuevan automáticamente en Stripe, por lo que no necesitan esta fecha.
      const isOneTime = session.mode === 'payment'
      const proExpiresAt = isOneTime
        ? new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString()
        : null

      const { error } = await supabase
        .from('profiles')
        .update({
          plan: 'pro',
          stripe_customer_id: session.customer || null,
          stripe_subscription_id: session.subscription || null,
          plan_period: plan === 'annual' || plan === 'annual_oxxo' ? 'annual' : 'monthly',
          plan_activated_at: new Date().toISOString(),
          pro_expires_at: proExpiresAt,
        })
        .eq('id', userId)

      if (error) return res.status(500).json({ error: error.message })

      // Enviar el evento de Purchase a Meta (no bloquea la respuesta si falla)
      await sendMetaPurchaseEvent({
        email: session.customer_email || session.customer_details?.email,
        amount: (session.amount_total || 0) / 100,
        currency: session.currency,
        eventId: session.id,
        sourceUrl: 'https://www.operata.tech/upgrade',
      })

      // Programa de referidos: si este usuario vino de un link de referido y es la primera
      // vez que se convierte en Pro, le damos 30 días de bono a él y a quien lo invitó.
      const { data: profile } = await supabase
        .from('profiles')
        .select('referred_by, referral_rewarded, bonus_pro_until')
        .eq('id', userId)
        .single()

      if (profile?.referred_by && !profile?.referral_rewarded) {
        const THIRTY_DAYS = 30 * 24 * 60 * 60 * 1000
        const extendBonus = (current) => {
          const base = current && new Date(current) > new Date() ? new Date(current) : new Date()
          return new Date(base.getTime() + THIRTY_DAYS).toISOString()
        }

        // Bono para el referido (quien acaba de pagar)
        await supabase.from('profiles')
          .update({ bonus_pro_until: extendBonus(profile.bonus_pro_until), referral_rewarded: true })
          .eq('id', userId)

        // Bono para quien lo invitó
        const { data: referrer } = await supabase
          .from('profiles').select('bonus_pro_until').eq('id', profile.referred_by).single()
        if (referrer) {
          await supabase.from('profiles')
            .update({ bonus_pro_until: extendBonus(referrer.bonus_pro_until) })
            .eq('id', profile.referred_by)
        }
      }

      return res.status(200).json({ received: true, userId, plan })
    }

    return res.status(200).json({ received: true, type: event.type })
  } catch (err) {
    return res.status(500).json({ error: err.message })
  }
}
