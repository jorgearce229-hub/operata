import { useState, useEffect } from 'react'
import { C, card, label, input, btn } from '../lib/theme'

export default function Calculator({ profile }) {
  const [instrument, setInstrument] = useState('')
  const [direction, setDirection] = useState('LONG')
  const [accountSize, setAccountSize] = useState('1000')
  const [riskPct, setRiskPct] = useState('1')
  const [entryPrice, setEntryPrice] = useState('')
  const [stopPrice, setStopPrice] = useState('')
  const [rrRatio, setRrRatio] = useState('2')
  const isForex = profile?.trading_focus === 'forex'

  const entry = parseFloat(entryPrice), stop = parseFloat(stopPrice)
  const valid = !isNaN(entry) && !isNaN(stop) && entry > 0 && stop > 0 && entry !== stop
  const riskUSD = parseFloat(accountSize) * (parseFloat(riskPct) / 100)
  const slDist = valid ? Math.abs(entry - stop) : 0
  const tpDist = slDist * parseFloat(rrRatio||2)
  const tpPrice = valid ? (direction === 'LONG' ? entry + tpDist : entry - tpDist) : 0
  const slPips = isForex && valid ? (instrument.includes('JPY') ? slDist*100 : slDist*10000) : slDist
  const stdPipVal = isForex ? (instrument.includes('JPY') ? (100000*0.01/(entry||1)) : 10) : 1
  const lotSize = slPips > 0 ? riskUSD / (slPips * stdPipVal / (isForex?(instrument.includes('JPY')?100:10000):1) * (isForex?(instrument.includes('JPY')?100:10000):1)) : 0
  const units = Math.floor(lotSize * 100000)
  const potentialGain = riskUSD * parseFloat(rrRatio||2)
  const dec = isForex ? (instrument.includes('JPY') ? 3 : 5) : 4

  const Res = ({ label: l, value, sub, color }) => (
    <div style={{ padding:'14px', background:C.bg, borderRadius:'10px', border:`1px solid ${C.border}`, textAlign:'center' }}>
      <div style={{ fontSize:'11px', color:C.dim, textTransform:'uppercase', letterSpacing:'0.8px', marginBottom:'4px' }}>{l}</div>
      <div style={{ fontSize:'20px', fontWeight:700, color:color||C.text }}>{value}</div>
      {sub && <div style={{ fontSize:'11px', color:C.dim, marginTop:'3px' }}>{sub}</div>}
    </div>
  )

  return (
    <div>
      <h1 style={{ fontSize:'20px', fontWeight:700, marginBottom:'20px' }}>Calculadora de Posición</h1>

      <div style={card}>
        <div style={{ fontSize:'13px', fontWeight:600, color:C.muted, textTransform:'uppercase', letterSpacing:'0.8px', marginBottom:'16px' }}>Parámetros</div>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(180px,1fr))', gap:'14px' }}>
          <div><div style={label}>Instrumento</div>
            <input style={input} placeholder="EUR/USD, BTC/USD..." value={instrument} onChange={e=>setInstrument(e.target.value)} /></div>

          <div><div style={label}>Dirección</div>
            <div style={{ display:'flex', gap:'6px' }}>
              {['LONG','SHORT'].map(d=><button key={d} onClick={()=>setDirection(d)} style={{
                flex:1, padding:'10px', borderRadius:'8px', fontWeight:600, fontSize:'13px', border:`1px solid ${d==='LONG'?(direction==='LONG'?C.green:C.border):(direction==='SHORT'?C.red:C.border)}`,
                background:direction===d?(d==='LONG'?C.greenBg:C.redBg):'transparent',
                color:direction===d?(d==='LONG'?C.green:C.red):C.muted,
              }}>{d==='LONG'?'↑ Long':'↓ Short'}</button>)}
            </div>
          </div>

          <div><div style={label}>Cuenta (USD)</div>
            <input style={input} type="number" value={accountSize} onChange={e=>setAccountSize(e.target.value)} /></div>

          <div><div style={label}>Riesgo (%)</div>
            <div style={{ display:'flex', gap:'6px' }}>
              {['0.5','1','2'].map(r=><button key={r} onClick={()=>setRiskPct(r)} style={{
                flex:1, padding:'10px', borderRadius:'8px', fontWeight:600, fontSize:'13px',
                border:`1px solid ${riskPct===r?C.accent:C.border}`,
                background:riskPct===r?C.accentBg:'transparent',
                color:riskPct===r?C.accent:C.muted,
              }}>{r}%</button>)}
            </div>
          </div>

          <div><div style={label}>Precio entrada</div>
            <input style={input} type="number" step="any" placeholder={isForex?"1.08500":"..."} value={entryPrice} onChange={e=>setEntryPrice(e.target.value)} /></div>

          <div><div style={label}>{direction==='LONG'?'Stop Loss (mínimo)':'Stop Loss (máximo)'}</div>
            <input style={{ ...input, border:`1px solid ${C.red}40` }} type="number" step="any" placeholder="..." value={stopPrice} onChange={e=>setStopPrice(e.target.value)} /></div>

          <div><div style={label}>Ratio R/R</div>
            <input style={input} type="number" step="0.5" placeholder="2.5" value={rrRatio} onChange={e=>setRrRatio(e.target.value)} /></div>
        </div>
      </div>

      {valid && (
        <div style={{ ...card, border:`1px solid ${C.green}30` }}>
          <div style={{ fontSize:'13px', fontWeight:600, color:C.muted, textTransform:'uppercase', letterSpacing:'0.8px', marginBottom:'14px' }}>Resultado</div>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(150px,1fr))', gap:'10px', marginBottom:'14px' }}>
            <Res label="Unidades" value={units.toLocaleString()} sub={isForex?`${(units/100000).toFixed(2)} lots`:''}  color={C.accent}/>
            <Res label="Riesgo USD" value={`$${riskUSD.toFixed(2)}`} color={C.yellow} sub={`${riskPct}% de $${parseFloat(accountSize).toLocaleString()}`}/>
            <Res label="SL" value={stop.toFixed(dec)} color={C.red} sub={`${slDist.toFixed(isForex?(instrument.includes('JPY')?2:4):4)} dist.`}/>
            <Res label="TP" value={tpPrice.toFixed(dec)} color={C.green} sub={`${parseFloat(rrRatio||2)}R`}/>
            <Res label="Ganancia potencial" value={`$${potentialGain.toFixed(2)}`} color={C.green} sub={`${parseFloat(rrRatio)||2}× el riesgo`}/>
          </div>

          {/* Visual SL → Entry → TP */}
          <div style={{ padding:'14px', background:C.bg, borderRadius:'10px', border:`1px solid ${C.border}` }}>
            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', position:'relative' }}>
              <div style={{ textAlign:'center' }}>
                <div style={{ fontSize:'10px', color:C.red, fontWeight:600, marginBottom:'3px' }}>SL</div>
                <div style={{ fontSize:'13px', fontWeight:700, color:C.red }}>{stop.toFixed(dec)}</div>
              </div>
              <div style={{ flex:1, height:'3px', margin:'0 12px', background:`linear-gradient(90deg, ${C.red}, ${C.accent})` }}/>
              <div style={{ textAlign:'center' }}>
                <div style={{ fontSize:'10px', color:C.accent, fontWeight:600, marginBottom:'3px' }}>ENTRADA</div>
                <div style={{ fontSize:'13px', fontWeight:700, color:C.accent }}>{entry.toFixed(dec)}</div>
              </div>
              <div style={{ flex:1, height:'3px', margin:'0 12px', background:`linear-gradient(90deg, ${C.accent}, ${C.green})` }}/>
              <div style={{ textAlign:'center' }}>
                <div style={{ fontSize:'10px', color:C.green, fontWeight:600, marginBottom:'3px' }}>TP ({parseFloat(rrRatio)||2}R)</div>
                <div style={{ fontSize:'13px', fontWeight:700, color:C.green }}>{tpPrice.toFixed(dec)}</div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
