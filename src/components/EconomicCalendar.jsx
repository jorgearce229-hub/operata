import { useState, useEffect } from 'react'
import { C, card } from '../lib/theme'

export default function EconomicCalendar({ focus }) {
  const [calData, setCalData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [lastFetch, setLastFetch] = useState(null)
  const [filterImpact, setFilterImpact] = useState({high:true,medium:true,low:false})
  const [expandedEvent, setExpandedEvent] = useState(null)

  const todayISO = () => { const d=new Date(); return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}` }

  const fetchCalendar = async () => {
    setLoading(true)
    const todayStr = new Date().toLocaleDateString('es-MX',{weekday:'long',day:'numeric',month:'long',year:'numeric'})
    const now=new Date(),dow=now.getDay()
    const mon=new Date(now); mon.setDate(now.getDate()-((dow+6)%7))
    const fri=new Date(mon); fri.setDate(mon.getDate()+11)
    const fmt=d=>`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`
    const startISO=todayISO(), endISO=fmt(fri)

    const res = await fetch('https://api.anthropic.com/v1/messages',{
      method:'POST',headers:{'Content-Type':'application/json'},
      body:JSON.stringify({model:'claude-sonnet-4-6',max_tokens:8000,tools:[{type:'web_search_20250305',name:'web_search'}],
        messages:[{role:'user',content:`Today is ${todayStr} (${startISO}). Search site:investing.com economic calendar for forex events from ${startISO} to ${endISO}. CRITICAL: respond with ONLY a raw JSON object starting with { and ending with }. No text before or after. No markdown. JSON format: {"days":[{"date":"${startISO}","time":"09:00","event":"Event Name","currency":"USD","impact":"high","previous":"1.0%","forecast":"1.2%","actual":""}],"centralBankEvents":[{"date":"${startISO}","event":"FOMC","currencies":["USD"],"type":"rate_decision"}]}. Include ALL high and medium impact events Mon-Fri in the range. Use impact values: "high","medium","low" only.`}]})
    }).then(r=>r.json()).catch(()=>({error:'failed'}))

    const text=(res?.content||[]).filter(b=>b.type==='text').map(b=>b.text).join('\n')||''
    let parsed={days:[],centralBankEvents:[]}
    try {
      let clean=text.replace(/```json\s*/gi,'').replace(/```\s*/g,'').trim()
      const first=clean.indexOf('{')
      if(first>=0){
        let candidate=clean.slice(first),success=false
        for(let trim=0;trim<500&&!success;trim++){
          const attempt=trim===0?candidate:candidate.slice(0,candidate.length-trim)
          const last=attempt.lastIndexOf('}')
          if(last<0) break
          try{parsed=JSON.parse(attempt.slice(0,last+1));success=true}catch{}
        }
      }
    } catch {}
    if(!Array.isArray(parsed.days)) parsed.days=[]
    if(!Array.isArray(parsed.centralBankEvents)) parsed.centralBankEvents=[]
    const san=arr=>arr.map(e=>({...e,time:String(e.time||''),event:String(e.event||''),currency:String(e.currency||''),impact:String(e.impact||'low'),previous:String(e.previous||''),forecast:String(e.forecast||''),actual:String(e.actual||''),date:String(e.date||'')}))
    setCalData({days:san(parsed.days),centralBankEvents:parsed.centralBankEvents,startISO,endISO})
    setLastFetch(new Date().toLocaleTimeString('es-MX'))
    setLoading(false)
  }

  useEffect(()=>{fetchCalendar()},[])

  const todayStr=todayISO()
  const allDays=calData?.days||[]
  const visible=allDays.filter(e=>filterImpact[e.impact])
  const uniqueDates=[...new Set(visible.map(e=>e.date))].sort()
  const [activeDay, setActiveDay]=useState('ALL')
  const finalDays=activeDay==='ALL'?visible:visible.filter(e=>e.date===activeDay)
  const dayNames={"1":"Lun","2":"Mar","3":"Mié","4":"Jue","5":"Vie"}
  const impColor=i=>i==='high'?C.red:i==='medium'?C.yellow:C.dim

  return (
    <div>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'20px'}}>
        <h1 style={{fontSize:'20px',fontWeight:700}}>Calendario Económico</h1>
        <div style={{display:'flex',alignItems:'center',gap:'10px'}}>
          {lastFetch&&<span style={{fontSize:'11px',color:C.dim}}>{lastFetch}</span>}
          <button style={{padding:'8px 14px',borderRadius:'8px',border:'none',background:C.accent,color:C.bg,fontWeight:600,fontSize:'13px',cursor:'pointer'}}
            onClick={fetchCalendar} disabled={loading}>{loading?'⟳ Consultando...':'↻ Actualizar'}</button>
        </div>
      </div>

      {/* Impact filters */}
      <div style={{display:'flex',gap:'8px',marginBottom:'14px',flexWrap:'wrap'}}>
        {[{k:'high',l:'Alto',c:C.red},{k:'medium',l:'Medio',c:C.yellow},{k:'low',l:'Bajo',c:C.dim}].map(f=>(
          <button key={f.k} onClick={()=>setFilterImpact({...filterImpact,[f.k]:!filterImpact[f.k]})} style={{
            display:'flex',alignItems:'center',gap:'5px',padding:'6px 12px',borderRadius:'6px',fontSize:'12px',fontWeight:600,
            border:`1px solid ${filterImpact[f.k]?f.c+'50':C.border}`,background:filterImpact[f.k]?f.c+'15':'transparent',
            color:filterImpact[f.k]?f.c:C.dim,opacity:filterImpact[f.k]?1:0.5
          }}>
            <span style={{width:'8px',height:'8px',borderRadius:'2px',background:f.c,display:'inline-block'}}/>
            {f.l}
          </button>
        ))}
      </div>

      {/* Day pills */}
      <div style={{display:'flex',gap:'6px',marginBottom:'16px',flexWrap:'wrap'}}>
        <button onClick={()=>setActiveDay('ALL')} style={{padding:'6px 12px',borderRadius:'8px',fontSize:'12px',fontWeight:600,
          border:`1px solid ${activeDay==='ALL'?C.accent:C.border}`,background:activeDay==='ALL'?C.accentBg:'transparent',color:activeDay==='ALL'?C.accent:C.muted}}>Todos</button>
        {uniqueDates.map(d=>{
          const dn=dayNames[new Date(d+'T12:00:00').getDay().toString()]||''
          const isToday=d===todayStr
          const n=visible.filter(e=>e.date===d).length
          return <button key={d} onClick={()=>setActiveDay(d)} style={{
            padding:'6px 12px',borderRadius:'8px',fontSize:'12px',fontWeight:600,display:'flex',alignItems:'center',gap:'4px',
            border:`1px solid ${activeDay===d?C.accent:isToday?C.accent+'50':C.border}`,
            background:activeDay===d?C.accentBg:isToday?C.accentBg+'40':'transparent',
            color:activeDay===d||isToday?C.accent:C.muted}}>
            {dn} {d.slice(8)}{isToday&&<span style={{fontSize:'8px'}}>●</span>}
            <span style={{fontSize:'10px',color:C.dim}}>({n})</span>
          </button>
        })}
      </div>

      {loading&&<div style={{textAlign:'center',padding:'40px',color:C.muted}}>
        <div style={{width:'30px',height:'30px',border:`2px solid ${C.border}`,borderTop:`2px solid ${C.accent}`,borderRadius:'50%',animation:'spin 1s linear infinite',margin:'0 auto 12px'}}/>
        Consultando Investing.com...
      </div>}

      {!loading&&calData&&(
        <div style={card}>
          {/* Column headers */}
          <div style={{display:'grid',gridTemplateColumns:'78px 56px 44px 36px 1fr 64px 64px 20px',gap:'6px',
            padding:'0 10px 8px',borderBottom:`1px solid ${C.border}`,marginBottom:'4px'}}>
            {['','Hora','Moneda','','Evento','Pronóst.','Previo',''].map((h,i)=>
              <span key={i} style={{fontSize:'10px',color:C.dim,textTransform:'uppercase',letterSpacing:'0.8px',fontWeight:600}}>{h}</span>
            )}
          </div>

          {finalDays.length===0&&<div style={{textAlign:'center',padding:'30px',color:C.muted}}>Sin eventos para los filtros seleccionados</div>}

          {(() => {
            const byDate={}
            finalDays.forEach(e=>{const d=e.date||'?';if(!byDate[d])byDate[d]=[];byDate[d].push(e)})
            return Object.entries(byDate).sort((a,b)=>a[0]<b[0]?-1:1).map(([date,events])=>{
              const dn=dayNames[new Date(date+'T12:00:00').getDay().toString()]||'?'
              const isToday=date===todayStr
              return <div key={date} style={{display:'flex',borderBottom:`1px solid ${C.border}40`,paddingBottom:'6px',marginBottom:'6px'}}>
                <div style={{width:'78px',flexShrink:0,paddingTop:'10px',paddingLeft:'2px'}}>
                  <div style={{fontSize:'12px',fontWeight:700,color:isToday?C.accent:C.text}}>{dn}</div>
                  <div style={{fontSize:'12px',fontWeight:700,color:isToday?C.accent:C.text}}>{date.slice(5)}</div>
                  {isToday&&<span style={{display:'inline-block',padding:'2px 6px',borderRadius:'4px',fontSize:'9px',fontWeight:600,background:C.greenBg,color:C.green,marginTop:'3px'}}>HOY</span>}
                </div>
                <div style={{flex:1}}>
                  {events.map((e,i)=>{
                    const key=`${date}-${i}`,isExp=expandedEvent===key
                    const ic=e.impact==='high'?C.red:e.impact==='medium'?C.yellow:C.dim
                    return <div key={i}>
                      <div onClick={()=>setExpandedEvent(isExp?null:key)} style={{
                        display:'grid',gridTemplateColumns:'56px 44px 36px 1fr 64px 64px 20px',gap:'6px',alignItems:'center',
                        padding:'7px 10px',borderRadius:'6px',cursor:'pointer',background:isExp?C.accentBg:i%2===0?C.bg:'transparent'}}>
                        <span style={{fontSize:'11px',color:C.muted}}>{e.time||'—'}</span>
                        <span style={{fontSize:'11px',fontWeight:700,color:C.text}}>{e.currency}</span>
                        <span style={{width:'12px',height:'12px',borderRadius:'2px',background:ic,display:'inline-block'}}/>
                        <span style={{fontSize:'12px',color:C.text,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{e.event}</span>
                        <span style={{fontSize:'11px',color:C.muted,textAlign:'right'}}>{e.forecast||'—'}</span>
                        <span style={{fontSize:'11px',color:e.actual?C.accent:C.muted,textAlign:'right',fontWeight:e.actual?700:400}}>{e.actual||e.previous||'—'}</span>
                        <span style={{color:C.dim,fontSize:'10px',textAlign:'center'}}>{isExp?'▲':'▼'}</span>
                      </div>
                      {isExp&&<div style={{padding:'10px 14px',marginBottom:'4px',background:C.card,borderRadius:'6px',border:`1px solid ${C.border}`}}>
                        <div style={{fontSize:'12px',color:C.muted,marginBottom:'6px'}}>
                          Previo: <b style={{color:C.text}}>{e.previous||'—'}</b> · Pronóstico: <b style={{color:C.text}}>{e.forecast||'—'}</b>
                          {e.actual&&<> · Actual: <b style={{color:C.accent}}>{e.actual}</b></>}
                        </div>
                        {e.impact==='high'&&<div style={{fontSize:'11px',color:C.red,fontWeight:600}}>
                          ⚠ Evento de alto impacto — evita abrir posiciones en pares con {e.currency}
                        </div>}
                      </div>}
                    </div>
                  })}
                </div>
              </div>
            })
          })()}
        </div>
      )}
    </div>
  )
}
