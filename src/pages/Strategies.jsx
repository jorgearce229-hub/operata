import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { C, card, btn, label, input } from '../lib/theme'

const CHECKLIST_TEMPLATES = {
  forex: [
    'Tendencia semanal confirmada (MM50)',
    'Precio en zona de retroceso Fibonacci (0.618–0.786)',
    'RSI 14 en 1H con señal de reversión',
    'Sin eventos de alto impacto hoy',
    'No es viernes',
    'Par en lista de operables',
  ],
  acciones: [
    'Tendencia en timeframe mayor confirmada',
    'Soporte/resistencia clave identificado',
    'Volumen confirma el movimiento',
    'Sin earnings esta semana',
    'Sector con momentum positivo',
  ],
  crypto: [
    'Tendencia en diario confirmada',
    'Nivel clave de soporte/resistencia',
    'Volumen por encima del promedio',
    'Sin noticias de regulación pendientes',
    'Dominancia de BTC considerada',
  ],
}

export default function Strategies({ userId }) {
  const [strategies, setStrategies] = useState([])
  const [selected, setSelected] = useState(null)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ name: '', description: '', market: 'forex', rules: [''] })
  const [saving, setSaving] = useState(false)
  const [checklist, setChecklist] = useState({})

  useEffect(() => { loadStrategies() }, [])

  const loadStrategies = async () => {
    const { data } = await supabase.from('strategies').select('*').eq('user_id', userId).order('created_at')
    setStrategies(data || [])
    if (data?.length && !selected) setSelected(data[0])
  }

  const addRule = () => setForm({ ...form, rules: [...form.rules, ''] })
  const updateRule = (i, v) => { const r = [...form.rules]; r[i] = v; setForm({ ...form, rules: r }) }
  const removeRule = (i) => setForm({ ...form, rules: form.rules.filter((_, j) => j !== i) })

  const save = async () => {
    if (!form.name.trim()) return
    setSaving(true)
    const rules = form.rules.filter(r => r.trim())
    const { data } = await supabase.from('strategies')
      .insert({ user_id: userId, name: form.name, description: form.description, market: form.market, rules })
      .select().single()
    if (data) {
      setStrategies([...strategies, data])
      setSelected(data)
      setShowForm(false)
      setForm({ name: '', description: '', market: 'forex', rules: [''] })
    }
    setSaving(false)
  }

  const deleteStrategy = async (id) => {
    await supabase.from('strategies').delete().eq('id', id)
    const remaining = strategies.filter(s => s.id !== id)
    setStrategies(remaining)
    setSelected(remaining[0] || null)
  }

  const toggleCheck = (key) => setChecklist(prev => ({ ...prev, [key]: !prev[key] }))
  const resetChecklist = () => setChecklist({})

  const allRules = selected ? [
    ...(selected.rules || []),
    ...CHECKLIST_TEMPLATES[selected.market] || []
  ].filter((r, i, arr) => arr.indexOf(r) === i) : []

  const checked = allRules.filter(r => checklist[r]).length
  const pct = allRules.length ? Math.round(checked / allRules.length * 100) : 0
  const color = pct >= 80 ? C.green : pct >= 50 ? C.yellow : C.red

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h1 style={{ fontSize: '20px', fontWeight: 700 }}>Estrategias</h1>
        <button onClick={() => setShowForm(!showForm)} style={{ ...btn(), fontSize: '13px' }}>
          {showForm ? '✕ Cancelar' : '+ Nueva estrategia'}
        </button>
      </div>

      {/* New strategy form */}
      {showForm && (
        <div style={{ ...card, border: `1px solid ${C.accent}40`, marginBottom: '20px' }}>
          <div style={{ fontSize: '13px', fontWeight: 600, color: C.muted, textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: '16px' }}>Nueva Estrategia</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
            <div>
              <div style={label}>Nombre</div>
              <input style={input} placeholder="Ej: Swing Verde" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
            </div>
            <div>
              <div style={label}>Mercado</div>
              <select value={form.market} onChange={e => setForm({ ...form, market: e.target.value })}
                style={{ ...input, cursor: 'pointer' }}>
                <option value="forex">Forex</option>
                <option value="acciones">Acciones</option>
                <option value="crypto">Crypto</option>
                <option value="futuros">Futuros</option>
                <option value="otro">Otro</option>
              </select>
            </div>
          </div>
          <div style={{ marginBottom: '12px' }}>
            <div style={label}>Descripción</div>
            <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })}
              placeholder="Describe tu estrategia brevemente..." rows={2}
              style={{ ...input, resize: 'vertical', fontFamily: 'inherit' }} />
          </div>
          <div style={{ marginBottom: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <div style={label}>Reglas del checklist</div>
              <button onClick={addRule} style={{ ...btn('ghost'), fontSize: '11px', padding: '4px 10px' }}>+ Agregar regla</button>
            </div>
            {form.rules.map((r, i) => (
              <div key={i} style={{ display: 'flex', gap: '8px', marginBottom: '6px' }}>
                <input style={{ ...input, flex: 1 }} placeholder={`Regla ${i + 1}`} value={r} onChange={e => updateRule(i, e.target.value)} />
                {form.rules.length > 1 && <button onClick={() => removeRule(i)} style={{ ...btn('ghost'), padding: '6px 10px', color: C.red }}>✕</button>}
              </div>
            ))}
            <div style={{ marginTop: '8px', padding: '10px', background: C.bg, borderRadius: '8px', border: `1px solid ${C.border}` }}>
              <div style={{ fontSize: '11px', color: C.dim, marginBottom: '6px' }}>Se agregarán automáticamente estas reglas base para {form.market}:</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                {(CHECKLIST_TEMPLATES[form.market] || []).map((r, i) => (
                  <span key={i} style={{ padding: '2px 8px', borderRadius: '4px', fontSize: '10px', background: C.accentBg, color: C.accent }}>✓ {r}</span>
                ))}
              </div>
            </div>
          </div>
          <button onClick={save} disabled={saving} style={{ ...btn(), fontSize: '13px' }}>
            {saving ? 'Guardando...' : 'Guardar estrategia'}
          </button>
        </div>
      )}

      {strategies.length === 0 && !showForm && (
        <div style={{ ...card, textAlign: 'center', padding: '60px' }}>
          <div style={{ fontSize: '36px', marginBottom: '12px' }}>📋</div>
          <div style={{ fontWeight: 600, marginBottom: '6px' }}>Sin estrategias aún</div>
          <div style={{ color: C.muted, fontSize: '13px', marginBottom: '20px' }}>Crea tu primera estrategia para activar el checklist pre-trade</div>
          <button onClick={() => setShowForm(true)} style={{ ...btn(), fontSize: '13px' }}>+ Nueva estrategia</button>
        </div>
      )}

      {strategies.length > 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: '220px 1fr', gap: '16px' }}>
          {/* Strategy list */}
          <div>
            {strategies.map(s => (
              <div key={s.id} onClick={() => { setSelected(s); resetChecklist() }}
                style={{ padding: '12px 14px', borderRadius: '10px', cursor: 'pointer', marginBottom: '6px',
                  background: selected?.id === s.id ? C.accentBg : C.card,
                  border: `1px solid ${selected?.id === s.id ? C.accent + '50' : C.border}` }}>
                <div style={{ fontWeight: 600, fontSize: '13px', color: selected?.id === s.id ? C.accent : C.text }}>{s.name}</div>
                <div style={{ fontSize: '11px', color: C.dim, marginTop: '2px', textTransform: 'capitalize' }}>{s.market}</div>
              </div>
            ))}
          </div>

          {/* Strategy detail + checklist */}
          {selected && (
            <div>
              <div style={card}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                  <div>
                    <div style={{ fontSize: '18px', fontWeight: 700 }}>{selected.name}</div>
                    <div style={{ fontSize: '12px', color: C.dim, textTransform: 'capitalize', marginTop: '2px' }}>{selected.market}</div>
                  </div>
                  <button onClick={() => deleteStrategy(selected.id)} style={{ ...btn('ghost'), fontSize: '11px', color: C.red, padding: '4px 10px' }}>Eliminar</button>
                </div>
                {selected.description && (
                  <div style={{ fontSize: '13px', color: C.muted, marginBottom: '16px', lineHeight: 1.6, padding: '10px', background: C.bg, borderRadius: '8px' }}>
                    {selected.description}
                  </div>
                )}

                {/* Checklist */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                  <div style={{ fontSize: '13px', fontWeight: 600, color: C.muted, textTransform: 'uppercase', letterSpacing: '0.8px' }}>
                    Checklist Pre-Trade
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{ fontSize: '13px', fontWeight: 700, color }}>
                      {checked}/{allRules.length} · {pct}%
                    </div>
                    <button onClick={resetChecklist} style={{ ...btn('ghost'), fontSize: '11px', padding: '4px 10px' }}>Reiniciar</button>
                  </div>
                </div>

                {/* Progress bar */}
                <div style={{ height: '6px', background: C.border, borderRadius: '3px', marginBottom: '16px' }}>
                  <div style={{ height: '100%', width: `${pct}%`, background: color, borderRadius: '3px', transition: 'width 0.3s' }} />
                </div>

                {allRules.map((rule, i) => {
                  const isChecked = checklist[rule]
                  return (
                    <div key={i} onClick={() => toggleCheck(rule)}
                      style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 12px', borderRadius: '8px',
                        marginBottom: '4px', cursor: 'pointer', background: isChecked ? C.greenBg : C.bg,
                        border: `1px solid ${isChecked ? C.green + '40' : C.border}`, transition: 'all 0.15s' }}>
                      <div style={{ width: '20px', height: '20px', borderRadius: '6px', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
                        background: isChecked ? C.green : 'transparent', border: `2px solid ${isChecked ? C.green : C.border}` }}>
                        {isChecked && <span style={{ color: '#fff', fontSize: '12px', fontWeight: 700 }}>✓</span>}
                      </div>
                      <span style={{ fontSize: '13px', color: isChecked ? C.green : C.muted, textDecoration: isChecked ? 'none' : 'none', fontWeight: isChecked ? 600 : 400 }}>
                        {rule}
                      </span>
                    </div>
                  )
                })}

                {pct < 100 && (
                  <div style={{ marginTop: '12px', padding: '10px 14px', background: pct >= 80 ? C.greenBg : pct >= 50 ? C.yellowBg : C.redBg,
                    border: `1px solid ${color}30`, borderRadius: '8px', fontSize: '12px', color }}>
                    {pct >= 80 ? '✅ Setup tiene buena confluencia — procede con precaución normal'
                      : pct >= 50 ? '⚠️ Setup parcial — revisa las reglas no cumplidas antes de entrar'
                      : '🚫 Setup débil — considera no entrar hasta cumplir más condiciones'}
                  </div>
                )}
                {pct === 100 && (
                  <div style={{ marginTop: '12px', padding: '10px 14px', background: C.greenBg, border: `1px solid ${C.green}30`, borderRadius: '8px', fontSize: '12px', color: C.green, fontWeight: 600 }}>
                    ✅ Todas las condiciones cumplidas — setup válido
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
