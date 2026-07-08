const REASON_LABELS = {
  too_expensive: 'Es muy caro para lo que ofrece',
  not_used: 'No lo usó lo suficiente',
  found_alternative: 'Encontró otra herramienta que prefiere',
  missing_features: 'Le faltan funciones que necesita',
  technical_issues: 'Tuvo problemas técnicos o errores',
  other: 'Otro',
}

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

  const { subscriptionId, reason, otherText, userEmail } = body
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

    // Enviar notificación por correo del motivo de cancelación (best-effort, no bloquea la respuesta si falla)
    const RESEND_KEY = process.env.RESEND_API_KEY
    if (RESEND_KEY && reason) {
      fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${RESEND_KEY}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          from: 'Operata <hola@operata.tech>',
          to: ['operata.soporte@gmail.com'],
          subject: `[Operata] Cancelación de suscripción — ${userEmail || 'usuario'}`,
          html: `
            <h2>Un usuario canceló su suscripción Pro</h2>
            <p><b>Usuario:</b> ${userEmail || 'No disponible'}</p>
            <p><b>Motivo:</b> ${REASON_LABELS[reason] || reason}</p>
            ${otherText ? `<p><b>Comentario:</b> ${otherText.replace(/\n/g, '<br/>')}</p>` : ''}
            <p><b>Pro activo hasta:</b> ${periodEnd}</p>
          `
        })
      }).catch(() => {}) // no interrumpe el flujo de cancelación si el correo falla
    }

    return res.status(200).json({ success: true, periodEnd })
  } catch (err) {
    return res.status(500).json({ error: err.message })
  }
}
