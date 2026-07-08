// Calcula hora, minuto, segundo y offset UTC (en horas) para una zona horaria IANA específica.
// Usa el truco de comparar la representación en UTC vs. la zona destino para obtener el offset
// correcto incluso con horario de verano (DST).
export function getZonedTime(timezone) {
  const now = new Date()
  const tz = timezone || Intl.DateTimeFormat().resolvedOptions().timeZone

  let h, m, s
  try {
    const parts = new Intl.DateTimeFormat('en-US', {
      timeZone: tz, hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit',
    }).formatToParts(now)
    const get = (type) => parseInt(parts.find(p => p.type === type)?.value || '0', 10)
    h = get('hour') % 24
    m = get('minute')
    s = get('second')
  } catch {
    // Timezone inválida o no soportada: usamos la hora local del navegador como respaldo
    h = now.getHours(); m = now.getMinutes(); s = now.getSeconds()
  }

  let offset
  try {
    const utcDate = new Date(now.toLocaleString('en-US', { timeZone: 'UTC' }))
    const tzDate = new Date(now.toLocaleString('en-US', { timeZone: tz }))
    offset = Math.round((tzDate.getTime() - utcDate.getTime()) / 3600000)
  } catch {
    offset = -(now.getTimezoneOffset() / 60)
  }

  return { h, m, s, offset, date: now }
}
