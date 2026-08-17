import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'

export default function Settings() {
  const navigate = useNavigate()
  const [notifications, setNotifications] = useState(true)
  const [darkMode, setDarkMode] = useState(true)
  const [showEditProfile, setShowEditProfile] = useState(false)
  const [fullName, setFullName] = useState('')
  const [major, setMajor] = useState('Computer Engineering')
  const [bio, setBio] = useState('')

  const sidebarItems = [
    { icon: 'fa-gauge', label: 'Dashboard', path: '/dashboard' },
    { icon: 'fa-laptop-code', label: 'Embedded Lab', path: '/lab/embedded' },
    { icon: 'fa-code', label: 'Assembly', path: '/lab/assembly' },
    { icon: 'fa-bolt', label: 'Circuit', path: '/lab/circuit' },
    { icon: 'fa-microchip', label: 'Network Lab', path: '/lab/network' },
    { icon: 'fa-user', label: 'Profile', path: '/profile' },
    { icon: 'fa-gear', label: 'Settings', path: '/settings', active: true },
  ]

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap');
        @import url('https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.2/css/all.min.css');
        * { box-sizing: border-box; font-family: 'Poppins', sans-serif; }
        .sidebar-item:hover { background: linear-gradient(90deg,#ff69b4,#9b59b6) !important; }
        .setting-item:hover { background: #241046; }
        .logout-item:hover { background: #3a123c; }
        .switch input { display: none; }
        .slider { position: absolute; inset: 0; background: #666; border-radius: 30px; transition: .3s; cursor: pointer; }
        .slider::before { content: ""; position: absolute; width: 22px; height: 22px; left: 3px; top: 3px; border-radius: 50%; background: #fff; transition: .3s; }
        input:checked + .slider { background: #ff69b4; }
        input:checked + .slider::before { transform: translateX(24px); }
        .edit-input { background: #0f0020; border: 1px solid rgba(255,255,255,.08); border-radius: 12px; padding: 12px 16px; color: white; font-size: 14px; outline: none; font-family: Poppins,sans-serif; width: 100%; transition: .3s; }
        .edit-input:focus { border-color: #ff69b4; box-shadow: 0 0 12px rgba(255,105,180,.3); }
        .save-btn:hover { transform: translateY(-2px); box-shadow: 0 0 20px rgba(255,105,180,.5); }
      `}</style>

      <div style={{ display: 'flex', minHeight: '100vh', background: '#0a0015', color: '#fff', fontFamily: 'Poppins,sans-serif' }}>

        {/* Sidebar */}
        <div style={{ width: '250px', background: '#1a0030', padding: '30px 20px', flexShrink: 0 }}>
          <h2 style={{ textAlign: 'center', color: '#ff69b4', marginBottom: '35px' }}>Virtual Hub</h2>
          <ul style={{ listStyle: 'none', padding: 0 }}>
            {sidebarItems.map(item => (
              <li
                key={item.label}
                className="sidebar-item"
                onClick={() => {
                  if (item.path === '/profile') {
                    setShowEditProfile(true)
                  } else {
                    navigate(item.path)
                  }
                }}
                style={{
                  display: 'flex', alignItems: 'center', gap: '15px',
                  padding: '15px', marginBottom: '10px', borderRadius: '15px',
                  cursor: 'pointer', transition: '.3s',
                  background: item.active ? 'linear-gradient(90deg,#ff69b4,#9b59b6)' : 'transparent'
                }}
              >
                <i className={`fa-solid ${item.icon}`} style={{ fontSize: '18px' }} />
                {item.label}
              </li>
            ))}
          </ul>
        </div>

        {/* Main */}
        <div style={{ flex: 1, padding: '40px' }}>
          <h1 style={{ fontSize: '34px', marginBottom: '30px' }}>Settings</h1>

          <div style={{ width: '700px', maxWidth: '100%', background: '#1a0030', borderRadius: '25px', overflow: 'hidden', boxShadow: '0 10px 30px rgba(0,0,0,.3)' }}>

            {/* Edit Profile */}
            <div className="setting-item" onClick={() => setShowEditProfile(true)}
              style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '22px 25px', borderBottom: '1px solid rgba(255,255,255,.08)', cursor: 'pointer', transition: '.3s' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '18px' }}>
                <i className="fa-solid fa-user-pen" style={{ color: '#ff69b4', fontSize: '20px' }} />
                <span style={{ fontSize: '16px' }}>Edit Profile</span>
              </div>
              <i className="fa-solid fa-chevron-right" />
            </div>

            {/* Notifications */}
            <div className="setting-item"
              style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '22px 25px', borderBottom: '1px solid rgba(255,255,255,.08)', transition: '.3s' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '18px' }}>
                <i className="fa-solid fa-bell" style={{ color: '#ff69b4', fontSize: '20px' }} />
                <span style={{ fontSize: '16px' }}>Notifications</span>
              </div>
              <label className="switch" style={{ position: 'relative', display: 'inline-block', width: '52px', height: '28px' }}>
                <input type="checkbox" checked={notifications} onChange={() => setNotifications(!notifications)} />
                <span className="slider" />
              </label>
            </div>

            {/* Language */}
            <div className="setting-item"
              style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '22px 25px', borderBottom: '1px solid rgba(255,255,255,.08)', transition: '.3s' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '18px' }}>
                <i className="fa-solid fa-language" style={{ color: '#ff69b4', fontSize: '20px' }} />
                <span style={{ fontSize: '16px' }}>Language</span>
              </div>
              <span style={{ color: '#aaa' }}>English</span>
            </div>

            {/* Dark Mode */}
            <div className="setting-item"
              style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '22px 25px', borderBottom: '1px solid rgba(255,255,255,.08)', transition: '.3s' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '18px' }}>
                <i className="fa-solid fa-moon" style={{ color: '#ff69b4', fontSize: '20px' }} />
                <span style={{ fontSize: '16px' }}>Dark Mode</span>
              </div>
              <label className="switch" style={{ position: 'relative', display: 'inline-block', width: '52px', height: '28px' }}>
                <input type="checkbox" checked={darkMode} onChange={() => setDarkMode(!darkMode)} />
                <span className="slider" />
              </label>
            </div>

            {/* Change Password */}
            <div className="setting-item" onClick={() => navigate('/change-password')}
              style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '22px 25px', borderBottom: '1px solid rgba(255,255,255,.08)', cursor: 'pointer', transition: '.3s' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '18px' }}>
                <i className="fa-solid fa-lock" style={{ color: '#ff69b4', fontSize: '20px' }} />
                <span style={{ fontSize: '16px' }}>Change Password</span>
              </div>
              <i className="fa-solid fa-chevron-right" />
            </div>

            {/* Log Out */}
            <div className="logout-item" onClick={() => supabase.auth.signOut()}
              style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '22px 25px', cursor: 'pointer', transition: '.3s', color: '#ff5f7e', fontWeight: '600' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '18px' }}>
                <i className="fa-solid fa-right-from-bracket" style={{ fontSize: '20px' }} />
                <span style={{ fontSize: '16px' }}>Log Out</span>
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* Edit Profile Modal */}
      {showEditProfile && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.7)', zIndex: 999, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ background: '#1a0030', borderRadius: '20px', border: '1px solid rgba(255,105,180,.3)', width: '420px', maxWidth: '90%', padding: '35px', position: 'relative', boxShadow: '0 0 25px rgba(255,105,180,.15)' }}>
            <span onClick={() => setShowEditProfile(false)} style={{ position: 'absolute', top: '10px', right: '18px', color: 'white', fontSize: '26px', cursor: 'pointer' }}>×</span>
            <h2 style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px', fontSize: '24px' }}>
              <i className="fa-solid fa-user-pen" style={{ color: '#ff69b4' }} /> Edit Profile
            </h2>
            <p style={{ color: '#bbb', fontSize: '14px', marginBottom: '10px' }}>Update your personal information.</p>

            <label style={{ fontSize: '13px', color: '#cc99ff', display: 'block', marginTop: '16px', marginBottom: '6px' }}>Full Name</label>
            <input className="edit-input" type="text" placeholder="Enter your full name" value={fullName} onChange={e => setFullName(e.target.value)} />

            <label style={{ fontSize: '13px', color: '#cc99ff', display: 'block', marginTop: '16px', marginBottom: '6px' }}>Major</label>
            <input className="edit-input" type="text" placeholder="e.g. Computer Engineering" value={major} onChange={e => setMajor(e.target.value)} />

            <label style={{ fontSize: '13px', color: '#cc99ff', display: 'block', marginTop: '16px', marginBottom: '6px' }}>Bio</label>
            <textarea className="edit-input" placeholder="Tell us a bit about yourself..." rows={4} value={bio} onChange={e => setBio(e.target.value)} style={{ resize: 'none' }} />

            <button className="save-btn" style={{ marginTop: '28px', padding: '14px', border: 'none', borderRadius: '30px', cursor: 'pointer', color: 'white', fontSize: '15px', fontWeight: '600', background: 'linear-gradient(90deg,#ff69b4,#e91e8c)', width: '100%', transition: '.3s' }}>
              Save Changes
            </button>
          </div>
        </div>
      )}
    </>
  )
}