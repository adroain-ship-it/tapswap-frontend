import React, { useState, useEffect } from 'react'
import WebApp from '@twa-dev/sdk'
import axios from 'axios'
import { motion } from 'framer-motion'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000'

const Upgrades = ({ user, updateUser }) => {
  const [loading, setLoading] = useState(false)

  // TAP POWER UPGRADES (5 levels)
  const tapPowerLevels = [
    { level: 1, power: 2, cost: 3000, label: 'Level 1' },
    { level: 2, power: 4, cost: 6000, label: 'Level 2' },
    { level: 3, power: 8, cost: 12000, label: 'Level 3' },
    { level: 4, power: 16, cost: 24000, label: 'Level 4' },
    { level: 5, power: 32, cost: 48000, label: 'Level 5 MAX' }
  ]

  // STAMINA UPGRADES (5 levels)
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
      alert(`❌ Not enough coins!\n\nYou need ${upgrade.cost} coins\nYou have ${user.coins} coins`)
      return
    }

    if (currentTapLevel >= targetLevel) {
      alert('✓ Already upgraded to this level!')
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

      alert(`🚀 TAP POWER UPGRADED!\n\n+${upgrade.power - user.tapPower} tap power\nNew power: ${upgrade.power} per tap`)
    } catch (error) {
      console.error('Upgrade error:', error)
      alert('❌ Upgrade failed: ' + (error.response?.data?.error || 'Server error'))
    } finally {
      setLoading(false)
    }
  }

  const handleUpgradeStamina = async (targetLevel) => {
    if (loading) return
    
    const upgrade = staminaLevels[targetLevel - 1]
    
    if (user.coins < upgrade.cost) {
      alert(`❌ Not enough coins!\n\nYou need ${upgrade.cost} coins\nYou have ${user.coins} coins`)
      return
    }

    if (currentStaminaLevel >= targetLevel) {
      alert('✓ Already upgraded to this level!')
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

      alert(`⚡ STAMINA UPGRADED!\n\n+${upgrade.stamina - user.maxEnergy} max energy\nNew stamina: ${upgrade.stamina}`)
    } catch (error) {
      console.error('Upgrade error:', error)
      alert('❌ Upgrade failed: ' + (error.response?.data?.error || 'Server error'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0a0e27] via-[#1a1f3a] to-[#0a0e27] text-white pb-24">
      {/* HEADER */}
      <div className="p-6">
        <h1 className="text-4xl font-black mb-2 bg-gradient-to-r from-purple-400 via-pink-400 to-red-400 bg-clip-text text-transparent">
          ⬆️ Upgrades
        </h1>
        <p className="text-gray-400 text-sm">Boost your power permanently</p>
      </div>

      {/* CURRENT STATS */}
      <div className="px-6 mb-6">
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

      {/* TAP POWER UPGRADES */}
      <div className="px-6 mb-8">
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
                {/* PROGRESS BAR */}
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
                            ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white border-purple-400/50 shadow-[0_0_20px_rgba(168,85,247,0.4)] hover:shadow-[0_0_30px_rgba(168,85,247,0.6)]'
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

                  {/* PROGRESS */}
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

      {/* STAMINA UPGRADES */}
      <div className="px-6 mb-8">
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
                            ? 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white border-cyan-400/50 shadow-[0_0_20px_rgba(6,182,212,0.4)] hover:shadow-[0_0_30px_rgba(6,182,212,0.6)]'
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

export default Upgrades
