import { useState, useEffect } from 'react'
import { C, card } from '../lib/theme'

export default function EconomicCalendar() {
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(false)
  const [lastFetch, setLastFetch] = useState(null)
  const [error, setError] = useState(null)
  const [filterImpact, setFilterImpact] = useState({ high: true, medium: true, low: false })
  const [expandedEvent, setExpandedEvent] = useState(null)
  const [activeDay, setActiveDay] = useState('ALL')

  const todayISO = () => {
    const d = new Date()
    return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`
  }

  const getDateRange = () => {
    const now = new Date()
    const end = new Date(now)
    const dow = now.getDay()
    const daysToFri = (5 - dow + 14) % 7 || 7
    end.setDate(now.getDate() + daysToFri + 7)
    const fmt = d => `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`
    return { from: fmt(now), to: fmt(end) }
  }

  const parseImp = i => {
    const n = parseInt(i)
    if (n >= 2) return 'high'
    if (n === 1) return 'medium'
    return 'low'
  }

  const fetchCalendar = async () => {
    setLoading(true); setError(null)
    const { from, to } = getDateRange()
    const FCS_KEY = 'eeE1nFSh5Ra8H5Bs88UYOgNtREMN2lEAx'
    const target = `https://fcsapi.com/api-v3/forex/economy_cal?country=US,GB,EU,JP,CH,CA,AU,NZ&from=${from}&to=${to}&access_key=${FCS_KEY}`
    const url = `https://corsproxy.io/?${encodeURIComponent(target)}`
    try {
      const res = await fetch(url)
      const data = await res.json()

      if (!data.status || !data.response) {
        setError(`Error de API: ${JSON.stringify(data).slice(0, 200)}`)
        setLoading(false); return
      }

      const parsed = data.response.map(e => {
        const dt = e.date || ''
        return {
          id: e.id,
          date: dt.slice(0,10),
          time: dt.slice(11,16),
          event: e.title || e.indicator || '',
          currency: e.currency || e.country || '',
          impact: parseImp(e.importance),
          previous: String(e.previous||''),
          forecast: String(e.forecast||''),
          actual: String(e.actual||''),
        }
      }).filter(e => e.date && e.event)
        .sort((a,b) => (a.date+a.time)<(b.date+b.time)?-1:1)

      setEvents(parsed)
      setLastFetch(new Date().toLocaleTimeString('es-MX'))
    } catch (err) {
      setError(`Error de conexión: ${err.message}`)
    }
    setLoading(false)
  }

  useEffect(()=>{ fetchCalendar() },[])

  const todayStr = todayISO()
  const visible = events.filter(e => filterImpact[e.impact])
  const filtered = activeDay==='ALL' ? visible : visible.filter(e=>e.date===activeDay)
  const uniqueDates = [...new Set(visible.map(e=>e.date))].sort()
  const dayNames = {"1":"Lun","2":"Mar","3":"Mié","4":"Jue","5":"Vie","6":"Sáb","0":"Dom"}

  const allPairs = ['EUR/USD','GBP/USD','USD/JPY','USD/CHF','EUR/JPY','GBP/JPY','EUR/GBP','EUR/CHF','EUR/CAD','GBP/CHF','AUD/USD','USD/CAD','NZD/USD']
  const todayHighCurr = new Set(events.filter(e=>e.date===todayStr&&e.impact==='high').map(e=>e.currency))
  const safePairs = allPairs.filter(p=>{const[b,q]=p.split('/');return !todayHighCurr.has(b)&&!todayHighCurr.has(q)})
  const unsafePairs = allPairs.filter(p=>{const[b,q]=p.split('/');return todayHighCurr.has(b)||todayHighCurr.has(q)})

  const impColor = i => i==='high'?C.red:i==='medium'?C.yellow:C.dim
  const B = (c) => ({display:'inline-block',padding:'3px 8px',borderRadius:'6px',fontSize:'11px',fontWeight:600,background:c==='g'?C.greenBg:c==='r'?C.redBg:C.blueBg,color:c==='g'?C.green:c==='r'?C.red:C.blue})

  return (
    <div>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'20px'}}>
        <h1 style={{fontSize:'20px',fontWeight:700}}>Calendario Económico</h1>
        <div style={{display:'flex',alignItems:'center',gap:'10px'}}>
          {lastFetch&&<span style={{fontSize:'11px',color:C.dim}}>Act: {lastFetch}</span>}
          <button onClick={fetchCalendar} disabled={loading} style={{padding:'8px 14px',borderRadius:'8px',border:'none',background:C.accent,color:C.bg,fontWeight:600,fontSize:'13px',cursor:'pointer'}}>
            {loading?'⟳ Cargando...':'↻ Actualizar'}
          </button>
        </div>
      </div>

      {error&&<div style={{padding:'12px 16px',background:C.redBg,border:`1px solid ${C.red}30`,borderRadius:'10px',marginBottom:'16px',color:C.red,fontSize:'13px'}}>{error}</div>}

      {/* Safe/Unsafe */}
      {!loading&&events.length>0&&(
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'12px',marginBottom:'16px'}}>
          <div style={{...card,border:`1px solid ${C.green}30`,marginBottom:0}}>
            <div style={{fontSize:'12px',fontWeight:600,color:C.muted,textTransform:'uppercase',letterSpacing:'0.8px',marginBottom:'8px'}}>✅ Pares Seguros Hoy</div>
            {todayHighCurr.size===0
              ?<div style={{color:C.green,fontSize:'13px',fontWeight:600}}>Sin eventos de alto impacto hoy</div>
              :<div style={{display:'flex',flexWrap:'wrap',gap:'5px'}}>{safePairs.map(p=><span key={p} style={B('g')}>{p}</span>)}</div>
            }
          </div>
          <div style={{...card,border:`1px solid ${C.red}30`,marginBottom:0}}>
            <div style={{fontSize:'12px',fontWeight:600,color:C.muted,textTransform:'uppercase',letterSpacing:'0.8px',marginBottom:'8px'}}>🚫 Pares Restringidos Hoy</div>
            {unsafePairs.length===0
              ?<div style={{color:C.muted,fontSize:'13px'}}>Ninguno</div>
              :<>
                <div style={{fontSize:'11px',color:C.red,marginBottom:'5px'}}>Monedas: {[...todayHighCurr].join(', ')}</div>
                <div style={{display:'flex',flexWrap:'wrap',gap:'5px'}}>{unsafePairs.map(p=><span key={p} style={B('r')}>{p}</span>)}</div>
              </>
            }
          </div>
        </div>
      )}

      {/* Filters */}
      <div style={{display:'flex',gap:'8px',marginBottom:'12px',flexWrap:'wrap'}}>
        {[{k:'high',l:'Alto',c:C.red},{k:'medium',l:'Medio',c:C.yellow},{k:'low',l:'Bajo',c:C.dim}].map(f=>(
          <button key={f.k} onClick={()=>setFilterImpact({...filterImpact,[f.k]:!filterImpact[f.k]})} style={{
            display:'flex',alignItems:'center',gap:'5px',padding:'6px 12px',borderRadius:'6px',fontSize:'12px',fontWeight:600,cursor:'pointer',
            border:`1px solid ${filterImpact[f.k]?f.c+'50':C.border}`,background:filterImpact[f.k]?f.c+'15':'transparent',
            color:filterImpact[f.k]?f.c:C.dim,opacity:filterImpact[f.k]?1:0.5}}>
            <span style={{width:'8px',height:'8px',borderRadius:'2px',background:f.c,display:'inline-block'}}/>{f.l}
          </button>
        ))}
        <span style={{fontSize:'12px',color:C.dim,alignSelf:'center'}}>{filtered.length} eventos</span>
      </div>

      {/* Day pills */}
      <div style={{display:'flex',gap:'6px',marginBottom:'16px',flexWrap:'wrap'}}>
        <button onClick={()=>setActiveDay('ALL')} style={{padding:'6px 12px',borderRadius:'8px',fontSize:'12px',fontWeight:600,cursor:'pointer',border:`1px solid ${activeDay==='ALL'?C.accent:C.border}`,background:activeDay==='ALL'?C.accentBg:'transparent',color:activeDay==='ALL'?C.accent:C.muted}}>Todos</button>
        {uniqueDates.map(d=>{
          const dn=dayNames[new Date(d+'T12:00:00').getDay().toString()]||''
          const isToday=d===todayStr,isActive=activeDay===d,n=visible.filter(e=>e.date===d).length
          return <button key={d} onClick={()=>setActiveDay(d)} style={{padding:'6px 12px',borderRadius:'8px',fontSize:'12px',fontWeight:600,cursor:'pointer',display:'flex',alignItems:'center',gap:'4px',
            border:`1px solid ${isActive?C.accent:isToday?C.accent+'50':C.border}`,background:isActive?C.accentBg:isToday?C.accentBg+'40':'transparent',color:isActive||isToday?C.accent:C.muted}}>
            {dn} {d.slice(8)}{isToday&&<span style={{fontSize:'8px'}}>●</span>}
            <span style={{fontSize:'10px',color:C.dim}}>({n})</span>
          </button>
        })}
      </div>

      {loading&&<div style={{textAlign:'center',padding:'50px'}}>
        <div style={{width:'32px',height:'32px',border:`2px solid ${C.border}`,borderTop:`2px solid ${C.accent}`,borderRadius:'50%',animation:'spin 1s linear infinite',margin:'0 auto 12px'}}/>
        <div style={{color:C.muted,fontSize:'13px'}}>Obteniendo datos...</div>
      </div>}

      {!loading&&filtered.length>0&&(
        <div style={card}>
          <div style={{display:'grid',gridTemplateColumns:'80px 56px 50px 36px 1fr 70px 70px 20px',gap:'6px',padding:'0 10px 8px',borderBottom:`1px solid ${C.border}`,marginBottom:'4px'}}>
            {['Día','Hora','Divisa','','Evento','Pronóst.','Previo',''].map((h,i)=><span key={i} style={{fontSize:'10px',color:C.dim,textTransform:'uppercase',letterSpacing:'0.8px',fontWeight:600}}>{h}</span>)}
          </div>
          {(()=>{
            const byDate={}
            filtered.forEach(e=>{if(!byDate[e.date])byDate[e.date]=[];byDate[e.date].push(e)})
            return Object.entries(byDate).sort((a,b)=>a[0]<b[0]?-1:1).map(([date,dayEvs])=>{
              const dn=dayNames[new Date(date+'T12:00:00').getDay().toString()]||'?'
              const isToday=date===todayStr
              return <div key={date} style={{display:'flex',borderBottom:`1px solid ${C.border}20`,paddingBottom:'4px',marginBottom:'4px'}}>
                <div style={{width:'80px',flexShrink:0,paddingTop:'10px',paddingLeft:'2px'}}>
                  <div style={{fontSize:'12px',fontWeight:700,color:isToday?C.accent:C.text}}>{dn}</div>
                  <div style={{fontSize:'12px',fontWeight:700,color:isToday?C.accent:C.text}}>{date.slice(5)}</div>
                  {isToday&&<span style={{display:'inline-block',padding:'2px 5px',borderRadius:'4px',fontSize:'9px',fontWeight:600,background:C.greenBg,color:C.green,marginTop:'3px'}}>HOY</span>}
                </div>
                <div style={{flex:1}}>
                  {dayEvs.map((e,i)=>{
                    const key=`${date}-${i}`,isExp=expandedEvent===key
                    const ic=impColor(e.impact)
                    const aff=allPairs.filter(p=>p.includes(e.currency))
                    return <div key={i}>
                      <div onClick={()=>setExpandedEvent(isExp?null:key)} style={{display:'grid',gridTemplateColumns:'56px 50px 36px 1fr 70px 70px 20px',gap:'6px',alignItems:'center',padding:'7px 10px',borderRadius:'6px',cursor:'pointer',background:isExp?C.accentBg:i%2===0?C.bg:'transparent'}}>
                        <span style={{fontSize:'11px',color:C.muted}}>{e.time||'All Day'}</span>
                        <span style={{fontSize:'11px',fontWeight:700,color:C.text}}>{e.currency}</span>
                        <span style={{width:'12px',height:'12px',borderRadius:'2px',background:ic,display:'inline-block',flexShrink:0}}/>
                        <span style={{fontSize:'12px',color:C.text,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{e.event}</span>
                        <span style={{fontSize:'11px',color:C.muted,textAlign:'right'}}>{e.forecast||'—'}</span>
                        <span style={{fontSize:'11px',color:e.actual?C.accent:C.muted,textAlign:'right',fontWeight:e.actual?700:400}}>{e.actual||e.previous||'—'}</span>
                        <span style={{color:C.dim,fontSize:'10px',textAlign:'center'}}>{isExp?'▲':'▼'}</span>
                      </div>
                      {isExp&&<div style={{padding:'10px 14px',marginBottom:'4px',background:C.card,borderRadius:'6px',border:`1px solid ${C.border}`}}>
                        <div style={{fontSize:'12px',color:C.muted,marginBottom:'6px'}}>
                          Previo: <b style={{color:C.text}}>{e.previous||'—'}</b>
                          <span style={{marginLeft:'12px'}}>Pronóstico: <b style={{color:C.text}}>{e.forecast||'—'}</b></span>
                          {e.actual&&<span style={{marginLeft:'12px'}}>Actual: <b style={{color:C.accent}}>{e.actual}</b></span>}
                        </div>
                        {aff.length>0&&<>
                          <div style={{fontSize:'11px',color:C.dim,marginBottom:'5px'}}>Pares afectados por <b style={{color:C.text}}>{e.currency}</b>:</div>
                          <div style={{display:'flex',flexWrap:'wrap',gap:'5px'}}>
                            {aff.map(p=><span key={p} style={B(e.impact==='high'?'r':'b')}>{p}</span>)}
                          </div>
                        </>}
                        {e.impact==='high'&&<div style={{marginTop:'8px',fontSize:'11px',color:C.red,fontWeight:600}}>⚠ Evento de alto impacto — evita nuevas posiciones en estos pares hoy</div>}
                      </div>}
                    </div>
                  })}
                </div>
              </div>
            })
          })()}
        </div>
      )}

      {!loading&&filtered.length===0&&!error&&events.length===0&&(
        <div style={{...card,textAlign:'center',padding:'50px'}}>
          <div style={{fontSize:'32px',marginBottom:'10px'}}>📅</div>
          <div style={{color:C.muted,fontSize:'13px'}}>Sin eventos disponibles</div>
        </div>
      )}

      <div style={card}>
        <div style={{fontSize:'11px',color:C.dim}}>⛔ No abrir posiciones el día de cualquier evento de <span style={{color:C.red}}>alto impacto</span> · Datos: FCS API</div>
      </div>
    </div>
  )
}
