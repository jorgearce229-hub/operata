import React, { useState, useEffect } from 'react'
import { supabase, FREE_TRADE_LIMIT } from '../lib/supabase'
import { C, THEMES, setTheme } from '../lib/theme'
import Journal from '../components/Journal'
import Analytics from '../components/Analytics'
import Backtesting from '../components/Backtesting'
import Calculator from '../components/Calculator'
import SessionClock from '../components/SessionClock'
import { getZonedTime } from '../lib/timezone'
import EconomicCalendar from '../components/EconomicCalendar'
import Strategies from './Strategies'
import Accounts from './Accounts'

const TABS = [
  { id: 'accounts', label: 'Cuentas', icon: '🏦' },
  { id: 'journal', label: 'Diario', icon: '📋' },
  { id: 'analytics', label: 'Analytics', icon: '📊' },
  { id: 'backtest', label: 'Backtesting', icon: '🔬' },
  { id: 'calculator', label: 'Calculadora', icon: '🧮' },
  { id: 'sessions', label: 'Sesiones', icon: '🕐' },
  { id: 'calendar', label: 'Cal. Económico', icon: '📅' },
  { id: 'strategies', label: 'Estrategias', icon: '🎯' },
]


function SidebarClock({ bg, timezone }) {
  const [now, setNow] = React.useState(new Date())
  React.useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(t)
  }, [])
  const tzOpt = timezone ? { timeZone: timezone } : {}
  const timeStr = now.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit', second: '2-digit', ...tzOpt })
  const dateStr = now.toLocaleDateString('es-MX', { weekday: 'short', day: 'numeric', month: 'short', ...tzOpt })
  return (
    <div style={{ textAlign: 'center', padding: '4px 0 6px' }}>
      <div style={{ fontSize: '18px', fontWeight: 700, color: bg.text, letterSpacing: '1px', fontVariantNumeric: 'tabular-nums' }}>{timeStr}</div>
      <div style={{ fontSize: '10px', color: bg.dim, marginTop: '2px', textTransform: 'capitalize' }}>{dateStr}</div>
    </div>
  )
}

export default function Dashboard({ session, profile, onProfileUpdate, theme: themeProp, onThemeChange: onThemeChangeProp, onShowSettings, onShowUpgrade, onShowTerms, onShowPrivacy, onShowContact }) {
  const [tab, setTab] = useState('journal')
  const [trades, setTrades] = useState([])
  const [loading, setLoading] = useState(true)
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [showUserMenu, setShowUserMenu] = React.useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false)
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768
  const [activeAccount, setActiveAccount] = React.useState(null)
  const mainRef = React.useRef(null)
  const scrollPosRef = React.useRef(0)

  const theme = themeProp || 'dark'
  const applyTheme = (mode) => {
    setTheme(mode)
    if (onThemeChangeProp) onThemeChangeProp(mode)
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
  useEffect(() => { loadTrades() }, [activeAccount?.id])
  // Restauramos la cuenta activa al cargar el dashboard, sin depender de que el usuario
  // visite la pestaña "Cuentas" primero (antes esto dejaba activeAccount en null y el
  // filtrado de operaciones por cuenta nunca se aplicaba).
  useEffect(() => {
    const restoreActiveAccount = async () => {
      const { data } = await supabase.from('accounts').select('*').eq('user_id', session.user.id).order('created_at')
      if (data?.length) {
        const lastId = localStorage.getItem('operata-active-account')
        const last = data.find(a => a.id === lastId) || data[0]
        setActiveAccount(last)
      }
    }
    restoreActiveAccount()
  }, [])

  const isPro = profile?.plan === 'pro'
  const tradeCount = trades.length
  const isLimited = !isPro && tradeCount >= FREE_TRADE_LIMIT

  const loadTrades = async () => {
    setLoading(true)
    let query = supabase.from('trades').select('*').eq('user_id', session.user.id)
    // Las operaciones viejas sin cuenta ya se migran automáticamente a la primera cuenta que
    // el usuario crea (ver Accounts.jsx), así que aquí filtramos estrictamente por la cuenta activa.
    if (activeAccount?.id) query = query.eq('account_id', activeAccount.id)
    const { data } = await query.order('entry_date', { ascending: false })
    setTrades(data || [])
    setLoading(false)
  }

  const handleSignOut = () => supabase.auth.signOut()
  const bg = THEMES[theme]

  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden', background: bg.bg, color: bg.text }}>
      {/* Sidebar */}
      <div style={{
        width: isMobile ? '240px' : sidebarOpen ? '220px' : '64px',
        background: bg.card,
        borderRight: `1px solid ${bg.border}`,
        display: 'flex', flexDirection: 'column',
        transition: 'all 0.25s',
        flexShrink: 0,
        position: isMobile ? 'fixed' : 'relative',
        top: isMobile ? 0 : 'auto',
        left: isMobile ? (mobileMenuOpen ? 0 : '-260px') : 'auto',
        height: isMobile ? '100vh' : 'auto',
        zIndex: isMobile ? 50 : 'auto',
        boxShadow: isMobile && mobileMenuOpen ? '4px 0 20px rgba(0,0,0,0.4)' : 'none',
      }}>
        {/* Logo */}
        <div style={{ padding: '20px 16px', borderBottom: `1px solid ${bg.border}`, display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ width: '32px', height: '32px', borderRadius: '8px', flexShrink: 0, overflow: 'hidden' }}>
            <svg viewBox="0 0 128 128" width="32" height="32">
              <rect x="0" y="0" width="128" height="128" rx="24" fill="#0B2E4A"/>
              <circle cx="64" cy="64" r="29" fill="none" stroke="#8CF0C9" strokeWidth="7"/>
              <rect x="41" y="80" width="10" height="14" rx="2" fill="#F2A623"/>
              <rect x="59" y="67" width="10" height="27" rx="2" fill="#F2A623"/>
              <rect x="77" y="46" width="10" height="48" rx="2" fill="#F2A623"/>
              <line x1="82" y1="46" x2="98" y2="26" stroke="#F2A623" strokeWidth="5" strokeLinecap="round"/>
              <polygon points="0,0 -9,-4.5 -9,4.5" fill="#F2A623" transform="translate(99,25) rotate(-47.5)"/>
            </svg>
          </div>
          {sidebarOpen && <div>
            <div style={{ fontSize: '16px', fontWeight: 700, color: bg.accent }}>Operata</div>
            <div style={{ fontSize: '10px', color: bg.dim, textTransform: 'uppercase', letterSpacing: '1px' }}>{isPro ? '✦ Pro' : 'Free'}</div>
          </div>}
        </div>

        {/* Nav */}
        <div style={{ padding: '12px 8px', flex: 1 }}>
          {TABS.map(t => (
            <div key={t.id} onClick={() => { setTab(t.id); setMobileMenuOpen(false) }} style={{
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
              <SidebarClock bg={bg} timezone={profile?.timezone} />
              {activeAccount && (
                <div style={{ textAlign: 'center', padding: '6px 0 4px', borderTop: `1px solid ${bg.border}`, marginTop: '4px' }}>
                  <div style={{ fontSize: '11px', fontWeight: 600, color: bg.accent, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{activeAccount.name}</div>
                  <div style={{ fontSize: '10px', color: bg.dim }}>{activeAccount.currency} {((activeAccount.balance||0) + trades.reduce((s,t)=>s+(t.pnl||0),0)).toLocaleString('es-MX',{minimumFractionDigits:2})}</div>
                </div>
              )}
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
      <div style={{ flex: 1, overflow: 'auto', display: 'flex', flexDirection: 'column', background: bg.bg, marginLeft: isMobile ? 0 : 'auto' }}>
        {/* Mobile overlay */}
        {mobileMenuOpen && (
          <div onClick={() => setMobileMenuOpen(false)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 40 }} />
        )}
        {/* Top bar */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '8px', padding: '12px 16px', borderBottom: `1px solid ${bg.border}`, background: bg.card, flexShrink: 0 }}>
          {/* Hamburger for mobile */}
          <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} style={{ display: isMobile ? 'flex' : 'none', padding: '6px', borderRadius: '8px', border: `1px solid ${bg.border}`, background: 'transparent', cursor: 'pointer', flexDirection: 'column', gap: '4px', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ width: '18px', height: '2px', background: bg.muted, borderRadius: '2px' }}/>
            <div style={{ width: '18px', height: '2px', background: bg.muted, borderRadius: '2px' }}/>
            <div style={{ width: '18px', height: '2px', background: bg.muted, borderRadius: '2px' }}/>
          </button>
          <div style={{ flex: 1 }} />
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
                <div data-usermenu="true" onClick={() => { onShowTerms && onShowTerms(); setShowUserMenu(false) }} style={{
                  display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 12px',
                  borderRadius: '8px', cursor: 'pointer', fontSize: '13px', color: bg.muted
                }}
                onMouseEnter={e => e.currentTarget.style.background = bg.bg}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                  <span>📄</span> Términos de uso
                </div>
                <div data-usermenu="true" onClick={() => { onShowPrivacy && onShowPrivacy(); setShowUserMenu(false) }} style={{
                  display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 12px',
                  borderRadius: '8px', cursor: 'pointer', fontSize: '13px', color: bg.muted
                }}
                onMouseEnter={e => e.currentTarget.style.background = bg.bg}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                  <span>🔒</span> Privacidad
                </div>
                <div data-usermenu="true" onClick={() => { onShowContact && onShowContact(); setShowUserMenu(false) }} style={{
                  display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 12px',
                  borderRadius: '8px', cursor: 'pointer', fontSize: '13px', color: bg.muted
                }}
                onMouseEnter={e => e.currentTarget.style.background = bg.bg}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                  <span>✉️</span> Contacto y soporte
                </div>
                <div style={{ height: '1px', background: bg.border, margin: '4px 0' }} />
                <div data-usermenu="true" onClick={() => { if (onShowSettings) onShowSettings(); setShowUserMenu(false) }} style={{
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
        <div style={{ flex: 1, overflow: 'auto', padding: isMobile ? '16px' : '24px' }}>
          {isLimited && (
            <div style={{ padding: '12px 16px', background: bg.yellowBg, border: `1px solid ${bg.yellow}30`, borderRadius: '10px', marginBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '13px', color: bg.yellow }}>🔒 Has alcanzado el límite de {FREE_TRADE_LIMIT} operaciones del plan gratuito</span>
              <button onClick={() => onShowUpgrade && onShowUpgrade()} style={{ padding: '6px 14px', borderRadius: '8px', border: 'none', background: bg.accent, color: bg.bg, fontWeight: 600, fontSize: '12px', cursor: 'pointer' }}>Upgrade a Pro</button>
            </div>
          )}

          <div className="fade-in" key={tab}>
            {tab === 'journal' && <Journal trades={trades} userId={session.user.id} onUpdate={loadTrades} isPro={isPro} tradeCount={tradeCount} profile={profile} accountId={activeAccount?.id} />}
            {tab === 'analytics' && <Analytics trades={trades} isPro={isPro} profile={profile} accountBalance={activeAccount?.balance} onUpgrade={() => onShowUpgrade && onShowUpgrade()} />}
            {tab === 'backtest' && <Backtesting userId={session.user.id} isPro={isPro} />}
            {tab === 'calculator' && <Calculator profile={profile} />}
            {tab === 'sessions' && <SessionClock userId={session.user.id} focus={profile?.trading_focus} timezone={profile?.timezone} />}
            {tab === 'calendar' && <EconomicCalendar focus={profile?.trading_focus} />}
            {tab === 'strategies' && <Strategies userId={session.user.id} />}
            {tab === 'accounts' && <Accounts userId={session.user.id} isPro={isPro} activeAccount={activeAccount} onAccountChange={setActiveAccount} />}
          </div>
        </div>
      </div>
    </div>
  )
}
