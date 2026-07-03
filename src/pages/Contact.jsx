import { useState } from 'react'
import { C, card, label, input, btn } from '../lib/theme'

const SUBJECTS = [
  'Reporte de error o bug',
  'Pregunta sobre mi cuenta',
  'Sugerencia de mejora',
  'Problema con el pago',
  'Otro',
]

export default function Contact({ onClose, userEmail, userName }) {
  const [form, setForm] = useState({
    name: userName || '',
    email: userEmail || '',
    subject: SUBJECTS[0],
    message: ''
  })
  const [sending, setSending] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState(null)

  const send = async () => {
    if (!form.message.trim()) { setError('Por favor escribe tu mensaje'); return }
    setSending(true); setError(null)
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error || 'Error al enviar'); setSending(false); return }
      setSent(true)
    } catch (err) {
      setError('Error de conexión. Intenta de nuevo.')
    }
    setSending(false)
  }

  return (
    <div style={{ minHeight: '100vh', background: C.bg, color: C.text, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 20px' }}>
      <div style={{ maxWidth: '520px', width: '100%' }}>
        {onClose && <button onClick={onClose} style={{ marginBottom: '24px', padding: '6px 14px', borderRadius: '8px', border: `1px solid ${C.border}`, background: 'transparent', color: C.muted, cursor: 'pointer', fontSize: '13px' }}>← Volver</button>}

        <div style={{ marginBottom: '28px' }}>
          <h1 style={{ fontSize: '22px', fontWeight: 800, marginBottom: '6px' }}>Contacto y soporte</h1>
          <p style={{ fontSize: '13px', color: C.muted }}>¿Tienes algún problema o sugerencia? Escríbenos y te respondemos a la brevedad.</p>
        </div>

        {sent ? (
          <div style={{ ...card, textAlign: 'center', padding: '48px' }}>
            <div style={{ fontSize: '40px', marginBottom: '16px' }}>✅</div>
            <div style={{ fontSize: '17px', fontWeight: 700, marginBottom: '8px' }}>Mensaje enviado</div>
            <div style={{ color: C.muted, fontSize: '13px', marginBottom: '24px' }}>Te responderemos a <b>{form.email}</b> a la brevedad.</div>
            <button onClick={onClose} style={{ ...btn(), fontSize: '13px' }}>Volver a Operata</button>
          </div>
        ) : (
          <div style={card}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
              <div>
                <div style={label}>Nombre</div>
                <input style={input} placeholder="Tu nombre" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
              </div>
              <div>
                <div style={label}>Email de respuesta</div>
                <input style={input} type="email" placeholder="tu@email.com" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
              </div>
            </div>
            <div style={{ marginBottom: '12px' }}>
              <div style={label}>Asunto</div>
              <select style={{ ...input, cursor: 'pointer' }} value={form.subject} onChange={e => setForm({ ...form, subject: e.target.value })}>
                {SUBJECTS.map(s => <option key={s}>{s}</option>)}
              </select>
            </div>
            <div style={{ marginBottom: '16px' }}>
              <div style={label}>Mensaje</div>
              <textarea style={{ ...input, minHeight: '120px', resize: 'vertical', fontFamily: 'inherit' }}
                placeholder="Describe tu consulta con el mayor detalle posible..." value={form.message}
                onChange={e => setForm({ ...form, message: e.target.value })} />
            </div>
            {error && <div style={{ padding: '10px', background: C.redBg, border: `1px solid ${C.red}30`, borderRadius: '8px', color: C.red, fontSize: '13px', marginBottom: '14px' }}>{error}</div>}
            <button onClick={send} disabled={sending} style={{ ...btn(), width: '100%', fontSize: '13px' }}>
              {sending ? 'Enviando...' : 'Enviar mensaje'}
            </button>
            <div style={{ marginTop: '12px', textAlign: 'center', fontSize: '11px', color: C.dim }}>
              También puedes escribirnos directo a operata.soporte@gmail.com
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
