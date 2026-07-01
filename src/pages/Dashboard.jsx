import { useState, useEffect } from 'react'
import { supabase, FREE_TRADE_LIMIT } from '../lib/supabase'
import { C, THEMES, setTheme } from '../lib/theme'
import Journal from '../components/Journal'
import Analytics from '../components/Analytics'
import Backtesting from '../components/Backtesting'
import Calculator from '../components/Calculator'
import SessionClock from '../components/SessionClock'
import EconomicCalendar from '../components/EconomicCalendar'
import Settings from './Settings'

const TABS = [
  { id: 'journal', label: 'Diario', icon: '📋' },
  { id: 'analytics', label: 'Analytics', icon: '📊' },
  { id: 'backtest', label: 'Backtesting', icon: '🔬' },
  { id: 'calculator', label: 'Calculadora', icon: '🧮' },
  { id: 'sessions', label: 'Sesiones', icon: '🕐' },
  { id: 'calendar', label: 'Calendario', icon: '📅' },
  { id: 'settings', label: 'Configuración', icon: '⚙️' },
]

export default function Dashboard({ session, profile, onProfileUpdate }) {
  const [tab, setTab] = useState('journal')
  const [trades, setTrades] = useState([])
  const [loading, setLoading] = useState(true)
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [theme, setThemeState] = useState(() => localStorage.getItem('operata-theme') || 'dark')

  const applyTheme = (mode) => {
    setTheme(mode)
    setThemeState(mode)
    localStorage.setItem('operata-theme', mode)
    document.body.style.background = THEMES[mode].bg
    document.body.style.color = THEMES[mode].text
  }

  useEffect(() => { applyTheme(theme) }, [])
  useEffect(() => { loadTrades() }, [])

  const isPro = profile?.plan === 'pro'
  const tradeCount = trades.length
  const isLimited = !isPro && tradeCount >= FREE_TRADE_LIMIT

  const loadTrades = async () => {
    setLoading(true)
    const { data } = await supabase.from('trades').select('*').eq('user_id', session.user.id).order('entry_date', { ascending: false })
    setTrades(data || [])
    setLoading(false)
  }

  const handleSignOut = () => supabase.auth.signOut()

  const bg = THEMES[theme]

  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden', background: bg.bg, color: bg.text }}>
      {/* Sidebar */}
      <div style={{ width: sidebarOpen ? '220px' : '64px', background: bg.card, borderRight: `1px solid ${bg.border}`, display: 'flex', flexDirection: 'column', transition: 'width 0.2s', flexShrink: 0 }}>
        {/* Logo */}
        <div style={{ padding: '20px 16px', borderBottom: `1px solid ${bg.border}`, display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ width: '32px', height: '32px', background: bg.accent, borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px', fontWeight: 800, color: bg.bg, flexShrink: 0 }}>O</div>
          {sidebarOpen && <div>
            <div style={{ fontSize: '16px', fontWeight: 700, color: bg.accent }}>Operata</div>
            <div style={{ fontSize: '10px', color: bg.dim, textTransform: 'uppercase', letterSpacing: '1px' }}>{isPro ? '✦ Pro' : 'Free'}</div>
          </div>}
        </div>

        {/* Nav */}
        <div style={{ padding: '12px 8px', flex: 1 }}>
          {TABS.map(t => (
            <div key={t.id} onClick={() => setTab(t.id)} style={{
              display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 12px',
              borderRadius: '8px', cursor: 'pointer', marginBottom: '2px',
              background: tab === t.id ? bg.accentBg : 'transparent',
              color: tab === t.id ? bg.accent : bg.muted,
              fontWeight: tab === t.id ? 600 : 400, fontSize: '13px',
              border: tab === t.id ? `1px solid ${bg.accent}30` : '1px solid transparent',
            }}>
              <span style={{ fontSize: '18px', flexShrink: 0 }}>{t.icon}</span>
              {sidebarOpen && t.label}
            </div>
          ))}
        </div>

        {/* Theme toggle */}
        {sidebarOpen && (
          <div style={{ padding: '10px 16px', borderTop: `1px solid ${bg.border}` }}>
            <div style={{ display: 'flex', gap: '6px' }}>
              {[{ v: 'dark', l: '🌙' }, { v: 'light', l: '☀️' }].map(t => (
                <button key={t.v} onClick={() => applyTheme(t.v)} style={{
                  flex: 1, padding: '6px', borderRadius: '6px', border: `1px solid ${theme === t.v ? bg.accent : bg.border}`,
                  background: theme === t.v ? bg.accentBg : 'transparent', cursor: 'pointer', fontSize: '14px'
                }}>{t.l}</button>
              ))}
            </div>
          </div>
        )}

        {/* Footer */}
        {sidebarOpen && <div style={{ padding: '16px', borderTop: `1px solid ${bg.border}`, fontSize: '11px' }}>
          {!isPro && <div style={{ marginBottom: '10px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', color: bg.muted, marginBottom: '4px' }}>
              <span>Operaciones</span>
              <span style={{ color: tradeCount >= FREE_TRADE_LIMIT ? bg.red : bg.text }}>{tradeCount}/{FREE_TRADE_LIMIT}</span>
            </div>
            <div style={{ height: '4px', background: bg.border, borderRadius: '2px' }}>
              <div style={{ height: '100%', width: `${Math.min(tradeCount / FREE_TRADE_LIMIT * 100, 100)}%`, background: tradeCount >= FREE_TRADE_LIMIT ? bg.red : bg.accent, borderRadius: '2px' }} />
            </div>
          </div>}
          <div style={{ color: bg.dim, fontSize: '11px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '130px' }}>{session.user.email}</span>
            <span style={{ cursor: 'pointer', color: bg.muted }} onClick={handleSignOut} title="Cerrar sesión">⏏</span>
          </div>
        </div>}

        <div onClick={() => setSidebarOpen(!sidebarOpen)} style={{ padding: '12px', textAlign: 'center', cursor: 'pointer', color: bg.dim, borderTop: `1px solid ${bg.border}`, fontSize: '12px' }}>
          {sidebarOpen ? '◀' : '▶'}
        </div>
      </div>

      {/* Main */}
      <div style={{ flex: 1, overflow: 'auto', padding: '24px', background: bg.bg }}>
        {isLimited && (
          <div style={{ padding: '12px 16px', background: bg.yellowBg, border: `1px solid ${bg.yellow}30`, borderRadius: '10px', marginBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '13px', color: bg.yellow }}>🔒 Has alcanzado el límite de {FREE_TRADE_LIMIT} operaciones del plan gratuito</span>
            <button style={{ padding: '6px 14px', borderRadius: '8px', border: 'none', background: bg.accent, color: bg.bg, fontWeight: 600, fontSize: '12px', cursor: 'pointer' }}>Upgrade a Pro</button>
          </div>
        )}

        <div className="fade-in" key={tab}>
          {tab === 'journal' && <Journal trades={trades} userId={session.user.id} onUpdate={loadTrades} isPro={isPro} tradeCount={tradeCount} profile={profile} />}
          {tab === 'analytics' && <Analytics trades={trades} isPro={isPro} />}
          {tab === 'backtest' && <Backtesting userId={session.user.id} isPro={isPro} />}
          {tab === 'calculator' && <Calculator profile={profile} />}
          {tab === 'sessions' && <SessionClock userId={session.user.id} focus={profile?.trading_focus} />}
          {tab === 'calendar' && <EconomicCalendar focus={profile?.trading_focus} />}
          {tab === 'settings' && <Settings profile={profile} userId={session.user.id} onProfileUpdate={onProfileUpdate} theme={theme} onThemeChange={applyTheme} />}
        </div>
      </div>
    </div>
  )
}
