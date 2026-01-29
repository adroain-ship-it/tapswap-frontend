import React, { useState } from 'react'
import { motion } from 'framer-motion'
import WebApp from '@twa-dev/sdk'
import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000'

const Earn = ({ user, updateUser }) => {
  const [isWatching, setIsWatching] = useState(false)
  const [cooldown, setCooldown] = useState(0)

  // Check cooldown
  React.useEffect(() => {
    const lastWatch = localStorage.getItem('lastAdWatch')
    if (lastWatch) {
      const timePassed = Date.now() - parseInt(lastWatch)
      const cooldownTime = 60000 // 1 minute
      
      if (timePassed < cooldownTime) {
        const remaining = Math.ceil((cooldownTime - timePassed) / 1000)
        setCooldown(remaining)
        
        const interval = setInterval(() => {
          const newRemaining = Math.ceil((cooldownTime - (Date.now() - parseInt(lastWatch))) / 1000)
          if (newRemaining <= 0) {
            setCooldown(0)
            clearInterval(interval)
          } else {
            setCooldown(newRemaining)
          }
        }, 1000)
        
        return () => clearInterval(interval)
      }
    }
  }, [])

  const handleWatchAd = async () => {
    if (isWatching || cooldown > 0) return

    setIsWatching(true)
    WebApp.HapticFeedback.impactOccurred('medium')

    try {
      // Simulate ad watch (replace with actual AdSgram/OnClickA)
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      // Reward user
      const initData = WebApp.initData || 'dev_mode'
      const response = await axios.post(
        `${API_URL}/api/ads/watch`,
        { adType: 'single', reward: 100 },
        { headers: { 'x-telegram-init-data': initData } }
      )

      if (response.data.success) {
        updateUser({
          coins: response.data.coins,
          totalEarned: response.data.totalEarned
        })

        WebApp.HapticFeedback.notificationOccurred('success')
        WebApp.showAlert('🎉 +100 coins earned!')
        
        localStorage.setItem('lastAdWatch', Date.now().toString())
        setCooldown(60)
      }
    } catch (error) {
      console.error('Ad watch error:', error)
      WebApp.HapticFeedback.notificationOccurred('error')
      WebApp.showAlert('Failed to load ad. Try again!')
    } finally {
      setIsWatching(false)
    }
  }

  return (
    <div className="page-container bg-gradient-to-b from-[#0a0e27] via-[#1a1f3a] to-[#0a0e27] text-white p-6 pb-24">
      {/* HEADER */}
      <div className="mb-6">
        <h1 className="text-4xl font-black mb-2 bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">
          Earn More
        </h1>
        <p className="text-gray-400 text-sm">Complete tasks and earn rewards!</p>
      </div>

      {/* WATCH SINGLE AD */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6"
      >
        <div className="bg-gradient-to-br from-orange-500/20 to-pink-500/20 rounded-3xl p-6 border border-orange-400/30">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-pink-500 rounded-2xl flex items-center justify-center shadow-lg">
              <span className="text-3xl">📺</span>
            </div>
            <div className="flex-1">
              <h3 className="text-2xl font-black text-white">Watch Single Ad</h3>
              <p className="text-orange-300 text-sm">Earn 100 coins instantly!</p>
            </div>
          </div>

          <button
            onClick={handleWatchAd}
            disabled={isWatching || cooldown > 0}
            className={`w-full py-4 rounded-xl font-bold text-lg shadow-xl transition-all ${
              isWatching || cooldown > 0
                ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                : 'bg-gradient-to-r from-orange-500 to-pink-500 text-white hover:scale-105 active:scale-95'
            }`}
          >
            {isWatching ? (
              <span className="flex items-center justify-center gap-2">
                <div className="w-5 h-5 border-3 border-white border-t-transparent rounded-full animate-spin" />
                Loading Ad...
              </span>
            ) : cooldown > 0 ? (
              `Wait ${cooldown}s`
            ) : (
              '▶️ Watch & Earn'
            )}
          </button>
        </div>
      </motion.div>

      {/* PROMO CODE */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="mb-6"
      >
        <div className="bg-gradient-to-br from-purple-500/20 to-blue-500/20 rounded-3xl p-6 border border-purple-400/30">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-4xl">🎫</span>
              <div>
                <h3 className="font-bold text-lg text-white">Have a Promo Code?</h3>
                <p className="text-purple-300 text-sm">Redeem for bonus coins</p>
              </div>
            </div>
            <button className="bg-purple-500/30 px-4 py-2 rounded-lg font-bold text-sm border border-purple-400/50 hover:bg-purple-500/50 transition-colors">
              →
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  )
}

export default Earn