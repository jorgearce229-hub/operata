import { useState, useEffect } from 'react'
import { supabase } from './lib/supabase'
import Auth from './pages/Auth'
import Onboarding from './pages/Onboarding'
import Dashboard from './pages/Dashboard'
import { C } from './lib/theme'

export default function App() {
  const [session, setSession] = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      if (session) loadProfile(session.user.id)
      else setLoading(false)
    })
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
      if (session) loadProfile(session.user.id)
      else { setProfile(null); setLoading(false) }
    })
    return () => subscription.unsubscribe()
  }, [])

  const loadProfile = async (userId) => {
    const { data } = await supabase.from('profiles').select('*').eq('id', userId).single()
    setProfile(data)
    setLoading(false)
  }

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center',
      height: '100vh', background: C.bg, flexDirection: 'column', gap: '16px' }}>
      <div style={{ width: '40px', height: '40px', border: `3px solid ${C.border}`,
        borderTop: `3px solid ${C.accent}`, borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
      <div style={{ color: C.muted, fontSize: '14px' }}>Cargando Operata...</div>
    </div>
  )

  if (!session) return <Auth />
  if (!profile?.trading_focus || profile.trading_focus === null) return (
    <Onboarding userId={session.user.id} onComplete={(p) => setProfile(p)} />
  )
  return <Dashboard session={session} profile={profile} onProfileUpdate={setProfile} />
}
