// ===== INTEGRACJA W App.jsx =====
// KRYTYCZNE: Banner musi być POZA systemem nawigacji!

import React, { useState, useEffect } from 'react'
import WebApp from '@twa-dev/sdk'
import axios from 'axios'
import { Analytics } from '@vercel/analytics/react'
import Home from './pages/Home'
import Shop from './pages/Shop'
import Tasks from './pages/Tasks'
import Referrals from './pages/Referrals'
import League from './pages/League'
import Earn from './pages/Earn'
import Admin from './pages/Admin'
import Navigation from './components/Navigation'
import WelcomePopup from './components/WelcomePopup'
import FloatingTaskButton from './components/FloatingTaskButton'

// ===== PERSISTENT BANNER IMPORTS =====
import { OnClickAProvider } from './context/OnClickAProvider'
import OnClickAPersistentBanner from './components/OnClickAPersistentBanner'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000'
const ONCLICKA_SPOT_ID = '6108783'

function App() {
  const [currentPage, setCurrentPage] = useState('home')
  const [user, setUser] = useState(null)
  const [globalStats, setGlobalStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [isAdmin, setIsAdmin] = useState(false)
  const [showWelcome, setShowWelcome] = useState(false)

  useEffect(() => {
    WebApp.ready()
    WebApp.expand()
    WebApp.setHeaderColor('#667eea')
    WebApp.disableVerticalSwipes()
    initializeUser()
  }, [])

  const initializeUser = async () => {
    try {
      const initData = WebApp.initData
      const urlParams = new URLSearchParams(window.location.search)
      const refCode = urlParams.get('ref')

      const response = await axios.post(
        `${API_URL}/api/auth/init`,
        { referralCode: refCode },
        { headers: { 'x-telegram-init-data': initData } }
      )

      setUser(response.data.user)
      setGlobalStats(response.data.globalStats)
      
      if (response.data.isNewUser) {
        setShowWelcome(true)
      }
      
      const adminId = parseInt(import.meta.env.VITE_ADMIN_ID || '0')
      const userId = WebApp.initDataUnsafe?.user?.id || 0
      setIsAdmin(userId === adminId)
      
      setLoading(false)
    } catch (error) {
      console.error('Init error:', error)
      setLoading(false)
      WebApp.showAlert('Failed to load. Please restart the app.')
    }
  }

  const updateUser = (updates) => {
    setUser(prev => ({ ...prev, ...updates }))
  }

  const updateGlobalStats = (stats) => {
    setGlobalStats(prev => ({ ...prev, ...stats }))
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gradient-to-br from-[#667eea] to-[#764ba2]">
        <div className="text-center">
          <div className="text-6xl mb-4 animate-bounce">💰</div>
          <div className="text-white text-2xl font-bold mb-2">Loading...</div>
          <div className="text-white/70 text-sm">Preparing your game</div>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center h-screen bg-gradient-to-br from-[#667eea] to-[#764ba2] p-6">
        <div className="text-white text-center">
          <div className="text-6xl mb-4">⚠️</div>
          <div className="text-2xl font-bold mb-2">Connection Error</div>
          <div className="text-lg mb-4 opacity-80">Failed to load user data</div>
          <button
            onClick={() => window.location.reload()}
            className="bg-white text-purple-600 px-6 py-3 rounded-xl font-bold"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  const renderPage = () => {
    switch (currentPage) {
      case 'home':
        return <Home user={user} updateUser={updateUser} globalStats={globalStats} />
      case 'league':
        return <League user={user} />
      case 'shop':
        return <Shop user={user} updateUser={updateUser} />
      case 'tasks':
        return <Tasks user={user} updateUser={updateUser} />
      case 'referrals':
        return <Referrals user={user} />
      case 'earn':
        return <Earn user={user} updateUser={updateUser} />
      case 'admin':
        return isAdmin ? <Admin /> : <Home user={user} updateUser={updateUser} globalStats={globalStats} />
      default:
        return <Home user={user} updateUser={updateUser} globalStats={globalStats} />
    }
  }

  return (
    // ===== ONCLICKA PROVIDER (GLOBALNY) =====
    <OnClickAProvider spotId={ONCLICKA_SPOT_ID}>
      <div className="h-screen flex flex-col bg-gradient-to-br from-[#667eea] to-[#764ba2] overflow-hidden">
        
        {/* ===== PERSISTENT BANNER (POZA ROUTING!) ===== */}
        <OnClickAPersistentBanner height={100} />
        
        {/* ===== SCROLLABLE CONTENT AREA ===== */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden">
          {renderPage()}
        </div>
        
        {/* ===== BOTTOM NAVIGATION (FIXED) ===== */}
        <Navigation 
          currentPage={currentPage} 
          setCurrentPage={setCurrentPage} 
          isAdmin={isAdmin}
        />
        
        {/* ===== FLOATING TASK BUTTON ===== */}
        <FloatingTaskButton 
          onClick={() => setCurrentPage('tasks')}
          hasNewTasks={true}
        />
        
        {/* ===== WELCOME POPUP ===== */}
        {showWelcome && (
          <WelcomePopup onClose={() => setShowWelcome(false)} />
        )}
        
        {/* ===== VERCEL WEB ANALYTICS ===== */}
        <Analytics />
      </div>
    </OnClickAProvider>
  )
}

export default App
