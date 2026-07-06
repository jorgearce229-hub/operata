export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
  if (req.method === 'OPTIONS') return res.status(200).end()
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const RESEND_KEY = process.env.RESEND_API_KEY
  if (!RESEND_KEY) return res.status(500).json({ error: 'Email service not configured' })

  let body = req.body
  if (typeof body === 'string') { try { body = JSON.parse(body) } catch { body = {} } }

  const { name, email, subject, message } = body
  if (!email || !message) return res.status(400).json({ error: 'Email y mensaje son requeridos' })

  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${RESEND_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from: 'Operata <hola@operata.tech>',
        to: ['operata.soporte@gmail.com'],
        reply_to: email,
        subject: `[Operata] ${subject || 'Mensaje de contacto'} — ${name || email}`,
        html: `
          <h2>Nuevo mensaje desde Operata</h2>
          <p><b>Nombre:</b> ${name || 'No proporcionado'}</p>
          <p><b>Email:</b> ${email}</p>
          <p><b>Asunto:</b> ${subject || 'Sin asunto'}</p>
          <hr/>
          <p><b>Mensaje:</b></p>
          <p>${message.replace(/\n/g, '<br/>')}</p>
        `
      })
    })
    const data = await response.json()
    if (!response.ok) return res.status(400).json({ error: data.message || 'Error al enviar' })
    return res.status(200).json({ success: true })
  } catch (err) {
    return res.status(500).json({ error: err.message })
  }
}
