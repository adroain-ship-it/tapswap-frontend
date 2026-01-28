import React, { useState, useEffect } from 'react'
import WebApp from '@twa-dev/sdk'
import axios from 'axios'
import { motion } from 'framer-motion'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000'

const LEAGUES = [
  { id: 'BRONZE', name: 'Bronze', icon: '🥉', color: '#CD7F32', minCoins: 0 },
  { id: 'SILVER', name: 'Silver', icon: '🥈', color: '#C0C0C0', minCoins: 10000 },
  { id: 'GOLD', name: 'Gold', icon: '🥇', color: '#FFD700', minCoins: 50000 },
  { id: 'DIAMOND', name: 'Diamond', icon: '💎', color: '#B9F2FF', minCoins: 200000 },
  { id: 'MYTHIC', name: 'Mythic', icon: '🔮', color: '#FF00FF', minCoins: 500000 },
  { id: 'LEGEND', name: 'Legend', icon: '⚡', color: '#FF6347', minCoins: 1000000 },
  { id: 'GOD', name: 'God', icon: '👑', color: '#FFD700', minCoins: 5000000 }
]

const League = ({ user }) => {
  const [leagueUsers, setLeagueUsers] = useState([])
  const [allLeaguesStats, setAllLeaguesStats] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedTab, setSelectedTab] = useState('my-league')

  useEffect(() => {
    fetchLeagueData()
  }, [])

  const fetchLeagueData = async () => {
    try {
      const initData = WebApp.initData || 'dev_mode'
      const response = await axios.get(`${API_URL}/api/league/rankings`, {
        headers: { 'x-telegram-init-data': initData }
      })
      
      console.log('📊 League data received:', response.data)
      
      setLeagueUsers(response.data.myLeague || [])
      setAllLeaguesStats(response.data.allLeagues || [])
      setLoading(false)
    } catch (error) {
      console.error('❌ Fetch league error:', error)
      setLoading(false)
    }
  }

  const getCurrentLeague = () => {
    return LEAGUES.find(l => l.id === user.league) || LEAGUES[0]
  }

  const getNextLeague = () => {
    const currentIndex = LEAGUES.findIndex(l => l.id === user.league)
    return currentIndex < LEAGUES.length - 1 ? LEAGUES[currentIndex + 1] : null
  }

  const getProgressToNext = () => {
    const nextLeague = getNextLeague()
    if (!nextLeague) return 100
    
    const current = getCurrentLeague()
    const coinsInCurrentLeague = user.totalEarned - current.minCoins
    const coinsNeededForNext = nextLeague.minCoins - current.minCoins
    
    if (coinsNeededForNext <= 0) return 100
    
    const progress = (coinsInCurrentLeague / coinsNeededForNext) * 100
    return Math.min(Math.max(progress, 0), 100)
  }

  const getUserRankInLeague = () => {
    const userIndex = leagueUsers.findIndex(u => u.telegramId === user.telegramId)
    return userIndex >= 0 ? userIndex + 1 : null
  }

  const getUserAbove = () => {
    const userRank = getUserRankInLeague()
    if (!userRank || userRank === 1) return null
    return leagueUsers[userRank - 2]
  }

  const getLeaguePlayerCount = (leagueId) => {
    const stat = allLeaguesStats.find(s => s._id === leagueId)
    return stat ? stat.count : 0
  }

  const currentLeague = getCurrentLeague()
  const nextLeague = getNextLeague()
  const userRank = getUserRankInLeague()
  const userAbove = getUserAbove()

  if (loading) {
    return (
      <div className="page-container bg-gradient-to-b from-[#0a0e27] via-[#1a1f3a] to-[#0a0e27] text-white flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4 animate-bounce">🏆</div>
          <div className="text-xl font-bold">Loading rankings...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="page-container bg-gradient-to-b from-[#0a0e27] via-[#1a1f3a] to-[#0a0e27] text-white">
      {/* HEADER */}
      <div className="p-6">
        <h1 className="text-4xl font-black mb-2 bg-gradient-to-r from-yellow-400 via-orange-400 to-red-400 bg-clip-text text-transparent">
          🏆 League
        </h1>
        <p className="text-gray-400 text-sm">Compete and climb the ranks!</p>
      </div>

      {/* CURRENT LEAGUE CARD */}
      <div className="px-6 mb-6">
        <div 
          className="relative rounded-3xl p-6 border-2 overflow-hidden"
          style={{ 
            borderColor: currentLeague.color,
            background: `linear-gradient(135deg, ${currentLeague.color}22, ${currentLeague.color}11)`
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-pulse" />
          
          <div className="relative">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="text-6xl">{currentLeague.icon}</div>
                <div>
                  <div className="text-2xl font-black" style={{ color: currentLeague.color }}>
                    {currentLeague.name}
                  </div>
                  <div className="text-sm text-gray-400">Your current league</div>
                </div>
              </div>
              
              {userRank && (
                <div className="text-center">
                  <div className="text-3xl font-black text-yellow-400">#{userRank}</div>
                  <div className="text-xs text-gray-400">Your rank</div>
                </div>
              )}
            </div>

            {/* PROGRESS TO NEXT */}
            {nextLeague ? (
              <div>
                <div className="flex items-center justify-between text-sm mb-2">
                  <span className="text-gray-400">Progress to {nextLeague.name}</span>
                  <span className="text-yellow-400 font-bold">
                    {user.totalEarned.toLocaleString()} / {nextLeague.minCoins.toLocaleString()}
                  </span>
                </div>
                <div className="w-full bg-white/10 rounded-full h-3 overflow-hidden">
                  <div 
                    className="h-full rounded-full transition-all duration-500"
                    style={{ 
                      width: `${getProgressToNext()}%`,
                      background: `linear-gradient(90deg, ${currentLeague.color}, ${nextLeague.color})`
                    }}
                  />
                </div>
                <div className="text-center text-xs text-gray-500 mt-1">
                  {Math.max(0, nextLeague.minCoins - user.totalEarned).toLocaleString()} coins to {nextLeague.name}
                </div>
              </div>
            ) : (
              <div className="text-center py-4 bg-yellow-500/20 rounded-xl border border-yellow-400/50">
                <div className="text-yellow-400 font-bold text-lg">👑 MAX LEAGUE</div>
                <div className="text-sm text-gray-400">You've reached the top!</div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* COMPETITIVE ALERT */}
      {userAbove && (
        <div className="px-6 mb-6">
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-gradient-to-r from-red-500/20 to-orange-500/20 rounded-2xl p-5 border border-red-400/50"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="text-4xl">🎯</div>
                <div>
                  <div className="font-bold text-lg">Chase {userAbove.username}!</div>
                  <div className="text-sm text-gray-400">
                    You need <span className="text-red-400 font-bold">
                      {Math.max(1, (userAbove.totalEarned || 0) - user.totalEarned + 1).toLocaleString()}
                    </span> more coins
                  </div>
                </div>
              </div>
              <div className="text-3xl">⚔️</div>
            </div>
          </motion.div>
        </div>
      )}

      {/* TABS */}
      <div className="px-6 mb-6">
        <div className="flex gap-3">
          <button
            onClick={() => setSelectedTab('my-league')}
            className={`flex-1 py-3 rounded-xl font-bold text-sm transition-all ${
              selectedTab === 'my-league'
                ? 'bg-gradient-to-r from-yellow-500 to-orange-500 text-white shadow-[0_0_20px_rgba(251,146,60,0.5)]'
                : 'bg-white/5 text-gray-400 hover:bg-white/10'
            }`}
          >
            My League
          </button>
          <button
            onClick={() => setSelectedTab('all-leagues')}
            className={`flex-1 py-3 rounded-xl font-bold text-sm transition-all ${
              selectedTab === 'all-leagues'
                ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-[0_0_20px_rgba(147,51,234,0.5)]'
                : 'bg-white/5 text-gray-400 hover:bg-white/10'
            }`}
          >
            All Leagues
          </button>
        </div>
      </div>

      {/* MY LEAGUE RANKINGS */}
      {selectedTab === 'my-league' && (
        <div className="px-6 space-y-3">
          <h2 className="text-xl font-bold mb-4">
            {currentLeague.icon} {currentLeague.name} League ({leagueUsers.length} players)
          </h2>
          
          {leagueUsers.length === 0 ? (
            <div className="text-center py-16">
              <div className="text-6xl mb-4">🏆</div>
              <div className="text-gray-400 text-lg mb-2">You're the first!</div>
              <div className="text-gray-500 text-sm">Start tapping to claim #1</div>
            </div>
          ) : (
            <>
              {leagueUsers.map((player, index) => (
                <motion.div
                  key={player.telegramId}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.03 }}
                  className={`rounded-2xl p-4 border transition-all ${
                    player.telegramId === user.telegramId
                      ? 'bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border-yellow-400/50 shadow-[0_0_20px_rgba(251,146,60,0.3)]'
                      : 'bg-white/5 border-white/10 hover:border-white/20'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 flex items-center justify-center rounded-full bg-white/10 border border-white/20">
                        <span className="text-xl font-black">
                          {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `#${index + 1}`}
                        </span>
                      </div>

                      <div>
                        <div className="font-bold text-lg flex items-center gap-2">
                          {player.username}
                          {player.telegramId === user.telegramId && (
                            <span className="text-xs bg-cyan-500/20 text-cyan-400 px-2 py-0.5 rounded-full">YOU</span>
                          )}
                        </div>
                        <div className="text-sm text-gray-400">
                          {(player.totalEarned || 0).toLocaleString()} coins earned
                        </div>
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="text-2xl font-black text-yellow-400">
                        {(player.coins || 0).toLocaleString()}
                      </div>
                      <div className="text-xs text-gray-500">balance</div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </>
          )}
        </div>
      )}

      {/* ALL LEAGUES */}
      {selectedTab === 'all-leagues' && (
        <div className="px-6 space-y-4">
          {LEAGUES.map((league, index) => {
            const playerCount = getLeaguePlayerCount(league.id)
            const isCurrentLeague = league.id === user.league
            
            return (
              <motion.div
                key={league.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className={`rounded-2xl p-5 border-2 ${
                  isCurrentLeague ? 'shadow-[0_0_30px_rgba(251,146,60,0.4)]' : ''
                }`}
                style={{
                  borderColor: league.color,
                  background: `linear-gradient(135deg, ${league.color}22, ${league.color}11)`
                }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="text-5xl">{league.icon}</div>
                    <div>
                      <div className="text-2xl font-black" style={{ color: league.color }}>
                        {league.name}
                      </div>
                      <div className="text-sm text-gray-400">
                        {league.minCoins.toLocaleString()}+ coins required
                      </div>
                      {isCurrentLeague && (
                        <div className="text-xs bg-yellow-500/20 text-yellow-400 px-2 py-1 rounded-full inline-block mt-1">
                          YOUR LEAGUE
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="text-3xl font-black" style={{ color: league.color }}>
                      {playerCount}
                    </div>
                    <div className="text-xs text-gray-500">players</div>
                  </div>
                </div>
              </motion.div>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default League