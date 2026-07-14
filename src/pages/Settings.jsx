import React, { useState, useRef } from 'react'
import { supabase } from '../lib/supabase'
import { C, label, input, btn } from '../lib/theme'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'

const TIMEZONES = [
  { value: 'America/Mexico_City', label: 'México (UTC-6)' },
  { value: 'America/Mazatlan', label: 'México Pacífico / La Paz (UTC-7)' },
  { value: 'America/Bogota', label: 'Colombia (UTC-5)' },
  { value: 'America/Lima', label: 'Perú (UTC-5)' },
  { value: 'America/Santiago', label: 'Chile (UTC-4)' },
  { value: 'America/Argentina/Buenos_Aires', label: 'Argentina (UTC-3)' },
  { value: 'America/Sao_Paulo', label: 'Brasil (UTC-3)' },
  { value: 'America/New_York', label: 'Nueva York (UTC-5)' },
  { value: 'America/Chicago', label: 'Chicago (UTC-6)' },
  { value: 'America/Los_Angeles', label: 'Los Ángeles (UTC-8)' },
  { value: 'Europe/Madrid', label: 'España (UTC+1)' },
  { value: 'Europe/London', label: 'Londres (UTC+0)' },
  { value: 'UTC', label: 'UTC (UTC+0)' },
]

const CURRENCIES = [
  { value: 'USD', label: '🇺🇸 Dólar (USD)' },
  { value: 'MXN', label: '🇲🇽 Peso Mexicano (MXN)' },
  { value: 'EUR', label: '🇪🇺 Euro (EUR)' },
  { value: 'GBP', label: '🇬🇧 Libra (GBP)' },
  { value: 'CAD', label: '🇨🇦 Dólar Canadiense (CAD)' },
  { value: 'ARS', label: '🇦🇷 Peso Argentino (ARS)' },
  { value: 'COP', label: '🇨🇴 Peso Colombiano (COP)' },
  { value: 'BRL', label: '🇧🇷 Real Brasileño (BRL)' },
  { value: 'CLP', label: '🇨🇱 Peso Chileno (CLP)' },
]

const LANGUAGES = [
  { value: 'es', label: '🇪🇸 Español' },
  { value: 'en', label: '🇺🇸 English' },
]


function ReferralSection({ userId, profile }) {
  const [copied, setCopied] = useState(false)
  const link = `https://www.operata.tech/?ref=${userId}`
  const bonusActive = profile?.bonus_pro_until && new Date(profile.bonus_pro_until) > new Date()

  const copyLink = () => {
    navigator.clipboard.writeText(link)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div style={{ padding: '16px', background: C.bg, borderRadius: '10px', border: `1px solid ${C.border}` }}>
      <div style={{ fontWeight: 600, fontSize: '13px', marginBottom: '4px' }}>🎁 Invita a un amigo, ambos ganan Pro gratis</div>
      <div style={{ fontSize: '12px', color: C.muted, marginBottom: '12px' }}>
        Cuando tu amigo se registre con tu link y se haga Pro, ambos reciben <b>30 días de Pro gratis</b>.
      </div>
      <div style={{ display: 'flex', gap: '8px' }}>
        <input readOnly value={link} onClick={e => e.target.select()} style={{ ...input, flex: 1, fontSize: '12px', color: C.muted }} />
        <button onClick={copyLink} style={{ ...btn(), background: copied ? C.green : C.accent, color: C.bg, flexShrink: 0, whiteSpace: 'nowrap' }}>
          {copied ? '✓ Copiado' : 'Copiar link'}
        </button>
      </div>
      {bonusActive && (
        <div style={{ marginTop: '12px', padding: '10px 12px', background: C.accentBg, borderRadius: '8px', fontSize: '12px', color: C.accent }}>
          ✦ Tienes Pro de bono activo hasta el {new Date(profile.bonus_pro_until).toLocaleDateString('es-MX', { day: 'numeric', month: 'long', year: 'numeric' })}
        </div>
      )}
    </div>
  )
}

const CANCEL_REASONS = [
  { value: 'too_expensive', label: 'Es muy caro para lo que ofrece' },
  { value: 'not_used', label: 'No lo usé lo suficiente' },
  { value: 'found_alternative', label: 'Encontré otra herramienta que prefiero' },
  { value: 'missing_features', label: 'Le faltan funciones que necesito' },
  { value: 'technical_issues', label: 'Tuve problemas técnicos o errores' },
  { value: 'other', label: 'Otro' },
]

function CancelSubscription({ subscriptionId, onCancelled, profile, userId, userEmail }) {
  const [loading, setLoading] = React.useState(false)
  const [cancelled, setCancelled] = React.useState(false)
  const [periodEnd, setPeriodEnd] = React.useState(null)
  const [confirm, setConfirm] = React.useState(false)
  const [error, setError] = React.useState(null)
  const [reason, setReason] = React.useState('')
  const [otherText, setOtherText] = React.useState('')

  const reasonValid = reason && (reason !== 'other' || otherText.trim().length > 0)

  const handleCancel = async () => {
    if (!reasonValid) { setError('Por favor selecciona un motivo antes de continuar.'); return }
    setLoading(true); setError(null)
    try {
      // Guardamos el motivo de cancelación antes de proceder (best-effort, no bloquea la cancelación si falla)
      await supabase.from('cancellation_feedback').insert({
        user_id: userId,
        reason,
        other_text: reason === 'other' ? otherText.trim() : null,
      })

      const res = await fetch('/api/cancel-subscription', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subscriptionId,
          reason,
          otherText: reason === 'other' ? otherText.trim() : null,
          userEmail,
        })
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error); setLoading(false); return }
      setCancelled(true)
      setPeriodEnd(data.periodEnd)
      setConfirm(false)
    } catch(e) { setError(e.message) }
    setLoading(false)
  }

  if (cancelled) return (
    <div style={{ padding: '14px', background: C.yellowBg, border: `1px solid ${C.yellow}30`, borderRadius: '10px' }}>
      <div style={{ fontWeight: 600, fontSize: '13px', color: C.yellow, marginBottom: '4px' }}>Cancelación programada</div>
      <div style={{ fontSize: '12px', color: C.muted }}>Tu plan Pro permanece activo hasta el <b>{periodEnd}</b>. Después de esa fecha pasarás al plan gratuito.</div>
    </div>
  )

  return (
    <div style={{ padding: '14px', background: C.bg, border: `1px solid ${C.border}`, borderRadius: '10px' }}>
      {!confirm ? (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ fontWeight: 600, fontSize: '13px', marginBottom: '2px' }}>Suscripción Pro activa</div>
            <div style={{ fontSize: '12px', color: C.muted }}>Puedes cancelar en cualquier momento</div>
          </div>
          <button onClick={() => setConfirm(true)} style={{ padding: '7px 14px', borderRadius: '8px', border: `1px solid ${C.red}40`, background: 'transparent', color: C.red, fontWeight: 600, fontSize: '12px', cursor: 'pointer' }}>
            Cancelar suscripción
          </button>
        </div>
      ) : (
        <div>
          <div style={{ fontWeight: 600, fontSize: '13px', marginBottom: '6px' }}>¿Confirmas la cancelación?</div>
          <div style={{ fontSize: '12px', color: C.muted, marginBottom: '14px' }}>Tu plan Pro seguirá activo hasta el final del período de facturación actual. No se realizarán más cargos.</div>

          <div style={{ fontWeight: 600, fontSize: '12px', marginBottom: '8px' }}>Antes de irte, cuéntanos por qué</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '10px' }}>
            {CANCEL_REASONS.map(r => (
              <label key={r.value} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: C.text, cursor: 'pointer' }}>
                <input type="radio" name="cancel_reason" value={r.value} checked={reason === r.value}
                  onChange={() => setReason(r.value)} />
                {r.label}
              </label>
            ))}
          </div>

          {reason === 'other' && (
            <textarea
              value={otherText}
              onChange={e => setOtherText(e.target.value)}
              placeholder="Cuéntanos más..."
              rows={3}
              style={{ width: '100%', padding: '8px 10px', borderRadius: '8px', border: `1px solid ${C.border}`, background: C.card, color: C.text, fontSize: '12px', marginBottom: '10px', resize: 'vertical', fontFamily: 'inherit' }}
            />
          )}

          {error && <div style={{ fontSize: '12px', color: C.red, marginBottom: '8px' }}>{error}</div>}
          <div style={{ display: 'flex', gap: '8px' }}>
            <button onClick={handleCancel} disabled={loading || !reasonValid} style={{ padding: '7px 16px', borderRadius: '8px', border: 'none', background: C.red, color: '#fff', fontWeight: 600, fontSize: '12px', cursor: (loading || !reasonValid) ? 'not-allowed' : 'pointer', opacity: (loading || !reasonValid) ? 0.5 : 1 }}>
              {loading ? 'Cancelando...' : 'Sí, cancelar'}
            </button>
            <button onClick={() => { setConfirm(false); setError(null) }} style={{ padding: '7px 16px', borderRadius: '8px', border: `1px solid ${C.border}`, background: 'transparent', color: C.muted, fontWeight: 600, fontSize: '12px', cursor: 'pointer' }}>
              No, mantener Pro
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

const FOCUSES = [
  { value: 'forex', label: '💱 Forex' },
  { value: 'stocks', label: '📈 Acciones' },
  { value: 'crypto', label: '₿ Criptomonedas' },
  { value: 'futures', label: '⚡ Futuros' },
  { value: 'universal', label: '🌍 Universal' },
]

export default function Settings({ profile, userId, onProfileUpdate, theme, onThemeChange, isPro, userEmail, onClose }) {
  const nameRef = useRef(null)
  const capitalRef = useRef(null)
  const [tradingFocus, setTradingFocus] = useState(profile?.trading_focus || 'forex')
  const [currency, setCurrency] = useState(profile?.preferred_currency || 'USD')
  const [language, setLanguage] = useState(profile?.language || 'es')
  const [timezone, setTimezone] = useState(profile?.timezone || 'America/Mazatlan')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const containerRef = useRef(null)

  const save = async (e) => {
    if (e) e.preventDefault()
    setSaving(true)
    try {
      const updateData = {
        full_name: nameRef.current?.value || profile?.full_name || '',
        trading_focus: tradingFocus,
        preferred_currency: currency,
        language: language,
        timezone: timezone,
        initial_capital: capitalRef.current?.value ? parseFloat(capitalRef.current.value) : null,
      }
      const { error } = await supabase.from('profiles').update(updateData).eq('id', userId)
      if (!error) {
        onProfileUpdate(updateData)
        setSaved(true)
        setTimeout(() => setSaved(false), 2500)
      }
    } catch(e) {
      console.error('Settings save error:', e)
    }
    setSaving(false)
  }

  const exportTrades = async () => {
    const { data } = await supabase.from('trades').select('*').eq('user_id', userId).order('entry_date', { ascending: false })
    if (!data?.length) return alert('No hay operaciones para exportar')
    const headers = ['Fecha entrada','Fecha cierre','Instrumento','Dirección','Entrada','SL','TP','Cierre','Resultado','R','P&L','Riesgo %','Notas']
    const rows = data.map(t => [
      t.entry_date||'', t.close_date||'', t.instrument||'', t.direction||'',
      t.entry_price||'', t.stop_loss||'', t.take_profit||'', t.close_price||'',
      t.result||'', t.r_multiple||'', t.pnl||'', t.risk_pct||'', (t.notes||'').replace(/,/g,' ')
    ])
    const csv = [headers, ...rows].map(r => r.join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url; a.download = `operata_trades_${new Date().toISOString().slice(0,10)}.csv`
    a.click(); URL.revokeObjectURL(url)
  }

  const exportTradesPDF = async () => {
    const { data } = await supabase.from('trades').select('*').eq('user_id', userId).order('entry_date', { ascending: false })
    if (!data?.length) return alert('No hay operaciones para exportar')

    // Mismas fórmulas que usa Analytics, para que el resumen del PDF coincida con lo que ve el usuario en la app.
    const sorted = [...data].filter(t => t.close_date || t.entry_date).sort((a, b) => ((a.entry_date || '') < (b.entry_date || '') ? -1 : 1))
    const totalPnL = sorted.reduce((s, t) => s + (t.pnl || 0), 0)
    const wins = sorted.filter(t => t.result === 'TP').length
    const wr = sorted.length ? Math.round(wins / sorted.length * 100) : 0
    const avgR = sorted.length ? sorted.reduce((s, t) => s + (t.r_multiple || 0), 0) / sorted.length : 0
    let peak = 0, maxDD = 0, runEq = 0
    sorted.forEach(t => { runEq += (t.pnl || 0); if (runEq > peak) peak = runEq; const dd = (peak - runEq) / Math.max(peak, 1) * 100; if (dd > maxDD) maxDD = dd })

    const doc = new jsPDF({ orientation: 'landscape', unit: 'pt', format: 'letter' })
    const pageWidth = doc.internal.pageSize.getWidth()

    // Encabezado
    doc.setFillColor(11, 46, 74) // navy
    doc.rect(0, 0, pageWidth, 70, 'F')
    doc.setTextColor(255, 255, 255)
    doc.setFontSize(20)
    doc.setFont('helvetica', 'bold')
    doc.text('OPERATA', 40, 32)
    doc.setFontSize(11)
    doc.setFont('helvetica', 'normal')
    doc.text('Reporte de trading', 40, 50)
    doc.setFontSize(9)
    doc.text(`Generado el ${new Date().toLocaleDateString('es-MX', { day: 'numeric', month: 'long', year: 'numeric' })}`, pageWidth - 220, 50)

    // Resumen de métricas
    const summaryY = 95
    const stats = [
      ['Operaciones', `${sorted.length}`],
      ['Win rate', `${wr}%`],
      ['P&L total', `${totalPnL >= 0 ? '+' : ''}$${totalPnL.toFixed(2)}`],
      ['Expectancy', `${avgR >= 0 ? '+' : ''}${avgR.toFixed(2)}R`],
      ['Max drawdown', `${maxDD.toFixed(1)}%`],
    ]
    const boxWidth = (pageWidth - 80) / stats.length
    stats.forEach(([lbl, val], i) => {
      const x = 40 + i * boxWidth
      doc.setDrawColor(225, 224, 217)
      doc.setFillColor(245, 245, 240)
      doc.roundedRect(x, summaryY, boxWidth - 10, 55, 4, 4, 'FD')
      doc.setTextColor(140, 138, 130)
      doc.setFontSize(8)
      doc.text(lbl.toUpperCase(), x + 10, summaryY + 18)
      doc.setTextColor(20, 20, 20)
      doc.setFontSize(15)
      doc.setFont('helvetica', 'bold')
      doc.text(val, x + 10, summaryY + 40)
    })

    // Tabla de operaciones
    autoTable(doc, {
      startY: summaryY + 75,
      head: [['Fecha', 'Instrumento', 'Dir', 'Entrada', 'SL', 'TP', 'Resultado', 'R', 'P&L']],
      body: data.map(t => [
        t.entry_date || '', t.instrument || '', t.direction || '',
        t.entry_price ?? '', t.stop_loss ?? '', t.take_profit ?? '',
        t.result || '', t.r_multiple != null ? t.r_multiple.toFixed(2) : '',
        t.pnl != null ? `${t.pnl >= 0 ? '+' : ''}$${t.pnl.toFixed(2)}` : '',
      ]),
      styles: { fontSize: 8, cellPadding: 5 },
      headStyles: { fillColor: [11, 46, 74], textColor: 255 },
      alternateRowStyles: { fillColor: [245, 245, 240] },
      margin: { left: 40, right: 40 },
    })

    doc.save(`operata_reporte_${new Date().toISOString().slice(0, 10)}.pdf`)
  }


  const exportBacktests = async () => {
    const { data } = await supabase.from('backtests').select('*').eq('user_id', userId).order('trade_date', { ascending: false })
    if (!data?.length) return alert('No hay registros de backtest para exportar')
    const headers = ['Fecha','Instrumento','Dirección','Resultado','Entrada','SL','TP','Muestra','Notas']
    const rows = data.map(t => [
      t.trade_date||'', t.instrument||'', t.direction||'', t.result||'',
      t.entry_price||'', t.stop_loss||'', t.take_profit||'', t.target_sample||'',
      (t.setup_notes||'').replace(/,/g,' ')
    ])
    const csv = [headers, ...rows].map(r => r.join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url; a.download = `operata_backtest_${new Date().toISOString().slice(0,10)}.csv`
    a.click(); URL.revokeObjectURL(url)
  }

  const Section = ({ title, children }) => (
    <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: '12px', padding: '24px', marginBottom: '16px' }}>
      <div style={{ fontSize: '13px', fontWeight: 600, color: C.muted, textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: '20px' }}>{title}</div>
      {children}
    </div>
  )

  const Field = ({ label: l, children }) => (
    <div style={{ marginBottom: '16px' }}>
      <div style={label}>{l}</div>
      {children}
    </div>
  )

  const Select = ({ value, onChange, options }) => (
    <select style={{ ...input }} value={value} onChange={e => onChange(e.target.value)}>
      {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
    </select>
  )

  return (
    <div style={{ minHeight: '100vh', background: C.bg, color: C.text }}>
    <div style={{ maxWidth: '700px', margin: '0 auto', padding: '24px' }} ref={containerRef}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {onClose && <button onClick={onClose} style={{ padding: '6px 12px', borderRadius: '8px', border: '1px solid #1e293b', background: 'transparent', color: '#94a3b8', fontSize: '13px', cursor: 'pointer' }}>← Volver</button>}
          <h1 style={{ fontSize: '20px', fontWeight: 700 }}>Configuración</h1>
        </div>
        <button onClick={(e) => { e.preventDefault(); save() }} disabled={saving} style={{ ...btn(), background: saved ? C.green : C.accent, color: C.bg }}>
          {saving ? 'Guardando...' : saved ? '✓ Guardado' : 'Guardar cambios'}
        </button>
      </div>

      {/* Apariencia */}
      <Section title="Apariencia">
        <Field label="Tema">
          <div style={{ display: 'flex', gap: '10px' }}>
            {[{ v: 'dark', l: '🌙 Oscuro' }, { v: 'light', l: '☀️ Claro' }].map(t => (
              <button key={t.v} onClick={() => onThemeChange(t.v)} style={{
                flex: 1, padding: '12px', borderRadius: '8px', fontWeight: 600, fontSize: '13px', cursor: 'pointer',
                border: `2px solid ${theme === t.v ? C.accent : C.border}`,
                background: theme === t.v ? C.accentBg : 'transparent',
                color: theme === t.v ? C.accent : C.muted,
              }}>{t.l}</button>
            ))}
          </div>
        </Field>
      </Section>

      {/* Perfil */}
      <Section title="Perfil">
        <Field label="Nombre">
          <input ref={nameRef} style={input} type="text" defaultValue={profile?.full_name || ''} placeholder="Tu nombre" />
        </Field>
        <Field label="Mercado principal">
          <Select value={tradingFocus} onChange={v => setTradingFocus(v)} options={FOCUSES} />
        </Field>
        {/* Selector de idioma oculto temporalmente: el inglés todavía no está traducido
            en el resto de la app, así que mostrarlo daría a entender que funciona cuando no es así.
            Reactivar este bloque cuando se implemente el sistema de traducción completo. */}
      </Section>

      {/* Regional */}
      <Section title="Región y moneda">
        <Field label="Zona horaria">
          <Select value={timezone} onChange={v => setTimezone(v)} options={TIMEZONES} />
        </Field>
        <Field label="Moneda base">
          <Select value={currency} onChange={v => setCurrency(v)} options={CURRENCIES} />
        </Field>
        <Field label="Capital operativo (USD)">
          <input ref={capitalRef} style={input} type="number" step="any" placeholder="Ej: 5000" defaultValue={profile?.initial_capital || ''} />
        </Field>
        <div style={{ padding: '10px 12px', background: C.bg, borderRadius: '8px', border: `1px solid ${C.border}`, fontSize: '12px', color: C.muted }}>
          Se usa para calcular el % de rendimiento cuando no tienes una cuenta seleccionada. Si ya creaste una cuenta en la sección "Cuentas", se usa el balance de esa cuenta en su lugar.
        </div>
      </Section>

      {/* Datos */}
      <Section title="Datos y exportación">
        {isPro ? (
          <>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px', marginBottom: '12px' }}>
              <button onClick={exportTrades} style={{ padding: '14px', borderRadius: '10px', border: `1px solid ${C.border}`, background: 'transparent', color: C.text, fontWeight: 600, fontSize: '13px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                📥 Operaciones (CSV)
              </button>
              <button onClick={exportBacktests} style={{ padding: '14px', borderRadius: '10px', border: `1px solid ${C.border}`, background: 'transparent', color: C.text, fontWeight: 600, fontSize: '13px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                📥 Backtests (CSV)
              </button>
              <button onClick={exportTradesPDF} style={{ padding: '14px', borderRadius: '10px', border: `1px solid ${C.accent}`, background: C.accentBg, color: C.accent, fontWeight: 600, fontSize: '13px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                🧾 Reporte (PDF)
              </button>
            </div>
            <div style={{ fontSize: '12px', color: C.dim }}>Exporta todos tus datos en formato CSV compatible con Excel y Google Sheets, o un reporte en PDF con resumen y detalle de tus operaciones.</div>
          </>
        ) : (
          <div style={{ padding: '20px', textAlign: 'center', border: `1px dashed ${C.border}`, borderRadius: '10px' }}>
            <div style={{ fontSize: '20px', marginBottom: '8px' }}>🔒</div>
            <div style={{ fontWeight: 600, marginBottom: '4px', fontSize: '14px' }}>Exportación de datos — Plan Pro</div>
            <div style={{ color: C.muted, fontSize: '13px', marginBottom: '14px' }}>Exporta tus operaciones y backtests en CSV compatible con Excel</div>
            <button onClick={() => window.location.href = '/?upgrade=true'} style={{ padding: '8px 20px', borderRadius: '8px', border: 'none', background: C.accent, color: C.bg, fontWeight: 600, cursor: 'pointer', fontSize: '13px' }}>Upgrade a Pro →</button>
          </div>
        )}
      </Section>

      {/* Cuenta */}
      <Section title="Cuenta">
        <div style={{ padding: '16px', background: C.bg, borderRadius: '10px', border: `1px solid ${C.border}`, marginBottom: '12px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <div style={{ fontSize: '11px', color: C.dim, textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: '4px' }}>Nombre</div>
              <div style={{ fontSize: '14px', fontWeight: 600 }}>{profile?.full_name || '—'}</div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '11px', color: C.dim, textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: '4px' }}>Plan</div>
              <div style={{ display: 'inline-block', padding: '3px 10px', borderRadius: '20px', fontSize: '12px', fontWeight: 700, background: profile?.plan === 'pro' ? C.accentBg : C.border, color: profile?.plan === 'pro' ? C.accent : C.muted }}>
                {profile?.plan === 'pro' ? '✦ Pro' : 'Gratuito'}
              </div>
            </div>
          </div>
          <div style={{ marginTop: '12px', paddingTop: '12px', borderTop: `1px solid ${C.border}` }}>
            <div style={{ fontSize: '11px', color: C.dim, textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: '4px' }}>Correo electrónico</div>
            <div style={{ fontSize: '13px', color: C.muted }}>{profile?.email || userEmail}</div>
          </div>
        </div>
        {profile?.plan !== 'pro' && (
          <div style={{ padding: '14px', background: C.accentBg, border: `1px solid ${C.accent}30`, borderRadius: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontWeight: 600, fontSize: '13px', marginBottom: '2px' }}>Actualiza a Pro</div>
              <div style={{ fontSize: '12px', color: C.muted }}>Analytics avanzados, importar/exportar, sin límite de operaciones</div>
            </div>
            <button onClick={() => window.location.href = '/?upgrade=true'} style={{ ...btn(), background: C.accent, color: C.bg, flexShrink: 0 }}>Upgrade →</button>
          </div>
        )}
        {profile?.plan === 'pro' && profile?.stripe_subscription_id && (
          <CancelSubscription subscriptionId={profile.stripe_subscription_id} onCancelled={onProfileUpdate} profile={profile} userId={userId} userEmail={userEmail} />
        )}
        {profile?.plan === 'pro' && !profile?.stripe_subscription_id && profile?.pro_expires_at && (
          <div style={{ padding: '14px', background: C.yellowBg, border: `1px solid ${C.yellow}30`, borderRadius: '10px' }}>
            <div style={{ fontWeight: 600, fontSize: '13px', color: C.yellow, marginBottom: '4px' }}>Pro por pago único (OXXO)</div>
            <div style={{ fontSize: '12px', color: C.muted }}>
              Tu acceso Pro vence el <b>{new Date(profile.pro_expires_at).toLocaleDateString('es-MX', { day: 'numeric', month: 'long', year: 'numeric' })}</b>. No se renueva automáticamente — para seguir en Pro, vuelve a pagar antes de esa fecha.
            </div>
          </div>
        )}
      </Section>

      {/* Referidos */}
      <Section title="Referidos">
        <ReferralSection userId={userId} profile={profile} />
      </Section>
    </div>
    </div>
  )
}
