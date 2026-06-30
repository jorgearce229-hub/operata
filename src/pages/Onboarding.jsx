import { useState } from 'react'
import { supabase } from '../lib/supabase'
import { C, btn } from '../lib/theme'

const FOCUSES = [
  { id: 'forex', label: 'Forex', icon: '💱', desc: 'EUR/USD, GBP/JPY, USD/JPY...' },
  { id: 'stocks', label: 'Acciones', icon: '📈', desc: 'Apple, Tesla, S&P 500...' },
  { id: 'crypto', label: 'Criptomonedas', icon: '₿', desc: 'Bitcoin, Ethereum...' },
  { id: 'futures', label: 'Futuros', icon: '⚡', desc: 'ES, NQ, Petróleo...' },
  { id: 'universal', label: 'Universal', icon: '🌍', desc: 'Varios mercados' },
]

export default function Onboarding({ userId, onComplete }) {
  const [focus, setFocus] = useState('')
  const [language, setLanguage] = useState('es')
  const [loading, setLoading] = useState(false)

  const handleComplete = async () => {
    if (!focus) return
    setLoading(true)
    const { data } = await supabase.from('profiles')
      .update({ trading_focus: focus, language })
      .eq('id', userId).select().single()
    onComplete(data)
    setLoading(false)
  }

  return (
    <div style={{ minHeight: '100vh', background: C.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
      <div style={{ width: '100%', maxWidth: '520px' }}>
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <div style={{ fontSize: '32px', fontWeight: 800, color: C.accent }}>Operata</div>
          <h2 style={{ fontSize: '22px', fontWeight: 700, marginTop: '24px', marginBottom: '8px' }}>¿En qué mercado operas?</h2>
          <p style={{ color: C.muted, fontSize: '14px' }}>Personaliza tu experiencia desde el inicio</p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '24px' }}>
          {FOCUSES.map(f => (
            <div key={f.id} onClick={() => setFocus(f.id)} style={{
              padding: '20px', borderRadius: '12px', cursor: 'pointer',
              border: `2px solid ${focus === f.id ? C.accent : C.border}`,
              background: focus === f.id ? C.accentBg : C.card,
              transition: 'all 0.15s'
            }}>
              <div style={{ fontSize: '28px', marginBottom: '8px' }}>{f.icon}</div>
              <div style={{ fontWeight: 700, fontSize: '15px', marginBottom: '4px', color: focus === f.id ? C.accent : C.text }}>{f.label}</div>
              <div style={{ fontSize: '12px', color: C.muted }}>{f.desc}</div>
            </div>
          ))}
        </div>

        <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: '12px', padding: '16px', marginBottom: '24px' }}>
          <div style={{ fontSize: '13px', color: C.muted, marginBottom: '10px', fontWeight: 600 }}>Idioma preferido</div>
          <div style={{ display: 'flex', gap: '8px' }}>
            {[{ id: 'es', label: '🇪🇸 Español' }, { id: 'en', label: '🇺🇸 English' }].map(l => (
              <button key={l.id} onClick={() => setLanguage(l.id)} style={{
                flex: 1, padding: '10px', borderRadius: '8px', fontWeight: 600, fontSize: '13px',
                border: `1px solid ${language === l.id ? C.accent : C.border}`,
                background: language === l.id ? C.accentBg : 'transparent',
                color: language === l.id ? C.accent : C.muted,
              }}>{l.label}</button>
            ))}
          </div>
        </div>

        <button style={{ ...btn('primary'), width: '100%', justifyContent: 'center', padding: '14px', fontSize: '15px', opacity: focus ? 1 : 0.5 }}
          onClick={handleComplete} disabled={!focus || loading}>
          {loading ? 'Configurando...' : 'Empezar →'}
        </button>
      </div>
    </div>
  )
}
