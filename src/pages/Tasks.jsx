import React, { useState, useEffect } from 'react'
import WebApp from '@twa-dev/sdk'
import axios from 'axios'
import { motion, AnimatePresence } from 'framer-motion'
import AdsgramRewardPopup from '../components/AdsgramRewardPopup'
import AdBanner from '../components/AdBanner'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000'

const Tasks = ({ user, updateUser }) => {
  const [tasks, setTasks] = useState([])
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [verifyingTask, setVerifyingTask] = useState(null)
  const [showPromoModal, setShowPromoModal] = useState(false)
  const [promoCode, setPromoCode] = useState('')

  const categories = ['All', 'telegram', 'youtube', 'x', 'facebook']

  useEffect(() => {
    fetchTasks()
    loadAdsgram()
  }, [])

  const loadAdsgram = () => {
    // Load AdSgram SDK
    if (!window.Adsgram) {
      const script = document.createElement('script')
      script.src = 'https://sad.adsgram.ai/js/sad.min.js'
      script.async = true
      script.onload = () => {
        console.log('AdSgram loaded')
        if (window.Adsgram) {
          window.Adsgram.init({ blockId: 'YOUR_ADSGRAM_BLOCK_ID' })
        }
      }
      document.body.appendChild(script)
    }
  }

  const fetchTasks = async () => {
    try {
      const initData = WebApp.initData
      const response = await axios.get(`${API_URL}/api/tasks`, {
        headers: { 'x-telegram-init-data': initData }
      })
      setTasks(response.data)
    } catch (error) {
      console.error('Fetch tasks error:', error)
    }
  }

  const handleTaskClick = async (task) => {
    if (task.completed) return

    WebApp.openLink(task.url)
    if (WebApp.HapticFeedback) {
      WebApp.HapticFeedback.impactOccurred('medium')
    }

    setVerifyingTask(task.taskId)

    setTimeout(async () => {
      try {
        const initData = WebApp.initData
        const response = await axios.post(
          `${API_URL}/api/tasks/complete`,
          { taskId: task.taskId },
          { headers: { 'x-telegram-init-data': initData } }
        )

        updateUser({
          coins: response.data.coins,
          totalEarned: response.data.totalEarned,
          completedTasks: response.data.completedTasks,
          league: response.data.league
        })

        setTasks(prev =>
          prev.map(t =>
            t.taskId === task.taskId ? { ...t, completed: true } : t
          )
        )

        if (WebApp.HapticFeedback) {
          WebApp.HapticFeedback.notificationOccurred('success')
        }
        
        WebApp.showAlert(`🎉 Task Completed!\n\nYou earned ${task.reward} coins!`)
      } catch (error) {
        console.error('Task complete error:', error)
        if (WebApp.HapticFeedback) {
          WebApp.HapticFeedback.notificationOccurred('error')
        }
      } finally {
        setVerifyingTask(null)
      }
    }, 3000)
  }

  const handlePromoRedeem = async () => {
    if (!promoCode || promoCode.length < 5) {
      WebApp.showAlert('Please enter a valid promo code')
      return
    }

    try {
      const initData = WebApp.initData
      const response = await axios.post(
        `${API_URL}/api/promo/redeem`,
        { code: promoCode.toUpperCase() },
        { headers: { 'x-telegram-init-data': initData } }
      )

      updateUser({
        coins: response.data.coins,
        totalEarned: response.data.totalEarned,
        league: response.data.league
      })

      if (WebApp.HapticFeedback) {
        WebApp.HapticFeedback.notificationOccurred('success')
      }
      
      WebApp.showAlert(`🎉 Success!\n\nYou received ${response.data.reward} coins!`)

      setPromoCode('')
      setShowPromoModal(false)
    } catch (error) {
      if (WebApp.HapticFeedback) {
        WebApp.HapticFeedback.notificationOccurred('error')
      }
      WebApp.showAlert(error.response?.data?.error || 'Invalid promo code')
    }
  }

  const watchSingleAd = () => {
    if (window.Adsgram) {
      const AdController = window.Adsgram.init({ blockId: 'int-21959' })
      
      AdController.show()
        .then(async () => {
          try {
            const initData = WebApp.initData
            const response = await axios.post(
              `${API_URL}/api/ads/watch`,
              { adType: 'single', reward: 100 },
              { headers: { 'x-telegram-init-data': initData } }
            )
            
            updateUser({ coins: response.data.coins })
            
            if (WebApp.HapticFeedback) {
              WebApp.HapticFeedback.notificationOccurred('success')
            }
            
            WebApp.showAlert('🎉 Reward!\n\nYou earned 100 coins!')
          } catch (error) {
            console.error('Ad reward error:', error)
          }
        })
        .catch((error) => {
          console.error('AdSgram error:', error)
          WebApp.showAlert('Ad not available right now. Try again later!')
        })
    } else {
      WebApp.showAlert('Ads are loading... Please try again in a moment')
    }
  }

  const filteredTasks = selectedCategory === 'All'
    ? tasks
    : tasks.filter(t => t.category === selectedCategory)

  return (
    <div className="page-container bg-gradient-to-b from-[#0a0e27] via-[#1a1f3a] to-[#0a0e27] text-white pb-24">
      {/* AD BANNER */}
      <AdBanner blockId="YOUR_ADSGRAM_BLOCK_ID" />

      {/* HEADER */}
      <div className="p-6">
        <h1 className="text-4xl font-black mb-2 bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">
          Earn More
        </h1>
        <p className="text-gray-400 text-sm">Complete tasks and earn rewards!</p>
      </div>

      {/* WATCH SINGLE AD - TYLKO TEN! */}
      <div className="px-6 mb-4">
        <motion.button
          onClick={watchSingleAd}
          whileTap={{ scale: 0.95 }}
          className="w-full bg-gradient-to-r from-orange-500 via-red-500 to-pink-500 rounded-2xl p-5 border border-orange-400/50 shadow-[0_0_30px_rgba(251,146,60,0.4)] relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-pulse" />
          <div className="relative flex items-center justify-between">
            <div className="text-left">
              <div className="text-xl font-black mb-1">Watch Single Ad</div>
              <div className="text-sm text-white/80">Earn 100 coins instantly!</div>
            </div>
            <div className="text-5xl">📺</div>
          </div>
        </motion.button>
      </div>

      {/* PROMO CODE */}
      <div className="px-6 mb-6">
        <motion.button
          onClick={() => setShowPromoModal(true)}
          whileTap={{ scale: 0.95 }}
          className="w-full bg-gradient-to-r from-purple-500/20 via-pink-500/20 to-red-500/20 backdrop-blur-xl rounded-2xl p-4 border border-purple-400/30"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-3xl">🎟️</span>
              <div className="text-left">
                <div className="font-bold">Have a Promo Code?</div>
                <div className="text-sm text-gray-400">Redeem for bonus coins</div>
              </div>
            </div>
            <span className="text-cyan-400 text-xl">→</span>
          </div>
        </motion.button>
      </div>

      {/* CATEGORIES */}
      <div className="px-6 mb-6">
        <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-6 py-3 rounded-xl font-bold text-sm whitespace-nowrap transition-all ${
                selectedCategory === cat
                  ? 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white shadow-[0_0_20px_rgba(6,182,212,0.5)]'
                  : 'bg-white/5 text-gray-400 hover:bg-white/10'
              }`}
            >
              {cat === 'All' ? '📋 All' : 
               cat === 'telegram' ? '📢 Telegram' :
               cat === 'youtube' ? '▶️ YouTube' :
               cat === 'x' ? '🐦 X' :
               '👍 Facebook'}
            </button>
          ))}
        </div>
      </div>

      {/* TASKS LIST */}
      <div className="px-6 space-y-3 pb-8">
        <AnimatePresence>
          {filteredTasks.map((task, index) => (
            <motion.div
              key={task.taskId}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <button
                onClick={() => handleTaskClick(task)}
                disabled={task.completed || verifyingTask === task.taskId}
                className={`w-full p-5 rounded-2xl border transition-all ${
                  task.completed
                    ? 'bg-gradient-to-r from-green-500/10 to-emerald-500/10 border-green-500/30'
                    : verifyingTask === task.taskId
                    ? 'bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border-yellow-400/50 animate-pulse'
                    : 'bg-gradient-to-r from-cyan-500/10 via-blue-500/10 to-purple-500/10 border-cyan-500/20 hover:border-cyan-400/50 hover:shadow-[0_0_20px_rgba(6,182,212,0.3)]'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <span className="text-4xl">{task.icon}</span>
                    <div className="text-left">
                      <div className="font-bold text-lg">{task.title}</div>
                      <div className="text-sm text-gray-400">{task.description}</div>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-yellow-400 font-bold">+{task.reward}</span>
                        <span className="text-xs text-gray-500">coins</span>
                      </div>
                    </div>
                  </div>

                  {task.completed ? (
                    <div className="bg-green-500/20 text-green-400 px-4 py-2 rounded-xl font-bold text-sm border border-green-500/50">
                      ✓ Done
                    </div>
                  ) : verifyingTask === task.taskId ? (
                    <div className="bg-yellow-500/20 text-yellow-400 px-4 py-2 rounded-xl font-bold text-xs border border-yellow-500/50 animate-pulse">
                      ⏳ Verifying...
                    </div>
                  ) : (
                    <div className="bg-cyan-500/20 text-cyan-400 px-4 py-2 rounded-xl font-bold text-sm border border-cyan-500/50">
                      Start →
                    </div>
                  )}
                </div>
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* PROMO MODAL */}
      <AnimatePresence>
        {showPromoModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-6"
            onClick={() => setShowPromoModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-gradient-to-br from-[#1a1f3a] to-[#0a0e27] rounded-3xl p-8 max-w-md w-full border border-cyan-500/30 shadow-[0_0_50px_rgba(6,182,212,0.3)]"
              onClick={e => e.stopPropagation()}
            >
              <div className="text-center mb-6">
                <div className="text-6xl mb-4">🎟️</div>
                <h2 className="text-3xl font-black mb-2 bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
                  Promo Code
                </h2>
                <p className="text-gray-400 text-sm">Enter your code to claim rewards</p>
              </div>

              <input
                type="text"
                value={promoCode}
                onChange={e => setPromoCode(e.target.value.toUpperCase())}
                placeholder="ENTER CODE"
                maxLength={20}
                className="w-full bg-white/5 border border-cyan-500/30 rounded-xl px-6 py-4 text-center text-2xl font-bold tracking-widest text-cyan-400 placeholder-gray-600 focus:outline-none focus:border-cyan-400/70 mb-6"
              />

              <div className="flex gap-3">
                <button
                  onClick={() => setShowPromoModal(false)}
                  className="flex-1 bg-white/5 text-gray-400 py-4 rounded-xl font-bold hover:bg-white/10 transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={handlePromoRedeem}
                  className="flex-1 bg-gradient-to-r from-cyan-500 to-blue-500 text-white py-4 rounded-xl font-bold shadow-[0_0_20px_rgba(6,182,212,0.5)] hover:shadow-[0_0_30px_rgba(6,182,212,0.7)] transition-all"
                >
                  Claim
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default Tasks
