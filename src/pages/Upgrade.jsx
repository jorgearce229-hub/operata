import { useState } from 'react'
import { C } from '../lib/theme'

const PLANS = {
  mxn: [
    { id: 'monthly', name: 'Pro Mensual', price: '$139', period: 'MXN/mes', priceNote: 'Cancela cuando quieras', highlight: false },
    { id: 'annual', name: 'Pro Anual', price: '$1,049', period: 'MXN/año', priceNote: 'Equivale a $87/mes · Ahorras 37%', highlight: true, badge: 'MEJOR VALOR' },
  ],
  usd: [
    { id: 'monthly', name: 'Pro Mensual', price: '$7.99', period: 'USD/mes', priceNote: 'Cancela cuando quieras', highlight: false },
    { id: 'annual', name: 'Pro Anual', price: '$59.99', period: 'USD/año', priceNote: 'Equivale a $5/mes · Ahorras 37%', highlight: true, badge: 'MEJOR VALOR' },
  ],
}

const FEATURES = [
  { icon: '📊', text: 'Analytics completos — Win Rate, Expectancy, Drawdown' },
  { icon: '📅', text: 'Calendar Heatmap de P&L diario' },
  { icon: '📈', text: 'P&L mensual detallado' },
  { icon: '🔬', text: 'Backtesting ilimitado por instrumento' },
  { icon: '📥', text: 'Importar operaciones desde CSV' },
  { icon: '📤', text: 'Exportar datos a CSV (Excel compatible)' },
  { icon: '♾️', text: 'Operaciones ilimitadas' },
  { icon: '⚡', text: 'Acceso prioritario a nuevas funciones' },
]

export default function Upgrade({ session, onClose }) {
  const [loading, setLoading] = useState(null)
  const [error, setError] = useState(null)
  const [currency, setCurrency] = useState('mxn')
  const plans = PLANS[currency]

  const handleUpgrade = async (planId) => {
    setLoading(planId)
    setError(null)
    if (typeof window.fbq === 'function') window.fbq('track', 'InitiateCheckout', { content_name: planId })
    try {
      const res = await fetch('/api/create-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          plan: planId,
          userId: session.user.id,
          email: session.user.email,
          currency,
        }),
      })
      const data = await res.json()
      if (data.error) { setError(data.error); setLoading(null); return }
      window.location.href = data.url
    } catch (err) {
      setError('Error de conexión. Intenta de nuevo.')
      setLoading(null)
    }
  }

  return (
    <div style={{ minHeight: '100vh', background: C.bg, color: C.text, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '40px 20px' }}>
      <div style={{ maxWidth: '600px', width: '100%' }}>
        {/* Back button */}
        {onClose && (
          <button onClick={onClose} style={{ marginBottom: '24px', padding: '6px 12px', borderRadius: '8px', border: `1px solid ${C.border}`, background: 'transparent', color: C.muted, fontSize: '13px', cursor: 'pointer' }}>
            ← Volver
          </button>
        )}

        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <div style={{ fontSize: '28px', fontWeight: 800, color: C.accent, marginBottom: '8px' }}>Operata Pro</div>
          <div style={{ fontSize: '16px', color: C.muted }}>Desbloquea todo el potencial de tu diario de trading</div>
        </div>

        {/* Features */}
        <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: '12px', padding: '20px', marginBottom: '24px' }}>
          <div style={{ fontSize: '12px', fontWeight: 600, color: C.muted, textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: '14px' }}>Incluye todo esto:</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
            {FEATURES.map((f, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: C.muted }}>
                <span>{f.icon}</span><span>{f.text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Selector de moneda */}
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '20px' }}>
          <div style={{ display: 'flex', background: C.card, borderRadius: '10px', border: `1px solid ${C.border}`, padding: '3px' }}>
            {[{ v: 'mxn', l: '🇲🇽 MXN' }, { v: 'usd', l: '🌎 USD' }].map(c => (
              <button key={c.v} onClick={() => setCurrency(c.v)} style={{
                padding: '7px 16px', borderRadius: '8px', border: 'none', cursor: 'pointer', fontSize: '13px', fontWeight: 600,
                background: currency === c.v ? C.accent : 'transparent',
                color: currency === c.v ? C.bg : C.muted,
              }}>{c.l}</button>
            ))}
          </div>
        </div>
        <div style={{ textAlign: 'center', fontSize: '12px', color: C.dim, marginBottom: '20px' }}>
          {currency === 'mxn' ? 'Recomendado si tu tarjeta es de un banco mexicano' : 'Recomendado si tu tarjeta es de otro país'}
        </div>

        {/* Plans */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '20px' }}>
          {plans.map(p => (
            <div key={p.id} style={{
              padding: '24px', borderRadius: '14px', position: 'relative',
              background: p.highlight ? C.accentBg : C.card,
              border: `2px solid ${p.highlight ? C.accent : C.border}`,
            }}>
              {p.badge && (
                <div style={{ position: 'absolute', top: '-12px', left: '50%', transform: 'translateX(-50%)', background: C.accent, color: C.bg, padding: '3px 14px', borderRadius: '20px', fontSize: '10px', fontWeight: 700, whiteSpace: 'nowrap' }}>
                  {p.badge}
                </div>
              )}
              <div style={{ fontWeight: 700, fontSize: '15px', marginBottom: '8px' }}>{p.name}</div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '3px', marginBottom: '6px' }}>
                <span style={{ fontSize: '32px', fontWeight: 800, color: p.highlight ? C.accent : C.text }}>{p.price}</span>
                <span style={{ fontSize: '13px', color: C.muted }}>{p.period}</span>
              </div>
              <div style={{ fontSize: '11px', color: C.dim, marginBottom: '16px' }}>{p.priceNote}</div>
              <button
                onClick={() => handleUpgrade(p.id)}
                disabled={!!loading}
                style={{
                  width: '100%', padding: '11px', borderRadius: '9px', border: 'none',
                  background: p.highlight ? C.accent : C.border,
                  color: p.highlight ? C.bg : C.text,
                  fontWeight: 700, fontSize: '13px', cursor: loading ? 'not-allowed' : 'pointer',
                  opacity: loading && loading !== p.id ? 0.6 : 1,
                }}>
                {loading === p.id ? 'Redirigiendo...' : 'Elegir este plan'}
              </button>
            </div>
          ))}
        </div>

        {error && (
          <div style={{ padding: '12px', background: C.redBg, border: `1px solid ${C.red}30`, borderRadius: '8px', color: C.red, fontSize: '13px', marginBottom: '16px', textAlign: 'center' }}>
            {error}
          </div>
        )}

        {/* OXXO: pago único anual, sin tarjeta — solo aplica en MXN */}
        {currency === 'mxn' && (
          <div style={{ padding: '18px 20px', borderRadius: '12px', border: `1px dashed ${C.border}`, background: C.card, marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
            <div>
              <div style={{ fontWeight: 700, fontSize: '13px', marginBottom: '4px' }}>🛒 ¿Sin tarjeta? Paga en OXXO</div>
              <div style={{ fontSize: '12px', color: C.muted }}>$1,049 MXN · Pago único, acceso Pro por 1 año (sin renovación automática)</div>
            </div>
            <button
              onClick={() => handleUpgrade('annual_oxxo')}
              disabled={!!loading}
              style={{
                padding: '10px 18px', borderRadius: '9px', border: `1px solid ${C.border}`,
                background: 'transparent', color: C.text, fontWeight: 700, fontSize: '13px',
                cursor: loading ? 'not-allowed' : 'pointer', opacity: loading && loading !== 'annual_oxxo' ? 0.6 : 1, flexShrink: 0,
              }}>
              {loading === 'annual_oxxo' ? 'Redirigiendo...' : 'Pagar con OXXO'}
            </button>
          </div>
        )}

        <div style={{ textAlign: 'center', fontSize: '12px', color: C.dim }}>
          Pago seguro con Stripe · Cancela en cualquier momento · Sin permanencia
        </div>
      </div>
    </div>
  )
}
