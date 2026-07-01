import { C, btn } from '../lib/theme'

const FEATURES = [
  { icon: '📋', title: 'Diario de Trading', desc: 'Registra cada operación con todos los detalles. Historial organizado por mes con P&L automático.' },
  { icon: '📊', title: 'Analytics en Tiempo Real', desc: 'Equity curve, win rate, expectancy, drawdown máximo. Visualiza tu rendimiento real.' },
  { icon: '🔬', title: 'Backtesting', desc: 'Valida tu estrategia con muestra configurable. Estadísticas por instrumento antes de operar en vivo.' },
  { icon: '🧮', title: 'Calculadora de Posición', desc: 'Calcula lotaje exacto, SL y TP automáticos según tu riesgo. Compatible con cualquier instrumento.' },
  { icon: '🕐', title: 'Reloj de Sesiones', desc: 'Visualiza las sesiones de mercado en hora local. Configurable para cualquier mercado.' },
  { icon: '📅', title: 'Calendario Económico', desc: 'Eventos de alto impacto con pares afectados. Nunca más entres en un día de alto riesgo sin saberlo.' },
]

const PLANS = [
  { name: 'Gratuito', price: '$0', period: 'para siempre', features: ['50 operaciones', 'Equity curve básica', 'Calculadora de posición', 'Reloj de sesiones', 'Calendario económico'], cta: 'Empezar gratis', highlight: false },
  { name: 'Pro', price: '$9.99', period: '/mes', features: ['Operaciones ilimitadas', 'Analytics completos', 'Backtesting avanzado', 'P&L mensual detallado', 'Exportar datos', 'Todo el plan gratuito'], cta: 'Empezar Pro', highlight: true },
]

export default function Landing({ onLogin, onSignup }) {
  return (
    <div style={{ minHeight: '100vh', background: C.bg, color: C.text, fontFamily: "'Inter', system-ui, sans-serif" }}>

      {/* Navbar */}
      <nav style={{ position: 'sticky', top: 0, zIndex: 50, borderBottom: `1px solid ${C.border}`, background: C.bg + 'ee', backdropFilter: 'blur(12px)', padding: '0 40px', height: '64px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ fontSize: '20px', fontWeight: 800, color: C.accent, letterSpacing: '-0.5px' }}>Operata</div>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <button onClick={onLogin} style={{ padding: '8px 20px', borderRadius: '8px', border: `1px solid ${C.border}`, background: 'transparent', color: C.text, fontWeight: 600, fontSize: '14px', cursor: 'pointer' }}>
            Iniciar sesión
          </button>
          <button onClick={onSignup} style={{ padding: '8px 20px', borderRadius: '8px', border: 'none', background: C.accent, color: C.bg, fontWeight: 700, fontSize: '14px', cursor: 'pointer' }}>
            Crear cuenta gratis
          </button>
        </div>
      </nav>

      {/* Hero */}
      <section style={{ textAlign: 'center', padding: '100px 20px 80px', maxWidth: '800px', margin: '0 auto' }}>
        <div style={{ display: 'inline-block', padding: '6px 16px', borderRadius: '20px', background: C.accentBg, border: `1px solid ${C.accent}40`, color: C.accent, fontSize: '13px', fontWeight: 600, marginBottom: '24px' }}>
          Tu diario de trading inteligente
        </div>
        <h1 style={{ fontSize: '56px', fontWeight: 800, lineHeight: 1.1, letterSpacing: '-1.5px', marginBottom: '20px' }}>
          Opera con datos,<br />
          <span style={{ color: C.accent }}>no con intuición</span>
        </h1>
        <p style={{ fontSize: '18px', color: C.muted, lineHeight: 1.7, marginBottom: '40px', maxWidth: '560px', margin: '0 auto 40px' }}>
          Registra tus operaciones, analiza tu rendimiento real y valida tu estrategia con backtesting. Para traders de forex, acciones, crypto y futuros.
        </p>
        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
          <button onClick={onSignup} style={{ padding: '14px 32px', borderRadius: '10px', border: 'none', background: C.accent, color: C.bg, fontWeight: 700, fontSize: '16px', cursor: 'pointer' }}>
            Empezar gratis →
          </button>
          <button onClick={onLogin} style={{ padding: '14px 32px', borderRadius: '10px', border: `1px solid ${C.border}`, background: 'transparent', color: C.text, fontWeight: 600, fontSize: '16px', cursor: 'pointer' }}>
            Ya tengo cuenta
          </button>
        </div>
        <div style={{ marginTop: '16px', fontSize: '13px', color: C.dim }}>Sin tarjeta de crédito · Plan gratuito de por vida</div>
      </section>

      {/* Stats */}
      <section style={{ borderTop: `1px solid ${C.border}`, borderBottom: `1px solid ${C.border}`, padding: '40px 20px' }}>
        <div style={{ maxWidth: '800px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '40px', textAlign: 'center' }}>
          {[{ v: '6', l: 'Mercados soportados' }, { v: '50+', l: 'Métricas de rendimiento' }, { v: '$0', l: 'Para empezar' }].map((s, i) => (
            <div key={i}>
              <div style={{ fontSize: '40px', fontWeight: 800, color: C.accent }}>{s.v}</div>
              <div style={{ color: C.muted, fontSize: '14px', marginTop: '4px' }}>{s.l}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section style={{ padding: '80px 20px', maxWidth: '1000px', margin: '0 auto' }}>
        <h2 style={{ textAlign: 'center', fontSize: '36px', fontWeight: 800, marginBottom: '12px', letterSpacing: '-0.5px' }}>Todo lo que necesitas para operar mejor</h2>
        <p style={{ textAlign: 'center', color: C.muted, fontSize: '16px', marginBottom: '60px' }}>En una sola plataforma, sin cambiar de pestaña</p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(280px,1fr))', gap: '20px' }}>
          {FEATURES.map((f, i) => (
            <div key={i} style={{ padding: '28px', background: C.card, border: `1px solid ${C.border}`, borderRadius: '16px' }}>
              <div style={{ fontSize: '32px', marginBottom: '14px' }}>{f.icon}</div>
              <div style={{ fontWeight: 700, fontSize: '16px', marginBottom: '8px' }}>{f.title}</div>
              <div style={{ color: C.muted, fontSize: '14px', lineHeight: 1.6 }}>{f.desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Pricing */}
      <section style={{ padding: '80px 20px', background: C.card, borderTop: `1px solid ${C.border}` }}>
        <h2 style={{ textAlign: 'center', fontSize: '36px', fontWeight: 800, marginBottom: '12px', letterSpacing: '-0.5px' }}>Precios simples</h2>
        <p style={{ textAlign: 'center', color: C.muted, fontSize: '16px', marginBottom: '60px' }}>Empieza gratis, actualiza cuando estés listo</p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(280px,1fr))', gap: '20px', maxWidth: '680px', margin: '0 auto' }}>
          {PLANS.map((p, i) => (
            <div key={i} style={{ padding: '32px', background: p.highlight ? C.accentBg : C.bg, border: `2px solid ${p.highlight ? C.accent : C.border}`, borderRadius: '16px', position: 'relative' }}>
              {p.highlight && <div style={{ position: 'absolute', top: '-12px', left: '50%', transform: 'translateX(-50%)', background: C.accent, color: C.bg, padding: '4px 16px', borderRadius: '20px', fontSize: '12px', fontWeight: 700 }}>MÁS POPULAR</div>}
              <div style={{ fontWeight: 700, fontSize: '18px', marginBottom: '8px' }}>{p.name}</div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px', marginBottom: '24px' }}>
                <span style={{ fontSize: '40px', fontWeight: 800, color: p.highlight ? C.accent : C.text }}>{p.price}</span>
                <span style={{ color: C.muted, fontSize: '14px' }}>{p.period}</span>
              </div>
              <ul style={{ listStyle: 'none', marginBottom: '28px' }}>
                {p.features.map((f, j) => (
                  <li key={j} style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px', fontSize: '14px', color: C.muted }}>
                    <span style={{ color: C.green, fontWeight: 700 }}>✓</span> {f}
                  </li>
                ))}
              </ul>
              <button onClick={p.highlight ? onSignup : onSignup} style={{ width: '100%', padding: '12px', borderRadius: '10px', border: 'none', background: p.highlight ? C.accent : C.border, color: p.highlight ? C.bg : C.text, fontWeight: 700, fontSize: '14px', cursor: 'pointer' }}>
                {p.cta}
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* Footer CTA */}
      <section style={{ padding: '80px 20px', textAlign: 'center' }}>
        <h2 style={{ fontSize: '36px', fontWeight: 800, marginBottom: '16px', letterSpacing: '-0.5px' }}>¿Listo para operar con datos?</h2>
        <p style={{ color: C.muted, fontSize: '16px', marginBottom: '32px' }}>Únete a traders que ya llevan su diario en Operata</p>
        <button onClick={onSignup} style={{ padding: '14px 40px', borderRadius: '10px', border: 'none', background: C.accent, color: C.bg, fontWeight: 700, fontSize: '16px', cursor: 'pointer' }}>
          Crear cuenta gratis →
        </button>
      </section>

      {/* Footer */}
      <footer style={{ borderTop: `1px solid ${C.border}`, padding: '24px 40px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '13px', color: C.dim }}>
        <span style={{ fontWeight: 700, color: C.accent }}>Operata</span>
        <span>© 2026 Operata. Tu diario de trading inteligente.</span>
      </footer>
    </div>
  )
}
