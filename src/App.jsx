import React, { useState, useEffect } from 'react'
import League from './pages/League'
import WebApp from '@twa-dev/sdk'
import axios from 'axios'
import Home from './pages/Home'
import Shop from './pages/Shop'
import Tasks from './pages/Tasks'
import Referrals from './pages/Referrals'
import Admin from './pages/Admin'
import Navigation from './components/Navigation'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000'

function App() {
  const [currentPage, setCurrentPage] = useState('home')
  const [user, setUser] = useState(null)
  const [globalStats, setGlobalStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [isAdmin, setIsAdmin] = useState(false)

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
      
      const adminId = parseInt(import.meta.env.VITE_ADMIN_ID || '0')
      const userId = WebApp.initDataUnsafe?.user?.id || 0
      setIsAdmin(userId === adminId)
      
      setLoading(false)

      if (response.data.isNewUser) {
        WebApp.showPopup({
          title: '🎉 Welcome!',
          message: 'Start tapping to earn coins and climb the leagues!',
          buttons: [{ type: 'ok' }]
        })
      }
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
      case 'admin':
        return isAdmin ? <Admin /> : <Home user={user} updateUser={updateUser} globalStats={globalStats} />
      default:
        return <Home user={user} updateUser={updateUser} globalStats={globalStats} />
    }
  }

  return (
    <div className="h-screen flex flex-col bg-gradient-to-br from-[#667eea] to-[#764ba2] overflow-hidden">
      <div className="flex-1 overflow-hidden">
        {renderPage()}
      </div>
      <Navigation 
        currentPage={currentPage} 
        setCurrentPage={setCurrentPage} 
        isAdmin={isAdmin}
      />
    </div>
  )
}

export default App
