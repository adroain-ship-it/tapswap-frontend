import React, { useState, useEffect, useRef } from 'react'
import AdBanner from '../components/AdBanner'
import WebApp from '@twa-dev/sdk'
import axios from 'axios'
import { motion, AnimatePresence } from 'framer-motion'
import LeagueBar from '../components/LeagueBar'
import CoinAnimation from '../components/CoinAnimation'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000'

const SKIN_ICONS = {
  default: '💎',
  diamond: '💠',
  fire: '🔥',
  rainbow: '🌈',
  star: '⭐',
  crown: '👑'
}

const Home = ({ user, updateUser, globalStats }) => {
  const [coins, setCoins] = useState(user.coins)
  const [energy, setEnergy] = useState(user.energy)
  const [animations, setAnimations] = useState([])
  const [tapQueue, setTapQueue] = useState([])
  const [isSyncing, setIsSyncing] = useState(false)
  
  // AUTOCLICKER
  const autoclickerIntervalRef = useRef(null)

  // ===== AUTOCLICKER POLLING =====
  useEffect(() => {
    const isAutoclickerActive = user?.boosters?.autoclicker?.active && 
      new Date(user.boosters.autoclicker.expiresAt) > new Date()

    if (isAutoclickerActive) {
      console.log('🤖 Autoclicker active - starting polling')
      
      autoclickerIntervalRef.current = setInterval(async () => {
        try {
          const initData = WebApp.initData || 'dev_mode'
          const response = await axios.post(
            `${API_URL}/api/autoclicker/process`,
            {},
            { headers: { 'x-telegram-init-data': initData } }
          )

          if (response.data.active) {
            setCoins(response.data.coins)
            setEnergy(response.data.energy)
            
            updateUser({
              coins: response.data.coins,
              totalEarned: response.data.totalEarned,
              energy: response.data.energy
            })

            if (response.data.coinsEarned > 0) {
              console.log(`🤖 Auto-earned: +${response.data.coinsEarned} coins`)
            }
          } else {
            console.log('🤖 Autoclicker expired')
            clearInterval(autoclickerIntervalRef.current)
          }
        } catch (error) {
          console.error('Autoclicker polling error:', error)
        }
      }, 2000)

      return () => {
        if (autoclickerIntervalRef.current) {
          clearInterval(autoclickerIntervalRef.current)
        }
      }
    } else {
      if (autoclickerIntervalRef.current) {
        console.log('🤖 Autoclicker inactive - stopping polling')
        clearInterval(autoclickerIntervalRef.current)
      }
    }
  }, [user?.boosters?.autoclicker?.active, user?.boosters?.autoclicker?.expiresAt])

  // ===== BOOSTER EXPIRY WARNING =====
  useEffect(() => {
    const checkBoosterExpiry = async () => {
      try {
        const initData = WebApp.initData || 'dev_mode'
        const response = await axios.get(
          `${API_URL}/api/boosters/check-expiry`,
          { headers: { 'x-telegram-init-data': initData } }
        )

        if (response.data.warnings && response.data.warnings.length > 0) {
          response.data.warnings.forEach(warning => {
            const alertKey = `booster_warning_${warning.type}_${Math.floor(warning.minutesLeft / 10)}`
            if (!localStorage.getItem(alertKey)) {
              WebApp.showAlert(warning.message)
              localStorage.setItem(alertKey, 'shown')
              
              setTimeout(() => {
                localStorage.removeItem(alertKey)
              }, 3600000)
            }
          })
        }
      } catch (error) {
        console.error('Check expiry error:', error)
      }
    }

    const expiryInterval = setInterval(checkBoosterExpiry, 600000)
    checkBoosterExpiry()

    return () => clearInterval(expiryInterval)
  }, [])

  // ===== ENERGY REGENERATION =====
  useEffect(() => {
    const energyInterval = setInterval(() => {
      setEnergy(prev => Math.min(user.maxEnergy, prev + 1))
    }, 1000)

    return () => clearInterval(energyInterval)
  }, [user.maxEnergy])

  useEffect(() => {
    if (tapQueue.length > 0 && !isSyncing) {
      syncTaps()
    }
  }, [tapQueue])

  const syncTaps = async () => {
    if (tapQueue.length === 0 || isSyncing) return

    setIsSyncing(true)
    const tapsToSync = [...tapQueue]
    setTapQueue([])

    try {
      const initData = WebApp.initData
      const totalTaps = tapsToSync.reduce((sum, t) => sum + t.count, 0)
      const avgInterval = tapsToSync.reduce((sum, t) => sum + t.interval, 0) / tapsToSync.length

      const response = await axios.post(
        `${API_URL}/api/tap`,
        { taps: totalTaps, interval: avgInterval },
        { headers: { 'x-telegram-init-data': initData } }
      )

      setCoins(response.data.coins)
      setEnergy(response.data.energy)
      
      updateUser({
        coins: response.data.coins,
        totalEarned: response.data.totalEarned,
        energy: response.data.energy,
        league: response.data.league
      })
    } catch (error) {
      console.error('Sync error:', error)
      setTapQueue(prev => [...tapsToSync, ...prev])
    } finally {
      setIsSyncing(false)
    }
  }

  const handleTap = (e) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    let tapPower = user.tapPower
    if (user.boosters.twix?.active && new Date(user.boosters.twix.expiresAt) > new Date()) {
      tapPower *= 2
    }

    if (energy >= tapPower) {
      setEnergy(prev => prev - tapPower)
      setCoins(prev => prev + tapPower)

      const animId = Date.now() + Math.random()
      setAnimations(prev => [...prev, { id: animId, x, y, amount: tapPower }])
      setTimeout(() => {
        setAnimations(prev => prev.filter(a => a.id !== animId))
      }, 800)

      setTapQueue(prev => {
        const newQueue = [...prev]
        const now = Date.now()
        const lastTap = newQueue[newQueue.length - 1]
        const interval = lastTap ? now - lastTap.timestamp : 100

        newQueue.push({ count: 1, interval, timestamp: now })
        
        if (newQueue.length >= 10) {
          setTimeout(() => syncTaps(), 100)
        }

        return newQueue
      })

      WebApp.HapticFeedback.impactOccurred('light')
    } else {
      WebApp.HapticFeedback.notificationOccurred('error')
    }
  }

  const energyPercent = (energy / user.maxEnergy) * 100

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0a0e27] via-[#1a1f3a] to-[#0a0e27] text-white p-4 flex flex-col pb-24">
      {/* HEADER */}
      <div className="mb-6">
        <div className="bg-gradient-to-r from-cyan-500/20 via-blue-500/20 to-purple-500/20 backdrop-blur-xl rounded-3xl p-6 border border-cyan-500/30 shadow-[0_0_30px_rgba(6,182,212,0.3)]">
          <div className="text-center">
            <div className="text-cyan-400 text-sm font-medium mb-2 tracking-wider">YOUR BALANCE</div>
            <div className="flex items-center justify-center gap-3">
              <span className="text-6xl font-black bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent drop-shadow-[0_0_20px_rgba(6,182,212,0.8)]">
                {coins.toLocaleString()}
              </span>
              <span className="text-4xl filter drop-shadow-[0_0_15px_rgba(6,182,212,0.9)]">💎</span>
            </div>
          </div>
        </div>
      </div>

      {/* AIRDROP ANNOUNCEMENT */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-4"
      >
        <div className="bg-gradient-to-r from-yellow-500/20 via-orange-500/20 to-red-500/20 backdrop-blur-xl rounded-2xl p-3 border border-yellow-400/30 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-yellow-400/10 to-transparent animate-pulse" />
          <div className="relative flex items-center gap-2">
            <div className="text-3xl animate-bounce">🪂</div>
            <div className="flex-1">
              <div className="font-black text-yellow-400 text-xs mb-0.5">
                AIRDROP INCOMING!
              </div>
              <div className="text-white/80 text-[10px] leading-tight">
                Early alpha players earn MORE on airdrop. Maximize your coins, watch ads & be active in community. Everything counts!
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* LEAGUE BAR */}
      <LeagueBar 
        current={user.league}
        next={user.nextLeague}
        progress={user.leagueProgress}
      />

      {/* GŁÓWNA MONETA */}
      <div className="flex-1 flex items-center justify-center relative">
        <motion.button
          onClick={handleTap}
          whileTap={{ scale: 0.92 }}
          className="relative"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-500 rounded-full blur-3xl opacity-60 animate-pulse-slow" />
          
          <div className="relative w-80 h-80 rounded-full bg-gradient-to-br from-cyan-500/30 via-blue-500/30 to-purple-500/30 border-4 border-cyan-400/50 shadow-[0_0_80px_rgba(6,182,212,0.6)] flex items-center justify-center">
            <div className="w-72 h-72 rounded-full bg-gradient-to-br from-[#1a1f3a] via-[#2a2f4a] to-[#1a1f3a] border-4 border-purple-400/50 shadow-[inset_0_0_40px_rgba(147,51,234,0.4)] flex items-center justify-center">
              <motion.div
                animate={{ 
                  rotate: [0, 5, -5, 0],
                  scale: [1, 1.05, 1]
                }}
                transition={{ 
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
                className="text-[180px] filter drop-shadow-[0_0_30px_rgba(6,182,212,0.9)]"
              >
                {SKIN_ICONS[user.activeSkin]}
              </motion.div>
            </div>
          </div>

          <AnimatePresence>
            {animations.map(anim => (
              <CoinAnimation key={anim.id} {...anim} />
            ))}
          </AnimatePresence>
        </motion.button>
      </div>

      {/* ENERGY BAR */}
      <div className="mt-6">
        <div className="bg-gradient-to-r from-cyan-500/10 via-blue-500/10 to-purple-500/10 backdrop-blur-xl rounded-2xl p-4 border border-cyan-500/20">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <span className="text-2xl filter drop-shadow-[0_0_10px_rgba(6,182,212,0.8)]">⚡</span>
              <span className="text-cyan-400 font-bold text-lg">{energy}</span>
              <span className="text-gray-500">/</span>
              <span className="text-purple-400 font-bold text-lg">{user.maxEnergy}</span>
            </div>
            
            {/* BOOSTERS INDICATORS */}
            <div className="flex gap-2">
              {user.boosters?.autoclicker?.active && new Date(user.boosters.autoclicker.expiresAt) > new Date() && (
                <div className="bg-gradient-to-r from-orange-500/30 to-red-500/30 px-3 py-1 rounded-full border border-orange-400/50 text-xs font-bold text-orange-300 shadow-[0_0_15px_rgba(251,146,60,0.4)]">
                  🤖 AUTO
                </div>
              )}
              {user.boosters?.stamina?.active && new Date(user.boosters.stamina.expiresAt) > new Date() && (
                <div className="bg-gradient-to-r from-cyan-500/30 to-blue-500/30 px-3 py-1 rounded-full border border-cyan-400/50 text-xs font-bold text-cyan-300 shadow-[0_0_15px_rgba(6,182,212,0.4)]">
                  ⚡ STAMINA
                </div>
              )}
              {user.boosters?.twix?.active && new Date(user.boosters.twix.expiresAt) > new Date() && (
                <div className="bg-gradient-to-r from-orange-500/30 to-red-500/30 px-3 py-1 rounded-full border border-orange-400/50 text-xs font-bold text-orange-300 shadow-[0_0_15px_rgba(251,146,60,0.4)]">
                  🔥 2x TAP
                </div>
              )}
              {user.boosters?.energy2x?.active && new Date(user.boosters.energy2x.expiresAt) > new Date() && (
                <div className="bg-gradient-to-r from-cyan-500/30 to-blue-500/30 px-3 py-1 rounded-full border border-cyan-400/50 text-xs font-bold text-cyan-300 shadow-[0_0_15px_rgba(6,182,212,0.4)]">
                  ⚡ 2x ENERGY
                </div>
              )}
            </div>
          </div>
          
          <div className="relative h-4 bg-gray-800/50 rounded-full overflow-hidden border border-gray-700/50">
            <motion.div
              className="absolute inset-y-0 left-0 bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-500 shadow-[0_0_20px_rgba(6,182,212,0.8)]"
              initial={{ width: 0 }}
              animate={{ width: `${energyPercent}%` }}
              transition={{ duration: 0.3 }}
            />
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-pulse" />
          </div>
        </div>
      </div>
    </div>
  )
}

export default Home
