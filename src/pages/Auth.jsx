import { useState } from 'react'
import { supabase } from '../lib/supabase'
import { C, input, label } from '../lib/theme'

export default function Auth({ initialMode = 'login', onBack }) {
  const [mode, setMode] = useState(initialMode)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [name, setName] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [showRecovery, setShowRecovery] = useState(false)
  const [termsAccepted, setTermsAccepted] = useState(false)
  const [recoveryEmail, setRecoveryEmail] = useState('')
  const [recoverySent, setRecoverySent] = useState(false)

  const handleSubmit = async () => {
    setError(''); setSuccess('')
    if (mode === 'signup') {
      if (!termsAccepted) { setError('Debes aceptar los Términos y Condiciones para continuar'); return }
      if (password !== confirmPassword) { setError('Las contraseñas no coinciden'); return }
      if (password.length < 6) { setError('La contraseña debe tener al menos 6 caracteres'); return }
    }
    setLoading(true)
    if (mode === 'login') {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) setError(error.message === 'Invalid login credentials' ? 'Email o contraseña incorrectos' : error.message)
    } else {
      const { error } = await supabase.auth.signUp({ email, password, options: { data: { full_name: name } } })
      if (error) setError(error.message)
      else setSuccess('¡Cuenta creada! Revisa tu email para confirmar.')
    }
    setLoading(false)
  }

  const handleRecovery = async () => {
    if (!recoveryEmail) { setError('Ingresa tu email'); return }
    setLoading(true)
    const { error } = await supabase.auth.resetPasswordForEmail(recoveryEmail, {
      redirectTo: 'https://operata.tech'
    })
    setLoading(false)
    if (error) setError(error.message)
    else setRecoverySent(true)
  }

  if (showRecovery) return (
    <div style={{ minHeight: '100vh', background: C.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
      <div style={{ width: '100%', maxWidth: '420px' }}>
        <div style={{ marginBottom: '24px' }}>
          <span onClick={() => { setShowRecovery(false); setError(''); setRecoverySent(false) }} style={{ color: C.muted, fontSize: '13px', cursor: 'pointer' }}>← Volver</span>
        </div>
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{ fontSize: '28px', fontWeight: 800, color: C.accent }}>Operata</div>
        </div>
        <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: '16px', padding: '32px' }}>
          <h2 style={{ fontSize: '20px', fontWeight: 700, marginBottom: '8px' }}>Recuperar contraseña</h2>
          <p style={{ color: C.muted, fontSize: '13px', marginBottom: '24px' }}>Te enviaremos un enlace para restablecer tu contraseña.</p>
          {recoverySent ? (
            <div style={{ padding: '16px', background: C.greenBg, border: `1px solid ${C.green}30`, borderRadius: '10px', textAlign: 'center' }}>
              <div style={{ fontSize: '24px', marginBottom: '8px' }}>📧</div>
              <div style={{ color: C.green, fontWeight: 600, marginBottom: '4px' }}>Email enviado</div>
              <div style={{ color: C.muted, fontSize: '13px' }}>Revisa tu bandeja de entrada en {recoveryEmail}</div>
            </div>
          ) : (
            <>
              <div style={{ marginBottom: '20px' }}>
                <div style={label}>Email</div>
                <input style={input} type="email" placeholder="tu@email.com" value={recoveryEmail}
                  onChange={e => setRecoveryEmail(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleRecovery()} />
              </div>
              {error && <div style={{ padding: '10px', background: C.redBg, border: `1px solid ${C.red}30`, borderRadius: '8px', color: C.red, fontSize: '13px', marginBottom: '16px' }}>{error}</div>}
              <button style={{ width: '100%', padding: '12px', borderRadius: '8px', border: 'none', background: C.accent, color: C.bg, fontWeight: 700, fontSize: '14px', cursor: 'pointer' }}
                onClick={handleRecovery} disabled={loading}>{loading ? 'Enviando...' : 'Enviar enlace de recuperación'}</button>
            </>
          )}
        </div>
      </div>
    </div>
  )

  return (
    <div style={{ minHeight: '100vh', background: C.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
      <div style={{ width: '100%', maxWidth: '420px' }}>
        <div style={{ marginBottom: '24px' }}>
          <span onClick={onBack} style={{ color: C.muted, fontSize: '13px', cursor: 'pointer' }}>← Volver</span>
        </div>
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{ fontSize: '28px', fontWeight: 800, color: C.accent }}>Operata</div>
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
          <div style={{ marginBottom: mode === 'signup' ? '16px' : '8px' }}>
            <div style={label}>Contraseña</div>
            <input style={input} type="password" placeholder="Mínimo 6 caracteres" value={password} onChange={e => setPassword(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleSubmit()} />
          </div>
          {mode === 'signup' && (
            <div style={{ marginBottom: '8px' }}>
              <div style={label}>Confirmar contraseña</div>
              <input style={{ ...input, border: `1px solid ${confirmPassword && password !== confirmPassword ? C.red : C.border}` }}
                type="password" placeholder="Repite tu contraseña" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSubmit()} />
              {confirmPassword && password !== confirmPassword && (
                <div style={{ fontSize: '11px', color: C.red, marginTop: '4px' }}>Las contraseñas no coinciden</div>
              )}
            </div>
          )}
          {mode === 'login' && (
            <div style={{ textAlign: 'right', marginBottom: '20px' }}>
              <span onClick={() => { setShowRecovery(true); setError('') }} style={{ fontSize: '12px', color: C.accent, cursor: 'pointer' }}>
                ¿Olvidaste tu contraseña?
              </span>
            </div>
          )}
          {error && <div style={{ padding: '10px', background: C.redBg, border: `1px solid ${C.red}30`, borderRadius: '8px', color: C.red, fontSize: '13px', marginBottom: '16px' }}>{error}</div>}
          {success && <div style={{ padding: '10px', background: C.greenBg, border: `1px solid ${C.green}30`, borderRadius: '8px', color: C.green, fontSize: '13px', marginBottom: '16px' }}>{success}</div>}
          <button style={{ width: '100%', padding: '12px', borderRadius: '8px', border: 'none', background: C.accent, color: C.bg, fontWeight: 700, fontSize: '14px', cursor: mode === 'signup' && !termsAccepted ? 'not-allowed' : 'pointer', opacity: mode === 'signup' && !termsAccepted ? 0.5 : 1 }}
            onClick={handleSubmit} disabled={loading || (mode === 'signup' && !termsAccepted)}>
            {loading ? 'Cargando...' : mode === 'login' ? 'Entrar' : 'Crear cuenta gratis'}
          </button>
          <div style={{ textAlign: 'center', marginTop: '20px', fontSize: '13px', color: C.muted }}>
            {mode === 'login' ? '¿No tienes cuenta? ' : '¿Ya tienes cuenta? '}
            <span style={{ color: C.accent, cursor: 'pointer', fontWeight: 600 }}
              onClick={() => { setMode(mode === 'login' ? 'signup' : 'login'); setError(''); setSuccess(''); setConfirmPassword('') }}>
              {mode === 'login' ? 'Regístrate gratis' : 'Inicia sesión'}
            </span>
          </div>
        </div>
        {mode === 'signup' && (
          <div style={{ textAlign: 'center', marginTop: '16px', fontSize: '12px', color: C.dim }}>
            Plan gratuito incluye 20 operaciones · Sin tarjeta de crédito
          </div>
        )}
      </div>
    </div>
  )
}
