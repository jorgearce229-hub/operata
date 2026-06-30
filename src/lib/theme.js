export const C = {
  bg: '#0b1120', card: '#111827', cardHover: '#162033',
  border: '#1e293b', text: '#e2e8f0', muted: '#94a3b8', dim: '#64748b',
  green: '#10b981', greenBg: '#10b98115', red: '#ef4444', redBg: '#ef444415',
  accent: '#06d6a0', accentBg: '#06d6a018', blue: '#3b82f6', blueBg: '#3b82f615',
  yellow: '#f59e0b', yellowBg: '#f59e0b15', purple: '#8b5cf6', purpleBg: '#8b5cf615',
}

export const badge = (color) => ({
  display: 'inline-block', padding: '3px 8px', borderRadius: '6px',
  fontSize: '11px', fontWeight: 600,
  background: color === 'g' ? C.greenBg : color === 'r' ? C.redBg :
    color === 'y' ? C.yellowBg : color === 'p' ? C.purpleBg : C.blueBg,
  color: color === 'g' ? C.green : color === 'r' ? C.red :
    color === 'y' ? C.yellow : color === 'p' ? C.purple : C.blue,
})

export const card = {
  background: C.card, border: `1px solid ${C.border}`,
  borderRadius: '12px', padding: '20px', marginBottom: '16px',
}

export const label = {
  fontSize: '11px', color: C.dim, textTransform: 'uppercase',
  letterSpacing: '0.8px', marginBottom: '4px', fontWeight: 600,
}

export const input = {
  background: C.bg, border: `1px solid ${C.border}`, borderRadius: '8px',
  padding: '10px 12px', color: C.text, fontSize: '14px', width: '100%',
}

export const btn = (variant = 'primary') => ({
  padding: '9px 18px', borderRadius: '8px', border: 'none', fontWeight: 600,
  fontSize: '13px', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '6px',
  background: variant === 'primary' ? C.accent : variant === 'danger' ? C.red :
    variant === 'ghost' ? 'transparent' : C.bg,
  color: variant === 'primary' ? C.bg : variant === 'danger' ? '#fff' : C.text,
  border: variant === 'ghost' ? `1px solid ${C.border}` : 'none',
})
