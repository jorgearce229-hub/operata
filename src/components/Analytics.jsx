import { C, card } from '../lib/theme'
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts'

const NA = <span style={{color:'#475569',fontStyle:'italic'}}>N/A</span>

const Stat = ({ label, value, sub, color, empty }) => (
  <div style={{ padding:'16px', background:C.bg, borderRadius:'10px', border:`1px solid ${C.border}` }}>
    <div style={{ fontSize:'11px', color:C.dim, textTransform:'uppercase', letterSpacing:'0.8px', marginBottom:'4px' }}>{label}</div>
    <div style={{ fontSize:'22px', fontWeight:700, color:empty?C.dim:color||C.text }}>{empty?'—':value}</div>
    {sub && <div style={{ fontSize:'11px', color:C.dim, marginTop:'3px' }}>{empty?'Sin datos':sub}</div>}
  </div>
)

export default function Analytics({ trades, isPro }) {
  const sorted = [...trades].filter(t=>t.close_date||t.entry_date).sort((a,b)=>((a.entry_date||'')<(b.entry_date||'')?-1:1))
  const isEmpty = sorted.length === 0
  const totalPnL = sorted.reduce((s,t)=>s+(t.pnl||0),0)
  const wins = sorted.filter(t=>t.result==='TP').length
  const losses = sorted.filter(t=>t.result==='SL').length
  const wr = sorted.length ? Math.round(wins/sorted.length*100) : 0
  const avgR = sorted.length ? sorted.reduce((s,t)=>s+(t.r_multiple||0),0)/sorted.length : 0
  let peak=0, maxDD=0, runEq=0
  sorted.forEach(t=>{runEq+=(t.pnl||0);if(runEq>peak)peak=runEq;const dd=(peak-runEq)/Math.max(peak,1)*100;if(dd>maxDD)maxDD=dd})

  let cum=0
  const eqData = isEmpty
    ? [{name:'',equity:0},{name:'',equity:0}]
    : sorted.map(t=>{cum+=(t.pnl||0);return{name:(t.entry_date||'').slice(5),pnl:Math.round((t.pnl||0)*100)/100,equity:Math.round(cum*100)/100}})

  const monthly = {}
  sorted.forEach(t=>{const m=(t.entry_date||'').slice(0,7);if(!monthly[m])monthly[m]={pnl:0,n:0,w:0};monthly[m].pnl+=(t.pnl||0);monthly[m].n++;if(t.result==='TP')monthly[m].w++})
  const mBars = Object.entries(monthly).sort((a,b)=>a[0]<b[0]?-1:1).map(([m,d])=>({name:m,pnl:Math.round(d.pnl*100)/100,wr:d.n?Math.round(d.w/d.n*100):0}))

  const T2 = ({active,payload,label}) => {
    if(!active||!payload?.length) return null
    return <div style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:'8px',padding:'10px',fontSize:'12px'}}>
      <div style={{color:C.muted,marginBottom:'4px'}}>{label}</div>
      {payload.map((p,i)=><div key={i} style={{color:p.color}}>{p.name}: <b>${typeof p.value==='number'?p.value.toFixed(2):p.value}</b></div>)}
    </div>
  }

  return (
    <div>
      <h1 style={{fontSize:'20px',fontWeight:700,marginBottom:'20px'}}>Analytics</h1>

      {isEmpty && (
        <div style={{padding:'12px 16px',background:C.card,border:`1px solid ${C.border}`,borderRadius:'10px',marginBottom:'16px',fontSize:'13px',color:C.muted,display:'flex',alignItems:'center',gap:'8px'}}>
          <span>📋</span> Registra tu primera operación en el Diario para ver tus métricas reales aquí.
        </div>
      )}

      <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(160px,1fr))',gap:'12px',marginBottom:'16px'}}>
        <Stat empty={isEmpty} label="P&L Total" value={`${totalPnL>=0?'+':''}$${totalPnL.toFixed(2)}`} color={totalPnL>=0?C.green:C.red} sub={`${sorted.length} operaciones`}/>
        <Stat empty={isEmpty} label="Win Rate" value={`${wr}%`} color={wr>=50?C.green:C.yellow} sub={`${wins}W / ${losses}L`}/>
        <Stat empty={isEmpty} label="Expectancy" value={`${avgR>=0?'+':''}${avgR.toFixed(2)}R`} color={avgR>=0?C.green:C.red} sub="por operación"/>
        <Stat empty={isEmpty} label="Max Drawdown" value={`${maxDD.toFixed(1)}%`} color={C.red}/>
        <Stat empty={isEmpty} label="Mejor Trade" value={`+$${Math.max(0,...sorted.map(t=>t.pnl||0)).toFixed(2)}`} color={C.green}/>
        <Stat empty={isEmpty} label="Peor Trade" value={`-$${Math.abs(Math.min(0,...sorted.map(t=>t.pnl||0))).toFixed(2)}`} color={C.red}/>
      </div>

      <div style={card}>
        <div style={{fontSize:'13px',fontWeight:600,color:C.muted,textTransform:'uppercase',letterSpacing:'0.8px',marginBottom:'14px'}}>Equity Curve</div>
        {isEmpty && <div style={{textAlign:'center',padding:'20px 0',fontSize:'12px',color:C.dim}}>Tu curva de equity aparecerá aquí conforme registres operaciones</div>}
        <ResponsiveContainer width="100%" height={260}>
          <AreaChart data={eqData} margin={{top:5,right:20,bottom:5,left:10}}>
            <defs><linearGradient id="eG" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={C.accent} stopOpacity={isEmpty?0.05:0.3}/>
              <stop offset="95%" stopColor={C.accent} stopOpacity={0}/>
            </linearGradient></defs>
            <CartesianGrid strokeDasharray="3 3" stroke={C.border}/>
            <XAxis dataKey="name" tick={{fontSize:10,fill:C.dim}} stroke={C.border}/>
            <YAxis tick={{fontSize:10,fill:C.dim}} stroke={C.border} tickFormatter={v=>`$${v}`}/>
            {!isEmpty && <Tooltip content={<T2/>}/>}
            <ReferenceLine y={0} stroke={C.dim} strokeDasharray="4 4"/>
            <Area type="monotone" dataKey="equity" name="Capital" stroke={isEmpty?C.border:C.accent} fill="url(#eG)" strokeWidth={isEmpty?1:2} dot={false} strokeDasharray={isEmpty?"6 3":""}/>
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {isPro ? (
        <div style={card}>
          <div style={{fontSize:'13px',fontWeight:600,color:C.muted,textTransform:'uppercase',letterSpacing:'0.8px',marginBottom:'14px'}}>P&L Mensual</div>
          {isEmpty && <div style={{textAlign:'center',padding:'20px 0',fontSize:'12px',color:C.dim}}>El desglose mensual aparecerá aquí</div>}
          {!isEmpty && <ResponsiveContainer width="100%" height={220}>
            <BarChart data={mBars} margin={{top:5,right:20,bottom:5,left:10}}>
              <CartesianGrid strokeDasharray="3 3" stroke={C.border}/>
              <XAxis dataKey="name" tick={{fontSize:10,fill:C.dim}} stroke={C.border}/>
              <YAxis tick={{fontSize:10,fill:C.dim}} stroke={C.border} tickFormatter={v=>`$${v}`}/>
              <Tooltip content={({active,payload,label})=>{if(!active||!payload?.length)return null;const d=payload[0]?.payload;return <div style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:'8px',padding:'10px',fontSize:'12px'}}><div style={{fontWeight:700,marginBottom:'4px'}}>{label}</div><div style={{color:d?.pnl>=0?C.green:C.red}}>{d?.pnl>=0?'+':''}${d?.pnl?.toFixed(2)}</div><div style={{color:C.muted}}>{d?.wr}% WR</div></div>}}/>
              <ReferenceLine y={0} stroke={C.muted}/>
              <Bar dataKey="pnl" name="P&L" radius={[4,4,0,0]} shape={p=>{const neg=(p.payload?.pnl||0)<0;return<rect x={p.x} y={p.y} width={p.width} height={Math.abs(p.height)} rx={4} fill={neg?C.red:C.green} fillOpacity={0.8}/>}}/>
            </BarChart>
          </ResponsiveContainer>}
        </div>
      ) : (
        <div style={{...card,textAlign:'center',padding:'40px',border:`1px solid ${C.yellow}30`}}>
          <div style={{fontSize:'24px',marginBottom:'8px'}}>🔒</div>
          <div style={{fontWeight:600,marginBottom:'4px'}}>Analytics avanzados — Plan Pro</div>
          <div style={{color:C.muted,fontSize:'13px',marginBottom:'14px'}}>P&L mensual, análisis por instrumento y más</div>
          <button style={{padding:'8px 20px',borderRadius:'8px',border:'none',background:C.accent,color:C.bg,fontWeight:600,cursor:'pointer'}}>Upgrade a Pro</button>
        </div>
      )}
    </div>
  )
}
