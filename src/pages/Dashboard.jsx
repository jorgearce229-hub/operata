import React, { useState, useEffect } from 'react'
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
]


function SidebarClock({ bg }) {
  const [now, setNow] = React.useState(new Date())
  React.useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(t)
  }, [])
  const timeStr = now.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
  const dateStr = now.toLocaleDateString('es-MX', { weekday: 'short', day: 'numeric', month: 'short' })
  return (
    <div style={{ textAlign: 'center', padding: '4px 0 6px' }}>
      <div style={{ fontSize: '18px', fontWeight: 700, color: bg.text, letterSpacing: '1px', fontVariantNumeric: 'tabular-nums' }}>{timeStr}</div>
      <div style={{ fontSize: '10px', color: bg.dim, marginTop: '2px', textTransform: 'capitalize' }}>{dateStr}</div>
    </div>
  )
}

export default function Dashboard({ session, profile, onProfileUpdate }) {
  const [tab, setTab] = useState('journal')
  const [trades, setTrades] = useState([])
  const [loading, setLoading] = useState(true)
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [showSettings, setShowSettings] = React.useState(false)
  const showSettingsRef = React.useRef(false)
  const [showUserMenu, setShowUserMenu] = React.useState(false)
  const [theme, setThemeState] = useState(() => localStorage.getItem('operata-theme') || 'dark')

  const applyTheme = (mode) => {
    setTheme(mode)
    setThemeState(mode)
    localStorage.setItem('operata-theme', mode)
    document.body.style.background = THEMES[mode].bg
    document.body.style.color = THEMES[mode].text
  }

  useEffect(() => { applyTheme(theme) }, [])
  useEffect(() => {
    const close = (e) => { if (!e.target.closest('[data-usermenu]')) setShowUserMenu(false) }
    document.addEventListener('mousedown', close)
    return () => document.removeEventListener('mousedown', close)
  }, [])
  useEffect(() => { loadTrades() }, [])

  const isPro = profile?.plan === 'pro'
  const tradeCount = trades.length
  const isLimited = !isPro && tradeCount >= FREE_TRADE_LIMIT

  // Wrap onProfileUpdate to preserve showSettings state
  const handleProfileUpdate = React.useCallback((newProfile) => {
    showSettingsRef.current = true
    onProfileUpdate(newProfile)
  }, [onProfileUpdate])

  // Restore showSettings after profile update
  React.useEffect(() => {
    if (showSettingsRef.current) {
      setShowSettings(true)
      showSettingsRef.current = false
    }
  }, [profile])

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
            <div key={t.id} onClick={() => { setTab(t.id); setShowSettings(false) }} style={{
              display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 12px',
              borderRadius: '8px', cursor: 'pointer', marginBottom: '2px',
              background: tab === t.id && !showSettings ? bg.accentBg : 'transparent',
              color: tab === t.id && !showSettings ? bg.accent : bg.muted,
              fontWeight: tab === t.id && !showSettings ? 600 : 400, fontSize: '13px',
              border: tab === t.id && !showSettings ? `1px solid ${bg.accent}30` : '1px solid transparent',
            }}>
              <span style={{ fontSize: '18px', flexShrink: 0 }}>{t.icon}</span>
              {sidebarOpen && t.label}
            </div>
          ))}
        </div>

        {/* Footer */}
        <div style={{ borderTop: `1px solid ${bg.border}` }}>
          {sidebarOpen && (
            <div style={{ padding: '12px 16px 8px' }}>
              {!isPro && <div style={{ marginBottom: '10px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', color: bg.muted, marginBottom: '4px', fontSize: '11px' }}>
                  <span>Operaciones</span>
                  <span style={{ color: tradeCount >= FREE_TRADE_LIMIT ? bg.red : bg.text, fontWeight: 600 }}>{tradeCount}/{FREE_TRADE_LIMIT}</span>
                </div>
                <div style={{ height: '4px', background: bg.border, borderRadius: '2px' }}>
                  <div style={{ height: '100%', width: `${Math.min(tradeCount / FREE_TRADE_LIMIT * 100, 100)}%`, background: tradeCount >= FREE_TRADE_LIMIT ? bg.red : bg.accent, borderRadius: '2px' }} />
                </div>
              </div>}
              <SidebarClock bg={bg} />
            </div>
          )}
          {/* Collapse button — subtle, on the divider line */}
          <div onClick={() => setSidebarOpen(!sidebarOpen)}
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '28px', cursor: 'pointer', color: bg.dim, fontSize: '10px', letterSpacing: '2px', opacity: 0.5, transition: 'opacity 0.15s' }}
            onMouseEnter={e => e.currentTarget.style.opacity = 1}
            onMouseLeave={e => e.currentTarget.style.opacity = 0.5}>
            {sidebarOpen ? '‹‹' : '››'}
          </div>
        </div>
      </div>

      {/* Main */}
      <div style={{ flex: 1, overflow: 'auto', display: 'flex', flexDirection: 'column', background: bg.bg }}>
        {/* Top bar */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '8px', padding: '12px 24px', borderBottom: `1px solid ${bg.border}`, background: bg.card, flexShrink: 0 }}>
          {/* Theme toggle */}
          <div style={{ display: 'flex', background: bg.bg, borderRadius: '8px', border: `1px solid ${bg.border}`, overflow: 'hidden' }}>
            {[{ v: 'dark', l: '🌙' }, { v: 'light', l: '☀️' }].map(t => (
              <button key={t.v} onClick={() => applyTheme(t.v)} style={{
                padding: '6px 12px', border: 'none', cursor: 'pointer', fontSize: '14px',
                background: theme === t.v ? bg.accent : 'transparent',
                transition: 'background 0.15s'
              }}>{t.l}</button>
            ))}
          </div>
          {/* User menu */}
          <div style={{ position: 'relative' }} data-usermenu="true">
            <button onClick={() => setShowUserMenu(!showUserMenu)} style={{
              width: '36px', height: '36px', borderRadius: '50%', border: `2px solid ${showUserMenu ? bg.accent : bg.border}`,
              background: showUserMenu ? bg.accentBg : bg.bg, cursor: 'pointer', fontSize: '16px',
              display: 'flex', alignItems: 'center', justifyContent: 'center', color: showUserMenu ? bg.accent : bg.muted
            }}>👤</button>
            {showUserMenu && (
              <div data-usermenu="true" style={{
                position: 'absolute', right: 0, top: '44px', width: '220px', background: bg.card,
                border: `1px solid ${bg.border}`, borderRadius: '12px', padding: '8px',
                zIndex: 100, boxShadow: '0 8px 32px rgba(0,0,0,0.3)'
              }}>
                {/* User info */}
                <div style={{ padding: '10px 12px', marginBottom: '4px', borderBottom: `1px solid ${bg.border}` }}>
                  <div style={{ fontSize: '13px', fontWeight: 600, color: bg.text, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{profile?.full_name || session.user.email.split('@')[0]}</div>
                  <div style={{ fontSize: '11px', color: bg.dim, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{session.user.email}</div>
                  <div style={{ marginTop: '4px', display: 'inline-block', padding: '2px 8px', borderRadius: '20px', fontSize: '10px', fontWeight: 700, background: isPro ? bg.accentBg : bg.border, color: isPro ? bg.accent : bg.muted }}>
                    {isPro ? '✦ Pro' : 'Plan Gratuito'}
                  </div>
                </div>
                {/* Menu items */}
                <div data-usermenu="true" onClick={() => { setShowSettings(true); setShowUserMenu(false) }} style={{
                  display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 12px',
                  borderRadius: '8px', cursor: 'pointer', fontSize: '13px', color: bg.text
                }}
                onMouseEnter={e => e.currentTarget.style.background = bg.bg}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                  <span>⚙️</span> Configuración
                </div>
                <div data-usermenu="true" onClick={handleSignOut} style={{
                  display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 12px',
                  borderRadius: '8px', cursor: 'pointer', fontSize: '13px', color: bg.red
                }}
                onMouseEnter={e => e.currentTarget.style.background = bg.redBg}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                  <span>⏏</span> Cerrar sesión
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Content */}
        <div style={{ flex: 1, overflow: 'auto', padding: '24px' }}>
          {isLimited && !showSettings && (
            <div style={{ padding: '12px 16px', background: bg.yellowBg, border: `1px solid ${bg.yellow}30`, borderRadius: '10px', marginBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '13px', color: bg.yellow }}>🔒 Has alcanzado el límite de {FREE_TRADE_LIMIT} operaciones del plan gratuito</span>
              <button style={{ padding: '6px 14px', borderRadius: '8px', border: 'none', background: bg.accent, color: bg.bg, fontWeight: 600, fontSize: '12px', cursor: 'pointer' }}>Upgrade a Pro</button>
            </div>
          )}

          <div className="fade-in" key={showSettings ? 'settings' : tab}>
            {showSettings
              ? <Settings profile={profile} userId={session.user.id} onProfileUpdate={handleProfileUpdate} theme={theme} onThemeChange={applyTheme} isPro={isPro} userEmail={session.user.email} />
              : <>
                {tab === 'journal' && <Journal trades={trades} userId={session.user.id} onUpdate={loadTrades} isPro={isPro} tradeCount={tradeCount} profile={profile} />}
                {tab === 'analytics' && <Analytics trades={trades} isPro={isPro} profile={profile} />}
                {tab === 'backtest' && <Backtesting userId={session.user.id} isPro={isPro} />}
                {tab === 'calculator' && <Calculator profile={profile} />}
                {tab === 'sessions' && <SessionClock userId={session.user.id} focus={profile?.trading_focus} />}
                {tab === 'calendar' && <EconomicCalendar focus={profile?.trading_focus} />}
              </>
            }
          </div>
        </div>
      </div>
    </div>
  )
}
