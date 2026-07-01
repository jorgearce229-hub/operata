import { useState } from 'react'
import { supabase } from '../lib/supabase'
import { C, input, label } from '../lib/theme'

export default function Auth({ initialMode = 'login', onBack }) {
  const [mode, setMode] = useState(initialMode)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const handleSubmit = async () => {
    setLoading(true); setError(''); setSuccess('')
    if (mode === 'login') {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) setError(error.message)
    } else {
      const { error } = await supabase.auth.signUp({ email, password, options: { data: { full_name: name } } })
      if (error) setError(error.message)
      else setSuccess('¡Cuenta creada! Revisa tu email para confirmar.')
    }
    setLoading(false)
  }

  return (
    <div style={{ minHeight: '100vh', background: C.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
      <div style={{ width: '100%', maxWidth: '420px' }}>
        {/* Back to landing */}
        <div style={{ marginBottom: '24px' }}>
          <span onClick={onBack} style={{ color: C.muted, fontSize: '13px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}>
            ← Volver
          </span>
        </div>

        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{ fontSize: '28px', fontWeight: 800, color: C.accent, letterSpacing: '-0.5px' }}>Operata</div>
          <div style={{ fontSize: '13px', color: C.muted, marginTop: '6px' }}>Tu diario de trading inteligente</div>
        </div>

        <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: '16px', padding: '32px' }}>
          <h2 style={{ fontSize: '20px', fontWeight: 700, marginBottom: '24px' }}>
            {mode === 'login' ? 'Iniciar sesión' : 'Crear cuenta gratis'}
          </h2>

          {mode === 'signup' && (
            <div style={{ marginBottom: '16px' }}>
              <div style={label}>Nombre completo</div>
              <input style={input} type="text" placeholder="Tu nombre" value={name} onChange={e => setName(e.target.value)} />
            </div>
          )}
          <div style={{ marginBottom: '16px' }}>
            <div style={label}>Email</div>
            <input style={input} type="email" placeholder="tu@email.com" value={email} onChange={e => setEmail(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleSubmit()} />
          </div>
          <div style={{ marginBottom: '24px' }}>
            <div style={label}>Contraseña</div>
            <input style={input} type="password" placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleSubmit()} />
          </div>

          {error && <div style={{ padding: '10px', background: C.redBg, border: `1px solid ${C.red}30`, borderRadius: '8px', color: C.red, fontSize: '13px', marginBottom: '16px' }}>{error}</div>}
          {success && <div style={{ padding: '10px', background: C.greenBg, border: `1px solid ${C.green}30`, borderRadius: '8px', color: C.green, fontSize: '13px', marginBottom: '16px' }}>{success}</div>}

          <button style={{ width: '100%', padding: '12px', borderRadius: '8px', border: 'none', background: C.accent, color: C.bg, fontWeight: 700, fontSize: '14px', cursor: 'pointer' }}
            onClick={handleSubmit} disabled={loading}>
            {loading ? 'Cargando...' : mode === 'login' ? 'Entrar' : 'Crear cuenta gratis'}
          </button>

          <div style={{ textAlign: 'center', marginTop: '20px', fontSize: '13px', color: C.muted }}>
            {mode === 'login' ? '¿No tienes cuenta? ' : '¿Ya tienes cuenta? '}
            <span style={{ color: C.accent, cursor: 'pointer', fontWeight: 600 }}
              onClick={() => { setMode(mode === 'login' ? 'signup' : 'login'); setError(''); setSuccess('') }}>
              {mode === 'login' ? 'Regístrate gratis' : 'Inicia sesión'}
            </span>
          </div>
        </div>

        {mode === 'signup' && (
          <div style={{ textAlign: 'center', marginTop: '16px', fontSize: '12px', color: C.dim }}>
            Plan gratuito incluye 50 operaciones · Sin tarjeta de crédito
          </div>
        )}
      </div>
    </div>
  )
}
