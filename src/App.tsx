import { useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { supabase } from './lib/supabase'
import { Auth } from './components/Auth'
import Landing from './pages/Landing'
import Dashboard from './pages/Dashboard'
import EmbeddedLab from './pages/EmbeddedLab'
import NetworkLab from './pages/NetworkLab'
import ChangePassword from './pages/ChangePassword'
import EditProfile from './pages/EditProfile'
import Settings from './pages/Settings'
import AssemblyLab from './pages/AssemblyLab'
import CircuitLab from './pages/CircuitLab'
import AIChat from './pages/AIChat'
import MadlyWidget from './components/MadlyWidget'

function App() {
  const [session, setSession] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setLoading(false)
    })
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })
    return () => subscription.unsubscribe()
  }, [])

  if (loading) {
    return (
      <div style={{
        background: '#0a0015', color: '#ff69b4',
        height: '100vh', display: 'flex',
        justifyContent: 'center', alignItems: 'center',
        fontSize: '24px', fontFamily: 'Poppins, sans-serif'
      }}>
        Loading...
      </div>
    )
  }

  if (!session) {
    return <Auth />
  }

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/lab/iot" element={<EmbeddedLab />} />
        <Route path="/lab/network" element={<NetworkLab />} />
        <Route path="/lab/assembly" element={<AssemblyLab />} />
        <Route path="/lab/circuit" element={<CircuitLab />} />
        <Route path="/change-password" element={<ChangePassword />} />
        <Route path="/edit-profile" element={<EditProfile />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/ai-chat" element={<AIChat />} />
      </Routes>
      <MadlyWidget />
    </Router>
  )
}

export default App