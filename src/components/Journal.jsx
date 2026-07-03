import ImportTrades from './ImportTrades'
import { useState, useRef } from 'react'
import { supabase, FREE_TRADE_LIMIT } from '../lib/supabase'
import { C, card, label, input, btn, badge } from '../lib/theme'


const RESULTS = ['TP','SL','BE','MANUAL','OPEN']
const empty = { instrument:'', direction:'LONG', entry_price:'', stop_loss:'', take_profit:'', close_price:'', units:'', risk_pct:'1', result:'TP', pnl:'', entry_date:'', close_date:'', notes:'' }

export default function Journal({ trades, userId, onUpdate, isPro, tradeCount, profile }) {
  const [showForm, setShowForm] = useState(false)
  const [showImport, setShowImport] = useState(false)
  const [screenshotPreview, setScreenshotPreview] = useState(null)
  const screenshotRef = useRef(null)
  const screenshotFileRef = useRef(null)
  const [form, setForm] = useState(empty)
  const [saving, setSaving] = useState(false)
  const [filterMonth, setFilterMonth] = useState('ALL')
  const [deleting, setDeleting] = useState(null)
  const canAdd = isPro || tradeCount < FREE_TRADE_LIMIT

  const months = [...new Set(trades.map(t => (t.entry_date||'').slice(0,7)))].sort().reverse()
  const filtered = filterMonth === 'ALL' ? trades : trades.filter(t => (t.entry_date||'').startsWith(filterMonth))

  const grouped = filtered.reduce((acc, t) => {
    const m = (t.entry_date||'').slice(0,7) || 'Sin fecha'
    if (!acc[m]) acc[m] = []
    acc[m].push(t)
    return acc
  }, {})

  const uploadScreenshot = async (file) => {
    if (!file) return null
    try {
      const ext = file.name.split('.').pop()
      const path = `${userId}/${Date.now()}.${ext}`
      const { data, error } = await supabase.storage.from('trade-screenshots').upload(path, file, { upsert: true })
      if (error) { console.error('Upload error:', error); return null }
      const { data: urlData } = supabase.storage.from('trade-screenshots').getPublicUrl(path)
      console.log('Screenshot uploaded:', urlData.publicUrl)
      return urlData.publicUrl
    } catch(e) { console.error('Screenshot exception:', e); return null }
  }

  const saveTrade = async () => {
    setSaving(true)
    const entry = parseFloat(form.entry_price), sl = parseFloat(form.stop_loss)
    const riskPips = Math.abs(entry - sl)
    let rMultiple = 0
    if (form.result === 'TP') rMultiple = 2.5
    else if (form.result === 'SL') rMultiple = -1
    else if (form.close_price && riskPips > 0) {
      rMultiple = (parseFloat(form.close_price) - entry) / riskPips * (form.direction === 'LONG' ? 1 : -1)
    }
    await supabase.from('trades').insert({
      user_id: userId, ...form,
      entry_price: entry || null, stop_loss: sl || null,
      take_profit: parseFloat(form.take_profit) || null,
      close_price: parseFloat(form.close_price) || null,
      units: parseInt(form.units) || null,
      pnl: parseFloat(form.pnl) || 0,
      risk_pct: parseFloat(form.risk_pct) || null,
      r_multiple: Math.round(rMultiple * 100) / 100,
    })
    setForm(empty)
    screenshotFileRef.current = null
    setScreenshotPreview(null); setShowForm(false); onUpdate(); setSaving(false)
  }

  const deleteTrade = async (id) => {
    setDeleting(id)
    await supabase.from('trades').delete().eq('id', id)
    onUpdate(); setDeleting(null)
  }

  return (
    <div>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'20px' }}>
        <div>
          <h1 style={{ fontSize:'20px', fontWeight:700 }}>Diario de Trading</h1>

        </div>
        <div style={{ display:'flex', gap:'8px', alignItems:'center' }}>
          <select style={{ ...input, width:'auto', padding:'8px 12px' }} value={filterMonth} onChange={e=>setFilterMonth(e.target.value)}>
            <option value="ALL">Todos los meses</option>
            {months.map(m=><option key={m} value={m}>{m}</option>)}
          </select>
{isPro && <button style={{...btn("ghost"),fontSize:"13px"}} onClick={()=>{setShowImport(!showImport);setShowForm(false)}}>{showImport ? "✕ Cancelar" : "📥 Importar CSV"}</button>}
          {canAdd && <button style={btn()} onClick={()=>{setShowForm(!showForm);setShowImport(false)}}>
            {showForm ? '✕ Cancelar' : '+ Nueva operación'}
          </button>}
        </div>
      </div>

      {!canAdd && (
        <div style={{ ...card, textAlign:'center', padding:'40px', border:`1px solid ${C.yellow}30` }}>
          <div style={{ fontSize:'32px', marginBottom:'12px' }}>🔒</div>
          <div style={{ fontSize:'15px', fontWeight:600, marginBottom:'6px' }}>Límite del plan gratuito alcanzado</div>
          <div style={{ color:C.muted, fontSize:'13px', marginBottom:'16px' }}>Actualiza a Pro para operaciones ilimitadas</div>
          <button style={btn()}>Upgrade a Pro</button>
        </div>
      )}

      {isPro && showImport && <ImportTrades userId={userId} onImported={() => { setShowImport(false); onUpdate() }} />}
      {showForm && canAdd && (
        <div style={{ ...card, border:`1px solid ${C.accent}40` }}>
          <div style={{ fontSize:'13px', fontWeight:600, color:C.muted, textTransform:'uppercase', letterSpacing:'0.8px', marginBottom:'16px' }}>Nueva Operación</div>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(180px, 1fr))', gap:'12px' }}>
            {[
              { l:'Instrumento', k:'instrument', ph:'EUR/USD, BTC/USD...' },
              { l:'Dirección', k:'direction', type:'select', opts:['LONG','SHORT'] },
              { l:'Fecha entrada', k:'entry_date', type:'date' },
              { l:'Fecha cierre', k:'close_date', type:'date' },
              { l:'Precio entrada', k:'entry_price', type:'number', ph:'1.08500' },
              { l:'Stop Loss', k:'stop_loss', type:'number', ph:'1.08000' },
              { l:'Take Profit', k:'take_profit', type:'number', ph:'1.09500' },
              { l:'Precio cierre', k:'close_price', type:'number', ph:'1.09000' },
              { l:'Resultado', k:'result', type:'select', opts:RESULTS },
              { l:'Unidades', k:'units', type:'number', ph:'10000' },
              { l:'P&L (USD)', k:'pnl', type:'number', ph:'25.50' },
              { l:'Riesgo (%)', k:'risk_pct', type:'number', ph:'1' },
            ].map(f => (
              <div key={f.k}>
                <div style={label}>{f.l}</div>
                {f.type === 'select' ? (
                  <select style={{ ...input }} value={form[f.k]} onChange={e=>setForm({...form,[f.k]:e.target.value})}>
                    {f.opts.map(o=><option key={o} value={o}>{o}</option>)}
                  </select>
                ) : (
                  <input style={input} type={f.type||'text'} step="any" placeholder={f.ph||''} value={form[f.k]}
                    onChange={e=>setForm({...form,[f.k]:e.target.value})} />
                )}
              </div>
            ))}
          </div>
          <div style={{ marginTop:'12px' }}>
            <div style={label}>Notas</div>
            <textarea style={{ ...input, minHeight:'70px', resize:'vertical' }} value={form.notes}
              placeholder="Observaciones, setup, confluencias..." onChange={e=>setForm({...form,notes:e.target.value})} />
          </div>
          <div style={{ marginTop:'12px' }}>
            <div style={label}>Captura del setup (opcional)</div>
            <input ref={screenshotRef} type="file" accept="image/*" style={{ display:'none' }}
              onChange={e => {
                const f = e.target.files[0]
                if (f) { screenshotFileRef.current = f; setScreenshotPreview(URL.createObjectURL(f)) }
              }} />
            {screenshotPreview ? (
              <div style={{ position:'relative', display:'inline-block' }}>
                <img src={screenshotPreview} alt="preview" style={{ maxWidth:'100%', maxHeight:'160px', borderRadius:'8px', border:`1px solid ${C.border}` }} />
                <button onClick={() => { screenshotFileRef.current = null; setScreenshotPreview(null) }}
                  style={{ position:'absolute', top:'4px', right:'4px', padding:'2px 8px', borderRadius:'4px', border:'none', background:'rgba(0,0,0,0.8)', color:'#fff', cursor:'pointer', fontSize:'11px' }}>✕</button>
              </div>
            ) : (
              <div onClick={() => screenshotRef.current.click()} style={{ padding:'16px', border:`2px dashed ${C.border}`, borderRadius:'8px', textAlign:'center', cursor:'pointer', fontSize:'12px', color:C.dim, transition:'border-color 0.15s' }}
                onMouseEnter={e => e.currentTarget.style.borderColor = C.accent}
                onMouseLeave={e => e.currentTarget.style.borderColor = C.border}>
                📸 Clic para agregar captura del setup
              </div>
            )}
          </div>
          <div style={{ marginTop:'16px', display:'flex', justifyContent:'flex-end' }}>
            <button style={btn()} onClick={saveTrade} disabled={saving || !form.instrument}>
              {saving ? 'Guardando...' : 'Guardar operación'}
            </button>
          </div>
        </div>
      )}

      {Object.keys(grouped).length === 0 && !showForm ? (
        <div style={{ ...card, textAlign:'center', padding:'60px' }}>
          <div style={{ fontSize:'40px', marginBottom:'12px' }}>📋</div>
          <div style={{ fontSize:'15px', fontWeight:600, marginBottom:'6px' }}>Sin operaciones registradas</div>
          <div style={{ color:C.muted, fontSize:'13px' }}>Registra tu primera operación para comenzar</div>
        </div>
      ) : Object.entries(grouped).map(([month, mTrades]) => {
        const pnl = mTrades.reduce((s,t)=>s+(t.pnl||0),0)
        const wins = mTrades.filter(t=>t.result==='TP').length
        const wr = mTrades.length ? Math.round(wins/mTrades.length*100) : 0
        return (
          <div key={month} style={card}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'14px' }}>
              <div style={{ fontSize:'13px', fontWeight:600, color:C.muted, textTransform:'uppercase', letterSpacing:'0.8px' }}>{month}</div>
              <div style={{ display:'flex', gap:'16px', fontSize:'12px' }}>
                <span style={{ color:C.muted }}>{mTrades.length} ops</span>
                <span style={{ color:wr>=50?C.green:C.yellow }}>WR: {wr}%</span>
                <span style={{ fontWeight:700, color:pnl>=0?C.green:C.red }}>{pnl>=0?'+':''}${pnl.toFixed(2)}</span>
              </div>
            </div>
            <div style={{ overflowX:'auto' }}>
              <table style={{ width:'100%', borderCollapse:'collapse', minWidth:'600px' }}>
                <thead><tr>
                  {['Fecha','Instrumento','Dir','Entrada','SL','TP','Resultado','R','P&L','📸',''].map(h=>
                    <th key={h} style={{ textAlign:'left', padding:'8px 10px', fontSize:'11px', color:C.dim, textTransform:'uppercase', letterSpacing:'0.8px', borderBottom:`1px solid ${C.border}`, fontWeight:600 }}>{h}</th>
                  )}
                </tr></thead>
                <tbody>
                  {mTrades.map(t => (
                    <tr key={t.id}>
                      <td style={{ padding:'9px 10px', fontSize:'13px', borderBottom:`1px solid ${C.border}08` }}>{t.entry_date||'—'}</td>
                      <td style={{ padding:'9px 10px', fontSize:'13px', fontWeight:600, borderBottom:`1px solid ${C.border}08` }}>{t.instrument}</td>
                      <td style={{ padding:'9px 10px', borderBottom:`1px solid ${C.border}08` }}>
                        <span style={badge(t.direction==='LONG'?'g':'r')}>{t.direction}</span>
                      </td>
                      <td style={{ padding:'9px 10px', fontSize:'12px', borderBottom:`1px solid ${C.border}08` }}>{t.entry_price||'—'}</td>
                      <td style={{ padding:'9px 10px', fontSize:'12px', color:C.red, borderBottom:`1px solid ${C.border}08` }}>{t.stop_loss||'—'}</td>
                      <td style={{ padding:'9px 10px', fontSize:'12px', color:C.green, borderBottom:`1px solid ${C.border}08` }}>{t.take_profit||'—'}</td>
                      <td style={{ padding:'9px 10px', borderBottom:`1px solid ${C.border}08` }}>
                        <span style={badge(t.result==='TP'?'g':t.result==='SL'?'r':t.result==='BE'?'b':'y')}>{t.result}</span>
                      </td>
                      <td style={{ padding:'9px 10px', fontSize:'13px', fontWeight:600, color:(t.r_multiple||0)>=0?C.green:C.red, borderBottom:`1px solid ${C.border}08` }}>
                        {t.r_multiple!=null?((t.r_multiple>=0?'+':'')+t.r_multiple+'R'):'—'}
                      </td>
                      <td style={{ padding:'9px 10px', fontSize:'13px', fontWeight:600, color:(t.pnl||0)>=0?C.green:C.red, borderBottom:`1px solid ${C.border}08` }}>
                        {(t.pnl||0)>=0?'+':''}${(t.pnl||0).toFixed(2)}
                      </td>
                      <td style={{ padding:'9px 10px', borderBottom:`1px solid ${C.border}08` }}>
                        {t.screenshot_url
                          ? <img src={t.screenshot_url} alt="setup"
                              onClick={() => window.open(t.screenshot_url, '_blank')}
                              style={{ width:'48px', height:'32px', objectFit:'cover', borderRadius:'4px', cursor:'pointer', border:`1px solid ${C.border}`, display:'block' }} />
                          : <span style={{ color:C.dim, fontSize:'12px' }}>—</span>}
                      </td>
                      <td style={{ padding:'9px 10px', borderBottom:`1px solid ${C.border}08` }}>
                        <span style={{ cursor:'pointer', color:C.dim, fontSize:'16px' }}
                          onClick={()=>deleteTrade(t.id)}>{deleting===t.id?'..':'×'}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )
      })}
    </div>
  )
}
