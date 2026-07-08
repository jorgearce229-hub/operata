import { createClient } from '@supabase/supabase-js'

// Este endpoint lo dispara un Cron Job de Vercel (ver vercel.json) una vez por semana.
// Manda un resumen de la semana a cada usuario que haya registrado al menos 1 operación
// en los últimos 7 días (a los que no operaron no les mandamos nada, para no ser spam).
export default async function handler(req, res) {
  // Protegemos el endpoint: solo Vercel Cron (con el secreto correcto) puede dispararlo.
  const authHeader = req.headers['authorization']
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return res.status(401).json({ error: 'Unauthorized' })
  }

  const supabaseUrl = 'https://skwjfzugcehgkxywmdxb.supabase.co'
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ''
  const supabase = createClient(supabaseUrl, serviceKey)
  const RESEND_KEY = process.env.RESEND_API_KEY

  try {
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()

    const { data: profiles, error: profilesError } = await supabase
      .from('profiles').select('id, email, full_name')
    if (profilesError) return res.status(500).json({ error: profilesError.message })

    let sent = 0
    let skipped = 0

    for (const profile of profiles || []) {
      if (!profile.email) { skipped++; continue }

      const { data: trades } = await supabase
        .from('trades')
        .select('pnl, result, entry_date')
        .eq('user_id', profile.id)
        .gte('entry_date', sevenDaysAgo.slice(0, 10))

      if (!trades || trades.length === 0) { skipped++; continue }

      const totalPnl = trades.reduce((s, t) => s + (t.pnl || 0), 0)
      const withResult = trades.filter(t => t.result === 'TP' || t.result === 'SL')
      const wins = withResult.filter(t => t.result === 'TP').length
      const winRate = withResult.length > 0 ? Math.round((wins / withResult.length) * 100) : null
      const pnlColor = totalPnl >= 0 ? '#16E0AC' : '#F2484C'
      const pnlSign = totalPnl >= 0 ? '+' : ''
      const firstName = (profile.full_name || '').split(' ')[0] || ''

      if (!RESEND_KEY) continue

      await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${RESEND_KEY}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          from: 'Operata <hola@operata.tech>',
          to: [profile.email],
          subject: `Tu resumen semanal: ${trades.length} operaciones · ${pnlSign}$${totalPnl.toFixed(2)}`,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto;">
              <h2 style="color: #0B2E4A;">Hola${firstName ? ' ' + firstName : ''} 👋</h2>
              <p style="color: #52514E; font-size: 14px;">Así te fue esta semana en Operata:</p>
              <div style="display: flex; gap: 12px; margin: 20px 0;">
                <table width="100%" cellpadding="0" cellspacing="0">
                  <tr>
                    <td style="padding: 16px; background: #F5F5F0; border-radius: 10px; text-align: center;">
                      <div style="font-size: 12px; color: #9C9A92;">OPERACIONES</div>
                      <div style="font-size: 24px; font-weight: bold; color: #0B0B0B;">${trades.length}</div>
                    </td>
                    <td style="width: 12px;"></td>
                    <td style="padding: 16px; background: #F5F5F0; border-radius: 10px; text-align: center;">
                      <div style="font-size: 12px; color: #9C9A92;">P&amp;L</div>
                      <div style="font-size: 24px; font-weight: bold; color: ${pnlColor};">${pnlSign}$${totalPnl.toFixed(2)}</div>
                    </td>
                    ${winRate !== null ? `
                    <td style="width: 12px;"></td>
                    <td style="padding: 16px; background: #F5F5F0; border-radius: 10px; text-align: center;">
                      <div style="font-size: 12px; color: #9C9A92;">WIN RATE</div>
                      <div style="font-size: 24px; font-weight: bold; color: #0B0B0B;">${winRate}%</div>
                    </td>` : ''}
                  </tr>
                </table>
              </div>
              <a href="https://www.operata.tech" style="display: inline-block; padding: 12px 24px; background: #16E0AC; color: #053B2C; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 14px;">Ver mi Analytics completo →</a>
              <p style="color: #9C9A92; font-size: 12px; margin-top: 24px;">Operata · Opera con datos, no con intuición</p>
            </div>
          `
        })
      })
      sent++
    }

    return res.status(200).json({ sent, skipped, total: (profiles || []).length })
  } catch (err) {
    return res.status(500).json({ error: err.message })
  }
}
