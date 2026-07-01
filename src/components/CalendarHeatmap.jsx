import { useState } from 'react'
import { C } from '../lib/theme'

export default function CalendarHeatmap({ trades }) {
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const d = new Date()
    return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}`
  })

  // Build daily P&L map
  const dailyMap = {}
  trades.forEach(t => {
    const date = t.close_date || t.entry_date
    if (!date) return
    const pnl = parseFloat(t.pnl) || 0
    if (!dailyMap[date]) dailyMap[date] = { pnl: 0, trades: 0, wins: 0, losses: 0 }
    dailyMap[date].pnl += pnl
    dailyMap[date].trades++
    if (t.result === 'TP') dailyMap[date].wins++
    if (t.result === 'SL') dailyMap[date].losses++
  })

  // Available months
  const months = [...new Set(Object.keys(dailyMap).map(d => d.slice(0,7)))].sort().reverse()
  if (months.length === 0) return null

  // If selected month has no data, use most recent
  const activeMonth = months.includes(selectedMonth) ? selectedMonth : months[0]

  // Calendar grid for selected month
  const [year, month] = activeMonth.split('-').map(Number)
  const firstDay = new Date(year, month-1, 1).getDay() // 0=Sun
  const daysInMonth = new Date(year, month, 0).getDate()

  const monthPnL = Object.entries(dailyMap)
    .filter(([d]) => d.startsWith(activeMonth))
    .reduce((s, [,v]) => s + v.pnl, 0)

  const monthTrades = Object.entries(dailyMap)
    .filter(([d]) => d.startsWith(activeMonth))
    .reduce((s, [,v]) => s + v.trades, 0)

  const maxAbsPnL = Math.max(...Object.values(dailyMap).map(v => Math.abs(v.pnl)), 1)

  const cellColor = (pnl) => {
    if (pnl === 0 || pnl === undefined) return C.border
    const intensity = Math.min(Math.abs(pnl) / maxAbsPnL, 1)
    if (pnl > 0) return `rgba(16,185,129,${0.2 + intensity * 0.8})`
    return `rgba(239,68,68,${0.2 + intensity * 0.8})`
  }

  const monthName = new Date(year, month-1, 1).toLocaleDateString('es-MX', { month: 'long', year: 'numeric' })
  const dayLabels = ['Dom','Lun','Mar','Mié','Jue','Vie','Sáb']

  const [hovered, setHovered] = useState(null)

  return (
    <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: '12px', padding: '20px', marginBottom: '16px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <div>
          <div style={{ fontSize: '13px', fontWeight: 600, color: C.muted, textTransform: 'uppercase', letterSpacing: '0.8px' }}>Calendar Heatmap</div>
          <div style={{ fontSize: '11px', color: C.dim, marginTop: '2px' }}>P&L diario — verde = ganancia · rojo = pérdida</div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '18px', fontWeight: 700, color: monthPnL >= 0 ? C.green : C.red }}>
              {monthPnL >= 0 ? '+' : ''}${monthPnL.toFixed(2)}
            </div>
            <div style={{ fontSize: '11px', color: C.dim }}>{monthTrades} ops este mes</div>
          </div>
          <select value={activeMonth} onChange={e => setSelectedMonth(e.target.value)} style={{
            background: C.bg, border: `1px solid ${C.border}`, borderRadius: '8px',
            padding: '6px 10px', color: C.text, fontSize: '13px', cursor: 'pointer'
          }}>
            {months.map(m => <option key={m} value={m}>{new Date(m+'-01').toLocaleDateString('es-MX',{month:'long',year:'numeric'})}</option>)}
          </select>
        </div>
      </div>

      {/* Day labels */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', gap: '4px', marginBottom: '4px' }}>
        {dayLabels.map(d => (
          <div key={d} style={{ textAlign: 'center', fontSize: '10px', color: C.dim, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px', padding: '2px 0' }}>{d}</div>
        ))}
      </div>

      {/* Calendar grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', gap: '4px' }}>
        {/* Empty cells before first day */}
        {Array.from({length: firstDay}).map((_, i) => <div key={`e${i}`} />)}

        {/* Days */}
        {Array.from({length: daysInMonth}, (_, i) => i+1).map(day => {
          const dateStr = `${activeMonth}-${String(day).padStart(2,'0')}`
          const data = dailyMap[dateStr]
          const isToday = dateStr === new Date().toISOString().slice(0,10)
          const isHovered = hovered === dateStr

          return (
            <div key={day} onMouseEnter={() => setHovered(dateStr)} onMouseLeave={() => setHovered(null)}
              style={{
                position: 'relative', borderRadius: '8px', padding: '6px 4px',
                background: data ? cellColor(data.pnl) : C.bg,
                border: `1px solid ${isToday ? C.accent : isHovered ? C.muted : 'transparent'}`,
                minHeight: '52px', cursor: data ? 'pointer' : 'default',
                transition: 'all 0.1s'
              }}>
              <div style={{ fontSize: '11px', color: data ? (data.pnl >= 0 ? '#fff' : '#fff') : C.dim, fontWeight: isToday ? 700 : 400, opacity: data ? 1 : 0.5 }}>{day}</div>
              {data && <>
                <div style={{ fontSize: '10px', color: '#fff', fontWeight: 600, marginTop: '2px' }}>
                  {data.pnl >= 0 ? '+' : ''}${Math.abs(data.pnl) >= 1000 ? (data.pnl/1000).toFixed(1)+'k' : data.pnl.toFixed(0)}
                </div>
                <div style={{ fontSize: '9px', color: 'rgba(255,255,255,0.8)', marginTop: '1px' }}>{data.trades} op{data.trades !== 1 ? 's' : ''}</div>
              </>}

              {/* Tooltip */}
              {isHovered && data && (
                <div style={{
                  position: 'absolute', bottom: '110%', left: '50%', transform: 'translateX(-50%)',
                  background: C.card, border: `1px solid ${C.border}`, borderRadius: '8px',
                  padding: '8px 12px', zIndex: 10, whiteSpace: 'nowrap', fontSize: '12px',
                  boxShadow: '0 4px 16px rgba(0,0,0,0.3)'
                }}>
                  <div style={{ fontWeight: 600, marginBottom: '4px' }}>{dateStr}</div>
                  <div style={{ color: data.pnl >= 0 ? C.green : C.red, fontWeight: 700 }}>{data.pnl >= 0 ? '+' : ''}${data.pnl.toFixed(2)}</div>
                  <div style={{ color: C.muted, marginTop: '2px' }}>{data.trades} operaciones · {data.wins}W {data.losses}L</div>
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Legend */}
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '16px', marginTop: '14px', fontSize: '11px', color: C.dim }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <div style={{ width: '12px', height: '12px', borderRadius: '3px', background: 'rgba(16,185,129,0.3)' }}/> Pequeña ganancia
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <div style={{ width: '12px', height: '12px', borderRadius: '3px', background: 'rgba(16,185,129,1)' }}/> Gran ganancia
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <div style={{ width: '12px', height: '12px', borderRadius: '3px', background: 'rgba(239,68,68,0.3)' }}/> Pequeña pérdida
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <div style={{ width: '12px', height: '12px', borderRadius: '3px', background: 'rgba(239,68,68,1)' }}/> Gran pérdida
        </div>
      </div>
    </div>
  )
}
