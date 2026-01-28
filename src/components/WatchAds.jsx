import React, { useState, useEffect, useRef } from 'react'
import WebApp from '@twa-dev/sdk'
import axios from 'axios'
import { motion, AnimatePresence } from 'framer-motion'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000'

const WatchAds = ({ user, updateUser, onClose }) => {
  const [timeToNext, setTimeToNext] = useState(30)
  const [totalEarned, setTotalEarned] = useState(0)
  const [adsWatched, setAdsWatched] = useState(0)
  const [showRewardPopup, setShowRewardPopup] = useState(false)
  const [lastReward, setLastReward] = useState(0)
  const [isLoading, setIsLoading] = useState(false)
  const timerRef = useRef(null)
  const adIntervalRef = useRef(null)

  useEffect(() => {
    // Start countdown timer
    timerRef.current = setInterval(() => {
      setTimeToNext(prev => {
        if (prev <= 1) {
          showNextAd()
          return 30 // Reset to 30 seconds
        }
        return prev - 1
      })
    }, 1000)

    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
      if (adIntervalRef.current) clearInterval(adIntervalRef.current)
    }
  }, [])

  const showNextAd = () => {
    if (isLoading) return
    
    setIsLoading(true)

    // Try AdSgram first
    if (window.Adsgram && window.Adsgram.init) {
      const AdController = window.Adsgram.init({ blockId: 'int-21959' })
      
      AdController.show()
        .then(() => {
          // Ad watched successfully
          earnCoins(50) // 50 coins per ad
          setAdsWatched(prev => prev + 1)
          setIsLoading(false)
        })
        .catch((error) => {
          console.log('AdSgram error:', error)
          // Fallback to other ad networks or simulated ad
          simulateAdWatch()
        })
    } else {
      // No AdSgram available - simulate
      simulateAdWatch()
    }
  }

  const simulateAdWatch = () => {
    // Simulate 5 second ad watch
    setTimeout(() => {
      earnCoins(50)
      setAdsWatched(prev => prev + 1)
      setIsLoading(false)
    }, 5000)
  }

  const earnCoins = async (amount) => {
    try {
      const initData = WebApp.initData
      const response = await axios.post(
        `${API_URL}/api/ads/watch`,
        { 
          adType: 'fullscreen',
          reward: amount 
        },
        { headers: { 'x-telegram-init-data': initData } }
      )

      setTotalEarned(prev => prev + amount)
      setLastReward(amount)
      setShowRewardPopup(true)

      updateUser({ coins: response.data.coins })

      setTimeout(() => {
        setShowRewardPopup(false)
      }, 2000)

      if (WebApp.HapticFeedback) {
        WebApp.HapticFeedback.notificationOccurred('success')
      }
    } catch (error) {
      console.error('Earn coins error:', error)
    }
  }

  const handleExit = () => {
    if (confirm('Exit Watch Ads?\n\nYou earned ' + totalEarned + ' coins total!')) {
      onClose()
    }
  }

  return (
    <div className="fixed inset-0 bg-gradient-to-b from-[#0a0e27] via-[#1a1f3a] to-[#0a0e27] z-50 flex flex-col">
      {/* EXIT BUTTON */}
      <button
        onClick={handleExit}
        className="absolute top-6 right-6 w-12 h-12 bg-red-500/20 backdrop-blur-xl rounded-full flex items-center justify-center text-white text-2xl font-bold border-2 border-red-400/50 hover:bg-red-500/40 transition-all z-50"
      >
        ✕
      </button>

      {/* HEADER STATS */}
      <div className="p-6 pb-4">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-gray-400 text-xs mb-1">Total Earned</div>
            <div className="text-3xl font-black text-yellow-400">
              {totalEarned} 💎
            </div>
          </div>
          <div className="text-right">
            <div className="text-gray-400 text-xs mb-1">Ads Watched</div>
            <div className="text-3xl font-black text-cyan-400">
              {adsWatched}
            </div>
          </div>
        </div>
      </div>

      {/* MAIN AD AREA */}
      <div className="flex-1 flex flex-col items-center justify-center p-6">
        {isLoading ? (
          <div className="text-center">
            <div className="text-8xl mb-6 animate-pulse">📺</div>
            <div className="text-2xl font-bold text-white mb-2">Loading Ad...</div>
            <div className="text-gray-400">Please wait</div>
          </div>
        ) : (
          <div className="text-center">
            <div className="text-8xl mb-6 animate-bounce">💰</div>
            <div className="text-4xl font-black text-white mb-4">
              Watch & Earn
            </div>
            <div className="text-gray-400 mb-8">
              Earn 50 coins every 30 seconds
            </div>

            {/* TIMER CIRCLE */}
            <div className="relative w-48 h-48 mx-auto mb-8">
              <svg className="w-full h-full transform -rotate-90">
                <circle
                  cx="96"
                  cy="96"
                  r="88"
                  stroke="rgba(255,255,255,0.1)"
                  strokeWidth="8"
                  fill="none"
                />
                <circle
                  cx="96"
                  cy="96"
                  r="88"
                  stroke="url(#gradient)"
                  strokeWidth="8"
                  fill="none"
                  strokeDasharray={`${(timeToNext / 30) * 552} 552`}
                  className="transition-all duration-1000"
                />
                <defs>
                  <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#06b6d4" />
                    <stop offset="100%" stopColor="#3b82f6" />
                  </linearGradient>
                </defs>
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <div className="text-6xl font-black text-cyan-400">
                  {timeToNext}
                </div>
                <div className="text-sm text-gray-400 mt-2">seconds</div>
              </div>
            </div>

            <div className="bg-gradient-to-r from-cyan-500/20 to-blue-500/20 backdrop-blur-xl rounded-2xl p-6 border border-cyan-400/30 max-w-md">
              <div className="flex items-center gap-4">
                <span className="text-4xl">💡</span>
                <div className="text-left">
                  <div className="font-bold text-white mb-1">Keep the app open</div>
                  <div className="text-sm text-gray-300">
                    Ads will play automatically every 30 seconds
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* EARNINGS POPUP */}
      <AnimatePresence>
        {showRewardPopup && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            className="fixed top-1/3 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-gradient-to-r from-green-500 to-emerald-500 rounded-3xl p-8 shadow-[0_0_50px_rgba(16,185,129,0.5)] border-4 border-green-300"
          >
            <div className="text-center">
              <div className="text-6xl mb-4">💰</div>
              <div className="text-3xl font-black text-white mb-2">
                +{lastReward} Coins
              </div>
              <div className="text-lg text-green-100">
                Earned!
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* FOOTER */}
      <div className="p-6 pt-4">
        <div className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 backdrop-blur-xl rounded-2xl p-4 border border-purple-400/20">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <span className="text-xl">⚡</span>
              <span className="text-gray-300">Earning rate: <span className="text-yellow-400 font-bold">100 coins/min</span></span>
            </div>
            <div className="text-cyan-400 font-bold">
              Active
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default WatchAds
