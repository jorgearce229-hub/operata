import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { C, card, btn, label, input } from '../lib/theme'

const CURRENCIES = ['USD','MXN','EUR','GBP','JPY','CAD','CHF','AUD']
const TYPES = [
  { v: 'real', l: '💰 Real' },
  { v: 'demo', l: '🧪 Demo' },
  { v: 'paper', l: '📄 Papel' },
]

const empty = { name: '', broker: '', currency: 'USD', balance: '', type: 'real' }

export default function Accounts({ userId, isPro, activeAccount, onAccountChange }) {
  const [accounts, setAccounts] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState(empty)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(null)
  const MAX = isPro ? 3 : 1

  useEffect(() => { loadAccounts() }, [])

  const loadAccounts = async () => {
    const { data } = await supabase.from('accounts').select('*').eq('user_id', userId).order('created_at')
    setAccounts(data || [])
    // Restore last active account
    const lastId = localStorage.getItem('operata-active-account')
    if (data?.length) {
      const last = data.find(a => a.id === lastId) || data[0]
      onAccountChange(last)
    }
  }

  const save = async () => {
    if (!form.name.trim()) return
    setSaving(true)
    const isFirstAccount = accounts.length === 0
    const { data } = await supabase.from('accounts')
      .insert({ user_id: userId, name: form.name, broker: form.broker, currency: form.currency, balance: parseFloat(form.balance) || 0, type: form.type })
      .select().single()
    if (data) {
      // Si es la primera cuenta que el usuario crea, le asignamos el historial de operaciones
      // que quedó sin cuenta (de antes de que existiera esta función). Cuentas creadas después
      // de la primera empiezan completamente en blanco, sin heredar nada.
      if (isFirstAccount) {
        await supabase.from('trades').update({ account_id: data.id }).eq('user_id', userId).is('account_id', null)
      }
      const updated = [...accounts, data]
      setAccounts(updated)
      if (!activeAccount) { onAccountChange(data); localStorage.setItem('operata-active-account', data.id) }
      setShowForm(false)
      setForm(empty)
    }
    setSaving(false)
  }

  const deleteAccount = async (id) => {
    setDeleting(id)
    await supabase.from('accounts').delete().eq('id', id)
    const remaining = accounts.filter(a => a.id !== id)
    setAccounts(remaining)
    if (activeAccount?.id === id) {
      const next = remaining[0] || null
      onAccountChange(next)
      if (next) localStorage.setItem('operata-active-account', next.id)
    }
    setDeleting(null)
  }

  const selectAccount = (account) => {
    onAccountChange(account)
    localStorage.setItem('operata-active-account', account.id)
  }

  const typeLabel = (t) => TYPES.find(x => x.v === t)?.l || t
  const canAdd = accounts.length < MAX

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h1 style={{ fontSize: '20px', fontWeight: 700 }}>Cuentas</h1>
        {canAdd
          ? <button onClick={() => setShowForm(!showForm)} style={{ ...btn(), fontSize: '13px' }}>{showForm ? '✕ Cancelar' : '+ Nueva cuenta'}</button>
          : <div style={{ fontSize: '12px', color: C.dim }}>Límite de {MAX} {isPro ? 'cuentas (Pro)' : 'cuenta (Free)'} alcanzado</div>}
      </div>

      {!isPro && accounts.length >= 1 && (
        <div style={{ padding: '12px 16px', background: C.accentBg, border: `1px solid ${C.accent}30`, borderRadius: '10px', marginBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: '13px', color: C.accent }}>🔒 Plan Pro permite hasta 3 cuentas</span>
          <button onClick={() => window.location.href = '/?upgrade=true'} style={{ ...btn(), fontSize: '12px', padding: '6px 14px' }}>Upgrade →</button>
        </div>
      )}

      {showForm && (
        <div style={{ ...card, border: `1px solid ${C.accent}40`, marginBottom: '20px' }}>
          <div style={{ fontSize: '13px', fontWeight: 600, color: C.muted, textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: '16px' }}>Nueva Cuenta</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
            <div><div style={label}>Nombre de la cuenta</div>
              <input style={input} placeholder="Ej: Swing Verde Principal" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} /></div>
            <div><div style={label}>Broker</div>
              <input style={input} placeholder="Ej: IBKR, Binance..." value={form.broker} onChange={e => setForm({ ...form, broker: e.target.value })} /></div>
            <div><div style={label}>Tipo</div>
              <select style={{ ...input, cursor: 'pointer' }} value={form.type} onChange={e => setForm({ ...form, type: e.target.value })}>
                {TYPES.map(t => <option key={t.v} value={t.v}>{t.l}</option>)}
              </select></div>
            <div><div style={label}>Moneda</div>
              <select style={{ ...input, cursor: 'pointer' }} value={form.currency} onChange={e => setForm({ ...form, currency: e.target.value })}>
                {CURRENCIES.map(c => <option key={c}>{c}</option>)}
              </select></div>
            <div style={{ gridColumn: '1/-1' }}><div style={label}>Capital inicial ({form.currency})</div>
              <input style={input} type="number" placeholder="Ej: 10000" value={form.balance} onChange={e => setForm({ ...form, balance: e.target.value })} /></div>
          </div>
          <button onClick={save} disabled={saving} style={{ ...btn(), fontSize: '13px' }}>{saving ? 'Guardando...' : 'Guardar cuenta'}</button>
        </div>
      )}

      {accounts.length === 0 && !showForm && (
        <div style={{ ...card, textAlign: 'center', padding: '60px' }}>
          <div style={{ fontSize: '36px', marginBottom: '12px' }}>🏦</div>
          <div style={{ fontWeight: 600, marginBottom: '6px' }}>Sin cuentas aún</div>
          <div style={{ color: C.muted, fontSize: '13px', marginBottom: '20px' }}>Crea tu primera cuenta para organizar tus operaciones</div>
          <button onClick={() => setShowForm(true)} style={{ ...btn(), fontSize: '13px' }}>+ Nueva cuenta</button>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '14px' }}>
        {accounts.map(a => {
          const isActive = activeAccount?.id === a.id
          return (
            <div key={a.id} onClick={() => selectAccount(a)} style={{
              padding: '20px', borderRadius: '14px', cursor: 'pointer',
              background: isActive ? C.accentBg : C.card,
              border: `2px solid ${isActive ? C.accent : C.border}`,
              transition: 'all 0.15s', position: 'relative'
            }}>
              {isActive && <div style={{ position: 'absolute', top: '12px', right: '12px', padding: '2px 8px', borderRadius: '20px', fontSize: '10px', fontWeight: 700, background: C.accent, color: C.bg }}>ACTIVA</div>}
              <div style={{ fontSize: '16px', fontWeight: 700, marginBottom: '4px', color: isActive ? C.accent : C.text }}>{a.name}</div>
              <div style={{ fontSize: '12px', color: C.dim, marginBottom: '12px' }}>{typeLabel(a.type)}{a.broker ? ` · ${a.broker}` : ''}</div>
              <div style={{ fontSize: '24px', fontWeight: 800, color: isActive ? C.accent : C.text }}>
                {a.currency} {(a.balance || 0).toLocaleString('es-MX', { minimumFractionDigits: 2 })}
              </div>
              <div style={{ marginTop: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '11px', color: C.dim }}>Capital inicial</span>
                <button onClick={e => { e.stopPropagation(); deleteAccount(a.id) }}
                  disabled={deleting === a.id}
                  style={{ ...btn('ghost'), fontSize: '11px', padding: '3px 8px', color: C.red }}>
                  {deleting === a.id ? '...' : 'Eliminar'}
                </button>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
