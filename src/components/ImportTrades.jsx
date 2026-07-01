import { useState, useRef } from 'react'
import { supabase } from '../lib/supabase'
import { C, card, btn } from '../lib/theme'

const REQUIRED_COLS = ['Instrumento', 'Dirección']
const COL_MAP = {
  'Fecha entrada': 'entry_date', 'Fecha cierre': 'close_date',
  'Instrumento': 'instrument', 'Dirección': 'direction',
  'Entrada': 'entry_price', 'Stop Loss': 'stop_loss',
  'Take Profit': 'take_profit', 'Precio cierre': 'close_price',
  'Resultado': 'result', 'R': 'r_multiple', 'P&L': 'pnl',
  'Riesgo %': 'risk_pct', 'Notas': 'notes'
}

export default function ImportTrades({ userId, onImported }) {
  const [step, setStep] = useState('upload') // upload | preview | done
  const [rows, setRows] = useState([])
  const [headers, setHeaders] = useState([])
  const [error, setError] = useState(null)
  const [importing, setImporting] = useState(false)
  const [importedCount, setImportedCount] = useState(0)
  const fileRef = useRef()

  const parseCSV = (text) => {
    const lines = text.split('\n').filter(l => l.trim())
    if (lines.length < 2) return { error: 'El archivo debe tener encabezados y al menos una fila de datos.' }
    const sep = lines[0].includes(',') ? ',' : ';'
    const headers = lines[0].split(sep).map(h => h.trim().replace(/"/g, ''))
    const missing = REQUIRED_COLS.filter(c => !headers.includes(c))
    if (missing.length) return { error: `Faltan columnas requeridas: ${missing.join(', ')}` }
    const rows = lines.slice(1).map(line => {
      const vals = line.split(sep).map(v => v.trim().replace(/"/g, ''))
      const row = {}
      headers.forEach((h, i) => row[h] = vals[i] || '')
      return row
    }).filter(r => r['Instrumento'])
    return { headers, rows }
  }

  const handleFile = (file) => {
    if (!file) return
    if (!file.name.endsWith('.csv')) { setError('Solo se aceptan archivos .csv'); return }
    setError(null)
    const reader = new FileReader()
    reader.onload = (e) => {
      const result = parseCSV(e.target.result)
      if (result.error) { setError(result.error); return }
      setHeaders(result.headers)
      setRows(result.rows)
      setStep('preview')
    }
    reader.readAsText(file)
  }

  const handleImport = async () => {
    setImporting(true)
    const trades = rows.map(row => {
      const trade = { user_id: userId }
      Object.entries(COL_MAP).forEach(([col, field]) => {
        if (row[col] !== undefined) {
          const v = row[col]
          if (['entry_price','stop_loss','take_profit','close_price','r_multiple','pnl','risk_pct'].includes(field))
            trade[field] = parseFloat(v) || null
          else trade[field] = v || null
        }
      })
      // Normalize direction
      if (trade.direction) trade.direction = trade.direction.toUpperCase()
      if (!['LONG','SHORT'].includes(trade.direction)) trade.direction = 'LONG'
      // Normalize result
      if (trade.result) trade.result = trade.result.toUpperCase()
      if (!['TP','SL','BE','MANUAL','OPEN'].includes(trade.result)) trade.result = 'MANUAL'
      return trade
    })

    const batchSize = 50
    let count = 0
    for (let i = 0; i < trades.length; i += batchSize) {
      const batch = trades.slice(i, i + batchSize)
      const { error } = await supabase.from('trades').insert(batch)
      if (!error) count += batch.length
    }

    setImportedCount(count)
    setImporting(false)
    setStep('done')
    onImported()
  }

  const reset = () => { setStep('upload'); setRows([]); setHeaders([]); setError(null); setImportedCount(0) }

  const resultColor = r => r === 'TP' ? C.green : r === 'SL' ? C.red : r === 'BE' ? C.blue : C.muted

  return (
    <div style={card}>
      <div style={{ fontSize: '13px', fontWeight: 600, color: C.muted, textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: '16px' }}>
        📥 Importar Operaciones
      </div>

      {step === 'upload' && (
        <div>
          {/* Drop zone */}
          <div onClick={() => fileRef.current.click()}
            onDragOver={e => e.preventDefault()}
            onDrop={e => { e.preventDefault(); handleFile(e.dataTransfer.files[0]) }}
            style={{ border: `2px dashed ${C.border}`, borderRadius: '12px', padding: '48px 24px', textAlign: 'center', cursor: 'pointer', transition: 'border-color 0.15s' }}
            onMouseEnter={e => e.currentTarget.style.borderColor = C.accent}
            onMouseLeave={e => e.currentTarget.style.borderColor = C.border}>
            <div style={{ fontSize: '36px', marginBottom: '12px' }}>📂</div>
            <div style={{ fontWeight: 600, marginBottom: '6px' }}>Arrastra tu archivo CSV aquí</div>
            <div style={{ color: C.muted, fontSize: '13px', marginBottom: '16px' }}>o haz clic para seleccionar</div>
            <button style={{ ...btn('ghost'), fontSize: '13px' }}>Seleccionar archivo</button>
          </div>
          <input ref={fileRef} type="file" accept=".csv" style={{ display: 'none' }} onChange={e => handleFile(e.target.files[0])} />

          {error && <div style={{ marginTop: '12px', padding: '10px 14px', background: C.redBg, border: `1px solid ${C.red}30`, borderRadius: '8px', color: C.red, fontSize: '13px' }}>{error}</div>}

          {/* Format guide */}
          <div style={{ marginTop: '20px', padding: '14px', background: C.bg, borderRadius: '10px', border: `1px solid ${C.border}` }}>
            <div style={{ fontSize: '12px', fontWeight: 600, color: C.muted, marginBottom: '8px' }}>Columnas soportadas (separadas por coma):</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
              {Object.keys(COL_MAP).map(c => (
                <span key={c} style={{ padding: '3px 8px', borderRadius: '6px', fontSize: '11px', background: REQUIRED_COLS.includes(c) ? C.accentBg : C.card, color: REQUIRED_COLS.includes(c) ? C.accent : C.muted, border: `1px solid ${REQUIRED_COLS.includes(c) ? C.accent + '40' : C.border}` }}>
                  {c}{REQUIRED_COLS.includes(c) ? ' *' : ''}
                </span>
              ))}
            </div>
            <div style={{ marginTop: '8px', fontSize: '11px', color: C.dim }}>* Columnas requeridas · Dirección: LONG o SHORT · Resultado: TP, SL, BE, MANUAL, OPEN</div>
          </div>
        </div>
      )}

      {step === 'preview' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
            <div style={{ fontSize: '14px', color: C.muted }}>
              <span style={{ color: C.accent, fontWeight: 700 }}>{rows.length}</span> operaciones encontradas — previsualización:
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button onClick={reset} style={{ ...btn('ghost'), fontSize: '12px', padding: '6px 14px' }}>← Volver</button>
              <button onClick={handleImport} disabled={importing} style={{ ...btn(), fontSize: '12px', padding: '6px 14px' }}>
                {importing ? 'Importando...' : `Importar ${rows.length} operaciones`}
              </button>
            </div>
          </div>

          <div style={{ overflowX: 'auto', maxHeight: '400px', overflowY: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '700px' }}>
              <thead style={{ position: 'sticky', top: 0, background: C.card }}>
                <tr>
                  {['Fecha','Instrumento','Dir','Entrada','SL','TP','Resultado','R','P&L'].map(h => (
                    <th key={h} style={{ textAlign: 'left', padding: '8px 10px', fontSize: '11px', color: C.dim, textTransform: 'uppercase', letterSpacing: '0.8px', borderBottom: `1px solid ${C.border}`, fontWeight: 600, whiteSpace: 'nowrap' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.slice(0, 20).map((row, i) => (
                  <tr key={i}>
                    <td style={{ padding: '8px 10px', fontSize: '12px', color: C.muted, borderBottom: `1px solid ${C.border}08` }}>{row['Fecha entrada'] || '—'}</td>
                    <td style={{ padding: '8px 10px', fontSize: '13px', fontWeight: 600, borderBottom: `1px solid ${C.border}08` }}>{row['Instrumento']}</td>
                    <td style={{ padding: '8px 10px', borderBottom: `1px solid ${C.border}08` }}>
                      <span style={{ padding: '2px 8px', borderRadius: '6px', fontSize: '11px', fontWeight: 600, background: row['Dirección']==='LONG'?C.greenBg:C.redBg, color: row['Dirección']==='LONG'?C.green:C.red }}>{row['Dirección']}</span>
                    </td>
                    <td style={{ padding: '8px 10px', fontSize: '12px', borderBottom: `1px solid ${C.border}08` }}>{row['Entrada'] || '—'}</td>
                    <td style={{ padding: '8px 10px', fontSize: '12px', color: C.red, borderBottom: `1px solid ${C.border}08` }}>{row['Stop Loss'] || '—'}</td>
                    <td style={{ padding: '8px 10px', fontSize: '12px', color: C.green, borderBottom: `1px solid ${C.border}08` }}>{row['Take Profit'] || '—'}</td>
                    <td style={{ padding: '8px 10px', borderBottom: `1px solid ${C.border}08` }}>
                      <span style={{ padding: '2px 8px', borderRadius: '6px', fontSize: '11px', fontWeight: 600, color: resultColor(row['Resultado']), background: resultColor(row['Resultado']) + '15' }}>{row['Resultado'] || '—'}</span>
                    </td>
                    <td style={{ padding: '8px 10px', fontSize: '12px', color: parseFloat(row['R']) >= 0 ? C.green : C.red, fontWeight: 600, borderBottom: `1px solid ${C.border}08` }}>{row['R'] ? `${parseFloat(row['R']) >= 0 ? '+' : ''}${row['R']}R` : '—'}</td>
                    <td style={{ padding: '8px 10px', fontSize: '12px', color: parseFloat(row['P&L']) >= 0 ? C.green : C.red, fontWeight: 600, borderBottom: `1px solid ${C.border}08` }}>{row['P&L'] ? `${parseFloat(row['P&L']) >= 0 ? '+' : ''}$${row['P&L']}` : '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {rows.length > 20 && <div style={{ textAlign: 'center', padding: '10px', fontSize: '12px', color: C.dim }}>Mostrando 20 de {rows.length} operaciones</div>}
          </div>
        </div>
      )}

      {step === 'done' && (
        <div style={{ textAlign: 'center', padding: '40px' }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>✅</div>
          <div style={{ fontSize: '18px', fontWeight: 700, marginBottom: '8px' }}>{importedCount} operaciones importadas</div>
          <div style={{ color: C.muted, fontSize: '13px', marginBottom: '24px' }}>Puedes verlas en el Diario de Trading</div>
          <button onClick={reset} style={{ ...btn('ghost') }}>Importar otro archivo</button>
        </div>
      )}
    </div>
  )
}
