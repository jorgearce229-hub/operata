import { C } from '../lib/theme'

const FEATURES = [
  {
    icon: '📋', title: 'Diario de Trading',
    desc: 'Registra cada operación con todos los detalles.',
    preview: (
      <div style={{fontFamily:'monospace',fontSize:'11px'}}>
        <div style={{display:'grid',gridTemplateColumns:'70px 60px 40px 1fr 40px 50px',gap:'4px',borderBottom:`1px solid #1e293b`,paddingBottom:'4px',marginBottom:'4px',color:'#64748b',fontSize:'10px',textTransform:'uppercase'}}>
          <span>Fecha</span><span>Par</span><span>Dir</span><span>Entrada</span><span>Res.</span><span>P&L</span>
        </div>
        {[
          {d:'Jul 01',p:'EUR/USD',dir:'LONG',e:'1.0852',r:'TP',pl:'+$125',c:'#10b981'},
          {d:'Jul 02',p:'GBP/JPY',dir:'SHORT',e:'197.45',r:'SL',pl:'-$80',c:'#ef4444'},
          {d:'Jul 03',p:'USD/CHF',dir:'LONG',e:'0.8975',r:'TP',pl:'+$110',c:'#10b981'},
          {d:'Jul 04',p:'EUR/JPY',dir:'SHORT',e:'162.80',r:'BE',pl:'$0',c:'#3b82f6'},
        ].map((t,i)=>(
          <div key={i} style={{display:'grid',gridTemplateColumns:'70px 60px 40px 1fr 40px 50px',gap:'4px',padding:'3px 0',borderBottom:'1px solid #1e293b20'}}>
            <span style={{color:'#94a3b8'}}>{t.d}</span>
            <span style={{fontWeight:600,color:'#e2e8f0'}}>{t.p}</span>
            <span style={{color:t.dir==='LONG'?'#10b981':'#ef4444',fontSize:'10px',fontWeight:700}}>{t.dir}</span>
            <span style={{color:'#94a3b8'}}>{t.e}</span>
            <span style={{color:t.c,fontSize:'10px',fontWeight:700}}>{t.r}</span>
            <span style={{color:t.c,fontWeight:700}}>{t.pl}</span>
          </div>
        ))}
      </div>
    )
  },
  {
    icon: '📊', title: 'Analytics',
    desc: 'Equity curve, win rate, expectancy y drawdown en tiempo real.',
    preview: (
      <div>
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:'6px',marginBottom:'8px'}}>
          {[{l:'Win Rate',v:'54.8%',c:'#10b981'},{l:'Expectancy',v:'+0.89R',c:'#06d6a0'},{l:'Drawdown',v:'12.4%',c:'#ef4444'}].map((s,i)=>(
            <div key={i} style={{padding:'6px',background:'#0b1120',borderRadius:'6px',textAlign:'center'}}>
              <div style={{fontSize:'9px',color:'#64748b',marginBottom:'2px'}}>{s.l}</div>
              <div style={{fontSize:'14px',fontWeight:700,color:s.c}}>{s.v}</div>
            </div>
          ))}
        </div>
        <div style={{height:'50px',position:'relative',background:'#0b112040',borderRadius:'6px',overflow:'hidden'}}>
          <svg viewBox="0 0 200 50" style={{width:'100%',height:'100%'}}>
            <defs><linearGradient id="g" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#06d6a0" stopOpacity="0.3"/><stop offset="100%" stopColor="#06d6a0" stopOpacity="0"/></linearGradient></defs>
            <path d="M0,45 L20,42 L40,38 L60,40 L80,32 L100,28 L120,30 L140,22 L160,18 L180,12 L200,8" fill="none" stroke="#06d6a0" strokeWidth="1.5"/>
            <path d="M0,45 L20,42 L40,38 L60,40 L80,32 L100,28 L120,30 L140,22 L160,18 L180,12 L200,8 L200,50 L0,50Z" fill="url(#g)"/>
          </svg>
        </div>
      </div>
    )
  },
  {
    icon: '🔬', title: 'Backtesting',
    desc: 'Valida tu estrategia antes de operar en vivo. Muestra configurable.',
    preview: (
      <div>
        <div style={{display:'flex',gap:'6px',marginBottom:'8px'}}>
          {[{l:'EUR/USD',ops:32,wr:'40.6%',e:'+0.42R',c:'#06d6a0'},{l:'GBP/JPY',ops:31,wr:'64.5%',e:'+1.32R',c:'#10b981'},{l:'USD/CHF',ops:31,wr:'51.6%',e:'+0.81R',c:'#3b82f6'}].map((p,i)=>(
            <div key={i} style={{flex:1,padding:'6px',background:'#0b1120',borderRadius:'6px'}}>
              <div style={{fontSize:'10px',fontWeight:700,color:'#e2e8f0',marginBottom:'2px'}}>{p.l}</div>
              <div style={{height:'3px',background:'#1e293b',borderRadius:'2px',marginBottom:'4px'}}>
                <div style={{height:'100%',width:`${p.ops/32*100}%`,background:p.c,borderRadius:'2px'}}/>
              </div>
              <div style={{fontSize:'9px',color:'#64748b'}}>{p.ops} ops</div>
              <div style={{fontSize:'11px',fontWeight:700,color:p.c}}>{p.e}</div>
            </div>
          ))}
        </div>
        <div style={{fontSize:'10px',color:'#64748b',textAlign:'center'}}>Meta configurable · 30, 50 o 100 operaciones</div>
      </div>
    )
  },
  {
    icon: '🧮', title: 'Calculadora',
    desc: 'Calcula lotaje exacto según tu capital y riesgo.',
    preview: (
      <div style={{fontSize:'12px'}}>
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'6px',marginBottom:'8px'}}>
          {[{l:'Instrumento',v:'EUR/USD'},{l:'Riesgo',v:'1%'},{l:'Capital',v:'$10,000'},{l:'SL',v:'15 pips'}].map((f,i)=>(
            <div key={i} style={{padding:'5px 8px',background:'#0b1120',borderRadius:'5px'}}>
              <div style={{fontSize:'9px',color:'#64748b'}}>{f.l}</div>
              <div style={{color:'#e2e8f0',fontWeight:600}}>{f.v}</div>
            </div>
          ))}
        </div>
        <div style={{padding:'8px',background:'#06d6a018',border:'1px solid #06d6a030',borderRadius:'6px',display:'flex',justifyContent:'space-between',alignItems:'center'}}>
          <span style={{color:'#64748b',fontSize:'10px'}}>Lotaje recomendado</span>
          <span style={{color:'#06d6a0',fontWeight:800,fontSize:'18px'}}>0.67 lots</span>
        </div>
      </div>
    )
  },
  {
    icon: '🕐', title: 'Sesiones',
    desc: 'Reloj de sesiones en hora local. Totalmente configurable.',
    preview: (
      <div style={{display:'flex',gap:'8px',alignItems:'center'}}>
        <svg viewBox="0 0 80 80" style={{width:'80px',height:'80px',flexShrink:0}}>
          <circle cx="40" cy="40" r="35" fill="none" stroke="#1e293b" strokeWidth="4" opacity="0.5"/>
          <path d="M40,5 A35,35 0 0,1 75,40" fill="none" stroke="#10b981" strokeWidth="4" strokeLinecap="round"/>
          <path d="M40,5 A35,35 0 0,0 5,40" fill="none" stroke="#f59e0b" strokeWidth="4" strokeLinecap="round"/>
          <path d="M5,40 A35,35 0 0,0 40,75" fill="none" stroke="#06d6a0" strokeWidth="4" strokeLinecap="round"/>
          <path d="M40,75 A35,35 0 0,0 75,40" fill="none" stroke="#ef4444" strokeWidth="4" strokeLinecap="round"/>
          <line x1="40" y1="40" x2="40" y2="15" stroke="#e2e8f0" strokeWidth="2" strokeLinecap="round"/>
          <line x1="40" y1="40" x2="55" y2="40" stroke="#94a3b8" strokeWidth="1.5" strokeLinecap="round"/>
          <circle cx="40" cy="40" r="2" fill="#ef4444"/>
        </svg>
        <div style={{flex:1}}>
          {[{n:'Londres',s:'🟢 Abierto',c:'#10b981'},{n:'Nueva York',s:'🟢 Abierto',c:'#ef4444'},{n:'Tokyo',s:'⭕ Cerrado',c:'#64748b'},{n:'Sydney',s:'⭕ Cerrado',c:'#64748b'}].map((s,i)=>(
            <div key={i} style={{display:'flex',justifyContent:'space-between',padding:'2px 0',fontSize:'10px'}}>
              <span style={{color:'#94a3b8'}}>{s.n}</span>
              <span style={{color:s.c,fontWeight:600}}>{s.s}</span>
            </div>
          ))}
        </div>
      </div>
    )
  },
  {
    icon: '📅', title: 'Calendario Económico',
    desc: 'Eventos de alto impacto con monedas afectadas.',
    preview: (
      <div style={{fontSize:'11px'}}>
        <div style={{marginBottom:'6px',padding:'5px 8px',background:'#ef444415',border:'1px solid #ef444430',borderRadius:'6px',display:'flex',gap:'8px',alignItems:'center'}}>
          <span style={{width:'8px',height:'8px',borderRadius:'2px',background:'#ef4444',display:'inline-block',flexShrink:0}}/>
          <span style={{color:'#e2e8f0',flex:1}}>Non Farm Payrolls</span>
          <span style={{color:'#ef4444',fontWeight:700}}>USD</span>
        </div>
        <div style={{marginBottom:'4px',padding:'5px 8px',background:'#f59e0b15',border:'1px solid #f59e0b30',borderRadius:'6px',display:'flex',gap:'8px',alignItems:'center'}}>
          <span style={{width:'8px',height:'8px',borderRadius:'2px',background:'#f59e0b',display:'inline-block',flexShrink:0}}/>
          <span style={{color:'#e2e8f0',flex:1}}>ECB Interest Rate</span>
          <span style={{color:'#f59e0b',fontWeight:700}}>EUR</span>
        </div>
        <div style={{padding:'5px 8px',background:'#1e293b',borderRadius:'6px',display:'flex',gap:'8px',alignItems:'center'}}>
          <span style={{width:'8px',height:'8px',borderRadius:'2px',background:'#64748b',display:'inline-block',flexShrink:0}}/>
          <span style={{color:'#94a3b8',flex:1}}>CPI MoM</span>
          <span style={{color:'#64748b',fontWeight:700}}>GBP</span>
        </div>
      </div>
    )
  },
]

const PLANS = [
  { name: 'Gratuito', price: '$0', period: 'para siempre', features: ['20 operaciones', 'Equity curve básica', 'Calculadora de posición', 'Reloj de sesiones', 'Calendario económico'], cta: 'Empezar gratis', highlight: false },
  { name: 'Pro Mensual', price: '$139', period: 'MXN/mes', features: ['Operaciones ilimitadas', 'Analytics completos', 'Calendar heatmap', 'Backtesting avanzado', 'Importar / Exportar CSV', 'P&L mensual detallado'], cta: 'Empezar Pro', highlight: false },
  { name: 'Pro Anual', price: '$1,049', period: 'MXN/año', badge: '🔥 MEJOR VALOR', note: 'Equivale a $87/mes · Ahorras 37%', features: ['Todo lo del plan mensual', 'Acceso prioritario a nuevas funciones'], cta: 'Empezar Pro Anual', highlight: true },
]

export default function Landing({ onLogin, onSignup }) {
  return (
    <div style={{ minHeight:'100vh', background:'#0b1120', color:'#e2e8f0', fontFamily:"'Inter', system-ui, sans-serif" }}>

      {/* Navbar */}
      <nav style={{ position:'sticky', top:0, zIndex:50, borderBottom:'1px solid #1e293b', background:'#0b1120ee', backdropFilter:'blur(12px)', padding:'0 40px', height:'64px', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
        <div style={{ display:'flex', alignItems:'center', gap:'10px' }}>
          <svg viewBox="0 0 128 128" width="32" height="32">
            <rect x="0" y="0" width="128" height="128" rx="24" fill="#0B2E4A"/>
            <circle cx="64" cy="64" r="29" fill="none" stroke="#8CF0C9" strokeWidth="7"/>
            <rect x="41" y="80" width="10" height="14" rx="2" fill="#F2A623"/>
            <rect x="59" y="67" width="10" height="27" rx="2" fill="#F2A623"/>
            <rect x="77" y="46" width="10" height="48" rx="2" fill="#F2A623"/>
            <line x1="82" y1="46" x2="98" y2="26" stroke="#F2A623" strokeWidth="5" strokeLinecap="round"/>
            <polygon points="0,0 -9,-4.5 -9,4.5" fill="#F2A623" transform="translate(99,25) rotate(-47.5)"/>
          </svg>
          <div style={{ fontSize:'20px', fontWeight:800, color:'#06d6a0', letterSpacing:'-0.5px' }}>Operata</div>
        </div>
        <div style={{ display:'flex', gap:'12px', alignItems:'center' }}>
          <button onClick={onLogin} style={{ padding:'8px 20px', borderRadius:'8px', border:'1px solid #1e293b', background:'transparent', color:'#e2e8f0', fontWeight:600, fontSize:'14px', cursor:'pointer' }}>
            Iniciar sesión
          </button>
          <button onClick={onSignup} style={{ padding:'8px 20px', borderRadius:'8px', border:'none', background:'#06d6a0', color:'#0b1120', fontWeight:700, fontSize:'14px', cursor:'pointer' }}>
            Crear cuenta gratis
          </button>
        </div>
      </nav>

      {/* Hero */}
      <section style={{ textAlign:'center', padding:'80px 20px 60px', maxWidth:'800px', margin:'0 auto' }}>
        <div style={{ display:'inline-block', padding:'6px 16px', borderRadius:'20px', background:'#06d6a018', border:'1px solid #06d6a040', color:'#06d6a0', fontSize:'13px', fontWeight:600, marginBottom:'24px' }}>
          Tu diario de trading inteligente
        </div>
        <h1 style={{ fontSize:'52px', fontWeight:800, lineHeight:1.1, letterSpacing:'-1.5px', marginBottom:'20px' }}>
          Opera con datos,<br/><span style={{ color:'#06d6a0' }}>no con intuición</span>
        </h1>
        <p style={{ fontSize:'17px', color:'#94a3b8', lineHeight:1.7, marginBottom:'36px', maxWidth:'540px', margin:'0 auto 36px' }}>
          Registra operaciones, analiza tu rendimiento y valida tu estrategia. Para traders de forex, acciones, crypto y futuros.
        </p>
        <div style={{ display:'flex', gap:'12px', justifyContent:'center', flexWrap:'wrap' }}>
          <button onClick={onSignup} style={{ padding:'13px 32px', borderRadius:'10px', border:'none', background:'#06d6a0', color:'#0b1120', fontWeight:700, fontSize:'15px', cursor:'pointer' }}>
            Empezar gratis →
          </button>
          <button onClick={onLogin} style={{ padding:'13px 32px', borderRadius:'10px', border:'1px solid #1e293b', background:'transparent', color:'#e2e8f0', fontWeight:600, fontSize:'15px', cursor:'pointer' }}>
            Ya tengo cuenta
          </button>
        </div>
        <div style={{ marginTop:'14px', fontSize:'12px', color:'#475569' }}>20 operaciones gratis · Sin tarjeta de crédito</div>
      </section>

      {/* Features con preview */}
      <section style={{ padding:'60px 20px', maxWidth:'1100px', margin:'0 auto' }}>
        <h2 style={{ textAlign:'center', fontSize:'32px', fontWeight:800, marginBottom:'10px', letterSpacing:'-0.5px' }}>Todo en un solo lugar</h2>
        <p style={{ textAlign:'center', color:'#94a3b8', fontSize:'15px', marginBottom:'48px' }}>Sin cambiar de pestaña, sin herramientas dispersas</p>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(320px, 1fr))', gap:'20px' }}>
          {FEATURES.map((f, i) => (
            <div key={i} style={{ background:'#111827', border:'1px solid #1e293b', borderRadius:'16px', overflow:'hidden' }}>
              {/* Preview */}
              <div style={{ padding:'20px', background:'#0d1526', borderBottom:'1px solid #1e293b', minHeight:'130px', display:'flex', alignItems:'center' }}>
                <div style={{ width:'100%' }}>{f.preview}</div>
              </div>
              {/* Info */}
              <div style={{ padding:'16px 20px' }}>
                <div style={{ display:'flex', alignItems:'center', gap:'8px', marginBottom:'6px' }}>
                  <span style={{ fontSize:'20px' }}>{f.icon}</span>
                  <div style={{ fontWeight:700, fontSize:'15px' }}>{f.title}</div>
                </div>
                <div style={{ color:'#94a3b8', fontSize:'13px', lineHeight:1.5 }}>{f.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Stats */}
      <section style={{ borderTop:'1px solid #1e293b', borderBottom:'1px solid #1e293b', padding:'40px 20px', background:'#111827' }}>
        <div style={{ maxWidth:'700px', margin:'0 auto', display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:'40px', textAlign:'center' }}>
          {[{v:'6+',l:'Mercados soportados'},{v:'Pro',l:'Analytics avanzados'},{v:'$0',l:'Para empezar'}].map((s,i)=>(
            <div key={i}>
              <div style={{ fontSize:'36px', fontWeight:800, color:'#06d6a0' }}>{s.v}</div>
              <div style={{ color:'#94a3b8', fontSize:'13px', marginTop:'4px' }}>{s.l}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Pricing */}
      <section style={{ padding:'70px 20px' }}>
        <h2 style={{ textAlign:'center', fontSize:'32px', fontWeight:800, marginBottom:'10px', letterSpacing:'-0.5px' }}>Precios simples</h2>
        <p style={{ textAlign:'center', color:'#94a3b8', fontSize:'15px', marginBottom:'48px' }}>Empieza gratis, actualiza cuando estés listo</p>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(240px,1fr))', gap:'16px', maxWidth:'860px', margin:'0 auto' }}>
          {PLANS.map((p,i)=>(
            <div key={i} style={{ padding:'28px', background:p.highlight?'#06d6a018':'#111827', border:`2px solid ${p.highlight?'#06d6a0':'#1e293b'}`, borderRadius:'16px', position:'relative' }}>
              {(p.highlight||p.badge)&&<div style={{ position:'absolute', top:'-13px', left:'50%', transform:'translateX(-50%)', background:'#06d6a0', color:'#0b1120', padding:'4px 16px', borderRadius:'20px', fontSize:'11px', fontWeight:700, whiteSpace:'nowrap' }}>{p.badge||'MÁS POPULAR'}</div>}
              <div style={{ fontWeight:700, fontSize:'17px', marginBottom:'8px' }}>{p.name}</div>
              <div style={{ display:'flex', alignItems:'baseline', gap:'4px', marginBottom:'20px' }}>
                <span style={{ fontSize:'36px', fontWeight:800, color:p.highlight?'#06d6a0':'#e2e8f0' }}>{p.price}</span>
                <span style={{ color:'#94a3b8', fontSize:'13px' }}>{p.period}</span>
              </div>
              <ul style={{ listStyle:'none', marginBottom:'24px' }}>
                {p.features.map((feat,j)=>(
                  <li key={j} style={{ display:'flex', alignItems:'center', gap:'8px', marginBottom:'9px', fontSize:'13px', color:'#94a3b8' }}>
                    <span style={{ color:'#10b981', fontWeight:700 }}>✓</span>{feat}
                  </li>
                ))}
              </ul>
              <button onClick={onSignup} style={{ width:'100%', padding:'11px', borderRadius:'9px', border:'none', background:p.highlight?'#06d6a0':'#1e293b', color:p.highlight?'#0b1120':'#e2e8f0', fontWeight:700, fontSize:'13px', cursor:'pointer' }}>
                {p.cta}
              </button>
              {p.price !== '$0' && (
                <div style={{ textAlign:'center', marginTop:'12px', fontSize:'11px', color:'#64748b', display:'flex', alignItems:'center', justifyContent:'center', gap:'6px' }}>
                  <span>💳 Tarjeta</span><span style={{ color:'#334155' }}>·</span><span>🛒 OXXO</span>
                </div>
              )}
            </div>
          ))}
        </div>
        <p style={{ textAlign:'center', color:'#64748b', fontSize:'13px', marginTop:'32px' }}>
          🛒 También puedes pagar en efectivo con <b style={{ color:'#94a3b8' }}>OXXO</b> — sin necesidad de tarjeta de crédito.
        </p>
      </section>

      {/* Footer CTA */}
      <section style={{ padding:'60px 20px', textAlign:'center', borderTop:'1px solid #1e293b' }}>
        <h2 style={{ fontSize:'30px', fontWeight:800, marginBottom:'14px', letterSpacing:'-0.5px' }}>¿Listo para operar con datos?</h2>
        <p style={{ color:'#94a3b8', fontSize:'15px', marginBottom:'28px' }}>Únete a traders que ya registran en Operata</p>
        <button onClick={onSignup} style={{ padding:'13px 40px', borderRadius:'10px', border:'none', background:'#06d6a0', color:'#0b1120', fontWeight:700, fontSize:'15px', cursor:'pointer' }}>
          Crear cuenta gratis →
        </button>
      </section>

      <footer style={{ borderTop:'1px solid #1e293b', padding:'20px 40px', display:'flex', justifyContent:'space-between', alignItems:'center', fontSize:'12px', color:'#475569' }}>
        <span style={{ fontWeight:700, color:'#06d6a0' }}>Operata</span>
        <span>© 2026 Operata · Tu diario de trading inteligente</span>
      </footer>
    </div>
  )
}
