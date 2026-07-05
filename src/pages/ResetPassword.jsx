import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { C, input, label } from '../lib/theme'

export default function ResetPassword() {
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const handleReset = async () => {
    if (password !== confirmPassword) { setError('Las contraseñas no coinciden'); return }
    if (password.length < 6) { setError('La contraseña debe tener al menos 6 caracteres'); return }
    setLoading(true); setError('')
    const { error } = await supabase.auth.updateUser({ password })
    if (error) { setError(error.message); setLoading(false); return }
    setSuccess(true)
    setLoading(false)
    setTimeout(() => { window.location.href = '/' }, 3000)
  }

  return (
    <div style={{ minHeight: '100vh', background: C.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
      <div style={{ width: '100%', maxWidth: '420px' }}>
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{ fontSize: '28px', fontWeight: 800, color: C.accent }}>Operata</div>
        </div>
        <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: '16px', padding: '32px' }}>
          {success ? (
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '36px', marginBottom: '16px' }}>✅</div>
              <div style={{ fontWeight: 700, fontSize: '16px', marginBottom: '8px' }}>Contraseña actualizada</div>
              <div style={{ color: C.muted, fontSize: '13px' }}>Redirigiendo a Operata...</div>
            </div>
          ) : (
            <>
              <h2 style={{ fontSize: '20px', fontWeight: 700, marginBottom: '8px' }}>Nueva contraseña</h2>
              <p style={{ color: C.muted, fontSize: '13px', marginBottom: '24px' }}>Ingresa tu nueva contraseña para recuperar el acceso.</p>
              <div style={{ marginBottom: '16px' }}>
                <div style={label}>Nueva contraseña</div>
                <input style={input} type="password" placeholder="Mínimo 6 caracteres" value={password}
                  onChange={e => setPassword(e.target.value)} />
              </div>
              <div style={{ marginBottom: '20px' }}>
                <div style={label}>Confirmar contraseña</div>
                <input style={{ ...input, border: `1px solid ${confirmPassword && password !== confirmPassword ? C.red : C.border}` }}
                  type="password" placeholder="Repite tu contraseña" value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleReset()} />
                {confirmPassword && password !== confirmPassword && (
                  <div style={{ fontSize: '11px', color: C.red, marginTop: '4px' }}>Las contraseñas no coinciden</div>
                )}
              </div>
              {error && <div style={{ padding: '10px', background: C.redBg, border: `1px solid ${C.red}30`, borderRadius: '8px', color: C.red, fontSize: '13px', marginBottom: '16px' }}>{error}</div>}
              <button onClick={handleReset} disabled={loading}
                style={{ width: '100%', padding: '12px', borderRadius: '8px', border: 'none', background: C.accent, color: C.bg, fontWeight: 700, fontSize: '14px', cursor: 'pointer' }}>
                {loading ? 'Actualizando...' : 'Actualizar contraseña'}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
