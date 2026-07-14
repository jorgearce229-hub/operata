import React, { useState, useEffect } from 'react'
import { supabase } from './lib/supabase'
import Landing from './pages/Landing'
import Auth from './pages/Auth'
import Onboarding from './pages/Onboarding'
import Dashboard from './pages/Dashboard'
import Settings from './pages/Settings'
import Upgrade from './pages/Upgrade'
import { TermsPage, PrivacyPage } from './pages/Legal'
import Contact from './pages/Contact'
import ResetPassword from './pages/ResetPassword'
import { C, THEMES, setTheme } from './lib/theme'
import { isProActive } from './lib/plan'

export default function App() {
  const [session, setSession] = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [authMode, setAuthMode] = useState(null)
  const [showSettings, setShowSettings] = useState(false)
  const [showResetPassword, setShowResetPassword] = useState(false)
  const [showUpgrade, setShowUpgrade] = useState(() => window.location.search.includes('upgrade=true'))
  const [showTerms, setShowTerms] = useState(() => window.location.search.includes('terms=true'))
  const [showContact, setShowContact] = useState(false)
  const [showPrivacy, setShowPrivacy] = useState(() => window.location.search.includes('privacy=true'))
  const [theme, setThemeState] = useState(() => localStorage.getItem('operata-theme') || 'dark')

  // Global upgrade event listener - catches clicks from ANY component
  useEffect(() => {
    const handler = () => {
      console.log('upgrade event received')
      setShowUpgrade(true)
    }
    window.addEventListener('operata:upgrade', handler)
    return () => window.removeEventListener('operata:upgrade', handler)
  }, [])

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      if (session) loadProfile(session.user.id)
      else setLoading(false)
    })
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'PASSWORD_RECOVERY') {
        setShowResetPassword(true)
        setSession(session)
        setLoading(false)
        return
      }
      setSession(session)
      if (session) loadProfile(session.user.id)
      else { setProfile(null); setLoading(false); setAuthMode(null) }
    })
    return () => subscription.unsubscribe()
  }, [])

  const loadProfile = async (userId) => {
    const { data } = await supabase.from('profiles').select('*').eq('id', userId).single()
    // Si el plan Pro fue un pago único (OXXO, sin suscripción de Stripe) y ya venció, lo bajamos a Free.
    if (data?.plan === 'pro' && data?.pro_expires_at && !data?.stripe_subscription_id) {
      if (new Date(data.pro_expires_at) < new Date()) {
        const { data: downgraded } = await supabase.from('profiles')
          .update({ plan: 'free', pro_expires_at: null })
          .eq('id', userId).select().single()
        setProfile(downgraded)
        setLoading(false)
        return
      }
    }
    setProfile(data)
    setLoading(false)
  }

  const handleProfileUpdate = (newProfile) => {
    setProfile(prev => ({ ...prev, ...newProfile }))
  }

  if (showResetPassword) return <ResetPassword onDone={() => { setShowResetPassword(false); window.location.href = '/' }} />

  if (loading) return (
    <div style={{ display:'flex', alignItems:'center', justifyContent:'center', height:'100vh', background:C.bg, flexDirection:'column', gap:'16px' }}>
      <div style={{ width:'40px', height:'40px', border:`3px solid ${C.border}`, borderTop:`3px solid ${C.accent}`, borderRadius:'50%', animation:'spin 1s linear infinite' }}/>
      <div style={{ color:C.muted, fontSize:'14px' }}>Cargando Operata...</div>
    </div>
  )

  if (showContact) return <Contact onClose={() => setShowContact(false)} userEmail={session?.user?.email} userName={profile?.full_name} />
  if (showTerms) return <TermsPage onClose={() => setShowTerms(false)} />
  if (showPrivacy) return <PrivacyPage onClose={() => setShowPrivacy(false)} />

  if (!session) {
    if (!authMode) return <Landing
      onLogin={() => setAuthMode('login')}
      onSignup={() => setAuthMode('signup')}
      onShowTerms={() => setShowTerms(true)}
      onShowPrivacy={() => setShowPrivacy(true)}
      onShowContact={() => setShowContact(true)}
    />
    return <Auth initialMode={authMode} onBack={() => setAuthMode(null)} />
  }

  const needsOnboarding = !profile?.trading_focus && !profile?.initial_capital && !profile?.full_name
  if (needsOnboarding) return <Onboarding userId={session.user.id} onComplete={(p) => setProfile(p)} />

  if (showUpgrade) return <Upgrade session={session} onClose={() => { setShowUpgrade(false); window.history.replaceState({}, '', '/') }} />
  if (showSettings) return <Settings profile={profile} userId={session.user.id} onProfileUpdate={handleProfileUpdate} theme={theme} onThemeChange={(mode) => {
    setThemeState(mode)
    localStorage.setItem('operata-theme', mode)
    setTheme(mode)
    document.body.style.background = THEMES[mode].bg
    document.body.style.color = THEMES[mode].text
  }} isPro={isProActive(profile)} userEmail={session.user.email} onClose={() => setShowSettings(false)} />

  return <Dashboard
    session={session}
    profile={profile}
    onProfileUpdate={handleProfileUpdate}
    theme={theme}
    onThemeChange={(mode) => setThemeState(mode)}
    onShowSettings={() => setShowSettings(true)}
    onShowUpgrade={() => setShowUpgrade(true)}
    onShowContact={() => setShowContact(true)}
    onShowTerms={() => setShowTerms(true)}
    onShowPrivacy={() => setShowPrivacy(true)}
  />
}
