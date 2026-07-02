import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { C, label, input, btn } from '../lib/theme'

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

const FOCUSES = [
  { value: 'forex', label: '💱 Forex' },
  { value: 'stocks', label: '📈 Acciones' },
  { value: 'crypto', label: '₿ Criptomonedas' },
  { value: 'futures', label: '⚡ Futuros' },
  { value: 'universal', label: '🌍 Universal' },
]

export default function Settings({ profile, userId, onProfileUpdate, theme, onThemeChange, isPro, userEmail }) {
  const [form, setForm] = useState({
    full_name: profile?.full_name || '',
    trading_focus: profile?.trading_focus || 'forex',
    preferred_currency: profile?.preferred_currency || 'USD',
    language: profile?.language || 'es',
    timezone: profile?.timezone || 'America/Mazatlan',
    initial_capital: profile?.initial_capital || '',
  })
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  const save = async () => {
    setSaving(true)
    try {
      const updateData = {
        full_name: form.full_name,
        trading_focus: form.trading_focus || profile?.trading_focus || 'forex',
        preferred_currency: form.preferred_currency,
        language: form.language,
        timezone: form.timezone,
        initial_capital: form.initial_capital ? parseFloat(form.initial_capital) : null,
      }
      const { error } = await supabase.from('profiles').update(updateData).eq('id', userId)
      if (!error) {
        // Do NOT call onProfileUpdate — it causes Dashboard re-render and loses showSettings
        // Profile will be in sync on next page load
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
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h1 style={{ fontSize: '20px', fontWeight: 700 }}>Configuración</h1>
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
          <input style={input} type="text" value={form.full_name} onChange={e => setForm({ ...form, full_name: e.target.value })} placeholder="Tu nombre" />
        </Field>
        <Field label="Mercado principal">
          <Select value={form.trading_focus} onChange={v => setForm({ ...form, trading_focus: v })} options={FOCUSES} />
        </Field>
        <Field label="Idioma">
          <Select value={form.language} onChange={v => setForm({ ...form, language: v })} options={LANGUAGES} />
        </Field>
      </Section>

      {/* Regional */}
      <Section title="Región y moneda">
        <Field label="Zona horaria">
          <Select value={form.timezone} onChange={v => setForm({ ...form, timezone: v })} options={TIMEZONES} />
        </Field>
        <Field label="Moneda base">
          <Select value={form.preferred_currency} onChange={v => setForm({ ...form, preferred_currency: v })} options={CURRENCIES} />
        </Field>
        <Field label="Capital operativo (USD)">
          <input style={input} type="number" step="any" placeholder="Ej: 5000" value={form.initial_capital}
            onChange={e => setForm({ ...form, initial_capital: e.target.value })} />
        </Field>
        <div style={{ padding: '10px 12px', background: C.bg, borderRadius: '8px', border: `1px solid ${C.border}`, fontSize: '12px', color: C.muted }}>
          Se usa para calcular el rendimiento de tu portafolio en porcentaje (%) además de dólares.
        </div>
      </Section>

      {/* Datos */}
      <Section title="Datos y exportación">
        {isPro ? (
          <>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
              <button onClick={exportTrades} style={{ padding: '14px', borderRadius: '10px', border: `1px solid ${C.border}`, background: 'transparent', color: C.text, fontWeight: 600, fontSize: '13px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                📥 Exportar operaciones (CSV)
              </button>
              <button onClick={exportBacktests} style={{ padding: '14px', borderRadius: '10px', border: `1px solid ${C.border}`, background: 'transparent', color: C.text, fontWeight: 600, fontSize: '13px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                📥 Exportar backtests (CSV)
              </button>
            </div>
            <div style={{ fontSize: '12px', color: C.dim }}>Exporta todos tus datos en formato CSV compatible con Excel y Google Sheets.</div>
          </>
        ) : (
          <div style={{ padding: '20px', textAlign: 'center', border: `1px dashed ${C.border}`, borderRadius: '10px' }}>
            <div style={{ fontSize: '20px', marginBottom: '8px' }}>🔒</div>
            <div style={{ fontWeight: 600, marginBottom: '4px', fontSize: '14px' }}>Exportación de datos — Plan Pro</div>
            <div style={{ color: C.muted, fontSize: '13px', marginBottom: '14px' }}>Exporta tus operaciones y backtests en CSV compatible con Excel</div>
            <button style={{ padding: '8px 20px', borderRadius: '8px', border: 'none', background: C.accent, color: C.bg, fontWeight: 600, cursor: 'pointer', fontSize: '13px' }}>Upgrade a Pro →</button>
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
            <button style={{ ...btn(), background: C.accent, color: C.bg, flexShrink: 0 }}>Upgrade →</button>
          </div>
        )}
      </Section>
    </div>
  )
}
