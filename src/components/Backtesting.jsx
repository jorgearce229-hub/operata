import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { C, card, label, input, btn, badge } from '../lib/theme'

const empty = { instrument:'', direction:'LONG', result:'TP', entry_price:'', stop_loss:'', take_profit:'', trade_date:'', setup_notes:'', target_sample:30 }

export default function Backtesting({ userId, isPro }) {
  const [records, setRecords] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState(empty)
  const [saving, setSaving] = useState(false)
  const [filterInstrument, setFilterInstrument] = useState('ALL')
  const [targetSample, setTargetSample] = useState(30)

  useEffect(() => { loadRecords() }, [])

  const loadRecords = async () => {
    const { data } = await supabase.from('backtests').select('*').eq('user_id', userId).order('trade_date', { ascending: false })
    setRecords(data || [])
  }

  const saveRecord = async () => {
    setSaving(true)
    await supabase.from('backtests').insert({
      user_id: userId, ...form,
      entry_price: parseFloat(form.entry_price)||null,
      stop_loss: parseFloat(form.stop_loss)||null,
      take_profit: parseFloat(form.take_profit)||null,
      target_sample: parseInt(form.target_sample)||30,
    })
    setForm(empty); setShowForm(false); loadRecords(); setSaving(false)
  }

  const deleteRecord = async (id) => {
    await supabase.from('backtests').delete().eq('id', id); loadRecords()
  }

  const instruments = [...new Set(records.map(r=>r.instrument))].sort()
  const filtered = filterInstrument === 'ALL' ? records : records.filter(r=>r.instrument===filterInstrument)

  // Stats per instrument
  const stats = {}
  records.forEach(r => {
    if (!stats[r.instrument]) stats[r.instrument] = {total:0,tp:0,sl:0,be:0,sample:r.target_sample||30}
    stats[r.instrument].total++
    if (r.result==='TP') stats[r.instrument].tp++
    else if (r.result==='SL') stats[r.instrument].sl++
    else if (r.result==='BE') stats[r.instrument].be++
  })

  return (
    <div>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'20px'}}>
        <h1 style={{fontSize:'20px',fontWeight:700}}>Backtesting</h1>
        <div style={{display:'flex',gap:'8px',alignItems:'center'}}>
          <div style={{display:'flex',alignItems:'center',gap:'6px',fontSize:'13px',color:C.muted}}>
            <span>Meta de muestra:</span>
            <input style={{...input,width:'70px',padding:'6px 8px',textAlign:'center'}} type="number" value={targetSample}
              onChange={e=>setTargetSample(parseInt(e.target.value)||30)} />
            <span>ops</span>
          </div>
          <button style={btn()} onClick={()=>setShowForm(!showForm)}>{showForm?'✕ Cancelar':'+ Nuevo registro'}</button>
        </div>
      </div>

      {showForm && (
        <div style={{...card,border:`1px solid ${C.blue}40`}}>
          <div style={{fontSize:'13px',fontWeight:600,color:C.muted,textTransform:'uppercase',letterSpacing:'0.8px',marginBottom:'16px'}}>Registrar Backtest</div>
          <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(160px,1fr))',gap:'12px'}}>
            {[
              {l:'Instrumento',k:'instrument',ph:'EUR/USD, BTC...'},
              {l:'Dirección',k:'direction',type:'select',opts:['LONG','SHORT']},
              {l:'Resultado',k:'result',type:'select',opts:['TP','SL','BE']},
              {l:'Fecha',k:'trade_date',type:'date'},
              {l:'Entrada',k:'entry_price',type:'number',ph:'1.08500'},
              {l:'Stop Loss',k:'stop_loss',type:'number',ph:'1.08000'},
              {l:'Take Profit',k:'take_profit',type:'number',ph:'1.09500'},
              {l:'Meta de muestra',k:'target_sample',type:'number',ph:'30'},
            ].map(f=>(
              <div key={f.k}>
                <div style={label}>{f.l}</div>
                {f.type==='select'
                  ? <select style={input} value={form[f.k]} onChange={e=>setForm({...form,[f.k]:e.target.value})}>{f.opts.map(o=><option key={o} value={o}>{o}</option>)}</select>
                  : <input style={input} type={f.type||'text'} step="any" placeholder={f.ph||''} value={form[f.k]} onChange={e=>setForm({...form,[f.k]:e.target.value})} />
                }
              </div>
            ))}
          </div>
          <div style={{marginTop:'12px'}}>
            <div style={label}>Notas del setup</div>
            <textarea style={{...input,minHeight:'60px',resize:'vertical'}} value={form.setup_notes} onChange={e=>setForm({...form,setup_notes:e.target.value})} placeholder="Condiciones del setup, notas..."/>
          </div>
          <div style={{marginTop:'14px',display:'flex',justifyContent:'flex-end'}}>
            <button style={btn()} onClick={saveRecord} disabled={saving||!form.instrument}>{saving?'Guardando...':'Guardar'}</button>
          </div>
        </div>
      )}

      {Object.keys(stats).length > 0 && (
        <div style={card}>
          <div style={{fontSize:'13px',fontWeight:600,color:C.muted,textTransform:'uppercase',letterSpacing:'0.8px',marginBottom:'14px'}}>Resumen por Instrumento</div>
          <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(200px,1fr))',gap:'10px'}}>
            {Object.entries(stats).map(([inst,s]) => {
              const wr = s.total ? Math.round(s.tp/s.total*100) : 0
              const exp = s.total ? ((s.tp*2.5-s.sl)/s.total).toFixed(2) : 0
              const pct = Math.min(s.total/targetSample*100,100)
              return (
                <div key={inst} style={{padding:'14px',background:C.bg,borderRadius:'10px',border:`1px solid ${C.border}`}}>
                  <div style={{fontWeight:700,marginBottom:'6px',display:'flex',justifyContent:'space-between'}}>
                    <span>{inst}</span>
                    <span style={badge(s.total>=targetSample?'g':s.total>=targetSample*0.5?'y':'r')}>
                      {s.total>=targetSample?'✓ Completo':`${s.total}/${targetSample}`}
                    </span>
                  </div>
                  <div style={{height:'4px',background:C.border,borderRadius:'2px',marginBottom:'8px'}}>
                    <div style={{height:'100%',width:`${pct}%`,background:s.total>=targetSample?C.green:C.accent,borderRadius:'2px'}}/>
                  </div>
                  <div style={{display:'flex',gap:'12px',fontSize:'12px'}}>
                    <span style={{color:C.green}}>{s.tp}TP</span>
                    <span style={{color:C.red}}>{s.sl}SL</span>
                    <span style={{color:C.blue}}>{s.be}BE</span>
                    <span style={{color:wr>=50?C.green:C.yellow}}>{wr}% WR</span>
                    <span style={{color:exp>=0?C.green:C.red}}>{exp>=0?'+':''}{exp}R</span>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      <div style={card}>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'14px'}}>
          <div style={{fontSize:'13px',fontWeight:600,color:C.muted,textTransform:'uppercase',letterSpacing:'0.8px'}}>Registros ({filtered.length})</div>
          <select style={{...input,width:'auto',padding:'6px 10px'}} value={filterInstrument} onChange={e=>setFilterInstrument(e.target.value)}>
            <option value="ALL">Todos</option>
            {instruments.map(i=><option key={i} value={i}>{i}</option>)}
          </select>
        </div>
        {filtered.length===0 ? (
          <div style={{textAlign:'center',padding:'30px',color:C.muted}}>Sin registros</div>
        ) : (
          <table style={{width:'100%',borderCollapse:'collapse'}}>
            <thead><tr>
              {['Fecha','Instrumento','Dir','Resultado','Entrada','SL','TP','Muestra',''].map(h=>
                <th key={h} style={{textAlign:'left',padding:'8px 10px',fontSize:'11px',color:C.dim,textTransform:'uppercase',letterSpacing:'0.8px',borderBottom:`1px solid ${C.border}`,fontWeight:600}}>{h}</th>
              )}
            </tr></thead>
            <tbody>
              {filtered.map(r=>(
                <tr key={r.id}>
                  <td style={{padding:'9px 10px',fontSize:'12px',borderBottom:`1px solid ${C.border}08`}}>{r.trade_date||'—'}</td>
                  <td style={{padding:'9px 10px',fontSize:'13px',fontWeight:600,borderBottom:`1px solid ${C.border}08`}}>{r.instrument}</td>
                  <td style={{padding:'9px 10px',borderBottom:`1px solid ${C.border}08`}}><span style={badge(r.direction==='LONG'?'g':'r')}>{r.direction}</span></td>
                  <td style={{padding:'9px 10px',borderBottom:`1px solid ${C.border}08`}}><span style={badge(r.result==='TP'?'g':r.result==='SL'?'r':'b')}>{r.result}</span></td>
                  <td style={{padding:'9px 10px',fontSize:'12px',borderBottom:`1px solid ${C.border}08`}}>{r.entry_price||'—'}</td>
                  <td style={{padding:'9px 10px',fontSize:'12px',color:C.red,borderBottom:`1px solid ${C.border}08`}}>{r.stop_loss||'—'}</td>
                  <td style={{padding:'9px 10px',fontSize:'12px',color:C.green,borderBottom:`1px solid ${C.border}08`}}>{r.take_profit||'—'}</td>
                  <td style={{padding:'9px 10px',fontSize:'12px',borderBottom:`1px solid ${C.border}08`}}>{r.target_sample||30}</td>
                  <td style={{padding:'9px 10px',borderBottom:`1px solid ${C.border}08`}}>
                    <span style={{cursor:'pointer',color:C.dim,fontSize:'16px'}} onClick={()=>deleteRecord(r.id)}>×</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
