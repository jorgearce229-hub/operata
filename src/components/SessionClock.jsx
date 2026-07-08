import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { C, card, input } from '../lib/theme'
import { getZonedTime } from '../lib/timezone'

const DEFAULT_SESSIONS = [
  {name:"Sydney",short:"SYD",start:22,end:7,enabled:true,color:"#8b5cf6"},
  {name:"Tokyo",short:"TKY",start:0,end:9,enabled:true,color:"#f59e0b"},
  {name:"London",short:"LDN",start:8,end:17,enabled:true,color:"#10b981"},
  {name:"New York",short:"NYC",start:13,end:22,enabled:true,color:"#ef4444"},
]

export default function SessionClock({ userId, timezone }) {
  const [now, setNow] = useState(new Date())
  const [sessions, setSessions] = useState(DEFAULT_SESSIONS)
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000)
    loadConfig()
    return () => clearInterval(t)
  }, [])

  const loadConfig = async () => {
    const { data } = await supabase.from('session_config').select('sessions').eq('user_id', userId).single()
    if (data?.sessions) setSessions(data.sessions)
  }

  const saveConfig = async () => {
    setSaving(true)
    await supabase.from('session_config').upsert({ user_id: userId, sessions })
    setSaving(false); setEditing(false)
  }

  const utcH = now.getUTCHours(), utcDay = now.getUTCDay()
  const zoned = getZonedTime(timezone)
  const localH = zoned.h, localM = zoned.m, localS = zoned.s
  const tzOff = zoned.offset
  const timeStr = `${String(localH).padStart(2,'0')}:${String(localM).padStart(2,'0')}:${String(localS).padStart(2,'0')}`
  const isForexOpen = !(utcDay===6 || (utcDay===0&&utcH<22) || (utcDay===5&&utcH>=22))

  const isOpen = (s) => {
    if (!isForexOpen || !s.enabled) return false
    if (s.start < s.end) return utcH >= s.start && utcH < s.end
    return utcH >= s.start || utcH < s.end
  }

  const localTime = (h) => ((h + tzOff) + 24) % 24
  const cx=160, cy=160, size=320, radii=[140,122,104,86]

  const arcPath = (r, sH, eH) => {
    const toR = (h) => ((h/24)*360-90)*Math.PI/180
    const sA=toR(sH), eA2=eH<=sH?toR(eH+24):toR(eH)
    const x1=cx+r*Math.cos(sA),y1=cy+r*Math.sin(sA),x2=cx+r*Math.cos(eA2),y2=cy+r*Math.sin(eA2)
    const sweep=eH<=sH?eH+24-sH:eH-sH
    return `M ${x1} ${y1} A ${r} ${r} 0 ${sweep>12?1:0} 1 ${x2} ${y2}`
  }

  const enabledSessions = sessions.filter(s=>s.enabled)

  return (
    <div>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'20px'}}>
        <h1 style={{fontSize:'20px',fontWeight:700}}>Sesiones de Mercado</h1>
        <button style={{padding:'8px 16px',borderRadius:'8px',border:`1px solid ${C.border}`,background:'transparent',color:C.text,fontSize:'13px',fontWeight:600}}
          onClick={()=>setEditing(!editing)}>{editing?'Cancelar':'⚙ Configurar sesiones'}</button>
      </div>

      {editing && (
        <div style={card}>
          <div style={{fontSize:'13px',fontWeight:600,color:C.muted,textTransform:'uppercase',letterSpacing:'0.8px',marginBottom:'14px'}}>Configurar sesiones</div>
          {sessions.map((s,i) => (
            <div key={i} style={{display:'flex',alignItems:'center',gap:'12px',padding:'10px 0',borderBottom:`1px solid ${C.border}`}}>
              <input type="checkbox" checked={s.enabled} onChange={e=>{const ns=[...sessions];ns[i]={...ns[i],enabled:e.target.checked};setSessions(ns)}} />
              <input style={{...input,width:'120px'}} value={s.name} onChange={e=>{const ns=[...sessions];ns[i]={...ns[i],name:e.target.value};setSessions(ns)}} />
              <span style={{color:C.dim,fontSize:'12px'}}>UTC</span>
              <input style={{...input,width:'60px',textAlign:'center'}} type="number" value={s.start} onChange={e=>{const ns=[...sessions];ns[i]={...ns[i],start:parseInt(e.target.value)||0};setSessions(ns)}} />
              <span style={{color:C.dim}}>→</span>
              <input style={{...input,width:'60px',textAlign:'center'}} type="number" value={s.end} onChange={e=>{const ns=[...sessions];ns[i]={...ns[i],end:parseInt(e.target.value)||0};setSessions(ns)}} />
              <input type="color" value={s.color} onChange={e=>{const ns=[...sessions];ns[i]={...ns[i],color:e.target.value};setSessions(ns)}} style={{width:'36px',height:'36px',borderRadius:'6px',border:'none',cursor:'pointer'}} />
            </div>
          ))}
          <div style={{marginTop:'14px',display:'flex',justifyContent:'flex-end'}}>
            <button style={{padding:'9px 18px',borderRadius:'8px',border:'none',background:C.accent,color:C.bg,fontWeight:600,cursor:'pointer'}}
              onClick={saveConfig} disabled={saving}>{saving?'Guardando...':'Guardar configuración'}</button>
          </div>
        </div>
      )}

      <div style={{...card,display:'flex',gap:'24px',alignItems:'center',flexWrap:'wrap'}}>
        <div>
          <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
            {radii.map((r,i)=><circle key={i} cx={cx} cy={cy} r={r} fill="none" stroke={C.border} strokeWidth={14} opacity={0.3}/>)}
            {enabledSessions.map((s,i)=>{
              if(i>=radii.length) return null
              const lStart=localTime(s.start),lEnd=localTime(s.end)
              const open=isOpen(s)
              return <path key={s.name} d={arcPath(radii[i],lStart,lEnd)} fill="none" stroke={open?s.color:s.color+'30'} strokeWidth={14} strokeLinecap="round" style={{filter:open?`drop-shadow(0 0 6px ${s.color}80)`:'none'}}/>
            })}
            {Array.from({length:24},(_,i)=>i).map(h=>{
              const angle=(h/24)*360-90,rad=angle*Math.PI/180,isMain=h%3===0
              return <g key={h}>
                <line x1={cx+152*Math.cos(rad)} y1={cy+152*Math.sin(rad)} x2={cx+(isMain?158:155)*Math.cos(rad)} y2={cy+(isMain?158:155)*Math.sin(rad)} stroke={isMain?C.muted:C.border} strokeWidth={isMain?2:1}/>
              </g>
            })}
            {[0,3,6,9,12,15,18,21].map(h=>{
              const angle=(h/24)*360-90,rad=angle*Math.PI/180
              return <text key={h} x={cx+148*Math.cos(rad)} y={cy+148*Math.sin(rad)+4} textAnchor="middle" fontSize="11" fill={C.muted} fontWeight="600">{h||'0'}</text>
            })}
            {enabledSessions.map((s,i)=>{
              if(i>=radii.length) return null
              const lS=localTime(s.start),lE=localTime(s.end)
              const mid=lS<lE?(lS+lE)/2:((lS+lE+24)/2)%24
              const angle=(mid/24)*360-90,rad=angle*Math.PI/180
              return <text key={s.short} x={cx+radii[i]*Math.cos(rad)} y={cy+radii[i]*Math.sin(rad)+3} textAnchor="middle" fontSize="8" fill={isOpen(s)?s.color:C.dim} fontWeight="700" letterSpacing="1">{s.short||s.name.slice(0,3).toUpperCase()}</text>
            })}
            <circle cx={cx} cy={cy} r={32} fill={C.bg} stroke={C.border} strokeWidth={1}/>
            <text x={cx} y={cy-5} textAnchor="middle" fontSize="13" fill={C.text} fontWeight="700">{timeStr}</text>
            <text x={cx} y={cy+9} textAnchor="middle" fontSize="8" fill={C.dim}>UTC{tzOff>=0?'+':''}{tzOff}</text>
            {(() => {
              const hA=((localH+localM/60)/24)*360-90,mA=((localM+localS/60)/60)*360-90,sA=(localS/60)*360-90
              return <>
                <line x1={cx} y1={cy} x2={cx+45*Math.cos(hA*Math.PI/180)} y2={cy+45*Math.sin(hA*Math.PI/180)} stroke={C.text} strokeWidth={3} strokeLinecap="round"/>
                <line x1={cx} y1={cy} x2={cx+60*Math.cos(mA*Math.PI/180)} y2={cy+60*Math.sin(mA*Math.PI/180)} stroke={C.muted} strokeWidth={2} strokeLinecap="round"/>
                <line x1={cx} y1={cy} x2={cx+55*Math.cos(sA*Math.PI/180)} y2={cy+55*Math.sin(sA*Math.PI/180)} stroke="#ef4444" strokeWidth={1} strokeLinecap="round"/>
              </>
            })()}
            <circle cx={cx} cy={cy} r={4} fill="#ef4444"/><circle cx={cx} cy={cy} r={2} fill={C.text}/>
          </svg>
        </div>

        <div style={{flex:1,minWidth:'200px'}}>
          <div style={{display:'flex',alignItems:'center',gap:'8px',marginBottom:'12px'}}>
            <div style={{fontSize:'13px',fontWeight:600,color:C.muted,textTransform:'uppercase',letterSpacing:'0.8px'}}>Estado del Mercado</div>
            <span style={{display:'inline-block',padding:'3px 8px',borderRadius:'6px',fontSize:'11px',fontWeight:600,background:isForexOpen?C.greenBg:C.redBg,color:isForexOpen?C.green:C.red}}>
              {isForexOpen?'ABIERTO':'CERRADO'}
            </span>
          </div>
          {sessions.filter(s=>s.enabled).map(s=>{
            const open=isOpen(s)
            const lS=localTime(s.start),lE=localTime(s.end)
            return <div key={s.name} style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'10px 14px',marginBottom:'6px',borderRadius:'8px',background:open?s.color+'15':'transparent',border:`1px solid ${open?s.color+'40':C.border}`,opacity:isForexOpen?1:0.5}}>
              <div style={{display:'flex',alignItems:'center',gap:'10px'}}>
                <div style={{width:'10px',height:'10px',borderRadius:'50%',background:open?s.color:C.border,boxShadow:open?`0 0 8px ${s.color}60`:'none',animation:open?'pulse 2s infinite':'none'}}/>
                <div>
                  <div style={{fontWeight:600,fontSize:'13px',color:open?C.text:C.muted}}>{s.name}</div>
                  <div style={{fontSize:'11px',color:C.dim}}>{String(Math.floor(lS)).padStart(2,'0')}:00 – {String(Math.floor(lE)).padStart(2,'0')}:00 local</div>
                </div>
              </div>
              <span style={{display:'inline-block',padding:'3px 8px',borderRadius:'6px',fontSize:'11px',fontWeight:600,background:open?C.greenBg:C.redBg,color:open?C.green:C.red}}>{open?'Abierto':'Cerrado'}</span>
            </div>
          })}
        </div>
      </div>
    </div>
  )
}
