import { useState } from 'react'
import { supabase } from '../lib/supabase'
import { C, btn, label, input } from '../lib/theme'

const FOCUSES = [
  { id: 'forex', label: 'Forex', icon: '💱', desc: 'EUR/USD, GBP/JPY, USD/JPY...' },
  { id: 'stocks', label: 'Acciones', icon: '📈', desc: 'Apple, Tesla, S&P 500...' },
  { id: 'crypto', label: 'Criptomonedas', icon: '₿', desc: 'Bitcoin, Ethereum...' },
  { id: 'futures', label: 'Futuros', icon: '⚡', desc: 'ES, NQ, Petróleo...' },
  { id: 'universal', label: 'Universal', icon: '🌍', desc: 'Varios mercados' },
]

const CURRENCIES = ['USD','MXN','EUR','GBP','JPY','CAD','CHF','AUD']

export default function Onboarding({ userId, onComplete }) {
  const [step, setStep] = useState('focus') // focus | account
  const [focus, setFocus] = useState('')
  const [accountName, setAccountName] = useState('Mi cuenta')
  const [currency, setCurrency] = useState('USD')
  const [balance, setBalance] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const handleFocusNext = () => {
    if (!focus) return
    setStep('account')
  }

  const handleComplete = async () => {
    setLoading(true); setError(null)
    try {
      const { data: profileData, error: profileError } = await supabase.from('profiles')
        .update({ trading_focus: focus, language: 'es' })
        .eq('id', userId).select().single()
      if (profileError) { setError(profileError.message); setLoading(false); return }

      if (accountName.trim()) {
        const { data: accountData } = await supabase.from('accounts')
          .insert({ user_id: userId, name: accountName.trim(), currency, balance: parseFloat(balance) || 0, type: 'real' })
          .select().single()
        if (accountData) {
          // Por si el usuario ya tenía operaciones sueltas sin cuenta asignada (caso raro en un usuario nuevo,
          // pero posible si vino de una importación previa), las vinculamos a esta primera cuenta.
          await supabase.from('trades').update({ account_id: accountData.id }).eq('user_id', userId).is('account_id', null)
          localStorage.setItem('operata-active-account', accountData.id)
        }
      }

      onComplete(profileData)
    } catch (e) {
      setError(e.message)
    }
    setLoading(false)
  }

  if (step === 'focus') return (
    <div style={{ minHeight: '100vh', background: C.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
      <div style={{ width: '100%', maxWidth: '520px' }}>
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <div style={{ fontSize: '32px', fontWeight: 800, color: C.accent }}>Operata</div>
          <h2 style={{ fontSize: '22px', fontWeight: 700, marginTop: '24px', marginBottom: '8px' }}>¿En qué mercado operas?</h2>
          <p style={{ color: C.muted, fontSize: '14px' }}>Personaliza tu experiencia desde el inicio · Paso 1 de 2</p>
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

        <button style={{ ...btn('primary'), width: '100%', justifyContent: 'center', padding: '14px', fontSize: '15px', opacity: focus ? 1 : 0.5 }}
          onClick={handleFocusNext} disabled={!focus}>
          Siguiente →
        </button>
      </div>
    </div>
  )

  return (
    <div style={{ minHeight: '100vh', background: C.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
      <div style={{ width: '100%', maxWidth: '440px' }}>
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{ fontSize: '32px', fontWeight: 800, color: C.accent }}>Operata</div>
          <h2 style={{ fontSize: '22px', fontWeight: 700, marginTop: '24px', marginBottom: '8px' }}>Crea tu primera cuenta</h2>
          <p style={{ color: C.muted, fontSize: '14px' }}>Así podrás llevar tu diario y analytics desde el inicio · Paso 2 de 2</p>
        </div>

        <div style={{ marginBottom: '16px' }}>
          <div style={label}>Nombre de la cuenta</div>
          <input style={input} value={accountName} onChange={e => setAccountName(e.target.value)} placeholder="Ej: Cuenta real, Demo IBKR..." />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
          <div>
            <div style={label}>Moneda</div>
            <select style={{ ...input, cursor: 'pointer' }} value={currency} onChange={e => setCurrency(e.target.value)}>
              {CURRENCIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <div style={label}>Capital inicial</div>
            <input style={input} type="number" value={balance} onChange={e => setBalance(e.target.value)} placeholder="Ej: 10000" />
          </div>
        </div>

        {error && <div style={{ fontSize: '12px', color: C.red, marginBottom: '12px' }}>{error}</div>}

        <button style={{ ...btn('primary'), width: '100%', justifyContent: 'center', padding: '14px', fontSize: '15px', opacity: loading ? 0.6 : 1 }}
          onClick={handleComplete} disabled={loading}>
          {loading ? 'Configurando...' : 'Empezar →'}
        </button>
        <button style={{ ...btn('ghost'), width: '100%', justifyContent: 'center', padding: '10px', fontSize: '13px', marginTop: '8px' }}
          onClick={handleComplete} disabled={loading}>
          Omitir por ahora
        </button>
      </div>
    </div>
  )
}
