import { useState, useEffect } from 'react'
import { supabase } from './lib/supabase'
import Landing from './pages/Landing'
import Auth from './pages/Auth'
import Onboarding from './pages/Onboarding'
import Dashboard from './pages/Dashboard'
import { C } from './lib/theme'

export default function App() {
  const [session, setSession] = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [authMode, setAuthMode] = useState(null) // null=landing, 'login', 'signup'

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      if (session) loadProfile(session.user.id)
      else setLoading(false)
    })
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
      if (session) loadProfile(session.user.id)
      else { setProfile(null); setLoading(false); setAuthMode(null) }
    })
    return () => subscription.unsubscribe()
  }, [])

  const loadProfile = async (userId) => {
    const { data } = await supabase.from('profiles').select('*').eq('id', userId).single()
    setProfile(data)
    setLoading(false)
  }

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', background: C.bg, flexDirection: 'column', gap: '16px' }}>
      <div style={{ width: '40px', height: '40px', border: `3px solid ${C.border}`, borderTop: `3px solid ${C.accent}`, borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
      <div style={{ color: C.muted, fontSize: '14px' }}>Cargando Operata...</div>
    </div>
  )

  if (!session) {
    if (!authMode) return <Landing onLogin={() => setAuthMode('login')} onSignup={() => setAuthMode('signup')} />
    return <Auth initialMode={authMode} onBack={() => setAuthMode(null)} />
  }

  // Only show onboarding if profile was just created (no trading_focus AND very recent account)
  const needsOnboarding = !profile?.trading_focus && !profile?.initial_capital && !profile?.full_name
  if (needsOnboarding) return <Onboarding userId={session.user.id} onComplete={(p) => setProfile(p)} />
  return <Dashboard session={session} profile={profile} onProfileUpdate={setProfile} />
}
