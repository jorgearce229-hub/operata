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

export default function Settings({ profile, userId, onProfileUpdate, theme, onThemeChange }) {
  const [form, setForm] = useState({
    full_name: profile?.full_name || '',
    trading_focus: profile?.trading_focus || 'forex',
    preferred_currency: profile?.preferred_currency || 'USD',
    language: profile?.language || 'es',
    timezone: profile?.timezone || 'America/Mazatlan',
  })
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  const save = async () => {
    setSaving(true)
    const { data } = await supabase.from('profiles').update(form).eq('id', userId).select().single()
    onProfileUpdate(data)
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 2500)
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
        <button onClick={save} disabled={saving} style={{ ...btn(), background: saved ? C.green : C.accent, color: C.bg }}>
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
        <div style={{ padding: '10px 12px', background: C.bg, borderRadius: '8px', border: `1px solid ${C.border}`, fontSize: '12px', color: C.muted }}>
          La moneda base se usa para mostrar tu P&L y métricas en tu moneda local.
        </div>
      </Section>

      {/* Datos */}
      <Section title="Datos y exportación">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
          <button onClick={exportTrades} style={{ padding: '14px', borderRadius: '10px', border: `1px solid ${C.border}`, background: 'transparent', color: C.text, fontWeight: 600, fontSize: '13px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
            📥 Exportar operaciones (CSV)
          </button>
          <button onClick={exportBacktests} style={{ padding: '14px', borderRadius: '10px', border: `1px solid ${C.border}`, background: 'transparent', color: C.text, fontWeight: 600, fontSize: '13px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
            📥 Exportar backtests (CSV)
          </button>
        </div>
        <div style={{ fontSize: '12px', color: C.dim }}>
          Exporta todos tus datos en formato CSV compatible con Excel y Google Sheets.
        </div>
      </Section>

      {/* Cuenta */}
      <Section title="Cuenta">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px', background: C.bg, borderRadius: '8px', border: `1px solid ${C.border}` }}>
          <div>
            <div style={{ fontSize: '13px', fontWeight: 600 }}>{profile?.email}</div>
            <div style={{ fontSize: '11px', color: C.dim, marginTop: '2px' }}>
              Plan: <span style={{ color: profile?.plan === 'pro' ? C.accent : C.muted, fontWeight: 600 }}>{profile?.plan === 'pro' ? 'Pro ✦' : 'Gratuito'}</span>
            </div>
          </div>
          {profile?.plan !== 'pro' && (
            <button style={{ ...btn(), background: C.accent, color: C.bg }}>Upgrade a Pro</button>
          )}
        </div>
      </Section>
    </div>
  )
}
