import React, { useState, useEffect } from 'react'
import WebApp from '@twa-dev/sdk'
import axios from 'axios'
import { motion, AnimatePresence } from 'framer-motion'
import AdBanner from '../components/AdBanner'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000'

// ONLY AUTOCLICKER - NO STAMINA!
const BOOSTERS = [
  { id: 'auto_2h', name: 'Autoclicker', duration: 2, price: 100, emoji: '🤖', desc: 'Auto-tap for 2 hours', hours: '2H', type: 'autoclicker' },
  { id: 'auto_5h', name: 'Autoclicker', duration: 5, price: 200, emoji: '🤖', desc: 'Auto-tap for 5 hours', hours: '5H', type: 'autoclicker' },
  { id: 'auto_10h', name: 'Autoclicker', duration: 10, price: 350, emoji: '🤖', desc: 'Auto-tap for 10 hours', hours: '10H', type: 'autoclicker' },
  { id: 'auto_24h', name: 'Autoclicker', duration: 24, price: 750, emoji: '🤖', desc: 'Auto-tap for 24 hours', hours: '24H', type: 'autoclicker' },
  { id: 'auto_3d', name: 'Autoclicker', duration: 72, price: 1800, emoji: '🤖', desc: 'Auto-tap for 3 days', hours: '3D', type: 'autoclicker' },
  { id: 'auto_7d', name: 'Autoclicker', duration: 168, price: 3500, emoji: '🤖', desc: 'Auto-tap for 7 days', hours: '7D', type: 'autoclicker' }
]

// UPGRADES COMPONENT
const Upgrades = ({ user, updateUser }) => {
  const [loading, setLoading] = useState(false)

  const tapPowerLevels = [
    { level: 1, power: 2, cost: 3000, label: 'Level 1' },
    { level: 2, power: 4, cost: 6000, label: 'Level 2' },
    { level: 3, power: 8, cost: 12000, label: 'Level 3' },
    { level: 4, power: 16, cost: 24000, label: 'Level 4' },
    { level: 5, power: 32, cost: 48000, label: 'Level 5 MAX' }
  ]

  const staminaLevels = [
    { level: 1, stamina: 2000, cost: 7000, label: 'Level 1' },
    { level: 2, stamina: 3000, cost: 12600, label: 'Level 2' },
    { level: 3, stamina: 4000, cost: 22680, label: 'Level 3' },
    { level: 4, stamina: 5000, cost: 40824, label: 'Level 4' },
    { level: 5, stamina: 6000, cost: 73483, label: 'Level 5 MAX' }
  ]

  const currentTapLevel = user.tapPower === 1 ? 0 : Math.log2(user.tapPower)
  const currentStaminaLevel = Math.floor((user.maxEnergy - 1000) / 1000)

  const handleUpgradeTapPower = async (targetLevel) => {
    if (loading) return
    
    const upgrade = tapPowerLevels[targetLevel - 1]
    
    if (user.coins < upgrade.cost) {
      WebApp.showAlert(`❌ Not enough coins!\n\nYou need ${upgrade.cost} coins\nYou have ${user.coins} coins`)
      return
    }

    if (currentTapLevel >= targetLevel) {
      WebApp.showAlert('✓ Already upgraded to this level!')
      return
    }

    setLoading(true)

    try {
      const initData = WebApp.initData || 'dev_mode'
      const response = await axios.post(
        `${API_URL}/api/upgrades/tap-power`,
        { level: targetLevel },
        { headers: { 'x-telegram-init-data': initData } }
      )

      updateUser({
        coins: response.data.coins,
        tapPower: response.data.tapPower
      })

      if (WebApp.HapticFeedback) {
        WebApp.HapticFeedback.notificationOccurred('success')
      }

      WebApp.showAlert(`🚀 TAP POWER UPGRADED!\n\n+${upgrade.power - user.tapPower} tap power\nNew power: ${upgrade.power} per tap`)
    } catch (error) {
      console.error('Upgrade error:', error)
      WebApp.showAlert('❌ Upgrade failed: ' + (error.response?.data?.error || 'Server error'))
    } finally {
      setLoading(false)
    }
  }

  const handleUpgradeStamina = async (targetLevel) => {
    if (loading) return
    
    const upgrade = staminaLevels[targetLevel - 1]
    
    if (user.coins < upgrade.cost) {
      WebApp.showAlert(`❌ Not enough coins!\n\nYou need ${upgrade.cost} coins\nYou have ${user.coins} coins`)
      return
    }

    if (currentStaminaLevel >= targetLevel) {
      WebApp.showAlert('✓ Already upgraded to this level!')
      return
    }

    setLoading(true)

    try {
      const initData = WebApp.initData || 'dev_mode'
      const response = await axios.post(
        `${API_URL}/api/upgrades/stamina`,
        { level: targetLevel },
        { headers: { 'x-telegram-init-data': initData } }
      )

      updateUser({
        coins: response.data.coins,
        maxEnergy: response.data.maxEnergy
      })

      if (WebApp.HapticFeedback) {
        WebApp.HapticFeedback.notificationOccurred('success')
      }

      WebApp.showAlert(`⚡ STAMINA UPGRADED!\n\n+${upgrade.stamina - user.maxEnergy} max energy\nNew stamina: ${upgrade.stamina}`)
    } catch (error) {
      console.error('Upgrade error:', error)
      WebApp.showAlert('❌ Upgrade failed: ' + (error.response?.data?.error || 'Server error'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="px-6 pb-8">
      {/* CURRENT STATS */}
      <div className="mb-6">
        <div className="bg-gradient-to-r from-cyan-500/10 to-blue-500/10 backdrop-blur-xl rounded-2xl p-5 border border-cyan-400/20">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="text-gray-400 text-xs mb-1">Tap Power</div>
              <div className="text-2xl font-black text-cyan-400">{user.tapPower}x</div>
            </div>
            <div>
              <div className="text-gray-400 text-xs mb-1">Max Energy</div>
              <div className="text-2xl font-black text-green-400">{user.maxEnergy}</div>
            </div>
          </div>
        </div>
      </div>

      {/* TAP POWER */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-4">
          <span className="text-2xl">💪</span>
          <h2 className="text-xl font-bold">Tap Power</h2>
        </div>

        <div className="space-y-3">
          {tapPowerLevels.map((upgrade, index) => {
            const isUnlocked = currentTapLevel >= upgrade.level
            const canUpgrade = currentTapLevel === upgrade.level - 1
            const isNext = currentTapLevel === upgrade.level - 1

            return (
              <motion.div
                key={upgrade.level}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className={`relative overflow-hidden rounded-2xl ${
                  isUnlocked 
                    ? 'bg-gradient-to-r from-green-500/20 to-emerald-500/20 border border-green-400/50'
                    : isNext
                    ? 'bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-400/50'
                    : 'bg-white/5 border border-white/10'
                }`}
              >
                {isUnlocked && (
                  <div className="absolute inset-0 bg-gradient-to-r from-green-500/10 to-transparent" />
                )}

                <div className="relative p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <div className="text-3xl">
                        {isUnlocked ? '✓' : isNext ? '🔥' : '🔒'}
                      </div>
                      <div>
                        <div className="font-bold text-lg">{upgrade.label}</div>
                        <div className="text-sm text-gray-400">
                          Tap Power: {upgrade.power}x
                        </div>
                      </div>
                    </div>

                    {isUnlocked ? (
                      <div className="px-4 py-2 rounded-lg bg-green-500/20 text-green-400 font-bold text-sm border border-green-400/50">
                        ✓ Owned
                      </div>
                    ) : canUpgrade ? (
                      <button
                        onClick={() => handleUpgradeTapPower(upgrade.level)}
                        disabled={loading || user.coins < upgrade.cost}
                        className={`px-4 py-2 rounded-lg font-bold text-sm border transition-all ${
                          user.coins >= upgrade.cost
                            ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white border-purple-400/50 shadow-[0_0_20px_rgba(168,85,247,0.4)]'
                            : 'bg-gray-500/20 text-gray-500 border-gray-500/50 cursor-not-allowed'
                        }`}
                      >
                        💎 {upgrade.cost.toLocaleString()}
                      </button>
                    ) : (
                      <div className="px-4 py-2 rounded-lg bg-gray-500/20 text-gray-500 font-bold text-sm border border-gray-500/50">
                        🔒 Locked
                      </div>
                    )}
                  </div>

                  {isNext && (
                    <div className="mt-3 pt-3 border-t border-white/10">
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className="text-gray-400">Your coins:</span>
                        <span className={user.coins >= upgrade.cost ? 'text-green-400 font-bold' : 'text-red-400 font-bold'}>
                          {user.coins.toLocaleString()} / {upgrade.cost.toLocaleString()}
                        </span>
                      </div>
                      <div className="w-full bg-white/10 rounded-full h-2 overflow-hidden">
                        <div 
                          className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full transition-all duration-300"
                          style={{ width: `${Math.min((user.coins / upgrade.cost) * 100, 100)}%` }}
                        />
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            )
          })}
        </div>
      </div>

      {/* STAMINA */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-4">
          <span className="text-2xl">⚡</span>
          <h2 className="text-xl font-bold">Max Energy</h2>
        </div>

        <div className="space-y-3">
          {staminaLevels.map((upgrade, index) => {
            const isUnlocked = currentStaminaLevel >= upgrade.level
            const canUpgrade = currentStaminaLevel === upgrade.level - 1
            const isNext = currentStaminaLevel === upgrade.level - 1

            return (
              <motion.div
                key={upgrade.level}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className={`relative overflow-hidden rounded-2xl ${
                  isUnlocked 
                    ? 'bg-gradient-to-r from-green-500/20 to-emerald-500/20 border border-green-400/50'
                    : isNext
                    ? 'bg-gradient-to-r from-cyan-500/20 to-blue-500/20 border border-cyan-400/50'
                    : 'bg-white/5 border border-white/10'
                }`}
              >
                {isUnlocked && (
                  <div className="absolute inset-0 bg-gradient-to-r from-green-500/10 to-transparent" />
                )}

                <div className="relative p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <div className="text-3xl">
                        {isUnlocked ? '✓' : isNext ? '🔥' : '🔒'}
                      </div>
                      <div>
                        <div className="font-bold text-lg">{upgrade.label}</div>
                        <div className="text-sm text-gray-400">
                          Max Energy: {upgrade.stamina}
                        </div>
                      </div>
                    </div>

                    {isUnlocked ? (
                      <div className="px-4 py-2 rounded-lg bg-green-500/20 text-green-400 font-bold text-sm border border-green-400/50">
                        ✓ Owned
                      </div>
                    ) : canUpgrade ? (
                      <button
                        onClick={() => handleUpgradeStamina(upgrade.level)}
                        disabled={loading || user.coins < upgrade.cost}
                        className={`px-4 py-2 rounded-lg font-bold text-sm border transition-all ${
                          user.coins >= upgrade.cost
                            ? 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white border-cyan-400/50 shadow-[0_0_20px_rgba(6,182,212,0.4)]'
                            : 'bg-gray-500/20 text-gray-500 border-gray-500/50 cursor-not-allowed'
                        }`}
                      >
                        💎 {upgrade.cost.toLocaleString()}
                      </button>
                    ) : (
                      <div className="px-4 py-2 rounded-lg bg-gray-500/20 text-gray-500 font-bold text-sm border border-gray-500/50">
                        🔒 Locked
                      </div>
                    )}
                  </div>

                  {isNext && (
                    <div className="mt-3 pt-3 border-t border-white/10">
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className="text-gray-400">Your coins:</span>
                        <span className={user.coins >= upgrade.cost ? 'text-green-400 font-bold' : 'text-red-400 font-bold'}>
                          {user.coins.toLocaleString()} / {upgrade.cost.toLocaleString()}
                        </span>
                      </div>
                      <div className="w-full bg-white/10 rounded-full h-2 overflow-hidden">
                        <div 
                          className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full transition-all duration-300"
                          style={{ width: `${Math.min((user.coins / upgrade.cost) * 100, 100)}%` }}
                        />
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

// MAIN SHOP COMPONENT
const Shop = ({ user, updateUser }) => {
  const [activeTab, setActiveTab] = useState('upgrades')
  const [showConfirm, setShowConfirm] = useState(null)

  // TELEGRAM STARS PAYMENT
  const handleStarsPurchase = async (booster) => {
    try {
      WebApp.HapticFeedback.impactOccurred('medium')
      
      // Create invoice
      const response = await axios.post(
        `${API_URL}/api/stars/create-invoice`,
        {
          boosterId: booster.id,
          title: `${booster.name} - ${booster.hours}`,
          description: booster.desc,
          amount: booster.price
        },
        { headers: { 'x-telegram-init-data': WebApp.initData } }
      )
      
      if (response.data.success) {
        const invoiceLink = response.data.invoiceLink
        
        // Open Telegram Stars payment
        WebApp.openInvoice(invoiceLink, async (status) => {
          if (status === 'paid') {
            WebApp.HapticFeedback.notificationOccurred('success')
            await activateBoosterAfterPayment(booster)
            WebApp.showAlert(`✅ Payment successful! ${booster.name} - ${booster.hours} activated!`)
          } else if (status === 'cancelled') {
            WebApp.HapticFeedback.notificationOccurred('warning')
            WebApp.showAlert('Payment cancelled')
          } else if (status === 'failed') {
            WebApp.HapticFeedback.notificationOccurred('error')
            WebApp.showAlert('Payment failed. Please try again.')
          }
        })
      }
    } catch (error) {
      console.error('Stars purchase error:', error)
      WebApp.showAlert('Failed to create payment. Try again!')
    }
  }

  const activateBoosterAfterPayment = async (booster) => {
    try {
      const response = await axios.post(
        `${API_URL}/api/boosters/activate`,
        {
          boosterId: booster.id,
          duration: booster.duration,
          type: booster.type,
          isFree: false
        },
        { headers: { 'x-telegram-init-data': WebApp.initData } }
      )
      
      if (response.data.success) {
        updateUser({
          boosters: response.data.boosters,
          maxEnergy: response.data.maxEnergy
        })
        console.log(`✅ ${booster.name} activated!`)
      }
    } catch (error) {
      console.error('Activate booster error:', error)
      WebApp.showAlert('Failed to activate booster')
    }
  }

  const isBoosterActive = (type) => {
    if (type === 'autoclicker') {
      return user.boosters?.autoclicker?.active && new Date(user.boosters.autoclicker.expiresAt) > new Date()
    }
    return false
  }

  const getTimeRemaining = (type) => {
    const booster = user.boosters?.autoclicker
    if (!booster?.active || !booster?.expiresAt) return null
    
    const now = new Date()
    const expires = new Date(booster.expiresAt)
    const diff = expires - now
    
    if (diff <= 0) return null
    
    const hours = Math.floor(diff / (1000 * 60 * 60))
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
    
    return `${hours}h ${minutes}m`
  }

  return (
    <div className="page-container bg-gradient-to-b from-[#0a0e27] via-[#1a1f3a] to-[#0a0e27] text-white">
      {/* AD BANNER */}
      <AdBanner blockId="YOUR_ADSGRAM_BLOCK_ID" />
      
      {/* HEADER */}
      <div className="p-6">
        <h1 className="text-4xl font-black mb-2 bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">
          Shop
        </h1>
        <div className="text-sm text-gray-400">Boost your earnings</div>
      </div>

      {/* TABS */}
      <div className="px-6 mb-6">
        <div className="flex gap-3">
          <button
            onClick={() => setActiveTab('upgrades')}
            className={`flex-1 py-3 rounded-xl font-bold text-sm transition-all ${
              activeTab === 'upgrades'
                ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-[0_0_20px_rgba(147,51,234,0.5)]'
                : 'bg-white/5 text-gray-400 hover:bg-white/10'
            }`}
          >
            ⬆️ Upgrades
          </button>
          <button
            onClick={() => setActiveTab('boosters')}
            className={`flex-1 py-3 rounded-xl font-bold text-sm transition-all ${
              activeTab === 'boosters'
                ? 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white shadow-[0_0_20px_rgba(6,182,212,0.5)]'
                : 'bg-white/5 text-gray-400 hover:bg-white/10'
            }`}
          >
            🚀 Boosters
          </button>
        </div>
      </div>

      {/* UPGRADES TAB */}
      {activeTab === 'upgrades' && <Upgrades user={user} updateUser={updateUser} />}

      {/* BOOSTERS TAB */}
      {activeTab === 'boosters' && (
        <div className="px-6">
          {isBoosterActive('autoclicker') && (
            <div className="mb-6">
              <div className="bg-gradient-to-r from-orange-500/20 to-red-500/20 rounded-xl p-4 border border-orange-400/50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-3xl">🤖</span>
                    <div>
                      <div className="font-bold">Autoclicker Active</div>
                      <div className="text-sm text-gray-300">{getTimeRemaining('autoclicker')} left</div>
                    </div>
                  </div>
                  <div className="text-green-400 font-bold">✓</div>
                </div>
              </div>
            </div>
          )}

          <div className="space-y-3 pb-8">
            {BOOSTERS.map((booster, index) => (
              <motion.button
                key={booster.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                onClick={() => handleStarsPurchase(booster)}
                className="w-full bg-gradient-to-r from-orange-500/10 to-red-500/10 border border-orange-400/30 hover:border-orange-400/60 backdrop-blur-xl rounded-2xl p-5 transition-all"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <span className="text-4xl">{booster.emoji}</span>
                    <div className="text-left">
                      <div className="font-bold text-lg">{booster.name} - {booster.hours}</div>
                      <div className="text-sm text-gray-400">{booster.desc}</div>
                    </div>
                  </div>
                  <div className="bg-gradient-to-r from-yellow-500 to-orange-500 px-5 py-3 rounded-xl font-black text-lg text-white shadow-lg">
                    ⭐ {booster.price}
                  </div>
                </div>
              </motion.button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default Shop
